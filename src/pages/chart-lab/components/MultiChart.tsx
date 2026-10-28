import { useState, type KeyboardEvent } from 'react'
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import { questionScore, type MultiAssessment } from '../chartLabData'
import { OptionBars } from './Charts'

/**
 * A lesson quiz or situational test on one page, as the flashcard editor shows its
 * cards: one question at a time on a sliding strip, chevrons either side and the
 * question numbers below. It opens on the weakest question, where the admin's
 * attention is due.
 */
function MultiChart({ a }: { a: MultiAssessment }) {
  const weakest = a.questions.reduce((low, q) => (questionScore(q) < questionScore(low) ? q : low))
  const [index, setIndex] = useState(a.questions.indexOf(weakest))
  const last = a.questions.length - 1
  const go = (i: number) => setIndex(Math.min(Math.max(i, 0), last))

  /* Left and right step through the questions, as the chevrons do. */
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(index - 1)
    else if (e.key === 'ArrowRight') go(index + 1)
    else return
    e.preventDefault()
  }

  return (
    <section className="cl-deck" aria-roledescription="carousel" aria-label="Questions" onKeyDown={onKeyDown}>
      <div className="cl-deck__row">
        <button
          type="button"
          className="cl-deck__chev cl-deck__chev--left"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous question"
        >
          <ArrowLeft2 size={24} color="currentColor" variant="Linear" />
        </button>

        <div className="cl-deck__track">
          <ol className="cl-deck__strip" style={{ transform: `translateX(calc(-${index} * (100% + var(--space-m))))` }}>
            {a.questions.map((q, i) => (
              <li
                key={q.id}
                className="cl-deck__card"
                aria-roledescription="slide"
                aria-label={`Question ${i + 1} of ${a.questions.length}`}
                aria-hidden={i !== index}
                inert={i !== index}
              >
                <p className="cl-deck__count">
                  Question {i + 1} of {a.questions.length}
                </p>
                <h3 className="cl-deck__question">{q.title}</h3>
                <OptionBars rows={q.rows} />
              </li>
            ))}
          </ol>
        </div>

        <button
          type="button"
          className="cl-deck__chev cl-deck__chev--right"
          onClick={() => go(index + 1)}
          disabled={index === last}
          aria-label="Next question"
        >
          <ArrowRight2 size={24} color="currentColor" variant="Linear" />
        </button>
      </div>

      <nav className="cl-deck__pages" aria-label="Question pages">
        {a.questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            className={`cl-deck__page${i === index ? ' is-active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Question ${i + 1}`}
            aria-current={i === index ? 'step' : undefined}
          >
            {i + 1}
          </button>
        ))}
      </nav>
    </section>
  )
}

export default MultiChart
