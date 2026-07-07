import { Lock } from 'iconsax-react'
import certMedallion from '@/assets/programs/certificate/medallion.svg'
import './ProgramCertificate.css'

/**
 * Program Certificate (Figma: locked `2495:20734`, unlocked card `2510:23596`).
 *
 * Two states only:
 *  - Locked   → program not fully passed (still in progress OR a course failed).
 *  - Unlocked → every course passed; shows a compact "Get Certificate" card.
 */
interface ProgramCertificateProps {
  unlocked: boolean
  onGetCertificate?: () => void
}

function ProgramCertificate({ unlocked, onGetCertificate }: ProgramCertificateProps) {
  if (!unlocked) {
    return (
      <div className="pcert-locked">
        <span className="pcert-locked__badge" aria-hidden="true">
          <Lock size={28} color="var(--neutral-400)" variant="Bold" />
        </span>
        <div className="pcert-locked__body">
          <p className="pcert-locked__title">Earn your Program certificate</p>
          <div className="pcert-locked__lines" aria-hidden="true">
            <span className="pcert-locked__line" />
            <span className="pcert-locked__line pcert-locked__line--short" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pcert-card">
      <img className="pcert-card__medallion" src={certMedallion} alt="" aria-hidden="true" />
      <p className="pcert-card__title">Certificate of Completion</p>
      <button type="button" className="pcert-card__cta" onClick={onGetCertificate}>
        Get Certificate
      </button>
    </div>
  )
}

export default ProgramCertificate
