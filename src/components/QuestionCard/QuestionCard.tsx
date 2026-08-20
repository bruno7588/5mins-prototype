import { useState } from 'react'
import { Edit2, Trash, TickCircle } from 'iconsax-react'
import type { Question } from '../../data/mockQuestions'
import './QuestionCard.css'

interface QuestionCardProps {
  question: Question
  onEdit: () => void
  onDelete: () => void
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`question-card${expanded ? ' question-card--expanded' : ''}`}>
      <div className="question-card-row">
        <div className="question-card-content">
          <div className="question-card-text">{question.text}</div>
          <button
            className="question-card-toggle"
            onClick={() => setExpanded(prev => !prev)}
          >
            <span className="question-card-toggle-text">
              {expanded ? 'Hide options' : 'View options'}
            </span>
            <span className={`question-card-toggle-chevron${expanded ? ' question-card-toggle-chevron--open' : ''}`}>
              <ChevronIcon />
            </span>
          </button>
        </div>
        <div className="question-card-actions">
          <button
            className="question-card-action"
            aria-label="Edit question"
            data-tooltip="Edit question"
            onClick={onEdit}
          >
            <Edit2 size={16} color="var(--text-tertiary)" variant="Linear" />
          </button>
          <button
            className="question-card-action question-card-action--delete"
            aria-label="Delete question"
            data-tooltip="Delete question"
            onClick={onDelete}
          >
            <Trash size={16} color="var(--text-tertiary)" variant="Linear" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="question-card-options">
          {question.answers.map(answer => (
            <div
              key={answer.id}
              className={`question-card-option${answer.isCorrect ? ' question-card-option--correct' : ''}`}
            >
              <span className={`question-card-option-dot${answer.isCorrect ? ' question-card-option-dot--correct' : ''}`}>
                {answer.isCorrect && <TickCircle size={16} color="var(--neutral-0)" variant="Bold" />}
              </span>
              <span className="question-card-option-text">{answer.text}</span>
              {answer.isCorrect && (
                <span className="question-card-option-badge">Correct</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuestionCard
