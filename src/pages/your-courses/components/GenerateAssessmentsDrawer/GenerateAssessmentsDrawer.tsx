import { useState } from 'react'
import { Add } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import { getAssessmentIllustration } from '@/assets/assessment-illustrations'
import { assessmentTypeIcon } from '../assessmentTypeIcons'
import CloseButton from '@/components/CloseButton/CloseButton'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import SparkleIcon from '@/components/icons/SparkleIcon'
import emptyBox from '@/assets/empty-state-illustrations/empty-box.svg'
import {
  ASSESSMENT_TYPES,
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
  onClose: () => void
  onGenerate: (types: GeneratableType[]) => void
  /** Route out of the zero-transcript dead end — opens the 5Mins Library. */
  onAddLessons: () => void
  /** Live run. Non-null replaces the form with the working card (FR-11). */
  generating?: { steps: string[]; activeStep: number } | null
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
    typesLabel: string
    typesHelper: string
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
    typesLabel: 'What kind of assessments do you want to create?',
    typesHelper: 'Select the ones you want in the test. AI decides how many of each.',
    callout:
      'Situational tests are created using the course material. Lessons, links, or resources help AI generate a tailored situational test based on that content.',
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
  /* Both scopes ask the same question — which formats — so both offer the same eight.
     What differs is what they mean by it, which is what COPY carries. */
  const questionTypes = ASSESSMENT_TYPES
  const copy = COPY[scope]

  /* Nothing selected to start. Chips are a choice the admin makes, and eight
     pre-filled ones read as a wall of amber rather than something to pick from. */
  const [selected, setSelected] = useState<GeneratableType[]>([])

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

  /* The wait replaces the form it was started from, so the drawer stays the one place
     this happens rather than handing off to the page behind it. Neither a percentage nor
     a clock: the length of the read isn't knowable, so the card names the step it is on
     and twinkles (FR-11). The footer goes with the form — there is nothing to submit or
     cancel while it runs. */
  if (generating) {
    return (
      <>
        <SectionHeader title={copy.title} ctas={<CloseButton onClick={onClose} />} />
        <div className="gen-drawer__body">
          <AIWorkingCard steps={generating.steps} activeStep={generating.activeStep} />
          {/* The shape of what is coming, in the place it will land: a title, a brief and
              the question cards under them. Decorative — the steps above are what a
              screen reader hears — so it is hidden from the tree rather than described. */}
          <div className="gen-drawer__skeleton" aria-hidden="true">
            <span className="gen-drawer__skeleton-title" />
            <span className="gen-drawer__skeleton-brief" />
            <span className="gen-drawer__skeleton-card" />
            <span className="gen-drawer__skeleton-card" />
            <span className="gen-drawer__skeleton-card" />
          </div>
        </div>
      </>
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
      </div>

      <div className="gen-drawer__footer">
        <Button
          semantic="ai"
          icon={<SparkleIcon size={20} color="currentColor" />}
          disabled={selected.length === 0}
          onClick={() => onGenerate(selected)}
        >
          {copy.cta}
        </Button>
      </div>
    </>
  )
}

export default GenerateAssessmentsDrawer
