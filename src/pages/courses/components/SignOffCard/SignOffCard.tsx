import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import { formatSignOffDate, type SignOffRecord, type SignOffState } from '@/data/trainerSignOff'
import penNib from '@/assets/sign-off/pen-nib.svg'
import './SignOffCard.css'

interface SignOffCardProps {
  state: SignOffState
  record?: SignOffRecord
  onStart: () => void
}

/**
 * Sign-off section on the learner course page (DES-335, web). Placed after the
 * outline and before Certification, as the Electronic Signature Figma
 * (16575:140767) places its Signature row. The row card has no DS component, so
 * it is built here from that Figma with tokens (D13).
 */
function SignOffCard({ state, record, onStart }: SignOffCardProps) {
  const reduce = useReducedMotion()

  return (
    <section className="pcd-signoff" aria-labelledby="pcd-signoff-title">
      <div className="pcd-signoff__head">
        <h2 id="pcd-signoff-title" className="pcd-signoff__title">
          Sign-off
        </h2>
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={state}
          className="pcd-signoff__card"
          {...ARRIVE(reduce)}
          exit={{ opacity: 0 }}
          transition={arriveTransition(reduce)}
        >
          <img className="pcd-signoff__art" src={penNib} alt="" width={72} height={72} />
          {state === 'completed' && record ? (
            <>
              <div className="pcd-signoff__info">
                <p className="pcd-signoff__name">
                  Signed off by {record.holderName} on {formatSignOffDate(record.signedAt)}
                </p>
                <p className="pcd-signoff__body">
                  Licence {record.licenceNumber} · {record.issuingBoard}
                </p>
              </div>
              <Badge type="success" icon label="Signed" />
            </>
          ) : (
            <>
              <div className="pcd-signoff__info">
                <p className="pcd-signoff__name">Licence holder sign-off</p>
                <p className="pcd-signoff__body">
                  {state === 'locked'
                    ? 'Complete the course first. Then your personal licence holder signs off your training here.'
                    : 'Find your personal licence holder and hand them your device. They fill in their licence details.'}
                </p>
              </div>
              <Button variant="filled" disabled={state === 'locked'} onClick={onStart}>
                Sign-Off
              </Button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

export default SignOffCard
