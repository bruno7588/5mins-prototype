import { useMemo, useState } from 'react'
import { InfoCircle } from 'iconsax-react'
import Search from '../../../components/Search/Search'
import type { CompanyRole, FiveMinsRole } from '../data/mockRoles'
import {
  type HrisRoleMapping,
  type MappedRoleRef,
  resolveRoleName,
} from '../data/mockHrisMappings'

interface Props {
  mapping: HrisRoleMapping
  tenantRoles: CompanyRole[]
  publicRoles: FiveMinsRole[]
  onClose: () => void
  onSave: (next: MappedRoleRef) => void
}

function HrisMappingPanel({ mapping, tenantRoles, publicRoles, onClose, onSave }: Props) {
  const [closing, setClosing] = useState(false)
  const [pending, setPending] = useState<MappedRoleRef | null>(mapping.role)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'tenant' | 'fivemins'>(
    mapping.role?.kind === 'fivemins' ? 'fivemins' : 'tenant',
  )

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose(), 300)
  }

  const currentRoleName = mapping.role
    ? resolveRoleName(mapping.role, tenantRoles, publicRoles)
    : null

  const filteredTenant = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tenantRoles
    return tenantRoles.filter(r => r.name.toLowerCase().includes(q))
  }, [tenantRoles, search])

  const filteredPublic = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return publicRoles
    return publicRoles.filter(r => r.name.toLowerCase().includes(q))
  }, [publicRoles, search])

  const isSelected = (kind: 'tenant' | 'fivemins', id: number) =>
    pending?.kind === kind && pending.id === id

  const dirty =
    pending?.kind !== mapping.role?.kind || pending?.id !== mapping.role?.id

  const handleSave = () => {
    if (!pending) return
    onSave(pending)
  }

  return (
    <div
      className={`roles-panel-overlay${closing ? ' roles-panel-overlay--closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`roles-panel${closing ? ' roles-panel--closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="roles-panel-section-header">
          <div className="roles-panel-section-header__headline">
            <div className="roles-panel-section-header__title-group">
              <h2 className="roles-panel-section-header__title">
                {mapping.status === 'mapped' ? 'Edit Mapping' : 'Map Role'}
              </h2>
              <p className="roles-panel-section-header__description hris-panel-subtitle">
                <span>{mapping.hrisJobTitle}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {mapping.employeeCount} employee{mapping.employeeCount !== 1 ? 's' : ''}
                </span>
                <span aria-hidden="true">·</span>
                {mapping.status === 'mapped' && currentRoleName ? (
                  <>
                    <span>Currently mapped to</span>
                    <span className="roles-ai-role-badge__name">{currentRoleName}</span>
                  </>
                ) : (
                  <span>Not mapped yet</span>
                )}
              </p>
            </div>
            <button className="roles-panel-close" onClick={handleClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25" stroke="#454C5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="roles-panel-section-header__divider" />
        </div>

        <div className="roles-panel-body">
          <div className="hris-panel-tabs" role="tablist" aria-label="Role source">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tenant'}
              className={`hris-panel-tab${activeTab === 'tenant' ? ' hris-panel-tab--active' : ''}`}
              onClick={() => setActiveTab('tenant')}
            >
              <span>Company Roles</span>
              <span className="hris-panel-options__count">{filteredTenant.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'fivemins'}
              className={`hris-panel-tab${activeTab === 'fivemins' ? ' hris-panel-tab--active' : ''}`}
              onClick={() => setActiveTab('fivemins')}
            >
              <span>5Mins Roles</span>
              <span className="hris-panel-options__count">{filteredPublic.length}</span>
            </button>
          </div>

          <div className="hris-panel-search-wrapper">
            <Search
              size="M"
              value={search}
              placeholder="Search roles…"
              onChange={setSearch}
              ariaLabel="Search roles"
            />
          </div>

          <div className="hris-panel-options">
            <p className="roles-panel-label hris-panel-options__label">Select role</p>
            {activeTab === 'tenant' && (
              <div className="hris-panel-options__group">
                {filteredTenant.length === 0 ? (
                  <p className="hris-panel-options__empty">No matching company roles.</p>
                ) : (
                  filteredTenant.map(r => {
                    const selected = isSelected('tenant', r.id)
                    return (
                      <button
                        key={`tenant-${r.id}`}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`hris-panel-option${selected ? ' hris-panel-option--selected' : ''}`}
                        onClick={() => setPending({ kind: 'tenant', id: r.id })}
                      >
                        <span className={`hris-panel-option__radio${selected ? ' hris-panel-option__radio--selected' : ''}`} aria-hidden="true" />
                        <span className="hris-panel-option__name">{r.name}</span>
                        {r.leadership && <span className="roles-leader-badge">Leadership</span>}
                      </button>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'fivemins' && (
              <div className="hris-panel-options__group">
                {filteredPublic.length === 0 ? (
                  <p className="hris-panel-options__empty">No matching 5Mins roles.</p>
                ) : (
                  filteredPublic.slice(0, 50).map(r => {
                    const selected = isSelected('fivemins', r.id)
                    return (
                      <button
                        key={`fivemins-${r.id}`}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`hris-panel-option${selected ? ' hris-panel-option--selected' : ''}`}
                        onClick={() => setPending({ kind: 'fivemins', id: r.id })}
                      >
                        <span className={`hris-panel-option__radio${selected ? ' hris-panel-option__radio--selected' : ''}`} aria-hidden="true" />
                        <span className="hris-panel-option__name">{r.name}</span>
                      </button>
                    )
                  })
                )}
                {!search && filteredPublic.length > 50 && (
                  <p className="hris-panel-options__hint">
                    <InfoCircle size={14} color="var(--text-tertiary)" variant="Linear" />
                    Showing first 50 of {filteredPublic.length} — refine your search to see more.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="roles-panel-footer">
          <div className="roles-panel-footer-divider" />
          <div className="roles-panel-footer-row">
            <div className="roles-panel-footer-left">
              <button
                className="roles-btn-primary"
                disabled={!pending || !dirty}
                onClick={handleSave}
              >
                {mapping.status === 'mapped' ? 'Save Mapping' : 'Map Role'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HrisMappingPanel
