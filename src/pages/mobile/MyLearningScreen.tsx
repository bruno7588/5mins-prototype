import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ImportCurve } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import Button from '@/components/Button/Button'
import Tabs from '@/components/Tabs/Tabs'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import { getSkillIllustrationByName } from '@/assets/skill-icons'
import { formatDay } from '@/data/externalTraining'
import { LeaderboardCard, ProgressStatTiles } from '@/pages/my-progress/MyProgress'
import type { ProgressStat } from '@/pages/my-progress/myProgressData'
import { COURSES, STATUS_BADGE, STAT_GROUPS, shareOf, type CourseProgress } from '@/pages/user-profile/UserProfile'
import { COURSE_STATUS_CARDS } from '@/data/courseStatusCards'
import StatTile from '@/components/StatTile/StatTile'
import { MAX_LEVEL, SKILLS, type Skill } from '@/pages/user-profile/components/SkillsTab/SkillsTab'
import InfoIcon from '@/components/icons/InfoIcon'
import ExternalTrainingScreen from './ExternalTrainingScreen'
import './ExternalTrainingScreen.css'
import './MyLearningScreen.css'

/* Native app "My Learning" screen (the My Learning tab, under the profile header; DES-369). The same
   four tabs as the web page (src/pages/user-profile), with nothing in a table:
   - Engagement: the stat tiles and the Leaderboard, in one column. The Performance chart
     is web only.
   - Skills: one row per skill, the level bar and "n/5" under its name. Read only; the
     info icon opens the skill's description in a bottom sheet (a tooltip on web).
   - Course Progress: the four status tiles (Completed, In progress, At risk, Overdue), as
     on web, then one card per course; the rest of the row in a bottom sheet.
   - External Training: the card list that screen already had.
   The course cards and their sheet reuse the External Training card styles (m-xt-).
   Prefix: m-ml- */

const TABS = [
  { key: 'engagement', label: 'Engagement' },
  { key: 'skills', label: 'Skills' },
  { key: 'course-progress', label: 'Course Progress' },
  { key: 'external-training', label: 'External Training' },
]

const dayOrDash = (iso: string | null) => (iso ? formatDay(iso) : '–')
const statusBadge = (c: CourseProgress) => <Badge type={STATUS_BADGE[c.status]} icon={false} label={c.status} />

function MyLearningScreen({
  onInfo,
  onSkillInfo,
  onOpenCourse,
  onOpenRecord,
}: {
  /** A stat tile's info icon was tapped. */
  onInfo: (stat: ProgressStat) => void
  /** A skill's info icon was tapped. */
  onSkillInfo: (skill: Skill) => void
  /** A course card was tapped. */
  onOpenCourse: (id: string) => void
  /** An external training card was tapped. */
  onOpenRecord: (id: string) => void
}) {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState('engagement')
  /* Four tabs are wider than the screen, so the bar scrolls sideways: keep the active
     tab in view. */
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    barRef.current?.querySelector('.ds-tab--selected')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [tab])

  return (
    <div className="m-ml">
      <div className="m-ml__bar" ref={barRef}>
        <Tabs className="m-ml__tabs" ariaLabel="My Learning sections" items={TABS} activeKey={tab} onChange={setTab} />
      </div>

      {tab === 'engagement' && (
        <motion.div key="engagement" className="m-ml__panel" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
          <div className="mp-page mp-page--native">
            <ProgressStatTiles native onInfo={onInfo} />
            <LeaderboardCard native />
          </div>
        </motion.div>
      )}

      {tab === 'skills' && (
        <motion.ul key="skills" className="m-xt-list" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
          {SKILLS.map((skill) => (
            <li key={skill.name} className="m-ml-skill">
              <span className="m-ml-skill__head">
                <img src={getSkillIllustrationByName(skill.name)} alt="" width={20} height={20} />
                <span className="m-ml-skill__name">{skill.name}</span>
                <button
                  type="button"
                  className="mp-stat__info"
                  aria-label={`About ${skill.name}`}
                  onClick={() => onSkillInfo(skill)}
                >
                  <InfoIcon size={20} color="var(--text-secondary)" />
                </button>
              </span>
              <span className="m-ml-skill__level">
                <span
                  className="mp-bar"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={MAX_LEVEL}
                  aria-valuenow={skill.level}
                  aria-label={`${skill.name} level`}
                >
                  <span className="mp-bar__fill" style={{ width: `${(skill.level / MAX_LEVEL) * 100}%` }} />
                </span>
                <span className="m-ml-skill__value">{skill.level}/{MAX_LEVEL}</span>
              </span>
            </li>
          ))}
        </motion.ul>
      )}

      {tab === 'course-progress' && (
        <motion.div key="courses" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
          {/* Standing at a glance, before the cards: the web tab's tiles, two per row and
              stacked (label over value), because the web's one-line tile is wider than half
              the screen. No tooltips, as the app has no hover. */}
          <div className="m-ml__stats">
            {COURSE_STATUS_CARDS.map((card) => (
              <StatTile
                key={card.key}
                icon={card.icon}
                label={card.label}
                value={`${shareOf(COURSES, STAT_GROUPS[card.key])}%`}
              />
            ))}
          </div>
          <ul className="m-xt-list">
          {COURSES.map((c) => (
            <li key={c.id}>
              <button type="button" className="m-xt-card" onClick={() => onOpenCourse(c.id)}>
                <span className="m-xt-card__text">
                  <span className="m-xt-card__name">{c.course}</span>
                </span>
                <span className="m-xt-card__foot">
                  <span className="m-xt-card__stat">
                    <span className="m-xt-card__label">Due date</span>
                    <span className={`m-xt-card__value${c.status === 'Overdue' ? ' is-overdue' : ''}`}>
                      {dayOrDash(c.dueDate)}
                    </span>
                  </span>
                  <span className="m-xt-card__stat">
                    <span className="m-xt-card__label">Progress</span>
                    <span className="m-xt-card__value">{c.progress}%</span>
                  </span>
                  <span className="m-xt-card__stat">
                    <span className="m-xt-card__label">Status</span>
                    {statusBadge(c)}
                  </span>
                </span>
              </button>
            </li>
          ))}
          </ul>
        </motion.div>
      )}

      {tab === 'external-training' && <ExternalTrainingScreen onOpenRecord={onOpenRecord} />}
    </div>
  )
}

