import logoUrl from '@/assets/certificate/5mins-logo.svg'
import { FIELDS, LOCKED_LABEL, ORG_INITIALS, ORG_NAME } from './emailContent'
import './LiveEmail.css'

/* The email as 5Mins sends it (D13): organisation header, the admin's text with
   the locked button or course card, and the 5Mins footer. Engineering connects
   this markup to the email provider. Mail clients show it light, so it stays
   light in both admin themes and uses fixed palette tokens, not semantic ones. */

export type LockedKind = 'button' | 'course' | 'activate'

export function EmailButton({ label }: { label: string }) {
  return (
    <div className="lmail-cta">
      <span className="lmail-btn">{label}</span>
    </div>
  )
}

export function EmailCourseCard() {
  return (
    <div className="lmail-course">
      <div className="lmail-course__thumb" aria-hidden="true" />
      <div className="lmail-course__info">
        <strong className="lmail-course__name">{FIELDS.course_name.sample}</strong>
        <span className="lmail-course__meta">
          {FIELDS.lessons.sample} · {FIELDS.duration.sample}
        </span>
        <span className="lmail-btn">View Course</span>
      </div>
    </div>
  )
}

const SOCIAL: Record<string, string> = {
  Facebook:
    'M13.4 21v-7.6H16l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.5V21h3.1z',
  Instagram:
    'M7.5 2.5h9a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-9a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z',
  LinkedIn:
    'M3.3 9h3.8v11.5H3.3zM5.2 3.1a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM9.6 9h3.6v1.6c.6-1 1.9-1.9 3.8-1.9 3.2 0 4.2 2 4.2 5.2v6.6h-3.8v-5.9c0-1.5-.3-2.7-1.9-2.7s-2.1 1.2-2.1 2.7v5.9H9.6z',
  YouTube:
    'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.1V8.9l5.2 3.1z',
}

const APPLE =
  'M16.4 12.7c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z'
const PLAY = 'M4 2.6 13.4 12 4 21.4c-.3-.2-.5-.6-.5-1V3.6c0-.4.2-.8.5-1zM16.6 9.2l3.5 2c.7.4.7 1.2 0 1.6l-3.5 2-3.2-2.8zM4 2.6c.3-.2.8-.2 1.2 0l11.4 6.6-3.2 2.8zM4 21.4l9.4-9.4 3.2 2.8-11.4 6.6c-.4.2-.9.2-1.2 0z'

function StoreBadges() {
  return (
    <div className="lmail-stores">
      <span className="lmail-store" role="img" aria-label="Download on the App Store">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={APPLE} /></svg>
        <span><small>Available on the</small>App Store</span>
      </span>
      <span className="lmail-store" role="img" aria-label="Get it on Google Play">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={PLAY} /></svg>
        <span><small>GET IT ON</small>Google Play</span>
      </span>
    </div>
  )
}

interface Props {
  locked: LockedKind
  /** Text above and below the locked block, with fields already filled. */
  above: string
  below: string
}

function LiveEmail({ locked, above, below }: Props) {
  const isCourse = locked === 'course'
  const unsubscribe = <p className="lmail-unsub">Unsubscribe</p>
  return (
    <div className="lmail">
      <div className="lmail-head">
        <div className="lmail-org">
          <span className="lmail-org__mark">{ORG_INITIALS}</span>
          {ORG_NAME}
        </div>
        <div className="lmail-powered">
          Powered by
          <img src={logoUrl} alt="5Mins" />
        </div>
      </div>
      <hr className="lmail-rule" />
      <div className="lmail-body">
        <div className="lmail-text" dangerouslySetInnerHTML={{ __html: above }} />
        {isCourse ? <EmailCourseCard /> : <EmailButton label={LOCKED_LABEL[locked]} />}
        <div className="lmail-text" dangerouslySetInnerHTML={{ __html: below }} />
      </div>
      <div className="lmail-foot">
        <hr className="lmail-rule lmail-rule--foot" />
        <div className="lmail-social">
          {Object.entries(SOCIAL).map(([name, d]) => (
            <svg key={name} viewBox="0 0 24 24" role="img" aria-label={name}>
              <path d={d} fillRule="evenodd" />
            </svg>
          ))}
        </div>
        {/* Course reminders show the store badges above Unsubscribe; other emails below. */}
        {isCourse ? (
          <>
            <StoreBadges />
            {unsubscribe}
          </>
        ) : (
          <>
            {unsubscribe}
            <StoreBadges />
          </>
        )}
      </div>
    </div>
  )
}

export default LiveEmail
