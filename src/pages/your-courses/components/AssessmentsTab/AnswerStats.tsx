import { useState, type ReactNode } from 'react'
import Chip from '@/components/Chip/Chip'
import Tooltip from '@/components/Tooltip/Tooltip'
import {
  hasStatedAnswer,
  optionTally,
  questionOptionTally,
  type AssessmentResult,
  type GradedAssessment,
  type MultiAssessment,
  type PollAssessment,
} from './assessmentResults'
import './AnswerStats.css'

/** Whole percents, so nothing claims a precision the sample cannot carry. */
const pct = (n: number, of: number) => Math.round((n / of) * 100)

/* ── One option, one bar ──────────────────────────────────────────────────
   The row is the label. A divided bar packed every option into one mark and named
   none of them, so the only way to read it was to point at it a segment at a time
   and the legend underneath had to be matched back up by eye. Here each option gets
   its own bar with its own words inside it, which is what a poll has always done —
   the only thing that changes between a poll and a question is what the fill means. */
type Tone = 'lead' | 'plain' | 'correct' | 'wrong'

function Bars({
  rows,
  responded,
}: {
  rows: { label: string; n: number; tone: Tone }[]
  responded: number
}) {
  return (
    <ol className="ast-bars">
      {rows.map((r, i) => (
        <li key={r.label} className={`ast-bar is-${r.tone}`}>
          <span
            className="ast-bar__fill"
            style={{ '--ast-w': `${pct(r.n, responded)}%`, '--ast-i': i } as React.CSSProperties}
            aria-hidden="true"
          />
          <span className="ast-bar__label">{r.label}</span>
          <span className="ast-bar__value">{pct(r.n, responded)}%</span>
        </li>
      ))}
    </ol>
  )
}

/* One question, one right answer. Green on the answer, red on the rest: which one
   they found and how the people who missed it divided between the distractors are
   both read straight off the list. The options keep the order they were asked in —
   ranking them by popularity would detach the chart from the question above it. */
function Choices({
  options,
  correctIndex,
  tally,
  responded,
}: {
  options: string[]
  correctIndex: number
  tally: number[]
  responded: number
}) {
  return (
    <Bars
      rows={options.map((label, i) => ({
        label,
        n: tally[i],
        tone: (i === correctIndex ? 'correct' : 'wrong') as Tone,
      }))}
      responded={responded}
    />
  )
}

/* ── Several questions, one at a time ─────────────────────────────────────
   Every format that asks more than one thing in a sitting: a lesson quiz, a
   situational test running a scenario, a fill-in-the-blanks with more than one
   blank. One chart at a time with a chip to move between them, rather than a
   column per question saying only how many got it right — the score of a question
   is not the same finding as which wrong answer took the people who missed it. */
function Quiz({ a, responded, caption }: { a: MultiAssessment; responded: number; caption: ReactNode }) {
  const [sel, setSel] = useState(0)
  const q = a.questions[sel]
  /* A blank is not a question, and calling it one on a fill-in-the-blanks reads as
     though the sentence were a quiz. */
  const unit = a.type === 'fill-blank' ? 'Blank' : 'Question'

  return (
    <div className="ast-quiz">
      <div className="ast-quiz__chips">
        {a.questions.map((_, i) => (
          <Chip
            key={i}
            label={`${unit} ${i + 1}`}
            selected={i === sel}
            onClick={() => setSel(i)}
          />
        ))}
      </div>
      {/* The chip says which one; this says what it was. A lesson quiz has no prompt
          of its own, so without this the chart is about nothing named. */}
      <p className="ast-quiz__prompt">{q.prompt}</p>
      {caption}
      <Choices
        options={q.options}
        correctIndex={q.correctIndex}
        tally={questionOptionTally(a, sel)}
        responded={responded}
      />
    </div>
  )
}

/* ── How they voted ───────────────────────────────────────────────────────
   A poll has no right answer, so the ranking is the whole story: the same bars,
   ordered by how many chose each, with the leader carrying the weight instead of
   a colour. */
function Poll({ a, responded }: { a: PollAssessment; responded: number }) {
  const tally = optionTally(a)
  const ranked = a.options
    .map((label, i) => ({ label, n: tally[i] }))
    .sort((x, y) => y.n - x.n)

  return (
    <Bars
      rows={ranked.map((r, i) => ({
        ...r,
        tone: (i === 0 && r.n > 0 ? 'lead' : 'plain') as Tone,
      }))}
      responded={responded}
    />
  )
}

