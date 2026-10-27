import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown2, DocumentUpload, Gps, Shuffle, Trash } from 'iconsax-react'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import Button from '@/components/Button/Button'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { recipeColours, themeColours } from '@/data/brandPalette'
import { gradientSet, slotSet } from '@/data/brandTheme'
import { renderStill } from '@/data/renderRecipe'
import { useTheme } from '@/hooks/useTheme'
import LabCanvas from './LabCanvas'
import ExportPanel from './panels/ExportPanel'
import GradientSlots from './panels/GradientSlots'
import { clearGradient, reorderGradients, saveGradient, useSavedGradients } from './gradients'
import { DEFAULT_RECIPE, parseRecipe, readIcon, type GradientRecipe } from './recipe'
import Collapse from '@/components/Collapse/Collapse'
import FocalPad from './panels/FocalPad'

/** The dithering backdrop's blobs, in recipe.blobs order. The third (selected item) is no longer
    drawn: that colour is the sphere's alone. */
const BLOB_LABELS = ['Header bar', 'Navigation items']
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
 * Shader holds motion and grain; Icon holds an SVG laid over the gradient, its
 * place, size, dithering and gradient overlay. Prefix: gl-
 */

const TABS: { key: DialsKind; label: string }[] = [
  { key: 'gradient', label: 'Background' },
  { key: 'shader', label: 'Shader' },
  { key: 'icon', label: 'Icon' },
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
      {/* DialKit hides itself in production builds by default; the Studio is used on the deployed site. */}
      <DialRoot mode="inline" theme={theme} productionEnabled />
    </div>
  )
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const round2 = (v: number) => Math.round(v * 100) / 100

