import { useEffect, useRef, useState } from 'react'
import { TickCircle, InfoCircle, Danger } from 'iconsax-react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
  /** Replaces the type icon, e.g. a download glyph on a "Downloading..." toast. */
  icon?: typeof TickCircle
}

interface ToastEntry extends ToastItem {
  fading: boolean
}

/* Warning and Error share the triangle, per the Figma node. Info is Iconsax's
   InfoCircle — the node uses io5's outline info icon, and Iconsax is the project's
   only icon set. */
const ICON_MAP: Record<ToastType, typeof TickCircle> = {
  success: TickCircle,
  error: Danger,
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
  type, message, fading, icon, customIcon,
}: {
  type: ToastType
  message: string
  fading: boolean
  icon: boolean
  customIcon?: typeof TickCircle
}) {
  const Icon = customIcon ?? ICON_MAP[type]
  return (
    <div
      className={`toast toast--${type}${fading ? ' toast--fading' : ''}`}
      role={type === 'warning' || type === 'error' ? 'alert' : 'status'}
    >
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

  function show(type: ToastType, message: string, icon?: typeof TickCircle) {
    const id = ++globalIdCounter
    setToasts(prev => [...prev, { id, type, message, icon, fading: false }])

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
  /** Extra class to place the stack somewhere other than bottom centre. */
  className?: string
}

export default function ToastContainer({ toasts, icon = true, className }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className={className ? `toast-container ${className}` : 'toast-container'}>
      {toasts.map(toast => (
        <ToastPill
          key={toast.id}
          type={toast.type}
          message={toast.message}
          fading={toast.fading}
          icon={icon}
          customIcon={toast.icon}
        />
      ))}
    </div>
  )
}
