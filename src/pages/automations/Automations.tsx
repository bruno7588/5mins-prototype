import { useState, useRef, useEffect, useMemo } from 'react'
import {
  UserCirlceAdd,
  Medal,
  More,
  Edit2,
  Copy,
  Trash,
  Danger,
  Activity,
  Calendar,
  Flash,
  SearchNormal1,
  ArrowDown,
  ArrowUp,
  ArrowDown2,
  ArrowUp2,
  ArrowLeft2,
  ArrowRight2,
} from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import ForceTriggerModal from './ForceTriggerModal'
import AutomationDetailsModal, { type AutomationDetailsMode } from './AutomationDetailsModal'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import './Automations.css'

type Tab = 'manage' | 'activity'
type SortDirection = 'asc' | 'desc'
type StateFilter = 'all' | 'active' | 'inactive' | 'deleted'

export type EnrollmentType =
  | { kind: 'immediate' }
  | { kind: 'after-delay'; days: number; relativeTo: 'registration' | 'previous-course' }

export type DueDateConfig =
  | { kind: 'none' }
  | { kind: 'relative'; daysAfterStart: number }

export type RecurrenceUnit = 'months' | 'weeks'

export type RecurrenceConfig =
  | { enabled: false }
  | { enabled: true; interval: number; unit: RecurrenceUnit }

export interface AutomationCourse {
  id: string
  name: string
  enrollmentType: EnrollmentType
  dueDate: DueDateConfig
  recurrence: RecurrenceConfig
}

export interface AutomationRow {
  id: string
  name: string
  lastUpdated: string
  active: boolean
  courses: AutomationCourse[]
}

export interface User {
  id: string
  name: string
  email: string
}

interface TriggerRow {
  id: string
  user: User
  automationId: string
  // Snapshot of the automation name at trigger time. Required for deleted
  // automations (where the FK no longer resolves) so the admin can still see
  // what the user was originally enrolled in. Optional for live automations
  // since we resolve via automationId in that case.
  automationNameSnapshot?: string
  triggeredAt: string // ISO date
}

function parseDelay(delay: string): EnrollmentType {
  if (delay === '0 days after registration') return { kind: 'immediate' }
  const match = delay.match(/^(\d+)\s+days?\s+after\s+previous\s+course$/)
  return match
    ? { kind: 'after-delay', days: Number(match[1]), relativeTo: 'previous-course' }
    : { kind: 'immediate' }
}

function mkCourses(
  prefix: string,
  rows: Array<[name: string, delay: string, dueDays?: number, repeatMonths?: number]>,
): AutomationCourse[] {
  return rows.map(([name, delay, dueDays, repeatMonths], i) => ({
    id: `${prefix}-c${i + 1}`,
    name,
    enrollmentType: parseDelay(delay),
    dueDate: dueDays != null ? { kind: 'relative', daysAfterStart: dueDays } : { kind: 'none' },
    recurrence: repeatMonths != null ? { enabled: true, interval: repeatMonths, unit: 'months' } : { enabled: false },
  }))
}

