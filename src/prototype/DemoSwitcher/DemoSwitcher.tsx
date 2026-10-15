import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowUp2, Category, Edit2, Magicpen, MessageAdd1, Mobile, Monitor } from 'iconsax-react'
import CommentLayer from '../Comments/CommentLayer'
import { useComments } from '../Comments/useComments'
import './DemoSwitcher.css'

/* Prototype chrome, not product UI: one segmented switcher for the demo surfaces
   (Desktop opens Web App / Admin, Mobile opens the native app), Comment mode for anyone
   with the link and, locally, the Playground labs menu and Design Inspect toggle. Ships to Vercel too, so shared
   demo links can switch and comment. shadcn-style in plain CSS, off the 5Mins brand.
   Prefix: demosw- */

// Learner routes render outside the admin layout (see App.tsx).
const WEB_ROUTES = /^\/(workspace|for-you|my-team|programs\/[^/]+$|courses\/|events)/

const DESKTOP_DEMOS = [
  { id: 'web', label: 'Web App', path: '/workspace' },
  { id: 'admin', label: 'Admin', path: '/content-library' },
] as const

// Sandbox pages for trying ideas before they reach the product. Add a lab here.
const LABS = [
  { id: 'quiz', label: 'Quiz Lab', path: '/quiz-lab' },
  { id: 'chart', label: 'Chart Lab', path: '/chart-lab' },
  { id: 'new', label: 'New Lab', path: '/new-lab' },
] as const

// Design Inspect (src/dev/DesignInspect) listens for this and sets html.di-active.
const TOGGLE_INSPECT = 'design-inspect:toggle'

