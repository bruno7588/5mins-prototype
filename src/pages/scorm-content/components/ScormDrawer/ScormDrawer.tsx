import { useState } from 'react'
import { SearchNormal1 } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import './ScormDrawer.css'

export interface ScormFile {
  id: number
  fileName: string
  type: string
  thumbColor: string
}

export const scormFiles: ScormFile[] = [
  {
    id: 1,
    fileName: 'Understanding the Software Development Life Cycle',
    type: 'SCORM',
    thumbColor: 'linear-gradient(135deg, #5a7fbf, #4a6fa8)',
  },
  {
    id: 2,
    fileName: 'Exploring the Stages of Software Development',
    type: 'SCORM',
    thumbColor: 'linear-gradient(135deg, #e6a04c, #d08a3a)',
  },
  {
    id: 3,
    fileName: 'Navigating the Software Development Life Cycle',
    type: 'SCORM',
    thumbColor: 'linear-gradient(135deg, #8b6fd4, #7558c0)',
  },
  {
    id: 4,
    fileName: 'Key Concepts in Software Development Life Cycle',
    type: 'SCORM',
    thumbColor: 'linear-gradient(135deg, #00a5b5, #008c9a)',
  },
]

interface ScormDrawerProps {
  onClose: () => void
  addedIds: Set<number>
  onAdd: (file: ScormFile) => void
  onRemove: (id: number) => void
}

function ScormDrawer({ onClose, addedIds, onAdd, onRemove }: ScormDrawerProps) {
  const [search, setSearch] = useState('')
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 300)
  }

  const filtered = scormFiles.filter((f) =>
    f.fileName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={`sc-scorm-drawer-overlay${closing ? ' sc-scorm-drawer-overlay--closing' : ''}`} onClick={handleClose}>
      <aside className={`sc-scorm-drawer${closing ? ' sc-scorm-drawer--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <CloseButton onClick={handleClose} className="sc-scorm-drawer-close" />

        {/* Header */}
        <div className="sc-scorm-drawer-header">
          <h3 className="sc-scorm-drawer-title">Add SCORM files</h3>
          <p className="sc-scorm-drawer-subtitle">
            Add from the list of SCORM files you've already published.{' '}
            <span className="sc-scorm-drawer-upload-link ui-disabled" aria-disabled="true">Upload New SCORM</span>
          </p>
        </div>

        {/* Search */}
        <div className="sc-scorm-drawer-search">
          <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
          <input
            type="text"
            placeholder="Search in your content library"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <table className="sc-scorm-drawer-table">
          <thead>
            <tr>
              <th>File name</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((file) => (
              <tr key={file.id}>
                <td>
                  <div className="sc-scorm-drawer-file">
                    <div className="sc-scorm-drawer-thumb" style={{ background: file.thumbColor }} />
                    <span className="sc-scorm-drawer-filename">{file.fileName}</span>
                  </div>
                </td>
                <td className="sc-scorm-drawer-type">{file.type}</td>
                <td>
                  {addedIds.has(file.id) ? (
                    <button className="sc-scorm-drawer-btn sc-scorm-drawer-btn--remove" onClick={() => onRemove(file.id)}>
                      Remove
                    </button>
                  ) : (
                    <button className="sc-scorm-drawer-btn sc-scorm-drawer-btn--add" onClick={() => onAdd(file)}>
                      Add
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>
    </div>
  )
}

export default ScormDrawer
