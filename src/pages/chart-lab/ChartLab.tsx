import { useState } from 'react'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import {
  courseAssessments,
  type MultiAssessment,
} from '@/pages/your-courses/components/AssessmentsTab/assessmentResults'
import BaselineQuiz from './variants/BaselineQuiz'
import SmallMultiples from './variants/SmallMultiples'
import Scoreboard from './variants/Scoreboard'
import './chart-lab.css'

/**
 * Chart Lab — a sandbox for the multi-question quiz chart in the Assessments tab.
 * Bruno wasn't sure the current chip-per-question UI reads well, so this stages the
 * same data three ways, side by side, before any of it touches the real page.
 * Add a variant by dropping a component in `variants/` and listing it below.
 */
const VARIANTS = [
  { key: 'baseline', label: 'A · Current' },
  { key: 'small-multiples', label: 'B · All at once' },
  { key: 'scoreboard', label: 'C · Scoreboard' },
] as const
type VariantKey = (typeof VARIANTS)[number]['key']

const NOTES: Record<VariantKey, string> = {
  baseline: 'Today’s chart: a chip per question, one question’s option breakdown at a time.',
  'small-multiples':
    'Every question’s breakdown stacked, so the whole quiz reads without clicking. Costs vertical space.',
  scoreboard: 'Overview first: one “correct” bar per question, in order. The breakdown would open on click.',
}

/* q1 is the lesson quiz Bruno clicked — a three-question single-choice multi. */
const quiz = courseAssessments.find((a) => a.id === 'q1') as MultiAssessment

function ChartLab() {
  const [variant, setVariant] = useState<VariantKey>('baseline')

  return (
    <div className="cl-lab">
      <div className="cl-lab__bar">
        <div className="cl-lab__heading">
          <span className="cl-lab__title">Chart Lab</span>
          <span className="cl-lab__sub">
            Exploring how the multi-question quiz chart reads in the Assessments tab.
          </span>
        </div>
        <ContentSwitcher
          items={VARIANTS.map((v) => ({ key: v.key, label: v.label }))}
          activeKey={variant}
          onChange={(key) => setVariant(key as VariantKey)}
          ariaLabel="Chart design"
        />
      </div>

      <div className="cl-stage">
        <p className="cl-stage__note">{NOTES[variant]}</p>
        {/* Remount per variant so each one's bar-grow animation plays on switch. */}
        <div key={variant} className="cl-card">
          {variant === 'baseline' && <BaselineQuiz quiz={quiz} />}
          {variant === 'small-multiples' && <SmallMultiples quiz={quiz} />}
          {variant === 'scoreboard' && <Scoreboard quiz={quiz} />}
        </div>
      </div>
    </div>
  )
}

export default ChartLab
