import { useState } from 'react'
import { ArrowDown2, Backward10Seconds, Eye, Forward10Seconds, PlayCircle } from 'iconsax-react'
import LessonResourcesTab from '@/components/LessonResourcesTab/LessonResourcesTab'
import type { CourseResource } from '@/components/ResourceCard/resources'
import { getLessonResources, lessonKey, nextLessonResourceId, setLessonResources } from '@/data/lessonResources'
import Button from '@/components/Button/Button'
import SparkleIcon from '../icons/SparkleIcon'
import QuizTab from '../QuizTab/QuizTab'
import CloseButton from '../CloseButton/CloseButton'
import './LessonEditorModal.css'

/** Row shape the editor needs — structurally matches the page-level ContentRow. */
export interface ContentRow {
  id: number
  fileName: string
  type: string
  uploadedBy: string
  updatedAt: string
  /** Image URL (Your Content) — takes precedence over the gradient fallback. */
  thumbnail?: string
  /** CSS gradient fallback (questions-bank / SCORM content tables). */
  thumbColor?: string
}

interface LessonEditorModalProps {
  lesson: ContentRow
  isNew?: boolean
  onClose: () => void
  onPublish?: (lessonId: number, aiOptIn: boolean) => void
  onQuizReviewed?: (lessonId: number) => void
  hasGeneratedQuizzes?: boolean
  /** Scopes this lesson's resources. Lesson, SCORM and question-bank ids overlap, so
      each table passes its own key (see src/data/lessonResources.ts). */
  resourceKey?: string
}

type EditorTab = 'quiz' | 'resources' | 'skills' | 'category'