/* Prototype scaffolding: how long the certificate download takes. */
const DOWNLOAD_MS = 1200

/* The rest of a course's row, in the web table's column order: label left, value right,
   and the certificate as the one action on a completed course. Rendered in the phone's
   overlay layer by MobileApp. Download Certificate shows its loading state while the
   file is fetched, then `onDownload` runs. */
export function CourseProgressSheet({
  courseId,
  onClose,
  onDownload,
}: {
  courseId: string
  onClose: () => void
  onDownload: (course: CourseProgress) => void
}) {
  const course = COURSES.find((c) => c.id === courseId)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!downloading || !course) return
    const id = window.setTimeout(() => {
      setDownloading(false)
      onDownload(course)
    }, DOWNLOAD_MS)
    return () => window.clearTimeout(id)
    // One timer per press: only the press starts it.
  }, [downloading])

  if (!course) return null

  const fields: { label: string; value: ReactNode; tone?: string }[] = [
    { label: 'Start date', value: dayOrDash(course.startDate) },
    { label: 'Due date', value: dayOrDash(course.dueDate), tone: course.status === 'Overdue' ? ' is-overdue' : '' },
    { label: 'Progress', value: `${course.progress}%` },
    { label: 'Score', value: course.score === null ? '–' : `${course.score}%` },
    { label: 'Status', value: statusBadge(course) },
    { label: 'Completion date', value: dayOrDash(course.completionDate) },
  ]

  return (
    <BottomSheet onClose={onClose} ariaLabel={course.course}>
      <div className="m-xt-sheet">
        <header className="m-xt-sheet__head">
          <h2 className="m-xt-sheet__title">{course.course}</h2>
        </header>
        <dl className="m-xt-sheet__fields">
          {fields.map((f) => (
            <div key={f.label} className="m-xt-sheet__field">
              <dt className="m-xt-sheet__label">{f.label}</dt>
              <dd className={`m-xt-sheet__value${f.tone ?? ''}`}>{f.value}</dd>
            </div>
          ))}
        </dl>
        {course.status === 'Completed' && (
          <Button
            size="md"
            className="m-xt-sheet__cta"
            icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
            loading={downloading}
            onClick={() => setDownloading(true)}
          >
            Download Certificate
          </Button>
        )}
      </div>
    </BottomSheet>
  )
}

/* What a skill's info icon opens in the app: its description, which the web shows in a
   tooltip. Rendered in the phone's overlay layer by MobileApp. */
export function SkillInfoSheet({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  return (
    <BottomSheet onClose={onClose} ariaLabel={skill.name}>
      <div className="m-ml-info">
        <h2 className="m-ml-info__title">{skill.name}</h2>
        <p className="m-ml-info__text">{skill.description}</p>
      </div>
    </BottomSheet>
  )
}

/* What a stat tile's info icon opens in the app: the explanation the web shows in a
   tooltip, in a bottom sheet. Rendered in the phone's overlay layer by MobileApp. */
export function ProgressInfoSheet({ stat, onClose }: { stat: ProgressStat; onClose: () => void }) {
  const { title, lines } = stat.info
  return (
    <BottomSheet onClose={onClose} ariaLabel={title ?? stat.label}>
      <div className="m-ml-info">
        <h2 className="m-ml-info__title">{title ?? stat.label}</h2>
        {title ? (
          <ul className="m-ml-info__list">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="m-ml-info__text">{lines[0]}</p>
        )}
      </div>
    </BottomSheet>
  )
}

export default MyLearningScreen
