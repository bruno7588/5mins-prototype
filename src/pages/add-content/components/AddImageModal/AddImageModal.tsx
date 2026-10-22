import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Add, Minus, SearchNormal1 } from 'iconsax-react'
import SparkleIcon from '../../../../components/icons/SparkleIcon'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import FileUploader from '../../../../components/FileUploader/FileUploader'
import Button from '@/components/Button/Button'
import Slider from '@/components/Slider/Slider'
import Tooltip from '@/components/Tooltip/Tooltip'
import './AddImageModal.css'

export type ImageModalTab = 'upload' | 'generate' | 'freepik' | 'defaults'
type Tab = ImageModalTab

const TAB_LABELS: Record<Tab, string> = {
  upload: 'Upload image',
  generate: 'Generate With AI',
  freepik: 'Stock Footage',
  defaults: 'Default images',
}

const DEFAULT_TABS: Tab[] = ['upload', 'generate', 'freepik']

export interface ImageModalUpload {
  /** File input accept list. */
  accept: string
  /** Drop-zone copy; defaults to FileUploader's own. */
  helpText?: string
  /** Resolves to an error message to reject the file, or null to accept it. */
  validate?: (file: File) => Promise<string | null>
  /** Hold the picked file in the uploader with a zoom slider, and only use it on Save
      (square, cropped to the zoom). Without it a valid file is used straight away. */
  confirm?: boolean
}

export interface ImageModalDefault {
  id: string
  src: string
  /** Laid over the tile image, e.g. a live version of it. */
  overlay?: ReactNode
  /** Still being prepared (e.g. rendered in the tenant's colours): a spinner, not yet pickable. */
  loading?: boolean
}

interface CardContent {
  title?: string
  description?: string
}

interface AddImageModalProps {
  open: boolean
  onClose: () => void
  onSelect: (imageDataUrl: string) => void
  initialTab?: Tab
  cardContent?: CardContent
  /** Show the "Suggest From Card" affordance on the Generate tab (default true). */
  showSuggest?: boolean
  /** Defaults keep the lesson / course / program image picker as it was. */
  title?: string
  /** Which tabs show, in order. */
  tabs?: Tab[]
  upload?: ImageModalUpload
  /** Default images tab: the tiles and the one currently in use. Clicking a tile
      shows a short loading state, then saves it and closes. */
  defaultImages?: ImageModalDefault[]
  selectedDefaultId?: string
  onSaveDefault?: (id: string) => void
}

const GENERATED_ASPECT = '1 / 1'
const GENERATION_DELAY_MS = 3000
const DEFAULT_SAVE_DELAY_MS = 1000
const SUGGEST_DELAY_MS = 900
const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_STEP = 0.25
/** Long edge cap for a saved, cropped upload. */
const CROP_MAX = 1024
const CENTRE = { x: 0.5, y: 0.5 }
/** Arrow keys move the crop this share of its own side. */
const NUDGE = 0.05

/** A held upload: its natural size, plus the crop centre as 0-1 of each side. */
interface StagedImage {
  src: string
  name: string
  width: number
  height: number
}

/** Side of the square crop, as 0-1 of the image's width and height. */
function cropSpan(img: StagedImage, zoom: number) {
  const side = Math.min(img.width, img.height) / zoom
  return { x: side / img.width, y: side / img.height }
}

/** Keeps the crop window inside the image. */
function clampCentre(img: StagedImage, zoom: number, c: { x: number; y: number }) {
  const span = cropSpan(img, zoom)
  const clamp = (v: number, s: number) => Math.min(1 - s / 2, Math.max(s / 2, v))
  return { x: clamp(c.x, span.x), y: clamp(c.y, span.y) }
}

/** The square at `zoom` round centre `c` (0-1), as a data URL. */
function cropSquare(src: string, zoom: number, c: { x: number; y: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight) / zoom
      const out = Math.min(CROP_MAX, Math.round(side))
      const canvas = document.createElement('canvas')
      canvas.width = out
      canvas.height = out
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('No canvas'))
      ctx.drawImage(img, c.x * img.naturalWidth - side / 2, c.y * img.naturalHeight - side / 2, side, side, 0, 0, out, out)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = src
  })
}

