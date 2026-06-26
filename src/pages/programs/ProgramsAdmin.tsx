import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Add, Copy, Edit2, Routing, Trash } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Search from '../../components/Search/Search'
import Table, { type Column } from '../../components/Table/Table'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import ProgramStatusBadge from './components/ProgramStatusBadge/ProgramStatusBadge'
import {
  deleteProgram,
  duplicateProgram,
  getAdminProgramRows,
  programLifecycle,
  type AdminProgramRow,
} from './programStore'
import './ProgramsAdmin.css'

const fmtDay = (iso: string) => {
  try {
    return `${new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},`
  } catch {
    return iso
  }
}
const fmtYear = (iso: string) => {
  try {
    return String(new Date(iso).getFullYear())
  } catch {
    return ''
  }
}

/** Row actions trigger — 3-dot menu icon per Figma. */
function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4.16667 8.33203C3.25 8.33203 2.5 9.08203 2.5 9.9987C2.5 10.9154 3.25 11.6654 4.16667 11.6654C5.08333 11.6654 5.83333 10.9154 5.83333 9.9987C5.83333 9.08203 5.08333 8.33203 4.16667 8.33203Z" fill="currentColor"/>
      <path d="M15.8332 8.33203C14.9165 8.33203 14.1665 9.08203 14.1665 9.9987C14.1665 10.9154 14.9165 11.6654 15.8332 11.6654C16.7498 11.6654 17.4998 10.9154 17.4998 9.9987C17.4998 9.08203 16.7498 8.33203 15.8332 8.33203Z" fill="currentColor"/>
      <path d="M10.0002 8.33203C9.0835 8.33203 8.3335 9.08203 8.3335 9.9987C8.3335 10.9154 9.0835 11.6654 10.0002 11.6654C10.9168 11.6654 11.6668 10.9154 11.6668 9.9987C11.6668 9.08203 10.9168 8.33203 10.0002 8.33203Z" fill="currentColor"/>
    </svg>
  )
}

function ProgramsAdmin() {
  const navigate = useNavigate()
  const { toasts, show } = useToast()
  const [rows, setRows] = useState<AdminProgramRow[]>(() => getAdminProgramRows())
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openMenuId) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openMenuId])

  const filtered = useMemo(
    () => rows.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase())),
    [rows, query],
  )

  const deletingProgram = rows.find((r) => r.id === confirmDeleteId) ?? null

  const handleDuplicate = (id: string) => {
    duplicateProgram(id)
    setRows(getAdminProgramRows())
    setOpenMenuId(null)
    show('success', 'Program duplicated')
  }

  const confirmDelete = () => {
    if (!confirmDeleteId) return
    deleteProgram(confirmDeleteId)
    setRows(getAdminProgramRows())
    setConfirmDeleteId(null)
    show('success', 'Program deleted')
  }

  const columns: Column<AdminProgramRow>[] = [
    {
      key: 'program',
      header: 'Program',
      render: (row) => (
        <span className="tbl-media">
          <span
            className="tbl-thumb"
            style={{ backgroundImage: row.image ? `url(${row.image})` : row.thumbnailGradient }}
          />
          <button
            type="button"
            className="programs-row-title"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/programs/${row.id}/overview`)
            }}
          >
            {row.title}
          </button>
        </span>
      ),
    },
    { key: 'learners', header: 'Learners', width: '0 0 120px', align: 'center', render: (row) => row.learnerCount },
    { key: 'courses', header: 'Courses', width: '0 0 120px', align: 'center', render: (row) => row.courseCount },
    {
      key: 'updated',
      header: 'Updated',
      width: '0 0 120px',
      render: (row) => (
        <span className="tbl-date">
          <span className="day">{fmtDay(row.updatedAt)}</span>
          <span className="year">{fmtYear(row.updatedAt)}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '0 0 140px',
      render: (row) => (
        <ProgramStatusBadge status={programLifecycle({ learnerCount: row.learnerCount, startsAt: row.startsAt })} />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '0 0 56px',
      render: (row) => (
        <div
          className={`programs-kebab${openMenuId === row.id ? ' programs-kebab--open' : ''}`}
          ref={openMenuId === row.id ? menuRef : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="programs-kebab-btn"
            aria-label="Program actions"
            onClick={() => setOpenMenuId((id) => (id === row.id ? null : row.id))}
          >
            <MoreIcon />
          </button>
          {openMenuId === row.id && (
            <div className="programs-kebab-menu" role="menu">
              <button className="programs-kebab-item" onClick={() => navigate(`/programs/builder/${row.id}`)}>
                <Edit2 size={18} color="var(--text-secondary)" variant="Linear" />
                Edit
              </button>
              <button className="programs-kebab-item" onClick={() => handleDuplicate(row.id)}>
                <Copy size={18} color="var(--text-secondary)" variant="Linear" />
                Duplicate
              </button>
              <button
                className="programs-kebab-item programs-kebab-item--danger"
                onClick={() => {
                  setConfirmDeleteId(row.id)
                  setOpenMenuId(null)
                }}
              >
                <Trash size={18} color="var(--danger-500)" variant="Linear" />
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="programs-layout">
      <LeftSidebar />
      <main className="programs-main">
        <header className="programs-header">
          <div className="programs-header-top">
            <h1 className="programs-title">Programs</h1>
            <button className="programs-create-btn" onClick={() => navigate('/programs/builder')}>
              Create Program
              <Add size={20} color="var(--neutral-25)" variant="Linear" />
            </button>
          </div>
          <div className="programs-divider" aria-hidden="true" />
        </header>

        <div className="programs-body">
          <div className="programs-toolbar">
            <Search
              size="M"
              value={query}
              onChange={setQuery}
              placeholder="Search programs"
              className="programs-search"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="programs-empty">
              <span className="programs-empty-icon">
                <Routing size={28} color="var(--text-tertiary)" variant="Bold" />
              </span>
              <p className="programs-empty-title">
                {query ? 'No programs found' : 'Create your first program'}
              </p>
              <p className="programs-empty-desc">
                {query
                  ? 'No programs match your search. Try another term.'
                  : 'Combine your courses into one guided learning journey, then assign it to your team.'}
              </p>
              {!query && (
                <button className="programs-create-btn" onClick={() => navigate('/programs/builder')}>
                  Create Program
                  <Add size={20} color="var(--neutral-25)" variant="Linear" />
                </button>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              rows={filtered}
              getRowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/programs/builder/${row.id}`)}
            />
          )}
        </div>
      </main>

      <ConfirmModal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">Delete program</h2>
          <p className="confirm-modal-body">
            Delete <strong>{deletingProgram?.title}</strong>? This removes it from the list and the learner
            experience. This can’t be undone.
          </p>
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn confirm-modal-btn--outlined-neutral" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </button>
          <button className="confirm-modal-btn confirm-modal-btn--danger" onClick={confirmDelete}>
            Delete Program
          </button>
        </div>
      </ConfirmModal>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default ProgramsAdmin
