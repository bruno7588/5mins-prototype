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

/* Unified blocks model — sections and loose items live in a single ordered list.
   New additions append to the end, so "the bottom" is always whatever was added last. */
interface SectionBlock {
  kind: 'section'
  id: string
  name: string
  itemKeys: string[]
  collapsed: boolean
}

interface LooseBlock {
  kind: 'loose'
  itemKey: string
}

type Block = SectionBlock | LooseBlock

function itemKey(item: ContentItem) {
  return `${item.type}-${item.id}`
}

const newSectionId = () => `s-${crypto.randomUUID()}`

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
  onAddContent?: (sectionId?: string) => void
  targetSectionId?: string | null
}

function ContentList({ extraItems = [], onDeleteExtra, onAddContent, targetSectionId }: ContentListProps) {
  // Item registry — itemKey → ContentItem
  const [itemsByKey, setItemsByKey] = useState<Record<string, ContentItem>>({})

  // Unified blocks: sections + loose items in a single ordered list
  const [blocks, setBlocks] = useState<Block[]>([])

  // Item drag state — same-container reorders mutate live; cross-container moves track a drop target and commit on drop
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ itemKey: string; position: 'above' | 'below' } | null>(null)
  const [containerDropTarget, setContainerDropTarget] = useState<
    { kind: 'section'; id: string } | { kind: 'loose' } | null
  >(null)
  // For dropping an item as a LooseBlock adjacent to a section (above/below the section card as a whole)
  const [blockDropTarget, setBlockDropTarget] = useState<
    { sectionId: string; position: 'above' | 'below' } | null
  >(null)

  // Section drag state
  const [sectionDragId, setSectionDragId] = useState<string | null>(null)

  // Tracks the most-recently-created section so it can open in rename mode
  const [autoRenameSectionId, setAutoRenameSectionId] = useState<string | null>(null)

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<SectionBlock | null>(null)

  // Toast
  const { toasts, show: showToast } = useToast()

  const prevExtraRef = useRef<string>(extraItems.map(itemKey).join(','))

  // Sync extraItems into blocks. New items go to targetSectionId if set,
  // otherwise they append as new LooseBlocks at the end (the visual bottom).
  useEffect(() => {
    const extraKey = extraItems.map(itemKey).join(',')
    if (extraKey === prevExtraRef.current) return
    prevExtraRef.current = extraKey

    const extraSet = new Set(extraItems.map(itemKey))
    const existingKeys = new Set<string>()
    for (const b of blocks) {
      if (b.kind === 'section') b.itemKeys.forEach((k) => existingKeys.add(k))
      else existingKeys.add(b.itemKey)
    }
    const newKeys = extraItems.map(itemKey).filter((k) => !existingKeys.has(k))
    const targetSection = targetSectionId
      ? blocks.find((b): b is SectionBlock => b.kind === 'section' && b.id === targetSectionId)
      : null

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

    setBlocks((prev) => {
      // Drop departed extras (loose blocks for them, and from section itemKeys)
      const cleaned: Block[] = []
      for (const b of prev) {
        if (b.kind === 'loose') {
          if (shouldKeep(b.itemKey)) cleaned.push(b)
        } else {
          cleaned.push({ ...b, itemKeys: b.itemKeys.filter(shouldKeep) })
        }
      }
      if (newKeys.length === 0) return cleaned
      if (targetSection) {
        return cleaned.map((b) =>
          b.kind === 'section' && b.id === targetSection.id
            ? { ...b, itemKeys: [...b.itemKeys, ...newKeys] }
            : b,
        )
      }
      const newLoose: LooseBlock[] = newKeys.map((k) => ({ kind: 'loose', itemKey: k }))
      return [...cleaned, ...newLoose]
    })
  }, [extraItems, targetSectionId])

  /* Section actions */

  const startCreate = () => {
    const id = newSectionId()
    const sectionCount = blocks.filter((b) => b.kind === 'section').length
    const name = `Section ${sectionCount + 1}`
    setBlocks((prev) => [...prev, { kind: 'section', id, name, itemKeys: [], collapsed: false }])
    setAutoRenameSectionId(id)
  }

  const renameSection = (id: string, name: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.kind === 'section' && b.id === id ? { ...b, name } : b)),
    )
    if (autoRenameSectionId === id) {
      setAutoRenameSectionId(null)
    } else {
      showToast('success', 'Section renamed')
    }
  }

  const toggleCollapse = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.kind === 'section' && b.id === id ? { ...b, collapsed: !b.collapsed } : b,
      ),
    )
  }

  const deleteSection = (section: SectionBlock) => {
    setBlocks((prev) => prev.filter((b) => !(b.kind === 'section' && b.id === section.id)))
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
    setBlocks((prev) =>
      prev
        .filter((b) => !(b.kind === 'loose' && b.itemKey === key))
        .map((b) =>
          b.kind === 'section' ? { ...b, itemKeys: b.itemKeys.filter((k) => k !== key) } : b,
        ),
    )
    setItemsByKey((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  /* Drag-and-drop */

  type Container = { kind: 'section'; id: string } | { kind: 'loose' }

  const findContainer = (key: string): Container | null => {
    for (const b of blocks) {
      if (b.kind === 'section' && b.itemKeys.includes(key)) return { kind: 'section', id: b.id }
      if (b.kind === 'loose' && b.itemKey === key) return { kind: 'loose' }
    }
    return null
  }

  const sameContainer = (a: Container, b: Container) =>
    a.kind === b.kind && (a.kind !== 'section' || a.id === (b as Container & { kind: 'section' }).id)

  const handleDragStart = (key: string) => () => {
    setDragKey(key)
  }

  const insertAt = (list: string[], anchor: string, position: 'above' | 'below', key: string) => {
    const idx = list.indexOf(anchor)
    if (idx === -1) return [...list, key]
    const at = position === 'above' ? idx : idx + 1
    return [...list.slice(0, at), key, ...list.slice(at)]
  }

  const handleDragOver = (overKey: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Section being dragged over a loose item: reorder the section block past the loose block.
    // Loose blocks and section blocks are siblings under .content-list, so this stays in the same DOM parent.
    if (sectionDragId && !dragKey) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      const position: 'above' | 'below' = e.clientY < midY ? 'above' : 'below'
      setBlocks((prev) => {
        const dragIdx = prev.findIndex((b) => b.kind === 'section' && b.id === sectionDragId)
        const overIdx = prev.findIndex((b) => b.kind === 'loose' && b.itemKey === overKey)
        if (dragIdx === -1 || overIdx === -1) return prev
        const next = [...prev]
        const [dragged] = next.splice(dragIdx, 1)
        if (!dragged) return prev
        const newOverIdx = next.findIndex((b) => b.kind === 'loose' && b.itemKey === overKey)
        const at = position === 'above' ? newOverIdx : newOverIdx + 1
        next.splice(at, 0, dragged)
        return next
      })
      return
    }

    if (!dragKey || dragKey === overKey) return
    const from = findContainer(dragKey)
    const over = findContainer(overKey)
    if (!from || !over) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position: 'above' | 'below' = e.clientY < midY ? 'above' : 'below'

    if (sameContainer(from, over)) {
      // Same DOM parent — safe to live-reorder without breaking the HTML5 drag.
      const key = dragKey
      if (from.kind === 'section') {
        // Reorder within a section's itemKeys
        setBlocks((prev) =>
          prev.map((b) => {
            if (b.kind !== 'section' || b.id !== from.id) return b
            if (!b.itemKeys.includes(key)) return b
            const without = b.itemKeys.filter((k) => k !== key)
            if (!without.includes(overKey)) return b
            return { ...b, itemKeys: insertAt(without, overKey, position, key) }
          }),
        )
      } else {
        // Reorder LooseBlocks within the blocks array (both blocks are siblings of .content-list)
        setBlocks((prev) => {
          const dragIdx = prev.findIndex((b) => b.kind === 'loose' && b.itemKey === key)
          const overIdx = prev.findIndex((b) => b.kind === 'loose' && b.itemKey === overKey)
          if (dragIdx === -1 || overIdx === -1) return prev
          const next = [...prev]
          const [dragged] = next.splice(dragIdx, 1)
          if (!dragged) return prev
          const newOverIdx = next.findIndex((b) => b.kind === 'loose' && b.itemKey === overKey)
          const at = position === 'above' ? newOverIdx : newOverIdx + 1
          next.splice(at, 0, dragged)
          return next
        })
      }
      setDropTarget(null)
      setContainerDropTarget(null)
    } else {
      // Cross-container — defer to drop. Mutating now would unmount the dragged DOM node and cancel the drag.
      setDropTarget({ itemKey: overKey, position })
      setContainerDropTarget(null)
    }
  }

  const handleDragEnd = () => {
    setDragKey(null)
    setDropTarget(null)
    setContainerDropTarget(null)
    setBlockDropTarget(null)
  }

  const handleContainerDragOver = (container: Container) => (e: React.DragEvent) => {
    if (!dragKey) return
    e.preventDefault()
    const from = findContainer(dragKey)
    if (!from || sameContainer(from, container)) return
    setContainerDropTarget(container)
    setDropTarget(null)
  }

  const commitCrossContainerMove = () => {
    if (!dragKey) return
    const from = findContainer(dragKey)
    if (!from) return
    const key = dragKey

    if (dropTarget) {
      const over = findContainer(dropTarget.itemKey)
      if (!over || sameContainer(from, over)) return
      const target = dropTarget
      setBlocks((prev) => {
        // 1. Remove the dragged key from its source
        let next: Block[] = []
        for (const b of prev) {
          if (from.kind === 'section' && b.kind === 'section' && b.id === from.id) {
            next.push({ ...b, itemKeys: b.itemKeys.filter((k) => k !== key) })
          } else if (from.kind === 'loose' && b.kind === 'loose' && b.itemKey === key) {
            // skip — remove this LooseBlock
          } else {
            next.push(b)
          }
        }
        // 2. Insert into destination
        if (over.kind === 'section') {
          next = next.map((b) =>
            b.kind === 'section' && b.id === over.id
              ? { ...b, itemKeys: insertAt(b.itemKeys, target.itemKey, target.position, key) }
              : b,
          )
        } else {
          // Insert a new LooseBlock relative to the LooseBlock holding target.itemKey
          const overIdx = next.findIndex((b) => b.kind === 'loose' && b.itemKey === target.itemKey)
          if (overIdx === -1) return next
          const at = target.position === 'above' ? overIdx : overIdx + 1
          const newBlock: LooseBlock = { kind: 'loose', itemKey: key }
          next = [...next.slice(0, at), newBlock, ...next.slice(at)]
        }
        return next
      })
      return
    }

    if (containerDropTarget) {
      const dest = containerDropTarget
      if (sameContainer(from, dest)) return
      setBlocks((prev) => {
        let next: Block[] = []
        for (const b of prev) {
          if (from.kind === 'section' && b.kind === 'section' && b.id === from.id) {
            next.push({ ...b, itemKeys: b.itemKeys.filter((k) => k !== key) })
          } else if (from.kind === 'loose' && b.kind === 'loose' && b.itemKey === key) {
            // skip
          } else {
            next.push(b)
          }
        }
        if (dest.kind === 'section') {
          next = next.map((b) =>
            b.kind === 'section' && b.id === dest.id ? { ...b, itemKeys: [...b.itemKeys, key] } : b,
          )
        } else {
          next = [...next, { kind: 'loose', itemKey: key }]
        }
        return next
      })
      return
    }

    if (blockDropTarget) {
      const { sectionId, position } = blockDropTarget
      setBlocks((prev) => {
        // Remove the dragged key from its source (section itemKeys or LooseBlock)
        let next: Block[] = []
        for (const b of prev) {
          if (from.kind === 'section' && b.kind === 'section' && b.id === from.id) {
            next.push({ ...b, itemKeys: b.itemKeys.filter((k) => k !== key) })
          } else if (from.kind === 'loose' && b.kind === 'loose' && b.itemKey === key) {
            // skip
          } else {
            next.push(b)
          }
        }
        // Insert a new LooseBlock at the target position relative to the section
        const sectionIdx = next.findIndex((b) => b.kind === 'section' && b.id === sectionId)
        if (sectionIdx === -1) return next
        const at = position === 'above' ? sectionIdx : sectionIdx + 1
        const newBlock: LooseBlock = { kind: 'loose', itemKey: key }
        return [...next.slice(0, at), newBlock, ...next.slice(at)]
      })
    }
  }

  const handleContainerDrop = (_container: Container) => () => {
    commitCrossContainerMove()
    handleDragEnd()
  }

  const handleDrop = () => {
    commitCrossContainerMove()
    handleDragEnd()
  }

  /* Section drag-and-drop — reorders a SectionBlock relative to another section in the blocks array.
     Loose blocks between sections stay where they are. */

  const handleSectionDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    setSectionDragId(id)
  }

  const handleSectionDragOver = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position: 'above' | 'below' = e.clientY < midY ? 'above' : 'below'

    if (sectionDragId) {
      if (sectionDragId === overId) return
      setBlocks((prev) => {
        const dragIdx = prev.findIndex((b) => b.kind === 'section' && b.id === sectionDragId)
        const overIdx = prev.findIndex((b) => b.kind === 'section' && b.id === overId)
        if (dragIdx === -1 || overIdx === -1) return prev
        const next = [...prev]
        const [dragged] = next.splice(dragIdx, 1)
        if (!dragged) return prev
        const newOverIdx = next.findIndex((b) => b.kind === 'section' && b.id === overId)
        const at = position === 'above' ? newOverIdx : newOverIdx + 1
        next.splice(at, 0, dragged)
        return next
      })
      return
    }

    if (dragKey) {
      // Item dragged over a section header — drop will place it as a loose block adjacent to the section.
      const from = findContainer(dragKey)
      if (!from) return
      // Skip if the dragged item already belongs to this section (would no-op)
      setBlockDropTarget({ sectionId: overId, position })
      setDropTarget(null)
      setContainerDropTarget(null)
    }
  }

  const handleSectionDragEnd = () => {
    setSectionDragId(null)
  }

  const handleSectionDrop = () => {
    // If an item was dragged over the section header, commit the adjacency move first.
    if (dragKey && blockDropTarget) {
      commitCrossContainerMove()
      handleDragEnd()
    }
    handleSectionDragEnd()
  }

  const isEmpty = blocks.length === 0

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
              onClick={() => (onAddContent ? onAddContent() : startCreate())}
            >
              <span>Add Content</span>
              <Add size={20} color="currentColor" variant="Linear" />
            </button>
          </div>
        </div>
      )}

      {blocks.map((block) => {
        if (block.kind === 'section') {
          return (
            <CurriculumSection
              key={block.id}
              section={{
                id: block.id,
                name: block.name,
                items: [],
                collapsed: block.collapsed,
              }}
              itemCount={block.itemKeys.length}
              summary={buildSummary(block.itemKeys)}
              hideDragHandle={blocks.length === 1}
              startInRenameMode={block.id === autoRenameSectionId}
              isDragging={sectionDragId === block.id}
              dropAbove={
                blockDropTarget?.sectionId === block.id && blockDropTarget.position === 'above'
              }
              dropBelow={
                blockDropTarget?.sectionId === block.id && blockDropTarget.position === 'below'
              }
              onDragStart={handleSectionDragStart(block.id)}
              onDragOver={handleSectionDragOver(block.id)}
              onDragEnd={handleSectionDragEnd}
              onDrop={handleSectionDrop}
              onToggleCollapse={() => toggleCollapse(block.id)}
              onRename={(name) => renameSection(block.id, name)}
              onDelete={() =>
                block.itemKeys.length === 0 ? deleteSection(block) : setConfirmDelete(block)
              }
              onAddLesson={onAddContent ? () => onAddContent(block.id) : undefined}
              destinationActive={
                containerDropTarget?.kind === 'section' && containerDropTarget.id === block.id
              }
              onBodyDragOver={handleContainerDragOver({ kind: 'section', id: block.id })}
              onBodyDrop={handleContainerDrop({ kind: 'section', id: block.id })}
            >
              {block.itemKeys.map((key) => {
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
          )
        }
        // LooseBlock — render as a top-level ContentCard
        const item = itemsByKey[block.itemKey]
        if (!item) return null
        return (
          <ContentCard
            key={`loose-${block.itemKey}`}
            item={item}
            onDelete={() => deleteItem(block.itemKey)}
            isDragging={dragKey === block.itemKey}
            dropAbove={dropTarget?.itemKey === block.itemKey && dropTarget.position === 'above'}
            dropBelow={dropTarget?.itemKey === block.itemKey && dropTarget.position === 'below'}
            onDragStart={handleDragStart(block.itemKey)}
            onDragOver={handleDragOver(block.itemKey)}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        )
      })}

      {!isEmpty && (
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
