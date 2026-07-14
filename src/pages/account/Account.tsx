import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar'
import AuditLog from './components/AuditLog/AuditLog'
import './Account.css'

type TabKey =
  | 'layout'
  | 'audit-log'
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
  // Deep link support: /account?tab=audit-log&course=<id> (from the Settings-history button).
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as TabKey | null
  const initialCourseId = searchParams.get('course') ?? undefined
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabParam && TABS.some((t) => t.key === tabParam) ? tabParam : 'audit-log',
  )

  return (
    <div className="acs-layout">
      <LeftSidebar />
      <main className="acs-main">
        <header className="acs-header">
          <h1 className="acs-title">Account &amp; Settings</h1>
          <div className="acs-divider" aria-hidden="true" />
          <div className="acs-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`acs-tab${activeTab === tab.key ? ' acs-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="acs-body">
          {activeTab === 'audit-log' ? (
            <AuditLog initialCourseId={initialCourseId} />
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
