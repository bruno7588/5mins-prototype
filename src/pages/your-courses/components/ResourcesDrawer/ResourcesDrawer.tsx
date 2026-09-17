import { useState } from 'react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Dropdown from '@/components/Dropdown/Dropdown'
import InputField from '@/components/InputField/InputField'
import { FileUploader } from '@/components/FileUploader/FileUploader'
import SectionHeader from '../SectionHeader/SectionHeader'
import {
  MAX_FILE_BYTES,
  RESOURCE_TYPES,
  isValidUrl,
  matchesType,
  type CourseResource,
  type ResourceType,
} from './resources'
import './ResourcesDrawer.css'

interface Props {
  /** Prefilled when a resource card's Edit reopened it. */
  initial?: CourseResource | null
  onClose: () => void
  onSave: (resource: Omit<CourseResource, 'id'>) => void
}

const TYPE_OPTIONS = (Object.keys(RESOURCE_TYPES) as ResourceType[]).map((value) => ({
  value,
  label: RESOURCE_TYPES[value].label,
}))

const withoutExtension = (fileName: string) => fileName.replace(/\.[^.]+$/, '')

/* Resources form (course builder rail → Resources, or Edit on a resource card). One
   resource per save: a file of the chosen type, or an external link. Seeds from
   `initial` at mount only, so the host keys it per resource. */
export function ResourcesDrawerContent({ initial, onClose, onSave }: Props) {
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
      setFileError(`This isn't a ${RESOURCE_TYPES[type].label} file. Choose a ${RESOURCE_TYPES[type].accept?.split(',').join(' or ')} file.`)
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
    <>
      <SectionHeader
        title={initial ? 'Edit resource' : 'Add resource'}
        description="Files and links learners can open from this course."
        ctas={<CloseButton onClick={onClose} />}
      />

      <div className="resources-drawer__body">
        <Dropdown
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
          <div className="resources-drawer__field">
            <span className="resources-drawer__label">
              File <span className="resources-drawer__label-hint">Up to 50 MB</span>
            </span>
            <FileUploader
              key={type}
              size="L"
              accept={RESOURCE_TYPES[type].accept}
              state={fileError ? 'Error' : hasFile ? 'Filled' : 'Enabled'}
              fileName={file?.name ?? kept?.fileName}
              errorMessage={fileError}
              onFileSelect={pickFile}
              onChangeFile={() => {
                setFile(null)
                setKept(null)
              }}
            />
          </div>
        )}
      </div>

      <div className="resources-drawer__footer">
        <Button onClick={handleSave} disabled={!canSave}>
          {initial ? 'Save Changes' : 'Save Resource'}
        </Button>
      </div>
    </>
  )
}
