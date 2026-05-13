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

function SortArrow({ dir }: { dir: 'asc' | 'desc' }) {
  return (
    <svg
      className="hris-th__sort"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ transform: dir === 'asc' ? 'rotate(180deg)' : undefined }}
    >
      <path
        d="M6 2.5v7M3 7l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BellIllustration() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M13.1528 3.54388C13.1528 1.59006 14.6915 0 16.5823 0C18.473 0 20.0117 1.59006 20.0117 3.54388C20.0117 5.4977 18.473 7.08776 16.5823 7.08776C14.6915 7.08776 13.1528 5.50045 13.1528 3.54388ZM15.1476 3.54388C15.1476 4.36233 15.7902 5.02647 16.5823 5.02647C17.3743 5.02647 18.017 4.36233 18.017 3.54388C18.017 2.72543 17.3743 2.06129 16.5823 2.06129C15.7902 2.06129 15.1476 2.72818 15.1476 3.54388Z" fill="#E2A610" />
      <path d="M19.5317 1.75C19.5317 1.75 19.6837 2.37555 18.9823 2.71726C18.281 3.05622 17.817 2.80545 17.817 2.80545C17.9423 3.02591 18.017 3.27668 18.017 3.5495C18.017 4.36795 17.3743 5.03209 16.5823 5.03209C15.7902 5.03209 15.1476 4.36795 15.1476 3.5495C15.1476 3.46683 15.1662 3.15543 15.2942 2.89639C14.1049 3.4806 13.2008 2.98182 13.2008 2.98182C13.1715 3.16645 13.1528 3.3566 13.1528 3.5495C13.1528 5.50332 14.6915 7.09338 16.5823 7.09338C18.473 7.09338 20.0117 5.50332 20.0117 3.54674C20.0117 2.89088 19.8357 2.27635 19.5317 1.75Z" fill="#9E740B" />
      <path d="M1.72273 25.3172C3.52812 23.4847 4.65349 22.8674 5.11217 20.2108C5.57085 17.5543 5.20284 11.9574 7.22424 8.29226C9.06963 4.93577 12.4564 3.54688 15.7605 3.54688C15.8405 3.54688 15.9205 3.55239 16.0005 3.55239C16.0805 3.54963 16.1605 3.54688 16.2405 3.54688C19.5446 3.54688 22.9314 4.93577 24.7768 8.2895C26.7955 11.9574 26.4302 17.5543 26.8889 20.2081C27.3475 22.8646 28.4729 23.4819 30.2783 25.3145C31.057 26.1054 31.9983 27.3647 32.001 28.1749C32.0037 28.9851 31.6037 29.28 30.6516 29.6933C27.9582 30.8645 24.3581 31.9999 16.0005 31.9999C7.64292 31.9999 4.04281 30.8645 1.34939 29.6933C0.397359 29.28 -0.00265351 28.9879 1.324e-05 28.1749C0.00267999 27.3675 0.944043 26.1081 1.72273 25.3172Z" fill="#FFCA28" />
      <path d="M29.2543 28.2374C29.2543 27.0167 23.3208 26.0273 16.0006 26.0273C8.68034 26.0273 2.74683 27.0167 2.74683 28.2374C2.74683 29.4582 8.68034 30.916 16.0006 30.916C23.3208 30.916 29.2543 29.4582 29.2543 28.2374Z" fill="#4E342E" />
      <path d="M23.9588 10.7073C24.0575 11.0959 24.1402 11.4845 24.2068 11.8647C24.5455 13.8103 24.4842 15.8055 24.6362 17.7758C24.8415 20.4131 25.2949 21.8019 26.3269 23.042C26.4629 23.2046 26.3242 23.4554 26.1189 23.4223C24.7402 23.2046 23.6335 22.9869 22.3721 22.1271C20.4894 20.8457 20.0254 18.4344 20.012 16.2684C19.9907 13.0442 20.0494 9.92195 19.8014 8.73698C19.4574 7.0863 19.1374 6.20721 18.6147 5.40529C17.8173 4.18175 20.9134 5.87928 21.3988 6.25682C22.7508 7.31227 23.5268 9.0098 23.9588 10.7073Z" fill="#E2A610" />
      <path d="M7.17064 14.9902C7.13863 12.9013 7.15463 10.7408 7.95999 8.82282C8.44268 7.67643 9.26137 6.64303 10.3067 6.00094C11.1281 5.49664 12.7975 4.93998 13.3975 6.08361C13.5175 6.31234 13.5655 6.57965 13.5735 6.84144C13.5948 7.75359 13.1362 8.59685 12.6908 9.38499C11.3734 11.7219 10.8481 14.2764 10.1521 16.8668C9.86672 17.936 9.50404 19.0025 8.88269 19.9064C8.45601 20.5264 6.07994 22.731 6.62395 20.7386C7.14664 18.8124 7.19997 16.9963 7.17064 14.9902Z" fill="#FFF59D" />
      <path d="M18.4244 27.8039C18.4217 27.3299 18.1737 27.0571 17.603 26.8532C16.419 26.4316 14.9363 26.5087 14.0723 26.9882C13.1656 27.4898 13.7949 30.2703 16.0003 30.2703C18.2057 30.2703 18.4271 28.1649 18.4244 27.8039Z" fill="#E2A610" />
      <path d="M7.80054 23.6615C5.45913 24.0858 3.76308 25.0035 3.02972 25.7475C2.44837 26.3345 2.44837 26.7975 3.4724 26.3152C4.24309 25.9515 6.7125 25.2129 8.87524 24.9897C12.59 24.6039 14.8834 24.5956 15.2648 24.6039C16.1581 24.6232 16.2328 23.9122 14.4274 23.6615C12.622 23.4134 10.1419 23.2398 7.80054 23.6615Z" fill="#FFF59D" />
      <path d="M15.0561 29.7281C15.3655 29.9485 15.7761 30.056 16.1228 29.9072C16.4695 29.7584 16.6935 29.3037 16.5228 28.9592C16.4562 28.8242 16.3415 28.7222 16.2268 28.6285C15.9095 28.3722 15.5575 28.1628 15.1841 28.0085C15.0374 27.9479 14.8828 27.8927 14.7228 27.9038C14.5654 27.912 14.4001 27.9975 14.3388 28.149C14.0747 28.7691 14.6028 29.4084 15.0561 29.7281Z" fill="#FFF59D" />
    </svg>
  )
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
    const result = mappings.filter(m => {
      if (filterTab === 'unmapped' && m.status === 'mapped') return false
      if (filterTab === 'mapped' && m.status === 'unmapped') return false
      if (q && !m.hrisJobTitle.toLowerCase().includes(q)) return false
      return true
    })
    if (filterTab === 'mapped') {
      result.sort((a, b) => a.hrisJobTitle.localeCompare(b.hrisJobTitle))
    } else {
      result.sort((a, b) => b.employeeCount - a.employeeCount)
    }
    return result
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
    { label: 'Connect HRIS', status: 'done' as const },
    { label: 'Dry Run', status: 'done' as const },
    { label: 'Review Mappings', status: (allMapped ? 'done' : 'current') as 'done' | 'current' },
    { label: 'Activate Sync', status: (allMapped ? 'current' : 'pending') as 'current' | 'pending' },
  ]

  return (
    <>
      {!syncActivated && (
        <ol className="hris-stepper" aria-label="HRIS activation progress">
          {stepperSteps.map((step, idx) => (
            <li
              key={step.label}
              className={`hris-stepper__step hris-stepper__step--${step.status}`}
              aria-current={step.status === 'current' ? 'step' : undefined}
            >
              <span className="hris-stepper__marker" aria-hidden="true">
                {step.status !== 'pending' && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="hris-stepper__label">{step.label}</span>
              {idx < stepperSteps.length - 1 && <span className="hris-stepper__line" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      )}

      {counts.unmapped > 0 && (
        <div className="hris-banner-wrap">
          <Alert
            type="Alert"
            customIcon={<BellIllustration />}
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
            <div className="people-table-cell hris-col--title">
              <span className="hris-th">
                HRIS Job Title
                {filterTab === 'mapped' && <SortArrow dir="asc" />}
              </span>
            </div>
            <div className="people-table-cell hris-col--count">
              <span className="hris-th">
                Employees
                {filterTab !== 'mapped' && <SortArrow dir="desc" />}
              </span>
            </div>
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
