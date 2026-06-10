import { useEffect, useRef, type RefObject } from 'react'
import { Routing2 } from 'iconsax-react'
import Toggle from '../../../../components/Toggle/Toggle'
import { frequencyLabel, type SavedReport } from '../../../../utils/lrSavedFilters'
import './ReportsMenu.css'

interface ReportsMenuProps {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLElement | null>
  reports: SavedReport[]
  onCreate: () => void
  onEdit: (report: SavedReport) => void
  /** Turn a report's automated delivery on/off (admins can't delete from here). */
  onToggle: (id: string, value: boolean) => void
}

function summary(r: SavedReport): string {
  const n = r.recipients.length
  return `${frequencyLabel(r.frequency)} · ${n} recipient${n === 1 ? '' : 's'}`
}

function ReportsMenu({ open, onClose, anchorRef, reports, onCreate, onEdit, onToggle }: ReportsMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      const anchor = anchorRef.current
      if (anchor && !anchor.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose, anchorRef])

  if (!open) return null

  return (
    <div className="rm" ref={ref} role="dialog" aria-label="Scheduled reports">
      <div className="rm-list">
        {reports.map((r) => (
          <div className="rm-item" key={r.id}>
            <button type="button" className="rm-item-main" onClick={() => onEdit(r)}>
              <span className="rm-item-title">{r.name}</span>
              <span className="rm-item-desc">{summary(r)}</span>
            </button>
            <Toggle
              size="sm"
              checked={r.automate}
              onChange={(e) => onToggle(r.id, e.target.checked)}
              aria-label={`${r.automate ? 'Turn off' : 'Turn on'} ${r.name}`}
            />
          </div>
        ))}

        {reports.length === 0 && <div className="rm-empty">No scheduled reports yet.</div>}
      </div>

      <div className="rm-divider" />

      <div className="rm-footer">
        <button type="button" className="rm-create" onClick={onCreate}>
          New Scheduled Report
          <Routing2 size={20} color="var(--neutral-0)" variant="Linear" />
        </button>
      </div>
    </div>
  )
}

export default ReportsMenu
