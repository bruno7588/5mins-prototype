import { useState } from 'react'
import { Add } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import SparkleIcon from '@/components/icons/SparkleIcon'
import noActivity from '@/assets/empty-state-illustrations/no-activity.svg'
import {
  TYPES_BY_SCOPE,
  typeLabel,
  type CoverageReport,
  type GeneratableType,
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
  /** Already-generated items in this scope. Above zero, generating means replacing
      them rather than stacking a second set on the first. */
  generatedCount: number
  onClose: () => void
  onGenerate: (types: GeneratableType[]) => void
  /** Route out of the zero-transcript dead end — opens the 5Mins Library. */
  onAddLessons: () => void
  /** Live run. Non-null replaces the form with the working card (FR-11). */
  generating?: { steps: string[]; activeStep: number; elapsedSeconds: number } | null
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

const COPY: Record<GenerationScope, { noun: string; title: string; blurb: string }> = {
  assessments: {
    noun: 'assessments',
    title: 'Generate assessments with AI',
    blurb: 'Drafted from your lesson transcripts, placed straight onto the outline.',
  },
  situational: {
    noun: 'situational tests',
    title: 'Generate situational tests with AI',
    blurb: 'Scenarios built from your lesson transcripts, placed straight onto the outline.',
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
  scope, coverage, generatedCount, onClose, onGenerate, onAddLessons,
  generating = null, review = null,
}: Props) {
  const types = TYPES_BY_SCOPE[scope]
  const hasPicker = types.length > 1
  const copy = COPY[scope]
  const replacing = generatedCount > 0

  /* Nothing selected to start. Chips are a choice the admin makes, and eight
     pre-filled ones read as a wall of amber rather than something to pick from.
     With no picker there is nothing to choose, so the one type is the selection. */
  const [selected, setSelected] = useState<GeneratableType[]>(hasPicker ? [] : types)

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
  if (review) {
    return (
      <SituationalTestDrawerContent
        initial={review.draft}
        onClose={onClose}
        onSave={review.onSave}
        review={{ onGenerateAgain: review.onGenerateAgain }}
      />
    )
  }

  /* The wait replaces the form it was started from, so the drawer stays the one
     place this happens rather than handing off to the page behind it. No percentage:
     the length of the read isn't knowable, so it counts up and names the lesson it's
     on (FR-11). The footer goes with the form — there is nothing to submit or cancel
     while it runs. */
  if (generating) {
    return (
      <>
        <SectionHeader title={copy.title} ctas={<CloseButton onClick={onClose} />} />
        <div className="gen-drawer__body">
          <AIWorkingCard
            steps={generating.steps}
            activeStep={generating.activeStep}
            elapsedSeconds={generating.elapsedSeconds}
          />
        </div>
      </>
    )
  }

  /* FR-05: nothing to read from. The dead end explains what the generator works
     from and hands over the one action that clears it, rather than reporting that
     generation is unavailable and stopping there. */
  if (readable === 0) {
    return (
      <>
        <SectionHeader title={copy.title} ctas={<CloseButton onClick={onClose} />} />
        <div className="gen-drawer__body gen-drawer__body--empty">
          <div className="gen-drawer__empty">
            <img src={noActivity} width={72} height={72} alt="" />
            <div className="gen-drawer__empty-info">
              <h3 className="gen-drawer__empty-title">No transcripts to read yet</h3>
              <p className="gen-drawer__empty-body">
                {copy.noun.charAt(0).toUpperCase() + copy.noun.slice(1)} are written from
                your lessons' transcripts — every question comes from something a lesson
                actually says. {total > 0
                  ? 'None of the lessons on this course have one yet.'
                  : 'Add a lesson and its transcript becomes the source material.'}{' '}
                Uploaded SCORM packages can't be read, so they don't count.
              </p>
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
      <SectionHeader
        title={copy.title}
        description={
          replacing
            ? `Writing a fresh set replaces the ${generatedCount} already generated. Anything you wrote yourself stays.`
            : copy.blurb
        }
        ctas={<CloseButton onClick={onClose} />}
      />

      <div className="gen-drawer__body">
        {/* What the generator can and can't do, said before it runs rather than
            discovered afterwards. */}
        <Alert
          type="Callout"
          className="gen-drawer__callout"
          customIcon={<SparkleIcon size={24} gradient className="alert__icon" />}
          message="Every question is written from what your lessons say — nothing is invented from outside them. Drafts are yours to keep, delete or regenerate; editing them comes later, so read them before you publish."
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

        {hasPicker ? (
          <div className="gen-drawer__field">
            <h3 className="gen-drawer__label">Assessment types</h3>
            <p className="gen-drawer__helper">
              Pick what to write. How many of each follows from how much each transcript
              supports, so there's no number to set.
            </p>
            <div className="gen-drawer__chips">
              {types.map((type) => (
                <Chip
                  key={type}
                  label={typeLabel(type)}
                  selected={selected.includes(type)}
                  onClick={() => toggle(type)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* One test, so nothing to choose — say what will happen instead of
             offering a picker with a single option in it. */
          <p className="gen-drawer__helper">
            One situational test for the course, built from{' '}
            {readable === 1 ? 'the lesson' : `all ${readable} lessons`} with a transcript
            — a title, a brief, and 6 to 8 questions.
          </p>
        )}
      </div>

      <div className="gen-drawer__footer">
        <Button
          semantic="ai"
          icon={<SparkleIcon size={20} color="currentColor" />}
          disabled={selected.length === 0}
          onClick={() => onGenerate(selected)}
        >
          {replacing ? 'Regenerate All' : 'Generate'}
        </Button>
        <Button variant="outlined-2" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </>
  )
}

export default GenerateAssessmentsDrawer
