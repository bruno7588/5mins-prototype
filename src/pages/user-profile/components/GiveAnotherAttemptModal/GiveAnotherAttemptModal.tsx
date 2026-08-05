import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CloseButton from '@/components/CloseButton/CloseButton'
import Button from '@/components/Button/Button'
import Alert from '@/components/Alert/Alert'
import './GiveAnotherAttemptModal.css'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

interface GiveAnotherAttemptModalProps {
  /** How many enrolments the reset will apply to. */
  count: number
  /** Set when opened from a single row's menu — names that course in the title. */
  courseName?: string
  learnerName: string
  onClose: () => void
  onApply: () => void
}

function GiveAnotherAttemptModal({ count, courseName, learnerName, onClose, onApply }: GiveAnotherAttemptModalProps) {
  const scope = courseName ? `“${courseName}”` : plural(count, 'course')

  return (
    <ConfirmModal open onClose={onClose} className="gaa" ariaLabel="Give another attempt">
      <CloseButton onClick={onClose} className="gaa__close" size={24} />

      <header className="gaa__header">
        <div className="gaa__headline">
          <h2 className="gaa__title">Give another attempt at {scope}</h2>
          <p className="gaa__supporting">Reset {learnerName}’s progress and start over</p>
        </div>
        <div className="gaa__divider" />
      </header>

      {/* Same wording as the course-level reset on Your Courses, so the
          consequence reads identically wherever an admin grants an attempt. */}
      <Alert
        type="Callout"
        title="What happens:"
        bullets={[
          'Their current attempt is archived and a new attempt begins in the same enrolment',
          'Their start date and recurrence stay the same',
        ]}
      />

      <Button variant="filled" onClick={onApply} className="gaa__cta">
        Give Another Attempt
      </Button>
    </ConfirmModal>
  )
}

export default GiveAnotherAttemptModal
