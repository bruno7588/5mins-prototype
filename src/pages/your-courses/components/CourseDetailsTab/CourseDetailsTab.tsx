import { useLayoutEffect, useRef, useState } from 'react'
import { Danger, GalleryAdd } from 'iconsax-react'
import Button from '@/components/Button/Button'
import SparkleIcon from '@/components/icons/SparkleIcon'
import AddImageModal from '@/pages/add-content/components/AddImageModal/AddImageModal'
import { autoGrow } from '../InteractiveDrawer/autoGrow'
import defaultThumbnail from '@/assets/programs/course-thumbs/course-thumb-1.jpg'
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

  /* The description grows with its content; height must reset to auto before
     reading scrollHeight or the box can only ever get taller. */
  const descRef = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    autoGrow(descRef.current)
  }, [draft.description])

  const set = (patch: Partial<CourseDetailsDraft>) => onChange({ ...draft, ...patch })

  return (
    <div className="cdt">
      {/* Inline input (input.md): 4px gap, Bold 32 title over Regular 16 description.
          Enabled → Active → Filled, plus the Error state: red title, a 24px Danger
          at the row end and a message under the title. No hover, no focus box —
          the type scale is the whole affordance. */}
      <div className="cdt-headline">
        <div className="cdt-headline__row">
          <input
            className={`cdt-headline__title${titleError ? ' cdt-headline__title--error' : ''}`}
            placeholder="Add Title"
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            onBlur={() => setTitleBlurred(true)}
            aria-label="Course title"
            aria-invalid={titleError || undefined}
            aria-describedby={titleError ? 'cdt-title-error' : undefined}
          />
          {titleError && (
            <Danger size={24} color="var(--text-error)" variant="Linear" aria-hidden="true" />
          )}
        </div>
        {titleError && (
          <span className="cdt-headline__error" id="cdt-title-error" role="alert">
            Your course needs a title
          </span>
        )}
        <textarea
          ref={descRef}
          className="cdt-headline__desc"
          rows={1}
          placeholder="Add a description"
          value={draft.description}
          onInput={(e) => autoGrow(e.currentTarget)}
          onChange={(e) => set({ description: e.target.value })}
          aria-label="Course description"
        />
      </div>

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
              <Button
                variant="outlined-2"
                icon={<SparkleIcon size={20} color="currentColor" />}
                onClick={() => setImageModalOpen(true)}
              >
                {draft.thumbnail ? 'Change Thumbnail' : 'Add Thumbnail'}
              </Button>
              {draft.thumbnail && (
                <Button variant="text" onClick={() => set({ thumbnail: '' })}>
                  Remove
                </Button>
              )}
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
