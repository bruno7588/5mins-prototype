import CloseButton from '@/components/CloseButton/CloseButton'
import heartFilled from '@/assets/quiz-hearts/heart-filled.svg'
import heartEmpty from '@/assets/quiz-hearts/heart-empty.svg'

interface QuizHeaderProps {
  label: string
  /** Attempts already used. */
  used: number
  /** Attempts allowed. */
  total: number
  /** Leave the quiz. */
  onClose: () => void
  /** Hearts belong to a real attempt — the course builder's preview shows none. */
  showHearts?: boolean
}

/**
 * Quiz label + attempt hearts (DS Quizzes, Figma 9012:380). Left: the quiz label
 * with a used/total badge. Right: one heart per allowed attempt — filled artwork
 * for remaining, muted artwork for spent — then the shared DS CloseButton
 * (Figma 9041:585).
 */
function QuizHeader({ label, used, total, onClose, showHearts = true }: QuizHeaderProps) {
  const remaining = Math.max(0, total - used)
  return (
    <div className="ql-qhead">
      <div className="ql-qhead__label">
        <span className="ql-qhead__title">{label}</span>
        <span className="ql-qhead__badge">
          {used}/{total}
        </span>
      </div>
      <div className="ql-qhead__actions">
        {showHearts && (
          <div className="ql-qhead__hearts" aria-label={`${remaining} of ${total} attempts left`}>
            {Array.from({ length: total }).map((_, i) => (
              <img
                key={i}
                className="ql-qhead__heart"
                src={i < remaining ? heartFilled : heartEmpty}
                alt=""
                width={20}
                height={20}
              />
            ))}
          </div>
        )}
        <CloseButton onClick={onClose} ariaLabel="Close quiz" />
      </div>
    </div>
  )
}

export default QuizHeader
