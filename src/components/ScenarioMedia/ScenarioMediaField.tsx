import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Add, Gallery, Video, VolumeHigh } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import InputField from '@/components/InputField/InputField'
import RowActionsMenu, { type RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import Tabs from '@/components/Tabs/Tabs'
import Tooltip from '@/components/Tooltip/Tooltip'
import { FileUploader } from '@/components/FileUploader/FileUploader'
import AddImageModal from '@/pages/add-content/components/AddImageModal/AddImageModal'
import SectionHeader from '@/pages/your-courses/components/SectionHeader/SectionHeader'
import {
  isMediaLink,
  SCENARIO_MEDIA_RULES,
  scenarioMediaError,
  type ScenarioMediaData,
  type ScenarioMediaKind,
} from '@/data/scenarioMedia'
import ScenarioMedia from './ScenarioMedia'
import AttachedAudioPlayer from './AttachedAudioPlayer'
import VideoPreview from '@/components/VideoPreview/VideoPreview'
import './ScenarioMediaField.css'

interface Props {
  media?: ScenarioMediaData
  onChange: (media: ScenarioMediaData | undefined) => void
}

const UPLOAD_FAILED = 'Upload failed. Check your connection and try again.'
/* The prototype has no server, so the upload is acted out. */
const UPLOAD_MS = 1600

const acceptOf = (kind: ScenarioMediaKind) => SCENARIO_MEDIA_RULES[kind].extensions.map((ext) => `.${ext}`).join(',')

/* The attached media and the Attach Media button swap in place inside one field, so
   this is standard UI motion, not a screen swap (motion.md): the old one fades out in
   120ms ease-in, the new one fades in over 200ms ease-out, 320ms in all. It was the
   420ms AI arrival each way (840ms), which read as slow. Opacity only: nothing travels. */
const swap = (reduce: boolean | null) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: reduce ? 0 : 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, transition: { duration: reduce ? 0 : 0.12, ease: 'easeIn' as const } },
})

const MENU: RowMenuItem[] = [
  {
    key: 'video',
    label: 'Video',
    description: 'Upload a video or paste a link',
    icon: <Video size={20} color="var(--text-primary)" variant="Linear" />,
  },
  {
    key: 'image',
    label: 'Image',
    description: 'Upload, generate with AI or pick stock footage',
    icon: <Gallery size={20} color="var(--text-primary)" variant="Linear" />,
  },
  {
    key: 'audio',
    label: 'Audio',
    description: 'Upload an audio file',
    icon: <VolumeHigh size={20} color="var(--text-primary)" variant="Linear" />,
  },
]

/**
 * A file picked in the Add video modal: checked against the video limits,
 * then "uploaded" with a progress ring, the way the Your Content uploaders show it.
 */
function useUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
  }
  useEffect(() => stop, [])

  const reset = () => {
    stop()
    setFile(null)
    setProgress(null)
    setError(null)
  }

  const pick = (next: File) => {
    const problem = scenarioMediaError(next, 'video')
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    setFile(next)
    setProgress(0)
    const began = performance.now()
    stop()
    timer.current = window.setInterval(() => {
      const pct = Math.min(100, Math.round(((performance.now() - began) / UPLOAD_MS) * 100))
      if (pct < 100) {
        setProgress(pct)
        return
      }
      stop()
      setProgress(null)
    }, 80)
  }

  const ready = !!file && progress === null
  /* Where the uploaded file plays from, for the preview and for what gets saved. */
  const src = useMemo(() => (file && ready ? URL.createObjectURL(file) : null), [file, ready])

  return { file, src, uploading: progress !== null, progress: progress ?? 0, error, pick, reset, ready }
}

/** Add video (upload or link), in the DS Modal (overlays.md). Audio skips it: its menu
 *  item opens the computer's file picker straight away. */
function MediaModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (media: ScenarioMediaData) => void
}) {
  const upload = useUpload()
  const [tab, setTab] = useState<'upload' | 'link'>('upload')
  const [link, setLink] = useState('')
  const [linkBlurred, setLinkBlurred] = useState(false)
  const onLink = tab === 'link'
  const linkOk = isMediaLink(link)
  const canSave = onLink ? linkOk : upload.ready

  const close = () => {
    upload.reset()
    setTab('upload')
    setLink('')
    setLinkBlurred(false)
    onClose()
  }

  const save = () => {
    if (onLink) onSave({ kind: 'video', src: link.trim(), name: link.trim(), embed: true })
    else if (upload.file && upload.src) {
      onSave({ kind: 'video', src: upload.src, name: upload.file.name, size: upload.file.size })
    } else return
    close()
  }

  return (
    <ConfirmModal open={open} onClose={close} ariaLabel="Add video" className="scfield-modal" closable>
      {/* DS Modal (overlays.md): 720px, a section header with title and divider, a
          content area, then a centred Cancel and primary pair. No supporting text: the
          tabs and the drop zone already say what to do (Bruno, 2026-11-24). */}
      <div className="scfield-modal__header">
        <SectionHeader title="Add video" />
      </div>
      <Tabs
        ariaLabel="Add video"
        items={[
          { key: 'upload', label: 'Upload video' },
          { key: 'link', label: 'Paste a link' },
        ]}
        activeKey={tab}
        onChange={(key) => setTab(key as 'upload' | 'link')}
      />
      <div className="scfield-modal__body">
        {onLink ? (
          <>
            <InputField
              label="Embed a link"
              placeholder="Paste a link here..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={() => setLinkBlurred(true)}
            />
            {linkBlurred && link.trim() && !linkOk ? (
              <span className="scfield__error" role="alert">
                Enter a full link, starting with https://
              </span>
            ) : (
              <span className="scfield-modal__hint">
                Add a video from YouTube, Loom, Vimeo or Synthesia.
              </span>
            )}
          </>
        ) : upload.ready && upload.file && upload.src ? (
          /* Uploaded: the clip itself, playable with the learner's controls, so the admin
             can check it is the right one before adding it. */
          <div className="scfield__filled">
            <ScenarioMedia media={{ kind: 'video', src: upload.src, name: upload.file.name }} />
          </div>
        ) : (
          <FileUploader
            size="L"
            state={upload.uploading ? 'Uploading' : upload.error ? 'Error' : upload.file ? 'Filled' : undefined}
            progress={upload.progress}
            fileName={upload.file?.name}
            errorMessage={upload.error ?? UPLOAD_FAILED}
            accept={acceptOf('video')}
            onFileSelect={upload.pick}
            onChangeFile={upload.reset}
            helpText="Drag and drop a video here or click to upload (MP4, MOV, WebM or M4V up to 500MB)"
          />
        )}
      </div>
      <div className="confirm-modal-actions confirm-modal-actions--center">
        <Button variant="outlined-2" onClick={close}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!canSave}>
          Add Video
        </Button>
      </div>
    </ConfirmModal>
  )
}

/**
 * Scenario media field (DES-371): the one video, image or audio clip a situational test
 * carries on its brief.
 *
 * Empty, it is the Attach Media button the questions used; it opens a list of the three
 * kinds, and each opens the Your Content pattern for it: Add video (upload, or a link
 * that plays in its provider's player), Add image (upload, generate with AI, stock
 * footage) and Add audio (upload). Filled, an uploaded video plays in the
 * 200 x 292 preview, an image or a video link shows as a thumbnail and audio as a pill
 * player, each with Remove.
 */