function buildSuggestedPrompt(content: CardContent | undefined): string {
  const title = (content?.title ?? '').trim()
  const description = (content?.description ?? '').trim()
  const subject = title || description
  if (!subject) return ''
  return `An illustration that visualises "${subject}", clean modern business style, soft pastel colours, no text.`
}

const DEFAULT_UPLOAD: ImageModalUpload = { accept: '.jpg,.jpeg,.png' }

const ASPECT_POOL = ['4 / 3', '3 / 4', '1 / 1', '3 / 2', '16 / 9', '2 / 3'] as const

const pickAspect = (id: number) => ASPECT_POOL[id % ASPECT_POOL.length]

const FREEPIK_STUBS = [
  { id: 1, seed: 'compliance-team', title: 'Team meeting', premium: false },
  { id: 2, seed: 'classroom-students', title: 'Classroom', premium: true },
  { id: 3, seed: 'office-hallway', title: 'Office hallway', premium: false },
  { id: 4, seed: 'handshake-contract', title: 'Signing contract', premium: false },
  { id: 5, seed: 'laptop-coffee', title: 'Workspace', premium: true },
  { id: 6, seed: 'audit-documents', title: 'Audit documents', premium: false },
  { id: 7, seed: 'training-session', title: 'Training session', premium: false },
  { id: 8, seed: 'boardroom-glass', title: 'Boardroom', premium: true },
  { id: 9, seed: 'hospital-ward', title: 'Hospital ward', premium: false },
  { id: 10, seed: 'product-launch', title: 'Product launch', premium: false },
  { id: 11, seed: 'data-analytics', title: 'Analytics', premium: true },
  { id: 12, seed: 'mountain-hiker', title: 'Hiker', premium: false },
]

