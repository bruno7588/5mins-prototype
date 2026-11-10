import { useMemo, useState } from 'react'
import Button from '@/components/Button/Button'
import { InfoCircle } from 'iconsax-react'
import Search from '../../../components/Search/Search'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import Tabs from '@/components/Tabs/Tabs'
import type { CompanyRole, FiveMinsRole } from '../data/mockRoles'
import {
  type HrisRoleMapping,
  type MappedRoleRef,
  resolveRoleName,
} from '../data/mockHrisMappings'

interface Props {
  open: boolean
  /** The parent may clear this on close; the panel keeps the last one for the exit slide. */
  mapping: HrisRoleMapping | null
  tenantRoles: CompanyRole[]
  publicRoles: FiveMinsRole[]
  onClose: () => void
  onSave: (next: MappedRoleRef) => void
}

type ContentProps = Omit<Props, 'mapping'> & { mapping: HrisRoleMapping }

/* Keeps the panel mounted while it closes, so the drawer's exit slide plays with
   the same content, and starts fresh (new key) each time it opens. */
function HrisMappingPanel({ open, mapping, ...rest }: Props) {
  const [session, setSession] = useState<{ mapping: HrisRoleMapping; key: number } | null>(null)
  if (open && mapping && mapping !== session?.mapping) {
    setSession({ mapping, key: (session?.key ?? 0) + 1 })
  }
  if (!session) return null
  return <HrisMappingPanelContent key={session.key} open={open} mapping={session.mapping} {...rest} />
}

function HrisMappingPanelContent({ open, mapping, tenantRoles, publicRoles, onClose, onSave }: ContentProps) {
  const [pending, setPending] = useState<MappedRoleRef | null>(mapping.role)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'tenant' | 'fivemins'>(
    mapping.role?.kind === 'fivemins' ? 'fivemins' : 'tenant',
  )

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
    <SideDrawer
      open={open}
      onClose={onClose}
      title={mapping.status === 'mapped' ? 'Edit Mapping' : 'Map Role'}
      subtitle={
        <span className="hris-panel-subtitle">
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
        </span>
      }
      bodyClassName="roles-panel-body"
      footer={
        <Button
          disabled={!pending || !dirty}
          onClick={handleSave}
        >
          {mapping.status === 'mapped' ? 'Save Mapping' : 'Map Role'}
        </Button>
      }
    >
      <Tabs
        ariaLabel="Role source"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'tenant' | 'fivemins')}
        items={[
          { key: 'tenant', label: 'Company Roles', counter: filteredTenant.length },
          { key: 'fivemins', label: '5Mins Roles', counter: filteredPublic.length },
        ]}
      />

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
                <InfoCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                Showing first 50 of {filteredPublic.length} — refine your search to see more.
              </p>
            )}
          </div>
        )}
      </div>
    </SideDrawer>
  )
}

export default HrisMappingPanel
