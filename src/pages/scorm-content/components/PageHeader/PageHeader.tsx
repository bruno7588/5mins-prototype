import Button from '../../../../components/Button/Button'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import Tabs from '@/components/Tabs/Tabs'
import './PageHeader.css'

const tabs = [
  { key: 'Details', label: 'Details' },
  { key: 'Course Content', label: 'Course Content' },
  { key: 'Resources', label: 'Resources' },
  { key: 'Settings', label: 'Settings' },
]

function PageHeader() {
  return (
    <header className="sc-page-header">
      <div className="sc-page-header-top">
        <h2 className="sc-page-header-title">Create course</h2>
        <div className="sc-page-header-actions">
          <Button variant="outlined" disabled>Save Draft</Button>
          <Button disabled>Create Course</Button>
          <CloseButton variant="fullscreen" className="sc-page-header-close" />
        </div>
      </div>
      <Tabs
        items={tabs}
        activeKey="Course Content"
        onChange={() => {}}
        ariaLabel="Create course sections"
        className="sc-page-header-tabs"
      />
    </header>
  )
}

export default PageHeader
