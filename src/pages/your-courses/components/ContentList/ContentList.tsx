import { Fragment, useEffect, useRef, useState } from 'react'
import { Add, Clock, Edit2, PlayCircle, TextalignJustifyleft, Trash } from 'iconsax-react'
import AssessmentIcon from '../../../../components/icons/AssessmentIcon'
import Badge from '../../../../components/Badge/Badge'
import ToastContainer, { useToast } from '../../../../components/Toast/Toast'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import CurriculumSection from './CurriculumSection'
import './ContentList.css'

/* Parse "3m 45s" / "4min" / "4 min" / "20 mins" patterns into minutes (float). */
function parseDurationMinutes(metadata: string): number {
  const msMatch = metadata.match(/(\d+)\s*m\s*(\d+)\s*s/)
  if (msMatch) return Number(msMatch[1]) + Number(msMatch[2]) / 60
  const minMatch = metadata.match(/(\d+)\s*min/)
  if (minMatch) return Number(minMatch[1])
  return 0
}

export interface ContentItem {
  id: number
  type: 'Lesson' | 'Assessment' | 'SCORM' | 'LibraryLesson'
  title: string
  metadata: string
  thumbnail: string
  thumbColor?: string
  showEditIcon?: boolean
}

/* Sections-only model — every item lives in a section. A default "Section 1" is auto-created
   so the user never starts in an empty/ambiguous state. When only that default section exists,
   the header chrome is hidden so it visually behaves like a flat list. */
interface Section {
  id: string
  name: string
  itemKeys: string[]
  collapsed: boolean
}

const DEFAULT_SECTION_NAME = 'Section 1'
const UNSECTIONED_ID = 's-unsectioned'
const UNSECTIONED_NAME = 'Unsectioned'

function itemKey(item: ContentItem) {
  return `${item.type}-${item.id}`
}

const newSectionId = () => `s-${crypto.randomUUID()}`
const makeDefaultSection = (): Section => ({
  id: newSectionId(),
  name: DEFAULT_SECTION_NAME,
  itemKeys: [],
  collapsed: false,
})

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
  /* Opens the AddContentDrawer (slide-in side panel) scoped to a sectionId. */
  onAddContent?: (sectionId: string) => void
  targetSectionId?: string | null
}

function ContentList({
  extraItems = [],
  onDeleteExtra,
  onAddContent,
  targetSectionId,
}: ContentListProps) {
  const [itemsByKey, setItemsByKey] = useState<Record<string, ContentItem>>({})
  const [sections, setSections] = useState<Section[]>(() => [makeDefaultSection()])

  // Item drag — live-reorders within the same section; cross-section commits on drop
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ itemKey: string; position: 'above' | 'below' } | null>(null)
  const [containerDropTarget, setContainerDropTarget] = useState<string | null>(null) // sectionId

  // Section drag (reorder sections)
  const [sectionDragId, setSectionDragId] = useState<string | null>(null)

  const [autoRenameSectionId, setAutoRenameSectionId] = useState<string | null>(null)

  const { toasts, show: showToast } = useToast()
  const prevExtraRef = useRef<string>(extraItems.map(itemKey).join(','))

  // Sync extraItems into sections. New items go to targetSectionId if set; otherwise the first section.
  useEffect(() => {
    const extraKey = extraItems.map(itemKey).join(',')
    if (extraKey === prevExtraRef.current) return
    prevExtraRef.current = extraKey

    const extraSet = new Set(extraItems.map(itemKey))
    const existingKeys = new Set<string>()
    for (const s of sections) s.itemKeys.forEach((k) => existingKeys.add(k))
    const newKeys = extraItems.map(itemKey).filter((k) => !existingKeys.has(k))

    // SCORM and Library lessons are extras-managed — drop them when they leave extras.
    const shouldKeep = (k: string) => {
      if (k.startsWith('SCORM-') || k.startsWith('LibraryLesson-')) return extraSet.has(k)
      return true
    }

    setItemsByKey((prev) => {
      const next: Record<string, ContentItem> = { ...prev }
      for (const it of extraItems) next[itemKey(it)] = it
      for (const k of Object.keys(next)) {
        const t = next[k]?.type
        if ((t === 'SCORM' || t === 'LibraryLesson') && !extraSet.has(k)) delete next[k]
      }
      return next
    })

    setSections((prev) => {
      const cleaned = prev.map((s) => ({ ...s, itemKeys: s.itemKeys.filter(shouldKeep) }))
      if (newKeys.length === 0) return cleaned
      const targetId = targetSectionId ?? cleaned[cleaned.length - 1]?.id
      if (!targetId) return cleaned
      return cleaned.map((s) =>
        s.id === targetId ? { ...s, itemKeys: [...s.itemKeys, ...newKeys] } : s,
      )
    })
  }, [extraItems, targetSectionId])

  /* Section actions */

  const startCreate = () => {
    const id = newSectionId()
    setSections((prev) => [...prev, { id, name: `Section ${prev.length + 1}`, itemKeys: [], collapsed: false }])
    setAutoRenameSectionId(id)
  }

  const renameSection = (id: string, name: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
    if (autoRenameSectionId === id) {
      setAutoRenameSectionId(null)
    } else {
      showToast('success', 'Section renamed')
    }
  }

  const toggleCollapse = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, collapsed: !s.collapsed } : s)))
  }

  /* Section delete: never destructive. Empty sections are removed outright; sections with
     content lose their wrapper but their items move to a special "Unsectioned" bucket. */
  const deleteSection = (section: Section) => {
    if (section.id === UNSECTIONED_ID) return
    const orphanCount = section.itemKeys.length
    setSections((prev) => {
      const without = prev.filter((s) => s.id !== section.id)
      if (orphanCount === 0) {
        return without.length === 0 ? [makeDefaultSection()] : without
      }
      const hasUnsectioned = without.some((s) => s.id === UNSECTIONED_ID)
      if (hasUnsectioned) {
        return without.map((s) =>
          s.id === UNSECTIONED_ID ? { ...s, itemKeys: [...s.itemKeys, ...section.itemKeys] } : s,
        )
      }
      return [
        ...without,
        { id: UNSECTIONED_ID, name: UNSECTIONED_NAME, itemKeys: [...section.itemKeys], collapsed: false },
      ]
    })
    if (orphanCount === 0) {
      showToast('success', `Section "${section.name}" removed`)
    } else {
      showToast(
        'success',
        `Section "${section.name}" removed · ${orphanCount} item${orphanCount === 1 ? '' : 's'} moved to Unsectioned`,
      )
    }
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

  /* Drag-and-drop */

  const findSectionId = (key: string): string | null => {
    for (const s of sections) if (s.itemKeys.includes(key)) return s.id
    return null
  }

  const handleDragStart = (key: string) => () => setDragKey(key)

  const insertAt = (list: string[], anchor: string, position: 'above' | 'below', key: string) => {
    const idx = list.indexOf(anchor)
    if (idx === -1) return [...list, key]
    const at = position === 'above' ? idx : idx + 1
    return [...list.slice(0, at), key, ...list.slice(at)]
  }

  const handleDragOver = (overKey: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!dragKey || dragKey === overKey) return
    const fromId = findSectionId(dragKey)
    const overId = findSectionId(overKey)
    if (!fromId || !overId) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position: 'above' | 'below' = e.clientY < midY ? 'above' : 'below'

    if (fromId === overId) {
      // Same section — live reorder; the dragged DOM node stays mounted, drag keeps going.
      const key = dragKey
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== fromId) return s
          if (!s.itemKeys.includes(key)) return s
          const without = s.itemKeys.filter((k) => k !== key)
          if (!without.includes(overKey)) return s
          return { ...s, itemKeys: insertAt(without, overKey, position, key) }
        }),
      )
      setDropTarget(null)
      setContainerDropTarget(null)
    } else {
      // Cross-section — defer to drop; mutating now would unmount the dragged node and cancel the drag.
      setDropTarget({ itemKey: overKey, position })
      setContainerDropTarget(null)
    }
  }

  const handleDragEnd = () => {
    setDragKey(null)
    setDropTarget(null)
    setContainerDropTarget(null)
  }

  const handleContainerDragOver = (sectionId: string) => (e: React.DragEvent) => {
    if (!dragKey) return
    e.preventDefault()
    const fromId = findSectionId(dragKey)
    if (!fromId || fromId === sectionId) return
    setContainerDropTarget(sectionId)
    setDropTarget(null)
  }

  const commitCrossSectionMove = () => {
    if (!dragKey) return
    const fromId = findSectionId(dragKey)
    if (!fromId) return
    const key = dragKey

    if (dropTarget) {
      const overId = findSectionId(dropTarget.itemKey)
      if (!overId || fromId === overId) return
      const target = dropTarget
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === fromId) return { ...s, itemKeys: s.itemKeys.filter((k) => k !== key) }
          if (s.id === overId) return { ...s, itemKeys: insertAt(s.itemKeys, target.itemKey, target.position, key) }
          return s
        }),
      )
      return
    }

    if (containerDropTarget && containerDropTarget !== fromId) {
      const destId = containerDropTarget
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === fromId) return { ...s, itemKeys: s.itemKeys.filter((k) => k !== key) }
          if (s.id === destId) return { ...s, itemKeys: [...s.itemKeys, key] }
          return s
        }),
      )
    }
  }

  const handleContainerDrop = (_sectionId: string) => () => {
    commitCrossSectionMove()
    handleDragEnd()
  }

  const handleDrop = () => {
    commitCrossSectionMove()
    handleDragEnd()
  }

  /* Section reorder */

  const handleSectionDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    setSectionDragId(id)
  }

  const handleSectionDragOver = (overId: string) => (e: React.DragEvent) => {
    if (!sectionDragId || sectionDragId === overId) return
    e.preventDefault()
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position: 'above' | 'below' = e.clientY < midY ? 'above' : 'below'

    setSections((prev) => {
      const dragIdx = prev.findIndex((s) => s.id === sectionDragId)
      const overIdx = prev.findIndex((s) => s.id === overId)
      if (dragIdx === -1 || overIdx === -1) return prev
      const next = [...prev]
      const [dragged] = next.splice(dragIdx, 1)
      if (!dragged) return prev
      const newOverIdx = next.findIndex((s) => s.id === overId)
      const at = position === 'above' ? newOverIdx : newOverIdx + 1
      next.splice(at, 0, dragged)
      return next
    })
  }

  const handleSectionDragEnd = () => setSectionDragId(null)
  const handleSectionDrop = () => handleSectionDragEnd()

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

  // Chromeless mode: when the only section is the untitled default, hide its header so the
  // page reads as a flat list. Renaming or adding a second section reveals the chrome.
  // While autoRename is active on that section, force chrome so the rename input is visible.
  const onlySection = sections.length === 1 ? sections[0] : null
  const isFlatMode =
    !!onlySection &&
    onlySection.name === DEFAULT_SECTION_NAME &&
    autoRenameSectionId !== onlySection.id
  const showEmptyState = isFlatMode && onlySection!.itemKeys.length === 0

  // "Add Section" from the empty state: reveal chrome on the default section and prompt rename.
  const startSectioning = () => {
    if (onlySection) setAutoRenameSectionId(onlySection.id)
    else startCreate()
  }

  /* Course metadata — live counts for the top-of-page chip strip.
     Hidden until the user has added at least one item. */
  const namedSectionCount = sections.filter((s) => s.id !== UNSECTIONED_ID).length
  const allItems = sections
    .flatMap((s) => s.itemKeys.map((k) => itemsByKey[k]))
    .filter((it): it is ContentItem => !!it)
  const lessonCount = allItems.filter((it) => it.type !== 'Assessment').length
  const assessmentCount = allItems.filter((it) => it.type === 'Assessment').length
  const totalMinutes = Math.round(
    allItems
      .filter((it) => it.type !== 'Assessment')
      .reduce((sum, it) => sum + parseDurationMinutes(it.metadata), 0),
  )
  const showMeta = lessonCount + assessmentCount > 0

  return (
    <div
      className={`content-list-layout${showEmptyState ? ' content-list-layout--empty' : ''}`}
      onDragOver={(e) => e.preventDefault()}
    >
      <section className="content-list">
        {showMeta && (
          <div className="course-meta" aria-label="Course summary">
            <Badge
              type="informative"
              customIcon={<TextalignJustifyleft size={16} color="currentColor" variant="Linear" />}
              label={`${namedSectionCount} ${namedSectionCount === 1 ? 'section' : 'sections'}`}
            />
            <Badge
              type="informative"
              customIcon={<PlayCircle size={16} color="currentColor" variant="Linear" />}
              label={`${lessonCount} ${lessonCount === 1 ? 'lesson' : 'lessons'}`}
            />
            <Badge
              type="informative"
              customIcon={<AssessmentIcon size={16} color="currentColor" />}
              label={`${assessmentCount} ${assessmentCount === 1 ? 'assessment' : 'assessments'}`}
            />
            {totalMinutes > 0 && (
              <Badge
                type="informative"
                customIcon={<Clock size={16} color="currentColor" variant="Linear" />}
                label={`${totalMinutes} ${totalMinutes === 1 ? 'min' : 'mins'}`}
              />
            )}
          </div>
        )}
        {showEmptyState && (
          <div className="course-empty-state" role="status">
            <div className="course-empty-state__icon" aria-hidden="true">
              <Add size={72} color="var(--text-tertiary)" variant="Linear" />
            </div>
            <div className="course-empty-state__info">
              <h2 className="course-empty-state__title">Add content to your course</h2>
              <p className="course-empty-state__body">
                Add content, upload resources, and create assessments, or start by creating a section to organise what's coming.
              </p>
            </div>
            <div className="course-empty-state__cta">
              <button
                type="button"
                className="course-empty-state__btn course-empty-state__btn--outlined"
                onClick={startSectioning}
              >
                Start With A Section
              </button>
              <button
                type="button"
                className="course-empty-state__btn course-empty-state__btn--filled"
                onClick={() => onAddContent?.(onlySection!.id)}
              >
                <span>Add Content</span>
                <Add size={20} color="currentColor" variant="Linear" />
              </button>
            </div>
          </div>
        )}

        {!showEmptyState && sections.map((section) => {
          const isUnsectioned = section.id === UNSECTIONED_ID
          return (
            <Fragment key={section.id}>
              <div id={`section-${section.id}`}>
                <CurriculumSection
                  section={{ id: section.id, name: section.name, items: [], collapsed: section.collapsed }}
                  itemCount={section.itemKeys.length}
                  summary={buildSummary(section.itemKeys)}
                  hideChrome={isFlatMode}
                  hideDragHandle={isUnsectioned}
                  startInRenameMode={section.id === autoRenameSectionId}
                  isDragging={sectionDragId === section.id}
                  onDragStart={handleSectionDragStart(section.id)}
                  onDragOver={handleSectionDragOver(section.id)}
                  onDragEnd={handleSectionDragEnd}
                  onDrop={handleSectionDrop}
                  onToggleCollapse={() => toggleCollapse(section.id)}
                  onRename={(name) => renameSection(section.id, name)}
                  onDelete={() => deleteSection(section)}
                  onAddContent={onAddContent ? () => onAddContent(section.id) : undefined}
                  canRename={!isUnsectioned}
                  canDelete={!isUnsectioned}
                  unsectioned={isUnsectioned}
                  destinationActive={containerDropTarget === section.id}
                  onBodyDragOver={handleContainerDragOver(section.id)}
                  onBodyDrop={handleContainerDrop(section.id)}
                >
                  {section.itemKeys.map((key) => {
                    const item = itemsByKey[key]
                    if (!item) return null
                    return (
                      <div key={key} id={`item-${key}`}>
                        <ContentCard
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
                      </div>
                    )
                  })}
                </CurriculumSection>
              </div>
            </Fragment>
          )
        })}

        {!showEmptyState && (
          <div className="curriculum-bottom-actions">
            {sections[sections.length - 1]?.id === UNSECTIONED_ID && (
              <button
                type="button"
                className="curriculum-add-content"
                onClick={() => onAddContent?.(UNSECTIONED_ID)}
              >
                <Add size={20} color="currentColor" variant="Linear" />
                <span>Add Content</span>
              </button>
            )}
            <button type="button" className="curriculum-add-section" onClick={startCreate}>
              <TextalignJustifyleft size={20} color="currentColor" variant="Linear" />
              <span>Add Section</span>
            </button>
          </div>
        )}

        <ToastContainer toasts={toasts} />
      </section>
    </div>
  )
}

export default ContentList
