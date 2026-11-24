import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Add, Gallery, Trash, Video, VolumeHigh } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import InputField from '@/components/InputField/InputField'
import RowActionsMenu, { type RowMenuItem } from '@/components/RowActionsMenu/RowActionsMenu'
import Tabs from '@/components/Tabs/Tabs'
import Tooltip from '@/components/Tooltip/Tooltip'
import { FileUploader } from '@/components/FileUploader/FileUploader'
import AddImageModal from '@/pages/add-content/components/AddImageModal/AddImageModal'
import SectionHeader from '@/pages/your-courses/components/SectionHeader/SectionHeader'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import {
  isMediaLink,
  SCENARIO_MEDIA_RULES,
  scenarioMediaError,
  type ScenarioMediaData,
  type ScenarioMediaKind,
} from '@/data/scenarioMedia'
import ScenarioMedia from './ScenarioMedia'
import './ScenarioMediaField.css'

interface Props {
  media?: ScenarioMediaData
  onChange: (media: ScenarioMediaData | undefined) => void
}

const UPLOAD_FAILED = 'Upload failed. Check your connection and try again.'
/* The prototype has no server, so the upload is acted out. */
const UPLOAD_MS = 1600

const acceptOf = (kind: ScenarioMediaKind) => SCENARIO_MEDIA_RULES[kind].extensions.map((ext) => `.${ext}`).join(',')

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

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
 * A file picked in the Add video or Add audio modal: checked against the type's limits,
 * then "uploaded" with a progress ring, the way the Your Content uploaders show it.
 */
function useUpload(kind: 'video' | 'audio') {
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
    const problem = scenarioMediaError(next, kind)
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

/** Add video (upload or link) and Add audio (upload), in the DS Modal (overlays.md). */
function MediaModal({
  kind,
  onClose,
  onSave,
}: {
  kind: 'video' | 'audio' | null
  onClose: () => void
  onSave: (media: ScenarioMediaData) => void
}) {
  const shown = kind ?? 'video'
  const upload = useUpload(shown)
  const [tab, setTab] = useState<'upload' | 'link'>('upload')
  const [link, setLink] = useState('')
  const [linkBlurred, setLinkBlurred] = useState(false)
  const noun = shown === 'video' ? 'video' : 'audio'
  const onLink = shown === 'video' && tab === 'link'
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
      onSave({ kind: shown, src: upload.src, name: upload.file.name, size: upload.file.size })
    } else return
    close()
  }

  return (
    <ConfirmModal open={kind !== null} onClose={close} ariaLabel={`Add ${noun}`} className="scfield-modal" closable>
      {/* DS Modal (overlays.md): 720px, a section header with title and divider, a
          content area, then a centred Cancel and primary pair. No supporting text: the
          tabs and the drop zone already say what to do (Bruno, 2026-11-24). */}
      <div className="scfield-modal__header">
        <SectionHeader title={shown === 'video' ? 'Add video' : 'Add audio'} />
      </div>
      {shown === 'video' ? (
        <Tabs
          ariaLabel="Add video"
          items={[
            { key: 'upload', label: 'Upload video' },
            { key: 'link', label: 'Paste a link' },
          ]}
          activeKey={tab}
          onChange={(key) => setTab(key as 'upload' | 'link')}
        />
      ) : null}
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
            <ScenarioMedia media={{ kind: shown, src: upload.src, name: upload.file.name }} />
            <div className="scfield__row">
              <span className="scfield__file">
                <span className="scfield__name">{upload.file.name}</span>
              </span>
              <Button variant="text" size="md" onClick={upload.reset}>
                Change File
              </Button>
            </div>
          </div>
        ) : (
          <FileUploader
            size="L"
            state={upload.uploading ? 'Uploading' : upload.error ? 'Error' : upload.file ? 'Filled' : undefined}
            progress={upload.progress}
            fileName={upload.file?.name}
            errorMessage={upload.error ?? UPLOAD_FAILED}
            accept={acceptOf(shown)}
            onFileSelect={upload.pick}
            onChangeFile={upload.reset}
            helpText={
              shown === 'video'
                ? 'Drag and drop a video here or click to upload (MP4 up to 500MB)'
                : 'Drag and drop an audio file here or click to upload (MP3, M4A or WAV up to 50MB)'
            }
          />
        )}
      </div>
      <div className="confirm-modal-actions confirm-modal-actions--center">
        <Button variant="outlined-2" onClick={close}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!canSave}>
          {shown === 'video' ? 'Add Video' : 'Add Audio'}
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
 * footage) and Add audio (upload). Filled, the media shows in place with Change Media
 * and Remove.
 */
function ScenarioMediaField({ media, onChange }: Props) {
  const reduce = useReducedMotion()
  const [adding, setAdding] = useState<ScenarioMediaKind | null>(null)

  return (
    <div className="scfield">
      <AnimatePresence mode="wait" initial={false}>
        {media ? (
          <motion.div
            key="filled"
            className="scfield__filled"
            {...ARRIVE(reduce)}
            exit={{ opacity: 0 }}
            transition={arriveTransition(reduce)}
          >
            <ScenarioMedia media={media} />
            <div className="scfield__row">
              <span className="scfield__file">
                <span className="scfield__name">{media.name}</span>
                {media.size ? <span className="scfield__size">{formatSize(media.size)}</span> : null}
              </span>
              <span className="scfield__actions">
                <RowActionsMenu
                  items={MENU}
                  onSelect={(key) => setAdding(key as ScenarioMediaKind)}
                  triggerClassName="ds-btn ds-btn--sm ds-btn--text"
                  triggerContent={<span className="ds-btn__label">Change Media</span>}
                  ariaLabel="Change media"
                  caret={false}
                />
                <Tooltip text="Remove media" position="Top" icon={false}>
                  <button type="button" className="scfield__remove" aria-label="Remove media" onClick={() => onChange(undefined)}>
                    <Trash size={20} color="currentColor" variant="Linear" />
                  </button>
                </Tooltip>
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" {...ARRIVE(reduce)} exit={{ opacity: 0 }} transition={arriveTransition(reduce)}>
            <RowActionsMenu
              items={MENU}
              onSelect={(key) => setAdding(key as ScenarioMediaKind)}
              triggerClassName="scfield__add"
              triggerContent={
                <>
                  <Add size={20} color="currentColor" variant="Linear" />
                  <span className="scfield__addlabel">Attach Media</span>
                  <span className="scfield__addhint">(Video, Image or Audio)</span>
                </>
              }
              ariaLabel="Attach media"
              caret={false}
              align="center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <MediaModal
        kind={adding === 'video' || adding === 'audio' ? adding : null}
        onClose={() => setAdding(null)}
        onSave={onChange}
      />
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
