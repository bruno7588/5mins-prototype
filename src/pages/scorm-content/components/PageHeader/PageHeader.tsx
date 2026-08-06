import Button from '../../../../components/Button/Button'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import './PageHeader.css'

const tabs = [
  { label: 'Details', active: false },
  { label: 'Course Content', active: true },
  { label: 'Resources', active: false },
  { label: 'Settings', active: false },
]

function PageHeader() {
  return (
    <header className="sc-page-header">
      <div className="sc-page-header-top">
        <h2 className="sc-page-header-title">Create course</h2>
        <div className="sc-page-header-actions">
          <Button variant="outlined" disabled>Save Draft</Button>
          <Button disabled>Create Course</Button>
          <CloseButton className="sc-page-header-close" />
        </div>
      </div>
      <nav className="sc-page-header-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`sc-page-header-tab ${tab.active ? 'sc-page-header-tab--active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export default PageHeader