const mockAutomations: AutomationRow[] = [
  {
    id: '1',
    name: 'New Hire Compliance Onboarding',
    lastUpdated: 'Sep 30, 2024',
    active: true,
    courses: mkCourses('1', [
      ['Welcome to the Company', '0 days after registration'],
      ['Code of Conduct Essentials', '1 day after previous course', 7, 12],
      ['Workplace Health & Safety', '1 day after previous course', 7],
      ['Information Security 101', '2 days after previous course', 14, 12],
      ['Anti-Harassment Foundations', '2 days after previous course', 14],
      ['Data Privacy & GDPR Basics', '3 days after previous course'],
      ['Diversity, Equity & Inclusion', '3 days after previous course'],
    ]),
  },
  {
    id: '2',
    name: 'Quarterly Refresher — Food Safety',
    lastUpdated: 'Sep 28, 2024',
    active: true,
    courses: mkCourses('2', [
      ['HACCP Refresher', '0 days after registration', 7, 3],
      ['Allergen Awareness', '2 days after previous course', 7, 3],
      ['Cross-Contamination Prevention', '2 days after previous course', 7, 3],
      ['Personal Hygiene Standards', '3 days after previous course', undefined, 3],
      ['Cold Chain Management', '3 days after previous course'],
      ['Cleaning & Sanitisation Protocols', '4 days after previous course'],
      ['Food Storage & Labelling', '4 days after previous course'],
    ]),
  },
  {
    id: '3',
    name: 'Annual Anti-Harassment Training',
    lastUpdated: 'Sep 24, 2024',
    active: true,
    courses: mkCourses('3', [
      ['Recognising Harassment', '0 days after registration', 14, 12],
      ['Bystander Intervention', '3 days after previous course', 14, 12],
      ['Reporting Procedures', '3 days after previous course', 14, 12],
    ]),
  },
  {
    id: '4',
    name: 'GDPR Privacy Awareness',
    lastUpdated: 'Sep 22, 2024',
    active: true,
    courses: mkCourses('4', [
      ['GDPR Fundamentals', '0 days after registration', undefined, 6],
      ['Handling Personal Data', '2 days after previous course', 7],
      ['Data Subject Rights', '2 days after previous course', 7],
      ['Incident Response Basics', '3 days after previous course'],
      ['Cross-Border Data Transfers', '3 days after previous course'],
    ]),
  },
  {
    id: '5',
    name: 'Cybersecurity Essentials Q3',
    lastUpdated: 'Sep 18, 2024',
    active: true,
    courses: mkCourses('5', [
      ['Phishing & Social Engineering', '0 days after registration', 7, 3],
      ['Password & MFA Best Practices', '2 days after previous course', 7, 3],
      ['Device Security', '2 days after previous course'],
      ['Secure Remote Work', '3 days after previous course'],
      ['Reporting Incidents', '3 days after previous course'],
      ['Cloud Storage Hygiene', '4 days after previous course'],
    ]),
  },
  {
    id: '6',
    name: 'Manager 30-Day Check-in',
    lastUpdated: 'Sep 12, 2024',
    active: true,
    courses: mkCourses('6', [
      ['Coaching Fundamentals', '0 days after registration'],
      ['Giving Effective Feedback', '3 days after previous course'],
      ['Setting 30/60/90 Goals', '3 days after previous course'],
    ]),
  },
  {
    id: '7',
    name: 'Health & Safety Briefing',
    lastUpdated: 'Sep 5, 2024',
    active: true,
    courses: mkCourses('7', [
      ['Health & Safety: The Workplace (UK)', '0 days after registration', 14, 12],
      ['Health & Safety: Working From Home (UK)', '1 day after previous course', 14, 12],
      ['First Aid Essentials', '2 days after previous course'],
      ['Emergency Evacuation Procedures', '3 days after previous course'],
    ]),
  },
  {
    id: '8',
    name: 'Diversity & Inclusion 2024',
    lastUpdated: 'Aug 30, 2024',
    active: false,
    courses: mkCourses('8', [
      ['Inclusive Language', '0 days after registration'],
      ['Unconscious Bias', '2 days after previous course'],
      ['Allyship in Practice', '2 days after previous course'],
    ]),
  },
  {
    id: '9',
    name: 'Remote Work Best Practices',
    lastUpdated: 'Aug 22, 2024',
    active: false,
    courses: mkCourses('9', [
      ['Asynchronous Communication', '0 days after registration'],
      ['Home Office Ergonomics', '2 days after previous course', 7],
      ['Time Management at Home', '2 days after previous course', 7],
    ]),
  },
  {
    id: '10',
    name: 'Code of Conduct Refresher',
    lastUpdated: 'Aug 14, 2024',
    active: false,
    courses: mkCourses('10', [['Code of Conduct 2024 Update', '0 days after registration', 14, 6]]),
  },
  {
    id: '11',
    name: 'Sales Onboarding Sprint',
    lastUpdated: 'Aug 8, 2024',
    active: false,
    courses: mkCourses('11', [
      ['Product Overview', '0 days after registration'],
      ['Discovery Calls', '1 day after previous course'],
      ['Objection Handling', '2 days after previous course'],
      ['Closing Techniques', '2 days after previous course'],
      ['CRM Hygiene', '3 days after previous course'],
    ]),
  },
  {
    id: '12',
    name: 'Customer Service Standards',
    lastUpdated: 'Jul 30, 2024',
    active: false,
    courses: mkCourses('12', [
      ['Service Mindset', '0 days after registration'],
      ['Handling Difficult Customers', '2 days after previous course', 7],
      ['Tone & Empathy', '2 days after previous course'],
      ['Escalation Procedures', '3 days after previous course'],
    ]),
  },
  {
    id: '13',
    name: 'Fire Safety Drill Series',
    lastUpdated: 'Jul 21, 2024',
    active: false,
    courses: mkCourses('13', [
      ['Fire Drill Procedures', '0 days after registration', 7, 6],
      ['Extinguisher Use', '2 days after previous course', 7, 6],
    ]),
  },
  {
    id: '14',
    name: 'Product Knowledge Bootcamp',
    lastUpdated: 'Jul 12, 2024',
    active: false,
    courses: mkCourses('14', [
      ['Product Lineup', '0 days after registration'],
      ['Pricing & Plans', '1 day after previous course'],
      ['Competitive Landscape', '2 days after previous course'],
      ['Customer Personas', '2 days after previous course'],
      ['Feature Deep Dives', '3 days after previous course'],
      ['Roadmap Highlights', '3 days after previous course'],
    ]),
  },
]

const PAGE_SIZE = 10
const DELETED_AUTOMATION_ID = 'deleted-1'

