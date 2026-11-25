import { useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import './ImageOverlay.css'

interface Props {
  src: string
  alt: string
  onClose: () => void
  /** Where the overlay mounts: the phone screen in the mobile app, the page otherwise. */
  container?: Element | null
}

/**
 * A scenario image at full size (DES-371), admin and learner alike: on the scrim, as
 * large as the screen allows without cropping, 24px corners, the full-screen close on
 * its top right corner. The close, Escape or a click on the scrim closes it.
 */
function ImageOverlay({ src, alt, onClose, container }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  /* The image's own proportions, so it can grow to fill the stage, not only shrink. */
  const [ratio, setRatio] = useState<number | null>(null)
  useOverlayA11y(ref, true, { onEscape: onClose })

  return createPortal(
    <div
      ref={ref}
      className="scmedia-zoom"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="scmedia-zoom__stage"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* The close sits on the picture's top right corner, 16px above it (Bruno,
            2026-11-25). */}
        <div
          className="scmedia-zoom__frame"
          style={ratio ? ({ '--scmedia-zoom-ratio': ratio } as CSSProperties) : undefined}
        >
          <CloseButton variant="fullscreen" className="scmedia-zoom__close" ariaLabel="Close image" onClick={onClose} />
          <img
            className="scmedia-zoom__image"
            src={src}
            alt={alt}
            onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight || null)}
          />
        </div>
      </div>
    </div>,
    container ?? document.body,
  )
}

export default ImageOverlay
