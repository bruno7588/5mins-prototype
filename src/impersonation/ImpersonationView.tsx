import { useEffect, useRef, useState } from 'react'
import { Profile, Lock } from 'iconsax-react'
import { useImpersonation } from './ImpersonationContext'
import './ImpersonationView.css'

/* A stand-in learner home. In the real product this is the learner app driven by
   the impersonated identity; here it's a faithful, self-contained mirror of the PM
   prototype so the bar, blocked actions and audit trail have a surface to act on. */
const CONTINUE = [
  { title: 'Guest Service Excellence', meta: '3 of 5 lessons', pct: 60, thumb: '🛎️', from: '#6c5ce7', to: '#a29bfe' },
  { title: 'Food & Beverage Basics', meta: '1 of 4 lessons', pct: 25, thumb: '🍷', from: '#00b894', to: '#55efc4' },
  { title: 'Workplace Safety', meta: '4 of 4 lessons', pct: 100, thumb: '🛡️', from: '#0984e3', to: '#74b9ff' },
]

const ASSIGNED = [
  { title: 'Fire Safety Compliance 2026', meta: 'Mandatory · 3 lessons', due: 'Due in 2 days', urgent: true, badge: '📋', color: '#e17055' },
  { title: 'Handling Difficult Guests', meta: 'Recommended · 4 lessons', due: 'No due date', urgent: false, badge: '🤝', color: '#6c5ce7' },
  { title: 'Data Protection Essentials', meta: 'Mandatory · 2 lessons', due: 'Due in 5 days', urgent: true, badge: '🔐', color: '#00b894' },
]

/* Sensitive actions the shared auth layer blocks server-side (email, role,
   notifications) plus change-password, which is hidden rather than blocked
   because it runs client-side and can't be guarded (DEV-4736). Here they all read
   the same: locked, and any attempt is recorded + toasted. */
const BLOCKED = [
  { key: 'account settings', label: 'Account settings' },
  { key: 'notification preferences', label: 'Notification preferences' },
  { key: 'password', label: 'Change password' },
]

function ImpersonationView() {
  const { person, logActivity, logBlocked } = useImpersonation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (!menuWrapRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  if (!person) return null
  const first = person.name.split(' ')[0]

  const avatar = (size: number, fontSize: number) => (
    <span
      className="imp-view__avatar"
      style={{ width: size, height: size, flex: `0 0 ${size}px`, fontSize, background: person.color }}
    >
      {person.avatarImg ? <img src={person.avatarImg} alt="" /> : person.initials}
    </span>
  )

  return (
    <div className="imp-view">
      <div className="imp-view__top">
        <div className="imp-view__brand">
          <span className="imp-view__logo">5</span> 5Mins
        </div>
        <nav className="imp-view__nav">
          <span className="is-on">Home</span>
          <span>My Learning</span>
          <span>Explore</span>
          <span>Skills</span>
        </nav>
        <div className="imp-view__avatar-wrap" ref={menuWrapRef}>
          <button
            type="button"
            className="imp-view__avatar-btn"
            aria-label="Profile"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {avatar(30, 11)}
          </button>
          {menuOpen && (
            <div className="imp-view__menu" role="menu">
              <div className="imp-view__menu-head">Signed in as {person.name}</div>
              <button type="button" role="menuitem" className="imp-view__menu-item" onClick={() => setMenuOpen(false)}>
                <Profile size={18} color="currentColor" variant="Linear" />
                View profile
              </button>
              <div className="imp-view__menu-sep" role="separator" />
              {BLOCKED.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  role="menuitem"
                  className="imp-view__menu-item imp-view__menu-item--blocked"
                  onClick={() => {
                    logBlocked(b.key)
                    setMenuOpen(false)
                  }}
                >
                  <Lock size={18} color="currentColor" variant="Linear" />
                  {b.label}
                  <span className="imp-view__menu-tag">blocked</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="imp-view__wrap">
        <div className="imp-view__greet">Good afternoon, {first} 👋</div>
        <div className="imp-view__greet-sub">You're seeing exactly what this learner sees right now.</div>

        <div className="imp-view__stats">
          <div className="imp-view__stat">
            <span className="imp-view__stat-ic" style={{ background: 'rgba(255,165,56,.16)', color: 'var(--warning-500)' }}>🔥</span>
            <div><div className="imp-view__stat-big">12</div><div className="imp-view__stat-cap">Day streak</div></div>
          </div>
          <div className="imp-view__stat">
            <span className="imp-view__stat-ic" style={{ background: 'rgba(0,206,230,.14)', color: 'var(--primary-700)' }}>⚡</span>
            <div><div className="imp-view__stat-big">2,480</div><div className="imp-view__stat-cap">Points</div></div>
          </div>
          <div className="imp-view__stat">
            <span className="imp-view__stat-ic" style={{ background: 'rgba(24,169,87,.14)', color: 'var(--success-500)' }}>✅</span>
            <div><div className="imp-view__stat-big">18</div><div className="imp-view__stat-cap">Lessons done</div></div>
          </div>
        </div>

        <div className="imp-view__sec">Continue learning <a>See all</a></div>
        <div className="imp-view__courses">
          {CONTINUE.map((c) => (
            <button
              key={c.title}
              type="button"
              className="imp-view__course"
              onClick={() => logActivity(`Opened "${c.title}"`)}
            >
              <span className="imp-view__thumb" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>{c.thumb}</span>
              <span className="imp-view__cbody">
                <span className="imp-view__ctitle">{c.title}</span>
                <span className="imp-view__cmeta">{c.meta}</span>
                <span className="imp-view__progress"><i style={{ width: `${c.pct}%` }} /></span>
              </span>
            </button>
          ))}
        </div>

        <div className="imp-view__sec">Assigned to you</div>
        <div className="imp-view__assigned">
          {ASSIGNED.map((a) => (
            <button
              key={a.title}
              type="button"
              className="imp-view__ai"
              onClick={() => logActivity(`Opened "${a.title}"`)}
            >
              <span className="imp-view__badge" style={{ background: a.color }}>{a.badge}</span>
              <span className="imp-view__ai-text">
                <span className="imp-view__ai-title">{a.title}</span>
                <span className="imp-view__cmeta">{a.meta}</span>
              </span>
              <span className={`imp-view__due${a.urgent ? ' is-urgent' : ''}`}>{a.due}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImpersonationView
