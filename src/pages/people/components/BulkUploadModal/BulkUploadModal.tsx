import { useState, useEffect, useRef, useMemo } from 'react'
import { ArrowDown2, ArrowLeft2, ArrowRight2, Danger, DocumentDownload, ImportCurve, UserAdd, UserEdit, UserMinus } from 'iconsax-react'
import Chip from '../../../../components/Chip/Chip'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import { FileUploader } from '../../../../components/FileUploader/FileUploader'
import InfoIcon from '../../../../components/icons/InfoIcon'
import './BulkUploadModal.css'

interface UserField {
  id: number
  name: string
  options: string[]
  required: boolean
}

interface BulkUploadModalProps {
  onClose: () => void
}

const automations = [
  { name: 'Auto-enrol Compliance 101', badges: ['Join date', 'Region'] },
  { name: 'New Hire Onboarding Program', badges: ['Join date', 'Region'] },
  { name: 'Q1 Safety Training', badges: ['Region'] },
]

type UploaderState = 'Enabled' | 'Uploading' | 'Filled' | 'Error'
type Step = 'upload' | 'preview' | 'success'

// Mock preview data at scale
type CellWarning = {
  kind: 'danger' | 'info'
  message: string
}

// Error grouping model — each errored cell carries a category, a short label,
// and the fix shown both in the hover tooltip and the downloadable error file.
type ErrorCategory = 'manager-not-found' | 'invalid-email' | 'role-not-found'
type ErrorColumn = 'email' | 'role' | 'reportsTo'

type CellError = {
  category: ErrorCategory
  label: string
  solution: string
}

const ERROR_META: Record<ErrorCategory, { chipLabel: string; column: ErrorColumn; label: string; solution: string }> = {
  'manager-not-found': { chipLabel: 'Manager not found', column: 'reportsTo', label: 'Manager not found', solution: "Enter the manager's exact registered email, or leave the column blank." },
  'invalid-email': { chipLabel: 'Invalid email', column: 'email', label: 'Invalid email', solution: 'Use the format name@company.com.' },
  'role-not-found': { chipLabel: 'Role not found', column: 'role', label: 'Role not found', solution: 'Match an existing role, or download the list of available roles.' },
}

const ERROR_ORDER: ErrorCategory[] = ['manager-not-found', 'invalid-email', 'role-not-found']

type PreviewEntry = {
  row: number
  firstName: string
  lastName: string
  email: string
  team: string
  role: string
  reportsTo: string
  startDate: string
  region: string
  type: 'invite' | 'update' | 'deactivation' | 'no-change' | 'error'
  detail?: string
  errors?: Partial<Record<ErrorColumn, CellError>>
  warnings?: Record<string, CellWarning>
  customFields?: Record<number, string>
}

const mockRoles = ['HR Manager', 'Finance Analyst', 'Engineer', 'Designer', 'Sales Rep']
const mockRegions = ['Southeast Asia', 'Europe', 'North America', 'Latin America', 'East Asia']
const mockManagers = ['manager@company.com', 'lead@company.com', 'director@company.com']

