import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SearchNormal1,
  ProfileAdd,
  DocumentText,
  People as PeopleIcon,
  ProfileRemove,
  InfoCircle,
  Danger,
  Edit2,
  ShieldSecurity,
  ArrowDown2,
  ArrowUp2,
  RowVertical,
  Lock,
  ImportCurve,
  Profile2User,
  UserOctagon,
  MonitorMobbile,
} from 'iconsax-react'
import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import avatarAnthonny from '../../assets/avatars/avatar-1.jpg'
import avatarBrenda from '../../assets/avatars/avatar-2.jpg'
import avatarDiana from '../../assets/avatars/avatar-3.jpg'
import avatarCarlos from '../../assets/avatars/avatar-4.jpg'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import MoreIcon from '../../components/icons/MoreIcon'
import { Table, type Column } from '@/components/Table/Table'
import BulkActionBar from '../../components/BulkActionBar/BulkActionBar'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import Tooltip from '../../components/Tooltip/Tooltip'
import InviteModal from './components/InviteModal/InviteModal'
import BulkUploadModal from './components/BulkUploadModal/BulkUploadModal'
import EditColumnsPopover from './components/EditColumnsPopover/EditColumnsPopover'
import { useColumnPreferences } from './hooks/useColumnPreferences'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import ImpersonateIcon from '@/components/icons/ImpersonateIcon'
import type { RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import LimitedAdminDrawer from './components/LimitedAdminDrawer/LimitedAdminDrawer'
import { useImpersonation } from '@/impersonation/ImpersonationContext'
import ImpersonateConfirmModal from '@/impersonation/ImpersonateConfirmModal'
import AuditTrail from '@/impersonation/AuditTrail'
import type { ImpersonatedPerson } from '@/impersonation/types'
import { loadUserFields } from '@/data/userFields'
import type { UserField } from '@/data/userFields'
import { isScopeValid, scopeCell, scopeLines, scopeSummary } from './limitedAdmin'
import type { FieldValues, LimitedAdminScope, ScopeCellLine } from './limitedAdmin'
import './People.css'

/* ─── Types ─── */

interface PersonRow {
  id: number
  name: string
  email: string
  avatar: string
  avatarImg?: string
  role: string
  team: string
  reportsTo: string
  startDate: string
  region: string
  status: 'Registered' | 'Invited'
  hrisJobTitle?: string
  /** Values for tenant custom fields, keyed by field id. */
  fieldValues?: FieldValues
  /** Team Manager and Limited Admin are mutually exclusive. */
  isTeamManager?: boolean
  limitedAdmin?: LimitedAdminScope | null
}

type DeactivateStatus = 'terminated' | 'long-leave'

interface DeactivatedPerson {
  id: number
  name: string
  email: string
  avatar: string
  role: string
  team: string
  region: string
  deactivatedOn: string
  status: DeactivateStatus
}

type ModalState =
  | { type: 'none' }
  | { type: 'deactivate'; person: PersonRow }
  | { type: 'deactivate-bulk'; persons: PersonRow[] }
  | { type: 'reactivate-bulk'; persons: DeactivatedPerson[] }
  | { type: 'delete-single'; person: DeactivatedPerson }
  | { type: 'delete-bulk'; persons: DeactivatedPerson[] }

/* ─── Mock data ─── */

const initialPeople: PersonRow[] = [
  { id: 1, name: 'Anthonny Wallace', email: 'anthonny@example.com', avatar: 'AW', avatarImg: avatarAnthonny, role: 'Customer Support Specialist', team: 'Customer Support Team', reportsTo: 'Manuela Vilar', startDate: 'Jan 13, 2025', region: 'Southeast Asia', status: 'Registered', fieldValues: { 1: 'Harbour View', 2: 'Front of House', 3: 'United Kingdom', 4: 'Meridian', 5: 'Full time', 6: 'Morning' }, limitedAdmin: { conditions: [{ fieldId: 1, values: ['The Grand Riverside', 'Harbour View', 'Airport Central', 'Lakeside Retreat'] }, { fieldId: 2, values: ['Front of House', 'Food & Beverage'] }] } },
  { id: 2, name: 'Brenda Kwasaki', email: 'brenda@email.com', avatar: 'BK', avatarImg: avatarBrenda, role: 'Operations Manager', team: 'Financial Services', reportsTo: '–', startDate: 'Jan 13, 2025', region: '–', status: 'Invited', fieldValues: { 1: 'The Grand Riverside', 2: 'Back Office', 3: 'Portugal', 4: 'Coastline', 5: 'Full time', 6: 'Afternoon' }, isTeamManager: true },
  { id: 3, name: 'Carlos Mendes', email: 'carlos@example.com', avatar: 'CM', avatarImg: avatarCarlos, role: 'Software Engineer', team: 'Product Engineering', reportsTo: 'Sofia Almeida', startDate: 'Feb 1, 2025', region: 'Europe', status: 'Registered', hrisJobTitle: 'Software Engineer', fieldValues: { 1: 'Airport Central', 2: 'Back Office', 3: 'Germany', 4: 'Urban Stay', 5: 'Contractor', 6: 'Morning' } },
  { id: 4, name: 'Diana Ross', email: 'diana.ross@company.com', avatar: 'DR', avatarImg: avatarDiana, role: 'Marketing Lead', team: 'Growth Team', reportsTo: 'Manuela Vilar', startDate: 'Mar 5, 2025', region: 'North America', status: 'Registered', fieldValues: { 1: 'Harbour View', 2: 'Food & Beverage', 3: 'United Kingdom', 4: 'Meridian', 5: 'Part time', 6: 'Night' }, limitedAdmin: { conditions: [{ fieldId: 1, values: ['Old Town Residence', 'Lakeside Retreat'] }] } },
  { id: 5, name: 'Erik Johansson', email: 'erik.j@email.com', avatar: 'EJ', role: 'Data Analyst', team: 'Business Intelligence', reportsTo: '–', startDate: 'Dec 10, 2024', region: 'Europe', status: 'Invited', hrisJobTitle: 'Senior Software Engineer', fieldValues: { 1: 'Old Town Residence', 2: 'Housekeeping', 3: 'Spain', 4: 'Coastline', 5: 'Seasonal', 6: 'Night' } },
]

const initialDeactivated: DeactivatedPerson[] = [
  { id: 101, name: 'Fiona Chen', email: 'fiona.chen@example.com', avatar: 'FC', role: 'UX Designer', team: 'Design Team', region: 'East Asia', deactivatedOn: 'Nov 12, 2025', status: 'terminated' },
  { id: 102, name: 'Gabriel Santos', email: 'gabriel.s@email.com', avatar: 'GS', role: 'Sales Representative', team: 'Revenue Team', region: 'Latin America', deactivatedOn: 'Oct 28, 2025', status: 'long-leave' },
  { id: 103, name: 'Hannah Mueller', email: 'hannah.m@company.com', avatar: 'HM', role: 'HR Coordinator', team: 'People Operations', region: 'Europe', deactivatedOn: 'Sep 15, 2025', status: 'terminated' },
  { id: 104, name: 'Ivan Petrov', email: 'ivan.p@example.com', avatar: 'IP', role: 'DevOps Engineer', team: 'Infrastructure', region: 'Europe', deactivatedOn: 'Aug 3, 2025', status: 'long-leave' },
  { id: 105, name: 'Julia Kim', email: 'julia.kim@email.com', avatar: 'JK', role: 'Content Writer', team: 'Marketing', region: 'East Asia', deactivatedOn: 'Jul 20, 2025', status: 'terminated' },
  { id: 106, name: 'Kevin O\'Brien', email: 'kevin.ob@company.com', avatar: 'KO', role: 'Account Manager', team: 'Customer Success', region: 'North America', deactivatedOn: 'Jun 8, 2025', status: 'terminated' },
  { id: 107, name: 'Lara Johansson', email: 'lara.j@example.com', avatar: 'LJ', role: 'Product Manager', team: '', region: 'Europe', deactivatedOn: 'May 14, 2025', status: 'long-leave' },
  { id: 108, name: 'Marco Rossi', email: 'marco.r@email.com', avatar: 'MR', role: 'QA Engineer', team: 'Quality Assurance', region: 'Europe', deactivatedOn: 'Apr 22, 2025', status: 'terminated' },
  { id: 109, name: 'Nina Patel', email: 'nina.patel@company.com', avatar: 'NP', role: 'Finance Analyst', team: 'Finance', region: 'Southeast Asia', deactivatedOn: 'Mar 10, 2025', status: 'long-leave' },
  { id: 110, name: 'Oscar Diaz', email: 'oscar.d@example.com', avatar: 'OD', role: 'Backend Developer', team: 'Product Engineering', region: 'Latin America', deactivatedOn: 'Feb 5, 2025', status: 'terminated' },
  { id: 111, name: 'Priya Sharma', email: 'priya.s@email.com', avatar: 'PS', role: 'Training Specialist', team: '', region: 'Southeast Asia', deactivatedOn: 'Jan 18, 2025', status: 'long-leave' },
  { id: 112, name: 'Quinn Taylor', email: 'quinn.t@company.com', avatar: 'QT', role: 'Legal Counsel', team: 'Legal', region: 'North America', deactivatedOn: 'Dec 1, 2024', status: 'terminated' },
]

const quicklinks = [
  { icon: <ProfileAdd size={40} color="var(--primary-500)" variant="Linear" />, color: '0, 206, 230', title: 'Invite people', description: 'Welcome someone new to the 5Mins account' },
  { icon: <DocumentText size={40} color="var(--secondary-500)" variant="Linear" />, color: '255, 187, 56', title: 'Bulk invite / update people by CSV', description: "It's easy and will save you time" },
  { icon: <PeopleIcon size={40} color="var(--blaze-quiz)" variant="Linear" />, color: '129, 88, 236', title: 'Move people to another team', description: 'Search for people to move to a different team' },
]

const avatarColors = ['#4a90d9', '#7b68ee', '#e67e22', '#2ecc71', '#e74c3c']

/** One badge per field, "Hotel name: 3 of 5" — the field in Medium, what it
    takes in Regular. Figma People 9487:469186. */
function scopeBadges(lines: ScopeCellLine[]) {
  return lines.map((line) => (
    <Badge
      key={line.field}
      type="informative"
      label={
        <>
          {line.field}:<span className="people-scope__count">{line.detail}</span>
        </>
      }
    />
  ))
}

/**
 * Scope as a table cell: the values it covers over the field they belong to,
 * with the full sentence on hover. An out-of-date scope says so in its own
 * right, because this tab is where an admin would notice.
 *
 * The cell opens the drawer, so the thing you read is the thing you edit and
 * the row needs no button of its own.
 */
function ScopeCellView({
  scope,
  fields,
  onOpen,
}: {
  scope: LimitedAdminScope
  fields: UserField[]
  onOpen: () => void
}) {
  const cell = scopeCell(scope, fields)
  return (
    <Tooltip
      className="people-scope-tip"
      position="Top"
      icon={false}
      text={
        cell.invalid
          ? 'A field or value this scope relies on has been removed. Nobody is in scope until it is repaired.'
          : scopeSummary(scope, fields)
      }
    >
      <div
        className="people-scope"
        role="link"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}
      >
        {cell.invalid ? (
          <span className="people-scope__line people-scope__line--warning">
            <Danger size={16} variant="Bold" color="currentColor" className="people-scope__warn" />
            Scope is out of date
          </span>
        ) : (
          <>
            {scopeBadges(cell.lines)}
            {cell.more && <Badge type="informative" label={cell.more} />}
          </>
        )}
      </div>
    </Tooltip>
  )
}

