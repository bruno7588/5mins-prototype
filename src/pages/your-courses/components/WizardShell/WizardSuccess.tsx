import { useEffect, useRef, useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import Button from '@/components/Button/Button'
import { SuccessTick } from '@/pages/programs/components/LaunchSuccessModal/LaunchSuccessModal'
import { confetti } from '@/lib/confetti'

/* Full-screen success for a wizard launch (Assign courses, Enrol people), passed to
   WizardShell as `takeover`. Confetti spec: the Assign Courses launch confetti artifact. */

/* One burst on launch (Confetti Studio, src/lib/confetti.js), on a canvas over the
   success screen. The canvas goes once the last piece has faded; with reduced motion
   the script draws nothing. */
function LaunchConfetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    return confetti(ref.current, { transparent: true, onComplete: () => setDone(true) })
  }, [])
  if (done) return null
  return <canvas ref={ref} className="wzs-confetti" aria-hidden="true" />
}

interface Props {
  title: string
  message: string
  actionLabel: string
  onAction: () => void
}

function WizardSuccess({ title, message, actionLabel, onAction }: Props) {
  return (
    <MotionConfig reducedMotion="user">
      <LaunchConfetti />
      <div className="wzs-success">
        <div className="lsm-content">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            <SuccessTick />
          </motion.div>
          <motion.div
            className="lsm-info"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
          >
            <h2 className="lsm-title">{title}</h2>
            <p className="lsm-sub">{message}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
          >
            <Button size="lg" onClick={onAction} autoFocus>
              {actionLabel}
            </Button>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  )
}

export default WizardSuccess
