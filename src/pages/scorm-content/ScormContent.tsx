import { useState } from 'react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ContentTable from './components/ContentTable/ContentTable'
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
          <div className="content-tabs">
            <button
              className={`content-tab${activeTab === 'lessons' ? ' content-tab--active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              Lessons
            </button>
            <button
              className={`content-tab${activeTab === 'scorm' ? ' content-tab--active' : ''}`}
              onClick={() => setActiveTab('scorm')}
            >
              SCORM
            </button>
          </div>
        </div>
        <ContentTable variant={activeTab} />
      </main>
    </div>
  )
}

export default ScormContent
