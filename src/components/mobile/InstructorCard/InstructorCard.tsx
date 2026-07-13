import type { KeyboardEvent } from 'react'
import './InstructorCard.css'

export interface MobileInstructorSkill {
  label: string
  /** URL of a 16px skill-category icon, e.g. from src/assets/skill-icons/ */
  icon?: string
}

export interface MobileInstructorCardProps {
  name: string
  bio: string
  photo?: string
  /** Up to 2 skill rows per the spec */
  skills?: MobileInstructorSkill[]
  onClick?: () => void
}

function MobileInstructorCard({ name, bio, photo, skills = [], onClick }: MobileInstructorCardProps) {
  const interactive = Boolean(onClick)

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <article
      className="m-instructor-card"
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div className="m-instructor-card__photo" style={photo ? { backgroundImage: `url(${photo})` } : undefined} />
      <div className="m-instructor-card__info">
        <div className="m-instructor-card__header">
          <h3 className="m-instructor-card__name">{name}</h3>
          <p className="m-instructor-card__bio">{bio}</p>
        </div>
        {skills.length > 0 ? (
          <ul className="m-instructor-card__skills">
            {skills.slice(0, 2).map((skill) => (
              <li key={skill.label} className="m-instructor-card__skill">
                {skill.icon ? <img src={skill.icon} alt="" width={16} height={16} /> : null}
                <span>{skill.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}

export default MobileInstructorCard
