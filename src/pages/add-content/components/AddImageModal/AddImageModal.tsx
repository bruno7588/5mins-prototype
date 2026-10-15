import { useEffect, useRef, useState } from 'react'
import { SearchNormal1 } from 'iconsax-react'
import SparkleIcon from '../../../../components/icons/SparkleIcon'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import FileUploader from '../../../../components/FileUploader/FileUploader'
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
}

export interface ImageModalDefault {
  id: string
  src: string
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
      if (typeof reader.result === 'string') {
        onSelect(reader.result)
        onClose()
      }
    }
    reader.readAsDataURL(file)
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

      <div className="aim-body">
        {tab === 'upload' && (
          <FileUploader
            size="L"
            accept={upload.accept}
            helpText={upload.helpText}
            state={uploadError ? 'Error' : undefined}
            errorMessage={uploadError ?? undefined}
            onFileSelect={handleFile}
            className="aim-uploader"
          />
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
                <p className="aim-generate-attribution">Powered by Nano Banana</p>
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
                  <button
                    type="button"
                    className="aim-generate-btn aim-generate-btn--secondary"
                    onClick={handleGenerate}
                  >
                    <SparkleIcon size={20} gradient />
                    <span className="aim-generate-btn-gradient-text">Generate Again</span>
                  </button>
                  <button
                    type="button"
                    className="aim-generate-btn aim-generate-btn--primary"
                    onClick={handleGeneratedPick}
                  >
                    Save Image
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="aim-generate-btn"
                  onClick={handleGenerate}
                  disabled={prompt.trim().length === 0}
                >
                  <SparkleIcon size={20} />
                  Generate Image
                </button>
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
                disabled={!!savingDefault && savingDefault !== image.id}
                onClick={() => handleDefaultPick(image.id)}
              >
                <img src={image.src} alt="" />
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

    </ConfirmModal>
  )
}

export default AddImageModal
