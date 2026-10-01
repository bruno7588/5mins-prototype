import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useOverlayA11y } from '../../hooks/useOverlayA11y'
import CloseButton from '@/components/CloseButton/CloseButton'
import './ConfirmModal.css'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  /** Accessible name for the dialog (falls back to a generic one). */
  ariaLabel?: string
  /** Shows the close X in the top-right corner. Off by default: a confirm dialog
      has no close by rule (overlays.md); a modal to read or fill in turns it on. */
  closable?: boolean
}

function ConfirmModal({ open, onClose, children, className, ariaLabel, closable = false }: ConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useOverlayA11y(panelRef, open, { onEscape: onClose })

  if (!open) return null

  /* Portalled to <body>: a confirm opened from inside a panel that sets its own
     z-index (the automations details modal is 90) would otherwise be trapped in
     that stacking context, and the topnav at 100 would paint over its top edge
     however high this overlay's z-index went. */
  return createPortal(
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
        {/* A modal's close, pinned to the panel's top-right corner as the Library
            Modal draws it (7479:4350), so every modal closes from the same place
            whatever its header holds. Confirm dialogs leave it off. */}
        {closable && (
          <CloseButton className="confirm-modal__close" onClick={onClose} ariaLabel="Close" />
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmModal
