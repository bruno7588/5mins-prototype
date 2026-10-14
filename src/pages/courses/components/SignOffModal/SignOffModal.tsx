import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mobile, Edit2, DocumentText, TickCircle } from 'iconsax-react'
import WizardShell, { type WizardStep } from '@/pages/your-courses/components/WizardShell/WizardShell'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import type { SignOffRecord } from '@/data/trainerSignOff'
import {
  doneTitle,
  HANDBACK_TITLE,
  handbackAction,
  handbackBody,
  FORM_TITLE,
  HANDOVER_BODY,
  HANDOVER_NOTE,
  HANDOVER_TITLE,
  SignOffFields,
  SignOffStatement,
  SignOffSummary,
  DONE_ACTION,
  useSignOffForm,
  type SignOffStep,
} from '../SignOffForm/SignOffForm'
import HandoverArt from '../SignOffForm/HandoverArt'
import { SuccessTick } from '@/pages/programs/components/LaunchSuccessModal/LaunchSuccessModal'
import './SignOffModal.css'

interface SignOffModalProps {
  courseId: string
  onClose: () => void
  onSigned: (record: SignOffRecord) => void
}

const ORDER: SignOffStep[] = ['handover', 'form', 'done', 'handback']
const STEP_TITLE: Record<SignOffStep, string> = { handover: 'Hand over', form: 'Licence details', done: 'Review', handback: 'Hand back' }
const STEP_ICON = { handover: Mobile, form: Edit2, done: DocumentText, handback: TickCircle }
const LOCKED_SUB: Record<SignOffStep, string> = {
  handover: 'Already signed off',
  form: 'Continue as the licence holder first',
  done: 'Save your details first',
  handback: 'Sign off first',
}

/**
 * Web sign-off (DES-335) on the shared full-screen wizard (WizardShell, top stepper,
 * as Assign Courses): hand over (learner), licence details (licence holder), then a
 * review the licence holder signs off before handing the device back. Mounted only
 * while open, so each opening starts at the handover. The record becomes final only at
 * step 3's Sign-Off button; until then Edit Details returns to the form, and closing
 * saves nothing.
 */
function SignOffModal({ courseId, onClose, onSigned }: SignOffModalProps) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState<SignOffStep>('handover')
  const [record, setRecord] = useState<SignOffRecord | null>(null)
  const form = useSignOffForm(courseId)
  /* Step 3's Sign-Off makes the record final (the course completes, the certificate
     unlocks), then step 4 asks for the device back. */
  const signOff = () => {
    if (!record) return
    form.finalise(record)
    setStep('handback')
  }
  /* Step 4's button (the learner's): on to the certificate. */
  const handBack = () => {
    if (record) onSigned(record)
  }
  /* Closing (X, Escape, Cancel) before the save saves nothing: back to the course,
     certificate still locked. After the save it is the same as handing back. */
  const close = () => {
    if (form.busy) return
    if (step === 'handback') handBack()
    else onClose()
  }
  const motionProps = { ...ARRIVE(reduce), exit: { opacity: 0 }, transition: arriveTransition(reduce) }

  const at = ORDER.indexOf(step)
  const steps: WizardStep[] = ORDER.map((id, i) => ({
    id,
    title: STEP_TITLE[id],
    sub: step === 'handback' && id !== 'handback' ? 'Already signed off' : LOCKED_SUB[id],
    Icon: STEP_ICON[id],
    done: i < at,
    /* One step back at a time: the form back to the handover, and step 3 back to the
       form so the licence holder can correct a detail before signing off. Once saved
       (step 4) every earlier step is locked. */
    state:
      id === step
        ? 'current'
        : (step === 'form' && id === 'handover') || (step === 'done' && id === 'form')
          ? 'reachable'
          : 'locked',
  }))

  const action =
    step === 'handover' ? (
      <Button size="lg" variant="filled" data-autofocus onClick={() => setStep('form')}>
        Continue as Licence Holder
      </Button>
    ) : step === 'form' ? (
      /* Disabled until complete; hovering says what is still missing (DS tooltip pattern). */
      <Tooltip text={form.missingHint} position="Top" alignment="End" icon={false} disabled={form.complete}>
        <Button
          size="lg"
          variant="filled"
          disabled={!form.complete}
          loading={form.busy}
          loadingLabel="Saving..."
          onClick={() =>
            form.submit((r) => {
              setRecord(r)
              setStep('done')
            })
          }
        >
          Save &amp; Review
        </Button>
      </Tooltip>
    ) : step === 'done' ? (
      /* Disabled until the licence holder ticks the declaration above it. */
      <Tooltip text="Tick the confirmation." position="Top" alignment="End" icon={false} disabled={form.agreed}>
        <Button size="lg" variant="filled" disabled={!form.agreed} onClick={signOff}>
          {DONE_ACTION}
        </Button>
      </Tooltip>
    ) : (
      <Button size="lg" variant="filled" autoFocus onClick={handBack}>
        {handbackAction(form.learnerName)}
      </Button>
    )

  return (
    <WizardShell
      open
      layout="top"
      className="pcd-signoff-wizard"
      title="Sign-off"
      closeLabel="Close"
      onClose={close}
      steps={steps}
      onStepSelect={(id) => setStep(id as SignOffStep)}
      action={action}
      backAction={
        step === 'done' ? (
          <Button size="lg" variant="outlined-2" onClick={() => setStep('form')}>
            Edit Details
          </Button>
        ) : step === 'handback' ? null : (
          <Button size="lg" variant="outlined-2" disabled={form.busy} onClick={close}>
            Cancel
          </Button>
        )
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === 'handover' ? (
          <motion.div key="handover" className="pcd-signoff-wizard__step pcd-signoff-wizard__step--center pcd-signoff-wizard__step--handover" {...motionProps}>
            <HandoverArt device="desktop" />
            <div className="pcd-signoff-wizard__headline">
              <h2 className="pcd-signoff-wizard__title">{HANDOVER_TITLE}</h2>
              <p className="pcd-signoff-wizard__body">{HANDOVER_BODY}</p>
              <p className="pcd-signoff-wizard__body pcd-signoff-wizard__body--muted">{HANDOVER_NOTE}</p>
            </div>
          </motion.div>
        ) : step === 'form' ? (
          <motion.div key="form" className="pcd-signoff-wizard__step pcd-signoff-wizard__step--form" {...motionProps}>
            <h2 className="pcd-signoff-wizard__title">{FORM_TITLE}</h2>
            <SignOffFields form={form} />
          </motion.div>
        ) : step === 'done' ? (
          <motion.div key="done" className="pcd-signoff-wizard__step pcd-signoff-wizard__step--done" {...motionProps}>
            <h2 className="pcd-signoff-wizard__title">{doneTitle(form.learnerName)}</h2>
            {record ? <SignOffSummary record={record} /> : null}
            <SignOffStatement form={form} />
          </motion.div>
        ) : (
          <motion.div key="handback" className="pcd-signoff-wizard__step pcd-signoff-wizard__step--center pcd-signoff-wizard__step--handback" {...motionProps}>
            <SuccessTick />
            <div className="pcd-signoff-wizard__headline">
              <h2 className="pcd-signoff-wizard__title">{HANDBACK_TITLE}</h2>
              <p className="pcd-signoff-wizard__body">{handbackBody(form.learnerName)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WizardShell>
  )
}

export default SignOffModal
