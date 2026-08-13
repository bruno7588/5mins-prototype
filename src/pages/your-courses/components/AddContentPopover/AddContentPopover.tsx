import { useEffect, useRef, useState } from 'react'
import {
  Book1,
  FolderOpen,
  Link1,
  DocumentCode,
  Calendar,
  DocumentText,
  MessageText,
  Text,
  ClipboardText,
  Chart,
} from 'iconsax-react'
import AddContentMenuItem from '../AddContentSidebar/AddContentMenuItem'
import AssessmentIcon from '../../../../components/icons/AssessmentIcon'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import './AddContentPopover.css'

const iconSize = 20
const iconColor = 'currentColor'

interface AddContentPopoverProps {
  open: boolean
  onClose: () => void
  onLibraryClick?: () => void
  onScormClick?: () => void
  onAssessmentClick?: (type: AssessmentType) => void
}

/* Popover replica of the right sidebar — used as an inline alternative for the
   section-level "Add Content" button so the admin gets the same content-type
   choices without leaving the section context. Clicking an item closes the
   popover and routes to the corresponding drawer/modal. */
function AddContentPopover({ open, onClose, onLibraryClick, onScormClick, onAssessmentClick }: AddContentPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [assessmentOpen, setAssessmentOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  // Hover-driven submenu — open immediately on enter, close after a short grace period
  // so the user can move the cursor across the 4px gap between row and submenu.
  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }
  const openSubmenu = () => {
    cancelClose()
    setAssessmentOpen(true)
  }
  const scheduleCloseSubmenu = () => {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => setAssessmentOpen(false), 200)
  }
  useEffect(() => () => cancelClose(), [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  // Reset submenu state whenever the popover closes/reopens.
  useEffect(() => {
    if (!open) setAssessmentOpen(false)
  }, [open])

  if (!open) return null

  const route = (fn?: () => void) => () => {
    fn?.()
    onClose()
  }

  return (
    <div ref={ref} className="add-content-popover" role="menu">
      <AddContentMenuItem
        icon={<Book1 size={iconSize} color={iconColor} variant="Linear" />}
        label="5Mins Library"
        onClick={route(onLibraryClick)}
      />
      <AddContentMenuItem
        icon={<FolderOpen size={iconSize} color={iconColor} variant="Linear" />}
        label="Your Content"
      />
      <AddContentMenuItem
        icon={<Link1 size={iconSize} color={iconColor} variant="Linear" />}
        label="Embed Links"
      />
      <AddContentMenuItem
        icon={<DocumentCode size={iconSize} color={iconColor} variant="Linear" />}
        label="SCORM"
        onClick={route(onScormClick)}
      />
      <AddContentMenuItem
        icon={<Calendar size={iconSize} color={iconColor} variant="Linear" />}
        label="Events"
      />
      <div
        className="add-content-popover__submenu-anchor"
        onMouseEnter={openSubmenu}
        onMouseLeave={scheduleCloseSubmenu}
      >
        <button
          type="button"
          className="add-content-menu-item"
          aria-haspopup="menu"
          aria-expanded={assessmentOpen}
          onClick={() => setAssessmentOpen((v) => !v)}
          onFocus={openSubmenu}
        >
          <span className="add-content-menu-item-icon">
            <AssessmentIcon size={iconSize} color={iconColor} />
          </span>
          <span className="add-content-menu-item-label">Assessments</span>
          <svg
            className="add-content-popover__chevron"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4.5 3L7.5 6L4.5 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {assessmentOpen && (
          <div
            className="add-content-popover add-content-popover--submenu"
            role="menu"
            onMouseEnter={openSubmenu}
            onMouseLeave={scheduleCloseSubmenu}
          >
            <AddContentMenuItem
              icon={<MessageText size={iconSize} color={iconColor} variant="Linear" />}
              label="Single Choice"
              onClick={route(() => onAssessmentClick?.('single-choice'))}
            />
            <AddContentMenuItem
              icon={<Text size={iconSize} color={iconColor} variant="Linear" />}
              label="Short Text"
              onClick={route(() => onAssessmentClick?.('short-text'))}
            />
            <AddContentMenuItem
              icon={<ClipboardText size={iconSize} color={iconColor} variant="Linear" />}
              label="Exercise"
              onClick={route(() => onAssessmentClick?.('exercise'))}
            />
            <AddContentMenuItem
              icon={<Chart size={iconSize} color={iconColor} variant="Linear" />}
              label="Poll"
              onClick={route(() => onAssessmentClick?.('poll'))}
            />
          </div>
        )}
      </div>
      <AddContentMenuItem
        icon={<DocumentText size={iconSize} color={iconColor} variant="Linear" />}
        label="Resources"
      />
    </div>
  )
}

export default AddContentPopover
