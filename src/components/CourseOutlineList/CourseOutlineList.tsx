import { ArrowCircleRight2, Lock, MessageQuestion, PlayCircle, TickCircle } from 'iconsax-react'
import type { CourseFeedItem } from '@/data/courseFeed'
import './CourseOutlineList.css'

interface Props {
  items: CourseFeedItem[]
  /** The item on screen. */
  index: number
  /** Ids of the items the learner has completed. */
  done: Set<string>
  /** Whether item `i` can be opened; the rest show a lock. */
  isUnlocked: (i: number) => boolean
  onSelect: (i: number) => void
}

/* The type alone, as production's outline shows it. */
const metaOf = (item: CourseFeedItem) => (item.kind === 'lesson' ? 'Lesson' : 'Assessment')

/**
 * The course outline as a flat list, as production draws it (and Course feed Figma
 * 17024:83094 web, 17024:75136 mobile): a tick on what is done, "You're here" on the
 * item on screen, a lock on what can't be opened yet. Rows open their item unless it is
 * locked. Shared by the web details panel and the app's sheet.
 */
function CourseOutlineList({ items, index, done, isUnlocked, onSelect }: Props) {
  return (
    <ol className="cfo-list">
      {items.map((item, i) => {
        const here = i === index
        const completed = !here && done.has(item.id)
        const locked = !here && !completed && !isUnlocked(i)
        const state = here ? 'here' : completed ? 'done' : locked ? 'locked' : 'open'
        const TypeIcon = item.kind === 'lesson' ? PlayCircle : MessageQuestion
        const icon = here ? (
          /* Figma "vuesax/bold/arrow-right" (17024:83094) is an arrow in a circle. In this
             package ArrowRight Bold draws a square, so the circle is ArrowCircleRight2. */
          <ArrowCircleRight2 size={16} color="var(--primary-600)" variant="Bold" />
        ) : completed ? (
          <TickCircle size={16} color="var(--success-500)" variant="Bold" />
        ) : locked ? (
          <Lock size={16} color="var(--text-disabled)" variant="Bold" />
        ) : (
          <TypeIcon size={16} color="var(--text-secondary)" variant="Bold" />
        )
        return (
          <li key={item.id} className={`cfo-item cfo-item--${state}`}>
            <button
              type="button"
              className="cfo-row"
              disabled={locked || here}
              aria-current={here ? 'step' : undefined}
              onClick={() => onSelect(i)}
            >
              <span className="cfo-row__icon" aria-hidden="true">
                {icon}
              </span>
              <span className="cfo-row__info">
                {here ? <span className="cfo-row__here">You're here</span> : null}
                <span className="cfo-row__title">{item.title}</span>
                <span className="cfo-row__meta">
                  {metaOf(item)}
                  {completed ? <span className="cfo-sr"> (completed)</span> : null}
                  {locked ? <span className="cfo-sr"> (locked)</span> : null}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export default CourseOutlineList