function buildMockPreviewData(fields: UserField[], includeErrors = true): PreviewEntry[] {
  const pickOption = (f: UserField, i: number) => f.options[i % f.options.length] || ''
  const withCustom = (i: number): Record<number, string> => {
    if (fields.length === 0) return {}
    const cf: Record<number, string> = {}
    fields.forEach(f => { cf[f.id] = pickOption(f, i) })
    return cf
  }

  // 28 errored rows → 39 field errors, grouped as:
  //   Manager not found (13) · Invalid email (2) · Role not found (24)
  // Some rows carry two errors, so per-category counts (39) exceed the row count (28).
  const makeError = (cat: ErrorCategory): CellError => ({
    category: cat,
    label: ERROR_META[cat].label,
    solution: ERROR_META[cat].solution,
  })
  const errorRowSpecs: ErrorCategory[][] = [
    ...Array.from({ length: 13 }, () => ['role-not-found'] as ErrorCategory[]),
    ...Array.from({ length: 4 }, () => ['manager-not-found'] as ErrorCategory[]),
    ...Array.from({ length: 9 }, () => ['role-not-found', 'manager-not-found'] as ErrorCategory[]),
    ...Array.from({ length: 2 }, () => ['role-not-found', 'invalid-email'] as ErrorCategory[]),
  ]
  const errFirst = ['Anthonny', 'Liam', 'Maya', 'Noah', 'Zara', 'Ethan', 'Sofia', 'Aiden', 'Mia', 'Lucas', 'Ava', 'Leo', 'Ruby', 'Felix', 'Nora', 'Hugo', 'Iris', 'Milo', 'June', 'Theo', 'Cleo', 'Otis', 'Lena', 'Finn', 'Vera', 'Cody', 'Demi', 'Rhys']
  const errLast = ['Wallace', 'Johnson', 'Smith', 'Brown', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Moore', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Reed', 'Cook', 'Bell', 'Ward', 'Cox']
  const errTeams = ['Commercial', 'Operations & Production', 'Marketing', 'Engineering', 'Fron-Desk Services', 'Product & Design', 'RevOps']
  const errRoles = ['Customer Support', 'Financial Solutions Advisor', 'Client Relations Specialist', 'Risk Management Consultant', 'Compliance Officer', 'Investment Support Analyst', 'Wealth Management Associate']
  const errorRows: PreviewEntry[] = errorRowSpecs.map((cats, i) => {
    const errors: Partial<Record<ErrorColumn, CellError>> = {}
    cats.forEach(c => { errors[ERROR_META[c].column] = makeError(c) })
    const first = errFirst[i % errFirst.length]
    return {
      row: 100 + i,
      firstName: first,
      lastName: errLast[i % errLast.length],
      email: cats.includes('invalid-email') ? `${first.toLowerCase()}@email` : `${first.toLowerCase()}@email.com`,
      team: errTeams[i % errTeams.length],
      role: errRoles[i % errRoles.length],
      reportsTo: 'manager@email.com',
      startDate: '17/01/2026',
      region: 'East Asia',
      type: 'error' as const,
      errors,
      customFields: withCustom(i),
    }
  })

  return [
    // Errors (only on first upload)
    ...(includeErrors ? errorRows : []),
    // Deactivations
    { row: 5, firstName: 'Mark', lastName: 'Johnson', email: 'mark@company.com', team: 'Support', role: 'HR Manager', reportsTo: 'director@company.com', startDate: '05/09/2024', region: 'Europe', type: 'deactivation', customFields: withCustom(4) },
    { row: 41, firstName: 'Paula', lastName: 'West', email: 'paula@company.com', team: 'Finance', role: 'Finance Analyst', reportsTo: 'lead@company.com', startDate: '12/02/2024', region: 'North America', type: 'deactivation', customFields: withCustom(5) },
    // New invites
    { row: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', team: 'Commercial', role: 'Engineer', reportsTo: 'lead@company.com', startDate: '01/04/2025', region: 'Southeast Asia', type: 'invite', warnings: { team: { kind: 'danger', message: 'Team name not found!' } }, customFields: withCustom(6) },
    { row: 2, firstName: 'Sarah', lastName: 'Lee', email: 'sarah.lee@example.com', team: 'Operations & Production', role: 'Designer', reportsTo: 'director@company.com', startDate: '15/04/2025', region: 'East Asia', type: 'invite', warnings: { team: { kind: 'danger', message: 'Team name not found!' }, region: { kind: 'info', message: 'New region will be created on invite' } }, customFields: withCustom(7) },
    { row: 8, firstName: 'Tom', lastName: 'Park', email: 'tom.p@example.com', team: 'Product', role: 'HR Manager', reportsTo: 'manager@company.com', startDate: '01/05/2025', region: 'North America', type: 'invite', customFields: withCustom(8) },
    { row: 12, firstName: 'Nina', lastName: 'Rao', email: 'nina@example.com', team: 'Sales', role: 'Sales Rep', reportsTo: 'manager@company.com', startDate: '20/05/2025', region: 'Europe', type: 'invite', warnings: { region: { kind: 'info', message: 'New region will be created on invite' } }, customFields: withCustom(9) },
    { row: 19, firstName: 'Alex', lastName: 'Moreno', email: 'alex.m@example.com', team: 'Engineering', role: 'Engineer', reportsTo: 'lead@company.com', startDate: '10/06/2025', region: 'Latin America', type: 'invite', warnings: { region: { kind: 'info', message: 'New region will be created on invite' } }, customFields: withCustom(10) },
    // Updates
    { row: 4, firstName: 'John', lastName: 'Smith', email: 'john@company.com', team: 'Marketing', role: 'Designer', reportsTo: 'director@company.com', startDate: '08/08/2024', region: 'Europe', type: 'update', detail: 'Team: Sales → Marketing', customFields: withCustom(11) },
    { row: 6, firstName: 'Emma', lastName: 'Davis', email: 'emma@company.com', team: 'Fron-Desk Services', role: 'HR Manager', reportsTo: 'manager@company.com', startDate: '22/10/2024', region: 'North America', type: 'update', detail: 'Region: Europe → North America', warnings: { team: { kind: 'danger', message: 'Team name not found!' } }, customFields: withCustom(12) },
    { row: 9, firstName: 'Wei', lastName: 'Zhang', email: 'wei@company.com', team: 'Engineering', role: 'Engineer', reportsTo: 'lead@company.com', startDate: '03/11/2024', region: 'East Asia', type: 'update', detail: 'Role: Junior → Senior', customFields: withCustom(13) },
    // No changes (bulk)
    ...Array.from({ length: 38 }, (_, i) => ({
      row: 30 + i,
      firstName: ['James', 'Maria', 'Chen', 'Priya', 'Omar'][i % 5],
      lastName: `Employee${30 + i}`,
      email: `employee${30 + i}@company.com`,
      team: ['Sales', 'Engineering', 'Marketing', 'Support', 'Finance'][i % 5],
      role: mockRoles[i % 5],
      reportsTo: mockManagers[i % 3],
      startDate: `${String((i % 28) + 1).padStart(2, '0')}/${String((i % 12) + 1).padStart(2, '0')}/2024`,
      region: mockRegions[i % 5],
      type: 'no-change' as const,
      customFields: withCustom(14 + i),
    })),
  ]
}

type PreviewFilter = 'all' | 'error' | 'invite' | 'update' | 'deactivation' | 'no-change'

function CellWithWarning({ value, warning }: { value: string; warning?: CellWarning }) {
  const iconRef = useRef<HTMLSpanElement>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 })

  const showTooltip = () => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()
    setTooltipStyle({
      opacity: 1,
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left + rect.width / 2,
      transform: 'translateX(-50%)',
    })
  }

  const hideTooltip = () => {
    setTooltipStyle({ opacity: 0 })
  }

  return (
    <>
      {value}
      {warning && (
        <span
          className="bulk-cell-warning"
          ref={iconRef}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          {warning.kind === 'danger'
            ? <Danger size={16} color="var(--danger-500)" variant="Linear" />
            : <InfoIcon size={16} color="var(--primary-500)" />
          }
          <span className="bulk-cell-warning-tooltip" style={tooltipStyle}>{warning.message}</span>
        </span>
      )}
    </>
  )
}

function CellError({ value, error }: { value: string; error: CellError }) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 })

  const showTooltip = () => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setTooltipStyle({
      opacity: 1,
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left + rect.width / 2,
      transform: 'translateX(-50%)',
    })
  }
  const hideTooltip = () => setTooltipStyle({ opacity: 0 })

  return (
    <span
      className="bulk-cell-error"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <span className="bulk-cell-error-value">{value || '—'}</span>
      <span className="bulk-cell-error-icon" ref={anchorRef}>
        <Danger size={20} color="var(--danger-500)" variant="Linear" />
      </span>
      <span className="bulk-cell-error-tooltip" style={tooltipStyle}>
        <span className="bulk-cell-error-tooltip-title">{error.label}</span>
        <span className="bulk-cell-error-tooltip-solution">{error.solution}</span>
      </span>
    </span>
  )
}

