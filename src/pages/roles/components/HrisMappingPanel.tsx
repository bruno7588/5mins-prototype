import { useMemo, useState } from 'react'
import { SearchNormal1, House2, Global, TickCircle, InfoCircle } from 'iconsax-react'
import Badge from '../../../components/Badge/Badge'
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
              <h2 className="roles-panel-section-header__title">Map HRIS title to role</h2>
              <p className="roles-panel-section-header__description">
                Choose the 5Mins role to assign whenever this HRIS job title syncs.
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
          <div className="hris-panel-summary">
            <div className="hris-panel-summary__row">
              <span className="hris-panel-summary__label">HRIS job title</span>
              <span className="hris-panel-summary__value">{mapping.hrisJobTitle}</span>
            </div>
            <div className="hris-panel-summary__row">
              <span className="hris-panel-summary__label">Employees affected</span>
              <span className="hris-panel-summary__value">{mapping.employeeCount}</span>
            </div>
            <div className="hris-panel-summary__row">
              <span className="hris-panel-summary__label">Current status</span>
              <span className="hris-panel-summary__value">
                {mapping.status === 'mapped' && (
                  <Badge type="success" label={`Mapped → ${currentRoleName ?? 'Unknown'}`} icon />
                )}
                {mapping.status === 'unmapped' && (
                  <Badge type="warning" label="Unmapped" icon />
                )}
              </span>
            </div>
          </div>

          <div className="hris-panel-search-wrapper">
            <p className="roles-panel-label">Search and select a role</p>
            <div className="hris-panel-search">
              <SearchNormal1 size={18} variant="Outline" color="var(--text-tertiary)" />
              <input
                className="hris-panel-search__input"
                placeholder="Search roles…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <button className="roles-search__clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="hris-panel-options">
            <div className="hris-panel-options__group">
              <div className="hris-panel-options__group-header">
                <House2 size={16} color="var(--text-secondary)" variant="Linear" />
                <span>Company roles</span>
                <span className="hris-panel-options__count">{filteredTenant.length}</span>
              </div>
              {filteredTenant.length === 0 ? (
                <p className="hris-panel-options__empty">No matching company roles.</p>
              ) : (
                filteredTenant.map(r => (
                  <button
                    key={`tenant-${r.id}`}
                    className={`hris-panel-option${isSelected('tenant', r.id) ? ' hris-panel-option--selected' : ''}`}
                    onClick={() => setPending({ kind: 'tenant', id: r.id })}
                  >
                    <span className="hris-panel-option__name">{r.name}</span>
                    {r.leadership && <span className="roles-leader-badge">Leadership</span>}
                    {isSelected('tenant', r.id) && (
                      <TickCircle size={18} color="var(--success-500)" variant="Bold" className="hris-panel-option__check" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="hris-panel-options__group">
              <div className="hris-panel-options__group-header">
                <Global size={16} color="var(--text-secondary)" variant="Linear" />
                <span>5Mins library</span>
                <span className="hris-panel-options__count">{filteredPublic.length}</span>
              </div>
              {filteredPublic.length === 0 ? (
                <p className="hris-panel-options__empty">No matching 5Mins roles.</p>
              ) : (
                filteredPublic.slice(0, 50).map(r => (
                  <button
                    key={`fivemins-${r.id}`}
                    className={`hris-panel-option${isSelected('fivemins', r.id) ? ' hris-panel-option--selected' : ''}`}
                    onClick={() => setPending({ kind: 'fivemins', id: r.id })}
                  >
                    <span className="hris-panel-option__name">{r.name}</span>
                    <span className="hris-panel-option__category">{r.category}</span>
                    {isSelected('fivemins', r.id) && (
                      <TickCircle size={18} color="var(--success-500)" variant="Bold" className="hris-panel-option__check" />
                    )}
                  </button>
                ))
              )}
              {!search && filteredPublic.length > 50 && (
                <p className="hris-panel-options__hint">
                  <InfoCircle size={14} color="var(--text-tertiary)" variant="Linear" />
                  Showing first 50 of {filteredPublic.length} — refine your search to see more.
                </p>
              )}
            </div>
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
                Map Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HrisMappingPanel
