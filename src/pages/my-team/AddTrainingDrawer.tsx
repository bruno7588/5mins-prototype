import { useEffect, useState } from 'react'
import { Calendar } from 'iconsax-react'
import CloseButton from '../../components/CloseButton/CloseButton'
import InputField from '../../components/InputField/InputField'
import Dropdown from '../../components/Dropdown/Dropdown'
import FileUploader from '../../components/FileUploader/FileUploader'
import './AddTrainingDrawer.css'

interface Props {
  open: boolean
  onClose: () => void
  onAdd: () => void
}

const durationUnits = [
  { value: 'minutes', label: 'minutes' },
  { value: 'hours', label: 'hours' },
  { value: 'days', label: 'days' },
]

const resultOptions = [
  { value: 'passed', label: 'Passed' },
  { value: 'not-passed', label: 'Not Passed' },
]

function AddTrainingDrawer({ open, onClose, onAdd }: Props) {
  const [closing, setClosing] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [trainingName, setTrainingName] = useState('')
  const [provider, setProvider] = useState('')
  const [startDate, setStartDate] = useState('')
  const [completionDate, setCompletionDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [durationValue, setDurationValue] = useState('')
  const [durationUnit, setDurationUnit] = useState('minutes')
  const [score, setScore] = useState('')
  const [result, setResult] = useState('')

  useEffect(() => {
    if (open) {
      setEmail('')
      setTrainingName('')
      setProvider('')
      setStartDate('')
      setCompletionDate('')
      setExpirationDate('')
      setDurationValue('')
      setDurationUnit('minutes')
      setScore('')
      setResult('')
    }
  }, [open])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`side-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-training-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="at-header-text">
              <h2 id="add-training-title" className="at-title">Add External Training</h2>
              <p className="at-subtitle">
                Add training records from other platforms to keep all your learning in one place.
              </p>
            </div>
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <div className="at-form">
            <InputField
              label="Email"
              placeholder="Add user's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="at-group">
              <InputField
                label="Training name"
                placeholder="Write the name of the training"
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
              />
              <InputField
                label="Training provider name"
                placeholder="Name of the organization that provided the training"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>

            <div className="at-group">
              <div className="at-row">
                <InputField
                  label="Start date"
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  helperText="When the learner started the course"
                  iconRight={<Calendar size={20} color="var(--text-tertiary)" variant="Linear" />}
                />
                <InputField
                  label="Completion date"
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  helperText="When the learner achieved the training's goals"
                  iconRight={<Calendar size={20} color="var(--text-tertiary)" variant="Linear" />}
                />
              </div>
              <div className="at-half">
                <InputField
                  label="Expiration date (optional)"
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  helperText="When the course or certificate expires"
                  iconRight={<Calendar size={20} color="var(--text-tertiary)" variant="Linear" />}
                />
              </div>
            </div>

            <div className="at-group">
              <div className="at-row at-row--align-end">
                <div className="at-duration-group">
                  <label className="at-label">Duration of the training</label>
                  <div className="at-duration-inputs">
                    <div className="at-duration-number">
                      <button type="button" className="at-stepper-btn" onClick={() => setDurationValue(v => String(Math.max(0, (Number(v) || 0) - 1)))}>−</button>
                      <input
                        type="number"
                        className="at-stepper-input"
                        value={durationValue}
                        onChange={(e) => setDurationValue(e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                      <button type="button" className="at-stepper-btn" onClick={() => setDurationValue(v => String((Number(v) || 0) + 1))}>+</button>
                    </div>
                    <Dropdown
                      options={durationUnits}
                      value={durationUnit}
                      placeholder="mins"
                      onChange={setDurationUnit}
                      size="md"
                    />
                  </div>
                </div>
              </div>
              <div className="at-row">
                <div className="at-duration-group at-duration-group--fixed">
                  <label className="at-label">Score <span className="at-optional">(optional)</span></label>
                  <div className="at-duration-number">
                    <button type="button" className="at-stepper-btn" onClick={() => setScore(v => String(Math.max(0, (Number(v) || 0) - 1)))}>−</button>
                    <input
                      type="text"
                      className="at-stepper-input"
                      value={score ? `${score}%` : '0%'}
                      onChange={(e) => setScore(e.target.value.replace('%', ''))}
                    />
                    <button type="button" className="at-stepper-btn" onClick={() => setScore(v => String(Math.min(100, (Number(v) || 0) + 1)))}>+</button>
                  </div>
                </div>
                <Dropdown
                  options={resultOptions}
                  value={result}
                  label="Result (optional)"
                  placeholder="Passed / Not Passed"
                  onChange={setResult}
                />
              </div>
            </div>

            <div className="at-group">
              <label className="at-label">Upload certificate for this training record</label>
              <FileUploader
                size="L"
                accept=".pdf,.jpg,.png"
              />
            </div>
          </div>
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            <button type="button" className="side-drawer__btn-primary" onClick={onAdd}>
              Add Training
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AddTrainingDrawer
