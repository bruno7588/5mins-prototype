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
 *
 * Double-click text (or "Edit text" in the panel) to type over it in place. Enter
 * saves: the dev server writes the exact wording into the source when it can find
 * it, otherwise the edit goes to Claude as a request. Esc puts the old text back.
 */

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'queued' }
  | { kind: 'unheard' }
  | { kind: 'updated' }
  | { kind: 'reloading' }
  | { kind: 'copied' }
  | { kind: 'saved'; id: string; source: string }
  | { kind: 'undone' }
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
type BusEvent = {
  kind: 'queued' | 'refused' | 'updated' | 'reloading' | 'text-saved' | 'text-undone' | 'text-undo-failed'
  id?: string
  listening?: boolean
  source?: string
}
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
  import.meta.hot.on('design-inspect:text-saved', (d: { id: string; source: string }) =>
    emit({ kind: 'text-saved', id: d.id, source: d.source }),
  )
  import.meta.hot.on('design-inspect:text-undone', (d: { id: string }) => emit({ kind: 'text-undone', id: d.id }))
  import.meta.hot.on('design-inspect:text-undo-failed', (d: { id: string }) => emit({ kind: 'text-undo-failed', id: d.id }))
}

const isText = (n: Node): n is Text => n.nodeType === Node.TEXT_NODE

/**
 * The text that can be typed over: every text node of a text-only element, or the one
 * labelled text node beside icons (a button or dropdown trigger). Null when there is
 * no text, or several labels would make "the text" ambiguous.
 */
