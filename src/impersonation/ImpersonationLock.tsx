import type { ReactNode } from 'react'
import Tooltip from '@/components/Tooltip/Tooltip'
import { useImpersonation } from './ImpersonationContext'
import './ImpersonationLock.css'

interface Props {
  /** Verb phrase for what is not allowed, read into "You can't {action} while
   *  impersonating" and the audit trail — e.g. "open Admin", "change their email". */
  action: string
  /** Render the control; `locked` is true while a session is live. The control must
   *  style itself disabled and set aria-disabled (not the native `disabled`, which
   *  drops it from the tab order and blocks the tooltip). */
  children: (locked: boolean) => ReactNode
  position?: 'Top' | 'Bottom' | 'Left' | 'Right'
  /** Extra class on the tooltip wrapper, e.g. to let a full-width control fill it. */
  className?: string
}

/**
 * The reference pattern for an action that isn't allowed while impersonating (DES-337):
 * the control stays visible but disabled, a tooltip on hover and keyboard focus says
 * why, and any click is swallowed and recorded as a blocked attempt in the audit trail.
 * Outside a session it renders the control untouched.
 */
function ImpersonationLock({ action, children, position = 'Top', className }: Props) {
  const { person, logBlocked } = useImpersonation()
  if (!person) return <>{children(false)}</>

  return (
    <Tooltip
      className={className}
      text={`You can't ${action} while impersonating`}
      position={position}
      icon={false}
    >
      <span
        className="imp-lock"
        onClickCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
          logBlocked(action)
        }}
      >
        {children(true)}
      </span>
    </Tooltip>
  )
}

export default ImpersonationLock
