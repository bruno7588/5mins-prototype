import { useState } from 'react'
import { Add, DocumentDownload, Edit2, ExportSquare, Link1, Trash } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'
import resourcesIllustration from '@/assets/empty-state-illustrations/resources.svg'
import { RESOURCE_TYPES, resourceMeta, type CourseResource } from '../ResourcesDrawer/resources'
import '../ContentList/ContentList.css'
import './ResourcesTab.css'

interface Props {
  resources: CourseResource[]
  onReorder: (next: CourseResource[]) => void
  onAdd: () => void
  onEdit: (resource: CourseResource) => void
  onRemove: (resource: CourseResource) => void
}

/* File glyph with the format printed across it, on a tile in the format's colour. */
function ResourceThumb({ resource }: { resource: CourseResource }) {
  const { tag, color } = RESOURCE_TYPES[resource.type]
  return (
    <div className="content-card-thumb resources-tab__thumb" style={{ background: color }}>
      {resource.type === 'link' ? (
        <Link1 size={24} color="var(--neutral-0)" variant="Linear" />
      ) : (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M9 27V7a2 2 0 0 1 2-2h7l6 6v4"
            stroke="var(--neutral-0)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M18 5v6h6" stroke="var(--neutral-0)" strokeWidth="2" strokeLinejoin="round" />
          <text x="12" y="26" fill="var(--neutral-0)" fontFamily="Poppins, sans-serif" fontSize="8" fontWeight="700">
            {tag}
          </text>
        </svg>
      )}
    </div>
  )
}

/* Files download as themselves; links open in a new tab. */
function openResource(resource: CourseResource) {
  if (resource.type === 'link') {
    window.open(resource.url, '_blank', 'noopener,noreferrer')
    return
  }
  if (!resource.file) return
  const href = URL.createObjectURL(resource.file)
  const a = document.createElement('a')
  a.href = href
  a.download = resource.fileName ?? resource.name
  a.click()
  URL.revokeObjectURL(href)
}

/* Course builder → Resources tab. Rows are the Course Content card (ContentList.css):
   drag handle, card with title actions and a badge, trash outside the card. */
function ResourcesTab({ resources, onReorder, onAdd, onEdit, onRemove }: Props) {
  const [dragId, setDragId] = useState<number | null>(null)

  // Live reorder while dragging, as the outline does within a section.
  const dragOver = (overId: number) => (e: React.DragEvent) => {
    e.preventDefault()
    if (dragId === null || dragId === overId) return
    const from = resources.findIndex((r) => r.id === dragId)
    const to = resources.findIndex((r) => r.id === overId)
    if (from === -1 || to === -1) return
    const next = [...resources]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onReorder(next)
  }

  if (resources.length === 0) {
    return (
      <div className="content-list-layout content-list-layout--empty">
        <section className="content-list">
          <div className="course-empty-state" role="status">
            <img className="course-empty-state__icon" src={resourcesIllustration} width={72} height={72} alt="" />
            <div className="course-empty-state__info">
              <h2 className="course-empty-state__title">Add resources to your course</h2>
              <p className="course-empty-state__body">
                Upload PDF, Word, Excel, or PowerPoint files, or add links.
              </p>
            </div>
            <div className="course-empty-state__cta">
              <Button variant="outlined" icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={onAdd}>
                Add Resource
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="content-list-layout" onDragOver={(e) => e.preventDefault()}>
      <section className="content-list">
        <div className="resources-tab__list">
          {resources.map((resource) => {
            const isLink = resource.type === 'link'
            const openLabel = isLink ? 'Open link' : 'Download'
            return (
              <div
                key={resource.id}
                className={`content-item-container${dragId === resource.id ? ' content-item-container--dragging' : ''}`}
                draggable
                onDragStart={() => setDragId(resource.id)}
                onDragOver={dragOver(resource.id)}
                onDragEnd={() => setDragId(null)}
              >
                <div className="content-card-drag" aria-label="Drag to reorder resource">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="7" cy="5" r="1.5" fill="var(--text-disabled)" />
                    <circle cx="13" cy="5" r="1.5" fill="var(--text-disabled)" />
                    <circle cx="7" cy="10" r="1.5" fill="var(--text-disabled)" />
                    <circle cx="13" cy="10" r="1.5" fill="var(--text-disabled)" />
                    <circle cx="7" cy="15" r="1.5" fill="var(--text-disabled)" />
                    <circle cx="13" cy="15" r="1.5" fill="var(--text-disabled)" />
                  </svg>
                </div>
                <div className="content-card">
                  <ResourceThumb resource={resource} />
                  <div className="content-card-info">
                    <div className="content-card-title-row">
                      <h4 className="content-card-title">{resource.name}</h4>
                      <Tooltip text="Edit" position="Top" icon={false}>
                        <button
                          type="button"
                          className="content-card-title-edit"
                          aria-label={`Edit ${resource.name}`}
                          onClick={() => onEdit(resource)}
                        >
                          <Edit2 size={16} color="currentColor" variant="Linear" />
                        </button>
                      </Tooltip>
                      {/* Greyed rather than hidden when the file isn't in this session, so
                          every card keeps the same actions. */}
                      <Tooltip text={openLabel} position="Top" icon={false}>
                        <button
                          type="button"
                          className={`content-card-title-edit${!isLink && !resource.file ? ' ui-disabled' : ''}`}
                          aria-label={`${openLabel} ${resource.name}`}
                          aria-disabled={!isLink && !resource.file ? true : undefined}
                          onClick={() => openResource(resource)}
                        >
                          {isLink ? (
                            <ExportSquare size={16} color="currentColor" variant="Linear" />
                          ) : (
                            <DocumentDownload size={16} color="currentColor" variant="Linear" />
                          )}
                        </button>
                      </Tooltip>
                      <span className="content-card-badge">Resource</span>
                    </div>
                    <div className="content-card-meta">
                      <span>{resourceMeta(resource)}</span>
                    </div>
                  </div>
                </div>
                <Tooltip text="Remove resource" position="Top" alignment="End" icon={false} className="content-card-trash-tooltip">
                  <button
                    type="button"
                    className="content-card-trash"
                    aria-label={`Remove ${resource.name}`}
                    onClick={() => onRemove(resource)}
                  >
                    <Trash size={20} color="currentColor" variant="Linear" />
                  </button>
                </Tooltip>
              </div>
            )
          })}
        </div>

        <div className="curriculum-bottom-actions curriculum-bottom-actions--flush">
          <Button variant="outlined-2" icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={onAdd}>
            Add Resource
          </Button>
        </div>
      </section>
    </div>
  )
}

export default ResourcesTab
