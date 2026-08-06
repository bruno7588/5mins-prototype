import { useCallback, useRef, useState } from 'react'
import Button from '@/components/Button/Button'
import { Add, ArrowDown2, Calendar, Note1, Sort } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import MoreIcon from '../../components/icons/MoreIcon'
import CsvIcon from '../../components/icons/CsvIcon'
import Dropdown from '../../components/Dropdown/Dropdown'
import Toggle from '../../components/Toggle/Toggle'
import Badge from '../../components/Badge/Badge'
import InputInteger from '../../components/InputInteger/InputInteger'
import InputField from '../../components/InputField/InputField'
import Collapse from '../../components/Collapse/Collapse'
import Tooltip from '../../components/Tooltip/Tooltip'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import FilterListbox, { FILTER_BY_ID, filterOptions, filterControl, OPERATOR_OPTIONS } from './components/FilterListbox/FilterListbox'
import FilterMultiSelect from './components/FilterControls/FilterMultiSelect'
import ReportsListDrawer from './components/ReportsListDrawer/ReportsListDrawer'
import SaveReportDrawer from './components/SaveReportDrawer/SaveReportDrawer'
import {
  readReports,
  saveReport,
  removeReport,
  type FilterEntry,
  type SavedReport,
} from '../../utils/lrSavedFilters'
import './LearningRecords.css'

type TabKey = '5mins' | 'external'
type EnrolmentHistory = 'Current' | 'Archived'
type Status = 'Completed' | 'Not Started' | 'In Progress' | 'Overdue'

// Mirrors the People → Deactivate flow: a user is deactivated as either
// 'long-leave' (temporary, expected to return) or 'terminated' (permanent).
type DeactivationType = 'terminated' | 'long-leave'

// Value shapes for the richer filter controls (see filterControl()).
type ControlValue =
  | { multi: string[] }
  | { min: number; max: number }
  | { op: string; a: number; b: number }
  | { from: string; to: string }

interface CourseRecord {
  id: string
  name: string
  email: string
  team: string
  region: string
  course: string
  category: string
  enrolment: EnrolmentHistory
  startDate: string
  dueDate: string
  completionDate: string | null
  daysLate: number | null
  duration: string
  progress: number
  status: Status
  // Present only on records belonging to a deactivated user; hidden by default.
  deactivation?: { type: DeactivationType; on: string }
}

const courseData: CourseRecord[] = [
  { id: '1', name: 'Michael Thompson', email: 'michael.t@company.com', team: 'People & Performance', region: 'Southeast Asia', course: 'HBR Guide to Communication Success', category: 'Performance', enrolment: 'Current', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: '2026-06-18', daysLate: 32, duration: '20 mins', progress: 100, status: 'Completed' },
  { id: '2', name: 'Jessica Hart', email: 'jessica.h@company.com', team: 'People & Performance', region: 'Southeast Asia', course: 'HBR Guide to Communication Success', category: 'Performance', enrolment: 'Current', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: '2026-06-12', daysLate: 26, duration: '20 mins', progress: 100, status: 'Completed' },
  { id: '3', name: 'David Johnson', email: 'david.j@company.com', team: 'People & Performance', region: 'Southeast Asia', course: 'HBR Guide to Communication Success', category: 'Performance', enrolment: 'Current', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: '2026-05-29', daysLate: 12, duration: '20 mins', progress: 100, status: 'Completed' },
  { id: '4', name: 'Noah Williams', email: 'noah.w@company.com', team: 'Operations', region: 'Europe', course: 'Food Safety Essentials', category: 'Safety', enrolment: 'Current', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: null, daysLate: null, duration: '20 mins', progress: 0, status: 'Not Started' },
  { id: '5', name: 'Mei Tanaka', email: 'mei.t@company.com', team: 'Operations', region: 'Asia Pacific', course: 'Harassment Prevention', category: 'Compliance', enrolment: 'Current', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: null, daysLate: null, duration: '20 mins', progress: 0, status: 'Not Started' },
  { id: '6', name: 'Ethan Brooks', email: 'ethan.b@company.com', team: 'Food & Beverage', region: 'Europe', course: 'Allergen Awareness', category: 'Safety', enrolment: 'Current', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: null, daysLate: null, duration: '20 mins', progress: 45, status: 'In Progress' },
  { id: '7', name: 'Priya Shah', email: 'priya.s@company.com', team: 'Shift Operations', region: 'Middle East', course: 'Conflict Resolution', category: 'Soft Skills', enrolment: 'Current', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: null, daysLate: null, duration: '20 mins', progress: 70, status: 'In Progress' },
  { id: '8', name: 'Samantha Rivers', email: 'samantha.r@company.com', team: 'Finance', region: 'North America', course: 'Cash Handling', category: 'Operations', enrolment: 'Current', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: null, daysLate: 47, duration: '20 mins', progress: 20, status: 'Overdue' },
  { id: '9', name: 'Laura Chen', email: 'laura.c@company.com', team: 'Compliance', region: 'Asia Pacific', course: 'Fire Safety', category: 'Safety', enrolment: 'Archived', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: null, daysLate: 43, duration: '20 mins', progress: 20, status: 'Overdue' },
  { id: '10', name: 'Marcus Reid', email: 'marcus.r@company.com', team: 'Compliance', region: 'Europe', course: 'POS System Training', category: 'Operations', enrolment: 'Archived', startDate: '2026-04-20', dueDate: '2026-05-17', completionDate: null, daysLate: 38, duration: '20 mins', progress: 55, status: 'Overdue' },
  // Prior (archived) enrolment of Michael Thompson on the same course — appears
  // only when "Archived enrolments" is on, demonstrating the once-per-course dedup.
  { id: '11', name: 'Michael Thompson', email: 'michael.t@company.com', team: 'People & Performance', region: 'Southeast Asia', course: 'HBR Guide to Communication Success', category: 'Performance', enrolment: 'Archived', startDate: '2025-10-01', dueDate: '2025-10-28', completionDate: '2025-10-20', daysLate: null, duration: '20 mins', progress: 100, status: 'Completed' },
]

/* Records for users who have since been deactivated in People. Hidden by
   default; surfaced only when "Include deactivated users" is on — mainly to
   evidence that leavers completed mandatory / compliance training. */
const deactivatedData: CourseRecord[] = [
  { id: 'd1', name: 'Olivia Bennett', email: 'olivia.b@company.com', team: 'Front Office', region: 'Europe', course: 'Harassment Prevention', category: 'Compliance', enrolment: 'Current', startDate: '2025-09-01', dueDate: '2025-09-28', completionDate: '2025-09-20', daysLate: null, duration: '20 mins', progress: 100, status: 'Completed', deactivation: { type: 'terminated', on: 'Nov 12, 2025' } },
  { id: 'd2', name: 'Daniel Okafor', email: 'daniel.o@company.com', team: 'Food & Beverage', region: 'Middle East', course: 'Food Safety Essentials', category: 'Compliance', enrolment: 'Current', startDate: '2025-08-10', dueDate: '2025-09-06', completionDate: '2025-08-30', daysLate: null, duration: '20 mins', progress: 100, status: 'Completed', deactivation: { type: 'terminated', on: 'Oct 03, 2025' } },
  { id: 'd3', name: 'Sofia Marchetti', email: 'sofia.m@company.com', team: 'Operations', region: 'Europe', course: 'Fire Safety', category: 'Compliance', enrolment: 'Current', startDate: '2025-10-05', dueDate: '2025-11-01', completionDate: '2025-10-22', daysLate: null, duration: '20 mins', progress: 100, status: 'Completed', deactivation: { type: 'long-leave', on: 'Nov 28, 2025' } },
  { id: 'd4', name: 'James Whitfield', email: 'james.w@company.com', team: 'Finance', region: 'North America', course: 'Anti-Money Laundering', category: 'Compliance', enrolment: 'Current', startDate: '2025-09-15', dueDate: '2025-10-12', completionDate: null, daysLate: 21, duration: '20 mins', progress: 60, status: 'Overdue', deactivation: { type: 'long-leave', on: 'Dec 05, 2025' } },
]

/* ── External Training data ── */
type ExternalResult = 'Passed' | 'Not Passed'

interface ExternalRecord {
  id: string
  email: string
  training: string
  provider: string
  startDate: string
  completionDate: string | null
  expiration: string | null
  duration: string
  score: string | null
  result: ExternalResult
  hasCertificate: boolean
}

