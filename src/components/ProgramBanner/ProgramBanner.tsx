import { useState } from 'react'
import { ArrowLeft2, ArrowRight2, Clock, Routing } from 'iconsax-react'
import CollectionPlayIcon from '../icons/CollectionPlayIcon'
import type { ProgramCourse, WorkspaceProgram } from '../../pages/workspace/mockItems'
import './ProgramBanner.css'

const SEGMENTS = 8
const META_ICON = 'rgba(249, 249, 250, 0.72)'

interface Props {
  programs: WorkspaceProgram[]
  /** Not enrolled yet — open the program overview. */
  onStart?: (program: WorkspaceProgram) => void
  /** Enrolled — jump straight into the course the learner left off on. */
  onResume?: (program: WorkspaceProgram, course: ProgramCourse) => void
}

/** The course the learner is part-way through, if any. */
function currentCourse(program: WorkspaceProgram): ProgramCourse | undefined {
  return program.outline.find((c) => c.state === 'continue')
}

/** The next course they can open: available to start, or failed and awaiting a retake. */
function upNextCourse(program: WorkspaceProgram): ProgramCourse | undefined {
  return program.outline.find((c) => c.state === 'jump-here' || c.state === 'retake')
}

/** Every course passed. A program with a locked (not yet released) course is not finished. */
function isFinished(program: WorkspaceProgram): boolean {
  return program.outline.length > 0 && program.outline.every((c) => c.state === 'review')
}

/** Runtime of everything still to take. Whole courses only — a part-watched one counts in full. */
function minutesLeft(program: WorkspaceProgram): number {
  return program.outline
    .filter((c) => c.state !== 'review')
    .reduce((sum, c) => sum + c.durationMinutes, 0)
}

/**
 * Featured "Learning Program" banner shown at the top of the Workspace page.
 * Cycles through programs with the prev/next chevrons; the content crossfades
 * on each change. Text sits over a photo + dark scrim so it stays legible
 * regardless of the image.
 *
 * Finished programs drop out of the workspace, so the banner never offers a
 * program with nothing left to do. What remains has three shapes, and the
 * workspace features one of each:
 *
 *   - not started      → "Start Program"
 *   - part-way through a course → "Resume Program" + "Current course: …"
 *   - between courses  → "Resume Program" + "Next course: …"
 */
export default function ProgramBanner({ programs, onStart, onResume }: Props) {
  const [index, setIndex] = useState(0)

  const open = programs.filter((p) => !isFinished(p))
  const featured = [
    open.find((p) => p.progress === 0),
    open.find((p) => p.progress > 0 && currentCourse(p)),
    open.find((p) => p.progress > 0 && !currentCourse(p) && upNextCourse(p)),
  ].filter((p): p is WorkspaceProgram => p !== undefined)
  if (featured.length === 0) return null

  const program = featured[index % featured.length]
  const multiple = featured.length > 1
  const go = (dir: number) => setIndex((i) => (i + dir + featured.length) % featured.length)

  const enrolled = program.progress > 0
  const current = currentCourse(program)
  /* Resume opens the course in progress; failing that, the next one they can start. */
  const resumeCourse = current ?? upNextCourse(program)
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round((program.progress / 100) * SEGMENTS)))

  const cta = enrolled ? 'Resume Program' : 'Start Program'
  /* No specific course to open (everything left is still locked) — fall back to the program page. */
  const onCta = () => (resumeCourse ? onResume?.(program, resumeCourse) : onStart?.(program))

  return (
    <section
      className="program-banner"
      aria-label="Featured learning program"
      style={{
        backgroundImage: program.image ? `url(${program.image})` : program.thumbnailGradient,
      }}
    >
      <div key={program.id} className="program-banner__content">
        <div className="program-banner__meta">
          <span className="program-banner__metaitem">
            <Routing size={18} color={META_ICON} variant="Bold" />
            <span>Program</span>
          </span>
          <span className="program-banner__metaitem">
            <CollectionPlayIcon size={16} color={META_ICON} />
            <span>{program.courseCount} courses</span>
          </span>
          {/* Enrolled programs show the time remaining next to the percentage instead. */}
          {!enrolled ? (
            <span className="program-banner__metaitem">
              <Clock size={16} color={META_ICON} variant="Linear" />
              <span>{program.durationLabel}</span>
            </span>
          ) : null}
        </div>

        <div className="program-banner__titleblock">
          <div className="program-banner__heading">
            <h2 className="program-banner__title">{program.title}</h2>
            {enrolled && resumeCourse ? (
              <p className="program-banner__upnext">
                <span className="program-banner__upnext-label">
                  {current ? 'Current course:' : 'Next course:'}
                </span>
                <span className="program-banner__upnext-title">{resumeCourse.title}</span>
              </p>
            ) : null}
          </div>

          <div className="program-banner__progress">
            <span
              className="program-banner__track"
              role="progressbar"
              aria-label="Program completion"
              aria-valuenow={program.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {Array.from({ length: SEGMENTS }).map((_, i) => (
                <span
                  key={i}
                  className={`program-banner__seg${i < filled ? ' program-banner__seg--filled' : ''}`}
                />
              ))}
            </span>
            <span className="program-banner__pct">{program.progress}%</span>
            {enrolled ? (
              <span className="program-banner__timeleft">
                <Clock size={16} color="var(--neutral-25)" variant="Linear" />
                <span>{minutesLeft(program)} min left</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="program-banner__actions">
        <button type="button" className="program-banner__cta" onClick={onCta}>
          {cta}
        </button>
        {multiple ? (
          <div className="program-banner__nav">
            <button
              type="button"
              className="program-banner__navbtn"
              aria-label="Previous program"
              onClick={() => go(-1)}
            >
              <ArrowLeft2 size={16} color="var(--neutral-200)" variant="Linear" />
            </button>
            <button
              type="button"
              className="program-banner__navbtn"
              aria-label="Next program"
              onClick={() => go(1)}
            >
              <ArrowRight2 size={16} color="var(--neutral-200)" variant="Linear" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
