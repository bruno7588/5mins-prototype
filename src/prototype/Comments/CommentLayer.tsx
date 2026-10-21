import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { TickCircle, Trash } from 'iconsax-react'
import { anchorFor, locate, type Anchor } from './commentAnchor'
import { currentTrail, isReplaying, recordClicks, replayTrail, resetTrail } from './clickTrail'
import type { NewComment, PrototypeComment } from './useComments'
import './CommentLayer.css'

/* Prototype comment mode (Demos switcher → Comment). Click anything to pin a comment,
   numbered pins mark existing ones, the panel lists every comment on the page. Prototype
   chrome, so shadcn-style and off the 5Mins brand. Prefix: pcm- */

const AUTHOR_KEY = 'pcm-author'
const POP_W = 300

const readAuthor = () => {
  try {
    return localStorage.getItem(AUTHOR_KEY) ?? ''
  } catch {
    return ''
  }
}
const saveAuthor = (name: string) => {
  try {
    localStorage.setItem(AUTHOR_KEY, name)
  } catch {
    /* private window: ask again next time */
  }
}

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Keep a popover on screen next to the point it belongs to.
const place = (x: number, y: number) => ({
  left: Math.max(8, Math.min(x + 16, window.innerWidth - POP_W - 8)),
  top: Math.max(8, Math.min(y - 8, window.innerHeight - 280)),
})

const isChrome = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('[data-inspect-ignore]')

/* Drag a box by its header so it can be moved off what it covers. The offset sits on top
   of the box's own position and goes back to zero when `resetKey` changes (another thread). */
function useDrag(resetKey: unknown) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const start = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  useEffect(() => setOffset({ x: 0, y: 0 }), [resetKey])
  return {
    style: { transform: `translate(${offset.x}px, ${offset.y}px)` },
    handle: {
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        // Buttons and fields in the header keep their own clicks.
        if ((e.target as Element).closest('button, input, label')) return
        e.currentTarget.setPointerCapture(e.pointerId)
        start.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
      },
      onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
        const s = start.current
        if (s) setOffset({ x: s.ox + e.clientX - s.x, y: s.oy + e.clientY - s.y })
      },
      onPointerUp: () => {
        start.current = null
      },
      onPointerCancel: () => {
        start.current = null
      },
    },
  }
}

interface Props {
  active: boolean
  /** The comments list panel (the arrow beside Comment); pins show either way. */
  showList: boolean
  onCloseList: () => void
  comments: PrototypeComment[]
  error: string | null
  onAdd: (c: NewComment) => Promise<PrototypeComment | undefined>
  onResolve: (id: string, resolved: boolean) => void
  onDelete: (id: string) => Promise<void>
  onExit: () => void
  /** The page on screen: its comments get pins; the list shows every page. */
  currentRoute: string
  /** Go to a comment on another page (navigates there with ?comment=<id>). */
  onGoTo: (c: PrototypeComment) => void
  /** Thread to open once loaded (?comment=<id> from the Slack link). */
  focusId?: string | null
}