function editableText(el: Element): { texts: Text[]; wrap: boolean } | null {
  if (!(el instanceof HTMLElement) || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return null
  const nodes = Array.from(el.childNodes)
  if (nodes.length > 0 && nodes.every(isText)) return el.textContent?.trim() ? { texts: nodes, wrap: false } : null
  const labels = nodes.filter(isText).filter((n) => n.data.trim())
  return labels.length === 1 ? { texts: labels, wrap: true } : null
}

interface TextEditSession {
  /** The inspected element; its source line and request describe the edit. */
  el: HTMLElement
  /** What the caret lives in: the element itself, or a temporary span around its label. */
  field: HTMLElement
  /** React owns these nodes; exactly these go back into the element when editing ends. */
  nodes: ChildNode[]
  texts: Text[]
  data: string[]
  wrap: boolean
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
  const [editing, setEditing] = useState<HTMLElement | null>(null)
  const editRef = useRef<TextEditSession | null>(null)

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

  const startEdit = useCallback((el: Element) => {
    const target = editableText(el)
    if (!target || !(el instanceof HTMLElement)) return
    const { texts, wrap } = target
    const nodes = Array.from(el.childNodes)
    // Beside icons, only the label is typed in, so the icons can't be deleted.
    let field = el
    if (wrap) {
      field = document.createElement('span')
      field.textContent = texts[0].data.trim()
      texts[0].replaceWith(field)
    }
    editRef.current = { el, field, nodes, texts, data: texts.map((n) => n.data), wrap }
    setSelected(el)
    setHover(null)
    setEditing(field)
    field.contentEditable = 'plaintext-only'
    field.focus()
    const range = document.createRange()
    range.selectNodeContents(field)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [])

  const finishEdit = useCallback((save: boolean) => {
    const session = editRef.current
    if (!session) return
    editRef.current = null
    setEditing(null)
    const { el, field, nodes, texts, data, wrap } = session
    const typed = (field.textContent ?? '').replace(/\u00a0/g, ' ')
    field.removeAttribute('contenteditable')
    window.getSelection()?.removeAllRanges()
    // Hand React back its own nodes. Until the source change hot-reloads, they carry
    // the new wording so the page doesn't flash the old text.
    el.replaceChildren(...nodes)
    const original = data.join('')
    const before = original.trim()
    const after = typed.trim()
    texts.forEach((n, i) => (n.data = data[i]))
    if (!save || after === before || !after) {
      setStatus({ kind: 'idle' })
      return
    }
    if (wrap) texts[0].data = original.replace(before, after)
    else texts.forEach((n, i) => (n.data = i === 0 ? typed : ''))
    const req = buildRequest(
      el,
      `Change the text "${before}" to "${after}". Use this exact wording; it was typed directly on the page.`,
    )
    const hot = import.meta.hot
    if (!hot) {
      void navigator.clipboard.writeText(toMarkdown(req))
      setStatus({ kind: 'copied' })
      return
    }
    pendingId.current = req.id
    setStatus({ kind: 'sending' })
    hot.send('design-inspect:text', {
      id: req.id,
      source: req.target.source,
      tag: req.target.tag,
      ancestry: req.target.ancestry.map((a) => a.source),
      before,
      after,
      request: req,
    })
  }, [])

  const exit = useCallback(() => {
    finishEdit(true)
    setActive(false)
    setHover(null)
    setSelected(null)
    setStatus({ kind: 'idle' })
  }, [finishEdit])

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
      if (editRef.current) {
        // Enter saves (not mid-IME composition, not Shift+Enter); Esc restores.
        if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey && !e.isComposing)) {
          e.preventDefault()
          e.stopPropagation()
          finishEdit(e.key === 'Enter')
        }
        // Inside a <button>, Space would press the button instead of typing a space.
        if (e.key === ' ' && !e.isComposing) {
          e.preventDefault()
          document.execCommand('insertText', false, ' ')
        }
        return
      }
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
  }, [active, selected, exit, select, finishEdit])

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
      // Let the caret land and move inside the text being edited, but never press it.
      if (editRef.current?.field.contains(e.target as Node)) {
        if (e.type === 'click' || e.type === 'dblclick') {
          e.preventDefault()
          e.stopPropagation()
        }
        return
      }
      e.preventDefault()
      e.stopPropagation()
      if (editRef.current && e.type === 'mousedown') finishEdit(true)
      if (e.type === 'click') {
        const el = pick(e)
        if (el) select(el)
      }
      if (e.type === 'dblclick') {
        const el = pick(e)
        if (el) startEdit(el)
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
  }, [active, select, startEdit, finishEdit])

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
      const { kind, id, listening, source } = (e as CustomEvent<BusEvent>).detail
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
      if (kind === 'text-saved' && id) {
        pendingId.current = null
        setStatus({ kind: 'saved', id, source: source ?? '' })
      }
      if (kind === 'text-undone') setStatus({ kind: 'undone' })
      if (kind === 'text-undo-failed') setStatus({ kind: 'error', message: 'That text changed since; undo it in the file.' })
    }
    bus.addEventListener(BUS_EVENT, onBus)
    return () => bus.removeEventListener(BUS_EVENT, onBus)
  }, [])

  useLayoutEffect(() => {
    if (selected && !editRef.current) textareaRef.current?.focus()
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
    hot.send('design-inspect:send', req)
    /* Close the inspector once the request is on its way — the request lands in
       Claude's chat, so the on-canvas panel has done its job. */
    exit()
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

      {active && editing && (
        <div className="di-hint" style={placeHint(editing.getBoundingClientRect())}>
          Enter to save · Esc to cancel
        </div>
      )}
      {active && hover && hoverRect && <Box rect={hoverRect} label={`${shortLabel(hover)} · ${shortSource(hover)}`} />}
      {active && selected && selRect && (
        <Box rect={selRect} label={`${shortLabel(selected)} · ${shortSource(selected)}`} selected />
      )}

      {active && selected && selRect && !editing && (
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
            {editableText(selected) && (
              <button type="button" className="di-btn" onClick={() => startEdit(selected)}>
                Edit Text
              </button>
            )}
            {status.kind === 'saved' && (
              <button
                type="button"
                className="di-btn"
                onClick={() => import.meta.hot?.send('design-inspect:text-undo', { id: status.id })}
              >
                Undo
              </button>
            )}
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

function placeHint(r: DOMRect): CSSProperties {
  return r.bottom + GAP + 28 <= window.innerHeight ? { top: r.bottom + GAP, left: r.left } : { top: r.top - GAP - 24, left: r.left }
}

function statusText(s: Status): string {
  switch (s.kind) {
    case 'idle':
      return 'Enter to send · double-click text to edit'
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
    case 'saved':
      return `Saved to ${s.source.slice(s.source.lastIndexOf('/') + 1)}`
    case 'undone':
      return 'Undone'
    case 'error':
      return s.message
  }
}

function statusClass(s: Status): string {
  if (s.kind === 'queued' || s.kind === 'updated' || s.kind === 'copied' || s.kind === 'saved' || s.kind === 'undone') {
    return ' di-status--ok'
  }
  if (s.kind === 'error') return ' di-status--error'
  return ''
}
