import { useState } from 'react'
import {
  Book1,
  FolderOpen,
  Link1,
  DocumentCode,
  Calendar,
  Edit,
  DocumentText,
} from 'iconsax-react'
import AddContentMenuItem from './AddContentMenuItem'
import ScormDrawer, { type ScormFile } from '../ScormDrawer/ScormDrawer'
import './AddContentSidebar.css'

const iconSize = 20
const iconColor = 'currentColor'

interface AddContentSidebarProps {
  addedScormIds: Set<number>
  onAddScorm: (file: ScormFile) => void
  onRemoveScorm: (id: number) => void
}

function AddContentSidebar({ addedScormIds, onAddScorm, onRemoveScorm }: AddContentSidebarProps) {
  const [showScormDrawer, setShowScormDrawer] = useState(false)

  return (
    <aside className="sc-add-content-sidebar">
      <h4 className="sc-add-content-sidebar-title">Add Content</h4>

      <AddContentMenuItem
        icon={<Book1 size={iconSize} color={iconColor} variant="Linear" />}
        label="5Mins Library"
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
        onClick={() => setShowScormDrawer(true)}
      />
      <AddContentMenuItem
        icon={<Calendar size={iconSize} color={iconColor} variant="Linear" />}
        label="Events"
      />
      <AddContentMenuItem
        icon={<Edit size={iconSize} color={iconColor} variant="Linear" />}
        label="Assessments"
        hasDropdown
      />
      <AddContentMenuItem
        icon={<DocumentText size={iconSize} color={iconColor} variant="Linear" />}
        label="Resources"
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
