import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Add,
  AddSquare,
  ArrowLeft2,
  ArrowRight2,
  ArrowRotateLeft,
  Brush2,
  Copy,
  Edit2,
  Gallery,
  GalleryAdd,
  TextalignLeft,
  Trash,
  TextBold,
  TextItalic,
  TextUnderline,
} from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import InputField from '../../../../components/InputField/InputField'
import Checkbox from '../../../../components/Checkbox/Checkbox'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import AddImageModal from '../AddImageModal/AddImageModal'
import type { ContentRow } from '../../../your-courses/components/ContentTable/ContentTable'
import './FlashcardEditor.css'

export interface Card {
  id: number
  title: string
  description: string
  image?: string
  imageAlign?: 'top' | 'bottom'
}

interface FlashcardEditorProps {
  open: boolean
  onClose: () => void
  onPublish: (lesson: ContentRow) => void
  mode?: 'create' | 'edit'
  initialLessonId?: number
  initialLessonName?: string
  initialCards?: Card[]
}

type EditorTab = 'quiz' | 'skills' | 'category'

const createEmptyCard = (): Card => ({
  id: Date.now() + Math.random(),
  title: '',
  description: '',
})

const seedCards = (): Card[] => [createEmptyCard(), createEmptyCard(), createEmptyCard()]

const placeholderFor = (index: number): { title: string; description: string } => {
  if (index === 0) return { title: 'Your card title goes here', description: 'Add the main content for this card' }
  if (index === 1) return { title: 'Give your next card a title', description: 'Describe the key idea in a sentence or two' }
  if (index === 2) return { title: 'Keep building your lesson', description: 'Add another idea, fact, or example' }
  return { title: 'Your card title goes here', description: 'Add the main content for this card' }
}

const AiSparkleIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.52 5.42c.33-1.37 2.28-1.37 2.61 0l1.14 4.71c.12.49.5.87.99.99l4.71 1.14c1.37.33 1.37 2.28 0 2.61l-4.71 1.14c-.49.12-.87.5-.99.99l-1.14 4.71c-.33 1.37-2.28 1.37-2.61 0l-1.14-4.71a1.45 1.45 0 0 0-.99-.99l-4.71-1.14c-1.37-.33-1.37-2.28 0-2.61l4.71-1.14c.49-.12.87-.5.99-.99l1.14-4.71Z"
      fill="url(#fce-sparkle-gradient)"
    />
    <path
      d="M17.88 2.58c.11-.45.75-.45.86 0l.3 1.23c.04.16.16.28.33.33l1.23.3c.45.11.45.75 0 .86l-1.23.3c-.16.04-.28.16-.33.33l-.3 1.23c-.11.45-.75.45-.86 0l-.3-1.23a.42.42 0 0 0-.33-.33l-1.23-.3c-.45-.11-.45-.75 0-.86l1.23-.3c.16-.04.28-.16.33-.33l.3-1.23Z"
      fill="url(#fce-sparkle-gradient)"
    />
    <defs>
      <linearGradient id="fce-sparkle-gradient" x1="3" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00AFC4" />
        <stop offset="1" stopColor="#8158EC" />
      </linearGradient>
    </defs>
  </svg>
)

const FontIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14.5 L8 5.5 L12 14.5 M5.6 11.5 L10.4 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 17 H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const NumberedListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3.5 L3.5 3 V8 M2.5 8 H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 12.5 Q2.5 11.5 3.5 11.5 Q4.5 11.5 4.5 12.5 Q4.5 13.3 2.5 15 H4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M7 5.5 H17 M7 13 H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const BulletListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="3.5" cy="5.5" r="1.1" fill="currentColor" />
    <circle cx="3.5" cy="13" r="1.1" fill="currentColor" />
    <path d="M7 5.5 H17 M7 13 H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const AlignIcon = ({ align }: { align: 'top' | 'bottom' }) => {
  const solid = align === 'top' ? { x: 3, y: 4, w: 14, h: 3 } : { x: 3, y: 13, w: 14, h: 3 }
  const dashed = align === 'top' ? { x: 3, y: 9, w: 14, h: 7 } : { x: 3, y: 4, w: 14, h: 7 }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect
        x={dashed.x}
        y={dashed.y}
        width={dashed.w}
        height={dashed.h}
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        fill="none"
      />
      <rect
        x={solid.x}
        y={solid.y}
        width={solid.w}
        height={solid.h}
        rx="1"
        fill="currentColor"
      />
    </svg>
  )
}

const DragHandleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="5" cy="3" r="1.25" fill="var(--text-tertiary)" />
    <circle cx="11" cy="3" r="1.25" fill="var(--text-tertiary)" />
    <circle cx="5" cy="8" r="1.25" fill="var(--text-tertiary)" />
    <circle cx="11" cy="8" r="1.25" fill="var(--text-tertiary)" />
    <circle cx="5" cy="13" r="1.25" fill="var(--text-tertiary)" />
    <circle cx="11" cy="13" r="1.25" fill="var(--text-tertiary)" />
  </svg>
)

function FlashcardEditor({ open, onClose, onPublish, mode = 'create', initialLessonId, initialLessonName = '', initialCards }: FlashcardEditorProps) {
  const [lessonName, setLessonName] = useState(initialLessonName)
  const [cards, setCards] = useState<Card[]>(() => initialCards && initialCards.length > 0 ? initialCards : seedCards())
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<EditorTab>('quiz')
  const [aiQuizChecked, setAiQuizChecked] = useState(false)
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [imageMenuOpen, setImageMenuOpen] = useState(false)
  const [imageSubmenuOpen, setImageSubmenuOpen] = useState(false)
  const [addImageModalOpen, setAddImageModalOpen] = useState(false)
  const [addImageModalTab, setAddImageModalTab] = useState<'upload' | 'generate'>('upload')
  const [showAiNudge, setShowAiNudge] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('flashcard-ai-image-nudge-seen') !== 'true',
  )
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const imageMenuRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)

  useEffect(() => {
    if (!open || !trackRef.current) return
    const el = trackRef.current
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setTrackWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setTrackWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [open])

  useEffect(() => {
    const nextCards = initialCards && initialCards.length > 0 ? initialCards : seedCards()
    if (!open) {
      setLessonName(initialLessonName)
      setCards(nextCards)
      setActiveIndex(0)
      setActiveTab('quiz')
      setAiQuizChecked(false)
      setToolbarOpen(false)
    } else {
      setLessonName(initialLessonName)
      setCards(nextCards)
    }
  }, [open, initialLessonName, initialCards])

  useEffect(() => {
    setToolbarOpen(false)
    setImageMenuOpen(false)
    setImageSubmenuOpen(false)
  }, [activeIndex])

  useEffect(() => {
    if (!imageMenuOpen) {
      setImageSubmenuOpen(false)
      return
    }
    const onClick = (e: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
        setImageMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [imageMenuOpen])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const activeCard = cards[activeIndex]
  const hasCardContent = cards.some(c => c.title.trim().length > 0 || c.description.trim().length > 0)
  const canPublish = lessonName.trim().length > 0 && hasCardContent
  const disabledReason = !lessonName.trim()
    ? 'Add a name for your lesson'
    : !hasCardContent
      ? 'Add content to at least one card'
      : ''

  const updateActive = (patch: Partial<Card>) => {
    setCards(prev => prev.map((c, i) => (i === activeIndex ? { ...c, ...patch } : c)))
  }

  const dismissAiNudge = () => {
    if (showAiNudge) {
      setShowAiNudge(false)
      try { localStorage.setItem('flashcard-ai-image-nudge-seen', 'true') } catch {}
    }
  }

  const handlePickImage = () => {
    setImageMenuOpen(false)
    setImageSubmenuOpen(false)
    setAddImageModalTab('upload')
    setAddImageModalOpen(true)
  }

  const handleStartGenerate = () => {
    dismissAiNudge()
    setImageMenuOpen(false)
    setImageSubmenuOpen(false)
    setAddImageModalTab('generate')
    setAddImageModalOpen(true)
  }

  const handleAddBackground = () => {
    setImageMenuOpen(false)
    setImageSubmenuOpen(false)
    // TODO: wire up background picker
  }

  const handleAlignImage = (align: 'top' | 'bottom') => {
    updateActive({ imageAlign: align })
    setImageMenuOpen(false)
    setImageSubmenuOpen(false)
  }

  const handleRemoveImage = () => {
    updateActive({ image: undefined, imageAlign: undefined })
    setImageMenuOpen(false)
    setImageSubmenuOpen(false)
  }

  const handleAddCard = () => {
    const next = createEmptyCard()
    setCards(prev => {
      const copy = [...prev]
      copy.splice(activeIndex + 1, 0, next)
      return copy
    })
    setActiveIndex(i => i + 1)
  }

  const handleDuplicate = () => {
    const clone: Card = { ...activeCard, id: Date.now() + Math.random() }
    setCards(prev => {
      const copy = [...prev]
      copy.splice(activeIndex + 1, 0, clone)
      return copy
    })
    setActiveIndex(i => i + 1)
  }

  const handleDelete = () => {
    if (cards.length === 1) {
      setCards([createEmptyCard()])
      setActiveIndex(0)
      return
    }
    setCards(prev => prev.filter((_, i) => i !== activeIndex))
    setActiveIndex(i => Math.max(0, i - (activeIndex === cards.length - 1 ? 1 : 0)))
  }

  const handlePrev = () => setActiveIndex(i => Math.max(0, i - 1))
  const handleNext = () => setActiveIndex(i => Math.min(cards.length - 1, i + 1))

  const handleDragStart = (i: number) => (e: React.DragEvent) => {
    setDragIndex(i)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(i))
  }

  const handleDragOver = (i: number) => (e: React.DragEvent) => {
    if (dragIndex === null || dragIndex === i) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(i)
  }

  const handleDrop = (i: number) => (e: React.DragEvent) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    setCards(prev => {
      const copy = [...prev]
      const [moved] = copy.splice(dragIndex, 1)
      copy.splice(i, 0, moved)
      return copy
    })
    setActiveIndex(i)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handlePublish = () => {
    if (!canPublish) return
    const lesson: ContentRow = {
      id: initialLessonId ?? Date.now(),
      fileName: lessonName.trim(),
      type: 'Flashcards',
      uploadedBy: 'You',
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      thumbColor: 'linear-gradient(135deg, #4B3A99, #2B1F6B)',
    }
    onPublish(lesson)
  }

  const pagination = useMemo(() => cards.map((_, i) => i), [cards.length])

  const CARD_STEP = 336
  const stripWidth = cards.length * 320 + (cards.length - 1) * 16
  const maxShift = Math.max(0, stripWidth - trackWidth)
  const shift = Math.min(activeIndex * CARD_STEP, maxShift)

  if (!open) return null

  return (
    <div className="fce-overlay" role="dialog" aria-modal="true" aria-label="Create flashcard lesson">
      <CloseButton className="fce-close" onClick={onClose} ariaLabel="Close flashcard editor" />

      <div className="fce-content">
        {/* Header */}
        <div className="fce-header">
          <h1 className="fce-title">{mode === 'edit' ? 'Edit Flashcard' : 'Create Flashcard'}</h1>
          <div className="fce-header-actions">
            <button type="button" className="fce-icon-btn" aria-label="AI actions">
              <AiSparkleIcon size={24} />
            </button>
            <button type="button" className="btn-outlined">
              Edit Theme
              <Brush2 size={20} color="currentColor" variant="Linear" />
            </button>
            <Tooltip
              text={disabledReason}
              position="Bottom"
              alignment="End"
              icon={false}
              disabled={canPublish}
            >
              <button
                type="button"
                className="btn-primary fce-publish"
                disabled={!canPublish}
                onClick={handlePublish}
              >
                {mode === 'edit' ? 'Update Lesson' : 'Publish Lesson'}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Lesson name */}
        <InputField
          label="Name of the lesson"
          placeholder="Add a title to your lesson"
          value={lessonName}
          onChange={(e) => setLessonName(e.target.value)}
        />

        {/* Flashcards carousel */}
        <div className="fce-cards">
          <div className="fce-cards-row">
            <button
              type="button"
              className="fce-chev fce-chev--left"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous card"
            >
              <ArrowLeft2 size={24} color="currentColor" variant="Linear" />
            </button>

            <div className="fce-cards-track" ref={trackRef}>
              <div
                className="fce-cards-strip"
                style={{ transform: `translateX(-${shift}px)` }}
              >
                {cards.map((card, i) => {
                  const isActive = i === activeIndex
                  const ph = placeholderFor(i)
                  return (
                    <div
                      key={card.id}
                      className={`fce-card-slot${isActive ? ' fce-card-slot--active' : ''}${dragIndex === i ? ' fce-card-slot--dragging' : ''}${dragOverIndex === i ? ' fce-card-slot--drag-over' : ''}`}
                      onClick={() => !isActive && setActiveIndex(i)}
                      onDragOver={handleDragOver(i)}
                      onDrop={handleDrop(i)}
                    >
                      <div
                        className="fce-drag"
                        draggable
                        onDragStart={handleDragStart(i)}
                        onDragEnd={handleDragEnd}
                        aria-hidden="true"
                      >
                        <DragHandleIcon />
                      </div>
                      <div
                        className={`fce-card${card.image ? ' fce-card--with-image' : ''}${card.image && card.imageAlign === 'bottom' ? ' fce-card--image-bottom' : ''}`}
                      >
                        {card.image && (
                          <div className="fce-card-image">
                            <img src={card.image} alt="" />
                          </div>
                        )}
                        {isActive && toolbarOpen && (
                          <div className="fce-toolbar" aria-hidden="true">
                            <button type="button" className="fce-toolbar-btn"><FontIcon /></button>
                            <button type="button" className="fce-toolbar-btn"><TextBold size={20} color="currentColor" variant="Linear" /></button>
                            <button type="button" className="fce-toolbar-btn"><TextItalic size={20} color="currentColor" variant="Linear" /></button>
                            <button type="button" className="fce-toolbar-btn"><TextUnderline size={20} color="currentColor" variant="Linear" /></button>
                            <button type="button" className="fce-toolbar-btn"><NumberedListIcon /></button>
                            <button type="button" className="fce-toolbar-btn"><BulletListIcon /></button>
                            <button type="button" className="fce-toolbar-btn"><ArrowRotateLeft size={20} color="currentColor" variant="Linear" /></button>
                          </div>
                        )}
                        <textarea
                          className="fce-card-title"
                          placeholder={ph.title}
                          value={card.title}
                          onChange={(e) => isActive && updateActive({ title: e.target.value })}
                          readOnly={!isActive}
                          rows={2}
                        />
                        <textarea
                          className="fce-card-desc"
                          placeholder={ph.description}
                          value={card.description}
                          onChange={(e) => isActive && updateActive({ description: e.target.value })}
                          readOnly={!isActive}
                        />
                      </div>
                      {isActive && (
                        <div className="fce-card-actions">
                          <Tooltip text="Edit text" position="Top" icon={false}>
                            <button type="button" className="fce-card-action" aria-label="Edit text" onClick={() => setToolbarOpen(v => !v)}><Edit2 size={20} color="var(--text-primary)" variant="Linear" /></button>
                          </Tooltip>
                          <div className="fce-card-action-wrap" ref={imageMenuRef}>
                            <Tooltip
                              text={card.image ? 'Edit image' : 'Add image'}
                              position="Top"
                              icon={false}
                              disabled={imageMenuOpen}
                            >
                              <button
                                type="button"
                                className={`fce-card-action${imageMenuOpen ? ' fce-card-action--active' : ''}`}
                                aria-label={card.image ? 'Edit image' : 'Add image'}
                                aria-haspopup="menu"
                                aria-expanded={imageMenuOpen}
                                onClick={() => {
                                  setImageMenuOpen(v => !v)
                                  dismissAiNudge()
                                }}
                              >
                                <Gallery size={20} color="var(--text-primary)" variant="Linear" />
                                {showAiNudge && <span className="fce-card-action-nudge" aria-hidden="true" />}
                              </button>
                            </Tooltip>
                            {showAiNudge && isActive && !imageMenuOpen && (
                              <div className="fce-coachmark" role="dialog" aria-label="New feature: AI image generation">
                                <span className="fce-coachmark__badge">New</span>
                                <p className="fce-coachmark__title">Generate flashcard images with AI in seconds</p>
                                <div className="fce-coachmark__cta-row">
                                  <button
                                    type="button"
                                    className="fce-coachmark__dismiss"
                                    onClick={dismissAiNudge}
                                  >
                                    Dismiss
                                  </button>
                                  <button
                                    type="button"
                                    className="fce-coachmark__primary"
                                    onClick={handleStartGenerate}
                                  >
                                    Add Image
                                  </button>
                                </div>
                                <span className="fce-coachmark__caret" aria-hidden="true" />
                              </div>
                            )}
                            {imageMenuOpen && (
                              <div className="fce-image-menu" role="menu">
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="fce-image-menu-item"
                                  onClick={handleAddBackground}
                                >
                                  <span className="fce-image-menu-icon fce-image-menu-icon--solid">
                                    <TextalignLeft size={16} color="var(--neutral-0)" variant="Bold" />
                                  </span>
                                  <span>Add background</span>
                                </button>
                                {card.image ? (
                                  <div
                                    className="fce-image-menu-submenu-host"
                                    onMouseEnter={() => setImageSubmenuOpen(true)}
                                    onMouseLeave={() => setImageSubmenuOpen(false)}
                                  >
                                    <button
                                      type="button"
                                      role="menuitem"
                                      aria-haspopup="menu"
                                      aria-expanded={imageSubmenuOpen}
                                      className={`fce-image-menu-item fce-image-menu-item--has-submenu${imageSubmenuOpen ? ' fce-image-menu-item--submenu-open' : ''}`}
                                      onFocus={() => setImageSubmenuOpen(true)}
                                    >
                                      <span className="fce-image-menu-icon">
                                        <Gallery size={20} color="var(--text-primary)" variant="Linear" />
                                      </span>
                                      <span className="fce-image-menu-label">Edit image</span>
                                      <ArrowRight2 size={16} color="var(--text-secondary)" variant="Linear" />
                                    </button>
                                    {imageSubmenuOpen && (
                                      <div className="fce-image-submenu" role="menu">
                                        <button
                                          type="button"
                                          role="menuitem"
                                          className="fce-image-menu-item"
                                          onClick={() => handleAlignImage('top')}
                                        >
                                          <span className="fce-image-menu-icon">
                                            <AlignIcon align="top" />
                                          </span>
                                          <span>Align top</span>
                                        </button>
                                        <button
                                          type="button"
                                          role="menuitem"
                                          className="fce-image-menu-item"
                                          onClick={() => handleAlignImage('bottom')}
                                        >
                                          <span className="fce-image-menu-icon">
                                            <AlignIcon align="bottom" />
                                          </span>
                                          <span>Align bottom</span>
                                        </button>
                                        <button
                                          type="button"
                                          role="menuitem"
                                          className="fce-image-menu-item fce-image-menu-item--danger"
                                          onClick={handleRemoveImage}
                                        >
                                          <span className="fce-image-menu-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                              <path
                                                d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          </span>
                                          <span>Remove</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="fce-image-menu-item"
                                    onClick={handlePickImage}
                                  >
                                    <span className="fce-image-menu-icon">
                                      <Gallery size={20} color="var(--text-primary)" variant="Linear" />
                                    </span>
                                    <span>Add image</span>
                                  </button>
                                )}
                                <span className="fce-image-menu-caret" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <Tooltip text="Add card" position="Top" icon={false}>
                            <button type="button" className="fce-card-action" aria-label="Add card" onClick={handleAddCard}><AddSquare size={20} color="var(--text-primary)" variant="Linear" /></button>
                          </Tooltip>
                          <Tooltip text="Duplicate card" position="Top" icon={false}>
                            <button type="button" className="fce-card-action" aria-label="Duplicate card" onClick={handleDuplicate}><Copy size={20} color="var(--text-primary)" variant="Linear" /></button>
                          </Tooltip>
                          <Tooltip text="Delete card" position="Top" icon={false}>
                            <button type="button" className="fce-card-action" aria-label="Delete card" onClick={handleDelete}><Trash size={20} color="var(--text-primary)" variant="Linear" /></button>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              className="fce-chev fce-chev--right"
              onClick={handleNext}
              disabled={activeIndex === cards.length - 1}
              aria-label="Next card"
            >
              <ArrowRight2 size={24} color="currentColor" variant="Linear" />
            </button>
          </div>

          {/* Pagination */}
          <div className="fce-pagination">
            {pagination.map(i => (
              <button
                key={i}
                type="button"
                className={`fce-page${i === activeIndex ? ' fce-page--active' : ''}`}
                onClick={() => setActiveIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Select thumbnail */}
        <div className="fce-thumb">
          <p className="fce-thumb-label">Select thumbnail</p>
          <div className="fce-thumb-row">
            <div className="fce-thumb-preview" style={{ background: 'linear-gradient(135deg, #4B3A99, #2B1F6B)' }}>
              <span className="fce-thumb-gallery-btn" aria-hidden="true">
                <GalleryAdd size={14} color="#ffffff" variant="Linear" />
              </span>
            </div>
            <div className="fce-thumb-info">
              <p className="fce-thumb-desc">Upload a 256 x 256 px image, PNG or JPEG format. This image shows up in your lesson thumbnails.</p>
              <button type="button" className="fce-thumb-change">Change Image</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="fce-tabs">
          {(['quiz', 'skills', 'category'] as EditorTab[]).map(t => (
            <button
              key={t}
              type="button"
              className={`fce-tab${activeTab === t ? ' fce-tab--active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'quiz' && 'Quiz'}
              {t === 'skills' && 'Skills'}
              {t === 'category' && 'Add to Category'}
            </button>
          ))}
        </div>

        {activeTab === 'quiz' && (
          <div className="fce-quiz">
            <div className="fce-quiz-banner">
              <Checkbox checked={aiQuizChecked} onChange={() => setAiQuizChecked(v => !v)} />
              <div className="fce-quiz-banner-info">
                <div className="fce-quiz-banner-head">
                  <span className="fce-quiz-banner-title">Generate AI Quizzes</span>
                  <AiSparkleIcon size={20} />
                </div>
                <p className="fce-quiz-banner-desc">AI generated quizzes will be available for review after the lesson is published</p>
              </div>
            </div>
            <button type="button" className="fce-add-question">
              Add Question Manually
              <Add size={20} color="var(--text-primary)" variant="Linear" />
            </button>
          </div>
        )}
      </div>

      <AddImageModal
        open={addImageModalOpen}
        onClose={() => setAddImageModalOpen(false)}
        onSelect={(url) => updateActive({ image: url })}
        initialTab={addImageModalTab}
        cardContent={{
          title: cards[activeIndex]?.title,
          description: cards[activeIndex]?.description,
        }}
      />
    </div>
  )
}

export default FlashcardEditor
