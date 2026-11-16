// Mock data for the learner's My Progress page (Figma My Progress V2, 13018:62099).

import type { ProgressIllustrationType } from '@/assets/progress-illustrations'
import type { SkillLevel } from '@/assets/level-illustrations'
import avatar1 from '@/assets/avatars/avatar-1.jpg'
import avatar2 from '@/assets/avatars/avatar-2.jpg'
import avatar3 from '@/assets/avatars/avatar-3.jpg'
import avatar4 from '@/assets/avatars/avatar-4.jpg'

/** What the info icon explains: a tooltip on web, a bottom sheet in the app. With a
    title the lines are a bulleted list; without one, a single sentence. */
export interface ProgressInfo {
  title?: string
  lines: string[]
}

export interface ProgressStat {
  key: ProgressIllustrationType
  label: string
  value: string
  info: ProgressInfo
}

export const progressStats: ProgressStat[] = [
  {
    key: 'points',
    label: 'Points',
    value: '62%',
    info: {
      title: 'How to earn Skill Points?',
      lines: ['Watch a short to earn 1 Skill Point.', 'Answer a quiz correctly to earn 4 Skill Points.'],
    },
  },
  {
    key: 'jewels',
    label: 'Jewels',
    value: '400',
    info: {
      title: 'How to earn Jewels?',
      lines: [
        'Earn 5 Jewels by watching 5 minutes of shorts in 1 day.',
        'Earn 10 Jewels by watching 5 minutes of shorts for 5 consecutive days.',
        'Earn 25 Jewels by watching 5 minutes of shorts for 10 consecutive days.',
      ],
    },
  },
  { key: 'streak', label: 'Streak', value: '3 days', info: { lines: ["Days in a row you've completed a lesson."] } },
  { key: 'certificates', label: 'Certificates', value: '6', info: { lines: ["Certificates you've earned from completed courses."] } },
]

export interface SkillProgress {
  name: string
  level: SkillLevel
  points: number
  target: number
}

export const skillProgress: SkillProgress[] = [
  { name: 'Organisational Development Software Communication', level: 4, points: 62, target: 80 },
  { name: 'Product Development', level: 2, points: 14, target: 30 },
  { name: 'Commercial Acumen', level: 1, points: 3, target: 10 },
]

export interface CourseResult {
  id: string
  course: string
  score: number
  result: 'Passed' | 'Not Passed'
}

/* The learner's latest graded 5Mins courses. */
export const courseResults: CourseResult[] = [
  { id: 'c1', course: 'Anti Money Laundering and Terrorist Financing', score: 80, result: 'Passed' },
  { id: 'c2', course: 'Fraud Prevention and Risk Assessment', score: 92, result: 'Passed' },
  { id: 'c3', course: 'Handling Difficult Conversations', score: 88, result: 'Passed' },
  { id: 'c4', course: 'Counteracting Financial Crimes and Corruption', score: 41, result: 'Not Passed' },
]

export interface LeaderboardEntry {
  rank: number
  name: string
  avatarSrc?: string
  points: number
  trend: 'up' | 'down'
}

export type LeaderboardScope = 'team' | 'company'

const entries = (rows: [string, number, 'up' | 'down', string?][]): LeaderboardEntry[] =>
  rows.map(([name, points, trend, avatarSrc], i) => ({ rank: i + 1, name, points, trend, avatarSrc }))

export const leaderboards: Record<LeaderboardScope, LeaderboardEntry[]> = {
  team: entries([
    ['Amina Al-Farsi', 1204, 'up', avatar2],
    ["Liam O'Sullivan", 1134, 'up'],
    ['Anthonny Wallace', 1078, 'down', avatar1],
    ['Sofia Gonzalez', 956, 'up', avatar3],
    ['Akira Tanaka', 944, 'up', avatar4],
    ['Nia Nkosi', 867, 'up'],
    ['Oliver Schmidt', 789, 'up'],
    ['Fatima El-Mansour', 611, 'up'],
    ['Raj Patel', 595, 'up'],
    ['Chloe Dubois', 544, 'up'],
    ['Carlos Silva', 471, 'up'],
  ]),
  company: entries([
    ['Yuki Sato', 2310, 'up', avatar3],
    ['Zara Khan', 2188, 'up'],
    ['Amina Al-Farsi', 2040, 'down', avatar2],
    ['Mateo Rossi', 1975, 'up', avatar4],
    ['Priya Nair', 1902, 'up'],
    ["Liam O'Sullivan", 1846, 'up'],
    ['Hannah Becker', 1733, 'down'],
    ['Anthonny Wallace', 1698, 'up', avatar1],
    ['Kwame Mensah', 1611, 'up'],
    ['Elena Petrova', 1540, 'up'],
    ['Sofia Gonzalez', 1492, 'down', avatar3],
  ]),
}

export const leaderboardPeriods = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]