function ScenarioMediaField({ media, onChange }: Props) {
  const reduce = useReducedMotion()
  const [adding, setAdding] = useState<'video' | 'image' | null>(null)
  /* Audio has one way in (a file), so its menu item opens the computer's file picker
     directly instead of a modal with a single drop zone (Bruno, 2026-11-24). */
  const audioInput = useRef<HTMLInputElement>(null)
  const [audioError, setAudioError] = useState<string | null>(null)

  const choose = (key: string) => {
    setAudioError(null)
    if (key === 'audio') audioInput.current?.click()
    else setAdding(key as 'video' | 'image')
  }

  const pickAudio = (file: File) => {
    const problem = scenarioMediaError(file, 'audio')
    if (problem) {
      setAudioError(problem)
      return
    }
    setAudioError(null)
    onChange({ kind: 'audio', src: URL.createObjectURL(file), name: file.name, size: file.size })
  }

  return (
    <div className="scfield">
      <AnimatePresence mode="wait" initial={false}>
        {media ? (
          <motion.div
            key="filled"
            className="scfield__filled"
            {...swap(reduce)}
          >
            {/* Whatever is attached, Change File sits under it (Bruno, 2026-11-24): the
                audio pill, or the video or image preview (one size for both, the remove
                X on it). No file name: the preview already says which file it is. */}
            <div className="scfield__attached">
              {media.kind === 'audio' ? (
                /* Audio has no picture, so its file name is what says which clip this is. */
                <div className="scfield__audio">
                  <AttachedAudioPlayer src={media.src} onRemove={() => onChange(undefined)} />
                  <span className="scfield__audioname">{media.name}</span>
                </div>
              ) : media.kind === 'video' && !media.embed ? (
                  <div className="scfield-video">
                    <VideoPreview src={media.src} name={media.name} fullScreen />
                  <Tooltip icon={false} text="Remove media" className="scfield-thumb__remove-tooltip">
                    <button type="button" className="scfield-thumb__remove" aria-label="Remove media" onClick={() => onChange(undefined)}>
                      <Add size={20} color="var(--neutral-0)" style={{ transform: 'rotate(45deg)' }} />
                    </button>
                  </Tooltip>
                  </div>
                ) : (
                  <div className={`scfield-thumb${media.kind === 'image' ? '' : ' scfield-thumb--icon'}`}>
                    {media.kind === 'image' ? (
                      /* The image is the way to its full screen view: a zoom-in cursor,
                         click to open, click again (or Escape) to come back. */
                      <button
                        type="button"
                        className="scfield-thumb__zoom"
                        aria-label="View image full screen"
                        onClick={(e) => {
                          if (document.fullscreenElement) void document.exitFullscreen()
                          else void e.currentTarget.requestFullscreen?.()
                        }}
                      >
                        <img src={media.src} alt={media.name} />
                      </button>
                    ) : (
                      <span className="scfield-thumb__icon">
                        <Video size={24} color="var(--text-secondary)" variant="Linear" />
                      </span>
                    )}
                  <Tooltip icon={false} text="Remove media" className="scfield-thumb__remove-tooltip">
                    <button type="button" className="scfield-thumb__remove" aria-label="Remove media" onClick={() => onChange(undefined)}>
                      <Add size={20} color="var(--neutral-0)" style={{ transform: 'rotate(45deg)' }} />
                    </button>
                  </Tooltip>
                  </div>
                )}
                {/* Opens the same list of media types as Attach Media, so the admin can
                    swap the file or switch to another kind. */}
                <RowActionsMenu
                  items={MENU}
                  onSelect={choose}
                  triggerClassName="ds-btn ds-btn--md ds-btn--outlined-2"
                  triggerContent={<span className="ds-btn__label">Change Media</span>}
                  ariaLabel="Change media"
                  caret={false}
                  align="start"
                />
              </div>
          </motion.div>
        ) : (
          <motion.div key="empty" {...swap(reduce)}>
            <RowActionsMenu
              items={MENU}
              onSelect={choose}
              triggerClassName="scfield__add"
              triggerContent={
                <>
                  <Add size={20} color="currentColor" variant="Linear" />
                  <span className="scfield__addlabel">Add Media</span>
                </>
              }
              ariaLabel="Add media"
              caret={false}
              align="center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {audioError ? (
        <span className="scfield__error" role="alert">
          {audioError}
        </span>
      ) : null}
      <input
        ref={audioInput}
        type="file"
        hidden
        accept={acceptOf('audio')}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) pickAudio(file)
          e.target.value = ''
        }}
      />

      <MediaModal open={adding === 'video'} onClose={() => setAdding(null)} onSave={onChange} />
      <AddImageModal
        open={adding === 'image'}
        onClose={() => setAdding(null)}
        title="Add image"
        showSuggest={false}
        upload={{
          accept: acceptOf('image'),
          validate: async (file) => scenarioMediaError(file, 'image'),
        }}
        onSelect={(src) => {
          onChange({ kind: 'image', src, name: 'Scenario image' })
          setAdding(null)
        }}
      />
    </div>
  )
}

export default ScenarioMediaField
