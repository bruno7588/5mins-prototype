import type { ReactNode } from 'react'
import { ArrowLeft, Add, FlashCircle, Notification, More, Setting2, SearchNormal1 } from 'iconsax-react'
import { getProgressIllustration } from '@/assets/progress-illustrations'
import './TopNav.css'

export interface MobileTopNavChip {
  label: string
  active?: boolean
  onClick?: () => void
}

export interface MobileTopNavProps {
  /** Figma "Page" variants of Top nav/ App */
  variant: 'home' | 'search' | 'chips' | 'title' | 'detail' | 'skill' | 'lesson-feed' | 'profile'
  /** home + chips variants */
  chips?: MobileTopNavChip[]
  /** home: red dot on the bell */
  notificationDot?: boolean
  onStreakClick?: () => void
  onNotificationsClick?: () => void
  /** search variant */
  searchPlaceholder?: string
  onSearchClick?: () => void
  /** title / detail / skill variants */
  title?: string
  /** skill variant: 24px illustration url (e.g. getSkillIllustrationByName) */
  skillIcon?: string
  onBack?: () => void
  onMore?: () => void
  /** lesson-feed variant */
  pointsLabel?: string
  /** profile variant */
  name?: string
  role?: string
  avatar?: string
  onEditProfile?: () => void
  onAdd?: () => void
  /** hide the fake iOS status bar (default shown; lesson-feed renders it transparent) */
  hideStatusBar?: boolean
}

function StatusBar({ transparent }: { transparent?: boolean }) {
  return (
    <div className={`m-topnav__statusbar${transparent ? ' m-topnav__statusbar--transparent' : ''}`} aria-hidden="true">
      <span className="m-topnav__clock">9:41</span>
      <span className="m-topnav__statusicons">
        <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor" aria-hidden="true">
          <rect x="0" y="6" width="3" height="4" rx="0.8" />
          <rect x="5" y="4" width="3" height="6" rx="0.8" />
          <rect x="10" y="2" width="3" height="8" rx="0.8" />
          <rect x="15" y="0" width="3" height="10" rx="0.8" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
          <path d="M8 9.5a1.7 1.7 0 1 1 0 2.5 1.7 1.7 0 0 1 0-2.5zM8 5.6c1.7 0 3.2.7 4.3 1.8l-1.5 1.5A4 4 0 0 0 8 7.7a4 4 0 0 0-2.8 1.2L3.7 7.4A6 6 0 0 1 8 5.6zM8 1.5A10 10 0 0 1 15.1 4.4l-1.5 1.5A8 8 0 0 0 8 3.6a8 8 0 0 0-5.6 2.3L.9 4.4A10 10 0 0 1 8 1.5z" />
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" aria-hidden="true">
          <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" fill="none" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor" />
          <path d="M22 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  )
}

function BackButton({ onBack, scrim }: { onBack?: () => void; scrim?: boolean }) {
  return (
    <button
      type="button"
      className={`m-topnav__back${scrim ? ' m-topnav__back--scrim' : ''}`}
      aria-label="Back"
      onClick={onBack}
    >
      <ArrowLeft size={24} color={scrim ? 'var(--neutral-25)' : 'var(--text-primary)'} variant="Linear" />
    </button>
  )
}

function Chips({ chips }: { chips: MobileTopNavChip[] }) {
  return (
    <div className="m-topnav__chips">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          className={`m-topnav__chip${chip.active ? ' m-topnav__chip--active' : ''}`}
          aria-pressed={chip.active}
          onClick={chip.onClick}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}

function MobileTopNav({
  variant,
  chips = [],
  notificationDot = false,
  onStreakClick,
  onNotificationsClick,
  searchPlaceholder = 'Search',
  onSearchClick,
  title,
  skillIcon,
  onBack,
  onMore,
  pointsLabel,
  name,
  role,
  avatar,
  onEditProfile,
  onAdd,
  hideStatusBar = false,
}: MobileTopNavProps) {
  const transparent = variant === 'lesson-feed'

  let header: ReactNode
  switch (variant) {
    case 'home':
      header = (
        <>
          <Chips chips={chips} />
          <div className="m-topnav__actions">
            <button type="button" className="m-topnav__iconbtn" aria-label="Streak" onClick={onStreakClick}>
              <FlashCircle size={28} color="var(--text-primary)" variant="Bold" />
            </button>
            <button type="button" className="m-topnav__iconbtn" aria-label="Notifications" onClick={onNotificationsClick}>
              <Notification size={28} color="var(--text-primary)" variant="Bold" />
              {notificationDot ? <span className="m-topnav__dot" /> : null}
            </button>
          </div>
        </>
      )
      break
    case 'chips':
      header = <Chips chips={chips} />
      break
    case 'search':
      header = (
        <button type="button" className="m-topnav__search" onClick={onSearchClick}>
          <SearchNormal1 size={18} color="var(--text-tertiary)" variant="Linear" />
          <span>{searchPlaceholder}</span>
        </button>
      )
      break
    case 'title':
      header = <h1 className="m-topnav__title">{title}</h1>
      break
    case 'detail':
      header = (
        <>
          <BackButton onBack={onBack} />
          <div className="m-topnav__titlewrap">
            <h1 className="m-topnav__title">{title}</h1>
          </div>
          <span className="m-topnav__spacer" aria-hidden="true" />
        </>
      )
      break
    case 'skill':
      header = (
        <>
          <BackButton onBack={onBack} />
          <div className="m-topnav__titlewrap m-topnav__titlewrap--icon">
            {skillIcon ? <img src={skillIcon} alt="" width={24} height={24} /> : null}
            <h1 className="m-topnav__title m-topnav__title--s">{title}</h1>
          </div>
          <button type="button" className="m-topnav__iconbtn" aria-label="More options" onClick={onMore}>
            <More size={24} color="var(--text-primary)" variant="Linear" style={{ transform: 'rotate(90deg)' }} />
          </button>
        </>
      )
      break
    case 'lesson-feed':
      header = (
        <>
          <BackButton onBack={onBack} scrim />
          <span className="m-topnav__points">
            {pointsLabel}
            <img src={getProgressIllustration('points')} alt="" width={16} height={16} />
          </span>
        </>
      )
      break
    case 'profile':
      header = (
        <>
          <div className="m-topnav__profile">
            <span className="m-topnav__avatarwrap">
              <span
                className="m-topnav__avatar"
                style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
              />
              <button type="button" className="m-topnav__editbadge" aria-label="Profile settings" onClick={onEditProfile}>
                <Setting2 size={9} color="var(--text-primary)" variant="Linear" />
              </button>
            </span>
            <span className="m-topnav__identity">
              <span className="m-topnav__name">{name}</span>
              <span className="m-topnav__role">{role}</span>
            </span>
          </div>
          <button type="button" className="m-topnav__fab" aria-label="Add" onClick={onAdd}>
            <Add size={24} color="var(--neutral-0)" variant="Linear" />
          </button>
        </>
      )
      break
  }

  const headerClass = [
    'm-topnav__header',
    `m-topnav__header--${variant}`,
    transparent ? 'm-topnav__header--transparent' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={`m-topnav${transparent ? ' m-topnav--overlay' : ''}`}>
      {!hideStatusBar ? <StatusBar transparent={transparent} /> : null}
      <div className={headerClass}>{header}</div>
    </header>
  )
}

export default MobileTopNav
