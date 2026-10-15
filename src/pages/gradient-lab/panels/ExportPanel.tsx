import { useState, type RefObject } from 'react'
import { ArrowDown2, Code, Copy, ImportCurve } from 'iconsax-react'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import type { ToastType } from '@/components/Toast/Toast'
import type { LabCanvasHandle } from '../LabCanvas'
import { toPreset } from '../preset'
import { outputSize, type LabState } from '../types'
import { download, slug } from './files'

/* Export button in the page header: a menu with the current frame as a PNG at
   the framing's output size (download or clipboard), and the settings as JSON. */

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
  const [busy, setBusy] = useState<'png' | 'copy' | null>(null)
  const { width, height } = outputSize(lab.framing)

  const exportJson = () => {
    const name = slug(baseName, 'shader')
    download(new Blob([JSON.stringify(toPreset(lab, name), null, 2)], { type: 'application/json' }), `${name}.json`)
    show('success', 'JSON exported')
  }

  const exportPng = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setBusy('png')
    try {
      const blob = await canvas.exportImage('image/png')
      download(blob, `${slug(baseName, 'gradient')}-${width}x${height}.png`)
      show('success', 'PNG exported')
    } catch (e) {
      show('error', `Couldn't export the PNG: ${(e as Error).message}`)
    } finally {
      setBusy(null)
    }
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
      show('error', "Couldn't copy the image. Use Export PNG instead.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <RowActionsMenu
      ariaLabel="Export options"
      caret={false}
      items={[
        { key: 'png', disabled, title: disabled ? 'Pick an image first' : undefined, label: 'Export PNG', icon: <ImportCurve size={20} variant="Linear" color="var(--text-primary)" /> },
        { key: 'copy', disabled, title: disabled ? 'Pick an image first' : undefined, label: 'Copy PNG to Clipboard', icon: <Copy size={20} variant="Linear" color="var(--text-primary)" /> },
        { key: 'json', disabled, title: disabled ? 'Pick an image first' : undefined, label: 'Export JSON', icon: <Code size={20} variant="Linear" color="var(--text-primary)" /> },
      ]}
      onSelect={(key) => {
        if (busy || disabled) return
        if (key === 'png') void exportPng()
        else if (key === 'copy') void copyPng()
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
