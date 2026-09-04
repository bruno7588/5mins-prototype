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
import Checkbox from '../../components/Checkbox/Checkbox'
import BulkActionBar from '../../components/BulkActionBar/BulkActionBar'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import Tooltip from '../../components/Tooltip/Tooltip'
import InviteModal from './components/InviteModal/InviteModal'
import BulkUploadModal from './components/BulkUploadModal/BulkUploadModal'
import EditColumnsPopover from './components/EditColumnsPopover/EditColumnsPopover'
import { useColumnPreferences } from './hooks/useColumnPreferences'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import type { RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import LimitedAdminDrawer from './components/LimitedAdminDrawer/LimitedAdminDrawer'
import { loadUserFields } from '@/data/userFields'
import type { UserField } from '@/data/userFields'
import { isScopeValid, scopeCell, scopeGroups, scopeSummary } from './limitedAdmin'
import type { FieldValues, LimitedAdminScope } from './limitedAdmin'
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
        <span className={`people-scope__values${cell.invalid ? ' people-scope__values--warning' : ''}`}>
          {cell.invalid && (
            <Danger size={16} variant="Bold" color="currentColor" className="people-scope__warn" />
          )}
          <span className="people-scope__list">{cell.values}</span>
          {cell.more && <span className="people-scope__more">{cell.more}</span>}
        </span>
        {cell.field && <span className="people-scope__field">{cell.field}</span>}
      </div>
    </Tooltip>
  )
}

