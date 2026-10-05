import { useRef, type ComponentType, type ReactNode } from 'react'
import { TickCircle } from 'iconsax-react'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import CloseButton from '@/components/CloseButton/CloseButton'
import Tooltip from '@/components/Tooltip/Tooltip'
import './WizardShell.css'

/* Full-screen wizard shell shared by "Enrol people to your course" and
   "Assign courses": header with one action, a left step rail, the step content.
   No DS doc yet (DES-332 B5); anatomy per agents/output/2026-10-02-DES-332-assign-courses.design-research.md (a). */

type IconType = ComponentType<{ size?: number; color?: string; variant?: 'Linear' | 'Bold' }>

export type StepState =
  /** The step on screen. */
  | 'current'
  /** Done or available: a button that goes back to it. */
  | 'reachable'
  /** Not reachable yet; the sub-line says what unlocks it. */
  | 'locked'
  /** Shown for context but not built (`.ui-disabled`). */
  | 'inert'

export interface WizardStep {
  id: string
  title: string
  sub: string
  Icon: IconType
  state: StepState
  /** Top stepper: a completed step swaps its number for a success tick. */
  done?: boolean
  /** Top stepper: shown after the label, e.g. "Courses (3)". */
  count?: number
}

interface Props {
  open: boolean
  title: string
  closeLabel: string
  onClose: () => void
  /** The primary action: top right (rail), footer right (top). */
  action?: ReactNode
  /** Top layout only: the footer's left slot, e.g. Back. */
  backAction?: ReactNode
  steps: WizardStep[]
  onStepSelect?: (id: string) => void
  /** Replaces the header, rail and content (e.g. a success view). */
  takeover?: ReactNode
  /** "rail": steps down the left, action in the header (Enrol people).
      "top": a numbered stepper in the header, action in a sticky footer. */
  layout?: 'rail' | 'top'
  children: ReactNode
}

const ICON_COLOR: Record<StepState, string> = {
  current: 'var(--text-selected)',
  reachable: 'var(--text-primary)',
  locked: 'var(--text-disabled)',
  inert: 'var(--text-primary)',
}

function WizardShell({ open, title, closeLabel, onClose, action, backAction, steps, onStepSelect, takeover, layout = 'rail', children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  useOverlayA11y(panelRef, open, { onEscape: onClose })

  if (!open) return null

  const stepBody = (s: WizardStep) => (
    <>
      <s.Icon size={32} color={ICON_COLOR[s.state]} variant={s.state === 'current' ? 'Bold' : 'Linear'} />
      <span className="wzs-step-text">
        <span className="wzs-step-title">{s.title}</span>
        <span className="wzs-step-sub">{s.sub}</span>
      </span>
    </>
  )

  /* Top stepper: numbered steps joined by a line, the current one filled amber.
     Done or available steps are buttons back; locked ones say why in a Tooltip. */
  const stepper = (
    <nav className="wzs-stepper" aria-label={`${title} steps`}>
      <ol>
        {steps.map((s, i) => {
          const inner = (
            <>
              {s.done && s.state !== 'current' ? (
                <TickCircle size={28} color="var(--success-500)" variant="Bold" className="wzs-stepper-tick" aria-label="Completed" />
              ) : (
                <span className="wzs-stepper-num">{i + 1}</span>
              )}
              <span className="wzs-stepper-label">
                {s.title}
                {s.count ? <span className="wzs-stepper-count"> ({s.count})</span> : null}
              </span>
            </>
          )
          return (
            <li key={s.id} className="wzs-stepper-item">
              {i > 0 && <span className="wzs-stepper-line" aria-hidden="true" />}
              {s.state === 'current' ? (
                <span className="wzs-stepper-step wzs-stepper-step--current" aria-current="step">
                  {inner}
                </span>
              ) : s.state === 'locked' ? (
                <Tooltip text={s.sub} position="Bottom" icon={false}>
                  <button type="button" className="wzs-stepper-step wzs-stepper-step--locked" aria-disabled="true" aria-label={`${s.title}: ${s.sub}`}>
                    {inner}
                  </button>
                </Tooltip>
              ) : (
                <button type="button" className="wzs-stepper-step" onClick={() => onStepSelect?.(s.id)}>
                  {inner}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )

  if (layout === 'top') {
    return (
      <div ref={panelRef} className="wzs-overlay wzs-overlay--top" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <CloseButton variant="fullscreen" onClick={onClose} className="wzs-close" ariaLabel={closeLabel} />
        {takeover ?? (
          <>
            <div className="wzs-shell">
              <header className="wzs-header wzs-header--top">
                <h2 className="wzs-title">{title}</h2>
                {stepper}
              </header>
              <section className="wzs-main wzs-main--top">{children}</section>
            </div>
            {action && (
              <footer className="wzs-footer">
                <div className="wzs-footer-inner">
                  <span className="wzs-footer-left">{backAction}</span>
                  {action}
                </div>
              </footer>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div ref={panelRef} className="wzs-overlay" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
      <CloseButton variant="fullscreen" onClick={onClose} className="wzs-close" ariaLabel={closeLabel} />

      {takeover ?? (
        <div className="wzs-shell">
          <header className="wzs-header">
            <h2 className="wzs-title">{title}</h2>
            {action}
          </header>

          <div className="wzs-body">
            <nav className="wzs-steps" aria-label={`${title} steps`}>
              <ol>
                {steps.map((s) => (
                  <li key={s.id}>
                    {s.state === 'reachable' || s.state === 'locked' ? (
                      <button
                        type="button"
                        className={`wzs-step${s.state === 'locked' ? ' wzs-step--locked' : ''}`}
                        disabled={s.state === 'locked'}
                        onClick={() => onStepSelect?.(s.id)}
                      >
                        {stepBody(s)}
                      </button>
                    ) : (
                      <div
                        className={`wzs-step${s.state === 'current' ? ' wzs-step--active' : ' ui-disabled'}`}
                        aria-current={s.state === 'current' ? 'step' : undefined}
                        aria-disabled={s.state === 'inert' || undefined}
                      >
                        {stepBody(s)}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <section className="wzs-main">{children}</section>
          </div>
        </div>
      )}
    </div>
  )
}

export default WizardShell
