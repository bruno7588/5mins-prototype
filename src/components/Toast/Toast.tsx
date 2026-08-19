import { useEffect, useRef, useState } from 'react'
import { TickCircle, CloseCircle, InfoCircle, Danger } from 'iconsax-react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

/* PLACEHOLDER — alerts-toast.md specs the pill as label-only, with no action slot,
   so there is no Figma ref for this yet. Added because an undo affordance has to
   live on the toast: the alternative is a confirmation dialog in front of every
   delete, which is the thing the undo exists to avoid. */
export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: number
  type: ToastType
  message: string
  action?: ToastAction
}

interface ToastEntry extends ToastItem {
  fading: boolean
}

const ICON_MAP: Record<ToastType, typeof TickCircle> = {
  success: TickCircle,
  error: CloseCircle,
  warning: Danger,
  info: InfoCircle,
}

/* 5s, per alerts-toast.md. Reading time is roughly 1s to notice the pill plus
   ~300ms per word (200wpm); our longest toasts quote a full course title, so
   the previous 2.5s left them on screen for less time than they take to read. */
const AUTO_DISMISS_MS = 5000
const FADE_DURATION_MS = 300

/* --- Single toast pill --- */

function ToastPill({
  type, message, fading, icon, action, onAction,
}: {
  type: ToastType
  message: string
  fading: boolean
  icon: boolean
  action?: ToastAction
  onAction?: () => void
}) {
  const Icon = ICON_MAP[type]
  return (
    <div className={`toast toast--${type}${fading ? ' toast--fading' : ''}`}>
      {icon && <Icon size={24} color="currentColor" variant="Linear" />}
      <span>{message}</span>
      {action && (
        <button
          type="button"
          className="toast__action"
          onClick={() => {
            action.onClick()
            onAction?.()
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/* --- Toast container (manages stack + auto-dismiss) --- */

let globalIdCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  function show(type: ToastType, message: string, action?: ToastAction) {
    const id = ++globalIdCounter
    setToasts(prev => [...prev, { id, type, message, action, fading: false }])

    const fadeTimer = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t))

      const removeTimer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        timersRef.current.delete(id)
      }, FADE_DURATION_MS)

      timersRef.current.set(id, removeTimer)
    }, AUTO_DISMISS_MS - FADE_DURATION_MS)

    timersRef.current.set(id, fadeTimer)
  }

  /* Taking the action is an answer, so the pill goes rather than sitting there
     offering an undo that has already happened. */
  function dismiss(id: number) {
    const timer = timersRef.current.get(id)
    if (timer) clearTimeout(timer)
    timersRef.current.delete(id)
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  return { toasts, show, dismiss }
}

interface ToastContainerProps {
  toasts: ToastEntry[]
  icon?: boolean
  /** Pass `dismiss` from useToast when any toast carries an action. */
  onDismiss?: (id: number) => void
}

export default function ToastContainer({ toasts, icon = true, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastPill
          key={toast.id}
          type={toast.type}
          message={toast.message}
          fading={toast.fading}
          icon={icon}
          action={toast.action}
          onAction={() => onDismiss?.(toast.id)}
        />
      ))}
    </div>
  )
}