function People() {
  const [activeTab, setActiveTab] = useState('Active People')
  const [search, setSearch] = useState('')
  const [people, setPeople] = useState(initialPeople)
  const [deactivatedPeople, setDeactivatedPeople] = useState(initialDeactivated)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [confirmInput, setConfirmInput] = useState('')
  const [deactivateReason, setDeactivateReason] = useState<'terminated' | 'long-leave'>('long-leave')
  const [sortCol, setSortCol] = useState<'name' | 'status' | 'role' | 'region' | 'deactivatedOn'>('deactivatedOn')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'terminated' | 'long-leave'>('all')
  const { toasts, show: showToast } = useToast()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [editColumnsOpen, setEditColumnsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  const userFields = useMemo(() => loadUserFields(), [])

  /* Limited Admin drawer + the remove-role confirm it can lead to. */
  const [limitedAdminPerson, setLimitedAdminPerson] = useState<PersonRow | null>(null)
  const [removeAdminPerson, setRemoveAdminPerson] = useState<PersonRow | null>(null)

  const { visibleKeys, toggleColumn, resetToDefault, allColumns } = useColumnPreferences(userFields)

  /* Row menu, per Figma People 8572:654. The three role actions carry a line of
     supporting text: the access levels are close enough that their names alone
     do not separate them. */
  function rowMenuItems(person: PersonRow): RowMenuItem[] {
    const icon = (Icon: typeof Edit2, color = 'var(--text-primary)') => (
      <Icon size={20} color={color} variant="Linear" />
    )
    return [
      { key: 'edit', label: 'Edit user profile', icon: icon(Edit2) },
      /* Every item in this menu stays enabled, including the ones that lead
         nowhere yet: a greyed row in a short menu reads as broken. */
      { key: 'change-manager', label: 'Change Manager', icon: icon(Profile2User) },
      {
        key: 'admin',
        label: 'Make user Admin',
        description: 'Full access to everything in the account',
        icon: icon(ShieldSecurity),
        dividerBefore: true,
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
        label: 'Make user Subject Expert',
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
        dividerBefore: true,
      },
    ]
  }

  function handleRowAction(key: string, person: PersonRow) {
    if (key === 'limited-admin') setLimitedAdminPerson(person)
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
    'Active People',
    'Limited Admins',
    'Managers',
    'Subject Experts',
    `Deactivated (${deactivatedPeople.length})`,
  ]

  const isDeactivatedTab = activeTab.startsWith('Deactivated')
  const isLimitedAdminsTab = activeTab === 'Limited Admins'

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

  /* ─── Tab switch: clear selection + menu ─── */

  function handleTabSwitch(tab: string) {
    setActiveTab(tab)
    setSelectedIds(new Set())
    setOpenMenuId(null)
    setSearch('')
    setStatusFilter('all')
  }

  /* ─── Click outside to close menu ─── */

  useEffect(() => {
    if (openMenuId === null) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    /* listbox.md: Esc closes the menu. */
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openMenuId])

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

  /* ─── Track horizontal scroll for frozen column styling ─── */

  const [hasScroll, setHasScroll] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function onScroll() {
      setIsScrolled(el!.scrollLeft > 0)
    }

    function checkOverflow() {
      setHasScroll(el!.scrollWidth > el!.clientWidth)
    }

    el.addEventListener('scroll', onScroll)
    const ro = new ResizeObserver(checkOverflow)
    ro.observe(el)
    checkOverflow()

    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [isDeactivatedTab, visibleKeys])

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
      showToast('warning', `${person.name} has been reactivated but their previous team no longer exists. Please assign them to a team from the Active People tab.`)
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
          {!isDeactivatedTab && userFields.length > 0 && (
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

      {/* ═══ Active People Table ═══ */}
      {!isDeactivatedTab && (
        <div
          className={`people-table-scroll${hasScroll ? ' people-table-scroll--has-scroll' : ''}${isScrolled ? ' people-table-scroll--scrolled' : ''}`}
          ref={scrollRef}
        >
          <div className="people-table">
            <div className="people-table-header">
              <div className="people-table-cell people-table-cell--checkbox">
                <Checkbox checked={allSelected} onChange={toggleSelectAll} />
              </div>
              <div className="people-table-cell people-table-cell--name">Name</div>
              {visibleKeys.includes('role') && <div className="people-table-cell people-table-cell--role">Role</div>}
              {visibleKeys.includes('team') && <div className="people-table-cell people-table-cell--team">Team</div>}
              {visibleKeys.includes('reportsTo') && <div className="people-table-cell people-table-cell--reports">Reports to</div>}
              {/* Only where every row has one: elsewhere the column would be
                  empty for all but a handful of people. */}
              {isLimitedAdminsTab && <div className="people-table-cell people-table-cell--scope">Scope</div>}
              {visibleKeys.includes('region') && <div className="people-table-cell people-table-cell--region">Region</div>}
              {visibleKeys.includes('status') && <div className="people-table-cell people-table-cell--status">Status</div>}
              {visibleKeys.filter(k => k.startsWith('custom-')).map(key => {
                const col = allColumns.find(c => c.key === key)
                return col ? <div key={key} className="people-table-cell people-table-cell--custom">{col.label}</div> : null
              })}
              <div className="people-table-cell people-table-cell--actions" />
            </div>

            {filteredPeople.map((person) => (
              <div
                className={`people-table-row${selectedIds.has(person.id) ? ' people-table-row--selected' : ''}`}
                key={person.id}
              >
                <div className="people-table-cell people-table-cell--checkbox">
                  <Checkbox checked={selectedIds.has(person.id)} onChange={() => toggleSelect(person.id)} />
                </div>
                <div className="people-table-cell people-table-cell--name">
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
                </div>
                {visibleKeys.includes('role') && (
                  <div className="people-table-cell people-table-cell--role">
                    <span className="people-role-cell">
                      {person.role}
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
                  </div>
                )}
                {visibleKeys.includes('team') && <div className="people-table-cell people-table-cell--team">{person.team}</div>}
                {visibleKeys.includes('reportsTo') && <div className="people-table-cell people-table-cell--reports">{person.reportsTo}</div>}
                {isLimitedAdminsTab && (
                  <div className="people-table-cell people-table-cell--scope">
                    {person.limitedAdmin && (
                      <ScopeCellView
                        scope={person.limitedAdmin}
                        fields={userFields}
                        onOpen={() => setLimitedAdminPerson(person)}
                      />
                    )}
                  </div>
                )}
                {visibleKeys.includes('region') && <div className="people-table-cell people-table-cell--region">{person.region}</div>}
                {visibleKeys.includes('status') && (
                  <div className="people-table-cell people-table-cell--status">
                    <span className={`people-badge people-badge--${person.status.toLowerCase()}`}>
                      {person.status}
                    </span>
                  </div>
                )}
                {visibleKeys.filter(k => k.startsWith('custom-')).map(key => (
                  <div key={key} className="people-table-cell people-table-cell--custom">
                    {person.fieldValues?.[Number(key.replace('custom-', ''))] ?? '–'}
                  </div>
                ))}
                <div className="people-table-cell people-table-cell--actions">
                  <RowActionsMenu
                    items={rowMenuItems(person)}
                    onSelect={(key) => handleRowAction(key, person)}
                    ariaLabel={`Actions for ${person.name}`}
                    triggerClassName="people-more-btn"
                    triggerContent={<MoreIcon size={24} color="var(--text-tertiary)" />}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Deactivated Table ═══ */}
      {isDeactivatedTab && (
        <>
          {deactivatedPeople.length === 0 ? (
            <div className="people-empty-state">
              <ProfileRemove size={48} color="var(--text-tertiary)" variant="Linear" />
              <h3 className="people-empty-state-title">No deactivated users</h3>
              <p className="people-empty-state-desc">
                When you deactivate someone from the Active People tab, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="people-table">
              <div className="people-table-header">
                <div className="people-table-cell people-table-cell--checkbox">
                  <Checkbox checked={allSelected} onChange={toggleSelectAll} />
                </div>
                <div className={`people-table-cell people-table-cell--name people-table-cell--sortable${sortCol === 'name' ? ' people-table-cell--sorted' : ''}`} onClick={() => toggleSort('name')}>
                  Name
                  {sortCol === 'name' && (sortDir === 'asc' ? <ArrowUp2 size={16} color="var(--text-tertiary)" /> : <ArrowDown2 size={16} color="var(--text-tertiary)" />)}
                </div>
                <div className={`people-table-cell people-table-cell--status-d people-table-cell--sortable${sortCol === 'status' ? ' people-table-cell--sorted' : ''}`} onClick={() => toggleSort('status')}>
                  Status
                  {sortCol === 'status' && (sortDir === 'asc' ? <ArrowUp2 size={16} color="var(--text-tertiary)" /> : <ArrowDown2 size={16} color="var(--text-tertiary)" />)}
                </div>
                <div className={`people-table-cell people-table-cell--role-d people-table-cell--sortable${sortCol === 'role' ? ' people-table-cell--sorted' : ''}`} onClick={() => toggleSort('role')}>
                  Role
                  {sortCol === 'role' && (sortDir === 'asc' ? <ArrowUp2 size={16} color="var(--text-tertiary)" /> : <ArrowDown2 size={16} color="var(--text-tertiary)" />)}
                </div>
                <div className="people-table-cell people-table-cell--team-d">Team</div>
                <div className={`people-table-cell people-table-cell--region-d people-table-cell--sortable${sortCol === 'region' ? ' people-table-cell--sorted' : ''}`} onClick={() => toggleSort('region')}>
                  Region
                  {sortCol === 'region' && (sortDir === 'asc' ? <ArrowUp2 size={16} color="var(--text-tertiary)" /> : <ArrowDown2 size={16} color="var(--text-tertiary)" />)}
                </div>
                <div className={`people-table-cell people-table-cell--deactivated people-table-cell--sortable${sortCol === 'deactivatedOn' ? ' people-table-cell--sorted' : ''}`} onClick={() => toggleSort('deactivatedOn')}>
                  Deactivated on
                  {sortCol === 'deactivatedOn' && (sortDir === 'asc' ? <ArrowUp2 size={16} color="var(--text-tertiary)" /> : <ArrowDown2 size={16} color="var(--text-tertiary)" />)}
                </div>
                <div className="people-table-cell people-table-cell--actions" />
              </div>

              {filteredDeactivated.map((person) => (
                <div
                  className={`people-table-row${selectedIds.has(person.id) ? ' people-table-row--selected' : ''}`}
                  key={person.id}
                >
                  <div className="people-table-cell people-table-cell--checkbox">
                    <Checkbox checked={selectedIds.has(person.id)} onChange={() => toggleSelect(person.id)} />
                  </div>
                  <div className="people-table-cell people-table-cell--name">
                    <div className="people-avatar" style={{ background: avatarColors[(person.id - 1) % avatarColors.length] }}>
                      {person.avatar}
                    </div>
                    <div className="people-name-info">
                      <span className="people-name">{person.name}</span>
                      <span className="people-email">{person.email}</span>
                    </div>
                  </div>
                  <div className="people-table-cell people-table-cell--status-d">
                    {person.status === 'terminated' ? (
                      <Badge type="error" label="Terminated" />
                    ) : (
                      <Badge type="warning" label="Long Leave" />
                    )}
                  </div>
                  <div className="people-table-cell people-table-cell--role-d">{person.role}</div>
                  <div className="people-table-cell people-table-cell--team-d">{person.team || '–'}</div>
                  <div className="people-table-cell people-table-cell--region-d">{person.region}</div>
                  <div className="people-table-cell people-table-cell--deactivated">
                    <div className="people-date-stack">
                      <span>{person.deactivatedOn.replace(/,?\s*\d{4}$/, ',')}</span>
                      <span className="people-date-stack__year">{person.deactivatedOn.match(/\d{4}$/)?.[0]}</span>
                    </div>
                  </div>
                  <div className="people-table-cell people-table-cell--actions">
                    <div className="people-more-wrapper" ref={openMenuId === person.id ? menuRef : undefined}>
                      <button
                        className="people-more-btn"
                        aria-label="More actions"
                        onClick={() => setOpenMenuId(openMenuId === person.id ? null : person.id)}
                      >
                        <MoreIcon size={24} color="var(--text-tertiary)" />
                      </button>
                      {openMenuId === person.id && (
                        <div className="people-action-menu">
                          <div className="people-action-menu-caret" />
                          <button
                            className="people-action-menu-item"
                            onClick={() => {
                              setOpenMenuId(null)
                              handleReactivateSingle(person)
                            }}
                          >
                            Reactivate
                          </button>
                          <button
                            className="people-action-menu-item"
                            onClick={() => {
                              setOpenMenuId(null)
                              setDeactivatedPeople(prev =>
                                prev.map(p =>
                                  p.id === person.id
                                    ? { ...p, status: person.status === 'terminated' ? 'long-leave' as const : 'terminated' as const }
                                    : p
                                )
                              )
                              showToast('success', `${person.name} status changed to ${person.status === 'terminated' ? 'Long Leave' : 'Terminated'}`)
                            }}
                          >
                            {person.status === 'terminated' ? 'Change to Long Leave' : 'Change to Terminated'}
                          </button>
                          <button
                            className="people-action-menu-item people-action-menu-item--danger"
                            onClick={() => {
                              setOpenMenuId(null)
                              setModal({ type: 'delete-single', person })
                            }}
                          >
                            Delete Permanently
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ Bulk action bar — Active People ═══ */}
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
            setActiveTab('Active People')
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
              {scopeGroups(removeAdminPerson.limitedAdmin, userFields).map((group) => (
                <div className="people-remove-scope__group" key={group.field}>
                  <span className="people-remove-scope__field">{group.field}</span>
                  <div className="people-remove-scope__values">
                    {group.values.map((value) => (
                      <Badge key={value} type="informative" label={value} />
                    ))}
                  </div>
                </div>
              ))}
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
