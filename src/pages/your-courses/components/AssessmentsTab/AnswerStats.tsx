import { useState, type CSSProperties } from 'react'
import Button from '@/components/Button/Button'
import Collapse from '@/components/Collapse/Collapse'
import {
  hasStatedAnswer,
  optionTally,
  questionTally,
  type AssessmentResult,
} from './assessmentResults'
import './AnswerStats.css'

/** One bar: what it is, how far it fills, and what it counts. */
interface Row {
  label: string
  pct: number
  /** Spoken in place of the row, so the bar is not announced as a bare number. */
  aria: string
  correct?: boolean
  lead?: boolean
}

/** Beyond this many rows the block would push the answers out of the panel. */
const SHOWN = 4

function Bar({ pct, aria, correct, index }: { pct: number; aria: string; correct?: boolean; index: number }) {
  return (
    <span
      className="ast-track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={aria}
    >
      <span
        className={`ast-fill${correct ? ' is-correct' : ''}`}
        style={{ '--ast-w': `${pct}%`, '--ast-i': Math.min(index, 8) } as CSSProperties}
      />
    </span>
  )
}

function RowItem({ row, index }: { row: Row; index: number }) {
  return (
    <li className="ast-row">
      <span className={`ast-row__label${row.lead ? ' is-lead' : ''}`}>{row.label}</span>
      {/* On the bar's own line, not the label's: a question can run to two lines, and a
          figure parked at the end of a wrapping label lands nowhere in particular. */}
      <span className="ast-row__meter">
        <Bar pct={row.pct} aria={row.aria} correct={row.correct} index={index} />
        <span className="ast-row__value">{row.pct}%</span>
      </span>
    </li>
  )
}

/**
 * The shape of a result, above the rows that spell it out. Every figure is counted
 * from the responses in the table below — the formats that record no score (short
 * text, exercise) get no chart rather than an invented one.
 */
function AnswerStats({ assessment: a }: { assessment: AssessmentResult }) {
  const [open, setOpen] = useState(false)

  if (a.responses.length === 0) return null
  /* Neither is scored: no ratio to meter, no options to count. */
  if (a.kind === 'text' || a.kind === 'file') return null

  const responded = a.responses.length
  /* The banded formats record how much of an arrangement was right rather than which
     option was picked. Their "correct" band is full marks, not a chosen answer, and
     saying "answered correctly" over it would be arithmetically right and false. */
  const banded = a.kind === 'graded' && !hasStatedAnswer(a)

  let heading: string
  let rows: Row[]

  if (a.kind === 'multi') {
    const tally = questionTally(a)
    heading = 'By question'
    rows = a.questions.map((q, i) => ({
      label: `${i + 1}. ${q.prompt}`,
      pct: Math.round((tally[i] / responded) * 100),
      aria: `Question ${i + 1}, ${q.prompt} — ${tally[i]} of ${responded} correct`,
    }))
  } else {
    const tally = optionTally(a)
    const top = Math.max(...tally)
    heading =
      a.kind === 'poll' ? 'How they voted' : banded ? 'Score bands, best first' : 'Answers'
    rows = a.options.map((label, i) => {
      const correct = a.kind === 'graded' && i === a.correctIndex
      return {
        label,
        pct: Math.round((tally[i] / responded) * 100),
        aria: `${label}${correct ? (banded ? ' — full marks' : ' — correct answer') : ''}: ${tally[i]} of ${responded}`,
        correct,
        /* Only a poll leans on its leader; elsewhere the right answer is the story. */
        lead: a.kind === 'poll' && tally[i] === top && top > 0,
      }
    })
  }

  const folds = rows.length > SHOWN
  const shown = folds ? rows.slice(0, SHOWN) : rows
  const rest = folds ? rows.slice(SHOWN) : []

  return (
    <section className="ast" aria-label="Overview">
      <div className="ast-block">
        <p className="ast-heading">
          <span>{heading}</span>
          {/* Beside the bars rather than up in the drawer's header: it is the
              denominator every row is counted against. */}
          <span className="ast-heading__count">
            {responded} of {a.enrolled} responded
          </span>
        </p>
        <ul className="ast-rows">
          {shown.map((r, i) => (
            <RowItem key={i} row={r} index={i} />
          ))}
        </ul>

        {/* The rest of a twelve-question scenario, folded: source order is the order
            the incident unfolds in, so the tail is hidden rather than reordered. */}
        {folds ? (
          <>
            <Collapse open={open}>
              <ul className="ast-rows ast-rows--rest">
                {rest.map((r, i) => (
                  <RowItem key={i} row={r} index={SHOWN + i} />
                ))}
              </ul>
            </Collapse>
            <Button variant="text" onClick={() => setOpen((v) => !v)}>
              {open ? 'Show fewer' : `Show ${rest.length} more`}
            </Button>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default AnswerStats
