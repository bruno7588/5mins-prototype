/* Content for the customisable emails (DES-348): personal fields, today's 5Mins
   text for each email, starter text for new reminders, and the sample values the
   preview fills in. Subjects and messages are stored as editor HTML: a field is
   <span data-field="first_name"></span>, the locked button or course card is
   <div data-locked-block="button|course"></div>. */

export const ORG_NAME = 'Acme Corp'
export const ORG_INITIALS = 'AC'

// Demo organisation (D12): Slack and Microsoft Teams connected, AI writing on.
export const INTEGRATIONS = { slack: true, teams: true, ai: true }

export const SUBJECT_MAX = 200
export const MESSAGE_MAX = 4000

export type FieldKey =
  | 'first_name'
  | 'last_name'
  | 'full_name'
  | 'email'
  | 'org'
  | 'invited_by'
  | 'course_name'
  | 'due_date'
  | 'days_left'
  | 'lessons'
  | 'duration'

export type FieldGroup = 'Person' | 'Organisation' | 'Invite' | 'Course'

interface FieldDef {
  label: string
  group: FieldGroup
  sample: string
  /** What people see when the value is missing. */
  fallback?: string
}

export const FIELDS: Record<FieldKey, FieldDef> = {
  first_name: { label: 'First name', group: 'Person', sample: 'Alex', fallback: 'there' },
  last_name: { label: 'Last name', group: 'Person', sample: 'Morgan', fallback: 'left out' },
  full_name: { label: 'Full name', group: 'Person', sample: 'Alex Morgan', fallback: 'there' },
  email: { label: 'Email', group: 'Person', sample: 'alex.morgan@acme.example' },
  org: { label: 'Organisation name', group: 'Organisation', sample: ORG_NAME },
  invited_by: { label: 'Invited by', group: 'Invite', sample: 'Jordan Lee', fallback: 'organisation name' },
  course_name: { label: 'Course name', group: 'Course', sample: 'Giving Great Feedback' },
  due_date: { label: 'Due date', group: 'Course', sample: 'November 20, 2026' },
  days_left: { label: 'Days left', group: 'Course', sample: '7 days' },
  lessons: { label: 'Number of lessons', group: 'Course', sample: '8 lessons' },
  duration: { label: 'Course duration', group: 'Course', sample: '40 mins' },
}

const PERSON_FIELDS: FieldKey[] = ['first_name', 'last_name', 'full_name', 'email', 'org']
const COURSE_FIELDS: FieldKey[] = ['course_name', 'due_date', 'days_left', 'lessons', 'duration']

/** reminder: course reminders; invite: the invitation email; inviteReminder: invite reminders. */
export type EmailType = 'reminder' | 'welcome' | 'invite' | 'inviteReminder'

export const fieldsFor = (type: EmailType): FieldKey[] =>
  type === 'reminder'
    ? [...PERSON_FIELDS, ...COURSE_FIELDS]
    : type === 'invite'
      ? [...PERSON_FIELDS, 'invited_by']
      : PERSON_FIELDS

export interface EmailText {
  subject: string
  body: string
}

const f = (key: FieldKey) => `<span data-field="${key}"></span>`
const plural = (days: number) => `${days} ${days === 1 ? 'day' : 'days'}`

export const LOCKED_BUTTON = '<div data-locked-block="button"></div>'
export const LOCKED_COURSE = '<div data-locked-block="course"></div>'
export const LOCKED_ACTIVATE = '<div data-locked-block="activate"></div>'

/** The locked block's button label, by kind. */
export const LOCKED_LABEL = { button: 'Learn Now', activate: 'Activate your account' } as const

const SIGN_OFF = "<p>That's it! See you in 5Mins! 🚀</p><p><strong>Team 5Mins</strong></p>"

/** Today's 5Mins text for the built-in 7-day and 1-day reminders. */
export const reminderDefault = (days: number): EmailText => ({
  subject: `<p>${days === 1 ? 'Power Up : Complete your Course' : "Don't Miss the Boat! : Complete your Course"}</p>`,
  body:
    `<p>Hi ${f('first_name')} 👋</p>` +
    `<p>Your course is waiting for you - just ${plural(days)} remaining to complete it.</p>` +
    '<p>Take a moment today to start your learning journey.</p>' +
    LOCKED_COURSE +
    SIGN_OFF,
})

/** Starter text for reminders admins add, so they don't begin from a blank page. */
export const REMINDER_STARTER: EmailText = {
  subject: `<p>${f('days_left')} left to complete ${f('course_name')}</p>`,
  body:
    `<p>Hi ${f('first_name')} 👋</p>` +
    `<p>You have ${f('days_left')} left to complete <strong>${f('course_name')}</strong>. It's due on ${f('due_date')}.</p>` +
    '<p>Most lessons take about 5 minutes, so you can make good progress today.</p>' +
    LOCKED_COURSE +
    `<p>See you there,</p><p>${f('org')}</p>`,
}

