import { useLayoutEffect, useState } from 'react'
import PageHeader from './components/PageHeader/PageHeader'
import ContentList from './components/ContentList/ContentList'
import type { ContentItem } from './components/ContentList/ContentList'
import AddContentDrawer from './components/AddContentDrawer/AddContentDrawer'
import AddContentIconStrip from './components/AddContentIconStrip/AddContentIconStrip'
import type { AssessmentType } from './components/AddContentSidebar/AddContentSidebar'
import type { ScormFile } from './components/ScormDrawer/ScormDrawer'
import ContentDrawer from './components/ContentDrawer/ContentDrawer'
import AssessmentModal from './components/AssessmentModal/AssessmentModal'
import type { AssessmentData } from './components/AssessmentModal/AssessmentModal'
import type { LibraryLesson } from './components/LibraryDrawer/LibraryDrawer'

const assessmentLabels: Record<AssessmentType, string> = {
  'multiple-choice': 'Multiple Choice',
  'short-text': 'Short Text',
  exercise: 'Exercise',
  poll: 'Poll',
}

let nextAssessmentId = 100

type ActiveDrawer = 'library' | 'scorm' | null

function CreateCourse() {
  const [scormItems, setScormItems] = useState<ContentItem[]>([])
  const [addedScormIds, setAddedScormIds] = useState<Set<number>>(new Set())
  const [assessmentModal, setAssessmentModal] = useState<{ type: AssessmentType } | null>(null)
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null)
  const [addContentOpen, setAddContentOpen] = useState(false)
  const [addedLibraryIds, setAddedLibraryIds] = useState<Set<number>>(new Set())
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null)

  /* The Add Content drawer snaps to the bottom edge of the PageHeader's divider —
     so the panel butts directly against the divider line and the tabs row sits
     beside the drawer. Measured via the divider's viewport-relative bottom. */
  useLayoutEffect(() => {
    const update = () => {
      const divider = document.querySelector<HTMLElement>('.page-header-divider')
      if (!divider) return
      const offset = divider.getBoundingClientRect().bottom
      document.documentElement.style.setProperty('--page-header-offset', `${offset}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const openAddContent = (sectionId: string) => {
    setTargetSectionId(sectionId)
    setAddContentOpen(true)
  }

  const closeAddContent = () => setAddContentOpen(false)

  const openLibraryDrawer = () => {
    setAddContentOpen(false)
    setActiveDrawer('library')
  }

  const openScormDrawer = () => {
    setAddContentOpen(false)
    setActiveDrawer('scorm')
  }

  const openAssessment = (type: AssessmentType) => {
    setAddContentOpen(false)
    setAssessmentModal({ type })
  }

  const closeDrawer = () => {
    setActiveDrawer(null)
    setTargetSectionId(null)
  }

  const handleAddScorm = (file: ScormFile) => {
    const newItem: ContentItem = {
      id: file.id,
      type: 'SCORM',
      title: file.fileName,
      metadata: 'Lesson · Instructor name · 4min',
      thumbnail: '',
      thumbColor: file.thumbColor,
    }
    setScormItems(prev => [...prev, newItem])
    setAddedScormIds(prev => new Set(prev).add(file.id))
  }

  const handleRemoveScorm = (id: number) => {
    setScormItems(prev => prev.filter(item => item.id !== id))
    setAddedScormIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setAddedLibraryIds(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleAddAssessment = (data: AssessmentData) => {
    const id = nextAssessmentId++
    const newItem: ContentItem = {
      id,
      type: 'Assessment',
      title: data.question || 'Untitled Assessment',
      metadata: `Assessment · ${assessmentLabels[data.type]}`,
      thumbnail: '',
      showEditIcon: true,
    }
    setScormItems(prev => [...prev, newItem])
    setAssessmentModal(null)
  }

  const handleAddLibraryLesson = (lesson: LibraryLesson) => {
    const newItem: ContentItem = {
      id: lesson.id,
      type: 'LibraryLesson',
      title: lesson.title,
      metadata: `Lesson · ${lesson.instructor} · ${lesson.durationLabel}`,
      thumbnail: '',
      thumbColor: lesson.thumbColor,
    }
    setScormItems(prev => [...prev, newItem])
    setAddedLibraryIds(prev => new Set(prev).add(lesson.id))
  }

  const handleRemoveLibraryLesson = (id: number) => {
    setScormItems(prev => prev.filter(item => item.id !== id))
    setAddedLibraryIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <>
      <PageHeader />
      <div
        className={[
          'app-content-area',
          activeDrawer && 'app-content-area--with-icon-strip',
        ].filter(Boolean).join(' ')}
      >
        <main className="main-content">
          <ContentList
            extraItems={scormItems}
            onDeleteExtra={handleRemoveScorm}
            onAddContent={openAddContent}
            targetSectionId={targetSectionId}
            bodyShiftPx={activeDrawer ? 720 : addContentOpen ? 240 : 0}
          />
        </main>
        {assessmentModal && (
          <AssessmentModal
            type={assessmentModal.type}
            onClose={() => setAssessmentModal(null)}
            onAdd={handleAddAssessment}
          />
        )}
      </div>
      {activeDrawer && (
        <AddContentIconStrip
          active={activeDrawer}
          onLibraryClick={() => setActiveDrawer('library')}
          onScormClick={() => setActiveDrawer('scorm')}
          onAssessmentClick={openAssessment}
        />
      )}
      <AddContentDrawer
        open={addContentOpen}
        onClose={closeAddContent}
        onLibraryClick={openLibraryDrawer}
        onScormClick={openScormDrawer}
        onAssessmentClick={openAssessment}
      />
      <ContentDrawer
        activeDrawer={activeDrawer}
        onClose={closeDrawer}
        libraryAddedIds={addedLibraryIds}
        onLibraryAdd={handleAddLibraryLesson}
        onLibraryRemove={handleRemoveLibraryLesson}
        scormAddedIds={addedScormIds}
        onScormAdd={handleAddScorm}
        onScormRemove={handleRemoveScorm}
      />
    </>
  )
}

export default CreateCourse
