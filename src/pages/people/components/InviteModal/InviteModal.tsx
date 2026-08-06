import { useState } from 'react'
import Button from '@/components/Button/Button'
import { Add, ArrowDown2, Calendar } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import './InviteModal.css'

interface UserField {
  id: number
  name: string
  options: string[]
  required: boolean
}

interface InviteRow {
  email: string
  team: string
  role: string
  startDate: string
  region: string
  teamRights: string
  customFields: Record<number, string>
}

interface InviteModalProps {
  onClose: () => void
  onInvite: (count: number) => void
  userFields: UserField[]
}

const emptyRow = (userFields: UserField[]): InviteRow => ({
  email: '',
  team: '',
  role: '',
  startDate: '',
  region: '',
  teamRights: '',
  customFields: Object.fromEntries(userFields.map(f => [f.id, ''])),
})

const teamOptions = ['Customer Support Team', 'Financial Services', 'Product Engineering', 'Growth Team', 'Business Intelligence']
const regionOptions = ['Southeast Asia', 'Europe', 'North America', 'Latin America', 'East Asia']
const rightsOptions = ['Manager', 'Contributor', 'Viewer']

const automations = [
  { name: 'Auto-enrol Compliance 101', badges: ['Join date', 'Role'] },
  { name: 'New Hire Onboarding Program', badges: ['Join date', 'Region'] },
  { name: 'Q1 Safety Training', badges: ['Region'] },
]

