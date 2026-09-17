import { useState } from 'react'
import { Add, Edit2, ExportSquare, ImportCurve, Trash } from 'iconsax-react'
import Button from '@/components/Button/Button'
import RowActionsMenu, { type RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import Tooltip from '@/components/Tooltip/Tooltip'
import resourcesIllustration from '@/assets/empty-state-illustrations/resources.svg'
import excelThumb from '@/assets/resource-type-illustrations/excel.svg'
import linkIcon from '@/assets/resource-type-illustrations/link-icon.svg'
import pdfThumb from '@/assets/resource-type-illustrations/pdf.svg'
import powerpointThumb from '@/assets/resource-type-illustrations/powerpoint.svg'
import wordThumb from '@/assets/resource-type-illustrations/word.svg'
import { resourceMeta, type CourseResource, type ResourceType } from '../ResourcesDrawer/resources'
import '../ContentList/ContentList.css'
import './ResourcesTab.css'

interface Props {
  resources: CourseResource[]
  onReorder: (next: CourseResource[]) => void
  onAdd: () => void
  onEdit: (resource: CourseResource) => void
  onRemove: (resource: CourseResource) => void
}

/* Type thumbnails from Figma (Create Course 9951:48595): each file format is a finished
   48px tile; a link is the Link-2 glyph on a --certificate-quiz tile. */
const FILE_THUMBS: Record<Exclude<ResourceType, 'link'>, string> = {
  pdf: pdfThumb,
  word: wordThumb,
  excel: excelThumb,
  powerpoint: powerpointThumb,
}

function ResourceThumb({ resource }: { resource: CourseResource }) {
  if (resource.type === 'link') {
    return (
      <div className="content-card-thumb resources-tab__thumb resources-tab__thumb--link">
        <img src={linkIcon} width={24} height={24} alt="" />
      </div>
    )
  }
  return (
    <div className="content-card-thumb">
      <img className="content-card-thumb-illustration" src={FILE_THUMBS[resource.type]} width={48} height={48} alt="" />
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

/* One ⋯ menu per card (DS listbox): Download or Open link, then Edit. Remove stays the
   trash beside the card, as on Course Content. Download is greyed, not hidden, when the
   file isn't in this session. */
function menuFor(resource: CourseResource): RowMenuItem[] {
  const isLink = resource.type === 'link'
  return [
    isLink
      ? { key: 'open', label: 'Open link', icon: <ExportSquare size={20} color="currentColor" variant="Linear" /> }
      : {
          key: 'open',
          label: 'Download',
          icon: <ImportCurve size={20} color="currentColor" variant="Linear" />,
          disabled: !resource.file,
          title: resource.file ? undefined : 'Re-upload the file to download it',
        },
    { key: 'edit', label: 'Edit', icon: <Edit2 size={20} color="currentColor" variant="Linear" /> },
  ]
}

/* Course builder → Resources tab. Rows are the Course Content card (ContentList.css):
   drag handle, the card with a ⋯ actions menu top right, trash outside the card. No type badge: every row here is a
   resource, and the tile and meta line already say which kind. */
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
                      <RowActionsMenu
                        items={menuFor(resource)}
                        onSelect={(key) => {
                          if (key === 'open') openResource(resource)
                          if (key === 'edit') onEdit(resource)
                        }}
                        ariaLabel={`Actions for ${resource.name}`}
                        menuClassName="resources-tab__menu"
                      />
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
