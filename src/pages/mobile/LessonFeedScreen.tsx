import { useLayoutEffect, useRef, useState } from 'react'
import {
  ArchiveAdd,
  Backward10Seconds,
  Discover,
  Forward10Seconds,
  MessageText1,
  More,
  PlayCircle,
  Send2,
} from 'iconsax-react'
import Avatar from '@/components/Avatar/Avatar'
import { getLevelIllustration } from '@/assets/level-illustrations'
import type { FeedLesson } from '@/pages/for-you/feedItems'
import './LessonFeedScreen.css'

/* Mock comment counts; the feed has no comments data yet. */
const COMMENT_COUNTS = [159, 42, 87, 23, 64]

interface LessonFeedScreenProps {
  lessons: FeedLesson[]
  startIndex: number
  /** Opens the lesson's details sheet ("more"). */
  onMore: (index: number) => void
  /** The lesson whose sheet is open: it shows paused underneath. */
  sheetIndex: number | null
  /** Reports the lesson in view, so the feed reopens there after a detour. */
  onIndexChange?: (index: number) => void
}

/* Share the feed's sidebar action layout: icon over a 10px label. Not built in the
   prototype yet, so they are inert. */
function SideAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button type="button" className="m-lf-side__action">
      <span className="m-lf-side__icon">{icon}</span>
      <span className="m-lf-side__label">{label}</span>
    </button>
  )
}

/**
 * Mobile lessons feed (Figma Lessons-Feed 10748:32498): one full-screen lesson per
 * page, swiped vertically (scroll snap). Tapping the video pauses it and shows the
 * 10-second skip controls; "more" opens the lesson sheet.
 */
function LessonFeedScreen({ lessons, startIndex, onMore, sheetIndex, onIndexChange }: LessonFeedScreenProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState<Set<number>>(new Set())

  /* Land on the lesson that was tapped, once, on mount. Re-running this as the
     reported index changes would yank the feed mid-swipe. */
  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = startIndex * el.clientHeight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const togglePause = (i: number) =>
    setPaused((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <div
      className="m-lf"
      ref={scrollerRef}
      onScroll={(e) => onIndexChange?.(Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight))}
    >
      {lessons.map((lesson, i) => {
        const isPaused = paused.has(i) || sheetIndex === i
        return (
          <section key={lesson.title} className="m-lf-slide" aria-label={lesson.title}>
            <img className="m-lf-slide__media" src={lesson.media} alt="" />
            <div className="m-lf-slide__shade" aria-hidden="true" />

            {/* The whole video is the play / pause target. */}
            <button
              type="button"
              className="m-lf-slide__tap"
              aria-label={isPaused ? 'Play lesson' : 'Pause lesson'}
              onClick={() => togglePause(i)}
            />

            {isPaused && (
              <div className="m-lf-play" aria-hidden="true">
                <Backward10Seconds size={32} color="var(--neutral-0)" variant="Bold" />
                <PlayCircle size={48} color="var(--neutral-0)" variant="Bold" />
                <Forward10Seconds size={32} color="var(--neutral-0)" variant="Bold" />
              </div>
            )}

            <div className="m-lf-info">
              <p className="m-lf-info__title">
                {lesson.title}{' '}
                <button type="button" className="m-lf-info__more" onClick={() => onMore(i)}>
                  more
                </button>
              </p>
              <span className="m-lf-info__skill">
                <img src={getLevelIllustration(lesson.skillLevel, { size: 'small' })} alt="" width={20} height={20} />
                {lesson.skillName}
              </span>
            </div>

            <div className="m-lf-side">
              <Avatar src={lesson.instructorAvatar} size={48} className="m-lf-side__avatar" />
              <SideAction icon={<Discover size={24} color="var(--neutral-0)" variant="Linear" />} label="Learnings" />
              <SideAction icon={<ArchiveAdd size={24} color="var(--neutral-0)" variant="Linear" />} label="Bookmark" />
              <SideAction icon={<Send2 size={24} color="var(--neutral-0)" variant="Linear" />} label="Send" />
              <SideAction
                icon={<MessageText1 size={24} color="var(--neutral-0)" variant="Linear" />}
                label={`${COMMENT_COUNTS[i % COMMENT_COUNTS.length]} Comments`}
              />
              <button type="button" className="m-lf-side__more" aria-label="More options">
                <More size={32} color="var(--neutral-0)" variant="Linear" style={{ transform: 'rotate(90deg)' }} />
              </button>
              <span className="m-lf-side__time">{lesson.duration.padStart(5, '0')}</span>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default LessonFeedScreen