const freepikThumb = (seed: string, aspect: string) => {
  const [w, h] = aspect.split(' / ').map(Number)
  const base = 600
  const width = w >= h ? base : Math.round((base * w) / h)
  const height = h >= w ? base : Math.round((base * h) / w)
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

function AddImageModal({
  open,
  onClose,
  onSelect,
  initialTab = 'upload',
  cardContent,
  showSuggest = true,
  title = 'Add image',
  tabs = DEFAULT_TABS,
  upload = DEFAULT_UPLOAD,
  defaultImages = [],
  selectedDefaultId,
  onSaveDefault,
}: AddImageModalProps) {
  const startTab = tabs.includes(initialTab) ? initialTab : tabs[0]
  const [tab, setTab] = useState<Tab>(startTab)
  const [uploadError, setUploadError] = useState<string | null>(null)
  /** Upload with `confirm`: the picked file, held until Save. */
  const [staged, setStaged] = useState<StagedImage | null>(null)
  const [zoom, setZoom] = useState(ZOOM_MIN)
  /** Crop centre, 0-1 of the image; dragging the image moves it. */
  const [centre, setCentre] = useState(CENTRE)
  const dragRef = useRef<{ x: number; y: number; centre: { x: number; y: number } } | null>(null)
  const [pickedDefault, setPickedDefault] = useState(selectedDefaultId)
  const [savingDefault, setSavingDefault] = useState<string | null>(null)
  const saveTimer = useRef<number | null>(null)
  const [query, setQuery] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [suggestTooltipPos, setSuggestTooltipPos] = useState<{ top: number; left: number } | null>(null)
  const generationTimer = useRef<number | null>(null)
  const suggestTimer = useRef<number | null>(null)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const suggestBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      setTab(startTab)
      setUploadError(null)
      setStaged(null)
      setZoom(ZOOM_MIN)
      setCentre(CENTRE)
      setPickedDefault(selectedDefaultId)
      setSavingDefault(null)
      setQuery('')
      setPrompt('')
      setGenerating(false)
      setSuggesting(false)
      setGeneratedUrl(null)
    }
    return () => {
      if (generationTimer.current !== null) {
        window.clearTimeout(generationTimer.current)
        generationTimer.current = null
      }
      if (suggestTimer.current !== null) {
        window.clearTimeout(suggestTimer.current)
        suggestTimer.current = null
      }
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = null
      }
    }
    // Reset on open only; tabs and the current default are read as they are then.
  }, [open, initialTab])

  const q = query.trim()
  const filteredFreepik = q
    ? Array.from({ length: 12 }, (_, i) => ({
        id: 100 + i,
        seed: `${q.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        title: `${q} · ${i + 1}`,
        premium: i % 3 === 1,
      }))
    : FREEPIK_STUBS

  const handleFile = async (file: File) => {
    const error = upload.validate ? await upload.validate(file) : null
    setUploadError(error)
    if (error) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      /* The crop redraws through a canvas, which keeps only a GIF's first frame, so a
         GIF is used as picked and left to its frame to square it. */
      if (upload.confirm && file.type !== 'image/gif') {
        const src = reader.result
        const probe = new Image()
        probe.onload = () => {
          setStaged({ src, name: file.name, width: probe.naturalWidth, height: probe.naturalHeight })
          setZoom(ZOOM_MIN)
          setCentre(CENTRE)
        }
        probe.src = src
        return
      }
      onSelect(reader.result)
      onClose()
    }
    reader.readAsDataURL(file)
  }

  const handleStagedSave = async () => {
    if (!staged) return
    onSelect(await cropSquare(staged.src, zoom, centre))
    onClose()
  }

  /* Zoom round the current centre, pulled back in if the wider window would leave the image. */
  const changeZoom = (next: number) => {
    const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
    setZoom(z)
    if (staged) setCentre((c) => clampCentre(staged, z, c))
  }

  const handleStagePointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, centre }
  }

  const handleStagePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current
    if (!drag || !staged) return
    // The frame shows one crop side, so a full frame's drag moves the centre one span.
    const frame = e.currentTarget.getBoundingClientRect().width
    const span = cropSpan(staged, zoom)
    setCentre(
      clampCentre(staged, zoom, {
        x: drag.centre.x - ((e.clientX - drag.x) / frame) * span.x,
        y: drag.centre.y - ((e.clientY - drag.y) / frame) * span.y,
      }),
    )
  }

  const handleStagePointerUp = () => {
    dragRef.current = null
  }

  const handleStageKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!staged) return
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
    if (!step) return
    e.preventDefault()
    const span = cropSpan(staged, zoom)
    setCentre((c) => clampCentre(staged, zoom, { x: c.x + step[0] * span.x * NUDGE, y: c.y + step[1] * span.y * NUDGE }))
  }

  const handleDefaultPick = (id: string) => {
    if (savingDefault || id === selectedDefaultId) return
    setPickedDefault(id)
    setSavingDefault(id)
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null
      onSaveDefault?.(id)
      onClose()
    }, DEFAULT_SAVE_DELAY_MS)
  }

  const handleFreepikPick = (seed: string, aspect: string) => {
    onSelect(freepikThumb(seed, aspect))
    onClose()
  }

  const promptToSeed = (text: string) =>
    `nano-${text.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 60) || 'idea'}-${Date.now()}`

  const hasCardContent = Boolean(
    (cardContent?.title ?? '').trim() || (cardContent?.description ?? '').trim(),
  )

  const showSuggestTooltip = () => {
    if (hasCardContent) return
    const el = suggestBtnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setSuggestTooltipPos({ top: r.top - 8, left: r.right })
  }
  const hideSuggestTooltip = () => setSuggestTooltipPos(null)

  const handleSuggestPrompt = () => {
    if (!hasCardContent || suggesting || generating) return
    setSuggesting(true)
    if (suggestTimer.current !== null) window.clearTimeout(suggestTimer.current)
    suggestTimer.current = window.setTimeout(() => {
      setPrompt(buildSuggestedPrompt(cardContent))
      setSuggesting(false)
      suggestTimer.current = null
      promptRef.current?.focus()
    }, SUGGEST_DELAY_MS)
  }

  const handleGenerate = () => {
    const trimmed = prompt.trim()
    if (!trimmed || generating) return
    setGeneratedUrl(null)
    setGenerating(true)
    if (generationTimer.current !== null) window.clearTimeout(generationTimer.current)
    generationTimer.current = window.setTimeout(() => {
      setGeneratedUrl(freepikThumb(promptToSeed(trimmed), GENERATED_ASPECT))
      setGenerating(false)
      generationTimer.current = null
    }, GENERATION_DELAY_MS)
  }

  const handleGeneratedPick = () => {
    if (!generatedUrl) return
    onSelect(generatedUrl)
    onClose()
  }



  return (
    <ConfirmModal open={open} onClose={onClose} className="aim-modal" ariaLabel={title} closable>
      <div className="aim-header">
        <h2 className="aim-title">{title}</h2>
        <div className="aim-divider" />
        <div className="aim-tabs" role="tablist">
          {tabs.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`aim-tab${tab === key ? ' aim-tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className={`aim-body${tab === 'upload' && upload.confirm ? ' aim-body--confirm' : ''}`}>
        {tab === 'upload' && (
          <div className="aim-upload">
            <FileUploader
              size="L"
              accept={upload.accept}
              helpText={upload.helpText}
              state={uploadError ? 'Error' : staged ? 'Filled' : undefined}
              errorMessage={uploadError ?? undefined}
              filledPreview={
                staged ? (
                  <span
                    className="aim-stage"
                    role="group"
                    aria-label="Crop. Drag the image or use the arrow keys to move it."
                    tabIndex={0}
                    onPointerDown={handleStagePointerDown}
                    onPointerMove={handleStagePointerMove}
                    onPointerUp={handleStagePointerUp}
                    onPointerCancel={handleStagePointerUp}
                    onKeyDown={handleStageKeyDown}
                  >
                    <img
                      src={staged.src}
                      alt=""
                      draggable={false}
                      style={(() => {
                        // The image at the size where one crop side fills the frame, placed so the centre sits mid-frame.
                        const span = cropSpan(staged, zoom)
                        return {
                          width: `${100 / span.x}%`,
                          height: `${100 / span.y}%`,
                          left: `${50 - (centre.x / span.x) * 100}%`,
                          top: `${50 - (centre.y / span.y) * 100}%`,
                        }
                      })()}
                    />
                  </span>
                ) : undefined
              }
              onFileSelect={handleFile}
              className="aim-uploader"
            />
            {staged && (
              <div className="aim-zoom">
                <Tooltip icon={false} text="Zoom out">
                  <button
                    type="button"
                    className="aim-zoom__btn"
                    aria-label="Zoom out"
                    disabled={zoom <= ZOOM_MIN}
                    onClick={() => changeZoom(zoom - ZOOM_STEP)}
                  >
                    <Minus size={24} color="var(--text-primary)" />
                  </button>
                  </Tooltip>
                <Slider
                  aria-label="Zoom"
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={0.01}
                  value={zoom}
                  onChange={changeZoom}
                />
                <Tooltip icon={false} text="Zoom in">
                  <button
                    type="button"
                    className="aim-zoom__btn"
                    aria-label="Zoom in"
                    disabled={zoom >= ZOOM_MAX}
                    onClick={() => changeZoom(zoom + ZOOM_STEP)}
                  >
                    <Add size={24} color="var(--text-primary)" />
                  </button>
                  </Tooltip>
              </div>
            )}
          </div>
        )}

        {tab === 'generate' && (
          <div className="aim-generate">
            <div className="aim-generate-section">
              <div className="aim-generate-header">
                <label className="aim-generate-label" htmlFor="aim-generate-prompt">
                  Describe the image you want
                </label>
                {showSuggest && (
                  <>
                    <button
                      ref={suggestBtnRef}
                      type="button"
                      className={`aim-suggest-btn${(!hasCardContent || suggesting || generating) ? ' aim-suggest-btn--disabled' : ''}`}
                      aria-disabled={!hasCardContent || suggesting || generating}
                      onMouseEnter={showSuggestTooltip}
                      onMouseLeave={hideSuggestTooltip}
                      onFocus={showSuggestTooltip}
                      onBlur={hideSuggestTooltip}
                      onClick={() => {
                        if (!hasCardContent || suggesting || generating) return
                        handleSuggestPrompt()
                      }}
                    >
                      <SparkleIcon size={16} />
                      {suggesting ? 'Suggesting…' : 'Suggest From Card'}
                    </button>
                    {suggestTooltipPos && (
                      <div
                        role="tooltip"
                        className="aim-suggest-tooltip"
                        style={{ top: suggestTooltipPos.top, left: suggestTooltipPos.left }}
                      >
                        Add a title or description to the card
                      </div>
                    )}
                  </>
                )}
              </div>
              <textarea
                ref={promptRef}
                id="aim-generate-prompt"
                className="aim-generate-textarea"
                placeholder="e.g. A friendly illustration of a team in a meeting room, soft pastel colours"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={1}
                disabled={generating || suggesting}
              />
            </div>

{(generating || generatedUrl) && (
              <div className="aim-generate-result">
                {generating ? (
                  <div
                    className="aim-generate-skeleton"
                    style={{ aspectRatio: GENERATED_ASPECT }}
                    aria-hidden="true"
                  />
                ) : (
                  <button
                    type="button"
                    className="aim-generate-card"
                    style={{ aspectRatio: GENERATED_ASPECT }}
                    onClick={handleGeneratedPick}
                    aria-label="Use this generated image"
                  >
                    <img src={generatedUrl!} alt="Generated preview" />
                  </button>
                )}
              </div>
            )}

            <div
              className={`aim-generate-actions${
                generatedUrl && !generating ? ' aim-generate-actions--pair' : ''
              }`}
            >
              {generating ? (
                <div className="aim-generate-progress" aria-live="polite">
                  <div className="aim-generate-progress-info">
                    <SparkleIcon size={20} color="var(--primary-500)" />
                    <span>Generating your image…</span>
                  </div>
                  <div
                    className="aim-generate-progress-bar"
                    role="progressbar"
                    aria-label="Generating image"
                  >
                    <div className="aim-generate-progress-bar-fill" />
                  </div>
                </div>
              ) : generatedUrl ? (
                <>
                  {/* DS AI Outlined, Medium (Library 11210:5329). */}
                  <Button
                    semantic="ai"
                    variant="outlined"
                    icon={<SparkleIcon size={20} gradient />}
                    onClick={handleGenerate}
                  >
                    Generate Again
                  </Button>
                  <Button onClick={handleGeneratedPick}>Save Image</Button>
                </>
              ) : (
                <Button
                  semantic="ai"
                  icon={<SparkleIcon size={20} />}
                  onClick={handleGenerate}
                  disabled={prompt.trim().length === 0}
                >
                  Generate Image
                </Button>
              )}
            </div>
          </div>
        )}

        {tab === 'freepik' && (
          <div className="aim-freepik">
            <div className="aim-search">
              <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
              <input
                type="text"
                className="aim-search-input"
                placeholder="Search stock footage"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="aim-search-clear"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                      d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="aim-freepik-grid">
              {filteredFreepik.map((item) => {
                const aspect = pickAspect(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="aim-freepik-card"
                    style={{ aspectRatio: aspect }}
                    onClick={() => handleFreepikPick(item.seed, aspect)}
                    aria-label={`Use ${item.title}`}
                  >
                    <img src={freepikThumb(item.seed, aspect)} alt={item.title} loading="lazy" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'defaults' && (
          <div className="aim-defaults" role="radiogroup" aria-label="Default images" aria-busy={!!savingDefault}>
            {defaultImages.map((image, i) => (
              <button
                key={image.id}
                type="button"
                role="radio"
                aria-checked={pickedDefault === image.id}
                aria-label={`Default image ${i + 1}`}
                className={`aim-defaults__tile${pickedDefault === image.id ? ' aim-defaults__tile--selected' : ''}`}
                disabled={image.loading || (!!savingDefault && savingDefault !== image.id)}
                aria-busy={image.loading || undefined}
                onClick={() => handleDefaultPick(image.id)}
              >
                {image.loading ? (
                  <span className="aim-defaults__loading" role="status" aria-label="Preparing image">
                    <span className="ds-btn__spinner" />
                  </span>
                ) : (
                  <img src={image.src} alt="" />
                )}
                {image.overlay}
                {savingDefault === image.id && (
                  <span className="aim-defaults__saving" role="status" aria-label="Saving image">
                    <span className="ds-btn__spinner" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'upload' && upload.confirm && (
        <div className="confirm-modal-actions">
          <Button variant="outlined-2" onClick={onClose}>Cancel</Button>
          <Button disabled={!staged} onClick={handleStagedSave}>Save</Button>
        </div>
      )}
    </ConfirmModal>
  )
}

export default AddImageModal
