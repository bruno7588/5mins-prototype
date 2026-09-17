import { useRef } from 'react'
import CloseButton from '@/components/CloseButton/CloseButton'
import ResourceForm from '@/components/ResourceForm/ResourceForm'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import type { CourseResource } from '@/components/ResourceCard/resources'
import './LessonResourceDrawer.css'

interface Props {
  onClose: () => void
  onSave: (resource: Omit<CourseResource, 'id'>) => void
}

/* Add a resource to a lesson. Same shape as the course builder's Resources drawer
   (header, scrolling form, footer action), hosted over the lesson editor. */
function LessonResourceDrawer({ onClose, onSave }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  useOverlayA11y(panelRef, true, { onEscape: onClose })

  return (
    <>
      <div className="lesson-resource-drawer__scrim" onClick={onClose} />
      <div
        className="lesson-resource-drawer"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Add resource"
      >
        <div className="lesson-resource-drawer__header">
          <div className="lesson-resource-drawer__heading">
            <h3 className="lesson-resource-drawer__title">Add resource</h3>
            <p className="lesson-resource-drawer__description">
              Add Word docs, PDFs, Excel files, and external links here. Learners can download or open them from
              this lesson.
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="lesson-resource-drawer__divider" />

        <div className="lesson-resource-drawer__body">
          <ResourceForm onSave={onSave} />
        </div>
      </div>
    </>
  )
}

export default LessonResourceDrawer
