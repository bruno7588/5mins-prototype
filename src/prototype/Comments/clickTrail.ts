import { find, locate, selectorFor, type Anchor } from './commentAnchor'

/* The clicks that led to what is on screen, so a comment pinned inside a drawer, modal or
   wizard step can be reopened there. Every click on the page is kept (as a CSS path) since
   the last page change; a new comment saves the trail, and opening it later replays the
   clicks until its element is back. Typed text is not replayed. */

const MAX_STEPS = 60
const STEP_WAIT_MS = 1200

let steps: string[] = []
let replaying = false

/** True while a trail is being replayed: comment mode lets those clicks through. */
export const isReplaying = () => replaying

/** Clears the trail; called on every page change. */
export const resetTrail = () => {
  steps = []
}

/** A copy of the clicks since the page opened, oldest first. */
export const currentTrail = () => [...steps]

/** Starts recording clicks on the page (not on prototype chrome or in comment mode). */
export function recordClicks() {
  const onClick = (e: MouseEvent) => {
    if (replaying || document.documentElement.classList.contains('pcm-active')) return
    const target = e.target as Element | null
    if (!target || target.closest('[data-inspect-ignore]')) return
    const el = target.closest('button, a, [role], label, summary, input') ?? target
    steps = [...steps, selectorFor(el)].slice(-MAX_STEPS)
  }
  document.addEventListener('click', onClick, { capture: true })
  return () => document.removeEventListener('click', onClick, { capture: true })
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

async function waitFor(selector: string) {
  const until = performance.now() + STEP_WAIT_MS
  while (performance.now() < until) {
    const el = find(selector) as HTMLElement | null
    if (el) return el
    await nextFrame()
  }
  return null
}

/** Replays a saved trail until the anchor is on screen. Returns whether it got there. */
export async function replayTrail(trail: string[] | undefined, anchor: Anchor | null) {
  if (locate(anchor)) return true
  if (!trail?.length) return false
  replaying = true
  // A step must never leave the comment's page: positional selectors can match a different
  // element (e.g. a nav link) once the DOM has changed, which would navigate away.
  const startPath = location.pathname
  const leavesPage = (el: HTMLElement) => {
    // Prototype chrome (Demos menu, Inspect) is never part of a trail; its buttons switch pages.
    if (el.closest('[data-inspect-ignore]')) return true
    const link = el.closest('a[href]') as HTMLAnchorElement | null
    return !!link && new URL(link.href, location.href).pathname !== startPath
  }
  try {
    for (const selector of trail) {
      if (location.pathname !== startPath) return false
      const el = await waitFor(selector)
      if (el && !leavesPage(el)) el.click()
      // Let the click's drawer or step render before checking or clicking again.
      for (let i = 0; i < 10; i++) await nextFrame()
      if (locate(anchor)) return true
    }
    return !!locate(anchor)
  } finally {
    replaying = false
  }
}
