import { useEffect, useRef, useState } from 'react'
import { LibraryDrawerContent, type LibraryLesson } from '../LibraryDrawer/LibraryDrawer'
import { ScormDrawerContent } from '../ScormDrawer/ScormDrawer'
import type { ScormFile } from '../ScormDrawer/ScormDrawer'
import '../../../my-team/CoursesDrawer.css'
import '../LibraryDrawer/LibraryDrawer.css'
import '../ScormDrawer/ScormDrawer.css'

export type ActiveDrawer = 'library' | 'scorm' | null

interface Props {
  activeDrawer: ActiveDrawer
  onClose: () => void
  /* Library */
  libraryAddedIds: Set<number>
  onLibraryAdd: (lesson: LibraryLesson) => void
  onLibraryRemove: (id: number) => void
  /* SCORM */
  scormAddedIds: Set<number>
  onScormAdd: (file: ScormFile) => void
  onScormRemove: (id: number) => void
}

/* Single drawer shell that hosts library or SCORM content. Stays mounted across
   swaps (library → scorm) so the panel doesn't slide out and back in. Only animates
   in on first open and out when activeDrawer goes to null. */
function ContentDrawer({
  activeDrawer,
  onClose,
  libraryAddedIds,
  onLibraryAdd,
  onLibraryRemove,
  scormAddedIds,
  onScormAdd,
  onScormRemove,
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
        className={`overlay-backdrop overlay-backdrop--with-sidebar${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer side-drawer--with-sidebar${closing ? ' side-drawer--closing' : ''} ${rendered === 'library' ? 'library-drawer' : 'scorm-drawer-shell'}`}
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
      </aside>
    </>
  )
}

export default ContentDrawer
