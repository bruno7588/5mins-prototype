import type { ReactNode } from 'react'
import { ArrowLeft } from 'iconsax-react'
import './PhoneFrame.css'

export interface PhoneFrameProps {
  /** Sticky top chrome — usually MobileTopNav */
  header?: ReactNode
  /** Sticky bottom chrome — usually MobileTabNav */
  footer?: ReactNode
  children?: ReactNode
  /** Float the header over the content (Lesson-feed style transparent header) */
  overlayHeader?: boolean
  /**
   * Prototype-scaffolding control: renders a "Back to desktop" pill on the stage,
   * outside the phone bezel, so it never appears to be part of the mobile app.
   */
  onExit?: () => void
}

/**
 * Desktop-viewed phone frame for the mobile app prototype: a 375x812 screen in a
 * dark bezel, centered on the page. Mobile-only features render inside it.
 *
 * The mobile app ships dark-mode only, so the bezel pins `data-theme="dark"`
 * over everything on the screen whichever mode the desktop around it is in.
 * The stage outside the bezel is desktop chrome and follows the desktop theme.
 */
function PhoneFrame({ header, footer, children, overlayHeader = false, onExit }: PhoneFrameProps) {
  return (
    <div className="m-phone-stage">
      {onExit ? (
        <button type="button" className="m-phone-stage__exit" onClick={onExit}>
          <ArrowLeft size={20} color="currentColor" variant="Linear" />
          <span>Back to Desktop</span>
        </button>
      ) : null}
      <div className="m-phone" data-theme="dark">
        <div className="m-phone__screen">
          {header ? (
            <div className={`m-phone__header${overlayHeader ? ' m-phone__header--overlay' : ''}`}>{header}</div>
          ) : null}
          <div className="m-phone__content">{children}</div>
          {footer ? <div className="m-phone__footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

export default PhoneFrame
