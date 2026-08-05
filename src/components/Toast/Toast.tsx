import { useEffect, useRef, useState } from 'react'
import { TickCircle, CloseCircle, InfoCircle, Danger } from 'iconsax-react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
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

function ToastPill({ type, message, fading, icon }: { type: ToastType; message: string; fading: boolean; icon: boolean }) {
  const Icon = ICON_MAP[type]
  return (
    <div className={`toast toast--${type}${fading ? ' toast--fading' : ''}`}>
      {icon && <Icon size={24} color="currentColor" variant="Linear" />}
      <span>{message}</span>
    </div>
  )
}

/* --- Toast container (manages stack + auto-dismiss) --- */

let globalIdCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  function show(type: ToastType, message: string) {
    const id = ++globalIdCounter
    setToasts(prev => [...prev, { id, type, message, fading: false }])

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

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  return { toasts, show }
}

interface ToastContainerProps {
  toasts: ToastEntry[]
  icon?: boolean
}

export default function ToastContainer({ toasts, icon = true }: ToastContainerProps) {
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
        />
      ))}
    </div>
  )
}
