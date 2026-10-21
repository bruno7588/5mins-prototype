import type { ReactNode } from 'react'
import './DesktopPreview.css'

/**
 * The assessment at the size it gets on the desktop course feed.
 *
 * Admin quiz previews are 600 wide by 812. The renderers inside are the learner's
 * own, unchanged.
 */
function DesktopPreview({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`desktop-preview${className ? ` ${className}` : ''}`}>
      <div className="desktop-preview__frame">{children}</div>
    </div>
  )
}

export default DesktopPreview
