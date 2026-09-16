import { useEffect, useId, useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CloseButton from '@/components/CloseButton/CloseButton'
import Button from '@/components/Button/Button'
import Radio from '@/components/Radio/Radio'
import Alert from '@/components/Alert/Alert'
import DatePickerField from '@/components/DatePickerField/DatePickerField'
import InputInteger from '@/components/InputInteger/InputInteger'
import { track } from '@/utils/analytics'
import './SetCompletedModal.css'

/* DES-333 — Set as completed. One modal serves the row kebab and the bulk bar
   (PRD 2.3). Two steps: the form, then a confirmation dialog that names the
   numbers, because a manual completion cannot be undone (D1). */

export interface Completion {
  /** ISO yyyy-mm-dd, never after today. */
  date: string
  /** Resolved score — the chosen one, or the course pass score when left to
      the course; null when the course has no pass score (BL4). */
  score: number | null
  /** Where the score came from, for instrumentation. */
  scoreSource: 'course' | 'custom'
}

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

interface SetCompletedModalProps {
  /** Set when opened from a single row's menu — names that learner in the copy. */
  learnerName?: string
  /** Bulk: how many rows are selected, and how many of those are not yet
      completed. The difference is what the run will skip (D2). */
  selectedCount: number
  eligibleCount: number
  /** The course's pass score, or null when none is configured (BL4). */
  passScore: number | null
  onClose: () => void
  onApply: (value: Completion) => void
}

function SetCompletedModal({ learnerName, selectedCount, eligibleCount, passScore, onClose, onApply }: SetCompletedModalProps) {
  const name = useId()
  const today = todayISO()
  const isBulk = !learnerName
  const skipped = isBulk ? selectedCount - eligibleCount : 0
  const nothingToDo = isBulk && eligibleCount === 0

  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [date, setDate] = useState(today)
  const [scoreMode, setScoreMode] = useState<'course' | 'custom'>('course')
  const [customScore, setCustomScore] = useState(passScore ?? 100)
  /* Commit is one round trip in the real app; the button shows it (3.5). */
  const [busy, setBusy] = useState(false)

  const dateError = date > today ? 'Choose a completion date that is today or earlier' : undefined
  const score = scoreMode === 'custom' ? customScore : passScore
  const canContinue = !nothingToDo && date !== '' && !dateError

  const scope = isBulk ? plural(eligibleCount, 'enrolment') : `${learnerName}’s enrolment`
  const scopeKey = isBulk ? 'bulk' : 'single'

  /* Instrumentation (PRD 4.2). The confirm-cancelled rate is the signal for
     whether the second gate is real or wallpaper. */
  useEffect(() => {
    track('enrolment_completion_opened', { scope: scopeKey, selected: selectedCount, eligible: eligibleCount })
    // Mount only: the modal is a fresh instance per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const cancel = () => {
    track('enrolment_completion_cancelled', { scope: scopeKey })
    onClose()
  }
  const showConfirm = () => {
    track('enrolment_completion_confirm_shown', { scope: scopeKey, eligible: eligibleCount, skipped })
    setStep('confirm')
  }
  /* Cancelling the confirmation abandons the whole run and returns to the page. */
  const cancelConfirm = () => {
    track('enrolment_completion_confirm_cancelled', { scope: scopeKey })
    onClose()
  }

  if (step === 'confirm') {
    /* The commit button carries the number, or the person, so it is never the
       same button the admin just pressed (B2). */
    const commitLabel = isBulk ? `Mark ${eligibleCount} As Completed` : `Mark ${learnerName?.split(' ')[0]} As Completed`
    return (
      <ConfirmModal open onClose={() => !busy && cancelConfirm()} className="scm-confirm" ariaLabel="Confirm mark as completed">
        <div className="confirm-modal-header confirm-modal-header--center">
          {/* Info-type dialog (overlays.md), icon hidden. */}
          <h2 className="confirm-modal-title">Mark {scope} as completed</h2>
          <p className="confirm-modal-body">
            {isBulk ? plural(eligibleCount, 'enrolment') : `${learnerName}’s enrolment`} will be marked as completed on {longDate(date)} with {score == null ? 'no score' : `a score of ${score}%`}.
          </p>
        </div>
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={cancelConfirm} disabled={busy}>
            Cancel
          </Button>
          <Button
            loading={busy}
            loadingLabel="Marking…"
            onClick={() => {
              setBusy(true)
              window.setTimeout(() => onApply({ date, score, scoreSource: scoreMode }), 600)
            }}
          >
            {commitLabel}
          </Button>
        </div>
      </ConfirmModal>
    )
  }

  return (
    <ConfirmModal open onClose={cancel} className="scm" ariaLabel="Mark as completed">
      <CloseButton onClick={cancel} className="scm__close" size={24} />

      <header className="scm__header">
        <div className="scm__headline">
          <h2 className="scm__title">Mark as completed</h2>
          <p className="scm__supporting">
            {isBulk ? `${plural(selectedCount, 'enrolment')} selected` : learnerName}
          </p>
        </div>
        <div className="scm__divider" />
      </header>

      {nothingToDo ? (
        /* Every selected row is already completed: the modal still opens and
           says so, rather than greying the bulk action (M13, D2). */
        <Alert
          type="Callout"
          icon
          message={selectedCount === 1 ? 'This enrolment is already completed.' : `All ${selectedCount} enrolments are already completed. Select one that isn’t to continue.`}
        />
      ) : (
        <div className="scm__body">
          <div className="scm__field">
            <span className="scm__label">
              Completion date <span className="scm__label-hint">(today or earlier)</span>
            </span>
            <DatePickerField
              value={date}
              onChange={setDate}
              maxDate={today}
              error={dateError}
              ariaLabel="Completion date"
            />
          </div>

          <fieldset className="scm__fieldset">
            <legend className="scm__label">Score</legend>

            <div className="scm__option">
              <Radio id={`${name}-course`} name={`${name}-score`} checked={scoreMode === 'course'} onChange={() => setScoreMode('course')} />
              <div className="scm__info">
                <label className="scm__option-label" htmlFor={`${name}-course`}>
                  {passScore == null ? 'No score' : `Use the course pass score - ${passScore}%`}
                </label>
                {passScore == null && <p className="scm__desc">This course has no pass score</p>}
              </div>
            </div>

            <div className="scm__option">
              <Radio id={`${name}-custom`} name={`${name}-score`} checked={scoreMode === 'custom'} onChange={() => setScoreMode('custom')} />
              <div className="scm__info">
                <label className="scm__option-label" htmlFor={`${name}-custom`}>Set a specific score</label>
                {scoreMode === 'custom' && (
                  <InputInteger value={customScore} onChange={setCustomScore} min={0} max={100} suffix="%" ariaLabel="Score" />
                )}
              </div>
            </div>
          </fieldset>

          {isBulk && skipped > 0 && (
            <Alert
              type="Callout"
              icon
              message={`${plural(skipped, 'enrolment')} ${skipped === 1 ? 'is' : 'are'} already completed and will be skipped`}
            />
          )}
        </div>
      )}

      <Button variant="filled" onClick={showConfirm} disabled={!canContinue} className="scm__cta">
        Mark As Completed
      </Button>
    </ConfirmModal>
  )
}

export default SetCompletedModal
