import { useState } from 'react'
import { PlayCircle } from 'iconsax-react'
import CloseButton from '../../../../components/CloseButton/CloseButton'
import Search from '../../../../components/Search/Search'
import '../../../my-team/CoursesDrawer.css'
import './LibraryDrawer.css'

export interface LibraryLesson {
  id: number
  title: string
  instructor: string
  durationLabel: string
  thumbColor: string
}

export const libraryLessons: LibraryLesson[] = [
  {
    id: 5001,
    title: 'Will AI Make Us More Productive in the Workplace?',
    instructor: 'Aisha Patel',
    durationLabel: '3m 45s',
    thumbColor: 'linear-gradient(135deg, #4a90d9, #7b68ee)',
  },
  {
    id: 5002,
    title: "Tearing Down Zendesk's Pricing. What is behind our Unconscious Bias?",
    instructor: 'Marcus Chen',
    durationLabel: '4m 12s',
    thumbColor: 'linear-gradient(135deg, #f97316, #ef4444)',
  },
  {
    id: 5003,
    title: 'Is Digital Debt Costing Us Innovation?',
    instructor: 'Priya Shah',
    durationLabel: '5m 02s',
    thumbColor: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
  },
  {
    id: 5004,
    title: 'The 5-Minute Manager: Quick Wins for Leading Hybrid Teams',
    instructor: 'Sam Okafor',
    durationLabel: '3m 58s',
    thumbColor: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  },
  {
    id: 5005,
    title: 'GDPR Essentials Every Employee Should Know',
    instructor: 'Elena Rossi',
    durationLabel: '4m 30s',
    thumbColor: 'linear-gradient(135deg, #18a957, #14b8a6)',
  },
  {
    id: 5006,
    title: 'Mastering Difficult Conversations at Work',
    instructor: 'Alex Tan',
    durationLabel: '6m 15s',
    thumbColor: 'linear-gradient(135deg, #fb7185, #f97316)',
  },
  {
    id: 5007,
    title: 'From Feedback to Growth: Coaching Like a Pro',
    instructor: 'Martina Rossi',
    durationLabel: '5m 22s',
    thumbColor: 'linear-gradient(135deg, #6366f1, #4338ca)',
  },
  {
    id: 5008,
    title: 'The Science of Focus: Beating Distractions for Good',
    instructor: 'Nina Hill',
    durationLabel: '4m 48s',
    thumbColor: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  },
  {
    id: 5009,
    title: 'Leading with Empathy in a Remote World',
    instructor: 'Anthonny Wallace',
    durationLabel: '3m 30s',
    thumbColor: 'linear-gradient(135deg, #ec4899, #db2777)',
  },
  {
    id: 5010,
    title: 'Time Management Habits of High Performers',
    instructor: 'Carla Mendes',
    durationLabel: '4m 02s',
    thumbColor: 'linear-gradient(135deg, #34d399, #10b981)',
  },
]

interface ContentProps {
  onClose: () => void
  addedIds: Set<number>
  onAdd: (lesson: LibraryLesson) => void
  onRemove: (id: number) => void
}

/* Inner content only — no overlay/shell. Mount inside a shared drawer shell
   (see ContentDrawer) so swapping between content types doesn't re-animate. */
export function LibraryDrawerContent({ onClose, addedIds, onAdd, onRemove }: ContentProps) {
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()
  const filtered = query
    ? libraryLessons.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.instructor.toLowerCase().includes(query),
      )
    : libraryLessons

  return (
    <>
      <div className="side-drawer__header">
        <div className="side-drawer__headline">
          <div className="library-drawer__headline">
            <h2 id="content-drawer-title" className="library-drawer__title">
              Add lessons from 5Mins library
            </h2>
            <p className="library-drawer__subtitle">
              Explore from 20,000+ lessons designed for your team's growth
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
      </div>

      <div className="library-drawer__search">
        <Search
          size="M"
          value={search}
          placeholder="Search the 5Mins library"
          onChange={setSearch}
          ariaLabel="Search 5Mins library"
        />
      </div>

      <div className="side-drawer__content library-drawer__list">
        {filtered.length === 0 ? (
          <p className="library-drawer__empty">No lessons match your search.</p>
        ) : (
          filtered.map((lesson) => {
            const isAdded = addedIds.has(lesson.id)
            return (
              <article key={lesson.id} className="library-lesson">
                <div className="library-lesson__thumb" style={{ background: lesson.thumbColor }}>
                  <span className="library-lesson__tag" aria-hidden="true">
                    <PlayCircle size={16} color="var(--text-tertiary)" variant="Bold" />
                  </span>
                </div>
                <div className="library-lesson__info">
                  <h3 className="library-lesson__title">{lesson.title}</h3>
                  <p className="library-lesson__meta">
                    {lesson.instructor} · {lesson.durationLabel}
                  </p>
                </div>
                {isAdded ? (
                  <button
                    type="button"
                    className="library-lesson__btn library-lesson__btn--remove"
                    onClick={() => onRemove(lesson.id)}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="library-lesson__btn library-lesson__btn--add"
                    onClick={() => onAdd(lesson)}
                  >
                    Add
                  </button>
                )}
              </article>
            )
          })
        )}
      </div>
    </>
  )
}
