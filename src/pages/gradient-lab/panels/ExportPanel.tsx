import { useState, type RefObject } from 'react'
import { ArrowDown2, Code, Copy } from 'iconsax-react'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import type { ToastType } from '@/components/Toast/Toast'
import type { LabCanvasHandle } from '../LabCanvas'
import { toPreset } from '../preset'
import type { LabState } from '../types'
import { download, slug } from './files'

/* Export button in the page header: a menu that copies the current frame as a PNG
   at the framing's output size, and exports the settings as JSON. */

interface Props {
  canvasRef: RefObject<LabCanvasHandle | null>
  lab: LabState
  /** Base of the file name, e.g. the flower's name. */
  baseName: string
  show: (type: ToastType, message: string) => void
  /** No image yet: the menu's items are disabled. */
  disabled?: boolean
}

function ExportPanel({ canvasRef, lab, baseName, show, disabled = false }: Props) {
  const [busy, setBusy] = useState<'copy' | null>(null)

  const exportJson = () => {
    const name = slug(baseName, 'shader')
    download(new Blob([JSON.stringify(toPreset(lab, name), null, 2)], { type: 'application/json' }), `${name}.json`)
    show('success', 'JSON exported')
  }

  const copyPng = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setBusy('copy')
    try {
      // The promise goes straight into ClipboardItem so Safari keeps the user gesture.
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': canvas.exportImage('image/png') })])
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
        { key: 'copy', disabled, title: disabled ? 'Pick an image first' : undefined, label: 'Copy PNG to Clipboard', icon: <Copy size={20} variant="Linear" color="var(--text-primary)" /> },
        { key: 'json', disabled, title: disabled ? 'Pick an image first' : undefined, label: 'Export JSON', icon: <Code size={20} variant="Linear" color="var(--text-primary)" /> },
      ]}
      onSelect={(key) => {
        if (busy || disabled) return
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
