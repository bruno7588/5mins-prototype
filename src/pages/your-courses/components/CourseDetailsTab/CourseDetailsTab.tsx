import { useState } from 'react'
import { GalleryAdd } from 'iconsax-react'
import Button from '@/components/Button/Button'
import SparkleIcon from '@/components/icons/SparkleIcon'
import InputInline from '@/components/InputInline/InputInline'
import AddImageModal from '@/pages/add-content/components/AddImageModal/AddImageModal'
import defaultThumbnail from '@/assets/programs/course-thumbs/04.png'
import './CourseDetailsTab.css'

/* Stands in for the "automatically generated thumbnail" the copy promises, so a
   course never ships without artwork and the picker never blocks Create Course. */
export const DEFAULT_COURSE_THUMBNAIL = defaultThumbnail

export interface CourseDetailsDraft {
  title: string
  description: string
  /** Data URL from AddImageModal — upload, AI generation or stock all land here. */
  thumbnail: string
}

interface Props {
  draft: CourseDetailsDraft
  onChange: (next: CourseDetailsDraft) => void
}

/**
 * Create Course → Details tab (Figma 9044:77741 inline input, 9044:78406 thumbnail).
 *
 * Two blocks: the inline title/description editor — borderless by design, the text
 * styles are the affordance (input.md "Inline") — and the thumbnail picker, whose
 * dashed 160x90 box previews whatever the image modal returns.
 */
function CourseDetailsTab({ draft, onChange }: Props) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  /* A course can't be created untitled, but the error is held back until the
     admin has left the field — same blur gate the authoring drawers use, so an
     untouched form never opens in red. */
  const [titleBlurred, setTitleBlurred] = useState(false)
  const titleError = titleBlurred && !draft.title.trim()

  const set = (patch: Partial<CourseDetailsDraft>) => onChange({ ...draft, ...patch })

  return (
    <div className="cdt">
      {/* Inline input (input.md), size L. */}
      <InputInline
        size="L"
        title={draft.title}
        onTitleChange={(title) => set({ title })}
        onTitleBlur={() => setTitleBlurred(true)}
        titleAriaLabel="Course title"
        error={titleError ? 'Your course needs a title' : undefined}
        description={draft.description}
        onDescriptionChange={(description) => set({ description })}
        descriptionAriaLabel="Course description"
      />

      <section className="cdt-thumb">
        <h3 className="cdt-thumb__label">Course thumbnail</h3>
        <div className="cdt-thumb__row">
          {/* Dashed while empty; once picked the box IS the preview, so the border
              goes solid and the icon gives way to the image. */}
          <div
            className={`cdt-thumb__box${draft.thumbnail ? ' cdt-thumb__box--filled' : ''}`}
            style={draft.thumbnail ? { backgroundImage: `url(${draft.thumbnail})` } : undefined}
          >
            {!draft.thumbnail && (
              <GalleryAdd size={32} color="var(--text-secondary)" variant="Linear" />
            )}
          </div>
          <div className="cdt-thumb__info">
            <p className="cdt-thumb__copy">
              Upload image or generate with AI. If you don't add one, we'll use an
              automatically generated thumbnail.
            </p>
            <div className="cdt-thumb__actions">
              {/* No Remove: a course always carries artwork, so the only move is to
                  swap it for another. Removing would only ever put back the one the
                  course opened with. */}
              {/* Same button as the lesson editor's thumbnail row (LessonEditorModal),
                  down to the leading Linear sparkle, so the two read as one control. */}
              <Button
                variant="outlined-2"
                icon={<SparkleIcon size={20} variant="Linear" color="currentColor" />}
                onClick={() => setImageModalOpen(true)}
              >
                {draft.thumbnail ? 'Change Thumbnail' : 'Add Thumbnail'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Same picker the Program Builder uses — upload, Generate With AI, or stock. */}
      <AddImageModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={(url) => {
          set({ thumbnail: url })
          setImageModalOpen(false)
        }}
        showSuggest={false}
      />
    </div>
  )
}

export default CourseDetailsTab
