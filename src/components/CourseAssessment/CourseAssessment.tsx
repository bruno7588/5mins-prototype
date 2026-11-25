import { useContext, useId, useState } from 'react'
import Radio from '@/components/Radio/Radio'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import { FileUploader } from '@/components/FileUploader/FileUploader'
import ResourceCard, { type ResourceType } from '@/components/ResourceCard/ResourceCard'
import SingleChoice from '@/pages/quiz-lab/formats/SingleChoice'
import FeedbackFooter, { QuizAdvanceContext } from '@/pages/quiz-lab/components/FeedbackFooter'
import '@/pages/quiz-lab/quiz-lab.css'
import type { FeedAssessment } from '@/data/courseFeed'
import './CourseAssessment.css'

interface Props {
  assessment: FeedAssessment
  variant: 'web' | 'mobile'
  /** Says what was submitted, for the host's toast. */
  onSubmitted: (message: string) => void
}

const ANSWER_SUBMITTED = 'Your answer has been submitted'
const RESPONSE_SUBMITTED = 'Your response has been submitted'

const resourceType = (fileName: string): ResourceType => {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint'
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image'
  return 'pdf'
}

/**
 * One course assessment in the feed (Course feed Figma, "Course assessments" rows:
 * web from 17024:80504, mobile from 17024:75667). Multiple choice is the quiz's own
 * renderer; short text, exercise and poll are submitted rather than marked: Submit,
 * a confirmation toast from the host, then Continue to the next item.
 */
function CourseAssessment({ assessment, variant, onSubmitted }: Props) {
  if (assessment.type === 'multiple-choice') {
    return (
      <SingleChoice
        question={{
          type: 'single-choice',
          prompt: assessment.prompt,
          options: assessment.options,
          correctIndex: assessment.correctIndex,
          explanation: assessment.explanation,
        }}
      />
    )
  }
  if (assessment.type === 'short-text') {
    return <ShortText prompt={assessment.prompt} variant={variant} onSubmitted={onSubmitted} />
  }
  if (assessment.type === 'exercise') {
    return <Exercise prompt={assessment.prompt} variant={variant} onSubmitted={onSubmitted} />
  }
  return <Poll prompt={assessment.prompt} options={assessment.options} onSubmitted={onSubmitted} />
}

/* Submit until it is sent, then Continue: the footer's one action, in both states. */
function SubmitFooter({ submitted, disabled, onSubmit }: { submitted: boolean; disabled: boolean; onSubmit: () => void }) {
  const advance = useContext(QuizAdvanceContext)
  const go = submitted ? () => advance?.() : onSubmit
  return (
    <FeedbackFooter
      status="idle"
      checkLabel={submitted ? 'Continue' : 'Submit'}
      checkDisabled={!submitted && disabled}
      onCheck={go}
      onContinue={go}
    />
  )
}

function ShortText({ prompt, variant, onSubmitted }: { prompt: string; variant: 'web' | 'mobile'; onSubmitted: Props['onSubmitted'] }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const submit = () => {
    setConfirming(false)
    setSubmitted(true)
    onSubmitted(ANSWER_SUBMITTED)
  }

  const title = 'Submit your answer?'
  const body = "You won't be able to change it later."

  return (
    <div className="ql-screen">
      <div className={`ql-screen__body${submitted ? ' cfa-submitted' : ''}`}>
        <div className="ql-stem">
          <span className="ql-stem__q">{prompt}</span>
        </div>
        <textarea
          className="ql-answer cfa-answer"
          rows={variant === 'mobile' ? 8 : 4}
          placeholder="Write your answer..."
          aria-label="Your answer"
          value={answer}
          readOnly={submitted}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      <SubmitFooter submitted={submitted} disabled={!answer.trim()} onSubmit={() => setConfirming(true)} />

      {/* The answer can't be changed once sent, so sending asks first (17024:81069 web
          dialog, 17024:76750 mobile sheet). */}
      {variant === 'web' ? (
        <ConfirmModal open={confirming} onClose={() => setConfirming(false)} ariaLabel={title}>
          <div className="confirm-modal-header">
            <h2 className="confirm-modal-title">{title}</h2>
            <p className="confirm-modal-body">{body}</p>
          </div>
          <div className="confirm-modal-actions">
            <Button variant="outlined-2" onClick={() => setConfirming(false)}>
              Edit
            </Button>
            <Button size="lg" onClick={submit}>Submit Answer</Button>
          </div>
        </ConfirmModal>
      ) : confirming ? (
        <BottomSheet ariaLabel={title} onClose={() => setConfirming(false)}>
          <div className="cfa-sheet">
            <div className="cfa-sheet__text">
              <h2 className="cfa-sheet__title">{title}</h2>
              <p className="cfa-sheet__body">{body}</p>
            </div>
            <div className="cfa-sheet__actions">
              <Button variant="outlined" size="md" onClick={() => setConfirming(false)}>
                Edit
              </Button>
              <Button size="md" onClick={submit}>
                Submit Answer
              </Button>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  )
}

function Exercise({ prompt, variant, onSubmitted }: { prompt: string; variant: 'web' | 'mobile'; onSubmitted: Props['onSubmitted'] }) {
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="ql-screen">
      <div className="ql-screen__body">
        <div className="ql-stem">
          <span className="ql-stem__q">{prompt}</span>
        </div>
        {submitted && file ? (
          <ResourceCard
            type={resourceType(file.name)}
            title={file.name}
            size={file.size}
            device={variant}
            tooltip={variant === 'web'}
          />
        ) : (
          <FileUploader
            size="L"
            state={file ? 'Filled' : undefined}
            fileName={file?.name}
            onFileSelect={setFile}
            onChangeFile={() => setFile(null)}
            accept=".jpg,.jpeg,.png,.mp4,.mpeg,.mov,.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
            helpText={
              variant === 'mobile'
                ? 'Select file to upload. Images up to 10MB; video and documents up to 100MB.'
                : 'Drag and drop file here or click to upload. Images up to 10MB; video and documents up to 100MB.'
            }
          />
        )}
      </div>
      <SubmitFooter
        submitted={submitted}
        disabled={!file}
        onSubmit={() => {
          setSubmitted(true)
          onSubmitted(ANSWER_SUBMITTED)
        }}
      />
    </div>
  )
}

function Poll({ prompt, options, onSubmitted }: { prompt: string; options: string[]; onSubmitted: Props['onSubmitted'] }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const group = useId()

  return (
    <div className="ql-screen">
      <div className={`ql-screen__body${submitted ? ' cfa-submitted' : ''}`}>
        <div className="ql-stem">
          <span className="ql-stem__q">{prompt}</span>
        </div>
        <div className="ql-choice__options" role="radiogroup" aria-label="Options">
          {options.map((option, index) => (
            <label
              key={option}
              className={`ql-token ql-token--block ql-choice__option${picked === index ? ' ql-token--selected' : ''}${submitted ? ' ql-token--locked' : ''}`}
            >
              <Radio
                name={group}
                checked={picked === index}
                disabled={submitted}
                onChange={() => {
                  if (!submitted) setPicked(index)
                }}
                className="ql-choice__radio"
              />
              <span className="ql-choice__label">{option}</span>
            </label>
          ))}
        </div>
      </div>
      <SubmitFooter
        submitted={submitted}
        disabled={picked === null}
        onSubmit={() => {
          setSubmitted(true)
          onSubmitted(RESPONSE_SUBMITTED)
        }}
      />
    </div>
  )
}

export default CourseAssessment
