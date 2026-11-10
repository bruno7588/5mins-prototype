import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ContentTable from './components/ContentTable/ContentTable'
import type { ContentRow } from './components/ContentTable/ContentTable'
import { lessonKey } from '@/data/lessonResources'
import LessonEditorModal from '../../components/LessonEditorModal/LessonEditorModal'
import FlashcardEditor from '../add-content/components/FlashcardEditor/FlashcardEditor'
import { readAddedLessons, updateAddedLesson, removeAddedLesson } from '../../utils/addedLessons'
import Tabs from '@/components/Tabs/Tabs'
import './YourContent.css'

type Tab = 'lessons' | 'scorm'

function YourContent() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('lessons')
  const [selectedLesson, setSelectedLesson] = useState<ContentRow | null>(null)
  const [isNewLesson, setIsNewLesson] = useState(false)
  const [aiQuizReadyIds, setAiQuizReadyIds] = useState<number[]>([])
  const [publishedWithQuizIds, setPublishedWithQuizIds] = useState<number[]>([])
  const [addedLessons, setAddedLessons] = useState<ContentRow[]>(() => readAddedLessons())

  useEffect(() => {
    setAddedLessons(readAddedLessons())
  }, [])

  const handleLessonClick = (row: ContentRow) => {
    setIsNewLesson(false)
    setSelectedLesson(row)
  }

  const handleCloseModal = () => {
    setSelectedLesson(null)
  }

  const handlePublish = (lessonId: number, aiOptIn: boolean) => {
    if (aiOptIn) {
      setAiQuizReadyIds(prev => prev.includes(lessonId) ? prev : [...prev, lessonId])
      setPublishedWithQuizIds(prev => prev.includes(lessonId) ? prev : [...prev, lessonId])
    }
    if (isNewLesson && selectedLesson) {
      setAddedLessons(prev => [selectedLesson, ...prev])
    }
  }

  const handleFlashcardEdit = (lesson: ContentRow) => {
    const next = updateAddedLesson(lesson.id, {
      fileName: lesson.fileName,
      updatedAt: lesson.updatedAt,
    })
    setAddedLessons(next)
    setSelectedLesson(null)
  }

  const handleDeleteLesson = (row: ContentRow) => {
    const next = removeAddedLesson(row.id)
    setAddedLessons(next)
  }

  const handleQuizReviewed = (lessonId: number) => {
    setAiQuizReadyIds(prev => prev.filter(id => id !== lessonId))
  }

  const handleAddContent = () => {
    navigate('/content-library/add-content')
  }

  return (
    <div className="your-content-layout">
      <LeftSidebar />
      <main className="your-content-main">
        <div className="your-content-header">
          <h2 className="your-content-title">Your Content</h2>
          <div className="page-header-divider" />
          <Tabs
            items={[
              { key: 'lessons', label: 'Lessons' },
              { key: 'scorm', label: 'SCORM' },
            ]}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as Tab)}
            ariaLabel="Content type"
          />
        </div>
        <ContentTable variant={activeTab} onLessonClick={handleLessonClick} onAddContent={handleAddContent} aiQuizReadyIds={aiQuizReadyIds} addedLessons={addedLessons} onDeleteLesson={handleDeleteLesson} />
      </main>

      {selectedLesson && selectedLesson.type === 'Flashcards' && (
        <FlashcardEditor
          open
          mode="edit"
          initialLessonId={selectedLesson.id}
          initialLessonName={selectedLesson.fileName}
          onClose={handleCloseModal}
          onPublish={handleFlashcardEdit}
        />
      )}

      {selectedLesson && selectedLesson.type !== 'Flashcards' && (
        <LessonEditorModal
          lesson={selectedLesson}
          isNew={isNewLesson}
          onClose={handleCloseModal}
          onPublish={handlePublish}
          onQuizReviewed={handleQuizReviewed}
          hasGeneratedQuizzes={publishedWithQuizIds.includes(selectedLesson.id)}
          resourceKey={lessonKey(activeTab === 'scorm' ? 'scorm' : 'library', selectedLesson.id)}
        />
      )}
    </div>
  )
}

export default YourContent
