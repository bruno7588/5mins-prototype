import CloseButton from '@/components/CloseButton/CloseButton'
import ResourceForm from '@/components/ResourceForm/ResourceForm'
import type { CourseResource } from '@/components/ResourceCard/resources'
import SectionHeader from '../SectionHeader/SectionHeader'
import './ResourcesDrawer.css'

interface Props {
  /** Prefilled when a resource card's Edit reopened it. */
  initial?: CourseResource | null
  onClose: () => void
  onSave: (resource: Omit<CourseResource, 'id'>) => void
}

/* Resources drawer (course builder rail → Resources): the shared ResourceForm under
   this drawer's header. The lesson editor hosts the same form inline. */
export function ResourcesDrawerContent({ initial, onClose, onSave }: Props) {
  return (
    <>
      <SectionHeader
        title={initial ? 'Edit resource' : 'Add resource'}
        description="Add Word docs, PDFs, Excel files, and external links here. Learners can download or open them from the Resources section."
        ctas={<CloseButton onClick={onClose} />}
      />

      <ResourceForm initial={initial} onSave={onSave} />
    </>
  )
}
