import { useEffect, useRef, useState } from 'react'
import { Add, TickCircle } from 'iconsax-react'
import { generateMoreQuestions } from '../../data/mockQuestions'
import type { Answer, Question } from '../../data/mockQuestions'
import ToastContainer, { useToast } from '../Toast/Toast'
import CloseButton from '../CloseButton/CloseButton'
import './AIGenerateDrawer.css'

interface AIGenerateDrawerProps {
  onComplete: (savedQuestions: Question[]) => void
}

const STEPS = [
  'Analyzing your lesson',
  'Writing questions',
  'Adding options to your questions',
  'Finishing up',
]

const STEP_DELAY = 750

function SparkleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.6948 9.22578C13.0267 7.85703 14.9733 7.85703 15.3052 9.22578L16.2185 12.992C16.337 13.4807 16.7185 13.8622 17.2072 13.9807L20.9734 14.894C22.3422 15.2259 22.3422 17.1726 20.9734 17.5045L17.2072 18.4177C16.7185 18.5362 16.337 18.9178 16.2185 19.4064L15.3052 23.1727C14.9733 24.5414 13.0267 24.5414 12.6948 23.1727L11.7815 19.4064C11.663 18.9178 11.2815 18.5362 10.7928 18.4177L7.02656 17.5045C5.65781 17.1726 5.65781 15.2259 7.02656 14.894L10.7928 13.9807C11.2815 13.8622 11.663 13.4807 11.7815 12.992L12.6948 9.22578Z" fill="url(#sparkle-gen-gradient)" />
      <path d="M22.3705 6.71184C22.4795 6.26272 23.1182 6.26272 23.2271 6.71184L23.5268 7.94763C23.5657 8.10798 23.6909 8.23318 23.8512 8.27206L25.087 8.57172C25.5361 8.68062 25.5361 9.31938 25.087 9.42828L23.8512 9.72794C23.6909 9.76682 23.5657 9.89202 23.5268 10.0524L23.2271 11.2882C23.1182 11.7373 22.4795 11.7373 22.3705 11.2882L22.0709 10.0524C22.032 9.89202 21.9068 9.76682 21.7465 9.72794L20.5107 9.42828C20.0615 9.31938 20.0615 8.68062 20.5107 8.57172L21.7465 8.27206C21.9068 8.23318 22.032 8.10798 22.0709 7.94763L22.3705 6.71184Z" fill="url(#sparkle-gen-gradient)" />
      <defs>
        <linearGradient id="sparkle-gen-gradient" x1="5" y1="6" x2="26" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00AFC4" />
          <stop offset="1" stopColor="#8158EC" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function CloseSmallIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.75 5.25L5.25 15.75M5.25 5.25L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function RadioIcon({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="8" fill="var(--success-500)" stroke="var(--success-500)" strokeWidth="2"/>
        <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="8" stroke="var(--border)" strokeWidth="2"/>
    </svg>
  )
}

function makeEmptyAnswer(index: number): Answer {
  return {
    id: `ai_drawer_a${Date.now()}_${index}`,
    text: '',
    isCorrect: false,
  }
}

function AIGenerateDrawer({ onComplete }: AIGenerateDrawerProps) {
  const [phase, setPhase] = useState<'generating' | 'reviewing'>('generating')
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([])

  // Local edit state for current review question
  const [editText, setEditText] = useState('')
  const [editAnswers, setEditAnswers] = useState<Answer[]>([])
  const [editExplanation, setEditExplanation] = useState('')

  const textRef = useRef<HTMLTextAreaElement>(null)
  const totalQuestions = generatedQuestions.length
  const { toasts, show: showToast } = useToast()

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Simulate generation steps
  useEffect(() => {
    if (phase !== 'generating') return

    const timers: ReturnType<typeof setTimeout>[] = []

    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setCurrentStep(i)
        setProgress(Math.round(((i + 1) / STEPS.length) * 100))
      }, STEP_DELAY * (i + 1)))
    })

    // Complete generation
    timers.push(setTimeout(() => {
      const questions = generateMoreQuestions()
      setGeneratedQuestions(questions)
      setPhase('reviewing')
      loadQuestion(questions[0])
    }, STEP_DELAY * (STEPS.length + 1)))

    return () => timers.forEach(clearTimeout)
  }, [])

  // Focus textarea when entering review
  useEffect(() => {
    if (phase === 'reviewing') {
      textRef.current?.focus()
    }
  }, [phase, currentIndex])

  function loadQuestion(q: Question) {
    setEditText(q.text)
    setEditAnswers(q.answers.map(a => ({ ...a })))
    setEditExplanation('')
  }

  function advanceOrFinish(newSaved: Question[]) {
    const nextIndex = currentIndex + 1
    if (nextIndex >= totalQuestions) {
      // All reviewed — close after a short delay so toast shows
      setTimeout(() => onComplete(newSaved), 400)
    } else {
      setCurrentIndex(nextIndex)
      loadQuestion(generatedQuestions[nextIndex])
    }
  }

  function handleSave() {
    const currentQ = generatedQuestions[currentIndex]
    const savedQ: Question = {
      ...currentQ,
      text: editText.trim(),
      answers: editAnswers.filter(a => a.text.trim()),
    }
    const newSaved = [...savedQuestions, savedQ]
    setSavedQuestions(newSaved)
    showToast('success', 'Question saved')
    advanceOrFinish(newSaved)
  }

  function handleDiscard() {
    showToast('error', 'Question discarded')
    advanceOrFinish(savedQuestions)
  }

  function handleClose() {
    // Close drawer — previously saved questions are kept
    onComplete(savedQuestions)
  }

  // Answer editing helpers
  function updateAnswer(index: number, updates: Partial<Answer>) {
    setEditAnswers(prev => prev.map((a, i) => i === index ? { ...a, ...updates } : a))
  }

  function setCorrectAnswer(index: number) {
    setEditAnswers(prev => prev.map((a, i) => ({ ...a, isCorrect: i === index })))
  }

  function removeAnswer(index: number) {
    if (editAnswers.length <= 2) return
    setEditAnswers(prev => prev.filter((_, i) => i !== index))
  }

  function addAnswer() {
    setEditAnswers(prev => [...prev, makeEmptyAnswer(prev.length)])
  }

  return (
    <>
      <div className="ai-drawer-overlay" onClick={handleClose} />
      <div className="ai-drawer-panel">
        {/* Header */}
        <div className="ai-drawer-header">
          <h3 className="ai-drawer-title">
            {phase === 'generating' ? 'Generating Questions…' : 'Review Questions'}
          </h3>
          <CloseButton onClick={handleClose} className="ai-drawer-close" />
        </div>
        <div className="ai-drawer-divider" />

        {/* Body */}
        <div className="ai-drawer-body">
          {phase === 'generating' ? (
            <div className="ai-drawer-stepper">
              <div className="ai-drawer-steps">
                {STEPS.map((label, i) => {
                  let status: 'done' | 'active' | 'pending' = 'pending'
                  if (i < currentStep) status = 'done'
                  else if (i === currentStep) status = 'active'

                  return (
                    <div key={i} className={`ai-drawer-step ai-drawer-step--${status}`}>
                      <span className="ai-drawer-step-icon">
                        {status === 'done' ? (
                          <TickCircle size={24} color="var(--success-500)" variant="Bold" />
                        ) : status === 'active' ? (
                          <SparkleIcon size={24} />
                        ) : (
                          <span className="ai-drawer-step-icon--pending" />
                        )}
                      </span>
                      <span>{status === 'active' ? `${label}…` : label}</span>
                    </div>
                  )
                })}
              </div>

              <div className="ai-drawer-progress">
                <div className="ai-drawer-progress-track">
                  <div
                    className="ai-drawer-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="ai-drawer-progress-label">{progress}%</span>
              </div>
            </div>
          ) : (
            <>
              <p className="ai-drawer-review-subtitle">
                Select which quizzes you want to save and which you want to discard. You can always edit them later.
              </p>

              <span className="ai-drawer-review-counter">
                Question {currentIndex + 1}/{totalQuestions}
              </span>

              {/* Question text */}
              <div className="ai-drawer-field">
                <label className="ai-drawer-label">What is your question?</label>
                <textarea
                  ref={textRef}
                  className="ai-drawer-textarea"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  placeholder="Type your question here..."
                  rows={3}
                />
              </div>

              {/* Answer options */}
              <div className="ai-drawer-field">
                <label className="ai-drawer-label">What are the options?</label>
                <div className="ai-drawer-answers">
                  {editAnswers.map((answer, i) => (
                    <div
                      key={answer.id}
                      className={`ai-drawer-answer${answer.isCorrect ? ' ai-drawer-answer--correct' : ''}`}
                    >
                      <button
                        className="ai-drawer-radio"
                        onClick={() => setCorrectAnswer(i)}
                        aria-label={answer.isCorrect ? 'Correct answer' : 'Mark as correct'}
                      >
                        <RadioIcon selected={answer.isCorrect} />
                      </button>
                      <input
                        className="ai-drawer-answer-input"
                        value={answer.text}
                        onChange={e => updateAnswer(i, { text: e.target.value })}
                        placeholder={`Option ${i + 1}...`}
                      />
                      {answer.isCorrect && (
                        <span className="ai-drawer-correct-badge">Correct</span>
                      )}
                      {editAnswers.length > 2 && (
                        <button
                          className="ai-drawer-answer-remove"
                          onClick={() => removeAnswer(i)}
                          aria-label="Remove answer"
                        >
                          <CloseSmallIcon />
                        </button>
                      )}
                    </div>
                  ))}

                  {editAnswers.length < 6 && (
                    <button className="ai-drawer-add-option" onClick={addAnswer}>
                      <Add size={24} color="var(--text-primary)" />
                      <span>Add option</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Explanation */}
              <div className="ai-drawer-field">
                <label className="ai-drawer-label">
                  Add an explanation <span className="ai-drawer-label--regular">(optional)</span>
                </label>
                <div className={`ai-drawer-explanation${editExplanation.trim() ? ' ai-drawer-explanation--filled' : ''}`}>
                  {editExplanation.trim() && (
                    <span className="ai-drawer-explanation-icon">
                      <TickCircle size={24} color="var(--success-500)" variant="Bold" />
                    </span>
                  )}
                  <textarea
                    className="ai-drawer-explanation-input"
                    value={editExplanation}
                    onChange={e => setEditExplanation(e.target.value)}
                    placeholder="Explain the correct answer..."
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer — only in review phase */}
        {phase === 'reviewing' && (
          <div className="ai-drawer-footer">
            <div className="ai-drawer-footer-buttons">
              <button className="ai-drawer-btn-discard" onClick={handleDiscard}>
                Discard
              </button>
              <button className="ai-drawer-btn-save" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </>
  )
}

export default AIGenerateDrawer
