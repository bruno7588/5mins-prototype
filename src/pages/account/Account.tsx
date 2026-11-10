import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar'
import Tabs from '@/components/Tabs/Tabs'
import AuditLog from './components/AuditLog/AuditLog'
import LayoutSettings from './components/LayoutSettings/LayoutSettings'
import ExternalTraining from './components/ExternalTraining/ExternalTraining'
import { isFullAdmin } from '@/data/externalTraining'
import './Account.css'

type TabKey =
  | 'layout'
  | 'audit-log'
  | 'external-training'
  | 'skill-lessons'
  | 'instructor-visibility'
  | 'skill-map'
  | 'skill-name'
  | 'categories'
  | 'authentication'
  | 'hugo-ai'
  | 'content-access'

// "Audit log" sits second, right after "Layout" (per Figma).
const TABS: { key: TabKey; label: string }[] = [
  { key: 'layout', label: 'Layout' },
  { key: 'audit-log', label: 'Audit Log' },
  // DES-336: the approved list. Full admins only (D21).
  ...(isFullAdmin() ? [{ key: 'external-training' as const, label: 'External Training' }] : []),
  { key: 'skill-lessons', label: 'Skill Lessons Visibility' },
  { key: 'instructor-visibility', label: 'Instructor Visibility' },
  { key: 'skill-map', label: 'Skill Map' },
  { key: 'skill-name', label: 'Skill Name' },
  { key: 'categories', label: 'Categories' },
  { key: 'authentication', label: 'Authentication' },
  { key: 'hugo-ai', label: 'Hugo AI' },
  { key: 'content-access', label: 'Content Access' },
]

function Account() {
  // Deep link support: /account?tab=audit-log&course=<id> (from the Settings-history
  // button). The course id pre-selects the Target + Course settings filters.
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as TabKey | null
  const courseParam = searchParams.get('course') ?? undefined
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabParam && TABS.some((t) => t.key === tabParam) ? tabParam : 'layout',
  )

  return (
    <div className="acs-layout">
      <LeftSidebar />
      <main className="acs-main">
        <header className="acs-header">
          <h2 className="acs-title">Account &amp; Settings</h2>
          <div className="acs-divider" aria-hidden="true" />
          <Tabs
            items={TABS}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as TabKey)}
            ariaLabel="Settings sections"
            className="acs-tabs"
          />
        </header>

        <div className="acs-body">
          {activeTab === 'audit-log' ? (
            <AuditLog initialCourseId={courseParam} />
          ) : activeTab === 'layout' ? (
            <LayoutSettings />
          ) : activeTab === 'external-training' ? (
            <ExternalTraining />
          ) : (
            <div className="acs-placeholder">
              This section isn’t part of this prototype yet.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Account
