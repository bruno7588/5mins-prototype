import {
  LOCKED_ACTIVATE,
  LOCKED_BUTTON,
  LOCKED_COURSE,
  type EmailText,
  type EmailType,
  type FieldKey,
} from './emailContent'

/* Write with AI (2.3), simulated for the prototype: a draft per email, tone and
   length, written with personal fields. Production calls the AI service with the
   admin's brief. */

export type Tone = 'friendly' | 'professional' | 'urgent'
export type Length = 'short' | 'long'

const f = (key: FieldKey) => `<span data-field="${key}"></span>`

const LOCKED: Record<EmailType, string> = {
  reminder: LOCKED_COURSE,
  welcome: LOCKED_BUTTON,
  invite: LOCKED_ACTIVATE,
  inviteReminder: LOCKED_ACTIVATE,
}

const SUBJECTS: Record<EmailType, Record<Tone, string>> = {
  reminder: {
    friendly: `${f('first_name')}, ${f('days_left')} left on ${f('course_name')}`,
    professional: `Reminder: ${f('course_name')} is due on ${f('due_date')}`,
    urgent: `Action needed: complete ${f('course_name')} in ${f('days_left')}`,
  },
  welcome: {
    friendly: `Welcome to ${f('org')} on 5Mins, ${f('first_name')} 🎉`,
    professional: `Your ${f('org')} learning account is ready`,
    urgent: `Start your first lesson today, ${f('first_name')}`,
  },
  invite: {
    friendly: `${f('first_name')}, you're invited to learn with ${f('org')}`,
    professional: `${f('invited_by')} has invited you to ${f('org')} on 5Mins`,
    urgent: `Activate your ${f('org')} learning account`,
  },
  inviteReminder: {
    friendly: `${f('first_name')}, your ${f('org')} account is still waiting`,
    professional: `Reminder: activate your ${f('org')} account`,
    urgent: `Your ${f('org')} account isn't active yet`,
  },
}

const OPENERS: Record<Tone, string> = {
  friendly: `<p>Hi ${f('first_name')} 👋</p>`,
  professional: `<p>Hello ${f('first_name')},</p>`,
  urgent: `<p>${f('first_name')},</p>`,
}

const LINES: Record<EmailType, Record<Tone, string>> = {
  reminder: {
    friendly: `<p>Just a friendly nudge: <strong>${f('course_name')}</strong> is due on ${f('due_date')}. It's ${f('lessons')} of about 5 minutes each.</p>`,
    professional: `<p><strong>${f('course_name')}</strong> is due on ${f('due_date')}. Please complete it before then.</p>`,
    urgent: `<p>You have ${f('days_left')} to complete <strong>${f('course_name')}</strong>. Please complete it today.</p>`,
  },
  welcome: {
    friendly: `<p>Welcome to 5Mins! ${f('org')} has set you up with short, practical lessons you can take anywhere.</p>`,
    professional: `<p>Your 5Mins account with ${f('org')} is now active. You can start learning straight away.</p>`,
    urgent: `<p>Your account is active. Take your first lesson today to get started.</p>`,
  },
  invite: {
    friendly: `<p>${f('org')} has set you up on 5Mins, a place for short, practical lessons.</p>`,
    professional: `<p>${f('invited_by')} has invited you to join ${f('org')} on 5Mins.</p>`,
    urgent: `<p>Your ${f('org')} account is ready. Activate it now to start learning.</p>`,
  },
  inviteReminder: {
    friendly: `<p>Your ${f('org')} account on 5Mins is ready, and your colleagues have already started learning.</p>`,
    professional: `<p>Your ${f('org')} account on 5Mins hasn't been activated yet.</p>`,
    urgent: `<p>Your ${f('org')} account is still not active. Activate it today to keep up with your team.</p>`,
  },
}

const EXTRA: Record<EmailType, string> = {
  reminder: `<p>Each lesson takes about 5 minutes, so ${f('duration')} is all it takes.</p>`,
  welcome: '<ul><li><p>Short video lessons on 100+ skills</p></li><li><p>Quizzes that show what you have learned</p></li></ul>',
  invite: `<p>Use the email you were invited with: ${f('email')}</p>`,
  inviteReminder: `<p>Activating takes less than a minute. Use the email you were invited with: ${f('email')}</p>`,
}

export function draftEmail(type: EmailType, tone: Tone, length: Length): EmailText {
  return {
    subject: `<p>${SUBJECTS[type][tone]}</p>`,
    body:
      OPENERS[tone] +
      LINES[type][tone] +
      (length === 'long' ? EXTRA[type] : '') +
      LOCKED[type] +
      `<p>${tone === 'friendly' ? 'See you there,' : 'Thank you,'}</p><p>${f('org')}</p>`,
  }
}