function CommentLayer({ active, showList, onCloseList, comments, error, onAdd, onResolve, onDelete, onExit, currentRoute, onGoTo, focusId }: Props) {
  const [, setTick] = useState(0)
  const [hover, setHover] = useState<DOMRect | null>(null)
  const [draft, setDraft] = useState<{ anchor: Anchor; x: number; y: number } | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  useEffect(() => setConfirmDelete(false), [openId])
  const threadDrag = useDrag(openId)
  // The clicks that lead to each comment, so it can be reopened inside its drawer or step.
  useEffect(() => recordClicks(), [])
  useEffect(() => resetTrail(), [currentRoute])
  const listDrag = useDrag(showList)

  const roots = comments.filter((c) => !c.parentId)
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id)
  const numberOf = (id: string) => roots.findIndex((c) => c.id === id) + 1
  const visibleRoots = roots.filter((c) => showResolved || !c.resolved)
  const pageRoots = visibleRoots.filter((c) => c.route === currentRoute)
  // Outside comment mode the page keeps a pin on every open comment until it is resolved.
  const pins = active ? pageRoots : pageRoots.filter((c) => !c.resolved)
  // The list groups by page: this page first, then the others in order of first comment.
  const groups = [currentRoute, ...new Set(visibleRoots.map((c) => c.route))]
    .filter((r, i, all) => all.indexOf(r) === i)
    .map((route) => ({ route, items: visibleRoots.filter((c) => c.route === route) }))
    .filter((g) => g.items.length > 0)
  const open = roots.find((c) => c.id === openId) ?? null

  // Pins follow their elements through scroll, resize and route animations.
  const tracking = active || pins.length > 0
  useEffect(() => {
    if (!tracking) return
    let raf = 0
    const loop = () => {
      setTick((t) => t + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [tracking])

  // Entering or leaving comment mode starts clean: no draft, hover or open thread.
  useEffect(() => {
    setHover(null)
    setDraft(null)
    setOpenId(null)
  }, [active])

  // Pick mode: the page underneath is inert; a click pins a new comment there.
  useEffect(() => {
    if (!active) return
    document.documentElement.classList.add('pcm-active')
    const swallow = (e: Event) => {
      if (isChrome(e.target) || isReplaying()) return
      e.preventDefault()
      e.stopPropagation()
    }
    const onClick = (e: MouseEvent) => {
      if (isChrome(e.target) || isReplaying()) return
      e.preventDefault()
      e.stopPropagation()
      const el = e.target as Element
      setOpenId(null)
      setDraft({ anchor: anchorFor(el, e.clientX, e.clientY), x: e.clientX, y: e.clientY })
    }
    const onMove = (e: MouseEvent) => {
      setHover(isChrome(e.target) ? null : (e.target as Element).getBoundingClientRect())
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (draft || openId) {
        setDraft(null)
        setOpenId(null)
      } else onExit()
    }
    const opts = { capture: true }
    for (const type of ['pointerdown', 'mousedown', 'mouseup', 'dblclick', 'submit'] as const) {
      document.addEventListener(type, swallow, opts)
    }
    document.addEventListener('click', onClick, opts)
    document.addEventListener('mousemove', onMove, opts)
    document.addEventListener('keydown', onKey, opts)
    return () => {
      document.documentElement.classList.remove('pcm-active')
      for (const type of ['pointerdown', 'mousedown', 'mouseup', 'dblclick', 'submit'] as const) {
        document.removeEventListener(type, swallow, opts)
      }
      document.removeEventListener('click', onClick, opts)
      document.removeEventListener('mousemove', onMove, opts)
      document.removeEventListener('keydown', onKey, opts)
    }
  }, [active, draft, openId, onExit])

  const openThread = async (c: PrototypeComment) => {
    setDraft(null)
    if (c.route !== currentRoute) return onGoTo(c)
    // Inside a drawer, modal or step that is closed now: click the way back there first.
    await replayTrail(c.steps, c.anchor)
    const at = locate(c.anchor)
    at?.el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setOpenId(c.id)
  }

  // Open the linked thread once, when its comment has loaded.
  const focusedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!active || !focusId || focusedRef.current === focusId) return
    const target = roots.find((c) => c.id === focusId)
    if (!target) return
    focusedRef.current = focusId
    if (target.resolved) setShowResolved(true)
    void openThread(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, focusId, comments])

  if (!active && pins.length === 0 && !open) return null

  const openAt = open ? locate(open.anchor) : null

  return createPortal(
    <div className="pcm-root" data-inspect-ignore>
      {hover && !draft && (
        <div
          className="pcm-hover"
          style={{ left: hover.left, top: hover.top, width: hover.width, height: hover.height }}
        />
      )}

      {pins.map((c) => {
        const at = locate(c.anchor)
        if (!at) return null
        return (
          <button
            key={c.id}
            type="button"
            className={`pcm-pin${c.resolved ? ' pcm-pin--resolved' : ''}${openId === c.id ? ' pcm-pin--open' : ''}`}
            style={{ left: at.x, top: at.y }}
            aria-label={`Comment ${numberOf(c.id)} by ${c.author}`}
            onClick={() => (openId === c.id ? setOpenId(null) : void openThread(c))}
          >
            {numberOf(c.id)}
          </button>
        )
      })}

      {draft && (
        <div className="pcm-pop" style={place(draft.x, draft.y)} role="dialog" aria-label="New comment">
          <Composer
            placeholder="Add a comment"
            submitLabel="Post"
            onCancel={() => setDraft(null)}
            onSubmit={async (text, author, website) => {
              const created = await onAdd({ text, author, website, anchor: draft.anchor, steps: currentTrail() })
              setDraft(null)
              if (created) setOpenId(created.id)
            }}
          />
        </div>
      )}

      {open && (
        <div
          className="pcm-pop"
          style={{ ...(openAt ? place(openAt.x, openAt.y) : { right: 16, bottom: 420 }), ...threadDrag.style }}
          role="dialog"
          aria-label={`Comment ${numberOf(open.id)}`}
        >
          <div className="pcm-pop__head pcm-drag" {...threadDrag.handle}>
            <span className="pcm-pop__title">Comment {numberOf(open.id)}</span>
            <button
              type="button"
              className="pcm-icon-btn"
              aria-label={open.resolved ? 'Reopen' : 'Resolve'}
              data-tip={open.resolved ? 'Reopen' : 'Resolve'}
              onClick={() => onResolve(open.id, !open.resolved)}
            >
              <TickCircle size={18} color="currentColor" variant={open.resolved ? 'Bold' : 'Linear'} />
            </button>
            <button
              type="button"
              className="pcm-icon-btn"
              aria-label="Delete"
              data-tip="Delete"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash size={18} color="currentColor" variant="Linear" />
            </button>
            <button type="button" className="pcm-icon-btn" aria-label="Close" data-tip="Close" onClick={() => setOpenId(null)}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {confirmDelete && (
            <div className="pcm-confirm" role="alertdialog" aria-label="Delete this comment?">
              <p className="pcm-confirm__text">
                Delete this comment{repliesOf(open.id).length ? ' and its replies' : ''}? This can't be undone.
              </p>
              <div className="pcm-composer__actions">
                <button type="button" className="pcm-btn" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="pcm-btn pcm-btn--danger"
                  onClick={async () => {
                    await onDelete(open.id)
                    setConfirmDelete(false)
                    setOpenId(null)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          <div className="pcm-thread">
            {[open, ...repliesOf(open.id)].map((c) => (
              <div key={c.id} className="pcm-msg">
                <div className="pcm-msg__meta">
                  <span className="pcm-msg__author">{c.author}</span>
                  <span className="pcm-msg__time">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="pcm-msg__text">{c.text}</p>
              </div>
            ))}
          </div>
          <Composer
            placeholder="Reply"
            submitLabel="Reply"
            onSubmit={async (text, author, website) => {
              await onAdd({ text, author, website, parentId: open.id })
            }}
          />
        </div>
      )}

      {showList && (
      <section className="pcm-panel" aria-label="Comments" style={listDrag.style}>
        <div className="pcm-panel__head pcm-drag" {...listDrag.handle}>
          <span className="pcm-panel__title">Comments</span>
          <label className="pcm-panel__toggle">
            <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
            Show resolved
          </label>
          <button type="button" className="pcm-icon-btn" aria-label="Close comments" data-tip="Close" onClick={onCloseList}>
            {/* The side drawer close (RolePanel), inside the chrome icon button. */}
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {error && <p className="pcm-panel__error">{error}</p>}
        {visibleRoots.length === 0 ? (
          <p className="pcm-panel__empty">{roots.length ? 'All comments are resolved.' : 'Give feedback, ask a question, or leave a note'}</p>
        ) : (
          <div className="pcm-list">
            {groups.map((g) => (
              <section key={g.route} className="pcm-group" aria-label={g.route}>
                <h3 className="pcm-group__title">{g.route === currentRoute ? 'This page' : g.route}</h3>
                <ul className="pcm-group__items">
                  {g.items.map((c) => {
                    const replies = repliesOf(c.id).length
                    const onThisPage = c.route === currentRoute
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={`pcm-list__item${openId === c.id ? ' pcm-list__item--open' : ''}`}
                          onClick={() => void openThread(c)}
                        >
                          <span className={`pcm-list__num${c.resolved ? ' pcm-list__num--resolved' : ''}`}>{numberOf(c.id)}</span>
                          <span className="pcm-list__body">
                            <span className="pcm-list__meta">
                              {c.author} · {timeAgo(c.createdAt)}
                              {replies > 0 && ` · ${replies} ${replies === 1 ? 'reply' : 'replies'}`}
                            </span>
                            <span className="pcm-list__text">{c.text}</span>
                            {onThisPage && !locate(c.anchor) && <span className="pcm-list__tag">Not on screen</span>}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
        <p className="pcm-panel__hint">Click anything to comment · Esc to exit</p>
      </section>
      )}
    </div>,
    document.body,
  )
}

interface ComposerProps {
  placeholder: string
  submitLabel: string
  onSubmit: (text: string, author: string, website: string) => Promise<void>
  onCancel?: () => void
}

function Composer({ placeholder, submitLabel, onSubmit, onCancel }: ComposerProps) {
  const [author, setAuthor] = useState(readAuthor)
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const needsName = !readAuthor()
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!needsName) textRef.current?.focus()
  }, [needsName])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !author.trim() || busy) return
    setBusy(true)
    setErr(null)
    try {
      saveAuthor(author.trim())
      await onSubmit(text.trim(), author.trim(), website)
      setText('')
    } catch (e2) {
      setErr((e2 as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pcm-composer" onSubmit={submit}>
      {needsName && (
        <input
          className="pcm-input"
          placeholder="Your name"
          aria-label="Your name"
          value={author}
          maxLength={60}
          autoFocus
          onChange={(e) => setAuthor(e.target.value)}
        />
      )}
      {/* Honeypot: hidden from people, filled in by bots; the API drops anything in it. */}
      <input
        className="pcm-honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <textarea
        ref={textRef}
        className="pcm-input pcm-textarea"
        placeholder={placeholder}
        aria-label={placeholder}
        value={text}
        maxLength={2000}
        rows={3}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void submit(e)
        }}
      />
      {err && <p className="pcm-composer__error">{err}</p>}
      <div className="pcm-composer__actions">
        {onCancel && (
          <button type="button" className="pcm-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="pcm-btn pcm-btn--primary" disabled={busy || !text.trim() || !author.trim()}>
          {busy ? 'Posting…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default CommentLayer
