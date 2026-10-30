import '@/components/Table/Table.css'

/** The DS table progress cell (table.md): 8 segments, cyan fill, the percentage beside it. */
const SEGMENTS = 8
function ProgressCell({ value, showPct = true, className = '' }: { value: number; showPct?: boolean; className?: string }) {
  const filled = Math.round((value / 100) * SEGMENTS)
  return (
    <span className={`tbl-progress asm-progress ${className}`}>
      <span className="bar" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={`seg${i < filled ? ' fill' : ''}`} />
        ))}
      </span>
      {showPct && <span className="pct">{value}%</span>}
    </span>
  )
}

export default ProgressCell
