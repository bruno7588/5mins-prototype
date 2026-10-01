import { useState } from 'react'
import { TickCircle } from 'iconsax-react'
import Chip from '@/components/Chip/Chip'
import {
  questionOptionTally,
  type MultiAssessment,
} from '@/pages/your-courses/components/AssessmentsTab/assessmentResults'

const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0)

/** D · Snappy — ranked single-accent rows with an Apple-Health-style select layer.
 *  One accent does the work: the right answer is green with a tick, every wrong
 *  answer stays a quiet neutral. Hovering or tapping
 *  an option swaps the big readout to that option and the others recede by a
 *  palette step (never opacity). */
function SnappyBars({ quiz }: { quiz: MultiAssessment }) {
  const [qi, setQi] = useState(0)
  const [active, setActive] = useState<number | null>(null)

  const q = quiz.questions[qi]
  const responded = quiz.responses.length
  const tally = questionOptionTally(quiz, qi)

  const head =
    active === null
      ? {
          figure: `${pct(tally[q.correctIndex], responded)}%`,
          label: 'answered correctly',
          sub: `${responded} of ${quiz.enrolled} answered`,
        }
      : {
          figure: `${pct(tally[active], responded)}%`,
          label: q.options[active],
          sub: `${tally[active]} of ${responded} learners`,
        }

  return (
    <div className="cl-snap">
      <div className="cl-snap__chips">
        {quiz.questions.map((_, i) => (
          <Chip
            key={i}
            label={`Question ${i + 1}`}
            selected={i === qi}
            onClick={() => {
              setQi(i)
              setActive(null)
            }}
          />
        ))}
      </div>

      <p className="cl-snap__prompt">{q.prompt}</p>

      <div className="cl-snap__readout" aria-live="polite">
        {/* Green whenever the figure is the right answer's share: at rest, and while
            that answer's row is hovered. */}
        <span
          key={head.figure + head.label}
          className={`cl-snap__figure${active === null || active === q.correctIndex ? ' is-correct' : ''}`}
        >
          {head.figure}
        </span>
        <span className="cl-snap__readout-text">
          <span className="cl-snap__readout-label">{head.label}</span>
          <span className="cl-snap__readout-sub">{head.sub}</span>
        </span>
      </div>

      {/* Remount per question so the bars grow in again. */}
      <ol key={qi} className="cl-snap__bars" data-focused={active !== null ? 'true' : undefined}>
        {q.options.map((label, i) => {
          const p = pct(tally[i], responded)
          const isCorrect = i === q.correctIndex
          const tone = isCorrect ? 'is-correct' : 'is-plain'
          return (
            <li key={i}>
              <button
                type="button"
                className={`cl-snap__bar ${tone}${i === active ? ' is-focused' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
                aria-pressed={i === active}
                aria-label={`${label}${isCorrect ? ', correct answer' : ''}, ${p}%, ${tally[i]} learners`}
              >
                <span className="cl-snap__bar-head">
                  <span className="cl-snap__bar-label">
                    {isCorrect && (
                      <TickCircle
                        size={16}
                        color="currentColor"
                        variant="Bold"
                        className="cl-snap__tick"
                      />
                    )}
                    {label}
                  </span>
                  <span className="cl-snap__bar-pct">{p}%</span>
                </span>
                <span className="cl-snap__track">
                  <span
                    className="cl-snap__fill"
                    style={{ '--cl-w': `${p}%`, '--cl-i': i } as React.CSSProperties}
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

export default SnappyBars
