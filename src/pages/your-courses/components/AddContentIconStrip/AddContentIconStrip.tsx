import { Fragment, useState, type ReactNode } from 'react'
import {
  Add,
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
  Chart1,
  Chart21,
  I3Square,
  DocumentText,
  ArrowDown2,
  ArrowUp2,
  SliderVertical1,
  ArrangeHorizontal,
  Category,
} from 'iconsax-react'
import AssessmentIcon from '@/components/icons/AssessmentIcon'
import SparkleBadge from '@/components/icons/SparkleBadge'
import SituationalAIIcon from '@/components/icons/SituationalAIIcon'
import Collapse from '@/components/Collapse/Collapse'
import Tooltip from '@/components/Tooltip/Tooltip'
import { TYPE_CONFIG, type InteractiveQuestionType } from '@/data/interactiveQuestions'
import type { GenerationScope } from '@/data/aiAssessmentGeneration'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import './AddContentIconStrip.css'

export type StripActive =
  | 'library'
  | 'scorm'
  | 'assessment'
  | 'situational-test'
  | 'interactive'
  | 'ai-generate'
  | null

const ICON = 20
const C = 'currentColor'

/* The interactive formats sit in the same Assessments group as the classic ones —
   they are assessments, and a second group of four would double the rail's chrome
   to say so. Their labels come from TYPE_CONFIG, so the rail, the drawer header
   and the outline card can't drift.

   The order is by how much writing each one asks for, with the most-reached-for
   type leading: single choice, then the interactive four from the one you can
   fill in a minute (three pairs) to the one that needs a sentence written, words
   marked in it and wrong words invented, then the remaining classic types. */
type MenuItem =
  | { kind: 'assessment'; type: AssessmentType; label: string; icon: (active: boolean) => ReactNode }
  | { kind: 'interactive'; type: InteractiveQuestionType; icon: (active: boolean) => ReactNode }

