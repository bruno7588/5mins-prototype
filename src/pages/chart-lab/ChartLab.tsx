import ChartCard from './components/ChartCard'
import OverviewCard from './components/OverviewCard'
import { OVERVIEW_QUESTIONS, SECTIONS } from './chartLabData'
import './chart-lab.css'

/**
 * Chart Lab — a sandbox for the assessment results charts: one card per question,
 * built to be scanned. The eleven assessment types collapse into six chart
 * patterns, with an assessment overview above them.
 */
function ChartLab() {
  return (
    <div className="cl-lab">
      <header className="cl-lab__bar">
        <h1 className="cl-lab__title">Chart Lab</h1>
        <p className="cl-lab__sub">Assessment results charts, one pattern per question type.</p>
      </header>

      <main className="cl-lab__body">
        <section className="cl-section">
          <div className="cl-section__head">
            <h2 className="cl-section__title">Assessment overview</h2>
            <p className="cl-section__covers">
              One column per question, up to 8. Click a column to jump to its card.
            </p>
          </div>
          <OverviewCard questions={OVERVIEW_QUESTIONS} />
        </section>

        {SECTIONS.map((s) => (
          <section key={s.title} className="cl-section">
            <div className="cl-section__head">
              <h2 className="cl-section__title">{s.title}</h2>
              <p className="cl-section__covers">{s.covers}</p>
            </div>
            <div className="cl-grid">
              {s.questions.map((q) => (
                <ChartCard key={q.id} q={q} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

export default ChartLab
