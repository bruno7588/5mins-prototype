import { useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Add, ArrowCircleDown, ArrowCircleUp, FlashCircle, Mobile } from 'iconsax-react'
import { useHeaderTheme } from '@/data/brandTheme'
import { useTheme } from '@/hooks/useTheme'
import {
  SIGNED_IN_LEARNER_ID,
  dueRank,
  dueState,
  recordProviderName,
  recordTrainingName,
  saveRecord,
  useExternalTraining,
  type ExternalRecord,
} from '@/data/externalTraining'
import { getProgressIllustration } from '@/assets/progress-illustrations'
import { getLevelIllustration } from '@/assets/level-illustrations'
import { getRankMedal } from '@/assets/ranking-illustrations'
import Avatar from '@/components/Avatar/Avatar'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import Dropdown from '@/components/Dropdown/Dropdown'
import MeshGradient from '@/components/MeshGradient/MeshGradient'
import StatTile from '@/components/StatTile/StatTile'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { Table, type Column } from '@/components/Table/Table'
import LearnerMobileNav from '@/components/LearnerMobileNav/LearnerMobileNav'
import ProfileMenu from '@/components/ProfileMenu/ProfileMenu'
import AdminMenuItem from '@/components/AdminMenuItem/AdminMenuItem'
import AddExternalTrainingDrawer from '@/pages/learning-records/components/ExternalTraining/AddExternalTrainingDrawer'
import { Logo, learnerSideItems } from '@/pages/my-team/MyTeam'
import {
  courseResults,
  leaderboardPeriods,
  leaderboards,
  progressStats,
  skillProgress,
  type CourseResult,
  type LeaderboardScope,
} from './myProgressData'
import { progressMesh, type ProgressSection } from './progressMesh'
import '@/pages/my-team/MyTeam.css'
import './MyProgress.css'

/* The External Training card lists the learner's latest three records. */
const EXTERNAL_ROWS = 3

/* The learner's own profile: the full lists behind the two View All links. Not under
   My Team, which only managers can open. */
const OWN_PROFILE = '/my-progress/profile'

/* A section card (Figma My Progress V2, 13023:65051): outlined, with a title and its
   actions. `mesh` puts a quiet mesh gradient behind the content; the Leaderboard has none. */
function SectionCard({
  id,
  mesh: meshSection,
  title,
  ctas,
  className,
  children,
}: {
  id: string
  mesh?: ProgressSection
  title: string
  ctas?: ReactNode
  className?: string
  children: ReactNode
}) {
  // The shape colours come from the design tokens, so the gradient is rebuilt per theme.
  const { theme } = useTheme()
  const mesh = useMemo(() => (meshSection ? progressMesh(meshSection) : null), [meshSection, theme])
  const titleId = `mp-${id}-title`
  return (
    <section className={['mp-card', className].filter(Boolean).join(' ')} aria-labelledby={titleId}>
      {mesh && <MeshGradient config={mesh} interactive={false} breathe={0} className="mp-card__mesh" />}
      <header className="mp-card__header">
        <h2 className="mp-card__title" id={titleId}>{title}</h2>
        {ctas && <div className="mp-card__ctas">{ctas}</div>}
      </header>
      {children}
    </section>
  )
}

/* Learner My Progress (Figma My Progress V2, 13023:65051): the learner's headline
   numbers, 5Mins course results, skill levels, external training and leaderboard on
   one page. Stat tiles and skill rows are the clickable items (their destinations are
   not designed yet); table and Leaderboard rows are read-only and only show a hover
   fill. Add Training opens the same drawer the admin uses, with the learner fixed. */
