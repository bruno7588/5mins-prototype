import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Notepad2,
  VideoSquare,
  VolumeHigh,
  DocumentText,
  Link2,
  ArrowRight2,
} from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import CreateFlashcardsModal from './components/CreateFlashcardsModal'
import CreateFlashcardsFromFileModal from './components/CreateFlashcardsFromFileModal'
import FlashcardEditor, { type Card } from './components/FlashcardEditor/FlashcardEditor'
import type { ContentRow } from '../your-courses/components/ContentTable/ContentTable'
import { appendAddedLesson } from '../../utils/addedLessons'
import './AddContent.css'

type CardKey = 'flashcards' | 'video' | 'audio' | 'document' | 'link'

interface CardDef {
  key: CardKey
  color: string
  iconColor: string
  icon: React.ReactNode
  title: string
  description: string
  caption?: string
  badge?: string
}

const iconSize = 32

const cards: CardDef[] = [
  {
    key: 'flashcards',
    color: '255, 187, 56',
    iconColor: '#FFBB38',
    icon: <Notepad2 size={iconSize} color="#EDA30D" variant="Linear" />,
    title: 'Create Flashcards',
    description: 'Start from a blank template or transform existing content with AI',
    badge: 'New',
  },
  {
    key: 'video',
    color: '250, 113, 95',
    iconColor: '#FA715F',
    icon: <VideoSquare size={iconSize} color="#FA715F" variant="Linear" />,
    title: 'Add a New Video',
    description: 'Great for short training or update videos',
  },
  {
    key: 'audio',
    color: '155, 85, 201',
    iconColor: '#9B55C9',
    icon: <VolumeHigh size={iconSize} color="#9B55C9" variant="Linear" />,
    title: 'Add a New Audio',
    description: 'Upload audio files for on-the-go learning',
  },
  {
    key: 'document',
    color: '0, 206, 230',
    iconColor: '#00CEE6',
    icon: <DocumentText size={iconSize} color="#00AFC4" variant="Linear" />,
    title: 'Add a New Document',
    description: 'Share PDFs, presentations, and spreadsheets directly with your team',
    caption: 'PDF, DOCX, PPTX, XLSX',
  },
  {
    key: 'link',
    color: '42, 144, 216',
    iconColor: '#2A90D8',
    icon: <Link2 size={iconSize} color="#2A90D8" variant="Linear" />,
    title: 'Add External Link',
    description: 'Embed web content, YouTube videos, TikToks, and more into any lesson',
    caption: 'YouTube, TikTok & more',
  },
]

const lessonNameFromFile = (fileName: string) => {
  const base = fileName.replace(/\.[^.]+$/, '').trim()
  if (base.length <= 60) return base
  const slice = base.slice(0, 60)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > 30 ? slice.slice(0, lastSpace) : slice) + '…'
}

const MOCK_GENERATED_CARDS: Array<Pick<Card, 'title' | 'description'>> = [
  { title: 'Getting started', description: 'A quick overview of what this lesson covers and why it matters for your role.' },
  { title: 'Core principles', description: 'The three ideas that underpin everything that follows: clarity, accountability, and consistency.' },
  { title: 'Step-by-step process', description: 'Walk through each stage carefully, in order, and verify each step before moving on to the next.' },
  { title: 'Common mistakes to avoid', description: 'The most frequent issues teams run into — and how to spot them before they become problems.' },
  { title: 'Tools and resources', description: 'Equip yourself with the right templates, checklists, and reference material for day-to-day use.' },
  { title: 'Apply what you’ve learned', description: 'Put your new knowledge into practice with these short exercises and follow-up actions.' },
]

const buildMockCards = (includeImages: boolean): Card[] =>
  MOCK_GENERATED_CARDS.map((c, i) => ({
    id: Date.now() + i,
    title: c.title,
    description: c.description,
    image: includeImages ? `https://picsum.photos/seed/fc${i + 1}/640/360` : undefined,
  }))

function AddContent() {
  const navigate = useNavigate()
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false)
  const [showTransformModal, setShowTransformModal] = useState(false)
  const [showFlashcardEditor, setShowFlashcardEditor] = useState(false)
  const [editorLessonName, setEditorLessonName] = useState('')
  const [editorInitialCards, setEditorInitialCards] = useState<Card[] | undefined>(undefined)

  const handleCardClick = (key: CardKey) => {
    if (key === 'flashcards') {
      setShowFlashcardsModal(true)
    }
    // other card destinations wired in follow-up work
  }

  const handleCreateEmpty = () => {
    setShowFlashcardsModal(false)
    setEditorLessonName('')
    setEditorInitialCards(undefined)
    setShowFlashcardEditor(true)
  }

  const handleAiTransformer = () => {
    setShowFlashcardsModal(false)
    setShowTransformModal(true)
  }

  const handleTransformGenerate = (fileName: string, includeImages: boolean) => {
    setShowTransformModal(false)
    setEditorLessonName(lessonNameFromFile(fileName))
    setEditorInitialCards(buildMockCards(includeImages))
    setShowFlashcardEditor(true)
  }

  const handlePublishLesson = (lesson: ContentRow) => {
    appendAddedLesson(lesson)
    setShowFlashcardEditor(false)
    navigate('/content-library')
  }

  return (
    <div className="add-content-layout">
      <LeftSidebar />
      <main className="add-content-main">
        <div className="add-content-page">
          <div className="add-content-header">
            <nav className="add-content-breadcrumb" aria-label="Breadcrumb">
              <button
                type="button"
                className="add-content-breadcrumb-link"
                onClick={() => navigate('/content-library')}
              >
                Your content
              </button>
              <ArrowRight2 size={16} color="var(--text-tertiary)" variant="Linear" />
              <span className="add-content-breadcrumb-current">Add Content</span>
            </nav>
          </div>

          <div className="add-content-grid">
            {cards.map((card) => (
              <button
                key={card.key}
                type="button"
                className="add-content-card"
                style={{ '--ql-color': card.color } as React.CSSProperties}
                onClick={() => handleCardClick(card.key)}
              >
                <div className="add-content-card-head">
                  <div className="add-content-card-icon">{card.icon}</div>
                  {card.badge && <span className="add-content-card-badge">{card.badge}</span>}
                </div>
                <div className="add-content-card-info">
                  <h3 className="add-content-card-title">{card.title}</h3>
                  <p className="add-content-card-desc">{card.description}</p>
                  {card.caption && <p className="add-content-card-caption">{card.caption}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <CreateFlashcardsModal
        open={showFlashcardsModal}
        onClose={() => setShowFlashcardsModal(false)}
        onCreateEmpty={handleCreateEmpty}
        onAiTransformer={handleAiTransformer}
      />

      <CreateFlashcardsFromFileModal
        open={showTransformModal}
        onClose={() => setShowTransformModal(false)}
        onGenerate={handleTransformGenerate}
      />

      <FlashcardEditor
        open={showFlashcardEditor}
        onClose={() => setShowFlashcardEditor(false)}
        onPublish={handlePublishLesson}
        initialLessonName={editorLessonName}
        initialCards={editorInitialCards}
      />
    </div>
  )
}

export default AddContent
