import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Moon, Sun1 } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ColourField from '@/components/ColourField/ColourField'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import { effectiveTheme, getBrandTheme, type BrandTheme, type ThemeSet } from '@/data/brandTheme'
import type { Theme } from '@/hooks/useTheme'

/* Account > Layout > Edit Theme (production Edit theme recording, 2026-10-19).
   Edits both modes as one draft; Apply saves it, Cancel drops it.
   Prefix: acl-edit- */

interface EditThemeModalProps {
  open: boolean
  /** The app mode to open on. */
  initialMode: Theme
  onClose: () => void
  onApply: (theme: BrandTheme) => void
}

const MODES: { key: Theme; label: string; Icon: typeof Sun1 }[] = [
  { key: 'light', label: 'Light', Icon: Sun1 },
  { key: 'dark', label: 'Dark', Icon: Moon },
]

const FIELDS: { key: keyof ThemeSet; label: string }[] = [
  { key: 'header', label: 'Header bar' },
  { key: 'nav', label: 'Navigation menu items' },
  { key: 'selected', label: 'Selected menu item' },
]

function EditThemeModal({ open, initialMode, onClose, onApply }: EditThemeModalProps) {
  const [mode, setMode] = useState<Theme>(initialMode)
  const [draft, setDraft] = useState<BrandTheme>(() => effectiveTheme(getBrandTheme()))

  // Every opening starts from the saved theme on the app's current mode.
  useEffect(() => {
    if (!open) return
    setMode(initialMode)
    setDraft(effectiveTheme(getBrandTheme()))
  }, [open, initialMode])

  const reduce = useReducedMotion()
  const set = draft[mode]

  // Radio group keys: the arrows move the selection and the focus together.
  const onModesKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const next = mode === 'light' ? 'dark' : 'light'
    setMode(next)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)?.focus()
  }
  const previewVars = {
    '--acl-edit-header': set.header,
    '--acl-edit-nav': set.nav,
    '--acl-edit-selected': set.selected,
  } as CSSProperties

  return (
    <ConfirmModal open={open} onClose={onClose} ariaLabel="Edit theme" closable className="acl-edit">
      <div className="confirm-modal-header">
        <h2 className="confirm-modal-title">Edit theme</h2>
        <p className="confirm-modal-body">Add custom colours to sign up / login pages, navigation headers and menus</p>
      </div>

      <div className="acl-edit__modes" role="radiogroup" aria-label="Mode to edit" onKeyDown={onModesKey}>
        {MODES.map(({ key, label, Icon }) => {
          const selected = key === mode
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              data-mode={key}
              className={`acl-edit__mode${selected ? ' is-selected' : ''}`}
              onClick={() => setMode(key)}
            >
              <Icon size={20} color="var(--text-primary)" variant="Linear" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Keyed by mode: the fields fade in with the other set's values. */}
      <motion.div
        key={mode}
        className="acl-edit__fields"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {FIELDS.map(({ key, label }) => (
          <ColourField
            key={key}
            label={label}
            value={set[key]}
            onChange={(hex) => setDraft((d) => ({ ...d, [mode]: { ...d[mode], [key]: hex } }))}
          />
        ))}
      </motion.div>

      {/* A sketch of where the three colours land, on the mode being edited. */}
      <div className={`acl-edit__preview acl-edit__preview--${mode}`} style={previewVars} aria-hidden="true">
        <div className="acl-edit__desktop">
          <div className="acl-edit__desktop-header" />
          <div className="acl-edit__desktop-body">
            <div className="acl-edit__desktop-nav">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`acl-edit__bar${i === 1 ? ' acl-edit__bar--selected' : ''}`} />
              ))}
            </div>
            <div className="acl-edit__desktop-content" />
          </div>
        </div>
        <div className="acl-edit__mobile">
          <div className="acl-edit__mobile-top">
            <span className="acl-edit__pill" />
          </div>
          <div className="acl-edit__mobile-content" />
          <div className="acl-edit__mobile-tabs">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`acl-edit__dot${i === 0 ? ' acl-edit__dot--selected' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="confirm-modal-actions acl-edit__actions">
        <Button variant="outlined-2" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onApply(draft)}>Apply Changes</Button>
      </div>
    </ConfirmModal>
  )
}

export default EditThemeModal
