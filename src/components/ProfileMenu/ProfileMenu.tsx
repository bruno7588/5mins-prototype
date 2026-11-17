import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, User, Save2, Setting2, Logout } from 'iconsax-react'
import Toggle from '../Toggle/Toggle'
import Tooltip from '../Tooltip/Tooltip'
import { useTheme } from '../../hooks/useTheme'
import { useImpersonation } from '@/impersonation/ImpersonationContext'
import './ProfileMenu.css'

interface ProfileMenuProps {
  name?: string
  email?: string
}

/* Under 1200px the sidebar is an icon rail and the card is only its gear (MyTeam.css). */
const RAIL = '(max-width: 1199px)'
const subscribeRail = (onChange: () => void) => {
  const mq = window.matchMedia(RAIL)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
const isRail = () => window.matchMedia(RAIL).matches

/**
 * Learner-sidebar profile card. Hovers to `--input-background-hover` and opens
 * a small menu: Saved (DES-368), Edit Profile, Dark Mode and Log out (which restarts
 * the onboarding flow). While impersonating, it names the impersonated person with
 * the same name and role the People table and the banner show.
 */
export default function ProfileMenu({
  name = 'Anthonny Wallace',
  email = 'anthonny@email.com',
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isDark, toggle } = useTheme()
  const { person } = useImpersonation()
  const rail = useSyncExternalStore(subscribeRail, isRail)
  const displayName = person ? person.name : name
  const secondary = person ? person.role : email

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="mt-side__profile-wrap" ref={ref}>
      {open && (
        <div className="profile-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className="profile-menu__item"
            onClick={() => {
              setOpen(false)
              navigate('/saved')
            }}
          >
            <Save2 size={20} color="var(--text-primary)" variant="Linear" />
            <span>Saved</span>
          </button>
          {/* There is no edit screen yet: this opens the learner's own profile, where
              the Edit Profile button sits. */}
          <button
            type="button"
            role="menuitem"
            className="profile-menu__item"
            onClick={() => {
              setOpen(false)
              navigate('/my-progress/profile')
            }}
          >
            <User size={20} color="var(--text-primary)" variant="Linear" />
            <span>Edit Profile</span>
          </button>
          {/* Toggling the theme keeps the menu open (checkbox-row behaviour). */}
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={isDark}
            className="profile-menu__item profile-menu__item--toggle"
            onClick={toggle}
          >
            <Moon size={20} color="var(--text-primary)" variant="Linear" />
            <span className="profile-menu__item-label">Dark Mode</span>
            <span className="profile-menu__toggle" aria-hidden="true">
              <Toggle size="sm" checked={isDark} readOnly tabIndex={-1} />
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="profile-menu__item"
            onClick={() => {
              setOpen(false)
              navigate('/onboarding')
            }}
          >
            <Logout size={20} color="var(--text-primary)" variant="Linear" />
            <span>Log out</span>
          </button>
        </div>
      )}
      {/* On the icon rail the card is an icon-only control, so it gets the DS Tooltip. */}
      <Tooltip text="Account menu" position="Right" icon={false} disabled={!rail || open} className="profile-menu__tip">
        <button
          type="button"
          className="mt-side__profile"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <div className="mt-side__profile-info">
            <p className="mt-side__profile-name">{displayName}</p>
            <p className="mt-side__profile-email">{secondary}</p>
          </div>
          <Setting2 size={20} color="var(--text-secondary)" variant="Linear" />
        </button>
      </Tooltip>
    </div>
  )
}
