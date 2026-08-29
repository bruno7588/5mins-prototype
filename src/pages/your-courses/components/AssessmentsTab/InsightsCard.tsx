import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Refresh } from 'iconsax-react'
import SparkleIcon from '@/components/icons/SparkleIcon'
import Button from '@/components/Button/Button'
import SectionHeader from '../SectionHeader/SectionHeader'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import { courseAssessments, courseInsight } from './assessmentResults'
import './InsightsCard.css'

type Phase = 'idle' | 'generating' | 'ready'

/** How long each assessment takes to "read". Real generation would stream. */
const READ_MS = 280
/** The pause on the final pass before the summary appears. */
const WRITE_MS = 700

const STEPS = ['Reading assessment answers', 'Writing the summary']
/** Below this, a summary says more about the sample than about the cohort. */
const MIN_RESPONSES = 5

function stamp(): string {
  const now = new Date()
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `Today, ${time}`
}

interface Props {
  /** Every response across the course — the thing being summarised. */
  responseCount: number
  /** The one-line course summary, shown under the header in every state. */
  summary: ReactNode
}

function InsightsCard({ responseCount, summary }: Props) {
  const [phase, setPhase] = useState<Phase>(courseInsight.generatedAt ? 'ready' : 'idle')
  const [generatedAt, setGeneratedAt] = useState<string | null>(courseInsight.generatedAt)
  /* Which assessment is being read, and which pass the card is on. */
  const [reading, setReading] = useState(0)
  const [step, setStep] = useState(0)
  const timer = useRef<number | null>(null)
  const ticker = useRef<number | null>(null)

  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current)
    if (ticker.current) window.clearInterval(ticker.current)
  }

  useEffect(() => stop, [])

  /* Back to the un-generated state — the admin can start again from nothing
     rather than being stuck with a summary they no longer trust. */
  const clear = () => {
    stop()
    setGeneratedAt(null)
    setPhase('idle')
  }

  const generate = () => {
    stop()
    setReading(0)
    setStep(0)
    setPhase('generating')

    /* Walk the assessments one at a time, then switch to the writing pass. */
    ticker.current = window.setInterval(() => {
      setReading((i) => {
        const next = i + 1
        if (next >= courseAssessments.length) {
          if (ticker.current) window.clearInterval(ticker.current)
          setStep(1)
          timer.current = window.setTimeout(() => {
            setGeneratedAt(stamp())
            setPhase('ready')
          }, WRITE_MS)
          return i
        }
        return next
      })
    }, READ_MS)
  }

  const empty = responseCount === 0
  const thin = responseCount > 0 && responseCount < MIN_RESPONSES

  return (
    <section className="asmi" aria-label="Insights">
      {/* DS Section Header: title, supporting text, CTA cluster (headers.md). */}
      <SectionHeader
        title="Insights"
        description={summary}
        ctas={
          <>
            {phase === 'ready' ? (
              <>
                <span className="asmi-stamp">Updated {generatedAt}</span>
                <button className="asmi-refresh" onClick={generate} aria-label="Regenerate insights">
                  <Refresh size={20} color="var(--text-primary)" variant="Linear" />
                </button>
                <Button variant="text" size="sm" onClick={clear}>
                  Clear
                </Button>
              </>
            ) : null}
            {phase === 'idle' ? (
              <Button
                semantic="ai"
                onClick={generate}
                disabled={empty}
                icon={<SparkleIcon size={20} color="currentColor" variant="Linear" />}
              >
                Generate Insights
              </Button>
            ) : null}
          </>
        }
      />

      {phase === 'idle' && empty ? <p className="asmi-note">No responses yet.</p> : null}

      {phase === 'generating' ? (
        /* The shared AI working card: the pass being run, and under it the
           assessment being read right now. */
        <AIWorkingCard
          steps={STEPS}
          activeStep={step}
          detail={step === 0 ? courseAssessments[reading]?.title : undefined}
        />
      ) : null}

      {phase === 'ready' ? (
        <>
          {thin ? (
            <p className="asmi-note">
              Based on {responseCount} responses — too few to be confident. Treat as a hint, not a finding.
            </p>
          ) : null}
          <div className="asmi-grid">
            <div className="asmi-section">
              <p className="asmi-label">Where learners struggled</p>
              <p className="asmi-body">{courseInsight.struggled}</p>
            </div>
            <div className="asmi-section">
              <p className="asmi-label">What they mastered</p>
              <p className="asmi-body">{courseInsight.mastered}</p>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}

export default InsightsCard
