import { useEffect, useRef, useState } from 'react'
import { Add, TickCircle } from 'iconsax-react'
import type { Answer, Question } from '../../data/mockQuestions'
import CloseButton from '../CloseButton/CloseButton'
import './QuestionDrawer.css'

interface QuestionDrawerProps {
  question?: Question
  onSave: (question: Question) => void
  onClose: () => void
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
    id: `drawer_a${Date.now()}_${index}`,
    text: '',
    isCorrect: false,
  }
}

const DEFAULT_ANSWERS: Answer[] = [
  { id: `new_a1_${Date.now()}`, text: '', isCorrect: true },
  { id: `new_a2_${Date.now()}`, text: '', isCorrect: false },
]

function QuestionDrawer({ question, onSave, onClose }: QuestionDrawerProps) {
  const isNew = !question
  const questionType = question?.type ?? 'multiple_choice'
  const [text, setText] = useState(question?.text ?? '')
  const [answers, setAnswers] = useState<Answer[]>(question?.answers ?? DEFAULT_ANSWERS.map(a => ({ ...a, id: `new_a${Date.now()}_${Math.random()}` })))
  const [explanation, setExplanation] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSave = () => {
    const newErrors: string[] = []
    if (!text.trim()) newErrors.push('Question text is required')
    const filledAnswers = answers.filter(a => a.text.trim())
    if (filledAnswers.length < 2) newErrors.push('At least 2 answers are required')
    if (questionType !== 'free_text' && !answers.some(a => a.isCorrect)) {
      newErrors.push('Select at least one correct answer')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    const savedQuestion: Question = question
      ? { ...question, text: text.trim(), answers: answers.filter(a => a.text.trim()) }
      : {
          id: `q_manual_${Date.now()}`,
          text: text.trim(),
          type: 'multiple_choice',
          answers: answers.filter(a => a.text.trim()),
          createdBy: 'manual',
          createdAt: new Date().toISOString(),
        }
    onSave(savedQuestion)
  }

  const updateAnswer = (index: number, updates: Partial<Answer>) => {
    setAnswers(prev => prev.map((a, i) => i === index ? { ...a, ...updates } : a))
    setErrors([])
  }

  const setCorrectAnswer = (index: number) => {
    if (questionType === 'multi_select') {
      setAnswers(prev => prev.map((a, i) => i === index ? { ...a, isCorrect: !a.isCorrect } : a))
    } else {
      setAnswers(prev => prev.map((a, i) => ({ ...a, isCorrect: i === index })))
    }
    setErrors([])
  }

  const removeAnswer = (index: number) => {
    if (answers.length <= 2) return
    setAnswers(prev => prev.filter((_, i) => i !== index))
  }

  const addAnswer = () => {
    setAnswers(prev => [...prev, makeEmptyAnswer(prev.length)])
  }

  return (
    <>
      <div className="question-drawer-overlay" onClick={onClose} />
      <div className="question-drawer-panel">
        {/* Header */}
        <div className="question-drawer-header">
          <h3 className="question-drawer-title">{isNew ? 'Create new question' : 'Edit question'}</h3>
          <CloseButton onClick={onClose} className="question-drawer-close" />
        </div>
        <div className="question-drawer-divider" />

        {/* Body */}
        <div className="question-drawer-body">
          {/* Question text */}
          <div className="question-drawer-field">
            <label className="question-drawer-label">What is your question?</label>
            <textarea
              ref={textRef}
              className="question-drawer-textarea"
              value={text}
              onChange={e => { setText(e.target.value); setErrors([]) }}
              placeholder="Write your question here..."
              rows={3}
            />
          </div>

          {/* Answer options */}
          {questionType !== 'free_text' && (
            <div className="question-drawer-field">
              <label className="question-drawer-label">What are the options?</label>
              <div className="question-drawer-answers">
                {answers.map((answer, i) => (
                  <div
                    key={answer.id}
                    className={`question-drawer-answer${answer.isCorrect ? ' question-drawer-answer--correct' : ''}`}
                  >
                    <button
                      className="question-drawer-radio"
                      onClick={() => setCorrectAnswer(i)}
                      aria-label={answer.isCorrect ? 'Correct answer' : 'Mark as correct'}
                    >
                      <RadioIcon selected={answer.isCorrect} />
                    </button>
                    <input
                      className="question-drawer-answer-input"
                      value={answer.text}
                      onChange={e => updateAnswer(i, { text: e.target.value })}
                      placeholder={`Write option ${i + 1} here`}
                    />
                    {answer.isCorrect && (
                      <span className="question-drawer-correct-badge">Correct</span>
                    )}
                    {answers.length > 2 && (
                      <button
                        className="question-drawer-answer-remove"
                        onClick={() => removeAnswer(i)}
                        aria-label="Remove answer"
                      >
                        <CloseSmallIcon />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add option row */}
                {answers.length < 6 && (
                  <button className="question-drawer-add-option" onClick={addAnswer}>
                    <Add size={24} color="var(--text-primary)" />
                    <span>Add option</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="question-drawer-field">
            <label className="question-drawer-label">
              Add an explanation <span className="question-drawer-label--regular">(optional)</span>
            </label>
            <div className={`question-drawer-explanation${explanation.trim() ? ' question-drawer-explanation--filled' : ''}`}>
              {explanation.trim() && (
                <span className="question-drawer-explanation-icon">
                  <TickCircle size={24} color="var(--success-500)" variant="Bold" />
                </span>
              )}
              <textarea
                className="question-drawer-explanation-input"
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Add an explanation..."
                rows={3}
              />
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="question-drawer-errors">
              {errors.map((err, i) => (
                <p key={i} className="question-drawer-error">{err}</p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="question-drawer-footer">
          <button className="question-drawer-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  )
}

export default QuestionDrawer
