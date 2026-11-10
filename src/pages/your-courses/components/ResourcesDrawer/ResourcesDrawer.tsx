import ResourceForm from '@/components/ResourceForm/ResourceForm'
import type { CourseResource } from '@/components/ResourceCard/resources'
import { DrawerHeader } from '../ContentDrawer/DrawerSlots'

interface Props {
  /** Prefilled when a resource card's Edit reopened it. */
  initial?: CourseResource | null
  onSave: (resource: Omit<CourseResource, 'id'>) => void
}

/* Resources drawer (course builder rail → Resources): the shared ResourceForm under
   this drawer's header. The lesson editor hosts the same form inline. */
export function ResourcesDrawerContent({ initial, onSave }: Props) {
  return (
    <>
      <DrawerHeader
        title={initial ? 'Edit resource' : 'Add resource'}
        description="Add Word docs, PDFs, Excel files, and external links here. Learners can download or open them from the Resources section."
      />

      <ResourceForm initial={initial} onSave={onSave} />
    </>
  )
}
