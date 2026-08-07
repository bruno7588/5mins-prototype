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
}

/**
 * Quiz label + attempt hearts (DS Quizzes, Figma 9012:380). Left: the quiz label
 * with a used/total badge. Right: one heart per allowed attempt — filled artwork
 * for remaining, muted artwork for spent — then the close control (Figma
 * 9041:585, io5/IoCloseOutline at 32px).
 */
function QuizHeader({ label, used, total, onClose }: QuizHeaderProps) {
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
        <button type="button" className="ql-qhead__close" aria-label="Close quiz" onClick={onClose}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M23 23L9 9M23 9L9 23"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default QuizHeader
