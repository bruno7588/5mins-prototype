import { useState } from 'react'
import PageHeader from './components/PageHeader/PageHeader'
import ContentList from './components/ContentList/ContentList'
import type { ContentItem } from './components/ContentList/ContentList'
import AddContentSidebar from './components/AddContentSidebar/AddContentSidebar'
import type { AssessmentType } from './components/AddContentSidebar/AddContentSidebar'
import type { ScormFile } from './components/ScormDrawer/ScormDrawer'
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

function CreateCourse() {
  const [scormItems, setScormItems] = useState<ContentItem[]>([])
  const [addedScormIds, setAddedScormIds] = useState<Set<number>>(new Set())
  const [assessmentModal, setAssessmentModal] = useState<{ type: AssessmentType } | null>(null)
  const [libraryDrawerOpen, setLibraryDrawerOpen] = useState(false)
  const [addedLibraryIds, setAddedLibraryIds] = useState<Set<number>>(new Set())

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
            onAddContent={() => setLibraryDrawerOpen(true)}
          />
        </main>
        {!assessmentModal && (
          <AddContentSidebar
            addedScormIds={addedScormIds}
            onAddScorm={handleAddScorm}
            onRemoveScorm={handleRemoveScorm}
            onAssessmentClick={(type) => setAssessmentModal({ type })}
            onLibraryClick={() => setLibraryDrawerOpen(true)}
          />
        )}
        {assessmentModal && (
          <AssessmentModal
            type={assessmentModal.type}
            onClose={() => setAssessmentModal(null)}
            onAdd={handleAddAssessment}
            sidebarIcons={
              <AddContentSidebar
                addedScormIds={addedScormIds}
                onAddScorm={handleAddScorm}
                onRemoveScorm={handleRemoveScorm}
                collapsed
                onAssessmentClick={(type) => setAssessmentModal({ type })}
                onLibraryClick={() => setLibraryDrawerOpen(true)}
              />
            }
          />
        )}
      </div>
      <LibraryDrawer
        open={libraryDrawerOpen}
        onClose={() => setLibraryDrawerOpen(false)}
        addedIds={addedLibraryIds}
        onAdd={handleAddLibraryLesson}
        onRemove={handleRemoveLibraryLesson}
      />
    </>
  )
}

export default CreateCourse
