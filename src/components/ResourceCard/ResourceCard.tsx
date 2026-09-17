import { ExportSquare, ImportCurve } from 'iconsax-react'
import excelThumb from '@/assets/resource-type-illustrations/excel.svg'
import linkIcon from '@/assets/resource-type-illustrations/link-icon.svg'
import pdfThumb from '@/assets/resource-type-illustrations/pdf.svg'
import powerpointThumb from '@/assets/resource-type-illustrations/powerpoint.svg'
import wordThumb from '@/assets/resource-type-illustrations/word.svg'
import Tooltip from '@/components/Tooltip/Tooltip'
import './ResourceCard.css'

export type ResourceType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'link'

const TYPE_LABEL: Record<ResourceType, string> = {
  pdf: 'PDF',
  word: 'Word',
  excel: 'Excel',
  powerpoint: 'PowerPoint',
  link: 'External link',
}

/** Type thumbnail artwork per file type (Figma Library 12213:2984). */
export const FILE_THUMBS: Record<Exclude<ResourceType, 'link'>, string> = {
  pdf: pdfThumb,
  word: wordThumb,
  excel: excelThumb,
  powerpoint: powerpointThumb,
}

/** "1.1 MB", "240 KB". */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** The card's second line: "PDF • 1.1 MB", or "External link". */
export function resourceMeta(type: ResourceType, size?: number): string {
  if (type === 'link' || size === undefined) return TYPE_LABEL[type]
  return `${TYPE_LABEL[type]} • ${formatSize(size)}`
}

interface ResourceCardProps {
  type: ResourceType
  title: string
  /** File size in bytes; files only. */
  size?: number
  /** 'web' for the admin and learner web app (48px tile), 'mobile' for the app (56px tile). */
  device?: 'web' | 'mobile'
  /** Download a file, or open a link. */
  onOpen?: () => void
  /** Greys the action when there is nothing to download yet. */
  openDisabled?: boolean
  className?: string
}

/**
 * Resource card (Figma Library 12213:3040): type tile, title and meta, with one
 * Download (or Open link) action. Same card on the admin course builder and the
 * learner course page. See docs/design-system/resource-card.md.
 */
function ResourceCard({ type, title, size, device = 'web', onOpen, openDisabled = false, className }: ResourceCardProps) {
  const isLink = type === 'link'
  const openLabel = isLink ? 'Open link' : 'Download'
  const Icon = isLink ? ExportSquare : ImportCurve

  return (
    <div className={`resource-card resource-card--${device}${className ? ` ${className}` : ''}`}>
      {isLink ? (
        <span className="resource-card__thumb resource-card__thumb--link" aria-hidden="true">
          <img src={linkIcon} width={24} height={24} alt="" />
        </span>
      ) : (
        <img className="resource-card__thumb" src={FILE_THUMBS[type]} alt="" />
      )}
      <div className="resource-card__info">
        <p className="resource-card__title">{title}</p>
        <p className="resource-card__meta">{resourceMeta(type, size)}</p>
      </div>
      <Tooltip text={openLabel} position="Top" icon={false}>
        <button
          type="button"
          className={`resource-card__open${openDisabled ? ' ui-disabled' : ''}`}
          aria-label={`${openLabel} ${title}`}
          aria-disabled={openDisabled || undefined}
          onClick={openDisabled ? undefined : onOpen}
        >
          <Icon size={device === 'mobile' ? 24 : 20} color="currentColor" variant="Linear" />
        </button>
      </Tooltip>
    </div>
  )
}

export default ResourceCard