const externalData: ExternalRecord[] = [
  { id: 'e1', email: 'michael.t@company.com', training: 'Project Management Fundamentals', provider: 'Leadership Academy', startDate: '2026-04-13', completionDate: '2026-04-25', expiration: '2026-05-10', duration: '2 days', score: '100%', result: 'Passed', hasCertificate: true },
  { id: 'e2', email: 'jessica.h@company.com', training: 'Advanced Excel for Finance', provider: 'SkillBridge Online', startDate: '2026-03-20', completionDate: '2026-04-02', expiration: null, duration: '3 days', score: null, result: 'Not Passed', hasCertificate: false },
  { id: 'e3', email: 'david.j@company.com', training: 'Data Analytics Bootcamp', provider: 'TechForward Institute', startDate: '2026-04-01', completionDate: '2026-04-15', expiration: '2027-04-15', duration: '5 days', score: '92%', result: 'Passed', hasCertificate: true },
  { id: 'e4', email: 'noah.w@company.com', training: 'Customer Experience Design', provider: 'CX Academy', startDate: '2026-03-10', completionDate: '2026-03-22', expiration: '2026-09-22', duration: '2 days', score: '100%', result: 'Passed', hasCertificate: true },
  { id: 'e5', email: 'mei.t@company.com', training: 'First Aid & CPR Certification', provider: 'Red Cross Training', startDate: '2026-02-15', completionDate: '2026-02-16', expiration: null, duration: '1 day', score: null, result: 'Not Passed', hasCertificate: false },
  { id: 'e6', email: 'ethan.b@company.com', training: 'Barista Mastery Program', provider: 'Coffee Institute', startDate: '2026-04-05', completionDate: '2026-04-12', expiration: '2027-04-12', duration: '2 days', score: '100%', result: 'Passed', hasCertificate: true },
  { id: 'e7', email: 'priya.s@company.com', training: 'Leadership & Team Management', provider: 'Leadership Academy', startDate: '2026-03-25', completionDate: '2026-04-08', expiration: null, duration: '3 days', score: null, result: 'Not Passed', hasCertificate: false },
  { id: 'e8', email: 'samantha.r@company.com', training: 'Financial Modelling Workshop', provider: 'FinanceHub', startDate: '2026-04-10', completionDate: '2026-04-18', expiration: '2027-04-18', duration: '2 days', score: '95%', result: 'Passed', hasCertificate: true },
  { id: 'e9', email: 'laura.c@company.com', training: 'ISO 27001 Auditor Training', provider: 'CompliancePro', startDate: '2026-03-01', completionDate: '2026-03-15', expiration: '2027-03-15', duration: '5 days', score: '88%', result: 'Passed', hasCertificate: true },
  { id: 'e10', email: 'marcus.r@company.com', training: 'Workplace Safety Advanced', provider: 'SafeWork Training', startDate: '2026-02-20', completionDate: '2026-03-05', expiration: '2026-09-05', duration: '2 days', score: '100%', result: 'Passed', hasCertificate: true },
]

function formatDate(dateStr: string): { line1: string; line2: string } {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  return { line1: `${month} ${day}`, line2: `${year}` }
}

const STATUS_BADGE: Record<Status, string> = {
  Completed: 'lrp-badge--completed',
  'In Progress': 'lrp-badge--in-progress',
  'Not Started': 'lrp-badge--not-started',
  Overdue: 'lrp-badge--overdue',
}

/* How many filter pills to show inline before collapsing the rest into "+N" */
const MAX_VISIBLE_PILLS = 5

/* ── Filtering ── Maps a filter id to the CourseRecord field it constrains.
   Filters without an entry (compliance-course, custom fields) don't narrow the
   table. Option values are slugs of their labels, so row values are slugged too. */
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const MULTI_FILTER_FIELD: Partial<Record<string, keyof CourseRecord>> = {
  'user-name': 'name',
  email: 'email',
  team: 'team',
  region: 'region',
  course: 'course',
  category: 'category',
}
const SINGLE_FILTER_FIELD: Partial<Record<string, keyof CourseRecord>> = { status: 'status' }
const DATE_FILTER_FIELD: Partial<Record<string, keyof CourseRecord>> = {
  'start-date': 'startDate',
  'due-date': 'dueDate',
  'completion-date': 'completionDate',
}

function DateCell({ value }: { value: string | null }) {
  if (!value) return <span className="lrp-dash">–</span>
  const { line1, line2 } = formatDate(value)
  return (
    <div className="lrp-date">
      <span className="lrp-date-1">{line1}</span>
      <span className="lrp-date-2">{line2}</span>
    </div>
  )
}

