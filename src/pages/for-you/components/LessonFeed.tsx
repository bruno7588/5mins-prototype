import { useEffect, useState } from 'react'
import {
  ArchiveAdd,
  ArrowDown2,
  ArrowUp2,
  Discover,
  Link21,
  MessageText1,
  Send2,
} from 'iconsax-react'
import CloseButton from '../../../components/CloseButton/CloseButton'
import Avatar from '@/components/Avatar/Avatar'
import CompanyAvatar from '@/components/CompanyAvatar/CompanyAvatar'
import ResourceCard from '@/components/ResourceCard/ResourceCard'
import { getLearningsIllustration } from '../../../assets/learnings-illustrations'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { getLevelIllustration } from '../../../assets/level-illustrations'
import type { FeedEpisode, FeedLesson } from '../feedItems'
import { ExpandIcon, MoreIcon } from '@/components/icons/PlayerIcons'
import './LessonFeed.css'

export { ExpandIcon, MoreIcon }

type BarTone = 'primary' | 'success' | 'elevated'

export function Bar({ progress, tone, height }: { progress: number; tone: BarTone; height: number }) {
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

/* The right column swaps to one of these panels; null shows the lesson details. */
type SidePanel = 'learnings' | 'deep-dive'

interface LessonFeedProps {
  lessons: FeedLesson[]
  startIndex: number
  onClose: () => void
}

function LessonFeed({ lessons, startIndex, onClose }: LessonFeedProps) {
  const [active, setActive] = useState(startIndex)
  const [following, setFollowing] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [panel, setPanel] = useState<SidePanel | null>(null)
  /* True while the open panel plays its exit; it unmounts when the animation ends. */
  const [closing, setClosing] = useState(false)
  const closePanel = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPanel(null)
    else setClosing(true)
  }
  const { toasts, show: showToast } = useToast()

  const lesson = lessons[active]
  const resources = lesson?.resources ?? []
  const episodes = lesson?.episodes ?? []
  const hasLearnings = Boolean(lesson?.learningGoals?.length || lesson?.keyConcepts?.length)

  const atFirst = active === 0
  const atLast = active === lessons.length - 1

  // Reset per-lesson toggles when navigating.
  useEffect(() => {
    setFollowing(false)
    setBookmarked(false)
    setPanel(null)
    setClosing(false)
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
        <CloseButton variant="fullscreen" className="lf-close" onClick={onClose} ariaLabel="Close lesson feed" />
        <div className="lf-stage">
          <div className="lf-video-wrap">
            <div className="lf-video">
              <img className="lf-video__media" src={lesson.media} alt="" />
              <div className="lf-video__gradient" />
              <div className="lf-video__progress">
                <div className="lf-video__bars">
                  {episodes.map((ep, i) => (
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
              <ArrowUp2 size={20} color="currentColor" variant="Linear" />
            </button>
            <button
              type="button"
              className="lf-icon-btn"
              onClick={() => setActive((i) => Math.min(lessons.length - 1, i + 1))}
              disabled={atLast}
              aria-label="Next lesson"
            >
              <ArrowDown2 size={20} color="currentColor" variant="Linear" />
            </button>
          </div>
          <button type="button" className="lf-icon-btn ui-disabled" disabled aria-label="Fullscreen (coming soon)">
            <ExpandIcon />
          </button>
          <button type="button" className="lf-icon-btn ui-disabled" disabled aria-label="More (coming soon)">
            <MoreIcon />
          </button>
        </div>
      </div>

      {/* Right: lesson details. Learnings / Take a deep dive slide over them from the
          right and back out again; the details stay put underneath. */}
      <aside className="lf-panel">
        <div className="lf-instructor">
          <div className="lf-instructor__creator">
            {lesson.byCompany ? (
              <CompanyAvatar size={32} />
            ) : (
              <Avatar src={lesson.instructorAvatar} size={40} shape="square" />
            )}
            <div className="lf-instructor__info">
              <span className="lf-instructor__name">{lesson.instructor}</span>
              {!lesson.byCompany && <span className="lf-instructor__role">Instructor</span>}
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
            {lesson.deepDiveUrl || resources.length ? (
              <button type="button" className="lf-info__link" onClick={() => setPanel('deep-dive')}>
                {resources.length ? `View Resources (${resources.length})` : 'View Resources'}
              </button>
            ) : null}
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
            <button
              type="button"
              className={`lf-menu__item${hasLearnings ? '' : ' ui-disabled'}`}
              disabled={!hasLearnings}
              onClick={() => setPanel('learnings')}
            >
              <span>Learnings</span>
              <Discover size={20} color="currentColor" variant="Linear" />
            </button>
            <button
              type="button"
              className="lf-menu__item"
              onClick={() => {
                /* Saying where it went is how learners find Saved (DES-368). */
                if (!bookmarked) showToast('success', 'Bookmarked. Find it in Saved.')
                setBookmarked((b) => !b)
              }}
              aria-pressed={bookmarked}
            >
              <span>Bookmark</span>
              <ArchiveAdd size={20} color="currentColor" variant={bookmarked ? 'Bold' : 'Linear'} />
            </button>
            <button type="button" className="lf-menu__item ui-disabled" disabled>
              <span>Share</span>
              <Send2 size={20} color="currentColor" variant="Linear" />
            </button>
            <button type="button" className="lf-menu__item ui-disabled" disabled>
              <span>Comments</span>
              <MessageText1 size={20} color="currentColor" variant="Linear" />
            </button>
          </div>

          <div className="lf-episodes">
            {episodes.map((ep, i) => (
              <EpisodeCard key={i} ep={ep} />
            ))}
          </div>
        </div>

        <div className="lf-quiz">
          <span className="lf-quiz__mark" aria-hidden="true">?</span>
          <p className="lf-quiz__text">
            Answer the Quiz at the end of this lesson and earn {lesson.quizPoints} Skill Points
          </p>
        </div>
        {panel && (
          <section
            className={`lf-sheet${closing ? ' lf-sheet--closing' : ''}`}
            onAnimationEnd={(e) => {
              if (closing && e.target === e.currentTarget) {
                setPanel(null)
                setClosing(false)
              }
            }}
            aria-label={panel === 'learnings' ? 'Learnings' : 'Resources'}>
            <div className="lf-sheet__header">
              <h2 className="lf-sheet__title">{panel === 'learnings' ? 'Learnings' : `Resources (${resources.length})`}</h2>
              <CloseButton onClick={closePanel} ariaLabel="Back to the lesson" />
            </div>
            <div className="lf-sheet__divider" />

            <div className="lf-sheet__body">
              {panel === 'learnings' && lesson.learningGoals?.length ? (
                <section className="lf-learn">
                  <h3 className="lf-learn__head">
                    <img
                      className="lf-learn__icon"
                      src={getLearningsIllustration('learning-goals')}
                      alt=""
                      width={20}
                      height={20}
                    />
                    Learning goals
                  </h3>
                  <div className="lf-learn__card">
                    <ul className="lf-learn__points">
                      {lesson.learningGoals.map((goal) => (
                        <li key={goal}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              ) : null}

              {panel === 'learnings' && lesson.keyConcepts?.length ? (
                <section className="lf-learn">
                  <h3 className="lf-learn__head">
                    <img
                      className="lf-learn__icon"
                      src={getLearningsIllustration('key-concepts')}
                      alt=""
                      width={20}
                      height={20}
                    />
                    Key concepts
                  </h3>
                  {lesson.keyConcepts.map((concept) => (
                    <div className="lf-learn__card" key={concept.heading}>
                      <p className="lf-learn__concept">{concept.heading}</p>
                      <ul className="lf-learn__points">
                        {concept.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              ) : null}

              {/* The resources, then the instructor's own page as a plain link below
                  them (Figma Lessons-Feed 10761:5563). */}
              {panel === 'deep-dive' && (
                <div className="lf-deep">
                <div className="lf-resources">
                  {resources.map((r) => (
                    <ResourceCard
                      key={r.id}
                      device="mobile"
                      type={r.type}
                      title={r.title}
                      size={r.size}
                      onOpen={() =>
                        r.url
                          ? window.open(r.url, '_blank', 'noopener,noreferrer')
                          : showToast('success', `Downloading ${r.title}`)
                      }
                    />
                  ))}
                </div>
                  {lesson.deepDiveUrl && (
                    <a
                      className="lf-info__link lf-deep__link"
                      href={lesson.deepDiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Link21 size={16} color="currentColor" variant="Linear" aria-hidden="true" />
                      {lesson.deepDiveUrl.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </aside>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default LessonFeed
