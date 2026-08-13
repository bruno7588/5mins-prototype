import { useEffect, useState } from 'react'
import {
  SearchNormal1,
  Add,
  Setting4,
  ArrowDown2,
  ExportSquare,
  Eye,
  EyeSlash,
  Edit2,
  Trash,
} from 'iconsax-react'
import Table, { type Column } from '@/components/Table/Table'
import RowActionsMenu, { type RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import AddScormModal from '../../../../components/AddScormModal/AddScormModal'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import './ContentTable.css'

export interface ContentRow {
  id: number
  fileName: string
  type: string
  uploadedBy: string
  updatedAt: string
  thumbColor: string
}

const lessonRows: ContentRow[] = [
  {
    id: 1,
    fileName: 'Software Development Life Cycle Policy',
    type: 'Audio',
    uploadedBy: 'Anthony Wallace',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #e74c6f, #c94080)',
  },
  {
    id: 2,
    fileName: 'Mastering the Software Development Life Cycle: A Comprehensive Guide',
    type: 'PDF',
    uploadedBy: 'Oliver Bennett',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #2d8f6f, #1a6e5a)',
  },
  {
    id: 3,
    fileName: 'Understanding the Software Development Life Cycle',
    type: 'External Link',
    uploadedBy: 'Sophia Carter',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #5a7fbf, #4a6fa8)',
  },
  {
    id: 4,
    fileName: 'Exploring the Stages of Software Development',
    type: 'Video',
    uploadedBy: 'Liam Johnson',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #e6a04c, #d08a3a)',
  },
  {
    id: 5,
    fileName: 'Navigating the Software Development Life Cycle',
    type: 'PDF',
    uploadedBy: 'Emma Thompson',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #8b6fd4, #7558c0)',
  },
  {
    id: 6,
    fileName: 'Key Concepts in Software Development Life Cycle',
    type: 'Flashcards',
    uploadedBy: 'Noah Davis',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #00a5b5, #008c9a)',
  },
]

const scormRows: ContentRow[] = [
  {
    id: 1,
    fileName: 'Understanding the Software Development Life Cycle',
    type: 'SCORM',
    uploadedBy: 'Sophia Carter',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #5a7fbf, #4a6fa8)',
  },
  {
    id: 2,
    fileName: 'Exploring the Stages of Software Development',
    type: 'SCORM',
    uploadedBy: 'Liam Johnson',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #e6a04c, #d08a3a)',
  },
  {
    id: 3,
    fileName: 'Navigating the Software Development Life Cycle',
    type: 'SCORM',
    uploadedBy: 'Emma Thompson',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #8b6fd4, #7558c0)',
  },
  {
    id: 4,
    fileName: 'Key Concepts in Software Development Life Cycle',
    type: 'SCORM',
    uploadedBy: 'Noah Davis',
    updatedAt: 'Feb 14, 2025',
    thumbColor: 'linear-gradient(135deg, #00a5b5, #008c9a)',
  },
]

interface ContentTableProps {
  variant?: 'lessons' | 'scorm'
  onLessonClick?: (row: ContentRow) => void
  onAddContent?: () => void
  aiQuizReadyIds?: number[]
  addedLessons?: ContentRow[]
}

function ContentTable({ variant = 'lessons', onLessonClick, onAddContent, aiQuizReadyIds = [], addedLessons = [] }: ContentTableProps) {
  const isScorm = variant === 'scorm'
  const [lessons, setLessons] = useState(lessonRows)
  const [scorm, setScorm] = useState(scormRows)

  // Prepend newly published lessons to the table
  useEffect(() => {
    if (addedLessons.length === 0) return
    setLessons(prev => {
      const existingIds = new Set(prev.map(r => r.id))
      const newOnes = addedLessons.filter(r => !existingIds.has(r.id))
      if (newOnes.length === 0) return prev
      return [...newOnes, ...prev]
    })
  }, [addedLessons])
  const rows = isScorm ? scorm : lessons
  const setRows = isScorm ? setScorm : setLessons

  const [showAddScorm, setShowAddScorm] = useState(false)
  const [editScormRow, setEditScormRow] = useState<ContentRow | null>(null)
  const [previewRow, setPreviewRow] = useState<ContentRow | null>(null)
  const [dismissedTooltipIds, setDismissedTooltipIds] = useState<number[]>([])

  const menuItems: RowMenuItem[] = [
    {
      key: 'edit',
      label: isScorm ? 'Edit SCORM' : 'Edit lesson',
      icon: <Edit2 size={20} color="var(--text-primary)" variant="Linear" />,
    },
    { key: 'hide', label: 'Hide', icon: <EyeSlash size={20} color="var(--text-primary)" variant="Linear" />, disabled: true },
    { key: 'delete', label: 'Delete', icon: <Trash size={20} color="var(--danger-500)" variant="Linear" />, danger: true },
  ]

  /* DS Table (table.md): thumbnail + text, three text columns, actions cluster.
     The first column pins itself while the table scrolls horizontally. */
  const columns: Column<ContentRow>[] = [
    {
      key: 'fileName',
      header: 'File name',
      width: '1 1 320px',
      render: (row) => (
        <span className="tbl-media">
          <span className="tbl-thumb" style={{ background: row.thumbColor }} />
          <span
            className="qb-content-table-filename qb-content-table-filename--clickable"
            onClick={() => isScorm ? setEditScormRow(row) : onLessonClick?.(row)}
            title={isScorm ? 'Click to edit SCORM' : 'Click to edit lesson'}
          >
            {row.fileName}
          </span>
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '0 0 140px',
      render: (row) => <span className="qb-content-table-type">{row.type}</span>,
    },
    { key: 'uploadedBy', header: 'Uploaded by', width: '0 0 180px', render: (row) => row.uploadedBy },
    {
      key: 'updatedAt',
      // Arrow marks the column the list is already ordered by.
      header: (
        <span className="qb-content-table-sort">
          Updated at
          <ArrowDown2 size={14} color="var(--text-secondary)" />
        </span>
      ),
      width: '0 0 160px',
      render: (row) => row.updatedAt,
    },
    {
      key: 'actions',
      header: '',
      width: '0 0 120px',
      align: 'right',
      // The AI-quiz coachmark is anchored to the badge and opens leftward, so
      // this cell opts out of the ellipsis clip that would cut it off.
      cellClassName: 'is-overflow',
      render: (row) => (
        <span className="qb-content-table-actions">
          {isScorm && (
            <button className="qb-content-table-action-btn" aria-label="Preview" onClick={() => setPreviewRow(row)}>
              <Eye size={20} color="var(--text-tertiary)" variant="Linear" />
            </button>
          )}
          {!isScorm && aiQuizReadyIds.includes(row.id) && (
            <span className="qb-content-table-ai-badge-wrapper">
              {!dismissedTooltipIds.includes(row.id) && (
                <span className="qb-content-table-ai-tooltip">
                  <span className="qb-content-table-ai-tooltip-text">AI generated quizzes are ready for review</span>
                  <span className="qb-content-table-ai-tooltip-actions">
                    <button
                      className="qb-content-table-ai-tooltip-dismiss"
                      onClick={() => setDismissedTooltipIds(prev => [...prev, row.id])}
                    >
                      Dismiss
                    </button>
                    <button
                      className="qb-content-table-ai-tooltip-review"
                      onClick={() => {
                        setDismissedTooltipIds(prev => [...prev, row.id])
                        onLessonClick?.(row)
                      }}
                    >
                      Review Quiz
                    </button>
                  </span>
                  <span className="qb-content-table-ai-tooltip-arrow" />
                </span>
              )}
              <button
                className="qb-content-table-ai-badge"
                aria-label="AI quizzes ready for review"
                onClick={() => onLessonClick?.(row)}
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.6948 9.22578C13.0267 7.85703 14.9733 7.85703 15.3052 9.22578L16.2185 12.992C16.337 13.4807 16.7185 13.8622 17.2072 13.9807L20.9734 14.894C22.3422 15.2259 22.3422 17.1726 20.9734 17.5045L17.2072 18.4177C16.7185 18.5362 16.337 18.9178 16.2185 19.4064L15.3052 23.1727C14.9733 24.5414 13.0267 24.5414 12.6948 23.1727L11.7815 19.4064C11.663 18.9178 11.2815 18.5362 10.7928 18.4177L7.02656 17.5045C5.65781 17.1726 5.65781 15.2259 7.02656 14.894L10.7928 13.9807C11.2815 13.8622 11.663 13.4807 11.7815 12.992L12.6948 9.22578Z" fill="url(#sparkle-gradient)" />
                  <path d="M22.3705 6.71184C22.4795 6.26272 23.1182 6.26272 23.2271 6.71184L23.5268 7.94763C23.5657 8.10798 23.6909 8.23318 23.8512 8.27206L25.087 8.57172C25.5361 8.68062 25.5361 9.31938 25.087 9.42828L23.8512 9.72794C23.6909 9.76682 23.5657 9.89202 23.5268 10.0524L23.2271 11.2882C23.1182 11.7373 22.4795 11.7373 22.3705 11.2882L22.0709 10.0524C22.032 9.89202 21.9068 9.76682 21.7465 9.72794L20.5107 9.42828C20.0615 9.31938 20.0615 8.68062 20.5107 8.57172L21.7465 8.27206C21.9068 8.23318 22.032 8.10798 22.0709 7.94763L22.3705 6.71184Z" fill="url(#sparkle-gradient)" />
                  <defs>
                    <linearGradient id="sparkle-gradient" x1="5" y1="6" x2="26" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00AFC4" />
                      <stop offset="1" stopColor="#8158EC" />
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            </span>
          )}
          {!isScorm && !aiQuizReadyIds.includes(row.id) && (
            <button className="qb-content-table-action-btn ui-disabled" aria-label="Share (coming soon)" disabled>
              <ExportSquare size={20} color="var(--text-tertiary)" variant="Linear" />
            </button>
          )}
          <RowActionsMenu
            items={menuItems}
            ariaLabel="More options"
            triggerClassName="qb-content-table-action-btn"
            onSelect={(key) => {
              if (key === 'edit') {
                if (isScorm) setEditScormRow(row)
                else onLessonClick?.(row)
              }
              if (key === 'delete') setRows(prev => prev.filter(r => r.id !== row.id))
            }}
          />
        </span>
      ),
    },
  ]

  return (
    <div className="qb-content-table-wrapper">
      {showAddScorm && (
        <AddScormModal
          onClose={() => setShowAddScorm(false)}
          onPublish={(newName) => {
            const newRow: ContentRow = {
              id: Date.now(),
              fileName: newName || 'Untitled SCORM',
              type: 'SCORM',
              uploadedBy: 'You',
              updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              thumbColor: `linear-gradient(135deg, hsl(${Math.floor(Math.random() * 360)}, 50%, 50%), hsl(${Math.floor(Math.random() * 360)}, 50%, 40%))`,
            }
            setScorm(prev => [newRow, ...prev])
          }}
        />
      )}
      {editScormRow && (
        <AddScormModal
          editRow={{ id: editScormRow.id, fileName: editScormRow.fileName }}
          onClose={() => setEditScormRow(null)}
          onPreview={() => { setPreviewRow(editScormRow); setEditScormRow(null) }}
        />
      )}

      {/* Preview overlay */}
      {previewRow && (
        <div className="qb-content-table-preview-overlay">
          <CloseButton onClick={() => setPreviewRow(null)} size={32} className="qb-content-table-preview-close" />
          <div className="qb-content-table-preview-content">
            <h2 className="qb-content-table-preview-title">{previewRow.fileName}</h2>
            <div className="qb-content-table-preview-divider" />
            <div className="qb-content-table-preview-frame">
              <p className="qb-content-table-preview-placeholder-text">SCORM content preview will load here</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="qb-content-table-filters">
        <span className="qb-content-table-filter-label">Show content from</span>
        <button className="qb-content-table-filter-dropdown ui-disabled" disabled>
          <Setting4 size={16} color="var(--text-primary)" variant="Linear" />
          All
          <ArrowDown2 size={12} color="var(--text-tertiary)" />
        </button>

        <div className="qb-content-table-search">
          <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
          <input type="text" placeholder={isScorm ? 'Search SCORM files' : 'Search content'} />
        </div>

        <button className="qb-content-table-add-btn" onClick={isScorm ? () => setShowAddScorm(true) : onAddContent}>
          <Add size={20} color="currentColor" />
          {isScorm ? 'Add SCORM' : 'Add Content'}
        </button>
      </div>

      <Table
        columns={columns}
        rows={rows}
        getRowKey={(row) => String(row.id)}
        pagination={{ from: 1, to: rows.length, total: rows.length }}
      />
    </div>
  )
}

export default ContentTable
