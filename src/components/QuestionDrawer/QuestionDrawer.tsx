import { useState } from 'react'
import { Add, Danger, TickCircle } from 'iconsax-react'
import type { Answer, Question } from '../../data/mockQuestions'
import Button from '../Button/Button'
import ConfirmModal from '../ConfirmModal/ConfirmModal'
import InputField from '../InputField/InputField'
import SideDrawer from '../SideDrawer/SideDrawer'
import './QuestionDrawer.css'

interface QuestionDrawerProps {
  open: boolean
  question?: Question
  onSave: (question: Question) => void
  onClose: () => void
  /** Editing an existing question: offers Delete Question in the footer (the bank row
   *  carries only Edit, per the DS Assessment admin row). */
  onDelete?: () => void
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

const initialAnswers = (question?: Question) =>
  question?.answers ?? DEFAULT_ANSWERS.map(a => ({ ...a, id: `new_a${Date.now()}_${Math.random()}` }))

function QuestionDrawer({ open, question, onSave, onClose, onDelete }: QuestionDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  /* The drawer stays mounted so it can slide out, and the host clears `question` as it
     closes. Hold what was opened (and whether it could be deleted) until the next open,
     which starts the form afresh. */
  const [shown, setShown] = useState(question)
  const [canDelete, setCanDelete] = useState(!!onDelete)
  const [wasOpen, setWasOpen] = useState(open)
  const isNew = !shown
  const questionType = shown?.type ?? 'multiple_choice'
  const [text, setText] = useState(question?.text ?? '')
  const [answers, setAnswers] = useState<Answer[]>(() => initialAnswers(question))
  const [explanation, setExplanation] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setShown(question)
      setCanDelete(!!onDelete)
      setText(question?.text ?? '')
      setAnswers(initialAnswers(question))
      setExplanation('')
      setErrors([])
      setConfirmDelete(false)
    }
  }

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

    const savedQuestion: Question = shown
      ? { ...shown, text: text.trim(), answers: answers.filter(a => a.text.trim()) }
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
      <SideDrawer
        open={open}
        onClose={onClose}
        title={isNew ? 'Create new question' : 'Edit question'}
        bodyClassName="question-drawer-body"
        footer={
          <>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outlined-2" onClick={onClose}>Cancel</Button>
            {canDelete && (
              <Button
                className="question-drawer-delete"
                semantic="danger"
                variant="outlined"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Question
              </Button>
            )}
          </>
        }
      >
        {/* Question text */}
        {/* The drawer focuses its first control (the close button) unless one is marked
            data-autofocus; InputField doesn't pass that through, so mark its input here. */}
        <div ref={el => { el?.querySelector('input')?.setAttribute('data-autofocus', '') }}>
          <InputField
            label="What is your question?"
            placeholder="Write your question here..."
            value={text}
            onChange={e => { setText(e.target.value); setErrors([]) }}
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
      </SideDrawer>

      <ConfirmModal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <div className="confirm-modal-header confirm-modal-header--center">
          <div className="confirm-modal-icon">
            <Danger size={72} color="var(--danger-500)" variant="Linear" />
          </div>
          <h2 className="confirm-modal-title">Delete question</h2>
          <p className="confirm-modal-body">
            This question will be removed from the lesson's question bank. This can't be undone.
          </p>
        </div>
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            semantic="danger"
            onClick={() => {
              setConfirmDelete(false)
              onDelete?.()
            }}
          >
            Delete Question
          </Button>
        </div>
      </ConfirmModal>
    </>
  )
}

export default QuestionDrawer
