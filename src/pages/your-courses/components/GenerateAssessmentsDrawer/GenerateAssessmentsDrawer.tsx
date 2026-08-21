import { forwardRef, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Add } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import { getAssessmentIllustration } from '@/assets/assessment-illustrations'
import { assessmentTypeIcon } from '../assessmentTypeIcons'
import CloseButton from '@/components/CloseButton/CloseButton'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import SparkleIcon from '@/components/icons/SparkleIcon'
import emptyBox from '@/assets/empty-state-illustrations/empty-box.svg'
import {
  ASSESSMENT_TYPES,
  typeLabel,
  type CoverageReport,
  type GeneratableType,
  type GeneratedAssessment,
  type GenerationPrompt,
  type GeneratedQuestion,
  type GenerationScope,
} from '@/data/aiAssessmentGeneration'
import SituationalTestDrawerContent, {
  type SituationalQuestion,
  type SituationalTestData,
} from '../SituationalTestDrawer/SituationalTestDrawer'
import SectionHeader from '../SectionHeader/SectionHeader'
import './GenerateAssessmentsDrawer.css'

interface Props {
  /** Which rail group opened this — decides what gets written. */
  scope: GenerationScope
  coverage: CoverageReport
  onClose: () => void
  onGenerate: (types: GeneratableType[], prompt?: GenerationPrompt) => void
  /** Route out of the zero-transcript dead end — opens the 5Mins Library. */
  onAddLessons: () => void
  /** Live run. Non-null replaces the form with the working card (FR-11). */
  generating?: {
    steps: string[]
    activeStep: number
    stepMs: number
    draft: GeneratedAssessment | null
    detail?: string
  } | null
  /**
   * A finished situational test waiting to be approved. Nothing reaches the course
   * outline until the admin saves it, so the drawer holds the draft in the same
   * editor they'd have written it in.
   */
  review?: {
    draft: SituationalTestData
    onSave: (title: string, brief: string, questions: SituationalQuestion[]) => void
    onGenerateAgain: () => void
  } | null
}

/* Names what it makes, not just how — two rail rows share the label "Create With AI",
   so the drawer is where they become distinguishable. Situational is singular: the
   scope produces one test for the whole course. */
const COPY: Record<
  GenerationScope,
  {
    noun: string
    title: string
    /** The format picker's heading. Absent where there is no picker. */
    typesLabel?: string
    typesHelper?: string
    callout: string
    emptyBody: string
    cta: string
  }
> = {
  assessments: {
    noun: 'assessments',
    title: 'Create Assessments with AI',
    typesLabel: 'What kind of assessments do you want to create?',
    typesHelper: 'Select the ones you want. AI decides how many of each.',
    callout:
      'Assessments are created using the course material. Lessons, links, or resources help AI generate assessments based on that content.',
    emptyBody:
      'Assessments are created using the course material. By adding lessons, links, or resources, AI will generate assessments based on that content.',
    cta: 'Generate Assessments',
  },
  situational: {
    noun: 'situational tests',
    title: 'Create Situational Test with AI',
    callout:
      'Situational tests are created using the course material. AI picks the question formats and how many of each, based on what the content supports — you can change them when you review the draft.',
    emptyBody:
      'Situational tests are created using the course material. By adding lessons, links, or resources, AI will generate a tailored situational test based on that content.',
    cta: 'Generate Situational Test',
  },
}

/**
 * Picks what the generator should write, then hands off (DES-279 FR-02). The admin
 * chooses the formats; how many of each is the generator's call, so there is no
 * quantity control here.
 *
 * Opened from either rail group. The assessments scope offers its eight formats as
 * chips; the situational scope has only one format, so it has nothing to pick and
 * shows no picker.
 *
 * The wait happens here too: Generate swaps the form for the working card and the
 * drawer holds until the drafts land on the outline behind it.
 */
