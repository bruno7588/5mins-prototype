import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import {
  ROOT_ID,
  ancestorsOf,
  buildRequest,
  inspectable,
  isInspectorNode,
  shortLabel,
  shortSource,
  toMarkdown,
  type InspectRequest,
} from './inspect'
import './DesignInspect.css'

/**
 * Design Inspect overlay (dev only, mounted from main.tsx).
 *
 * Pill bottom-right or Alt+I enters inspect mode: hover highlights, click selects and
 * opens an inline prompt on the element (the box label carries the source line). Send posts the request to the dev server over
 * the HMR socket (the /inspect skill picks it up); Copy puts the same context on the
 * clipboard. Esc steps out, ArrowUp climbs to the parent.
 */

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'queued' }
  | { kind: 'unheard' }
  | { kind: 'updated' }
  | { kind: 'reloading' }
  | { kind: 'copied' }
  | { kind: 'error'; message: string }

const PANEL_W = 380
const PANEL_H = 200
const GAP = 8

declare global {
  interface Window {
    __designInspect?: { lastRequest?: InspectRequest; lastMarkdown?: string }
    __designInspectBus?: EventTarget
  }
}

// Dev-server events reach the component through a window-level bus: a hot reload of this
// module prunes its import.meta.hot listeners, while the bus and the mounted component survive.
type BusEvent = { kind: 'queued' | 'refused' | 'updated' | 'reloading'; id?: string; listening?: boolean }
const BUS_EVENT = 'design-inspect'
const bus: EventTarget = (window.__designInspectBus ??= new EventTarget())
const emit = (detail: BusEvent) => bus.dispatchEvent(new CustomEvent(BUS_EVENT, { detail }))
if (import.meta.hot) {
  import.meta.hot.on('design-inspect:queued', (d: { id?: string; listening?: boolean }) =>
    emit({ kind: 'queued', id: d?.id, listening: d?.listening !== false }),
  )
  import.meta.hot.on('design-inspect:refused', () => emit({ kind: 'refused' }))
  import.meta.hot.on('vite:afterUpdate', () => emit({ kind: 'updated' }))
  import.meta.hot.on('vite:beforeFullReload', () => emit({ kind: 'reloading' }))
}

