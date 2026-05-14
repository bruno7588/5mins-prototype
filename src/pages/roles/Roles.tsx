import { useMemo, useState } from 'react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import Alert from '../../components/Alert/Alert'
import { Danger, InfoCircle } from 'iconsax-react'
import FiveMinsRolesTab from './components/FiveMinsRolesTab'
import CompanyRolesTab from './components/CompanyRolesTab'
import RolePanel, { type PanelMode } from './components/RolePanel'
import HrisMappingTab, { type FilterTab as HrisFilterTab } from './components/HrisMappingTab'
import HrisMappingPanel from './components/HrisMappingPanel'
import type { FiveMinsRole, CompanyRole, Skill } from './data/mockRoles'
import { fiveMinsRoles, initialCompanyRoles } from './data/mockRoles'
import {
  type HrisRoleMapping,
  type MappedRoleRef,
  buildInitialMappings,
  reconcileStatuses,
  mockHrisJobTitles,
  resolveRoleName,
  resyncTitles,
} from './data/mockHrisMappings'
import '../people/People.css'
import './Roles.css'

/* ─── Mock learner names for prototype ──────────────────── */
const mockLearnerNames = [
  'Emma Johnson', 'Liam Smith', 'Olivia Brown', 'Noah Williams', 'Ava Jones',
  'Elijah Davis', 'Sophia Garcia', 'James Miller', 'Isabella Wilson', 'Benjamin Moore',
  'Mia Taylor', 'Lucas Anderson', 'Charlotte Thomas', 'Henry Jackson', 'Amelia White',
  'Alexander Harris', 'Harper Martin', 'Daniel Thompson', 'Evelyn Robinson', 'Matthew Clark',
]

