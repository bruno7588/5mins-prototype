// 5Mins leaderboard rank medals - Figma "Ranking, leaderboard" (Library 2613:26421,
// exported 2026-11-13). Gold, silver and bronze 24x24 discs for ranks 1 to 3; the rank
// number is drawn over the disc in code. Ranks 4 and below are a plain number.

import rank1 from './rank-1.svg'
import rank2 from './rank-2.svg'
import rank3 from './rank-3.svg'

const medals: Record<number, string> = { 1: rank1, 2: rank2, 3: rank3 }

/** The medal artwork for ranks 1 to 3; undefined for any other rank. */
export function getRankMedal(rank: number): string | undefined {
  return medals[rank]
}
