import { useState } from 'react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import Dropdown from '../../../../components/Dropdown/Dropdown'
import InputField from '../../../../components/InputField/InputField'
import Collapse from '../../../../components/Collapse/Collapse'
import {
  MOCK_LIBRARY,
  type ProgramStep,
  type ReleaseRule,
} from '../../programStore'
import './StepConfigDrawer.css'

interface Props {
  step: ProgramStep
  allSteps: ProgramStep[]
  onPatch: (patch: Partial<ProgramStep>) => void
  onPickCourse: (courseId: string) => void
  onClose: () => void
}

const RELEASE_OPTIONS = [
  { value: 'on-start', label: 'On program start' },
  { value: 'after-days', label: 'A number of days after the previous step' },
  { value: 'on-date', label: 'On a specific date' },
  { value: 'after-step', label: 'After another step is completed' },
]

const TYPE_TITLE: Record<ProgramStep['type'], string> = {
  course: 'Course step',
  email: 'Email step',
  review: 'Review step',
}

function StepConfigDrawer({ step, allSteps, onPatch, onPickCourse, onClose }: Props) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 300)
  }

  const setReleaseKind = (kind: ReleaseRule['kind']) => {
    let release: ReleaseRule
    switch (kind) {
      case 'after-days':
        release = { kind: 'after-days', days: 1 }
        break
      case 'on-date':
        release = { kind: 'on-date', date: '' }
        break
      case 'after-step': {
        const first = allSteps.find((s) => s.id !== step.id)
        release = { kind: 'after-step', stepId: first?.id ?? '' }
        break
      }
      default:
        release = { kind: 'on-start' }
    }
    onPatch({ release })
  }

  const otherSteps = allSteps.filter((s) => s.id !== step.id)

  return (
    <div className={`scd-overlay${closing ? ' scd-overlay--closing' : ''}`} onMouseDown={handleClose}>
      <aside
        className={`scd-panel${closing ? ' scd-panel--closing' : ''}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="scd-header">
          <h2 className="scd-header__title">{TYPE_TITLE[step.type]}</h2>
          <CloseButton onClick={handleClose} />
        </header>

        <div className="scd-body">
          {/* Type-specific */}
          {step.type === 'course' && (
            <Dropdown
              label="Course"
              placeholder="Select a course"
              value={step.courseId || undefined}
              options={MOCK_LIBRARY.map((c) => ({ value: c.courseId, label: c.title }))}
              onChange={onPickCourse}
            />
          )}

          {step.type !== 'course' && (
            <InputField
              label="Title"
              value={step.title}
              onChange={(e) => onPatch({ title: e.target.value })}
            />
          )}

          {step.type === 'email' && (
            <>
              <InputField
                label="Subject"
                value={step.subject}
                placeholder="Email subject"
                onChange={(e) => onPatch({ subject: e.target.value })}
              />
              <label className="scd-field">
                <span className="scd-field__label">Message</span>
                <textarea
                  className="scd-textarea"
                  rows={5}
                  value={step.body}
                  placeholder="Write the email body…"
                  onChange={(e) => onPatch({ body: e.target.value })}
                />
              </label>
            </>
          )}

          {step.type === 'review' && (
            <InputField
              label="Delay after completion (days)"
              type="number"
              value={String(step.delayDays)}
              onChange={(e) => onPatch({ delayDays: Math.max(0, Number(e.target.value) || 0) })}
              helperText="Spaced-repetition review cards are sent this many days after the learner completes the prior course."
            />
          )}

          <div className="scd-divider" />

          {/* Release rule */}
          <Dropdown
            label="Release"
            value={step.release.kind}
            options={RELEASE_OPTIONS}
            onChange={(v) => setReleaseKind(v as ReleaseRule['kind'])}
          />

          <Collapse open={step.release.kind === 'after-days'}>
            {step.release.kind === 'after-days' && (
              <InputField
                label="Days after previous step"
                type="number"
                value={String(step.release.days)}
                onChange={(e) =>
                  onPatch({ release: { kind: 'after-days', days: Math.max(0, Number(e.target.value) || 0) } })
                }
              />
            )}
          </Collapse>

          <Collapse open={step.release.kind === 'on-date'}>
            {step.release.kind === 'on-date' && (
              <InputField
                label="Release date"
                type="date"
                value={step.release.date}
                onChange={(e) => onPatch({ release: { kind: 'on-date', date: e.target.value } })}
              />
            )}
          </Collapse>

          <Collapse open={step.release.kind === 'after-step'}>
            {step.release.kind === 'after-step' && (
              <Dropdown
                label="After which step?"
                placeholder={otherSteps.length ? 'Select a step' : 'No other steps yet'}
                value={step.release.stepId || undefined}
                options={otherSteps.map((s) => ({ value: s.id, label: s.title }))}
                onChange={(v) =>
                  onPatch({ release: { kind: 'after-step', stepId: v, days: step.release.kind === 'after-step' ? step.release.days : undefined } })
                }
              />
            )}
          </Collapse>

          <div className="scd-divider" />

          {/* Due date */}
          <InputField
            label="Due date (optional)"
            type="date"
            value={step.dueDate ?? ''}
            onChange={(e) => onPatch({ dueDate: e.target.value || undefined })}
          />
        </div>

        <footer className="scd-footer">
          <button className="pb-btn pb-btn--primary scd-done" onClick={handleClose}>
            Done
          </button>
        </footer>
      </aside>
    </div>
  )
}

export default StepConfigDrawer
