import { getSkillIllustrationByName } from '../../assets/skill-icons'
import { getLevelIllustration } from '../../assets/level-illustrations'
import './SkillCard.css'

const SEGMENTS = 8

/** Bottom slot: an 8-segment progress bar, or a "Certificate pending" row. */
export type SkillCardBottom =
  | { kind: 'progress'; filled: number }
  | { kind: 'pending' }

export interface SkillCardProps {
  skillName: string
  /** Level label as shown in the design, e.g. "Master" or "Level 5". */
  level: string
  bottom: SkillCardBottom
}

function SkillCard({ skillName, level, bottom }: SkillCardProps) {
  return (
    <article className="skill-card">
      <div className="skill-card__top">
        <div className="skill-card__head">
          <img
            className="skill-card__icon"
            src={getSkillIllustrationByName(skillName)}
            alt=""
            width={32}
            height={32}
          />
          <span className="skill-card__level">{level}</span>
        </div>
        <h3 className="skill-card__name">{skillName}</h3>
      </div>

      {bottom.kind === 'progress' ? (
        <div
          className="skill-card__progress"
          role="progressbar"
          aria-valuenow={Math.round((bottom.filled / SEGMENTS) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className={`skill-card__seg${i < bottom.filled ? ' skill-card__seg--filled' : ''}`}
            />
          ))}
        </div>
      ) : (
        <div className="skill-card__pending">
          <span className="skill-card__pending-label">Certificate pending</span>
          <img
            className="skill-card__pending-icon"
            src={getLevelIllustration('master', { size: 'small' })}
            alt=""
            width={20}
            height={20}
          />
        </div>
      )}
    </article>
  )
}

export default SkillCard
