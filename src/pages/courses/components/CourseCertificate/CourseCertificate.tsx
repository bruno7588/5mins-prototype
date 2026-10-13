import { Logo } from '@/pages/my-team/MyTeam'
import { formatSignOffDate, type SignOffRecord } from '@/data/trainerSignOff'
import medallion from '@/assets/sign-off/medallion-gold.svg'
import './CourseCertificate.css'

/** The demo tenant printed in the certificate header (web and the mobile app). */
export const CERTIFICATE_COMPANY = 'Thistle and Pine Hotels'

interface CourseCertificateProps {
  companyName: string
  learnerName: string
  courseTitle: string
  /** ISO date of issue. */
  issuedOn: string
  /** DES-335: printed as a band above the footer when the course needs sign-off. */
  signOff?: SignOffRecord
}

/**
 * Course certificate document, Figma Certificates 8303:357 (company-name header,
 * Powered by footer), 900 x 599. It is paper, so it reads the same in light and
 * dark mode: raw palette tokens only, and --text-primary pinned for the 5Mins logo.
 *
 * The sign-off band fits on the same page (D12): the body spacing is tightened
 * from the Figma's 64/24px gaps to make room for it above the footer.
 */
function CourseCertificate({ companyName, learnerName, courseTitle, issuedOn, signOff }: CourseCertificateProps) {
  return (
    <article className="ccert" aria-label={`Certificate of completion for ${learnerName}`}>
      <img className="ccert__medallion" src={medallion} alt="" width={374.632} height={426.81} />

      <header className="ccert__header">
        <p className="ccert__company">{companyName}</p>
      </header>

      <div className="ccert__body">
        <p className="ccert__kicker">Certificate of Completion</p>
        <div className="ccert__group">
          <p className="ccert__small">This is to certify that</p>
          <p className="ccert__learner">{learnerName}</p>
        </div>
        <div className="ccert__group ccert__group--course">
          <p className="ccert__small">has successfully completed the course</p>
          <p className="ccert__course">{courseTitle}</p>
        </div>

        {signOff ? (
          <section className="ccert__signoff" aria-label="Training sign-off">
            <p className="ccert__signoff-title">Training sign-off</p>
            <dl className="ccert__signoff-grid">
              <div>
                <dt>Signed by</dt>
                <dd>{signOff.holderName}, personal licence holder</dd>
              </div>
              <div>
                <dt>Personal licence number</dt>
                <dd>{signOff.licenceNumber}</dd>
              </div>
              <div>
                <dt>Issuing licensing board</dt>
                <dd>{signOff.issuingBoard}</dd>
              </div>
              <div>
                <dt>Signed on</dt>
                <dd>{formatSignOffDate(signOff.signedAt)}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        <footer className="ccert__footer">
          <div className="ccert__issued">
            <span className="ccert__small">Date of issue</span>
            <span className="ccert__date">{formatSignOffDate(issuedOn)}</span>
          </div>
          <div className="ccert__powered">
            <span>Powered by</span>
            <Logo size={16} />
          </div>
        </footer>
      </div>
    </article>
  )
}

export default CourseCertificate
