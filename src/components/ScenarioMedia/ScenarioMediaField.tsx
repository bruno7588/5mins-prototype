import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Trash } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'
import { FileUploader } from '@/components/FileUploader/FileUploader'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import {
  SCENARIO_MEDIA_ACCEPT,
  scenarioMediaError,
  scenarioMediaKind,
  type ScenarioMediaData,
} from '@/data/scenarioMedia'
import ScenarioMedia from './ScenarioMedia'
import './ScenarioMediaField.css'

interface Props {
  media?: ScenarioMediaData
  onChange: (media: ScenarioMediaData | undefined) => void
  /** True while a file is on its way up: the form holds its commit until it lands. */
  onUploadingChange?: (uploading: boolean) => void
}

const UPLOAD_FAILED = 'Upload failed. Check your connection and try again.'
/* The prototype has no server, so the upload is acted out. */
const UPLOAD_MS = 1600

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

/**
 * Scenario media field (DES-371): the one image, audio clip or video a situational test
 * carries on its brief. Empty, it is the DS file uploader; the type comes from the
 * file. Filled, the zone gives way to the media itself, playable in place, with Change
 * File and Remove. A file that can't be used says why in the zone; a failed change
 * keeps the media already there.
 */
function ScenarioMediaField({ media, onChange, onUploadingChange }: Props) {
  const reduce = useReducedMotion()
  const [upload, setUpload] = useState<{ file: File; progress: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    onUploadingChange?.(upload !== null)
  }, [upload, onUploadingChange])

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearInterval(timer.current)
    },
    [],
  )

  const start = (file: File) => {
    const problem = scenarioMediaError(file)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    setUpload({ file, progress: 0 })
    const began = performance.now()
    timer.current = window.setInterval(() => {
      const progress = Math.min(100, Math.round(((performance.now() - began) / UPLOAD_MS) * 100))
      if (progress < 100) {
        setUpload({ file, progress })
        return
      }
      if (timer.current !== null) window.clearInterval(timer.current)
      timer.current = null
      setUpload(null)
      const kind = scenarioMediaKind(file.name)
      if (!kind) {
        setError(UPLOAD_FAILED)
        return
      }
      onChange({ kind, src: URL.createObjectURL(file), name: file.name, size: file.size })
    }, 80)
  }

  return (
    <div className="scfield">
      <AnimatePresence mode="wait" initial={false}>
        {media && !upload ? (
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
                <Button variant="text" size="sm" onClick={() => inputRef.current?.click()}>
                  Change File
                </Button>
                <Tooltip text="Remove media" position="Top" icon={false}>
                  <button
                    type="button"
                    className="scfield__remove"
                    aria-label="Remove media"
                    onClick={() => {
                      setError(null)
                      onChange(undefined)
                    }}
                  >
                    <Trash size={20} color="currentColor" variant="Linear" />
                  </button>
                </Tooltip>
              </span>
            </div>
            {/* A change that can't be used keeps the media already there. */}
            {error ? (
              <span className="scfield__error" role="alert">
                {error}
              </span>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              hidden
              accept={SCENARIO_MEDIA_ACCEPT}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) start(file)
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            {...ARRIVE(reduce)}
            exit={{ opacity: 0 }}
            transition={arriveTransition(reduce)}
          >
            <FileUploader
              size="L"
              state={upload ? 'Uploading' : error ? 'Error' : undefined}
              progress={upload?.progress}
              fileName={upload?.file.name}
              errorMessage={error ?? undefined}
              accept={SCENARIO_MEDIA_ACCEPT}
              onFileSelect={start}
              helpText="Drag and drop an image, audio or video file, or click to upload (image up to 10MB • audio up to 50MB • MP4 video up to 500MB)"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ScenarioMediaField
