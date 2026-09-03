/**
 * Design Inspect payload builder (dev only).
 *
 * Turns a clicked DOM element into what Claude needs to edit it first time: the JSX
 * line that rendered it (from the `data-inspect` attribute stamped in dev by
 * tools/design-inspect), the component chain, the CSS rules that match it with their
 * file names, and computed values resolved back to design-token names.
 */

export const ATTR = 'data-inspect'
export const ROOT_ID = 'design-inspect-root'

export interface SourceRef {
  source: string
  tag: string
  classes: string[]
}

export interface CssRule {
  file: string
  selector: string
  declarations: string
}

export interface InspectTarget {
  tag: string
  id?: string
  classes: string[]
  role?: string
  text?: string
  rect: { x: number; y: number; w: number; h: number }
  source?: string
  ancestry: SourceRef[]
  components: string[]
  cssRules: CssRule[]
  computed: Record<string, string>
}

export interface InspectRequest {
  id: string
  url: string
  theme: 'light' | 'dark'
  instruction: string
  target: InspectTarget
}

export function isInspectorNode(el: Element | null): boolean {
  return !!el?.closest?.(`#${ROOT_ID}`)
}

/** SVG internals and text wrappers are never what you mean; snap to the nearest stamped element. */
export function inspectable(el: Element): Element {
  return el.closest(`[${ATTR}]`) ?? el
}

export function sourceOf(el: Element): string | undefined {
  return el.getAttribute(ATTR) ?? undefined
}

/** `AssessmentAnswers.tsx:142`, for labels. */
export function shortSource(el: Element): string {
  const src = sourceOf(el)
  if (!src) return 'no source'
  const [file, line] = src.split(':')
  return `${file.slice(file.lastIndexOf('/') + 1)}:${line}`
}

/** `button.asp-toggle.ds-btn`, for labels and crumbs. */
export function shortLabel(el: Element): string {
  const classes = classesOf(el).slice(0, 2)
  return el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + classes.map((c) => `.${c}`).join('')
}

function classesOf(el: Element): string[] {
  return Array.from(el.classList)
}

/** Nearest first, stopping before body. */
export function ancestorsOf(el: Element, max: number): Element[] {
  const out: Element[] = []
  let cur = el.parentElement
  while (cur && cur !== document.body && cur !== document.documentElement && out.length < max) {
    out.push(cur)
    cur = cur.parentElement
  }
  return out
}

/** The nearest stamped ancestor, then only ancestors that introduce a new file (max 3). */
function ancestry(el: Element): SourceRef[] {
  const own = sourceOf(el)?.split(':')[0]
  const seen = new Set<string>()
  const out: SourceRef[] = []
  for (const a of ancestorsOf(el, 60)) {
    const src = sourceOf(a)
    if (!src) continue
    const file = src.split(':')[0]
    if (out.length > 0 && (seen.has(file) || file === own)) continue
    seen.add(file)
    out.push({ source: src, tag: a.tagName.toLowerCase(), classes: classesOf(a) })
    if (out.length >= 3) break
  }
  return out
}

const INTERNAL_COMPONENTS = new Set([
  'Fragment', 'StrictMode', 'Suspense', 'BrowserRouter', 'Router', 'Routes', 'Route',
  'RenderedRoute', 'Outlet', 'Provider', 'Consumer', 'Navigate', 'RouterProvider',
  'ErrorBoundary', 'DesignInspect',
])

/** Best-effort walk up the React fiber tree for function component names. */
function componentChain(el: Element): string[] {
  try {
    const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fiber: any = key ? (el as any)[key] : null
    const names: string[] = []
    while (fiber && names.length < 5) {
      const type = fiber.type
      // Function components plus memo/forwardRef wrappers; contexts and providers are noise.
      const inner = type && typeof type === 'object' ? type.render ?? type.type : undefined
      const name: string | undefined =
        typeof type === 'function'
          ? type.displayName || type.name
          : inner
            ? type.displayName || inner.displayName || inner.name
            : undefined
      if (name && !INTERNAL_COMPONENTS.has(name) && !names.includes(name)) names.push(name)
      fiber = fiber.return
    }
    return names
  } catch {
    return []
  }
}

