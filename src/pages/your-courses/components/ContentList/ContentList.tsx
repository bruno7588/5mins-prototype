import { useEffect, useRef, useState } from 'react'
import { Add, Danger, Edit2, Trash } from 'iconsax-react'
import ToastContainer, { useToast } from '../../../../components/Toast/Toast'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import CurriculumSection from './CurriculumSection'
import './ContentList.css'

export interface ContentItem {
  id: number
  type: 'Lesson' | 'Assessment' | 'SCORM' | 'LibraryLesson'
  title: string
  metadata: string
  thumbnail: string
  thumbColor?: string
  showEditIcon?: boolean
}

interface Section {
  id: string
  name: string
  itemKeys: string[]
  collapsed: boolean
}

const defaultItems: ContentItem[] = [
  {
    id: 1,
    type: 'Lesson',
    title: '50 free Tools and resources that everyone should know',
    metadata: 'Lesson · Instructor name · 4min',
    thumbnail: '',
  },
  {
    id: 2,
    type: 'Lesson',
    title: '50 free Tools and resources that everyone should know',
    metadata: 'Lesson · Instructor name · 4min',
    thumbnail: '',
  },
  {
    id: 3,
    type: 'Assessment',
    title: '50 free Tools and resources that everyone should know',
    metadata: 'Assessment · Type of assessment',
    thumbnail: '',
    showEditIcon: true,
  },
]

function itemKey(item: ContentItem) {
  return `${item.type}-${item.id}`
}

let nextSectionId = 1
const newSectionId = () => `s-${nextSectionId++}`

