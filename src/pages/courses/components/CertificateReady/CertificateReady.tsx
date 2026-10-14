import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import { ConfettiLayer, LAST_LANDING_MS } from '@/pages/programs/components/LaunchSuccessModal/LaunchSuccessModal'
import medallion from '@/assets/sign-off/certificate-medallion.svg'
import './CertificateReady.css'

interface CertificateReadyProps {
  courseTitle: string
  onClose: () => void
  onGetCertificate: () => void
  /** Inside the mobile phone frame: fills the phone screen, not the browser window. */
  contained?: boolean
}

/**
 * "Congratulations" takeover shown once the sign-off completes the course (DES-335),
 * as production shows it: glowing medallion, the course named, Get Certificate.
 * Built on the program launch success shell (.lsm-*, confetti, full-screen close).
 */
function CertificateReady({ courseTitle, onClose, onGetCertificate, contained = false }: CertificateReadyProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [raining, setRaining] = useState(true)
  useOverlayA11y(panelRef, true, { onEscape: onClose })

  useEffect(() => {
    const t = setTimeout(() => setRaining(false), LAST_LANDING_MS + 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div ref={panelRef} className={`lsm-overlay pcd-cert-ready${contained ? ' pcd-cert-ready--contained' : ''}`} role="dialog" aria-modal="true" aria-label="Certificate ready" tabIndex={-1}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>{raining && <ConfettiLayer />}</AnimatePresence>

        <CloseButton variant="fullscreen" onClick={onClose} className="lsm-close" />

        <div className="lsm-content">
          <motion.div
            className="pcd-cert-ready__medallion"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            <img src={medallion} alt="" width={120} height={120} />
          </motion.div>
          <motion.div
            className="lsm-info"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
          >
            {/* DS H3 (Figma 17665:24187). */}
            <h2 className="h3 pcd-cert-ready__title">Congratulations!</h2>
            <p className="lsm-sub">
              Your certificate for completing the course <strong className="pcd-cert-ready__course">{courseTitle}</strong>{' '}
              is ready to download.
            </p>
          </motion.div>
          {/* In the phone the button is pinned full width in a footer, as on the other app screens. */}
          <motion.div
            className="pcd-cert-ready__action"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
          >
            <Button size="lg" data-autofocus onClick={onGetCertificate}>
              Get Certificate
            </Button>
          </motion.div>
        </div>
      </MotionConfig>
    </div>
  )
}

export default CertificateReady
