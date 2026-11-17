import { useState } from 'react'
import Chip from '@/components/Chip/Chip'
import { EXAMPLES, FIELD_SPLIT, FINDINGS, FLOWS, PATTERNS, type Example, type Pattern } from './cardsLabData'
import ExternalTrainingCards from './ExternalTrainingCards'
import './cards-lab.css'

/**
 * Cards lab: research for turning the wide External Training table into cards in
 * the native app. For now it holds the Mobbin screens and what they have in
 * common; card proposals come next. Prefix: cdl-
 */

const SHOTS = import.meta.glob<string>(['./mobbin/*.jpg', './appstore/*.jpg'], { eager: true, import: 'default' })
const shot = (e: Example) => SHOTS[`./${e.mobbinId ? 'mobbin' : 'appstore'}/${e.file}.jpg`]
const source = (e: Example) =>
  e.mobbinId
    ? { label: 'Open on Mobbin', url: `https://mobbin.com/screens/${e.mobbinId}` }
    : { label: 'Open on the App Store', url: `https://apps.apple.com/gb/app/id${e.appStoreId}` }

function CardsLab() {
  const [filter, setFilter] = useState<Pattern | 'all'>('all')
  const shown = EXAMPLES.filter((e) => filter === 'all' || e.pattern === filter)
  const active = PATTERNS.find((p) => p.key === filter)

  return (
    <div className="cdl-lab">
      <header className="cdl-lab__bar">
        <div className="cdl-lab__intro">
          <h1 className="cdl-lab__title">Cards lab</h1>
          <p className="cdl-lab__sub">
            How apps turn a table with many columns into cards on a phone. Research for the native External Training list.
          </p>
        </div>
      </header>

      <main className="cdl-page">
        <section className="cdl-section" aria-labelledby="cdl-findings">
          <h2 id="cdl-findings" className="cdl-section__title">What the examples have in common</h2>
          <ul className="cdl-findings">
            {FINDINGS.map((f) => (
              <li key={f.title} className="cdl-finding">
                <h3 className="cdl-finding__title">{f.title}</h3>
                <p className="cdl-finding__body">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="cdl-section" aria-labelledby="cdl-split">
          <h2 id="cdl-split" className="cdl-section__title">Our eight columns, split the same way</h2>
          <ul className="cdl-split">
            {FIELD_SPLIT.map((f) => (
              <li key={f.field} className="cdl-split__row">
                <span className="cdl-split__field">{f.field}</span>
                <span className="cdl-split__where">{f.where}</span>
                <span className="cdl-split__why">{f.why}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="cdl-section" aria-labelledby="cdl-build">
          <div className="cdl-section__head">
            <h2 id="cdl-build" className="cdl-section__title">The card, built</h2>
            <p className="cdl-section__sub">
              Flow 1 with the signed-in learner's records. Tap a card for the rest of the row.
            </p>
          </div>
          <ExternalTrainingCards />
        </section>

        <section className="cdl-section" aria-labelledby="cdl-flows">
          <div className="cdl-section__head">
            <h2 id="cdl-flows" className="cdl-section__title">Five flows from the cards we liked</h2>
            <p className="cdl-section__sub">
              Each flow pairs a card with the detail view it would open. All screens are from Mobbin.
            </p>
          </div>
          <ol className="cdl-flows">
            {FLOWS.map((f) => (
              <li key={f.title} className="cdl-flow">
                <div className="cdl-flow__text">
                  <h3 className="cdl-example__title">{f.title}</h3>
                  <p className="cdl-example__note">{f.idea}</p>
                  <p className="cdl-example__pattern">Detail: {f.detail.toLowerCase()}</p>
                </div>
                <ol className="cdl-flow__steps">
                  {f.steps.map((s) => {
                    const e = EXAMPLES.find((x) => x.file === s.file)!
                    return (
                      <li key={s.file} className="cdl-example">
                        <img className="cdl-example__shot" src={shot(e)} alt={`${e.app}: ${e.screen}`} loading="lazy" />
                        <div className="cdl-example__text">
                          <p className="cdl-example__pattern">{s.role}</p>
                          <a className="cdl-example__link" href={source(e).url} target="_blank" rel="noreferrer">
                            {e.app} · {e.screen}
                          </a>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </li>
            ))}
          </ol>
        </section>

        <section className="cdl-section" aria-labelledby="cdl-examples">
          <div className="cdl-section__head">
            <h2 id="cdl-examples" className="cdl-section__title">
              {shown.length} examples from Mobbin and the App Store
            </h2>
            <div className="cdl-filters" role="group" aria-label="Pattern">
              <Chip label="All" selected={filter === 'all'} onClick={() => setFilter('all')} />
              {PATTERNS.map((p) => (
                <Chip key={p.key} label={p.label} selected={filter === p.key} onClick={() => setFilter(p.key)} />
              ))}
            </div>
            {active && <p className="cdl-section__sub">{active.summary}</p>}
          </div>

          <ul className="cdl-grid">
            {shown.map((e) => (
              <li key={e.file} className="cdl-example">
                <img className="cdl-example__shot" src={shot(e)} alt={`${e.app}: ${e.screen}`} loading="lazy" />
                <div className="cdl-example__text">
                  <p className="cdl-example__pattern">{PATTERNS.find((p) => p.key === e.pattern)?.label}</p>
                  <h3 className="cdl-example__title">
                    {e.app} · {e.screen}
                  </h3>
                  <p className="cdl-example__note">{e.note}</p>
                  <a className="cdl-example__link" href={source(e).url} target="_blank" rel="noreferrer">
                    {source(e).label}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

export default CardsLab
