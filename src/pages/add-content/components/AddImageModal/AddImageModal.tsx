import { useEffect, useRef, useState } from 'react'
import { MagicStar, SearchNormal1 } from 'iconsax-react'
import Chip from '../../../../components/Chip/Chip'
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal'
import FileUploader from '../../../../components/FileUploader/FileUploader'
import './AddImageModal.css'

interface AddImageModalProps {
  open: boolean
  onClose: () => void
  onSelect: (imageDataUrl: string) => void
}

type Tab = 'upload' | 'generate' | 'freepik'

const GENERATED_ASPECT = '1 / 1'
const GENERATION_DELAY_MS = 3000

const STYLE_PRESETS = [
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'illustration', label: 'Illustration' },
  { id: '3d-render', label: '3D render' },
  { id: 'flat-design', label: 'Flat design' },
  { id: 'minimalist', label: 'Minimalist' },
] as const

type StyleId = (typeof STYLE_PRESETS)[number]['id']

const LOADING_STATUSES = [
  'Generating…',
  'Refining details…',
  'Almost done…',
] as const

const LOADING_STATUS_INTERVAL_MS = 1000

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

function AddImageModal({ open, onClose, onSelect }: AddImageModalProps) {
  const [tab, setTab] = useState<Tab>('upload')
  const [query, setQuery] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<StyleId | null>(null)
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0)
  const generationTimer = useRef<number | null>(null)
  const statusTimer = useRef<number | null>(null)

  useEffect(() => {
    if (open) {
      setTab('upload')
      setQuery('')
      setPrompt('')
      setGenerating(false)
      setGeneratedUrl(null)
      setSelectedStyle(null)
      setLoadingStatusIndex(0)
    }
    return () => {
      if (generationTimer.current !== null) {
        window.clearTimeout(generationTimer.current)
        generationTimer.current = null
      }
      if (statusTimer.current !== null) {
        window.clearInterval(statusTimer.current)
        statusTimer.current = null
      }
    }
  }, [open])

  useEffect(() => {
    if (!generating) {
      if (statusTimer.current !== null) {
        window.clearInterval(statusTimer.current)
        statusTimer.current = null
      }
      return
    }
    setLoadingStatusIndex(0)
    statusTimer.current = window.setInterval(() => {
      setLoadingStatusIndex((i) => Math.min(i + 1, LOADING_STATUSES.length - 1))
    }, LOADING_STATUS_INTERVAL_MS)
    return () => {
      if (statusTimer.current !== null) {
        window.clearInterval(statusTimer.current)
        statusTimer.current = null
      }
    }
  }, [generating])

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

  const promptToSeed = (text: string, style: StyleId | null) =>
    `nano-${text.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 60) || 'idea'}-${style ?? 'auto'}-${Date.now()}`

  const handleGenerate = () => {
    const trimmed = prompt.trim()
    if (!trimmed || generating) return
    setGeneratedUrl(null)
    setGenerating(true)
    if (generationTimer.current !== null) window.clearTimeout(generationTimer.current)
    generationTimer.current = window.setTimeout(() => {
      setGeneratedUrl(freepikThumb(promptToSeed(trimmed, selectedStyle), GENERATED_ASPECT))
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
            Freepik images
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
              <label className="aim-generate-label" htmlFor="aim-generate-prompt">
                Describe the image you want
              </label>
              <textarea
                id="aim-generate-prompt"
                className="aim-generate-textarea"
                placeholder="e.g. A friendly illustration of a team in a meeting room, soft pastel colours"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={1}
                disabled={generating}
              />
            </div>

            <div className="aim-generate-chips">
              {STYLE_PRESETS.map((style) => {
                const isActive = selectedStyle === style.id
                return (
                  <Chip
                    key={style.id}
                    label={style.label}
                    selected={isActive}
                    disabled={generating}
                    onClick={() => setSelectedStyle(isActive ? null : style.id)}
                  />
                )
              })}
            </div>

            {(generating || generatedUrl) && (
              <div className="aim-generate-result">
                {generating ? (
                  <div className="aim-generate-loading">
                    <div
                      className="aim-generate-skeleton"
                      style={{ aspectRatio: GENERATED_ASPECT }}
                      aria-hidden="true"
                    />
                    <p className="aim-generate-status" aria-live="polite">
                      {LOADING_STATUSES[loadingStatusIndex]}
                    </p>
                  </div>
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
              {generatedUrl && !generating ? (
                <>
                  <button
                    type="button"
                    className="aim-generate-btn aim-generate-btn--secondary"
                    onClick={handleGenerate}
                  >
                    Generate again
                  </button>
                  <button
                    type="button"
                    className="aim-generate-btn aim-generate-btn--primary"
                    onClick={handleGeneratedPick}
                  >
                    Use this image
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="aim-generate-btn"
                  onClick={handleGenerate}
                  disabled={generating || prompt.trim().length === 0}
                >
                  {generating ? 'Generating…' : 'Generate Image'}
                  <MagicStar size={24} color="currentColor" variant="Bold" />
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
                placeholder="Search Freepik images"
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
