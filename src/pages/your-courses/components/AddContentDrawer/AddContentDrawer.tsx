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
  SidebarRight,
} from 'iconsax-react'
import AddContentMenuItem from '../AddContentSidebar/AddContentMenuItem'
import AssessmentIcon from '../../../../components/icons/AssessmentIcon'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import '../../../my-team/CoursesDrawer.css'
import './AddContentDrawer.css'

const iconSize = 20
const iconColor = 'currentColor'

interface AddContentDrawerProps {
  open: boolean
  onClose: () => void
  onLibraryClick?: () => void
  onScormClick?: () => void
  onAssessmentClick?: (type: AssessmentType) => void
}

function AddContentDrawer({ open, onClose, onLibraryClick, onScormClick, onAssessmentClick }: AddContentDrawerProps) {
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setRendered(true)
      setClosing(false)
      return
    }
    if (!rendered) return
    setClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setRendered(false)
      setClosing(false)
      closeTimerRef.current = null
    }, 300)
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [open])

  useEffect(() => {
    if (!rendered) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [rendered, onClose])

  if (!rendered) return null

  const route = (fn?: () => void) => () => {
    fn?.()
    onClose()
  }

  return (
    <>
      <aside
        className={`side-drawer add-content-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-labelledby="add-content-drawer-title"
      >
        <div className="add-content-drawer__header">
          <h2 id="add-content-drawer-title" className="add-content-drawer__title">Add Content</h2>
          <button
            type="button"
            className="add-content-drawer__close"
            onClick={onClose}
            aria-label="Hide add content panel"
          >
            <SidebarRight size={16} color="currentColor" variant="Linear" />
          </button>
        </div>
        <div className="add-content-drawer__menu">
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
          <AddContentMenuItem
            icon={<AssessmentIcon size={iconSize} color={iconColor} />}
            label="Assessments"
            hasDropdown
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
          </AddContentMenuItem>
          <AddContentMenuItem
            icon={<DocumentText size={iconSize} color={iconColor} variant="Linear" />}
            label="Resources"
          />
        </div>
      </aside>
    </>
  )
}

export default AddContentDrawer
