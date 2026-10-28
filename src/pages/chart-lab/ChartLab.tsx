import { useState } from 'react'
import Chip from '@/components/Chip/Chip'
import ChartCard from './components/ChartCard'
import MultiChart from './components/MultiChart'
import { PAGES } from './chartLabData'
import './chart-lab.css'

/**
 * Chart lab: a sandbox for the assessment results charts. In the product each chart
 * is a page of its own (View Answers), so the lab shows one page at a time: a lesson
 * quiz and a situational test (several questions each), then one page per
 * single-question type.
 */
function ChartLab() {
  const [key, setKey] = useState(PAGES[0].key)
  const page = PAGES.find((p) => p.key === key) ?? PAGES[0]
  const q = page.question
  const a = page.assessment

  return (
    <div className="cl-lab">
      <header className="cl-lab__bar">
        <div className="cl-lab__intro">
          <h1 className="cl-lab__title">Chart lab</h1>
          <p className="cl-lab__sub">Assessment results, one chart per page.</p>
        </div>
        <div className="cl-pages" role="group" aria-label="Chart pages">
          {PAGES.map((p) => (
            <Chip key={p.key} label={p.label} selected={p.key === key} onClick={() => setKey(p.key)} />
          ))}
        </div>
      </header>

      <main className="cl-page">
        <header className="cl-page__head">
          <h2 className="cl-page__title">{(q ?? a)?.title}</h2>
          {/* Type and size, joined as the View Answers header joins its metadata. */}
          <p className="cl-page__meta">
            {(a
              ? [a.type, `${a.questions.length} questions`, `${a.responses} answers`]
              : [q?.type, `${q?.responses} answers`]
            ).join(' · ')}
          </p>
        </header>
        {q ? <ChartCard key={q.id} q={q} /> : a ? <MultiChart key={a.id} a={a} /> : null}
      </main>
    </div>
  )
}

export default ChartLab