// Vite injects each CSS file as <style data-vite-dev-id="/abs/path/File.css">.
function fileOfSheet(sheet: CSSStyleSheet): string | null {
  const id = (sheet.ownerNode as HTMLElement | null)?.dataset?.viteDevId
  if (!id) return null
  const i = id.indexOf('/src/')
  return i >= 0 ? id.slice(i + 1) : id
}

const STATE_PSEUDO = /:(hover|focus-visible|focus-within|focus|active|visited|link|target)(?![\w-])/g
const PSEUDO_ELEMENT = /::?(before|after|placeholder|marker|selection|file-selector-button|-webkit-[\w-]+|-moz-[\w-]+)(?![\w-])/g

/** Strip state so `.x:hover` and `.x::before` count as matching `.x`. */
function matchable(selector: string): string {
  return selector.replace(PSEUDO_ELEMENT, '').replace(STATE_PSEUDO, '').trim()
}

export function matchedRules(el: Element, max = 12): CssRule[] {
  const out: CssRule[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    const file = fileOfSheet(sheet)
    if (!file || file.endsWith('/reset.css') || file.startsWith('src/dev/')) continue
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    walkRules(el, rules, file, '', out)
    if (out.length >= max) break
  }
  return out.slice(0, max)
}

function walkRules(el: Element, rules: CSSRuleList, file: string, context: string, out: CssRule[]) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const hit = rule.selectorText.split(',').some((s) => {
        const base = matchable(s)
        try {
          return !!base && el.matches(base)
        } catch {
          return false
        }
      })
      if (hit) {
        out.push({
          file,
          selector: (context ? `${context} ` : '') + rule.selectorText,
          declarations: rule.style.cssText,
        })
      }
    } else if (rule instanceof CSSGroupingRule) {
      const cond = (rule as CSSGroupingRule & { conditionText?: string }).conditionText
      const label =
        rule instanceof CSSMediaRule ? `@media ${cond}` : rule instanceof CSSSupportsRule ? `@supports ${cond}` : ''
      walkRules(el, rule.cssRules, file, [context, label].filter(Boolean).join(' '), out)
    }
  }
}

interface Token {
  name: string
  semantic: boolean
}

/** Every custom property declared in tokens.css; semantic = its declared value is a var() alias. */
function tokens(): Token[] {
  const byName = new Map<string, boolean>()
  for (const sheet of Array.from(document.styleSheets)) {
    const file = fileOfSheet(sheet)
    if (!file || !file.endsWith('/styles/tokens.css')) continue
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue
      for (let i = 0; i < rule.style.length; i++) {
        const name = rule.style[i]
        if (!name.startsWith('--')) continue
        const semantic = rule.style.getPropertyValue(name).trim().startsWith('var(')
        byName.set(name, (byName.get(name) ?? false) || semantic)
      }
    }
  }
  return Array.from(byName, ([name, semantic]) => ({ name, semantic }))
}

/** Effective token values at this element (theme-aware), keyed by normalised value; semantic names first. */
function valueMap(el: Element): Map<string, string[]> {
  const cs = getComputedStyle(el)
  const map = new Map<string, string[]>()
  const list = tokens().sort((a, b) => Number(b.semantic) - Number(a.semantic))
  for (const { name } of list) {
    const raw = cs.getPropertyValue(name).trim()
    if (!raw) continue
    const key = normalise(raw)
    const names = map.get(key) ?? []
    if (!names.includes(name)) names.push(name)
    map.set(key, names)
  }
  return map
}

const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp

