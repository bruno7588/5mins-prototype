import { useState } from 'react'
import PageHeader from './components/PageHeader/PageHeader'
import ContentList from './components/ContentList/ContentList'
import type { ContentItem } from './components/ContentList/ContentList'
import AddContentSidebar from './components/AddContentSidebar/AddContentSidebar'
import type { AssessmentType } from './components/AddContentSidebar/AddContentSidebar'
import ScormDrawer, { type ScormFile } from './components/ScormDrawer/ScormDrawer'
import AssessmentModal from './components/AssessmentModal/AssessmentModal'
import type { AssessmentData } from './components/AssessmentModal/AssessmentModal'
import LibraryDrawer, { type LibraryLesson } from './components/LibraryDrawer/LibraryDrawer'

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
  const [addedLibraryIds, setAddedLibraryIds] = useState<Set<number>>(new Set())
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null)

  const openLibraryDrawer = (sectionId?: string) => {
    setTargetSectionId(sectionId ?? null)
    setActiveDrawer('library')
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
      <div className="app-content-area">
        <main className="main-content">
          <ContentList
            extraItems={scormItems}
            onDeleteExtra={handleRemoveScorm}
            onAddContent={openLibraryDrawer}
            targetSectionId={targetSectionId}
          />
        </main>
        {!assessmentModal && (
          <AddContentSidebar
            collapsed={activeDrawer !== null}
            activeDrawer={activeDrawer}
            onAssessmentClick={(type) => setAssessmentModal({ type })}
            onLibraryClick={() => openLibraryDrawer()}
            onScormClick={() => setActiveDrawer('scorm')}
          />
        )}
        {assessmentModal && (
          <AssessmentModal
            type={assessmentModal.type}
            onClose={() => setAssessmentModal(null)}
            onAdd={handleAddAssessment}
            sidebarIcons={
              <AddContentSidebar
                collapsed
                activeDrawer={activeDrawer}
                onAssessmentClick={(type) => setAssessmentModal({ type })}
                onLibraryClick={() => openLibraryDrawer()}
                onScormClick={() => setActiveDrawer('scorm')}
              />
            }
          />
        )}
      </div>
      <LibraryDrawer
        open={activeDrawer === 'library'}
        onClose={closeDrawer}
        addedIds={addedLibraryIds}
        onAdd={handleAddLibraryLesson}
        onRemove={handleRemoveLibraryLesson}
        withSidebar
      />
      {activeDrawer === 'scorm' && (
        <ScormDrawer
          onClose={closeDrawer}
          addedIds={addedScormIds}
          onAdd={handleAddScorm}
          onRemove={handleRemoveScorm}
          withSidebar
        />
      )}
    </>
  )
}

export default CreateCourse
