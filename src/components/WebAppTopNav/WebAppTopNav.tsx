import { Add, CalendarTick, FlashCircle, Mobile } from 'iconsax-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'
import { useHeaderTheme } from '@/data/brandTheme'
import { Logo } from '@/pages/my-team/MyTeam'
import './WebAppTopNav.css'

/* The learner (Web app) top nav, Library Top Nav/Admin {System=Web app, Breakpoint=large}
   5385:20145: logo, Get App, Create, Spark and Events. Below 600px the pages swap it
   for LearnerMobileNav. Prefix: mt-topnav (kept from the hand-rolled copies it replaces). */

interface WebAppTopNavProps {
  /** Get App, Create, Spark and Events have no destination yet on most pages: dimmed and
      inert (.ui-disabled) unless a page opts in. */
  live?: boolean
}

function WebAppTopNav({ live = false }: WebAppTopNavProps) {
  const navigate = useNavigate()
  const headerTheme = useHeaderTheme()
  const inert = live ? {} : { className: 'ui-disabled', 'aria-disabled': true, tabIndex: -1 }

  const iconButton = (label: string, glyph: React.ReactNode, dot = false) => {
    const btn = (
      <button type="button" className={`mt-topnav__iconbtn${live ? '' : ' ui-disabled'}`} aria-label={live ? label : `${label} (coming soon)`} disabled={!live}>
        {glyph}
        {dot && <span className="mt-topnav__dot" aria-hidden="true" />}
      </button>
    )
    return live ? <Tooltip text={label} position="Bottom" alignment="End" icon={false}>{btn}</Tooltip> : btn
  }

  return (
    <header className="mt-topnav" data-theme={headerTheme}>
      <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/workspace')}>
        <Logo size={22} />
      </button>
      <div className="mt-topnav__right">
        <Button variant="text-2" icon={<Mobile size={20} color="currentColor" variant="Linear" />} {...inert}>
          Get App
        </Button>
        <Button variant="outlined-2" icon={<Add size={20} color="currentColor" variant="Linear" />} {...inert}>
          Create
        </Button>
        <div className="mt-topnav__icons">
          {iconButton('Spark', <FlashCircle size={24} color="var(--text-primary)" variant="Bold" />)}
          {iconButton('Events', <CalendarTick size={24} color="var(--text-primary)" variant="Bold" />, true)}
        </div>
      </div>
    </header>
  )
}

export default WebAppTopNav
