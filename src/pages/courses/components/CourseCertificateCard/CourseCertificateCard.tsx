import { Lock } from 'iconsax-react'
import Button from '@/components/Button/Button'
import medallion from '@/assets/sign-off/certificate-medallion.svg'
import './CourseCertificateCard.css'

interface CourseCertificateCardProps {
  unlocked: boolean
  onGetCertificate: () => void
}

/**
 * Certification row on the course page, as production has it: medallion, title and
 * one line, then a lock until the course is complete and Get Certificate after.
 * Shares the Sign-off card's anatomy and styles (.pcd-signoff__*), its sibling.
 */
function CourseCertificateCard({ unlocked, onGetCertificate }: CourseCertificateCardProps) {
  return (
    <div className="pcd-signoff__card">
      <img
        className={`pcd-signoff__art${unlocked ? '' : ' pcd-cert-row__art--locked'}`}
        src={medallion}
        alt=""
        width={72}
        height={72}
      />
      <div className="pcd-signoff__info">
        <p className="pcd-signoff__name">Certificate of completion</p>
        <p className="pcd-signoff__body">
          {unlocked ? 'Your certificate is ready.' : 'Complete all lessons and the sign-off to unlock your certificate.'}
        </p>
      </div>
      {unlocked ? (
        <Button variant="filled" onClick={onGetCertificate}>
          Get Certificate
        </Button>
      ) : (
        <span className="pcd-cert-row__lock">
          <Lock size={24} color="var(--text-tertiary)" variant="Bold" aria-label="Locked" />
        </span>
      )}
    </div>
  )
}

export default CourseCertificateCard
