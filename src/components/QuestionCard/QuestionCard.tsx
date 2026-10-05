import { Edit2 } from 'iconsax-react'
import { getAssessmentIllustration, type AssessmentType } from '@/assets/assessment-illustrations'
import Tooltip from '@/components/Tooltip/Tooltip'
import type { Question } from '../../data/mockQuestions'
import './QuestionCard.css'

interface QuestionCardProps {
  question: Question
  onEdit: () => void
}

/* The type line and artwork for each question type. Labels match the editor's type picker. */
const TYPE: Record<Question['type'], { label: string; art: AssessmentType }> = {
  multiple_choice: { label: 'Multiple choice', art: 'multiple-choice' },
  multi_select: { label: 'Select all that apply', art: 'multiple-choice' },
  true_false: { label: 'True or false', art: 'multiple-choice' },
  free_text: { label: 'Free text', art: 'short-text' },
}

/**
 * One question in a lesson's question bank: the DS Assessment admin list row
 * (cards.md, Figma Card/Assessments 10867:5413). Illustration, title, type line, and
 * the Edit + "Assessment" pill cluster on the right. Deleting lives in the edit drawer.
 */
function QuestionCard({ question, onEdit }: QuestionCardProps) {
  const type = TYPE[question.type]
  return (
    <article className="question-card">
      {/* The desktop artwork is drawn at 80px and scales down for the 48px admin row. */}
      <img
        className="question-card__art"
        src={getAssessmentIllustration(type.art, 'desktop')}
        width={48}
        height={48}
        alt=""
      />
      <div className="question-card__info">
        <h4 className="question-card__title">{question.text}</h4>
        <span className="question-card__type">{type.label}</span>
      </div>
      <div className="question-card__actions">
        <Tooltip text="Edit question" position="Top" icon={false}>
          <button
            type="button"
            className="question-card__edit"
            aria-label="Edit question"
            onClick={onEdit}
          >
            <Edit2 size={16} color="currentColor" variant="Linear" />
          </button>
        </Tooltip>
        <span className="question-card__pill">Assessment</span>
      </div>
    </article>
  )
}

export default QuestionCard
