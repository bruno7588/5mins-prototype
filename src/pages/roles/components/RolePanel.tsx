import { useState, useEffect, useRef } from 'react'
import { SearchNormal1, Danger, ArrowLeft, DocumentUpload, DocumentText } from 'iconsax-react'
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal'
import Checkbox from '../../../components/Checkbox/Checkbox'
import InputField from '../../../components/InputField/InputField'
import Alert from '../../../components/Alert/Alert'
import { skillCatalogue, simulateAISuggestion, type Skill, type CompanyRole, type FiveMinsRole } from '../data/mockRoles'
import { getSkillIllustration } from '../../../assets/skill-icons'
import Button from '@/components/Button/Button'

/* ─── Panel mode types ─────────────────────────────────── */

export type PanelMode =
  | { type: 'create' }
  | { type: 'create-prefilled'; name: string; skills: Skill[]; leadership: boolean }
  | { type: 'copy'; source: FiveMinsRole }
  | { type: 'edit'; role: CompanyRole }

interface Props {
  mode: PanelMode
  existingRoleNames?: string[]
  onClose: () => void
  onSave: (name: string, skills: Skill[], leadership: boolean) => void
  onDelete?: (roleId: number) => void
}

function RolePanel({ mode, existingRoleNames = [], onClose, onSave, onDelete }: Props) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose(), 300)
  }

  const isEdit = mode.type === 'edit'
  const isCopy = mode.type === 'copy'
  const isPrefilled = mode.type === 'create-prefilled'

  // Initial values based on mode
  const initName = () => {
    if (isEdit) return mode.role.name
    if (isCopy) return mode.source.name
    if (isPrefilled) return mode.name
    return ''
  }
  const initSkills = (): Skill[] => {
    if (isEdit) return [...mode.role.skills]
    if (isCopy) return [...mode.source.skills]
    if (isPrefilled) return [...mode.skills]
    return []
  }
  const initLeadership = () => {
    if (isEdit) return mode.role.leadership
    if (isCopy) return mode.source.leadership
    if (isPrefilled) return mode.leadership
    return false
  }

  const [step, setStep] = useState<1 | 2>(isEdit || isPrefilled ? 2 : 1)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDescription(reader.result)
        setUploadedFileName(file.name)
      }
    }
    reader.readAsText(file)
  }
  const [name, setName] = useState(initName)
  const [leadership, setLeadership] = useState(initLeadership)
  const [description, setDescription] = useState('')
  const [jobDescription] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(initSkills)

  // Check for duplicate role name (exclude current role when editing)
  const nameTrimmed = name.trim().toLowerCase()
  const isDuplicateName = nameTrimmed !== '' && existingRoleNames
    .filter(n => !(isEdit && n === (mode as { role: CompanyRole }).role.name))
    .some(n => n.toLowerCase() === nameTrimmed)

  // AI state
  const [aiLoading, setAiLoading] = useState(false)

  // Skill search
  const [skillSearch, setSkillSearch] = useState('')
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<Record<number, 'added' | 'already'>>({})
  const [dropdownDirection, setDropdownDirection] = useState<'above' | 'below'>('below')

  const dropdownRef = useRef<HTMLDivElement>(null)

  const calcDropdownDirection = () => {
    if (!dropdownRef.current) return
    const rect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setDropdownDirection(spaceBelow < 280 ? 'above' : 'below')
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSkillDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Escape key to close panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // AI progress simulation
  const [aiProgress, setAiProgress] = useState(0)
  const [aiStep, setAiStep] = useState<0 | 1 | 2 | 3>(0)

  const handleAISuggest = async () => {
    setAiLoading(true)
    setStep(2)
    setAiProgress(0)
    setAiStep(1)

    // Simulate progress steps
    setTimeout(() => { setAiProgress(35); setAiStep(1) }, 300)
    setTimeout(() => { setAiProgress(65); setAiStep(2) }, 800)
    setTimeout(() => { setAiProgress(85) }, 1200)

    const results = await simulateAISuggestion(name, description, jobDescription, leadership)
    setAiProgress(100)
    setAiStep(3)

    setTimeout(() => {
      if (isPrefilled) {
        // Merge new skills with existing, deduplicating
        setSelectedSkills(prev => {
          const existingIds = new Set(prev.map(sk => sk.id))
          const newSkills = results.filter(sk => !existingIds.has(sk.id))
          return [...prev, ...newSkills]
        })
      } else {
        setSelectedSkills(results)
      }
      setAiLoading(false)
      setAiProgress(0)
      setAiStep(0)
    }, 400)
  }

  // Edit mode: AI suggest with working animation
  const [editAiWorking, setEditAiWorking] = useState(false)

  const handleEditAISuggest = async () => {
    setEditAiWorking(true)
    setAiProgress(0)
    setAiStep(1)

    setTimeout(() => { setAiProgress(35); setAiStep(1) }, 300)
    setTimeout(() => { setAiProgress(65); setAiStep(2) }, 800)
    setTimeout(() => { setAiProgress(85) }, 1200)

    const results = await simulateAISuggestion(name, '', '', leadership)
    setAiProgress(100)
    setAiStep(3)

    setTimeout(() => {
      // Merge new skills with existing, deduplicating
      setSelectedSkills(prev => {
        const existingIds = new Set(prev.map(sk => sk.id))
        const newSkills = results.filter(sk => !existingIds.has(sk.id))
        return [...prev, ...newSkills]
      })
      setEditAiWorking(false)
      setAiProgress(0)
      setAiStep(0)
    }, 400)
  }

  const handleSkipToManual = () => {
    setStep(2)
  }

  const removeSkill = (id: number) => {
    setSelectedSkills(prev => prev.filter(sk => sk.id !== id))
  }

  const addSkill = (skill: Skill) => {
    const alreadySelected = selectedSkills.find(sk => sk.id === skill.id)
    if (!alreadySelected) {
      setSelectedSkills(prev => [...prev, skill])
      setRecentlyAdded(prev => ({ ...prev, [skill.id]: 'added' }))
    } else {
      setRecentlyAdded(prev => ({ ...prev, [skill.id]: 'already' }))
    }
    setTimeout(() => {
      setRecentlyAdded(prev => {
        const next = { ...prev }
        delete next[skill.id]
        return next
      })
    }, 1000)
  }

  const filteredCatalogue = skillCatalogue.filter(sk => {
    if (selectedSkills.find(sel => sel.id === sk.id) && !recentlyAdded[sk.id]) return false
    if (skillSearch && !sk.name.toLowerCase().includes(skillSearch.toLowerCase())) return false
    return true
  })

  const canSave = name.trim().length > 0 && selectedSkills.length > 0 && !isDuplicateName

  /* ─── Render helpers ──────────────────────────────────── */

  const renderSkillChips = () => (
    <div className="roles-skill-cards">
      {selectedSkills.map(sk => (
        <div key={sk.id} className="roles-skill-card roles-skill-card--removable">
          <img className="roles-skill-card__icon" src={getSkillIllustration(sk.id)} alt="" />
          <span className="roles-skill-card__name">{sk.name}</span>
          <button className="roles-skill-card__remove" onClick={() => removeSkill(sk.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="roles-skill-card__remove-tooltip">Remove skill</span>
          </button>
        </div>
      ))}
    </div>
  )

  const renderSkillSearchSection = () => (
    <div className="roles-panel-add-more roles-panel-add-more--open">
      <p className="roles-panel-label">Search and add more skills</p>
      <div className="roles-panel-skill-search" ref={dropdownRef}>
        <div className="roles-search" style={{ width: '100%' }}>
          <SearchNormal1 size={20} variant="Outline" color="var(--text-tertiary)" />
          <input
            className="roles-search-input"
            placeholder="Search skills…"
            value={skillSearch}
            onChange={e => {
              setSkillSearch(e.target.value)
              setSkillDropdownOpen(true)
              calcDropdownDirection()
            }}
            onFocus={() => { setSkillDropdownOpen(true); calcDropdownDirection() }}
          />
          {skillSearch && (
            <button className="roles-search__clear" onClick={() => setSkillSearch('')} aria-label="Clear search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        {skillDropdownOpen && filteredCatalogue.length > 0 && (
          <div className={`roles-panel-skill-dropdown roles-panel-skill-dropdown--${dropdownDirection}`}>
            {filteredCatalogue.slice(0, 10).map(sk => (
              <button
                key={sk.id}
                className={`roles-panel-skill-option${recentlyAdded[sk.id] ? ' roles-panel-skill-option--added' : ''}`}
                onClick={() => {
                  addSkill(sk)
                  setSkillSearch('')
                }}
              >
                <img className="roles-panel-skill-option__icon" src={getSkillIllustration(sk.id)} alt="" />
                <span className="roles-panel-skill-option-name">{sk.name}</span>
                {recentlyAdded[sk.id] ? (
                  <span className={`roles-panel-skill-option-tag${recentlyAdded[sk.id] === 'already' ? ' roles-panel-skill-option-tag--already' : ''}`}>
                    {recentlyAdded[sk.id] === 'already' ? 'Already added' : 'Added'}
                  </span>
                ) : (
                  <svg className="roles-panel-skill-option__add" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3.75v10.5M3.75 9h10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )


  /* ─── Panel content ───────────────────────────────────── */

  const renderTitle = () => {
    if (isEdit) return 'Edit Role'
    if (isCopy && step === 2) return 'Copy to Company Roles'
    if (isCopy) return 'Copy to Company Roles'
    if (isPrefilled) return 'Duplicate Role'
    return 'Create Role'
  }

  const renderSubtitle = () => {
    if (isEdit) return 'Skill changes will update recommendations for assigned learners.'
    if (isCopy && step === 2) return null
    if (isCopy) return 'This role comes with pre-mapped skills from the 5Mins library. You can customise it in the next step.'
    if (isPrefilled) return null
    return null
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')

  const handleDelete = () => {
    if (isEdit && onDelete) {
      onDelete(mode.role.id)
      setShowDeleteConfirm(false)
      setDeleteConfirmInput('')
    }
  }

  const showBackInHeader = !isEdit && !isPrefilled && step === 2

  return (
    <div className={`roles-panel-overlay${closing ? ' roles-panel-overlay--closing' : ''}`} onClick={handleClose}>
      <div className={`roles-panel${closing ? ' roles-panel--closing' : ''}`} onClick={e => e.stopPropagation()}>
        {/* Header — section-header style */}
        <div className="roles-panel-section-header">
          <div className="roles-panel-section-header__headline">
            {showBackInHeader && (
              <button className="roles-panel-back-circle" onClick={() => setStep(1)}>
                <ArrowLeft size={20} color="currentColor" />
              </button>
            )}
            <div className="roles-panel-section-header__title-group">
              <h2 className="roles-panel-section-header__title">{renderTitle()}</h2>
              {renderSubtitle() && (
                <p className="roles-panel-section-header__description">{renderSubtitle()}</p>
              )}
            </div>
            {!showBackInHeader && (
              <button className="roles-panel-close" onClick={handleClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
          <div className="roles-panel-section-header__divider" />
        </div>

        {/* Body */}
        <div className="roles-panel-body">
          {/* ── Edit Mode (single view, no steps) ── */}
          {isEdit && (
            <>
              {mode.role.employeeCount > 0 && (
                <Alert
                  type="Alert"
                  customIcon={<Danger size={24} variant="Bold" color="currentColor" className="alert__icon" />}
                  message={`${mode.role.employeeCount} learner${mode.role.employeeCount !== 1 ? 's' : ''} have this role. Changing skills will update their recommendations.`}
                  className="roles-panel-edit-alert"
                />
              )}

              <InputField
                label="Role Name"
                value={name}
                onChange={e => setName(e.target.value)}
                validation={isDuplicateName ? 'warning' : 'none'}
                helperText={isDuplicateName ? `A role named "${name.trim()}" already exists in your company roles. Change the name to continue.` : undefined}
              />

              <div className="roles-panel-field">
                <label className="roles-panel-checkbox-row">
                  <Checkbox checked={leadership} onChange={() => setLeadership(!leadership)} />
                  <div>
                    <span>This is a leadership role</span>
                    <span className="roles-panel-helper">AI will suggest management and coaching skills</span>
                  </div>
                </label>
              </div>

              <div className="roles-panel-divider" />

              {editAiWorking ? (
                <div className="roles-ai-working-card">
                  <div className="roles-ai-steps">
                    <div className="roles-ai-step">
                      <span className={`roles-ai-step__icon ${aiStep >= 2 ? 'roles-ai-step__icon--done' : 'roles-ai-step__icon--active'}`}>
                        {aiStep >= 2 ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.667A8.333 8.333 0 1 0 18.333 10 8.333 8.333 0 0 0 10 1.667Zm3.583 6.416-4.166 4.167a.625.625 0 0 1-.884 0l-2.116-2.117a.625.625 0 1 1 .883-.883l1.675 1.675 3.725-3.725a.625.625 0 1 1 .883.883Z" fill="var(--success-500)"/></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="var(--primary-500)" strokeWidth="2" fill="none" strokeDasharray="25 25"><animateTransform attributeName="transform" type="rotate" from="0 10 10" to="360 10 10" dur="1s" repeatCount="indefinite"/></circle></svg>
                        )}
                      </span>
                      <span className="roles-ai-step__text">Analyzing your role</span>
                    </div>
                    <div className="roles-ai-step">
                      <span className={`roles-ai-step__icon ${aiStep >= 3 ? 'roles-ai-step__icon--done' : aiStep >= 2 ? 'roles-ai-step__icon--active' : ''}`}>
                        {aiStep >= 3 ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.667A8.333 8.333 0 1 0 18.333 10 8.333 8.333 0 0 0 10 1.667Zm3.583 6.416-4.166 4.167a.625.625 0 0 1-.884 0l-2.116-2.117a.625.625 0 1 1 .883-.883l1.675 1.675 3.725-3.725a.625.625 0 1 1 .883.883Z" fill="var(--success-500)"/></svg>
                        ) : aiStep >= 2 ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L11.25 6.25L15 7.5L11.25 8.75L10 12.5L8.75 8.75L5 7.5L8.75 6.25L10 2.5Z" fill="#8158EC"/><path d="M15 12.5L15.625 14.375L17.5 15L15.625 15.625L15 17.5L14.375 15.625L12.5 15L14.375 14.375L15 12.5Z" fill="#8158EC"/></svg>
                        ) : null}
                      </span>
                      <span className={`roles-ai-step__text ${aiStep < 2 ? 'roles-ai-step__text--disabled' : ''}`}>Matching skills</span>
                    </div>
                    <div className="roles-ai-step">
                      <span className="roles-ai-step__icon" />
                      <span className={`roles-ai-step__text ${aiStep < 3 ? 'roles-ai-step__text--disabled' : ''}`}>Done</span>
                    </div>
                  </div>
                  <div className="roles-ai-progress">
                    <div className="roles-ai-progress__bar">
                      <div className="roles-ai-progress__fill" style={{ width: `${aiProgress}%` }} />
                    </div>
                    <span className="roles-ai-progress__text">{aiProgress}%</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="roles-panel-label-row">
                    <p className="roles-panel-label" style={{ marginBottom: 0 }}>
                      Skills — remove or add as needed
                    </p>
                    <button
                      className="roles-btn-ai-text"
                      onClick={handleEditAISuggest}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2.5L11.25 6.25L15 7.5L11.25 8.75L10 12.5L8.75 8.75L5 7.5L8.75 6.25L10 2.5Z" fill="#8158EC"/>
                        <path d="M15 12.5L15.625 14.375L17.5 15L15.625 15.625L15 17.5L14.375 15.625L12.5 15L14.375 14.375L15 12.5Z" fill="#8158EC"/>
                      </svg>
                      <span>Add Skills With AI</span>
                    </button>
                  </div>
                  {renderSkillChips()}
                  {renderSkillSearchSection()}
                </>
              )}
            </>
          )}

          {/* ── Step 1: Details (create & copy) ── */}
          {!isEdit && step === 1 && (
            <>
              <InputField
                label="Role Name"
                className={!isCopy ? 'roles-field-required' : undefined}
                placeholder="e.g. Sales Development Rep"
                value={name}
                onChange={e => setName(e.target.value)}
                helperText={isDuplicateName ? `A role named "${name.trim()}" already exists in your company roles. Change the name to continue.` : isCopy ? "You can rename this role to match your company's terminology" : undefined}
                validation={isDuplicateName ? 'warning' : 'none'}
                autoFocus
              />

              {/* Description only in create modes, not copy */}
              {!isCopy && (
                <div className="input-field">
                  <label className="input-field__label">Description</label>
                  <div className="input-field__wrapper">
                    <textarea
                      className="input-field__input roles-panel-textarea-inline"
                      rows={2}
                      placeholder="Type a job description..."
                      value={description}
                      onChange={e => {
                        setDescription(e.target.value)
                        e.target.style.height = 'auto'
                        e.target.style.height = e.target.scrollHeight + 'px'
                      }}
                    />
                  </div>
                  {uploadedFileName ? (
                    <div className="roles-panel-file-chip">
                      <DocumentText size={20} color="var(--text-secondary)" variant="Bold" />
                      <span className="roles-panel-file-chip__name">{uploadedFileName}</span>
                      <button
                        className="roles-panel-file-chip__remove"
                        onClick={() => { setUploadedFileName(null); setDescription('') }}
                        aria-label="Remove document"
                      >
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="roles-panel-file-chip__remove-tooltip">Remove Document</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="roles-panel-upload-btn"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <DocumentUpload size={20} color="currentColor" variant="Linear" />
                        Upload Job Description
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleFile(file)
                          e.target.value = ''
                        }}
                      />
                    </>
                  )}
                </div>
              )}

              <div className="roles-panel-field">
                <label className="roles-panel-checkbox-row">
                  <Checkbox checked={leadership} onChange={() => setLeadership(!leadership)} />
                  <div>
                    <span>This is a leadership role</span>
                    <span className="roles-panel-helper">AI will suggest management and coaching skills</span>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* ── Step 2: Skills (create & copy) ── */}
          {!isEdit && step === 2 && (
            <>
              {/* Role name — editable for duplicate, badge for others */}
              {isPrefilled ? (
                <>
                  <InputField
                    label="Role Name"
                    className="roles-field-required"
                    placeholder="e.g. Sales Development Rep"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    validation={isDuplicateName ? 'warning' : 'none'}
                    helperText={isDuplicateName ? `A role named "${name.trim()}" already exists in your company roles. Change the name to continue.` : undefined}
                    autoFocus
                  />
                  <div className="input-field">
                    <label className="input-field__label">Description</label>
                    <div className="input-field__wrapper">
                      <textarea
                        className="input-field__input roles-panel-textarea-inline"
                        rows={2}
                        placeholder="Type a job description..."
                        value={description}
                        onChange={e => {
                          setDescription(e.target.value)
                          e.target.style.height = 'auto'
                          e.target.style.height = e.target.scrollHeight + 'px'
                        }}
                      />
                    </div>
                    {uploadedFileName ? (
                      <div className="roles-panel-file-chip">
                        <DocumentText size={20} color="var(--text-secondary)" variant="Bold" />
                        <span className="roles-panel-file-chip__name">{uploadedFileName}</span>
                        <button
                          className="roles-panel-file-chip__remove"
                          onClick={() => { setUploadedFileName(null); setDescription('') }}
                          aria-label="Remove document"
                        >
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="roles-panel-file-chip__remove-tooltip">Remove Document</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="roles-panel-upload-btn"
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <DocumentUpload size={20} color="currentColor" variant="Linear" />
                          Upload Job Description
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleFile(file)
                            e.target.value = ''
                          }}
                        />
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="roles-ai-role-badge">
                  <span className="roles-ai-role-badge__label">Role:</span>
                  <span className="roles-ai-role-badge__name">{name}</span>
                </div>
              )}

              {/* AI Working Animation */}
              {aiLoading && (
                <div className="roles-ai-working-card">
                  <div className="roles-ai-steps">
                    <div className="roles-ai-step">
                      <span className={`roles-ai-step__icon ${aiStep >= 2 ? 'roles-ai-step__icon--done' : 'roles-ai-step__icon--active'}`}>
                        {aiStep >= 2 ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.667A8.333 8.333 0 1 0 18.333 10 8.333 8.333 0 0 0 10 1.667Zm3.583 6.416-4.166 4.167a.625.625 0 0 1-.884 0l-2.116-2.117a.625.625 0 1 1 .883-.883l1.675 1.675 3.725-3.725a.625.625 0 1 1 .883.883Z" fill="var(--success-500)"/></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="var(--primary-500)" strokeWidth="2" fill="none" strokeDasharray="25 25"><animateTransform attributeName="transform" type="rotate" from="0 10 10" to="360 10 10" dur="1s" repeatCount="indefinite"/></circle></svg>
                        )}
                      </span>
                      <span className="roles-ai-step__text">Analyzing your role</span>
                    </div>
                    <div className="roles-ai-step">
                      <span className={`roles-ai-step__icon ${aiStep >= 3 ? 'roles-ai-step__icon--done' : aiStep >= 2 ? 'roles-ai-step__icon--active' : ''}`}>
                        {aiStep >= 3 ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.667A8.333 8.333 0 1 0 18.333 10 8.333 8.333 0 0 0 10 1.667Zm3.583 6.416-4.166 4.167a.625.625 0 0 1-.884 0l-2.116-2.117a.625.625 0 1 1 .883-.883l1.675 1.675 3.725-3.725a.625.625 0 1 1 .883.883Z" fill="var(--success-500)"/></svg>
                        ) : aiStep >= 2 ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L11.25 6.25L15 7.5L11.25 8.75L10 12.5L8.75 8.75L5 7.5L8.75 6.25L10 2.5Z" fill="#8158EC"/><path d="M15 12.5L15.625 14.375L17.5 15L15.625 15.625L15 17.5L14.375 15.625L12.5 15L14.375 14.375L15 12.5Z" fill="#8158EC"/></svg>
                        ) : null}
                      </span>
                      <span className={`roles-ai-step__text ${aiStep < 2 ? 'roles-ai-step__text--disabled' : ''}`}>Matching skills</span>
                    </div>
                    <div className="roles-ai-step">
                      <span className="roles-ai-step__icon" />
                      <span className={`roles-ai-step__text ${aiStep < 3 ? 'roles-ai-step__text--disabled' : ''}`}>Done</span>
                    </div>
                  </div>
                  <div className="roles-ai-progress">
                    <div className="roles-ai-progress__bar">
                      <div className="roles-ai-progress__fill" style={{ width: `${aiProgress}%` }} />
                    </div>
                    <span className="roles-ai-progress__text">{aiProgress}%</span>
                  </div>
                </div>
              )}

              {/* Skills UI after AI finishes or for copy/manual */}
              {!aiLoading && (
                <>
                  {!isCopy && !isPrefilled && (
                    <div className="roles-panel-label-row">
                      <p className="roles-panel-label" style={{ marginBottom: 0 }}>
                        Skills — remove or add as needed
                      </p>
                      <button
                        className="roles-btn-ai-text"
                        disabled={aiLoading}
                        onClick={handleAISuggest}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2.5L11.25 6.25L15 7.5L11.25 8.75L10 12.5L8.75 8.75L5 7.5L8.75 6.25L10 2.5Z" fill="#8158EC"/>
                          <path d="M15 12.5L15.625 14.375L17.5 15L15.625 15.625L15 17.5L14.375 15.625L12.5 15L14.375 14.375L15 12.5Z" fill="#8158EC"/>
                        </svg>
                        <span>Add Skills With AI</span>
                      </button>
                    </div>
                  )}
                  {isCopy && (
                    <p className="roles-panel-label" style={{ marginBottom: 4 }}>
                      Skills from 5Mins library — remove or add as needed
                    </p>
                  )}
                  {isPrefilled && (
                    <div className="roles-panel-label-row">
                      <p className="roles-panel-label" style={{ marginBottom: 0 }}>
                        Skills — remove or add as needed
                      </p>
                      <button
                        className="roles-btn-ai-text"
                        disabled={aiLoading}
                        onClick={handleAISuggest}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2.5L11.25 6.25L15 7.5L11.25 8.75L10 12.5L8.75 8.75L5 7.5L8.75 6.25L10 2.5Z" fill="#8158EC"/>
                          <path d="M15 12.5L15.625 14.375L17.5 15L15.625 15.625L15 17.5L14.375 15.625L12.5 15L14.375 14.375L15 12.5Z" fill="#8158EC"/>
                        </svg>
                        <span>Add Skills With AI</span>
                      </button>
                    </div>
                  )}

                  {renderSkillChips()}
                  {renderSkillSearchSection()}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="roles-panel-footer">
          <div className="roles-panel-footer-divider" />
          <div className="roles-panel-footer-row">
            <div className="roles-panel-footer-left">
              {/* Step 1 Create: AI + Manual buttons */}
              {!isEdit && !isCopy && step === 1 && (
                <>
                  <div className="roles-btn-tooltip-wrapper">
                    <button
                      className="roles-btn-ai-gradient"
                      disabled={!name.trim() || aiLoading || isDuplicateName}
                      onClick={handleAISuggest}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2.5L11.25 6.25L15 7.5L11.25 8.75L10 12.5L8.75 8.75L5 7.5L8.75 6.25L10 2.5Z" fill="currentColor"/>
                        <path d="M15 12.5L15.625 14.375L17.5 15L15.625 15.625L15 17.5L14.375 15.625L12.5 15L14.375 14.375L15 12.5Z" fill="currentColor"/>
                        <path d="M5 12.5L5.625 14.375L7.5 15L5.625 15.625L5 17.5L4.375 15.625L2.5 15L4.375 14.375L5 12.5Z" fill="currentColor"/>
                      </svg>
                      Add Skills With AI
                    </button>
                    {!name.trim() && (
                      <span className="roles-btn-tooltip"><span className="roles-btn-tooltip__asterisk">*</span> Role name is required</span>
                    )}
                  </div>
                  <div className="roles-btn-tooltip-wrapper">
                    <Button variant="outlined"
                      disabled={!name.trim() || isDuplicateName}
                      onClick={handleSkipToManual}
                    >
                      Add Skills Manually
                    </Button>
                    {!name.trim() && (
                      <span className="roles-btn-tooltip"><span className="roles-btn-tooltip__asterisk">*</span> Role name is required</span>
                    )}
                  </div>
                </>
              )}
              {/* Step 1 Copy: Continue button */}
              {!isEdit && step === 1 && isCopy && (
                <div className="roles-btn-tooltip-wrapper">
                  <Button
                    disabled={!name.trim() || isDuplicateName}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </Button>
                  {!name.trim() && (
                    <span className="roles-btn-tooltip">Role name is required to continue</span>
                  )}
                </div>
              )}
              {/* Edit: Save */}
              {isEdit && (
                <Button
                  disabled={!canSave}
                  onClick={() => onSave(name, selectedSkills, leadership)}
                >
                  Save Changes
                </Button>
              )}
              {/* Step 2: Create/Copy + Cancel */}
              {!isEdit && step === 2 && !aiLoading && (
                <>
                  <Button
                    disabled={!canSave}
                    onClick={() => onSave(name, selectedSkills, leadership)}
                  >
                    {isCopy ? 'Copy Role' : 'Create Role'}
                  </Button>
                  <Button variant="outlined-2"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
            {!isEdit && !isPrefilled && (
              <span className="roles-panel-step-indicator">Step {step} of 2</span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isEdit && (
        <ConfirmModal
          open={showDeleteConfirm}
          onClose={() => { setShowDeleteConfirm(false); setDeleteConfirmInput('') }}
        >
          <div className="confirm-modal-header confirm-modal-header--center">
            <Danger size={72} color="var(--danger-500)" variant="Linear" />
            <h3 className="confirm-modal-title">Delete role</h3>
            <p className="confirm-modal-body">
              {mode.role.employeeCount > 0
                ? `This role is assigned to ${mode.role.employeeCount} learner${mode.role.employeeCount !== 1 ? 's' : ''}. Deleting it will remove their role assignment. This action cannot be undone.`
                : 'This action cannot be undone.'
              }
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
            <Button variant="outlined-2"
              onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmInput('') }}
            >
              Cancel
            </Button>
            <Button semantic="danger"
              disabled={deleteConfirmInput !== 'Delete'}
              onClick={handleDelete}
            >
              Delete Role
            </Button>
          </div>
        </ConfirmModal>
      )}
    </div>
  )
}

export default RolePanel
