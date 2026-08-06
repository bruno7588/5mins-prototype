import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { Add, Danger, Edit2, Routing, Trash } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Search from '../../components/Search/Search'
import Table, { type Column } from '../../components/Table/Table'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import ProgramStatusBadge from './components/ProgramStatusBadge/ProgramStatusBadge'
import {
  deleteProgram,
  getAdminProgramRows,
  programLifecycle,
  type AdminProgramRow,
} from './programStore'
import './ProgramsAdmin.css'
import Button from '@/components/Button/Button'

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
  const location = useLocation()
  const { toasts, show } = useToast()
  const [rows, setRows] = useState<AdminProgramRow[]>(() => getAdminProgramRows())
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  // Row-action menu is portaled to <body> so the table's overflow can't clip it.
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const openMenu = (rowId: string, e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
    setOpenMenuId(rowId)
  }
  const closeMenu = () => {
    setOpenMenuId(null)
    setMenuPos(null)
  }

  // Toast handed over by another page (e.g. delete from the program details page).
  useEffect(() => {
    const toast = (location.state as { toast?: string } | null)?.toast
    if (!toast) return
    show('success', toast)
    navigate('.', { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!openMenuId) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu()
    }
    const onReflow = () => closeMenu()
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onReflow, true)
    window.addEventListener('resize', onReflow)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onReflow, true)
      window.removeEventListener('resize', onReflow)
    }
  }, [openMenuId])

  const filtered = useMemo(
    () => rows.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase())),
    [rows, query],
  )

  const deletingProgram = rows.find((r) => r.id === confirmDeleteId) ?? null

  const closeDelete = () => {
    setConfirmDeleteId(null)
    setConfirmInput('')
  }

  const confirmDelete = () => {
    if (!confirmDeleteId || confirmInput !== 'Delete') return
    deleteProgram(confirmDeleteId)
    setRows(getAdminProgramRows())
    closeDelete()
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
      width: '0 0 180px',
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
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="programs-kebab-btn"
            aria-label="Program actions"
            aria-haspopup="menu"
            aria-expanded={openMenuId === row.id}
            onClick={(e) => (openMenuId === row.id ? closeMenu() : openMenu(row.id, e))}
          >
            <MoreIcon />
          </button>
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
            <div className="programs-header-actions">
              <Search
                size="M"
                value={query}
                onChange={setQuery}
                placeholder="Search programs"
                className="programs-search"
              />
              <button className="programs-create-btn" onClick={() => navigate('/programs/builder')}>
                <Add size={20} color="currentColor" variant="Linear" />
                Create Program
              </button>
            </div>
          </div>
          <div className="programs-divider" aria-hidden="true" />
        </header>

        <div className="programs-body">
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
                  <Add size={20} color="currentColor" variant="Linear" />
                  Create Program
                </button>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              rows={filtered}
              getRowKey={(row) => row.id}
            />
          )}
        </div>
      </main>

      <ConfirmModal open={!!confirmDeleteId} onClose={closeDelete}>
        {deletingProgram && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <div className="confirm-modal-icon">
                <Danger size={72} color="var(--danger-500)" variant="Linear" />
              </div>
              <h2 className="confirm-modal-title">Delete program</h2>
              <p className="confirm-modal-body">
                All data concerning the program will be removed. This includes the progress made by the users.
              </p>
            </div>
            <div className="confirm-modal-input-group">
              <label className="confirm-modal-label">
                Type <span className="confirm-modal-label-danger">'Delete'</span> below, to confirm
              </label>
              <input
                className="confirm-modal-input"
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Delete"
                autoFocus
              />
            </div>
            <div className="confirm-modal-actions">
              <Button variant="outlined-2" onClick={closeDelete}>
                Cancel
              </Button>
              <Button semantic="danger"
                disabled={confirmInput !== 'Delete'}
                onClick={confirmDelete}
              >
                Delete Program
              </Button>
            </div>
          </>
        )}
      </ConfirmModal>

      {openMenuId &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className="programs-kebab-menu"
            role="menu"
            style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 1000 }}
          >
            <button
              className="programs-kebab-item"
              role="menuitem"
              onClick={() => {
                navigate(`/programs/builder/${openMenuId}`)
                closeMenu()
              }}
            >
              <Edit2 size={20} color="var(--text-primary)" variant="Linear" />
              Edit
            </button>
            <button
              className="programs-kebab-item programs-kebab-item--danger"
              role="menuitem"
              onClick={() => {
                setConfirmDeleteId(openMenuId)
                closeMenu()
              }}
            >
              <Trash size={20} color="var(--danger-500)" variant="Linear" />
              Delete
            </button>
          </div>,
          document.body,
        )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default ProgramsAdmin
