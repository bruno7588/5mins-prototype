import { useCallback, useRef, useState, type ReactNode } from 'react'
import { DocumentUpload, DocumentText } from 'iconsax-react'
import './FileUploader.css'

type FileUploaderSize = 'L' | 'S'
type FileUploaderState = 'Enabled' | 'Hover' | 'Error' | 'Uploading' | 'Filled'

interface FileUploaderProps {
  size?: FileUploaderSize
  state?: FileUploaderState
  fileName?: string
  progress?: number
  /** One message, or several: up to three show as a list, the rest as "+N errors". */
  errorMessage?: string | string[]
  onFileSelect?: (file: File) => void
  onChangeFile?: () => void
  accept?: string
  /** Enabled/Hover: replaces the upload icon, e.g. a video or audio glyph for a media upload. */
  icon?: ReactNode
  /** Filled state: replaces the default document icon, e.g. a file-type thumbnail. */
  fileIcon?: ReactNode
  className?: string
}

export function FileUploader({
  size = 'L',
  state: controlledState,
  fileName = 'nameofthedocument.csv',
  progress = 0,
  errorMessage = 'Error message here!',
  onFileSelect,
  onChangeFile,
  accept,
  icon,
  fileIcon,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [internalState, setInternalState] = useState<FileUploaderState>('Enabled')
  const [isDragging, setIsDragging] = useState(false)
  const state = controlledState ?? internalState
  const isL = size === 'L'
  const isHover = state === 'Hover' || isDragging

  const openPicker = () => {
    if (state === 'Filled') onChangeFile?.()
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onFileSelect?.(file)
    if (!controlledState) setInternalState('Filled')
    e.target.value = ''
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    onFileSelect?.(file)
    if (!controlledState) setInternalState('Filled')
  }, [onFileSelect, controlledState])

  const r = 26
  const circ = 2 * Math.PI * r
  const iconSize = isL ? 40 : 32

  const errors = Array.isArray(errorMessage) ? errorMessage : [errorMessage]

  /* One label in every state, as in the Library. stopPropagation: the zone behind it
     opens the picker too, and both firing opened it twice. */
  const selectButton = (
    <button
      type="button"
      className={`file-uploader__btn-outlined${isHover ? ' file-uploader__btn-outlined--hover' : ''}`}
      onClick={e => { e.stopPropagation(); openPicker() }}
    >
      Select File
    </button>
  )

  const sizeClass = isL ? 'file-uploader--L' : 'file-uploader--S'
  const stateClass = `file-uploader--${state.toLowerCase()}`
  const dragClass = isDragging ? 'file-uploader--dragging' : ''

  return (
    <div
      className={`file-uploader ${sizeClass} ${stateClass} ${dragClass} ${className ?? ''}`.trim()}
      role="button"
      tabIndex={0}
      aria-label="File upload drop zone"
      onKeyDown={e => e.key === 'Enter' && state !== 'Uploading' && state !== 'Filled' && openPicker()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={state !== 'Uploading' && state !== 'Filled' ? openPicker : undefined}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-label="Upload file"
        onChange={handleFileChange}
        className="file-uploader__input"
      />

      {/* ENABLED / HOVER */}
      {(state === 'Enabled' || state === 'Hover') && (
        <>
          <div className="file-uploader__icon-group">
            {icon ?? <DocumentUpload size={iconSize} color="var(--text-secondary)" variant="Linear" />}
            <p className="file-uploader__body">
              Drag and drop file here or click to upload
            </p>
          </div>
          {selectButton}
        </>
      )}

      {/* ERROR */}
      {state === 'Error' && (
        <>
          <DocumentUpload size={iconSize} color="var(--text-error)" variant="Linear" />
          <div className="file-uploader__errors" role="alert">
            <ul className="file-uploader__error-list">
              {errors.slice(0, 3).map((message, i) => <li key={i}>{message}</li>)}
            </ul>
            {errors.length > 3 && (
              <p className="file-uploader__error-more">+{errors.length - 3} errors</p>
            )}
          </div>
          {selectButton}
        </>
      )}

      {/* UPLOADING */}
      {state === 'Uploading' && (
        <>
          <div className="file-uploader__icon-group">
            <div className="file-uploader__progress-ring">
              <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r={r} fill="none"
                  stroke="var(--primary-600)"
                  strokeWidth="4"
                  strokeDasharray={circ}
                  strokeDashoffset={circ - (progress / 100) * circ}
                  strokeLinecap="round"
                />
              </svg>
              <span className="file-uploader__progress-text">{progress}%</span>
            </div>
            <p className="file-uploader__body">Uploading file...</p>
          </div>
          {selectButton}
        </>
      )}

      {/* FILLED */}
      {state === 'Filled' && (
        <>
          <div className={`file-uploader__icon-group${fileIcon ? ' file-uploader__icon-group--thumb' : ''}`}>
            {fileIcon ?? <DocumentText size={iconSize} color="var(--text-secondary)" variant="Bold" />}
            <p className="file-uploader__body file-uploader__body--filename">{fileName}</p>
          </div>
          {selectButton}
        </>
      )}
    </div>
  )
}

export default FileUploader
