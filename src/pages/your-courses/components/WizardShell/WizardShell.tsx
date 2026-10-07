import { useRef, type ComponentType, type ReactNode } from 'react'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import CloseButton from '@/components/CloseButton/CloseButton'
import Tooltip from '@/components/Tooltip/Tooltip'
import stepCurrent from '@/assets/progress-illustrations/step-current.svg'
import './WizardShell.css'

/* Library "Illustrations/ Progress" green circle (Your Courses 7657:16571), inline so the
   tick can take var(--page-background) and follow the theme like the current step's number. */
function StepDone() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="wzs-stepper-tick" role="img" aria-label="Completed">
      <path d="M11.9861 23.2417C18.1993 23.2417 23.2361 18.2049 23.2361 11.9917C23.2361 5.77849 18.1993 0.741691 11.9861 0.741691C5.77293 0.741691 0.736133 5.77849 0.736133 11.9917C0.736133 18.2049 5.77293 23.2417 11.9861 23.2417Z" fill="#11763D" />
      <path d="M11.2549 22.3417C17.0642 22.3417 21.7736 17.6323 21.7736 11.823C21.7736 6.01361 17.0642 1.3042 11.2549 1.3042C5.44554 1.3042 0.736133 6.01361 0.736133 11.823C0.736133 17.6323 5.44554 22.3417 11.2549 22.3417Z" fill="#18A957" />
      <path d="M4.49321 5.5698C5.33696 4.23855 7.13696 3.1323 9.01196 2.7948C9.48071 2.7198 9.94946 2.6823 10.3432 2.8323C10.6432 2.9448 10.887 3.22605 10.7182 3.5448C10.587 3.8073 10.2307 3.9198 9.94946 4.01355C8.19071 4.5948 6.67384 5.74042 5.63696 7.27605C5.26196 7.83855 4.69946 9.3948 4.00571 9.00105C3.27446 8.5698 3.42446 7.2198 4.49321 5.5698Z" fill="#A3DDBC" />
      <path d="M7.75 12.0019L10.58 14.8319L16.25 9.17188" stroke="var(--page-background)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
              {/* Library "Illustrations/ Progress" badges (Your Courses 7657:17461 current,
                  7657:16571 done); reachable and locked steps keep the outlined number. */}
              {s.done && s.state !== 'current' ? (
                <StepDone />
              ) : s.state === 'current' ? (
                <span className="wzs-stepper-num wzs-stepper-num--current">
                  <img src={stepCurrent} width={24} height={24} alt="" />
                  <span>{i + 1}</span>
                </span>
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
        {/* Icon-only, so it shows its aria-label as a DS Tooltip. */}
        <Tooltip text={closeLabel} position="Left" icon={false} className="wzs-close">
          <CloseButton variant="fullscreen" onClick={onClose} ariaLabel={closeLabel} />
        </Tooltip>
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
      {/* Icon-only, so it shows its aria-label as a DS Tooltip. */}
      <Tooltip text={closeLabel} position="Left" icon={false} className="wzs-close">
        <CloseButton variant="fullscreen" onClick={onClose} ariaLabel={closeLabel} />
      </Tooltip>

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