function hexToRgb(h: string): string {
  const full = h.length <= 4 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full.slice(0, 6), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  if (full.length === 8) {
    const a = round(parseInt(full.slice(6, 8), 16) / 255, 3)
    if (a !== 1) return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  return `rgb(${r}, ${g}, ${b})`
}

/** Hex → rgb(), rem → px, tidy spacing, so token values and computed values compare equal. */
function normalise(v: string): string {
  let s = v.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ')
  const hex = s.match(/^#([0-9a-f]{3,8})$/)
  if (hex) s = hexToRgb(hex[1])
  const rem = s.match(/^(-?[\d.]+)rem$/)
  if (rem) s = `${round(parseFloat(rem[1]) * 16)}px`
  s = s.replace(/^rgba\((\d+, \d+, \d+), 1\)$/, 'rgb($1)')
  if (s === 'rgba(0, 0, 0, 0)') s = 'transparent'
  return s
}

function rgbToHex(norm: string): string | null {
  const m = norm.match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/)
  if (!m) return null
  const hex = [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()
  return m[4] !== undefined ? `#${hex} @ ${Math.round(parseFloat(m[4]) * 100)}%` : `#${hex}`
}

function tokenSuffix(map: Map<string, string[]>, value: string): string {
  const names = map.get(normalise(value))
  return names?.length ? ` (${names.slice(0, 2).join(', ')})` : ''
}

function annotateColor(map: Map<string, string[]>, value: string): string {
  const norm = normalise(value)
  if (norm === 'transparent') return 'transparent'
  return `${rgbToHex(norm) ?? value}${tokenSuffix(map, value)}`
}

/** `8px 12px` → `8px 12px (--space-s --space-sm)` when at least one part is a token. */
function annotateLengths(map: Map<string, string[]>, value: string): string {
  const parts = value.split(' ')
  const names = parts.map((p) => map.get(normalise(p))?.[0])
  return names.some(Boolean) ? `${value} (${names.map((n) => n ?? '·').join(' ')})` : value
}

function computedStyles(el: Element): Record<string, string> {
  const cs = getComputedStyle(el)
  const map = valueMap(el)
  const out: Record<string, string> = {}
  const skip = (v: string) => !v || v === 'none' || v === '0px' || v === 'normal' || v === 'auto'
  out.display = cs.display
  out.color = annotateColor(map, cs.color)
  if (normalise(cs.backgroundColor) !== 'transparent') out['background-color'] = annotateColor(map, cs.backgroundColor)
  if (!skip(cs.borderTopWidth) && cs.borderTopStyle !== 'none') {
    out.border = `${cs.borderTopWidth} ${cs.borderTopStyle} ${annotateColor(map, cs.borderTopColor)}`
  }
  if (!skip(cs.borderRadius)) out['border-radius'] = annotateLengths(map, cs.borderRadius)
  out.font = `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(',')[0].replace(/"/g, '')}`
  if (!skip(cs.padding)) out.padding = annotateLengths(map, cs.padding)
  if (!skip(cs.margin)) out.margin = annotateLengths(map, cs.margin)
  if (!skip(cs.gap)) out.gap = annotateLengths(map, cs.gap)
  return out
}

export function buildRequest(el: Element, instruction: string): InspectRequest {
  const r = el.getBoundingClientRect()
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
  const theme = el.closest('[data-theme]')?.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  return {
    id: `di-${Date.now().toString(36)}`,
    url: location.pathname + location.search,
    theme,
    instruction,
    target: {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: classesOf(el),
      role: el.getAttribute('role') ?? undefined,
      text: text ? (text.length > 80 ? `${text.slice(0, 80)}…` : text) : undefined,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      source: sourceOf(el),
      ancestry: ancestry(el),
      components: componentChain(el),
      cssRules: matchedRules(el),
      computed: computedStyles(el),
    },
  }
}

/** Compact markdown for the clipboard; same facts as the JSON line. */
export function toMarkdown(req: InspectRequest): string {
  const t = req.target
  const selector = `${t.tag}${t.id ? `#${t.id}` : ''}${t.classes.map((c) => `.${c}`).join('')}`
  const lines = [
    '## Design Inspect request',
    `**Change:** ${req.instruction}`,
    `**Element:** \`${selector}\`${t.text ? ` "${t.text}"` : ''} (${t.rect.w}×${t.rect.h}) on ${req.url} (${req.theme})`,
    `**Source:** ${t.source ?? 'not a JSX host element, see ancestry'}`,
  ]
  if (t.ancestry.length) {
    lines.push(
      `**Inside:** ${t.ancestry
        .map((a) => `${a.source} \`${a.tag}${a.classes.slice(0, 2).map((c) => `.${c}`).join('')}\``)
        .join(' › ')}`,
    )
  }
  if (t.components.length) lines.push(`**Components:** ${t.components.join(' ‹ ')}`)
  if (t.cssRules.length) {
    lines.push('**Matched CSS:**')
    for (const r of t.cssRules) lines.push(`- \`${r.file}\` \`${r.selector}\` { ${r.declarations} }`)
  }
  lines.push(`**Computed:** ${Object.entries(t.computed).map(([k, v]) => `${k}: ${v}`).join('; ')}`)
  return lines.join('\n')
}
