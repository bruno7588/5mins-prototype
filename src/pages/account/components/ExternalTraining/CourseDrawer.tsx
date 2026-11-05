import { useRef, useState } from 'react'
import { Add } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import Dropdown from '@/components/Dropdown/Dropdown'
import InputField from '@/components/InputField/InputField'
import InputInteger from '@/components/InputInteger/InputInteger'
import Radio from '@/components/Radio/Radio'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import {
  duplicateCourse,
  newId,
  saveCourse,
  useExternalTraining,
  type DurationUnit,
  type ExternalCourse,
} from '@/data/externalTraining'
import ProviderModal from './ProviderModal'

const UNIT_OPTIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
]

interface Props {
  /** null = Add Course. */
  course: ExternalCourse | null
  /** Pre-fill the name (Add Course to Approved List from the recording drawer). */
  initialName?: string
  onClose: () => void
  onSaved: (name: string, isNew: boolean, course: ExternalCourse) => void
}

/* Add / Edit Course (PRD 1.5). 720px side drawer on the shared .side-drawer shell. */
function CourseDrawer({ course, initialName = '', onClose, onSaved }: Props) {
  const { providers, records } = useExternalTraining()
  const panelRef = useRef<HTMLElement>(null)
  // Paused while the Add Provider modal is on top, so the two focus traps never fight.
  const [providerModal, setProviderModal] = useState(false)
  useOverlayA11y(panelRef, !providerModal)

  const [name, setName] = useState(course?.name ?? initialName)
  const [providerIds, setProviderIds] = useState<string[]>(course?.providerIds ?? [])
  const [duration, setDuration] = useState(course?.duration.value ?? 0)
  const [unit, setUnit] = useState<DurationUnit>(course?.duration.unit ?? 'hours')
  const [retrains, setRetrains] = useState(course ? course.retrainingMonths != null : true)
  const [months, setMonths] = useState(course?.retrainingMonths ?? 12)
  const [otherNames, setOtherNames] = useState<string[]>(course?.otherNames ?? [])
  const [submitted, setSubmitted] = useState(false)

  const recordCount = course ? records.filter((r) => r.courseId === course.id).length : 0
  const ruleChanged = !!course && (retrains ? months : null) !== course.retrainingMonths
  const renamed = !!course && name.trim() !== '' && name.trim() !== course.name

  const providerOptions = providers
    .filter((p) => !p.archived || providerIds.includes(p.id))
    .map((p) => ({ value: p.id, label: p.name }))

  const dupe = name.trim() && providerIds.length ? duplicateCourse(name, providerIds, course?.id) : undefined
  const dupeProvider = dupe && providers.find((p) => dupe.providerIds.includes(p.id) && providerIds.includes(p.id))
  const errors = {
    name: !name.trim()
      ? 'Add a course name'
      : dupe
        ? `There's already a course called ${dupe.name} with ${dupeProvider?.name}.`
        : '',
    providers: providerIds.length ? '' : 'Add at least one provider',
    duration: duration > 0 ? '' : 'Add a duration',
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const save = () => {
    setSubmitted(true)
    if (hasErrors) return
    const next: ExternalCourse = {
      id: course?.id ?? newId('c'),
      name: name.trim(),
      providerIds,
      duration: { value: duration, unit },
      retrainingMonths: retrains ? months : null,
      otherNames,
      archived: course?.archived ?? false,
    }
    saveCourse(next)
    onSaved(next.name, !course, next)
  }

  const s = <T,>(v: T) => (submitted ? v : undefined)

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="side-drawer aet-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aet-course-title"
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="aet-drawer__heading">
              <h2 id="aet-course-title" className="aet-drawer__title">{course ? 'Edit course' : 'Add course'}</h2>
              <p className="aet-text">Courses on the approved list can be recorded on people's profiles and in uploads.</p>
            </div>
            <CloseButton onClick={onClose} />
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          <div className="aet-form">
            <InputField
              label="Course name"
              placeholder="For example, First Aid at Work"
              value={name}
              onChange={(e) => setName(e.target.value)}
              validation={s(errors.name) ? 'error' : 'none'}
              helperText={s(errors.name) || undefined}
            />
            {renamed && recordCount > 0 && (
              <Alert
                type="Callout"
                message={`The new name shows on its ${recordCount} record${recordCount === 1 ? '' : 's'} too. Certificate files keep their original wording.`}
              />
            )}

            <div className="aet-field">
              <Dropdown
                label="Providers"
                placeholder="Select providers"
                multiple
                searchable
                searchPlaceholder="Search providers"
                options={providerOptions}
                values={providerIds}
                onChangeValues={setProviderIds}
                error={s(errors.providers) || undefined}
              />
              {providerIds.length > 0 && (
                <div className="aet-badges">
                  {providerIds.map((id) => {
                    const label = providers.find((p) => p.id === id)?.name ?? ''
                    return (
                      <Chip
                        key={id}
                        label={label}
                        onDismiss={() => setProviderIds((ids) => ids.filter((x) => x !== id))}
                      />
                    )
                  })}
                </div>
              )}
              <Button
                variant="text-2"
                icon={<Add size={20} color="currentColor" variant="Linear" />}
                onClick={() => setProviderModal(true)}
              >
                Add Provider
              </Button>
            </div>

            <div className="aet-field">
              <span className="aet-label">Duration</span>
              <div className="aet-row">
                <InputInteger
                  ariaLabel="Duration"
                  value={duration}
                  onChange={setDuration}
                  min={0}
                  validation={s(errors.duration) ? 'error' : 'none'}
                  helperText={s(errors.duration) || undefined}
                />
                <Dropdown
                  options={UNIT_OPTIONS}
                  value={unit}
                  onChange={(v) => setUnit(v as DurationUnit)}
                  className="aet-unit"
                />
              </div>
            </div>

            <div className="aet-field" role="radiogroup" aria-labelledby="aet-retraining-label">
              <span id="aet-retraining-label" className="aet-label">Expiry</span>
              <Radio name="aet-retraining" label="No expiry" checked={!retrains} onChange={() => setRetrains(false)} />
              <div className="aet-row aet-row--center">
                <Radio name="aet-retraining" label="Expires after" checked={retrains} onChange={() => setRetrains(true)} />
                <InputInteger
                  ariaLabel="Expires after, in months"
                  value={months}
                  onChange={(v) => {
                    setMonths(v)
                    setRetrains(true)
                  }}
                  min={1}
                  max={240}
                  suffix="months"
                  disabled={!retrains}
                />
              </div>
              {ruleChanged && recordCount > 0 && (
                <Alert
                  type="Callout"
                  message={`Changes apply to new records only. The ${recordCount} existing record${recordCount === 1 ? '' : 's'} keep their expiry dates.`}
                />
              )}
            </div>

            {otherNames.length > 0 && (
              <div className="aet-field">
                <span className="aet-label">Also matches in uploads</span>
                <p className="aet-text">Names mapped to this course in a CSV upload.</p>
                <div className="aet-badges">
                  {otherNames.map((n) => (
                    <Badge
                      key={n}
                      type="informative"
                      icon={false}
                      label={n}
                      onDismiss={() => setOtherNames((all) => all.filter((x) => x !== n))}
                      dismissLabel={`Remove ${n}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            <Button onClick={save}>{course ? 'Save Changes' : 'Save Course'}</Button>
          </div>
        </div>
      </aside>

      <ProviderModal
        open={providerModal}
        provider={null}
        onClose={() => setProviderModal(false)}
        onSaved={(p) => {
          setProviderModal(false)
          setProviderIds((ids) => [...ids, p.id])
        }}
      />
    </>
  )
}

export default CourseDrawer
