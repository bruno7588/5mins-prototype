import { useEffect, useState } from 'react'
import {
  ArchiveAdd,
  ArrowDown2,
  ArrowUp2,
  Maximize4,
  MessageText,
  More,
  Send2,
} from 'iconsax-react'
import CloseButton from '../../../components/CloseButton/CloseButton'
import ResourceCard from '@/components/ResourceCard/ResourceCard'
import Tooltip from '@/components/Tooltip/Tooltip'
import { getLearningsIllustration } from '../../../assets/learnings-illustrations'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
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

type LessonTab = 'episodes' | 'resources' | 'learnings'

interface LessonFeedProps {
  lessons: FeedLesson[]
  startIndex: number
  onClose: () => void
}

function LessonFeed({ lessons, startIndex, onClose }: LessonFeedProps) {
  const [active, setActive] = useState(startIndex)
  const [following, setFollowing] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [tab, setTab] = useState<LessonTab>('episodes')
  const { toasts, show: showToast, dismiss: dismissToast } = useToast()

  const resources = lessons[active]?.resources ?? []

  const lesson = lessons[active]
  const hasLearnings = Boolean(lesson?.learningGoal || lesson?.keyConcepts?.length)

  /* A tab with nothing behind it is a dead end, so each appears only when the
     lesson has that content, in a fixed order so the survivors never swap places.
     Episodes is series navigation, not content: with a single episode the card
     would restate the lesson you are already watching, so it earns no tab. */
  const episodes = lesson?.episodes ?? []
  const tabs: { key: LessonTab; label: string; count?: number }[] = [
    ...(episodes.length > 1 ? [{ key: 'episodes' as const, label: 'Episodes' }] : []),
    ...(resources.length ? [{ key: 'resources' as const, label: 'Resources', count: resources.length }] : []),
    ...(hasLearnings ? [{ key: 'learnings' as const, label: 'Learnings' }] : []),
  ]
  /* The stored tab may not exist on the lesson just swiped to. */
  const current = tabs.find((t) => t.key === tab) ?? tabs[0]

  const atFirst = active === 0
  const atLast = active === lessons.length - 1

  // Reset per-lesson toggles when navigating.
  useEffect(() => {
    setFollowing(false)
    setBookmarked(false)
    setTab('episodes')
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
          {/* Bookmark / Share / Comments act on the lesson, so they sit with the
              lesson's identity — the tab row below is navigation only. Icon-only
              per Figma 6574:54271, each naming itself on hover. All three read as
              enabled for visual consistency; only Bookmark is wired. */}
          <div className="lf-social">
            <Tooltip text={bookmarked ? 'Bookmarked' : 'Bookmark'} position="Top" icon={false}>
              <button
                type="button"
                className="lf-social__item"
                onClick={() => setBookmarked((b) => !b)}
                aria-pressed={bookmarked}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
              >
                <ArchiveAdd size={20} color="currentColor" variant={bookmarked ? 'Bold' : 'Linear'} />
              </button>
            </Tooltip>
            <Tooltip text="Share" position="Top" icon={false}>
              <button type="button" className="lf-social__item" aria-label="Share this lesson">
                <Send2 size={20} color="currentColor" variant="Linear" />
              </button>
            </Tooltip>
            <Tooltip text="Comments" position="Top" icon={false}>
              <button type="button" className="lf-social__item" aria-label="Comments on this lesson">
                <MessageText size={20} color="currentColor" variant="Linear" />
              </button>
            </Tooltip>
          </div>

          {tabs.length > 1 && (
            <div className="lf-tabs" role="tablist" aria-label="Lesson details">
              {tabs.map(({ key, label, count }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={current?.key === key}
                  className={`lf-tab${current?.key === key ? ' lf-tab--active' : ''}`}
                  onClick={() => setTab(key)}
                >
                  <span className="lf-tab__label">
                    {label}
                    {count ? <span className="lf-tab__count">{count}</span> : null}
                  </span>
                  <span className="lf-tab__indicator" />
                </button>
              ))}
            </div>
          )}

          {/* One section gets no heading at all: a tablist of one is not a choice,
              and the section already names itself — Learnings carries its own
              "Learning goals" and "Key concepts" subheads, resources are a list of
              file cards. A label above either just repeats them. */}

          <div className="lf-tabpanel">
          {current?.key === 'episodes' && (
            <div className="lf-episodes">
              {episodes.map((ep, i) => (
                <EpisodeCard key={i} ep={ep} />
              ))}
            </div>
          )}

          {current?.key === 'resources' && (
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
          )}

          {current?.key === 'learnings' && (
            <div className="lf-learnings">
              {lesson.learningGoal && (
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
                    <p className="lf-learn__goal">{lesson.learningGoal}</p>
                  </div>
                </section>
              )}
              {lesson.keyConcepts?.length ? (
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
            </div>
          )}
          </div>
        </div>


        <div className="lf-quiz">
          <span className="lf-quiz__mark" aria-hidden="true">?</span>
          <p className="lf-quiz__text">
            Answer the Quiz at the end of this lesson and earn {lesson.quizPoints} Skill Points
          </p>
        </div>
      </aside>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default LessonFeed