function LessonEditorModal({ lesson, isNew, onClose, onPublish, onQuizReviewed, hasGeneratedQuizzes, resourceKey }: LessonEditorModalProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('quiz')
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const [lessonName, setLessonName] = useState(lesson.fileName)
  const [aiOptIn, setAiOptIn] = useState(true)

  /* Resources outlive the modal, so the store is the source of truth and this state
     just mirrors it for rendering. */
  const resourcesKey = resourceKey ?? lessonKey('library', lesson.id)
  const [resources, setResources] = useState(() => getLessonResources(resourcesKey))
  const saveResources = (next: CourseResource[]) => {
    setLessonResources(resourcesKey, next)
    setResources(next)
  }

  const slugName = lesson.fileName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')

  /* Figma (Your Content 6547:34350) specifies the video case: player controls over
     the poster, and a thumbnail picker that falls back to the first frame. Audio
     shares the player; everything else keeps the document wording. */
  const isVideo = lesson.type === 'Video'
  const playable = isVideo || lesson.type === 'Audio'
  const kind = isVideo ? 'video' : lesson.type === 'Audio' ? 'audio' : 'document'
  /* "audio" is uncountable — "audios" reads wrong in the guidelines line. */
  const kindPlural = isVideo ? 'videos' : lesson.type === 'Audio' ? 'audio' : 'documents'
  const fileExt = isVideo ? 'mp4' : lesson.type === 'Audio' ? 'mp3' : 'pdf'
  const posterStyle = lesson.thumbnail
    ? { backgroundImage: `url(${lesson.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: lesson.thumbColor }

  return (
    <div className="lesson-editor-overlay">
      <CloseButton onClick={onClose} size={32} className="lesson-editor-close" />

      <div className="lesson-editor-content">
        {/* Header */}
        <div className="lesson-editor-header">
          <div className="lesson-editor-header-row">
            <h2 className="lesson-editor-title">{playable ? `Add ${kind}` : 'Upload document'}</h2>
            <div className="lesson-editor-header-actions">
              <SparkleIcon size={24} gradient />
              <button
                className="lesson-editor-publish-btn"
                onClick={() => {
                  if (isNew) {
                    onPublish?.(lesson.id, aiOptIn)
                  } else if (hasGeneratedQuizzes) {
                    onQuizReviewed?.(lesson.id)
                  }
                  onClose()
                }}
              >
                {isNew ? 'Publish Lesson' : 'Update Lesson'}
              </button>
            </div>
          </div>
          <div className="lesson-editor-divider" />
        </div>

        {/* Collapsible guidelines — styled as bordered field */}
        <button
          className={`lesson-editor-guidelines-field${guidelinesOpen ? ' lesson-editor-guidelines-field--open' : ''}`}
          onClick={() => setGuidelinesOpen(!guidelinesOpen)}
        >
          <span className="lesson-editor-guidelines-text">Guidelines for uploading {kindPlural}</span>
          <ArrowDown2 size={20} color="var(--text-secondary)" />
        </button>
        {guidelinesOpen && (
          <div className="lesson-editor-guidelines-body">
            Upload a PDF, DOCX, or PPTX file. The AI will automatically extract content and generate quiz questions based on the lesson material. You can review, edit, or add questions manually after generation.
          </div>
        )}

        {/* File preview + form fields */}
        <div className="lesson-editor-body">
          <div className="lesson-editor-preview" style={posterStyle}>
            <div className="lesson-editor-preview-scrim">
              {playable ? (
                <div className="lesson-editor-play-actions">
                  <Backward10Seconds size={27} color="#FFFFFF" variant="Bold" />
                  <PlayCircle size={40} color="#FFFFFF" variant="Bold" />
                  <Forward10Seconds size={27} color="#FFFFFF" variant="Bold" />
                </div>
              ) : (
                <Eye size={40} color="#FFFFFF" variant="Bold" />
              )}
            </div>
          </div>
          <div className="lesson-editor-fields">
            <div className="lesson-editor-field">
              <label className="lesson-editor-label">Name of the lesson</label>
              <input
                className="lesson-editor-input"
                type="text"
                placeholder="Add a name..."
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
              />
            </div>
            <div className="lesson-editor-field">
              <label className="lesson-editor-label">File name</label>
              <div className="lesson-editor-file-input">
                <span className="lesson-editor-file-name">{slugName}.{fileExt}</span>
                <button className="lesson-editor-change-file">Change File</button>
              </div>
            </div>
            <div className="lesson-editor-field">
              <label className="lesson-editor-label">Lesson thumbnail</label>
              <div className="lesson-editor-thumb-row">
                <div className="lesson-editor-thumb" style={posterStyle}>
                  <span className="lesson-editor-thumb-preview">
                    <Eye size={16} color="#FFFFFF" variant="Linear" />
                  </span>
                </div>
                <div className="lesson-editor-thumb-info">
                  <p className="lesson-editor-thumb-copy">
                    Upload image or generate with AI. If you don't add one, we'll use{' '}
                    {isVideo ? 'the first frame of the video' : 'a default image'} as lesson thumbnail.
                  </p>
                  <Button
                    variant="outlined-2"
                    icon={<SparkleIcon size={20} variant="Linear" color="currentColor" />}
                  >
                    Change Thumbnail
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="lesson-editor-tabs">
          <button
            className={`lesson-editor-tab${activeTab === 'quiz' ? ' lesson-editor-tab--active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            Quiz
          </button>
          <button
            className={`lesson-editor-tab${activeTab === 'resources' ? ' lesson-editor-tab--active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
            {resources.length > 0 && <span className="lesson-editor-tab__count">{resources.length}</span>}
          </button>
          <button
            className="lesson-editor-tab lesson-editor-tab--disabled"
            disabled
          >
            Skills
          </button>
          <button
            className="lesson-editor-tab lesson-editor-tab--disabled"
            disabled
          >
            Add to Category
          </button>
        </div>

        {/* Tab content */}
        <div className="lesson-editor-tab-content">
          {activeTab === 'quiz' && <QuizTab isNew={isNew} hasGeneratedQuizzes={hasGeneratedQuizzes} onAIOptInChange={setAiOptIn} />}
          {activeTab === 'resources' && (
            <LessonResourcesTab
              resources={resources}
              isNew={isNew}
              onAdd={(resource) => saveResources([...resources, { ...resource, id: nextLessonResourceId() }])}
              onRemove={(resource) => saveResources(resources.filter((r) => r.id !== resource.id))}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default LessonEditorModal
