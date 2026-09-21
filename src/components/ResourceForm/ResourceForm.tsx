import { useState } from 'react'
import Button from '@/components/Button/Button'
import Dropdown from '@/components/Dropdown/Dropdown'
import InputField from '@/components/InputField/InputField'
import { FileUploader } from '@/components/FileUploader/FileUploader'
import { FILE_THUMBS } from '@/components/ResourceCard/ResourceCard'
import {
  MAX_FILE_BYTES,
  RESOURCE_TYPES,
  isValidUrl,
  matchesType,
  type CourseResource,
  type ResourceType,
} from '@/components/ResourceCard/resources'
import './ResourceForm.css'

interface Props {
  /** Prefilled when an existing resource is being edited. */
  initial?: CourseResource | null
  /** 'drawer' on the course builder, 'inline' inside the lesson editor. */
  variant?: 'drawer' | 'inline'
  onSave: (resource: Omit<CourseResource, 'id'>) => void
  /** Renders a Cancel button beside Save. */
  onCancel?: () => void
}

const TYPE_OPTIONS = (Object.keys(RESOURCE_TYPES) as ResourceType[]).map((value) => ({
  value,
  label: RESOURCE_TYPES[value].label,
}))

const withoutExtension = (fileName: string) => fileName.replace(/\.[^.]+$/, '')

/** "a PDF", "an Excel", "an Image" — the type labels are fixed, so the first letter decides. */
const article = (label: string) => (/^[AEIOU]/i.test(label) ? 'an' : 'a')

/** ".pdf" · ".doc or .docx" · ".jpg or .png" */
const extList = (accept?: string) => {
  const parts = accept?.split(',') ?? []
  if (parts.length < 2) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} or ${parts[parts.length - 1]}`
}

/* One resource per save: a file of the chosen type, or an external link. Seeds from
   `initial` at mount only, so the host keys it per resource. Used by the course
   builder's Resources drawer and by the lesson editor's Resources tab. */
function ResourceForm({ initial, variant = 'drawer', onSave, onCancel }: Props) {
  const [type, setType] = useState<ResourceType>(initial?.type ?? 'pdf')
  const [name, setName] = useState(initial?.name ?? '')
  /* Editing keeps the saved file until another is picked. A resource only carries its
     File for the session, so an edited one may have just its name and size. */
  const [kept, setKept] = useState(initial?.type !== 'link' ? initial ?? null : null)
  const [file, setFile] = useState<File | null>(initial?.file ?? null)
  const [fileError, setFileError] = useState('')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [urlTouched, setUrlTouched] = useState(false)

  const isLink = type === 'link'
  const urlError = isLink && urlTouched && url.trim() !== '' && !isValidUrl(url)
  const hasFile = !!file || !!kept?.fileName
  const canSave = name.trim() !== '' && (isLink ? isValidUrl(url) : hasFile)

  const changeType = (next: ResourceType) => {
    setType(next)
    setFileError('')
    // A file that no longer matches the type would save under the wrong label.
    if (file && !matchesType(file.name, next)) setFile(null)
    if (kept?.fileName && !matchesType(kept.fileName, next)) setKept(null)
  }

  const pickFile = (picked: File) => {
    if (!matchesType(picked.name, type)) {
      setFile(null)
      const { label, accept } = RESOURCE_TYPES[type]
      setFileError(`This isn't ${article(label)} ${label} file. Choose a ${extList(accept)} file.`)
      return
    }
    if (picked.size > MAX_FILE_BYTES) {
      setFile(null)
      setFileError('This file is over 50 MB. Choose a smaller file.')
      return
    }
    setFileError('')
    setKept(null)
    setFile(picked)
    // Name it after the file unless the admin already typed one.
    if (!name.trim()) setName(withoutExtension(picked.name))
  }

  const handleSave = () => {
    if (!canSave) return
    onSave(
      isLink
        ? { type, name: name.trim(), url: url.trim() }
        : file
          ? { type, name: name.trim(), fileName: file.name, size: file.size, file }
          : { type, name: name.trim(), fileName: kept?.fileName, size: kept?.size, file: kept?.file },
    )
  }

  return (
    <div className={`resource-form resource-form--${variant}`}>
      <div className="resource-form__body">
        <Dropdown
          className="resource-form__type"
          label="Type"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(value) => changeType(value as ResourceType)}
        />

        <InputField
          label="Name"
          placeholder="Add a name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 100))}
        />

        {isLink ? (
          <InputField
            label="Link"
            type="url"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setUrlTouched(true)}
            validation={urlError ? 'error' : 'none'}
            helperText={urlError ? 'Enter a full link, starting with https://' : undefined}
          />
        ) : (
          <div className="resource-form__field">
            {/* Formats and size cap are the same kind of fact — what this field
                takes — so they read as one line above the zone. */}
            <span className="resource-form__label">
              Select a file to upload{' '}
              <span className="resource-form__label-hint">
                ({extList(RESOURCE_TYPES[type].acceptLabel ?? RESOURCE_TYPES[type].accept)} • max. 50MB)
              </span>
            </span>
            <FileUploader
              key={type}
              size="L"
              accept={RESOURCE_TYPES[type].accept}
              state={fileError ? 'Error' : hasFile ? 'Filled' : 'Enabled'}
              fileName={file?.name ?? kept?.fileName}
              errorMessage={fileError}
              fileIcon={<img src={FILE_THUMBS[type as Exclude<ResourceType, 'link'>]} width={40} height={40} alt="" />}
              onFileSelect={pickFile}
              onChangeFile={() => {
                setFile(null)
                setKept(null)
              }}
            />
          </div>
        )}
      </div>

      <div className="resource-form__footer">
        <Button onClick={handleSave} disabled={!canSave}>
          {initial ? 'Save Changes' : 'Save Resource'}
        </Button>
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

export default ResourceForm
