import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mobile, Slack, Sms } from 'iconsax-react'
import type { ReactNode } from 'react'
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
  todaysChannelText,
  type EmailType,
} from './emailContent'
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

function EmailPreview({ open, tab, onTabChange, onClose, type, name, days, subject, body, customised }: Props) {
  const reduce = useReducedMotion()
  const isReminder = type === 'reminder'
  const subjectLine = subjectText(subject, days) || '(no subject yet)'
  const { above, below } = splitBody(fillFields(body, days))
  const today = todaysChannelText(days)
  const chat = customised ? subjectLine : today.chat
  const phoneTitle = customised ? subjectLine : today.phoneTitle
  const current = isReminder ? tab : 'email'

  const tabs: { id: PreviewTab; label: string; icon: ReactNode }[] = [
    { id: 'email', label: 'Email', icon: <Sms size={16} color="currentColor" variant="Linear" /> },
    ...(INTEGRATIONS.slack
      ? [{ id: 'slack' as const, label: 'Slack', icon: <Slack size={16} color="currentColor" variant="Linear" /> }]
      : []),
    ...(INTEGRATIONS.teams ? [{ id: 'teams' as const, label: 'Microsoft Teams', icon: <TeamsIcon size={16} /> }] : []),
    { id: 'phone', label: 'Phone notification', icon: <Mobile size={16} color="currentColor" variant="Linear" /> },
  ]

  const chatText = (
    <p className="epv-chat__text">
      {customised ? (
        chat
      ) : (
        <>
          {chat.replace(/ here$/, ' ')}
          <span className="epv-chat__link">here</span>
        </>
      )}
    </p>
  )

  let panel: ReactNode
  if (current === 'email') {
    panel = (
      <>
        <dl className="epv-inbox">
          <dt>From</dt>
          <dd>{senderFor(type, customised)}</dd>
          <dt>Subject</dt>
          <dd className="epv-inbox__subject">{subjectLine}</dd>
        </dl>
        <div className="epv-frame epv-frame--email">
          <LiveEmail locked={LOCKED_KIND[type]} above={above} below={below} />
        </div>
      </>
    )
  } else if (current === 'slack') {
    panel = (
      <div className="epv-frame">
        <div className="epv-chat epv-chat--slack">
          <AppIcon />
          <div className="epv-chat__main">
            <div className="epv-chat__meta">
              <strong>5Mins</strong>
              <span className="epv-chat__tag">APP</span>
              <span className="epv-chat__time">10:00</span>
            </div>
            {chatText}
          </div>
        </div>
      </div>
    )
  } else if (current === 'teams') {
    panel = (
      <div className="epv-frame">
        <div className="epv-chat epv-chat--teams">
          <AppIcon />
          <div className="epv-chat__main">
            <div className="epv-chat__meta">
              <strong>5Mins</strong>
              <span className="epv-chat__time">10:00</span>
            </div>
            {chatText}
          </div>
        </div>
      </div>
    )
  } else {
    panel = (
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
        <p className="epv-caption">Android shows the title on one line.</p>
      </div>
    )
  }

  return (
    <ConfirmModal open={open} onClose={onClose} closable className="epv" ariaLabel={`Preview ${name}`}>
      <SectionHeader
        title="Preview"
        description={`${name[0].toUpperCase() + name.slice(1)}, with sample values for Alex Morgan.`}
      />

      {isReminder && (
        <div className="epv-tabs" role="tablist" aria-label="Where it shows">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={current === t.id}
              className={`epv-tab${current === t.id ? ' epv-tab--active' : ''}`}
              onClick={() => onTabChange(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          role={isReminder ? 'tabpanel' : undefined}
          className="epv-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15, ease: 'easeOut' }}
        >
          {panel}
        </motion.div>
      </AnimatePresence>
    </ConfirmModal>
  )
}

export default EmailPreview
