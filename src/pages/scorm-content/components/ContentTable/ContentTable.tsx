import { useCallback, useEffect, useRef, useState } from 'react'
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
  ArrowLeft2,
  ArrowRight2,
} from 'iconsax-react'
import AddScormModal from '../../../../components/AddScormModal/AddScormModal'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import MoreIcon from '../../../../components/icons/MoreIcon'
import './ContentTable.css'

interface ContentRow {
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
    fileName: 'Mastering the Software Development Life Cycle: A Comprehensive SCORM Guide',
    type: 'SCORM',
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
}

function ContentTable({ variant = 'lessons' }: ContentTableProps) {
  const isScorm = variant === 'scorm'
  const [lessons, setLessons] = useState(lessonRows)
  const [scorm, setScorm] = useState(scormRows)
  const rows = isScorm ? scorm : lessons
  const setRows = isScorm ? setScorm : setLessons

  const [showAddScorm, setShowAddScorm] = useState(false)
  const [editScormRow, setEditScormRow] = useState<ContentRow | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [previewRow, setPreviewRow] = useState<ContentRow | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Sticky first column: flag when the table is horizontally scrolled
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setIsScrolled(scrollRef.current.scrollLeft > 0)
  }, [])

  useEffect(() => {
    if (menuOpenId === null) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpenId])

  const startEditing = (row: ContentRow) => {
    setEditingId(row.id)
    setEditValue(row.fileName)
    setTimeout(() => editInputRef.current?.select(), 0)
  }

  const saveEdit = () => {
    if (editingId === null) return
    const trimmed = editValue.trim()
    if (trimmed) {
      setRows(prev => prev.map(r => r.id === editingId ? { ...r, fileName: trimmed } : r))
    }
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  return (
    <div className="sc-content-table-wrapper">
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
        <div className="sc-content-table-preview-overlay">
          <CloseButton onClick={() => setPreviewRow(null)} size={32} className="sc-content-table-preview-close" />
          <div className="sc-content-table-preview-content">
            <h2 className="sc-content-table-preview-title">{previewRow.fileName}</h2>
            <div className="sc-content-table-preview-divider" />
            <div className="sc-content-table-preview-frame">
              <p className="sc-content-table-preview-placeholder-text">SCORM content preview will load here</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="sc-content-table-filters">
        <span className="sc-content-table-filter-label">Show content from</span>
        <button className="sc-content-table-filter-dropdown ui-disabled" disabled>
          <Setting4 size={16} color="var(--text-primary)" variant="Linear" />
          All
          <ArrowDown2 size={12} color="var(--text-tertiary)" />
        </button>

        <div className="sc-content-table-search">
          <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
          <input type="text" placeholder={isScorm ? 'Search SCORM files' : 'Search content'} />
        </div>

        <button className="sc-content-table-add-btn" onClick={isScorm ? () => setShowAddScorm(true) : undefined}>
          <Add size={20} color="currentColor" />
          {isScorm ? 'Add SCORM' : 'Add Content'}
        </button>
      </div>

      {/* Table — horizontal scroll wrapper keeps the first column pinned */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`sc-content-table-scroll${isScrolled ? ' sc-content-table-scroll--scrolled' : ''}`}
      >
        <table className="sc-content-table">
          <thead>
            <tr>
              <th>File name</th>
              <th>Type</th>
              <th>Uploaded by</th>
              <th className="col-sort">
                Updated at
                <span className="sort-indicator">
                  <ArrowDown2 size={14} color="var(--text-secondary)" />
                </span>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="sc-content-table-file">
                    <div className="sc-content-table-thumb">
                      <div
                        className="sc-content-table-thumb-img"
                        style={{ background: row.thumbColor, borderRadius: 'var(--radius-s)' }}
                      />
                    </div>
                    {!isScorm && editingId === row.id ? (
                      <input
                        ref={editInputRef}
                        className="sc-content-table-filename-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`sc-content-table-filename${isScorm ? ' sc-content-table-filename--clickable' : ' sc-content-table-filename--editable'}`}
                        onClick={() => isScorm ? setEditScormRow(row) : startEditing(row)}
                        title={isScorm ? 'Click to edit SCORM' : 'Click to edit'}
                      >
                        {row.fileName}
                      </span>
                    )}
                  </div>
                </td>
                <td className="sc-content-table-type">{row.type}</td>
                <td className="sc-content-table-uploader">{row.uploadedBy}</td>
                <td className="sc-content-table-date">{row.updatedAt}</td>
                <td>
                  <div className="sc-content-table-actions">
                    {isScorm && (
                      <button className="sc-content-table-action-btn" aria-label="Preview" onClick={() => setPreviewRow(row)}>
                        <Eye size={20} color="var(--text-tertiary)" variant="Linear" />
                      </button>
                    )}
                    {!isScorm && (
                      <button className="sc-content-table-action-btn ui-disabled" aria-label="Share (coming soon)" disabled>
                        <ExportSquare size={20} color="var(--text-tertiary)" variant="Linear" />
                      </button>
                    )}
                    <div className="sc-content-table-more-wrapper" ref={menuOpenId === row.id ? menuRef : undefined}>
                      <button
                        className="sc-content-table-action-btn"
                        aria-label="More options"
                        onClick={() => setMenuOpenId(menuOpenId === row.id ? null : row.id)}
                      >
                        <MoreIcon size={20} color="var(--text-tertiary)" />
                      </button>
                      {menuOpenId === row.id && (
                        <div className="sc-content-table-menu">
                          <button
                            className="sc-content-table-menu-item"
                            onClick={() => { setMenuOpenId(null); setEditScormRow(row) }}
                          >
                            <Edit2 size={20} color="var(--text-primary)" variant="Linear" />
                            Edit SCORM
                          </button>
                          <button className="sc-content-table-menu-item ui-disabled" disabled>
                            <EyeSlash size={20} color="var(--text-primary)" variant="Linear" />
                            Hide
                          </button>
                          <button
                            className="sc-content-table-menu-item sc-content-table-menu-item--danger"
                            onClick={() => {
                              setMenuOpenId(null)
                              setRows(prev => prev.filter(r => r.id !== row.id))
                            }}
                          >
                            <Trash size={20} color="var(--danger-500)" variant="Linear" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="sc-content-table-pagination">
        <span className="sc-content-table-pagination-text">1-10 of 28</span>
        <button className="sc-content-table-pagination-btn sc-content-table-pagination-btn--disabled" aria-label="Previous page">
          <ArrowLeft2 size={16} color="var(--text-tertiary)" />
        </button>
        <button className="sc-content-table-pagination-btn" aria-label="Next page">
          <ArrowRight2 size={16} color="var(--text-tertiary)" />
        </button>
      </div>
    </div>
  )
}

export default ContentTable
