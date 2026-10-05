import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Add,
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
  I3Square,
  DocumentText,
  SliderVertical1,
  ArrangeHorizontal,
  Category,
  ArrowRight2,
} from 'iconsax-react'
import AssessmentIcon from '@/components/icons/AssessmentIcon'
import SituationalAIIcon from '@/components/icons/SituationalAIIcon'
import AssessmentsAIIcon from '@/components/icons/AssessmentsAIIcon'
import { TYPE_CONFIG, type InteractiveQuestionType } from '@/data/interactiveQuestions'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import './AddContentMenu.css'

/** What the admin picked. The page opens the matching drawer. */
export type AddContentAction =
  | { kind: 'library' }
  | { kind: 'scorm' }
  | { kind: 'resources' }
  | { kind: 'situational-ai' }
  | { kind: 'situational-manual' }
  | { kind: 'assessments-ai' }
  | { kind: 'assessment'; type: AssessmentType }
  | { kind: 'interactive'; type: InteractiveQuestionType }

const ICON = 20
const C = 'currentColor'
const GAP = 6
const MENU_W = 240
const SUB_W = 240

interface AddContentMenuProps {
  open: boolean
  anchor: HTMLElement | null
  onClose: () => void
  onSelect: (action: AddContentAction) => void
}

interface Leaf {
  key: string
  label: string
  icon: ReactNode
  action?: AddContentAction
}

/* Not built yet: listed so the menu shows the whole catalogue, but read-only. */
const UNBUILT = undefined

const SITUATIONAL: Leaf[] = [
  { key: 'sit-ai', label: 'Create With AI', icon: <SituationalAIIcon size={ICON} color={C} variant="Linear" />, action: { kind: 'situational-ai' } },
  { key: 'sit-manual', label: 'Create Manually', icon: <Add size={ICON} color={C} variant="Linear" />, action: { kind: 'situational-manual' } },
]

/* Same order as the old side panel: AI first, then by how much writing each asks for. */
const ASSESSMENTS: Leaf[] = [
  { key: 'as-ai', label: 'Create With AI', icon: <AssessmentsAIIcon size={ICON} color={C} variant="Linear" />, action: { kind: 'assessments-ai' } },
  { key: 'single-choice', label: 'Multiple Choice', icon: <RecordCircle size={ICON} color={C} variant="Linear" />, action: { kind: 'assessment', type: 'single-choice' } },
  { key: 'match-pairs', label: TYPE_CONFIG['match-pairs'].label, icon: <ArrangeHorizontal size={ICON} color={C} variant="Linear" />, action: { kind: 'interactive', type: 'match-pairs' } },
  { key: 'sequencing', label: TYPE_CONFIG.sequencing.label, icon: <I3Square size={ICON} color={C} variant="Linear" />, action: { kind: 'interactive', type: 'sequencing' } },
  { key: 'categorization', label: TYPE_CONFIG.categorization.label, icon: <Category size={ICON} color={C} variant="Linear" />, action: { kind: 'interactive', type: 'categorization' } },
  { key: 'fill-blank', label: TYPE_CONFIG['fill-blank'].label, icon: <SliderVertical1 size={ICON} color={C} variant="Linear" />, action: { kind: 'interactive', type: 'fill-blank' } },
  { key: 'short-text', label: 'Short Text', icon: <Edit size={ICON} color={C} variant="Linear" />, action: { kind: 'assessment', type: 'short-text' } },
  { key: 'exercise', label: 'Exercise', icon: <ArchiveBook size={ICON} color={C} variant="Linear" />, action: { kind: 'assessment', type: 'exercise' } },
  { key: 'poll', label: 'Poll', icon: <Chart1 size={ICON} color={C} variant="Linear" />, action: { kind: 'assessment', type: 'poll' } },
]

type Sub = 'situational' | 'assessments'

/**
 * Anchored Add Content menu (Create Course, Figma 10210:26756). Replaces the right-edge
 * side panel, whose icons confused admins. One DS listbox (listbox.md) under the clicked
 * Add Content button; Situational Tests and Assessments open a second listbox beside it
 * on hover, as drawn. Flips upward near the bottom of the viewport and the flyout flips
 * left near the right edge.
 */