function ContentCardThumb({ item }: { item: ContentItem }) {
  const isAssessment = item.type === 'Assessment'
  const isScorm = item.type === 'SCORM'
  return (
    <div className={`content-card-thumb ${isAssessment ? 'content-card-thumb--assessment' : ''}`}>
      {isAssessment ? (
        <svg className="content-card-thumb-illustration" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M28.3224 32.2734H28.3254C28.3254 32.2734 28.3018 32.2837 28.2665 32.294C28.0855 32.3723 27.9046 32.4446 27.7221 32.5125C25.9345 33.2489 20.2744 35.4389 17.8836 38.9896L10.8125 34.1978C13.0665 30.8507 13.0106 25.2694 12.9724 23.0291C12.9488 22.7 12.9356 22.3695 12.9385 22.0374C12.9385 22.0212 12.9385 22.0079 12.9385 22.0079H12.9415C12.968 19.93 13.5785 17.8359 14.8262 15.9838C18.2234 10.9337 25.0576 9.60699 30.0924 13.0175C32.2199 14.4593 33.6853 16.518 34.4106 18.7981C35.3993 21.9061 35.0109 25.4214 33.0497 28.3345C31.8344 30.1394 30.1762 31.4647 28.3224 32.2749V32.2734Z" fill="#FFB83D"/>
          <path d="M16.3221 40.4059L9.75195 35.9541L9.14909 36.8493L15.7193 41.3011L16.3221 40.4059Z" fill="#522A75"/>
          <path d="M14.4559 43.1769L7.88574 38.7251L7.58431 39.1727L14.1545 43.6245L14.4559 43.1769Z" fill="#522A75"/>
          <path d="M8.88958 44.6982L8.55266 44.4695C6.83124 43.3036 6.39868 40.9276 7.58601 39.1641L14.1568 43.6165C12.9695 45.38 10.611 45.8641 8.88958 44.6982Z" fill="#522A75"/>
        </svg>
      ) : isScorm && item.thumbColor ? (
        <div className="content-card-thumb-photo" style={{ background: item.thumbColor }} />
      ) : (
        <div className="content-card-thumb-photo">
          <div className="content-card-thumb-tag">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.75C4.1 1.75 1.75 4.1 1.75 7C1.75 9.9 4.1 12.25 7 12.25C9.9 12.25 12.25 9.9 12.25 7C12.25 4.1 9.9 1.75 7 1.75ZM9.1 7.35L6.3 9.1C6.05 9.25 5.75 9.075 5.75 8.75V5.25C5.75 4.925 6.05 4.75 6.3 4.9L9.1 6.65C9.35 6.8 9.35 7.2 9.1 7.35Z" fill="var(--neutral-800)" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

interface ContentCardProps {
  item: ContentItem
  onDelete?: () => void
  isDragging: boolean
  dropAbove: boolean
  dropBelow: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnd: () => void
  onDrop: () => void
}

const REMOVE_LABEL: Record<ContentItem['type'], string> = {
  Lesson: 'Remove lesson',
  LibraryLesson: 'Remove lesson',
  Assessment: 'Remove assessment',
  SCORM: 'Remove SCORM',
}

function ContentCard({
  item, onDelete, isDragging, dropAbove, dropBelow,
  onDragStart, onDragOver, onDragEnd, onDrop,
}: ContentCardProps) {
  const badgeLabel = item.type === 'LibraryLesson' ? 'Lesson' : item.type
  const removeLabel = REMOVE_LABEL[item.type]
  const containerClass = [
    'content-item-container',
    isDragging && 'content-item-container--dragging',
    dropAbove && 'content-item-container--drop-above',
    dropBelow && 'content-item-container--drop-below',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={containerClass}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <div className="content-card-drag" aria-label="Drag to reorder lesson">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="7" cy="5" r="1.5" fill="var(--neutral-300)" />
          <circle cx="13" cy="5" r="1.5" fill="var(--neutral-300)" />
          <circle cx="7" cy="10" r="1.5" fill="var(--neutral-300)" />
          <circle cx="13" cy="10" r="1.5" fill="var(--neutral-300)" />
          <circle cx="7" cy="15" r="1.5" fill="var(--neutral-300)" />
          <circle cx="13" cy="15" r="1.5" fill="var(--neutral-300)" />
        </svg>
      </div>
      <div className="content-card">
        <ContentCardThumb item={item} />
        <div className="content-card-info">
          <div className="content-card-title-row">
            <h4 className="content-card-title">{item.title}</h4>
            <span className="content-card-badge">{badgeLabel}</span>
          </div>
          <div className="content-card-meta">
            <span>{item.metadata}</span>
            {item.showEditIcon && (
              <Edit2 size={16} color="var(--neutral-500)" variant="Linear" />
            )}
          </div>
        </div>
      </div>
      <Tooltip text={removeLabel} position="Top" alignment="End" icon={false} className="content-card-trash-tooltip">
        <button
          type="button"
          className="content-card-trash"
          aria-label={removeLabel}
          onClick={onDelete}
        >
          <Trash size={20} color="currentColor" variant="Linear" />
        </button>
      </Tooltip>
    </div>
  )
}

interface ContentListProps {
  extraItems?: ContentItem[]
  onDeleteExtra?: (id: number) => void
  onAddContent?: () => void
}

function ContentList({ extraItems = [], onDeleteExtra, onAddContent }: ContentListProps) {
  // Item registry — itemKey → ContentItem
  const [itemsByKey, setItemsByKey] = useState<Record<string, ContentItem>>(() => {
    const map: Record<string, ContentItem> = {}
    for (const it of defaultItems) map[itemKey(it)] = it
    return map
  })

  // Sections
  const [sections, setSections] = useState<Section[]>(() => [
    {
      id: newSectionId(),
      name: 'Section 1',
      itemKeys: defaultItems.map(itemKey),
      collapsed: false,
    },
  ])

  // Item drag state
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ itemKey: string; position: 'above' | 'below' } | null>(null)

  // Section drag state
  const [sectionDragId, setSectionDragId] = useState<string | null>(null)
  const [sectionDropTarget, setSectionDropTarget] = useState<{ id: string; position: 'above' | 'below' } | null>(null)

  // Tracks the most-recently-created section so it can open in rename mode
  const [autoRenameSectionId, setAutoRenameSectionId] = useState<string | null>(null)

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<Section | null>(null)

  // Toast
  const { toasts, show: showToast } = useToast()

  const prevExtraRef = useRef<string>(extraItems.map(itemKey).join(','))

  // Sync extraItems into items + append new ones to the last section
  useEffect(() => {
    const extraKey = extraItems.map(itemKey).join(',')
    if (extraKey === prevExtraRef.current) return
    prevExtraRef.current = extraKey

    setItemsByKey((prev) => {
      const next: Record<string, ContentItem> = { ...prev }
      for (const it of extraItems) next[itemKey(it)] = it
      // Remove SCORM items no longer in extras
      const extraSet = new Set(extraItems.map(itemKey))
      for (const k of Object.keys(next)) {
        if (next[k]?.type === 'SCORM' && !extraSet.has(k)) delete next[k]
      }
      return next
    })

    setSections((prev) => {
      const existingKeys = new Set(prev.flatMap((s) => s.itemKeys))
      const extraSet = new Set(extraItems.map(itemKey))
      const newKeys = extraItems.map(itemKey).filter((k) => !existingKeys.has(k))
      // SCORM and Library lessons are extras-managed — drop them when they leave extras.
      const shouldKeep = (k: string) => {
        if (k.startsWith('SCORM-') || k.startsWith('LibraryLesson-')) return extraSet.has(k)
        return true
      }
      const cleaned = prev.map((s) => ({
        ...s,
        itemKeys: s.itemKeys.filter(shouldKeep),
      }))
      if (newKeys.length === 0) return cleaned
      // Append new keys to the last section (or create one if none exist).
      if (cleaned.length === 0) {
        return [{ id: newSectionId(), name: 'Section 1', itemKeys: newKeys, collapsed: false }]
      }
      const lastIdx = cleaned.length - 1
      const lastSection = cleaned[lastIdx]
      if (!lastSection) return cleaned
      return [
        ...cleaned.slice(0, lastIdx),
        { ...lastSection, itemKeys: [...lastSection.itemKeys, ...newKeys] },
      ]
    })
  }, [extraItems])

  /* Section actions */

  const startCreate = () => {
    const id = newSectionId()
    const name = `Section ${sections.length + 1}`
    setSections((prev) => [...prev, { id, name, itemKeys: [], collapsed: false }])
    setAutoRenameSectionId(id)
  }

  const renameSection = (id: string, name: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
    if (autoRenameSectionId === id) {
      // Quietly accept the rename if it came from the auto-rename flow on creation
      setAutoRenameSectionId(null)
    } else {
      showToast('success', 'Section renamed')
    }
  }

  const toggleCollapse = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, collapsed: !s.collapsed } : s)))
  }

  const deleteSection = (section: Section) => {
    setSections((prev) => prev.filter((s) => s.id !== section.id))
    // Clean items registry — but defer extras cleanup to parent
    setItemsByKey((prev) => {
      const next = { ...prev }
      for (const k of section.itemKeys) {
        const item = next[k]
        if (item && (item.type === 'SCORM' || item.type === 'Assessment' || item.type === 'LibraryLesson')) {
          onDeleteExtra?.(item.id)
        }
        delete next[k]
      }
      return next
    })
    showToast('success', `Section "${section.name}" removed`)
    setConfirmDelete(null)
  }

  const deleteItem = (key: string) => {
    const item = itemsByKey[key]
    if (item && (item.type === 'SCORM' || item.type === 'Assessment' || item.type === 'LibraryLesson')) {
      onDeleteExtra?.(item.id)
    }
    setSections((prev) => prev.map((s) => ({ ...s, itemKeys: s.itemKeys.filter((k) => k !== key) })))
    setItemsByKey((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  /* Drag-and-drop — items within their parent section only (v1) */

  const handleDragStart = (key: string) => () => {
    setDragKey(key)
  }

  const findSection = (key: string) =>
    sections.find((s) => s.itemKeys.includes(key))

  const handleDragOver = (overKey: string) => (e: React.DragEvent) => {
    e.preventDefault()
    if (!dragKey || dragKey === overKey) {
      setDropTarget(null)
      return
    }
    // Only allow drop within the same section in v1
    const fromSection = findSection(dragKey)
    const overSection = findSection(overKey)
    if (!fromSection || !overSection || fromSection.id !== overSection.id) {
      setDropTarget(null)
      return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position: 'above' | 'below' = e.clientY < midY ? 'above' : 'below'
    setDropTarget({ itemKey: overKey, position })
  }

  const handleDragEnd = () => {
    setDragKey(null)
    setDropTarget(null)
  }

  const handleDrop = () => {
    if (!dragKey || !dropTarget) {
      handleDragEnd()
      return
    }
    setSections((prev) =>
      prev.map((s) => {
        if (!s.itemKeys.includes(dragKey)) return s
        const without = s.itemKeys.filter((k) => k !== dragKey)
        const targetIdx = without.indexOf(dropTarget.itemKey)
        if (targetIdx === -1) return s
        const insertAt = dropTarget.position === 'above' ? targetIdx : targetIdx + 1
        return {
          ...s,
          itemKeys: [...without.slice(0, insertAt), dragKey, ...without.slice(insertAt)],
        }
      }),
    )
    handleDragEnd()
  }

  /* Section drag-and-drop */

  const handleSectionDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    setSectionDragId(id)
  }

  const handleSectionDragOver = (overId: string) => (e: React.DragEvent) => {
    if (!sectionDragId) return
    e.preventDefault()
    e.stopPropagation()
    if (sectionDragId === overId) {
      setSectionDropTarget(null)
      return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position: 'above' | 'below' = e.clientY < midY ? 'above' : 'below'
    setSectionDropTarget({ id: overId, position })
  }

  const handleSectionDragEnd = () => {
    setSectionDragId(null)
    setSectionDropTarget(null)
  }

  const handleSectionDrop = () => {
    if (!sectionDragId || !sectionDropTarget) {
      handleSectionDragEnd()
      return
    }
    setSections((prev) => {
      const dragIdx = prev.findIndex((s) => s.id === sectionDragId)
      const targetIdx = prev.findIndex((s) => s.id === sectionDropTarget.id)
      if (dragIdx === -1 || targetIdx === -1) return prev
      const next = [...prev]
      const [dragged] = next.splice(dragIdx, 1)
      if (!dragged) return prev
      const insertBase = next.findIndex((s) => s.id === sectionDropTarget.id)
      const insertAt = sectionDropTarget.position === 'above' ? insertBase : insertBase + 1
      next.splice(insertAt, 0, dragged)
      return next
    })
    handleSectionDragEnd()
  }

  const isEmpty = sections.length === 0

  const buildSummary = (itemKeys: string[]) => {
    let lessons = 0, assessments = 0, scorm = 0
    for (const k of itemKeys) {
      const item = itemsByKey[k]
      if (!item) continue
      if (item.type === 'Lesson' || item.type === 'LibraryLesson') lessons++
      else if (item.type === 'Assessment') assessments++
      else if (item.type === 'SCORM') scorm++
    }
    const parts: string[] = []
    if (lessons > 0) parts.push(`${lessons} lesson${lessons === 1 ? '' : 's'}`)
    if (assessments > 0) parts.push(`${assessments} assessment${assessments === 1 ? '' : 's'}`)
    if (scorm > 0) parts.push(`${scorm} SCORM`)
    return parts.length ? parts.join(' · ') : 'No content'
  }

  return (
    <section className="content-list" onDragOver={(e) => e.preventDefault()}>
      {isEmpty && (
        <div className="course-empty-state" role="status">
          <div className="course-empty-state__icon" aria-hidden="true">
            <Add size={72} color="var(--text-tertiary)" variant="Linear" />
          </div>
          <div className="course-empty-state__info">
            <h2 className="course-empty-state__title">Add content to your course</h2>
            <p className="course-empty-state__body">
              Use the side menu to add content, upload resources, and create assessments
            </p>
          </div>
          <div className="course-empty-state__cta">
            <button
              type="button"
              className="course-empty-state__btn course-empty-state__btn--outlined"
              onClick={startCreate}
            >
              Add Section
            </button>
            <button
              type="button"
              className="course-empty-state__btn course-empty-state__btn--filled"
              onClick={onAddContent ?? startCreate}
            >
              <span>Add Content</span>
              <Add size={20} color="currentColor" variant="Linear" />
            </button>
          </div>
        </div>
      )}

      {sections.map((section) => (
        <CurriculumSection
          key={section.id}
          section={{
            id: section.id,
            name: section.name,
            items: [],
            collapsed: section.collapsed,
          }}
          itemCount={section.itemKeys.length}
          summary={buildSummary(section.itemKeys)}
          hideDragHandle={sections.length === 1}
          startInRenameMode={section.id === autoRenameSectionId}
          isDragging={sectionDragId === section.id}
          dropAbove={sectionDropTarget?.id === section.id && sectionDropTarget.position === 'above'}
          dropBelow={sectionDropTarget?.id === section.id && sectionDropTarget.position === 'below'}
          onDragStart={handleSectionDragStart(section.id)}
          onDragOver={handleSectionDragOver(section.id)}
          onDragEnd={handleSectionDragEnd}
          onDrop={handleSectionDrop}
          onToggleCollapse={() => toggleCollapse(section.id)}
          onRename={(name) => renameSection(section.id, name)}
          onDelete={() => setConfirmDelete(section)}
          onAddLesson={onAddContent}
        >
          {section.itemKeys.map((key) => {
            const item = itemsByKey[key]
            if (!item) return null
            return (
              <ContentCard
                key={key}
                item={item}
                onDelete={() => deleteItem(key)}
                isDragging={dragKey === key}
                dropAbove={dropTarget?.itemKey === key && dropTarget.position === 'above'}
                dropBelow={dropTarget?.itemKey === key && dropTarget.position === 'below'}
                onDragStart={handleDragStart(key)}
                onDragOver={handleDragOver(key)}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              />
            )
          })}
        </CurriculumSection>
      ))}

      {sections.length > 0 && (
        <button type="button" className="curriculum-add-section" onClick={startCreate}>
          <span>Add Section</span>
          <Add size={20} color="currentColor" variant="Linear" />
        </button>
      )}

      {confirmDelete && (
        <>
          <div className="overlay-backdrop" aria-hidden="true" />
          <div
            className="dialog dialog--error"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-section-title"
          >
            <div className="dialog__icon" aria-hidden="true">
              <Danger size={72} color="var(--danger-500)" variant="Linear" />
            </div>
            <div className="dialog__info">
              <h2 id="delete-section-title" className="dialog__title">
                Remove section?
              </h2>
              <p className="dialog__description">
                This will remove <strong>{confirmDelete.name}</strong>
                {confirmDelete.itemKeys.length > 0
                  ? ` and its ${confirmDelete.itemKeys.length} lesson${confirmDelete.itemKeys.length === 1 ? '' : 's'}`
                  : ''}
                . This cannot be undone.
              </p>
            </div>
            <div className="dialog__cta">
              <button
                type="button"
                className="dialog__btn dialog__btn--outlined-error"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dialog__btn dialog__btn--filled-error"
                onClick={() => deleteSection(confirmDelete)}
              >
                Remove Section
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer toasts={toasts} />
    </section>
  )
}

export default ContentList
