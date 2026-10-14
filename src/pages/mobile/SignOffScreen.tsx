import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import MobileTopNav from '@/components/mobile/TopNav/TopNav'
import Button from '@/components/Button/Button'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import {
  DONE_TITLE,
  doneAction,
  FORM_TITLE,
  HANDOVER_NOTE,
  HANDOVER_TITLE,
  SignOffFields,
  SignOffSummary,
  doneNote,
  HANDOVER_BODY,
  STEP_NUMBER,
  useSignOffForm,
  type SignOffStep,
} from '@/pages/courses/components/SignOffForm/SignOffForm'
import HandoverArt from '@/pages/courses/components/SignOffForm/HandoverArt'
import { SuccessTick } from '@/pages/programs/components/LaunchSuccessModal/LaunchSuccessModal'
import Progress from '@/pages/onboarding/Progress'
import type { SignOffRecord } from '@/data/trainerSignOff'
import './SignOffScreen.css'

interface SignOffScreenProps {
  courseId: string
  onClose: () => void
  onSigned: () => void
}

/**
 * Mobile sign-off (DES-335, D10 + D11): a full screen pushed over the course
 * screen, same three steps and copy as web (hand over, licence details, hand back),
 * the primary button pinned at the bottom. Back returns to the course from any step
 * (as web's Cancel and X), except step 3, which goes back to the form; typed details
 * are kept. Nothing is saved until step 3's Agree & Continue. Not a bottom sheet: three fields and the keyboard need the room.
 */
function SignOffScreen({ courseId, onClose, onSigned }: SignOffScreenProps) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState<SignOffStep>('handover')
  const [record, setRecord] = useState<SignOffRecord | null>(null)
  const form = useSignOffForm(courseId)

  /* Step 3 goes back to the form so the licence holder can correct a detail (re-submitting
     replaces the record); elsewhere back returns to the course and saves nothing. */
  const back = () => {
    if (form.busy) return
    if (step === 'done') setStep('form')
    else onClose()
  }
  /* Only step 3's button makes the record final (the course completes, the certificate unlocks). */
  function handBack() {
    if (!record) return
    form.finalise(record)
    onSigned()
  }

  return (
    <motion.div
      className="m-signoff"
      role="dialog"
      aria-modal="true"
      aria-label="Trainer sign-off"
      {...ARRIVE(reduce)}
      exit={{ opacity: 0 }}
      transition={arriveTransition(reduce)}
    >
      <MobileTopNav variant="detail" title="Sign-off" onBack={back} />

      <div className="m-signoff__body">
        {/* The onboarding progress dots in place of "Step N of 3", above the art. */}
        <div className="m-signoff__dots">
          <Progress current={STEP_NUMBER[step]} total={3} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {step === 'handover' ? (
            <motion.div
              key="handover"
              className="m-signoff__step m-signoff__step--center"
              {...ARRIVE(reduce)}
              exit={{ opacity: 0 }}
              transition={arriveTransition(reduce)}
            >
              <HandoverArt />
              <h2 className="m-signoff__title">{HANDOVER_TITLE}</h2>
              <p className="m-signoff__text">{HANDOVER_BODY}</p>
            </motion.div>
          ) : step === 'done' ? (
            <motion.div
              key="done"
              className="m-signoff__step m-signoff__step--center m-signoff__step--done"
              {...ARRIVE(reduce)}
              exit={{ opacity: 0 }}
              transition={arriveTransition(reduce)}
            >
              <div className="m-signoff__success">
                <SuccessTick />
                <h2 className="m-signoff__title">{DONE_TITLE}</h2>
              </div>
              {record ? <SignOffSummary record={record} /> : null}
              <p className="m-signoff__text m-signoff__text--muted">{doneNote(form.learnerName)}</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="m-signoff__step"
              {...ARRIVE(reduce)}
              exit={{ opacity: 0 }}
              transition={arriveTransition(reduce)}
            >
              <div className="m-signoff__headline">
                <h2 className="m-signoff__title">{FORM_TITLE}</h2>
              </div>
              {/* No autofocus: on a phone it would throw the keyboard up over the handover's last words. */}
              <SignOffFields form={form} autoFocus={false} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* At the bottom of the page, just above the pinned button. */}
        {step === 'handover' ? <p className="m-signoff__note">{HANDOVER_NOTE}</p> : null}
      </div>

      <footer className="m-signoff__footer">
        {step === 'handover' ? (
          <Button variant="filled" size="lg" className="m-signoff__cta" onClick={() => setStep('form')}>
            Continue as Licence Holder
          </Button>
        ) : step === 'form' ? (
          <Button
            variant="filled"
            size="lg"
            className="m-signoff__cta"
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
          <Button variant="filled" size="lg" className="m-signoff__cta" onClick={handBack}>
            {doneAction(form.learnerName)}
          </Button>
        )}
      </footer>
    </motion.div>
  )
}

export default SignOffScreen