function GenerateAssessmentsDrawer({
  scope, coverage, onClose, onGenerate, onAddLessons,
  generating = null, review = null,
}: Props) {
  const questionTypes = ASSESSMENT_TYPES
  const copy = COPY[scope]

  /* Only the assessments scope picks formats. A situational test is one artefact
     built from whatever the content supports, so V1 lets the generator choose the
     formats and the admin change them in the review — a picker there asked for a
     decision before there was anything to decide it against. */
  const picksFormats = scope === 'assessments'

  /* Nothing selected to start. Chips are a choice the admin makes, and eight
     pre-filled ones read as a wall of amber rather than something to pick from. */
  const [selected, setSelected] = useState<GeneratableType[]>([])

  /* The situational prompt. Both free text, both optional — what the admin knows
     about the audience and how the test should read, which the course content
     cannot say on its own. */
  const [audience, setAudience] = useState('')
  const [instructions, setInstructions] = useState('')
  const reduce = useReducedMotion()

  const readable = coverage.withTranscript.length
  const skipped = coverage.withoutTranscript.length
  const total = readable + skipped

  const toggle = (type: GeneratableType) =>
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )

  /* The draft is read and approved before it becomes course content, in the same
     editor an admin would have written it in — so reviewing one and writing one are
     the same skill, and anything they'd have said differently is edited here rather
     than after it lands. */
  /* The wait and the review are one handoff, not two screens: the wait leaves upward as
     the review rises into the place it left. AnimatePresence is what holds the wait on
     screen long enough to leave — without it the swap is a cut — and `mode="wait"` keeps
     the two from crossing over each other. */
  if (review || generating) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        {review ? (
          <motion.div
            key="review"
            className="gen-drawer__phase"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={arriveTransition(reduce)}
          >
            {/* The draft is read and approved before it becomes course content, in the
                same editor an admin would have written it in — so reviewing one and
                writing one are the same skill. */}
            <SituationalTestDrawerContent
              initial={review.draft}
              onClose={onClose}
              onSave={review.onSave}
              review={{ onGenerateAgain: review.onGenerateAgain }}
            />
          </motion.div>
        ) : (
          generating && (
            <motion.div
              key="working"
              className="gen-drawer__phase"
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={arriveTransition(reduce)}
            >
              {/* The wait replaces the form it was started from, so the drawer stays the
                  one place this happens. Neither a percentage nor a clock: the length of
                  the read isn't knowable, so the card names the pass it is on (FR-11).
                  The footer goes with the form — there is nothing to submit while it
                  runs. */}
              <SectionHeader title={copy.title} ctas={<CloseButton onClick={onClose} />} />
              <div className="gen-drawer__body">
                <GeneratingBody
                  steps={generating.steps}
                  activeStep={generating.activeStep}
                  stepMs={generating.stepMs}
                  draft={generating.draft}
                  detail={generating.detail}
                />
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    )
  }

  /* FR-05. The generator reads the course, so an empty course is the one thing it
     can't work around — and the fix is the same for both scopes: put something on
     the outline. */
  if (total === 0) {
    return (
      <>
        <SectionHeader title={copy.title} ctas={<CloseButton onClick={onClose} />} />
        <div className="gen-drawer__body gen-drawer__body--empty">
          <div className="gen-drawer__empty">
            <img src={emptyBox} width={72} height={72} alt="" />
            <div className="gen-drawer__empty-info">
              {/* Names the gap, not the consequence — "nothing to read" left the admin
                  to work out whose problem it was and what would fix it. */}
              <h3 className="gen-drawer__empty-title">This course has no content yet</h3>
              <p className="gen-drawer__empty-body">{copy.emptyBody}</p>
            </div>
            {/* Adding lessons is adding content, not an AI action — the sparkle here
                promised the button would generate something. */}
            <Button
              icon={<Add size={20} color="currentColor" variant="Linear" />}
              onClick={onAddLessons}
            >
              Add Lessons
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* No description: the callout and the source list below say the same things
          with more room, and saying them twice above the fold just pushed the
          controls down. */}
      <SectionHeader title={copy.title} ctas={<CloseButton onClick={onClose} />} />

      <div className="gen-drawer__body">
        {/* No standing callout about what the generator reads — the source chips below
            say it concretely, and naming the actual sources beats a paragraph
            promising the same thing. */}

        {/* What the generator works from, and the lever the admin has over it — the
            course's own artwork rather than a generic info glyph, so the callout reads
            as being about this thing (Figma 9155:41921). */}
        <Alert
          type="Callout"
          className="gen-drawer__callout"
          customIcon={
            <img
              src={getAssessmentIllustration(
                scope === 'situational' ? 'situational-test' : 'multiple-choice',
                'desktop',
              )}
              width={40}
              height={40}
              alt=""
              className="alert__icon"
            />
          }
          message={copy.callout}
        />

        {/* FR-04: partial coverage is surfaced, never silently skipped. */}
        {skipped > 0 && (
          <Alert
            type="Alert"
            icon
            className="gen-drawer__coverage"
            message={`${readable} of ${total} lessons have transcripts. ${skipped === 1 ? 'This one will be skipped' : 'These will be skipped'}: ${coverage.withoutTranscript.map((l) => l.title).join(', ')}.`}
          />
        )}

        {picksFormats ? (
          <div className="gen-drawer__field">
            <div className="gen-drawer__field-heading">
              <h3 className="h4">{copy.typesLabel}</h3>
              <p className="text-md gen-drawer__helper">{copy.typesHelper}</p>
            </div>
            <div className="gen-drawer__chips">
              {questionTypes.map((type) => {
                const isOn = selected.includes(type)
                return (
                  <Chip
                    key={type}
                    label={typeLabel(type)}
                    selected={isOn}
                    /* Same glyph the Add Content rail uses for this format, so the
                       format is recognised rather than re-read. */
                    customIconLeft={assessmentTypeIcon(type, { size: 16, active: isOn })}
                    onClick={() => toggle(type)}
                  />
                )
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Who the scenarios are written for. Optional: with nothing here the
                generator writes for whoever the course is written for. */}
            <div className="gen-drawer__field gen-drawer__field--prompt">
              <label className="gen-drawer__label" htmlFor="gen-audience">
                Audience <span className="gen-drawer__label-optional">(optional)</span>
              </label>
              <input
                id="gen-audience"
                type="text"
                className="gen-drawer__input"
                placeholder="Front-of-house staff in their first month"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            {/* The steer the format picker used to be: not which formats, but how the
                test should read. */}
            <div className="gen-drawer__field gen-drawer__field--prompt">
              <label className="gen-drawer__label" htmlFor="gen-instructions">
                Instructions <span className="gen-drawer__label-optional">(optional)</span>
              </label>
              <textarea
                id="gen-instructions"
                className="gen-drawer__textarea"
                rows={3}
                placeholder="Tone, constraints, anything to avoid…"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="gen-drawer__footer">
        {/* The picker gates the assessments scope: nothing chosen, nothing to write.
            The situational prompt gates nothing — both its fields are optional, so
            Generate is ready from the moment the drawer opens. */}
        <Button
          semantic="ai"
          icon={<SparkleIcon size={20} color="currentColor" />}
          disabled={picksFormats && selected.length === 0}
          onClick={() =>
            picksFormats
              ? onGenerate(selected)
              : onGenerate([], {
                  audience: audience.trim() || undefined,
                  instructions: instructions.trim() || undefined,
                })
          }
        >
          {copy.cta}
        </Button>
      </div>
    </>
  )
}

/* Floors, not schedules: a longer pass spreads the same content further apart rather
   than fitting more into it. */
const TITLE_BEAT_MS = 500
/** How long one assessment card holds the screen. Exported because the pass that shows
 *  the cards has to be long enough for all of them — a pass that ends early dumps the
 *  rest in at once, which is the one thing a reveal must not do. */
export const QUESTION_BEAT_MS = 700

/* How the passes are numbered, so the reveal and the labels can't drift apart. */
const READING = 0
const WRITING_BRIEF = 1
const CREATING = 2

/* What the third pass calls each format while it writes one. The rail's labels are
   titles for a menu; these are the middle of a sentence. */
const CREATING_WORD: Partial<Record<GeneratableType, string>> = {
  'single-choice': 'multiple-choice',
  'fill-blank': 'fill-in-the-blanks',
  sequencing: 'sequence',
  'match-pairs': 'match-the-pairs',
  categorization: 'categorise',
  'short-text': 'short-text',
  exercise: 'exercise',
  poll: 'poll',
}

/** Matches the media query the CSS uses, so motion is dropped in one place per user. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Types a string out over `ms`, or hands it over whole when `run` is false. */
function useTyped(text: string, run: boolean, ms: number, delay = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!run || prefersReducedMotion()) {
      setCount(text.length)
      return
    }
    setCount(0)
    const tick = 32
    const perTick = Math.max(1, Math.ceil(text.length / Math.max(1, ms / tick)))
    let id = 0
    const started = window.setTimeout(() => {
      id = window.setInterval(() => setCount((n) => Math.min(text.length, n + perTick)), tick)
    }, delay)
    return () => {
      window.clearTimeout(started)
      window.clearInterval(id)
    }
  }, [text, run, ms, delay])

  return { shown: text.slice(0, count), done: count >= text.length }
}

/**
 * The wait, and the draft arriving inside it.
 *
 * The generator wrote the whole thing before the wait began, so this is a reveal paced to
 * the passes: nothing while the course is read, then the title and brief write themselves
 * into their own fields, then one assessment card at a time writes itself in. Each thing
 * being written wears the shimmer until it is finished, so the effect and the content say
 * the same thing rather than two different ones.
 *
 * The passes are told what is happening under them — which lesson is being read, which
 * kind of assessment is being written — which is why the working card is in here: the
 * detail for the third pass depends on which card the reveal has reached.
 */
function GeneratingBody({
  steps,
  activeStep,
  stepMs,
  draft,
  detail,
}: {
  steps: string[]
  activeStep: number
  stepMs: number
  draft: GeneratedAssessment | null
  detail?: string
}) {
  const brief = draft?.brief ?? ''
  const questions = draft?.questions ?? []
  const [landed, setLanded] = useState(0)
  const newest = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  /* Keeps the card being written in view. The passes are pinned at the top, so the
     content scrolls under them rather than the whole drawer jumping. */
  useEffect(() => {
    if (!landed) return
    newest.current?.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [landed])

  /* Pass two writes both fields: the title first and quickly, since it is one line, then
     the brief under it for the rest of the pass. */
  const writingBrief = activeStep === WRITING_BRIEF
  const title = useTyped(draft?.title ?? '', writingBrief, TITLE_BEAT_MS)
  const briefText = useTyped(brief, writingBrief, stepMs * 0.65, TITLE_BEAT_MS + 200)

  /* Pass three: one card at a time, never faster than one can be read. */
  useEffect(() => {
    if (activeStep < CREATING) {
      setLanded(0)
      return
    }
    if (activeStep > CREATING || prefersReducedMotion()) {
      setLanded(questions.length)
      return
    }
    setLanded(1)
    const every = Math.max(QUESTION_BEAT_MS, (stepMs * 0.9) / Math.max(1, questions.length))
    const id = window.setInterval(
      () => setLanded((n) => Math.min(questions.length, n + 1)),
      every,
    )
    return () => window.clearInterval(id)
  }, [activeStep, questions.length, stepMs])

  /* The third pass names the kind it is on, which is whichever card is being written.
     The first two take whatever the caller sends — the lesson being read, then who the
     brief is being written for. */
  const writingCard = activeStep === CREATING ? questions[landed - 1] : undefined
  const stepDetail =
    activeStep === READING || activeStep === WRITING_BRIEF
      ? detail
      : writingCard
        ? `Creating ${CREATING_WORD[writingCard.format] ?? typeLabel(writingCard.format)} assessments`
        : undefined

  return (
    <>
      <AIWorkingCard
        className="gen-drawer__steps"
        steps={steps}
        activeStep={activeStep}
        detail={stepDetail}
      />

      {/* Nothing is written yet while the course is being read. */}
      {activeStep >= WRITING_BRIEF && draft && (
        <div className="gen-drawer__live" aria-hidden="true">
          {/* The fields the review will hand over, filling as they are written. The
              shimmer sits on whatever is still being written and lifts when it is done. */}
          <motion.div
            className="gen-drawer__live-field"
            layout="position"
            {...ARRIVE(reduce)}
            transition={arriveTransition(reduce)}
          >
            <span className="gen-drawer__live-label">Title</span>
            <div className={`gen-drawer__live-input${title.done ? '' : ' is-writing'}`}>
              {title.shown}
              {!title.done && <span className="gen-drawer__caret" />}
            </div>
          </motion.div>

          <motion.div
            className="gen-drawer__live-field"
            layout="position"
            {...ARRIVE(reduce)}
            transition={arriveTransition(reduce)}
          >
            <span className="gen-drawer__live-label">Brief</span>
            <div
              className={`gen-drawer__live-input gen-drawer__live-input--brief${
                briefText.done ? '' : ' is-writing'
              }`}
            >
              {briefText.shown}
              {!briefText.done && <span className="gen-drawer__caret" />}
            </div>
          </motion.div>

          {questions.slice(0, landed).map((question, i) => (
            <LiveQuestion
              key={i}
              ref={i === landed - 1 ? newest : undefined}
              question={question}
              /* Only the newest card is being written; the ones above it are done. */
              writing={activeStep === CREATING && i === landed - 1}
              ms={QUESTION_BEAT_MS * 0.7}
              reduce={reduce}
            />
          ))}
        </div>
      )}
    </>
  )
}

/** One assessment card, writing itself in. */
const LiveQuestion = forwardRef<
  HTMLDivElement,
  { question: GeneratedQuestion; writing: boolean; ms: number; reduce: boolean | null }
>(function LiveQuestion({ question, writing, ms, reduce }, ref) {
  const text = useTyped(question.text, writing, ms)
  return (
    <motion.div
      ref={ref}
      className={`gen-drawer__live-question${writing ? ' is-writing' : ''}`}
      /* Position only: the card grows as its question types itself in, and scaling that
         growth would stretch the text being written. */
      layout="position"
      {...ARRIVE(reduce)}
      transition={arriveTransition(reduce)}
    >
      <span className="gen-drawer__live-format">{typeLabel(question.format)}</span>
      <span className="gen-drawer__live-text">
        {text.shown}
        {!text.done && <span className="gen-drawer__caret" />}
      </span>
    </motion.div>
  )
})

export default GenerateAssessmentsDrawer
