import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Add, GalleryAdd, Trash } from 'iconsax-react'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import SectionHeader from '../SectionHeader/SectionHeader'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Checkbox from '@/components/Checkbox/Checkbox'
import AIImageIcon from '@/components/icons/AIImageIcon'
import CloseButton from '@/components/CloseButton/CloseButton'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import DesktopPreview from '@/components/DesktopPreview/DesktopPreview'
import FileUploader from '@/components/FileUploader/FileUploader'
import InputField from '@/components/InputField/InputField'
import Radio from '@/components/Radio/Radio'
import Tooltip from '@/components/Tooltip/Tooltip'
import AddImageModal from '@/pages/add-content/components/AddImageModal/AddImageModal'
import { QuizFooterLayoutContext } from '@/pages/quiz-lab/components/FeedbackFooter'
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
import ImageChoice from '@/pages/quiz-lab/formats/ImageChoice'
import SingleChoice from '@/pages/quiz-lab/formats/SingleChoice'
import '@/pages/quiz-lab/quiz-lab.css'
import './AssessmentModal.css'

/** Image options (DES-345): 10MB each, any of these formats. */
const OPTION_IMAGE_MAX_BYTES = 10 * 1024 * 1024
/** Image Choice takes 2 to 4 images; the field label says so before the admin reaches it. */
const MAX_IMAGE_OPTIONS = 4
/** An image's optional label: one short line under it for the learner (2 lines on mobile). */
const MAX_IMAGE_LABEL = 40
const OPTION_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

async function validateOptionImage(file: File): Promise<string | null> {
  if (!OPTION_IMAGE_TYPES.includes(file.type)) return 'Use a JPG, PNG, WebP or GIF image.'
  if (file.size > OPTION_IMAGE_MAX_BYTES) return 'This image is over 10MB. Choose a smaller file.'
  return null
}

const typeConfig: Record<AssessmentType, { title: string; subtitle: string }> = {
  'single-choice': {
    title: 'Add assessment - Multiple Choice',
    subtitle: 'Users can select one correct choice',
  },
  'image-choice': {
    title: 'Add assessment - Image Choice',
    subtitle: 'Users can select one or more correct images',
  },
  'short-text': {
    title: 'Add assessment - Short text',
    subtitle: 'Users can submit a text response',
  },
  exercise: {
    title: 'Add assessment - Exercise',
    subtitle: 'Users can upload files such as video, audio, image, excel, and PDF',
  },
  poll: {
    title: 'Add assessment - Poll',
    subtitle: 'Users vote on one of the options',
  },
}

export interface AssessmentData {
  type: AssessmentType
  question: string
  options: string[]
  correctIndex: number
  /** Image Choice only (DES-345): every option is an image and one or more are
      correct; `options` then holds each image's optional label (empty when none). */
  optionImages?: string[]
  correctIndices?: number[]
  explanation?: string
}

interface AssessmentModalProps {
  type: AssessmentType
  /** Prefilled when reopened from the course outline; null when creating. */
  initial?: AssessmentData | null
  onClose: () => void
  onAdd: (data: AssessmentData) => void
  sidebarIcons?: React.ReactNode
  /* 'modal' (default) renders its own overlay + sliding panel; 'drawer' renders just
     the form body so it can live inside the shared ContentDrawer shell. */
  variant?: 'modal' | 'drawer'
}