function LearningRecords() {
  const [activeTab, setActiveTab] = useState<TabKey>('5mins')
  const [isScrolled, setIsScrolled] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  // Rich values for non-single controls (multi-select arrays, numeric ranges,
  // operator + value, date ranges). Kept separate from the string filterValues
  // used by pills / saved reports. Prototype: not applied to the table.
  const [controlValues, setControlValues] = useState<Record<string, ControlValue>>({})
  // "Also show" scope toggles — both widen the view and are OFF by default.
  // Archived: previous enrolment records (learner can appear >once per course).
  // Deactivated: learners whose accounts were deactivated in People.
  const [showArchived, setShowArchived] = useState(false)
  const [showDeactivated, setShowDeactivated] = useState(false)
  // Name of the saved report currently being viewed in the table (via "View in
  // Table"); cleared once the user edits the filters manually.
  const [viewingName, setViewingName] = useState<string | null>(null)
  const [reports, setReports] = useState<SavedReport[]>(() => readReports())
  const [reportsListOpen, setReportsListOpen] = useState(false)
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<SavedReport | null>(null)
  // True when the edit drawer is opened as a handoff from the reports list, so
  // it swaps content in place instead of sliding in over a closing list drawer.
  const [drawerInstant, setDrawerInstant] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const headerAddRef = useRef<HTMLDivElement>(null)
  const bottomAddRef = useRef<HTMLDivElement>(null)
  const { toasts, show: showToast } = useToast()

  const toggleExpanded = useCallback(() => {
    setFiltersExpanded((e) => !e)
    setFiltersOpen(false)
  }, [])

  const addFilter = useCallback((id: string) => {
    setActiveFilters((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setFiltersOpen(false)
    setFiltersExpanded(true)
    setViewingName(null)
  }, [])

  const removeFilter = useCallback((id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== id))
    setFilterValues((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setControlValues((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setViewingName(null)
  }, [])

  const clearAllFilters = useCallback(() => {
    setActiveFilters([])
    setFilterValues({})
    setControlValues({})
    setViewingName(null)
  }, [])

  // Update a rich control's value (multi/range/operator/date).
  const setControl = useCallback((id: string, value: ControlValue) => {
    setControlValues((prev) => ({ ...prev, [id]: value }))
    setViewingName(null)
  }, [])

  /* ─── Saved reports ─── */
  const currentFilterEntries: FilterEntry[] = activeFilters.map((id) => ({
    id,
    value: filterValues[id] ?? null,
  }))

  // Apply a saved report's filters to the table.
  const applyReport = useCallback((report: SavedReport) => {
    setActiveFilters(report.filters.map((f) => f.id))
    const values: Record<string, string> = {}
    report.filters.forEach((f) => {
      if (f.value != null) values[f.id] = f.value
    })
    setFilterValues(values)
    setFiltersExpanded(true)
  }, [])


  // "View Records" — apply the report's filters and flag it as being viewed.
  const viewReportInTable = useCallback(
    (report: SavedReport) => {
      applyReport(report)
      setViewingName(report.name)
    },
    [applyReport],
  )

  const deleteReport = useCallback(
    (id: string) => {
      setReports(removeReport(id))
      showToast('success', 'Report deleted')
    },
    [showToast],
  )

  // Download the report now (prototype: confirms the action).
  const downloadReport = useCallback(
    (report: SavedReport) => {
      showToast('success', `Downloading “${report.name}”`)
    },
    [showToast],
  )

  // Quick export of the current table view, without saving a report (prototype).
  const downloadCurrentView = useCallback(() => {
    showToast('success', 'Downloading current view (CSV)')
  }, [showToast])

  const openCreateReport = useCallback(() => {
    setEditingReport(null)
    setDrawerInstant(false)
    setReportDrawerOpen(true)
  }, [])

  const openEditReport = useCallback(
    (report: SavedReport) => {
      // Load the report onto the page so its filters can be adjusted there (with
      // live results), then open the drawer for name/schedule.
      applyReport(report)
      setEditingReport(report)
      setViewingName(null)
      setDrawerInstant(true)
      setReportsListOpen(false)
      setReportDrawerOpen(true)
    },
    [applyReport],
  )

  // Persist (upsert). The drawer drives closing — step 1 saves and may continue to
  // the schedule step, so we don't close here.
  const handleSaveReport = useCallback(
    (report: SavedReport) => {
      const isEdit = !!editingReport
      setReports(saveReport(report))
      showToast('success', report.scheduled ? 'Report scheduled' : isEdit ? 'Report updated' : 'Report saved')
    },
    [editingReport, showToast],
  )

  // Label shown on a collapsed pill: the chosen value, else the filter name.
  // Only single-select filters carry a plain string value; the rest collapse to
  // their title (their richer state isn't summarised on the pill).
  const valueLabel = (id: string): string => {
    const v = filterValues[id]
    if (v) {
      const ctrl = filterControl(id)
      const opts = ctrl.kind === 'single' ? ctrl.options : filterOptions(id)
      return opts.find((o) => o.value === v)?.label ?? FILTER_BY_ID[id]?.title ?? id
    }
    return FILTER_BY_ID[id]?.title ?? id
  }

  const visibleFilters = activeFilters.slice(0, MAX_VISIBLE_PILLS)
  const overflowCount = activeFilters.length - visibleFilters.length

  // Does a row satisfy every active filter that maps to a table column?
  const matchesFilters = (row: CourseRecord): boolean => {
    for (const id of activeFilters) {
      const ctrl = filterControl(id)
      if (ctrl.kind === 'multi') {
        const sel = (controlValues[id] as { multi: string[] } | undefined)?.multi ?? []
        const field = MULTI_FILTER_FIELD[id]
        if (!sel.length || !field) continue
        if (!sel.includes(slugify(String(row[field] ?? '')))) return false
      } else if (ctrl.kind === 'single') {
        const v = filterValues[id]
        const field = SINGLE_FILTER_FIELD[id]
        if (!v || !field) continue
        if (slugify(String(row[field] ?? '')) !== v) return false
      } else if (ctrl.kind === 'range') {
        const cv = controlValues[id] as { min: number; max: number } | undefined
        if (!cv || id !== 'progress') continue
        if (row.progress < cv.min || row.progress > cv.max) return false
      } else if (ctrl.kind === 'operator') {
        const cv = controlValues[id] as { op: string; a: number; b: number } | undefined
        if (!cv || id !== 'days-late') continue
        const dl = row.daysLate ?? 0
        if (cv.op === 'more-than' && !(dl > cv.a)) return false
        if (cv.op === 'less-than' && !(dl < cv.a)) return false
        if (cv.op === 'between' && !(dl >= cv.a && dl <= cv.b)) return false
      } else if (ctrl.kind === 'date') {
        const cv = controlValues[id] as { from: string; to: string } | undefined
        const field = DATE_FILTER_FIELD[id]
        if (!cv || !field || (!cv.from && !cv.to)) continue
        const val = row[field] as string | null
        if (!val) return false
        if (cv.from && val < cv.from) return false
        if (cv.to && val > cv.to) return false
      }
    }
    return true
  }

  // Row set = active learners, plus (when toggled on) archived enrolments and
  // deactivated learners surfaced toward the TOP so they're easy to spot; then
  // narrowed by the active filters.
  const displayedCourseRows = (() => {
    const current = courseData.filter((r) => r.enrolment === 'Current')
    const archived = courseData.filter((r) => r.enrolment === 'Archived')
    let rows = showArchived ? [...archived, ...current] : current
    if (showDeactivated) rows = [...deactivatedData, ...rows]
    return rows.filter(matchesFilters)
  })()

  // Add+ relocates between header (collapsed) and bottom actions (expanded).
  // Only the live instance gets an open listbox so their click-outside handlers don't clash.
  const renderAddButton = (ref: typeof bottomAddRef, open: boolean) => (
    <div className="lrp-filters-add-wrap" ref={ref}>
      <button
        type="button"
        className="lrp-filter-add"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setFiltersOpen((o) => !o)}
      >
        <Add size={20} color="currentColor" variant="Linear" />
        Add Filter
      </button>
      <FilterListbox
        open={open}
        onClose={() => setFiltersOpen(false)}
        onSelect={addFilter}
        anchorRef={ref}
      />
    </div>
  )

  const handleScroll = useCallback(() => {
    if (scrollRef.current) setIsScrolled(scrollRef.current.scrollLeft > 0)
  }, [])

  const tabs: { key: TabKey; label: string }[] = [
    { key: '5mins', label: '5Mins Courses' },
    { key: 'external', label: 'External Training' },
  ]

  // Renders the correct input for an added filter based on its control type.
  const renderControl = (id: string) => {
    const ctrl = filterControl(id)
    const title = FILTER_BY_ID[id]?.title ?? id

    switch (ctrl.kind) {
      case 'multi': {
        const cv = controlValues[id]
        const selected = cv && 'multi' in cv ? cv.multi : []
        return (
          <FilterMultiSelect
            options={ctrl.options}
            value={selected}
            placeholder={ctrl.placeholder}
            onChange={(arr) => setControl(id, { multi: arr })}
          />
        )
      }
      case 'range': {
        const cv = controlValues[id]
        const v = cv && 'min' in cv ? cv : { min: ctrl.min, max: ctrl.max }
        return (
          <div className="lrp-control-inline">
            <span className="lrp-filter-connector">between</span>
            <InputInteger
              value={v.min}
              min={ctrl.min}
              max={ctrl.max}
              suffix={ctrl.suffix}
              ariaLabel={`${title} from`}
              onChange={(n) => setControl(id, { min: n, max: v.max })}
            />
            <span className="lrp-filter-connector">and</span>
            <InputInteger
              value={v.max}
              min={ctrl.min}
              max={ctrl.max}
              suffix={ctrl.suffix}
              ariaLabel={`${title} to`}
              onChange={(n) => setControl(id, { min: v.min, max: n })}
            />
          </div>
        )
      }
      case 'operator': {
        const cv = controlValues[id]
        const v = cv && 'op' in cv ? cv : { op: 'more-than', a: 0, b: 0 }
        return (
          <div className="lrp-control-inline">
            <Dropdown
              size="sm"
              className="lrp-filter-dropdown"
              options={OPERATOR_OPTIONS}
              value={v.op}
              onChange={(op) => setControl(id, { ...v, op })}
            />
            <InputInteger value={v.a} min={0} ariaLabel={`${title} value`} onChange={(n) => setControl(id, { ...v, a: n })} />
            {v.op === 'between' && (
              <>
                <span className="lrp-filter-connector">and</span>
                <InputInteger value={v.b} min={0} ariaLabel={`${title} upper value`} onChange={(n) => setControl(id, { ...v, b: n })} />
              </>
            )}
            <span className="lrp-filter-connector">{ctrl.unit}</span>
          </div>
        )
      }
      case 'date': {
        const cv = controlValues[id]
        const v = cv && 'from' in cv ? cv : { from: '', to: '' }
        const calIcon = <Calendar size={20} color="var(--text-tertiary)" variant="Linear" />
        return (
          <div className="lrp-control-inline">
            <span className="lrp-filter-connector">between</span>
            <InputField
              type="date"
              className="lrp-date-input"
              placeholder="dd/mm/yyyy"
              value={v.from}
              iconRight={calIcon}
              onChange={(e) => setControl(id, { from: e.target.value, to: v.to })}
            />
            <span className="lrp-filter-connector">and</span>
            <InputField
              type="date"
              className="lrp-date-input"
              placeholder="dd/mm/yyyy"
              value={v.to}
              iconRight={calIcon}
              onChange={(e) => setControl(id, { from: v.from, to: e.target.value })}
            />
          </div>
        )
      }
      case 'single':
      default:
        return (
          <Dropdown
            size="sm"
            className="lrp-filter-dropdown"
            options={ctrl.options}
            value={filterValues[id]}
            placeholder={ctrl.placeholder}
            onChange={(val) => {
              setFilterValues((prev) => ({ ...prev, [id]: val }))
              setViewingName(null)
            }}
          />
        )
    }
  }

  return (
    <div className="lrp-layout">
      <LeftSidebar />
      <main className="lrp-main">
        <div className="lrp-page">
          {/* Header */}
          <div className="lrp-header">
            <h1 className="lrp-title">Learning Records</h1>
            <div className="lrp-divider" />
            <div className="lrp-tabs-row">
              <div className="lrp-tabs" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`lrp-tab${activeTab === tab.key ? ' lrp-tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="lrp-head-actions">
                {/* Quick export — download the current table view without saving a report */}
                <Button variant="outlined-2" icon={<CsvIcon size={20} color="currentColor" />} onClick={downloadCurrentView}>
                  Download Report
                </Button>

                {/* Saved reports — opens the list side drawer; disabled until one exists */}
                <Tooltip
                  icon={false}
                  position="Bottom"
                  disabled={reports.length > 0}
                  text="No saved reports yet. Build a filter view and choose “Save Report”."
                >
                  <Button
                    variant="outlined-2"
                    aria-haspopup="dialog"
                    disabled={reports.length === 0}
                    onClick={() => setReportsListOpen(true)}
                    icon={<Note1 size={20} color="currentColor" variant="Linear" />}
                  >
                    Reports ({reports.length})
                  </Button>
                </Tooltip>
                {/* Save the current filter view as a report */}
                <Button variant="outlined" onClick={openCreateReport}>Save New Report</Button>
              </div>
            </div>
          </div>

          {/* Filters bar */}
          <div className="lrp-filters">
            <div className="lrp-filters-head">
              <button
                type="button"
                className="lrp-filters-toggle"
                aria-expanded={filtersExpanded}
                onClick={toggleExpanded}
              >
                <span className="lrp-filters-icon">
                  <Sort size={20} color="var(--text-primary)" variant="Linear" />
                </span>
                <span className="lrp-filters-label">Filters</span>
                <span className="lrp-filters-badge">{activeFilters.length}</span>
              </button>

              {/* Collapsed cluster: with no filters, Add Filter is the main action;
                  once filters exist, show pills (Add Filter returns when expanded). */}
              <div className={`lrp-filters-collapsed${filtersExpanded ? ' lrp-filters-collapsed--hidden' : ''}`}>
                {activeFilters.length === 0 ? (
                  renderAddButton(headerAddRef, filtersOpen && !filtersExpanded)
                ) : (
                  <div className="lrp-filters-pills">
                    {visibleFilters.map((id) => {
                      const meta = FILTER_BY_ID[id]
                      if (!meta) return null
                      return (
                        <span className="lrp-pill" key={id}>
                          <span className="lrp-pill-icon">
                            <meta.Icon size={16} color="var(--text-secondary)" variant="Linear" />
                          </span>
                          <span className="lrp-pill-label">{valueLabel(id)}</span>
                          <button
                            type="button"
                            className="lrp-pill-remove"
                            aria-label={`Remove ${meta.title} filter`}
                            onClick={() => removeFilter(id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M11 5L5 11M5 5L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </span>
                      )
                    })}
                    {overflowCount > 0 && (
                      <button
                        type="button"
                        className="lrp-pill lrp-pill--more"
                        onClick={() => setFiltersExpanded(true)}
                      >
                        +{overflowCount}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="lrp-filters-trailing">
                {viewingName && (
                  <span className="lrp-viewing" title={`Viewing ${viewingName}`}>
                    <span className="lrp-viewing-dot" aria-hidden="true" />
                    <span className="lrp-viewing-label">Viewing</span>
                    <span className="lrp-viewing-text">{viewingName}</span>
                  </span>
                )}

                <button
                  type="button"
                  className="lrp-filters-chevron-btn"
                  aria-label={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
                  aria-expanded={filtersExpanded}
                  onClick={toggleExpanded}
                >
                  <span className={`lrp-filters-chevron${filtersExpanded ? ' lrp-filters-chevron--open' : ''}`}>
                    <ArrowDown2 size={16} color="var(--text-tertiary)" variant="Linear" />
                  </span>
                </button>
              </div>
            </div>

            <Collapse open={filtersExpanded}>
              <div className="lrp-filters-body">
                {activeFilters.map((id) => {
                  const meta = FILTER_BY_ID[id]
                  if (!meta) return null
                  const isCustom = meta.section === 'Custom Fields'
                  const label = isCustom ? meta.title : `${meta.title} is`
                  return (
                    <div className="lrp-filter-row" key={id}>
                      <span className="lrp-filter-icon">
                        <meta.Icon size={20} color="var(--text-secondary)" variant="Linear" />
                      </span>
                      <span className="lrp-filter-label">{label}</span>
                      {renderControl(id)}
                      <span className="lrp-filter-remove-slot">
                        <button
                          type="button"
                          className="lrp-filter-remove"
                          aria-label={`Remove ${meta.title} filter`}
                          onClick={() => removeFilter(id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M11 5L5 11M5 5L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </span>
                    </div>
                  )
                })}

                <div className="lrp-filter-actions">
                  {/* Add + lives in the bottom actions when expanded */}
                  {renderAddButton(bottomAddRef, filtersOpen && filtersExpanded)}
                  <button
                    type="button"
                    className="lrp-filter-clear"
                    disabled={activeFilters.length === 0}
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                </div>

              </div>
            </Collapse>

            {/* "Also show" scope toggles — persistent so they stay visible even when
                the filter list is collapsed. Both widen the view, OFF by default. */}
            <div className={`lrp-also-show${filtersExpanded ? ' lrp-also-show--divided' : ''}`}>
              <span className="lrp-also-show-label">Include</span>
              <div className="lrp-also-item">
                <Toggle
                  id="lrp-show-archived"
                  size="sm"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                <label htmlFor="lrp-show-archived" className="lrp-also-text">Archived enrolments</label>
                <Tooltip
                  position="Top"
                  text="Previous enrolment records kept when a learner is re-enrolled or a course is restarted. Off by default so each learner appears once per course."
                />
              </div>
              <div className="lrp-also-item">
                <Toggle
                  id="lrp-show-deactivated"
                  size="sm"
                  checked={showDeactivated}
                  onChange={(e) => setShowDeactivated(e.target.checked)}
                />
                <label htmlFor="lrp-show-deactivated" className="lrp-also-text">Deactivated users</label>
                <Tooltip
                  position="Top"
                  text="Include learners whose accounts were deactivated in People (Permanent or Long Leave). Off by default."
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={`lrp-table-wrap${isScrolled ? ' lrp-table-wrap--scrolled' : ''}`}
          >
            {activeTab === '5mins' ? (
              <div className="lrp-table">
                <div className="lrp-header-row">
                  <div className="lrp-cell lrp-cell--user">User</div>
                  <div className="lrp-cell lrp-cell--team">Team</div>
                  <div className="lrp-cell lrp-cell--region">Region</div>
                  <div className="lrp-cell lrp-cell--course">Course</div>
                  <div className="lrp-cell lrp-cell--category">Category</div>
                  <div className="lrp-cell lrp-cell--enrolment">Enrolment history</div>
                  <div className="lrp-cell lrp-cell--date">Start date</div>
                  <div className="lrp-cell lrp-cell--date">Due date</div>
                  <div className="lrp-cell lrp-cell--date">Completion date</div>
                  <div className="lrp-cell lrp-cell--days-late">Days late</div>
                  <div className="lrp-cell lrp-cell--duration">Duration</div>
                  <div className="lrp-cell lrp-cell--progress">Progress</div>
                  <div className="lrp-cell lrp-cell--status">Status</div>
                </div>

                {displayedCourseRows.map((row) => (
                  <div className={`lrp-row${row.deactivation ? ' lrp-row--deactivated' : ''}`} key={row.id}>
                    <div className="lrp-cell lrp-cell--user">
                      <span className="lrp-name-row">
                        <span className="lrp-name">{row.name}</span>
                        {row.deactivation && <Badge type="error" label="Deactivated" />}
                      </span>
                      <span className="lrp-email">{row.email}</span>
                    </div>
                    <div className="lrp-cell lrp-cell--team">{row.team}</div>
                    <div className="lrp-cell lrp-cell--region">{row.region}</div>
                    <div className="lrp-cell lrp-cell--course">{row.course}</div>
                    <div className="lrp-cell lrp-cell--category">{row.category}</div>
                    <div className="lrp-cell lrp-cell--enrolment">
                      <span className={`lrp-badge ${row.enrolment === 'Current' ? 'lrp-badge--current' : 'lrp-badge--archived'}`}>
                        {row.enrolment}
                      </span>
                    </div>
                    <div className="lrp-cell lrp-cell--date"><DateCell value={row.startDate} /></div>
                    <div className="lrp-cell lrp-cell--date"><DateCell value={row.dueDate} /></div>
                    <div className="lrp-cell lrp-cell--date"><DateCell value={row.completionDate} /></div>
                    <div className="lrp-cell lrp-cell--days-late">
                      {row.daysLate != null ? row.daysLate : <span className="lrp-dash">–</span>}
                    </div>
                    <div className="lrp-cell lrp-cell--duration">{row.duration}</div>
                    <div className="lrp-cell lrp-cell--progress">{row.progress}%</div>
                    <div className="lrp-cell lrp-cell--status">
                      <span className={`lrp-badge ${STATUS_BADGE[row.status]}`}>{row.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lrp-table">
                <div className="lrp-header-row">
                  <div className="lrp-cell lrp-cell--ext-email">Email</div>
                  <div className="lrp-cell lrp-cell--ext-training">Training</div>
                  <div className="lrp-cell lrp-cell--ext-provider">Training provider</div>
                  <div className="lrp-cell lrp-cell--date">Start date</div>
                  <div className="lrp-cell lrp-cell--date">Completion date</div>
                  <div className="lrp-cell lrp-cell--date">Expiration</div>
                  <div className="lrp-cell lrp-cell--duration">Duration</div>
                  <div className="lrp-cell lrp-cell--ext-score">Score</div>
                  <div className="lrp-cell lrp-cell--ext-result">Result</div>
                  <div className="lrp-cell lrp-cell--ext-cert">Certificate</div>
                  <div className="lrp-cell lrp-cell--ext-more" />
                </div>

                {externalData.map((row) => (
                  <div className="lrp-row" key={row.id}>
                    <div className="lrp-cell lrp-cell--ext-email">{row.email}</div>
                    <div className="lrp-cell lrp-cell--ext-training">{row.training}</div>
                    <div className="lrp-cell lrp-cell--ext-provider">{row.provider}</div>
                    <div className="lrp-cell lrp-cell--date"><DateCell value={row.startDate} /></div>
                    <div className="lrp-cell lrp-cell--date"><DateCell value={row.completionDate} /></div>
                    <div className="lrp-cell lrp-cell--date"><DateCell value={row.expiration} /></div>
                    <div className="lrp-cell lrp-cell--duration">{row.duration}</div>
                    <div className="lrp-cell lrp-cell--ext-score">{row.score ?? <span className="lrp-dash">–</span>}</div>
                    <div className="lrp-cell lrp-cell--ext-result">
                      <span className={`lrp-badge ${row.result === 'Passed' ? 'lrp-badge--completed' : 'lrp-badge--overdue'}`}>
                        {row.result}
                      </span>
                    </div>
                    <div className="lrp-cell lrp-cell--ext-cert">
                      {row.hasCertificate ? (
                        <Button size="sm" variant="outlined" className="ui-disabled" disabled>Download</Button>
                      ) : (
                        <span className="lrp-dash">–</span>
                      )}
                    </div>
                    <div className="lrp-cell lrp-cell--ext-more">
                      <span className="ui-disabled">
                        <MoreIcon size={20} color="var(--text-tertiary)" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </main>

      <ReportsListDrawer
        open={reportsListOpen}
        onClose={() => setReportsListOpen(false)}
        reports={reports}
        onEdit={openEditReport}
        onDownload={downloadReport}
      />

      <SaveReportDrawer
        open={reportDrawerOpen}
        onClose={() => setReportDrawerOpen(false)}
        onSave={handleSaveReport}
        initial={editingReport}
        instant={drawerInstant}
        currentFilters={currentFilterEntries}
        onDownload={downloadReport}
        onViewInTable={viewReportInTable}
        onDelete={deleteReport}
      />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default LearningRecords
