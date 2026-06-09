import { Fragment, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Add, Copy, Edit2, MagicStar, SearchNormal1, Star1, Trash } from 'iconsax-react'
import MoreIcon from '../../../../components/icons/MoreIcon'
import type { FilterPreset } from '../../../../utils/lrSavedFilters'
import { DEFAULT_PRESETS } from '../../../../utils/lrSavedFilters'
import './PresetsMenu.css'

interface PresetsMenuProps {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLElement | null>
  /** User-saved presets (defaults are added internally). */
  presets: FilterPreset[]
  /** True when there are active filters that can be saved. */
  canSave: boolean
  /** Highlights the preset currently applied to the table. */
  isActive: (preset: FilterPreset) => boolean
  onApply: (preset: FilterPreset) => void
  onSave: (name: string, description: string) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (preset: FilterPreset) => void
}

function subtitle(p: FilterPreset): string {
  if (p.description) return p.description
  const n = p.filters.length
  return `${n} filter${n === 1 ? '' : 's'}`
}

function PresetsMenu({
  open,
  onClose,
  anchorRef,
  presets,
  canSave,
  isActive,
  onApply,
  onSave,
  onDelete,
  onTogglePin,
  onRename,
  onDuplicate,
}: PresetsMenuProps) {
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      const anchor = anchorRef.current
      if (anchor && !anchor.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose, anchorRef])

  // Reset transient state each time it opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setSaving(false)
      setName('')
      setDescription('')
      setMenuId(null)
      setEditingId(null)
    }
  }, [open])

  const q = query.trim().toLowerCase()
  const suggested = useMemo(
    () => DEFAULT_PRESETS.filter((p) => p.name.toLowerCase().includes(q)),
    [q],
  )
  // Pinned first, then the rest
  const mine = useMemo(() => {
    const matched = presets.filter((p) => p.name.toLowerCase().includes(q))
    return [...matched].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  }, [presets, q])

  if (!open) return null

  const isEmpty = suggested.length === 0 && mine.length === 0

  function commitSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed, description.trim())
    setSaving(false)
    setName('')
    setDescription('')
  }

  function startRename(p: FilterPreset) {
    setMenuId(null)
    setEditingId(p.id)
    setEditName(p.name)
  }

  function commitRename(id: string) {
    const trimmed = editName.trim()
    if (trimmed) onRename(id, trimmed)
    setEditingId(null)
  }

  return (
    <div className="pm" ref={ref} role="dialog" aria-label="Filter presets">
      <div className="pm-search">
        <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
        <input
          type="text"
          className="pm-search-input"
          placeholder="Search presets"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="pm-list">
        {suggested.length > 0 && (
          <div className="pm-group">
            <div className="pm-section">Suggested</div>
            {suggested.map((p) => (
              <button
                type="button"
                className={`pm-item${isActive(p) ? ' pm-item--active' : ''}`}
                key={p.id}
                onClick={() => onApply(p)}
              >
                <span className="pm-item-icon">
                  <MagicStar size={20} color="var(--text-secondary)" variant="Linear" />
                </span>
                <span className="pm-item-text">
                  <span className="pm-item-title">{p.name}</span>
                  <span className="pm-item-desc">{subtitle(p)}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {mine.length > 0 && (
          <div className="pm-group">
            {suggested.length > 0 && <div className="pm-divider" />}
            <div className="pm-section">Your presets</div>
            {mine.map((p) => (
              <Fragment key={p.id}>
                {editingId === p.id ? (
                  <div className="pm-rename-row">
                    <input
                      type="text"
                      className="pm-rename-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(p.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                    />
                    <button type="button" className="pm-rename-save" disabled={!editName.trim()} onClick={() => commitRename(p.id)}>
                      Save
                    </button>
                  </div>
                ) : (
                  <div className={`pm-item pm-item--row${isActive(p) ? ' pm-item--active' : ''}`}>
                    <button
                      type="button"
                      className="pm-pin"
                      aria-label={p.pinned ? `Unpin ${p.name}` : `Pin ${p.name}`}
                      aria-pressed={!!p.pinned}
                      onClick={() => onTogglePin(p.id)}
                    >
                      <Star1
                        size={18}
                        color={p.pinned ? 'var(--selected)' : 'var(--text-tertiary)'}
                        variant={p.pinned ? 'Bold' : 'Linear'}
                      />
                    </button>
                    <button type="button" className="pm-item-main" onClick={() => onApply(p)}>
                      <span className="pm-item-text">
                        <span className="pm-item-title">{p.name}</span>
                        <span className="pm-item-desc">{subtitle(p)}</span>
                      </span>
                    </button>
                    <div className="pm-kebab-wrap">
                      <button
                        type="button"
                        className="pm-kebab"
                        aria-label={`Actions for ${p.name}`}
                        aria-haspopup="menu"
                        aria-expanded={menuId === p.id}
                        onClick={() => setMenuId(menuId === p.id ? null : p.id)}
                      >
                        <MoreIcon size={20} color="var(--text-tertiary)" />
                      </button>
                      {menuId === p.id && (
                        <div className="pm-kebab-menu" role="menu">
                          <button type="button" className="pm-kebab-item" role="menuitem" onClick={() => startRename(p)}>
                            <Edit2 size={18} color="var(--text-primary)" variant="Linear" />
                            Rename
                          </button>
                          <button type="button" className="pm-kebab-item" role="menuitem" onClick={() => { setMenuId(null); onDuplicate(p) }}>
                            <Copy size={18} color="var(--text-primary)" variant="Linear" />
                            Duplicate
                          </button>
                          <button type="button" className="pm-kebab-item pm-kebab-item--danger" role="menuitem" onClick={() => { setMenuId(null); onDelete(p.id) }}>
                            <Trash size={18} color="var(--text-error)" variant="Linear" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}

        {isEmpty && <div className="pm-empty">No presets match “{query}”.</div>}
      </div>

      {/* Save current filters */}
      <div className="pm-footer">
        {saving ? (
          <div className="pm-save-form">
            <input
              type="text"
              className="pm-save-input"
              placeholder="Preset name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSave()
                if (e.key === 'Escape') setSaving(false)
              }}
              autoFocus
            />
            <input
              type="text"
              className="pm-save-input"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSave()
                if (e.key === 'Escape') setSaving(false)
              }}
            />
            <div className="pm-save-actions">
              <button type="button" className="pm-save-confirm" disabled={!name.trim()} onClick={commitSave}>
                Save
              </button>
              <button type="button" className="pm-save-cancel" onClick={() => setSaving(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="pm-save-trigger"
            disabled={!canSave}
            onClick={() => setSaving(true)}
          >
            <Add size={20} color={canSave ? 'var(--primary-600)' : 'var(--text-disabled)'} variant="Linear" />
            Save Current Filters As Preset
          </button>
        )}
      </div>
    </div>
  )
}

export default PresetsMenu
