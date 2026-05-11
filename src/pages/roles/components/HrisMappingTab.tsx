import { useMemo, useState } from 'react'
import { SearchNormal1, Edit2, Trash, ArrowLeft2, ArrowRight2, Refresh2, Danger } from 'iconsax-react'
import Badge from '../../../components/Badge/Badge'
import Alert from '../../../components/Alert/Alert'
import type { CompanyRole, FiveMinsRole } from '../data/mockRoles'
import {
  type HrisRoleMapping,
  type MappingStatus,
  resolveRoleName,
} from '../data/mockHrisMappings'
import './HrisMapping.css'

type FilterTab = 'all' | 'unmapped'

interface NewTitlesNotice {
  count: number
  employeeCount: number
  onDismiss: () => void
}

interface Props {
  mappings: HrisRoleMapping[]
  tenantRoles: CompanyRole[]
  publicRoles: FiveMinsRole[]
  newTitlesNotice: NewTitlesNotice | null
  onEditMapping: (mapping: HrisRoleMapping) => void
  onRemoveMapping: (mapping: HrisRoleMapping) => void
  onSimulateResync: () => void
}

const STATUS_BADGE: Record<MappingStatus, { type: 'success' | 'warning'; label: string }> = {
  mapped: { type: 'success', label: 'Mapped' },
  unmapped: { type: 'warning', label: 'Unmapped' },
}

function HrisMappingTab({
  mappings,
  tenantRoles,
  publicRoles,
  newTitlesNotice,
  onEditMapping,
  onRemoveMapping,
  onSimulateResync,
}: Props) {
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mappings.filter(m => {
      if (filterTab === 'unmapped' && m.status === 'mapped') return false
      if (q && !m.hrisJobTitle.toLowerCase().includes(q)) return false
      return true
    })
  }, [mappings, search, filterTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage)
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1
  const pageEnd = Math.min(safePage * perPage, filtered.length)

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }
  const handleFilterTab = (tab: FilterTab) => { setFilterTab(tab); setPage(1) }

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
            <Refresh2 size={20} color="var(--neutral-25)" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {newTitlesNotice && (
        <div className="hris-banner-wrap">
          <Alert
            type="Callout"
            icon
            message={
              `${newTitlesNotice.count} new job title${newTitlesNotice.count !== 1 ? 's' : ''} discovered — ` +
              `${newTitlesNotice.employeeCount} employee${newTitlesNotice.employeeCount !== 1 ? 's' : ''} need role mapping.`
            }
            button
            buttonLabel="Dismiss"
            onButtonClick={newTitlesNotice.onDismiss}
          />
        </div>
      )}

      <div className="roles-filter-bar">
        <div className="hris-toolbar-left">
          <div className="hris-switcher" role="tablist" aria-label="Mapping filter">
            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'all'}
              className={`hris-switcher__item${filterTab === 'all' ? ' hris-switcher__item--active' : ''}`}
              onClick={() => handleFilterTab('all')}
            >
              All
            </button>
            {counts.unmapped > 0 && (
              <button
                type="button"
                role="tab"
                aria-selected={filterTab === 'unmapped'}
                className={`hris-switcher__item hris-switcher__item--with-icon${filterTab === 'unmapped' ? ' hris-switcher__item--active' : ''}`}
                onClick={() => handleFilterTab('unmapped')}
              >
                <Danger size={20} variant="Linear" color="currentColor" />
                Needs Review ({counts.unmapped})
              </button>
            )}
          </div>

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
        </div>

        <div className="roles-filter-right">
          <button className="roles-btn-text" onClick={onSimulateResync}>
            Simulate Re-sync
            <Refresh2 size={18} color="currentColor" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="roles-empty">
          <div className="roles-empty__illustration">
            <span className="roles-empty__zero">0</span>
          </div>
          <p className="roles-empty__text">
            {filterTab === 'unmapped' ? 'No titles need review!' : 'No results found!'}
          </p>
          <p className="roles-empty__subtext">
            {filterTab === 'unmapped'
              ? 'Every HRIS job title is mapped to a role.'
              : 'Try a different search term.'}
          </p>
          {(search || filterTab !== 'all') && (
            <button
              className="roles-btn-outlined-primary"
              onClick={() => { handleSearch(''); handleFilterTab('all') }}
            >
              Clear filters
            </button>
          )}
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
                  <Badge type={badge.type} label={badge.label} icon />
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
