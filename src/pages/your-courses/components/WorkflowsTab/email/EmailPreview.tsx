import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mobile, Slack, Sms } from 'iconsax-react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import logoUrl from '@/assets/certificate/5mins-logo.svg'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import TeamsIcon from '@/components/icons/TeamsIcon'
import SectionHeader from '@/pages/your-courses/components/SectionHeader/SectionHeader'
import LiveEmail, { type LockedKind } from './LiveEmail'
import {
  FIELDS,
  INTEGRATIONS,
  fillFields,
  senderFor,
  splitBody,
  subjectText,
  type EmailType,
} from './emailContent'
import Tabs from '@/components/Tabs/Tabs'
import './EmailPreview.css'

/* Preview (1.9): the exact email with sample values, plus where a course
   reminder's subject also shows (D9-D11, D14, D17). Prefix: epv- */

export type PreviewTab = 'email' | 'slack' | 'teams' | 'phone'

interface Props {
  open: boolean
  tab: PreviewTab
  onTabChange: (tab: PreviewTab) => void
  onClose: () => void
  type: EmailType
  name: string
  days: number
  subject: string
  body: string
  /** Saved or being edited: custom sender and channel text. */
  customised: boolean
}

const LOCKED_KIND: Record<EmailType, LockedKind> = {
  reminder: 'course',
  welcome: 'button',
  invite: 'activate',
  inviteReminder: 'activate',
}

function AppIcon() {
  return (
    <span className="epv-app-icon" aria-hidden="true">
      <img src={logoUrl} alt="" />
    </span>
  )
}

interface ChannelProps {
  channel: Exclude<PreviewTab, 'email'>
  subject: string
  days: number
}

/** How a reminder's subject shows on Slack, Teams or a phone. */
function ChannelPreview({ channel, subject, days }: ChannelProps) {
  /* Always the subject as typed, saved or not, so every channel matches the editor. */
  const subjectLine = subjectText(subject, days) || '(no subject yet)'
  const phoneTitle = subjectLine

  /* Slack and Teams add the call to action after the subject (once, even if the subject
     already carries it); email and phone show the subject alone. */
  const CHAT_CTA = 'Complete your Assigned Course. Start here'
  const chatLine = subjectLine.includes(CHAT_CTA) ? subjectLine : `${subjectLine}: ${CHAT_CTA}`
  const chatText = <p className="epv-chat__text">{chatLine}</p>

  if (channel === 'phone') {
    return (
      <div className="epv-frame">
        <div className="epv-phone">
          <AppIcon />
          <div className="epv-phone__main">
            <div className="epv-phone__top">
              <span>5Mins</span>
              <span>now</span>
            </div>
            <p className="epv-phone__title">{phoneTitle}</p>
            <p className="epv-phone__body">{FIELDS.course_name.sample}</p>
          </div>
        </div>
      </div>
    )
  }
  /* The Slack or Teams message in a frame with the input fill. */
  return (
    <div className="epv-frame">
      <div className={`epv-chat epv-chat--${channel}`}>
        <AppIcon />
        <div className="epv-chat__main">
          <div className="epv-chat__meta">
            <strong>5Mins</strong>
            {channel === 'slack' && <span className="epv-chat__tag">APP</span>}
            <span className="epv-chat__time">10:00</span>
          </div>
          {chatText}
        </div>
      </div>
    </div>
  )
}

function EmailPreview({ open, tab, onTabChange, onClose, type, name, days, subject, body, customised }: Props) {
  const reduce = useReducedMotion()
  const isReminder = type === 'reminder'
  /* The open tab's natural height, for the stack to ease to. */
  const measureRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')
  useLayoutEffect(() => {
    const el = measureRef.current
    if (!open || !el) return
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [open])
  const subjectLine = subjectText(subject, days) || '(no subject yet)'
  const { above, below } = splitBody(fillFields(body, days))
  const current = isReminder ? tab : 'email'

  const tabs: { id: PreviewTab; label: string; icon: ReactNode }[] = [
    { id: 'email', label: 'Email', icon: <Sms size={16} color="currentColor" variant="Linear" /> },
    ...(INTEGRATIONS.slack
      ? [{ id: 'slack' as const, label: 'Slack', icon: <Slack size={16} color="currentColor" variant="Linear" /> }]
      : []),
    ...(INTEGRATIONS.teams ? [{ id: 'teams' as const, label: 'Microsoft Teams', icon: <TeamsIcon size={16} /> }] : []),
    { id: 'phone', label: 'Phone notification', icon: <Mobile size={16} color="currentColor" variant="Linear" /> },
  ]

  /* From, Subject and the email on one card, no border, Shadow S. */
  const mail = (
    <div className="epv-mail">
      <dl className="epv-inbox">
        <dt>From</dt>
        <dd>{senderFor(type, customised)}</dd>
        <dt>Subject</dt>
        <dd className="epv-inbox__subject">{subjectLine}</dd>
      </dl>
      <div className="epv-frame epv-frame--email">
        <LiveEmail locked={LOCKED_KIND[type]} above={above} below={below} />
      </div>
    </div>
  )
  const panel =
    current === 'email' ? mail : <ChannelPreview channel={current} subject={subject} days={days} />

  return (
    <ConfirmModal open={open} onClose={onClose} closable className={isReminder ? 'epv' : 'epv epv--centred'} ariaLabel={`Preview ${name}`}>
      <SectionHeader
        title="Preview"
        description={name[0].toUpperCase() + name.slice(1)}
        divider={isReminder}
      />

      {isReminder && (
        <Tabs
          className="epv-tabs"
          ariaLabel="Where it shows"
          items={tabs.map((t) => ({ key: t.id, label: <>{t.icon}{t.label}</> }))}
          activeKey={current}
          onChange={(key) => onTabChange(key as PreviewTab)}
        />
      )}

      {/* The modal fits each tab: its height eases between the email and the shorter
          channel previews while its top edge stays put (see .confirm-modal.epv). */}
      <motion.div
        className="epv-stack"
        animate={{ height }}
        transition={{ duration: reduce ? 0 : 0.2, ease: 'easeInOut' }}
      >
        <div ref={measureRef}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            role={isReminder ? 'tabpanel' : undefined}
            className="epv-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: reduce ? 0 : 0.15, ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1, ease: 'easeIn' } }}
          >
            {panel}
          </motion.div>
        </AnimatePresence>
        </div>
      </motion.div>
    </ConfirmModal>
  )
}

export default EmailPreview
