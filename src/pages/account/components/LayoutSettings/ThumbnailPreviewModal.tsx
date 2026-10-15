import Button from '@/components/Button/Button'
import CompanyAvatar from '@/components/CompanyAvatar/CompanyAvatar'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import LessonGridCard from '@/components/LessonGridCard/LessonGridCard'
import MobileLessonCard from '@/components/mobile/LessonCard/LessonCard'
import { COMPANY } from '@/data/people'

const SAMPLE_TITLE = 'Title of My Lesson'

/** Shows the company image where learners see it: the company avatar, the lesson grid card and the mobile lesson list card. */
function ThumbnailPreviewModal({ src, open, onClose }: { src: string; open: boolean; onClose: () => void }) {
  return (
    <ConfirmModal open={open} onClose={onClose} ariaLabel="Preview image" closable>
      <div className="confirm-modal-header">
        <h2 className="confirm-modal-title">Preview image</h2>
        <p className="confirm-modal-body">
          This is how your image will appear to users. If you're not satisfied with the sizing or
          resolution, re-upload at 2x size.
        </p>
      </div>
      <div className="acl-preview__divider" aria-hidden="true" />
      <div className="acl-preview__examples">
        <LessonGridCard title={SAMPLE_TITLE} instructor={COMPANY} thumbnail={src} durationLabel="4m 0s" filled={2} />
        <div className="acl-preview__column">
          {/* The creator row on a company-made lesson (LessonFeed). */}
          <div className="acl-preview__creator">
            <CompanyAvatar size={40} />
            <div className="acl-preview__creator-info">
              <span className="acl-preview__creator-name">{COMPANY}</span>
              <span className="acl-preview__creator-role">Company</span>
            </div>
          </div>
          <MobileLessonCard title={SAMPLE_TITLE} instructor={COMPANY} durationLabel="4 min" image={src} progress={25} />
        </div>
      </div>
      <div className="confirm-modal-actions">
        <Button onClick={onClose}>Got It</Button>
      </div>
    </ConfirmModal>
  )
}

export default ThumbnailPreviewModal
