import { useRef } from 'react'
import { useOverlayA11y } from '../../hooks/useOverlayA11y'
import './ConfirmModal.css'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  /** Accessible name for the dialog (falls back to a generic one). */
  ariaLabel?: string
}

function ConfirmModal({ open, onClose, children, className, ariaLabel }: ConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useOverlayA11y(panelRef, open, { onEscape: onClose })

  if (!open) return null

  return (
    <div className="confirm-modal-overlay" onMouseDown={onClose}>
      <div
        ref={panelRef}
        className={`confirm-modal${className ? ` ${className}` : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-label={ariaLabel ?? 'Confirm action'}
        tabIndex={-1}
        onMouseDown={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default ConfirmModal
