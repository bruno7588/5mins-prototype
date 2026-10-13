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
  /** Omit where there is nowhere to download to — the CTA is then left out
   *  rather than rendered as a button that does nothing (mobile, Figma 3716:83526). */
  onGetCertificate?: () => void
  /** Locked-state heading. Defaults to the program wording; a course passes its own (DES-335). */
  lockedTitle?: string
  /** Unlocked-card illustration. Defaults to the program medallion; a course passes its own (DES-335). */
  medallion?: string
}

function ProgramCertificate({
  unlocked,
  onGetCertificate,
  lockedTitle = 'Earn your Program certificate',
  medallion = certMedallion,
}: ProgramCertificateProps) {
  if (!unlocked) {
    return (
      <div className="pcert-locked">
        <span className="pcert-locked__badge" aria-hidden="true">
          <Lock size={32} color="var(--neutral-400)" variant="Bold" />
        </span>
        <div className="pcert-locked__body">
          <p className="pcert-locked__title">{lockedTitle}</p>
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
      <img className="pcert-card__medallion" src={medallion} alt="" aria-hidden="true" />
      <p className="pcert-card__title">Certificate of Completion</p>
      {onGetCertificate ? (
        <button type="button" className="pcert-card__cta" onClick={onGetCertificate}>
          Get Certificate
        </button>
      ) : null}
    </div>
  )
}

export default ProgramCertificate
