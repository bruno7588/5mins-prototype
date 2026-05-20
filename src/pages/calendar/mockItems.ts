export type CalendarItemType = 'course' | 'event'
export type AttendanceState = 'none' | 'attended' | 'missed'

export interface Attendee {
  initials: string
  background: string
}

export interface CalendarItem {
  id: string
  type: CalendarItemType
  title: string
  startsAt: string
  endsAt: string
  timezone: string
  location?: string
  locationKind?: 'venue' | 'virtual'
  kind: string
  thumbnailGradient: string
  hostNote?: string
  instructor?: string
  description?: string
  attendees: Attendee[]
  overflowCount?: number
  attendance: AttendanceState
  /** Course-only metadata (per DS lesson-card spec, applied in list-card form) */
  durationMinutes?: number
  lessonCount?: number
  progress?: number
}

const av = (initials: string, background: string): Attendee => ({ initials, background })

const stack = [
  av('AS', 'linear-gradient(135deg, #ffb938, #f97316)'),
  av('NN', 'linear-gradient(135deg, #1f2937, #111827)'),
  av('FS', 'linear-gradient(135deg, #3b82f6, #60a5fa)'),
  av('A1', 'linear-gradient(135deg, #ef4444, #f87171)'),
  av('AT', 'linear-gradient(135deg, #1e40af, #3b82f6)'),
  av('A2', 'linear-gradient(135deg, #06b6d4, #22d3ee)'),
  av('CF', 'linear-gradient(135deg, #7c2d12, #b45309)'),
]

export const upcomingItems: CalendarItem[] = [
  {
    id: 'u1',
    type: 'event',
    title: 'Tech Meetup',
    startsAt: '2026-05-18T06:00:00+01:00',
    endsAt: '2026-05-18T07:30:00+01:00',
    timezone: 'London (GMT +01:00)',
    location: 'Zoom',
    locationKind: 'virtual',
    kind: 'Live Session',
    thumbnailGradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    hostNote: 'LIVE 6:00 AM',
    instructor: 'Martina Rossi',
    description:
      "Join 5Mins for a fast-paced tech meetup focused on emerging tools and what they mean for your day-to-day work. Expect quick demos, candid Q&A and a chance to swap notes with peers.",
    attendees: [stack[0], stack[2]],
    overflowCount: 12,
    attendance: 'none',
  },
  {
    id: 'u2',
    type: 'course',
    title: 'Onboarding: Health & Safety Basics',
    startsAt: '2026-05-18T14:00:00+01:00',
    endsAt: '2026-05-18T15:00:00+01:00',
    timezone: 'London (GMT +01:00)',
    kind: 'Course',
    thumbnailGradient: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
    attendees: [],
    attendance: 'none',
    durationMinutes: 22,
    lessonCount: 6,
    progress: 0,
  },
  {
    id: 'u3',
    type: 'event',
    title: 'Training events',
    startsAt: '2026-05-19T09:50:00+00:00',
    endsAt: '2026-05-19T13:50:00+00:00',
    timezone: 'Azores (GMT +00:00)',
    location: 'Building 12',
    locationKind: 'venue',
    kind: 'Course Event',
    thumbnailGradient: 'linear-gradient(135deg, #fbcfe8, #fca5a5)',
    instructor: 'Alex Tan',
    description:
      "An in-person training day covering practical scenarios for new starters. Bring questions — we'll work through real examples together.",
    attendees: [stack[0], stack[1], stack[2], stack[4]],
    overflowCount: 8,
    attendance: 'none',
  },
  {
    id: 'u4',
    type: 'event',
    title: 'Next Big Event',
    startsAt: '2026-05-21T18:20:00+01:00',
    endsAt: '2026-05-21T19:20:00+01:00',
    timezone: 'London (GMT +01:00)',
    location: 'Room 200',
    locationKind: 'venue',
    kind: 'Course Event',
    thumbnailGradient: 'linear-gradient(135deg, #fb7185, #f97316)',
    instructor: 'Priya Shah',
    description:
      "A flagship company event with talks, workshops and time to catch up across teams. The agenda will be shared a week before — register to get the latest.",
    attendees: [stack[0], stack[5], stack[3], stack[6]],
    overflowCount: 4,
    attendance: 'none',
  },
  {
    id: 'u5',
    type: 'course',
    title: 'Customer Conversations — Module 3',
    startsAt: '2026-05-25T10:00:00+01:00',
    endsAt: '2026-05-25T11:30:00+01:00',
    timezone: 'London (GMT +01:00)',
    kind: 'Course',
    thumbnailGradient: 'linear-gradient(135deg, #60a5fa, #818cf8)',
    attendees: [],
    attendance: 'none',
    durationMinutes: 17,
    lessonCount: 5,
    progress: 0,
  },
  {
    id: 'u6',
    type: 'event',
    title: 'Leadership Off-site',
    startsAt: '2026-06-01T09:00:00+01:00',
    endsAt: '2026-06-03T17:00:00+01:00',
    timezone: 'London (GMT +01:00)',
    location: 'The Barn, Cotswolds',
    locationKind: 'venue',
    kind: 'Course Event',
    thumbnailGradient: 'linear-gradient(135deg, #1e3a8a, #4338ca)',
    instructor: 'Sam Okafor',
    description:
      "A 3-day off-site for the leadership team — strategy sessions, peer coaching and time to reset together. Travel and accommodation are covered.",
    attendees: [stack[0], stack[2], stack[4]],
    overflowCount: 6,
    attendance: 'none',
  },
]

export const pastItems: CalendarItem[] = [
  {
    id: 'p0',
    type: 'course',
    title: 'Compliance Refresher Q2',
    startsAt: '2026-05-15T09:00:00+01:00',
    endsAt: '2026-05-15T10:00:00+01:00',
    timezone: 'London (GMT +01:00)',
    kind: 'Course',
    thumbnailGradient: 'linear-gradient(135deg, #34d399, #14b8a6)',
    attendees: [],
    attendance: 'none',
    durationMinutes: 14,
    lessonCount: 4,
    progress: 62,
  },
  {
    id: 'p1',
    type: 'event',
    title: 'Monthly venue',
    startsAt: '2026-05-14T14:15:00-04:00',
    endsAt: '2026-05-14T18:15:00-04:00',
    timezone: 'Caracas (GMT -04:00)',
    location: 'Park avenue',
    locationKind: 'venue',
    kind: 'Course Event',
    thumbnailGradient: 'linear-gradient(135deg, #1d4ed8, #6366f1)',
    attendees: [stack[0]],
    attendance: 'attended',
  },
  {
    id: 'p2',
    type: 'event',
    title: 'Online event',
    startsAt: '2026-05-12T18:57:00+01:00',
    endsAt: '2026-05-12T22:57:00+01:00',
    timezone: 'London (GMT +01:00)',
    location: 'Google Meet',
    locationKind: 'virtual',
    kind: 'Course Event',
    thumbnailGradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    attendees: [stack[0], stack[5]],
    overflowCount: 3,
    attendance: 'none',
  },
  {
    id: 'p3',
    type: 'event',
    title: 'Quarterly all-hands',
    startsAt: '2026-05-02T16:30:00+01:00',
    endsAt: '2026-05-02T20:30:00+01:00',
    timezone: 'Lisbon (GMT +01:00)',
    location: 'Auditorium',
    locationKind: 'venue',
    kind: 'Course Event',
    thumbnailGradient: 'linear-gradient(135deg, #f97316, #db2777)',
    attendees: [stack[0], stack[3], stack[4], stack[1]],
    overflowCount: 15,
    attendance: 'missed',
  },
]
