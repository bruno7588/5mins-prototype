/* Where a comment is pinned: a CSS path to the clicked element plus the click point as a
   percentage of that element's box. The Design Inspect source stamps are dev-only, so the
   path is built from tags and positions, which also exist on the deployed site. */

export interface Anchor {
  selector: string
  xPct: number
  yPct: number
}

// React's useId values (":r1:") change between renders, so they never anchor anything.
const stableId = (el: Element) => (el.id && !el.id.includes(':') ? el.id : null)

export function selectorFor(el: Element): string {
  const parts: string[] = []
  let node: Element | null = el
  while (node && node !== document.body && node !== document.documentElement) {
    const id = stableId(node)
    if (id) {
      parts.unshift(`#${CSS.escape(id)}`)
      break
    }
    const tag = node.tagName.toLowerCase()
    const parent: Element | null = node.parentElement
    const sameTag = parent ? Array.from(parent.children).filter((c) => c.tagName === node!.tagName) : []
    parts.unshift(sameTag.length > 1 ? `${tag}:nth-of-type(${sameTag.indexOf(node) + 1})` : tag)
    node = parent
  }
  return parts.join(' > ')
}

export function anchorFor(el: Element, clientX: number, clientY: number): Anchor {
  const r = el.getBoundingClientRect()
  const pct = (v: number) => Math.round(Math.min(Math.max(v, 0), 100) * 10) / 10
  return {
    selector: selectorFor(el),
    xPct: pct(r.width ? ((clientX - r.left) / r.width) * 100 : 50),
    yPct: pct(r.height ? ((clientY - r.top) / r.height) * 100 : 50),
  }
}

/** The pin's viewport position, or null when the element is not on the page right now. */
export function locate(anchor: Anchor | null): { x: number; y: number; el: Element } | null {
  if (!anchor?.selector) return null
  let el: Element | null = null
  try {
    el = document.querySelector(anchor.selector)
  } catch {
    return null
  }
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (!r.width && !r.height) return null
  return { x: r.left + (r.width * anchor.xPct) / 100, y: r.top + (r.height * anchor.yPct) / 100, el }
}
