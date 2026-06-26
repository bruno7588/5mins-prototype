import { useEffect, useRef, useState } from 'react'
import { SearchNormal1 } from 'iconsax-react'
import SparkleIcon from '../../../../components/icons/SparkleIcon'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import FileUploader from '../../../../components/FileUploader/FileUploader'
import './AddImageModal.css'

type Tab = 'upload' | 'generate' | 'freepik'

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
}

const GENERATED_ASPECT = '1 / 1'
const GENERATION_DELAY_MS = 3000
const SUGGEST_DELAY_MS = 900

function buildSuggestedPrompt(content: CardContent | undefined): string {
  const title = (content?.title ?? '').trim()
  const description = (content?.description ?? '').trim()
  const subject = title || description
  if (!subject) return ''
  return `An illustration that visualises "${subject}", clean modern business style, soft pastel colours, no text.`
}

const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png'

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

function AddImageModal({ open, onClose, onSelect, initialTab = 'upload', cardContent, showSuggest = true }: AddImageModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab)
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
      setTab(initialTab)
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
    }
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

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSelect(reader.result)
        onClose()
      }
    }
    reader.readAsDataURL(file)
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
    <ConfirmModal open={open} onClose={onClose} className="aim-modal">
      <button type="button" className="aim-close" aria-label="Close" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M17.25 17.25L6.75 6.75M17.25 6.75L6.75 17.25"
            stroke="#454C5E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="aim-header">
        <h2 className="aim-title">Add image</h2>
        <div className="aim-divider" />
        <div className="aim-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'upload'}
            className={`aim-tab${tab === 'upload' ? ' aim-tab--active' : ''}`}
            onClick={() => setTab('upload')}
          >
            Upload image
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'generate'}
            className={`aim-tab${tab === 'generate' ? ' aim-tab--active' : ''}`}
            onClick={() => setTab('generate')}
          >
            Generate With AI
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'freepik'}
            className={`aim-tab${tab === 'freepik' ? ' aim-tab--active' : ''}`}
            onClick={() => setTab('freepik')}
          >
            Stock Footage
          </button>
        </div>
      </div>

      <div className="aim-body">
        {tab === 'upload' && (
          <FileUploader
            size="L"
            accept={ACCEPTED_IMAGE_EXTENSIONS}
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
                    <SparkleIcon size={20} color="#00CEE6" />
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
                    <span className="aim-generate-btn-gradient-text">Generate Again</span>
                    <SparkleIcon size={20} gradient />
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
                  Generate Image
                  <SparkleIcon size={20} />
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
      </div>
    </ConfirmModal>
  )
}

export default AddImageModal
