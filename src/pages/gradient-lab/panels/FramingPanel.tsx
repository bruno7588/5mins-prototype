import { RotateRight } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Dropdown from '@/components/Dropdown/Dropdown'
import Tooltip from '@/components/Tooltip/Tooltip'
import { outputSize, type AspectRatio, type LabState, type RenderSize, type TextureRotation } from '../types'

/* Output framing: aspect ratio and render size side by side (Image tab), plus
   the Rotate field used under the focal point. Prefix: gl-section */

const ASPECT_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: '1 : 1' },
  { value: '16:9', label: '16 : 9' },
  { value: '9:16', label: '9 : 16' },
  { value: '4:3', label: '4 : 3' },
  { value: '3:4', label: '3 : 4' },
]
const SIZES: RenderSize[] = [512, 1024, 2048]

interface Props {
  lab: LabState
  update: (patch: Partial<LabState>) => void
}

function FramingPanel({ lab, update }: Props) {
  const { framing } = lab
  /* Each size reads as the full output for the current aspect, e.g. "512 × 288 px" at 16 : 9. */
  const sizeOptions = SIZES.map((s) => {
    const out = outputSize({ ...framing, renderSize: s })
    return { value: String(s), label: `${out.width} × ${out.height} px` }
  })
  return (
    <section className="gl-section" aria-label="Framing">
      <div className="gl-section__row">
      <Dropdown
        label="Aspect ratio"
        options={ASPECT_OPTIONS}
        value={framing.aspect}
        onChange={(v) => update({ framing: { ...framing, aspect: v as AspectRatio } })}
      />
      <Dropdown
        label="Render size"
        options={sizeOptions}
        value={String(framing.renderSize)}
        onChange={(v) => update({ framing: { ...framing, renderSize: Number(v) as RenderSize } })}
      />
      </div>
    </section>
  )
}

/** Rotate: one icon button that turns the image a further 90° each click, beside Randomise Framing. */
export function RotateField({ lab, update }: Props) {
  const next = ((lab.framing.rotate + 90) % 360) as TextureRotation
  return (
    <Tooltip icon={false} text="Rotate 90°">
      <Button
        variant="outlined-2"
        size="sm"
        icon={<RotateRight size={16} variant="Linear" color="currentColor" />}
        aria-label="Rotate 90°"
        onClick={() => update({ framing: { ...lab.framing, rotate: next } })}
      />
    </Tooltip>
  )
}

export default FramingPanel
