import { useState } from 'react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ContentTable from './components/ContentTable/ContentTable'
import type { ContentRow } from './components/ContentTable/ContentTable'
import LessonEditorModal from '../../components/LessonEditorModal/LessonEditorModal'
import './QuestionsBankContent.css'

type Tab = 'lessons' | 'scorm'

function QuestionsBankContent() {
  const [activeTab, setActiveTab] = useState<Tab>('lessons')
  const [selectedLesson, setSelectedLesson] = useState<ContentRow | null>(null)
  const [isNewLesson, setIsNewLesson] = useState(false)
  const [aiQuizReadyIds, setAiQuizReadyIds] = useState<number[]>([])
  const [publishedWithQuizIds, setPublishedWithQuizIds] = useState<number[]>([])
  const [addedLessons, setAddedLessons] = useState<ContentRow[]>([])

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

  const handleQuizReviewed = (lessonId: number) => {
    setAiQuizReadyIds(prev => prev.filter(id => id !== lessonId))
  }

  const handleAddContent = () => {
    const newLesson: ContentRow = {
      id: Date.now(),
      fileName: 'Introduction to Agile Methodologies',
      type: 'PDF',
      uploadedBy: 'You',
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      thumbColor: 'linear-gradient(135deg, #5a7fbf, #4a6fa8)',
    }
    setIsNewLesson(true)
    setSelectedLesson(newLesson)
  }

  return (
    <div className="your-content-layout">
      <LeftSidebar />
      <main className="your-content-main">
        <div className="your-content-header">
          <h2 className="your-content-title">Your Content</h2>
          <div className="qb-page-header-divider" />
          <div className="content-tabs">
            <button
              className={`content-tab${activeTab === 'lessons' ? ' content-tab--active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              Lessons
            </button>
            <button
              className={`content-tab${activeTab === 'scorm' ? ' content-tab--active' : ''}`}
              onClick={() => setActiveTab('scorm')}
            >
              SCORM
            </button>
          </div>
        </div>
        <ContentTable variant={activeTab} onLessonClick={handleLessonClick} onAddContent={handleAddContent} aiQuizReadyIds={aiQuizReadyIds} addedLessons={addedLessons} />
      </main>

      {selectedLesson && (
        <LessonEditorModal
          lesson={selectedLesson}
          isNew={isNewLesson}
          onClose={handleCloseModal}
          onPublish={handlePublish}
          onQuizReviewed={handleQuizReviewed}
          hasGeneratedQuizzes={publishedWithQuizIds.includes(selectedLesson.id)}
        />
      )}
    </div>
  )
}

export default QuestionsBankContent
