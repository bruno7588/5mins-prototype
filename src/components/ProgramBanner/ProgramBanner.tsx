import { useState } from 'react'
import { ArrowLeft2, ArrowRight2, Routing } from 'iconsax-react'
import type { WorkspaceProgram } from '../../pages/workspace/mockItems'
import './ProgramBanner.css'

interface Props {
  programs: WorkspaceProgram[]
  onStart?: (program: WorkspaceProgram) => void
}

/**
 * Featured "Learning Program" banner shown at the top of the Workspace page.
 * Cycles through programs with the prev/next chevrons; the content crossfades
 * on each change. Text sits over a gradient + dark scrim so it stays legible
 * regardless of the program's gradient.
 */
export default function ProgramBanner({ programs, onStart }: Props) {
  const [index, setIndex] = useState(0)
  if (programs.length === 0) return null

  const program = programs[index]
  const multiple = programs.length > 1
  const go = (dir: number) => setIndex((i) => (i + dir + programs.length) % programs.length)

  return (
    <section
      className="program-banner"
      aria-label="Featured learning program"
      style={{
        backgroundImage: program.image ? `url(${program.image})` : program.thumbnailGradient,
      }}
    >
      <div key={program.id} className="program-banner__content">
        <span className="program-banner__label">
          <Routing size={16} color="rgba(249, 249, 250, 0.5)" variant="Linear" />
          <span>Program</span>
        </span>
        <h2 className="program-banner__title">{program.title}</h2>
        <p className="program-banner__desc">{program.description}</p>
      </div>

      <div className="program-banner__actions">
        <button type="button" className="program-banner__cta" onClick={() => onStart?.(program)}>
          Start Program
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
