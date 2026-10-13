import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mobile, Edit2, TickCircle } from 'iconsax-react'
import WizardShell, { type WizardStep } from '@/pages/your-courses/components/WizardShell/WizardShell'
import Button from '@/components/Button/Button'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import type { SignOffRecord } from '@/data/trainerSignOff'
import {
  DONE_NOTE,
  DONE_TITLE,
  FORM_TITLE,
  HANDOVER_BODY,
  HANDOVER_NOTE,
  HANDOVER_TITLE,
  SignOffFields,
  doneAction,
  doneBody,
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

const ORDER: SignOffStep[] = ['handover', 'form', 'done']
const STEP_TITLE: Record<SignOffStep, string> = { handover: 'Hand over', form: 'Licence details', done: 'Signed off' }
const STEP_ICON = { handover: Mobile, form: Edit2, done: TickCircle }
const LOCKED_SUB: Record<SignOffStep, string> = {
  handover: 'Already signed off',
  form: 'Continue as the licence holder first',
  done: 'Sign off the training first',
}

/**
 * Web sign-off (DES-335) on the shared full-screen wizard (WizardShell, top stepper,
 * as Assign Courses): hand over (learner), licence details (licence holder), signed
 * off and hand the device back. Mounted only while open, so each opening starts at
 * the handover. Once signed, the earlier steps lock and closing counts as done.
 */
function SignOffModal({ courseId, onClose, onSigned }: SignOffModalProps) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState<SignOffStep>('handover')
  const [record, setRecord] = useState<SignOffRecord | null>(null)
  const form = useSignOffForm(courseId)
  const close = () => {
    if (form.busy) return
    if (record) onSigned(record)
    else onClose()
  }
  const motionProps = { ...ARRIVE(reduce), exit: { opacity: 0 }, transition: arriveTransition(reduce) }

  const at = ORDER.indexOf(step)
  const steps: WizardStep[] = ORDER.map((id, i) => ({
    id,
    title: STEP_TITLE[id],
    sub: LOCKED_SUB[id],
    Icon: STEP_ICON[id],
    done: i < at,
    /* Back to the handover from the form only; nothing goes back once signed. */
    state: id === step ? 'current' : step === 'form' && id === 'handover' ? 'reachable' : 'locked',
  }))

  const action =
    step === 'handover' ? (
      <Button variant="filled" data-autofocus onClick={() => setStep('form')}>
        Continue as Licence Holder
      </Button>
    ) : step === 'form' ? (
      <Button
        variant="filled"
        disabled={!form.complete}
        loading={form.busy}
        loadingLabel="Signing off..."
        onClick={() =>
          form.submit((r) => {
            setRecord(r)
            setStep('done')
          })
        }
      >
        Sign Off Training
      </Button>
    ) : (
      <Button variant="filled" autoFocus onClick={close}>
        {doneAction(form.learnerName)}
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
        step === 'done' ? undefined : (
          <Button variant="outlined-2" disabled={form.busy} onClick={close}>
            Cancel
          </Button>
        )
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === 'handover' ? (
          <motion.div key="handover" className="pcd-signoff-wizard__step pcd-signoff-wizard__step--center" {...motionProps}>
            <HandoverArt />
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
        ) : (
          <motion.div key="done" className="pcd-signoff-wizard__step pcd-signoff-wizard__step--center" {...motionProps}>
            <SuccessTick />
            <div className="pcd-signoff-wizard__headline">
              <h2 className="pcd-signoff-wizard__title">{DONE_TITLE}</h2>
              <p className="pcd-signoff-wizard__body">{doneBody(form.learnerName)}</p>
              <p className="pcd-signoff-wizard__body pcd-signoff-wizard__body--muted">{DONE_NOTE}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WizardShell>
  )
}

export default SignOffModal
