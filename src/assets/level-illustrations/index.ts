// 5Mins skill-level illustrations — Figma "Illustrations/ Learning path" (frame 9120:9437,
// downloaded 2026-07-13). Shield badges for levels 1–5 and medal badges for the
// Advanced/Expert/Master tiers. Small (56px, number only) and large (72px, "LEVEL n"
// banner / ribboned medal) are distinct artwork, plus a gray disabled version of each.

import level1Small from './level-1-small.svg'
import level1Large from './level-1-large.svg'
import level1SmallDisabled from './level-1-small-disabled.svg'
import level1LargeDisabled from './level-1-large-disabled.svg'
import level2Small from './level-2-small.svg'
import level2Large from './level-2-large.svg'
import level2SmallDisabled from './level-2-small-disabled.svg'
import level2LargeDisabled from './level-2-large-disabled.svg'
import level3Small from './level-3-small.svg'
import level3Large from './level-3-large.svg'
import level3SmallDisabled from './level-3-small-disabled.svg'
import level3LargeDisabled from './level-3-large-disabled.svg'
import level4Small from './level-4-small.svg'
import level4Large from './level-4-large.svg'
import level4SmallDisabled from './level-4-small-disabled.svg'
import level4LargeDisabled from './level-4-large-disabled.svg'
import level5Small from './level-5-small.svg'
import level5Large from './level-5-large.svg'
import level5SmallDisabled from './level-5-small-disabled.svg'
import level5LargeDisabled from './level-5-large-disabled.svg'
import levelAdvancedSmall from './level-advanced-small.svg'
import levelAdvancedLarge from './level-advanced-large.svg'
import levelAdvancedSmallDisabled from './level-advanced-small-disabled.svg'
import levelAdvancedLargeDisabled from './level-advanced-large-disabled.svg'
import levelExpertSmall from './level-expert-small.svg'
import levelExpertLarge from './level-expert-large.svg'
import levelExpertSmallDisabled from './level-expert-small-disabled.svg'
import levelExpertLargeDisabled from './level-expert-large-disabled.svg'
import levelMasterSmall from './level-master-small.svg'
import levelMasterLarge from './level-master-large.svg'
import levelMasterSmallDisabled from './level-master-small-disabled.svg'
import levelMasterLargeDisabled from './level-master-large-disabled.svg'

export type SkillLevel = 1 | 2 | 3 | 4 | 5 | 'advanced' | 'expert' | 'master'
export type LevelIllustrationSize = 'small' | 'large'

interface LevelVariants {
  small: string
  large: string
  smallDisabled: string
  largeDisabled: string
}

const levels: Record<SkillLevel, LevelVariants> = {
  1: { small: level1Small, large: level1Large, smallDisabled: level1SmallDisabled, largeDisabled: level1LargeDisabled },
  2: { small: level2Small, large: level2Large, smallDisabled: level2SmallDisabled, largeDisabled: level2LargeDisabled },
  3: { small: level3Small, large: level3Large, smallDisabled: level3SmallDisabled, largeDisabled: level3LargeDisabled },
  4: { small: level4Small, large: level4Large, smallDisabled: level4SmallDisabled, largeDisabled: level4LargeDisabled },
  5: { small: level5Small, large: level5Large, smallDisabled: level5SmallDisabled, largeDisabled: level5LargeDisabled },
  advanced: {
    small: levelAdvancedSmall,
    large: levelAdvancedLarge,
    smallDisabled: levelAdvancedSmallDisabled,
    largeDisabled: levelAdvancedLargeDisabled,
  },
  expert: {
    small: levelExpertSmall,
    large: levelExpertLarge,
    smallDisabled: levelExpertSmallDisabled,
    largeDisabled: levelExpertLargeDisabled,
  },
  master: {
    small: levelMasterSmall,
    large: levelMasterLarge,
    smallDisabled: levelMasterSmallDisabled,
    largeDisabled: levelMasterLargeDisabled,
  },
}

export interface LevelIllustrationOptions {
  /** small = 56px (number only), large = 72px ("LEVEL n" banner / ribboned medal) */
  size?: LevelIllustrationSize
  disabled?: boolean
}

export function getLevelIllustration(level: SkillLevel, options: LevelIllustrationOptions = {}): string {
  const { size = 'small', disabled = false } = options
  const variants = levels[level]
  if (size === 'large') return disabled ? variants.largeDisabled : variants.large
  return disabled ? variants.smallDisabled : variants.small
}
