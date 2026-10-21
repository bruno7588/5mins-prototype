import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Add, ArrowDown2, ArrowLeft2, ArrowRight2, UserAdd } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Button from '../../components/Button/Button'
import AssignCoursesWizard from './components/AssignCoursesWizard/AssignCoursesWizard'
import { activeEnrolments, lastEnrolmentLabel } from './activeEnrolments'
import './YourCourses.css'

type Tab = 'created' | 'enrolments' | 'dashboard'

const courseImage = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=480&h=300&fit=crop'

const enrolThumb = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=180&h=88&fit=crop'

function YourCourses() {
  const navigate = useNavigate()
  // Assign Courses from the list page lands here on Active Enrolments.
  const initialTab = (useLocation().state as { tab?: Tab } | null)?.tab ?? 'created'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [assignOpen, setAssignOpen] = useState(false)
  // Read on every render, so courses just assigned show up when the wizard closes.
  const enrolmentRows = activeEnrolments()

  return (
    <div className="your-courses-layout">
      <LeftSidebar />
      <main className="your-courses-main">
        <div className="your-courses-header">
          <div className="your-courses-headline">
            <h2 className="your-courses-title">Your Courses</h2>
            <div className="your-courses-actions">
              <Button variant="outlined" onClick={() => setAssignOpen(true)}>
                Assign Courses
              </Button>
              <Button icon={<Add size={20} color="currentColor" />} onClick={() => navigate('/create-course')}>
                Create Course
              </Button>
            </div>
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

        {activeTab === 'enrolments' ? (
          <div className="your-courses-enrol-table">
            <div className="your-courses-enrol-row your-courses-enrol-row--head">
              <div className="your-courses-enrol-cell your-courses-enrol-cell--course">Course</div>
              <div className="your-courses-enrol-cell your-courses-enrol-cell--last your-courses-enrol-cell--sortable">
                Last enrolment
                <ArrowDown2 size={16} color="var(--text-secondary)" variant="Linear" />
              </div>
              <div className="your-courses-enrol-cell your-courses-enrol-cell--users">Enrolled users</div>
            </div>

            {enrolmentRows.map((row) => (
              <div className="your-courses-enrol-row" key={row.id}>
                <div className="your-courses-enrol-cell your-courses-enrol-cell--course">
                  <div className="your-courses-enrol-thumb">
                    <img src={row.thumb ?? enrolThumb} alt="" />
                  </div>
                  <span
                    className="your-courses-enrol-course-title"
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate('/your-courses/course', { state: { courseTitle: row.title } })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate('/your-courses/course', { state: { courseTitle: row.title } })
                      }
                    }}
                  >
                    {row.title}
                  </span>
                </div>
                <div className="your-courses-enrol-cell your-courses-enrol-cell--last">{lastEnrolmentLabel(row.daysAgo)}</div>
                <div className="your-courses-enrol-cell your-courses-enrol-cell--users">
                  <span>{row.enrolledUsers}</span>
                  <button className="your-courses-enrol-action-btn" aria-label="Enrol users">
                    <UserAdd size={20} color="var(--text-secondary)" variant="Linear" />
                  </button>
                </div>
              </div>
            ))}

            <div className="your-courses-enrol-pagination">
              <span className="your-courses-enrol-pagination-text">1-{enrolmentRows.length} of {enrolmentRows.length + 17}</span>
              <button
                className="your-courses-enrol-pagination-btn your-courses-enrol-pagination-btn--disabled"
                aria-label="Previous page"
              >
                <ArrowLeft2 size={16} color="var(--text-tertiary)" />
              </button>
              <button className="your-courses-enrol-pagination-btn" aria-label="Next page">
                <ArrowRight2 size={16} color="var(--text-secondary)" />
              </button>
            </div>
          </div>
        ) : (
        <div className="your-courses-folders">
          <div className="your-courses-new-folder">
            <span className="your-courses-new-folder-icon">+</span>
            <span className="your-courses-new-folder-label">New Folder</span>
          </div>

          <div
            className="your-courses-folder-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/your-courses/list')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate('/your-courses/list')
              }
            }}
          >
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
              <span className="your-courses-folder-name">Courses</span>
              <span className="your-courses-folder-count">27 courses</span>
            </div>
          </div>
        </div>
        )}
      </main>
      {assignOpen && <AssignCoursesWizard onClose={() => setAssignOpen(false)} onDone={() => {
        setAssignOpen(false)
        setActiveTab('enrolments')
      }} />}
    </div>
  )
}

export default YourCourses
