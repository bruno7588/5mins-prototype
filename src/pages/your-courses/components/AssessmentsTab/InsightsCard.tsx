import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Refresh } from 'iconsax-react'
import SparkleIcon from '@/components/icons/SparkleIcon'
import Button from '@/components/Button/Button'
import SectionHeader from '../SectionHeader/SectionHeader'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import { useTyped } from '@/components/AIWorkingCard/useTyped'
import { courseAssessments, courseInsight } from './assessmentResults'
import './InsightsCard.css'

type Phase = 'idle' | 'generating' | 'ready'

/* Every pass is paced to be read, not just seen. At the old 280/700 the card
   ticked through both lines before the admin had finished the first, so the work
   looked instant — which told them nothing about what it had done. The writing
   pass is the long one on purpose: the summary is landing during it, so that
   time is spent reading the result rather than waiting for it. */

/** How long each assessment takes to "read". Real generation would stream. */
const READ_MS = 400
/** The writing pass — long enough for both columns to write themselves out. */
const WRITE_MS = 3600
/** How long the card holds on "all done" before it hands the summary over. */
const DONE_MS = 1400
/** How many titles share the line under the reading pass. */
const GROUP = 3

/* What is being read, in groups. One title per beat was a flicker — the line
   changed before it could be finished — so a group shares the line and holds it
   for as long as all of them take to read. */
const READING_GROUPS = Array.from(
  { length: Math.ceil(courseAssessments.length / GROUP) },
  (_, i) =>
    courseAssessments
      .slice(i * GROUP, i * GROUP + GROUP)
      .map((a) => a.title)
      .join(' · '),
)

/** The reading pass is however long it takes to walk every group. */
const READING_MS = READING_GROUPS.length * GROUP * READ_MS

/* The last line is a conclusion, not a pass: AIWorkingCard ticks its terminal step
   on arrival, so without one "Writing the summary" was ticked as complete while it
   was still the thing being done. */
const STEPS = [
  'Reading assessment answers',
  'Writing the summary',
  'All done — your insights are ready',
]
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
  /* Which pass the card is on, and which group of titles it is reading. */
  const [step, setStep] = useState(0)
  const [group, setGroup] = useState(0)
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
    setStep(0)
    setGroup(0)
    setPhase('generating')

    /* The line under the reading pass moves a group at a time while the pass runs. */
    ticker.current = window.setInterval(
      () => setGroup((g) => Math.min(g + 1, READING_GROUPS.length - 1)),
      GROUP * READ_MS,
    )

    /* One reading pass over every assessment, then the writing pass the summary
       arrives in, then the beat that says it is finished. */
    timer.current = window.setTimeout(() => {
      if (ticker.current) window.clearInterval(ticker.current)
      setStep(1)
      timer.current = window.setTimeout(() => {
        setStep(2)
        timer.current = window.setTimeout(() => {
          setGeneratedAt(stamp())
          setPhase('ready')
        }, DONE_MS)
      }, WRITE_MS)
    }, READING_MS)
  }

  /* The summary writes itself out during the pass that claims to be writing it.
     The second column starts a beat late so the two read as one hand working
     down the card rather than as a single block appearing twice. */
  const writing = phase === 'generating' && step === 1
  const struggled = useTyped(courseInsight.struggled, writing, WRITE_MS * 0.8)
  const mastered = useTyped(courseInsight.mastered, writing, WRITE_MS * 0.8, WRITE_MS * 0.12)

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
        /* The shared AI working card: the pass being run, and under the reading
           pass the assessments it is on — three to a line, so the sub-text lasts
           long enough to be read. */
        <AIWorkingCard
          steps={STEPS}
          activeStep={step}
          detail={step === 0 ? READING_GROUPS[group] : undefined}
        />
      ) : null}

      {phase === 'ready' && thin ? (
        <p className="asmi-note">
          Based on {responseCount} responses — too few to be confident. Treat as a hint, not a finding.
        </p>
      ) : null}

      {/* The summary is written inside the wait rather than after it, so the same
          grid serves both phases — when the run finishes there is nothing left to
          swap in, only the working card above it going away. */}
      {phase === 'ready' || (phase === 'generating' && step >= 1) ? (
        <div className="asmi-grid">
          <div className="asmi-section">
            <p className="asmi-label">Where learners struggled</p>
            <p className={`asmi-body${writing && !struggled.done ? ' is-writing' : ''}`}>
              {struggled.shown}
              {writing && !struggled.done ? <span className="asmi-caret" /> : null}
            </p>
          </div>
          <div className="asmi-section">
            <p className="asmi-label">What they mastered</p>
            <p className={`asmi-body${writing && !mastered.done ? ' is-writing' : ''}`}>
              {mastered.shown}
              {writing && !mastered.done ? <span className="asmi-caret" /> : null}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default InsightsCard
