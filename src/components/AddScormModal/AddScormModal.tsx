import { useRef, useState } from 'react'
import Button from '@/components/Button/Button'
import { Add, Eye, GalleryAdd } from 'iconsax-react'
import CloseButton from '../CloseButton/CloseButton'
import AddImageModal from '@/pages/add-content/components/AddImageModal/AddImageModal'
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
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [zipFileName, setZipFileName] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const zipInputRef = useRef<HTMLInputElement>(null)

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
          <Button onClick={onClose}>Awesome</Button>
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
                    <Button size="lg" variant="outlined" icon={<Eye size={20} color="currentColor" variant="Linear" />} onClick={onPreview}>
                      Preview
                    </Button>
                    <Button size="lg" onClick={onClose}>Update SCORM</Button>
                  </>
                ) : (
                  <Button size="lg" onClick={() => { onPublish?.(name); setPublished(true) }}>
                    Publish Lesson
                  </Button>
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
            {/* Same pattern as the course thumbnail (CourseDetailsTab): dashed while
                empty, the box itself becomes the preview once picked, and one outlined
                button opens the shared picker. The box stays square because a SCORM
                lesson thumbnail is 256x256, where a course's is 16:9. */}
            <div className="add-scorm-thumbnail-row">
              <div
                className={`add-scorm-thumbnail${thumbnailUrl ? ' add-scorm-thumbnail--filled' : ''}`}
                style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
              >
                {!thumbnailUrl && (
                  <GalleryAdd size={32} color="var(--text-secondary)" variant="Linear" />
                )}
              </div>
              <div className="add-scorm-thumbnail-info">
                <p className="add-scorm-thumbnail-desc">
                  Upload a 256 x 256 px image, PNG or JPEG format. This image shows up in your lesson thumbnails.
                </p>
                <Button variant="outlined-2" onClick={() => setImageModalOpen(true)}>
                  {thumbnailUrl ? 'Change Thumbnail' : 'Add Thumbnail'}
                </Button>
              </div>
            </div>
          </div>

          {/* ZIP file upload (add mode only) */}
          {!isEdit && (
            <div className="add-scorm-field">
              <label className="add-scorm-label">Select a ZIP file to upload</label>
              <div className="add-scorm-file-row">
                <Button size="sm" icon={<Add size={16} color="currentColor" />} onClick={() => zipInputRef.current?.click()}>
                  Select File
                </Button>
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
      {/* The same picker the course and program builders use: upload, generate with AI,
         or pick from stock. */}
      <AddImageModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={(url) => {
          setThumbnailUrl(url)
          setImageModalOpen(false)
        }}
        showSuggest={false}
      />
    </div>
  )
}

export default AddScormModal
