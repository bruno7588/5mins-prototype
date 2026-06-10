import { Fragment, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Copy, Edit2, SearchNormal1, Trash } from 'iconsax-react'
import MoreIcon from '../../../../components/icons/MoreIcon'
import type { FilterPreset } from '../../../../utils/lrSavedFilters'
import './PresetsMenu.css'

// Show the search box only once the list is long enough to need it.
const SEARCH_THRESHOLD = 6

interface PresetsMenuProps {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLElement | null>
  /** The admin's saved views (suggested defaults live as header chips, not here). */
  presets: FilterPreset[]
  /** Highlights the view currently applied to the table. */
  isActive: (preset: FilterPreset) => boolean
  onApply: (preset: FilterPreset) => void
  onDelete: (id: string) => void
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
  isActive,
  onApply,
  onDelete,
  onRename,
  onDuplicate,
}: PresetsMenuProps) {
  const [query, setQuery] = useState('')
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
      setMenuId(null)
      setEditingId(null)
    }
  }, [open])

  const showSearch = presets.length > SEARCH_THRESHOLD
  const q = query.trim().toLowerCase()
  const views = useMemo(
    () => presets.filter((p) => p.name.toLowerCase().includes(q)),
    [presets, q],
  )

  if (!open) return null

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
    <div className="pm" ref={ref} role="dialog" aria-label="Saved views">
      {showSearch && (
        <div className="pm-search">
          <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
          <input
            type="text"
            className="pm-search-input"
            placeholder="Search views"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className="pm-list">
        {views.map((p) => (
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

        {views.length === 0 && (
          <div className="pm-empty">
            {q ? `No views match “${query}”.` : 'No saved views yet.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default PresetsMenu
