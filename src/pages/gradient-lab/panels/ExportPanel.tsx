import { useState } from 'react'
import { ArrowDown2, Code, Copy } from 'iconsax-react'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import type { ToastType } from '@/components/Toast/Toast'
import { renderStill } from '@/data/renderRecipe'
import type { GradientRecipe } from '../recipe'
import { download, slug } from './files'

/* Export button in the page header: a menu that copies the current gradient as
   a 512 px PNG in the preview colours, and exports the recipe as JSON. */

interface Props {
  recipe: GradientRecipe
  /** The preview colours, for the copied image. */
  colours: string[]
  show: (type: ToastType, message: string) => void
}

function ExportPanel({ recipe, colours, show }: Props) {
  const [busy, setBusy] = useState<'copy' | null>(null)

  const exportJson = () => {
    const name = slug(recipe.name, 'gradient')
    download(new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' }), `${name}.json`)
    show('success', 'JSON exported')
  }

  const copyPng = async () => {
    setBusy('copy')
    try {
      // The promise goes straight into ClipboardItem so Safari keeps the user gesture.
      const png = renderStill(recipe, colours, 'image/png').then((url) => fetch(url).then((r) => r.blob()))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
      show('success', 'Image copied')
    } catch {
      show('error', "Couldn't copy the image.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <RowActionsMenu
      ariaLabel="Export options"
      caret={false}
      items={[
        { key: 'copy', label: 'Copy PNG to Clipboard', icon: <Copy size={20} variant="Linear" color="var(--text-primary)" /> },
        { key: 'json', label: 'Export JSON', icon: <Code size={20} variant="Linear" color="var(--text-primary)" /> },
      ]}
      onSelect={(key) => {
        if (busy) return
        if (key === 'copy') void copyPng()
        else exportJson()
      }}
      triggerClassName={`ds-btn ds-btn--md ds-btn--filled ds-btn--has-trailing${busy ? ' ds-btn--loading-labelled' : ''}`}
      triggerContent={
        <>
          <span className="ds-btn__label">{busy ? 'Exporting…' : 'Export'}</span>
          <span className="ds-btn__icon">
            <ArrowDown2 size={20} variant="Linear" color="currentColor" />
          </span>
        </>
      }
    />
  )
}

export default ExportPanel