/* ── Columns ──────────────────────────────────────────────────────────────
   The score bands, the one shape left whose data has an order to it: full marks
   down to nearly none. Columns rather than a stack of rows, because along an axis
   the peak of the distribution is the finding and a list of bars hides it. Every
   other format now reads as bars — a band is not an option anybody chose. */
interface Column {
  /** Under the column. Short, because it repeats. */
  tick: string
  pct: number
  /** The whole sentence, for the hover and for a screen reader. */
  aria: string
  full?: boolean
  /** Set only by the band chart — see the note on .ast-col__bar.is-wrong. */
  wrong?: boolean
}

function Columns({ cols }: { cols: Column[] }) {
  /* Few columns are capped and centred, many run the full width. Driven by how many
     there are rather than by which format they came from: three lesson-quiz questions
     spread across the panel are slabs for the same reason four bands were. */
  const sparse = cols.length <= 6
  return (
    <ol className={`ast-cols${sparse ? ' is-sparse' : ''}`}>
      {cols.map((c, i) => (
        <li key={c.tick} className="ast-col" aria-label={c.aria}>
          <Tooltip className="ast-col__hit" icon={false} position="Top" text={c.aria}>
            <span
              className={`ast-col__bar${c.full ? ' is-full' : ''}${c.wrong ? ' is-wrong' : ''}`}
              style={{ '--ast-h': `${c.pct}%`, '--ast-i': i } as React.CSSProperties}
            >
              {/* Rides the top of its own column, so the figures sit where the
                  data does instead of in a row of their own. */}
              <span className="ast-col__value">{c.pct}%</span>
            </span>
          </Tooltip>
          <span className="ast-col__tick" aria-hidden="true">
            {c.tick}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** "3 of 4 pairs correct" → "3/4". The band's own fraction, room for four of them. */
function bandTick(label: string): string {
  const m = /^(\d+) of (\d+)/.exec(label)
  return m ? `${m[1]}/${m[2]}` : label
}

/**
 * The shape of a result, above the rows that spell it out. Four formats, four
 * forms: what the data is doing decides how it is drawn. The formats that record
 * no score at all — short text, exercise — get no chart rather than an invented one.
 */
function AnswerStats({ assessment: a }: { assessment: AssessmentResult }) {
  if (a.responses.length === 0) return null
  /* Neither is scored: no ratio to meter, no options to count. */
  if (a.kind === 'text' || a.kind === 'file') return null

  const responded = a.responses.length
  /* The banded formats record how much of an arrangement was right rather than which
     option was picked. Their "correct" band is full marks, not a chosen answer. */
  const banded = a.kind === 'graded' && !hasStatedAnswer(a)

  /* The same label on every chart, so the four formats read as one page rather than four
     — and the same shape as the Question label above it. What the count is counting rides
     with the number: a poll collects votes, everything else responses. */
  const heading = 'Answers'
  const counted = a.kind === 'poll' ? ' votes' : ' responses'

  const caption = (
    <p className="ast-heading">
      {heading ? <span>{heading}</span> : null}
      <span className="ast-heading__count">
        {responded} of {a.enrolled}
        {counted}
      </span>
    </p>
  )

  return (
    <section className="ast" aria-label="Overview">
      {/* Directly above the chart it is the denominator of. On a multi-question format
          that means below the question the chips select rather than above them, so it
          sits with the bars it counts and not with the control that changes them. */}
      {a.kind === 'multi' ? null : caption}

      {a.kind === 'multi' ? (
        <Quiz a={a} responded={responded} caption={caption} />
      ) : a.kind === 'poll' ? (
        <Poll a={a} responded={responded} />
      ) : banded ? (
        <Columns cols={bandCols(a, responded)} />
      ) : (
        <Choices
          options={a.options}
          correctIndex={a.correctIndex}
          tally={optionTally(a)}
          responded={responded}
        />
      )}
    </section>
  )
}

/** One column per band, best first, as the options are ordered. */
function bandCols(a: GradedAssessment, responded: number): Column[] {
  const tally = optionTally(a)
  return a.options.map((label, i) => ({
    tick: bandTick(label),
    pct: pct(tally[i], responded),
    aria: `${label} — ${pct(tally[i], responded)}%`,
    full: i === a.correctIndex,
    wrong: i !== a.correctIndex,
  }))
}

export default AnswerStats
