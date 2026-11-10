import type { KeyboardEvent } from 'react'
import './InstructorCard.css'

export interface InstructorSkill {
  label: string
  /** URL of a 16px skill-category icon, e.g. from src/assets/skill-icons/ */
  icon?: string
}

export interface InstructorCardProps {
  name: string
  bio: string
  photo?: string
  /** Up to 2 skill rows, per the spec */
  skills?: InstructorSkill[]
  onClick?: () => void
}

/* Desktop Instructor card (cards.md "Instructor card", Library 5149:27386, Desktop 6124:3237).
   The mobile variant is src/components/mobile/InstructorCard. */
function InstructorCard({ name, bio, photo, skills = [], onClick }: InstructorCardProps) {
  const interactive = Boolean(onClick)

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <article
      className={`instructor-card${interactive ? ' instructor-card--interactive' : ''}`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div className="instructor-card__photo" style={photo ? { backgroundImage: `url(${photo})` } : undefined} />
      <div className="instructor-card__info">
        <div className="instructor-card__header">
          <h3 className="instructor-card__name">{name}</h3>
          <p className="instructor-card__bio">{bio}</p>
        </div>
        {skills.length > 0 ? (
          <ul className="instructor-card__skills">
            {skills.slice(0, 2).map((skill) => (
              <li key={skill.label} className="instructor-card__skill">
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

export default InstructorCard
