import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { generateMoreQuestions } from '../../data/mockQuestions'
import type { Answer, Question } from '../../data/mockQuestions'
import ToastContainer, { useToast } from '../Toast/Toast'
import Button from '../Button/Button'
import CloseButton from '../CloseButton/CloseButton'
import QuestionCard from '@/pages/your-courses/components/QuestionCard/QuestionCard'
import Collapse from '../Collapse/Collapse'
import AIWorkingCard from '../AIWorkingCard/AIWorkingCard'
import { ARRIVE, arriveTransition } from '../AIWorkingCard/arrive'
import { useTyped, prefersReducedMotion } from '../AIWorkingCard/useTyped'
import './AIGenerateDrawer.css'

interface AIGenerateDrawerProps {
  onComplete: (savedQuestions: Question[]) => void
  lessonTitle?: string
}

const STEPS = [
  'Reading the lesson',
  'Writing the questions',
  'Adding the answer options',
  'All done, your questions are ready',
]

/* How long each pass holds the screen. The reveal below is paced to these: the question
   types itself in during the second pass and the options one by one during the third,
   as the course builder's generate drawer does. */
const READING_MS = 1200
const QUESTION_MS = 1400
const OPTION_MS = 700
const DONE_MS = 700
const WRITING = 1
const OPTIONS = 2

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
      <circle cx="9" cy="9" r="8" stroke="var(--border-elevated)" strokeWidth="2"/>
    </svg>
  )
}

/**
 * The first question writing itself in while the AI works, in the same field and option
 * rows the review then opens on. Nothing while the lesson is read; the question types in
 * during the writing pass, then one option at a time. Whatever is still being written
 * wears the shared `.is-writing` shimmer (AIWorkingCard.css), as in the course builder.
 */