function GradientLab() {
  // Previewed in the tenant's colours by default, so recipes are judged in a real brand.
  const [lab, setLab] = useState<LabState>(() => ({ recipe: DEFAULT_RECIPE, preview: gradientSet('light'), defaults: gradientSet('light'), playing: true }))
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
  // The new slot's gradient while it is unsaved, kept when another slot is opened.
  const [draft, setDraft] = useState<GradientRecipe | null>(null)
  const colours = recipeColours(lab.recipe, lab.preview)
  const finishColours = themeColours(lab.preview)

  /* Selecting a saved slot loads its recipe; the new empty slot opens its draft,
     or keeps the current gradient so it can be saved there. */
  const selectSlot = (slot: number, list = gradients) => {
    const leavingNew = !gradients.some((g) => g.slot === activeSlot)
    const nextDraft = leavingNew ? lab.recipe : draft
    if (leavingNew) setDraft(nextDraft)
    setActiveSlot(slot)
    // Each slot previews in the 5Mins colours of the mode it is for.
    const set = slotSet(slot)
    setLab((prev) => ({ ...prev, defaults: set, preview: set }))
    const saved = list.find((g) => g.slot === slot)
    if (!saved) {
      if (nextDraft) setLab((prev) => ({ ...prev, recipe: nextDraft }))
      return
    }
    try {
      const recipe = parseRecipe(saved.preset)
      setLab((prev) => ({ ...prev, recipe, playing: recipe.playing }))
    } catch (e) {
      show('error', `Couldn't open gradient ${slot}: ${(e as Error).message}`)
    }
  }

  /* The slot's still is always in the 5Mins colours: tenants get their own render. */
  const saveSlot = async () => {
    setSavingSlot(true)
    try {
      const recipe = { ...lab.recipe, playing: lab.playing, name: `Gradient ${activeSlot}` }
      const set = slotSet(activeSlot)
      const still = await renderStill(recipe, recipeColours(recipe, set), 'image/jpeg', themeColours(set))
      await saveGradient(activeSlot, recipe, still)
      if (!gradients.some((g) => g.slot === activeSlot)) setDraft(null)
      void reloadGradients()
      show('success', `Gradient ${activeSlot} saved`)
    } catch (e) {
      show('error', `Couldn't save gradient ${activeSlot}: ${(e as Error).message}`)
    } finally {
      setSavingSlot(false)
    }
  }

  /* Saves the gradient on screen as a new slot at the end and opens it. */
  const duplicateSlot = async () => {
    const slot = Math.max(0, ...gradients.map((g) => g.slot)) + 1
    setSavingSlot(true)
    try {
      const recipe = { ...lab.recipe, playing: lab.playing, name: `Gradient ${slot}` }
      const set = slotSet(slot)
      const still = await renderStill(recipe, recipeColours(recipe, set), 'image/jpeg', themeColours(set))
      await saveGradient(slot, recipe, still)
      await reloadGradients()
      setActiveSlot(slot)
      show('success', `Gradient ${activeSlot} duplicated as gradient ${slot}`)
    } catch (e) {
      show('error', `Couldn't duplicate gradient ${activeSlot}: ${(e as Error).message}`)
    } finally {
      setSavingSlot(false)
    }
  }

  const clearSlot = async () => {
    // One change at a time: a second clear on stale numbers would clear the wrong slot.
    if (savingSlot) return
    setSavingSlot(true)
    try {
      await clearGradient(activeSlot)
      const list = await reloadGradients()
      show('success', `Gradient ${activeSlot} cleared`)
      // The next gradient moved into this slot; open it, or the one before when this was the last.
      selectSlot(list.some((g) => g.slot === activeSlot) ? activeSlot : Math.max(1, activeSlot - 1), list)
    } catch (e) {
      show('error', `Couldn't clear gradient ${activeSlot}: ${(e as Error).message}`)
    } finally {
      setSavingSlot(false)
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

  /* On first load, open slot 1 rather than the built-in default. */
  const opened = useRef(false)
  useEffect(() => {
    if (opened.current || gradients.length === 0) return
    opened.current = true
    selectSlot(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradients])

  const setOffset = useCallback((x: number, y: number) => setRecipe({ offsetX: x, offsetY: y }), [setRecipe])

  const [blobsOpen, setBlobsOpen] = useState(true)

  /* The icon: an SVG file read as text. Anything that isn't an SVG document is refused. */
  const iconInput = useRef<HTMLInputElement>(null)
  const pickIcon = async (file: File | undefined) => {
    if (!file) return
    const icon = readIcon(await file.text())
    if (icon) setRecipe({ icon })
    else show('error', `Couldn't use ${file.name}: choose an SVG file.`)
  }
  const setIconPlace = useCallback((x: number, y: number) => setRecipe({ iconX: x, iconY: y }), [setRecipe])

  /* Dithering's colour blobs: each pad's -1 to 1 maps onto 0-1 of the frame. */
  const setBlob = (i: number, x: number, y: number) =>
    setRecipe({ blobs: lab.recipe.blobs.map((b, j) => (j === i ? [round2((x + 1) / 2), round2((y + 1) / 2)] : b)) })

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
        <ExportPanel recipe={lab.recipe} colours={colours} finishColours={finishColours} show={show} />
      </header>

      <div className="gl-lab__body">
        <div className="gl-lab__stage-col">
          <div className="gl-lab__stage">
            <LabCanvas recipe={lab.recipe} colours={colours} finishColours={finishColours} playing={lab.playing} onPan={onPan} onZoom={onZoom} />
          </div>
          <p className="gl-lab__hint">Scroll to zoom · drag to pan</p>
          <GradientSlots
            gradients={gradients}
            activeSlot={activeSlot}
            saving={savingSlot}
            hasDraft={draft !== null}
            canSave
            onSelect={selectSlot}
            onSave={saveSlot}
            onDuplicate={duplicateSlot}
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
              {lab.recipe.shader === 'dither' && (
                <>
                  <section className="gl-section" aria-labelledby="gl-blobs-title">
                    <h2 id="gl-blobs-title" className="gl-section__title">
                      <button
                        type="button"
                        className="gl-blobs__toggle"
                        aria-expanded={blobsOpen}
                        aria-controls="gl-blobs-body"
                        onClick={() => setBlobsOpen((o) => !o)}
                      >
                        Colour blobs
                        <ArrowDown2
                          size={16}
                          variant="Linear"
                          color="var(--text-primary)"
                          className={`gl-blobs__chevron${blobsOpen ? ' gl-blobs__chevron--open' : ''}`}
                        />
                      </button>
                    </h2>
                    <Collapse open={blobsOpen}>
                    <div id="gl-blobs-body" className="gl-blobs">
                      {BLOB_LABELS.map((name, i) => (
                        <div key={name} className="gl-blobs__item">
                          <span className="gl-blobs__label">{name}</span>
                          <FocalPad
                            label={`${name} blob`}
                            x={lab.recipe.blobs[i][0] * 2 - 1}
                            y={lab.recipe.blobs[i][1] * 2 - 1}
                            onChange={(x, y) => setBlob(i, x, y)}
                          />
                        </div>
                      ))}
                    </div>
                    </Collapse>
                  </section>
                  <hr className="gl-section__divider" />
                </>
              )}
            </>
          )}

          {tab === 'icon' && (
            <>
              <section className="gl-section" aria-labelledby="gl-icon-title">
                <h2 id="gl-icon-title" className="gl-section__title">Icon</h2>
                <input
                  ref={iconInput}
                  type="file"
                  accept=".svg,image/svg+xml"
                  hidden
                  onChange={(e) => {
                    void pickIcon(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
                <div className="gl-focal-row">
                  <FocalPad label="Icon position" x={lab.recipe.iconX} y={lab.recipe.iconY} onChange={setIconPlace} />
                  <div className="gl-focal-actions">
                    <Button
                      variant="outlined-2"
                      size="sm"
                      icon={<DocumentUpload size={16} variant="Linear" color="currentColor" />}
                      onClick={() => iconInput.current?.click()}
                    >
                      {lab.recipe.icon ? 'Replace SVG' : 'Upload SVG'}
                    </Button>
                    <Button
                      variant="outlined-2"
                      size="sm"
                      icon={<Gps size={16} variant="Linear" color="currentColor" />}
                      disabled={!lab.recipe.icon || (lab.recipe.iconX === 0 && lab.recipe.iconY === 0)}
                      onClick={() => setIconPlace(0, 0)}
                    >
                      Centre Icon
                    </Button>
                    <Button
                      variant="outlined-2"
                      size="sm"
                      icon={<Trash size={16} variant="Linear" color="currentColor" />}
                      disabled={!lab.recipe.icon}
                      onClick={() => setRecipe({ icon: '' })}
                    >
                      Remove Icon
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
