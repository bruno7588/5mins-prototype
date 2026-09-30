import Avatar from '@/components/Avatar/Avatar'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import Button from '@/components/Button/Button'
import ResourceCard from '@/components/ResourceCard/ResourceCard'
import { getLevelIllustration } from '@/assets/level-illustrations'
import type { FeedLesson } from '@/pages/for-you/feedItems'
import './LessonFeedScreen.css'

interface LessonSheetProps {
  lesson: FeedLesson
  onClose: () => void
  /** Opens a link in the in-app web view; `kind` picks the screen title. */
  onOpenLink: (url: string, kind: 'deep-dive' | 'resource') => void
  /** A file resource was tapped; the prototype confirms with a toast. */
  onDownload: (title: string) => void
  /** A web view it opened is on top: stay open, out of sight. */
  hidden?: boolean
}

/**
 * The lesson sheet behind "more" (Figma Lessons-Feed 10752:24652), in the shared
 * BottomSheet: instructor, the skill it builds, and Resources.
 */
function LessonSheet({ lesson, onClose, onOpenLink, onDownload, hidden }: LessonSheetProps) {
  const deepDiveLabel = lesson.deepDiveUrl?.replace(/^https?:\/\/(www\.)?/, '')

  return (
    <BottomSheet onClose={onClose} ariaLabel={`About ${lesson.title}`} hidden={hidden}>
      <div className="m-lsheet">
        <div className="m-lsheet__about">
          <div className="m-lsheet__instructor">
            <Avatar src={lesson.instructorAvatar} size={48} />
            <div className="m-lsheet__who">
              <p className="m-lsheet__name">{lesson.instructor}</p>
              {lesson.instructorBio && <p className="m-lsheet__bio">{lesson.instructorBio}</p>}
            </div>
          </div>
          <div className="m-lsheet__skills">
            <span className="m-lsheet__skill">
              <img src={getLevelIllustration(lesson.skillLevel, { size: 'small' })} alt="" width={16} height={16} />
              {lesson.skillName}
            </span>
          </div>
        </div>

        {/* As on desktop: the resources, then the instructor's own page
            as a plain link below them (Figma Lessons-Feed 10761:5563). */}
        {(lesson.deepDiveUrl || lesson.resources?.length) && (
          <div className="m-lsheet__more">
            <section className="m-lsheet__section">
              {lesson.resources?.length ? (
                <h3 className="m-lsheet__heading">Resources ({lesson.resources.length})</h3>
              ) : null}
              {lesson.resources?.map((r) => (
                <ResourceCard
                  key={r.id}
                  device="mobile"
                  tooltip={false}
                  type={r.type}
                  title={r.title}
                  size={r.size}
                  onOpen={() => (r.url ? onOpenLink(r.url, 'resource') : onDownload(r.title))}
                />
              ))}
              {lesson.deepDiveUrl && (
                <Button variant="link" className="m-lsheet__link" onClick={() => onOpenLink(lesson.deepDiveUrl!, 'deep-dive')}>
                  {deepDiveLabel}
                </Button>
              )}
            </section>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

export default LessonSheet
