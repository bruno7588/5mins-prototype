import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Setting2, Logout, Mobile } from 'iconsax-react'
import Toggle from '../Toggle/Toggle'
import { useTheme } from '../../hooks/useTheme'
import './ProfileMenu.css'

interface ProfileMenuProps {
  name?: string
  email?: string
}

/**
 * Learner-sidebar profile card. Hovers to `--input-background-hover` and opens
 * a small menu (currently just "Log out", which restarts the onboarding flow).
 */
export default function ProfileMenu({
  name = 'Anthonny Wallace',
  email = 'anthonny@email.com',
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isDark, toggle } = useTheme()

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
          {/* Same escape hatch as the admin TopNav menu — opens the phone-frame prototype. */}
          <button
            type="button"
            role="menuitem"
            className="profile-menu__item"
            onClick={() => {
              setOpen(false)
              navigate('/mobile')
            }}
          >
            <Mobile size={20} color="var(--text-primary)" variant="Linear" />
            <span>Mobile App</span>
          </button>
        </div>
      )}
      <button
        type="button"
        className="mt-side__profile"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="mt-side__profile-info">
          <p className="mt-side__profile-name">{name}</p>
          <p className="mt-side__profile-email">{email}</p>
        </div>
        <Setting2 size={16} color="var(--text-secondary)" variant="Linear" />
      </button>
    </div>
  )
}
