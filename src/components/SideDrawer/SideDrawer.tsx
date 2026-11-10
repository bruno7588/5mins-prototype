import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import CloseButton from '@/components/CloseButton/CloseButton'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import './SideDrawer.css'

/** Must match the slide and fade durations in SideDrawer.css. */
const EXIT_MS = 300

interface SideDrawerProps {
  /** Controls visibility. Set it to false to close: the drawer plays its exit
      slide, then unmounts. Keep the drawer mounted so the exit can play. */
  open: boolean
  /** The X and a press on the backdrop call this. Escape does not (overlays.md).
      Set `open` to false here, or open a discard confirmation first. */
  onClose: () => void
  /** Drawer title (H3). Also names the dialog. */
  title?: ReactNode
  /** Supporting line under the title. */
  subtitle?: ReactNode
  /** Replaces the title block when the headline is not plain text, e.g. a person
      with an avatar. The close button and divider are still drawn. Pass
      `ariaLabel` to name the dialog. */
  header?: ReactNode
  /** Content between the divider and the scrolling body that should not scroll,
      e.g. a stepper or a search and filter row. */
  subheader?: ReactNode
  /** Pinned footer row (buttons). A divider is drawn above it. Omit for no footer. */
  footer?: ReactNode
  /** Names the dialog when there is no plain `title`. */
  ariaLabel?: string
  /** Start below the course builder's page header (`--page-header-offset`) so
      its title and CTAs stay visible. */
  belowPageHeader?: boolean
  /** Mount without the slide and fade, when one drawer hands off to another in place. */
  instant?: boolean
  /** Extra class on the panel, for page-level layout of the body. */
  className?: string
  /** Extra class on the scrolling body. */
  bodyClassName?: string
  children?: ReactNode
}

/* Side Drawer - overlays.md (Figma 10871:12768). 720px, right-anchored, full
   height, --page-background, no radius or shadow. Header (title + close, then a
   divider), a scrolling body, and an optional pinned footer. Closes on the X and
   the backdrop, never on Escape; focus is trapped and restored. */
function SideDrawer({
  open,
  onClose,
  title,
  subtitle,
  header,
  subheader,
  footer,
  ariaLabel,
  belowPageHeader = false,
  instant = false,
  className,
  bodyClassName,
  children,
}: SideDrawerProps) {
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
      return
    }
    if (!rendered) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setRendered(false)
      return
    }
    setClosing(true)
    const t = window.setTimeout(() => {
      setRendered(false)
      setClosing(false)
    }, EXIT_MS)
    return () => window.clearTimeout(t)
  }, [open, rendered])

  useOverlayA11y(panelRef, rendered && !closing)

  if (!rendered) return null

  const mods = [
    belowPageHeader && 'ds-drawer--below-header',
    closing && 'ds-drawer--closing',
    instant && !closing && 'ds-drawer--instant',
  ]
    .filter(Boolean)
    .join(' ')

  const labelledBy = title && !header ? titleId : undefined

  return (
    <div
      className={`ds-drawer-backdrop ${mods}`.trim()}
      /* Only a press on the backdrop itself closes. Stopping propagation on the
         panel instead would also stop the document listeners that close a
         portalled menu when you click outside it. */
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <aside
        ref={panelRef}
        className={['ds-drawer', className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        tabIndex={-1}
      >
        <header className="ds-drawer__header">
          <div className="ds-drawer__headline">
            {header ?? (
              <div className="ds-drawer__titles">
                {title && <h2 id={titleId} className="ds-drawer__title">{title}</h2>}
                {subtitle && <p className="ds-drawer__subtitle">{subtitle}</p>}
              </div>
            )}
            <CloseButton onClick={onClose} className="ds-drawer__close" />
          </div>
          <div className="ds-drawer__divider" />
        </header>

        {subheader && <div className="ds-drawer__subheader">{subheader}</div>}

        <div className={['ds-drawer__body', bodyClassName].filter(Boolean).join(' ')}>{children}</div>

        {footer && (
          <footer className="ds-drawer__footer">
            <div className="ds-drawer__divider" />
            <div className="ds-drawer__actions">{footer}</div>
          </footer>
        )}
      </aside>
    </div>
  )
}

export default SideDrawer
