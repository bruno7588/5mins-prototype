import { useState } from 'react'
import {
  Add,
  VideoCircle,
  DocumentText1,
  Link1,
  Calendar,
  Clipboard,
  FolderOpen,
  ArrowDown2,
} from 'iconsax-react'
import './CreateCourseModal.css'

type Tab = 'details' | 'content' | 'resources' | 'settings'

interface CreateCourseModalProps {
  onClose: () => void
}

function CreateCourseModal({ onClose }: CreateCourseModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('content')

  return (
    <div className="create-course-modal">
      {/* Header */}
      <div className="create-course-header">
        <div className="create-course-headline">
          <h2 className="create-course-title">Create course</h2>
          <div className="create-course-actions">
            <button className="create-course-btn-draft">Save Draft</button>
            <button className="create-course-btn-submit">Create Course</button>
            <button className="create-course-btn-close" onClick={onClose}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.875 25.875L10.125 10.125M25.875 10.125L10.125 25.875" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="create-course-tabs">
          <button
            className={`create-course-tab${activeTab === 'details' ? ' create-course-tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`create-course-tab${activeTab === 'content' ? ' create-course-tab--active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Course Content
          </button>
          <button
            className={`create-course-tab${activeTab === 'resources' ? ' create-course-tab--active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button
            className={`create-course-tab${activeTab === 'settings' ? ' create-course-tab--active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="create-course-body">
        {/* Empty state */}
        <div className="create-course-empty">
          <div className="create-course-empty-icon">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_8430_32621)">
                <path d="M21.0264 5.95898C22.4351 -0.46597 31.6252 -0.435922 33.0879 5.75C33.2332 6.36446 33.2872 7.18794 33.2959 8.11133C33.3051 9.08774 33.2696 9.88215 33.2695 10.7656C33.2694 13.7479 33.2144 16.8067 33.2803 19.8311L33.3037 20.8994L34.3721 20.9307C35.825 20.973 38.3699 20.8739 40.7012 20.8535C41.8923 20.8431 43.0504 20.8528 44.0498 20.9062C45.072 20.9609 45.8432 21.0584 46.3057 21.1943C49.3471 22.0885 50.9004 24.8864 50.8057 27.7646C50.7116 30.6218 48.9953 33.3485 45.6289 34.085C45.2002 34.1787 44.6425 34.2166 44.0049 34.2246C43.3355 34.233 42.7746 34.2109 42.1348 34.2109H37.2217C36.3107 34.2109 35.3012 34.1873 34.3213 34.2305L33.2939 34.2754L33.2471 35.3037C33.2051 36.2352 33.267 37.3009 33.2676 38.0986V44.3672C33.2695 45.8589 33.3914 47.1256 33.1152 48.2529C32.6333 50.2195 30.9736 52.0239 29.0498 52.5713L29.0322 52.5762L29.0146 52.582C27.7503 52.9867 26.4955 52.9595 25.1602 52.5752C22.9465 51.7443 21.9698 50.6041 21.4736 49.2646C20.9299 47.7968 20.915 45.9926 20.916 43.6816C20.9172 40.9379 20.9535 38.1423 20.9062 35.3672L20.8887 34.3203L19.8428 34.2637L19.0654 34.2334C18.2912 34.2142 17.5266 34.2224 16.7998 34.2197H16.7979L12.374 34.2109H12.3721C10.7732 34.2108 9.37925 34.3287 8.15332 33.998C4.91941 33.1254 3.31833 30.2969 3.37695 27.4014C3.4357 24.5061 5.14824 21.7646 8.40527 21.0518C8.91891 20.9394 9.60658 20.9025 10.3916 20.9014C10.7762 20.9008 11.166 20.9086 11.5527 20.917C11.9341 20.9253 12.3188 20.9344 12.6709 20.9346L19.793 20.9365H20.9189V19.8115L20.916 8.15332C20.9159 7.26056 20.8841 6.6082 21.0264 5.95898Z" fill="#BFC2CC" stroke="#454C5E" strokeWidth="2.25"/>
                <path d="M7.65228 24.6586C6.04088 26.1108 6.8465 29.7717 8.05728 29.7717C9.4115 29.7717 8.96431 27.6539 10.8163 26.9451C12.6684 26.2364 13.5332 25.8694 13.5754 25.0973C13.6387 23.8486 8.81008 23.6151 7.65228 24.6586Z" fill="#DFE1E6"/>
                <path d="M29.2492 4.46994C29.2949 5.24426 27.3868 5.57454 26.6383 6.32317C25.8863 7.0718 25.4084 8.26814 24.8461 8.24979C24.2839 8.23144 23.8903 7.12685 24.0274 5.87913C24.1644 4.63141 25.1729 3.88278 26.6734 3.77636C28.1739 3.66993 29.2141 3.88278 29.2492 4.46994Z" fill="#DFE1E6"/>
              </g>
              <defs>
                <clipPath id="clip0_8430_32621">
                  <rect width="54" height="54" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="create-course-empty-info">
            <span className="create-course-empty-title">Add content to your course</span>
            <span className="create-course-empty-desc">
              Use the side menu to add content, upload resources, and create assessments
            </span>
          </div>
          <button className="create-course-empty-btn">
            <Add size={20} color="currentColor" />
            Add Content
          </button>
        </div>

        {/* Side menu */}
        <aside className="create-course-menu">
          <div className="create-course-menu-header">Add Content</div>
          <button className="create-course-menu-item">
            <VideoCircle size={20} color="var(--text-primary)" variant="Linear" />
            5Mins Library
          </button>
          <button className="create-course-menu-item">
            <FolderOpen size={20} color="var(--text-primary)" variant="Linear" />
            Your Content
          </button>
          <button className="create-course-menu-item">
            <DocumentText1 size={20} color="var(--text-primary)" variant="Linear" />
            SCORM
          </button>
          <button className="create-course-menu-item">
            <Link1 size={20} color="var(--text-primary)" variant="Linear" />
            Embed Links
          </button>
          <button className="create-course-menu-item">
            <Calendar size={20} color="var(--text-primary)" variant="Linear" />
            Events
          </button>
          <button className="create-course-menu-item">
            <Clipboard size={20} color="var(--text-primary)" variant="Linear" />
            Assessments
            <span className="create-course-menu-item-chevron">
              <ArrowDown2 size={12} color="var(--text-secondary)" />
            </span>
          </button>
          <button className="create-course-menu-item">
            <FolderOpen size={20} color="var(--text-primary)" variant="Linear" />
            Resources
          </button>
        </aside>
      </div>
    </div>
  )
}

export default CreateCourseModal