/** Today's 5Mins welcome email, as editable text (its two images are not included). */
export const WELCOME_DEFAULT: EmailText = {
  subject: '<p>Welcome to 5Mins 🎉</p>',
  body:
    `<p><strong>Hey ${f('first_name')} 👋,</strong></p>` +
    '<p>Thanks for signing up to 5Mins! Before you start learning, there are a few things you should know.</p>' +
    '<h3>Our library</h3>' +
    "<ul><li><p>🍿 We've got over 10,000 video lessons (we call them Shorts) covering 100+ sought after skills.</p></li>" +
    '<li><p>🔥 We partner with over 150 coaches, high-growth companies and professors to bring you bite-sized lessons that pack a punch!</p></li></ul>' +
    '<h3>Track your progress</h3>' +
    "<ul><li><p>📈 As you learn on 5Mins, you'll get skill points which will help you climb the leaderboard.</p></li>" +
    '<li><p>🏅 Learn in specific skill areas to level them up and earn exclusive badges.</p></li></ul>' +
    "<p>The best way to learn on 5Mins is to explore, it's time to start your learning journey!</p>" +
    LOCKED_BUTTON,
}

/** Today's 5Mins invitation email, as editable text (phase 2, 2.1). */
export const INVITE_DEFAULT: EmailText = {
  subject: `<p>${f('invited_by')} has invited you to 5Mins</p>`,
  body:
    `<p><strong>Hey ${f('first_name')} 👋,</strong></p>` +
    `<p>5Mins has launched with ${f('org')} and you're invited!</p>` +
    '<p>Your account is ready to go, you just need to activate it below!</p>' +
    "<h3>With 5Mins you'll discover:</h3>" +
    '<ul><li><p>🚀 Engaging micro-lessons tailored to your interests</p></li>' +
    '<li><p>🏆 Interactive quizzes and courses that make learning fun</p></li>' +
    '<li><p>🔥 A personalised journey to help you achieve your goals</p></li></ul>' +
    "<p>Here's a tip, you can sign up in minutes with:</p>" +
    '<ul><li><p>Your work Google or Gmail account</p></li><li><p>Your work Microsoft or Outlook account</p></li></ul>' +
    `<p>You have been invited with: 📧 ${f('email')}</p>` +
    '<p><strong>Are you ready for lift-off? 🚀</strong></p>' +
    LOCKED_ACTIVATE,
}

/** New starter text for invite reminders: today each one has different text (2.2). */
export const INVITE_REMINDER_STARTER: EmailText = {
  subject: `<p>Your ${f('org')} account is waiting for you</p>`,
  body:
    `<p>Hey ${f('first_name')} 👋,</p>` +
    `<p>Your ${f('org')} account on 5Mins is ready, and your colleagues have already started learning.</p>` +
    `<p>Activating takes less than a minute. Use the email you were invited with: 📧 ${f('email')}</p>` +
    LOCKED_ACTIVATE,
}

/** What Slack, Microsoft Teams and the phone show today for an uncustomised built-in reminder (D17). */
export const todaysChannelText = (days: number) => ({
  chat: `${days === 1 ? '🚀 Power Up' : "🛥️ Don't Miss the Boat!"}: Complete your Assigned Course. Start here`,
  phoneTitle: `Hurry up! 😅 ${plural(days)} left...`,
})

/** Sender name (D19): customised emails come from the organisation via 5Mins. */
export function senderFor(type: EmailType, customised: boolean) {
  if (customised) return `${ORG_NAME} via 5Mins`
  if (type === 'welcome') return '5Mins Team'
  if (type === 'inviteReminder') return 'Maddie from 5Mins'
  return '5Mins'
}

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html').body

/** Replaces fields with sample values. `days` sets the Days left sample. */
export function fillFields(html: string, days?: number): string {
  const body = parse(html)
  body.querySelectorAll<HTMLElement>('[data-field]').forEach((el) => {
    const key = el.dataset.field as FieldKey
    const value = key === 'days_left' && days ? plural(days) : FIELDS[key]?.sample ?? ''
    el.replaceWith(document.createTextNode(value))
  })
  return body.innerHTML
}

/** The subject as people read it, with sample values. */
export const subjectText = (html: string, days?: number) =>
  parse(fillFields(html, days)).textContent?.trim() ?? ''

/** Splits a message around its locked block, for the live email. */
export function splitBody(html: string): { above: string; below: string } {
  const [above, below = ''] = html.split(/<div data-locked-block="[a-z]+"[^>]*><\/div>/)
  return { above, below }
}
