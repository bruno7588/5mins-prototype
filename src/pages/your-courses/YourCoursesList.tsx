import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Add, ArrowRight2, ArrowDown2, ArrowLeft2, Sort } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Search from '../../components/Search/Search'
import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import Dropdown from '../../components/Dropdown/Dropdown'
import MoreIcon from '../../components/icons/MoreIcon'
import './YourCoursesList.css'

const thumbImage = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=180&h=88&fit=crop'

type CourseStatus = 'published' | 'draft'

interface CourseRow {
  id: number
  title: string
  status: CourseStatus
  lessons: number
  createdBy: string
  updatedAt: string
}

const courseRows: CourseRow[] = [
  { id: 1, title: 'Marketing Tools and Resources that Everyone Should know Tools and Resources for Everyone', status: 'published', lessons: 20, createdBy: 'Name of the Admin', updatedAt: 'Jul 19, 2025' },
  { id: 2, title: 'Mastering Customer Discovery: Interviews, Surveys and Insights', status: 'published', lessons: 14, createdBy: 'Sophia Carter', updatedAt: 'Jul 18, 2025' },
  { id: 3, title: 'Foundations of Data Privacy and Compliance for Teams', status: 'draft', lessons: 8, createdBy: 'Oliver Bennett', updatedAt: 'Jul 17, 2025' },
  { id: 4, title: 'Leadership Essentials: Coaching, Feedback and Difficult Conversations', status: 'published', lessons: 22, createdBy: 'Emma Thompson', updatedAt: 'Jul 15, 2025' },
  { id: 5, title: 'Designing Effective Onboarding Journeys for New Hires', status: 'published', lessons: 11, createdBy: 'Liam Johnson', updatedAt: 'Jul 14, 2025' },
  { id: 6, title: 'Introduction to Financial Modelling for Non-Finance Managers', status: 'draft', lessons: 16, createdBy: 'Name of the Admin', updatedAt: 'Jul 12, 2025' },
  { id: 7, title: 'Cybersecurity Awareness: Spotting Phishing and Social Engineering', status: 'published', lessons: 9, createdBy: 'Noah Davis', updatedAt: 'Jul 11, 2025' },
  { id: 8, title: 'Agile Delivery in Practice: Sprints, Standups and Retrospectives', status: 'published', lessons: 18, createdBy: 'Sophia Carter', updatedAt: 'Jul 09, 2025' },
  { id: 9, title: 'Writing for the Web: Clarity, Tone and Accessibility', status: 'published', lessons: 7, createdBy: 'Emma Thompson', updatedAt: 'Jul 08, 2025' },
  { id: 10, title: 'Managing Remote Teams Across Time Zones and Cultures', status: 'published', lessons: 13, createdBy: 'Oliver Bennett', updatedAt: 'Jul 05, 2025' },
]

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

function YourCoursesList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    return courseRows.filter((row) => {
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter
      const matchesSearch = row.title.toLowerCase().includes(search.trim().toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [statusFilter, search])

  return (
    <div className="courses-list-layout">
      <LeftSidebar />
      <main className="courses-list-main">
        <div className="courses-list-header">
          <nav className="courses-list-breadcrumb" aria-label="Breadcrumb">
            <button
              type="button"
              className="courses-list-breadcrumb-link"
              onClick={() => navigate('/your-courses')}
            >
              Courses
            </button>
            <ArrowRight2 size={16} color="var(--text-tertiary)" variant="Linear" />
            <span className="courses-list-breadcrumb-current">Your Courses</span>
          </nav>

          <div className="courses-list-headline">
            <h2 className="courses-list-title">Your Courses</h2>
            <Button icon={<Add size={20} color="currentColor" />} onClick={() => navigate('/create-course')}>
              Create Course
            </Button>
          </div>

          <div className="page-header-divider" />
        </div>

        <div className="courses-list-actions">
          <Dropdown
            label="Course status"
            labelPlacement="start"
            size="sm"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            iconLeft={<Sort size={20} color="var(--text-secondary)" variant="Linear" />}
            className="courses-list-status-dropdown"
          />
          <Search
            size="M"
            value={search}
            onChange={setSearch}
            placeholder="Search for courses"
            ariaLabel="Search for courses"
            className="courses-list-search"
          />
        </div>

        <div className="courses-list-table">
          <div className="courses-list-row courses-list-row--head">
            <div className="courses-list-cell courses-list-cell--course">Course</div>
            <div className="courses-list-cell courses-list-cell--status">Status</div>
            <div className="courses-list-cell courses-list-cell--lessons">Lessons</div>
            <div className="courses-list-cell courses-list-cell--author">Created by</div>
            <div className="courses-list-cell courses-list-cell--updated courses-list-cell--sortable">
              Updated
              <ArrowDown2 size={16} color="var(--text-secondary)" variant="Linear" />
            </div>
            <div className="courses-list-cell courses-list-cell--actions" aria-hidden="true" />
          </div>

          {rows.map((row) => {
            const [month, year] = [row.updatedAt.replace(/,?\s*\d{4}$/, ','), row.updatedAt.match(/\d{4}$/)?.[0]]
            return (
              <div className="courses-list-row" key={row.id}>
                <div className="courses-list-cell courses-list-cell--course">
                  <div className="courses-list-thumb">
                    <img src={thumbImage} alt="" />
                  </div>
                  <span
                    className="courses-list-course-title"
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
                <div className="courses-list-cell courses-list-cell--status">
                  {row.status === 'published' ? (
                    <Badge type="success" icon label="Published" />
                  ) : (
                    <Badge type="informative" icon label="Draft" />
                  )}
                </div>
                <div className="courses-list-cell courses-list-cell--lessons">{row.lessons}</div>
                <div className="courses-list-cell courses-list-cell--author">{row.createdBy}</div>
                <div className="courses-list-cell courses-list-cell--updated">
                  <div className="courses-list-date">
                    <span>{month}</span>
                    <span className="courses-list-date-year">{year}</span>
                  </div>
                </div>
                <div className="courses-list-cell courses-list-cell--actions">
                  <button className="courses-list-action-btn" aria-label="More options">
                    <MoreIcon size={20} color="var(--text-tertiary)" />
                  </button>
                </div>
              </div>
            )
          })}

          {rows.length === 0 && (
            <div className="courses-list-empty">No courses match your filters.</div>
          )}

          <div className="courses-list-pagination">
            <span className="courses-list-pagination-text">1-{rows.length} of 28</span>
            <button
              className="courses-list-pagination-btn courses-list-pagination-btn--disabled"
              aria-label="Previous page"
            >
              <ArrowLeft2 size={16} color="var(--text-tertiary)" />
            </button>
            <button className="courses-list-pagination-btn" aria-label="Next page">
              <ArrowRight2 size={16} color="var(--text-secondary)" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default YourCoursesList
