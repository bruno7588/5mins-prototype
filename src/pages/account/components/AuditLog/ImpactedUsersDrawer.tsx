import { useRef } from 'react'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import Table, { type Column } from '@/components/Table/Table'
import Avatar from '@/components/Avatar/Avatar'

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

const columns: Column<ImpactedUser>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (u) => (
      <span className="tbl-media">
        <Avatar name={u.name} size={40} />
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
 * Uses the shared DS SideDrawer (overlays.md) and the DS Table
 * component (table.md); opened from the "+N" overflow chip on a list-value.
 */
function ImpactedUsersDrawer({ open, title, users, onClose }: Props) {
  // The parent clears its data on close; keep the last title and rows so the
  // exit slide still shows them.
  const last = useRef({ title, users })
  if (open) last.current = { title, users }

  return (
    <SideDrawer open={open} onClose={onClose} title={last.current.title}>
      <Table columns={columns} rows={last.current.users} getRowKey={(u) => u.email || u.name} />
    </SideDrawer>
  )
}

export default ImpactedUsersDrawer
