import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Profile2User,
  Book1,
  Flash,
  Diagram,
  Award,
  DocumentText,
  Calendar,
  Setting2,
  Teacher,
  MessageQuestion,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-react'
import { buildInitialMappings } from '../../pages/roles/data/mockHrisMappings'
import { initialCompanyRoles, fiveMinsRoles } from '../../pages/roles/data/mockRoles'
import './LeftSidebar.css'

const iconSize = 20
const iconColor = 'var(--neutral-500)'

const unmappedRolesCount = buildInitialMappings(initialCompanyRoles, fiveMinsRoles)
  .filter(m => m.status !== 'mapped').length

function LeftSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const activePage = location.pathname

  const isPeopleSection = activePage === '/people' || activePage === '/user-fields' || activePage === '/roles'

  const [peopleOpen, setPeopleOpen] = useState(isPeopleSection)
  const [contentOpen, setContentOpen] = useState(true)

  return (
    <aside className="left-sidebar">
      <nav className="left-sidebar-nav">
        {/* Home */}
        <button className="sidebar-item">
          <span className="sidebar-item-icon">
            <Home size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">Home</span>
        </button>

        {/* People & Teams (expandable) */}
        <button className="sidebar-item" onClick={() => setPeopleOpen(!peopleOpen)}>
          <span className="sidebar-item-icon">
            <Profile2User size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">
            People &amp; Teams
            {!peopleOpen && unmappedRolesCount > 0 && (
              <span
                className="sidebar-item-label__dot"
                aria-label={`${unmappedRolesCount} unmapped role${unmappedRolesCount !== 1 ? 's' : ''}`}
              />
            )}
          </span>
          <span className="sidebar-item-chevron">
            {peopleOpen ? (
              <ArrowUp2 size={16} color="var(--text-tertiary)" />
            ) : (
              <ArrowDown2 size={16} color="var(--text-tertiary)" />
            )}
          </span>
        </button>
        {peopleOpen && (
          <div className="sidebar-sub-items">
            <button
              className={`sidebar-sub-item${activePage === '/people' ? ' sidebar-sub-item--active' : ''}`}
              onClick={() => navigate('/people')}
            >
              People
            </button>
            <button className="sidebar-sub-item">Teams</button>
            <button className="sidebar-sub-item">Cohorts</button>
            <button
              className={`sidebar-sub-item${activePage === '/user-fields' ? ' sidebar-sub-item--active' : ''}`}
              onClick={() => navigate('/user-fields')}
            >
              Custom Fields
            </button>
            <button
              className={`sidebar-sub-item${activePage === '/roles' ? ' sidebar-sub-item--active' : ''}`}
              onClick={() => navigate('/roles')}
            >
              <span>Roles</span>
              {unmappedRolesCount > 0 && (
                <span
                  className="sidebar-sub-item__badge"
                  aria-label={`${unmappedRolesCount} unmapped role${unmappedRolesCount !== 1 ? 's' : ''}`}
                >
                  {unmappedRolesCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Content (expandable) */}
        <button className="sidebar-item" onClick={() => setContentOpen(!contentOpen)}>
          <span className="sidebar-item-icon">
            <Book1 size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">Content</span>
          <span className="sidebar-item-chevron">
            {contentOpen ? (
              <ArrowUp2 size={16} color="var(--text-tertiary)" />
            ) : (
              <ArrowDown2 size={16} color="var(--text-tertiary)" />
            )}
          </span>
        </button>
        {contentOpen && (
          <div className="sidebar-sub-items">
            <button
              className={`sidebar-sub-item${activePage === '/programs' ? ' sidebar-sub-item--active' : ''}`}
              onClick={() => navigate('/programs')}
            >
              Programs
            </button>
            <button className="sidebar-sub-item">5Mins Courses</button>
            <button
              className={`sidebar-sub-item${activePage === '/content-library' ? ' sidebar-sub-item--active' : ''}`}
              onClick={() => navigate('/content-library')}
            >
              Your Content
            </button>
            <button
              className={`sidebar-sub-item${activePage === '/your-courses' ? ' sidebar-sub-item--active' : ''}`}
              onClick={() => navigate('/your-courses')}
            >
              Your Courses
            </button>
          </div>
        )}

        {/* Automations */}
        <button
          className={`sidebar-item${activePage === '/automations' ? ' sidebar-item--active' : ''}`}
          onClick={() => navigate('/automations')}
        >
          <span className="sidebar-item-icon">
            <Flash
              size={iconSize}
              color={activePage === '/automations' ? 'var(--secondary-600)' : iconColor}
              variant={activePage === '/automations' ? 'Bold' : 'Linear'}
            />
          </span>
          <span className="sidebar-item-label">Automations</span>
        </button>

        {/* Reports */}
        <button className="sidebar-item">
          <span className="sidebar-item-icon">
            <Diagram size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">Reports</span>
        </button>

        {/* Skills */}
        <button className="sidebar-item">
          <span className="sidebar-item-icon">
            <Award size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">Skills</span>
        </button>

        {/* Learning Records */}
        <button
          className={`sidebar-item${activePage === '/learning-records' ? ' sidebar-item--active' : ''}`}
          onClick={() => navigate('/learning-records')}
        >
          <span className="sidebar-item-icon">
            <DocumentText
              size={iconSize}
              color={activePage === '/learning-records' ? 'var(--secondary-600)' : iconColor}
              variant={activePage === '/learning-records' ? 'Bold' : 'Linear'}
            />
          </span>
          <span className="sidebar-item-label">Learning Records</span>
        </button>

        {/* Events */}
        <button className="sidebar-item">
          <span className="sidebar-item-icon">
            <Calendar size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">Events</span>
        </button>

        {/* Account & Settings */}
        <button className="sidebar-item">
          <span className="sidebar-item-icon">
            <Setting2 size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">Account &amp; Settings</span>
        </button>
      </nav>

      <div className="left-sidebar-footer">
        <button className="sidebar-item">
          <span className="sidebar-item-icon">
            <Teacher size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">5Mins Academy</span>
        </button>
        <button className="sidebar-item">
          <span className="sidebar-item-icon">
            <MessageQuestion size={iconSize} color={iconColor} variant="Linear" />
          </span>
          <span className="sidebar-item-label">Help</span>
        </button>
        <div className="left-sidebar-powered">
          Powered by <span>5Mins.ai</span>
        </div>
      </div>
    </aside>
  )
}

export default LeftSidebar
