import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import TopNav from './components/TopNav/TopNav'

import YourContent from './pages/your-courses/YourContent'
import YourCourses from './pages/your-courses/YourCourses'
import YourCoursesList from './pages/your-courses/YourCoursesList'
import CreateCourse from './pages/your-courses/CreateCourse'
import CourseDetails from './pages/your-courses/CourseDetails'
import AssessmentAnswers from './pages/your-courses/AssessmentAnswers'
import AddContent from './pages/add-content/AddContent'

import People from './pages/people/People'
import UserProfile from './pages/user-profile/UserProfile'
import UserFields from './pages/people/UserFields'
import Roles from './pages/roles/Roles'

import Automations from './pages/automations/Automations'

import QuestionsBankContent from './pages/questions-bank/QuestionsBankContent'

import ScormContent from './pages/scorm-content/ScormContent'
import ScormCreateCourse from './pages/scorm-content/ScormCreateCourse'

import Onboarding from './pages/onboarding/Onboarding'
import MobileApp from './pages/mobile/MobileApp'
import QuizLab from './pages/quiz-lab/QuizLab'
import CardsLab from './pages/cards-lab/CardsLab'
import GradientLab from './pages/gradient-lab/GradientLab'

import MyTeam from './pages/my-team/MyTeam'
import Workspace from './pages/workspace/Workspace'
import ForYou from './pages/for-you/ForYou'
import ProgramDetails from './pages/programs/ProgramDetails'
import ProgramsAdmin from './pages/programs/ProgramsAdmin'
import ProgramAdminDetails from './pages/programs/ProgramAdminDetails'
import ProgramBuilder from './pages/programs/ProgramBuilder'
import CourseFeed from './pages/course-feed/CourseFeed'
import ProgramCourseDetails from './pages/courses/ProgramCourseDetails'
import Events from './pages/events/Events'
import LearningRecords from './pages/learning-records/LearningRecords'
import Account from './pages/account/Account'
import Saved from './pages/saved/Saved'

/** Old /profile links land on Saved, on the same tab (DES-368). */
function ProfileRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/saved${search}`} replace />
}

/** My Progress became My Learning (DES-369); old links keep their ?tab=. */
function MyLearningRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/my-learning${search}`} replace />
}

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
      <Route path="/mobile" element={<MobileApp />} />
      {/* Playground labs: on the shared link too. */}
      <Route path="/quiz-lab" element={<QuizLab />} />
      <Route path="/cards-lab" element={<CardsLab />} />
      <Route path="/gradient-lab" element={<GradientLab />} />
      <Route path="/my-team" element={<MyTeam />} />
      {/* A learner profile opened from My Team — top-level so it keeps the
          learner shell instead of picking up the admin TopNav below. */}
      <Route path="/my-team/people/:id" element={<UserProfile />} />
      <Route path="/workspace" element={<Workspace />} />
      <Route path="/for-you" element={<ForYou />} />
      <Route path="/saved" element={<Saved />} />
      {/* DES-368: Profile became Saved; old links keep their ?tab=. */}
      <Route path="/profile" element={<ProfileRedirect />} />
      {/* DES-369: the signed-in person's own page. Not under My Team: only managers can
          open My Team. My Progress and its profile page forward here. */}
      <Route path="/my-learning" element={<UserProfile />} />
      <Route path="/my-progress" element={<MyLearningRedirect />} />
      <Route path="/my-progress/profile" element={<MyLearningRedirect />} />
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
      <Route path="/courses/:id/feed" element={<CourseFeed />} />
      <Route path="/events" element={<Events />} />

      {/* All other pages — with TopNav */}
      <Route
        path="*"
        element={
          <div className="app">
            <TopNav />
            <div className="app-body">
              <Routes>
                <Route path="/" element={<Navigate to="/workspace" replace />} />
                <Route path="/programs" element={<ProgramsAdmin />} />
                <Route path="/programs/:id/overview" element={<ProgramAdminDetails />} />
                <Route path="/content-library" element={<YourContent />} />
                <Route path="/content-library/add-content" element={<AddContent />} />
                <Route path="/your-courses" element={<YourCourses />} />
                <Route path="/enrolments" element={<YourCourses section="enrolments" />} />
                <Route path="/your-courses/list" element={<YourCoursesList />} />
                <Route path="/your-courses/course" element={<CourseDetails />} />
                <Route path="/your-courses/course/assessments/:id" element={<AssessmentAnswers />} />
                <Route path="/people" element={<People />} />
                <Route path="/people/:id" element={<UserProfile />} />
                <Route path="/learning-records" element={<LearningRecords />} />
                <Route path="/learning-records/external" element={<LearningRecords />} />
                <Route path="/learning-records/approved-courses" element={<Navigate to="/learning-records/external?tab=approved-list" replace />} />
                <Route path="/account" element={<Account />} />
                <Route path="/user-fields" element={<UserFields />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/questions-bank" element={<QuestionsBankContent />} />
                <Route path="/scorm-content" element={<ScormContent />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
