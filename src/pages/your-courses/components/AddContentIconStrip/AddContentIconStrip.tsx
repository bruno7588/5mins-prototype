import { Fragment, useState, type ReactNode } from 'react'
import {
  SidebarLeft,
  SidebarRight,
  PlayCircle,
  DocumentUpload,
  DirectboxNotif,
  Link2,
  CalendarEdit,
  ClipboardText,
  RecordCircle,
  Edit,
  ArchiveBook,
  Chart,
  DocumentText,
  ArrowDown2,
  ArrowUp2,
  TextBlock,
  ArrangeHorizontal,
  Category,
  RowVertical,
} from 'iconsax-react'
import AssessmentIcon from '@/components/icons/AssessmentIcon'
import Collapse from '@/components/Collapse/Collapse'
import Tooltip from '@/components/Tooltip/Tooltip'
import { TYPE_CONFIG, type InteractiveQuestionType } from '@/data/interactiveQuestions'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import './AddContentIconStrip.css'

export type StripActive =
  | 'library'
  | 'scorm'
  | 'assessment'
  | 'situational-test'
  | 'interactive'
  | null

const ICON = 20
const C = 'currentColor'

const ASSESSMENTS: { type: AssessmentType; label: string; icon: (active: boolean) => ReactNode }[] = [
  { type: 'single-choice', label: 'Single Choice', icon: (a) => <RecordCircle size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { type: 'short-text', label: 'Short Text', icon: (a) => <Edit size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { type: 'exercise', label: 'Exercise', icon: (a) => <ArchiveBook size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { type: 'poll', label: 'Poll', icon: (a) => <Chart size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
]

/* The interactive formats join the same Assessments group — they are assessments,
   and a second group of four would double the rail's chrome to say so. Labels come
   from TYPE_CONFIG so the rail, the drawer header and the outline card can't drift. */
const INTERACTIVE: { type: InteractiveQuestionType; icon: (active: boolean) => ReactNode }[] = [
  { type: 'fill-blank', icon: (a) => <TextBlock size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { type: 'match-pairs', icon: (a) => <ArrangeHorizontal size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { type: 'categorization', icon: (a) => <Category size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { type: 'sequencing', icon: (a) => <RowVertical size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
]

interface AddContentIconStripProps {
  active?: StripActive
  /** Which assessment type the open assessment drawer is showing. */
  activeAssessment?: AssessmentType
  /** Labelled 240px panel instead of the 52px icon rail. */
  expanded?: boolean
  onToggleExpanded?: () => void
  onLibraryClick?: () => void
  onScormClick?: () => void
  onAssessmentClick?: (type: AssessmentType) => void
  onSituationalTestClick?: () => void
  /** Which interactive format the open drawer is showing. */
  activeInteractive?: InteractiveQuestionType
  onInteractiveClick?: (type: InteractiveQuestionType) => void
}

/* Right-edge Add Content sidebar per Figma 8949:70435 (rail) / 8953:70671 (items).
   Always present in the course builder: a 52px icon rail that expands to a 240px
   labelled panel. The four assessment types each get their own icon, grouped
   between two dividers. */
function AddContentIconStrip({
  active = null,
  activeAssessment,
  expanded = false,
  onToggleExpanded,
  onLibraryClick,
  onScormClick,
  onAssessmentClick,
  onSituationalTestClick,
  activeInteractive,
  onInteractiveClick,
}: AddContentIconStripProps) {
  const [assessmentsOpen, setAssessmentsOpen] = useState(false)

  const assessmentActive = (type: AssessmentType) =>
    active === 'assessment' && activeAssessment === type

  const interactiveActive = (type: InteractiveQuestionType) =>
    active === 'interactive' && activeInteractive === type

  /* The label and the Tooltip wrapper are always mounted — swapping either on
     `expanded` would remount the button mid-transition and snap the panel. The
     label fades under CSS; the flyout is silenced with `disabled` instead. */
  const item = (label: string, icon: ReactNode, isActive: boolean, onClick?: () => void) => (
    <Tooltip
      text={label}
      position="Left"
      icon={false}
      disabled={expanded}
      className="add-content-icon-strip__tooltip"
    >
      <button
        type="button"
        className={`add-content-icon-strip__item${isActive ? ' add-content-icon-strip__item--active' : ''}`}
        onClick={onClick}
        aria-label={label}
      >
        <span className="add-content-icon-strip__icon">{icon}</span>
        <span className="add-content-icon-strip__label">{label}</span>
      </button>
    </Tooltip>
  )

  const toggleLabel = expanded ? 'Collapse' : 'Expand'
  const toggle = (
    <Tooltip
      text={toggleLabel}
      position="Left"
      icon={false}
      disabled={expanded}
      className="add-content-icon-strip__tooltip"
    >
      <button
        type="button"
        className="add-content-icon-strip__item add-content-icon-strip__item--toggle"
        onClick={onToggleExpanded}
        aria-label={toggleLabel}
        aria-expanded={expanded}
      >
        <span className="add-content-icon-strip__icon">
          {/* The glyph points the way the panel will move. */}
          {expanded
            ? <SidebarRight size={ICON} color={C} variant="Linear" />
            : <SidebarLeft size={ICON} color={C} variant="Linear" />}
        </span>
      </button>
    </Tooltip>
  )

  const classes = ['add-content-icon-strip', expanded && 'add-content-icon-strip--expanded']
    .filter(Boolean)
    .join(' ')

  return (
    <>
    <span className="add-content-icon-strip__gutter" aria-hidden="true" />
    <aside className={classes} aria-label="Add content">
      {/* The toggle stays put even beside an open drawer — the labels are the only way
          to read what each glyph means, so expanding must always be reachable. */}
      <div className="add-content-icon-strip__head">
        <h4 className="add-content-icon-strip__title" aria-hidden={!expanded}>Add Content</h4>
        {toggle}
      </div>

      {item('5Mins Library', <PlayCircle size={ICON} color={C} variant={active === 'library' ? 'Bold' : 'Linear'} />, active === 'library', onLibraryClick)}
      {item('Your Content', <DocumentUpload size={ICON} color={C} variant="Linear" />, false)}
      {item('SCORM', <DirectboxNotif size={ICON} color={C} variant={active === 'scorm' ? 'Bold' : 'Linear'} />, active === 'scorm', onScormClick)}
      {item('Embed Links', <Link2 size={ICON} color={C} variant="Linear" />, false)}
      {item('Events', <CalendarEdit size={ICON} color={C} variant="Linear" />, false)}
      {item(
        'Situational Test',
        <ClipboardText
          size={ICON}
          color={C}
          variant={active === 'situational-test' ? 'Bold' : 'Linear'}
        />,
        active === 'situational-test',
        onSituationalTestClick,
      )}

      {/* The rail shows the four assessment types flat between dividers (Figma
          8953:70671); the panel folds them into an expandable Assessments group
          (navigation.md). Only this block differs between the two states. */}
      {expanded ? (
        <>
          <button
            type="button"
            className={`add-content-icon-strip__item${assessmentsOpen ? ' add-content-icon-strip__item--open' : ''}`}
            onClick={() => setAssessmentsOpen((v) => !v)}
            aria-expanded={assessmentsOpen}
          >
            <span className="add-content-icon-strip__icon">
              {/* Bold while open, so the glyph carries the same weight as its label. */}
              <AssessmentIcon size={ICON} color={C} variant={assessmentsOpen ? 'Bold' : 'Linear'} />
            </span>
            <span className="add-content-icon-strip__label">Assessments</span>
            <span className="add-content-icon-strip__chevron">
              {assessmentsOpen
                ? <ArrowUp2 size={16} color={C} variant="Linear" />
                : <ArrowDown2 size={16} color={C} variant="Linear" />}
            </span>
          </button>
          <Collapse open={assessmentsOpen}>
            {/* Each type carries its own glyph here too, so the icon an admin
                learns in the collapsed rail is the same one they see expanded. */}
            {ASSESSMENTS.map(({ type, label, icon }) => (
              <button
                key={type}
                type="button"
                className={`add-content-icon-strip__subitem${assessmentActive(type) ? ' add-content-icon-strip__subitem--selected' : ''}`}
                aria-current={assessmentActive(type) || undefined}
                onClick={() => onAssessmentClick?.(type)}
              >
                <span className="add-content-icon-strip__subicon">{icon(assessmentActive(type))}</span>
                {label}
              </button>
            ))}
            {INTERACTIVE.map(({ type, icon }) => (
              <button
                key={type}
                type="button"
                className={`add-content-icon-strip__subitem${interactiveActive(type) ? ' add-content-icon-strip__subitem--selected' : ''}`}
                aria-current={interactiveActive(type) || undefined}
                onClick={() => onInteractiveClick?.(type)}
              >
                <span className="add-content-icon-strip__subicon">{icon(interactiveActive(type))}</span>
                {TYPE_CONFIG[type].label}
              </button>
            ))}
          </Collapse>
        </>
      ) : (
        <>
          <span className="add-content-icon-strip__divider" aria-hidden="true" />
          {ASSESSMENTS.map(({ type, label, icon }) =>
            <Fragment key={type}>{item(label, icon(assessmentActive(type)), assessmentActive(type), () => onAssessmentClick?.(type))}</Fragment>,
          )}
          {INTERACTIVE.map(({ type, icon }) =>
            <Fragment key={type}>{item(TYPE_CONFIG[type].label, icon(interactiveActive(type)), interactiveActive(type), () => onInteractiveClick?.(type))}</Fragment>,
          )}
          <span className="add-content-icon-strip__divider" aria-hidden="true" />
        </>
      )}

      {item('Resources', <DocumentText size={ICON} color={C} variant="Linear" />, false)}
    </aside>
    </>
  )
}

export default AddContentIconStrip
