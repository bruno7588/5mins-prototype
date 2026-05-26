import {
  Book1,
  FolderOpen,
  Link1,
  DocumentCode,
  Calendar,
  Edit,
  DocumentText,
  MessageText,
  Text,
  ClipboardText,
  Chart,
} from 'iconsax-react'
import AddContentMenuItem from './AddContentMenuItem'
import './AddContentSidebar.css'

const iconSize = 20
const iconColor = 'currentColor'

export type AssessmentType = 'multiple-choice' | 'short-text' | 'exercise' | 'poll'
export type ActiveDrawer = 'library' | 'scorm' | null

interface AddContentSidebarProps {
  collapsed?: boolean
  activeDrawer?: ActiveDrawer
  onAssessmentClick?: (type: AssessmentType) => void
  onLibraryClick?: () => void
  onScormClick?: () => void
}

function AddContentSidebar({ collapsed, activeDrawer = null, onAssessmentClick, onLibraryClick, onScormClick }: AddContentSidebarProps) {
  return (
    <aside className={`add-content-sidebar${collapsed ? ' add-content-sidebar--collapsed' : ''}`}>
      {!collapsed && <h4 className="add-content-sidebar-title">Add Content</h4>}

      <AddContentMenuItem
        icon={<Book1 size={iconSize} color={iconColor} variant="Linear" />}
        activeIcon={<Book1 size={iconSize} color={iconColor} variant="Bold" />}
        label="5Mins Library"
        onClick={onLibraryClick}
        collapsed={collapsed}
        active={activeDrawer === 'library'}
      />
      <AddContentMenuItem
        icon={<FolderOpen size={iconSize} color={iconColor} variant="Linear" />}
        label="Your Content"
        collapsed={collapsed}
      />
      <AddContentMenuItem
        icon={<Link1 size={iconSize} color={iconColor} variant="Linear" />}
        label="Embed Links"
        collapsed={collapsed}
      />
      <AddContentMenuItem
        icon={<DocumentCode size={iconSize} color={iconColor} variant="Linear" />}
        activeIcon={<DocumentCode size={iconSize} color={iconColor} variant="Bold" />}
        label="SCORM"
        onClick={onScormClick}
        collapsed={collapsed}
        active={activeDrawer === 'scorm'}
      />
      <AddContentMenuItem
        icon={<Calendar size={iconSize} color={iconColor} variant="Linear" />}
        label="Events"
        collapsed={collapsed}
      />
      <AddContentMenuItem
        icon={<Edit size={iconSize} color={iconColor} variant="Linear" />}
        label="Assessments"
        hasDropdown
        collapsed={collapsed}
      >
        <AddContentMenuItem
          icon={<MessageText size={iconSize} color={iconColor} variant="Linear" />}
          label="Multiple Choice"
          onClick={() => onAssessmentClick?.('multiple-choice')}
        />
        <AddContentMenuItem
          icon={<Text size={iconSize} color={iconColor} variant="Linear" />}
          label="Short Text"
          onClick={() => onAssessmentClick?.('short-text')}
        />
        <AddContentMenuItem
          icon={<ClipboardText size={iconSize} color={iconColor} variant="Linear" />}
          label="Exercise"
          onClick={() => onAssessmentClick?.('exercise')}
        />
        <AddContentMenuItem
          icon={<Chart size={iconSize} color={iconColor} variant="Linear" />}
          label="Poll"
          onClick={() => onAssessmentClick?.('poll')}
        />
      </AddContentMenuItem>
      <AddContentMenuItem
        icon={<DocumentText size={iconSize} color={iconColor} variant="Linear" />}
        label="Resources"
        collapsed={collapsed}
      />

    </aside>
  )
}

export default AddContentSidebar
