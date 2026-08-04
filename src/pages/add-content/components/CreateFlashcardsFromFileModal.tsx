import { useEffect, useId, useState } from 'react'
import { ArrowDown2, TickCircle } from 'iconsax-react'
import CloseButton from '../../../components/CloseButton/CloseButton'
import Toggle from '../../../components/Toggle/Toggle'
import FileUploader from '../../../components/FileUploader/FileUploader'
import './CreateFlashcardsFromFileModal.css'

interface CreateFlashcardsFromFileModalProps {
  open: boolean
  onClose: () => void
  onGenerate: (fileName: string, includeImages: boolean) => void
}

const STEP_DELAY = 750

const LOADING_STEPS = [
  'Analyzing your content...',
  'Summarising key messages',
  'Adding images',
  'Sprinkling some magic',
  'Finishing up',
]

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.webm,.mp3,.wav,.m4a'

interface SparkleIconProps {
  size?: number
  color?: string
}

function SparkleIcon({ size = 24, color }: SparkleIconProps) {
  const rawId = useId()
  const gradientId = `cffm-sparkle-${rawId.replace(/:/g, '')}`
  const fill = color ?? `url(#${gradientId})`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {!color && (
        <defs>
          <linearGradient id={gradientId} x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00AFC4" />
            <stop offset="1" stopColor="#8158EC" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M11.593 6.96772C12.0355 5.14272 14.6311 5.14272 15.0736 6.96772L16.2913 11.9893C16.4493 12.6409 16.958 13.1497 17.6096 13.3076L22.6312 14.5253C24.4562 14.9679 24.4562 17.5634 22.6312 18.006L17.6096 19.2236C16.958 19.3816 16.4493 19.8904 16.2913 20.5419L15.0736 25.5636C14.6311 27.3886 12.0355 27.3886 11.593 25.5636L10.3753 20.5419C10.2173 19.8904 9.70857 19.3816 9.05699 19.2236L4.03538 18.006C2.21038 17.5634 2.21037 14.9679 4.03538 14.5253L9.05699 13.3076C9.70857 13.1497 10.2173 12.6409 10.3753 11.9893L11.593 6.96772Z"
        fill={fill}
      />
      <path
        d="M24.494 3.61578C24.6392 3.01695 25.4909 3.01695 25.6361 3.61578L26.0357 5.26349C26.0875 5.47729 26.2544 5.64422 26.4682 5.69607L28.1159 6.09561C28.7148 6.24082 28.7148 7.09249 28.1159 7.2377L26.4682 7.63725C26.2544 7.68909 26.0875 7.85602 26.0357 8.06982L25.6361 9.71753C25.4909 10.3164 24.6392 10.3164 24.494 9.71754L24.0945 8.06982C24.0426 7.85602 23.8757 7.68909 23.6619 7.63725L22.0142 7.2377C21.4154 7.09249 21.4154 6.24082 22.0142 6.09561L23.6619 5.69607C23.8757 5.64422 24.0426 5.47729 24.0945 5.26349L24.494 3.61578Z"
        fill={fill}
      />
    </svg>
  )
}

function CreateFlashcardsFromFileModal({ open, onClose, onGenerate }: CreateFlashcardsFromFileModalProps) {
  const [step, setStep] = useState<'upload' | 'generating'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [includeImages, setIncludeImages] = useState(true)
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (open) {
      setStep('upload')
      setFile(null)
      setIncludeImages(true)
      setGuidelinesOpen(false)
      setCurrentStep(0)
      setProgress(0)
    }
  }, [open])

  useEffect(() => {
    if (!open || step !== 'generating') return
    const timers: ReturnType<typeof setTimeout>[] = []

    LOADING_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setCurrentStep(i)
        setProgress(Math.round(((i + 1) / LOADING_STEPS.length) * 100))
      }, STEP_DELAY * (i + 1)))
    })

    timers.push(setTimeout(() => {
      onGenerate(file?.name ?? 'Uploaded content', includeImages)
    }, STEP_DELAY * (LOADING_STEPS.length + 1)))

    return () => timers.forEach(clearTimeout)
  }, [step, open, file, includeImages, onGenerate])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step === 'upload') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, step])

  if (!open) return null

  const handleStart = () => {
    if (!file) return
    setStep('generating')
  }

  return (
    <div className="cffm-fullscreen">
      {step === 'upload' && (
        <div className="cffm-topbar">
          <CloseButton onClick={onClose} />
        </div>
      )}

      <div className="cffm-center">
        {step === 'upload' && (
          <div className="cffm-panel">
            <div className="cffm-heading">
              <h2 className="cffm-title">Upload your content</h2>
              <p className="cffm-subtitle">We'll transform it into flashcards</p>
            </div>

            <div className={`cffm-guidelines${guidelinesOpen ? ' cffm-guidelines--open' : ''}`}>
              <button
                type="button"
                className="cffm-guidelines-trigger"
                aria-expanded={guidelinesOpen}
                onClick={() => setGuidelinesOpen((v) => !v)}
              >
                <span className="cffm-guidelines-label">Guidelines for transforming content</span>
                <ArrowDown2
                  size={20}
                  color="var(--text-secondary)"
                  className={`cffm-guidelines-chevron${guidelinesOpen ? ' cffm-guidelines-chevron--open' : ''}`}
                />
              </button>
              {guidelinesOpen && (
                <div className="cffm-guidelines-body">
                  <ul>
                    <li>Clear headings, bullet points, and short paragraphs work best.</li>
                    <li>Keep files under 50 MB. Text-heavy PDFs and slide decks give the best results.</li>
                    <li>For video and audio, clear speech and minimal background noise produce stronger flashcards.</li>
                  </ul>
                </div>
              )}
            </div>

            <FileUploader
              size="L"
              accept={ACCEPTED_EXTENSIONS}
              state={file ? 'Filled' : undefined}
              fileName={file?.name}
              onFileSelect={(f) => setFile(f)}
              onChangeFile={() => setFile(null)}
            />

            <Toggle
              checked={includeImages}
              onChange={() => setIncludeImages((v) => !v)}
              className={`cffm-include-images${includeImages ? '' : ' cffm-include-images--off'}`}
              label="Generate images"
            />

            <button
              type="button"
              className="cffm-generate"
              disabled={!file}
              onClick={handleStart}
            >
              <SparkleIcon size={20} color={file ? '#FFFFFF' : 'var(--text-button-disabled)'} />
              Generate flashcards
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div className="cffm-loading-panel">
            <div className="cffm-heading">
              <h2 className="cffm-title">Generating flashcards...</h2>
            </div>

            <div className="cffm-ai-wrapper">
              <div className="cffm-ai-wrapper-inner">
                <div className="cffm-steps">
                  {LOADING_STEPS.map((label, i) => {
                    const isActive = i === currentStep
                    const isComplete = i < currentStep
                    return (
                      <div
                        key={i}
                        className={`cffm-step${isActive ? ' cffm-step--active' : ''}${isComplete ? ' cffm-step--complete' : ''}`}
                      >
                        <span className="cffm-step-icon">
                          {isActive && <SparkleIcon size={20} />}
                          {isComplete && (
                            <TickCircle size={20} color="var(--success-500)" variant="Bold" />
                          )}
                        </span>
                        <span>{label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="cffm-progress">
                  <div className="cffm-progress-track">
                    <div className="cffm-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="cffm-progress-label">{progress}%</span>
                </div>
              </div>
            </div>

            <button type="button" className="cffm-generating-btn" disabled>
              Generating
              <span className="cffm-generating-spinner" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateFlashcardsFromFileModal
