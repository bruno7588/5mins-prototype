import { useRef, useState } from 'react'
import { Trash } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'
import Dropdown from '@/components/Dropdown/Dropdown'
import Tooltip from '@/components/Tooltip/Tooltip'
import FileUploader from '@/components/FileUploader/FileUploader'
import type { ToastType } from '@/components/Toast/Toast'
import { removeFlower, uploadFlower } from '../flowers'
import { FALLBACK_PALETTE, type Flower, type LabState } from '../types'

/* Image: pick an uploaded flower (rainbow order) or none, upload more,
   and remove the picked one. Rotation lives with the framing. Prefix: gl-tex- */

const NONE = '__none__'

interface Props {
  lab: LabState
  update: (patch: Partial<LabState>) => void
  flowers: Flower[]
  loadError: string | null
  reload: () => void
  show: (type: ToastType, message: string) => void
}

function TexturePanel({ lab, update, flowers, loadError, reload, show }: Props) {
  const [uploading, setUploading] = useState(0)
  /* Files in flight; errors reset only when a new batch starts, so one success can't hide another file's error. */
  const inFlight = useRef(0)
  const [errors, setErrors] = useState<string[]>([])
  const [removing, setRemoving] = useState(false)

  const selected = flowers.find((f) => f.id === lab.flowerId)
  const options = [
    { value: NONE, label: 'No image' },
    ...flowers.map((f) => ({ value: f.id, label: f.name })),
  ]

  const pick = (value: string) => {
    if (value === NONE) update({ flowerId: null, palette: FALLBACK_PALETTE })
    else update({ flowerId: value })
  }

  const handleFile = async (file: File) => {
    if (inFlight.current === 0) setErrors([])
    inFlight.current += 1
    setUploading((n) => n + 1)
    try {
      const flower = await uploadFlower(file)
      reload()
      // The newest upload becomes the texture, so it shows straight away.
      update({ flowerId: flower.id })
    } catch (e) {
      setErrors((list) => [...list, e instanceof Error ? e.message : `${file.name} could not be uploaded.`])
    } finally {
      inFlight.current -= 1
      setUploading((n) => n - 1)
    }
  }

  const handleRemove = async () => {
    if (!selected) return
    setRemoving(true)
    try {
      await removeFlower(selected.id)
      update({ flowerId: null, palette: FALLBACK_PALETTE })
      reload()
      show('success', 'Texture removed')
    } catch (e) {
      show('error', e instanceof Error ? e.message : "Couldn't remove the image")
    } finally {
      setRemoving(false)
    }
  }

  return (
    <section className="gl-section" aria-labelledby="gl-tex-title">
      <h2 id="gl-tex-title" className="gl-section__title">Image</h2>
      {loadError && <Alert type="Alert" icon message={`Couldn't load your flowers: ${loadError}`} />}
      <div className="gl-tex__picker">
        <Dropdown
          className="gl-tex__dropdown"
          menuClassName="gl-tex__menu"
          options={options}
          value={lab.flowerId ?? NONE}
          onChange={pick}
          searchable={flowers.length > 8}
          searchPlaceholder="Search flowers"
        />
        {selected && (
          <Tooltip icon={false} text="Remove image">
            <button
              type="button"
              className="gl-tex__remove"
              aria-label="Remove image"
              aria-busy={removing}
              disabled={removing}
              onClick={handleRemove}
            >
              <Trash size={20} variant="Linear" color="var(--text-primary)" />
            </button>
          </Tooltip>
        )}
      </div>
      <FileUploader
        size="S"
        className="gl-tex__uploader"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        helpText="Drop flower photos here (JPEG, PNG or WebP, at least 512 px)"
        state={uploading > 0 ? 'Uploading' : errors.length ? 'Error' : 'Enabled'}
        progress={uploading > 0 ? 50 : 0}
        errorMessage={errors}
        onFileSelect={handleFile}
      />
    </section>
  )
}

export default TexturePanel
