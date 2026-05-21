import { useEffect, useRef, useState } from 'react'
import {
  Add,
  ArrowDown2,
  CloseCircle,
  TickCircle,
} from 'iconsax-react'
import MoreIcon from '../../../../components/icons/MoreIcon'
import type { ReactNode } from 'react'

export interface Section {
  id: string
  name: string
  items: ReactNode[]
  collapsed?: boolean
}

interface KebabItem {
  label: string
  onClick: () => void
  danger?: boolean
}

function KebabMenu({ items, ariaLabel = 'More actions' }: { items: KebabItem[]; ariaLabel?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="kebab">
      <button
        type="button"
        className="kebab__trigger"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreIcon size={20} color="var(--text-secondary)" />
      </button>
      {open && (
        <div className="kebab__menu" role="menu">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              className={`kebab__item${it.danger ? ' kebab__item--danger' : ''}`}
              onClick={() => {
                setOpen(false)
                it.onClick()
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DragHandle() {
  return (
    <div className="curriculum-section__drag" aria-label="Drag to reorder section">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="7" cy="5" r="1.5" fill="var(--neutral-300)" />
        <circle cx="13" cy="5" r="1.5" fill="var(--neutral-300)" />
        <circle cx="7" cy="10" r="1.5" fill="var(--neutral-300)" />
        <circle cx="13" cy="10" r="1.5" fill="var(--neutral-300)" />
        <circle cx="7" cy="15" r="1.5" fill="var(--neutral-300)" />
        <circle cx="13" cy="15" r="1.5" fill="var(--neutral-300)" />
      </svg>
    </div>
  )
}

interface CurriculumSectionProps {
  section: Section
  itemCount: number
  hideDragHandle?: boolean
  startInRenameMode?: boolean
  onToggleCollapse: () => void
  onRename: (newName: string) => void
  onDelete: () => void
  onAddLesson?: () => void
  children: ReactNode
}

function CurriculumSection({
  section,
  itemCount,
  hideDragHandle = false,
  startInRenameMode = false,
  onToggleCollapse,
  onRename,
  onDelete,
  onAddLesson,
  children,
}: CurriculumSectionProps) {
  const [renaming, setRenaming] = useState(startInRenameMode)
  const [draft, setDraft] = useState(section.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [renaming])

  const startRename = () => {
    setDraft(section.name)
    setRenaming(true)
  }

  const commitRename = () => {
    const next = draft.trim()
    if (next && next !== section.name) onRename(next)
    setRenaming(false)
  }

  const cancelRename = () => {
    setDraft(section.name)
    setRenaming(false)
  }

  const collapsed = !!section.collapsed

  return (
    <section className="curriculum-section" aria-labelledby={`section-${section.id}-title`}>
      <header className="curriculum-section__header">
        {!hideDragHandle && <DragHandle />}
        {renaming ? (
          <div className="curriculum-section__rename">
            <input
              ref={inputRef}
              className="curriculum-section__rename-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') cancelRename()
              }}
              onBlur={commitRename}
              aria-label="Section name"
            />
            <button
              type="button"
              className="curriculum-section__rename-btn curriculum-section__rename-btn--confirm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commitRename}
              aria-label="Save section name"
            >
              <TickCircle size={20} color="var(--success-500)" variant="Bold" />
            </button>
            <button
              type="button"
              className="curriculum-section__rename-btn curriculum-section__rename-btn--cancel"
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancelRename}
              aria-label="Cancel rename"
            >
              <CloseCircle size={20} color="var(--text-secondary)" variant="Linear" />
            </button>
          </div>
        ) : (
          <h3
            id={`section-${section.id}-title`}
            className="curriculum-section__title"
            onDoubleClick={startRename}
            title="Double-click to rename"
          >
            {section.name}
          </h3>
        )}
        <KebabMenu
          ariaLabel={`Actions for ${section.name}`}
          items={[
            { label: 'Rename', onClick: startRename },
            { label: 'Delete Section', onClick: onDelete, danger: true },
          ]}
        />
        <button
          type="button"
          className={`curriculum-section__chevron${collapsed ? ' curriculum-section__chevron--collapsed' : ''}`}
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand section' : 'Collapse section'}
          aria-expanded={!collapsed}
        >
          <ArrowDown2 size={20} color="var(--text-primary)" variant="Linear" />
        </button>
      </header>

      {!collapsed && (
        <div className="curriculum-section__body">
          {itemCount === 0 ? (
            <div className="curriculum-section__empty">
              <p className="curriculum-section__empty-text">
                No lessons on this section
              </p>
              <button
                type="button"
                className="curriculum-section__empty-cta"
                onClick={onAddLesson}
              >
                <span>Add Content</span>
                <Add size={16} color="currentColor" variant="Linear" />
              </button>
            </div>
          ) : (
            <>
              <div className="curriculum-section__items">{children}</div>
              {onAddLesson && (
                <button
                  type="button"
                  className="curriculum-section__add-lesson"
                  onClick={onAddLesson}
                >
                  <span>Add Content</span>
                  <Add size={16} color="currentColor" variant="Linear" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default CurriculumSection
