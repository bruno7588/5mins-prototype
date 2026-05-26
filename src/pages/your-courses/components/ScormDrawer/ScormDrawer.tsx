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

interface ContentProps {
  onClose: () => void
  addedIds: Set<number>
  onAdd: (file: ScormFile) => void
  onRemove: (id: number) => void
}

/* Inner content only — no overlay/shell. Mount inside a shared drawer shell
   (see ContentDrawer) so swapping between content types doesn't re-animate. */
export function ScormDrawerContent({ onClose, addedIds, onAdd, onRemove }: ContentProps) {
  const [search, setSearch] = useState('')

  const filtered = scormFiles.filter((f) =>
    f.fileName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <CloseButton onClick={onClose} className="scorm-drawer-close" />

      <div className="scorm-drawer-header">
        <h3 className="scorm-drawer-title">Add SCORM files</h3>
        <p className="scorm-drawer-subtitle">
          Add from the list of SCORM files you've already published.{' '}
          <a className="scorm-drawer-upload-link" href="#">Upload New SCORM</a>
        </p>
      </div>

      <div className="scorm-drawer-search">
        <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
        <input
          type="text"
          placeholder="Search in your content library"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="scorm-drawer-table">
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
                <div className="scorm-drawer-file">
                  <div className="scorm-drawer-thumb" style={{ background: file.thumbColor }} />
                  <span className="scorm-drawer-filename">{file.fileName}</span>
                </div>
              </td>
              <td className="scorm-drawer-type">{file.type}</td>
              <td>
                {addedIds.has(file.id) ? (
                  <button className="scorm-drawer-btn scorm-drawer-btn--remove" onClick={() => onRemove(file.id)}>
                    Remove
                  </button>
                ) : (
                  <button className="scorm-drawer-btn scorm-drawer-btn--add" onClick={() => onAdd(file)}>
                    Add
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
