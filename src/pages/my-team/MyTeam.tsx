import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home2,
  Profile2User,
  MonitorMobbile,
  SearchNormal1,
  Award,
  Medal,
  UserSquare,
  ShieldSecurity,
  Setting2,
  FlashCircle,
  Calendar,
  Add,
  Mobile,
  Danger,
  InfoCircle,
  TickCircle,
  TaskSquare,
  SmsNotification,
  ArrowDown,
  ArrowUp,
  ArrowLeft2,
  ArrowRight2,
} from 'iconsax-react'
import Tooltip from '../../components/Tooltip/Tooltip'
import Search from '../../components/Search/Search'
import Checkbox from '../../components/Checkbox/Checkbox'
import Dropdown, { type DropdownOption } from '../../components/Dropdown/Dropdown'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import CoursesDrawer, { type CourseBucket, type DrawerCourse } from './CoursesDrawer'
import ReminderDrawer from './ReminderDrawer'
import EngagementTab from './EngagementTab'
import LearningRecordsTab from './LearningRecordsTab'
import avatar1 from './assets/m1.jpg'
import thumb1 from './assets/t1.png'
import thumb2 from './assets/t2.png'
import thumb3 from './assets/t3.jpg'
import avatar2 from './assets/m2.jpg'
import avatar3 from './assets/m3.jpg'
import avatar4 from './assets/m4.jpg'
import './MyTeam.css'

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={(size / 22) * 103} height={size} viewBox="0 0 103 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip_myteam_logo)">
        <path d="M0 15.5275H4.14665C4.18738 16.5133 4.51324 17.275 5.12424 17.8045C5.65378 18.2974 6.40327 18.5418 7.38087 18.5418C8.55806 18.5418 9.45419 18.2159 10.0652 17.5561C10.6762 16.8188 10.9817 15.8127 10.9817 14.5377C10.9817 13.2628 10.6558 12.3626 10.0082 11.7068C9.39716 11.0102 8.5214 10.6599 7.38494 10.6599C6.77394 10.6599 6.22404 10.7821 5.73932 11.0306C5.20978 11.3198 4.82282 11.6864 4.58249 12.1385L0.680245 11.9552L2.07332 0.439941H12.3177C12.888 0.480675 13.3849 0.708781 13.8126 1.11611C14.2403 1.52752 14.4522 2.04076 14.4522 2.65583V4.13445H5.12424L4.57434 8.26073C4.94094 7.93079 5.4664 7.66602 6.15887 7.45828C6.8106 7.25462 7.49899 7.14871 8.23219 7.14871C10.387 7.14871 12.1141 7.80451 13.4175 9.1202C14.7577 10.4766 15.4298 12.22 15.4298 14.3544C15.4298 16.6966 14.6966 18.5622 13.2342 19.9593C11.8126 21.3157 9.85745 21.9919 7.38087 21.9919C5.06314 21.9919 3.27495 21.4379 2.01222 20.33C0.749492 19.1813 0.0814665 17.5805 0 15.5275Z" fill="#00CEE6"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M16.7535 21.5561V2.70471C16.7535 2.09371 16.9694 1.57233 17.3971 1.14463C17.8248 0.716928 18.3462 0.480675 18.9572 0.439941H23.1772L27.336 16.5377L31.4949 0.439941H37.9185V21.5561H33.8819V4.54178L29.6008 21.5561H25.1364L20.7943 4.54178V21.5561H16.7576H16.7535Z" fill="#20222A"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M39.6782 7.47852H41.9471C42.5336 7.47852 43.0387 7.65367 43.4583 8.00805C43.8778 8.36243 44.0856 8.78605 44.0856 9.27893V21.5559H39.6782V7.47852Z" fill="#20222A"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M59.5195 21.556H57.3891C56.7822 21.556 56.2852 21.3605 55.8983 20.9736C55.5113 20.5866 55.3199 20.0815 55.3199 19.4664V11.108C55.3199 10.1263 55.0266 9.40938 54.436 8.95724C53.8494 8.5051 53.1895 8.28107 52.4604 8.28107C51.7313 8.28107 51.0795 8.5051 50.5133 8.95724C49.9472 9.40938 49.662 10.1263 49.662 11.108V21.556H45.4054V11.9674C45.4054 9.18128 46.1223 7.31977 47.5643 6.37475C49.0021 5.43382 50.5948 4.92058 52.3382 4.83911C54.1223 4.83911 55.7639 5.31162 57.2628 6.25256C58.7618 7.19757 59.5113 9.09981 59.5113 11.9674V21.556H59.5195Z" fill="#20222A"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M60.3993 16.2363H64.5907C64.6315 17.0632 64.937 17.6823 65.5154 18.0937C66.1305 18.5051 66.9533 18.7129 67.9798 18.7129C68.7211 18.7129 69.3565 18.5703 69.8901 18.2811C70.383 17.9919 70.6315 17.6008 70.6315 17.1039C70.6315 16.3625 69.7679 15.8045 68.0408 15.4298C67.2995 15.3076 66.7455 15.1813 66.3749 15.0591C64.1956 14.5214 62.7374 13.8819 61.996 13.1405C61.1732 12.3992 60.7618 11.4053 60.7618 10.167C60.7618 8.59879 61.3565 7.2994 62.55 6.26478C63.7842 5.31569 65.385 4.83911 67.3606 4.83911C69.495 4.83911 71.2017 5.31569 72.4767 6.26478C73.6702 7.2994 74.3056 8.63952 74.3871 10.2892H71.7354C70.9533 10.2892 70.3586 9.93892 69.9472 9.23423C69.7842 9.0713 69.6172 8.90429 69.4543 8.73728C68.9614 8.36661 68.2812 8.17924 67.4217 8.17924C66.5622 8.17924 65.9838 8.30144 65.5724 8.54991C65.2017 8.79838 65.0184 9.16906 65.0184 9.666C65.0184 10.3259 66.0857 10.8839 68.2242 11.3361C68.4726 11.4175 68.6885 11.4827 68.8718 11.5234C69.0551 11.5642 69.2303 11.5845 69.3973 11.5845C71.495 12.1222 72.9533 12.7414 73.7761 13.442C74.5541 14.1833 74.9492 15.1772 74.9492 16.4155C74.9492 18.2322 74.2893 19.6375 72.9777 20.6273C71.7435 21.5357 69.8942 21.9919 67.4299 21.9919C64.9655 21.9919 63.3402 21.5194 62.1916 20.5662C60.9981 19.6171 60.4034 18.2322 60.4034 16.4155V16.2281L60.3993 16.2363Z" fill="#20222A"/>
        <path d="M44.6477 3.54777C45.0795 3.29115 45.0795 2.86752 44.6477 2.6109L40.4603 0.109881C40.0285 -0.146739 39.6782 0.0650743 39.6782 0.578313V5.58036C39.6782 6.0936 40.0285 6.30541 40.4603 6.04879L44.6477 3.54777Z" fill="#FFBB38"/>
        <path d="M80.3097 18.3667V21.6539H76.77V19.5887C76.77 18.774 77.2099 18.3667 78.1183 18.3667H80.3097Z" fill="#20222A"/>
        <path d="M86.7903 9.40938H82.6274C83.1284 6.34217 85.2873 4.83911 89.1081 4.83911C93.6783 4.83911 95.9961 6.34217 96.0897 9.40938V15.0469C96.0897 19.6171 93.3362 21.6538 88.8555 21.9674C84.88 22.2811 82.1223 20.4318 82.1223 16.7699C82.216 12.7943 85.0958 11.7271 89.2914 11.3198C91.0755 11.0998 91.9838 10.5662 91.9838 9.66193C91.8902 8.72099 91.0144 8.25256 89.2914 8.25256C87.8209 8.25256 87.0062 8.6273 86.7863 9.40938H86.7903ZM92.049 14.8595V13.3238C91.0796 13.7312 89.9512 14.0733 88.7292 14.3259C87.0714 14.6395 86.2242 15.4216 86.2242 16.6436C86.3178 17.9593 87.0062 18.5866 88.3219 18.5866C90.6396 18.5866 92.049 17.2098 92.049 14.8595Z" fill="#20222A"/>
        <path d="M93.2384 8.65178C94.5867 8.65178 96.0897 10.8432 96.0897 12.1874V21.6538H92.3341V18.1671L93.4706 12.5296L93.2425 8.64771L93.2384 8.65178Z" fill="#20222A"/>
        <path d="M100.257 0.362549C101.634 0.362549 102.293 1.05094 102.261 2.39921V3.62121H98.0979V0.362549H100.257ZM100.257 5.09168C101.605 5.09168 102.261 5.74749 102.261 7.09576V21.6579H98.0979V5.09168H100.257Z" fill="#20222A"/>
      </g>
      <defs>
        <clipPath id="clip_myteam_logo"><rect width="102.261" height="22" fill="white"/></clipPath>
      </defs>
    </svg>
  )
}

