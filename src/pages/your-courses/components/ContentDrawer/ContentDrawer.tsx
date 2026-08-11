import { useEffect, useRef, useState } from 'react'
import { LibraryDrawerContent, type LibraryLesson } from '../LibraryDrawer/LibraryDrawer'
import { ScormDrawerContent } from '../ScormDrawer/ScormDrawer'
import type { ScormFile } from '../ScormDrawer/ScormDrawer'
import AssessmentModal, { type AssessmentData } from '../AssessmentModal/AssessmentModal'
import SituationalTestDrawerContent, {
  type SituationalQuestion,
  type SituationalTestData,
} from '../SituationalTestDrawer/SituationalTestDrawer'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import '../../../my-team/CoursesDrawer.css'
import '../LibraryDrawer/LibraryDrawer.css'
import '../ScormDrawer/ScormDrawer.css'

export type ActiveDrawer = 'library' | 'scorm' | 'assessment' | 'situational-test' | null

interface Props {
  activeDrawer: ActiveDrawer
  onClose: () => void
  /* The Add Content rail can be expanded over an open drawer; the panel then needs
     240px of clearance on the right instead of the rail's 60px. */
  sidebarExpanded: boolean
  /* Library */
  libraryAddedIds: Set<number>
  onLibraryAdd: (lesson: LibraryLesson) => void
  onLibraryRemove: (id: number) => void
  /* SCORM */
  scormAddedIds: Set<number>
  onScormAdd: (file: ScormFile) => void
  onScormRemove: (id: number) => void
  /* Assessment */
  assessmentType: AssessmentType
  onAssessmentAdd: (data: AssessmentData) => void
  /* Situational test — non-null when reopened from the outline for editing. */
  situationalTest: SituationalTestData | null
  onSituationalTestSave: (brief: string, questions: SituationalQuestion[]) => void
}

/* Single drawer shell that hosts library or SCORM content. Stays mounted across
   swaps (library → scorm) so the panel doesn't slide out and back in. Only animates
   in on first open and out when activeDrawer goes to null. */
function ContentDrawer({
  activeDrawer,
  onClose,
  sidebarExpanded,
  libraryAddedIds,
  onLibraryAdd,
  onLibraryRemove,
  scormAddedIds,
  onScormAdd,
  onScormRemove,
  assessmentType,
  onAssessmentAdd,
  situationalTest,
  onSituationalTestSave,
}: Props) {
  // What content to actually render. Lags activeDrawer when closing so the
  // close animation can complete before unmounting.
  const [rendered, setRendered] = useState<ActiveDrawer>(activeDrawer)
  const [closing, setClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (activeDrawer !== null) {
      // Open or swap — keep the shell mounted, just switch content.
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setRendered(activeDrawer)
      setClosing(false)
      return
    }
    // activeDrawer === null — animate the close, then unmount.
    if (rendered === null) return
    setClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setRendered(null)
      setClosing(false)
      closeTimerRef.current = null
    }, 300)
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [activeDrawer])

  useEffect(() => {
    if (rendered === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [rendered, onClose])

  if (rendered === null) return null

  return (
    <>
      <div
        className={`overlay-backdrop overlay-backdrop--with-sidebar${sidebarExpanded ? ' overlay-backdrop--sidebar-expanded' : ''}${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer side-drawer--with-sidebar${sidebarExpanded ? ' side-drawer--sidebar-expanded' : ''}${closing ? ' side-drawer--closing' : ''} ${rendered === 'library' ? 'library-drawer' : rendered === 'scorm' ? 'scorm-drawer-shell' : rendered === 'situational-test' ? 'situational-test-drawer-shell' : 'assessment-drawer-shell'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-drawer-title"
      >
        {rendered === 'library' && (
          <LibraryDrawerContent
            onClose={onClose}
            addedIds={libraryAddedIds}
            onAdd={onLibraryAdd}
            onRemove={onLibraryRemove}
          />
        )}
        {rendered === 'scorm' && (
          <ScormDrawerContent
            onClose={onClose}
            addedIds={scormAddedIds}
            onAdd={onScormAdd}
            onRemove={onScormRemove}
          />
        )}
        {rendered === 'assessment' && (
          <AssessmentModal
            variant="drawer"
            type={assessmentType}
            onClose={onClose}
            onAdd={onAssessmentAdd}
          />
        )}
        {rendered === 'situational-test' && (
          /* Keyed so reopening for a different test remounts the form with its own
             step, brief and questions rather than reusing the previous one's state. */
          <SituationalTestDrawerContent
            key={situationalTest?.id ?? 'new'}
            initial={situationalTest}
            onClose={onClose}
            onSave={onSituationalTestSave}
          />
        )}
      </aside>
    </>
  )
}

export default ContentDrawer
