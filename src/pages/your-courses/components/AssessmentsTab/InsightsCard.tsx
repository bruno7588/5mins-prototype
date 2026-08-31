import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowDown2, Refresh } from 'iconsax-react'
import SparkleIcon from '@/components/icons/SparkleIcon'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'
import SectionHeader from '../SectionHeader/SectionHeader'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import { useTyped } from '@/components/AIWorkingCard/useTyped'
import Collapse from '@/components/Collapse/Collapse'
import {
  ATTENTION_SHOWN,
  attentionRows,
  attentionSummary,
  courseInsight,
} from './assessmentResults'
import './InsightsCard.css'

type Phase = 'idle' | 'generating' | 'ready'

/* The writing pass is long on purpose — the summary lands during it, so that time is
   spent reading the result rather than waiting for it. The reading pass was not: it
   produced nothing the admin could not already see in the list below, and the titles it
   cycled were padding dressed as progress. It keeps a beat, enough to say what the work
   read, and no longer. */

/** A beat on the reading pass — long enough to register, not long enough to wait out. */
const READING_MS = 800
/** The writing pass — long enough for all three sections to write themselves out. */
const WRITE_MS = 3600
/** The beat between the tick landing on the last pass and the summary being handed over. */
const HANDOVER_MS = 900
/** Collapse's own curve. The summary waits it out rather than typing into a box that is
 *  still opening — the tween measures its target once, so text arriving mid-open is text
 *  the height it settles on never counted. */
const OPEN_MS = 300
const STEPS = ['Reading assessment answers', 'Writing the summary']
/** Below this, a summary says more about the sample than about the cohort. */
const MIN_RESPONSES = 5

function stamp(): string {
  const now = new Date()
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `Today, ${time}`
}

interface Props {
  /** Open a named learner's row in the By Learner pivot. The summary says who is
   *  behind; this is what makes that a door rather than a sentence. */
  onOpenLearner: (id: string) => void
  /** Every response across the course — the thing being summarised. */
  responseCount: number
  /** The one-line course summary, shown under the header in every state. */
  summary: ReactNode
}

/* Named on the card so the admin can act on a person without going to By Learner and
   reading rows. Three is what fits before the block stops being a summary. */
const NAMED = attentionRows.slice(0, ATTENTION_SHOWN)

