import { useEffect, useState } from 'react'
import {
  ArchiveAdd,
  ArrowDown2,
  ArrowUp2,
  Discover,
  Maximize4,
  Messages2,
  More,
  Send2,
} from 'iconsax-react'
import CloseButton from '../../../components/CloseButton/CloseButton'
import { getLevelIllustration } from '../../../assets/level-illustrations'
import type { FeedEpisode, FeedLesson } from '../feedItems'
import './LessonFeed.css'

type BarTone = 'primary' | 'success' | 'elevated'

function Bar({ progress, tone, height }: { progress: number; tone: BarTone; height: number }) {
  const color =
    tone === 'success' ? 'var(--success-500)' : tone === 'elevated' ? 'var(--border)' : 'var(--primary-600)'
  return (
    <div className="lf-bar" style={{ height }}>
      <div className="lf-bar__fill" style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%`, background: color }} />
    </div>
  )
}

function EpisodeCard({ ep }: { ep: FeedEpisode }) {
  return (
    <article className="lf-ep">
      <span className="lf-ep__label">{ep.label}</span>
      <p className={`lf-ep__title${ep.upcoming ? ' lf-ep__title--upcoming' : ''}`}>{ep.title}</p>
      <div className="lf-ep__duration">
        <Bar progress={ep.progress} tone="elevated" height={4} />
        <span className="lf-ep__time">{ep.duration}</span>
      </div>
    </article>
  )
}

interface LessonFeedProps {
  lessons: FeedLesson[]
  startIndex: number
  onClose: () => void
}

function LessonFeed({ lessons, startIndex, onClose }: LessonFeedProps) {
  const [active, setActive] = useState(startIndex)
  const [following, setFollowing] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const lesson = lessons[active]
  const atFirst = active === 0
  const atLast = active === lessons.length - 1

  // Reset per-lesson toggles when navigating.
  useEffect(() => {
    setFollowing(false)
    setBookmarked(false)
  }, [active])

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!lesson) return null

  return (
    <div className="lf-overlay" role="dialog" aria-modal="true" aria-label="Lesson feed">
      {/* Left: video stage + feed controls */}
      <div className="lf-feed">
        <div className="lf-stage">
          <div className="lf-video-wrap">
            <CloseButton className="lf-close" onClick={onClose} ariaLabel="Close lesson feed" />
            <div className="lf-video">
              <img className="lf-video__media" src={lesson.media} alt="" />
              <div className="lf-video__gradient" />
              <div className="lf-video__progress">
                <div className="lf-video__bars">
                  {lesson.episodes.map((ep, i) => (
                    <Bar key={i} progress={ep.progress} tone={ep.progress >= 1 ? 'success' : 'primary'} height={2} />
                  ))}
                </div>
                <span className="lf-video__time">{lesson.duration}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lf-actions">
          <div className="lf-actions__arrows">
            <button
              type="button"
              className="lf-icon-btn"
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              disabled={atFirst}
              aria-label="Previous lesson"
            >
              <ArrowUp2 size={20} color="var(--text-primary)" variant="Linear" />
            </button>
            <button
              type="button"
              className="lf-icon-btn"
              onClick={() => setActive((i) => Math.min(lessons.length - 1, i + 1))}
              disabled={atLast}
              aria-label="Next lesson"
            >
              <ArrowDown2 size={20} color="var(--text-primary)" variant="Linear" />
            </button>
          </div>
          <button type="button" className="lf-icon-btn ui-disabled" disabled aria-label="Fullscreen (coming soon)">
            <Maximize4 size={20} color="var(--text-primary)" variant="Linear" />
          </button>
          <button type="button" className="lf-icon-btn ui-disabled" disabled aria-label="More (coming soon)">
            <More size={24} color="var(--text-primary)" variant="Linear" />
          </button>
        </div>
      </div>

      {/* Right: lesson details */}
      <aside className="lf-panel">
        <div className="lf-instructor">
          <div className="lf-instructor__creator">
            <img className="lf-avatar" src={lesson.instructorAvatar} alt="" />
            <div className="lf-instructor__info">
              <span className="lf-instructor__name">{lesson.instructor}</span>
              <span className="lf-instructor__role">Instructor</span>
            </div>
          </div>
          <button
            type="button"
            className={`lf-follow${following ? ' lf-follow--active' : ''}`}
            onClick={() => setFollowing((f) => !f)}
            aria-pressed={following}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </div>

        <div className="lf-info">
          <div className="lf-info__title-block">
            <h2 className="lf-info__title">{lesson.title}</h2>
            <span className="lf-info__link ui-disabled">Take a deep dive</span>
          </div>
          <div className="lf-episodes">
            {lesson.episodes.map((ep, i) => (
              <EpisodeCard key={i} ep={ep} />
            ))}
          </div>
        </div>

        <div className="lf-skill">
          <img
            className="lf-skill__icon"
            src={getLevelIllustration(lesson.skillLevel, { size: 'small' })}
            alt=""
            width={20}
            height={20}
          />
          <span className="lf-skill__name">{lesson.skillName}</span>
        </div>

        <div className="lf-menu">
          <button type="button" className="lf-menu__item ui-disabled" disabled>
            <Discover size={20} color="var(--text-primary)" variant="Linear" />
            <span>Learnings</span>
          </button>
          <button
            type="button"
            className="lf-menu__item"
            onClick={() => setBookmarked((b) => !b)}
            aria-pressed={bookmarked}
          >
            <ArchiveAdd size={20} color="var(--text-primary)" variant={bookmarked ? 'Bold' : 'Linear'} />
            <span>Bookmark</span>
          </button>
          <button type="button" className="lf-menu__item ui-disabled" disabled>
            <Send2 size={20} color="var(--text-primary)" variant="Linear" />
            <span>Share</span>
          </button>
          <button type="button" className="lf-menu__item ui-disabled" disabled>
            <Messages2 size={20} color="var(--text-primary)" variant="Linear" />
            <span>Comments</span>
          </button>
        </div>

        <div className="lf-quiz">
          <span className="lf-quiz__mark" aria-hidden="true">?</span>
          <p className="lf-quiz__text">
            Answer the Quiz at the end of this lesson and earn {lesson.quizPoints} Skill Points
          </p>
        </div>
      </aside>
    </div>
  )
}

export default LessonFeed
