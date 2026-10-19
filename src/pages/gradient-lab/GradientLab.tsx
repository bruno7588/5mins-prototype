import { useCallback, useState } from 'react'
import { Gps, Shuffle } from 'iconsax-react'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import Button from '@/components/Button/Button'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { brandPalette } from '@/data/brandPalette'
import { DEFAULT_THEME, effectiveTheme } from '@/data/brandTheme'
import { renderStill } from '@/data/renderRecipe'
import { useTheme } from '@/hooks/useTheme'
import LabCanvas from './LabCanvas'
import ExportPanel from './panels/ExportPanel'
import GradientSlots from './panels/GradientSlots'
import { clearGradient, reorderGradients, saveGradient, useSavedGradients } from './gradients'
import { DEFAULT_RECIPE, parseRecipe } from './recipe'
import FocalPad from './panels/FocalPad'
import { useLabDials, type DialsKind, type LabState } from './panels/useLabDials'
import './gradient-lab.css'
import './panels/panels.css'

/**
 * Gradient Studio (Playground, dev only): makes the recipes behind the default
 * company images. A recipe is the gradient's shape and motion, with no colours:
 * each tenant sees it in colours generated from its theme (brandPalette). Left:
 * the live preview (wheel zooms, drag pans) in the preview colours, and the
 * saved slots. Right: a Gradient / Shader switcher (Export sits in the header):
 * Gradient holds the focal point and the shape and preview-colour DialKit panel;
 * Shader holds motion and grain. Prefix: gl-
 */

const TABS: { key: DialsKind; label: string }[] = [
  { key: 'gradient', label: 'Gradient' },
  { key: 'shader', label: 'Shader' },
]

interface DialsProps {
  kind: DialsKind
  lab: LabState
  update: (patch: Partial<LabState>) => void
}