function ProgressBar({ value, muted }: { value: number; muted?: boolean }) {
  const segments = 8
  const filled = Math.round((value / 100) * segments)
  return (
    <div className={`mt-cp__progress${muted ? ' mt-cp__progress--muted' : ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      {Array.from({ length: segments }).map((_, i) => (
        <span key={i} className={`mt-cp__progress-seg${i < filled ? ' mt-cp__progress-seg--filled' : ''}`} />
      ))}
    </div>
  )
}

function StatCard({ icon, label, value, tooltip }: { icon: ReactNode; label: string; value: string; tooltip?: string }) {
  return (
    <div className="mt-stat-card">
      <span className="mt-stat-icon">{icon}</span>
      <div className="mt-stat-info">
        <p className="mt-stat-label">
          {label}
          {tooltip && (
            <Tooltip text={tooltip} position="Top" alignment="Center" icon={false}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M7.75 2C4.57469 2 2 4.57469 2 7.75C2 10.9253 4.57469 13.5 7.75 13.5C10.9253 13.5 13.5 10.9253 13.5 7.75C13.5 4.57469 10.9253 2 7.75 2Z" stroke="#454C5E" strokeMiterlimit="10"/>
                <path d="M6.875 6.875H7.875V10.5" stroke="#454C5E" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 10.625H9.25" stroke="#454C5E" strokeMiterlimit="10" strokeLinecap="round"/>
                <path d="M7.75 4.0625C7.5893 4.0625 7.43221 4.11015 7.2986 4.19943C7.16498 4.28871 7.06084 4.4156 6.99935 4.56407C6.93785 4.71253 6.92176 4.8759 6.95311 5.03351C6.98446 5.19112 7.06185 5.33589 7.17548 5.44952C7.28911 5.56315 7.43388 5.64054 7.59149 5.67189C7.7491 5.70324 7.91247 5.68715 8.06093 5.62565C8.2094 5.56416 8.33629 5.46002 8.42557 5.3264C8.51485 5.19279 8.5625 5.0357 8.5625 4.875C8.5625 4.65951 8.4769 4.45285 8.32452 4.30048C8.17215 4.1481 7.96549 4.0625 7.75 4.0625Z" fill="#454C5E"/>
              </svg>
            </Tooltip>
          )}
        </p>
        <p className="mt-stat-value">{value}</p>
      </div>
    </div>
  )
}

type TeamMember = {
  id: string
  name: string
  role: string
  initials: string
  avatarSrc?: string
  managerIds: string[]         // one or more managers — 'me' for direct reports, sub-manager ids for indirects
  teamName?: string            // set on sub-managers — displayed in scope dropdown
  overdue: number              // past due
  atRisk: number               // due within next 30 days
  inProgress: number           // started, not yet complete
  completed: number            // completed all-time
  overallProgress: number      // 0–100 — completion across all assigned courses
}

const CURRENT_USER_ID = 'me'
const CURRENT_USER_NAME = 'Alex Morgan'
const PAGE_SIZE = 10

const COURSE_POOL = [
  'Compliance & Ethics 101',
  'Food Safety Essentials',
  'Customer Service Fundamentals',
  'Data Protection (GDPR)',
  'Harassment Prevention',
  'Conflict Resolution',
  'POS System Training',
  'Fire Safety',
  'Cash Handling',
  'Allergen Awareness',
  'Sustainable Service',
  'Brand Standards',
]

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const THUMB_POOL = [thumb1, thumb2, thumb3]

function coursesFor(memberId: string, bucket: CourseBucket, count: number): DrawerCourse[] {
  if (count === 0) return []
  const seed = [...memberId].reduce((a, c) => a + c.charCodeAt(0), 0)
  return Array.from({ length: count }).map((_, i) => {
    const titleIdx = (seed + i * 7 + (bucket === 'overdue' ? 0 : 3)) % COURSE_POOL.length
    const title = COURSE_POOL[titleIdx]
    const thumbnailSrc = THUMB_POOL[(seed + i) % THUMB_POOL.length]
    const dueOffset = bucket === 'overdue'
      ? -(((seed + i) % 14) + 1)     // 1–14 days ago
      : ((seed + i * 3) % 28) + 2    // 2–29 days ahead
    // start date: typically 30–60 days before due date
    const startOffset = dueOffset - (30 + ((seed + i * 5) % 30))
    const progress = bucket === 'overdue'
      ? (i * 11) % 40
      : ((seed + i * 13) % 3 === 0 ? 0 : ((seed + i * 7) % 45) + 5)  // mix of 0% (not started) and 5-49% (low progress)
    return {
      id: `${memberId}-${bucket}-${i}`,
      title,
      thumbnailSrc,
      startDate: addDays(startOffset),
      dueDate: addDays(dueOffset),
      progress,
    }
  })
}

const team: TeamMember[] = [
  // Direct reports of the current user
  { id: 'm1', name: 'Michael Thompson', role: 'Risk Management Specialist', initials: 'MT', avatarSrc: avatar1, managerIds: [CURRENT_USER_ID], overdue: 2, atRisk: 1, inProgress: 1, completed: 3,  overallProgress: 0  },
  { id: 'm2', name: 'Jessica Hart',     role: 'Compliance Officer',         initials: 'JH', avatarSrc: avatar2, managerIds: [CURRENT_USER_ID], teamName: 'Compliance Team',    overdue: 0, atRisk: 3, inProgress: 2, completed: 5,  overallProgress: 0  },
  { id: 'm3', name: 'David Johnson',    role: 'Investment Strategist',      initials: 'DJ', avatarSrc: avatar3, managerIds: [CURRENT_USER_ID], overdue: 1, atRisk: 0, inProgress: 0, completed: 4,  overallProgress: 12 },
  { id: 'm4', name: 'Noah Williams',    role: 'Concierge',                  initials: 'NW',                     managerIds: [CURRENT_USER_ID], overdue: 0, atRisk: 0, inProgress: 3, completed: 6,  overallProgress: 68 },
  { id: 'm5', name: 'Mei Tanaka',       role: 'Housekeeping',               initials: 'MT',                     managerIds: [CURRENT_USER_ID], overdue: 3, atRisk: 2, inProgress: 0, completed: 2,  overallProgress: 22 },
  { id: 'm6', name: 'Ethan Brooks',     role: 'Barista',                    initials: 'EB',                     managerIds: [CURRENT_USER_ID], overdue: 0, atRisk: 1, inProgress: 1, completed: 4,  overallProgress: 45 },
  { id: 'm7', name: 'Priya Shah',       role: 'Shift Lead',                 initials: 'PS',                     managerIds: [CURRENT_USER_ID], teamName: 'Shift Operations',   overdue: 0, atRisk: 0, inProgress: 2, completed: 7,  overallProgress: 91 },
  { id: 'm8', name: 'Samantha Rivers',  role: 'Financial Analyst',          initials: 'SR', avatarSrc: avatar4, managerIds: [CURRENT_USER_ID], overdue: 1, atRisk: 0, inProgress: 1, completed: 3,  overallProgress: 0  },

  // Indirect reports — Jessica Hart's (m2) compliance team
  { id: 'm9',  name: 'Laura Chen',      role: 'Compliance Analyst',         initials: 'LC', managerIds: ['m2', 'm7'], overdue: 1, atRisk: 2, inProgress: 1, completed: 4, overallProgress: 55 },
  { id: 'm10', name: 'Marcus Reid',     role: 'Internal Auditor',           initials: 'MR', managerIds: ['m2'], overdue: 0, atRisk: 1, inProgress: 2, completed: 3, overallProgress: 72 },
  { id: 'm11', name: 'Sofia Alvarez',   role: 'Compliance Analyst',         initials: 'SA', managerIds: ['m2'], overdue: 2, atRisk: 0, inProgress: 1, completed: 2, overallProgress: 30 },
  { id: 'm12', name: 'Oliver Tran',     role: 'Risk Analyst',               initials: 'OT', managerIds: ['m2'], overdue: 0, atRisk: 0, inProgress: 1, completed: 6, overallProgress: 88 },

  // Indirect reports — Priya Shah's (m7) shift team
  { id: 'm13', name: 'Jamal Carter',    role: 'Barista',                    initials: 'JC', managerIds: ['m7'], overdue: 0, atRisk: 1, inProgress: 2, completed: 3, overallProgress: 60 },
  { id: 'm14', name: 'Hana Ito',        role: 'Server',                     initials: 'HI', managerIds: ['m7'], overdue: 1, atRisk: 1, inProgress: 0, completed: 4, overallProgress: 48 },
  { id: 'm15', name: 'Diego Ramirez',   role: 'Server',                     initials: 'DR', managerIds: ['m7'], overdue: 0, atRisk: 0, inProgress: 3, completed: 2, overallProgress: 40 },
  { id: 'm16', name: 'Aisha Bello',     role: 'Barista',                    initials: 'AB', managerIds: ['m7'], overdue: 2, atRisk: 0, inProgress: 1, completed: 1, overallProgress: 18 },
  { id: 'm17', name: 'Luke Patterson',  role: 'Host',                       initials: 'LP', managerIds: ['m7'], overdue: 0, atRisk: 2, inProgress: 1, completed: 5, overallProgress: 76 },
]

export const learnerSideItems: { label: string; icon: typeof Home2; path?: string }[] = [
  { label: 'For You', icon: Home2 },
  { label: 'Your Workspace', icon: Profile2User },
  { label: 'Knowledge Hub', icon: MonitorMobbile },
  { label: 'Search', icon: SearchNormal1 },
  { label: 'My Team', icon: Award, path: '/my-team' },
  { label: 'My Progress', icon: Medal },
  { label: 'Calendar', icon: Calendar, path: '/calendar' },
  { label: 'Profile', icon: UserSquare },
]

function MyTeam() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerState, setDrawerState] = useState<{ memberId: string; bucket: CourseBucket } | null>(null)
  const [reminderOpen, setReminderOpen] = useState(false)
  const toast = useToast()
  const [sortKey, setSortKey] = useState<'overdue' | 'atRisk' | 'inProgress' | 'completed' | 'progress'>('overdue')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [courseFilter, setCourseFilter] = useState<'all' | 'compliance'>('all')
  const [scopeFilter, setScopeFilter] = useState<string>('direct')
  const [page, setPage] = useState(1)
  const [currentTab, setCurrentTab] = useState<'course-tracker' | 'engagement' | 'learning-records'>('course-tracker')

  const managerNameById = (id: string) =>
    id === CURRENT_USER_ID ? CURRENT_USER_NAME : team.find((m) => m.id === id)?.name ?? '—'

  const sortedManagerIds = (ids: string[]) => {
    const hasMe = ids.includes(CURRENT_USER_ID)
    const rest = ids.filter((id) => id !== CURRENT_USER_ID)
    return hasMe ? [CURRENT_USER_ID, ...rest] : ids
  }
  const showReportsTo = scopeFilter !== 'direct'
  const scopeOptions: DropdownOption[] = [
    { value: 'direct', label: 'Direct reports', description: 'Team members who report to you' },
    { value: 'all', label: 'All reports', description: 'Includes indirect reports from each manager under you' },
  ]

  const toggleSort = (key: 'overdue' | 'atRisk' | 'inProgress' | 'completed' | 'progress') => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const rows = useMemo(() => {
    const scoped = scopeFilter === 'direct'
      ? team.filter((r) => r.managerIds.includes(CURRENT_USER_ID))
      : team
    const q = searchQuery.trim().toLowerCase()
    const base = q
      ? scoped.filter((r) => r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q))
      : scoped
    const scaled = courseFilter === 'compliance'
      ? base.map((r) => ({
          ...r,
          overdue: Math.ceil(r.overdue / 2),
          atRisk: Math.ceil(r.atRisk / 2),
          inProgress: Math.floor(r.inProgress / 2),
          completed: Math.floor(r.completed / 2),
        }))
      : base
    const sorted = [...scaled].sort((a, b) => {
      let diff = 0
      if (sortKey === 'overdue') diff = a.overdue - b.overdue
      else if (sortKey === 'atRisk') diff = a.atRisk - b.atRisk
      else if (sortKey === 'inProgress') diff = a.inProgress - b.inProgress
      else if (sortKey === 'completed') diff = a.completed - b.completed
      else diff = a.overallProgress - b.overallProgress
      return sortDir === 'asc' ? diff : -diff
    })
    return sorted
  }, [searchQuery, sortKey, sortDir, courseFilter, scopeFilter])

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        overdue: acc.overdue + r.overdue,
        atRisk: acc.atRisk + r.atRisk,
        inProgress: acc.inProgress + r.inProgress,
        completed: acc.completed + r.completed,
      }),
      { overdue: 0, atRisk: 0, inProgress: 0, completed: 0 },
    )
  }, [rows])

  const totalCourses = totals.overdue + totals.atRisk + totals.inProgress + totals.completed
  const pct = (n: number) => totalCourses === 0 ? '0%' : `${Math.round((n / totalCourses) * 100)}%`

  const totalRows = rows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalRows)
  const paginatedRows = rows.slice(pageStart, pageEnd)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, courseFilter, scopeFilter, sortKey, sortDir])

  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasScroll, setHasScroll] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setIsScrolled(el.scrollLeft > 0)
    const checkOverflow = () => setHasScroll(el.scrollWidth > el.clientWidth)
    el.addEventListener('scroll', onScroll)
    const ro = new ResizeObserver(checkOverflow)
    ro.observe(el)
    checkOverflow()
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [showReportsTo])

  const visibleIds = paginatedRows.map((r) => r.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev)
        visibleIds.forEach((id) => next.delete(id))
        return next
      }
      const next = new Set(prev)
      visibleIds.forEach((id) => next.add(id))
      return next
    })

  const selectedCount = selectedIds.size
  const canSendReminders = selectedCount > 0

  return (
    <div className="mt-app">
      <header className="mt-topnav">
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/my-team')}>
          <Logo size={22} />
        </button>
        <div className="mt-topnav__right">
          <button type="button" className="mt-topnav__textbtn">
            <span>Get App</span>
            <Mobile size={20} color="var(--text-secondary)" variant="Linear" />
          </button>
          <button type="button" className="mt-topnav__outlinebtn">
            <span>Create</span>
            <Add size={20} color="var(--text-primary)" variant="Linear" />
          </button>
          <div className="mt-topnav__icons">
            <button type="button" className="mt-topnav__iconbtn" aria-label="Notifications">
              <FlashCircle size={24} color="var(--text-primary)" variant="Linear" />
            </button>
          </div>
        </div>
      </header>

      <div className="mt-main">
        <aside className="mt-side">
          <nav className="mt-side__menu">
            {learnerSideItems.map(({ label, icon: Icon, path }) => {
              const isActive = !!path && location.pathname === path
              return (
                <button
                  key={label}
                  type="button"
                  className={`mt-side__item${isActive ? ' mt-side__item--active' : ''}`}
                  onClick={path ? () => navigate(path) : undefined}
                >
                  <Icon size={24} color={isActive ? 'var(--secondary-500)' : 'var(--text-secondary)'} variant="Bold" />
                  <span>{label}</span>
                </button>
              )
            })}
            <button
              type="button"
              className="mt-side__item"
              onClick={() => navigate('/content-library')}
            >
              <ShieldSecurity size={24} color="var(--text-secondary)" variant="Bold" />
              <span>Admin</span>
            </button>
          </nav>

          <div className="mt-side__profile">
            <div className="mt-side__profile-info">
              <p className="mt-side__profile-name">Anthonny Wallace</p>
              <p className="mt-side__profile-email">anthonny@email.com</p>
            </div>
            <Setting2 size={16} color="var(--text-secondary)" variant="Linear" />
          </div>

          <div className="mt-side__powered">
            <span>Powered by</span>
            <Logo size={12} />
          </div>
        </aside>

        <section className="mt-body">
          <header className="mt-pageheader">
            <div className="mt-pageheader__row">
              <div className="mt-pageheader__headline">
                <h1 className="mt-pageheader__title">My Team</h1>
                <p className="mt-pageheader__subtitle">18 Active users · 3 Pending users</p>
              </div>
              <button type="button" className="mt-pageheader__cta">Manage Team</button>
            </div>

            <div className="mt-pageheader__divider" />

            <nav className="mt-tabs">
              <button type="button" className={`mt-tab${currentTab === 'course-tracker' ? ' mt-tab--active' : ''}`} onClick={() => setCurrentTab('course-tracker')}>
                <span>Course Tracker</span>
                {currentTab === 'course-tracker' && <span className="mt-tab__indicator" aria-hidden="true" />}
              </button>
              <button type="button" className={`mt-tab${currentTab === 'engagement' ? ' mt-tab--active' : ''}`} onClick={() => setCurrentTab('engagement')}>
                <span>Engagement</span>
                {currentTab === 'engagement' && <span className="mt-tab__indicator" aria-hidden="true" />}
              </button>
              <button type="button" className={`mt-tab${currentTab === 'learning-records' ? ' mt-tab--active' : ''}`} onClick={() => setCurrentTab('learning-records')}>
                <span>Learning Records</span>
                {currentTab === 'learning-records' && <span className="mt-tab__indicator" aria-hidden="true" />}
              </button>
            </nav>
          </header>

          {currentTab === 'engagement' && <EngagementTab />}
          {currentTab === 'learning-records' && <LearningRecordsTab />}

          {currentTab === 'course-tracker' && <section className="mt-course-progress" aria-label="Course Progress">
            <div className="mt-cp__switcher" role="tablist" aria-label="Course filter">
              <button
                type="button"
                role="tab"
                aria-selected={courseFilter === 'all'}
                className={`mt-cp__switcher-item${courseFilter === 'all' ? ' mt-cp__switcher-item--active' : ''}`}
                onClick={() => setCourseFilter('all')}
              >
                All Courses
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={courseFilter === 'compliance'}
                className={`mt-cp__switcher-item${courseFilter === 'compliance' ? ' mt-cp__switcher-item--active' : ''}`}
                onClick={() => setCourseFilter('compliance')}
              >
                Compliance Only (12)
              </button>
            </div>

            <div className="mt-cp__stats">
              <StatCard
                icon={<TickCircle size={40} color="var(--success-500)" variant="Linear" />}
                label="Completed"
                value={pct(totals.completed)}
                tooltip="Courses completed all-time"
              />
              <StatCard
                icon={<TaskSquare size={40} color="var(--primary-600)" variant="Linear" />}
                label="In Progress"
                value={pct(totals.inProgress)}
                tooltip="Courses started but not yet complete"
              />
              <StatCard
                icon={<InfoCircle size={40} color="var(--warning-500)" variant="Linear" />}
                label="At Risk"
                value={pct(totals.atRisk)}
                tooltip="Courses due within the next 30 days"
              />
              <StatCard
                icon={<Danger size={40} color="var(--danger-500)" variant="Linear" />}
                label="Overdue"
                value={pct(totals.overdue)}
                tooltip="Courses past their due date"
              />
            </div>

            <div className="mt-cp__toolbar">
              <div className="mt-cp__toolbar-search">
                <Search
                  size="M"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search for learners"
                  ariaLabel="Search for learners"
                />
              </div>
              <div className="mt-cp__toolbar-actions">
                <div className="mt-cp__scope">
                  <Dropdown
                    size="md"
                    options={scopeOptions}
                    value={scopeFilter}
                    onChange={setScopeFilter}
                  />
                </div>
                {canSendReminders ? (
                  <button type="button" className="mt-cp__reminders-btn mt-cp__reminders-btn--active" onClick={() => setReminderOpen(true)}>
                    <span>Send Reminders ({selectedCount})</span>
                    <SmsNotification size={20} color="currentColor" variant="Linear" />
                  </button>
                ) : (
                  <Tooltip
                    text="Select learners to remind"
                    position="Top"
                    alignment="End"
                    icon={false}
                  >
                    <button
                      type="button"
                      className="mt-cp__reminders-btn"
                      disabled
                      aria-disabled="true"
                    >
                      <span>Send Reminders</span>
                      <SmsNotification size={20} color="currentColor" variant="Linear" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            <div
              className={`mt-cp__tablescroll${hasScroll ? ' mt-cp__tablescroll--has-scroll' : ''}${isScrolled ? ' mt-cp__tablescroll--scrolled' : ''}`}
              ref={scrollRef}
            >
              <div className="mt-cp__table">
                <div className="mt-cp__table-header">
                  <div className="mt-cp__table-cell mt-cp__table-cell--name">
                    <Checkbox checked={allVisibleSelected} onChange={toggleAll} />
                    <span className="mt-cp__th-label">Name</span>
                  </div>
                  {showReportsTo && (
                    <div className="mt-cp__table-cell mt-cp__table-cell--reports-to">
                      <span className="mt-cp__th-label">Reports to</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="mt-cp__table-cell mt-cp__table-cell--metric mt-cp__th-btn"
                    onClick={() => toggleSort('completed')}
                    aria-label={`Sort by Completed, currently ${sortKey === 'completed' ? sortDir : 'unsorted'}`}
                  >
                    <Tooltip text="Courses completed all-time" position="Top" alignment="Center" icon={false}>
                      <span className="mt-cp__th-label">Completed</span>
                    </Tooltip>
                    {sortKey === 'completed' ? (
                      sortDir === 'asc' ? (
                        <ArrowUp size={16} color="var(--text-secondary)" variant="Linear" />
                      ) : (
                        <ArrowDown size={16} color="var(--text-secondary)" variant="Linear" />
                      )
                    ) : (
                      <span className="mt-cp__th-sort-hint"><ArrowDown size={16} color="var(--text-tertiary)" variant="Linear" /></span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-cp__table-cell mt-cp__table-cell--metric mt-cp__th-btn"
                    onClick={() => toggleSort('inProgress')}
                    aria-label={`Sort by In Progress, currently ${sortKey === 'inProgress' ? sortDir : 'unsorted'}`}
                  >
                    <Tooltip text="Courses started but not yet complete" position="Top" alignment="Center" icon={false}>
                      <span className="mt-cp__th-label">In Progress</span>
                    </Tooltip>
                    {sortKey === 'inProgress' ? (
                      sortDir === 'asc' ? (
                        <ArrowUp size={16} color="var(--text-secondary)" variant="Linear" />
                      ) : (
                        <ArrowDown size={16} color="var(--text-secondary)" variant="Linear" />
                      )
                    ) : (
                      <span className="mt-cp__th-sort-hint"><ArrowDown size={16} color="var(--text-tertiary)" variant="Linear" /></span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-cp__table-cell mt-cp__table-cell--metric mt-cp__th-btn"
                    onClick={() => toggleSort('atRisk')}
                    aria-label={`Sort by At Risk, currently ${sortKey === 'atRisk' ? sortDir : 'unsorted'}`}
                  >
                    <Tooltip text="Courses due within the next 30 days" position="Top" alignment="Center" icon={false}>
                      <span className="mt-cp__th-label">At Risk</span>
                    </Tooltip>
                    {sortKey === 'atRisk' ? (
                      sortDir === 'asc' ? (
                        <ArrowUp size={16} color="var(--text-secondary)" variant="Linear" />
                      ) : (
                        <ArrowDown size={16} color="var(--text-secondary)" variant="Linear" />
                      )
                    ) : (
                      <span className="mt-cp__th-sort-hint"><ArrowDown size={16} color="var(--text-tertiary)" variant="Linear" /></span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-cp__table-cell mt-cp__table-cell--metric mt-cp__th-btn"
                    onClick={() => toggleSort('overdue')}
                    aria-label={`Sort by Overdue, currently ${sortKey === 'overdue' ? sortDir : 'unsorted'}`}
                  >
                    <Tooltip text="Courses past their due date" position="Top" alignment="Center" icon={false}>
                      <span className="mt-cp__th-label">Overdue</span>
                    </Tooltip>
                    {sortKey === 'overdue' ? (
                      sortDir === 'asc' ? (
                        <ArrowUp size={16} color="var(--text-secondary)" variant="Linear" />
                      ) : (
                        <ArrowDown size={16} color="var(--text-secondary)" variant="Linear" />
                      )
                    ) : (
                      <span className="mt-cp__th-sort-hint"><ArrowDown size={16} color="var(--text-tertiary)" variant="Linear" /></span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-cp__table-cell mt-cp__table-cell--metric mt-cp__th-btn"
                    onClick={() => toggleSort('progress')}
                    aria-label={`Sort by Overall progress, currently ${sortKey === 'progress' ? sortDir : 'unsorted'}`}
                  >
                    <span className="mt-cp__th-label">Overall progress</span>
                    {sortKey === 'progress' ? (
                      sortDir === 'asc' ? (
                        <ArrowUp size={16} color="var(--text-secondary)" variant="Linear" />
                      ) : (
                        <ArrowDown size={16} color="var(--text-secondary)" variant="Linear" />
                      )
                    ) : (
                      <span className="mt-cp__th-sort-hint"><ArrowDown size={16} color="var(--text-tertiary)" variant="Linear" /></span>
                    )}
                  </button>
                  <div className="mt-cp__table-cell mt-cp__table-cell--action" aria-hidden="true" />
                </div>

                {rows.length === 0 ? (
                  <div className="mt-cp__empty">
                    <div className="mt-cp__empty-illustration">
                      <span className="mt-cp__empty-zero">0</span>
                      <svg className="mt-cp__empty-accents" width="61" height="50" viewBox="0 0 61 50" fill="none">
                        <path d="M5.5 30C3.5 32 1.5 35.5 1 38" stroke="var(--neutral-400)" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M10 37C8.5 38.5 7 41 6.5 43" stroke="var(--neutral-400)" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M51 8C53 5.5 55.5 2.5 56 1" stroke="var(--neutral-400)" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M55.5 15C57 13 59 10.5 59.5 9" stroke="var(--neutral-400)" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="mt-cp__empty-info">
                      <p className="mt-cp__empty-text">No results found!</p>
                      <p className="mt-cp__empty-subtext">Search for a different name or email</p>
                    </div>
                  </div>
                ) : paginatedRows.map((r) => {
                  const needsAttention = r.overdue > 0 || r.atRisk > 0
                  const progressMuted = !needsAttention && r.overallProgress === 0
                  return (
                    <div
                      className={`mt-cp__table-row${selectedIds.has(r.id) ? ' mt-cp__table-row--selected' : ''}`}
                      key={r.id}
                    >
                      <div className="mt-cp__table-cell mt-cp__table-cell--name">
                        <Checkbox checked={selectedIds.has(r.id)} onChange={() => toggleRow(r.id)} />
                        {r.avatarSrc ? (
                          <img className="mt-cp__avatar mt-cp__avatar--img" src={r.avatarSrc} alt="" />
                        ) : (
                          <div className="mt-cp__avatar" aria-hidden="true">{r.initials}</div>
                        )}
                        <div className="mt-cp__member-info">
                          <span className="mt-cp__member-name">{r.name}</span>
                          <span className="mt-cp__member-role">{r.role}</span>
                        </div>
                      </div>
                      {showReportsTo && (() => {
                        const sortedIds = sortedManagerIds(r.managerIds)
                        const primary = sortedIds[0]
                        const extras = sortedIds.slice(1)
                        return (
                          <div className="mt-cp__table-cell mt-cp__table-cell--reports-to">
                            <span className="mt-cp__reports-to-name">{managerNameById(primary)}</span>
                            {extras.length > 0 && (
                              <div className="mt-cp__reports-to-popover-wrap" tabIndex={0}>
                                <span
                                  className="mt-cp__reports-to-more"
                                  aria-haspopup="listbox"
                                >
                                  +{extras.length}
                                </span>
                                <ul className="dropdown-menu mt-cp__reports-to-listbox" role="listbox">
                                  {sortedIds.map((id) => (
                                    <li key={id}>
                                      <div className="dropdown-option" role="option" aria-selected={false}>
                                        <span>{managerNameById(id)}</span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                      <div className="mt-cp__table-cell mt-cp__table-cell--metric">
                        <span className={`mt-cp__metric-plain${r.completed === 0 ? ' mt-cp__metric-plain--zero' : ''}`}>
                          {r.completed}
                        </span>
                      </div>
                      <div className="mt-cp__table-cell mt-cp__table-cell--metric">
                        <span className={`mt-cp__metric-plain${r.inProgress === 0 ? ' mt-cp__metric-plain--zero' : ''}`}>
                          {r.inProgress}
                        </span>
                      </div>
                      <div className="mt-cp__table-cell mt-cp__table-cell--metric">
                        {r.atRisk > 0 ? (
                          <Tooltip
                            text="View courses"
                            position="Top"
                            alignment="Center"
                            icon={false}
                          >
                            <button
                              type="button"
                              className="mt-cp__metric-link mt-cp__metric-link--warning"
                              onClick={() => setDrawerState({ memberId: r.id, bucket: 'at-risk' })}
                              aria-label={`View ${r.atRisk} at-risk course${r.atRisk === 1 ? '' : 's'} for ${r.name}`}
                            >
                              {r.atRisk}
                            </button>
                          </Tooltip>
                        ) : (
                          <span className="mt-cp__status-dash">–</span>
                        )}
                      </div>
                      <div className="mt-cp__table-cell mt-cp__table-cell--metric">
                        {r.overdue > 0 ? (
                          <Tooltip
                            text="View courses"
                            position="Top"
                            alignment="Center"
                            icon={false}
                          >
                            <button
                              type="button"
                              className="mt-cp__metric-link mt-cp__metric-link--danger"
                              onClick={() => setDrawerState({ memberId: r.id, bucket: 'overdue' })}
                              aria-label={`View ${r.overdue} overdue course${r.overdue === 1 ? '' : 's'} for ${r.name}`}
                            >
                              {r.overdue}
                            </button>
                          </Tooltip>
                        ) : (
                          <span className="mt-cp__status-dash">–</span>
                        )}
                      </div>
                      <div className={`mt-cp__table-cell mt-cp__table-cell--metric${progressMuted ? ' mt-cp__table-cell--muted' : ''}`}>
                        <ProgressBar value={r.overallProgress} muted={progressMuted} />
                        <span className="mt-cp__progress-pct">{r.overallProgress}%</span>
                      </div>
                      <div className="mt-cp__table-cell mt-cp__table-cell--action">
                        {needsAttention && (
                          <Tooltip text="Send reminder" position="Top" alignment="End" icon={false}>
                            <button
                              type="button"
                              className="mt-cp__row-action"
                              aria-label={`Send reminder to ${r.name}`}
                              onClick={() => {
                                setSelectedIds(new Set([r.id]))
                                setReminderOpen(true)
                              }}
                            >
                              <SmsNotification size={20} color="var(--text-secondary)" variant="Linear" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  )
                })}

                {totalRows > 0 && rows.length > 0 && (
                  <div className="mt-cp__pagination">
                    <span className="mt-cp__pagination-label">{pageStart + 1}–{pageEnd} of {totalRows}</span>
                    <button
                      type="button"
                      className="mt-cp__pagination-btn"
                      aria-label="Previous page"
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ArrowLeft2 size={16} color="var(--text-secondary)" variant="Linear" />
                    </button>
                    <button
                      type="button"
                      className="mt-cp__pagination-btn"
                      aria-label="Next page"
                      disabled={safePage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ArrowRight2 size={16} color="var(--text-secondary)" variant="Linear" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>}
        </section>
      </div>

      {drawerState && (() => {
        const member = team.find((m) => m.id === drawerState.memberId)
        if (!member) return null
        const count = drawerState.bucket === 'overdue' ? member.overdue : member.atRisk
        const courses = coursesFor(member.id, drawerState.bucket, count)
        return (
          <CoursesDrawer
            open
            bucket={drawerState.bucket}
            memberName={member.name}
            memberRole={member.role}
            memberAvatarSrc={member.avatarSrc}
            memberInitials={member.initials}
            courses={courses}
            onClose={() => setDrawerState(null)}
          />
        )
      })()}

      <ReminderDrawer
        open={reminderOpen}
        members={team.filter((m) => selectedIds.has(m.id))}
        onClose={() => setReminderOpen(false)}
        onSend={(count) => {
          setReminderOpen(false)
          setSelectedIds(new Set())
          toast.show('success', `${count} reminder${count === 1 ? '' : 's'} sent successfully`)
        }}
      />

      <ToastContainer toasts={toast.toasts} />
    </div>
  )
}

export default MyTeam
