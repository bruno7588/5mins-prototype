import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  PlayCircle,
  DocumentUpload,
  DirectboxNotif,
  Link2,
  CalendarEdit,
  DocumentText,
  MessageText,
  Text,
  ClipboardText,
  Chart,
  ArrowRight2,
} from 'iconsax-react'
import AssessmentIcon from '../../../../components/icons/AssessmentIcon'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import './AddContentMenu.css'

export type AddContentKind =
  | 'library'
  | 'your-content'
  | 'scorm'
  | 'embed'
  | 'events'
  | 'resources'
  | AssessmentType

const ICON = 20
const C = 'currentColor'
const GAP = 6
const MENU_W = 238 // matches Figma 8695:16349
const SUB_W = 200

interface AddContentMenuProps {
  open: boolean
  anchor: HTMLElement | null
  onClose: () => void
  onSelect: (kind: AddContentKind) => void
}

/* Anchored dropdown that replaces the old "Add Content" picker drawer. Opens under the
   clicked trigger; the Assessments row reveals a side-by-side flyout on hover. Selecting
   a leaf closes the menu and lets the page open the matching content drawer.
   Per Figma 8695:16349 (menu) + 8695:16555 (assessment submenu). Light treatment to
   match this project's overlay convention. */
function AddContentMenu({ open, anchor, onClose, onSelect }: AddContentMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const subWrapRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)
  const [pos, setPos] = useState({ left: 0, top: 0, openUp: false })
  const [subOpen, setSubOpen] = useState(false)
  const [subSide, setSubSide] = useState<'right' | 'left'>('right')

  // Position the popover relative to the trigger, flipping up / shifting in when it
  // would overflow the viewport. Recomputed on scroll + resize while open.
  useLayoutEffect(() => {
    if (!open || !anchor) return
    const compute = () => {
      const r = anchor.getBoundingClientRect()
      const menuH = rootRef.current?.offsetHeight ?? 360
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
      setSubSide(left + MENU_W + 8 + SUB_W > window.innerWidth - 8 ? 'left' : 'right')
    }
    compute()
    window.addEventListener('resize', compute)
    window.addEventListener('scroll', compute, true)
    return () => {
      window.removeEventListener('resize', compute)
      window.removeEventListener('scroll', compute, true)
    }
  }, [open, anchor])

  // Reset the submenu whenever the menu (re)opens.
  useEffect(() => {
    if (!open) setSubOpen(false)
  }, [open])

  // Dismiss on outside click / Escape.
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
  const openSub = () => { clearCloseTimer(); setSubOpen(true) }
  const scheduleCloseSub = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setSubOpen(false), 140)
  }
  useEffect(() => () => clearCloseTimer(), [])

  if (!open) return null

  const pick = (kind: AddContentKind) => () => { onSelect(kind); onClose() }

  const Row = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button type="button" role="menuitem" className="add-content-menu-item acm-row" onClick={onClick}>
      <span className="add-content-menu-item-icon">{icon}</span>
      <span className="add-content-menu-item-label">{label}</span>
    </button>
  )

  return createPortal(
    <div
      ref={rootRef}
      className={`acm-popover${pos.openUp ? ' acm-popover--up' : ''}`}
      style={{ left: pos.left, top: pos.top, width: MENU_W }}
      role="menu"
      aria-label="Add content"
    >
      <Row icon={<PlayCircle size={ICON} color={C} variant="Linear" />} label="5Mins Library" onClick={pick('library')} />
      <Row icon={<DocumentUpload size={ICON} color={C} variant="Linear" />} label="Your Content" onClick={pick('your-content')} />
      <Row icon={<DirectboxNotif size={ICON} color={C} variant="Linear" />} label="SCORM" onClick={pick('scorm')} />
      <Row icon={<Link2 size={ICON} color={C} variant="Linear" />} label="Embed Links" onClick={pick('embed')} />
      <Row icon={<CalendarEdit size={ICON} color={C} variant="Linear" />} label="Events" onClick={pick('events')} />

      <div ref={subWrapRef} className="acm-has-sub" onMouseEnter={openSub} onMouseLeave={scheduleCloseSub}>
        <button
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={subOpen}
          className={`add-content-menu-item acm-row acm-row--sub${subOpen ? ' acm-row--open' : ''}`}
          onClick={() => setSubOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSub() }
            if (e.key === 'ArrowLeft') setSubOpen(false)
          }}
        >
          <span className="add-content-menu-item-icon"><AssessmentIcon size={ICON} color={C} /></span>
          <span className="add-content-menu-item-label">Assessments</span>
          <ArrowRight2 size={16} color="var(--text-tertiary)" variant="Linear" />
        </button>

        {subOpen && (
          <div className={`acm-submenu acm-submenu--${subSide}`} role="menu" aria-label="Assessment type">
            <Row icon={<MessageText size={ICON} color={C} variant="Linear" />} label="Single Choice" onClick={pick('single-choice')} />
            <Row icon={<Text size={ICON} color={C} variant="Linear" />} label="Short Text" onClick={pick('short-text')} />
            <Row icon={<ClipboardText size={ICON} color={C} variant="Linear" />} label="Exercise" onClick={pick('exercise')} />
            <Row icon={<Chart size={ICON} color={C} variant="Linear" />} label="Poll" onClick={pick('poll')} />
          </div>
        )}
      </div>

      <Row icon={<DocumentText size={ICON} color={C} variant="Linear" />} label="Resources" onClick={pick('resources')} />
    </div>,
    document.body,
  )
}

export default AddContentMenu
