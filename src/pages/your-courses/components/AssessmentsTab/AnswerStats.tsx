import { useState } from 'react'
import Chip from '@/components/Chip/Chip'
import Tooltip from '@/components/Tooltip/Tooltip'
import {
  hasStatedAnswer,
  optionTally,
  questionOptionTally,
  questionTally,
  type AssessmentResult,
  type GradedAssessment,
  type MultiAssessment,
  type PollAssessment,
} from './assessmentResults'
import './AnswerStats.css'

/** Past this many questions a chip per question is a row of chips, not a control. */
const QUIZ_MAX = 6

/** Whole percents, so nothing claims a precision the sample cannot carry. */
const pct = (n: number, of: number) => Math.round((n / of) * 100)

/* ── Where the answers went ───────────────────────────────────────────────
   One question, one right answer: the thing worth seeing is what share of the
   cohort found it, so the options share a single bar rather than each getting
   a bar of its own. Share-of-whole is read in one mark instead of four. */
function Split({
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
  /* An option nobody chose gets no segment — a zero-width sliver between two
     gaps reads as a rendering fault. It keeps its line in the legend. */
  const parts = options
    .map((label, i) => ({ label, n: tally[i], correct: i === correctIndex }))
    .filter((p) => p.n > 0)

  return (
    <div className="ast-split">
      <div
        className="ast-split__track"
        /* Grid tracks in the counts themselves, so the segments divide the bar
           exactly. Four rounded percentages do not add up to a hundred. */
        style={{ gridTemplateColumns: parts.map((p) => `${p.n}fr`).join(' ') }}
      >
        {parts.map((p) => (
          <Tooltip
            key={p.label}
            className={`ast-seg ${p.correct ? 'is-correct' : 'is-wrong'}`}
            icon={false}
            position="Top"
            text={`${p.label} — ${pct(p.n, responded)}%`}
          >
            <span className="ast-seg__fill" />
          </Tooltip>
        ))}
      </div>

      <ul className="ast-legend">
        {options.map((label, i) => (
          <li
            key={label}
            className={`ast-legend__row ${i === correctIndex ? 'is-correct' : 'is-wrong'}`}
          >
            <span className="ast-legend__swatch" aria-hidden="true" />
            <span className="ast-legend__label">{label}</span>
            <span className="ast-legend__value">{pct(tally[i], responded)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── A quiz, a question at a time ─────────────────────────────────────────
   Two or three questions, each a multiple choice underneath. Rather than three
   charts stacked or three columns saying only how many got it right, one chart
   at a time and a chip to move between them — the same divided bar the graded
   format gets, so a quiz question is read the way a question is read. */
function Quiz({ a, responded }: { a: MultiAssessment; responded: number }) {
  const [sel, setSel] = useState(0)
  const q = a.questions[sel]

  return (
    <div className="ast-quiz">
      <div className="ast-quiz__chips">
        {a.questions.map((_, i) => (
          <Chip
            key={i}
            label={`Question ${i + 1}`}
            selected={i === sel}
            onClick={() => setSel(i)}
          />
        ))}
      </div>
      {/* The chip says which question; this says what it was. A lesson quiz has no
          prompt of its own, so without this the chart is about nothing named. */}
      <p className="ast-quiz__prompt">{q.prompt}</p>
      <Split
        options={q.options}
        correctIndex={q.correctIndex}
        tally={questionOptionTally(a, sel)}
        responded={responded}
      />
    </div>
  )
}

/* ── How they voted ───────────────────────────────────────────────────────
   A poll has no right answer, so the ranking is the whole story. The option
   sits inside its own bar: the eye reads the words and the length together
   rather than travelling from a label to a mark that belongs to it. */
function Poll({ a, responded }: { a: PollAssessment; responded: number }) {
  const tally = optionTally(a)
  const ranked = a.options
    .map((label, i) => ({ label, n: tally[i] }))
    .sort((x, y) => y.n - x.n)

  return (
    <ol className="ast-poll">
      {ranked.map((r, i) => (
        <li key={r.label} className={`ast-poll__row${i === 0 && r.n > 0 ? ' is-lead' : ''}`}>
          <span
            className="ast-poll__fill"
            style={{ '--ast-w': `${pct(r.n, responded)}%`, '--ast-i': i } as React.CSSProperties}
            aria-hidden="true"
          />
          <span className="ast-poll__label">{r.label}</span>
          <span className="ast-poll__value">{pct(r.n, responded)}%</span>
        </li>
      ))}
    </ol>
  )
}

/* ── Columns ──────────────────────────────────────────────────────────────
   Shared by the two formats whose data has an order to it. Columns rather
   than a stack of rows: along an axis the shape is the finding — the dip in a
   scenario, the peak of a band distribution — and a list of bars hides it. */
interface Column {
  /** Under the column. Short: it repeats twelve times. */
  tick: string
  pct: number
  /** The whole sentence, for the hover and for a screen reader. */
  aria: string
  full?: boolean
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
              className={`ast-col__bar${c.full ? ' is-full' : ''}`}
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

  const heading =
    a.kind === 'multi'
      ? 'By question'
      : a.kind === 'poll'
        ? 'How they voted'
        : banded
          ? 'Score bands'
          : 'Answers'

  return (
    <section className="ast" aria-label="Overview">
      {/* The whole fraction, beside the word it belongs to: with the heading reading
          "Answers", this line says 112 of 128 answers without saying "answers" twice.
          The one place the count appears — the page header above states the format and
          leaves the counting to the chart the figures are in. */}
      <p className="ast-heading">
        <span>{heading}</span>
        <span className="ast-heading__count">
          {responded} of {a.enrolled}
        </span>
      </p>

      {a.kind === 'multi' ? (
        /* A dozen questions are a sequence and the dip is the finding, so they stay
           columns. Two or three are not a sequence — they are three questions, and
           each deserves its own answers. */
        a.questions.length > QUIZ_MAX ? (
          <Columns cols={questionCols(a, responded)} />
        ) : (
          <Quiz a={a} responded={responded} />
        )
      ) : a.kind === 'poll' ? (
        <Poll a={a} responded={responded} />
      ) : banded ? (
        <Columns cols={bandCols(a, responded)} />
      ) : (
        <Split
          options={a.options}
          correctIndex={a.correctIndex}
          tally={optionTally(a)}
          responded={responded}
        />
      )}
    </section>
  )
}

/** One column per question, in the order the scenario runs. */
function questionCols(a: MultiAssessment, responded: number): Column[] {
  const tally = questionTally(a)
  return a.questions.map((q, i) => ({
    tick: String(i + 1),
    pct: pct(tally[i], responded),
    aria: `Question ${i + 1}, ${q.prompt} — ${pct(tally[i], responded)}% correct`,
  }))
}

/** One column per band, best first, as the options are ordered. */
function bandCols(a: GradedAssessment, responded: number): Column[] {
  const tally = optionTally(a)
  return a.options.map((label, i) => ({
    tick: bandTick(label),
    pct: pct(tally[i], responded),
    aria: `${label} — ${pct(tally[i], responded)}%`,
    full: i === a.correctIndex,
  }))
}

export default AnswerStats
