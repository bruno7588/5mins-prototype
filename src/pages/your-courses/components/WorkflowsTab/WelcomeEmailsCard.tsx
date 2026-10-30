import { useState } from 'react'
import { Edit2 } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import Tooltip from '@/components/Tooltip/Tooltip'
import EmailEditorModal, { type EmailEditorTarget } from './email/EmailEditorModal'
import {
  INVITE_DEFAULT,
  INVITE_REMINDER_STARTER,
  ORG_NAME,
  WELCOME_DEFAULT,
  type EmailText,
} from './email/emailContent'

export interface JoinEmail extends EmailText {
  custom: boolean
}

export type JoinEmailKey = 'invite' | 'welcome' | 'inviteReminder'
export type JoinEmails = Record<JoinEmailKey, JoinEmail>

/** Text each email starts from, and returns to on Reset. Invite reminders have no
    single 5Mins text today, so they start from new starter text (2.2). */
export const JOIN_DEFAULTS: Record<JoinEmailKey, EmailText> = {
  invite: INVITE_DEFAULT,
  welcome: WELCOME_DEFAULT,
  inviteReminder: INVITE_REMINDER_STARTER,
}

const EMAILS: {
  key: JoinEmailKey
  title: string
  sub: string
  name: string
  editor: Omit<EmailEditorTarget, 'initial' | 'customised' | 'days'>
}[] = [
  {
    key: 'invite',
    title: 'Invitation email',
    sub: 'Sent when someone is invited',
    name: 'invitation email',
    editor: {
      type: 'invite',
      title: 'Edit invitation email',
      name: 'invitation email',
      when: `Sent when someone is invited to ${ORG_NAME}, and again if an admin resends the invite.`,
      canReset: true,
      saveLabel: 'Save',
    },
  },
  {
    key: 'welcome',
    title: 'Welcome email',
    sub: 'Sent when someone activates their account',
    name: 'welcome email',
    editor: {
      type: 'welcome',
      title: 'Edit welcome email',
      name: 'welcome email',
      when: 'Your email goes to everyone who joins, including managers and people without the app.',
      canReset: true,
      saveLabel: 'Save',
    },
  },
  {
    key: 'inviteReminder',
    title: 'Invite reminders',
    sub: 'Sent until the account is activated. One message for every reminder.',
    name: 'invite reminders',
    editor: {
      type: 'inviteReminder',
      title: 'Edit invite reminders',
      name: 'invite reminders',
      when: 'Sent 3, 5, 7 and 9 days after the invite until the account is activated. Managers also get one on days 14 and 21.',
      canReset: true,
      saveLabel: 'Save',
      notes: [
        `One subject and message for every reminder, sent from ${ORG_NAME} via 5Mins instead of Maddie from 5Mins.`,
        'New starter text: today each reminder has different text.',
      ],
    },
  },
]

const sentence = (s: string) => s[0].toUpperCase() + s.slice(1)

interface Props {
  emails: JoinEmails
  onChange: (key: JoinEmailKey, email: JoinEmail) => void
}

/* Welcome emails (DES-348 1.1, 2.1, 2.2): the emails people get when they're invited
   and once they've joined. No on/off switch; turning these emails off is not part of
   the brief. */
function WelcomeEmailsCard({ emails, onChange }: Props) {
  const [editing, setEditing] = useState<JoinEmailKey | null>(null)
  const { toasts, show: showToast } = useToast()
  const current = EMAILS.find((e) => e.key === editing)

  return (
    <article className="workflow-card">
      <header className="workflow-card__header">
        <div className="workflow-card__headline">
          <h3 className="workflow-card__title">Welcome emails</h3>
          <p className="workflow-card__desc">Edit the emails people get when they're invited and once they've joined.</p>
        </div>
      </header>

      <ul className="workflow-card__rules">
        <li className="course-reminders-group">
          <div className="course-reminders-group__body">
            {EMAILS.map((e) => (
              <div key={e.key} className="course-reminders-row">
                <div className="welcome-row__text">
                  <span className="course-reminders-row__text">{e.title}</span>
                  <span className="welcome-row__sub">{e.sub}</span>
                </div>
                {emails[e.key].custom && <Badge type="informative" label="Custom email" />}
                <span className="course-reminders-row__actions">
                  <Tooltip text={`Edit ${e.name}`} icon={false}>
                    <button
                      type="button"
                      className="course-reminders-row__icon-btn"
                      onClick={() => setEditing(e.key)}
                      aria-label={`Edit ${e.name}`}
                    >
                      <Edit2 size={16} color="currentColor" variant="Linear" />
                    </button>
                  </Tooltip>
                </span>
              </div>
            ))}
          </div>
        </li>
      </ul>

      {current && (
        <EmailEditorModal
          key={current.key}
          target={{
            ...current.editor,
            days: 7,
            initial: { subject: emails[current.key].subject, body: emails[current.key].body },
            customised: emails[current.key].custom,
          }}
          onClose={() => setEditing(null)}
          onSave={(text) => {
            onChange(current.key, { ...text, custom: true })
            showToast('success', `${sentence(current.name)} updated`)
            setEditing(null)
          }}
          onReset={() => {
            onChange(current.key, { ...JOIN_DEFAULTS[current.key], custom: false })
            showToast('success', `${sentence(current.name)} reset to default`)
            setEditing(null)
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </article>
  )
}

export default WelcomeEmailsCard
