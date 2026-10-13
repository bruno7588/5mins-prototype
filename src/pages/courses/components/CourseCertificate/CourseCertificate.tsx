import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatSignOffDate, type SignOffRecord } from '@/data/trainerSignOff'
import medallion from '@/assets/certificate/medallion.svg'
import companyLogo from '@/assets/certificate/company-logo-sjp.png'
import isoLogo from '@/assets/certificate/iso.png'
import iafLogo from '@/assets/certificate/iaf.png'
import cpdLogo from '@/assets/certificate/cpd.svg'
import fiveMinsLogo from '@/assets/certificate/5mins-logo.svg'
import './CourseCertificate.css'

/** The demo tenant whose logo heads the certificate (web and the mobile app). */
export const CERTIFICATE_COMPANY = "St James's Place"

/** Demo certificate ID, as in the Figma (17637:93386). */
const CERTIFICATE_ID = '7897hkiyu79479hf'

interface CourseCertificateProps {
  /** Alt text for the tenant logo. */
  companyName: string
  learnerName: string
  courseTitle: string
  /** ISO date of issue. */
  issuedOn: string
  /** DES-335: the licence holder row, shown when the course needs sign-off. */
  signOff?: SignOffRecord
}

/** A label over a value, the certificate's field pattern (Figma "date of issue"). */
function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`ccert__field${muted ? ' ccert__field--muted' : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

/**
 * Course certificate document, Figma Course details page App 17637:93334: 900 x 597
 * inside a 24px warning-100 frame (948 x 645 overall). It is paper, so it reads the
 * same in light and dark mode: raw palette tokens only.
 */
function CourseCertificate({ companyName, learnerName, courseTitle, issuedOn, signOff }: CourseCertificateProps) {
  return (
    <article className="ccert" aria-label={`Certificate of completion for ${learnerName}`}>
      <img className="ccert__medallion" src={medallion} alt="" width={374.632} height={426.81} />

      <header className="ccert__header">
        <div className="ccert__company-logo">
          <img src={companyLogo} alt={companyName} />
        </div>
        <p className="ccert__kicker">Certificate of Completion</p>
      </header>

      <div className="ccert__info">
        <div className="ccert__group">
          <p className="ccert__small">This is to certify that</p>
          <p className="ccert__learner">{learnerName}</p>
        </div>
        <div className="ccert__group">
          <p className="ccert__small">has successfully completed the course</p>
          <p className="ccert__course">{courseTitle}</p>
        </div>
        {signOff ? (
          <dl className="ccert__fields ccert__fields--signoff" aria-label="Training sign-off">
            <Field label="Signed by personal licence holder" value={signOff.holderName} />
            <Field label="Licence number" value={signOff.licenceNumber} />
            <Field label="Issuing licensing board" value={signOff.issuingBoard} />
            <Field label="Date of issue" value={formatSignOffDate(issuedOn)} />
          </dl>
        ) : null}
      </div>

      <footer className="ccert__footer">
        <dl className="ccert__fields">
          {/* With a sign-off the date sits in its row (issued when signed); otherwise here. */}
          {signOff ? null : <Field label="Date of issue" value={formatSignOffDate(issuedOn)} />}
          <Field label="Certificate ID" value={CERTIFICATE_ID} muted />
        </dl>
        <div className="ccert__logos">
          <div className="ccert__iso">
            <img src={isoLogo} alt="ISO" />
          </div>
          <img className="ccert__iaf" src={iafLogo} alt="IAF" width={76.8} height={48} />
          <img src={cpdLogo} alt="CPD Certification Service" width={75.7353} height={47.9982} />
          <div className="ccert__powered">
            <span>Powered by</span>
            <img src={fiveMinsLogo} alt="5Mins.ai" width={74} height={16} />
          </div>
        </div>
      </footer>
    </article>
  )
}

/** The sheet's full width: 900 plus the 24px frame on each side. */
const SHEET_W = 948

type FitProps =
  /** Web modal: fit the window, less the modal chrome around the sheet. */
  | { reservedHeight: number; reservedWidth: number; width?: never }
  /** App: a fixed width (the phone's content width). */
  | { width: number; reservedHeight?: never; reservedWidth?: never }

/**
 * The certificate scaled down (never above full size), keeping its 948px-wide
 * layout. The sheet's height follows its content, so it is measured, not fixed.
 */
export function FittedCourseCertificate({ reservedHeight, reservedWidth, width, ...props }: CourseCertificateProps & FitProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [sheetH, setSheetH] = useState(0)
  const [win, setWin] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))

  useLayoutEffect(() => {
    if (sheetRef.current) setSheetH(sheetRef.current.offsetHeight)
  })
  useEffect(() => {
    const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const scale =
    width !== undefined
      ? width / SHEET_W
      : Math.min(1, (win.h - reservedHeight!) / Math.max(sheetH, 1), (win.w - reservedWidth!) / SHEET_W)

  return (
    <div className="ccert-fit" style={{ width: SHEET_W * scale, height: sheetH * scale }}>
      <div ref={sheetRef} className="ccert-fit__sheet" style={{ transform: `scale(${scale})` }}>
        <CourseCertificate {...props} />
      </div>
    </div>
  )
}

export default CourseCertificate
