import { Clock } from 'iconsax-react'
import CollectionPlayIcon from '@/components/icons/CollectionPlayIcon'
import MobileProgramCourseCard from '@/components/mobile/ProgramCourseCard/ProgramCourseCard'
import ProgramCertificate from '@/pages/programs/components/ProgramCertificate/ProgramCertificate'
import type { WorkspaceProgram } from '@/pages/workspace/mockItems'
import avatar1 from '@/assets/programs/avatar-1.png'
import avatar2 from '@/assets/programs/avatar-2.png'
import avatar3 from '@/assets/programs/avatar-3.png'
import './ProgramScreen.css'

const SEGMENTS = 8
const STACK = [avatar1, avatar2, avatar3]

/**
 * Program details for the mobile app (Figma 3716:83128 not started,
 * 3716:83261 in progress, 3716:83526 completed).
 *
 * One screen covers all three: the progress bar and the certificate carry where
 * the learner has got to, so no status sits above the title.
 */
function ProgramScreen({ program }: { program: WorkspaceProgram }) {
  const outline = program.outline
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round((program.progress / 100) * SEGMENTS)))
  const complete = program.progress >= 100

  // Certificate unlocks only when every course is complete AND passed — one
  // failed or still-open course keeps it locked. Same rule as the desktop page.
  const certificateUnlocked = outline.length > 0 && outline.every((c) => c.status === 'completed')

  // A program nobody has opened yet points at the course to begin with.
  const startIdx = program.progress === 0 ? outline.findIndex((c) => c.state === 'jump-here') : -1

  const stack = STACK.slice(0, Math.max(0, program.learnerCount))
  const overflow = program.learnerCount - stack.length

  return (
    <div className="m-prog">
      <header className="m-prog__banner">

        <div className="m-prog__titleblock">
          <h1 className="m-prog__title">{program.title}</h1>
          <p className="m-prog__desc">{program.description}</p>
        </div>

        <div className="m-prog__meta">
          <span className="m-prog__metaitem">
            <CollectionPlayIcon size={16} color="var(--text-tertiary)" />
            <span>
              {program.courseCount} {program.courseCount === 1 ? 'course' : 'courses'}
            </span>
          </span>
          <span className="m-prog__metaitem">
            <Clock size={16} color="var(--text-tertiary)" variant="Linear" />
            <span>{program.durationLabel}</span>
          </span>
          {stack.length > 0 ? (
            <span className="m-prog__avatars" aria-hidden="true">
              {stack.map((src, i) => (
                <img key={i} className="m-prog__avatar" src={src} alt="" />
              ))}
              {overflow > 0 ? <span className="m-prog__avatar m-prog__avatar--count">+{overflow}</span> : null}
            </span>
          ) : null}
          <span className="m-prog__metaitem">
            {program.learnerCount} {program.learnerCount === 1 ? 'learner' : 'learners'}
          </span>
        </div>

        <div className="m-prog__progress">
          <span
            className="m-prog__track"
            role="progressbar"
            aria-label="Program completion"
            aria-valuenow={program.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {Array.from({ length: SEGMENTS }).map((_, i) => (
              <span
                key={i}
                className={`m-prog__seg${
                  i < filled ? (complete ? ' m-prog__seg--passed' : ' m-prog__seg--filled') : ''
                }`}
              />
            ))}
          </span>
          <span className="m-prog__pct">{program.progress}%</span>
        </div>
      </header>

      <section className="m-prog__section">
        <h2 className="m-prog__sectiontitle">Courses</h2>
        {outline.map((course, i) => (
          <MobileProgramCourseCard key={course.id} course={course} startMarker={i === startIdx} />
        ))}
      </section>

      <section className="m-prog__section">
        <h2 className="m-prog__sectiontitle">Certification</h2>
        <ProgramCertificate unlocked={certificateUnlocked} />
      </section>
    </div>
  )
}

export default ProgramScreen
