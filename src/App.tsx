import { Routes, Route, Navigate } from 'react-router-dom'
import TopNav from './components/TopNav/TopNav'

import YourContent from './pages/your-courses/YourContent'
import YourCourses from './pages/your-courses/YourCourses'
import YourCoursesList from './pages/your-courses/YourCoursesList'
import CreateCourse from './pages/your-courses/CreateCourse'
import CourseDetails from './pages/your-courses/CourseDetails'
import AddContent from './pages/add-content/AddContent'

import People from './pages/people/People'
import UserFields from './pages/people/UserFields'
import Roles from './pages/roles/Roles'

import Automations from './pages/automations/Automations'

import QBYourContent from './pages/questions-bank/YourContent'

import ScormYourContent from './pages/scorm-content/YourContent'
import ScormCreateCourse from './pages/scorm-content/CreateCourse'

import Onboarding from './pages/onboarding/Onboarding'

import MyTeam from './pages/my-team/MyTeam'
import Workspace from './pages/workspace/Workspace'
import ProgramDetails from './pages/programs/ProgramDetails'
import ProgramsAdmin from './pages/programs/ProgramsAdmin'
import ProgramBuilder from './pages/programs/ProgramBuilder'
import ProgramCourseDetails from './pages/courses/CourseDetails'
import Events from './pages/events/Events'
import LearningRecords from './pages/learning-records/LearningRecords'

function App() {
  return (
    <Routes>
      {/* Create Course pages — no TopNav */}
      <Route
        path="/create-course"
        element={
          <div className="app">
            <div className="app-body app-body--no-nav">
              <CreateCourse />
            </div>
          </div>
        }
      />
      <Route
        path="/scorm-content/create-course"
        element={
          <div className="app">
            <div className="app-body app-body--no-nav">
              <ScormCreateCourse />
            </div>
          </div>
        }
      />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/my-team" element={<MyTeam />} />
      <Route path="/workspace" element={<Workspace />} />
      {/* Program Builder — standalone full-page, no TopNav (ranks above /programs/:id) */}
      <Route
        path="/programs/builder"
        element={
          <div className="app">
            <div className="app-body app-body--no-nav">
              <ProgramBuilder />
            </div>
          </div>
        }
      />
      <Route
        path="/programs/builder/:id"
        element={
          <div className="app">
            <div className="app-body app-body--no-nav">
              <ProgramBuilder />
            </div>
          </div>
        }
      />
      <Route path="/programs/:id" element={<ProgramDetails />} />
      <Route path="/courses/:id" element={<ProgramCourseDetails />} />
      <Route path="/events" element={<Events />} />

      {/* All other pages — with TopNav */}
      <Route
        path="*"
        element={
          <div className="app">
            <TopNav />
            <div className="app-body">
              <Routes>
                <Route path="/" element={<Navigate to="/content-library" replace />} />
                <Route path="/programs" element={<ProgramsAdmin />} />
                <Route path="/content-library" element={<YourContent />} />
                <Route path="/content-library/add-content" element={<AddContent />} />
                <Route path="/your-courses" element={<YourCourses />} />
                <Route path="/your-courses/list" element={<YourCoursesList />} />
                <Route path="/your-courses/course" element={<CourseDetails />} />
                <Route path="/people" element={<People />} />
                <Route path="/learning-records" element={<LearningRecords />} />
                <Route path="/user-fields" element={<UserFields />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/questions-bank" element={<QBYourContent />} />
                <Route path="/scorm-content" element={<ScormYourContent />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
