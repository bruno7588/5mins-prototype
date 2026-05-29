import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
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

/* Keeps children mounted long enough to play the fade/slide. Enter is leisurely
   (delightful), exit is quick so removing the last item/section snaps shut rather
   than lingering. Each timeout must match the matching CSS transition duration. */
const PRESENCE_EXIT_MS = 120

function Presence({ show, className = '', skipExit = false, children }: { show: boolean; className?: string; skipExit?: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(show)
  const [active, setActive] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (show) {
      setExiting(false)
      setMounted(true)
      return
    }
    // skipExit: unmount instantly with no exit phase. Used when collapsing to the empty
    // state — a lingering (even fading) strip would reserve height and make the empty
    // state jump down then up as it finally unmounts.
    if (skipExit) {
      setMounted(false)
      return
    }
    setActive(false)
    setExiting(true)
    const t = setTimeout(() => setMounted(false), PRESENCE_EXIT_MS)
    return () => clearTimeout(t)
  }, [show, skipExit])

  useEffect(() => {
    if (!mounted || !show) return
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [mounted, show])

  if (!mounted) return null
  if (!show && skipExit) return null
  const phase = active ? 'presence--in' : exiting ? 'presence--exit' : 'presence--enter'
  return <div className={`presence ${className} ${phase}`}>{children}</div>
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
  /* Opens the AddContentMenu dropdown anchored to the clicked trigger, scoped to a sectionId. */
  onAddContent?: (sectionId: string, anchor: HTMLElement) => void
  targetSectionId?: string | null
  /* Pixels to shift the body left so it clears an open right-side surface:
     240 for the Add Content panel, 720 for the side drawer, 0 when none. */
  bodyShiftPx?: number
}

