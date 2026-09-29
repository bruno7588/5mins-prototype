import { useEffect, useState } from 'react'
import {
  ArchiveAdd,
  ArrowDown2,
  ArrowUp2,
  Discover,
  MessageText1,
  Send2,
} from 'iconsax-react'
import CloseButton from '../../../components/CloseButton/CloseButton'
import Avatar from '@/components/Avatar/Avatar'
import ResourceCard from '@/components/ResourceCard/ResourceCard'
import { getLearningsIllustration } from '../../../assets/learnings-illustrations'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { getLevelIllustration } from '../../../assets/level-illustrations'
import type { FeedEpisode, FeedLesson } from '../feedItems'
import './LessonFeed.css'

/* Player controls, from Figma Course feed 17024:79675 (ai/AiOutlineExpand) and
   17024:79678 (ri/RiMoreLine). Filled glyphs, so they take currentColor as fill. */
const ExpandIcon = () => (
  <svg width="21" height="21" viewBox="0 0 21.1765 21.1765" fill="currentColor" aria-hidden="true">
    <path d="M7.0726 1.81984H2.4816C2.11556 1.81984 1.81984 2.11556 1.81984 2.4816V7.11396C1.81984 7.29594 1.96874 7.44484 2.15072 7.44484H3.14337C3.32535 7.44484 3.47425 7.29594 3.47425 7.11396V3.47425H7.0726C7.25458 3.47425 7.40348 3.32535 7.40348 3.14337V2.15072C7.40348 1.96874 7.25458 1.81984 7.0726 1.81984ZM19.0257 13.7316H18.0331C17.8511 13.7316 17.7022 13.8805 17.7022 14.0625V17.7022H14.1038C13.9219 17.7022 13.773 17.8511 13.773 18.0331V19.0257C13.773 19.2077 13.9219 19.3566 14.1038 19.3566H18.6948C19.0609 19.3566 19.3566 19.0609 19.3566 18.6948V14.0625C19.3566 13.8805 19.2077 13.7316 19.0257 13.7316ZM7.0726 17.7022H3.47425V14.0625C3.47425 13.8805 3.32535 13.7316 3.14337 13.7316H2.15072C1.96874 13.7316 1.81984 13.8805 1.81984 14.0625V18.6948C1.81984 19.0609 2.11556 19.3566 2.4816 19.3566H7.0726C7.25458 19.3566 7.40348 19.2077 7.40348 19.0257V18.0331C7.40348 17.8511 7.25458 17.7022 7.0726 17.7022ZM18.6948 1.81984H14.1038C13.9219 1.81984 13.773 1.96874 13.773 2.15072V3.14337C13.773 3.32535 13.9219 3.47425 14.1038 3.47425H17.7022V7.11396C17.7022 7.29594 17.8511 7.44484 18.0331 7.44484H19.0257C19.2077 7.44484 19.3566 7.29594 19.3566 7.11396V2.4816C19.3566 2.11556 19.0609 1.81984 18.6948 1.81984Z" />
  </svg>
)

const MoreIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M6 14C4.9 14 4 14.9 4 16C4 17.1 4.9 18 6 18C7.1 18 8 17.1 8 16C8 14.9 7.1 14 6 14ZM26 14C24.9 14 24 14.9 24 16C24 17.1 24.9 18 26 18C27.1 18 28 17.1 28 16C28 14.9 27.1 14 26 14ZM16 14C14.9 14 14 14.9 14 16C14 17.1 14.9 18 16 18C17.1 18 18 17.1 18 16C18 14.9 17.1 14 16 14Z" />
  </svg>
)

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
  const { toasts, show: showToast, dismiss: dismissToast } = useToast()

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
        <div className="lf-stage">
          <div className="lf-video-wrap">
            <CloseButton variant="fullscreen" className="lf-close" onClick={onClose} ariaLabel="Close lesson feed" />
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
            <Avatar src={lesson.instructorAvatar} size={40} />
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
            {lesson.deepDiveUrl || resources.length ? (
              <button type="button" className="lf-info__link" onClick={() => setPanel('deep-dive')}>
                Take a deep dive
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
              onClick={() => setBookmarked((b) => !b)}
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
            aria-label={panel === 'learnings' ? 'Learnings' : 'Take a deep dive'}>
            <div className="lf-sheet__header">
              <h2 className="lf-sheet__title">{panel === 'learnings' ? 'Learnings' : 'Take a deep dive'}</h2>
              <CloseButton onClick={closePanel} ariaLabel="Back to the lesson" />
            </div>
            <div className="lf-sheet__divider" />

            <div className={`lf-sheet__body${panel === 'deep-dive' ? ' lf-sheet__body--deep' : ''}`}>
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

              {panel === 'deep-dive' && (
                <>
                  {/* Where the link used to go straight to: the instructor's own page. */}
                  {lesson.deepDiveUrl && (
                    <section className="lf-learn lf-learn--tight">
                      <h3 className="lf-learn__head lf-learn__head--secondary">Learn more</h3>
                      <a
                        className="lf-info__link lf-deep__link"
                        href={lesson.deepDiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {lesson.deepDiveUrl.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </section>
                  )}
                  {resources.length > 0 && (
                    <section className="lf-learn">
                      <h3 className="lf-learn__head lf-learn__head--secondary">Resources</h3>
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
                                : showToast('info', `Downloading ${r.title}`)
                            }
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </section>
        )}
      </aside>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default LessonFeed
