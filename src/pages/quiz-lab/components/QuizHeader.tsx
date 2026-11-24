import type { ReactNode } from 'react'
import CloseButton from '@/components/CloseButton/CloseButton'
import heartFilled from '@/assets/quiz-hearts/heart-filled.svg'
import heartEmpty from '@/assets/quiz-hearts/heart-empty.svg'

interface QuizHeaderProps {
  /** The format being played. Omit on a screen that names itself — the header is
   *  then just the close. */
  label?: string
  /** Attempts already used. Omit where neither the badge nor the hearts show. */
  used?: number
  /** Attempts allowed. Omit where neither the badge nor the hearts show. */
  total?: number
  /** Leave the quiz. Omit where the host has its own way out (the web course feed's
   *  top bar), and the header draws no close. */
  onClose?: () => void
  /** Hearts belong to a real attempt — the course builder's preview shows none. */
  showHearts?: boolean
  /** The used/total badge counts attempts, so a screen that isn't an attempt — the
   *  situational test's brief — has nothing for it to count. */
  showAttempts?: boolean
  /** Mobile course feed (Figma 17024:75309): one heart with the attempts left as a
   *  number, instead of a heart per attempt. */
  heartCount?: boolean
  /** A control beside the label, away from the close: the mobile feed's "View Brief"
   *  (DES-371). */
  action?: ReactNode
}

/**
 * Quiz label + attempt hearts (DS Quizzes, Figma 9012:380). Left: the quiz label
 * with a used/total badge. Right: one heart per allowed attempt — filled artwork
 * for remaining, muted artwork for spent — then the shared DS CloseButton
 * (Figma 9041:585).
 */
function QuizHeader({ label, used = 0, total = 0, onClose, showHearts = true, showAttempts = true, heartCount = false, action }: QuizHeaderProps) {
  const remaining = Math.max(0, total - used)
  return (
    <div className="ql-qhead">
      <div className="ql-qhead__label">
        {label && <span className="ql-qhead__title">{label}</span>}
        {showAttempts && (
          <span className="ql-qhead__badge">
            {used}/{total}
          </span>
        )}
        {action}
      </div>
      <div className="ql-qhead__actions">
        {showHearts && heartCount && (
          <div className="ql-qhead__hearts ql-qhead__hearts--count" aria-label={`${remaining} of ${total} attempts left`}>
            <img className="ql-qhead__heart" src={heartFilled} alt="" width={16} height={16} />
            <span className="ql-qhead__heartcount" aria-hidden="true">{remaining}</span>
          </div>
        )}
        {showHearts && !heartCount && (
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
        {onClose && <CloseButton onClick={onClose} ariaLabel="Close quiz" />}
      </div>
    </div>
  )
}

export default QuizHeader