function LiveQuestion({ question, activeStep }: { question: Question; activeStep: number }) {
  const reduce = useReducedMotion()
  const text = useTyped(question.text, activeStep === WRITING, QUESTION_MS * 0.8)
  const [landed, setLanded] = useState(0)

  useEffect(() => {
    if (activeStep < OPTIONS) {
      setLanded(0)
      return
    }
    if (activeStep > OPTIONS || prefersReducedMotion()) {
      setLanded(question.answers.length)
      return
    }
    setLanded(1)
    const id = window.setInterval(
      () => setLanded(n => Math.min(question.answers.length, n + 1)),
      OPTION_MS,
    )
    return () => window.clearInterval(id)
  }, [activeStep, question.answers.length])

  if (activeStep < WRITING) return null

  return (
    <div className="ai-drawer-live ai-drawer-question-card" aria-hidden="true">
      <motion.div className="ai-drawer-field" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
        <span className="ai-drawer-label">What is your question?</span>
        <div className={`ai-drawer-live-input${text.done ? '' : ' is-writing'}`}>
          {text.shown}
          {!text.done && <span className="ai-drawer-caret" />}
        </div>
      </motion.div>

      {landed > 0 && (
        <motion.div className="ai-drawer-field" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
          <span className="ai-drawer-label">What are the options?</span>
          <div className="ai-drawer-answers">
            {question.answers.slice(0, landed).map((answer, i) => (
              <LiveOption
                key={answer.id}
                text={answer.text}
                writing={activeStep === OPTIONS && i === landed - 1}
                reduce={reduce}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function LiveOption({ text, writing, reduce }: { text: string; writing: boolean; reduce: boolean | null }) {
  const typed = useTyped(text, writing, OPTION_MS * 0.7)
  return (
    <motion.div
      className={`ai-drawer-answer ai-drawer-live-answer${writing && !typed.done ? ' is-writing' : ''}`}
      layout="position"
      {...ARRIVE(reduce)}
      transition={arriveTransition(reduce)}
    >
      <span className="ai-drawer-radio">
        <RadioIcon selected={false} />
      </span>
      <span className="ai-drawer-live-text">
        {typed.shown}
        {writing && !typed.done && <span className="ai-drawer-caret" />}
      </span>
    </motion.div>
  )
}

/* The line under the pass name, as in the course builder's situational test: what the
   pass is on right now. The last pass is the conclusion, so it has none. */
function stepDetail(step: number, lessonTitle: string | undefined, first: Question | undefined) {
  if (step === 0) return lessonTitle ? `Reading "${lessonTitle}"` : 'Reading the lesson content'
  if (step === WRITING) return 'Writing a multiple-choice question'
  if (step === OPTIONS && first) return `Writing ${first.answers.length} options and marking the correct one`
  return undefined
}

function makeEmptyAnswer(index: number): Answer {
  return {
    id: `ai_drawer_a${Date.now()}_${index}`,
    text: '',
    isCorrect: false,
  }
}

function AIGenerateDrawer({ onComplete, lessonTitle }: AIGenerateDrawerProps) {
  const [phase, setPhase] = useState<'generating' | 'reviewing'>('generating')
  const reduce = useReducedMotion()
  const [currentStep, setCurrentStep] = useState(0)
  const [generatedQuestions] = useState<Question[]>(() => generateMoreQuestions())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([])

  // Local edit state for current review question
  const [editText, setEditText] = useState('')
  const [editAnswers, setEditAnswers] = useState<Answer[]>([])
  const [editExplanation, setEditExplanation] = useState('')
  const [cardOpen, setCardOpen] = useState(true)

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

  // Simulate generation passes
  useEffect(() => {
    if (phase !== 'generating') return

    const optionsMs = OPTION_MS * Math.max(1, generatedQuestions[0]?.answers.length ?? 1)
    const starts = [0, READING_MS, READING_MS + QUESTION_MS, READING_MS + QUESTION_MS + optionsMs]
    const timers = starts.map((at, i) => setTimeout(() => setCurrentStep(i), at))

    // Complete generation: the review opens on the question that was just written
    timers.push(setTimeout(() => {
      setPhase('reviewing')
      loadQuestion(generatedQuestions[0])
    }, starts[starts.length - 1] + DONE_MS))

    return () => timers.forEach(clearTimeout)
  }, [])

  function loadQuestion(q: Question) {
    setEditText(q.text)
    setEditAnswers(q.answers.map(a => ({ ...a })))
    setEditExplanation('')
    setCardOpen(true)
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
          <div className="ai-drawer-headline">
            <h3 className="ai-drawer-title">
              {phase === 'generating' ? 'Generating Questions…' : 'Review Questions'}
            </h3>
            <Collapse open={phase !== 'generating'}>
              <p className="ai-drawer-review-subtitle">
                Select which quizzes you want to save and which you want to discard. You can always edit them later.
              </p>
            </Collapse>
          </div>
          <CloseButton onClick={handleClose} className="ai-drawer-close" />
        </div>
        <div className="ai-drawer-divider" />

        {/* Body */}
        <div className="ai-drawer-body">
          {/* The wait and each question are screens: the one on screen leaves upward as
              the next rises into its place, as in the course builder's generate drawer.
              AnimatePresence keeps the leaving screen's last render, so it shows the
              question it was, not the one loading in. */}
          <AnimatePresence mode="wait" initial={false}>
          {phase === 'generating' ? (
            <motion.div
              key="working"
              className="ai-drawer-phase"
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={arriveTransition(reduce)}
            >
              <AIWorkingCard
                className="ai-drawer-working"
                steps={STEPS}
                activeStep={currentStep}
                detail={stepDetail(currentStep, lessonTitle, generatedQuestions[0])}
                singleLine
              />
              {generatedQuestions[0] && (
                <LiveQuestion question={generatedQuestions[0]} activeStep={currentStep} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`question-${currentIndex}`}
              className="ai-drawer-phase"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={arriveTransition(reduce)}
            >
              {/* The course builder's question card, so both AI reviews read the same:
                  "Question 1/6" and the format in the card's own head. */}
              <QuestionCard
                question={{
                  id: `ai-q-${currentIndex}`,
                  text: editText,
                  options: editAnswers.map(a => a.text),
                  correctIndex: editAnswers.findIndex(a => a.isCorrect),
                  format: 'single-choice',
                  explanation: editExplanation,
                }}
                label={`Question ${currentIndex + 1}/${totalQuestions}`}
                format="single-choice"
                isOpen={cardOpen}
                onToggle={() => setCardOpen(v => !v)}
                readOnly={false}
                generated
                edit={{
                  onChange: (patch) => {
                    if (patch.text !== undefined) setEditText(patch.text)
                    if (patch.explanation !== undefined) setEditExplanation(patch.explanation)
                    if (patch.correctIndex !== undefined) setCorrectAnswer(patch.correctIndex)
                  },
                  onOptionChange: (i, value) => updateAnswer(i, { text: value }),
                  onAddOption: addAnswer,
                  onRemoveOption: removeAnswer,
                  onBlur: () => {},
                  errors: { text: false, options: false, correctBlank: false },
                }}
              />
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Footer — only in review phase */}
        <AnimatePresence initial={false}>
        {phase === 'reviewing' && (
          <motion.div
            className="ai-drawer-footer"
            {...ARRIVE(reduce)}
            transition={arriveTransition(reduce)}
          >
            <div className="ai-drawer-footer-buttons">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outlined-2" onClick={handleDiscard}>Discard</Button>
              <ToastContainer toasts={toasts} className="ai-drawer-toasts" />
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

    </>
  )
}

export default AIGenerateDrawer