const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Johnson', email: 'sarah.johnson@acme.co' },
  { id: 'u2', name: 'Marcus Chen', email: 'marcus.chen@acme.co' },
  { id: 'u3', name: 'Aisha Patel', email: 'aisha.patel@acme.co' },
  { id: 'u4', name: 'Liam O’Connor', email: 'liam.oconnor@acme.co' },
  { id: 'u5', name: 'Sofia Rossi', email: 'sofia.rossi@acme.co' },
  { id: 'u6', name: 'Daniel Park', email: 'daniel.park@acme.co' },
  { id: 'u7', name: 'Emma Wright', email: 'emma.wright@acme.co' },
  { id: 'u8', name: 'Olufemi Adeyemi', email: 'olufemi.adeyemi@acme.co' },
  { id: 'u9', name: 'Hannah Mitchell', email: 'hannah.mitchell@acme.co' },
  { id: 'u10', name: 'Tomás García', email: 'tomas.garcia@acme.co' },
  { id: 'u11', name: 'Yuki Tanaka', email: 'yuki.tanaka@acme.co' },
  { id: 'u12', name: 'Priya Sharma', email: 'priya.sharma@acme.co' },
  { id: 'u13', name: 'Noah Williams', email: 'noah.williams@acme.co' },
  { id: 'u14', name: 'Zara Ahmed', email: 'zara.ahmed@acme.co' },
  { id: 'u15', name: 'Ethan Murphy', email: 'ethan.murphy@acme.co' },
  { id: 'u16', name: 'Mila Petrov', email: 'mila.petrov@acme.co' },
  { id: 'u17', name: 'Caleb Brooks', email: 'caleb.brooks@acme.co' },
  { id: 'u18', name: 'Isabella Costa', email: 'isabella.costa@acme.co' },
]

// 20 trigger rows mixed across automations + 2 deleted
const mockTriggers: TriggerRow[] = [
  { id: 't1', user: mockUsers[0], automationId: '1', triggeredAt: '2026-04-07' },
  { id: 't2', user: mockUsers[1], automationId: '3', triggeredAt: '2026-04-05' },
  { id: 't3', user: mockUsers[2], automationId: '1', triggeredAt: '2026-04-03' },
  { id: 't4', user: mockUsers[3], automationId: '4', triggeredAt: '2026-04-01' },
  { id: 't5', user: mockUsers[4], automationId: '5', triggeredAt: '2026-03-29' },
  { id: 't6', user: mockUsers[5], automationId: '1', triggeredAt: '2026-03-26' },
  { id: 't7', user: mockUsers[6], automationId: '3', triggeredAt: '2026-03-23' },
  { id: 't8', user: mockUsers[7], automationId: DELETED_AUTOMATION_ID, automationNameSnapshot: 'Legacy Onboarding 2023', triggeredAt: '2026-03-20' },
  { id: 't9', user: mockUsers[8], automationId: '7', triggeredAt: '2026-03-18' },
  { id: 't10', user: mockUsers[9], automationId: '1', triggeredAt: '2026-03-15' },
  { id: 't11', user: mockUsers[10], automationId: '4', triggeredAt: '2026-03-13' },
  { id: 't12', user: mockUsers[11], automationId: '3', triggeredAt: '2026-03-10' },
  { id: 't13', user: mockUsers[12], automationId: '6', triggeredAt: '2026-03-07' },
  { id: 't14', user: mockUsers[13], automationId: '5', triggeredAt: '2026-03-05' },
  { id: 't15', user: mockUsers[14], automationId: '1', triggeredAt: '2026-03-02' },
  { id: 't16', user: mockUsers[15], automationId: DELETED_AUTOMATION_ID, automationNameSnapshot: 'Pre-2024 Compliance Pack', triggeredAt: '2026-02-28' },
  { id: 't17', user: mockUsers[16], automationId: '7', triggeredAt: '2026-02-26' },
  { id: 't18', user: mockUsers[17], automationId: '3', triggeredAt: '2026-02-25' },
  { id: 't19', user: mockUsers[0], automationId: '4', triggeredAt: '2026-02-25' },
  { id: 't20', user: mockUsers[2], automationId: '2', triggeredAt: '2026-02-25' },
]

function formatTriggerDate(iso: string): { day: string; year: string } {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, '0')
  return {
    day: `${months[d.getUTCMonth()]} ${day},`,
    year: String(d.getUTCFullYear()),
  }
}

// Demo mode: read once on mount from ?demo= URL param.
// Lets prototype reviewers preview empty states without editing source.
//   ?demo=no-automations  → empty automations + empty triggers
//   ?demo=no-triggers     → automations exist, no triggers
//   (anything else / absent) → normal mock data
type DemoMode = 'no-automations' | 'no-triggers' | null
function readDemoMode(): DemoMode {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('demo')
  if (value === 'no-automations' || value === 'no-triggers') return value
  return null
}

