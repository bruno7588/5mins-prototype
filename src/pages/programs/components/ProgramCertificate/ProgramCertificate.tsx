import { Lock, DocumentDownload } from 'iconsax-react'
import certBorder from '@/assets/programs/certificate/border.svg'
import certMedallion from '@/assets/programs/certificate/medallion.svg'
import poweredBy5Mins from '@/assets/programs/certificate/poweredby-5mins.svg'
import orgLogo from '@/assets/programs/certificate/org-logo.png'
import './ProgramCertificate.css'

/**
 * Program Certificate (Figma 2504:51984 unlocked / 2495:20734 locked).
 *
 * Two states only:
 *  - Locked   → program not fully passed (still in progress OR a course failed).
 *  - Unlocked → every course passed; renders the issued certificate document.
 *
 * The certificate document is a white "paper" artifact — it uses the raw neutral
 * palette (which does not flip) so it stays light in both light and dark mode.
 */
interface ProgramCertificateProps {
  unlocked: boolean
  programTitle: string
  learnerName: string
  issueDate: string
  onDownload?: () => void
}

function ProgramCertificate({
  unlocked,
  programTitle,
  learnerName,
  issueDate,
  onDownload,
}: ProgramCertificateProps) {
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
    <div className="pcert">
      <div className="pcert__doc" role="img" aria-label={`Program certificate: ${programTitle}, issued to ${learnerName}`}>
        <img className="pcert__border" src={certBorder} alt="" aria-hidden="true" />
        <div className="pcert__inner">
          <img className="pcert__medallion" src={certMedallion} alt="" aria-hidden="true" />
          <div className="pcert__body">
            <div className="pcert__group">
              <p className="pcert__eyebrow">Program Certificate</p>
              <p className="pcert__title">{programTitle}</p>
            </div>
            <div className="pcert__group">
              <p className="pcert__eyebrow">Issued to</p>
              <p className="pcert__name">{learnerName}</p>
            </div>
          </div>
          <div className="pcert__footer">
            <div className="pcert__issue">
              <span className="pcert__issue-label">Date of issue</span>
              <span className="pcert__issue-date">{issueDate}</span>
            </div>
            <div className="pcert__orglogo">
              <img src={orgLogo} alt="" aria-hidden="true" />
            </div>
            <div className="pcert__poweredby">
              <span className="pcert__poweredby-label">Powered by</span>
              <img className="pcert__poweredby-logo" src={poweredBy5Mins} alt="5Mins.ai" />
            </div>
          </div>
        </div>
      </div>
      <button type="button" className="pcert__download" onClick={onDownload}>
        <DocumentDownload size={20} color="var(--text-button-foreground)" variant="Linear" />
        Download Certificate
      </button>
    </div>
  )
}

export default ProgramCertificate
