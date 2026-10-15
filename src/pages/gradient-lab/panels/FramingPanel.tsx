import Dropdown from '@/components/Dropdown/Dropdown'
import { outputSize, type AspectRatio, type LabState, type RenderSize, type TextureRotation } from '../types'

/* Framing, grouped: texture rotation, then aspect ratio and render size side
   by side. Prefix: gl-section */

const ROTATE_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '90', label: '90°' },
  { value: '180', label: '180°' },
  { value: '270', label: '270°' },
]

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
      <Dropdown
        label="Rotate"
        options={ROTATE_OPTIONS}
        value={String(framing.rotate)}
        onChange={(v) => update({ framing: { ...framing, rotate: Number(v) as TextureRotation } })}
      />
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

export default FramingPanel
