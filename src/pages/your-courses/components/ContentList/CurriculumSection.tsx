import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Add, ArrowDown2, Edit2, Trash } from 'iconsax-react'
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
  icon?: ReactNode
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
              {it.icon && <span className="kebab__item-icon" aria-hidden="true">{it.icon}</span>}
              <span className="kebab__item-label">{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const DragHandle = ({ innerRef, disabled }: { innerRef?: React.Ref<HTMLDivElement>; disabled?: boolean }) => (
  <div
    ref={innerRef}
    className={`curriculum-section__drag${disabled ? ' curriculum-section__drag--disabled' : ''}`}
    aria-label="Drag to reorder section"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="5" r="1.5" fill="currentColor" />
      <circle cx="13" cy="5" r="1.5" fill="currentColor" />
      <circle cx="7" cy="10" r="1.5" fill="currentColor" />
      <circle cx="13" cy="10" r="1.5" fill="currentColor" />
      <circle cx="7" cy="15" r="1.5" fill="currentColor" />
      <circle cx="13" cy="15" r="1.5" fill="currentColor" />
    </svg>
  </div>
)

interface CurriculumSectionProps {
  section: Section
  itemCount: number
  summary?: string
  hideChrome?: boolean
  dragDisabled?: boolean
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
  onAddContent?: () => void
  canRename?: boolean
  canDelete?: boolean
  unsectioned?: boolean
  destinationActive?: boolean
  onBodyDragOver?: (e: React.DragEvent) => void
  onBodyDrop?: () => void
  children: ReactNode
}

function CurriculumSection({
  section,
  itemCount,
  summary,
  hideChrome = false,
  dragDisabled = false,
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
  onAddContent,
  canRename = true,
  canDelete = true,
  unsectioned = false,
  destinationActive = false,
  onBodyDragOver,
  onBodyDrop,
  children,
}: CurriculumSectionProps) {
  const [renaming, setRenaming] = useState(startInRenameMode)
  const [draft, setDraft] = useState(section.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLParagraphElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const initialMountRef = useRef(true)
  const prevHideChromeRef = useRef(hideChrome)

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [renaming])

  // GSAP expand/collapse — body height + opacity, subtitle fade.
  // The new layout has a self-contained header card (no border-shared body), so
  // we no longer animate drag/info paddingTop to fake alignment.
  useEffect(() => {
    const body = bodyRef.current
    const sub = summaryRef.current
    if (!body) return

    if (initialMountRef.current) {
      if (section.collapsed) {
        gsap.set(body, { height: 0, opacity: 0, overflow: 'hidden' })
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
      gsap.to(body, { height: 0, opacity: 0, duration, ease, overflow: 'hidden' })
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
        opacity: 1,
        duration,
        ease,
        overflow: 'hidden',
        onComplete: () => {
          if (bodyRef.current) bodyRef.current.style.overflow = ''
        },
      })
      if (sub) {
        gsap.to(sub, { height: 0, marginTop: 0, opacity: 0, duration, ease, overflow: 'hidden' })
      }
    }
  }, [section.collapsed])

  // Chrome appeared after a swap — reset summary visibility.
  useEffect(() => {
    if (!prevHideChromeRef.current || hideChrome) {
      prevHideChromeRef.current = hideChrome
      return
    }
    prevHideChromeRef.current = hideChrome
    const sub = summaryRef.current
    if (sub) {
      if (section.collapsed) gsap.set(sub, { height: 'auto', marginTop: 4, opacity: 1 })
      else gsap.set(sub, { height: 0, marginTop: 0, opacity: 0, overflow: 'hidden' })
    }
  }, [hideChrome, section.collapsed])

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

  const collapsed = !hideChrome && !!section.collapsed

  const draggable = !hideChrome && !unsectioned && !renaming && !!onDragStart && !dragDisabled
  const classes = [
    'curriculum-section',
    hideChrome && 'curriculum-section--chromeless',
    collapsed && 'curriculum-section--collapsed',
    isDragging && 'curriculum-section--dragging',
    dropAbove && 'curriculum-section--drop-above',
    dropBelow && 'curriculum-section--drop-below',
    destinationActive && 'curriculum-section--drop-destination',
    unsectioned && 'curriculum-section--unsectioned',
  ].filter(Boolean).join(' ')

  // The rail (vertical line) shows for both sections and the unsectioned bucket;
  // only real sections get the draggable grip.
  const showDragColumn = !hideChrome
  const showGrip = !hideChrome && !unsectioned

  return (
    <section
      className={classes}
      aria-labelledby={`section-${section.id}-title`}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      {showDragColumn && (
        <div
          className="curriculum-section__drag-column"
          draggable={draggable}
          onDragStart={draggable ? onDragStart : undefined}
          onDragEnd={onDragEnd}
        >
          {showGrip && <DragHandle innerRef={dragRef} disabled={dragDisabled} />}
          <div className="curriculum-section__drag-line" aria-hidden="true" />
        </div>
      )}

      {!hideChrome && unsectioned && (
        <header className="curriculum-section__divider-header">
          <span className="curriculum-section__divider-label">{section.name}</span>
        </header>
      )}

      {!hideChrome && !unsectioned && (
      <header
        className={`curriculum-section__header${renaming ? ' curriculum-section__header--editing' : ''}`}
        onClick={renaming ? undefined : onToggleCollapse}
      >
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
            <div ref={infoRef} className="curriculum-section__info">
              <h3
                id={`section-${section.id}-title`}
                className="curriculum-section__title"
              >
                {section.name}
              </h3>
              {summary && (
                <p ref={summaryRef} className="curriculum-section__summary">{summary}</p>
              )}
            </div>
            {(canRename || canDelete) && (
              <div className="curriculum-section__kebab-wrap" onClick={(e) => e.stopPropagation()}>
              <KebabMenu
                ariaLabel={`Actions for ${section.name}`}
                items={[
                  canRename && {
                    label: 'Rename',
                    onClick: startRename,
                    icon: <Edit2 size={16} color="currentColor" variant="Linear" />,
                  },
                  canDelete && {
                    label: 'Remove Section',
                    onClick: onDelete,
                    danger: true,
                    icon: <Trash size={16} color="currentColor" variant="Linear" />,
                  },
                ].filter(Boolean) as { label: string; onClick: () => void; danger?: boolean; icon?: ReactNode }[]}
              />
              </div>
            )}
            <button
              type="button"
              className={`curriculum-section__chevron${collapsed ? ' curriculum-section__chevron--collapsed' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleCollapse() }}
              aria-label={collapsed ? 'Expand section' : 'Collapse section'}
              aria-expanded={!collapsed}
            >
              <ArrowDown2 size={20} color="var(--text-primary)" variant="Linear" />
            </button>
          </>
        )}
      </header>
      )}

      <div
        ref={bodyRef}
        className="curriculum-section__body"
        onDragOver={onBodyDragOver}
        onDrop={onBodyDrop}
      >
        {itemCount > 0 && (
          <div className="curriculum-section__items">{children}</div>
        )}
        {onAddContent && !unsectioned && !hideChrome && (
          <button
            type="button"
            className="curriculum-section__placeholder"
            onClick={onAddContent}
            aria-label="Add content here"
          >
            <Add size={20} color="currentColor" variant="Linear" />
            <span>Add Content Here</span>
          </button>
        )}
      </div>
    </section>
  )
}

export default CurriculumSection
