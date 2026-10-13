import { motion, useReducedMotion } from 'framer-motion'
import MobileTopNav from '@/components/mobile/TopNav/TopNav'
import Button from '@/components/Button/Button'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import { getCourseDetail } from '@/pages/courses/mockCourse'
import { SIGN_OFF_LEARNER, useSignOff } from '@/data/trainerSignOff'
import CourseCertificate, { CERTIFICATE_COMPANY } from '@/pages/courses/components/CourseCertificate/CourseCertificate'
import './CertificateScreen.css'

interface CertificateScreenProps {
  courseId: string
  onClose: () => void
  onDownload: () => void
}

/**
 * Mobile certificate view (DES-335): a full screen pushed over the course, the same
 * certificate as web scaled to the phone's width (it is a 900 x 599 sheet), with
 * Download Certificate pinned at the bottom. Holds the sign-off details the course
 * card no longer shows.
 */
function CertificateScreen({ courseId, onClose, onDownload }: CertificateScreenProps) {
  const reduce = useReducedMotion()
  const course = getCourseDetail(courseId)
  const signOff = useSignOff(courseId)

  return (
    <motion.div
      className="m-cert-screen"
      role="dialog"
      aria-modal="true"
      aria-label="Certificate"
      {...ARRIVE(reduce)}
      exit={{ opacity: 0 }}
      transition={arriveTransition(reduce)}
    >
      <MobileTopNav variant="detail" title="Certificate" onBack={onClose} />

      <div className="m-cert-screen__body">
        <div className="m-cert-screen__frame">
          <div className="m-cert-screen__paper">
            <CourseCertificate
              companyName={CERTIFICATE_COMPANY}
              learnerName={SIGN_OFF_LEARNER.name}
              courseTitle={course.title}
              issuedOn={signOff?.signedAt ?? new Date().toISOString()}
              signOff={signOff}
            />
          </div>
        </div>
      </div>

      <footer className="m-cert-screen__footer">
        <Button variant="filled" size="lg" className="m-cert-screen__cta" onClick={onDownload}>
          Download Certificate
        </Button>
      </footer>
    </motion.div>
  )
}

export default CertificateScreen