function AssessmentModal({ type, initial = null, onClose, onAdd, sidebarIcons, variant = 'modal' }: AssessmentModalProps) {
  const isEdit = !!initial
  const [closing, setClosing] = useState(false)
  const [question, setQuestion] = useState(initial?.question ?? '')
  const [options, setOptions] = useState(initial?.options ?? ['', ''])
  const [correctIndex, setCorrectIndex] = useState(initial?.correctIndex ?? 0)
  const [explanation, setExplanation] = useState(initial?.explanation ?? '')

  /* Image Choice options: the tiles, and which of them are correct. Like Multiple Choice,
     a new question starts with the first option marked correct. */
  const [images, setImages] = useState<(string | null)[]>(initial?.optionImages ?? [null, null])
  const [correctImages, setCorrectImages] = useState<number[]>(initial?.correctIndices ?? [0])
  /** One optional label per option, kept in step with `images`. */
  const [labels, setLabels] = useState<string[]>(() =>
    initial?.optionImages ? initial.optionImages.map((_, i) => initial.options[i] ?? '') : ['', ''],
  )
  /** The option the image picker is filling, or null while it is closed. */
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)
  /** A dropped file that failed validation, by option, shown in that tile's uploader. */
  const [dropErrors, setDropErrors] = useState<Record<number, string>>({})
  const [previewing, setPreviewing] = useState(false)

  const config = typeConfig[type]
  const isImageMode = type === 'image-choice'

  const handleClose = () => {
    // In drawer mode the ContentDrawer shell owns the slide-out animation.
    if (variant === 'drawer') {
      onClose()
      return
    }
    setClosing(true)
    setTimeout(onClose, 300)
  }

  const handleAddOption = () => {
    setOptions(prev => [...prev, ''])
  }

  const handleOptionChange = (index: number, value: string) => {
    setOptions(prev => prev.map((opt, i) => (i === index ? value : opt)))
  }

  /* Removing shifts every later option up one, so the correct marks move with them. */
  const handleRemoveImageOption = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setLabels(prev => prev.filter((_, i) => i !== index))
    setDropErrors({})
    setCorrectImages(prev => prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i)))
  }

  const placeImage = (index: number, url: string) => {
    setImages(prev => prev.map((s, i) => (i === index ? url : s)))
  }

  const handleAddImageOption = () => {
    if (images.length >= MAX_IMAGE_OPTIONS) return
    setImages(prev => [...prev, null])
    setLabels(prev => [...prev, ''])
  }

  /* A file dropped on an empty tile skips the picker: checked, then shown as is. */
  const handleDroppedImage = async (index: number, file: File) => {
    const error = await validateOptionImage(file)
    setDropErrors(prev => {
      const next = { ...prev }
      if (error) next[index] = error
      else delete next[index]
      return next
    })
    if (error) return
    placeImage(index, URL.createObjectURL(file))
  }

  const toggleCorrectImage = (index: number) => {
    setCorrectImages(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]))
  }

  /* Empty tiles are dropped on save; the correct marks are re-pointed at what is left. */
  const filledImages = images.flatMap((src, index) => (src ? [{ src, index }] : []))
  const savedImages = filledImages.map(f => f.src)
  const savedLabels = filledImages.map(f => (labels[f.index] ?? '').trim())
  const savedCorrect = filledImages.flatMap((f, i) => (correctImages.includes(f.index) ? [i] : []))

  const handleSubmit = () => {
    onAdd({
      type,
      question,
      options: isImageMode ? savedLabels : options,
      correctIndex: isImageMode ? savedCorrect[0] : correctIndex,
      optionImages: isImageMode ? savedImages : undefined,
      correctIndices: isImageMode ? savedCorrect : undefined,
      explanation: hasExplanation ? explanation.trim() || undefined : undefined,
    })
  }

  /* Only the pick-one formats give the learner options to choose between; short
     text is answered in their own words and an exercise by uploading a file. */
  const hasOptions = type === 'single-choice' || type === 'poll'
  /* An explanation explains the *correct* answer, so it needs one to exist —
     which rules out the poll (no right answer) as well as the two open formats.
     Image Choice has none either: the marks on the images show why. */
  const hasExplanation = type === 'single-choice'

  const canSubmit = isImageMode
    ? question.trim().length > 0 && savedImages.length >= 2 && savedCorrect.length > 0
    : question.trim().length > 0 && (!hasOptions || options.some((o) => o.trim().length > 0))

  /* The learner's own renderer, fed the draft as it stands. */
  const previewQuestion = !canSubmit || (type !== 'single-choice' && !isImageMode)
    ? null
    : isImageMode
      ? { type: 'image-choice' as const, prompt: question, images: savedImages, labels: savedLabels, correctIndices: savedCorrect }
      : { type: 'single-choice' as const, prompt: question, options: options.filter(o => o.trim()), correctIndex, explanation: explanation.trim() || undefined }

  const formContent = (
        <div className={`assessment-modal-content${variant === 'drawer' ? ' assessment-modal-content--drawer' : ''}`}>
        {/* Header */}
        <SectionHeader
          title={isEdit ? config.title.replace('Add assessment', 'Edit assessment') : config.title}
          description={config.subtitle}
          ctas={<CloseButton onClick={handleClose} />}
        />

        {/* Form */}
        <div className="assessment-modal-body">
          {/* Question */}
          <InputField
            label="Question"
            placeholder="Write your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {/* Image options: one row each, the square image beside its label and Correct mark. */}
          {isImageMode && (
            <div className="assessment-modal-field">
              <span className="assessment-modal-label">
                Images{' '}
                <span className="assessment-modal-label-hint assessment-modal-label-hint--images">(max. {MAX_IMAGE_OPTIONS} images • JPG, PNG, WebP, GIF • max. 10MB)</span>
              </span>
              <div className="assessment-modal-image-grid">
                {images.map((src, index) => (
                  <div className="assessment-modal-image-option" key={index}>
                    {src ? (
                      <div className={`assessment-modal-image-tile${correctImages.includes(index) ? ' assessment-modal-image-tile--correct' : ''}`}>
                        <img className="assessment-modal-image-tile-img" src={src} alt={`Option ${index + 1}`} />
                        <div className="assessment-modal-image-tile-actions">
                          <Tooltip text="Replace image" icon={false}>
                            <button
                              className="assessment-modal-image-tile-action"
                              type="button"
                              aria-label="Replace image"
                              onClick={() => setPickerIndex(index)}
                            >
                              <GalleryAdd size={16} color="var(--neutral-0)" variant="Linear" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    ) : (
                      /* DS uploader, size S. Dropping a file fills the tile straight away;
                         Add Image opens the three-tab picker (D13). */
                      <FileUploader
                        size="S"
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        helpText=""
                        buttonLabel="Add Image"
                        className="assessment-modal-image-uploader"
                        icon={<AIImageIcon size={32} color="var(--text-secondary)" />}
                        state={dropErrors[index] ? 'Error' : 'Enabled'}
                        errorMessage={dropErrors[index]}
                        onBrowse={() => setPickerIndex(index)}
                        onFileSelect={(file) => handleDroppedImage(index, file)}
                      />
                    )}
                    <div className="assessment-modal-image-fields">
                    {/* Optional words under the image for the learner, on every option, so an
                        empty one can be named before its image is added. */}
                    <InputField
                      className="assessment-modal-image-label"
                      label={<>Label <span className="assessment-modal-label-hint">(optional)</span></>}
                      placeholder="Add a label"
                      value={labels[index] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, MAX_IMAGE_LABEL)
                        setLabels(prev => prev.map((l, i) => (i === index ? value : l)))
                      }}
                    />
                    <div className="assessment-modal-image-correct">
                      {/* A label, so the word toggles the box too. Correct reads green, as on a
                          Multiple Choice option: the tick here and the image's border above. A
                          checkbox, not a radio, because several images can be right. */}
                      <label className={`assessment-modal-image-correct-mark${src ? '' : ' assessment-modal-image-correct-mark--disabled'}`}>
                        <Checkbox
                          checked={correctImages.includes(index)}
                          disabled={!src}
                          onChange={() => toggleCorrectImage(index)}
                          ariaLabel={`Mark option ${index + 1} as correct`}
                        />
                        {/* Once marked, the word becomes the Multiple Choice Correct badge. */}
                        {correctImages.includes(index) ? (
                          <Badge type="success" label="Correct" className="assessment-modal-correct-badge" />
                        ) : (
                          <span aria-hidden="true">Correct</span>
                        )}
                      </label>
                      {/* Remove sits here for every option, filled or empty, once there are more
                          than two: it removes the option, not just its image. */}
                      {images.length > 2 && (
                        <Tooltip text="Remove option" icon={false} className="assessment-modal-image-correct-remove">
                          <button
                            className="assessment-modal-image-remove"
                            type="button"
                            aria-label="Remove option"
                            onClick={() => handleRemoveImageOption(index)}
                          >
                            <Trash size={20} color="currentColor" variant="Linear" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Adds an empty option: the text button under the list, as Add Pair, Add Item
                  and Add Step do on the other assessments. Gone at the limit; the label states it. */}
              {images.length < MAX_IMAGE_OPTIONS && (
              <div className="assessment-modal-image-add-row">
                <Button
                  variant="text"
                  className="assessment-modal-image-add"
                  icon={<Add size={20} color="currentColor" variant="Linear" />}
                  onClick={handleAddImageOption}
                >
                  Add New Option
                </Button>
              </div>
              )}
            </div>
          )}

          {/* Options */}
          {hasOptions && !isImageMode && (
          <div className="assessment-modal-field">
            <span className="assessment-modal-label">What are the options?</span>
            <div className="assessment-modal-options">
              {options.map((opt, index) => (
                <div className="assessment-modal-option-field" key={index}>
                  <Radio
                    name="correct-option"
                    checked={correctIndex === index}
                    onChange={() => setCorrectIndex(index)}
                    aria-label={`Mark option ${index + 1} as the correct answer`}
                  />
                  <input
                    className="assessment-modal-option-input"
                    type="text"
                    placeholder={`Write option ${index + 1} here...`}
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {correctIndex === index && (
                    <Badge type="success" label="Correct" className="assessment-modal-correct-badge" />
                  )}
                </div>
              ))}
              <button className="assessment-modal-add-option" type="button" onClick={handleAddOption}>
                <Add size={24} color="currentColor" variant="Linear" />
                <span>Add Option</span>
              </button>
            </div>
          </div>
          )}

          {/* Explanation */}
          {hasExplanation && (
            <InputField
              label={
                <>
                  Add an explanation for the correct answer{' '}
                  <span className="assessment-modal-label-hint">(optional)</span>
                </>
              }
              placeholder="Write an explanation..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="assessment-modal-footer">
          <div className="assessment-modal-footer-actions">
            <Button onClick={handleSubmit} disabled={!canSubmit}>Save</Button>
            {/* As in the interactive drawer: beside Save, disabled until there is
                something to show. */}
            {(type === 'single-choice' || isImageMode) && (
              <Button variant="outlined-2" disabled={!previewQuestion} onClick={() => setPreviewing(true)}>
                Preview
              </Button>
            )}
          </div>
        </div>
        </div>
  )

  return (
    <>
      {variant === 'drawer' ? (
        formContent
      ) : (
        <>
          <div
            className={`assessment-modal-overlay${closing ? ' assessment-modal-overlay--closing' : ''}`}
            onClick={handleClose}
          />
          <aside
            className={`assessment-modal${closing ? ' assessment-modal--closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {formContent}
            {/* Collapsed sidebar icons on the right */}
            {sidebarIcons && (
              <div className="assessment-modal-sidebar">{sidebarIcons}</div>
            )}
          </aside>
        </>
      )}

    {/* Same picker as course and lesson thumbnails: upload, generate or stock (D13). */}
    <AddImageModal
      open={pickerIndex !== null}
      onClose={() => setPickerIndex(null)}
      onSelect={(url) => {
        if (pickerIndex !== null) placeImage(pickerIndex, url)
        if (pickerIndex !== null) setDropErrors(({ [pickerIndex]: _cleared, ...rest }) => rest)
        setPickerIndex(null)
      }}
      showSuggest={false}
      upload={{
        accept: '.jpg,.jpeg,.png,.webp,.gif',
        helpText: 'Drag and drop a JPG, PNG, WebP or GIF image, max 10MB',
        validate: validateOptionImage,
        confirm: true,
      }}
    />

    {/* The learner's view of the draft, at the desktop feed's panel size. Portalled,
        like the interactive drawer's, so the drawer's stacking context can't clip it. */}
    {createPortal(
      <ConfirmModal
        open={previewing && !!previewQuestion}
        onClose={() => setPreviewing(false)}
        className="iq-preview-modal"
        ariaLabel={`Preview - ${config.title}`}
      >
        {previewQuestion && (
          <div className="iq-drawer__preview-stage">
            <DesktopPreview className={previewQuestion.type === 'image-choice' ? 'assessment-modal-preview' : undefined}>
              <div className="ql-quizview">
                <QuizHeader
                  label={config.title.replace('Add assessment - ', '')}
                  showHearts={false}
                  showAttempts={false}
                  onClose={() => setPreviewing(false)}
                />
                {previewQuestion.type === 'image-choice' ? (
                  /* Medium button, stretched to the panel by AssessmentModal.css. */
                  <QuizFooterLayoutContext.Provider value="hug">
                    <ImageChoice question={previewQuestion} />
                  </QuizFooterLayoutContext.Provider>
                ) : (
                  <SingleChoice question={previewQuestion} />
                )}
              </div>
            </DesktopPreview>
          </div>
        )}
      </ConfirmModal>,
      document.body,
    )}
    </>
  )
}

export default AssessmentModal