function ContentList({
  extraItems = [],
  onDeleteExtra,
  onAddContent,
  targetSectionId,
  bodyShiftPx = 0,
}: ContentListProps) {
  const [itemsByKey, setItemsByKey] = useState<Record<string, ContentItem>>({})
  const [sections, setSections] = useState<Section[]>(() => [makeDefaultSection()])
  // True once the user has taken any sectioning action (renamed a section or added one).
  // Drives flat (chromeless) mode instead of sniffing the default section name.
  const [userHasSectioned, setUserHasSectioned] = useState(false)

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
      // Adding loose content while sectioned, but the Unsectioned bucket doesn't exist
      // yet — create it on top so the content has a home (matches the loose-on-top model).
      if (targetId === UNSECTIONED_ID && !cleaned.some((s) => s.id === UNSECTIONED_ID)) {
        return [
          { id: UNSECTIONED_ID, name: UNSECTIONED_NAME, itemKeys: [...newKeys], collapsed: false },
          ...cleaned,
        ]
      }
      return cleaned.map((s) =>
        s.id === targetId ? { ...s, itemKeys: [...s.itemKeys, ...newKeys] } : s,
      )
    })
  }, [extraItems, targetSectionId])

  // Collapse back to the pristine empty state once the course holds no named sections
  // and no content — e.g. deleting the last section (or removing the last loose item)
  // would otherwise strand a lone, empty "Unsectioned" bucket. useLayoutEffect (not
  // useEffect) so the reset happens before paint — otherwise the intermediate lone
  // bucket flashes and the empty state visibly jumps down then up.
  useLayoutEffect(() => {
    const onlyEmptyUnsectioned = sections.length === 1 && sections[0].id === UNSECTIONED_ID
    if (!onlyEmptyUnsectioned) return
    const totalItems = sections.reduce((n, s) => n + s.itemKeys.length, 0)
    if (totalItems > 0) return
    setSections([makeDefaultSection()])
    setUserHasSectioned(false)
  }, [sections])

  /* Section actions */

  const startCreate = () => {
    // Loose content (a single not-yet-sectioned section) becomes the "Unsectioned" bucket,
    // kept on top, with the new section added below it.
    const fromLoose = sections.length === 1 && sections[0].id !== UNSECTIONED_ID && !userHasSectioned
    const id = newSectionId()
    setUserHasSectioned(true)
    setSections((prev) => {
      if (fromLoose) {
        return [
          { ...prev[0], id: UNSECTIONED_ID, name: UNSECTIONED_NAME },
          { id, name: 'Section 1', itemKeys: [], collapsed: false },
        ]
      }
      const namedCount = prev.filter((s) => s.id !== UNSECTIONED_ID).length
      return [...prev, { id, name: `Section ${namedCount + 1}`, itemKeys: [], collapsed: false }]
    })
    setAutoRenameSectionId(id)
  }

  const renameSection = (id: string, name: string) => {
    setUserHasSectioned(true)
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
    // Removing the last (empty) section returns the page to its flat, unsectioned state
    // rather than instantly recreating a chromed "Section 1".
    const isLastSection = orphanCount === 0 && sections.filter((s) => s.id !== section.id).length === 0
    if (isLastSection) setUserHasSectioned(false)
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

  // Chromeless mode: until the user has done any sectioning, a single section hides its header
  // so the page reads as a flat list. Renaming it or adding a second section reveals the chrome.
  const onlySection = sections.length === 1 ? sections[0] : null
  const isFlatMode = !!onlySection && onlySection.id !== UNSECTIONED_ID && !userHasSectioned
  const showEmptyState = isFlatMode && onlySection!.itemKeys.length === 0

  // "Add Section" from the empty state: reveal chrome on the default section and prompt rename.
  const startSectioning = () => {
    setUserHasSectioned(true)
    if (onlySection) setAutoRenameSectionId(onlySection.id)
    else startCreate()
  }

  /* Course metadata — live counts for the top-of-page chip strip.
     Hidden until the user has added at least one item. */
  // Flat mode is a chromeless single section that reads as a plain list — it has no
  // real "sections", so it must not contribute to the section count (or the badge strip).
  const namedSectionCount = isFlatMode ? 0 : sections.filter((s) => s.id !== UNSECTIONED_ID).length
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
  const showMeta = namedSectionCount + lessonCount + assessmentCount > 0

  const layoutClass = [
    'content-list-layout',
    showEmptyState && 'content-list-layout--empty',
  ]
    .filter(Boolean)
    .join(' ')

  // With a right-side panel/drawer open, the empty placeholder reserves the panel's
  // width and fills the left of the viewport, while populated content stays centered
  // within the remaining (viewport − panel) area — a half-panel-width leftward shift.
  const layoutStyle = bodyShiftPx
    ? showEmptyState
      ? { paddingRight: bodyShiftPx }
      : { transform: `translateX(-${bodyShiftPx / 2}px)` }
    : undefined

  return (
    <div className={layoutClass} style={layoutStyle} onDragOver={(e) => e.preventDefault()}>
      <section className="content-list">
        <Presence show={showMeta} skipExit={showEmptyState} className="presence--meta">
          <div
            className={`course-meta${isFlatMode ? '' : ' course-meta--indented'}`}
            aria-label="Course summary"
          >
            <Presence show={namedSectionCount > 0} className="presence--badge">
              <Badge
                type="informative"
                customIcon={<TextalignJustifyleft size={16} color="currentColor" variant="Linear" />}
                label={`${namedSectionCount} ${namedSectionCount === 1 ? 'section' : 'sections'}`}
              />
            </Presence>
            <Presence show={lessonCount > 0} className="presence--badge">
              <Badge
                type="informative"
                customIcon={<PlayCircle size={16} color="currentColor" variant="Linear" />}
                label={`${lessonCount} ${lessonCount === 1 ? 'lesson' : 'lessons'}`}
              />
            </Presence>
            <Presence show={assessmentCount > 0} className="presence--badge">
              <Badge
                type="informative"
                customIcon={<AssessmentIcon size={16} color="currentColor" />}
                label={`${assessmentCount} ${assessmentCount === 1 ? 'assessment' : 'assessments'}`}
              />
            </Presence>
            <Presence show={totalMinutes > 0} className="presence--badge">
              <Badge
                type="informative"
                customIcon={<Clock size={16} color="currentColor" variant="Linear" />}
                label={`${totalMinutes} ${totalMinutes === 1 ? 'min' : 'mins'}`}
              />
            </Presence>
          </div>
        </Presence>
        {showEmptyState && (
          <div className="course-empty-state" role="status">
            <div className="course-empty-state__icon" aria-hidden="true">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30.0264 14.959C31.4351 8.53403 40.6252 8.56408 42.0879 14.75C42.2332 15.3645 42.2872 16.1879 42.2959 17.1113C42.3051 18.0877 42.2696 18.8822 42.2695 19.7656C42.2694 22.7479 42.2144 25.8067 42.2803 28.8311L42.3037 29.8994L43.3721 29.9307C44.825 29.973 47.3699 29.8739 49.7012 29.8535C50.8923 29.8431 52.0504 29.8528 53.0498 29.9062C54.072 29.9609 54.8432 30.0584 55.3057 30.1943C58.3471 31.0885 59.9004 33.8864 59.8057 36.7646C59.7116 39.6218 57.9953 42.3485 54.6289 43.085C54.2002 43.1787 53.6425 43.2166 53.0049 43.2246C52.3355 43.233 51.7746 43.2109 51.1348 43.2109H46.2217C45.3107 43.2109 44.3012 43.1873 43.3213 43.2305L42.2939 43.2754L42.2471 44.3037C42.2051 45.2352 42.267 46.3009 42.2676 47.0986V53.3672C42.2695 54.8589 42.3914 56.1256 42.1152 57.2529C41.6333 59.2195 39.9736 61.0239 38.0498 61.5713L38.0322 61.5762L38.0146 61.582C36.7503 61.9867 35.4955 61.9595 34.1602 61.5752C31.9465 60.7443 30.9698 59.6041 30.4736 58.2646C29.9299 56.7968 29.915 54.9926 29.916 52.6816C29.9172 49.9379 29.9535 47.1423 29.9062 44.3672L29.8887 43.3203L28.8428 43.2637L28.0654 43.2334C27.2912 43.2142 26.5266 43.2224 25.7998 43.2197H25.7979L21.374 43.2109H21.3721C19.7732 43.2108 18.3792 43.3287 17.1533 42.998C13.9194 42.1254 12.3183 39.2969 12.377 36.4014C12.4357 33.5061 14.1482 30.7646 17.4053 30.0518C17.9189 29.9394 18.6066 29.9025 19.3916 29.9014C19.7762 29.9008 20.166 29.9086 20.5527 29.917C20.9341 29.9253 21.3188 29.9344 21.6709 29.9346L28.793 29.9365H29.9189V28.8115L29.916 17.1533C29.9159 16.2606 29.8841 15.6082 30.0264 14.959Z" fill="#BFC2CC" stroke="#454C5E" strokeWidth="2.25" />
                <path d="M16.6523 33.6586C15.0409 35.1108 15.8465 38.7717 17.0573 38.7717C18.4115 38.7717 17.9643 36.6539 19.8163 35.9451C21.6684 35.2364 22.5332 34.8694 22.5754 34.0973C22.6387 32.8486 17.8101 32.6151 16.6523 33.6586Z" fill="#DFE1E6" />
                <path d="M38.2492 13.4699C38.2949 14.2443 36.3868 14.5745 35.6383 15.3232C34.8863 16.0718 34.4084 17.2681 33.8461 17.2498C33.2839 17.2314 32.8903 16.1268 33.0274 14.8791C33.1644 13.6314 34.1729 12.8828 35.6734 12.7764C37.1739 12.6699 38.2141 12.8828 38.2492 13.4699Z" fill="#DFE1E6" />
              </svg>
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
                onClick={(e) => onAddContent?.(onlySection!.id, e.currentTarget)}
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
                  dragDisabled={sections.length === 1}
                  startInRenameMode={section.id === autoRenameSectionId}
                  isDragging={sectionDragId === section.id}
                  onDragStart={handleSectionDragStart(section.id)}
                  onDragOver={handleSectionDragOver(section.id)}
                  onDragEnd={handleSectionDragEnd}
                  onDrop={handleSectionDrop}
                  onToggleCollapse={() => toggleCollapse(section.id)}
                  onRename={(name) => renameSection(section.id, name)}
                  onDelete={() => deleteSection(section)}
                  onAddContent={onAddContent ? (anchor) => onAddContent(section.id, anchor) : undefined}
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
          <div className={`curriculum-bottom-actions${isFlatMode ? ' curriculum-bottom-actions--flush' : ''}`}>
            {/* Always available so admins can add content outside any section. In flat
               mode it targets the single section; once sectioned it targets the
               Unsectioned (loose) bucket, which is created on demand if absent. */}
            <button
              type="button"
              className="curriculum-add-content"
              onClick={(e) => onAddContent?.(isFlatMode ? onlySection!.id : UNSECTIONED_ID, e.currentTarget)}
            >
              <Add size={20} color="currentColor" variant="Linear" />
              <span>Add Content</span>
            </button>
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