export default function DesignInspect() {
  const [active, setActive] = useState(false)
  const [hover, setHover] = useState<Element | null>(null)
  const [selected, setSelected] = useState<Element | null>(null)
  const [instruction, setInstruction] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [, setTick] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingId = useRef<string | null>(null)

  // Own container so app CSS and the app's portals never interleave with the overlay.
  const root = useMemo(() => {
    let el = document.getElementById(ROOT_ID)
    if (!el) {
      el = document.createElement('div')
      el.id = ROOT_ID
      document.body.appendChild(el)
    }
    return el
  }, [])

  const exit = useCallback(() => {
    setActive(false)
    setHover(null)
    setSelected(null)
    setStatus({ kind: 'idle' })
  }, [])

  const select = useCallback((el: Element) => {
    setSelected(el)
    setHover(null)
    setInstruction('')
    setStatus({ kind: 'idle' })
    pendingId.current = null
  }, [])

  // Global keys: Alt+I toggles, Esc steps out, ArrowUp climbs to the parent.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'KeyI') {
        e.preventDefault()
        if (active) exit()
        else setActive(true)
        return
      }
      if (!active) return
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        if (selected) setSelected(null)
        else exit()
        return
      }
      const inField = (e.target as HTMLElement | null)?.closest?.('textarea, input')
      if (e.key === 'ArrowUp' && selected && !inField) {
        const parent = ancestorsOf(selected, 1)[0]
        if (parent) {
          e.preventDefault()
          select(parent)
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [active, selected, exit, select])

  // While active, own the pointer: highlight on hover, swallow clicks so the app never sees them.
  useEffect(() => {
    if (!active) return
    document.documentElement.classList.add('di-active')
    const pick = (e: Event): Element | null => {
      const t = e.target as Element | null
      if (!t || isInspectorNode(t) || t === document.body || t === document.documentElement) return null
      return inspectable(t)
    }
    const onMove = (e: MouseEvent) => setHover(pick(e))
    const swallow = (e: Event) => {
      if (isInspectorNode(e.target as Element)) return
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'click') {
        const el = pick(e)
        if (el) select(el)
      }
    }
    const blocked = ['pointerdown', 'mousedown', 'mouseup', 'click', 'dblclick']
    document.addEventListener('mousemove', onMove, true)
    blocked.forEach((ev) => document.addEventListener(ev, swallow, true))
    return () => {
      document.documentElement.classList.remove('di-active')
      document.removeEventListener('mousemove', onMove, true)
      blocked.forEach((ev) => document.removeEventListener(ev, swallow, true))
    }
  }, [active, select])

  // Re-measure on scroll/resize so the boxes and panel stay glued to their elements.
  useEffect(() => {
    if (!active) return
    const bump = () => setTick((n) => n + 1)
    window.addEventListener('scroll', bump, true)
    window.addEventListener('resize', bump)
    return () => {
      window.removeEventListener('scroll', bump, true)
      window.removeEventListener('resize', bump)
    }
  }, [active])

  // Dev-server round trip: the queued ack, then the HMR update Claude's edit triggers.
  useEffect(() => {
    const onBus = (e: Event) => {
      const { kind, id, listening } = (e as CustomEvent<BusEvent>).detail
      // The dev server says whether /inspect is running; without it the line just sits in the queue.
      if (kind === 'queued' && id === pendingId.current) setStatus(listening ? { kind: 'queued' } : { kind: 'unheard' })
      if (kind === 'refused') {
        setStatus({ kind: 'error', message: 'Dev server is exposed to the network; Send is off. Use Copy.' })
      }
      if (kind === 'updated' && pendingId.current) {
        setStatus({ kind: 'updated' })
        pendingId.current = null
      }
      if (kind === 'reloading' && pendingId.current) setStatus({ kind: 'reloading' })
    }
    bus.addEventListener(BUS_EVENT, onBus)
    return () => bus.removeEventListener(BUS_EVENT, onBus)
  }, [])

  useLayoutEffect(() => {
    if (selected) textareaRef.current?.focus()
  }, [selected])

  const copy = async (text: string) => {
    window.__designInspect = { ...window.__designInspect, lastMarkdown: text }
    try {
      await navigator.clipboard.writeText(text)
      setStatus({ kind: 'copied' })
    } catch {
      setStatus({ kind: 'error', message: 'Clipboard blocked by the browser.' })
    }
  }

  const send = () => {
    if (!selected || !instruction.trim()) return
    const req = buildRequest(selected, instruction.trim())
    const md = toMarkdown(req)
    window.__designInspect = { lastRequest: req, lastMarkdown: md }
    const hot = import.meta.hot
    if (!hot) {
      void copy(md)
      return
    }
    pendingId.current = req.id
    setStatus({ kind: 'sending' })
    hot.send('design-inspect:send', req)
  }

  const hoverRect = hover && hover !== selected ? hover.getBoundingClientRect() : null
  const selRect = selected ? selected.getBoundingClientRect() : null

  return createPortal(
    <>
      <button
        type="button"
        className={`di-pill${active ? ' di-pill--active' : ''}`}
        onClick={() => (active ? exit() : setActive(true))}
        aria-pressed={active}
        title="Design Inspect (Alt+I)"
      >
        {active ? 'Inspecting · Esc to exit' : 'Inspect'}
      </button>

      {active && hover && hoverRect && <Box rect={hoverRect} label={`${shortLabel(hover)} · ${shortSource(hover)}`} />}
      {active && selected && selRect && (
        <Box rect={selRect} label={`${shortLabel(selected)} · ${shortSource(selected)}`} selected />
      )}

      {active && selected && selRect && (
        <div className="di-panel" style={placePanel(selRect)} role="dialog" aria-label="Design Inspect">
          <textarea
            ref={textareaRef}
            className="di-textarea"
            rows={2}
            placeholder="What should change? e.g. make this green"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <div className="di-actions">
            <button
              type="button"
              className="di-btn di-btn--primary"
              onClick={send}
              disabled={!instruction.trim() || status.kind === 'sending'}
            >
              Send to Claude
            </button>
            <button
              type="button"
              className="di-btn"
              onClick={() => void copy(toMarkdown(buildRequest(selected, instruction.trim())))}
            >
              Copy
            </button>
            <span className={`di-status${statusClass(status)}`} role="status">
              {statusText(status)}
            </span>
            <button type="button" className="di-close" onClick={() => setSelected(null)} aria-label="Close">
              ×
            </button>
          </div>
        </div>
      )}
    </>,
    root,
  )
}

function Box({ rect, label, selected }: { rect: DOMRect; label: string; selected?: boolean }) {
  return (
    <div
      className={`di-box${selected ? ' di-box--selected' : ''}`}
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
    >
      <span className={`di-box-label${rect.top > 24 ? '' : ' di-box-label--inside'}`}>{label}</span>
    </div>
  )
}

/** Below the element if it fits, else above; inside it when the element fills the viewport. */
function placePanel(r: DOMRect): CSSProperties {
  const left = Math.min(Math.max(GAP, r.left), Math.max(GAP, window.innerWidth - PANEL_W - GAP))
  if (r.bottom + GAP + PANEL_H <= window.innerHeight) return { top: r.bottom + GAP, left, width: PANEL_W }
  if (r.top - GAP - PANEL_H >= 0) return { bottom: window.innerHeight - r.top + GAP, left, width: PANEL_W }
  const top = Math.min(Math.max(GAP, r.top + GAP), Math.max(GAP, window.innerHeight - PANEL_H - GAP))
  return { top, left, width: PANEL_W }
}

function statusText(s: Status): string {
  switch (s.kind) {
    case 'idle':
      return 'Enter to send'
    case 'sending':
      return 'Sending…'
    case 'queued':
      return 'Sent to Claude, waiting for the edit…'
    case 'unheard':
      return 'Queued. Run /inspect in Claude Code to apply it.'
    case 'updated':
      return 'Updated'
    case 'reloading':
      return 'Reloading…'
    case 'copied':
      return 'Copied'
    case 'error':
      return s.message
  }
}

function statusClass(s: Status): string {
  if (s.kind === 'queued' || s.kind === 'updated' || s.kind === 'copied') return ' di-status--ok'
  if (s.kind === 'error') return ' di-status--error'
  return ''
}
