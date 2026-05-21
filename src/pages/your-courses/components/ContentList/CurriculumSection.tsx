import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  Add,
  ArrowDown2,
} from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
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
  summary?: string
  hideDragHandle?: boolean
  startInRenameMode?: boolean
  isDragging?: boolean
  dropAbove?: boolean
  dropBelow?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  onDrop?: () => void
  onToggleCollapse: () => void
  onRename: (newName: string) => void
  onDelete: () => void
  onAddLesson?: () => void
  children: ReactNode
}

function CurriculumSection({
  section,
  itemCount,
  summary,
  hideDragHandle = false,
  startInRenameMode = false,
  isDragging = false,
  dropAbove = false,
  dropBelow = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onToggleCollapse,
  onRename,
  onDelete,
  onAddLesson,
  children,
}: CurriculumSectionProps) {
  const [renaming, setRenaming] = useState(startInRenameMode)
  const [draft, setDraft] = useState(section.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLParagraphElement>(null)
  const initialMountRef = useRef(true)

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [renaming])

  // GSAP expand/collapse — body height + opacity, subtitle fade
  useEffect(() => {
    const body = bodyRef.current
    const sub = summaryRef.current
    if (!body) return

    if (initialMountRef.current) {
      // No animation on first render — set the final state directly
      if (section.collapsed) {
        gsap.set(body, {
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          opacity: 0,
          overflow: 'hidden',
        })
        if (sub) gsap.set(sub, { height: 'auto', marginTop: 4, opacity: 1 })
      } else if (sub) {
        gsap.set(sub, { height: 0, marginTop: 0, opacity: 0, overflow: 'hidden' })
      }
      initialMountRef.current = false
      return
    }

    gsap.killTweensOf(body)
    if (sub) gsap.killTweensOf(sub)

    const duration = 0.3
    const ease = 'power2.inOut'

    if (section.collapsed) {
      gsap.to(body, {
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        opacity: 0,
        duration,
        ease,
        overflow: 'hidden',
      })
      if (sub) {
        gsap.to(sub, {
          height: 'auto',
          marginTop: 4,
          opacity: 1,
          duration,
          ease,
          overflow: 'hidden',
          onComplete: () => {
            if (summaryRef.current) summaryRef.current.style.overflow = ''
          },
        })
      }
    } else {
      gsap.to(body, {
        height: 'auto',
        paddingTop: 16,
        paddingBottom: 16,
        opacity: 1,
        duration,
        ease,
        overflow: 'hidden',
        onComplete: () => {
          if (bodyRef.current) bodyRef.current.style.overflow = ''
        },
      })
      if (sub) {
        gsap.to(sub, {
          height: 0,
          marginTop: 0,
          opacity: 0,
          duration,
          ease,
          overflow: 'hidden',
        })
      }
    }
  }, [section.collapsed])

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

  const draggable = !hideDragHandle && !renaming && !!onDragStart
  const classes = [
    'curriculum-section',
    collapsed && 'curriculum-section--collapsed',
    isDragging && 'curriculum-section--dragging',
    dropAbove && 'curriculum-section--drop-above',
    dropBelow && 'curriculum-section--drop-below',
  ].filter(Boolean).join(' ')

  return (
    <section
      className={classes}
      aria-labelledby={`section-${section.id}-title`}
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <header className="curriculum-section__header">
        {!hideDragHandle && <DragHandle />}
        {renaming ? (
          <>
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
              className="curriculum-section__save-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commitRename}
            >
              Save
            </button>
            <CloseButton
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancelRename}
              ariaLabel="Cancel rename"
            />
          </>
        ) : (
          <>
            <div className="curriculum-section__info">
              <h3
                id={`section-${section.id}-title`}
                className="curriculum-section__title"
                onDoubleClick={startRename}
                title="Double-click to rename"
              >
                {section.name}
              </h3>
              {summary && (
                <p ref={summaryRef} className="curriculum-section__summary">{summary}</p>
              )}
            </div>
            <KebabMenu
              ariaLabel={`Actions for ${section.name}`}
              items={[
                { label: 'Rename', onClick: startRename },
                { label: 'Remove Section', onClick: onDelete, danger: true },
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
          </>
        )}
      </header>

      <div ref={bodyRef} className="curriculum-section__body">
        {itemCount === 0 ? (
          <div className="curriculum-section__empty">
            <p className="curriculum-section__empty-text">
              No content on this section
            </p>
          </div>
        ) : (
          <div className="curriculum-section__items">{children}</div>
        )}
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
      </div>
    </section>
  )
}

export default CurriculumSection
