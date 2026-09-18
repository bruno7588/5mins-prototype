import { useState } from 'react'
import { Add } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ResourceCard from '@/components/ResourceCard/ResourceCard'
import EmptyState from '@/components/EmptyState/EmptyState'
import LessonResourceDrawer from './LessonResourceDrawer'
import resourcesIllustration from '@/assets/empty-state-illustrations/resources.svg'
import type { CourseResource } from '@/components/ResourceCard/resources'
import './LessonResourcesTab.css'

interface Props {
  resources: CourseResource[]
  /** True for a lesson being uploaded now — the empty state nudges instead of explaining. */
  isNew?: boolean
  onAdd: (resource: Omit<CourseResource, 'id'>) => void
  onRemove: (resource: CourseResource) => void
}

/* Files download as themselves; links open in a new tab. Same as the course builder's
   Resources tab, which is the other place an admin opens a resource. */
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

/**
 * Lesson editor → Resources tab (DES-334): the files and links a learner gets with this
 * lesson. Adding opens the same side drawer the course builder uses; the course tab owns
 * ordering, this one doesn't.
 */
function LessonResourcesTab({ resources, isNew, onAdd, onRemove }: Props) {
  const [adding, setAdding] = useState(false)

  const save = (resource: Omit<CourseResource, 'id'>) => {
    onAdd(resource)
    setAdding(false)
  }

  if (resources.length === 0) {
    return (
      <div className="lesson-resources">
        <EmptyState
          surface="dropzone"
          illustration={<img src={resourcesIllustration} width={72} height={72} alt="" />}
          title="Add resources to this lesson"
          description={
            isNew
              ? 'Give learners a deep dive to take after the lesson: PDF, Word, Excel or PowerPoint files, or links.'
              : 'Upload PDF, Word, Excel, PowerPoint files, or add links.'
          }
          secondaryAction={{
            label: 'Add Resource',
            icon: <Add size={20} color="currentColor" variant="Linear" />,
            onClick: () => setAdding(true),
          }}
        />
        {adding && <LessonResourceDrawer onClose={() => setAdding(false)} onSave={save} />}
      </div>
    )
  }

  return (
    <div className="lesson-resources">
      {resources.length > 0 && (
        <div className="lesson-resources__list">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              type={resource.type}
              title={resource.name}
              size={resource.size}
              onOpen={() => openResource(resource)}
              openDisabled={resource.type !== 'link' && !resource.file}
              onRemove={() => onRemove(resource)}
            />
          ))}
        </div>
      )}

      <Button variant="outlined-2" icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={() => setAdding(true)}>
        Add Resource
      </Button>

      {adding && <LessonResourceDrawer onClose={() => setAdding(false)} onSave={save} />}
    </div>
  )
}

export default LessonResourcesTab