function Automations() {
  const [activeTab, setActiveTab] = useState<Tab>('manage')
  const [demoMode] = useState<DemoMode>(readDemoMode)
  const [automations, setAutomations] = useState<AutomationRow[]>(
    demoMode === 'no-automations' ? [] : mockAutomations,
  )
  const [effectiveTriggers, setEffectiveTriggers] = useState<TriggerRow[]>(
    demoMode === 'no-automations' || demoMode === 'no-triggers' ? [] : mockTriggers,
  )
  // Derived stats — kept in sync with effectiveTriggers so demo modes
  // and real-world empty accounts both show 0 instead of stale constants.
  const totalTriggersCount = effectiveTriggers.length
  const thisMonthTriggersCount = useMemo(() => {
    const now = new Date()
    const yyyyMm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return effectiveTriggers.filter((t) => t.triggeredAt.startsWith(yyyyMm)).length
  }, [effectiveTriggers])

  // Activity tab state
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<StateFilter>('all')
  const [automationFilterId, setAutomationFilterId] = useState<string>('all')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<'state' | 'automation' | null>(null)
  const stateDropdownRef = useRef<HTMLDivElement>(null)
  const automationDropdownRef = useRef<HTMLDivElement>(null)

  // Manage tab row action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Delete confirmation modal
  const [pendingDelete, setPendingDelete] = useState<AutomationRow | null>(null)
  const [confirmInput, setConfirmInput] = useState('')

  // Force trigger modal
  const [forceTriggerAutomation, setForceTriggerAutomation] = useState<AutomationRow | null>(null)

  // Automation details modal (full-screen)
  const [detailsAutomation, setDetailsAutomation] = useState<AutomationRow | null>(null)
  const [detailsMode, setDetailsMode] = useState<AutomationDetailsMode>('edit')

  function openDetails(automation: AutomationRow, mode: AutomationDetailsMode) {
    setDetailsMode(mode)
    setDetailsAutomation(automation)
  }

  function closeDetails() {
    setDetailsAutomation(null)
  }

  // Toasts
  const { toasts, show: showToast } = useToast()

  function saveAutomation(automation: AutomationRow) {
    if (detailsMode === 'edit') {
      setAutomations((rows) =>
        rows.map((r) => (r.id === automation.id ? { ...r, lastUpdated: 'Just now' } : r)),
      )
      showToast('success', 'Automation updated')
    } else {
      setAutomations((rows) => [{ ...automation, lastUpdated: 'Just now' }, ...rows])
      showToast('success', 'Automation created')
    }
    closeDetails()
  }

  function handleForceTrigger(automationId: string, userIds: string[]) {
    const automation = automations.find((a) => a.id === automationId)
    if (!automation || userIds.length === 0) return

    // TODO: Replace with actual API call — handle partial failure (some users
    // succeed, some fail). For the prototype we simulate full success.
    const now = new Date().toISOString().slice(0, 10) // YYYY-MM-DD to match existing rows
    const newRows: TriggerRow[] = userIds
      .map((id) => mockUsers.find((u) => u.id === id))
      .filter((u): u is User => !!u)
      .map((user, i) => ({
        id: `t-ft-${Date.now()}-${i}`,
        user,
        automationId,
        triggeredAt: now,
      }))

    setEffectiveTriggers((rows) => [...newRows, ...rows])
  }

  const activeAutomationsCount = automations.filter((a) => a.active).length

  // Lookup helpers
  const automationsById = useMemo(() => {
    const map = new Map<string, AutomationRow>()
    automations.forEach((a) => map.set(a.id, a))
    return map
  }, [automations])

  // Filter + sort + paginate triggers
  const filteredTriggers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let rows = effectiveTriggers
    if (q) {
      rows = rows.filter(
        (t) =>
          t.user.name.toLowerCase().includes(q) || t.user.email.toLowerCase().includes(q),
      )
    }
    if (automationFilterId !== 'all') {
      rows = rows.filter((t) => t.automationId === automationFilterId)
    }
    if (stateFilter !== 'all') {
      rows = rows.filter((t) => {
        const automation = automationsById.get(t.automationId)
        if (stateFilter === 'deleted') return !automation
        if (stateFilter === 'active') return !!automation && automation.active
        if (stateFilter === 'inactive') return !!automation && !automation.active
        return true
      })
    }
    rows = [...rows].sort((a, b) => {
      const cmp = a.triggeredAt.localeCompare(b.triggeredAt)
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return rows
  }, [searchQuery, stateFilter, automationFilterId, sortDirection, automationsById, effectiveTriggers])

  const totalRows = filteredTriggers.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalRows)
  const pageRows = filteredTriggers.slice(pageStart, pageEnd)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, stateFilter, automationFilterId, sortDirection])

  // Click-outside for filter dropdowns
  useEffect(() => {
    if (openDropdown === null) return
    function onMouseDown(e: MouseEvent) {
      const ref = openDropdown === 'state' ? stateDropdownRef : automationDropdownRef
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [openDropdown])

  // Click-outside for row action menu
  useEffect(() => {
    if (openMenuId === null) return
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [openMenuId])

  function requestDeleteAutomation(id: string) {
    const automation = automations.find((a) => a.id === id)
    if (!automation) return
    setPendingDelete(automation)
    setConfirmInput('')
  }

  function closeDeleteModal() {
    setPendingDelete(null)
    setConfirmInput('')
  }

  function confirmDeleteAutomation() {
    if (!pendingDelete) return
    setAutomations((rows) => rows.filter((r) => r.id !== pendingDelete.id))
    closeDeleteModal()
  }

  function editAutomation(id: string) {
    const automation = automations.find((a) => a.id === id)
    if (automation) openDetails(automation, 'edit')
  }

  function duplicateAutomation(id: string) {
    const automation = automations.find((a) => a.id === id)
    if (!automation) return
    const tempId = `duplicate-${automation.id}-${Date.now()}`
    openDetails(
      {
        id: tempId,
        name: `Copy of ${automation.name}`,
        lastUpdated: new Date().toISOString().slice(0, 10),
        active: false,
        courses: automation.courses.map((c, i) => ({
          ...c,
          id: `${tempId}-c${i + 1}`,
        })),
      },
      'duplicate',
    )
  }

  function patchCourse(
    automationId: string,
    courseId: string,
    patch: Partial<AutomationCourse>,
  ) {
    const apply = (a: AutomationRow): AutomationRow => ({
      ...a,
      courses: a.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)),
    })
    setAutomations((rows) => rows.map((r) => (r.id === automationId ? apply(r) : r)))
    setDetailsAutomation((current) =>
      current && current.id === automationId ? apply(current) : current,
    )
  }

  function removeCourse(automationId: string, courseId: string) {
    const apply = (a: AutomationRow): AutomationRow => ({
      ...a,
      courses: a.courses.filter((c) => c.id !== courseId),
    })
    setAutomations((rows) => rows.map((r) => (r.id === automationId ? apply(r) : r)))
    setDetailsAutomation((current) =>
      current && current.id === automationId ? apply(current) : current,
    )
  }

  function reorderCourses(automationId: string, fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const apply = (a: AutomationRow): AutomationRow => {
      const next = a.courses.slice()
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { ...a, courses: next }
    }
    setAutomations((rows) => rows.map((r) => (r.id === automationId ? apply(r) : r)))
    setDetailsAutomation((current) =>
      current && current.id === automationId ? apply(current) : current,
    )
  }

  function toggleActive(id: string) {
    setAutomations((rows) =>
      rows.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    )
  }

  function toggleSort() {
    setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))
  }

  function clearFilters() {
    setSearchQuery('')
    setStateFilter('all')
    setAutomationFilterId('all')
  }

  const hasAnyTriggers = effectiveTriggers.length > 0
  const hasActiveFilters =
    searchQuery.trim() !== '' || stateFilter !== 'all' || automationFilterId !== 'all'
  const currentMonthLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const stateDropdownLabel =
    stateFilter === 'all'
      ? 'All states'
      : stateFilter === 'active'
      ? 'Active'
      : stateFilter === 'inactive'
      ? 'Inactive'
      : 'Deleted'

  const automationDropdownLabel =
    automationFilterId === 'all'
      ? 'All Automations'
      : automationsById.get(automationFilterId)?.name ?? 'All Automations'

  const stateOptions: { value: StateFilter; label: string }[] = [
    { value: 'all', label: 'All states' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'deleted', label: 'Deleted' },
  ]

  return (
    <div className="automations-layout">
      <LeftSidebar />
      <main className="automations-main">
        <div className="automations-header">
          <div className="automations-title-group">
            <h2 className="automations-title">Automations</h2>
            <p className="automations-description">
              Manage enrollment automations and review trigger history.{' '}
              <a className="automations-description-link" href="#">
                Here is how it works
              </a>
            </p>
          </div>
          <div className="page-header-divider" />
          <div className="automations-tabs">
            <button
              className={`automations-tab${activeTab === 'manage' ? ' automations-tab--active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              Manage
            </button>
            <button
              className={`automations-tab${activeTab === 'activity' ? ' automations-tab--active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>
        </div>

        {activeTab === 'manage' && (
          <div className="automations-manage">
            <div className="automations-templates">
              <button
                type="button"
                className="automations-template automations-template--purple"
                onClick={() =>
                  openDetails(
                    {
                      id: 'template-new-employee',
                      name: 'Copy of New Employee Onboarding',
                      lastUpdated: new Date().toISOString().slice(0, 10),
                      active: false,
                      courses: [],
                    },
                    'new',
                  )
                }
              >
                <span className="automations-template-icon">
                  <UserCirlceAdd size={48} color="#8158EC" variant="Linear" />
                </span>
                <span className="automations-template-body">
                  <span className="automations-template-title">New Employee Automation</span>
                  <span className="automations-template-desc">
                    Enrol new employees in onboarding courses automatically.
                    <br />
                    Requires HRIS integration.
                  </span>
                </span>
              </button>

              <button className="automations-template automations-template--blue">
                <span className="automations-template-icon">
                  <Medal size={48} color="#2A90D8" variant="Linear" />
                </span>
                <span className="automations-template-body">
                  <span className="automations-template-title">Existing Employee Automation</span>
                  <span className="automations-template-desc">
                    Create and automate training programs for both new and existing users.
                    <br />
                    Perfect for compliance training.
                  </span>
                </span>
              </button>
            </div>

            {automations.length > 0 && (
            <div className="automations-table">
              <div className="automations-table-header">
                <div className="automations-table-cell automations-table-cell--name">Automation</div>
                <div className="automations-table-cell automations-table-cell--date">Last updated</div>
                <div className="automations-table-cell automations-table-cell--toggle" />
                <div className="automations-table-cell automations-table-cell--actions" />
              </div>

              {automations.map((row) => (
                <div
                  key={row.id}
                  className={`automations-table-row${row.active ? '' : ' automations-table-row--inactive'}`}
                >
                  <div className="automations-table-cell automations-table-cell--name">{row.name}</div>
                  <div className="automations-table-cell automations-table-cell--date">{row.lastUpdated}</div>
                  <div className="automations-table-cell automations-table-cell--toggle">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.active}
                      className={`automations-toggle${row.active ? ' automations-toggle--on' : ''}`}
                      onClick={() => toggleActive(row.id)}
                    >
                      <span className="automations-toggle-thumb" />
                    </button>
                    <span className="automations-toggle-label">{row.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="automations-table-cell automations-table-cell--actions">
                    <div
                      className="automations-more-wrapper"
                      ref={openMenuId === row.id ? menuRef : undefined}
                    >
                      <button
                        type="button"
                        className="automations-row-action"
                        aria-label="More actions"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === row.id}
                        onClick={() =>
                          setOpenMenuId(openMenuId === row.id ? null : row.id)
                        }
                      >
                        <More size={20} color="var(--text-secondary)" variant="Linear" />
                      </button>
                      {openMenuId === row.id && (
                        <div className="automations-action-menu" role="menu">
                          <div className="automations-action-menu-caret" />
                          <button
                            type="button"
                            className="automations-action-menu-item"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuId(null)
                              editAutomation(row.id)
                            }}
                          >
                            <Edit2 size={20} color="var(--text-secondary)" variant="Linear" />
                            Edit automation
                          </button>
                          <button
                            type="button"
                            className="automations-action-menu-item"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuId(null)
                              duplicateAutomation(row.id)
                            }}
                          >
                            <Copy size={20} color="var(--text-secondary)" variant="Linear" />
                            Duplicate automation
                          </button>
                          <button
                            type="button"
                            className="automations-action-menu-item"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuId(null)
                              setAutomationFilterId(row.id)
                              setActiveTab('activity')
                            }}
                          >
                            <Activity size={20} color="var(--text-secondary)" variant="Linear" />
                            View activity
                          </button>
                          <button
                            type="button"
                            className="automations-action-menu-item"
                            role="menuitem"
                            disabled={!row.active}
                            data-tooltip={row.active ? undefined : 'Automation must be active'}
                            onClick={() => {
                              if (!row.active) return
                              setOpenMenuId(null)
                              setForceTriggerAutomation(row)
                            }}
                          >
                            <Flash
                              size={20}
                              color={row.active ? 'var(--text-secondary)' : 'var(--text-disabled)'}
                              variant="Linear"
                            />
                            Run automation
                          </button>
                          <button
                            type="button"
                            className="automations-action-menu-item automations-action-menu-item--danger"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuId(null)
                              requestDeleteAutomation(row.id)
                            }}
                          >
                            <Trash size={20} color="var(--danger-500)" variant="Linear" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="automations-activity">
            {automations.length > 0 && (
            <div className="automations-stat-cards">
              <div className="automations-stat-card">
                <span className="automations-stat-icon">
                  <Activity size={40} color="var(--button-background)" variant="Linear" />
                </span>
                <div className="automations-stat-info">
                  <p className="automations-stat-label">Total triggers</p>
                  <p className="automations-stat-value">{totalTriggersCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="automations-stat-card">
                <span className="automations-stat-icon">
                  <Calendar size={40} color="var(--lesson-quiz)" variant="Linear" />
                </span>
                <div className="automations-stat-info">
                  <p className="automations-stat-label">
                    This month <span className="automations-stat-label-meta">({currentMonthLabel})</span>
                  </p>
                  <p className="automations-stat-value">{thisMonthTriggersCount}</p>
                </div>
              </div>

              <div className="automations-stat-card">
                <span className="automations-stat-icon">
                  <Flash size={40} color="var(--success-500)" variant="Linear" />
                </span>
                <div className="automations-stat-info">
                  <p className="automations-stat-label">Active automations</p>
                  <p className="automations-stat-value">{activeAutomationsCount}</p>
                </div>
              </div>
            </div>
            )}

            {/* Filter bar: search left, automation dropdown right */}
            {hasAnyTriggers && (
            <div className="automations-filter-bar">
              <div className="automations-search">
                <SearchNormal1 size={18} color="var(--text-tertiary)" variant="Linear" />
                <input
                  type="text"
                  className="automations-search-input"
                  placeholder="Search by user name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="automations-search-clear"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery('')}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M14.375 14.375L5.625 5.625M14.375 5.625L5.625 14.375"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="automations-filter-dropdowns">
                <span className="automations-filter-label">Filter by</span>
                {/* State filter */}
                <div
                  className={`automations-dropdown automations-dropdown--state${openDropdown === 'state' ? ' automations-dropdown--open' : ''}`}
                  ref={stateDropdownRef}
                >
                  <button
                    type="button"
                    className="automations-dropdown-trigger"
                    onClick={() => setOpenDropdown((o) => (o === 'state' ? null : 'state'))}
                    aria-haspopup="listbox"
                    aria-expanded={openDropdown === 'state'}
                  >
                    <span className="automations-dropdown-value">{stateDropdownLabel}</span>
                    {openDropdown === 'state' ? (
                      <ArrowUp2 size={20} color="var(--text-secondary)" variant="Linear" />
                    ) : (
                      <ArrowDown2 size={20} color="var(--text-secondary)" variant="Linear" />
                    )}
                  </button>
                  {openDropdown === 'state' && (
                    <div className="automations-listbox" role="listbox">
                      {stateOptions.map((opt) => (
                        <button
                          type="button"
                          role="option"
                          key={opt.value}
                          aria-selected={stateFilter === opt.value}
                          className={`automations-listbox-item${stateFilter === opt.value ? ' automations-listbox-item--selected' : ''}`}
                          onClick={() => {
                            setStateFilter(opt.value)
                            setOpenDropdown(null)
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Automation filter */}
                <div
                  className={`automations-dropdown${openDropdown === 'automation' ? ' automations-dropdown--open' : ''}`}
                  ref={automationDropdownRef}
                >
                  <button
                    type="button"
                    className="automations-dropdown-trigger"
                    onClick={() => setOpenDropdown((o) => (o === 'automation' ? null : 'automation'))}
                    aria-haspopup="listbox"
                    aria-expanded={openDropdown === 'automation'}
                  >
                    <span className="automations-dropdown-value">{automationDropdownLabel}</span>
                    {openDropdown === 'automation' ? (
                      <ArrowUp2 size={20} color="var(--text-secondary)" variant="Linear" />
                    ) : (
                      <ArrowDown2 size={20} color="var(--text-secondary)" variant="Linear" />
                    )}
                  </button>
                  {openDropdown === 'automation' && (
                    <div className="automations-listbox" role="listbox">
                      <button
                        type="button"
                        role="option"
                        aria-selected={automationFilterId === 'all'}
                        className={`automations-listbox-item${automationFilterId === 'all' ? ' automations-listbox-item--selected' : ''}`}
                        onClick={() => {
                          setAutomationFilterId('all')
                          setOpenDropdown(null)
                        }}
                      >
                        All Automations
                      </button>
                      {automations.map((a) => (
                        <button
                          type="button"
                          role="option"
                          key={a.id}
                          aria-selected={automationFilterId === a.id}
                          className={`automations-listbox-item${automationFilterId === a.id ? ' automations-listbox-item--selected' : ''}`}
                          onClick={() => {
                            setAutomationFilterId(a.id)
                            setOpenDropdown(null)
                          }}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* Activity table */}
            <div className="automations-table">
              {pageRows.length > 0 && (
                <div className="automations-table-header">
                  <div className="automations-table-cell automations-table-cell--user">User</div>
                  <div className="automations-table-cell automations-table-cell--automation">Automation</div>
                  <button
                    type="button"
                    className="automations-table-cell automations-table-cell--triggered automations-table-cell--sortable"
                    onClick={toggleSort}
                    aria-label={`Sort by triggered date, currently ${sortDirection === 'desc' ? 'descending' : 'ascending'}`}
                  >
                    Triggered
                    {sortDirection === 'desc' ? (
                      <ArrowDown size={16} color="var(--text-secondary)" variant="Linear" />
                    ) : (
                      <ArrowUp size={16} color="var(--text-secondary)" variant="Linear" />
                    )}
                  </button>
                </div>
              )}

              {pageRows.length === 0 ? (
                !hasAnyTriggers ? (
                  <div className="automations-empty-state">
                    <Activity size={40} color="var(--text-tertiary)" variant="Linear" />
                    <p className="automations-empty-state-title">
                      {automations.length === 0 ? 'No automations yet' : 'No activity yet'}
                    </p>
                    <p className="automations-empty-state-body">
                      {automations.length === 0
                        ? "You haven't created any automations yet. Once an automation runs, every enrolment will show up here."
                        : "Your automations haven't run yet. Once one fires, every enrolment will show up here. If you were expecting activity, check that your automations are active in the Manage tab."}
                    </p>
                    <button
                      type="button"
                      className="automations-empty-state-action"
                      onClick={() => setActiveTab('manage')}
                    >
                      Go to Manage tab
                    </button>
                  </div>
                ) : (
                  <div className="automations-empty-state">
                    <SearchNormal1 size={40} color="var(--text-tertiary)" variant="Linear" />
                    <p className="automations-empty-state-title">No results match your filters</p>
                    <p className="automations-empty-state-body">
                      Try a different search or adjust your filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        className="automations-empty-state-action"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )
              ) : (
                pageRows.map((row) => {
                  const automation = automationsById.get(row.automationId)
                  const isDeleted = !automation
                  const isInactive = !isDeleted && !automation!.active
                  const automationCellClass =
                    'automations-table-cell automations-table-cell--automation' +
                    (isDeleted || isInactive ? ' automations-table-cell--automation-muted' : '')
                  return (
                    <div key={row.id} className="automations-table-row">
                      <div className="automations-table-cell automations-table-cell--user">
                        <span className="automations-user-name">{row.user.name}</span>
                        <span className="automations-user-email">{row.user.email}</span>
                      </div>
                      <div className={automationCellClass}>
                        {isDeleted ? (
                          <>
                            <span className="automations-automation-name--deleted">
                              {row.automationNameSnapshot ?? 'Deleted automation'}
                            </span>
                            <span className="badge badge--informative" role="status">Deleted</span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`automations-status-dot${
                                automation!.active
                                  ? ' automations-status-dot--active'
                                  : ' automations-status-dot--inactive'
                              }`}
                            />
                            <span>{automation!.name}</span>
                            {isInactive && (
                              <span className="badge badge--informative" role="status">Inactive</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="automations-table-cell automations-table-cell--triggered">
                        {(() => {
                          const date = formatTriggerDate(row.triggeredAt)
                          return (
                            <div className="automations-trigger-date">
                              <span className="automations-trigger-date-day">{date.day}</span>
                              <span className="automations-trigger-date-year">{date.year}</span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Pagination */}
            {totalRows > 0 && (
              <div className="automations-pagination">
                <span className="automations-pagination-info">
                  {pageStart + 1}-{pageEnd} of {totalRows}
                </span>
                <button
                  type="button"
                  className="automations-pagination-btn"
                  aria-label="Previous page"
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ArrowLeft2 size={16} color="var(--text-secondary)" variant="Linear" />
                </button>
                <button
                  type="button"
                  className="automations-pagination-btn"
                  aria-label="Next page"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ArrowRight2 size={16} color="var(--text-secondary)" variant="Linear" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete automation confirmation */}
      <ConfirmModal open={!!pendingDelete} onClose={closeDeleteModal}>
        {pendingDelete && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <Danger size={72} color="var(--danger-500)" variant="Linear" />
              <h3 className="confirm-modal-title">Delete automation</h3>
              <p className="confirm-modal-body">
                You're about to delete <strong>{pendingDelete.name}</strong>. Past
                trigger activity will be retained, but the automation will stop
                running. This cannot be undone.
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
              />
            </div>
            <div className="confirm-modal-actions confirm-modal-actions--center">
              <button
                className="confirm-modal-btn confirm-modal-btn--outlined-neutral"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn confirm-modal-btn--danger"
                disabled={confirmInput !== 'Delete'}
                onClick={confirmDeleteAutomation}
              >
                Delete Automation
              </button>
            </div>
          </>
        )}
      </ConfirmModal>

      <ForceTriggerModal
        automation={forceTriggerAutomation}
        users={mockUsers}
        previouslyTriggeredUserIds={
          forceTriggerAutomation
            ? new Set(
                effectiveTriggers
                  .filter((t) => t.automationId === forceTriggerAutomation.id)
                  .map((t) => t.user.id),
              )
            : new Set()
        }
        onClose={() => setForceTriggerAutomation(null)}
        onDone={() => {
          setForceTriggerAutomation(null)
          setActiveTab('activity')
        }}
        onTrigger={handleForceTrigger}
      />

      <AutomationDetailsModal
        automation={detailsAutomation}
        mode={detailsMode}
        onClose={closeDetails}
        onSave={saveAutomation}
        onCourseChange={patchCourse}
        onCourseRemove={removeCourse}
        onCoursesReorder={reorderCourses}
      />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default Automations