/** The open tab's DialKit panel, inline. Mounted per tab, so only its panel shows. */
function TabDials({ kind, lab, update }: DialsProps) {
  useLabDials(kind, lab, update)
  const { theme } = useTheme()
  return (
    <div className="gl-lab__dials">
      <DialRoot mode="inline" theme={theme} />
    </div>
  )
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const round2 = (v: number) => Math.round(v * 100) / 100

function GradientLab() {
  // Previewed in the tenant's colours by default, so recipes are judged in a real brand.
  const [lab, setLab] = useState<LabState>(() => ({ recipe: DEFAULT_RECIPE, preview: effectiveTheme().light, playing: true }))
  const update = useCallback((patch: Partial<LabState>) => setLab((prev) => ({ ...prev, ...patch })), [])
  const setRecipe = useCallback(
    (patch: Partial<LabState['recipe']>) => setLab((prev) => ({ ...prev, recipe: { ...prev.recipe, ...patch } })),
    [],
  )
  const { toasts, show } = useToast()
  const [tab, setTab] = useState<DialsKind>('gradient')
  const { gradients, reload: reloadGradients } = useSavedGradients()
  const [activeSlot, setActiveSlot] = useState(1)
  const [savingSlot, setSavingSlot] = useState(false)
  const colours = brandPalette(lab.preview, lab.recipe.colours)

  /* Selecting a saved slot loads its recipe; an empty slot keeps the current
     gradient so it can be saved there. */
  const selectSlot = (slot: number, list = gradients) => {
    setActiveSlot(slot)
    const saved = list.find((g) => g.slot === slot)
    if (!saved) return
    try {
      const recipe = parseRecipe(saved.preset)
      setLab((prev) => ({ ...prev, recipe }))
    } catch (e) {
      show('error', `Couldn't open gradient ${slot}: ${(e as Error).message}`)
    }
  }

  /* The slot's still is always in the 5Mins colours: tenants get their own render. */
  const saveSlot = async () => {
    setSavingSlot(true)
    try {
      const recipe = { ...lab.recipe, name: `Gradient ${activeSlot}` }
      const still = await renderStill(recipe, brandPalette(DEFAULT_THEME.light, recipe.colours))
      await saveGradient(activeSlot, recipe, still)
      void reloadGradients()
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
      const list = await reloadGradients()
      show('success', `Gradient ${activeSlot} cleared`)
      // The next gradient moved into this slot; open it, or the one before when this was the last.
      selectSlot(list.some((g) => g.slot === activeSlot) ? activeSlot : Math.max(1, activeSlot - 1), list)
    } catch (e) {
      show('error', `Couldn't clear gradient ${activeSlot}: ${(e as Error).message}`)
    }
  }

  /* Saved slots come back numbered 1..n in the new order; the active one follows its gradient. */
  const reorderSlots = async (slots: number[]) => {
    try {
      await reorderGradients(slots)
      if (slots.includes(activeSlot)) setActiveSlot(slots.indexOf(activeSlot) + 1)
      show('success', 'Gradients reordered')
    } catch (e) {
      show('error', `Couldn't reorder the gradients: ${(e as Error).message}`)
    } finally {
      void reloadGradients()
    }
  }

  const setOffset = useCallback((x: number, y: number) => setRecipe({ offsetX: x, offsetY: y }), [setRecipe])

  /* Drag on the preview: the gradient follows the pointer. Paper applies the
     offset before scale and rotation, so a drag maps straight onto it. */
  const onPan = useCallback((dx: number, dy: number) => {
    setLab((prev) => ({
      ...prev,
      recipe: { ...prev.recipe, offsetX: clamp(prev.recipe.offsetX + dx, -1, 1), offsetY: clamp(prev.recipe.offsetY + dy, -1, 1) },
    }))
  }, [])

  const onZoom = useCallback((factor: number) => {
    setLab((prev) => ({ ...prev, recipe: { ...prev.recipe, scale: clamp(prev.recipe.scale * factor, 0.25, 4) } }))
  }, [])

  const randomizeFraming = () => {
    const r = (min: number, max: number) => min + Math.random() * (max - min)
    setRecipe({
      offsetX: round2(r(-0.6, 0.6)),
      offsetY: round2(r(-0.6, 0.6)),
      scale: round2(r(0.8, 1.6)),
      rotation: Math.floor(r(0, 360)),
    })
  }

  return (
    <div className="gl-lab">
      <header className="gl-lab__header">
        <h1 className="gl-lab__title">Gradient Studio</h1>
        <ExportPanel recipe={lab.recipe} colours={colours} show={show} />
      </header>

      <div className="gl-lab__body">
        <div className="gl-lab__stage-col">
          <div className="gl-lab__stage">
            <LabCanvas recipe={lab.recipe} colours={colours} playing={lab.playing} onPan={onPan} onZoom={onZoom} />
          </div>
          <p className="gl-lab__hint">Scroll to zoom · drag to pan</p>
          <GradientSlots
            gradients={gradients}
            activeSlot={activeSlot}
            saving={savingSlot}
            canSave
            onSelect={selectSlot}
            onSave={saveSlot}
            onClear={clearSlot}
            onReorder={reorderSlots}
          />
        </div>

        <aside className="gl-lab__col" aria-label="Controls">
          <ContentSwitcher
            items={TABS}
            activeKey={tab}
            onChange={(key) => setTab(key as DialsKind)}
            ariaLabel="Controls"
            className="gl-lab__switcher"
          />

          {tab === 'gradient' && (
            <>
              <section className="gl-section" aria-labelledby="gl-focal-title">
                <h2 id="gl-focal-title" className="gl-section__title">Focal point</h2>
                <div className="gl-focal-row">
                  <FocalPad x={lab.recipe.offsetX} y={lab.recipe.offsetY} onChange={setOffset} />
                  <div className="gl-focal-actions">
                    <Button
                      variant="outlined-2"
                      size="sm"
                      icon={<Shuffle size={16} variant="Linear" color="currentColor" />}
                      onClick={randomizeFraming}
                    >
                      Randomise Framing
                    </Button>
                    <Button
                      variant="outlined-2"
                      size="sm"
                      icon={<Gps size={16} variant="Linear" color="currentColor" />}
                      disabled={lab.recipe.offsetX === 0 && lab.recipe.offsetY === 0}
                      onClick={() => setOffset(0, 0)}
                    >
                      Centre Point
                    </Button>
                  </div>
                </div>
              </section>
              <hr className="gl-section__divider" />
            </>
          )}

          <TabDials key={tab} kind={tab} lab={lab} update={update} />
        </aside>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default GradientLab
