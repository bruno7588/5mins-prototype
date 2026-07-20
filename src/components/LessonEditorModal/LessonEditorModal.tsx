import { useState } from 'react'
import { ArrowDown2, Eye } from 'iconsax-react'
import QuizTab from '../QuizTab/QuizTab'
import CloseButton from '../CloseButton/CloseButton'
import InfoIcon from '../icons/InfoIcon'
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
}

type EditorTab = 'quiz' | 'skills' | 'category'

function LessonEditorModal({ lesson, isNew, onClose, onPublish, onQuizReviewed, hasGeneratedQuizzes }: LessonEditorModalProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('quiz')
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const [lessonName, setLessonName] = useState(lesson.fileName)
  const [aiOptIn, setAiOptIn] = useState(true)

  const slugName = lesson.fileName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')

  return (
    <div className="lesson-editor-overlay">
      <CloseButton onClick={onClose} size={32} className="lesson-editor-close" />

      <div className="lesson-editor-content">
        {/* Header */}
        <div className="lesson-editor-header">
          <div className="lesson-editor-header-row">
            <h2 className="lesson-editor-title">Upload document</h2>
            <div className="lesson-editor-header-actions">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#paint0_diamond_4784_60_clip_path)" data-figma-skip-parse="true">
                  <g transform="matrix(0.016 0.016 -0.0122526 0.105566 6 8.19922)">
                    <rect
                      x="0"
                      y="0"
                      width="1112.5"
                      height="166.357"
                      fill="url(#paint0_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1112.5"
                      height="166.357"
                      transform="scale(1 -1)"
                      fill="url(#paint0_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1112.5"
                      height="166.357"
                      transform="scale(-1 1)"
                      fill="url(#paint0_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1112.5"
                      height="166.357"
                      transform="scale(-1)"
                      fill="url(#paint0_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                  </g>
                </g>
                <path d="M12.6948 9.22578C13.0267 7.85703 14.9733 7.85703 15.3052 9.22578L16.2185 12.992C16.337 13.4807 16.7185 13.8622 17.2072 13.9807L20.9734 14.894C22.3422 15.2259 22.3422 17.1726 20.9734 17.5045L17.2072 18.4177C16.7185 18.5362 16.337 18.9178 16.2185 19.4064L15.3052 23.1727C14.9733 24.5414 13.0267 24.5414 12.6948 23.1727L11.7815 19.4064C11.663 18.9178 11.2815 18.5362 10.7928 18.4177L7.02656 17.5045C5.65781 17.1726 5.65781 15.2259 7.02656 14.894L10.7928 13.9807C11.2815 13.8622 11.663 13.4807 11.7815 12.992L12.6948 9.22578Z" />
                <g clipPath="url(#paint1_diamond_4784_60_clip_path)" data-figma-skip-parse="true">
                  <g transform="matrix(0.006 0.006 -0.00459472 0.0395874 19.7988 6)">
                    <rect
                      x="0"
                      y="0"
                      width="1166.67"
                      height="181.069"
                      fill="url(#paint1_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1166.67"
                      height="181.069"
                      transform="scale(1 -1)"
                      fill="url(#paint1_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1166.67"
                      height="181.069"
                      transform="scale(-1 1)"
                      fill="url(#paint1_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1166.67"
                      height="181.069"
                      transform="scale(-1)"
                      fill="url(#paint1_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                  </g>
                </g>
                <path d="M22.3705 6.71184C22.4795 6.26272 23.1182 6.26272 23.2271 6.71184L23.5268 7.94763C23.5657 8.10798 23.6909 8.23318 23.8512 8.27206L25.087 8.57172C25.5361 8.68062 25.5361 9.31938 25.087 9.42828L23.8512 9.72794C23.6909 9.76682 23.5657 9.89202 23.5268 10.0524L23.2271 11.2882C23.1182 11.7373 22.4795 11.7373 22.3705 11.2882L22.0709 10.0524C22.032 9.89202 21.9068 9.76682 21.7465 9.72794L20.5107 9.42828C20.0615 9.31938 20.0615 8.68062 20.5107 8.57172L21.7465 8.27206C21.9068 8.23318 22.032 8.10798 22.0709 7.94763L22.3705 6.71184Z" />
                <g clipPath="url(#paint2_diamond_4784_60_clip_path)" data-figma-skip-parse="true">
                  <g transform="matrix(0.006 0.006 -0.00459472 0.0395874 19.7988 6)">
                    <rect
                      x="0"
                      y="0"
                      width="1166.67"
                      height="181.069"
                      fill="url(#paint2_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1166.67"
                      height="181.069"
                      transform="scale(1 -1)"
                      fill="url(#paint2_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1166.67"
                      height="181.069"
                      transform="scale(-1 1)"
                      fill="url(#paint2_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="1166.67"
                      height="181.069"
                      transform="scale(-1)"
                      fill="url(#paint2_diamond_4784_60)"
                      opacity="1"
                      shapeRendering="crispEdges"
                    />
                  </g>
                </g>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.7988 6.93109L22.5543 7.93972C22.4565 8.34288 22.1417 8.65766 21.7385 8.75542L20.7299 9L21.7385 9.24458C22.1417 9.34234 22.4565 9.65712 22.5543 10.0603L22.7988 11.0689L23.0434 10.0603C23.1412 9.65712 23.4559 9.34234 23.8591 9.24458L24.8677 9L23.8591 8.75542C23.4559 8.65766 23.1412 8.34288 23.0434 7.93972L22.7988 6.93109ZM23.2883 6.38496C23.1638 5.87168 22.4338 5.87168 22.3094 6.38496L21.9669 7.79729C21.9225 7.98055 21.7794 8.12363 21.5961 8.16807L20.1838 8.51054C19.6705 8.635 19.6705 9.365 20.1838 9.48947L21.5961 9.83193C21.7794 9.87637 21.9225 10.0195 21.9669 10.2027L22.3094 11.615C22.4338 12.1283 23.1638 12.1283 23.2883 11.615L23.6308 10.2027C23.6752 10.0195 23.8183 9.87637 24.0015 9.83193L25.4139 9.48947C25.9271 9.365 25.9271 8.635 25.4139 8.51054L24.0015 8.16807C23.8183 8.12363 23.6752 7.98055 23.6308 7.79729L23.2883 6.38496Z"
                />
                <defs>
                  <clipPath id="paint0_diamond_4784_60_clip_path">
                    <path d="M12.6948 9.22578C13.0267 7.85703 14.9733 7.85703 15.3052 9.22578L16.2185 12.992C16.337 13.4807 16.7185 13.8622 17.2072 13.9807L20.9734 14.894C22.3422 15.2259 22.3422 17.1726 20.9734 17.5045L17.2072 18.4177C16.7185 18.5362 16.337 18.9178 16.2185 19.4064L15.3052 23.1727C14.9733 24.5414 13.0267 24.5414 12.6948 23.1727L11.7815 19.4064C11.663 18.9178 11.2815 18.5362 10.7928 18.4177L7.02656 17.5045C5.65781 17.1726 5.65781 15.2259 7.02656 14.894L10.7928 13.9807C11.2815 13.8622 11.663 13.4807 11.7815 12.992L12.6948 9.22578Z" />
                  </clipPath>
                  <clipPath id="paint1_diamond_4784_60_clip_path">
                    <path d="M22.3705 6.71184C22.4795 6.26272 23.1182 6.26272 23.2271 6.71184L23.5268 7.94763C23.5657 8.10798 23.6909 8.23318 23.8512 8.27206L25.087 8.57172C25.5361 8.68062 25.5361 9.31938 25.087 9.42828L23.8512 9.72794C23.6909 9.76682 23.5657 9.89202 23.5268 10.0524L23.2271 11.2882C23.1182 11.7373 22.4795 11.7373 22.3705 11.2882L22.0709 10.0524C22.032 9.89202 21.9068 9.76682 21.7465 9.72794L20.5107 9.42828C20.0615 9.31938 20.0615 8.68062 20.5107 8.57172L21.7465 8.27206C21.9068 8.23318 22.032 8.10798 22.0709 7.94763L22.3705 6.71184Z" />
                  </clipPath>
                  <clipPath id="paint2_diamond_4784_60_clip_path">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M22.7988 6.93109L22.5543 7.93972C22.4565 8.34288 22.1417 8.65766 21.7385 8.75542L20.7299 9L21.7385 9.24458C22.1417 9.34234 22.4565 9.65712 22.5543 10.0603L22.7988 11.0689L23.0434 10.0603C23.1412 9.65712 23.4559 9.34234 23.8591 9.24458L24.8677 9L23.8591 8.75542C23.4559 8.65766 23.1412 8.34288 23.0434 7.93972L22.7988 6.93109ZM23.2883 6.38496C23.1638 5.87168 22.4338 5.87168 22.3094 6.38496L21.9669 7.79729C21.9225 7.98055 21.7794 8.12363 21.5961 8.16807L20.1838 8.51054C19.6705 8.635 19.6705 9.365 20.1838 9.48947L21.5961 9.83193C21.7794 9.87637 21.9225 10.0195 21.9669 10.2027L22.3094 11.615C22.4338 12.1283 23.1638 12.1283 23.2883 11.615L23.6308 10.2027C23.6752 10.0195 23.8183 9.87637 24.0015 9.83193L25.4139 9.48947C25.9271 9.365 25.9271 8.635 25.4139 8.51054L24.0015 8.16807C23.8183 8.12363 23.6752 7.98055 23.6308 7.79729L23.2883 6.38496Z"
                    />
                  </clipPath>
                  <linearGradient
                    id="paint0_diamond_4784_60"
                    x1="0"
                    y1="0"
                    x2="500"
                    y2="500"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#00AFC4" />
                    <stop offset="1" stopColor="#8158EC" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_diamond_4784_60"
                    x1="0"
                    y1="0"
                    x2="500"
                    y2="500"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#00AFC4" />
                    <stop offset="1" stopColor="#8158EC" />
                  </linearGradient>
                  <linearGradient
                    id="paint2_diamond_4784_60"
                    x1="0"
                    y1="0"
                    x2="500"
                    y2="500"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#00AFC4" />
                    <stop offset="1" stopColor="#8158EC" />
                  </linearGradient>
                </defs>
              </svg>
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
        </div>

        {/* Collapsible guidelines — styled as bordered field */}
        <button
          className={`lesson-editor-guidelines-field${guidelinesOpen ? ' lesson-editor-guidelines-field--open' : ''}`}
          onClick={() => setGuidelinesOpen(!guidelinesOpen)}
        >
          <span className="lesson-editor-guidelines-text">Guidelines for uploading documents</span>
          <ArrowDown2 size={20} color="var(--text-secondary)" />
        </button>
        {guidelinesOpen && (
          <div className="lesson-editor-guidelines-body">
            Upload a PDF, DOCX, or PPTX file. The AI will automatically extract content and generate quiz questions based on the lesson material. You can review, edit, or add questions manually after generation.
          </div>
        )}

        {/* File preview + form fields */}
        <div className="lesson-editor-body">
          <div className="lesson-editor-preview">
            <div
              className="lesson-editor-preview-thumb"
              style={
                lesson.thumbnail
                  ? { backgroundImage: `url(${lesson.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: lesson.thumbColor }
              }
            />
            <div className="lesson-editor-preview-overlay">
              <Eye size={48} color="white" variant="Bold" />
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
                <span className="lesson-editor-file-name">{slugName}.pdf</span>
                <button className="lesson-editor-change-file">Change File</button>
              </div>
            </div>
            <div className="lesson-editor-info-banner">
              <InfoIcon size={20} />
              <p className="lesson-editor-info-text">
                This file will be converted to PDF in the background after you publish. The lesson will appear as "Processing" in your content library until conversion is complete.
              </p>
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
        </div>
      </div>
    </div>
  )
}

export default LessonEditorModal
