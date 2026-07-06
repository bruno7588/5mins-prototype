import { useState } from 'react'
import { Add } from 'iconsax-react'
import Checkbox from '../../../../components/Checkbox/Checkbox'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import './UserFieldDrawer.css'

interface UserFieldDrawerProps {
  onClose: () => void
  onSave: (field: { name: string; options: string[]; required: boolean }) => void
  initialData?: { name: string; options: string[]; required: boolean }
  existingNames?: string[]
}

function UserFieldDrawer({ onClose, onSave, initialData, existingNames = [] }: UserFieldDrawerProps) {
  const [closing, setClosing] = useState(false)
  const [fieldName, setFieldName] = useState(initialData?.name ?? '')
  const [options, setOptions] = useState(
    initialData?.options && initialData.options.length > 0 ? initialData.options : ['', '']
  )
  const [required, setRequired] = useState(initialData?.required ?? true)
  const [touched, setTouched] = useState(false)
  const isEditing = !!initialData

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 300)
  }

  const handleAddOption = () => {
    setOptions(prev => [...prev, ''])
  }

  const handleOptionChange = (index: number, value: string) => {
    setOptions(prev => prev.map((opt, i) => (i === index ? value : opt)))
  }

  const handleRemoveOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index))
  }

  const trimmedName = fieldName.trim()
  const isDuplicate = existingNames.some(
    n => n.toLowerCase() === trimmedName.toLowerCase() &&
      (!initialData || n.toLowerCase() !== initialData.name.toLowerCase())
  )
  const nameError = touched
    ? trimmedName.length === 0
      ? 'Field name is required'
      : isDuplicate
        ? 'A field with this name already exists'
        : ''
    : ''
  const canSave = trimmedName.length > 0 && !isDuplicate
  const filledOptions = options.map(o => o.trim()).filter(Boolean)

  const handleSave = () => {
    setTouched(true)
    if (canSave) {
      onSave({ name: trimmedName, options: filledOptions, required })
    }
  }

  const showRemove = options.length > 2

  return (
    <>
      <div
        className={`uf-drawer-overlay${closing ? ' uf-drawer-overlay--closing' : ''}`}
        onClick={handleClose}
      />
      <aside
        className={`uf-drawer${closing ? ' uf-drawer--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="uf-drawer-header">
          <div className="uf-drawer-header-row">
            <h3 className="uf-drawer-title">{isEditing ? 'Edit custom field' : 'Create custom field'}</h3>
            <CloseButton onClick={handleClose} className="uf-drawer-close" />
          </div>
          <div className="uf-drawer-divider" />
        </div>

        {/* Form */}
        <div className="uf-drawer-form">
          {/* Field name */}
          <div className="uf-drawer-field">
            <label className="uf-drawer-label">Field name</label>
            <input
              className={`uf-drawer-input${nameError ? ' uf-drawer-input--error' : ''}`}
              type="text"
              placeholder="e.g., Department Code, Employment Type, or Location"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              onBlur={() => setTouched(true)}
            />
            {nameError && <span className="uf-drawer-error">{nameError}</span>}
          </div>

          {/* Options */}
          <div className="uf-drawer-field">
            <label className="uf-drawer-label">Write all available options for this field</label>

            <div className="uf-drawer-options-list">
              {options.map((opt, i) => (
                <div className="uf-drawer-option-row" key={i}>
                  <input
                    className={`uf-drawer-input${showRemove ? ' uf-drawer-input--with-remove' : ''}`}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                  {showRemove && (
                    <button
                      className="uf-drawer-option-remove"
                      onClick={() => handleRemoveOption(i)}
                      aria-label="Remove option"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="uf-drawer-tooltip">Remove option</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="uf-drawer-add-option" type="button" onClick={handleAddOption}>
              Add Option
              <Add size={20} color="currentColor" />
            </button>
          </div>

          {/* Required checkbox */}
          <div className="uf-drawer-checkbox-row">
            <Checkbox checked={required} onChange={() => setRequired(!required)} />
            <div className="uf-drawer-checkbox-info">
              <span className="uf-drawer-checkbox-label">Required field</span>
              <span className="uf-drawer-checkbox-desc">
                Admins will need to fill this field when inviting users.
              </span>
            </div>
          </div>

          {/* Preview — only shown when creating */}
          {!isEditing && <div className="uf-drawer-preview">
            <div className="uf-drawer-preview-card">
              <svg width="208" height="230" viewBox="0 0 208 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="uf-drawer-preview-img">
                {/* Title */}
                <text x="0" y="14" fill="var(--text-secondary)" fontFamily="Poppins, sans-serif" fontSize="14" fontWeight="500">Dropdown example:</text>
                {/* Card outline */}
                <rect x="0.5" y="29.5" width="207" height="195" rx="11.5" stroke="var(--border)"/>
                {/* Field name label */}
                <text x="20" y="60" fill="var(--text-tertiary)" fontFamily="Poppins, sans-serif" fontSize="14" fontWeight="400">Field name</text>
                {/* Select box */}
                <rect x="12.5" y="70.5" width="183" height="36" rx="11.5" stroke="var(--border)"/>
                <text x="24" y="94" fill="var(--text-tertiary)" fontFamily="Poppins, sans-serif" fontSize="14" fontWeight="400">Option 1</text>
                {/* Chevron */}
                <path d="M174.4 90.2L170.8 86.6C170.35 86.14 169.65 86.14 169.2 86.6L165.6 90.2" stroke="var(--text-tertiary)" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Options panel */}
                <rect x="12" y="115" width="184" height="100" rx="12" fill="var(--input-background)"/>
                <text x="24" y="142" fill="var(--text-tertiary)" fontFamily="Poppins, sans-serif" fontSize="14" fontWeight="400">Option 1</text>
                <text x="24" y="172" fill="var(--text-tertiary)" fontFamily="Poppins, sans-serif" fontSize="14" fontWeight="400">Option 2</text>
                <text x="24" y="202" fill="var(--text-tertiary)" fontFamily="Poppins, sans-serif" fontSize="14" fontWeight="400">Option 3</text>
              </svg>
            </div>
          </div>}
        </div>

        {/* Footer */}
        <div className="uf-drawer-footer">
          <div className="uf-drawer-divider" />
          <div className="uf-drawer-save-wrapper">
            <button
              className="uf-drawer-save"
              disabled={!canSave}
              onClick={handleSave}
            >
              {isEditing ? 'Save' : 'Create Field'}
            </button>
            {!canSave && (
              <span className="uf-drawer-save-tooltip">Field name is required</span>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default UserFieldDrawer