function DataCell({ colClass, value, warning, error }: { colClass: string; value: string; warning?: CellWarning; error?: CellError }) {
  if (error) {
    return (
      <span className={`bulk-preview-col ${colClass} bulk-preview-col--error`}>
        <CellError value={value} error={error} />
      </span>
    )
  }
  return (
    <span className={`bulk-preview-col ${colClass}`}>
      <CellWithWarning value={value} warning={warning} />
    </span>
  )
}

function loadUserFields(): UserField[] {
  try {
    const raw = localStorage.getItem('5mins-user-fields')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function BulkUploadModal({ onClose }: BulkUploadModalProps) {
  const [showMoreAutomations, setShowMoreAutomations] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>('template')
  const [uploaderState, setUploaderState] = useState<UploaderState>('Enabled')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [step, setStep] = useState<Step>('upload')
  const [uploadCount, setUploadCount] = useState(0)
  const [previewFilter, setPreviewFilter] = useState<PreviewFilter>('all')
  const [errorCategory, setErrorCategory] = useState<'all' | ErrorCategory>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10
  // Custom fields from admin settings
  const [userFields, setUserFields] = useState<UserField[]>(loadUserFields)
  useEffect(() => { setUserFields(loadUserFields()) }, [])

  // Scroll tracking for sticky name column
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const [previewHasScroll, setPreviewHasScroll] = useState(false)
  const [previewIsScrolled, setPreviewIsScrolled] = useState(false)

  useEffect(() => {
    const el = previewScrollRef.current
    if (!el) return
    function onScroll() { setPreviewIsScrolled(el!.scrollLeft > 0) }
    function checkOverflow() { setPreviewHasScroll(el!.scrollWidth > el!.clientWidth) }
    el.addEventListener('scroll', onScroll)
    const ro = new ResizeObserver(checkOverflow)
    ro.observe(el)
    checkOverflow()
    return () => { el.removeEventListener('scroll', onScroll); ro.disconnect() }
  }, [step, previewFilter, userFields])

  // Build mock data with custom field values — first upload shows errors,
  // re-upload (count >= 2) is clean, matching the "fix your CSV and re-upload" flow.
  const previewData = useMemo(() => buildMockPreviewData(userFields, uploadCount === 1), [userFields, uploadCount])

  // Preview counts
  const errorCount = previewData.filter(e => e.type === 'error').length
  const inviteCount = previewData.filter(e => e.type === 'invite').length
  const updateCount = previewData.filter(e => e.type === 'update').length
  const deactivationCount = previewData.filter(e => e.type === 'deactivation').length
  const noChangeCount = previewData.filter(e => e.type === 'no-change').length
  const hasErrors = errorCount > 0
  const totalEntries = previewData.length

  // Error grouping — chips count errored ROWS (not field-level errors), so the
  // "All Errors" total agrees with the tab. A row with two error types is counted
  // in both category chips, so category counts can sum higher than the row total.
  const errorEntries = previewData.filter(e => e.type === 'error')
  const categoryRowCount = (c: ErrorCategory) =>
    errorEntries.filter(e => (Object.values(e.errors ?? {}) as CellError[]).some(f => f.category === c)).length
  const errorChips = [
    { key: 'all' as const, label: 'All Errors', count: errorEntries.length },
    ...ERROR_ORDER.map(c => ({ key: c, label: ERROR_META[c].chipLabel, count: categoryRowCount(c) })),
  ].filter(chip => chip.key === 'all' || chip.count > 0)
  const visibleErrorEntries = errorCategory === 'all'
    ? errorEntries
    : errorEntries.filter(e => (Object.values(e.errors ?? {}) as CellError[]).some(f => f.category === errorCategory))

  // Set default tab when entering preview
  useEffect(() => {
    if (step === 'preview') {
      setPreviewFilter(hasErrors ? 'error' : 'all')
      setErrorCategory('all')
      setCurrentPage(1)
    }
  }, [step, hasErrors])

  const filteredEntries = previewFilter === 'all'
    ? [...previewData].sort((a, b) => (a.type === 'error' ? -1 : b.type === 'error' ? 1 : 0))
    : previewFilter === 'error'
    ? visibleErrorEntries
    : previewData.filter(e => e.type === previewFilter)

  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const paginationStart = (currentPage - 1) * rowsPerPage + 1
  const paginationEnd = Math.min(currentPage * rowsPerPage, filteredEntries.length)

  const handleFilterChange = (filter: PreviewFilter) => {
    setPreviewFilter(filter)
    if (filter !== 'error') setErrorCategory('all')
    setCurrentPage(1)
  }

  const handleErrorCategoryChange = (category: 'all' | ErrorCategory) => {
    setErrorCategory(category)
    setCurrentPage(1)
  }

  const handleDownloadTemplate = () => {
    const baseHeaders = ['first_name', 'last_name', 'email', 'status', 'team_name', 'role', 'start_date', 'region', 'teamRights']
    const customHeaders = userFields.map(f => f.name)
    const headers = [...baseHeaders, ...customHeaders]
    const baseRow1 = ['Neymar', 'Jr', 'divjot+1407@5mins.ai', 'ACTIVE', 'Content Team', 'HR Manager', '01/11/2025', 'Southeast Asia', 'Team Member']
    const baseRow2 = ['Neymar', 'Sr', 'divjot+1408@5mins.ai', 'ACTIVE', 'Content Team', 'Finance Analyst', '22/10/2025', 'Europe', 'Team Manager']
    // Add example values for custom fields (first option or empty)
    const customRow1 = userFields.map(f => f.options[0] || '')
    const customRow2 = userFields.map(f => f.options.length > 1 ? f.options[1] : f.options[0] || '')
    const rows = [
      [...baseRow1, ...customRow1],
      [...baseRow2, ...customRow2],
    ]
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-manage-people-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download only the errored rows, with the error + the fix in trailing columns,
  // so the admin can correct the CSV and re-upload.
  const handleDownloadErrorFile = () => {
    const baseHeaders = ['first_name', 'last_name', 'email', 'team_name', 'role', 'reports_to', 'start_date', 'region']
    const customHeaders = userFields.map(f => f.name)
    const headers = [...baseHeaders, ...customHeaders, 'Error', 'How to fix']
    const rows = errorEntries.map(e => {
      const errs = Object.values(e.errors ?? {}) as CellError[]
      const baseRow = [e.firstName, e.lastName, e.email, e.team, e.role, e.reportsTo, e.startDate, e.region]
      const customRow = userFields.map(f => e.customFields?.[f.id] ?? '')
      return [
        ...baseRow,
        ...customRow,
        errs.map(x => x.label).join(' · '),
        errs.map(x => x.solution).join(' '),
      ]
    })
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-upload-errors.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSection = (key: string) => {
    setOpenSection(prev => prev === key ? null : key)
  }

  const baseExpectedHeaders = ['first_name', 'last_name', 'email', 'status', 'team_name', 'role', 'start_date', 'region', 'teamRights']
  const requiredHeaders = ['first_name', 'last_name', 'email']

  const validateCsvHeaders = (text: string): string | null => {
    const firstLine = text.replace(/^\uFEFF/, '').split('\n')[0]
    if (!firstLine?.trim()) return 'The file appears to be empty.'

    const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const headersLower = headers.map(h => h.toLowerCase())
    const expectedLower = [...baseExpectedHeaders, ...userFields.map(f => f.name)].map(h => h.toLowerCase())

    const missingRequired = requiredHeaders.filter(r => !headersLower.includes(r.toLowerCase()))
    if (missingRequired.length > 0) {
      return `Missing required columns: ${missingRequired.join(', ')}. Please use the CSV template.`
    }

    const unknownHeaders = headers.filter((_, i) => !expectedLower.includes(headersLower[i]))
    if (unknownHeaders.length > 0) {
      return `Unrecognized columns: ${unknownHeaders.join(', ')}. Please use the CSV template.`
    }

    return null
  }

  const handleFileSelect = async (file: File) => {
    setUploadedFileName(file.name)
    setErrorMessage('')

    // Validate CSV headers match our template
    try {
      const text = await file.text()
      const headerError = validateCsvHeaders(text)
      if (headerError) {
        setUploaderState('Error')
        setErrorMessage(headerError)
        return
      }
    } catch {
      setUploaderState('Error')
      setErrorMessage('Unable to read the file. Please try again.')
      return
    }

    setUploaderState('Uploading')
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 120))
      setUploadProgress(i)
    }
    setUploaderState('Filled')
    setUploadCount(prev => prev + 1)
    setStep('preview')
  }

  const handleChangeFile = () => {
    setUploaderState('Enabled')
    setUploadedFileName('')
    setUploadProgress(0)
    setErrorMessage('')
  }

  const handleBackToUpload = () => {
    setStep('upload')
  }

  return (
    <div className="bulk-upload-modal">
      <div className={`bulk-upload-content${step === 'preview' ? ' bulk-upload-content--preview' : ''}`}>
        <div className={`bulk-upload-form${step === 'preview' ? ' bulk-upload-form--preview' : ''}`}>
          {/* Header (hidden on success) */}
          {step !== 'success' && (
            <div className="bulk-upload-header">
              <h2 className="bulk-upload-title">
                {step === 'upload' ? 'Bulk manage people' : 'Review CSV file'}
              </h2>
              <CloseButton onClick={onClose} />
            </div>
          )}

          {step === 'upload' && (
            <>
              {/* Alert banner */}
              <div className="bulk-upload-alert">
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.63184 2.32567C8.63184 1.04348 9.64162 0 10.8824 0C12.1232 0 13.133 1.04348 13.133 2.32567C13.133 3.60787 12.1232 4.65134 10.8824 4.65134C9.64162 4.65134 8.63184 3.60967 8.63184 2.32567ZM9.94088 2.32567C9.94088 2.86278 10.3626 3.29862 10.8824 3.29862C11.4022 3.29862 11.8239 2.86278 11.8239 2.32567C11.8239 1.78856 11.4022 1.35272 10.8824 1.35272C10.3626 1.35272 9.94088 1.79037 9.94088 2.32567Z" fill="#E2A610"/>
                  <path d="M12.818 1.14844C12.818 1.14844 12.9177 1.55896 12.4575 1.7832C11.9972 2.00564 11.6927 1.84108 11.6927 1.84108C11.7749 1.98575 11.8239 2.15032 11.8239 2.32936C11.8239 2.86647 11.4022 3.30231 10.8824 3.30231C10.3626 3.30231 9.94088 2.86647 9.94088 2.32936C9.94088 2.2751 9.95313 2.07075 10.0371 1.90075C9.25661 2.28415 8.66334 1.95682 8.66334 1.95682C8.64409 2.07798 8.63184 2.20277 8.63184 2.32936C8.63184 3.61155 9.64162 4.65503 10.8824 4.65503C12.1232 4.65503 13.133 3.61155 13.133 2.32755C13.133 1.89714 13.0175 1.49385 12.818 1.14844Z" fill="#9E740B"/>
                  <path d="M1.13054 16.6149C2.31533 15.4123 3.05385 15.0072 3.35486 13.2638C3.65587 11.5205 3.41437 7.84753 4.74091 5.44228C5.95194 3.23959 8.17451 2.32812 10.3428 2.32812C10.3953 2.32812 10.4478 2.33174 10.5003 2.33174C10.5528 2.32993 10.6053 2.32812 10.6578 2.32812C12.8262 2.32812 15.0487 3.23959 16.2598 5.44047C17.5846 7.84753 17.3448 11.5205 17.6458 13.262C17.9468 15.0054 18.6853 15.4105 19.8701 16.6131C20.3811 17.1321 20.9989 17.9586 21.0007 18.4903C21.0024 19.022 20.7399 19.2155 20.1151 19.4867C18.3476 20.2553 15.985 21.0004 10.5003 21.0004C5.01567 21.0004 2.65309 20.2553 0.885536 19.4867C0.260767 19.2155 -0.00174137 19.0238 8.68877e-06 18.4903C0.00175874 17.9604 0.619528 17.1339 1.13054 16.6149Z" fill="#FFCA28"/>
                  <path d="M19.1983 18.5285C19.1983 17.7274 15.3044 17.0781 10.5005 17.0781C5.69661 17.0781 1.80273 17.7274 1.80273 18.5285C1.80273 19.3296 5.69661 20.2863 10.5005 20.2863C15.3044 20.2863 19.1983 19.3296 19.1983 18.5285Z" fill="#4E342E"/>
                  <path d="M15.7227 7.02376C15.7874 7.27875 15.8417 7.53374 15.8854 7.78331C16.1077 9.06008 16.0674 10.3694 16.1672 11.6624C16.3019 13.3931 16.5994 14.3046 17.2767 15.1184C17.366 15.2251 17.275 15.3897 17.1402 15.368C16.2354 15.2251 15.5092 15.0822 14.6814 14.518C13.4458 13.6771 13.1413 12.0947 13.1326 10.6732C13.1186 8.55733 13.1571 6.50835 12.9943 5.73072C12.7686 4.64745 12.5586 4.07055 12.2156 3.54429C11.6923 2.74134 13.7241 3.85535 14.0426 4.10311C14.9299 4.79575 15.4392 5.90975 15.7227 7.02376Z" fill="#E2A610"/>
                  <path d="M4.70553 9.84029C4.68453 8.46948 4.69503 7.05165 5.22355 5.79297C5.54031 5.04065 6.07757 4.36248 6.7636 3.94111C7.30261 3.61016 8.39815 3.24485 8.79191 3.99536C8.87066 4.14546 8.90216 4.32088 8.90741 4.49269C8.92141 5.09129 8.6204 5.64467 8.32814 6.16189C7.46362 7.69546 7.11886 9.3719 6.66209 11.0718C6.47484 11.7735 6.23683 12.4734 5.82907 13.0666C5.54906 13.4735 3.98976 14.9202 4.34677 13.6127C4.68978 12.3486 4.72478 11.1568 4.70553 9.84029Z" fill="#FFF59D"/>
                  <path d="M12.0905 18.2497C12.0888 17.9387 11.926 17.7597 11.5515 17.6258C10.7745 17.3491 9.80145 17.3998 9.23443 17.7144C8.63941 18.0436 9.05242 19.8683 10.4997 19.8683C11.947 19.8683 12.0923 18.4867 12.0905 18.2497Z" fill="#E2A610"/>
                  <path d="M5.11874 15.5269C3.5822 15.8054 2.46916 16.4076 1.9879 16.8959C1.60639 17.2811 1.60639 17.5849 2.27841 17.2684C2.78417 17.0297 4.40472 16.545 5.82402 16.3985C8.26184 16.1453 9.76689 16.1399 10.0171 16.1453C10.6034 16.158 10.6524 15.6914 9.46763 15.5269C8.28284 15.3641 6.65529 15.2502 5.11874 15.5269Z" fill="#FFF59D"/>
                  <path d="M9.88044 19.5106C10.0834 19.6553 10.353 19.7258 10.5805 19.6282C10.808 19.5305 10.955 19.2321 10.843 19.0061C10.7992 18.9175 10.724 18.8505 10.6487 18.7891C10.4405 18.6209 10.2094 18.4834 9.96444 18.3822C9.86819 18.3424 9.76668 18.3062 9.66168 18.3134C9.55843 18.3189 9.44992 18.3749 9.40967 18.4744C9.23642 18.8813 9.58293 19.3008 9.88044 19.5106Z" fill="#FFF59D"/>
                </svg>
                <div className="bulk-upload-alert-info">
                  <p className="bulk-upload-alert-text">
                    Join date, role, and region are required by your automations. All invited users will be evaluated against these automations.
                  </p>
                  {automations.map((a, i) => (
                    <div className="bulk-upload-alert-row" key={i}>
                      <span className="bulk-upload-alert-bullet">{a.name}</span>
                      <div className="bulk-upload-alert-badges">
                        {a.badges.map(b => (
                          <span className="bulk-upload-alert-badge" key={b}>{b}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    className="bulk-upload-alert-more"
                    onClick={() => setShowMoreAutomations(!showMoreAutomations)}
                  >
                    {showMoreAutomations ? 'show less' : 'and 4 more automations'}
                    <ArrowDown2
                      size={14}
                      color="var(--text-tertiary)"
                      style={{ transform: showMoreAutomations ? 'rotate(180deg)' : undefined, transition: 'transform 200ms ease' }}
                    />
                  </button>
                </div>
              </div>

              {/* Accordion sections */}
              <div className="bulk-upload-accordions">
                {/* 1. Download and fill in the template */}
                <div className="bulk-upload-accordion-section">
                  <div
                    className="bulk-upload-accordion-header"
                    onClick={() => toggleSection('template')}
                  >
                    <span className={`bulk-upload-accordion-title${openSection === 'template' ? ' bulk-upload-accordion-title--active' : ''}`}>Download and fill in the template</span>
                    <div className={`bulk-upload-accordion-chevron${openSection === 'template' ? ' bulk-upload-accordion-chevron--open' : ''}`}>
                      <ArrowDown2 size={20} color="var(--text-secondary)" />
                    </div>
                  </div>
                  <div className={`bulk-upload-accordion-panel${openSection === 'template' ? ' bulk-upload-accordion-panel--open' : ''}`}>
                    <div className="bulk-upload-accordion-body">
                      <p className="bulk-upload-accordion-desc">Download our CSV file and fill the information with the correct format and column headers. The <span style={{ fontWeight: 500 }}>status</span> column controls what happens to each user.</p>
                      <div className="bulk-upload-ctas">
                        <button className="bulk-upload-btn-primary" onClick={handleDownloadTemplate}>
                          Download CSV template
                          <ImportCurve size={20} color="var(--neutral-25)" />
                        </button>
                        <button className="bulk-upload-btn-outlined">
                          Download Available Roles
                        </button>
                        <button className="bulk-upload-btn-text">
                          Export Current Users
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_6588_8697)">
                              <path fillRule="evenodd" clipRule="evenodd" d="M17.5 5.625V17.5C17.5 18.163 17.2366 18.7989 16.7678 19.2678C16.2989 19.7366 15.663 20 15 20H13.75V18.75H15C15.3315 18.75 15.6495 18.6183 15.8839 18.3839C16.1183 18.1495 16.25 17.8315 16.25 17.5V5.625H13.75C13.2527 5.625 12.7758 5.42746 12.4242 5.07583C12.0725 4.72419 11.875 4.24728 11.875 3.75V1.25H5C4.66848 1.25 4.35054 1.3817 4.11612 1.61612C3.8817 1.85054 3.75 2.16848 3.75 2.5V13.75H2.5V2.5C2.5 1.83696 2.76339 1.20107 3.23223 0.732233C3.70107 0.263392 4.33696 0 5 0L11.875 0L17.5 5.625ZM4.39625 18.5512C4.40341 18.7482 4.4517 18.9415 4.53803 19.1187C4.62435 19.2958 4.7468 19.453 4.8975 19.58C5.06 19.715 5.25917 19.82 5.495 19.895C5.73167 19.9708 6.00875 20.0087 6.32625 20.0087C6.74875 20.0087 7.10667 19.9429 7.4 19.8112C7.695 19.6796 7.91958 19.4963 8.07375 19.2613C8.22958 19.0246 8.3075 18.7513 8.3075 18.4413C8.3075 18.1613 8.25167 17.9279 8.14 17.7412C8.02564 17.5539 7.86397 17.4 7.67125 17.295C7.45006 17.1722 7.21151 17.0837 6.96375 17.0325L6.1875 16.8525C6.0049 16.8176 5.83238 16.7425 5.6825 16.6325C5.62547 16.5885 5.5795 16.5318 5.54825 16.4669C5.517 16.4021 5.50133 16.3308 5.5025 16.2587C5.5025 16.0637 5.57958 15.9038 5.73375 15.7788C5.89042 15.6521 6.10375 15.5887 6.37375 15.5887C6.55208 15.5887 6.70625 15.6171 6.83625 15.6737C6.95655 15.7214 7.06248 15.7993 7.14375 15.9C7.22068 15.9928 7.27235 16.1039 7.29375 16.2225H8.23125C8.21512 15.968 8.12857 15.7231 7.98125 15.515C7.82373 15.2902 7.60755 15.1129 7.35625 15.0025C7.04946 14.8673 6.71635 14.8024 6.38125 14.8125C6.01542 14.8125 5.69208 14.875 5.41125 15C5.13042 15.1242 4.91083 15.2996 4.7525 15.5262C4.59417 15.7537 4.515 16.02 4.515 16.325C4.515 16.5767 4.56583 16.795 4.6675 16.98C4.77083 17.1658 4.9175 17.3188 5.1075 17.4388C5.2975 17.5579 5.52208 17.6467 5.78125 17.705L6.55375 17.885C6.81208 17.9458 7.005 18.0263 7.1325 18.1263C7.19455 18.1739 7.24421 18.2359 7.27728 18.3068C7.31036 18.3777 7.32586 18.4556 7.3225 18.5337C7.32532 18.6626 7.28821 18.7893 7.21625 18.8962C7.13571 19.0059 7.02494 19.0898 6.8975 19.1375C6.75833 19.1958 6.58625 19.225 6.38125 19.225C6.23542 19.225 6.10208 19.2083 5.98125 19.175C5.87043 19.1452 5.76557 19.0966 5.67125 19.0313C5.58813 18.9773 5.51697 18.9068 5.46214 18.8243C5.40732 18.7417 5.37 18.6488 5.3525 18.5512H4.39625ZM1.0075 17.1162C1.0075 16.8054 1.05 16.5417 1.135 16.325C1.20927 16.1254 1.34054 15.9519 1.5125 15.8263C1.68737 15.7079 1.89522 15.648 2.10625 15.655C2.29375 15.655 2.45958 15.6954 2.60375 15.7763C2.74462 15.8515 2.8622 15.9639 2.94375 16.1012C3.03087 16.2458 3.08229 16.4091 3.09375 16.5775H4.05V16.4875C4.04171 16.2572 3.98564 16.0312 3.88537 15.8238C3.78509 15.6164 3.64279 15.432 3.4675 15.2825C3.28871 15.1292 3.0808 15.0135 2.85625 14.9425C2.61255 14.859 2.35633 14.818 2.09875 14.8213C1.65375 14.8213 1.27417 14.9142 0.96 15.1C0.6475 15.285 0.409167 15.5483 0.245 15.89C0.0825 16.2317 0.000833333 16.6396 0 17.1137V17.7363C0 18.2096 0.0804167 18.6162 0.24125 18.9562C0.405417 19.2954 0.64375 19.5563 0.95625 19.7388C1.26875 19.9196 1.64958 20.01 2.09875 20.01C2.46458 20.01 2.79167 19.9417 3.08 19.805C3.36833 19.6683 3.5975 19.4792 3.7675 19.2375C3.93995 18.9893 4.03795 18.697 4.05 18.395V18.3H3.095C3.08316 18.4609 3.03256 18.6166 2.9475 18.7538C2.8642 18.8865 2.74677 18.9944 2.6075 19.0663C2.45102 19.1406 2.27948 19.1778 2.10625 19.175C1.89511 19.1806 1.68709 19.1232 1.50875 19.01C1.33741 18.8883 1.20708 18.7174 1.135 18.52C1.04363 18.2691 1.00038 18.0032 1.0075 17.7363V17.1162ZM11.3063 19.9137H10.115L8.4425 14.915H9.58875L10.7088 18.8375H10.7562L11.8663 14.915H12.965L11.3063 19.9137Z" fill="currentColor"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_6588_8697">
                                <rect width="20" height="20" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </button>
                      </div>

                      {/* Annotated example CSV */}
                      <div className="csv-preview">
                        <table className="csv-preview-table">
                          <thead>
                            <tr>
                              <th className="csv-col-scenario">Scenario</th>
                              <th>email</th>
                              <th>status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="csv-preview-tr--success">
                              <td className="csv-col-scenario">
                                <span className="csv-preview-badge csv-preview-badge--success">New email address</span>
                                <span className="csv-preview-result-text">User will receive an invitation email</span>
                              </td>
                              <td>jane@example.com</td>
                              <td className="csv-col-empty" />
                            </tr>
                            <tr className="csv-preview-tr--warning">
                              <td className="csv-col-scenario">
                                <span className="csv-preview-badge csv-preview-badge--warning">Existing email + Active status</span>
                                <span className="csv-preview-result-text">User information will be updated</span>
                              </td>
                              <td>john@example.com</td>
                              <td>Active</td>
                            </tr>
                            <tr className="csv-preview-tr--danger">
                              <td className="csv-col-scenario">
                                <span className="csv-preview-badge csv-preview-badge--danger">Existing email + Inactive status</span>
                                <span className="csv-preview-result-text">User will lose access immediately</span>
                              </td>
                              <td>alex@example.com</td>
                              <td>Inactive</td>
                            </tr>
                            <tr className="csv-preview-tr--neutral">
                              <td className="csv-col-scenario">
                                <span className="csv-preview-badge csv-preview-badge--neutral">No status specified</span>
                                <span className="csv-preview-result-text">Defaults to Active</span>
                              </td>
                              <td>sam@example.com</td>
                              <td className="csv-col-empty" />
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Upload CSV file (always visible, not collapsible) */}
                <div className="bulk-upload-accordion-section">
                  <span className="bulk-upload-accordion-title">Upload CSV file</span>
                  <FileUploader
                    state={uploaderState}
                    fileName={uploadedFileName}
                    progress={uploadProgress}
                    errorMessage={errorMessage}
                    accept=".csv"
                    onFileSelect={handleFileSelect}
                    onChangeFile={handleChangeFile}
                  />
                </div>
              </div>
            </>
          )}

          {/* ─── PREVIEW STEP ─── */}
          {step === 'preview' && (
            <div className="bulk-preview">
              {/* Error banner (takes priority over deactivation warning) */}
              {hasErrors ? (
                <div className="bulk-preview-error-banner">
                  <Danger size={20} color="var(--danger-500)" variant="Bold" />
                  <span>
                    {errorCount} invite{errorCount !== 1 ? 's have' : ' has'} errors. Download the error file to fix your CSV and re-upload to continue.
                  </span>
                </div>
              ) : deactivationCount > 0 ? (
                <div className="bulk-preview-warning-banner">
                  <UserMinus size={20} color="var(--text-warning)" variant="Linear" />
                  <span>Warning: {deactivationCount} {deactivationCount > 1 ? 'people' : 'person'} will lose access immediately after processing.</span>
                </div>
              ) : null}

              {/* Filter tabs */}
              <div className="bulk-preview-tabs">
                {([
                  ...(!hasErrors ? [{ key: 'all', label: 'All Users', count: totalEntries, color: 'neutral' }] : []),
                  ...(hasErrors ? [{ key: 'error', label: 'Errors', count: errorCount, color: 'error' }] : []),
                  { key: 'invite', label: 'New Invites', count: inviteCount, color: 'success' },
                  { key: 'update', label: 'Updates', count: updateCount, color: 'primary' },
                  { key: 'deactivation', label: 'Deactivations', count: deactivationCount, color: 'warning' },
                  { key: 'no-change', label: 'No Changes', count: noChangeCount, color: 'neutral' },
                ] as { key: PreviewFilter; label: string; count: number; color: string }[]).map(tab => (
                  <button
                    key={tab.key}
                    className={`bulk-preview-tab ${previewFilter === tab.key ? 'bulk-preview-tab--active' : ''}`}
                    onClick={() => handleFilterChange(tab.key)}
                  >
                    {tab.label}
                    <span className={`bulk-preview-tab-counter bulk-preview-tab-counter--${tab.color}`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Error grouping chips + download error file */}
              {previewFilter === 'error' && (
                <div className="bulk-preview-error-actions">
                  <div className="bulk-preview-error-chips">
                    {errorChips.map(chip => (
                      <Chip
                        key={chip.key}
                        label={`${chip.label} (${chip.count})`}
                        selected={errorCategory === chip.key}
                        onClick={() => handleErrorCategoryChange(chip.key)}
                        className="bulk-error-chip"
                      />
                    ))}
                  </div>
                  <button className="bulk-upload-btn-primary bulk-preview-download-error" onClick={handleDownloadErrorFile}>
                    Download Error File
                    <DocumentDownload size={20} color="var(--neutral-25)" variant="Linear" />
                  </button>
                </div>
              )}

              {/* Data table — 5Mins card-row style */}
              <div
                className={`bulk-preview-scroll${previewHasScroll ? ' bulk-preview-scroll--has-scroll' : ''}${previewIsScrolled ? ' bulk-preview-scroll--scrolled' : ''}`}
                ref={previewScrollRef}
              >
                <div className="bulk-preview-table-5m">
                  {/* Header */}
                  <div className="bulk-preview-table-header">
                    <span className="bulk-preview-col bulk-preview-col--firstname">First name</span>
                    <span className="bulk-preview-col bulk-preview-col--lastname">Last name</span>
                    <span className="bulk-preview-col bulk-preview-col--email">Email</span>
                    <span className="bulk-preview-col bulk-preview-col--team">Team</span>
                    <span className="bulk-preview-col bulk-preview-col--role">Role</span>
                    <span className="bulk-preview-col bulk-preview-col--reportsto">Reports to</span>
                    <span className="bulk-preview-col bulk-preview-col--startdate">Start date</span>
                    <span className="bulk-preview-col bulk-preview-col--region">Region</span>
                    {userFields.map(f => (
                      <span key={f.id} className="bulk-preview-col bulk-preview-col--custom">{f.name}</span>
                    ))}
                  </div>

                  {/* Rows */}
                  <div className="bulk-preview-table-rows">
                    {paginatedEntries.map((entry, i) => (
                      <div
                        key={i}
                        className={`bulk-preview-table-row ${entry.type === 'error' ? 'bulk-preview-table-row--error' : ''}`}
                      >
                        <span className="bulk-preview-col bulk-preview-col--firstname">
                          {entry.firstName || '—'}
                        </span>
                        <span className="bulk-preview-col bulk-preview-col--lastname">
                          {entry.lastName || '—'}
                        </span>
                        <DataCell colClass="bulk-preview-col--email" value={entry.email} error={entry.errors?.email} />
                        <span className="bulk-preview-col bulk-preview-col--team">
                          <CellWithWarning value={entry.team} warning={entry.warnings?.team} />
                        </span>
                        <DataCell colClass="bulk-preview-col--role" value={entry.role} warning={entry.warnings?.role} error={entry.errors?.role} />
                        <DataCell colClass="bulk-preview-col--reportsto" value={entry.reportsTo} warning={entry.warnings?.reportsTo} error={entry.errors?.reportsTo} />
                        <span className="bulk-preview-col bulk-preview-col--startdate">{entry.startDate}</span>
                        <span className="bulk-preview-col bulk-preview-col--region">
                          <CellWithWarning value={entry.region} warning={entry.warnings?.region} />
                        </span>
                        {userFields.map(f => (
                          <span key={f.id} className="bulk-preview-col bulk-preview-col--custom">
                            {entry.customFields?.[f.id] || '—'}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pagination */}
              {filteredEntries.length > rowsPerPage && (
                <div className="bulk-preview-pagination">
                  <span className="bulk-preview-pagination-text">
                    {paginationStart}-{paginationEnd} of {filteredEntries.length}
                  </span>
                  <button
                    className="bulk-preview-pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ArrowLeft2 size={16} color="currentColor" />
                  </button>
                  <button
                    className="bulk-preview-pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ArrowRight2 size={16} color="currentColor" />
                  </button>
                </div>
              )}

              {/* Action bar */}
              <div className="bulk-preview-actions">
                <button className="bulk-upload-btn-outlined" onClick={handleBackToUpload}>
                  Back To Upload
                </button>
                <div className="bulk-preview-btn-wrapper">
                  <button
                    className={`bulk-upload-btn-primary${hasErrors ? ' bulk-upload-btn-primary--disabled' : ''}`}
                    onClick={hasErrors ? undefined : () => setStep('success')}
                    disabled={hasErrors}
                  >
                    {hasErrors
                      ? 'Process Users'
                      : `Process ${totalEntries - errorCount} User${totalEntries - errorCount !== 1 ? 's' : ''}`}
                  </button>
                  {hasErrors && (
                    <div className="bulk-preview-tooltip">
                      {errorCount} invite{errorCount !== 1 ? 's have' : ' has'} errors. Fix your CSV and re-upload to continue.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── SUCCESS STEP ─── */}
          {step === 'success' && (
            <div className="bulk-success">
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M47.9438 92.9688C72.7967 92.9688 92.9438 72.8216 92.9438 47.9688C92.9438 23.1159 72.7967 2.96875 47.9438 2.96875C23.091 2.96875 2.94385 23.1159 2.94385 47.9688C2.94385 72.8216 23.091 92.9688 47.9438 92.9688Z" fill="#11763D"/>
                <path d="M45.0188 89.3687C68.2562 89.3687 87.0938 70.5311 87.0938 47.2937C87.0938 24.0564 68.2562 5.21875 45.0188 5.21875C21.7815 5.21875 2.94385 24.0564 2.94385 47.2937C2.94385 70.5311 21.7815 89.3687 45.0188 89.3687Z" fill="#18A957"/>
                <path d="M17.9746 22.2766C21.3496 16.9516 28.5496 12.5266 36.0496 11.1766C37.9246 10.8766 39.7996 10.7266 41.3746 11.3266C42.5746 11.7766 43.5496 12.9016 42.8746 14.1766C42.3496 15.2266 40.9246 15.6766 39.7996 16.0516C32.7646 18.3766 26.6971 22.9591 22.5496 29.1016C21.0496 31.3516 18.7996 37.5766 16.0246 36.0016C13.0996 34.2766 13.6996 28.8766 17.9746 22.2766Z" fill="#A3DDBC"/>
                <path d="M31 48.0075L42.32 59.3275L65 36.6875" stroke="#F9F9FA" strokeWidth="5.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="bulk-success-title">Users processed successfully!</h3>
              <div className="bulk-success-card">
                <div className="bulk-success-row">
                  <div className="bulk-success-label">
                    <UserAdd size={20} color="var(--text-secondary)" variant="Linear" />
                    <span>New invites sent</span>
                  </div>
                  <span className="bulk-success-value">{inviteCount}</span>
                </div>
                <div className="bulk-success-row">
                  <div className="bulk-success-label">
                    <UserEdit size={20} color="var(--text-secondary)" variant="Linear" />
                    <span>People updated</span>
                  </div>
                  <span className="bulk-success-value">{updateCount}</span>
                </div>
                <div className="bulk-success-row">
                  <div className="bulk-success-label">
                    <UserMinus size={20} color="var(--text-secondary)" variant="Linear" />
                    <span>People deactivated</span>
                  </div>
                  <span className="bulk-success-value">{deactivationCount}</span>
                </div>
              </div>
              <button className="bulk-upload-btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default BulkUploadModal