function InsightsCard({ onOpenLearner, responseCount, summary }: Props) {
  const [phase, setPhase] = useState<Phase>(courseInsight.generatedAt ? 'ready' : 'idle')
  const [generatedAt, setGeneratedAt] = useState<string | null>(courseInsight.generatedAt)
  /* Whether the finished summary is showing. Only ever false by the admin's hand —
     a run always ends with its result on screen. */
  const [expanded, setExpanded] = useState(true)
  /* Which pass the card is on. */
  const [step, setStep] = useState(0)
  const timer = useRef<number | null>(null)

  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current)
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
    setExpanded(true)
    setStep(0)
    setPhase('generating')

    /* A beat on the reading pass, then the writing pass — which ends when the text
       does rather than on a clock of its own, see below. */
    timer.current = window.setTimeout(() => setStep(1), READING_MS)
  }

  /* The summary writes itself out during the pass that claims to be writing it.
     The second column starts a beat late so the two read as one hand working
     down the card rather than as a single block appearing twice. */
  const writing = phase === 'generating' && step === 1
  const struggled = useTyped(courseInsight.struggled, writing, WRITE_MS * 0.8, OPEN_MS)
  const mastered = useTyped(
    courseInsight.mastered,
    writing,
    WRITE_MS * 0.8,
    OPEN_MS + WRITE_MS * 0.12,
  )
  /* Last of the three, and it introduces the names under it, so it starts once the two
     columns above are most of the way through rather than racing them. */
  const attention = useTyped(
    attentionSummary,
    writing,
    WRITE_MS * 0.5,
    OPEN_MS + WRITE_MS * 0.55,
  )
  const written = struggled.done && mastered.done && attention.done

  /* The pass is over when the last word lands, not when a timer says so — the sparkle
     trades itself for the tick on the line that was doing the writing, and the card
     holds that beat before handing the finished summary over. */
  useEffect(() => {
    if (!writing || !written) return
    const id = window.setTimeout(() => {
      setGeneratedAt(stamp())
      setPhase('ready')
    }, HANDOVER_MS)
    return () => window.clearTimeout(id)
  }, [writing, written])

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
                <Tooltip text="Update insights" position="Top" icon={false}>
                  <button className="asmi-refresh" onClick={generate} aria-label="Update insights">
                    <Refresh size={20} color="var(--text-primary)" variant="Linear" />
                  </button>
                </Tooltip>
                <Button variant="text" onClick={clear}>
                  Clear
                </Button>
                <button
                  className={`asmi-toggle${expanded ? ' is-open' : ''}`}
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  aria-controls="asmi-summary"
                  aria-label={expanded ? 'Hide insights' : 'Show insights'}
                >
                  <ArrowDown2 size={20} color="var(--text-primary)" variant="Linear" />
                </button>
              </>
            ) : null}
            {/* The button the admin pressed stays under their cursor and says what it is
                doing, rather than vanishing on the click and leaving the cluster empty
                until the run ends. */}
            {phase !== 'ready' ? (
              <Button
                semantic="ai"
                onClick={generate}
                disabled={empty}
                loading={phase === 'generating'}
                loadingLabel="Generating"
                icon={<SparkleIcon size={20} color="currentColor" />}
              >
                Generate Insights
              </Button>
            ) : null}
          </>
        }
      />

      {phase === 'idle' && empty ? (
        <p className="asmi-note asmi-region">No responses yet.</p>
      ) : null}

      {/* The shared AI working card: the pass being run, and under the reading pass the
          assessments it is on — three to a line, so the sub-text lasts long enough to be
          read. It opens and closes rather than appearing and vanishing: it is the tallest
          thing on the card, so mounting it shoved the page and unmounting it snatched it
          back. */}
      <Collapse open={phase === 'generating'}>
        <div className="asmi-region">
          {/* No sub-line under the reading pass — naming the assessments restated the
              list below at a pace nobody could read, and re-announced itself to a screen
              reader every time it changed. */}
          <AIWorkingCard steps={STEPS} activeStep={step} lastStepDone={written} />
        </div>
      </Collapse>

      <Collapse open={phase === 'ready' && thin}>
        <p className="asmi-note asmi-region">
          Based on {responseCount} responses — too few to be confident. Treat as a hint, not a finding.
        </p>
      </Collapse>

      {/* The summary is written inside the wait rather than after it, so the same
          stack serves both phases — when the run finishes there is nothing left to
          swap in, only the working card above it closing. */}
      <Collapse
        open={expanded && (phase === 'ready' || (phase === 'generating' && step >= 1))}
      >
        <div className="asmi-stack asmi-region" id="asmi-summary">
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

          {/* The named half. The two above say what the cohort did; this says who to do
              something about, which is the only part of the summary that is a task. */}
          <div className="asmi-section">
            <p className="asmi-label">Who needs attention</p>
            <p className={`asmi-body${writing && !attention.done ? ' is-writing' : ''}`}>
              {attention.shown}
              {writing && !attention.done ? <span className="asmi-caret" /> : null}
            </p>

            {/* Held back until the paragraph that introduces them is finished, and
                opened rather than dropped in: the list changes the height of everything
                under it, so it expands on the shared GSAP curve like every other
                expand in the app. */}
            <Collapse open={attention.done}>
              <ul className="asmi-people">
                {NAMED.map((r) => (
                  <li key={r.learner.id} className="asmi-person">
                    {r.learner.avatar ? (
                      <img className="avatar-32" src={r.learner.avatar} alt="" />
                    ) : (
                      <span className="avatar-32 asmi-initials" aria-hidden="true">
                        {r.learner.initials}
                      </span>
                    )}
                    <span className="asmi-person__text">
                      <button
                        type="button"
                        className="asmi-person__name"
                        onClick={() => onOpenLearner(r.learner.id)}
                      >
                        {r.learner.name}
                      </button>
                      <span className="asmi-person__reason">{r.sentence}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Collapse>
          </div>
        </div>
      </Collapse>
    </section>
  )
}

export default InsightsCard