function InviteModal({ onClose, onInvite, userFields }: InviteModalProps) {
  const [rows, setRows] = useState<InviteRow[]>([emptyRow(userFields)])
  const [showMoreAutomations, setShowMoreAutomations] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const updateRow = (index: number, patch: Partial<InviteRow>) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  const updateCustomField = (rowIndex: number, fieldId: number, value: string) => {
    setRows(prev => prev.map((r, i) =>
      i === rowIndex ? { ...r, customFields: { ...r.customFields, [fieldId]: value } } : r
    ))
  }

  const addRow = () => {
    setRows(prev => [...prev, emptyRow(userFields)])
  }

  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  const canInvite = rows.some(r => r.email.trim().length > 0)

  const handleDropdownToggle = (key: string) => {
    setOpenDropdown(prev => (prev === key ? null : key))
  }

  const handleDropdownSelect = (_key: string, rowIndex: number, field: string, value: string) => {
    updateRow(rowIndex, { [field]: value })
    setOpenDropdown(null)
  }

  const handleCustomDropdownSelect = (_key: string, rowIndex: number, fieldId: number, value: string) => {
    updateCustomField(rowIndex, fieldId, value)
    setOpenDropdown(null)
  }

  return (
    <div className="invite-modal">
      {/* Header */}
      <div className="invite-modal-header">
        <h2 className="invite-modal-title">Invite people to 5Mins</h2>
        <CloseButton onClick={onClose} />
      </div>

      {/* Alert banner */}
      <div className="invite-modal-content">
        <div className="invite-modal-alert">
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
          <div className="invite-modal-alert-info">
            <p className="invite-modal-alert-text">
              Join date, role, and region are required by your automations. All invited users will be evaluated against these automations.
            </p>
            {automations.map((a, i) => (
              <div className="invite-modal-alert-row" key={i}>
                <span className="invite-modal-alert-bullet">{a.name}</span>
                <div className="invite-modal-alert-badges">
                  {a.badges.map(b => (
                    <span className="invite-modal-alert-badge" key={b}>{b}</span>
                  ))}
                </div>
              </div>
            ))}
            <button
              className="invite-modal-alert-more"
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

        {/* Form rows */}
        <div className="invite-modal-form">
          {rows.map((row, rowIndex) => (
            <div className="invite-modal-card" key={rowIndex}>
              {/* Headline — User label + remove */}
              <div className="invite-modal-card-headline">
                <span className="invite-modal-card-label">User {rowIndex + 1}</span>
                {rows.length > 1 && (
                  <button
                    className="invite-modal-card-remove"
                    onClick={() => removeRow(rowIndex)}
                    aria-label="Remove row"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="invite-modal-card-remove-tooltip">Remove</span>
                  </button>
                )}
              </div>

              {/* Fields grid */}
              <div className="invite-modal-grid">
                {/* Email */}
                <div className="invite-modal-field">
                  <label className="invite-modal-label">Email address</label>
                  <input
                    className="invite-modal-input"
                    type="email"
                    placeholder="Add a company email"
                    value={row.email}
                    onChange={e => updateRow(rowIndex, { email: e.target.value })}
                  />
                </div>

                {/* Team name */}
                <div className="invite-modal-field">
                  <label className="invite-modal-label">Team name</label>
                  <div className="invite-modal-dropdown-wrapper">
                    <button
                      className="invite-modal-dropdown"
                      onClick={() => handleDropdownToggle(`team-${rowIndex}`)}
                    >
                      <span className={row.team ? 'invite-modal-dropdown-value' : 'invite-modal-dropdown-placeholder'}>
                        {row.team || 'Select team'}
                      </span>
                      <ArrowDown2 size={20} color="var(--text-secondary)" />
                    </button>
                    {openDropdown === `team-${rowIndex}` && (
                      <div className="invite-modal-listbox">
                        {teamOptions.map(opt => (
                          <button
                            key={opt}
                            className={`invite-modal-listbox-item${row.team === opt ? ' invite-modal-listbox-item--selected' : ''}`}
                            onClick={() => handleDropdownSelect(`team-${rowIndex}`, rowIndex, 'team', opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div className="invite-modal-field">
                  <label className="invite-modal-label">Role <span className="invite-modal-required">*</span></label>
                  <input
                    className="invite-modal-input"
                    type="text"
                    placeholder="Search roles"
                    value={row.role}
                    onChange={e => updateRow(rowIndex, { role: e.target.value })}
                  />
                </div>

                {/* Start date */}
                <div className="invite-modal-field">
                  <label className="invite-modal-label">Start date <span className="invite-modal-required">*</span></label>
                  <div className="invite-modal-date-wrapper">
                    <input
                      className="invite-modal-input invite-modal-input--date"
                      type="date"
                      value={row.startDate}
                      onChange={e => updateRow(rowIndex, { startDate: e.target.value })}
                    />
                    <Calendar size={20} color="var(--text-secondary)" className="invite-modal-date-icon" />
                  </div>
                </div>

                {/* Region */}
                <div className="invite-modal-field">
                  <label className="invite-modal-label">Region <span className="invite-modal-required">*</span></label>
                  <div className="invite-modal-dropdown-wrapper">
                    <button
                      className="invite-modal-dropdown"
                      onClick={() => handleDropdownToggle(`region-${rowIndex}`)}
                    >
                      <span className={row.region ? 'invite-modal-dropdown-value' : 'invite-modal-dropdown-placeholder'}>
                        {row.region || 'Add a region'}
                      </span>
                      <ArrowDown2 size={20} color="var(--text-secondary)" />
                    </button>
                    {openDropdown === `region-${rowIndex}` && (
                      <div className="invite-modal-listbox">
                        {regionOptions.map(opt => (
                          <button
                            key={opt}
                            className={`invite-modal-listbox-item${row.region === opt ? ' invite-modal-listbox-item--selected' : ''}`}
                            onClick={() => handleDropdownSelect(`region-${rowIndex}`, rowIndex, 'region', opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Team rights */}
                <div className="invite-modal-field">
                  <label className="invite-modal-label">Team rights</label>
                  <div className="invite-modal-dropdown-wrapper">
                    <button
                      className="invite-modal-dropdown"
                      onClick={() => handleDropdownToggle(`rights-${rowIndex}`)}
                    >
                      <span className={row.teamRights ? 'invite-modal-dropdown-value' : 'invite-modal-dropdown-placeholder'}>
                        {row.teamRights || 'Manager'}
                      </span>
                      <ArrowDown2 size={20} color="var(--text-secondary)" />
                    </button>
                    {openDropdown === `rights-${rowIndex}` && (
                      <div className="invite-modal-listbox">
                        {rightsOptions.map(opt => (
                          <button
                            key={opt}
                            className={`invite-modal-listbox-item${row.teamRights === opt ? ' invite-modal-listbox-item--selected' : ''}`}
                            onClick={() => handleDropdownSelect(`rights-${rowIndex}`, rowIndex, 'teamRights', opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom user fields */}
                {userFields.map(field => (
                  <div className="invite-modal-field" key={field.id}>
                    <label className="invite-modal-label">
                      {field.name}
                      {field.required && <span className="invite-modal-required"> *</span>}
                    </label>
                    <div className="invite-modal-dropdown-wrapper">
                      <button
                        className="invite-modal-dropdown"
                        onClick={() => handleDropdownToggle(`custom-${field.id}-${rowIndex}`)}
                      >
                        <span className={row.customFields[field.id] ? 'invite-modal-dropdown-value' : 'invite-modal-dropdown-placeholder'}>
                          {row.customFields[field.id] || `Select ${field.name.toLowerCase()}`}
                        </span>
                        <ArrowDown2 size={20} color="var(--text-secondary)" />
                      </button>
                      {openDropdown === `custom-${field.id}-${rowIndex}` && (
                        <div className="invite-modal-listbox">
                          {field.options.map(opt => (
                            <button
                              key={opt}
                              className={`invite-modal-listbox-item${row.customFields[field.id] === opt ? ' invite-modal-listbox-item--selected' : ''}`}
                              onClick={() => handleCustomDropdownSelect(`custom-${field.id}-${rowIndex}`, rowIndex, field.id, opt)}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add another user + required hint */}
          <div className="invite-modal-form-footer">
            <button className="invite-modal-add-user" onClick={addRow}>
              <Add size={20} color="currentColor" />
              Invite Another User
            </button>
            <span className="invite-modal-required-hint">
              <span className="invite-modal-required">*</span> Required fields
            </span>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="invite-modal-footer">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <div className="invite-modal-btn-wrapper">
            <Button
              disabled={!canInvite}
              onClick={() => {
                const filledCount = rows.filter(r => r.email.trim().length > 0).length
                onInvite(filledCount)
              }}
            >
              Invite
            </Button>
            {!canInvite && (
              <span className="invite-modal-btn-tooltip">Fill all the required fields</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteModal
