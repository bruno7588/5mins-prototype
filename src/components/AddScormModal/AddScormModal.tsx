import { useRef, useState } from 'react'
import { Add, Eye, GalleryAdd } from 'iconsax-react'
import CloseButton from '../CloseButton/CloseButton'
import './AddScormModal.css'

interface EditRow {
  id: number
  fileName: string
}

interface AddScormModalProps {
  onClose: () => void
  editRow?: EditRow
  onPreview?: () => void
  onPublish?: (name: string) => void
}

function AddScormModal({ onClose, editRow, onPreview, onPublish }: AddScormModalProps) {
  const isEdit = !!editRow
  const [name, setName] = useState(editRow?.fileName ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [zipFileName, setZipFileName] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailUrl(URL.createObjectURL(file))
    }
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setZipFileName(file.name)
    }
  }

  return (
    <div className="add-scorm-overlay">
      <CloseButton onClick={onClose} size={32} className="add-scorm-close" />

      {published ? (
        <div className="add-scorm-success">
          <h3 className="add-scorm-success-title">
            Your SCORM file has been published.<br />
            It'll just take a few minutes to be processed.
          </h3>
          <p className="add-scorm-success-desc">
            You can leave this page whenever you want!
          </p>
          <button className="add-scorm-success-btn" onClick={onClose}>
            Awesome
          </button>
        </div>
      ) : (
        <div className="add-scorm-content">
          {/* Header */}
          <div className="add-scorm-header">
            <div className="add-scorm-header-row">
              <h2 className="add-scorm-title">{isEdit ? 'Edit SCORM file' : 'Add a new SCORM file'}</h2>
              <div className="add-scorm-header-actions">
                {isEdit ? (
                  <>
                    <button className="add-scorm-preview-btn" onClick={onPreview}>
                      <Eye size={18} color="currentColor" variant="Linear" />
                      Preview
                    </button>
                    <button className="add-scorm-publish-btn" onClick={onClose}>
                      Update SCORM
                    </button>
                  </>
                ) : (
                  <button className="add-scorm-publish-btn" onClick={() => { onPublish?.(name); setPublished(true) }}>
                    Publish Lesson
                  </button>
                )}
              </div>
            </div>
            <div className="add-scorm-divider" />
          </div>

          {/* Name field */}
          <div className="add-scorm-field">
            <label className="add-scorm-label">Name of the lesson</label>
            <input
              className="add-scorm-input"
              type="text"
              placeholder="Add a name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Thumbnail */}
          <div className="add-scorm-field">
            <label className="add-scorm-label">Lesson thumbnail</label>
            <div className="add-scorm-thumbnail-row">
              <div className="add-scorm-thumbnail">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Thumbnail" className="add-scorm-thumbnail-img" />
                ) : (
                  <div className="add-scorm-thumbnail-placeholder" />
                )}
                <button
                  className="add-scorm-thumbnail-edit"
                  onClick={() => thumbnailInputRef.current?.click()}
                  aria-label="Change image"
                >
                  <GalleryAdd size={13} color="white" variant="Linear" />
                </button>
              </div>
              <div className="add-scorm-thumbnail-info">
                <p className="add-scorm-thumbnail-desc">
                  Upload a 256 x 256 px image, PNG or JPEG format. This image shows up in your lesson thumbnails.
                </p>
                <button
                  className="add-scorm-change-img-btn"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  Change Image
                </button>
              </div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleThumbnailChange}
                hidden
              />
            </div>
          </div>

          {/* ZIP file upload (add mode only) */}
          {!isEdit && (
            <div className="add-scorm-field">
              <label className="add-scorm-label">Select a ZIP file to upload</label>
              <div className="add-scorm-file-row">
                <button
                  className="add-scorm-select-file-btn"
                  onClick={() => zipInputRef.current?.click()}
                >
                  <Add size={16} color="currentColor" />
                  Select File
                </button>
                <span className="add-scorm-file-name">
                  {zipFileName || 'No file selected'}
                </span>
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleZipChange}
                  hidden
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddScormModal
