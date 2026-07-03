import { useLayoutEffect, useState } from 'react'
import PageHeader from './components/PageHeader/PageHeader'
import ContentList from './components/ContentList/ContentList'
import type { ContentItem } from './components/ContentList/ContentList'
import AddContentMenu from './components/AddContentMenu/AddContentMenu'
import type { AddContentKind } from './components/AddContentMenu/AddContentMenu'
import AddContentIconStrip from './components/AddContentIconStrip/AddContentIconStrip'
import type { AssessmentType } from './components/AddContentSidebar/AddContentSidebar'
import type { ScormFile } from './components/ScormDrawer/ScormDrawer'
import ContentDrawer from './components/ContentDrawer/ContentDrawer'
import type { AssessmentData } from './components/AssessmentModal/AssessmentModal'
import type { LibraryLesson } from './components/LibraryDrawer/LibraryDrawer'

const assessmentLabels: Record<AssessmentType, string> = {
  'multiple-choice': 'Multiple Choice',
  'short-text': 'Short Text',
  exercise: 'Exercise',
  poll: 'Poll',
}

let nextAssessmentId = 100

type ActiveDrawer = 'library' | 'scorm' | 'assessment' | null

function CreateCourse() {
  const [scormItems, setScormItems] = useState<ContentItem[]>([])
  const [addedScormIds, setAddedScormIds] = useState<Set<number>>(new Set())
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('multiple-choice')
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null)
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null)
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

  const openAddContent = (sectionId: string, anchor: HTMLElement) => {
    setTargetSectionId(sectionId)
    setAddMenuAnchor(anchor)
  }

  const closeAddMenu = () => setAddMenuAnchor(null)

  const openLibraryDrawer = () => setActiveDrawer('library')

  const openScormDrawer = () => setActiveDrawer('scorm')

  const openAssessment = (type: AssessmentType) => {
    setAssessmentType(type)
    setActiveDrawer('assessment')
  }

  const assessmentTypes: AssessmentType[] = ['multiple-choice', 'short-text', 'exercise', 'poll']

  /* Route a menu pick to the matching content drawer. Your Content / Embed Links /
     Events / Resources are not wired to drawers yet (same as the old picker), so they
     just dismiss the menu for now. */
  const handleAddMenuSelect = (kind: AddContentKind) => {
    if (kind === 'library') openLibraryDrawer()
    else if (kind === 'scorm') openScormDrawer()
    else if (assessmentTypes.includes(kind as AssessmentType)) openAssessment(kind as AssessmentType)
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
    setActiveDrawer(null)
    setTargetSectionId(null)
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
          'acd-content-area',
          activeDrawer && 'acd-content-area--with-icon-strip',
        ].filter(Boolean).join(' ')}
      >
        <main className="main-content">
          <ContentList
            extraItems={scormItems}
            onDeleteExtra={handleRemoveScorm}
            onAddContent={openAddContent}
            targetSectionId={targetSectionId}
            bodyShiftPx={activeDrawer ? 720 : 0}
          />
        </main>
      </div>
      {activeDrawer && (
        <AddContentIconStrip
          active={activeDrawer}
          onLibraryClick={() => setActiveDrawer('library')}
          onScormClick={() => setActiveDrawer('scorm')}
          onAssessmentClick={openAssessment}
        />
      )}
      <AddContentMenu
        open={!!addMenuAnchor}
        anchor={addMenuAnchor}
        onClose={closeAddMenu}
        onSelect={handleAddMenuSelect}
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
        assessmentType={assessmentType}
        onAssessmentAdd={handleAddAssessment}
      />
    </>
  )
}

export default CreateCourse
