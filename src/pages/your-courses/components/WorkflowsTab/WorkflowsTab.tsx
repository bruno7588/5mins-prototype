import { useState } from 'react'
import { useCurrentUser } from '../../../../hooks/useCurrentUser'
import WorkflowCard from './WorkflowCard'
import EmailPreviewModal from './EmailPreviewModal'
import CourseRemindersCard, { type Reminder } from './CourseRemindersCard'
import WelcomeEmailsCard, { JOIN_DEFAULTS, type JoinEmails } from './WelcomeEmailsCard'
import { reminderDefault } from './email/emailContent'
import './WorkflowsTab.css'

// Built-in reminders start with today's 5Mins text (DES-348 1.3).
const SEED_REMINDERS: Reminder[] = [
  { id: 'r_seed_7', days: 7, ...reminderDefault(7), system: true },
  { id: 'r_seed_1', days: 1, ...reminderDefault(1), system: true },
]

function WorkflowsTab() {
  const user = useCurrentUser()
  const [enabled, setEnabled] = useState(false)
  const [frequency, setFrequency] = useState('week')
  const [scope, setScope] = useState('direct')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [reminders, setReminders] = useState<Reminder[]>(SEED_REMINDERS)
  const [joinEmails, setJoinEmails] = useState<JoinEmails>({
    invite: { ...JOIN_DEFAULTS.invite, custom: false },
    welcome: { ...JOIN_DEFAULTS.welcome, custom: false },
    inviteReminder: { ...JOIN_DEFAULTS.inviteReminder, custom: false },
  })

  if (user.role !== 'admin') {
    return (
      <div className="workflows-tab">
        <div className="workflows-empty">
          <p className="workflows-empty__title">Workflows are admin-only</p>
          <p className="workflows-empty__sub">Ask an admin to enable workflows for your team.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="workflows-tab">
      <WorkflowCard
        enabled={enabled}
        frequency={frequency}
        scope={scope}
        lastSent="Apr 27 to 4 managers"
        onToggle={() => setEnabled((v) => !v)}
        onFrequencyChange={setFrequency}
        onScopeChange={setScope}
        onPreview={() => setPreviewOpen(true)}
      />
      <CourseRemindersCard
        enabled={remindersEnabled}
        reminders={reminders}
        onToggle={() => setRemindersEnabled((v) => !v)}
        onChange={setReminders}
      />
      <WelcomeEmailsCard
        emails={joinEmails}
        onChange={(key, email) => setJoinEmails((all) => ({ ...all, [key]: email }))}
      />
      <EmailPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  )
}

export default WorkflowsTab
