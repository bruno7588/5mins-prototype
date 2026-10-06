import { combinations } from '../../data/mockQuestions'
import './RatioBar.css'

export type RatioTier = 'strong' | 'good' | 'weak' | 'static'

const TIER_RANK: Record<RatioTier, number> = { static: 0, weak: 1, good: 2, strong: 3 }
const RANK_TIER: RatioTier[] = ['static', 'weak', 'good', 'strong']

function tierByRatio(ratio: number): RatioTier {
  if (ratio >= 2.5) return 'strong'
  if (ratio >= 1.5) return 'good'
  if (ratio > 1) return 'weak'
  return 'static'
}

function tierByCombos(combos: number): RatioTier {
  if (combos >= 20) return 'strong'
  if (combos >= 10) return 'good'
  if (combos >= 2) return 'weak'
  return 'static'
}

export function getCoverageTier(poolSize: number, drawCount: number): RatioTier {
  const ratio = poolSize > 0 ? poolSize / drawCount : 0
  const combos = combinations(poolSize, drawCount)
  // Take the lower of ratio-based and combinations-based tier
  const minRank = Math.min(TIER_RANK[tierByRatio(ratio)], TIER_RANK[tierByCombos(combos)])
  return RANK_TIER[minRank]
}

interface RatioBarProps {
  drawCount: number
  poolSize: number
}

function RatioBar({ drawCount, poolSize }: RatioBarProps) {
  const fillPercent = poolSize > 0 ? (drawCount / poolSize) * 100 : 100
  const tier = getCoverageTier(poolSize, drawCount)

  return (
    <div className="ratio-bar">
      <div
        className={`ratio-bar-fill ratio-bar-fill--${tier}`}
        style={{ transform: `translateX(${fillPercent - 100}%)` }}
      />
    </div>
  )
}

export default RatioBar
