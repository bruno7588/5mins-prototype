import { useState } from 'react'
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
import ScormDrawer, { type ScormFile } from '../ScormDrawer/ScormDrawer'
import './AddContentSidebar.css'

const iconSize = 20
const iconColor = 'currentColor'

export type AssessmentType = 'multiple-choice' | 'short-text' | 'exercise' | 'poll'

interface AddContentSidebarProps {
  addedScormIds: Set<number>
  onAddScorm: (file: ScormFile) => void
  onRemoveScorm: (id: number) => void
  collapsed?: boolean
  libraryDrawerOpen?: boolean
  onAssessmentClick?: (type: AssessmentType) => void
  onLibraryClick?: () => void
}

function AddContentSidebar({ addedScormIds, onAddScorm, onRemoveScorm, collapsed, libraryDrawerOpen, onAssessmentClick, onLibraryClick }: AddContentSidebarProps) {
  const [showScormDrawer, setShowScormDrawer] = useState(false)

  // Self-collapse when the internal SCORM drawer opens, so the drawer has space and
  // the sidebar shows icons-only on the right edge.
  const isCollapsed = collapsed || showScormDrawer

  return (
    <aside className={`add-content-sidebar${isCollapsed ? ' add-content-sidebar--collapsed' : ''}`}>
      {!isCollapsed && <h4 className="add-content-sidebar-title">Add Content</h4>}

      <AddContentMenuItem
        icon={<Book1 size={iconSize} color={iconColor} variant="Linear" />}
        activeIcon={<Book1 size={iconSize} color={iconColor} variant="Bold" />}
        label="5Mins Library"
        onClick={onLibraryClick}
        collapsed={isCollapsed}
        active={libraryDrawerOpen}
      />
      <AddContentMenuItem
        icon={<FolderOpen size={iconSize} color={iconColor} variant="Linear" />}
        label="Your Content"
        collapsed={isCollapsed}
      />
      <AddContentMenuItem
        icon={<Link1 size={iconSize} color={iconColor} variant="Linear" />}
        label="Embed Links"
        collapsed={isCollapsed}
      />
      <AddContentMenuItem
        icon={<DocumentCode size={iconSize} color={iconColor} variant="Linear" />}
        activeIcon={<DocumentCode size={iconSize} color={iconColor} variant="Bold" />}
        label="SCORM"
        onClick={() => setShowScormDrawer(true)}
        collapsed={isCollapsed}
        active={showScormDrawer}
      />
      <AddContentMenuItem
        icon={<Calendar size={iconSize} color={iconColor} variant="Linear" />}
        label="Events"
        collapsed={isCollapsed}
      />
      <AddContentMenuItem
        icon={<Edit size={iconSize} color={iconColor} variant="Linear" />}
        label="Assessments"
        hasDropdown
        collapsed={isCollapsed}
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
        collapsed={isCollapsed}
      />

      {showScormDrawer && (
        <ScormDrawer
          onClose={() => setShowScormDrawer(false)}
          addedIds={addedScormIds}
          onAdd={onAddScorm}
          onRemove={onRemoveScorm}
          withSidebar
        />
      )}
    </aside>
  )
}

export default AddContentSidebar