const ASSESSMENT_MENU: MenuItem[] = [
  { kind: 'assessment', type: 'single-choice', label: 'Multiple Choice', icon: (a) => <RecordCircle size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { kind: 'interactive', type: 'match-pairs', icon: (a) => <ArrangeHorizontal size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { kind: 'interactive', type: 'sequencing', icon: (a) => <I3Square size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { kind: 'interactive', type: 'categorization', icon: (a) => <Category size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { kind: 'interactive', type: 'fill-blank', icon: (a) => <SliderVertical1 size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { kind: 'assessment', type: 'short-text', label: 'Short Text', icon: (a) => <Edit size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  { kind: 'assessment', type: 'exercise', label: 'Exercise', icon: (a) => <ArchiveBook size={ICON} color={C} variant={a ? 'Bold' : 'Linear'} /> },
  /* iconsax-react splits this glyph's two styles across exports: Chart1 holds
     its Linear and Chart21 its Bold, and each one's *other* variant is a
     different, boxed chart. Picking per state is the only way to keep the
     selected icon the same glyph as the resting one. */
  {
    kind: 'assessment',
    type: 'poll',
    label: 'Poll',
    icon: (a) =>
      a ? (
        <Chart21 size={ICON} color={C} variant="Bold" />
      ) : (
        <Chart1 size={ICON} color={C} variant="Linear" />
      ),
  },
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
  /** DES-279 — drafts a set from the course's lesson transcripts. Each group offers
   *  its own AI route, scoped to what that group makes. */
  onGenerateWithAIClick?: (scope: GenerationScope) => void
  /** Which scope the open generate drawer is working in. */
  activeGenerateScope?: GenerationScope | null
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
  onGenerateWithAIClick,
  activeGenerateScope = null,
}: AddContentIconStripProps) {
  const [assessmentsOpen, setAssessmentsOpen] = useState(false)
  const [situationalOpen, setSituationalOpen] = useState(false)

  const generateActive = (scope: GenerationScope) =>
    active === 'ai-generate' && activeGenerateScope === scope

  /* Collapsed, the rail is nothing but glyphs — so an AI row wears the icon of what it
     makes with the sparkle badged onto it, not the bare sparkle both of them used to
     share. The base takes the same Linear → Bold ladder and the same amber as every
     other row; the badge says how the thing gets made. */
  const aiGlyph = (scope: GenerationScope, isActive: boolean) =>
    scope === 'situational' ? (
      /* Drawn artwork, both weights. */
      <SituationalAIIcon size={ICON} color={C} variant={isActive ? 'Bold' : 'Linear'} />
    ) : (
      /* Still composed in code, until the assessments glyph is drawn too. */
      <SparkleBadge size={ICON}>
        <AssessmentIcon size={ICON} color={C} variant={isActive ? 'Bold' : 'Linear'} />
      </SparkleBadge>
    )

  const assessmentActive = (type: AssessmentType) =>
    active === 'assessment' && activeAssessment === type

  const interactiveActive = (type: InteractiveQuestionType) =>
    active === 'interactive' && activeInteractive === type

  /* One list, two kinds of entry — the rail reads as a single menu, so the only
     thing that varies per entry is which handler opens it. */
  const menuLabel = (m: MenuItem) =>
    m.kind === 'assessment' ? m.label : TYPE_CONFIG[m.type].label
  const menuActive = (m: MenuItem) =>
    m.kind === 'assessment' ? assessmentActive(m.type) : interactiveActive(m.type)
  const menuClick = (m: MenuItem) => () =>
    m.kind === 'assessment' ? onAssessmentClick?.(m.type) : onInteractiveClick?.(m.type)

  /* The label and the Tooltip wrapper are always mounted — swapping either on
     `expanded` would remount the button mid-transition and snap the panel. The
     label fades under CSS; the flyout is silenced with `disabled` instead. */
  const item = (
    label: string,
    icon: ReactNode,
    isActive: boolean,
    onClick?: () => void,
    /* Collapsed, a row has no group above it to lend it context — "Create With AI"
       alone can't say which of the two it is. The flyout takes the longer name, and
       so does the accessible name: collapsed, there are two buttons reading "Create
       With AI" and nothing else to tell them apart. */
    tooltip = label,
  ) => (
    <Tooltip
      text={tooltip}
      position="Left"
      icon={false}
      disabled={expanded}
      className="add-content-icon-strip__tooltip"
    >
      <button
        type="button"
        className={`add-content-icon-strip__item${isActive ? ' add-content-icon-strip__item--active' : ''}`}
        onClick={onClick}
        aria-label={expanded ? label : tooltip}
      >
        <span className="add-content-icon-strip__icon">{icon}</span>
        <span className="add-content-icon-strip__label">{label}</span>
      </button>
    </Tooltip>
  )

  /* A row inside an open group. Same shape for both groups, so the two read as one
     pattern rather than two that happen to look alike. The AI rows take the same
     amber selected treatment as every other row, label and icon alike. */
  const subitem = (
    label: string,
    icon: ReactNode,
    isActive: boolean,
    onClick?: () => void,
  ) => (
    <button
      key={label}
      type="button"
      className={[
        'add-content-icon-strip__subitem',
        isActive && 'add-content-icon-strip__subitem--selected',
      ].filter(Boolean).join(' ')}
      aria-current={isActive || undefined}
      onClick={onClick}
    >
      <span className="add-content-icon-strip__subicon">{icon}</span>
      <span className="add-content-icon-strip__sublabel">{label}</span>
    </button>
  )

  /* Expanded is not selected. A group opens to show what is inside it; Bold means the
     thing currently open in the drawer (navigation.md), so the group only wears it when
     one of its own rows is that thing. */
  const situationalSelected = generateActive('situational') || active === 'situational-test'
  const assessmentsSelected =
    generateActive('assessments') || active === 'assessment' || active === 'interactive'

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
      {/* Both content groups offer the same pair: write one yourself, or have the
          generator draft a set from the lesson transcripts. Situational tests are their
          own group rather than a ninth assessment type — they are their own card, their
          own drawer, and their own thing to generate. */}
      {expanded ? (
        <>
          <button
            type="button"
            className={`add-content-icon-strip__item${situationalSelected ? ' add-content-icon-strip__item--holds-active' : ''}`}
            onClick={() => setSituationalOpen((v) => !v)}
            aria-expanded={situationalOpen}
          >
            <span className="add-content-icon-strip__icon">
              <ClipboardText size={ICON} color={C} variant={situationalSelected ? 'Bold' : 'Linear'} />
            </span>
            <span className="add-content-icon-strip__label">Situational Tests</span>
            <span className="add-content-icon-strip__chevron">
              {situationalOpen
                ? <ArrowUp2 size={16} color={C} variant="Linear" />
                : <ArrowDown2 size={16} color={C} variant="Linear" />}
            </span>
          </button>
          <Collapse open={situationalOpen}>
            {subitem(
              'Create With AI',
              aiGlyph('situational', generateActive('situational')),
              generateActive('situational'),
              () => onGenerateWithAIClick?.('situational'),
            )}
            {/* '+', matching the manual route beside an AI one in Your Content
                ("Add Question Manually"). The group header above already says what
                this makes, so the row only has to say how. */}
            {subitem(
              'Create Manually',
              <Add size={ICON} color={C} variant={active === 'situational-test' ? 'Bold' : 'Linear'} />,
              active === 'situational-test',
              onSituationalTestClick,
            )}
          </Collapse>
        </>
      ) : (
        <>
          {item(
            'Create With AI',
            aiGlyph('situational', generateActive('situational')),
            generateActive('situational'),
            () => onGenerateWithAIClick?.('situational'),
            'Create Situational Tests With AI',
          )}
          {item(
            'Situational Test',
            <ClipboardText size={ICON} color={C} variant={active === 'situational-test' ? 'Bold' : 'Linear'} />,
            active === 'situational-test',
            onSituationalTestClick,
            'Create a Situational Test',
          )}
        </>
      )}

      {/* The rail shows the eight assessment types flat between dividers (Figma
          8953:70671); the panel folds them into an expandable Assessments group
          (navigation.md). Only this block differs between the two states. */}
      {expanded ? (
        <>
          <button
            type="button"
            className={`add-content-icon-strip__item${assessmentsSelected ? ' add-content-icon-strip__item--holds-active' : ''}`}
            onClick={() => setAssessmentsOpen((v) => !v)}
            aria-expanded={assessmentsOpen}
          >
            <span className="add-content-icon-strip__icon">
              {/* Bold with its label, and for the same reason: one of its types is open. */}
              <AssessmentIcon size={ICON} color={C} variant={assessmentsSelected ? 'Bold' : 'Linear'} />
            </span>
            <span className="add-content-icon-strip__label">Assessments</span>
            <span className="add-content-icon-strip__chevron">
              {assessmentsOpen
                ? <ArrowUp2 size={16} color={C} variant="Linear" />
                : <ArrowDown2 size={16} color={C} variant="Linear" />}
            </span>
          </button>
          <Collapse open={assessmentsOpen}>
            {/* First, and above the eight formats, for the same reason it leads the
                situational group: the rows below author one question of a chosen kind,
                this one has the generator write a set across them. */}
            {subitem(
              'Create With AI',
              aiGlyph('assessments', generateActive('assessments')),
              generateActive('assessments'),
              () => onGenerateWithAIClick?.('assessments'),
            )}
            {/* Each type carries its own glyph here too, so the icon an admin
                learns in the collapsed rail is the same one they see expanded. */}
            {ASSESSMENT_MENU.map((entry) => (
              <Fragment key={entry.type}>
                {subitem(
                  menuLabel(entry),
                  entry.icon(menuActive(entry)),
                  menuActive(entry),
                  menuClick(entry),
                )}
              </Fragment>
            ))}
          </Collapse>
        </>
      ) : (
        <>
          <span className="add-content-icon-strip__divider" aria-hidden="true" />
          {item(
            'Create With AI',
            aiGlyph('assessments', generateActive('assessments')),
            generateActive('assessments'),
            () => onGenerateWithAIClick?.('assessments'),
            'Create Assessments With AI',
          )}
          {ASSESSMENT_MENU.map((entry) => (
            <Fragment key={entry.type}>
              {item(menuLabel(entry), entry.icon(menuActive(entry)), menuActive(entry), menuClick(entry))}
            </Fragment>
          ))}
          <span className="add-content-icon-strip__divider" aria-hidden="true" />
        </>
      )}

      {item('Resources', <DocumentText size={ICON} color={C} variant="Linear" />, false)}
    </aside>
    </>
  )
}

export default AddContentIconStrip
