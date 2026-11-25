import { Copy, Danger, Edit2, Trash } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import type { RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import { saveCourse } from '../../courseStore'

/**
 * A course's three-dot menu, on Your Courses and on course details: Edit opens the
 * builder in edit mode, Duplicate adds a draft copy, Delete asks first.
 */
export const COURSE_MENU_ITEMS: RowMenuItem[] = [
  { key: 'edit', label: 'Edit', icon: <Edit2 size={20} color="var(--text-primary)" variant="Linear" /> },
  { key: 'duplicate', label: 'Duplicate', icon: <Copy size={20} color="var(--text-primary)" variant="Linear" /> },
  { key: 'delete', label: 'Delete', icon: <Trash size={20} color="currentColor" variant="Linear" />, danger: true },
]

/** Router state that opens the builder as Edit Course; `from` is where Update returns. */
export const editCourseState = (title: string, from: string) => ({ editCourse: { title }, from })

/** Saves a draft copy of the course to the store, so it leads the Your Courses list. */
export function duplicateCourse(title: string, lessons = 0) {
  saveCourse({
    id: Date.now(),
    title: `${title} (copy)`,
    description: '',
    thumbnail: '',
    status: 'draft',
    lessons,
    createdAt: new Date().toISOString(),
  })
}

/** DS error dialog: centred Danger icon, Cancel and a danger commit; buttons only. */
export function DeleteCourseDialog({
  title,
  onCancel,
  onConfirm,
}: {
  title: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <ConfirmModal open={!!title} onClose={onCancel} ariaLabel="Delete course">
      {title ? (
        <>
          <div className="confirm-modal-header confirm-modal-header--center">
            <div className="confirm-modal-icon">
              <Danger size={56} color="var(--danger-500)" variant="Linear" />
            </div>
            <h2 className="confirm-modal-title">Delete {title}?</h2>
            <p className="confirm-modal-body">The course will be removed and can't be recovered.</p>
          </div>
          <div className="confirm-modal-actions">
            <Button variant="outlined-2" onClick={onCancel}>
              Cancel
            </Button>
            <Button semantic="danger" onClick={onConfirm}>
              Delete Course
            </Button>
          </div>
        </>
      ) : null}
    </ConfirmModal>
  )
}