function MyProgress() {
  const navigate = useNavigate()
  const location = useLocation()
  const headerTheme = useHeaderTheme()
  const { records } = useExternalTraining()
  const [period, setPeriod] = useState('month')
  const [scope, setScope] = useState<LeaderboardScope>('team')
  const { toasts, show: showToast } = useToast()
  /* Add Training: the drawer the admin uses, with the learner fixed to the signed-in
     person. Stays set while the drawer plays its exit; key remounts it on each open. */
  const [drawer, setDrawer] = useState<{ open: boolean; key: number } | null>(null)

  // Same order as the profile's External Training tab: overdue, due soon, then newest.
  const externalRows = useMemo(
    () =>
      records
        .filter((r) => r.personId === SIGNED_IN_LEARNER_ID)
        .sort(
          (a, b) =>
            dueRank(dueState(a, records)) - dueRank(dueState(b, records)) || b.completionDate.localeCompare(a.completionDate),
        )
        .slice(0, EXTERNAL_ROWS),
    [records],
  )

  const resultBadge = (result: 'Passed' | 'Not Passed') => (
    <Badge type={result === 'Passed' ? 'success' : 'error'} label={result} />
  )

  const courseColumns: Column<CourseResult>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (c) => <span className="mp-course-name" title={c.course}>{c.course}</span>,
    },
    { key: 'score', header: 'Score', width: '0 0 64px', align: 'center', render: (c) => `${c.score}%` },
    { key: 'result', header: 'Result', width: '0 0 128px', align: 'right', render: (c) => resultBadge(c.result) },
  ]

  const externalColumns: Column<ExternalRecord>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (r) => (
        <span className="tbl-stack">
          <span className="primary mp-course-name" title={recordTrainingName(r)}>{recordTrainingName(r)}</span>
          <span className="supporting" title={recordProviderName(r)}>{recordProviderName(r)}</span>
        </span>
      ),
    },
    { key: 'score', header: 'Score', width: '0 0 64px', align: 'center', render: (r) => (r.score === null ? '–' : `${r.score}%`) },
    { key: 'result', header: 'Result', width: '0 0 128px', align: 'right', render: (r) => resultBadge(r.result) },
  ]

  return (
    <div className="mt-app">
      <header className="mt-topnav" data-theme={headerTheme}>
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/workspace')}>
          <Logo size={22} />
        </button>
        <div className="mt-topnav__right">
          <button type="button" className="mt-topnav__textbtn ui-disabled" disabled>
            <Mobile size={20} color="var(--text-secondary)" variant="Linear" />
            <span>Get App</span>
          </button>
          <button type="button" className="mt-topnav__outlinebtn ui-disabled" disabled>
            <Add size={20} color="var(--text-primary)" variant="Linear" />
            <span>Create</span>
          </button>
          <div className="mt-topnav__icons">
            <button type="button" className="mt-topnav__iconbtn ui-disabled" aria-label="Notifications (coming soon)" disabled>
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
                  <Icon size={24} color={isActive ? 'var(--brand-selected, var(--selected))' : 'var(--brand-nav, var(--text-secondary))'} variant="Bold" />
                  <span>{label}</span>
                </button>
              )
            })}
            <AdminMenuItem />
          </nav>

          <ProfileMenu />

          <div className="mt-side__powered">
            <span>Powered by</span>
            <Logo size={12} />
          </div>
        </aside>

        <section className="mt-body">
          {/* Mobile web only: the Progress tab holds My Team and My Progress. */}
          <div className="mt-mobile-chips">
            <Chip label="My Team" onClick={() => navigate('/my-team')} />
            <Chip label="My Progress" selected />
          </div>

          <div className="mp-page">
            <h1 className="mp-sr-only">My Progress</h1>

            <div className="mp-stats">
              {progressStats.map((s) => (
                <StatTile
                  key={s.key}
                  className="mp-stat"
                  icon={<img src={getProgressIllustration(s.key)} alt="" width={32} height={32} />}
                  label={s.label}
                  tooltip={s.tooltip}
                  value={s.value}
                />
              ))}
            </div>

            <div className="mp-row">
              <SectionCard
                id="courses"
                mesh="courses"
                title="5Mins Courses"
                ctas={<Button variant="text" onClick={() => navigate(OWN_PROFILE)}>View All</Button>}
              >
                <Table columns={courseColumns} rows={courseResults} getRowKey={(c) => c.id} />
              </SectionCard>

              <SectionCard
                id="skills"
                mesh="skills"
                title="Skill Development"
                /* Not built: there is no skills list page yet. */
                ctas={<Button variant="text" className="ui-disabled" disabled>View All Skills</Button>}
              >
                <ul className="mp-skills">
                  {skillProgress.map((skill) => (
                    <li key={skill.name}>
                      <button type="button" className="mp-skill">
                        <img
                          className="mp-skill__level"
                          src={getLevelIllustration(skill.level, { size: 'small' })}
                          alt={`Level ${skill.level}`}
                          width={48}
                          height={48}
                        />
                        <span className="mp-skill__info">
                          <span className="mp-skill__titles">
                            <span className="mp-skill__name">{skill.name}</span>
                            <span className="mp-skill__hint">Earn {skill.target} points to complete this level</span>
                          </span>
                          <span className="mp-skill__progress">
                            <span
                              className="mp-bar"
                              role="progressbar"
                              aria-valuemin={0}
                              aria-valuemax={skill.target}
                              aria-valuenow={skill.points}
                              aria-label={`${skill.name} level progress`}
                            >
                              <span className="mp-bar__fill" style={{ width: `${(skill.points / skill.target) * 100}%` }} />
                            </span>
                            <span className="mp-skill__points">{skill.points}/{skill.target} pts</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>

            <div className="mp-row mp-row--wide">
              <SectionCard
                id="external"
                mesh="external"
                title="External Training"
                ctas={
                  <>
                    <Button
                      variant="text"
                      onClick={() => setDrawer({ open: true, key: Date.now() })}
                      icon={<Add size={20} color="currentColor" variant="Linear" />}
                    >
                      Add Training
                    </Button>
                    <Button variant="text" onClick={() => navigate(`${OWN_PROFILE}?tab=external-training`)}>
                      View All
                    </Button>
                  </>
                }
              >
                <Table columns={externalColumns} rows={externalRows} getRowKey={(r) => r.id} />
              </SectionCard>

              <SectionCard
                id="leaderboard"
                title="Leaderboard"
                className="mp-leaderboard"
                ctas={<Dropdown options={leaderboardPeriods} value={period} onChange={setPeriod} menuAlign="end" />}
              >
                <ContentSwitcher
                  className="mp-leaderboard__scope"
                  ariaLabel="Leaderboard scope"
                  items={[
                    { key: 'team', label: 'Team' },
                    { key: 'company', label: 'Company' },
                  ]}
                  activeKey={scope}
                  onChange={(key) => setScope(key as LeaderboardScope)}
                />

                <ol className="mp-ranks">
                  {leaderboards[scope].map((entry) => {
                    const medal = getRankMedal(entry.rank)
                    return (
                      <li className={`mp-rank${medal ? ` mp-rank--${entry.rank}` : ''}`} key={entry.rank}>
                        <span className={`mp-rank__position${medal ? ' mp-rank__position--medal' : ''}`}>
                          {medal && <img src={medal} alt="" width={24} height={24} />}
                          <span className="mp-rank__number">{entry.rank}</span>
                        </span>
                        <span className="mp-rank__person">
                          <Avatar name={entry.name} src={entry.avatarSrc} size={32} />
                          <span className="mp-rank__name">{entry.name}</span>
                        </span>
                        <span className="mp-rank__score">
                          <span className="mp-rank__points">{entry.points.toLocaleString('en-GB')} pts</span>
                          {entry.trend === 'up' ? (
                            <ArrowCircleUp size={24} color="var(--success-500)" variant="Bold" aria-label="Moved up" />
                          ) : (
                            <ArrowCircleDown size={24} color="var(--danger-400)" variant="Bold" aria-label="Moved down" />
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </SectionCard>
            </div>
          </div>
        </section>
      </div>
      <LearnerMobileNav />

      {drawer && (
        <AddExternalTrainingDrawer
          key={drawer.key}
          open={drawer.open}
          lockedPersonId={SIGNED_IN_LEARNER_ID}
          learnerView
          onClose={() => setDrawer((d) => d && { ...d, open: false })}
          onSaved={(r) => {
            saveRecord(r)
            setDrawer((d) => d && { ...d, open: false })
            showToast('success', `${recordTrainingName(r)} added to your records`)
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default MyProgress
