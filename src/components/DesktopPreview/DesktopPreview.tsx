import type { ReactNode } from 'react'
import './DesktopPreview.css'

/**
 * The assessment at the size it gets on the desktop course feed.
 *
 * 544x812 is the panel beside the lesson (`.lf-panel`, LessonFeed.css), so what
 * the admin approves here is the width the learner actually meets. The renderers
 * inside are the learner's own, unchanged.
 */
function DesktopPreview({ children }: { children: ReactNode }) {
  return (
    <div className="desktop-preview">
      <div className="desktop-preview__frame">{children}</div>
    </div>
  )
}

export default DesktopPreview
