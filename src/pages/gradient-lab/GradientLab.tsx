import { useCallback, useRef, useState } from 'react'
import { Shuffle } from 'iconsax-react'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import Button from '@/components/Button/Button'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import EmptyState from '@/components/EmptyState/EmptyState'
import emptyIllustration from '@/assets/empty-state-illustrations/empty-box.svg'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import LabCanvas, { type LabCanvasHandle } from './LabCanvas'
import { useFlowers } from './flowers'
import ExportPanel from './panels/ExportPanel'
import GradientSlots from './panels/GradientSlots'
import { APP_IMAGE_SIZE, clearGradient, saveGradient, useSavedGradients } from './gradients'
import { parsePreset, toPreset } from './preset'
import FocalPad from './panels/FocalPad'
import FramingPanel from './panels/FramingPanel'
import TexturePanel from './panels/TexturePanel'
import { useLabDials, type DialsKind } from './panels/useLabDials'
import { extractKey, paletteKeys, usePaletteExtraction } from './panels/usePaletteExtraction'
import { ASPECT_VALUES, DEFAULT_LAB_STATE, type LabState } from './types'
import './gradient-lab.css'
import './panels/panels.css'

/**
 * Gradient Lab (Playground, dev only): makes default company images and live
 * shaders on one screen. Left: the live preview (wheel zooms, drag pans).
 * Right: one controls column with an Image / Gradient / Shader switcher
 * (Export sits in the header): Image picks, uploads and removes the photo;
 * Gradient holds framing, focal point and the gradient DialKit panel; Shader
 * holds the motion panel. Prefix: gl-
 */

/** Controls column tabs, in working order: pick the image, shape the gradient, animate it. */
type ControlsTab = 'image' | DialsKind
const TABS: { key: ControlsTab; label: string }[] = [
  { key: 'image', label: 'Image' },
  { key: 'gradient', label: 'Gradient' },
  { key: 'shader', label: 'Shader' },
]

interface DialsProps {
  kind: DialsKind
  lab: LabState
  update: (patch: Partial<LabState>) => void
  reextract: () => void
  scrub: number
  onScrub: (scrub: number) => void
}

