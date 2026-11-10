import { ArrowDown, InfoCircle } from 'iconsax-react'
import SideDrawer from '@/components/SideDrawer/SideDrawer'
import Avatar from '@/components/Avatar/Avatar'
import type { CourseStep } from '../../programStore'
import './LearnerProgressDrawer.css'

export interface LearnerLite {
  id: string
  name: string
  avatar: string
  role: string
}

interface Props {
  open: boolean
  learner: LearnerLite
  courses: CourseStep[]
  onClose: () => void
}

/** Deterministic per-course progress + score for a learner (mock data). */
function statFor(learnerId: string, course: CourseStep, index: number) {
  const seed = [...(learnerId + course.courseId)].reduce((a, c) => a + c.charCodeAt(0), 0)
  const progress = index === 0 ? 100 : [60, 75, 90, 50, 100][seed % 5]
  const score = [80, 72, 90, 65, 85][seed % 5]
  return { progress, score }
}

function LearnerProgressDrawer({ open, learner, courses, onClose }: Props) {
  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      ariaLabel={learner.name}
      bodyClassName="lpd-body"
      header={
        <div className="lpd-header">
          <Avatar name={learner.name} src={learner.avatar} size={48} />
          <div className="lpd-headline">
            <p className="lpd-name">{learner.name}</p>
            <p className="lpd-role">{learner.role}</p>
          </div>
        </div>
      }
    >
      <div className="lpd-thead">
        <span className="lpd-thead__course">Course</span>
        <span className="lpd-thead__progress">
          Progress
          <ArrowDown size={16} color="var(--text-secondary)" variant="Linear" />
        </span>
        <span className="lpd-thead__score">
          Score
          <InfoCircle size={16} color="var(--text-secondary)" variant="Linear" />
        </span>
      </div>

      {courses.map((c, i) => {
        const { progress, score } = statFor(learner.id, c, i)
        return (
          <div key={c.id} className="lpd-row">
            <div className="lpd-row__course">
              <span
                className="lpd-thumb"
                style={{ backgroundImage: c.thumbnail ? `url(${c.thumbnail})` : undefined }}
              />
              <span className="lpd-row__title">{c.title}</span>
            </div>
            <div className="lpd-row__progress">
              <span className="lpd-bar">
                <span
                  className={`lpd-bar__fill${progress >= 100 ? ' lpd-bar__fill--done' : ''}`}
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span className="lpd-pct">{progress}%</span>
            </div>
            <div className="lpd-row__score">{score}%</div>
          </div>
        )
      })}
    </SideDrawer>
  )
}

export default LearnerProgressDrawer
