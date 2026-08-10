import { useState } from 'react'
import Button from '@/components/Button/Button'
import Table, { type Column } from '@/components/Table/Table'
import { SearchNormal1 } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import thumb1 from '@/assets/programs/course-thumbs/course-thumb-1.jpg'
import thumb2 from '@/assets/programs/course-thumbs/course-thumb-2.jpg'
import thumb3 from '@/assets/programs/course-thumbs/course-thumb-3.jpg'
import thumb4 from '@/assets/programs/course-thumbs/course-thumb-4.jpg'
import './ScormDrawer.css'

export interface ScormFile {
  id: number
  fileName: string
  type: string
  thumbColor: string
  thumbnail: string
}

export const scormFiles: ScormFile[] = [
  {
    id: 1,
    fileName: 'Understanding the Software Development Life Cycle',
    type: 'SCORM',
    thumbColor: 'linear-gradient(135deg, #5a7fbf, #4a6fa8)',
    thumbnail: thumb1,
  },
  {
    id: 2,
    fileName: 'Exploring the Stages of Software Development',
    type: 'SCORM',
    thumbColor: 'linear-gradient(135deg, #e6a04c, #d08a3a)',
    thumbnail: thumb2,
  },
  {
    id: 3,
    fileName: 'Navigating the Software Development Life Cycle',
    type: 'SCORM',
    thumbColor: 'linear-gradient(135deg, #8b6fd4, #7558c0)',
    thumbnail: thumb3,
  },
  {
    id: 4,
    fileName: 'Key Concepts in Software Development Life Cycle',
    type: 'SCORM',
    thumbColor: 'linear-gradient(135deg, #00a5b5, #008c9a)',
    thumbnail: thumb4,
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

  /* DS Table (table.md): thumbnail + text cell, text cell, then a button cell. */
  const columns: Column<ScormFile>[] = [
    {
      key: 'fileName',
      header: 'File name',
      width: '1 1 auto',
      render: (f) => (
        <span className="tbl-media">
          <span className="tbl-thumb" style={{ backgroundImage: `url(${f.thumbnail})` }} />
          <span className="scorm-drawer-filename">{f.fileName}</span>
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
    <>
      <div className="scorm-drawer-header">
        <div className="scorm-drawer-headline">
          <h3 className="scorm-drawer-title">Add SCORM files</h3>
          <p className="scorm-drawer-subtitle">
            Add from the list of SCORM files you've already published.{' '}
            <span className="scorm-drawer-upload-link ui-disabled" aria-disabled="true">Upload New SCORM</span>
          </p>
        </div>
        <CloseButton onClick={onClose} className="scorm-drawer-close" />
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

      <Table columns={columns} rows={filtered} getRowKey={(f) => String(f.id)} />
    </>
  )
}