/** The open tab's DialKit panel, inline. Mounted per tab, so only its panel shows. */
function TabDials({ kind, lab, update, reextract, scrub, onScrub }: DialsProps) {
  useLabDials(kind, lab, update, reextract, scrub, onScrub)
  return (
    <div className="gl-lab__dials">
      <DialRoot mode="inline" theme="system" />
    </div>
  )
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const round2 = (v: number) => Math.round(v * 100) / 100

function GradientLab() {
  const [lab, setLab] = useState<LabState>(DEFAULT_LAB_STATE)
  const update = useCallback((patch: Partial<LabState>) => setLab((prev) => ({ ...prev, ...patch })), [])
  const { flowers, error: flowersError, reload } = useFlowers()
  const { toasts, show } = useToast()
  const canvasRef = useRef<LabCanvasHandle>(null)

  const reextract = usePaletteExtraction(lab, update, flowers)
  const [tab, setTab] = useState<ControlsTab>('image')
  const { gradients, reload: reloadGradients } = useSavedGradients()
  const [activeSlot, setActiveSlot] = useState(1)
  const [savingSlot, setSavingSlot] = useState(false)

  /* Selecting a saved slot loads its settings; an empty slot keeps the current
     gradient so it can be saved there. */
  const selectSlot = (slot: number) => {
    setActiveSlot(slot)
    const saved = gradients.find((g) => g.slot === slot)
    if (!saved) return
    try {
      const patch = parsePreset(saved.preset)
      setLab((prev) => {
        // Tag the loaded palette so extraction keeps it rather than re-extracting.
        if (patch.palette) paletteKeys.set(patch.palette, extractKey({ ...prev, ...patch, gradient: patch.gradient ?? prev.gradient }))
        return { ...prev, ...patch }
      })
    } catch (e) {
      show('error', `Couldn't open gradient ${slot}: ${(e as Error).message}`)
    }
  }

  const saveSlot = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSavingSlot(true)
    try {
      const image = await canvas.exportImage('image/jpeg', 0.92, { width: APP_IMAGE_SIZE, height: APP_IMAGE_SIZE })
      await saveGradient(activeSlot, toPreset(lab, `Gradient ${activeSlot}`), image)
      reloadGradients()
      show('success', `Gradient ${activeSlot} saved`)
    } catch (e) {
      show('error', `Couldn't save gradient ${activeSlot}: ${(e as Error).message}`)
    } finally {
      setSavingSlot(false)
    }
  }

  const clearSlot = async () => {
    try {
      await clearGradient(activeSlot)
      reloadGradients()
      show('success', `Gradient ${activeSlot} cleared`)
    } catch (e) {
      show('error', `Couldn't clear gradient ${activeSlot}: ${(e as Error).message}`)
    }
  }
  const [scrub, setScrub] = useState(0)

  const setOffset = useCallback(
    (x: number, y: number) => setLab((prev) => ({ ...prev, gradient: { ...prev.gradient, offsetX: x, offsetY: y } })),
    [],
  )

  /* Drag on the preview: the image follows the pointer. dx/dy are fractions of
     the frame; the shader samples p = R * ((uv - 0.5) * aspectScale / scale) -
     offset / 2, so keeping the point under the pointer fixed needs
     offset += 2 * R * (d * aspectScale / scale). */
  const onPan = useCallback((dx: number, dy: number) => {
    setLab((prev) => {
      const g = prev.gradient
      const ratio = ASPECT_VALUES[prev.framing.aspect]
      const ux = (dx * Math.min(1, ratio)) / g.scale
      const uy = (dy * Math.min(1, 1 / ratio)) / g.scale
      const a = (g.rotation * Math.PI) / 180
      const c = Math.cos(a)
      const s = Math.sin(a)
      return {
        ...prev,
        gradient: {
          ...g,
          offsetX: clamp(g.offsetX + 2 * (c * ux - s * uy), -1, 1),
          offsetY: clamp(g.offsetY + 2 * (s * ux + c * uy), -1, 1),
        },
      }
    })
  }, [])

  const onZoom = useCallback((factor: number) => {
    setLab((prev) => ({
      ...prev,
      gradient: { ...prev.gradient, scale: clamp(prev.gradient.scale * factor, 0.25, 4) },
    }))
  }, [])

  const randomizeFraming = () => {
    const r = (min: number, max: number) => min + Math.random() * (max - min)
    setLab((prev) => ({
      ...prev,
      gradient: {
        ...prev.gradient,
        offsetX: round2(r(-0.6, 0.6)),
        offsetY: round2(r(-0.6, 0.6)),
        scale: round2(r(0.8, 1.6)),
        rotation: Math.floor(r(0, 360)),
      },
    }))
  }

  const flower = flowers.find((f) => f.id === lab.flowerId)
  /* No image, no gradient: the stage shows an empty state and nothing can be saved or exported. */
  const hasImage = flower !== undefined
  const baseName = flower ? flower.name.replace(/\.[a-z0-9]+$/i, '') : 'rainbow'
  const scrubTime = lab.motion.playing ? undefined : scrub * lab.motion.loopSeconds

  return (
    <div className="gl-lab">
      <header className="gl-lab__header">
        <h1 className="gl-lab__title">Gradient Studio</h1>
        <ExportPanel canvasRef={canvasRef} lab={lab} baseName={baseName} show={show} disabled={!hasImage} />
      </header>

      <div className="gl-lab__body">
        <div className="gl-lab__stage-col">
          <div className="gl-lab__stage">
            {hasImage ? (
              <LabCanvas ref={canvasRef} lab={lab} flowers={flowers} time={scrubTime} onPan={onPan} onZoom={onZoom} />
            ) : (
              <div className="gl-lab__empty">
                <EmptyState
                  illustration={<img src={emptyIllustration} width={72} height={72} alt="" />}
                  title="No image yet"
                  description="Upload a photo or pick one from Image. Its colours become the gradient."
                />
              </div>
            )}
          </div>
          <p className="gl-lab__hint">Scroll to zoom · drag to pan · focal point on the pad</p>
          <GradientSlots
            gradients={gradients}
            activeSlot={activeSlot}
            saving={savingSlot}
            canSave={hasImage}
            onSelect={selectSlot}
            onSave={saveSlot}
            onClear={clearSlot}
          />
        </div>

        <aside className="gl-lab__col" aria-label="Controls">
          <ContentSwitcher
            items={TABS}
            activeKey={tab}
            onChange={(key) => setTab(key as ControlsTab)}
            ariaLabel="Controls"
            className="gl-lab__switcher"
          />

          {tab === 'image' && (
            <TexturePanel
              lab={lab}
              update={update}
              flowers={flowers}
              loadError={flowersError}
              reload={reload}
              show={show}
            />
          )}

          {tab === 'gradient' && (
            <>
              <FramingPanel lab={lab} update={update} />
              <hr className="gl-section__divider" />
              <section className="gl-section" aria-labelledby="gl-focal-title">
                <h2 id="gl-focal-title" className="gl-section__title">Focal point</h2>
                <FocalPad x={lab.gradient.offsetX} y={lab.gradient.offsetY} onChange={setOffset} />
                <Button
                  className="gl-section__full"
                  variant="outlined-2"
                  size="sm"
                  icon={<Shuffle size={16} variant="Linear" color="currentColor" />}
                  onClick={randomizeFraming}
                >
                  Randomise Framing
                </Button>
              </section>
              <hr className="gl-section__divider" />
            </>
          )}

          {tab !== 'image' && (
            <TabDials key={tab} kind={tab} lab={lab} update={update} reextract={reextract} scrub={scrub} onScrub={setScrub} />
          )}
        </aside>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default GradientLab
