import { Edit, Add, ArrowRight } from 'iconsax-react'
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal'
import './CreateFlashcardsModal.css'

interface CreateFlashcardsModalProps {
  open: boolean
  onClose: () => void
  onCreateEmpty: () => void
  onAiTransformer: () => void
}

const AiSparkleIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      className="cfm-ai-sparkle-big"
      d="M9.52 5.42c.33-1.37 2.28-1.37 2.61 0l1.14 4.71c.12.49.5.87.99.99l4.71 1.14c1.37.33 1.37 2.28 0 2.61l-4.71 1.14c-.49.12-.87.5-.99.99l-1.14 4.71c-.33 1.37-2.28 1.37-2.61 0l-1.14-4.71a1.45 1.45 0 0 0-.99-.99l-4.71-1.14c-1.37-.33-1.37-2.28 0-2.61l4.71-1.14c.49-.12.87-.5.99-.99l1.14-4.71Z"
      fill="url(#ai-sparkle-gradient)"
    />
    <path
      className="cfm-ai-sparkle-small"
      d="M17.88 2.58c.11-.45.75-.45.86 0l.3 1.23c.04.16.16.28.33.33l1.23.3c.45.11.45.75 0 .86l-1.23.3c-.16.04-.28.16-.33.33l-.3 1.23c-.11.45-.75.45-.86 0l-.3-1.23a.42.42 0 0 0-.33-.33l-1.23-.3c-.45-.11-.45-.75 0-.86l1.23-.3c.16-.04.28-.16.33-.33l.3-1.23Z"
      fill="url(#ai-sparkle-gradient)"
    />
    <defs>
      <linearGradient id="ai-sparkle-gradient" x1="3" y1="4" x2="20" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00AFC4" />
        <stop offset="1" stopColor="#8158EC" />
      </linearGradient>
    </defs>
  </svg>
)

function CreateFlashcardsModal({ open, onClose, onCreateEmpty, onAiTransformer }: CreateFlashcardsModalProps) {
  return (
    <ConfirmModal open={open} onClose={onClose} className="cfm-modal">
      <div className="cfm-header">
        <h2 className="cfm-title">How would you like to create flashcards?</h2>
        <button
          type="button"
          className="cfm-close"
          aria-label="Close"
          onClick={onClose}
        >
          <Add size={24} color="var(--text-secondary)" style={{ transform: 'rotate(45deg)' }} />
        </button>
      </div>
      <div className="cfm-options">
        <button type="button" className="cfm-option cfm-option--empty" onClick={onCreateEmpty}>
          <div className="cfm-option-body">
            <div className="cfm-option-icon">
              <Edit size={32} color="var(--secondary-600)" variant="Linear" />
            </div>
            <div className="cfm-option-info">
              <h3 className="cfm-option-title">Create from scratch</h3>
              <p className="cfm-option-desc">Start with a blank template of 3 cards and build your lesson from scratch</p>
            </div>
          </div>
          <span className="cfm-option-arrow" aria-hidden="true">
            <ArrowRight size={20} color="var(--text-secondary)" variant="Linear" />
          </span>
        </button>
        <button type="button" className="cfm-option cfm-option--ai" onClick={onAiTransformer}>
          <div className="cfm-option-body">
            <div className="cfm-option-icon">
              <AiSparkleIcon size={32} />
            </div>
            <div className="cfm-option-info">
              <h3 className="cfm-option-title">Transform your content with AI</h3>
              <p className="cfm-option-desc">Upload a PDF, Word, PPT, video or audio file and let AI do the rest</p>
            </div>
          </div>
          <span className="cfm-option-arrow" aria-hidden="true">
            <ArrowRight size={20} color="var(--text-secondary)" variant="Linear" />
          </span>
        </button>
      </div>
    </ConfirmModal>
  )
}

export default CreateFlashcardsModal
