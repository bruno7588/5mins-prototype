import { useCallback, useRef, useState } from 'react'
import { Add, ArrowDown2, ArrowLeft2, ArrowRight2, DocumentDownload, Sort } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import MoreIcon from '../../components/icons/MoreIcon'
import Chip from '../../components/Chip/Chip'
import Dropdown, { type DropdownOption } from '../../components/Dropdown/Dropdown'
import Collapse from '../../components/Collapse/Collapse'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import FilterListbox, { FILTER_BY_ID } from './components/FilterListbox/FilterListbox'
import PresetsMenu from './components/PresetsMenu/PresetsMenu'
import SaveViewDialog from './components/SaveViewDialog/SaveViewDialog'
import ReportsMenu from './components/ReportsMenu/ReportsMenu'
import ReportDrawer from './components/ReportDrawer/ReportDrawer'
import {
  DEFAULT_PRESETS,
  readPresets,
  savePreset,
  removePreset,
  readReports,
  saveReport,
  type FilterPreset,
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

/* Mock value options per filter (prototype) */
const FILTER_VALUE_OPTIONS: Record<string, DropdownOption[]> = {
  status: [
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'not-started', label: 'Not Started' },
    { value: 'overdue', label: 'Overdue' },
  ],
  'enrolment-history': [
    { value: 'current', label: 'Current' },
    { value: 'archived', label: 'Archived' },
  ],
  team: [
    { value: 'all', label: 'All teams' },
    { value: 'operations', label: 'Operations' },
    { value: 'finance', label: 'Finance' },
    { value: 'compliance', label: 'Compliance' },
  ],
  region: [
    { value: 'na', label: 'North America' },
    { value: 'eu', label: 'Europe' },
    { value: 'apac', label: 'Asia Pacific' },
    { value: 'sea', label: 'Southeast Asia' },
    { value: 'me', label: 'Middle East' },
  ],
  category: [
    { value: 'compliance', label: 'Compliance' },
    { value: 'safety', label: 'Safety' },
    { value: 'soft-skills', label: 'Soft Skills' },
    { value: 'operations', label: 'Operations' },
    { value: 'performance', label: 'Performance' },
  ],
  progress: [
    { value: '0-25', label: '0–25%' },
    { value: '25-50', label: '25–50%' },
    { value: '50-75', label: '50–75%' },
    { value: '75-100', label: '75–100%' },
  ],
}

const DEFAULT_FILTER_OPTIONS: DropdownOption[] = [
  { value: 'opt-1', label: 'Option 1' },
  { value: 'opt-2', label: 'Option 2' },
  { value: 'opt-3', label: 'Option 3' },
]

