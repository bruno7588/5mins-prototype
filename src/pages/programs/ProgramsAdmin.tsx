import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Add, Edit2, Eye, More, Routing, Trash } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Badge from '../../components/Badge/Badge'
import Search from '../../components/Search/Search'
import Table, { type Column } from '../../components/Table/Table'
import { deleteProgram, getAdminProgramRows, type AdminProgramRow } from './programStore'
import './ProgramsAdmin.css'

function ProgramsAdmin() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<AdminProgramRow[]>(() => getAdminProgramRows())
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
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

  const openProgram = (row: AdminProgramRow) =>
    navigate(row.isDraft ? `/programs/builder/${row.id}` : `/programs/${row.id}`)

  const handleDelete = (id: string) => {
    deleteProgram(id)
    setRows(getAdminProgramRows())
    setOpenMenuId(null)
  }

  const columns: Column<AdminProgramRow>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '2 1 0',
      render: (row) => (
        <span className="tbl-media">
          <span
            className="tbl-thumb"
            style={{ backgroundImage: row.image ? `url(${row.image})` : row.thumbnailGradient }}
          />
          <span className="programs-row-title">{row.title}</span>
        </span>
      ),
    },
    { key: 'courses', header: 'Courses', render: (row) => row.courseCount },
    { key: 'learners', header: 'Learners', render: (row) => row.learnerCount },
    {
      key: 'status',
      header: 'Status',
      width: '0 0 140px',
      render: (row) =>
        row.status === 'published' ? (
          <Badge type="success" label="Published" />
        ) : (
          <Badge type="informative" label="Draft" />
        ),
    },
    {
      key: 'actions',
      header: '',
      width: '0 0 56px',
      render: (row) => (
        <div
          className="programs-kebab"
          ref={openMenuId === row.id ? menuRef : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="programs-kebab-btn"
            aria-label="Program actions"
            onClick={() => setOpenMenuId((id) => (id === row.id ? null : row.id))}
          >
            <More size={20} color="var(--text-secondary)" variant="Linear" />
          </button>
          {openMenuId === row.id && (
            <div className="programs-kebab-menu" role="menu">
              {row.isDraft ? (
                <>
                  <button className="programs-kebab-item" onClick={() => navigate(`/programs/builder/${row.id}`)}>
                    <Edit2 size={18} color="var(--text-secondary)" variant="Linear" />
                    Edit
                  </button>
                  <button
                    className="programs-kebab-item programs-kebab-item--danger"
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash size={18} color="var(--danger-500)" variant="Linear" />
                    Delete
                  </button>
                </>
              ) : (
                <button className="programs-kebab-item" onClick={() => navigate(`/programs/${row.id}`)}>
                  <Eye size={18} color="var(--text-secondary)" variant="Linear" />
                  View
                </button>
              )}
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
              <p className="programs-empty-title">{query ? 'No matching programs' : 'No programs yet'}</p>
              <p className="programs-empty-desc">
                {query ? 'Try a different search.' : 'Build a sequenced learning journey from courses, emails, and reviews.'}
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
              onRowClick={openProgram}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default ProgramsAdmin
