import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
import MobileTopNav from '@/components/mobile/TopNav/TopNav'
import MobileTabNav, { type MobileTab } from '@/components/mobile/TabNav/TabNav'

/**
 * Mobile app prototype shell (Figma scaffold 7632:8501) — the app chrome inside
 * the phone frame with an empty content area. Tab screens get filled in as the
 * mobile pages are built.
 */
function MobileApp() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<MobileTab>('home')
  const [homeChip, setHomeChip] = useState('For You')
  const [progressChip, setProgressChip] = useState('My Team')

  const header = (() => {
    switch (tab) {
      case 'home':
        return (
          <MobileTopNav
            variant="home"
            notificationDot
            chips={[
              { label: 'For You', active: homeChip === 'For You', onClick: () => setHomeChip('For You') },
              {
                label: 'Your Workspace',
                active: homeChip === 'Your Workspace',
                onClick: () => setHomeChip('Your Workspace'),
              },
            ]}
          />
        )
      case 'search':
        return <MobileTopNav variant="search" />
      case 'progress':
        return (
          <MobileTopNav
            variant="chips"
            chips={[
              { label: 'My Team', active: progressChip === 'My Team', onClick: () => setProgressChip('My Team') },
              {
                label: 'My Progress',
                active: progressChip === 'My Progress',
                onClick: () => setProgressChip('My Progress'),
              },
            ]}
          />
        )
      case 'feed':
        return <MobileTopNav variant="title" title="Feed" />
      case 'profile':
        return <MobileTopNav variant="profile" name="Anthony Wallace" role="Customer Support Specialist" />
    }
  })()

  return (
    <PhoneFrame
      header={header}
      footer={<MobileTabNav active={tab} onNavigate={setTab} />}
      onExit={() => navigate('/content-library')}
    >
      {/* Empty content area, per the Figma scaffold — screens land here next. */}
    </PhoneFrame>
  )
}

export default MobileApp
