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
}

/**
 * The lesson sheet behind "more" (Figma Lessons-Feed 10752:24652), in the shared
 * BottomSheet: instructor, the skill it builds, Take a deep dive and Resources.
 */
function LessonSheet({ lesson, onClose, onOpenLink }: LessonSheetProps) {
  const deepDiveLabel = lesson.deepDiveUrl?.replace(/^https?:\/\/(www\.)?/, '')

  return (
    <BottomSheet onClose={onClose} ariaLabel={`About ${lesson.title}`}>
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

        {(lesson.deepDiveUrl || lesson.resources?.length) && (
          <div className="m-lsheet__more">
            {lesson.deepDiveUrl && (
              <section className="m-lsheet__section m-lsheet__section--link">
                <h3 className="m-lsheet__heading">Take a deep dive</h3>
                <Button variant="link" onClick={() => onOpenLink(lesson.deepDiveUrl!, 'deep-dive')}>
                  {deepDiveLabel}
                </Button>
              </section>
            )}
            {lesson.resources?.length ? (
              <section className="m-lsheet__section">
                <h3 className="m-lsheet__heading">Resources</h3>
                {lesson.resources.map((r) => (
                  <ResourceCard
                    key={r.id}
                    device="mobile"
                    type={r.type}
                    title={r.title}
                    size={r.size}
                    onOpen={r.url ? () => onOpenLink(r.url!, 'resource') : undefined}
                    openDisabled={!r.url}
                  />
                ))}
              </section>
            ) : null}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

export default LessonSheet
