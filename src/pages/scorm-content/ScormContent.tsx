import { useState } from 'react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ContentTable from './components/ContentTable/ContentTable'
import Tabs from '@/components/Tabs/Tabs'
import './ScormContent.css'

type Tab = 'lessons' | 'scorm'

function ScormContent() {
  const [activeTab, setActiveTab] = useState<Tab>('lessons')

  return (
    <div className="your-content-layout">
      <LeftSidebar />
      <main className="your-content-main">
        <div className="your-content-header">
          <h2 className="your-content-title">Your Content</h2>
          <div className="sc-page-header-divider" />
          <Tabs
            items={[
              { key: 'lessons', label: 'Lessons' },
              { key: 'scorm', label: 'SCORM' },
            ]}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as Tab)}
            ariaLabel="Content type"
          />
        </div>
        <ContentTable variant={activeTab} />
      </main>
    </div>
  )
}

export default ScormContent
