import { useEffect, useRef, useState, type ReactNode } from 'react'
import './BottomSheet.css'

/** Drag distance (px) past which letting go closes the sheet. */
const DISMISS_DISTANCE = 80
/** Matches the exit transition in BottomSheet.css. */
const EXIT_MS = 240

interface BottomSheetProps {
  /** Called once the sheet has finished sliding out; unmount it then. */
  onClose: () => void
  /** Names the dialog for assistive tech. */
  ariaLabel: string
  children: ReactNode
  className?: string
}

/**
 * Bottom sheet - overlays.md, Figma Library 7479:106. The mobile overlay: a
 * `--page-background` sheet rising from the bottom edge over a `--scrim` overlay,
 * with a grab handle. Mount it to open; tapping the overlay, pressing Escape or
 * dragging the handle down closes it. It fills its nearest positioned ancestor
 * (the phone screen in the mobile prototype).
 */
function BottomSheet({ onClose, ariaLabel, children, className }: BottomSheetProps) {
  const [shown, setShown] = useState(false)
  const [dragY, setDragY] = useState(0)
  const dragStart = useRef<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)

  /* Mount below the edge, then rise on the next frame so the transition runs. */
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    sheetRef.current?.focus()
    return () => cancelAnimationFrame(id)
  }, [])

  const close = () => {
    if (closing.current) return
    closing.current = true
    setDragY(0)
    setShown(false)
    window.setTimeout(onClose, EXIT_MS)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return
    setDragY(Math.max(0, e.clientY - dragStart.current))
  }
  const onPointerUp = () => {
    if (dragStart.current === null) return
    dragStart.current = null
    if (dragY > DISMISS_DISTANCE) close()
    else setDragY(0)
  }

  const dragging = dragY > 0 && dragStart.current !== null

  return (
    <div className={`bottom-sheet${shown ? ' bottom-sheet--shown' : ''}${className ? ` ${className}` : ''}`}>
      <button type="button" className="bottom-sheet__overlay" aria-label="Close" tabIndex={-1} onClick={close} />
      <div
        ref={sheetRef}
        className={`bottom-sheet__panel${dragging ? ' bottom-sheet__panel--dragging' : ''}`}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        <div
          className="bottom-sheet__header"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="bottom-sheet__handle" aria-hidden="true" />
        </div>
        <div className="bottom-sheet__content">{children}</div>
      </div>
    </div>
  )
}

export default BottomSheet
