import ResourceForm from '@/components/ResourceForm/ResourceForm'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import type { CourseResource } from '@/components/ResourceCard/resources'
import './LessonResourceDrawer.css'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (resource: Omit<CourseResource, 'id'>) => void
}

/* Add a resource to a lesson. Same shape as the course builder's Resources drawer
   (header, scrolling form, footer action), hosted over the lesson editor. The form
   draws its own footer, so it fills the drawer body and scrolls inside it. */
function LessonResourceDrawer({ open, onClose, onSave }: Props) {
  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Add resource"
      subtitle="Add Word docs, PDFs, Excel files, and external links here. Learners can download or open them from this lesson."
      bodyClassName="lesson-resource-drawer__body"
    >
      <ResourceForm onSave={onSave} />
    </SideDrawer>
  )
}

export default LessonResourceDrawer
