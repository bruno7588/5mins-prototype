import { useEffect, useState } from 'react'
import CloseButton from '@/components/CloseButton/CloseButton'
import Table, { type Column } from '@/components/Table/Table'
import '@/pages/my-team/CoursesDrawer.css'
import './ImpactedUsersDrawer.css'

interface ImpactedUser {
  name: string
  email: string
}

interface Props {
  open: boolean
  /** The operation label, e.g. "Enrolled 24 learners" — becomes the drawer title. */
  title: string
  /** Every person impacted by the operation. */
  users: ImpactedUser[]
  onClose: () => void
}

/** Two uppercase initials from a display name (handles "M. Silva" style too). */
function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const columns: Column<ImpactedUser>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (u) => (
      <span className="tbl-media">
        <span className="iud-avatar" aria-hidden="true">{initials(u.name)}</span>
        <span className="tbl-stack">
          <span className="primary">{u.name}</span>
          <span className="supporting">{u.email}</span>
        </span>
      </span>
    ),
  },
]

/**
 * Right-anchored drawer listing every user impacted by an audit operation.
 * Reuses the shared DS side-drawer chrome (overlays.md) and the DS Table
 * component (table.md); opened from the "+N" overflow chip on a list-value.
 */
function ImpactedUsersDrawer({ open, title, users, onClose }: Props) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer iud-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="iud-drawer-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <h2 id="iud-drawer-title" className="iud-drawer__title">{title}</h2>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <Table columns={columns} rows={users} getRowKey={(u) => u.email || u.name} />
        </div>
      </aside>
    </>
  )
}

export default ImpactedUsersDrawer
