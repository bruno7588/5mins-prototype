import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { Lock } from 'iconsax-react'
import { EmailButton, EmailCourseCard } from './LiveEmail'
import { LOCKED_LABEL } from './emailContent'

/* The locked button or course card inside the editor (1.8): shown as sent, can't
   be edited, moved or deleted. */
function LockedBlockView({ node }: ReactNodeViewProps) {
  const kind = node.attrs.kind as 'button' | 'course' | 'activate'
  const isCourse = kind === 'course'
  return (
    <NodeViewWrapper
      className="eed-locked"
      contentEditable={false}
      aria-label="Part of the email added by 5Mins"
    >
      <span className="eed-locked__badge">
        <Lock size={16} color="currentColor" variant="Linear" />
        Added by 5Mins
      </span>
      {isCourse ? <EmailCourseCard /> : <EmailButton label={LOCKED_LABEL[kind]} />}
      {isCourse && (
        <p className="eed-locked__caption">
          Example course. Each person sees the course the reminder is about.
        </p>
      )}
    </NodeViewWrapper>
  )
}

export default LockedBlockView