function People() {
  const [activeTab, setActiveTab] = useState('All People')
  const [search, setSearch] = useState('')
  const [people, setPeople] = useState(initialPeople)
  const [deactivatedPeople, setDeactivatedPeople] = useState(initialDeactivated)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [confirmInput, setConfirmInput] = useState('')
  const [deactivateReason, setDeactivateReason] = useState<'terminated' | 'long-leave'>('long-leave')
  const [sortCol, setSortCol] = useState<'name' | 'status' | 'role' | 'region' | 'deactivatedOn'>('deactivatedOn')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'terminated' | 'long-leave'>('all')
  const { toasts, show: showToast } = useToast()
  const navigate = useNavigate()
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [editColumnsOpen, setEditColumnsOpen] = useState(false)

  const userFields = useMemo(() => loadUserFields(), [])

  /* Limited Admin drawer + the remove-role confirm it can lead to. */
  const [limitedAdminPerson, setLimitedAdminPerson] = useState<PersonRow | null>(null)
  const [removeAdminPerson, setRemoveAdminPerson] = useState<PersonRow | null>(null)
  /* Impersonation (DES-337): the person the confirm dialog is armed for. */
  const [impersonateTarget, setImpersonateTarget] = useState<PersonRow | null>(null)
  const { start: startImpersonation } = useImpersonation()

  /** Why this person can't be impersonated, or undefined if they can. An admin can
   *  only impersonate roles below their own, so Limited Admins are off-limits; and
   *  an Invited person has never signed in, so there is no learner experience to
   *  reproduce and nothing should be done on an account they haven't claimed. */
  const impersonateBlockReason = (person: PersonRow): string | undefined => {
    if (person.limitedAdmin) return 'Not available for admins'
    if (person.status === 'Invited') return "Available once they've signed up"
    return undefined
  }
  const canImpersonate = (person: PersonRow) => !impersonateBlockReason(person)

  /** Narrow a table row to the identity the session, bar and audit trail name. */
  const toImpersonated = (person: PersonRow): ImpersonatedPerson => ({
    id: person.id,
    name: person.name,
    email: person.email,
    role: person.role,
    initials: person.avatar,
    avatarImg: person.avatarImg,
    color: avatarColors[(person.id - 1) % avatarColors.length],
  })

  const { visibleKeys, toggleColumn, resetToDefault, allColumns } = useColumnPreferences(userFields)

  /* Row menu, per Figma People 8572:654. The three role actions carry a line of
     supporting text: the access levels are close enough that their names alone
     do not separate them. */
  function rowMenuItems(person: PersonRow): RowMenuItem[] {
    const icon = (Icon: typeof Edit2, color = 'var(--text-primary)') => (
      <Icon size={20} color={color} variant="Linear" />
    )
    return [
      { key: 'edit', label: 'Edit profile', icon: icon(Edit2) },
      /* Every item in this menu stays enabled, including the ones that lead
         nowhere yet: a greyed row in a short menu reads as broken. */
      { key: 'change-manager', label: 'Change Manager', icon: icon(Profile2User) },
      /* Support action — after the routine edits, before the role grants. Disabled
         for Limited Admins and Invited people (DES-337), with the reason as visible
         supporting text rather than a hover title, so keyboard and screen-reader
         users get it too. currentColor so the icon greys with the label. */
      {
        key: 'impersonate',
        label: 'Impersonate user',
        icon: <ImpersonateIcon size={20} color="currentColor" />,
        disabled: !canImpersonate(person),
        description: impersonateBlockReason(person),
      },
      {
        key: 'admin',
        label: 'Make Admin',
        description: 'Full access to everything in the account',
        icon: icon(ShieldSecurity),
      },
      person.limitedAdmin
        ? { key: 'limited-admin', label: 'Edit Limited Admin', icon: icon(UserOctagon) }
        : {
            key: 'limited-admin',
            label: 'Make Limited Admin',
            description: 'Admin access for a specific set of people',
            icon: icon(UserOctagon),
          },
      {
        key: 'subject-expert',
        label: 'Make Subject Expert',
        description: 'Can create and edit course content',
        icon: icon(MonitorMobbile),
      },
      {
        key: 'deactivate',
        label: 'Deactivate user account',
        /* currentColor so the item's own --text-error rule wins; a raw palette
           colour here reads darker than the label in dark mode. */
        icon: icon(ProfileRemove, 'currentColor'),
        danger: true,
      },
    ]
  }

  function handleRowAction(key: string, person: PersonRow) {
    if (key === 'impersonate') {
      if (canImpersonate(person)) setImpersonateTarget(person)
    } else if (key === 'limited-admin') setLimitedAdminPerson(person)
    else if (key === 'deactivate') setModal({ type: 'deactivate', person })
  }

  function handleSaveLimitedAdmin(scope: LimitedAdminScope) {
    const target = limitedAdminPerson
    if (!target) return
    const wasAdmin = Boolean(target.limitedAdmin)
    setPeople((prev) =>
      prev.map((p) =>
        p.id === target.id ? { ...p, limitedAdmin: scope } : p,
      ),
    )
    setLimitedAdminPerson(null)
    /* The scope itself is not in the toast: it is on the row behind it, and a
       list of values only reads correctly when the scope has one field. */
    showToast(
      'success',
      wasAdmin
        ? `Scope updated for ${target.name}`
        : `${target.name} is now a Limited Admin`,
    )
  }

  function handleRemoveLimitedAdmin() {
    const target = removeAdminPerson
    if (!target) return
    setPeople((prev) =>
      prev.map((p) => (p.id === target.id ? { ...p, limitedAdmin: null } : p)),
    )
    setRemoveAdminPerson(null)
    showToast('success', `${target.name} is no longer a Limited Admin`)
  }
  const tabs = [
    'All People',
    'Limited Admins',
    'Managers',
    'Subject Experts',
    `Deactivated (${deactivatedPeople.length})`,
  ]

  const isDeactivatedTab = activeTab.startsWith('Deactivated')
  const isLimitedAdminsTab = activeTab === 'Limited Admins'
  /* The tab answers "who has admin power, and over whom". A job title, a team
     and a manager describe the person's place in the org, not their reach, and
     they were taking the width the scope needed. They are still on the person's
     own page. */
  const showPersonCols = !isLimitedAdminsTab

  /* ─── Filtered lists ─── */

  /* The tab narrows the same list rather than opening a different table: a Limited
     Admin is still an active person, and appears under both. */
  const filteredPeople = people.filter(
    (p) =>
      (activeTab !== 'Limited Admins' || Boolean(p.limitedAdmin)) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()))
  )

  function toggleSort(col: typeof sortCol) {
    if (sortCol === col) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir(col === 'deactivatedOn' ? 'desc' : 'asc')
    }
  }

  const filteredDeactivated = deactivatedPeople
    .filter(
      (p) =>
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === 'all' || p.status === statusFilter)
    )
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortCol === 'deactivatedOn') {
        return dir * (new Date(a.deactivatedOn).getTime() - new Date(b.deactivatedOn).getTime())
      }
      const valA = a[sortCol].toLowerCase()
      const valB = b[sortCol].toLowerCase()
      if (valA < valB) return -1 * dir
      if (valA > valB) return 1 * dir
      return 0
    })

  /* ─── Tab switch: clear selection ─── */

  function handleTabSwitch(tab: string) {
    setActiveTab(tab)
    setSelectedIds(new Set())
    setSearch('')
    setStatusFilter('all')
  }

  /* ─── Click outside to close filter ─── */

  useEffect(() => {
    if (!filterOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [filterOpen])

  /* ─── Selection helpers ─── */

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const list = isDeactivatedTab ? filteredDeactivated : filteredPeople
    const allIds = list.map(p => p.id)
    const every = allIds.every(id => selectedIds.has(id))
    if (every) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }

  const currentList = isDeactivatedTab ? filteredDeactivated : filteredPeople
  const allSelected = currentList.length > 0
    && currentList.every(p => selectedIds.has(p.id))

  /* ─── Actions ─── */

  function closeModal() {
    setModal({ type: 'none' })
    setConfirmInput('')
    setDeactivateReason('long-leave')
  }

  function handleDeactivate(person: PersonRow) {
    const deactivated: DeactivatedPerson = {
      id: person.id,
      name: person.name,
      email: person.email,
      avatar: person.avatar,
      role: person.role,
      team: person.team,
      region: person.region,
      deactivatedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: deactivateReason,
    }
    setPeople(prev => prev.filter(p => p.id !== person.id))
    setDeactivatedPeople(prev => [...prev, deactivated])
    closeModal()
    showToast('success', `${person.name} has been deactivated. Find them in the Deactivated tab.`)
  }

  function handleReactivateSingle(person: DeactivatedPerson) {
    const reactivated: PersonRow = {
      id: person.id,
      name: person.name,
      email: person.email,
      avatar: person.avatar,
      role: person.role,
      team: person.team,
      reportsTo: '–',
      region: person.region,
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Registered',
    }
    setDeactivatedPeople(prev => prev.filter(p => p.id !== person.id))
    setPeople(prev => [...prev, reactivated])
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(person.id)
      return next
    })
    if (!person.team) {
      showToast('warning', `${person.name} has been reactivated but their previous team no longer exists. Please assign them to a team from the All People tab.`)
    } else {
      showToast('success', `${person.name} has been reactivated`)
    }
  }

  function handleReactivateBulk(persons: DeactivatedPerson[]) {
    const ids = new Set(persons.map(p => p.id))
    const reactivated: PersonRow[] = persons.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatar: p.avatar,
      role: p.role,
      team: p.team,
      reportsTo: '–',
      region: p.region,
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Registered' as const,
    }))
    setDeactivatedPeople(prev => prev.filter(p => !ids.has(p.id)))
    setPeople(prev => [...prev, ...reactivated])
    setSelectedIds(new Set())
    const missingTeam = persons.filter(p => !p.team)
    if (missingTeam.length > 0) {
      showToast('warning', `${missingTeam.map(p => p.name).join(', ')} reactivated but their previous team no longer exists. Please assign them to a team.`)
    }
    showToast('success', `${persons.length} users reactivated`)
  }

  function handleDeleteSingle(person: DeactivatedPerson) {
    setDeactivatedPeople(prev => prev.filter(p => p.id !== person.id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(person.id)
      return next
    })
    closeModal()
    showToast('success', `${person.name} has been permanently deleted`)
  }

  function handleDeleteBulk(persons: DeactivatedPerson[]) {
    const ids = new Set(persons.map(p => p.id))
    setDeactivatedPeople(prev => prev.filter(p => !ids.has(p.id)))
    setSelectedIds(new Set())
    closeModal()
    showToast('success', `${persons.length} users permanently deleted`)
  }

  function handleDeactivateBulk(persons: PersonRow[]) {
    const ids = new Set(persons.map(p => p.id))
    const deactivated: DeactivatedPerson[] = persons.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatar: p.avatar,
      role: p.role,
      team: p.team,
      region: p.region,
      deactivatedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: deactivateReason,
    }))
    setPeople(prev => prev.filter(p => !ids.has(p.id)))
    setDeactivatedPeople(prev => [...prev, ...deactivated])
    setSelectedIds(new Set())
    closeModal()
    showToast('success', `${persons.length} users deactivated. Find them in the Deactivated tab.`)
  }

  /* ─── Selected persons for bulk actions ─── */

  const selectedPersons = deactivatedPeople.filter(p => selectedIds.has(p.id))
  const selectedPeoplePersons = people.filter(p => selectedIds.has(p.id))

  /* ─── Table columns ─── */

  const sortHeader = (col: typeof sortCol, label: string) => (
    <span className={`people-th-sort${sortCol === col ? ' people-th-sort--sorted' : ''}`}>
      {label}
      {sortCol === col && (sortDir === 'asc'
        ? <ArrowUp2 size={16} color="var(--text-tertiary)" />
        : <ArrowDown2 size={16} color="var(--text-tertiary)" />)}
    </span>
  )

  const peopleColumns: Column<PersonRow>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '0 1 300px',
      render: (person) => (
        <span className="tbl-media">
          <div className="people-avatar-wrap">
            <div className="people-avatar" style={{ background: avatarColors[(person.id - 1) % avatarColors.length] }}>
              {person.avatarImg ? <img className="people-avatar-img" src={person.avatarImg} alt="" /> : person.avatar}
            </div>
            {/* The role rides the avatar rather than the name: it belongs to the
                person, and a badge beside the name pushed the name out of a cell
                that is already the tightest in the row. */}
            {person.limitedAdmin && (
              <Tooltip
                className="people-avatar-mark"
                position="Top"
                icon={false}
                text={
                  isScopeValid(person.limitedAdmin, userFields)
                    ? `Limited Admin — ${scopeSummary(person.limitedAdmin, userFields)}`
                    : 'Limited Admin — scope is out of date'
                }
              >
                <UserOctagon
                  size={16}
                  variant="Bold"
                  color={
                    isScopeValid(person.limitedAdmin, userFields)
                      ? 'var(--text-primary)'
                      : 'var(--text-warning)'
                  }
                />
              </Tooltip>
            )}
          </div>
          <div
            className="people-name-info"
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/people/${person.id}`)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/people/${person.id}`) }}
          >
            <span className="people-name">{person.name}</span>
            <span className="people-email">{person.email}</span>
          </div>
        </span>
      ),
    },
    ...(showPersonCols && visibleKeys.includes('role') ? [{
      key: 'role',
      header: 'Role',
      width: '1 1 180px',
      render: (person: PersonRow) => (
        <span className="people-role-cell">
          <span className="people-role-text">{person.role}</span>
          {person.hrisJobTitle && (
            <Tooltip
              text={`Role managed by HRIS (${person.hrisJobTitle}). Only admins can change it.`}
              position="Top"
              icon={false}
            >
              <Lock size={16} variant="Bold" color="var(--text-tertiary)" />
            </Tooltip>
          )}
        </span>
      ),
    }] : []),
    ...(showPersonCols && visibleKeys.includes('team') ? [{
      key: 'team', header: 'Team', width: '1 1 170px', render: (person: PersonRow) => person.team,
    }] : []),
    ...(showPersonCols && visibleKeys.includes('reportsTo') ? [{
      key: 'reportsTo', header: 'Reports to', width: '1 1 150px', render: (person: PersonRow) => person.reportsTo,
    }] : []),
    /* Only where every row has one: elsewhere the column would be empty for
       all but a handful of people. */
    ...(isLimitedAdminsTab ? [{
      key: 'scope',
      header: 'Scope',
      width: '1 0 280px',
      render: (person: PersonRow) => person.limitedAdmin && (
        <ScopeCellView
          scope={person.limitedAdmin}
          fields={userFields}
          onOpen={() => setLimitedAdminPerson(person)}
        />
      ),
    }] : []),
    ...(showPersonCols && visibleKeys.includes('region') ? [{
      key: 'region', header: 'Region', width: '1 1 130px', render: (person: PersonRow) => person.region,
    }] : []),
    ...(visibleKeys.includes('status') ? [{
      key: 'status',
      header: 'Status',
      width: '0 0 140px',
      render: (person: PersonRow) => (
        <span className={`people-badge people-badge--${person.status.toLowerCase()}`}>
          {person.status}
        </span>
      ),
    }] : []),
    ...(showPersonCols
      ? visibleKeys.filter(k => k.startsWith('custom-')).flatMap(key => {
          const col = allColumns.find(c => c.key === key)
          return col ? [{
            key,
            header: col.label,
            width: '0 0 160px',
            render: (person: PersonRow) => person.fieldValues?.[Number(key.replace('custom-', ''))] ?? '–',
          }] : []
        })
      : []),
    {
      key: 'actions',
      header: '',
      width: '0 0 56px',
      align: 'center',
      render: (person) => (
        <RowActionsMenu
          items={rowMenuItems(person)}
          onSelect={(key) => handleRowAction(key, person)}
          ariaLabel={`Actions for ${person.name}`}
          triggerClassName="people-more-btn"
          triggerContent={<MoreIcon size={24} color="var(--text-tertiary)" />}
        />
      ),
    },
  ]

  function handleDeactivatedAction(key: string, person: DeactivatedPerson) {
    if (key === 'reactivate') {
      handleReactivateSingle(person)
    } else if (key === 'change-status') {
      setDeactivatedPeople(prev =>
        prev.map(p =>
          p.id === person.id
            ? { ...p, status: person.status === 'terminated' ? 'long-leave' as const : 'terminated' as const }
            : p
        )
      )
      showToast('success', `${person.name} status changed to ${person.status === 'terminated' ? 'Long Leave' : 'Terminated'}`)
    } else if (key === 'delete') {
      setModal({ type: 'delete-single', person })
    }
  }

  const deactivatedColumns: Column<DeactivatedPerson>[] = [
    {
      key: 'name',
      header: sortHeader('name', 'Name'),
      sortable: true,
      width: '0 1 300px',
      render: (person) => (
        <span className="tbl-media">
          <div className="people-avatar" style={{ background: avatarColors[(person.id - 1) % avatarColors.length] }}>
            {person.avatar}
          </div>
          <div className="people-name-info">
            <span className="people-name">{person.name}</span>
            <span className="people-email">{person.email}</span>
          </div>
        </span>
      ),
    },
    {
      key: 'status',
      header: sortHeader('status', 'Status'),
      sortable: true,
      width: '0 0 140px',
      render: (person) => person.status === 'terminated'
        ? <Badge type="error" label="Terminated" />
        : <Badge type="warning" label="Long Leave" />,
    },
    { key: 'role', header: sortHeader('role', 'Role'), sortable: true, width: '1 1 200px', render: (person) => person.role },
    { key: 'team', header: 'Team', width: '1 1 200px', render: (person) => person.team || '–' },
    { key: 'region', header: sortHeader('region', 'Region'), sortable: true, width: '1 1 200px', render: (person) => person.region },
    {
      key: 'deactivatedOn',
      header: sortHeader('deactivatedOn', 'Deactivated on'),
      sortable: true,
      width: '1 1 160px',
      render: (person) => (
        <div className="people-date-stack">
          <span>{person.deactivatedOn.replace(/,?\s*\d{4}$/, ',')}</span>
          <span className="people-date-stack__year">{person.deactivatedOn.match(/\d{4}$/)?.[0]}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '0 0 56px',
      align: 'center',
      render: (person) => (
        <RowActionsMenu
          items={[
            { key: 'reactivate', label: 'Reactivate' },
            { key: 'change-status', label: person.status === 'terminated' ? 'Change to Long Leave' : 'Change to Terminated' },
            { key: 'delete', label: 'Delete Permanently', danger: true },
          ]}
          onSelect={(key) => handleDeactivatedAction(key, person)}
          ariaLabel={`Actions for ${person.name}`}
          triggerClassName="people-more-btn"
          triggerContent={<MoreIcon size={24} color="var(--text-tertiary)" />}
        />
      ),
    },
  ]

  /* ─── Render ─── */

  return (
    <div className="people-layout">
      <LeftSidebar />
      <main className="people-main">
        <div className="people-page">
      {/* Quicklinks */}
      <div className="people-quicklinks">
        {quicklinks.map((q) => {
          const onClick =
            q.title === 'Invite people' ? () => setShowInvite(true)
            : q.title === 'Bulk invite / update people by CSV' ? () => setShowBulkUpload(true)
            : undefined
          return (
          <button
            key={q.title}
            className={`people-quicklink${onClick ? '' : ' ui-disabled'}`}
            style={{ '--ql-color': q.color } as React.CSSProperties}
            onClick={onClick}
            disabled={!onClick}
          >
            <div className="people-quicklink-icon">{q.icon}</div>
            <div className="people-quicklink-info">
              <h3 className="people-quicklink-title">{q.title}</h3>
              <p className="people-quicklink-desc">{q.description}</p>
            </div>
          </button>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="people-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`people-tab${activeTab === tab ? ' people-tab--active' : ''}`}
            onClick={() => handleTabSwitch(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Info banner — Deactivated tab only (hide when no deactivated users) */}
      {isDeactivatedTab && deactivatedPeople.length > 0 && (
        <div className="people-info-banner">
          <InfoCircle size={20} color="var(--text-warning)" variant="Linear" />
          <span>Terminated users are auto-deleted after 3 years. Long Leave users are retained indefinitely.</span>
        </div>
      )}

      {/* Actions bar (hide on deactivated tab when no users exist) */}
      {!(isDeactivatedTab && deactivatedPeople.length === 0) && (
      <div className="people-actions">
        <div className="people-actions-left">
          <div className="people-search">
            <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
            <input
              className="people-search-input"
              type="text"
              placeholder="Search for people"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="people-actions-right">
          {isDeactivatedTab && (
            <div className="people-filter">
              <span className="people-filter-label">Deactivation status is</span>
              <div className="people-filter-dropdown" ref={filterRef}>
                <button
                  className={`people-filter-trigger${filterOpen ? ' people-filter-trigger--open' : ''}`}
                  onClick={() => setFilterOpen(prev => !prev)}
                >
                  <span>{statusFilter === 'all' ? 'All' : statusFilter === 'terminated' ? 'Terminated' : 'Long Leave'}</span>
                  <ArrowDown2 size={16} color="var(--text-secondary)" className={`people-filter-chevron${filterOpen ? ' people-filter-chevron--open' : ''}`} />
                </button>
                {filterOpen && (
                  <div className="people-filter-listbox">
                    {([['all', 'All'], ['terminated', 'Terminated'], ['long-leave', 'Long Leave']] as const).map(([value, label]) => (
                      <button
                        key={value}
                        className={`people-filter-option${statusFilter === value ? ' people-filter-option--selected' : ''}`}
                        onClick={() => {
                          setStatusFilter(value)
                          setFilterOpen(false)
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Nothing left to toggle on the Limited Admins tab: it shows the three
              columns it needs and the picker would be a control that does nothing. */}
          {!isDeactivatedTab && !isLimitedAdminsTab && userFields.length > 0 && (
            <div className="people-edit-cols-wrapper">
              <button
                className="people-edit-cols-btn"
                onClick={() => setEditColumnsOpen(prev => !prev)}
              >
                <RowVertical size={16} color="currentColor" variant="Linear" />
                Columns
                <ArrowDown2 size={16} color="currentColor" variant="Linear" />
              </button>
              {editColumnsOpen && (
                <EditColumnsPopover
                  columns={allColumns}
                  visibleKeys={visibleKeys}
                  onToggle={toggleColumn}
                  onReset={() => {
                    resetToDefault()
                    showToast('success', 'Columns reset to default')
                  }}
                  onClose={() => setEditColumnsOpen(false)}
                />
              )}
            </div>
          )}
          <Button
            variant="outlined-2"
            className="ui-disabled"
            disabled
            icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
          >
            Download List
          </Button>
        </div>
      </div>
      )}

      {/* ═══ All People Table ═══ */}
      {!isDeactivatedTab && (
        <Table
          columns={peopleColumns}
          rows={filteredPeople}
          getRowKey={(person) => String(person.id)}
          selectable
          isSelected={(person) => selectedIds.has(person.id)}
          onToggleRow={(person) => toggleSelect(person.id)}
          onToggleAll={toggleSelectAll}
          allSelected={allSelected}
        />
      )}

      {/* ═══ Deactivated Table ═══ */}
      {isDeactivatedTab && (
        <>
          {deactivatedPeople.length === 0 ? (
            <div className="people-empty-state">
              <ProfileRemove size={48} color="var(--text-tertiary)" variant="Linear" />
              <h3 className="people-empty-state-title">No deactivated users</h3>
              <p className="people-empty-state-desc">
                When you deactivate someone from the All People tab, they'll appear here.
              </p>
            </div>
          ) : (
            <Table
              columns={deactivatedColumns}
              rows={filteredDeactivated}
              getRowKey={(person) => String(person.id)}
              selectable
              isSelected={(person) => selectedIds.has(person.id)}
              onToggleRow={(person) => toggleSelect(person.id)}
              onToggleAll={toggleSelectAll}
              allSelected={allSelected}
              onSort={(key) => toggleSort(key as typeof sortCol)}
            />
          )}
        </>
      )}

      {/* ═══ Impersonation audit trail (DES-337) ═══ */}
      {activeTab === 'All People' && <AuditTrail />}

      {/* ═══ Bulk action bar — All People ═══ */}
      {/* Tab picks which bar; `count` drives show/hide so it can animate out. */}
      {!isDeactivatedTab && (
        <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
          <button
            className="bulk-bar-btn bulk-bar-btn--danger"
            onClick={() => setModal({ type: 'deactivate-bulk', persons: selectedPeoplePersons })}
          >
            Deactivate {selectedIds.size} {selectedIds.size === 1 ? 'User' : 'Users'}
          </button>
        </BulkActionBar>
      )}

      {/* ═══ Bulk action bar — Deactivated ═══ */}
      {isDeactivatedTab && (
        <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
          <button
            className="bulk-bar-btn bulk-bar-btn--primary"
            onClick={() => setModal({ type: 'reactivate-bulk', persons: selectedPersons })}
          >
            Reactivate {selectedIds.size} {selectedIds.size === 1 ? 'User' : 'Users'}
          </button>
          <button
            className="bulk-bar-btn bulk-bar-btn--danger"
            onClick={() => setModal({ type: 'delete-bulk', persons: selectedPersons })}
          >
            Delete {selectedIds.size} Permanently
          </button>
        </BulkActionBar>
      )}

      {/* ═══ Modals ═══ */}

      {/* Impersonation confirm (DES-337) → starts the ghost session on confirm */}
      <ImpersonateConfirmModal
        person={impersonateTarget ? toImpersonated(impersonateTarget) : null}
        onClose={() => setImpersonateTarget(null)}
        onConfirm={() => {
          if (impersonateTarget) startImpersonation(toImpersonated(impersonateTarget))
          setImpersonateTarget(null)
        }}
      />

      {/* Deactivate single (radio reason cards — same flow as bulk) */}
      <ConfirmModal open={modal.type === 'deactivate'} onClose={closeModal}>
        {modal.type === 'deactivate' && (
          <>
            <div className="confirm-modal-header">
              <h2 className="confirm-modal-title">Remove {modal.person.name} from the account</h2>
              <p className="confirm-modal-body">
                This will immediately remove their access to the platform.<br />
                Choose a status:
              </p>
            </div>
            <div className="confirm-modal-radio-cards">
              <label className={`confirm-modal-radio-card${deactivateReason === 'long-leave' ? ' confirm-modal-radio-card--warning' : ''}`}>
                <input
                  type="radio"
                  name="deactivate-reason-single"
                  checked={deactivateReason === 'long-leave'}
                  onChange={() => setDeactivateReason('long-leave')}
                />
                <span className="confirm-modal-radio-custom" />
                <div className="confirm-modal-radio-card-text">
                  <span className="confirm-modal-radio-card-title">Temporary Long Leave</span>
                  <span className="confirm-modal-radio-card-desc">They're expected to return. Data retained indefinitely.</span>
                </div>
              </label>
              <label className={`confirm-modal-radio-card${deactivateReason === 'terminated' ? ' confirm-modal-radio-card--danger' : ''}`}>
                <input
                  type="radio"
                  name="deactivate-reason-single"
                  checked={deactivateReason === 'terminated'}
                  onChange={() => setDeactivateReason('terminated')}
                />
                <span className="confirm-modal-radio-custom" />
                <div className="confirm-modal-radio-card-text">
                  <span className="confirm-modal-radio-card-title">Terminated</span>
                  <span className="confirm-modal-radio-card-desc">They've left the organisation. Data retained for 3 years, then auto-deleted.</span>
                </div>
              </label>
            </div>
            <div className="confirm-modal-actions">
              <Button variant="outlined-2" onClick={closeModal}>Cancel</Button>
              <Button onClick={() => handleDeactivate(modal.person)}>Deactivate 1 User</Button>
            </div>
          </>
        )}
      </ConfirmModal>

      {/* Deactivate bulk (radio reason cards — no user list) */}
      <ConfirmModal open={modal.type === 'deactivate-bulk'} onClose={closeModal}>
        {modal.type === 'deactivate-bulk' && (
          <>
            <div className="confirm-modal-header">
              <h2 className="confirm-modal-title">Remove {modal.persons.length} {modal.persons.length === 1 ? 'user' : 'users'} from the account</h2>
              <p className="confirm-modal-body">
                This will immediately remove their access to the platform.<br />
                Choose a status:
              </p>
            </div>
            <div className="confirm-modal-radio-cards">
              <label className={`confirm-modal-radio-card${deactivateReason === 'long-leave' ? ' confirm-modal-radio-card--warning' : ''}`}>
                <input
                  type="radio"
                  name="deactivate-reason"
                  checked={deactivateReason === 'long-leave'}
                  onChange={() => setDeactivateReason('long-leave')}
                />
                <span className="confirm-modal-radio-custom" />
                <div className="confirm-modal-radio-card-text">
                  <span className="confirm-modal-radio-card-title">Temporary Long Leave</span>
                  <span className="confirm-modal-radio-card-desc">They're expected to return. Data retained indefinitely.</span>
                </div>
              </label>
              <label className={`confirm-modal-radio-card${deactivateReason === 'terminated' ? ' confirm-modal-radio-card--danger' : ''}`}>
                <input
                  type="radio"
                  name="deactivate-reason"
                  checked={deactivateReason === 'terminated'}
                  onChange={() => setDeactivateReason('terminated')}
                />
                <span className="confirm-modal-radio-custom" />
                <div className="confirm-modal-radio-card-text">
                  <span className="confirm-modal-radio-card-title">Terminated</span>
                  <span className="confirm-modal-radio-card-desc">They've left the organisation. Data retained for 3 years, then auto-deleted.</span>
                </div>
              </label>
            </div>
            <div className="confirm-modal-actions">
              <Button variant="outlined-2" onClick={closeModal}>Cancel</Button>
              <Button onClick={() => handleDeactivateBulk(modal.persons)}>Deactivate {modal.persons.length} {modal.persons.length === 1 ? 'User' : 'Users'}</Button>
            </div>
          </>
        )}
      </ConfirmModal>

      {/* Reactivate bulk (status breakdown) */}
      <ConfirmModal open={modal.type === 'reactivate-bulk'} onClose={closeModal}>
        {modal.type === 'reactivate-bulk' && (() => {
          const terminated = modal.persons.filter(p => p.status === 'terminated')
          const longLeave = modal.persons.filter(p => p.status === 'long-leave')
          const total = modal.persons.length
          return (
            <>
              <div className="confirm-modal-header confirm-modal-header--center">
                <h3 className="confirm-modal-title">Reactivate users</h3>
                <p className="confirm-modal-reactivate-subtitle">
                  {terminated.length > 0 && (
                    <>
                      <span>{terminated.length} </span>
                      <span className="confirm-modal-reactivate-label--danger">Terminated</span>
                      <span> {terminated.length === 1 ? 'user' : 'users'} will be restored to active.</span>
                      <br />
                    </>
                  )}
                  {longLeave.length > 0 && (
                    <>
                      <span>{longLeave.length} </span>
                      <span className="confirm-modal-reactivate-label--warning">Long Leave</span>
                      <span> {longLeave.length === 1 ? 'user' : 'users'} will return to active.</span>
                    </>
                  )}
                </p>
              </div>
              <div className="confirm-modal-actions">
                <Button variant="outlined-2" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleReactivateBulk(modal.persons)
                    closeModal()
                  }}
                >
                  Reactivate {total} {total === 1 ? 'User' : 'Users'}
                </Button>
              </div>
            </>
          )
        })()}
      </ConfirmModal>

      {/* Delete single (Error dialog — centered icon/title/body + type-to-confirm) */}
      <ConfirmModal open={modal.type === 'delete-single'} onClose={closeModal}>
        {modal.type === 'delete-single' && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <div className="confirm-modal-icon">
                <Danger size={72} color="var(--danger-500)" variant="Linear" />
              </div>
              <h2 className="confirm-modal-title">Delete permanently {modal.person.name}</h2>
              <p className="confirm-modal-body">
                This action cannot be undone. All data for this user will be permanently removed.
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
                onChange={e => setConfirmInput(e.target.value)}
                placeholder="Delete"
              />
            </div>
            <div className="confirm-modal-actions">
              <Button variant="outlined-2" onClick={closeModal}>Cancel</Button>
              <Button semantic="danger"
                disabled={confirmInput !== 'Delete'}
                onClick={() => handleDeleteSingle(modal.person)}
              >
                Delete Permanently
              </Button>
            </div>
          </>
        )}
      </ConfirmModal>

      {/* Delete bulk (Error dialog — centered icon/title/body + type-to-confirm) */}
      <ConfirmModal open={modal.type === 'delete-bulk'} onClose={closeModal}>
        {modal.type === 'delete-bulk' && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <div className="confirm-modal-icon">
                <Danger size={72} color="var(--danger-500)" variant="Linear" />
              </div>
              <h2 className="confirm-modal-title">Delete permanently {modal.persons.length} users</h2>
              <p className="confirm-modal-body">
                This action cannot be undone. All data for these users will be permanently removed.
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
                onChange={e => setConfirmInput(e.target.value)}
                placeholder="Delete"
              />
            </div>
            <div className="confirm-modal-actions">
              <Button variant="outlined-2" onClick={closeModal}>Cancel</Button>
              <Button semantic="danger"
                disabled={confirmInput !== 'Delete'}
                onClick={() => handleDeleteBulk(modal.persons)}
              >
                Delete {modal.persons.length} Permanently
              </Button>
            </div>
          </>
        )}
      </ConfirmModal>

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvite={(count) => {
            setShowInvite(false)
            setActiveTab('All People')
            showToast('success', count === 1 ? 'Invite sent' : 'Invites sent')
          }}
          userFields={userFields}
        />
      )}

      {/* Bulk upload CSV modal */}
      {showBulkUpload && (
        <BulkUploadModal onClose={() => setShowBulkUpload(false)} />
      )}

      {/* Toast stack */}
      <LimitedAdminDrawer
        open={limitedAdminPerson !== null}
        person={limitedAdminPerson}
        fields={userFields}
        onClose={() => setLimitedAdminPerson(null)}
        onSave={handleSaveLimitedAdmin}
        onRemove={() => {
          /* The drawer closes first: the confirm that follows is about the whole
             role, and two overlays deep would bury what it is asking. */
          const target = limitedAdminPerson
          setLimitedAdminPerson(null)
          setRemoveAdminPerson(target)
        }}
      />

      <ConfirmModal
        open={removeAdminPerson !== null}
        onClose={() => setRemoveAdminPerson(null)}
        ariaLabel="Remove Limited Admin"
      >
        <div className="confirm-modal-header confirm-modal-header--center">
          <div className="confirm-modal-icon">
            <Danger size={72} color="var(--danger-500)" variant="Linear" />
          </div>
          <h2 className="confirm-modal-title">Remove Limited Admin</h2>
          <p className="confirm-modal-body">
            {removeAdminPerson?.name} loses admin access and stops managing the people
            in their scope.
          </p>
          {/* The scope reads as its conditions rather than a sentence: at three
              fields deep the sentence is a paragraph nobody parses under a
              destructive button. Same badges as the drawer that set it. */}
          {removeAdminPerson?.limitedAdmin && (
            <div className="people-remove-scope">
              {scopeBadges(scopeLines(removeAdminPerson.limitedAdmin, userFields))}
            </div>
          )}
        </div>
        <div className="confirm-modal-actions confirm-modal-actions--center">
          <Button variant="outlined-2" onClick={() => setRemoveAdminPerson(null)}>Cancel</Button>
          <Button semantic="danger" onClick={handleRemoveLimitedAdmin}>Remove Limited Admin</Button>
        </div>
      </ConfirmModal>

      <ToastContainer toasts={toasts} />
        </div>
      </main>
    </div>
  )
}

export default People
