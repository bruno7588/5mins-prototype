import { useState } from 'react'
import Button from '@/components/Button/Button'
import Table, { type Column } from '@/components/Table/Table'
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

  /* DS Table (table.md): thumbnail + text cell, text cell, then a button cell. */
  const columns: Column<ScormFile>[] = [
    {
      key: 'fileName',
      header: 'File name',
      width: '1 1 auto',
      render: (f) => (
        <span className="tbl-media">
          <span className="tbl-thumb" style={{ background: f.thumbColor }} />
          <span className="sc-scorm-drawer-filename">{f.fileName}</span>
        </span>
      ),
    },
    { key: 'type', header: 'Type', width: '0 0 96px', render: (f) => f.type },
    {
      key: 'action',
      header: '',
      width: '0 0 96px',
      align: 'right',
      render: (f) =>
        addedIds.has(f.id) ? (
          <Button size="sm" variant="outlined" onClick={() => onRemove(f.id)}>
            Remove
          </Button>
        ) : (
          <Button size="sm" onClick={() => onAdd(f)}>
            Add
          </Button>
        ),
    },
  ]

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

        <Table columns={columns} rows={filtered} getRowKey={(f) => String(f.id)} />
      </aside>
    </div>
  )
}

export default ScormDrawer
