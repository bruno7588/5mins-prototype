import type { ProgramCourse, WorkspaceProgram } from '../workspace/mockItems'

/** The course the learner is part-way through, if any. */
export function currentCourse(program: WorkspaceProgram): ProgramCourse | undefined {
  return program.outline.find((c) => c.state === 'continue')
}

/** The next course they can open: available to start, or failed and awaiting a retake. */
export function upNextCourse(program: WorkspaceProgram): ProgramCourse | undefined {
  return program.outline.find((c) => c.state === 'jump-here' || c.state === 'retake')
}

/** Every course passed. A program with a locked (not yet released) course is not finished. */
export function isFinished(program: WorkspaceProgram): boolean {
  return program.outline.length > 0 && program.outline.every((c) => c.state === 'review')
}

/**
 * Enrolled, but nothing to open yet: every course is still scheduled to
 * release. There is no CTA to start from, so the banner offers the overview.
 */
export function isScheduled(program: WorkspaceProgram): boolean {
  return program.progress === 0 && !currentCourse(program) && !upNextCourse(program)
}

/** When the first course releases — e.g. "Scheduled for 23 Jul". */
export function scheduledLabel(program: WorkspaceProgram): string | undefined {
  return program.outline.find((c) => c.status === 'scheduled')?.statusLabel
}

/** Runtime of everything still to take. Whole courses only — a part-watched one counts in full. */
export function minutesLeft(program: WorkspaceProgram): number {
  return program.outline
    .filter((c) => c.state !== 'review')
    .reduce((sum, c) => sum + c.durationMinutes, 0)
}

/**
 * The programs the workspace features, one per state — shared by the desktop
 * banner and the mobile home screen so the two never drift apart.
 *
 * Finished programs drop out entirely, so the banner never offers a program
 * with nothing left to do. What remains has four shapes:
 *
 *   - not started               → "Start Program"
 *   - scheduled to open later   → "View Program" + "Scheduled for …"
 *   - part-way through a course → "Resume Program" + "Current course: …"
 *   - between courses           → "Resume Program" + "Next course: …"
 */
export function featuredPrograms(programs: WorkspaceProgram[]): WorkspaceProgram[] {
  const open = programs.filter((p) => !isFinished(p))
  return [
    open.find((p) => p.progress === 0 && !isScheduled(p)),
    open.find((p) => isScheduled(p)),
    open.find((p) => p.progress > 0 && currentCourse(p)),
    open.find((p) => p.progress > 0 && !currentCourse(p) && upNextCourse(p)),
  ].filter((p): p is WorkspaceProgram => p !== undefined)
}
