import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Add } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import './YourCourses.css'

type Tab = 'created' | 'enrolments' | 'dashboard'

const courseImage = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=480&h=300&fit=crop'

function YourCourses() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('created')

  return (
    <div className="your-courses-layout">
      <LeftSidebar />
      <main className="your-courses-main">
        <div className="your-courses-header">
          <div className="your-courses-headline">
            <h2 className="your-courses-title">Your Courses</h2>
            <button className="btn-primary" onClick={() => navigate('/create-course')}>
              Create Course
              <Add size={20} color="var(--neutral-25)" />
            </button>
          </div>
          <div className="page-header-divider" />
          <div className="your-courses-tabs">
            <button
              className={`your-courses-tab${activeTab === 'created' ? ' your-courses-tab--active' : ''}`}
              onClick={() => setActiveTab('created')}
            >
              Created by You
            </button>
            <button
              className={`your-courses-tab${activeTab === 'enrolments' ? ' your-courses-tab--active' : ''}`}
              onClick={() => setActiveTab('enrolments')}
            >
              Active Enrolments
            </button>
            <button
              className={`your-courses-tab${activeTab === 'dashboard' ? ' your-courses-tab--active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="your-courses-folders">
          <div className="your-courses-new-folder">
            <span className="your-courses-new-folder-icon">+</span>
            <span className="your-courses-new-folder-label">New Folder</span>
          </div>

          <div className="your-courses-folder-card">
            <div className="your-courses-folder-thumb">
              <div className="your-courses-folder-thumbs">
                <div className="your-courses-folder-img-back" />
                <div className="your-courses-folder-img-mid" />
                <div className="your-courses-folder-img-front">
                  <img src={courseImage} alt="Course thumbnail" />
                </div>
              </div>
            </div>
            <div className="your-courses-folder-info">
              <span className="your-courses-folder-name">Your courses</span>
              <span className="your-courses-folder-count">27 courses</span>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

export default YourCourses
