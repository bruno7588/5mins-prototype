import { useState } from 'react'
import { Add, Trash } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ResourceCard from '@/components/ResourceCard/ResourceCard'
import Tooltip from '@/components/Tooltip/Tooltip'
import resourcesIllustration from '@/assets/empty-state-illustrations/resources.svg'
import type { CourseResource } from '../ResourcesDrawer/resources'
import '../ContentList/ContentList.css'
import './ResourcesTab.css'

interface Props {
  resources: CourseResource[]
  onReorder: (next: CourseResource[]) => void
  onAdd: () => void
  onRemove: (resource: CourseResource) => void
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

/* Course builder → Resources tab. Each row is the Course Content row chrome
   (ContentList.css: drag handle, trash outside) around the shared ResourceCard — the
   same card learners see on the course page. */
function ResourcesTab({ resources, onReorder, onAdd, onRemove }: Props) {
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
        <section className="content-list resources-tab">
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
      <section className="content-list resources-tab">
        <div className="resources-tab__list">
          {resources.map((resource) => {
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
                <ResourceCard
                  className="resources-tab__card"
                  type={resource.type}
                  title={resource.name}
                  size={resource.size}
                  onOpen={() => openResource(resource)}
                  openDisabled={resource.type !== 'link' && !resource.file}
                />
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
