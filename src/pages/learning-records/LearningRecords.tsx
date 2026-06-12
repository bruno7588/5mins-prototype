import { useCallback, useRef, useState } from 'react'
import { Add, ArrowDown2, ArrowLeft2, ArrowRight2, Note1, Sort } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import MoreIcon from '../../components/icons/MoreIcon'
import CsvIcon from '../../components/icons/CsvIcon'
import Dropdown from '../../components/Dropdown/Dropdown'
import Collapse from '../../components/Collapse/Collapse'
import Tooltip from '../../components/Tooltip/Tooltip'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import FilterListbox, { FILTER_BY_ID, filterOptions } from './components/FilterListbox/FilterListbox'
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
  const [reports, setReports] = useState<SavedReport[]>(() => readReports())
  const [reportsListOpen, setReportsListOpen] = useState(false)
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<SavedReport | null>(null)
  // True when the drawer is open on a duplicated report (seeded from an existing
  // one but saved as new).
  const [duplicating, setDuplicating] = useState(false)
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
  }, [])

  const removeFilter = useCallback((id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== id))
    setFilterValues((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setActiveFilters([])
    setFilterValues({})
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
    setDuplicating(false)
    setReportDrawerOpen(true)
  }, [])

  const openEditReport = useCallback(
    (report: SavedReport) => {
      // Load the report onto the page so its filters can be adjusted there (with
      // live results), then open the drawer for name/schedule.
      applyReport(report)
      setEditingReport(report)
      setDuplicating(false)
      setReportsListOpen(false)
      setReportDrawerOpen(true)
    },
    [applyReport],
  )

  // Duplicate — seed a fresh copy (new id) and open it as a new report, so
  // saving creates a new report rather than overwriting the original.
  const duplicateReport = useCallback(
    (report: SavedReport) => {
      const copy: SavedReport = {
        ...report,
        id: `report-${Date.now()}`,
        name: `${report.name} (copy)`,
        createdAt: new Date().toISOString(),
      }
      applyReport(copy)
      setEditingReport(copy)
      setDuplicating(true)
      setReportsListOpen(false)
      setReportDrawerOpen(true)
    },
    [applyReport],
  )

  // Persist (upsert). The drawer drives closing — step 1 saves and may continue to
  // the schedule step, so we don't close here.
  const handleSaveReport = useCallback(
    (report: SavedReport) => {
      const isEdit = !!editingReport && !duplicating
      setReports(saveReport(report))
      showToast('success', report.scheduled ? 'Report scheduled' : isEdit ? 'Report updated' : 'Report saved')
    },
    [editingReport, duplicating, showToast],
  )

  // Label shown on a collapsed pill: the chosen value, else the filter name.
  const valueLabel = (id: string): string => {
    const v = filterValues[id]
    if (v) return filterOptions(id).find((o) => o.value === v)?.label ?? FILTER_BY_ID[id]?.title ?? id
    return FILTER_BY_ID[id]?.title ?? id
  }

  const visibleFilters = activeFilters.slice(0, MAX_VISIBLE_PILLS)
  const overflowCount = activeFilters.length - visibleFilters.length

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
        Add Filter
        <Add size={20} color="var(--primary-600)" variant="Linear" />
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
                <button
                  type="button"
                  className="lrp-download-btn"
                  onClick={downloadCurrentView}
                >
                  Download Report
                  <CsvIcon size={20} color="currentColor" />
                </button>

                {/* Saved reports — opens the list side drawer; disabled until one exists */}
                <Tooltip
                  icon={false}
                  position="Bottom"
                  disabled={reports.length > 0}
                  text="No saved reports yet. Build a filter view and choose “Save Report”."
                >
                  <button
                    type="button"
                    className="lrp-reports-btn"
                    aria-haspopup="dialog"
                    disabled={reports.length === 0}
                    onClick={() => setReportsListOpen(true)}
                  >
                    Reports ({reports.length})
                    <Note1
                      size={20}
                      color={reports.length === 0 ? 'var(--text-disabled)' : 'var(--text-primary)'}
                      variant="Linear"
                    />
                  </button>
                </Tooltip>
                {/* Save the current filter view as a report */}
                <button type="button" className="lrp-save-report-btn" onClick={openCreateReport}>
                  Save New Report
                </button>
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
                      <Dropdown
                        size="sm"
                        className="lrp-filter-dropdown"
                        options={filterOptions(id)}
                        value={filterValues[id]}
                        placeholder={`Select ${meta.title.toLowerCase()}`}
                        onChange={(v) => setFilterValues((prev) => ({ ...prev, [id]: v }))}
                      />
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

                {courseData.map((row) => (
                  <div className="lrp-row" key={row.id}>
                    <div className="lrp-cell lrp-cell--user">
                      <span className="lrp-name">{row.name}</span>
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
                        <button type="button" className="lrp-cert-btn">Download</button>
                      ) : (
                        <span className="lrp-dash">–</span>
                      )}
                    </div>
                    <div className="lrp-cell lrp-cell--ext-more">
                      <MoreIcon size={20} color="var(--text-tertiary)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="lrp-pagination">
            <span className="lrp-pagination-label">1-10 of 28</span>
            <button type="button" className="lrp-pagination-btn" aria-label="Previous page" disabled>
              <ArrowLeft2 size={16} color="var(--text-secondary)" variant="Linear" />
            </button>
            <button type="button" className="lrp-pagination-btn" aria-label="Next page">
              <ArrowRight2 size={16} color="var(--text-secondary)" variant="Linear" />
            </button>
          </div>
        </div>
      </main>

      <ReportsListDrawer
        open={reportsListOpen}
        onClose={() => setReportsListOpen(false)}
        reports={reports}
        onEdit={openEditReport}
        onDuplicate={duplicateReport}
        onApply={applyReport}
        onDelete={deleteReport}
        onDownload={downloadReport}
      />

      <SaveReportDrawer
        open={reportDrawerOpen}
        onClose={() => setReportDrawerOpen(false)}
        onSave={handleSaveReport}
        initial={editingReport}
        isDuplicate={duplicating}
        currentFilters={currentFilterEntries}
        onDownload={downloadReport}
      />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default LearningRecords
