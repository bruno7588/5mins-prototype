import type { ReactNode } from 'react'
import { Home, SearchNormal1, Award, Medal } from 'iconsax-react'
import FeedIcon from '@/components/icons/FeedIcon'
import './TabNav.css'

/* My Team and My Learning are tabs of their own (DES-369), with the web side panel's icons.
   Settings is not a tab: the My Learning header carries a Saved icon and a gear. */
export type MobileTab = 'home' | 'search' | 'team' | 'learning' | 'feed'

export interface MobileTabNavProps {
  active?: MobileTab
  onNavigate?: (tab: MobileTab) => void
}

/* Order matches the Library Tab nav (1324:35285): Home, Search, My Learning, My Team, Feed.
   Icons are decorative (aria-hidden): each tab's accessible name is its visible label. */
const TABS: { id: MobileTab; label: string; icon: (color: string) => ReactNode }[] = [
  { id: 'home', label: 'Home', icon: (color) => <Home size={24} color={color} variant="Bold" aria-hidden="true" /> },
  { id: 'search', label: 'Search', icon: (color) => <SearchNormal1 size={24} color={color} variant="Bold" aria-hidden="true" /> },
  { id: 'learning', label: 'My Learning', icon: (color) => <Medal size={24} color={color} variant="Bold" aria-hidden="true" /> },
  { id: 'team', label: 'My Team', icon: (color) => <Award size={24} color={color} variant="Bold" aria-hidden="true" /> },
  { id: 'feed', label: 'Feed', icon: (color) => <FeedIcon size={24} color={color} /> },
]

/* A navigation landmark holding a list, so screen readers and agents read
   "Main navigation, list, 5 items" and the current tab via aria-current. */
function MobileTabNav({ active, onNavigate }: MobileTabNavProps) {
  return (
    <nav className="m-tabnav" aria-label="Main">
      <ul className="m-tabnav__list">
        {TABS.map((tab) => {
          const selected = tab.id === active
          const color = selected ? 'var(--selected)' : 'var(--text-secondary)'
          return (
            <li key={tab.id} className="m-tabnav__cell">
              <button
                type="button"
                className={`m-tabnav__item${selected ? ' m-tabnav__item--selected' : ''}`}
                aria-current={selected ? 'page' : undefined}
                onClick={() => onNavigate?.(tab.id)}
              >
                {tab.icon(color)}
                <span className="m-tabnav__label">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default MobileTabNav
