import { useEffect, useRef, useState } from 'react'
import { Trash, Edit2 } from 'iconsax-react'
import './ContentList.css'

export interface ContentItem {
  id: number
  type: 'Lesson' | 'Assessment' | 'SCORM'
  title: string
  metadata: string
  thumbnail: string
  thumbColor?: string
  showEditIcon?: boolean
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

function DragHandle() {
  return (
    <div className="content-card-drag" aria-label="Drag to reorder">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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

interface ContentCardProps {
  item: ContentItem
  index: number
  onDelete?: () => void
  dragIndex: number | null
  dropIndex: number | null
  onDragStart: (i: number) => void
  onDragOver: (e: React.DragEvent, i: number) => void
  onDragEnd: () => void
  onDrop: () => void
}

function ContentCard({
  item, index, onDelete,
  dragIndex, dropIndex,
  onDragStart, onDragOver, onDragEnd, onDrop,
}: ContentCardProps) {
  const isAssessment = item.type === 'Assessment'
  const isScorm = item.type === 'SCORM'
  const isDragging = dragIndex === index

  return (
    <div
      className={`content-item-container${isDragging ? ' content-item-container--dragging' : ''}${dropIndex === index ? ' content-item-container--drop-above' : ''}${dropIndex === index + 1 && index === (dragIndex !== null ? dragIndex : -1) - 1 ? '' : dropIndex === index + 1 ? ' content-item-container--drop-below' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <DragHandle />
      <div className="content-card">
        <div className={`content-card-thumb ${isAssessment ? 'content-card-thumb--assessment' : ''}`}>
          {isAssessment ? (
            <span className="content-card-thumb-emoji">💡</span>
          ) : isScorm && item.thumbColor ? (
            <div className="content-card-thumb-photo" style={{ background: item.thumbColor }} />
          ) : (
            <div className="content-card-thumb-photo">
              <div className="content-card-thumb-tag">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.75C4.1 1.75 1.75 4.1 1.75 7C1.75 9.9 4.1 12.25 7 12.25C9.9 12.25 12.25 9.9 12.25 7C12.25 4.1 9.9 1.75 7 1.75ZM9.1 7.35L6.3 9.1C6.05 9.25 5.75 9.075 5.75 8.75V5.25C5.75 4.925 6.05 4.75 6.3 4.9L9.1 6.65C9.35 6.8 9.35 7.2 9.1 7.35Z" fill="var(--neutral-800)" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className="content-card-info">
          <div className="content-card-title-row">
            <h4 className="content-card-title">{item.title}</h4>
            <span className="content-card-badge">{item.type}</span>
          </div>
          <div className="content-card-meta">
            <span>{item.metadata}</span>
            {item.showEditIcon && (
              <Edit2 size={16} color="var(--neutral-500)" variant="Linear" />
            )}
          </div>
        </div>
      </div>
      <button className="content-card-trash" aria-label="Delete" onClick={onDelete}>
        <Trash size={20} color="currentColor" variant="Linear" />
      </button>
    </div>
  )
}

function itemKey(item: ContentItem) {
  return `${item.type}-${item.id}`
}

interface ContentListProps {
  extraItems?: ContentItem[]
  onDeleteExtra?: (id: number) => void
}

function ContentList({ extraItems = [], onDeleteExtra }: ContentListProps) {
  const [orderedItems, setOrderedItems] = useState<ContentItem[]>(defaultItems)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const prevExtraRef = useRef<string>('')

  // Sync extraItems into orderedItems when they change
  useEffect(() => {
    const extraKey = extraItems.map(itemKey).join(',')
    if (extraKey === prevExtraRef.current) return
    prevExtraRef.current = extraKey

    setOrderedItems(prev => {
      const extraKeys = new Set(extraItems.map(itemKey))
      // Remove SCORM items that are no longer in extraItems
      const filtered = prev.filter(
        item => item.type !== 'SCORM' || extraKeys.has(itemKey(item))
      )
      // Add new extra items not yet in the list
      const existingKeys = new Set(filtered.map(itemKey))
      const newItems = extraItems.filter(item => !existingKeys.has(itemKey(item)))
      return [...filtered, ...newItems]
    })
  }, [extraItems])

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || index === dragIndex) {
      setDropIndex(null)
      return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const target = e.clientY < midY ? index : index + 1
    setDropIndex(target === dragIndex || target === dragIndex + 1 ? null : target)
  }

  const handleDrop = () => {
    if (dragIndex === null || dropIndex === null) return
    setOrderedItems(prev => {
      const next = [...prev]
      const [dragged] = next.splice(dragIndex, 1)
      const insertAt = dropIndex > dragIndex ? dropIndex - 1 : dropIndex
      next.splice(insertAt, 0, dragged)
      return next
    })
    setDragIndex(null)
    setDropIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDropIndex(null)
  }

  const isExtra = (item: ContentItem) =>
    extraItems.some(e => e.id === item.id && e.type === item.type)

  return (
    <section
      className="content-list"
      onDragOver={(e) => e.preventDefault()}
    >
      {orderedItems.map((item, index) => (
        <ContentCard
          key={itemKey(item)}
          item={item}
          index={index}
          onDelete={isExtra(item) ? () => onDeleteExtra?.(item.id) : undefined}
          dragIndex={dragIndex}
          dropIndex={dropIndex}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        />
      ))}
    </section>
  )
}

export default ContentList
