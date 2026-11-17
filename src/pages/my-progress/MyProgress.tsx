import { useState, type ReactNode } from 'react'
import { ArrowCircleDown, ArrowCircleUp, ArrowRight } from 'iconsax-react'
import { getProgressIllustration } from '@/assets/progress-illustrations'
import { getRankMedal } from '@/assets/ranking-illustrations'
import Avatar from '@/components/Avatar/Avatar'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import Dropdown from '@/components/Dropdown/Dropdown'
import StatTile from '@/components/StatTile/StatTile'
import InfoIcon from '@/components/icons/InfoIcon'
import {
  leaderboardPeriods,
  leaderboards,
  progressStats,
  type LeaderboardScope,
  type ProgressStat,
} from './myProgressData'
import './MyProgress.css'

/* The pieces of the old My Progress page (Figma My Progress V2, 13023:65051) that My
   Learning reuses (DES-369): the stat tiles and the Leaderboard card. Web shows them on
   the Engagement tab of the person profile (src/pages/user-profile); the native app on
   the Engagement tab of its My Learning screen (src/pages/mobile/MyLearningScreen.tsx). */

/* The panels a tenant can switch off (?hide= in the prototype). */
export type Panel = 'skills' | 'external' | 'leaderboard'

/* In the app the Leaderboard shows the top 10 without scrolling. */
const NATIVE_LEADERBOARD_ROWS = 10

/* A section card: outlined, with a title and its actions. */
export function SectionCard({
  id,
  title,
  ctas,
  className,
  children,
}: {
  id: string
  title: string
  ctas?: ReactNode
  className?: string
  children: ReactNode
}) {
  const titleId = `mp-${id}-title`
  return (
    <section className={['mp-card', className].filter(Boolean).join(' ')} aria-labelledby={titleId}>
      <header className="mp-card__header">
        <h2 className="mp-card__title" id={titleId}>{title}</h2>
        {ctas && <div className="mp-card__ctas">{ctas}</div>}
      </header>
      {children}
    </section>
  )
}

/* The four stat tiles: Points, Jewels, Streak, Certificates. Filled cards with the arrow
   of a clickable tile (their destinations are not designed yet). `native`: no hover or arrow;
   the info icon sits at the tile's far end and is a button that opens the explanation in
   a bottom sheet (`onInfo`) instead of a tooltip. `empty`: a person with no activity yet, every value at zero. */
export function ProgressStatTiles({
  native = false,
  onInfo,
  empty = false,
}: {
  native?: boolean
  /** App only: a stat tile's info icon was tapped. */
  onInfo?: (stat: ProgressStat) => void
  empty?: boolean
}) {
  return (
    <div className="mp-stats">
      {progressStats.map((s) => (
        <StatTile
          key={s.key}
          className="mp-stat"
          device={native ? 'mobile' : 'desktop'}
          icon={<img src={getProgressIllustration(s.key)} alt="" width={32} height={32} />}
          label={s.label}
          /* Below the icon: the tiles sit near the top of the page, and the tooltip is tall. */
          tooltipPosition="Bottom"
          tooltip={
            native ? undefined : (
              <span className="mp-tip">
                {s.info.title && <strong className="mp-tip__title">{s.info.title}</strong>}
                {s.info.lines.map((line) => (
                  <span className="mp-tip__line" key={line}>
                    {s.info.title ? `• ${line}` : line}
                  </span>
                ))}
              </span>
            )
          }
          value={empty ? '0' : s.value}
          /* Web: a clickable tile, with the same arrow as the Create Flashcards option cards.
             App: the info icon sits at the tile's far end instead (there is no hover, so it
             is a button that opens the explanation in a bottom sheet). */
          trailing={
            native ? (
              <button
                type="button"
                className="mp-stat__info"
                aria-label={s.info.title ?? `About ${s.label}`}
                onClick={() => onInfo?.(s)}
              >
                <InfoIcon size={24} color="var(--text-secondary)" />
              </button>
            ) : (
              <span className="mp-stat__arrow" aria-hidden="true">
                <ArrowRight size={20} color="var(--text-secondary)" variant="Linear" />
              </span>
            )
          }
        />
      ))}
    </div>
  )
}

/* The Leaderboard card: Team / Company and the period. */
export function LeaderboardCard({ native = false }: { native?: boolean }) {
  const [period, setPeriod] = useState('month')
  const [scope, setScope] = useState<LeaderboardScope>('team')
  return (
    <SectionCard
      id="leaderboard"
      title="Leaderboard"
      className="mp-leaderboard"
      ctas={
        <>
          <ContentSwitcher
            ariaLabel="Leaderboard scope"
            items={[
              { key: 'team', label: 'Team' },
              { key: 'company', label: 'Company' },
            ]}
            activeKey={scope}
            onChange={(key) => setScope(key as LeaderboardScope)}
          />
          <Dropdown options={leaderboardPeriods} value={period} onChange={setPeriod} menuAlign="end" />
        </>
      }
    >
      {/* Web: the list scrolls inside the card, so it takes focus. App: the top 10, in full. */}
      <ol className="mp-ranks" tabIndex={native ? undefined : 0} aria-label="Leaderboard ranking">
        {(native ? leaderboards[scope].slice(0, NATIVE_LEADERBOARD_ROWS) : leaderboards[scope]).map((entry) => {
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
  )
}
