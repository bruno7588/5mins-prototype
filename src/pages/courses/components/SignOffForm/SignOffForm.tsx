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

/* Three steps: hand over (learner), licence details (licence holder), hand back. */
export type SignOffStep = 'handover' | 'form' | 'done'
/** Drives the progress dots (web and app). */
export const STEP_NUMBER: Record<SignOffStep, number> = { handover: 1, form: 2, done: 3 }

export const DONE_TITLE = 'Training signed off'
/** Step 3's button: the device goes back to the learner, mirroring "Continue as Licence Holder". */
export const doneAction = (learnerName: string) => `Continue as ${learnerName.split(' ')[0]}`
export const doneBody = (learnerName: string) =>
  `${learnerName}'s course is complete and their certificate is unlocked.`
export const DONE_NOTE = 'Hand the device back to them.'

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

  const missing = [
    ...FIELDS.filter((f) => !values[f.key].trim()).map((f) => f.missing),
    ...(agreed ? [] : ['the confirmation tick']),
  ]
  const complete = missing.length === 0

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
    /* A short wait stands in for the save. */
    window.setTimeout(() => {
      saveSignOff(record)
      drafts.delete(courseId)
      setBusy(false)
      onDone(record)
    }, 900)
  }

  return { learnerName, attestation, values, setValues, touched, setTouched, agreed, setAgreed, busy, today, missing, complete, submit }
}

export type SignOffFormState = ReturnType<typeof useSignOffForm>

/** The three fields and the statement panel. */
export function SignOffFields({ form, autoFocus = true }: { form: SignOffFormState; autoFocus?: boolean }) {
  const { values, setValues, touched, setTouched, agreed, setAgreed, attestation, today, busy } = form

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

      {/* The grey statement panel from the Figma "Sign course" modal (D13). */}
      <div className="pcd-signoff-statement">
        <label className="pcd-signoff-statement__check">
          <Checkbox checked={agreed} disabled={busy} onChange={() => setAgreed(!agreed)} />
          <span className="text-lg pcd-signoff-statement__text">{attestation}</span>
        </label>
        <div className="pcd-signoff-statement__meta">
          <span className="pcd-signoff-statement__label">Date</span>
          <span className="pcd-signoff-statement__value">{formatSignOffDate(today)}</span>
        </div>
      </div>
    </div>
  )
}
