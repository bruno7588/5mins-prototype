import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Add, ArrowDown2, ArrowLeft2, ArrowRight2, UserAdd } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import './YourCourses.css'

type Tab = 'created' | 'enrolments' | 'dashboard'

const courseImage = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=480&h=300&fit=crop'
const enrolThumb = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=180&h=88&fit=crop'

interface EnrolmentRow {
  id: number
  title: string
  lastEnrolment: string
  enrolledUsers: number
}

const enrolmentRows: EnrolmentRow[] = [
  { id: 1, title: 'Marketing Tools and Resources that Everyone Should know Tools and Resources for Everyone', lastEnrolment: '3 days ago', enrolledUsers: 23 },
  { id: 2, title: 'Mastering Customer Discovery: Interviews, Surveys and Insights', lastEnrolment: '5 days ago', enrolledUsers: 41 },
  { id: 3, title: 'Foundations of Data Privacy and Compliance for Teams', lastEnrolment: '1 week ago', enrolledUsers: 12 },
  { id: 4, title: 'Leadership Essentials: Coaching, Feedback and Difficult Conversations', lastEnrolment: '2 days ago', enrolledUsers: 58 },
  { id: 5, title: 'Designing Effective Onboarding Journeys for New Hires', lastEnrolment: 'Yesterday', enrolledUsers: 7 },
  { id: 6, title: 'Introduction to Financial Modelling for Non-Finance Managers', lastEnrolment: '2 weeks ago', enrolledUsers: 34 },
  { id: 7, title: 'Cybersecurity Awareness: Spotting Phishing and Social Engineering', lastEnrolment: '4 days ago', enrolledUsers: 96 },
  { id: 8, title: 'Agile Delivery in Practice: Sprints, Standups and Retrospectives', lastEnrolment: '6 days ago', enrolledUsers: 19 },
  { id: 9, title: 'Writing for the Web: Clarity, Tone and Accessibility', lastEnrolment: '3 weeks ago', enrolledUsers: 28 },
  { id: 10, title: 'Managing Remote Teams Across Time Zones and Cultures', lastEnrolment: '1 month ago', enrolledUsers: 15 },
]

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
                    <img src={enrolThumb} alt="" />
                  </div>
                  <span
                    className="your-courses-enrol-course-title"
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate('/your-courses/course')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate('/your-courses/course')
                      }
                    }}
                  >
                    {row.title}
                  </span>
                </div>
                <div className="your-courses-enrol-cell your-courses-enrol-cell--last">{row.lastEnrolment}</div>
                <div className="your-courses-enrol-cell your-courses-enrol-cell--users">
                  <span>{row.enrolledUsers}</span>
                  <button className="your-courses-enrol-action-btn" aria-label="Enrol users">
                    <UserAdd size={20} color="var(--text-secondary)" variant="Linear" />
                  </button>
                </div>
              </div>
            ))}

            <div className="your-courses-enrol-pagination">
              <span className="your-courses-enrol-pagination-text">1-{enrolmentRows.length} of 28</span>
              <button
                className="your-courses-enrol-pagination-btn your-courses-enrol-pagination-btn--disabled"
                aria-label="Previous page"
              >
                <ArrowLeft2 size={16} color="var(--neutral-400)" />
              </button>
              <button className="your-courses-enrol-pagination-btn" aria-label="Next page">
                <ArrowRight2 size={16} color="var(--neutral-500)" />
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

    </div>
  )
}

export default YourCourses