function getMockLearnersForRole(roleName: string, count: number) {
  // Deterministic shuffle based on role name
  let seed = 0
  for (let i = 0; i < roleName.length; i++) seed += roleName.charCodeAt(i)
  const shuffled = [...mockLearnerNames].sort(() => Math.sin(seed++) - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((name) => ({
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
  }))
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

function downloadLearnersCsv(roleName: string, learners: { name: string; email: string }[]) {
  const csv = ['Name,Email', ...learners.map(l => `${l.name},${l.email}`)].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${roleName.replace(/\s+/g, '_')}_learners.csv`
  a.click()
  URL.revokeObjectURL(url)
}

type Tab = 'library' | 'company' | 'hris-mapping'

const REMOVE_CONFIRM_THRESHOLD = 5

function Roles() {
  const [activeTab, setActiveTab] = useState<Tab>('library')
  const [companyRoles, setCompanyRoles] = useState<CompanyRole[]>(initialCompanyRoles)
  const [panelMode, setPanelMode] = useState<PanelMode | null>(null)
  const { toasts, show: showToast } = useToast()
  const [deleteRole, setDeleteRole] = useState<CompanyRole | null>(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')

  const initialMappings = useMemo(
    () => buildInitialMappings(initialCompanyRoles, fiveMinsRoles),
    [],
  )
  const [hrisMappings, setHrisMappings] = useState<HrisRoleMapping[]>(initialMappings)
  const [hrisPanelMapping, setHrisPanelMapping] = useState<HrisRoleMapping | null>(null)
  const [hrisRemoveTarget, setHrisRemoveTarget] = useState<HrisRoleMapping | null>(null)
  const [hrisFilterTab, setHrisFilterTab] = useState<HrisFilterTab>('all')

  const nextId = () => Math.max(0, ...companyRoles.map(r => r.id)) + 1

  const handleDeleteConfirm = () => {
    if (deleteRole) {
      const nextCompanyRoles = companyRoles.filter(r => r.id !== deleteRole.id)
      setCompanyRoles(nextCompanyRoles)
      setHrisMappings(prev => reconcileStatuses(prev, nextCompanyRoles, fiveMinsRoles))
      showToast('success', `"${deleteRole.name}" deleted`)
      setDeleteRole(null)
      setDeleteConfirmInput('')
      setPanelMode(null)
    }
  }

  /* ─── HRIS Mapping handlers ───────────────────────────── */

  const handleHrisSave = (next: MappedRoleRef) => {
    if (!hrisPanelMapping) return
    setHrisMappings(prev =>
      reconcileStatuses(
        prev.map(m =>
          m.hrisJobTitle === hrisPanelMapping.hrisJobTitle
            ? { ...m, role: next, status: 'mapped' }
            : m,
        ),
        companyRoles,
        fiveMinsRoles,
      ),
    )
    const roleName = resolveRoleName(next, companyRoles, fiveMinsRoles) ?? 'role'
    showToast('success', `"${hrisPanelMapping.hrisJobTitle}" mapped to ${roleName}`)
    setHrisPanelMapping(null)
  }

  const handleHrisRemoveRequest = (mapping: HrisRoleMapping) => {
    if (mapping.employeeCount >= REMOVE_CONFIRM_THRESHOLD) {
      setHrisRemoveTarget(mapping)
    } else {
      removeMappingNow(mapping)
    }
  }

  const removeMappingNow = (mapping: HrisRoleMapping) => {
    setHrisMappings(prev =>
      prev.map(m =>
        m.hrisJobTitle === mapping.hrisJobTitle
          ? { ...m, role: null, status: 'unmapped' }
          : m,
      ),
    )
    showToast('success', `Mapping for "${mapping.hrisJobTitle}" removed`)
    setHrisRemoveTarget(null)
    setHrisPanelMapping(null)
  }

  const unmappedCount = useMemo(
    () => hrisMappings.filter(m => m.status !== 'mapped').length,
    [hrisMappings],
  )

  const unmappedEmployeeCount = useMemo(
    () => hrisMappings
      .filter(m => m.status !== 'mapped')
      .reduce((sum, m) => sum + m.employeeCount, 0),
    [hrisMappings],
  )

  const handleGoToHrisMapping = () => {
    setHrisFilterTab('unmapped')
    setActiveTab('hris-mapping')
  }

  const handleHrisSimulateResync = () => {
    const incoming = [
      ...mockHrisJobTitles,
      { title: 'Talent Acquisition Partner', employeeCount: 4 },
      { title: 'Junior Customer Success Manager', employeeCount: 3 },
    ]
    const result = resyncTitles(hrisMappings, incoming, companyRoles, fiveMinsRoles)
    setHrisMappings(result.mappings)

    const parts: string[] = []
    if (result.newTitles.length > 0) {
      parts.push(`${result.newTitles.length} new title${result.newTitles.length !== 1 ? 's' : ''}`)
    }
    if (result.removedTitles.length > 0) {
      parts.push(`${result.removedTitles.length} removed`)
    }
    showToast(
      'success',
      parts.length > 0 ? `Re-sync complete — ${parts.join(', ')}` : 'Re-sync complete — no changes',
    )
  }

  /* ─── Copy from library (quick copy via table button) ── */
  const handleCopyRole = (role: FiveMinsRole) => {
    setPanelMode({ type: 'copy', source: role })
  }

  /* ─── Panel save handler ───────────────────────────────── */
  const handlePanelSave = (name: string, skills: Skill[], leadership: boolean) => {
    if (!panelMode) return

    if (panelMode.type === 'edit') {
      // Update existing role
      setCompanyRoles(prev =>
        prev.map(r =>
          r.id === panelMode.role.id
            ? { ...r, name, skills, leadership }
            : r
        )
      )
      showToast('success', `"${name}" updated`)
    } else {
      // Create new role (create, copy, or duplicate)
      const newRole: CompanyRole = {
        id: nextId(),
        name,
        leadership,
        skills: [...skills],
        employeeCount: 0,
      }
      setCompanyRoles(prev => [newRole, ...prev])

      if (panelMode.type === 'copy') {
        showToast('success', `"${name}" copied to your company roles`)
      } else if (panelMode.type === 'create-prefilled') {
        showToast('success', `"${name}" duplicated`)
      } else {
        showToast('success', `"${name}" created`)
      }
      setActiveTab('company')
    }

    setPanelMode(null)
  }

  return (
    <div className="roles-layout">
      <LeftSidebar />

      <main className="roles-main">
        <header className="roles-header">
          <div className="roles-header__title-group">
            <h1 className="roles-header__title">Roles</h1>
            <p className="roles-header__description">Browse pre-built roles from the 5Mins library and copy them to your company, or create and manage your own custom roles with tailored skill mappings.</p>
          </div>
          <div className="roles-header__divider" />
          {unmappedCount > 0 && (
            <Alert
              type="Alert"
              customIcon={<BellIllustration />}
              title={`${unmappedCount} HRIS job title${unmappedCount !== 1 ? 's' : ''} couldn't be auto-matched`}
              message={`${unmappedEmployeeCount} employee${unmappedEmployeeCount !== 1 ? 's' : ''} will pick their role during onboarding unless mapped`}
              button
              buttonLabel="Map Roles"
              onButtonClick={handleGoToHrisMapping}
              className="hris-dry-run-alert"
            />
          )}
          <div className="roles-header__tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'library'}
              className={`roles-header__tab${activeTab === 'library' ? ' roles-header__tab--active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              5Mins Roles
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'company'}
              className={`roles-header__tab${activeTab === 'company' ? ' roles-header__tab--active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              Company Roles
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'hris-mapping'}
              className={`roles-header__tab${activeTab === 'hris-mapping' ? ' roles-header__tab--active' : ''}`}
              onClick={() => setActiveTab('hris-mapping')}
            >
              HRIS Mapping
            </button>
          </div>
        </header>

        <div className="roles-content">
          {activeTab === 'library' && (
            <FiveMinsRolesTab onCopy={handleCopyRole} onCreateRole={() => setPanelMode({ type: 'create' })} />
          )}
          {activeTab === 'company' && (
            <CompanyRolesTab
              roles={companyRoles}
              onCreateRole={() => setPanelMode({ type: 'create' })}
              onEditRole={(role) => setPanelMode({ type: 'edit', role })}
              onDuplicateRole={(role) =>
                setPanelMode({
                  type: 'create-prefilled',
                  name: `Copy of ${role.name}`,
                  skills: [...role.skills],
                  leadership: role.leadership,
                })
              }
              onDeleteRole={(role) => setDeleteRole(role)}
              onBrowseLibrary={() => setActiveTab('library')}
            />
          )}
          {activeTab === 'hris-mapping' && (
            <HrisMappingTab
              mappings={hrisMappings}
              tenantRoles={companyRoles}
              publicRoles={fiveMinsRoles}
              onEditMapping={setHrisPanelMapping}
              onRemoveMapping={handleHrisRemoveRequest}
              onSimulateResync={handleHrisSimulateResync}
              filterTab={hrisFilterTab}
              onFilterTabChange={setHrisFilterTab}
            />
          )}
        </div>
      </main>

      {panelMode && (
        <RolePanel
          mode={panelMode}
          existingRoleNames={companyRoles.map(r => r.name)}
          onClose={() => setPanelMode(null)}
          onSave={handlePanelSave}
        />
      )}

      {hrisPanelMapping && (
        <HrisMappingPanel
          mapping={hrisPanelMapping}
          tenantRoles={companyRoles}
          publicRoles={fiveMinsRoles}
          onClose={() => setHrisPanelMapping(null)}
          onSave={handleHrisSave}
        />
      )}

      {/* HRIS mapping removal confirmation (high-impact only) */}
      <ConfirmModal
        open={!!hrisRemoveTarget}
        onClose={() => setHrisRemoveTarget(null)}
      >
        {hrisRemoveTarget && (
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <InfoCircle size={72} color="var(--text-warning)" variant="Linear" />
              <h3 className="confirm-modal-title">Remove HRIS mapping?</h3>
              <p className="confirm-modal-body">
                "{hrisRemoveTarget.hrisJobTitle}" affects {hrisRemoveTarget.employeeCount} employee
                {hrisRemoveTarget.employeeCount !== 1 ? 's' : ''}. Existing users will keep their current
                role. Future syncs for this title will not assign a role.
              </p>
            </div>
            <div className="confirm-modal-actions confirm-modal-actions--center">
              <button
                className="confirm-modal-btn confirm-modal-btn--outlined-neutral"
                onClick={() => setHrisRemoveTarget(null)}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn confirm-modal-btn--danger"
                onClick={() => removeMappingNow(hrisRemoveTarget)}
              >
                Remove Mapping
              </button>
            </div>
          </>
        )}
      </ConfirmModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        open={!!deleteRole}
        onClose={() => { setDeleteRole(null); setDeleteConfirmInput('') }}
      >
        {deleteRole && deleteRole.employeeCount > 0 ? (
          /* ─── Blocked: role has assigned learners ─── */
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <InfoCircle size={72} color="var(--text-warning)" variant="Linear" />
              <h3 className="confirm-modal-title">Unable to delete role</h3>
              <p className="confirm-modal-body">
                You cannot delete "{deleteRole.name}" because {deleteRole.employeeCount} learner{deleteRole.employeeCount !== 1 ? 's are' : ' is'} currently assigned to this role. Please reassign them to a different role first.
              </p>
            </div>
            <div className="confirm-modal-actions confirm-modal-actions--center">
              <button
                className="confirm-modal-btn confirm-modal-btn--outlined-neutral"
                onClick={() => { setDeleteRole(null); setDeleteConfirmInput('') }}
              >
                Close
              </button>
              <button
                className="confirm-modal-btn confirm-modal-btn--primary"
                onClick={() => downloadLearnersCsv(deleteRole.name, getMockLearnersForRole(deleteRole.name, deleteRole.employeeCount))}
              >
                Download List
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_dl)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M17.5 5.625V17.5C17.5 18.163 17.2366 18.7989 16.7678 19.2678C16.2989 19.7366 15.663 20 15 20H13.75V18.75H15C15.3315 18.75 15.6495 18.6183 15.8839 18.3839C16.1183 18.1495 16.25 17.8315 16.25 17.5V5.625H13.75C13.2527 5.625 12.7758 5.42746 12.4242 5.07583C12.0725 4.72419 11.875 4.24728 11.875 3.75V1.25H5C4.66848 1.25 4.35054 1.3817 4.11612 1.61612C3.8817 1.85054 3.75 2.16848 3.75 2.5V13.75H2.5V2.5C2.5 1.83696 2.76339 1.20107 3.23223 0.732233C3.70107 0.263392 4.33696 0 5 0L11.875 0L17.5 5.625ZM4.39625 18.5513C4.40341 18.7482 4.4517 18.9415 4.53803 19.1187C4.62435 19.2958 4.7468 19.453 4.8975 19.58C5.06 19.715 5.25917 19.82 5.495 19.895C5.73167 19.9708 6.00875 20.0088 6.32625 20.0088C6.74875 20.0088 7.10667 19.9429 7.4 19.8113C7.695 19.6796 7.91958 19.4963 8.07375 19.2612C8.22958 19.0246 8.3075 18.7513 8.3075 18.4412C8.3075 18.1613 8.25167 17.9279 8.14 17.7412C8.02564 17.5539 7.86397 17.4 7.67125 17.295C7.45006 17.1722 7.21151 17.0837 6.96375 17.0325L6.1875 16.8525C6.0049 16.8176 5.83238 16.7425 5.6825 16.6325C5.62547 16.5885 5.5795 16.5318 5.54825 16.4669C5.517 16.4021 5.50133 16.3308 5.5025 16.2588C5.5025 16.0637 5.57958 15.9038 5.73375 15.7788C5.89042 15.6521 6.10375 15.5887 6.37375 15.5887C6.55208 15.5887 6.70625 15.6171 6.83625 15.6737C6.95655 15.7214 7.06248 15.7993 7.14375 15.9C7.22068 15.9928 7.27235 16.1039 7.29375 16.2225H8.23125C8.21512 15.968 8.12857 15.7231 7.98125 15.515C7.82373 15.2902 7.60755 15.1129 7.35625 15.0025C7.04946 14.8673 6.71635 14.8024 6.38125 14.8125C6.01542 14.8125 5.69208 14.875 5.41125 15C5.13042 15.1242 4.91083 15.2996 4.7525 15.5262C4.59417 15.7537 4.515 16.02 4.515 16.325C4.515 16.5767 4.56583 16.795 4.6675 16.98C4.77083 17.1658 4.9175 17.3188 5.1075 17.4388C5.2975 17.5579 5.52208 17.6467 5.78125 17.705L6.55375 17.885C6.81208 17.9458 7.005 18.0263 7.1325 18.1263C7.19455 18.1739 7.24421 18.2359 7.27728 18.3068C7.31036 18.3777 7.32586 18.4556 7.3225 18.5337C7.32532 18.6626 7.28821 18.7893 7.21625 18.8962C7.13571 19.0059 7.02494 19.0898 6.8975 19.1375C6.75833 19.1958 6.58625 19.225 6.38125 19.225C6.23542 19.225 6.10208 19.2083 5.98125 19.175C5.87043 19.1452 5.76557 19.0966 5.67125 19.0312C5.58813 18.9773 5.51697 18.9068 5.46214 18.8243C5.40732 18.7417 5.37 18.6488 5.3525 18.5513H4.39625ZM1.0075 17.1162C1.0075 16.8054 1.05 16.5417 1.135 16.325C1.20927 16.1254 1.34054 15.9519 1.5125 15.8263C1.68737 15.7079 1.89522 15.648 2.10625 15.655C2.29375 15.655 2.45958 15.6954 2.60375 15.7763C2.74462 15.8515 2.8622 15.9639 2.94375 16.1012C3.03087 16.2458 3.08229 16.4091 3.09375 16.5775H4.05V16.4875C4.04171 16.2572 3.98564 16.0312 3.88537 15.8238C3.78509 15.6164 3.64279 15.432 3.4675 15.2825C3.28871 15.1292 3.0808 15.0135 2.85625 14.9425C2.61255 14.859 2.35633 14.818 2.09875 14.8213C1.65375 14.8212 1.27417 14.9142 0.96 15.1C0.6475 15.285 0.409167 15.5483 0.245 15.89C0.0825 16.2317 0.000833333 16.6396 0 17.1138V17.7362C0 18.2096 0.0804167 18.6162 0.24125 18.9562C0.405417 19.2954 0.64375 19.5562 0.95625 19.7388C1.26875 19.9196 1.64958 20.01 2.09875 20.01C2.46458 20.01 2.79167 19.9417 3.08 19.805C3.36833 19.6683 3.5975 19.4792 3.7675 19.2375C3.93995 18.9893 4.03795 18.697 4.05 18.395V18.3H3.095C3.08316 18.4609 3.03256 18.6166 2.9475 18.7537C2.8642 18.8865 2.74677 18.9944 2.6075 19.0662C2.45102 19.1406 2.27948 19.1778 2.10625 19.175C1.89511 19.1806 1.68709 19.1232 1.50875 19.01C1.33741 18.8883 1.20708 18.7174 1.135 18.52C1.04363 18.2691 1.00038 18.0032 1.0075 17.7362V17.1162ZM11.3062 19.9137H10.115L8.4425 14.915H9.58875L10.7088 18.8375H10.7562L11.8663 14.915H12.965L11.3062 19.9137Z" fill="currentColor"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_dl">
                      <rect width="20" height="20" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </>
        ) : deleteRole ? (
          /* ─── Allowed: no learners assigned ─── */
          <>
            <div className="confirm-modal-header confirm-modal-header--center">
              <Danger size={72} color="var(--danger-500)" variant="Linear" />
              <h3 className="confirm-modal-title">Delete role</h3>
              <p className="confirm-modal-body">
                Are you sure you want to delete "{deleteRole.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="confirm-modal-input-group">
              <label className="confirm-modal-label">
                Type <span className="confirm-modal-label-danger">'Delete'</span> below, to confirm
              </label>
              <input
                className="confirm-modal-input"
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
              />
            </div>
            <div className="confirm-modal-actions confirm-modal-actions--center">
              <button
                className="confirm-modal-btn confirm-modal-btn--outlined-neutral"
                onClick={() => { setDeleteRole(null); setDeleteConfirmInput('') }}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn confirm-modal-btn--danger"
                disabled={deleteConfirmInput !== 'Delete'}
                onClick={handleDeleteConfirm}
              >
                Delete Role
              </button>
            </div>
          </>
        ) : null}
      </ConfirmModal>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default Roles
