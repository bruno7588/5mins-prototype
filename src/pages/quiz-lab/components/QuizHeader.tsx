import { Heart } from 'iconsax-react'

interface QuizHeaderProps {
  label: string
  /** Attempts already used. */
  used: number
  /** Attempts allowed. */
  total: number
}

/**
 * Quiz label + attempt hearts (DS Quizzes, Figma 9012:380). Left: the quiz label
 * with a used/total badge. Right: one heart per allowed attempt — filled (danger)
 * for remaining, muted for spent.
 */
function QuizHeader({ label, used, total }: QuizHeaderProps) {
  const remaining = Math.max(0, total - used)
  return (
    <div className="ql-qhead">
      <div className="ql-qhead__label">
        <span className="ql-qhead__title">{label}</span>
        <span className="ql-qhead__badge">
          {used}/{total}
        </span>
      </div>
      <div className="ql-qhead__hearts" aria-label={`${remaining} of ${total} attempts left`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="ql-qhead__heart"
            style={{ color: i < remaining ? 'var(--danger-500)' : 'var(--text-disabled)' }}
          >
            <Heart size={20} variant="Bold" color="currentColor" />
          </span>
        ))}
      </div>
    </div>
  )
}

export default QuizHeader