function AddContentMenu({ open, anchor, onClose, onSelect }: AddContentMenuProps) {
  const reduce = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)
  const [pos, setPos] = useState({ left: 0, top: 0, openUp: false })
  const [sub, setSub] = useState<Sub | null>(null)
  const [subSide, setSubSide] = useState<'right' | 'left'>('right')
  /* Upward nudge for a flyout that would run off the bottom of the viewport. */
  const subRef = useRef<HTMLDivElement>(null)
  const [subShift, setSubShift] = useState(0)

  useLayoutEffect(() => {
    if (!sub) { setSubShift(0); return }
    const el = subRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const overflow = r.bottom + subShift - (window.innerHeight - 8)
    setSubShift(overflow > 0 ? Math.min(overflow, r.top + subShift - 8) : 0)
  }, [sub, pos]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!open || !anchor) return
    const compute = () => {
      const r = anchor.getBoundingClientRect()
      const menuH = rootRef.current?.offsetHeight ?? 400
      let left = r.left
      if (left + MENU_W > window.innerWidth - 8) left = window.innerWidth - 8 - MENU_W
      left = Math.max(8, left)
      let top = r.bottom + GAP
      let openUp = false
      if (top + menuH > window.innerHeight - 8) {
        top = r.top - GAP - menuH
        openUp = true
      }
      top = Math.max(8, top)
      setPos({ left, top, openUp })
      setSubSide(left + MENU_W + GAP + SUB_W > window.innerWidth - 8 ? 'left' : 'right')
    }
    compute()
    window.addEventListener('resize', compute)
    window.addEventListener('scroll', compute, true)
    return () => {
      window.removeEventListener('resize', compute)
      window.removeEventListener('scroll', compute, true)
    }
  }, [open, anchor])

  useEffect(() => {
    if (!open) setSub(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (anchor?.contains(t)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, anchor, onClose])

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  /* Hover intent: a short grace period so moving diagonally into the flyout doesn't
     close it on the way. */
  const openSub = (which: Sub) => { clearCloseTimer(); setSub(which) }
  const scheduleCloseSub = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setSub(null), 140)
  }
  useEffect(() => () => clearCloseTimer(), [])

  const pick = (action: AddContentAction) => { onSelect(action); onClose() }

  const leafRow = (leaf: Leaf, onEnter?: () => void) =>
    leaf.action ? (
      <button
        key={leaf.key}
        type="button"
        role="menuitem"
        className="acm-row"
        onMouseEnter={onEnter}
        onClick={() => pick(leaf.action!)}
      >
        <span className="acm-row__icon">{leaf.icon}</span>
        <span className="acm-row__label">{leaf.label}</span>
      </button>
    ) : (
      /* Read-only (listbox.md): shown so the catalogue is complete, not clickable. */
      <div key={leaf.key} role="menuitem" aria-disabled="true" className="acm-row acm-row--readonly" onMouseEnter={onEnter}>
        <span className="acm-row__icon">{leaf.icon}</span>
        <span className="acm-row__label">{leaf.label}</span>
      </div>
    )

  const parentRow = (which: Sub, label: string, icon: ReactNode, items: Leaf[]) => (
    <div className="acm-has-sub" onMouseEnter={() => openSub(which)} onMouseLeave={scheduleCloseSub}>
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={sub === which}
        className={`acm-row${sub === which ? ' acm-row--open' : ''}`}
        onClick={() => (sub === which ? setSub(null) : openSub(which))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSub(which) }
          if (e.key === 'ArrowLeft') setSub(null)
        }}
      >
        <span className="acm-row__icon">{icon}</span>
        <span className="acm-row__label">{label}</span>
        <ArrowRight2 className="acm-row__chevron" size={16} color="var(--text-primary)" variant="Linear" />
      </button>

      <AnimatePresence>
        {sub === which && (
          <motion.div
            ref={subRef}
            className={`acm-panel acm-submenu acm-submenu--${subSide}`}
            style={{ width: SUB_W, marginTop: -subShift }}
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, x: reduce ? 0 : subSide === 'right' ? -4 : 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
          >
            {items.map((leaf) => leafRow(leaf))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={rootRef}
          className="acm-panel acm-popover"
          style={{ left: pos.left, top: pos.top, width: MENU_W, transformOrigin: pos.openUp ? 'bottom left' : 'top left' }}
          role="menu"
          aria-label="Add content"
          initial={{ opacity: 0, y: reduce ? 0 : pos.openUp ? 4 : -4, scale: reduce ? 1 : 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
        >
          {/* Hovering a plain row closes any open flyout, so only one side list shows. */}
          {leafRow({ key: 'library', label: '5Mins Library', icon: <PlayCircle size={ICON} color={C} variant="Linear" />, action: { kind: 'library' } }, scheduleCloseSub)}
          {leafRow({ key: 'your-content', label: 'Your Content', icon: <DocumentUpload size={ICON} color={C} variant="Linear" />, action: UNBUILT }, scheduleCloseSub)}
          {leafRow({ key: 'scorm', label: 'SCORM', icon: <DirectboxNotif size={ICON} color={C} variant="Linear" />, action: { kind: 'scorm' } }, scheduleCloseSub)}
          {leafRow({ key: 'embed', label: 'Embed Links', icon: <Link2 size={ICON} color={C} variant="Linear" />, action: UNBUILT }, scheduleCloseSub)}
          {leafRow({ key: 'events', label: 'Events', icon: <CalendarEdit size={ICON} color={C} variant="Linear" />, action: UNBUILT }, scheduleCloseSub)}
          {parentRow('situational', 'Situational Tests', <ClipboardText size={ICON} color={C} variant="Linear" />, SITUATIONAL)}
          {parentRow('assessments', 'Assessments', <AssessmentIcon size={ICON} color={C} />, ASSESSMENTS)}
          {leafRow({ key: 'resources', label: 'Resources', icon: <DocumentText size={ICON} color={C} variant="Linear" />, action: { kind: 'resources' } }, scheduleCloseSub)}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default AddContentMenu
