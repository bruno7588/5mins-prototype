import { useEffect, useRef, useState } from 'react'
import { Add, CloseCircle, TickCircle } from 'iconsax-react'
import type { Answer, Question } from '../../data/mockQuestions'
import './QuestionEditor.css'

interface QuestionEditorProps {
  question?: Question
  onSave: (question: Question) => void
  onCancel: () => void
  isNew?: boolean
}

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'multi_select', label: 'Select all that apply' },
  { value: 'true_false', label: 'True or false' },
  { value: 'free_text', label: 'Free text' },
] as const

function makeEmptyAnswer(index: number): Answer {
  return {
    id: `new_a${Date.now()}_${index}`,
    text: '',
    isCorrect: false,
  }
}

function QuestionEditor({ question, onSave, onCancel, isNew }: QuestionEditorProps) {
  const [text, setText] = useState(question?.text ?? '')
  const [type, setType] = useState<Question['type']>(question?.type ?? 'multiple_choice')
  const [answers, setAnswers] = useState<Answer[]>(
    question?.answers ?? [
      makeEmptyAnswer(0),
      makeEmptyAnswer(1),
      makeEmptyAnswer(2),
      makeEmptyAnswer(3),
    ]
  )
  const [errors, setErrors] = useState<string[]>([])
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textRef.current?.focus()
  }, [])

  const handleSave = () => {
    const newErrors: string[] = []
    if (!text.trim()) newErrors.push('Question text is required')
    const filledAnswers = answers.filter(a => a.text.trim())
    if (filledAnswers.length < 2) newErrors.push('At least 2 answers are required')
    if (type !== 'free_text' && !answers.some(a => a.isCorrect)) newErrors.push('Select at least one correct answer')

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      id: question?.id ?? `manual_${Date.now()}`,
      text: text.trim(),
      type,
      answers: answers.filter(a => a.text.trim()),
      createdBy: question?.createdBy ?? 'manual',
      createdAt: question?.createdAt ?? new Date().toISOString(),
    })
  }

  const updateAnswer = (index: number, updates: Partial<Answer>) => {
    setAnswers(prev => prev.map((a, i) => i === index ? { ...a, ...updates } : a))
    setErrors([])
  }

  const setCorrectAnswer = (index: number) => {
    if (type === 'multi_select') {
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

  const placeholders = ['Answer A...', 'Answer B...', 'Answer C...', 'Answer D...', 'Answer E...', 'Answer F...']

  return (
    <div className={`question-editor${isNew ? ' question-editor--new' : ''}`}>
      <div className="question-editor-field">
        <label className="question-editor-label">Question text</label>
        <textarea
          ref={textRef}
          className="question-editor-textarea"
          value={text}
          onChange={e => { setText(e.target.value); setErrors([]) }}
          placeholder="Type your question here..."
          rows={2}
          onKeyDown={e => { if (e.key === 'Escape') onCancel() }}
        />
      </div>

      <div className="question-editor-field">
        <label className="question-editor-label">Question type</label>
        <select
          className="question-editor-select"
          value={type}
          onChange={e => setType(e.target.value as Question['type'])}
        >
          {QUESTION_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {type !== 'free_text' && (
        <div className="question-editor-field">
          <label className="question-editor-label">Answers</label>
          <div className="question-editor-answers">
            {answers.map((answer, i) => (
              <div key={answer.id} className="question-editor-answer">
                <button
                  className={`question-editor-radio${answer.isCorrect ? ' question-editor-radio--selected' : ''}`}
                  onClick={() => setCorrectAnswer(i)}
                  aria-label={answer.isCorrect ? 'Correct answer' : 'Mark as correct'}
                >
                  {answer.isCorrect && (
                    <TickCircle size={16} color="var(--success-500)" variant="Bold" />
                  )}
                </button>
                <input
                  className="question-editor-answer-input"
                  value={answer.text}
                  onChange={e => updateAnswer(i, { text: e.target.value })}
                  placeholder={placeholders[i] ?? `Answer ${i + 1}...`}
                />
                {answers.length > 2 && (
                  <button
                    className="question-editor-answer-remove"
                    onClick={() => removeAnswer(i)}
                    aria-label="Remove answer"
                  >
                    <CloseCircle size={16} color="var(--text-tertiary)" variant="Linear" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {answers.length < 6 && (
            <button className="question-editor-add-answer" onClick={addAnswer}>
              <Add size={16} color="currentColor" />
              Add answer
            </button>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <div className="question-editor-errors">
          {errors.map((err, i) => (
            <p key={i} className="question-editor-error">{err}</p>
          ))}
        </div>
      )}

      <div className="question-editor-actions">
        <button className="question-editor-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="question-editor-save" onClick={handleSave}>
          {isNew ? 'Add to Pool' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default QuestionEditor
