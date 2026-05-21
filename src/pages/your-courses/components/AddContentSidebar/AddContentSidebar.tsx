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
  onAssessmentClick?: (type: AssessmentType) => void
  onLibraryClick?: () => void
}

function AddContentSidebar({ addedScormIds, onAddScorm, onRemoveScorm, collapsed, onAssessmentClick, onLibraryClick }: AddContentSidebarProps) {
  const [showScormDrawer, setShowScormDrawer] = useState(false)

  return (
    <aside className={`add-content-sidebar${collapsed ? ' add-content-sidebar--collapsed' : ''}`}>
      {!collapsed && <h4 className="add-content-sidebar-title">Add Content</h4>}

      <AddContentMenuItem
        icon={<Book1 size={iconSize} color={iconColor} variant="Linear" />}
        label="5Mins Library"
        onClick={onLibraryClick}
        collapsed={collapsed}
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
        label="SCORM"
        onClick={() => setShowScormDrawer(true)}
        collapsed={collapsed}
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

      {showScormDrawer && (
        <ScormDrawer
          onClose={() => setShowScormDrawer(false)}
          addedIds={addedScormIds}
          onAdd={onAddScorm}
          onRemove={onRemoveScorm}
        />
      )}
    </aside>
  )
}

export default AddContentSidebar
