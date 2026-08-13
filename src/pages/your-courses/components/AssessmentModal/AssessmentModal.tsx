import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react'
import { Add, PlayCircle, PauseCircle, Backward10Seconds, Forward10Seconds, Minus } from 'iconsax-react'
import type { AssessmentType } from '../AddContentSidebar/AddContentSidebar'
import SectionHeader from '../SectionHeader/SectionHeader'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Radio from '@/components/Radio/Radio'
import './AssessmentModal.css'

const typeConfig: Record<AssessmentType, { title: string; subtitle: string }> = {
  'multiple-choice': {
    title: 'Add assessment - Multiple choice',
    subtitle: 'Users can select one correct choice',
  },
  'short-text': {
    title: 'Add assessment - Short text',
    subtitle: 'Users type a short written answer',
  },
  exercise: {
    title: 'Add assessment - Exercise',
    subtitle: 'Users complete a practical exercise',
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
  explanation?: string
  mediaFile?: File
  mediaType?: 'image' | 'audio'
  cropBgW?: number
  cropBgH?: number
  cropPosX?: number
  cropPosY?: number
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

const ACCEPTED_TYPES = 'image/png,image/jpeg,image/gif,image/webp,audio/mpeg,audio/wav,audio/ogg'

function AssessmentModal({ type, initial = null, onClose, onAdd, sidebarIcons, variant = 'modal' }: AssessmentModalProps) {
  const isEdit = !!initial
  const [closing, setClosing] = useState(false)
  const [question, setQuestion] = useState(initial?.question ?? '')
  const [options, setOptions] = useState(initial?.options ?? ['', ''])
  const [correctIndex, setCorrectIndex] = useState(initial?.correctIndex ?? 0)
  const [explanation, setExplanation] = useState(initial?.explanation ?? '')

  // Media state (confirmed)
  const [mediaFile, setMediaFile] = useState<File | null>(initial?.mediaFile ?? null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'audio' | null>(initial?.mediaType ?? null)

  // Media modal state (staging)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  const [stagedPreview, setStagedPreview] = useState<string | null>(null)
  const [stagedType, setStagedType] = useState<'image' | 'audio' | null>(null)
  const [dragover, setDragover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Crop state (staging — inside media modal)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const cropRef = useRef<HTMLDivElement>(null)

  // Crop state (confirmed — stored after save, pixel values at 400x224 scale)
  const [cropBgW, setCropBgW] = useState(initial?.cropBgW ?? 0)
  const [cropBgH, setCropBgH] = useState(initial?.cropBgH ?? 0)
  const [cropPosX, setCropPosX] = useState(initial?.cropPosX ?? 0)
  const [cropPosY, setCropPosY] = useState(initial?.cropPosY ?? 0)

  /* Reopening for edit hands back the File itself, but an object URL can't be stored
     with it — the previous one was revoked when that drawer unmounted. Rebuild it here
     and revoke on unmount, or the attached media would silently vanish from the form and
     then from the saved assessment. */
  useEffect(() => {
    const file = initial?.mediaFile
    if (!file) return
    const url = URL.createObjectURL(file)
    setMediaPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [initial])

  // Audio playback state
  const audioRef = useRef<HTMLAudioElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)

  const CROP_W = 400
  const CROP_H = 224

  // --- Crop helpers (background-image approach) ---
  // coverScale: the scale at which the image exactly covers the 400x224 viewport
  const coverScale = naturalSize.w > 0
    ? Math.max(CROP_W / naturalSize.w, CROP_H / naturalSize.h)
    : 1
  // Derived background-size at current zoom
  const bgW = naturalSize.w * coverScale * zoom
  const bgH = naturalSize.h * coverScale * zoom

  const clampPan = useCallback((x: number, y: number, bw: number, bh: number) => {
    return {
      x: Math.min(0, Math.max(CROP_W - bw, x)),
      y: Math.min(0, Math.max(CROP_H - bh, y)),
    }
  }, [])

  const handleZoomChange = (newZoom: number) => {
    const oldBgW = naturalSize.w * coverScale * zoom
    const oldBgH = naturalSize.h * coverScale * zoom
    const newBgW = naturalSize.w * coverScale * newZoom
    const newBgH = naturalSize.h * coverScale * newZoom
    // Keep center point stable
    const ratioX = (CROP_W / 2 - panX) / oldBgW
    const ratioY = (CROP_H / 2 - panY) / oldBgH
    const newPanX = CROP_W / 2 - ratioX * newBgW
    const newPanY = CROP_H / 2 - ratioY * newBgH
    const clamped = clampPan(newPanX, newPanY, newBgW, newBgH)
    setZoom(newZoom)
    setPanX(clamped.x)
    setPanY(clamped.y)
  }

  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const cs = naturalSize.w > 0 ? Math.max(CROP_W / naturalSize.w, CROP_H / naturalSize.h) : 1
    const bw = naturalSize.w * cs * zoom
    const bh = naturalSize.h * cs * zoom
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    const clamped = clampPan(newX, newY, bw, bh)
    setPanX(clamped.x)
    setPanY(clamped.y)
  }, [isDragging, dragStart, zoom, naturalSize, clampPan])

  const handleCropMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Attach mouse move/up to window for smooth dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleCropMouseMove)
      window.addEventListener('mouseup', handleCropMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleCropMouseMove)
      window.removeEventListener('mouseup', handleCropMouseUp)
    }
  }, [isDragging, handleCropMouseMove, handleCropMouseUp])

  const config = typeConfig[type]

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

  const handleSubmit = () => {
    onAdd({
      type,
      question,
      options,
      correctIndex,
      explanation: explanation.trim() || undefined,
      mediaFile: mediaFile ?? undefined,
      mediaType: mediaType ?? undefined,
      cropBgW: cropBgW || undefined,
      cropBgH: cropBgH || undefined,
      cropPosX: cropPosX || undefined,
      cropPosY: cropPosY || undefined,
    })
  }

  // --- Media modal handlers ---
  const openMediaModal = () => {
    // If media already exists, pre-stage it for editing
    if (mediaFile && mediaPreview && mediaType) {
      setStagedFile(mediaFile)
      setStagedPreview(mediaPreview)
      setStagedType(mediaType)
    }
    setShowMediaModal(true)
  }

  const processStagedFile = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isAudio = file.type.startsWith('audio/')
    if (!isImage && !isAudio) return

    if (stagedPreview) URL.revokeObjectURL(stagedPreview)

    const previewUrl = URL.createObjectURL(file)

    // Audio: skip the modal preview — save immediately and close
    if (isAudio) {
      if (mediaPreview && mediaPreview !== previewUrl) {
        URL.revokeObjectURL(mediaPreview)
      }
      setMediaFile(file)
      setMediaPreview(previewUrl)
      setMediaType('audio')
      setShowMediaModal(false)
      setStagedFile(null)
      setStagedPreview(null)
      setStagedType(null)
      setDragover(false)
      return
    }

    // Image: read dimensions, compute cover-fit, set all state
    createImageBitmap(file).then(bitmap => {
      const nw = bitmap.width
      const nh = bitmap.height
      bitmap.close()
      const cs = Math.max(CROP_W / nw, CROP_H / nh)
      const coverW = nw * cs
      const coverH = nh * cs

      setStagedFile(file)
      setStagedPreview(previewUrl)
      setStagedType('image')
      setNaturalSize({ w: nw, h: nh })
      setZoom(1)
      setPanX((CROP_W - coverW) / 2)
      setPanY((CROP_H - coverH) / 2)
    })
  }

  const handleStagedFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processStagedFile(file)
    e.target.value = ''
  }

  const handleMediaModalSave = () => {
    if (stagedFile && stagedPreview && stagedType) {
      // Revoke old confirmed preview if different
      if (mediaPreview && mediaPreview !== stagedPreview) {
        URL.revokeObjectURL(mediaPreview)
      }
      setMediaFile(stagedFile)
      setMediaPreview(stagedPreview)
      setMediaType(stagedType)
      // Store crop data (pixel values at 400x224 scale)
      if (stagedType === 'image') {
        const cs = Math.max(CROP_W / naturalSize.w, CROP_H / naturalSize.h)
        setCropBgW(naturalSize.w * cs * zoom)
        setCropBgH(naturalSize.h * cs * zoom)
        setCropPosX(panX)
        setCropPosY(panY)
      }
    }
    setShowMediaModal(false)
    setStagedFile(null)
    setStagedPreview(null)
    setStagedType(null)
    setDragover(false)
  }

  const handleMediaModalClose = () => {
    // Discard staged file if it's different from confirmed
    if (stagedPreview && stagedPreview !== mediaPreview) {
      URL.revokeObjectURL(stagedPreview)
    }
    setStagedFile(null)
    setStagedPreview(null)
    setStagedType(null)
    setDragover(false)
    setShowMediaModal(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragover(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setDragover(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) processStagedFile(file)
  }

  const handleRemoveMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    setIsPlaying(false)
    setAudioProgress(0)
    setAudioDuration(0)
    setCropBgW(0)
    setCropBgH(0)
    setCropPosX(0)
    setCropPosY(0)
  }

  // --- Audio controls ---
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const skipAudio = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds))
  }

  const handleTimeUpdate = () => {
    if (isScrubbing) return
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setAudioProgress((audio.currentTime / audio.duration) * 100)
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio) setAudioDuration(audio.duration)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setAudioProgress(0)
  }

  const scrubFromEvent = useCallback((clientX: number) => {
    const track = trackRef.current
    const audio = audioRef.current
    if (!track || !audio || !audio.duration) return
    const rect = track.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setAudioProgress(pct * 100)
    audio.currentTime = pct * audio.duration
  }, [])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    scrubFromEvent(e.clientX)
  }

  const handleScrubStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsScrubbing(true)
    scrubFromEvent(e.clientX)
  }

  const handleScrubMove = useCallback((e: MouseEvent) => {
    if (!isScrubbing) return
    scrubFromEvent(e.clientX)
  }, [isScrubbing, scrubFromEvent])

  const handleScrubEnd = useCallback(() => {
    setIsScrubbing(false)
  }, [])

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('mousemove', handleScrubMove)
      window.addEventListener('mouseup', handleScrubEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleScrubMove)
      window.removeEventListener('mouseup', handleScrubEnd)
    }
  }, [isScrubbing, handleScrubMove, handleScrubEnd])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const canSubmit = question.trim().length > 0 && options.some(o => o.trim().length > 0)

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
          <div className="assessment-modal-field">
            <label className="assessment-modal-label" htmlFor="assessment-question">Question</label>
            <input
              id="assessment-question"
              className="assessment-modal-input"
              type="text"
              placeholder="Write your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          {/* Media Upload */}
          <div className="assessment-modal-field">
            {/* Collapsed trigger — dashed full-width row */}
            {!mediaFile && (
              <button
                className="assessment-modal-add-media"
                type="button"
                onClick={openMediaModal}
              >
                <Add size={20} color="currentColor" variant="Linear" />
                <span className="assessment-modal-add-media-label">Attach Media</span>
                <span className="assessment-modal-add-media-hint">(Image or Audio)</span>
              </button>
            )}

            {/* Image preview state — background-image scaled to 218x122 */}
            {mediaFile && mediaType === 'image' && mediaPreview && (
              <div className="assessment-modal-media-preview">
                <div
                  className="assessment-modal-media-preview-bg"
                  style={cropBgW > 0 ? {
                    backgroundImage: `url(${mediaPreview})`,
                    backgroundSize: `${cropBgW * (218 / 400)}px ${cropBgH * (218 / 400)}px`,
                    backgroundPosition: `${cropPosX * (218 / 400)}px ${cropPosY * (218 / 400)}px`,
                    backgroundRepeat: 'no-repeat',
                  } : {
                    backgroundImage: `url(${mediaPreview})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <button
                  className="assessment-modal-media-remove"
                  onClick={handleRemoveMedia}
                  aria-label="Remove media"
                  data-tooltip="Remove media"
                  type="button"
                >
                  <Add size={19} color="var(--neutral-0)" style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>
            )}

            {/* Compact inline audio player */}
            {mediaFile && mediaType === 'audio' && mediaPreview && (
              <div className="assessment-modal-audio-pill">
                <audio
                  ref={audioRef}
                  src={mediaPreview}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                />

                {/* Play controls */}
                <div className="assessment-modal-audio-pill-controls">
                  <button
                    className="assessment-modal-audio-pill-btn"
                    onClick={() => skipAudio(-10)}
                    type="button"
                    aria-label="Rewind 10 seconds"
                  >
                    <Backward10Seconds size={20} color="var(--text-primary)" variant="Bold" />
                  </button>
                  <button
                    className="assessment-modal-audio-pill-btn assessment-modal-audio-pill-btn--play"
                    onClick={togglePlay}
                    type="button"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <PauseCircle size={32} color="var(--text-primary)" variant="Bold" />
                    ) : (
                      <PlayCircle size={32} color="var(--text-primary)" variant="Bold" />
                    )}
                  </button>
                  <button
                    className="assessment-modal-audio-pill-btn"
                    onClick={() => skipAudio(10)}
                    type="button"
                    aria-label="Forward 10 seconds"
                  >
                    <Forward10Seconds size={20} color="var(--text-primary)" variant="Bold" />
                  </button>
                </div>

                {/* Progress bar */}
                <div
                  ref={trackRef}
                  className="assessment-modal-audio-pill-track"
                  onClick={handleProgressClick}
                  onMouseDown={handleScrubStart}
                >
                  <div
                    className="assessment-modal-audio-pill-fill"
                    style={{ width: `${audioProgress}%` }}
                  />
                  <div
                    className="assessment-modal-audio-pill-thumb"
                    style={{ left: `${audioProgress}%` }}
                  />
                </div>

                {/* Duration */}
                <span className="assessment-modal-audio-pill-duration">
                  {formatTime(audioDuration)}
                </span>

                {/* Remove */}
                <button
                  className="assessment-modal-audio-pill-close"
                  onClick={handleRemoveMedia}
                  aria-label="Remove media"
                  type="button"
                >
                  <Add size={18} color="var(--text-secondary)" style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>
            )}
          </div>

          {/* Options */}
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

          {/* Explanation — a poll has no correct answer to explain. */}
          {type !== 'poll' && (
            <div className="assessment-modal-field">
              <label className="assessment-modal-label" htmlFor="assessment-explanation">
                Add an explanation for the correct answer{' '}
                <span className="assessment-modal-label-hint">(optional)</span>
              </label>
              <input
                id="assessment-explanation"
                className="assessment-modal-input"
                type="text"
                placeholder="Write an explanation..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="assessment-modal-footer">
          <Button onClick={handleSubmit} disabled={!canSubmit}>Save</Button>
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

    {/* ===== Attach Media Modal — rendered outside assessment overlay for proper z-index ===== */}
    {showMediaModal && (
      <div className="media-modal-overlay" onClick={handleMediaModalClose}>
        <div className="media-modal" onClick={(e) => e.stopPropagation()}>
          {/* Close */}
          <CloseButton onClick={handleMediaModalClose} className="media-modal-close" />

            {/* Header */}
            <SectionHeader
              title="Attach media"
              description="Add an image or audio file to your quiz"
            />

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleStagedFileSelect}
              style={{ display: 'none' }}
            />

            {/* Drop zone */}
            <div
              className={`media-modal-dropzone${dragover ? ' media-modal-dropzone--dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* SVG dashed border — handles rounded corners with exact dash control */}
              <svg className="media-modal-dropzone-border">
                <rect rx="12" ry="12" />
              </svg>

              {!stagedFile ? (
                <>
                  <svg className="media-modal-dropzone-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M29.8055 10.1552C28.0624 5.52892 24.315 2.59888 18.6543 2.59888C11.4518 2.59888 6.41246 7.947 5.97938 14.9245C2.50684 16.0351 0 19.5776 0 23.5901C0 28.502 3.86125 32.6514 8.43059 32.6514H12.0418C12.7318 32.6514 13.2918 32.0914 13.2918 31.4014C13.2918 30.7108 12.7318 30.1514 12.0418 30.1514H8.43059C5.21559 30.1514 2.46059 27.147 2.46059 23.5901C2.46059 20.447 4.66434 17.6114 7.42871 17.1364L8.56309 16.9408L8.46246 15.7951L8.45309 15.7808C8.45309 9.692 12.46 5.0995 18.6543 5.0995C23.6193 5.0995 26.4088 7.54575 27.6988 11.7183L27.9662 12.5789L28.8668 12.5983C33.5106 12.6958 37.5818 16.4633 37.5818 21.144C37.5818 25.4039 34.7587 30.1514 30.4843 30.1514H27.6281C26.9381 30.1514 26.3781 30.7114 26.3781 31.4014C26.3781 32.092 26.9381 32.6514 27.6281 32.6514L30.475 32.6477C36.725 32.4827 39.9806 26.5121 39.9806 21.144C39.9806 15.374 35.4587 10.7634 29.8056 10.1552L29.8055 10.1552ZM20.9368 20.115C20.93 20.1075 20.9274 20.1013 20.923 20.0951L20.6068 19.7644C20.4337 19.5813 20.203 19.4907 19.9724 19.4919C19.7418 19.4901 19.5124 19.5813 19.3361 19.7644L19.0199 20.095C19.0137 20.1013 19.0124 20.1088 19.0068 20.115L14.4949 25.1051C14.1455 25.4701 14.1455 26.0607 14.4949 26.4269L14.8099 26.6406C15.1593 27.0056 15.7255 26.8875 16.0743 26.5225L18.735 23.5563V36.1513C18.735 36.8413 19.295 37.4013 19.985 37.4013C20.675 37.4013 21.235 36.8413 21.235 36.1513V23.5681L23.9837 26.6006C24.3331 26.9656 24.8981 27.0838 25.2468 26.7188L25.5618 26.505C25.9112 26.1388 25.9112 25.5481 25.5618 25.1831L20.9368 20.115Z" fill="var(--text-secondary)"/>
                  </svg>
                  <span className="media-modal-dropzone-text">
                    Drag and drop an image or audio file, max 100MB
                  </span>
                  <span className="media-modal-dropzone-formats">
                    Image: JPG, PNG, GIF, WebP<br />
                    Audio: MP3, WAV, AAC, OGG
                  </span>
                  <button
                    className="media-modal-select-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                  >
                    Select File
                  </button>
                </>
              ) : (
                <div className="media-modal-staged-preview">
                  {stagedType === 'image' && stagedPreview && (
                    <>
                      {/* Crop UI — background-image approach */}
                      <div
                        ref={cropRef}
                        className={`media-modal-crop${isDragging ? ' media-modal-crop--dragging' : ''}`}
                        onMouseDown={handleCropMouseDown}
                        style={{
                          backgroundImage: `url(${stagedPreview})`,
                          backgroundSize: `${bgW}px ${bgH}px`,
                          backgroundPosition: `${panX}px ${panY}px`,
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {/* Zoom slider overlay */}
                        <div className="media-modal-crop-slider" onMouseDown={(e) => e.stopPropagation()}>
                          <Minus size={16} color="var(--neutral-0)" />
                          <input
                            type="range"
                            className="media-modal-crop-range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => handleZoomChange(Number(e.target.value))}
                          />
                          <Add size={16} color="var(--neutral-0)" />
                        </div>
                      </div>
                    </>
                  )}
                  {stagedType === 'audio' && (
                    <>
                      <div className="media-modal-staged-audio">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <path d="M16 28C22.627 28 28 22.627 28 16C28 9.373 22.627 4 16 4C9.373 4 4 9.373 4 16C4 22.627 9.373 28 16 28Z" stroke="var(--text-tertiary)" strokeWidth="1.5"/>
                          <path d="M13 12L21 16L13 20V12Z" fill="var(--text-tertiary)"/>
                        </svg>
                        <span className="media-modal-staged-filename">{stagedFile.name}</span>
                      </div>
                      <button
                        className="media-modal-staged-change"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                      >
                        Change file
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Save */}
            <button
              className="media-modal-save"
              type="button"
              onClick={handleMediaModalSave}
              disabled={!stagedFile}
            >
              Save
            </button>
        </div>
      </div>
    )}
    </>
  )
}

export default AssessmentModal
