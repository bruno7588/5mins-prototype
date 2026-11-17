import { ArrowRight } from 'iconsax-react'
import { getProgressIllustration } from '@/assets/progress-illustrations'
import EmptyState from '@/components/EmptyState/EmptyState'
import StatTile from '@/components/StatTile/StatTile'
import { EngagementChart } from '@/pages/my-team/EngagementTab'
import { LeaderboardCard } from '@/pages/my-progress/MyProgress'
import { progressStats } from '@/pages/my-progress/myProgressData'
import noActivityIllustration from '@/assets/empty-state-illustrations/pie-chart.svg'
import '@/pages/my-progress/MyProgress.css'
import './EngagementPanel.css'

/* Engagement tab of the person profile / My Learning (DES-369): the gamification stat
   tiles as on My Progress (Figma My Progress 13152:65169: filled cards with the arrow),
   then the Performance chart and the Leaderboard side by side. The Leaderboard shows on the person's own page only (D15): it has
   no "this person's row" state yet, so on someone else's profile it would be the same
   team list every time. Prefix: upe- */
function EngagementPanel({
  own,
  firstName,
  showLeaderboard,
  empty = false,
}: {
  /** The signed-in person is looking at their own page. */
  own: boolean
  firstName: string
  showLeaderboard: boolean
  /** No learning activity yet: tiles at zero, an empty state in place of the chart. */
  empty?: boolean
}) {
  return (
    <div className="upe-panel">
      <div className="mp-stats">
        {progressStats.map((s) => (
          <StatTile
            key={s.key}
            className="mp-stat"
            icon={<img src={getProgressIllustration(s.key)} alt="" width={32} height={32} />}
            label={s.label}
            /* Below the icon: the tiles sit near the top of the page, and the tooltip is tall. */
            tooltipPosition="Bottom"
            tooltip={
              <span className="mp-tip">
                {s.info.title && <strong className="mp-tip__title">{s.info.title}</strong>}
                {s.info.lines.map((line) => (
                  <span className="mp-tip__line" key={line}>
                    {s.info.title ? `• ${line}` : line}
                  </span>
                ))}
              </span>
            }
            value={empty ? '0' : s.value}
            trailing={
              <span className="mp-stat__arrow" aria-hidden="true">
                <ArrowRight size={20} color="var(--text-secondary)" variant="Linear" />
              </span>
            }
          />
        ))}
      </div>

      {/* One row: the chart and the Leaderboard. Without the Leaderboard the chart takes the row. */}
      <div className="upe-row">
      {empty ? (
        <EmptyState
          illustration={<img src={noActivityIllustration} alt="" width={72} height={72} />}
          title="No learning activity yet"
          description={
            own
              ? 'Complete a lesson and your activity will show here.'
              : `Activity will show here once ${firstName} completes a lesson.`
          }
        />
      ) : (
        <EngagementChart
          title="Performance"
          lessonsLabel="Lessons watched"
          momentsTooltip="Lessons watched plus quizzes and polls answered."
          personal
        />
      )}

      {showLeaderboard && <LeaderboardCard />}
      </div>
    </div>
  )
}

export default EngagementPanel