function filterOptions(id: string): DropdownOption[] {
  return FILTER_VALUE_OPTIONS[id] ?? DEFAULT_FILTER_OPTIONS
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
  const [presetsListOpen, setPresetsListOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presets, setPresets] = useState<FilterPreset[]>(() => readPresets())
  // The saved view the current filters were last applied from, so we can detect
  // when the admin has edited it (unsaved changes) and offer Update vs Save as New.
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [reports, setReports] = useState<SavedReport[]>(() => readReports())
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<SavedReport | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const headerAddRef = useRef<HTMLDivElement>(null)
  const bottomAddRef = useRef<HTMLDivElement>(null)
  const overflowWrapRef = useRef<HTMLDivElement>(null)
  const reportsWrapRef = useRef<HTMLDivElement>(null)
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
    setActiveViewId(null)
  }, [])

  /* ─── Filter presets ─── */
  const applyPreset = useCallback((preset: FilterPreset) => {
    setActiveFilters(preset.filters.map((f) => f.id))
    const values: Record<string, string> = {}
    preset.filters.forEach((f) => {
      if (f.value != null) values[f.id] = f.value
    })
    setFilterValues(values)
    // Suggested defaults can't be updated, so only saved views become the "active view".
    const isDefault = DEFAULT_PRESETS.some((d) => d.id === preset.id)
    setActiveViewId(isDefault ? null : preset.id)
    setFiltersExpanded(true)
    setPresetsListOpen(false)
  }, [])

  const saveCurrentAsPreset = useCallback(
    (name: string, description: string) => {
      const preset: FilterPreset = {
        id: `preset-${Date.now()}`,
        name,
        description: description || undefined,
        filters: activeFilters.map((id) => ({ id, value: filterValues[id] ?? null })),
        createdAt: new Date().toISOString(),
      }
      setPresets(savePreset(preset))
      setActiveViewId(preset.id)
      setSaveDialogOpen(false)
      setPresetsListOpen(false)
      showToast('success', 'View saved')
    },
    [activeFilters, filterValues, showToast],
  )

  // Commit the current (edited) filters back to the saved view they came from.
  const updateActiveView = useCallback(() => {
    if (!activeViewId) return
    setPresets((prev) => {
      const p = prev.find((x) => x.id === activeViewId)
      if (!p) return prev
      return savePreset({
        ...p,
        filters: activeFilters.map((id) => ({ id, value: filterValues[id] ?? null })),
      })
    })
    showToast('success', 'View updated')
  }, [activeViewId, activeFilters, filterValues, showToast])

  const deletePreset = useCallback(
    (id: string) => {
      setPresets(removePreset(id))
      setActiveViewId((curr) => (curr === id ? null : curr))
      showToast('success', 'View deleted')
    },
    [showToast],
  )

  const renamePreset = useCallback(
    (id: string, name: string) => {
      setPresets((prev) => {
        const p = prev.find((x) => x.id === id)
        return p ? savePreset({ ...p, name }) : prev
      })
      showToast('success', 'View renamed')
    },
    [showToast],
  )

  const duplicatePreset = useCallback(
    (preset: FilterPreset) => {
      setPresets(
        savePreset({
          ...preset,
          id: `preset-${Date.now()}`,
          name: `${preset.name} (copy)`,
          pinned: false,
          createdAt: new Date().toISOString(),
        }),
      )
      showToast('success', 'View duplicated')
    },
    [showToast],
  )

  // True when the table's current filters exactly match a preset.
  const isPresetActive = useCallback(
    (preset: FilterPreset): boolean => {
      if (preset.filters.length !== activeFilters.length) return false
      return preset.filters.every(
        (f) => activeFilters.includes(f.id) && (filterValues[f.id] ?? null) === (f.value ?? null),
      )
    },
    [activeFilters, filterValues],
  )

  // Header model: the suggested defaults are always shown as quick-apply chips;
  // the admin's own saved views collapse into a single "Saved Views" dropdown.
  const activeView = activeViewId ? presets.find((p) => p.id === activeViewId) ?? null : null
  // A saved view is applied and the filters still match it exactly (clean) — highlight the chip.
  const viewClean = !!activeView && isPresetActive(activeView)
  // A saved view is applied but its filters have been edited (unsaved changes).
  const viewEdited = !!activeView && !viewClean

  // Save View is disabled while the current filters exactly match an existing
  // view (suggested or saved) — there's nothing new to save. It re-enables the
  // moment the user changes a filter so the state no longer matches any view.
  const matchesExistingView = [...presets, ...DEFAULT_PRESETS].some(isPresetActive)

  const renderPresetsMenu = (
    open: boolean,
    setOpen: (v: boolean) => void,
    ref: typeof overflowWrapRef,
  ) => (
    <PresetsMenu
      open={open}
      onClose={() => setOpen(false)}
      anchorRef={ref}
      presets={presets}
      isActive={(p) => p.id === activeViewId}
      onApply={applyPreset}
      onDelete={deletePreset}
      onRename={renamePreset}
      onDuplicate={duplicatePreset}
    />
  )

  /* ─── Saved reports ─── */
  const currentFilterEntries: FilterEntry[] = activeFilters.map((id) => ({
    id,
    value: filterValues[id] ?? null,
  }))

  const entryLabel = (entry: FilterEntry): string => {
    const title = FILTER_BY_ID[entry.id]?.title ?? entry.id
    if (!entry.value) return title
    const opt = filterOptions(entry.id).find((o) => o.value === entry.value)?.label
    return opt ? `${title}: ${opt}` : title
  }

  const openCreateReport = useCallback(() => {
    setEditingReport(null)
    setReportsOpen(false)
    setReportDrawerOpen(true)
  }, [])

  const openEditReport = useCallback((report: SavedReport) => {
    setEditingReport(report)
    setReportsOpen(false)
    setReportDrawerOpen(true)
  }, [])

  const handleSaveReport = useCallback(
    (report: SavedReport) => {
      const isEdit = !!editingReport
      setReports(saveReport(report))
      setReportDrawerOpen(false)
      showToast('success', isEdit ? 'Report updated' : 'Report created')
    },
    [editingReport, showToast],
  )

  const toggleReportAutomate = useCallback(
    (id: string, value: boolean) => {
      setReports((prev) => {
        const r = prev.find((x) => x.id === id)
        return r ? saveReport({ ...r, automate: value }) : prev
      })
      showToast('success', value ? 'Reports turned on' : 'Reports turned off')
    },
    [showToast],
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
  const renderAddButton = (ref: typeof headerAddRef, open: boolean) => (
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
                {/* Download the current view as a report */}
                <button
                  type="button"
                  className="lrp-download-btn"
                  onClick={() => showToast('success', 'Report downloaded')}
                >
                  Download Report
                  <DocumentDownload size={20} color="currentColor" variant="Linear" />
                </button>

                {/* Scheduled Reports — saved report presets + email delivery */}
                <div className="lrp-reports-wrap" ref={reportsWrapRef}>
                  <button
                    type="button"
                    className="lrp-reports-btn"
                    aria-haspopup="dialog"
                    aria-expanded={reportsOpen}
                    onClick={() => setReportsOpen((o) => !o)}
                  >
                    Scheduled Reports{reports.length > 0 ? ` (${reports.filter((r) => r.automate).length})` : ''}
                    <ArrowDown2 size={16} color="currentColor" variant="Linear" />
                  </button>
                  <ReportsMenu
                    open={reportsOpen}
                    onClose={() => setReportsOpen(false)}
                    anchorRef={reportsWrapRef}
                    reports={reports}
                    onCreate={openCreateReport}
                    onEdit={openEditReport}
                    onToggle={toggleReportAutomate}
                  />
                </div>
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

              {/* Suggested defaults are quick-apply chips; saved views live in a dropdown */}
              <div className="lrp-presets-wrap" ref={overflowWrapRef}>
                {DEFAULT_PRESETS.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.name}
                    selected={isPresetActive(p)}
                    onClick={() => applyPreset(p)}
                  />
                ))}
                {presets.length > 0 && (
                  <>
                    <button
                      type="button"
                      className={`lrp-overflow-chip${viewClean ? ' lrp-overflow-chip--active' : ''}`}
                      aria-haspopup="dialog"
                      aria-expanded={presetsListOpen}
                      onClick={() => setPresetsListOpen((o) => !o)}
                    >
                      {activeView ? activeView.name : `Saved Views (${presets.length})`}
                      {viewEdited && <span className="lrp-overflow-chip-dot" aria-label="Edited" title="Unsaved changes" />}
                      <ArrowDown2 size={16} color="var(--text-tertiary)" variant="Linear" />
                    </button>
                    {renderPresetsMenu(presetsListOpen, setPresetsListOpen, overflowWrapRef)}
                  </>
                )}
              </div>

              {/* Collapsed-only cluster: Add + button + filter pills. Stays mounted and
                  fades out as the container expands (cross-fades with the bottom Add+). */}
              <div className={`lrp-filters-collapsed${filtersExpanded ? ' lrp-filters-collapsed--hidden' : ''}`}>
                {renderAddButton(headerAddRef, filtersOpen && !filtersExpanded)}

                {activeFilters.length > 0 && (
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
                  {viewEdited ? (
                    <>
                      {/* Editing a saved view: commit back to it, or branch off */}
                      <button
                        type="button"
                        className="lrp-filter-save-preset"
                        onClick={updateActiveView}
                      >
                        Update View
                      </button>
                      <button
                        type="button"
                        className="lrp-filter-save-preset lrp-filter-save-preset--ghost"
                        aria-haspopup="dialog"
                        onClick={() => setSaveDialogOpen(true)}
                      >
                        Save as New
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="lrp-filter-save-preset"
                      aria-haspopup="dialog"
                      disabled={activeFilters.length === 0 || matchesExistingView}
                      onClick={() => setSaveDialogOpen(true)}
                    >
                      Save View
                    </button>
                  )}
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

      <ReportDrawer
        open={reportDrawerOpen}
        onClose={() => setReportDrawerOpen(false)}
        onSave={handleSaveReport}
        initial={editingReport}
        currentFilters={currentFilterEntries}
        filterLabel={entryLabel}
      />

      <SaveViewDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={(name) => saveCurrentAsPreset(name, '')}
        filters={currentFilterEntries.map((e) => ({
          key: e.id,
          label: entryLabel(e),
          Icon: FILTER_BY_ID[e.id]?.Icon,
        }))}
      />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default LearningRecords
