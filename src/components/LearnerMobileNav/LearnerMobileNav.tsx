import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  SearchNormal1,
  Award,
  More,
  ShieldSecurity,
  Profile2User,
  UserSquare,
  MonitorMobbile,
  Moon,
  Logout,
  CloseCircle,
} from 'iconsax-react'
import FeedIcon from '@/components/icons/FeedIcon'
import Button from '@/components/Button/Button'
import Toggle from '@/components/Toggle/Toggle'
import ImpersonationLock from '@/impersonation/ImpersonationLock'
import { useTheme } from '@/hooks/useTheme'
import './LearnerMobileNav.css'

const BANNER_KEY = '5mins-app-banner-dismissed'

interface TabDef {
  label: string
  icon: (color: string) => ReactNode
  /** No path: the page isn't built yet, so the tab is dimmed and inert. */
  path?: string
  isActive?: (pathname: string) => boolean
}

const TABS: TabDef[] = [
  { label: 'Home', icon: (c) => <Home size={24} color={c} variant="Bold" />, path: '/for-you', isActive: (p) => p === '/for-you' },
  { label: 'Search', icon: (c) => <SearchNormal1 size={24} color={c} variant="Bold" /> },
  { label: 'Progress', icon: (c) => <Award size={24} color={c} variant="Bold" />, path: '/my-team', isActive: (p) => p.startsWith('/my-team') },
  { label: 'Feed', icon: (c) => <FeedIcon size={24} color={c} /> },
]

/* Mobile web chrome for the learner web app (under 600px): the "open the app" banner,
   the bottom tab bar and its More menu. Replaces the top nav and side panel, which
   MyTeam.css hides at that width. Tab bar spec: navigation.md "Bottom tab bar". */
function LearnerMobileNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isDark, toggle } = useTheme()
  const [moreOpen, setMoreOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(() => {
    try {
      return sessionStorage.getItem(BANNER_KEY) !== '1'
    } catch {
      return true
    }
  })
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moreOpen) return
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  const go = (path: string) => {
    setMoreOpen(false)
    navigate(path)
  }

  const dismissBanner = () => {
    setBannerOpen(false)
    try {
      sessionStorage.setItem(BANNER_KEY, '1')
    } catch {
      /* storage unavailable: the banner stays dismissed until the page changes */
    }
  }

  const menuIcon = (Icon: typeof Home, color = 'var(--text-primary)') => <Icon size={24} color={color} variant="Bold" />

  return (
    <div className="lmn">
      {bannerOpen && (
        <div className="lmn-banner">
          <button type="button" className="lmn-banner__close" aria-label="Dismiss" onClick={dismissBanner}>
            <CloseCircle size={20} color="currentColor" variant="Linear" />
          </button>
          <p className="lmn-banner__text">Get the full experience on the app</p>
          <Button size="sm" onClick={() => navigate('/mobile')}>
            Open
          </Button>
        </div>
      )}

      <nav className="lmn-tabs" aria-label="Main">
        {TABS.map((tab) => {
          const selected = !!tab.isActive?.(pathname)
          const color = selected ? 'var(--brand-selected, var(--selected))' : 'var(--brand-nav, var(--text-secondary))'
          return (
            <button
              key={tab.label}
              type="button"
              className={`lmn-tab${selected ? ' lmn-tab--selected' : ''}${tab.path ? '' : ' ui-disabled'}`}
              aria-current={selected ? 'page' : undefined}
              disabled={!tab.path}
              onClick={tab.path ? () => go(tab.path!) : undefined}
            >
              {tab.icon(color)}
              <span className="lmn-tab__label">{tab.label}</span>
            </button>
          )
        })}

        <div className="lmn-more" ref={moreRef}>
          {moreOpen && (
            <div className="profile-menu lmn-more__menu" role="menu">
              <ImpersonationLock action="open Admin" position="Top">
                {(locked) => (
                  <button
                    type="button"
                    role="menuitem"
                    className="profile-menu__item"
                    aria-disabled={locked || undefined}
                    onClick={() => go('/content-library')}
                  >
                    {menuIcon(ShieldSecurity, locked ? 'var(--text-disabled)' : undefined)}
                    <span>Admin</span>
                  </button>
                )}
              </ImpersonationLock>
              <button type="button" role="menuitem" className="profile-menu__item" onClick={() => go('/workspace')}>
                {menuIcon(Profile2User)}
                <span>Your Workspace</span>
              </button>
              <button type="button" role="menuitem" className="profile-menu__item" onClick={() => go('/profile')}>
                {menuIcon(UserSquare)}
                <span>Profile</span>
              </button>
              <button type="button" role="menuitem" className="profile-menu__item ui-disabled" disabled>
                {menuIcon(MonitorMobbile)}
                <span>Knowledge Hub</span>
              </button>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={isDark}
                className="profile-menu__item profile-menu__item--toggle"
                onClick={toggle}
              >
                {menuIcon(Moon)}
                <span className="profile-menu__item-label">Dark Mode</span>
                <span className="profile-menu__toggle" aria-hidden="true">
                  <Toggle size="sm" checked={isDark} readOnly tabIndex={-1} />
                </span>
              </button>
              <button type="button" role="menuitem" className="profile-menu__item" onClick={() => go('/onboarding')}>
                {menuIcon(Logout)}
                <span>Log Out</span>
              </button>
            </div>
          )}
          <button
            type="button"
            className="lmn-tab"
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
          >
            <More size={24} color="var(--brand-nav, var(--text-secondary))" variant="Linear" />
            <span className="lmn-tab__label">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default LearnerMobileNav
