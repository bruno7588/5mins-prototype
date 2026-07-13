import type { ReactNode } from 'react'
import { Home, SearchNormal1, Award, UserSquare } from 'iconsax-react'
import FeedIcon from '@/components/icons/FeedIcon'
import './TabNav.css'

export type MobileTab = 'home' | 'search' | 'progress' | 'feed' | 'profile'

export interface MobileTabNavProps {
  active?: MobileTab
  onNavigate?: (tab: MobileTab) => void
}

const TABS: { id: MobileTab; label: string; icon: (color: string) => ReactNode }[] = [
  { id: 'home', label: 'Home', icon: (color) => <Home size={24} color={color} variant="Bold" /> },
  { id: 'search', label: 'Search', icon: (color) => <SearchNormal1 size={24} color={color} variant="Bold" /> },
  { id: 'progress', label: 'Progress', icon: (color) => <Award size={24} color={color} variant="Bold" /> },
  { id: 'feed', label: 'Feed', icon: (color) => <FeedIcon size={24} color={color} /> },
  { id: 'profile', label: 'Profile', icon: (color) => <UserSquare size={24} color={color} variant="Bold" /> },
]

function MobileTabNav({ active, onNavigate }: MobileTabNavProps) {
  return (
    <nav className="m-tabnav" aria-label="Main">
      {TABS.map((tab) => {
        const selected = tab.id === active
        const color = selected ? 'var(--selected)' : 'var(--text-secondary)'
        return (
          <button
            key={tab.id}
            type="button"
            className={`m-tabnav__item${selected ? ' m-tabnav__item--selected' : ''}`}
            aria-current={selected ? 'page' : undefined}
            onClick={() => onNavigate?.(tab.id)}
          >
            {tab.icon(color)}
            <span className="m-tabnav__label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default MobileTabNav
