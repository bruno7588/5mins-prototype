import { useState } from 'react'
import Chip from '@/components/Chip/Chip'
import { getLevelIllustration, type SkillLevel } from '@/assets/level-illustrations'
import '@/pages/my-progress/MyProgress.css'
import './SkillsTab.css'

/* Skills tab of the person profile / My Learning (DES-369): Role, Life and Tool skill
   chips over that group's skill cards, each with its level shield, the points still to
   earn and a points bar (production Skill Development). Read only for everyone: the cards
   are not pressable. Two columns on web, one in the app. Prefix: ups- */

export type SkillCategory = 'role' | 'life' | 'tool'

export const SKILL_CATEGORIES: { key: SkillCategory; label: string }[] = [
  { key: 'role', label: 'Role Skills' },
  { key: 'life', label: 'Life Skills' },
  { key: 'tool', label: 'Tool Skills' },
]

export interface Skill {
  name: string
  category: SkillCategory
  level: Exclude<SkillLevel, 'advanced' | 'expert' | 'master'>
  /** Points earned towards completing the current level. */
  points: number
}

/** Points that complete each level. */
const LEVEL_TARGET: Record<Skill['level'], number> = { 1: 10, 2: 30, 3: 50, 4: 80, 5: 120 }

export const SKILLS: Skill[] = [
  { name: 'Ability to Motivate', category: 'role', level: 3, points: 34 },
  { name: 'Negotiation', category: 'role', level: 2, points: 12 },
  { name: 'Commercial Acumen', category: 'role', level: 4, points: 62 },
  { name: 'Sales Strategy', category: 'role', level: 1, points: 6 },
  { name: 'Stakeholder Management', category: 'role', level: 4, points: 20 },
  { name: 'Revenue Operations', category: 'role', level: 1, points: 0 },
  { name: 'Leadership', category: 'role', level: 3, points: 41 },
  { name: 'Market & Customer Research', category: 'role', level: 1, points: 3 },
  { name: 'Communication', category: 'life', level: 5, points: 96 },
  { name: 'Decision Making', category: 'life', level: 3, points: 18 },
  { name: 'Strategic Thinking', category: 'life', level: 2, points: 25 },
  { name: 'Time Management', category: 'life', level: 1, points: 7 },
  { name: 'Data Analysis', category: 'tool', level: 1, points: 0 },
  { name: 'Microsoft Excel', category: 'tool', level: 2, points: 9 },
  { name: 'Salesforce', category: 'tool', level: 1, points: 4 },
]

/** The Role / Life / Tool chips. */
export function SkillCategoryChips({ value, onChange }: { value: SkillCategory; onChange: (c: SkillCategory) => void }) {
  return (
    <div className="ups-chips" role="group" aria-label="Skill type">
      {SKILL_CATEGORIES.map((c) => (
        <Chip key={c.key} label={c.label} selected={value === c.key} onClick={() => onChange(c.key)} />
      ))}
    </div>
  )
}

/** One skill: level shield, name, the points to complete the level and the points bar. */
export function SkillProgressCard({ skill }: { skill: Skill }) {
  const target = LEVEL_TARGET[skill.level]
  return (
    <li className="mp-skill ups-card">
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
          <span className="mp-skill__hint">Earn {target} points to complete this level.</span>
        </span>
        <span className="mp-skill__progress">
          <span
            className="mp-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={target}
            aria-valuenow={skill.points}
            aria-label={`${skill.name} points`}
          >
            <span className="mp-bar__fill" style={{ width: `${(skill.points / target) * 100}%` }} />
          </span>
          <span className="mp-skill__points">{skill.points}/{target} pts</span>
        </span>
      </span>
    </li>
  )
}

function SkillsTab() {
  const [category, setCategory] = useState<SkillCategory>('role')
  return (
    <div className="ups">
      <SkillCategoryChips value={category} onChange={setCategory} />
      <ul className="ups-grid">
        {SKILLS.filter((s) => s.category === category).map((skill) => (
          <SkillProgressCard key={skill.name} skill={skill} />
        ))}
      </ul>
    </div>
  )
}

export default SkillsTab
