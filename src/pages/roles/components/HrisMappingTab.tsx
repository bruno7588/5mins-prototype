import { useEffect, useMemo, useState } from 'react'
import { SearchNormal1, Edit2, Trash, ArrowLeft2, ArrowRight2, Refresh, Danger, TickCircle } from 'iconsax-react'
import Badge from '../../../components/Badge/Badge'
import Alert from '../../../components/Alert/Alert'
import type { CompanyRole, FiveMinsRole } from '../data/mockRoles'
import {
  type HrisRoleMapping,
  type MappingStatus,
  resolveRoleName,
} from '../data/mockHrisMappings'
import './HrisMapping.css'

export type FilterTab = 'all' | 'mapped' | 'unmapped'

interface Props {
  mappings: HrisRoleMapping[]
  tenantRoles: CompanyRole[]
  publicRoles: FiveMinsRole[]
  onEditMapping: (mapping: HrisRoleMapping) => void
  onRemoveMapping: (mapping: HrisRoleMapping) => void
  onSimulateResync: () => void
  syncActivated: boolean
  onActivateSync: () => void
  filterTab: FilterTab
  onFilterTabChange: (tab: FilterTab) => void
}

const STATUS_BADGE: Record<MappingStatus, { type: 'success' | 'warning'; label: string }> = {
  mapped: { type: 'success', label: 'Mapped' },
  unmapped: { type: 'warning', label: 'Unmapped' },
}

