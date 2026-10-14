import { useEffect, useState } from 'react'
import InputField from '@/components/InputField/InputField'
import Checkbox from '@/components/Checkbox/Checkbox'
import {
  SIGN_OFF_ATTESTATION,
  SIGN_OFF_LEARNER,
  formatSignOffDate,
  saveSignOff,
  type SignOffRecord,
} from '@/data/trainerSignOff'
import './SignOffForm.css'

/**
 * The sign-off steps shared by the web modal and the mobile screen (DES-335):
 * the handover copy, the three licence fields and the statement panel holding
 * the attestation. Wording is the ticket's (D5) until legal supplies the final copy.
 */

export const HANDOVER_TITLE = 'Hand this device to your personal licence holder'
export const HANDOVER_BODY = "They'll confirm the training and sign using their licence number and issuing licensing board."
export const HANDOVER_NOTE = 'Only the licence holder should continue.'

/* Four steps: hand over (learner), licence details and review (licence holder; the
   review's Sign Off saves), then hand back (learner). */
export type SignOffStep = 'handover' | 'form' | 'done' | 'handback'
/** Drives the progress dots (web and app). */
export const STEP_NUMBER: Record<SignOffStep, number> = { handover: 1, form: 2, done: 3, handback: 4 }
/** Step names: the web stepper labels and the app's top-nav title (Figma app 04-07). */
export const STEP_LABEL: Record<SignOffStep, string> = {
  handover: 'Hand over',
  form: 'Licence details',
  done: 'Sign off',
  handback: 'Hand back',
}

/* Step 3 is a review: nothing is final until its Sign Off button, so no tick or "signed off" before then. */
/** Review title, saying why the details matter. */
export const doneTitle = (learnerName: string) => `Check your details - these will appear on ${learnerName.split(' ')[0]}'s certificate`
export const DONE_ACTION = 'Sign Off'

/* Step 4, after the save: the tick is true now. The learner takes the device back with
   their own button, mirroring "Continue as Licence Holder". */
export const HANDBACK_TITLE = 'Training signed off'
export const handbackBody = (learnerName: string) => `Hand the device back to ${learnerName}.`
export const handbackAction = (learnerName: string) => `Continue as ${learnerName.split(' ')[0]}`

export const FORM_TITLE = 'Your licence details'

type FieldKey = 'holderName' | 'licenceNumber' | 'issuingBoard'

const FIELDS: { key: FieldKey; label: string; placeholder: string; missing: string; error: string }[] = [
  { key: 'holderName', label: "Licence holder's name", placeholder: 'Full name', missing: "licence holder's name", error: "Enter the licence holder's name" },
  { key: 'licenceNumber', label: 'Personal licence number', placeholder: 'e.g. GCC/PL/04821', missing: 'licence number', error: 'Enter the personal licence number' },
  { key: 'issuingBoard', label: 'Issuing licensing board', placeholder: 'e.g. Glasgow Licensing Board', missing: 'licensing board', error: 'Enter the issuing licensing board' },
]

type Draft = { values: Record<FieldKey, string>; agreed: boolean }

/* Typed details survive the form closing (click outside, Escape, X), per course, until signed. */
const drafts = new Map<string, Draft>()

export function useSignOffForm(courseId: string) {
  const learnerName = SIGN_OFF_LEARNER.name
  const attestation = SIGN_OFF_ATTESTATION(learnerName)
  const [values, setValues] = useState<Record<FieldKey, string>>(
    () => drafts.get(courseId)?.values ?? { holderName: '', licenceNumber: '', issuingBoard: '' },
  )
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({ holderName: false, licenceNumber: false, issuingBoard: false })
  const [agreed, setAgreed] = useState(() => drafts.get(courseId)?.agreed ?? false)
  const [busy, setBusy] = useState(false)
  /* The date the record will carry: today, fixed when the form opens. */
  const [today] = useState(() => new Date().toISOString())

  useEffect(() => {
    drafts.set(courseId, { values, agreed })
  }, [courseId, values, agreed])

  /* Step 2 needs the three fields; the confirmation tick is on step 3, next to Sign Off. */
  const missing = FIELDS.filter((f) => !values[f.key].trim()).map((f) => f.missing)
  const complete = missing.length === 0
  /* Why Review Details is disabled, naming only the fields still empty (web tooltip). */
  const listed = missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}` : missing[0]
  const missingHint = listed ? `Add the ${listed}.` : ''

  const submit = (onDone: (record: SignOffRecord) => void) => {
    if (!complete || busy) return
    setBusy(true)
    const record: SignOffRecord = {
      courseId,
      learnerId: SIGN_OFF_LEARNER.id,
      learnerName,
      holderName: values.holderName.trim(),
      licenceNumber: values.licenceNumber.trim(),
      issuingBoard: values.issuingBoard.trim(),
      attestation,
      signedAt: today,
    }
    /* A short wait stands in for the request. The record is held, not yet final: the
       licence holder can still go back from step 3 and correct it. */
    window.setTimeout(() => {
      setBusy(false)
      onDone(record)
    }, 900)
  }

  /** At the hand-back (step 3's Continue, or closing after signing): the record becomes
   *  final, the course completes and the certificate unlocks. */
  const finalise = (record: SignOffRecord) => {
    saveSignOff(record)
    drafts.delete(courseId)
  }

  return { learnerName, attestation, values, setValues, touched, setTouched, agreed, setAgreed, busy, today, missing, missingHint, complete, submit, finalise }
}

export type SignOffFormState = ReturnType<typeof useSignOffForm>

/** Step 2: the three licence fields. */
export function SignOffFields({ form, autoFocus = true }: { form: SignOffFormState; autoFocus?: boolean }) {
  const { values, setValues, touched, setTouched, busy } = form

  return (
    <div className="pcd-signoff-form">
      {FIELDS.map((f, i) => {
        const error = touched[f.key] && !values[f.key].trim()
        return (
          <InputField
            key={f.key}
            label={f.label}
            placeholder={f.placeholder}
            autoFocus={autoFocus && i === 0}
            value={values[f.key]}
            disabled={busy}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, [f.key]: true }))}
            validation={error ? 'error' : 'none'}
            helperText={error ? f.error : undefined}
          />
        )
      })}
    </div>
  )
}

/** Step 3: the grey statement panel (D13) under the summary, so the licence holder
 *  confirms what they have just checked, right before Sign Off. The date is in the
 *  summary above, so the panel holds only the declaration. */
export function SignOffStatement({ form }: { form: SignOffFormState }) {
  const { agreed, setAgreed, attestation } = form
  return (
    <div className="pcd-signoff-statement">
      <label className="pcd-signoff-statement__check">
        <Checkbox checked={agreed} onChange={() => setAgreed(!agreed)} />
        <span className="text-lg pcd-signoff-statement__text">{attestation}</span>
      </label>
    </div>
  )
}

/** Step 3: what will be recorded, read only, so the licence holder can check it before
 *  signing off (Edit Details returns to the form to correct it). */
export function SignOffSummary({ record }: { record: SignOffRecord }) {
  const rows: [string, string][] = [
    ['Signed by', `${record.holderName}, personal licence holder`],
    ['Personal licence number', record.licenceNumber],
    ['Issuing licensing board', record.issuingBoard],
    ['Date', formatSignOffDate(record.signedAt)],
  ]
  return (
    <dl className="pcd-signoff-summary">
      {rows.map(([label, value]) => (
        <div key={label} className="pcd-signoff-statement__meta pcd-signoff-summary__row">
          <dt className="pcd-signoff-statement__label">{label}</dt>
          <dd className="pcd-signoff-statement__value">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
