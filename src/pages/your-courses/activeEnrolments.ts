import licensingThumb from '@/assets/sign-off/licensing-course.jpg'

/* Rows on Your Courses > Active Enrolments: one per course with enrolments, newest
   enrolment first. Seeded for the demo; Assign Courses adds its courses on launch, and
   they stay for the rest of the session (both Your Courses pages read this list). */

export interface EnrolmentRow {
  /** Course id when the row came from Assign Courses; the seeded rows use their title. */
  id: string
  title: string
  /** Days since the last enrolment; 0 is today. Drives the label and the sort. */
  daysAgo: number
  enrolledUsers: number
  /** Course image; defaults to the shared placeholder. */
  thumb?: string
  /** Order of launches in this session, so the latest of several today comes first. */
  launch?: number
}

let launches = 0

const rows: EnrolmentRow[] = [
  // DES-335 demo: the licensing course with the trainer sign-off (opens with a Sign-off tab).
  { id: 'licensing', title: 'Licensing (Scotland) Staff Training', daysAgo: 0, enrolledUsers: 25, thumb: licensingThumb },
  { id: 'marketing-tools', title: 'Marketing Tools and Resources that Everyone Should know Tools and Resources for Everyone', daysAgo: 3, enrolledUsers: 23 },
  { id: 'customer-discovery', title: 'Mastering Customer Discovery: Interviews, Surveys and Insights', daysAgo: 5, enrolledUsers: 41 },
  { id: 'data-privacy', title: 'Foundations of Data Privacy and Compliance for Teams', daysAgo: 7, enrolledUsers: 12 },
  { id: 'leadership', title: 'Leadership Essentials: Coaching, Feedback and Difficult Conversations', daysAgo: 2, enrolledUsers: 58 },
  { id: 'onboarding', title: 'Designing Effective Onboarding Journeys for New Hires', daysAgo: 1, enrolledUsers: 7 },
  { id: 'financial-modelling', title: 'Introduction to Financial Modelling for Non-Finance Managers', daysAgo: 14, enrolledUsers: 34 },
  { id: 'cybersecurity', title: 'Cybersecurity Awareness: Spotting Phishing and Social Engineering', daysAgo: 4, enrolledUsers: 96 },
  { id: 'agile', title: 'Agile Delivery in Practice: Sprints, Standups and Retrospectives', daysAgo: 6, enrolledUsers: 19 },
  { id: 'writing-web', title: 'Writing for the Web: Clarity, Tone and Accessibility', daysAgo: 21, enrolledUsers: 28 },
  { id: 'remote-teams', title: 'Managing Remote Teams Across Time Zones and Cultures', daysAgo: 30, enrolledUsers: 15 },
]

/** Every row, last enrolment first. */
export const activeEnrolments = (): EnrolmentRow[] =>
  [...rows].sort((a, b) => a.daysAgo - b.daysAgo || (b.launch ?? 0) - (a.launch ?? 0))

/** "Today", "Yesterday", "3 days ago", "2 weeks ago", "1 month ago". */
export function lastEnrolmentLabel(daysAgo: number) {
  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 30) {
    const weeks = Math.floor(daysAgo / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  }
  const months = Math.floor(daysAgo / 30)
  return `${months} ${months === 1 ? 'month' : 'months'} ago`
}

/** Assign Courses launched: each course moves to the top as enrolled today, adding the
 *  people it enrolled (a course not on the list yet gets its own row). */
export function recordCourseLaunches(launched: { id: string; name: string; thumb: string; enrolled: number }[]) {
  const launch = ++launches
  launched.forEach((c) => {
    if (c.enrolled === 0) return
    const row = rows.find((r) => r.id === c.id || r.title === c.name)
    if (row) {
      row.daysAgo = 0
      row.enrolledUsers += c.enrolled
      row.launch = launch
    } else {
      rows.push({ id: c.id, title: c.name, daysAgo: 0, enrolledUsers: c.enrolled, thumb: c.thumb, launch })
    }
  })
}