function HrisMappingTab({
  mappings,
  tenantRoles,
  publicRoles,
  onEditMapping,
  onRemoveMapping,
  onSimulateResync,
  syncActivated,
  onActivateSync,
  filterTab,
  onFilterTabChange,
}: Props) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const counts = useMemo(() => {
    let mapped = 0
    let unmapped = 0
    for (const m of mappings) {
      if (m.status === 'mapped') mapped++
      else unmapped++
    }
    return { all: mappings.length, mapped, unmapped }
  }, [mappings])

  const unmappedEmployeeCount = useMemo(
    () => mappings
      .filter(m => m.status !== 'mapped')
      .reduce((sum, m) => sum + m.employeeCount, 0),
    [mappings],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mappings.filter(m => {
      if (filterTab === 'unmapped' && m.status === 'mapped') return false
      if (filterTab === 'mapped' && m.status === 'unmapped') return false
      if (q && !m.hrisJobTitle.toLowerCase().includes(q)) return false
      return true
    })
  }, [mappings, search, filterTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage)
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1
  const pageEnd = Math.min(safePage * perPage, filtered.length)

  useEffect(() => { setPage(1) }, [filterTab])

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }
  const handleFilterTab = (tab: FilterTab) => { onFilterTabChange(tab) }

  if (mappings.length === 0) {
    return (
      <div className="roles-empty-state">
        <div className="roles-empty-state__illustration">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="20" width="60" height="56" rx="6" fill="var(--neutral-200, #BFC2CC)" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2" />
            <line x1="28" y1="34" x2="68" y2="34" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="46" x2="58" y2="46" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="58" x2="62" y2="58" stroke="var(--neutral-400, #9EA4B3)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="roles-empty-state__info">
          <h3 className="roles-empty-state__title">No HRIS mappings yet</h3>
          <p className="roles-empty-state__description">
            Connect an HRIS in Dry Run mode to discover job titles and auto-match them to roles.
          </p>
        </div>
        <div className="roles-empty-state__cta">
          <button className="roles-btn-primary-with-icon" onClick={onSimulateResync}>
            Run Dry Run
            <Refresh size={20} color="var(--neutral-25)" />
          </button>
        </div>
      </div>
    )
  }

  const allMapped = counts.unmapped === 0
  const stepperSteps = [
    { label: 'Connect HRIS', status: 'done' as const, Icon: null },
    { label: 'Dry Run', status: 'done' as const, Icon: null },
    { label: 'Review Mappings', status: (allMapped ? 'done' : 'current') as 'done' | 'current', Icon: Edit2 },
    { label: 'Activate Sync', status: (allMapped ? 'current' : 'pending') as 'current' | 'pending', Icon: Refresh },
  ]

  return (
    <>
      {!syncActivated && (
        <ol className="hris-stepper" aria-label="HRIS activation progress">
          {stepperSteps.map((step, idx) => {
            const Icon = step.Icon
            return (
              <li
                key={step.label}
                className={`hris-stepper__step hris-stepper__step--${step.status}`}
                aria-current={step.status === 'current' ? 'step' : undefined}
              >
                <span className="hris-stepper__marker" aria-hidden="true">
                  {step.status === 'done' ? (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : Icon ? (
                    <Icon size={12} variant="Linear" color="currentColor" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="hris-stepper__label">{step.label}</span>
                {idx < stepperSteps.length - 1 && <span className="hris-stepper__line" aria-hidden="true" />}
              </li>
            )
          })}
        </ol>
      )}

      {counts.unmapped > 0 && (
        <div className="hris-banner-wrap">
          <Alert
            type="Alert"
            title={`${counts.unmapped} HRIS job title${counts.unmapped !== 1 ? 's' : ''} couldn't be auto-matched`}
            message={`${unmappedEmployeeCount} employee${unmappedEmployeeCount !== 1 ? 's' : ''} will pick their role during onboarding unless mapped`}
            className="hris-dry-run-alert"
          />
        </div>
      )}

      <div className="roles-filter-bar">
        <div className="roles-category-chips" role="group" aria-label="Mapping filter">
          <button
            type="button"
            aria-pressed={filterTab === 'all'}
            className={`roles-chip${filterTab === 'all' ? ' roles-chip--active' : ''}`}
            onClick={() => handleFilterTab('all')}
          >
            All
          </button>
          <button
            type="button"
            aria-pressed={filterTab === 'mapped'}
            className={`roles-chip roles-chip--with-icon${filterTab === 'mapped' ? ' roles-chip--active' : ''}`}
            onClick={() => handleFilterTab('mapped')}
          >
            <TickCircle size={18} variant="Linear" color="currentColor" />
            Mapped ({counts.mapped})
          </button>
          <button
            type="button"
            aria-pressed={filterTab === 'unmapped'}
            className={`roles-chip roles-chip--with-icon${filterTab === 'unmapped' ? ' roles-chip--active' : ''}`}
            onClick={() => handleFilterTab('unmapped')}
          >
            <Danger size={18} variant="Linear" color="currentColor" />
            Unmapped ({counts.unmapped})
          </button>
        </div>
      </div>

      <div className="hris-search-row">
        <div className="roles-search" style={{ width: 320 }}>
          <SearchNormal1 size={18} variant="Outline" color="var(--text-tertiary)" />
          <input
            className="roles-search-input"
            placeholder="Search HRIS job titles…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && (
            <button className="roles-search__clear" onClick={() => handleSearch('')} aria-label="Clear search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
        {!syncActivated ? (
          <button className="roles-btn-primary-with-icon" onClick={onActivateSync}>
            Activate Sync
            <Refresh size={20} color="var(--neutral-25)" />
          </button>
        ) : (
          <span className="hris-sync-active-pill" role="status" aria-label="HRIS sync active">
            <span className="hris-sync-active-pill__dot" aria-hidden="true" />
            Sync Active
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="roles-empty">
          <div className="roles-empty__illustration">
            <span className="roles-empty__zero">0</span>
          </div>
          <p className="roles-empty__text">
            {search.trim()
              ? 'No results found!'
              : filterTab === 'unmapped'
                ? 'No titles need review!'
                : filterTab === 'mapped'
                  ? 'No mapped titles yet'
                  : 'No results found!'}
          </p>
          <p className="roles-empty__subtext">
            {search.trim()
              ? 'Try a different search term.'
              : filterTab === 'unmapped'
                ? 'Every HRIS job title is mapped to a role.'
                : filterTab === 'mapped'
                  ? 'Map a role to get started.'
                  : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="people-table hris-table">
          <div className="people-table-header">
            <div className="people-table-cell hris-col--title">HRIS Job Title</div>
            <div className="people-table-cell hris-col--count">Employees</div>
            <div className="people-table-cell hris-col--role">Mapped Role</div>
            <div className="people-table-cell hris-col--status">Status</div>
            <div className="people-table-cell hris-col--actions"></div>
          </div>

          {paginated.map(mapping => {
            const badge = STATUS_BADGE[mapping.status]
            const roleName = mapping.role
              ? resolveRoleName(mapping.role, tenantRoles, publicRoles)
              : null
            return (
              <div key={mapping.hrisJobTitle} className="people-table-row">
                <div className="people-table-cell hris-col--title">
                  <button className="roles-role-link" onClick={() => onEditMapping(mapping)}>
                    {mapping.hrisJobTitle}
                  </button>
                </div>
                <div className="people-table-cell hris-col--count">
                  {mapping.employeeCount}
                </div>
                <div className="people-table-cell hris-col--role">
                  {mapping.role && roleName ? (
                    <div className="hris-role-cell">
                      <span className="hris-role-cell__name">{roleName}</span>
                      <span className="hris-role-cell__source">
                        {mapping.role.kind === 'tenant' ? 'Company role' : '5Mins role'}
                      </span>
                    </div>
                  ) : (
                    <span className="hris-role-cell__missing">—</span>
                  )}
                </div>
                <div className="people-table-cell hris-col--status">
                  <Badge
                    type={badge.type}
                    label={badge.label}
                    icon
                    customIcon={mapping.status === 'unmapped' ? <Danger size={16} variant="Linear" color="currentColor" /> : undefined}
                  />
                </div>
                <div className="people-table-cell hris-col--actions">
                  {mapping.status === 'mapped' ? (
                    <>
                      <span className="roles-icon-btn-wrapper">
                        <button
                          className="roles-icon-btn"
                          aria-label={`Edit mapping for ${mapping.hrisJobTitle}`}
                          onClick={() => onEditMapping(mapping)}
                        >
                          <Edit2 size={18} color="var(--text-tertiary)" />
                        </button>
                        <span className="roles-icon-tooltip">Edit mapping</span>
                      </span>
                      <span className="roles-icon-btn-wrapper">
                        <button
                          className="roles-icon-btn roles-icon-btn--danger"
                          aria-label={`Remove mapping for ${mapping.hrisJobTitle}`}
                          onClick={() => onRemoveMapping(mapping)}
                        >
                          <Trash size={18} color="currentColor" />
                        </button>
                        <span className="roles-icon-tooltip">Remove mapping</span>
                      </span>
                    </>
                  ) : (
                    <button
                      className="roles-btn-outlined"
                      onClick={() => onEditMapping(mapping)}
                    >
                      Map Role
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filtered.length > perPage && (
        <div className="roles-pagination">
          <span className="roles-pagination-text">
            {pageStart}–{pageEnd} of {filtered.length}
          </span>
          <button
            className="roles-pagination-btn"
            aria-label="Previous page"
            disabled={safePage === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ArrowLeft2 size={16} color="currentColor" />
          </button>
          <button
            className="roles-pagination-btn"
            aria-label="Next page"
            disabled={safePage === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ArrowRight2 size={16} color="currentColor" />
          </button>
        </div>
      )}
    </>
  )
}

export default HrisMappingTab
