import { Navigate } from 'react-router-dom'
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar'
import ExternalTraining from '@/pages/account/components/ExternalTraining/ExternalTraining'
import { isFullAdmin } from '@/data/externalTraining'
import './LearningRecords.css'

/* Learning Records > Approved Courses: the approved external courses and providers,
   plus the one-off training setting (DES-336). Moved here from Account & Settings so
   it sits beside the records it governs. Full admins only (D21). */
function ApprovedCourses() {
  if (!isFullAdmin()) return <Navigate to="/learning-records" replace />
  return (
    <div className="lrp-layout">
      <LeftSidebar />
      <main className="lrp-main">
        <div className="lrp-page">
          <div className="lrp-header">
            <h2 className="lrp-title">Approved Courses</h2>
            <div className="lrp-divider" />
          </div>
          <ExternalTraining />
        </div>
      </main>
    </div>
  )
}

export default ApprovedCourses