function DemoSwitcher() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  // ?comment=<id> (the Slack "Open in prototype" link) opens comment mode on that thread.
  const linkedComment = new URLSearchParams(search).get('comment')
  // Desktop and Playground share one menu slot, so only one is open at a time.
  const [openMenu, setOpenMenu] = useState<'desktop' | 'playground' | null>(null)
  const menuOpen = openMenu !== null
  const [inspecting, setInspecting] = useState(false)
  const [commenting, setCommenting] = useState(!!linkedComment)
  // The comments list is opt-in (the arrow beside Comment), so it doesn't cover the page.
  const [listOpen, setListOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { comments, error, add, setResolved, remove } = useComments(pathname, true)
  const openCount = comments.filter((c) => !c.parentId && !c.resolved).length
  const exitComments = useCallback(() => setCommenting(false), [])

  const onMobile = pathname.startsWith('/mobile')
  const currentLab = LABS.find((l) => l.path === pathname)
  const desktopDemo = WEB_ROUTES.test(pathname) ? 'web' : 'admin'
  const menuItems = openMenu === 'playground'
    ? LABS.map((l) => ({ ...l, current: l === currentLab }))
    : DESKTOP_DEMOS.map((d) => ({ ...d, current: !onMobile && !currentLab && d.id === desktopDemo }))

  // Edit and Comment both take over clicks on the page, so only one runs at a time.
  useEffect(() => {
    if (inspecting) setCommenting(false)
  }, [inspecting])

  useEffect(() => {
    if (!commenting) setListOpen(false)
  }, [commenting])

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Mirror Inspect's state, however it was toggled (this button, Alt+I or Esc).
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const html = document.documentElement
    const sync = () => setInspecting(html.classList.contains('di-active'))
    const observer = new MutationObserver(sync)
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rootRef} className="demosw-root" data-inspect-ignore>
      {menuOpen && (
        <div className="demosw-menu" role="menu" aria-label={openMenu === 'playground' ? 'Playground labs' : 'Desktop demos'}>
          {menuItems.map((d) => {
            const current = d.current
            return (
              <button
                key={d.id}
                type="button"
                role="menuitem"
                className="demosw-menu__item"
                aria-current={current ? 'page' : undefined}
                onClick={() => {
                  setOpenMenu(null)
                  navigate(d.path)
                }}
              >
                {d.label}
                {current && (
                  <svg className="demosw-menu__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className={`demosw-bar${menuOpen ? ' demosw-bar--expanded' : ''}`} role="toolbar" aria-label="Prototype demos">
        <button
          type="button"
          className={`demosw-seg${!onMobile && !currentLab ? ' demosw-seg--active' : ''}`}
          aria-label="Desktop: Web App or Admin"
          data-tip="Desktop"
          aria-haspopup="menu"
          aria-expanded={openMenu === 'desktop'}
          onClick={() => setOpenMenu((m) => (m === 'desktop' ? null : 'desktop'))}
        >
          <Monitor size={20} color="currentColor" variant="Linear" />
        </button>
        <button
          type="button"
          className={`demosw-seg${onMobile ? ' demosw-seg--active' : ''}`}
          aria-label="Native App"
          data-tip="Native App"
          aria-current={onMobile ? 'page' : undefined}
          onClick={() => {
            setOpenMenu(null)
            navigate('/mobile')
          }}
        >
          {/* iconsax 0.0.8 draws this glyph off-centre (x 1-17, y 1-21 of 24); the class re-centres it. */}
          <Mobile size={20} color="currentColor" variant="Linear" className="demosw-icon-mobile" />
        </button>
        <button
          type="button"
          className={`demosw-seg${commenting ? ' demosw-seg--active' : ''}`}
          aria-label={openCount ? `Comment (${openCount} open)` : 'Comment'}
          data-tip={commenting ? 'Commenting · Esc to exit' : 'Add a comment'}
          aria-pressed={commenting}
          onClick={() => {
            setOpenMenu(null)
            if (!commenting && inspecting) window.dispatchEvent(new Event(TOGGLE_INSPECT))
            setCommenting((c) => !c)
          }}
        >
          <MessageAdd1 size={20} color="currentColor" variant="Linear" />
          {openCount > 0 && <span className="demosw-badge" aria-hidden="true">{openCount}</span>}
        </button>
        <button
          type="button"
          className={`demosw-seg demosw-seg--arrow${listOpen ? ' demosw-seg--active' : ''}`}
          aria-label={listOpen ? 'Hide comments' : 'Show comments'}
          data-tip={listOpen ? 'Hide comments' : 'Show comments'}
          aria-expanded={listOpen}
          onClick={() => {
            setOpenMenu(null)
            if (!commenting && inspecting) window.dispatchEvent(new Event(TOGGLE_INSPECT))
            setCommenting(true)
            setListOpen((o) => !o)
          }}
        >
          <ArrowUp2 size={16} color="currentColor" variant="Linear" />
        </button>
        {/* Playground and Edit are local-only: shared Vercel links get Desktop, Native App and Comment. */}
        {import.meta.env.DEV && (
          <button
            type="button"
            className={`demosw-seg${currentLab ? ' demosw-seg--active' : ''}`}
            aria-label="Playground: labs"
            data-tip="Playground"
            aria-haspopup="menu"
            aria-expanded={openMenu === 'playground'}
            onClick={() => setOpenMenu((m) => (m === 'playground' ? null : 'playground'))}
          >
            <Magicpen size={20} color="currentColor" variant="Linear" />
          </button>
        )}
        {import.meta.env.DEV && (
          <button
            type="button"
            className={`demosw-seg${inspecting ? ' demosw-seg--active' : ''}`}
            aria-label="Edit (Alt+I)"
            data-tip={inspecting ? 'Editing · Esc to exit' : 'Edit (Alt+I)'}
            aria-pressed={inspecting}
            onClick={() => {
              setOpenMenu(null)
              window.dispatchEvent(new Event(TOGGLE_INSPECT))
            }}
          >
            <Edit2 size={20} color="currentColor" variant="Linear" />
          </button>
        )}
        {/* Collapsed face: hover or focus opens the bar (see DemoSwitcher.css). */}
        <span className="demosw-launcher" aria-hidden="true">
          <Category size={20} color="currentColor" variant="Linear" />
        </span>
      </div>

      <CommentLayer
        active={commenting}
        showList={listOpen}
        onCloseList={() => setListOpen(false)}
        comments={comments}
        error={error}
        onAdd={add}
        onResolve={setResolved}
        onDelete={remove}
        onExit={exitComments}
        currentRoute={pathname}
        onGoTo={(c) => navigate(`${c.route}?comment=${c.id}`)}
        focusId={linkedComment}
      />
    </div>
  )
}

export default DemoSwitcher
