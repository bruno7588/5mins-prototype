import { toCanvas } from 'html-to-image'

const MAX_WIDTH = 1440
const TIMEOUT_MS = 8000

/* A picture of what the commenter is looking at, with a pin where they clicked, sent to
   Slack alongside the comment. html-to-image redraws the page from the DOM (it is not a
   real screenshot), so the result can differ slightly; any failure or a slow capture
   returns undefined and the comment posts without a picture. */
export async function capturePage(pinX: number, pinY: number): Promise<string | undefined> {
  try {
    const w = window.innerWidth
    const h = window.innerHeight
    const shot = toCanvas(document.body, {
      width: w,
      height: h,
      pixelRatio: 1,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      // Only the visible part of the page: shift the copy up by the scroll offset.
      style: { transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`, transformOrigin: 'top left' },
      // Leave out the prototype's own chrome (comment pins, composer, demo switcher).
      filter: (node) => !(node instanceof HTMLElement && node.hasAttribute('data-inspect-ignore')),
    })
    const timeout = new Promise<undefined>((resolve) => window.setTimeout(() => resolve(undefined), TIMEOUT_MS))
    const page = await Promise.race([shot, timeout])
    if (!page) return undefined

    const scale = Math.min(1, MAX_WIDTH / w)
    const out = document.createElement('canvas')
    out.width = Math.round(w * scale)
    out.height = Math.round(h * scale)
    const ctx = out.getContext('2d')
    if (!ctx) return undefined
    ctx.drawImage(page, 0, 0, out.width, out.height)

    // The pin: an amber dot with a white ring, where the comment was placed.
    const selected = getComputedStyle(document.documentElement).getPropertyValue('--selected').trim()
    ctx.beginPath()
    ctx.arc(pinX * scale, pinY * scale, 12, 0, Math.PI * 2)
    ctx.fillStyle = selected
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'white'
    ctx.stroke()

    return out.toDataURL('image/jpeg', 0.8)
  } catch {
    return undefined
  }
}
