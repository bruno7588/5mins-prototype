import { useState } from 'react'
import { TickCircle } from 'iconsax-react'
import Chip from '@/components/Chip/Chip'
import {
  optionTally,
  questionOptionTally,
  type AssessmentResult,
  type MultiAssessment,
  type PollAssessment,
} from './assessmentResults'
import './AnswerStats.css'

/** Whole percents, so nothing claims a precision the sample cannot carry. */
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0)

/* ── One option, one row ──────────────────────────────────────────────────
   Every charted format draws the same thing: a row per option, the option's words
   over a thin track, its share hard right. One accent does the work. The right
   answer is green with a tick, every other row stays a quiet neutral, and nothing
   has to be pointed at to be read.

   The big figure above the rows is the finding at rest (how many got it right) and
   a readout on hover or tap: point at a row and it names that option, while the
   others step back a shade. Same shape for a poll, which has no right answer, so
   its leader wears the brand colour instead of green and no tick. */
export function AnswerBars({
  options,
  tally,
  responded,
  correctIndex,
  leadIndex = null,
  unit = 'learners',
}: {
  options: string[]
  tally: number[]
  responded: number
  /** The right answer, or null where the format has none. */
  correctIndex: number | null
  /** A poll's clear leader — only set when one option leads outright. */
  leadIndex?: number | null
  unit?: 'learners' | 'votes'
}) {
  const [active, setActive] = useState<number | null>(null)

  const rest = correctIndex ?? leadIndex
  const shown = active ?? rest
  const shownIsCorrect = correctIndex !== null && shown === correctIndex

  return (
    <div className="ast-answers">
      <div className="ast-readout" aria-live="polite">
        {shown === null ? (
          /* A poll with no outright leader: the count is the only honest headline. */
          <>
            <span className="ast-readout__figure">{responded}</span>
            <span className="ast-readout__text">
              <span className="ast-readout__label">{unit}</span>
              <span className="ast-readout__sub">No single answer leads</span>
            </span>
          </>
        ) : (
          <>
            <span
              key={`${shown}-${active === null}`}
              className={`ast-readout__figure${shownIsCorrect ? ' is-correct' : ''}`}
            >
              {pct(tally[shown], responded)}%
            </span>
            <span className="ast-readout__text">
              <span className="ast-readout__label">
                {active === null && correctIndex !== null ? 'answered correctly' : options[shown]}
              </span>
              <span className="ast-readout__sub">
                {tally[shown]} of {responded} {unit}
              </span>
            </span>
          </>
        )}
      </div>

      <ol className="ast-rows" data-focused={active !== null ? 'true' : undefined}>
        {options.map((label, i) => {
          const p = pct(tally[i], responded)
          const isCorrect = i === correctIndex
          const tone = isCorrect ? 'is-correct' : i === leadIndex ? 'is-lead' : 'is-plain'
          return (
            <li key={label}>
              <button
                type="button"
                className={`ast-row ${tone}${i === active ? ' is-focused' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
                aria-pressed={i === active}
                aria-label={`${label}${isCorrect ? ', correct answer' : ''}, ${p}%, ${tally[i]} ${unit}`}
              >
                <span className="ast-row__head">
                  <span className="ast-row__label">
                    {isCorrect && (
                      <TickCircle
                        size={16}
                        color="currentColor"
                        variant="Bold"
                        className="ast-row__tick"
                      />
                    )}
                    {label}
                  </span>
                  <span className="ast-row__pct">{p}%</span>
                </span>
                <span className="ast-row__track">
                  <span
                    className="ast-row__fill"
                    style={{ '--ast-w': `${p}%`, '--ast-i': i } as React.CSSProperties}
                    aria-hidden="true"
                  />
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ── Several questions, one at a time ─────────────────────────────────────
   Every format that asks more than one thing in a sitting: a lesson quiz, a
   situational test running a scenario, a fill-in-the-blanks with more than one
   blank. One question's rows at a time with a chip to move between them — the
   score of a question is not the same finding as which wrong answer took the
   people who missed it. */
function Quiz({ a, responded }: { a: MultiAssessment; responded: number }) {
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
      {/* Keyed per question, so the rows grow in again and the readout resets. */}
      <AnswerBars
        key={sel}
        options={q.options}
        correctIndex={q.correctIndex}
        tally={questionOptionTally(a, sel)}
        responded={responded}
      />
    </div>
  )
}

/* ── How they voted ───────────────────────────────────────────────────────
   A poll has no right answer, so the ranking is the whole story: the same rows,
   ordered by how many chose each. The leader is marked only when it leads
   outright — a tie at the top has no winner to name. */
function Poll({ a, responded }: { a: PollAssessment; responded: number }) {
  const tally = optionTally(a)
  const ranked = a.options
    .map((label, i) => ({ label, n: tally[i] }))
    .sort((x, y) => y.n - x.n)
  const lead = ranked.length > 1 && ranked[0].n > 0 && ranked[0].n > ranked[1].n ? 0 : null

  return (
    <AnswerBars
      options={ranked.map((r) => r.label)}
      tally={ranked.map((r) => r.n)}
      responded={responded}
      correctIndex={null}
      leadIndex={lead}
      unit="votes"
    />
  )
}

/**
 * "4 of 4 pairs correct" — the count leads at full strength and the phrase it is
 * counted in steps back, so a column of these reads as figures rather than sentences.
 * One string, two weights of information: the same split the stats caption makes.
 */
export function BandLabel({ label }: { label: string }) {
  const i = label.indexOf(' ')
  if (i < 0) return <span className="ast-band__figure">{label}</span>
  return (
    <>
      <span className="ast-band__figure">{label.slice(0, i)}</span>
      <span className="ast-band__rest">{label.slice(i)}</span>
    </>
  )
}

/**
 * The shape of a result, above the rows that spell it out. Every scored format and
 * the poll draw the same rows; the formats that record no score at all — short text,
 * exercise — get no chart rather than an invented one.
 */
function AnswerStats({ assessment: a }: { assessment: AssessmentResult }) {
  if (a.responses.length === 0) return null

  const responded = a.responses.length

  /* Short text and exercise are not scored: no ratio to meter and no options to count,
     so they get no chart. They keep the one stat instead — how many answered, out of
     everyone enrolled — because with no big figure it is the only summary they have.
     The charted formats drop it: the big figure over the rows already says it. */
  if (a.kind === 'text' || a.kind === 'file') {
    return (
      <section className="ast" aria-label="Overview">
        <p className="ast-stat">
          <span className="ast-stat__label">
            {a.kind === 'file' ? 'Total files' : 'Total answers'}
          </span>
          <span className="ast-stat__value">
            <span className="ast-stat__figure">{responded}</span> of {a.enrolled}
          </span>
        </p>
      </section>
    )
  }

  return (
    <section className="ast" aria-label="Overview">
      {a.kind === 'multi' ? (
        <Quiz a={a} responded={responded} />
      ) : a.kind === 'poll' ? (
        <Poll a={a} responded={responded} />
      ) : (
        /* Every single-question graded format, the banded ones included: their options
           are score bands ("4 of 4 pairs correct"), and the right answer is full marks. */
        <AnswerBars
          options={a.options}
          correctIndex={a.correctIndex}
          tally={optionTally(a)}
          responded={responded}
        />
      )}
    </section>
  )
}

export default AnswerStats
