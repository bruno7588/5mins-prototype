import type { ReactNode } from 'react'
import './SectionHeader.css'

interface SectionHeaderProps {
  title: string
  description?: string
  ctas?: ReactNode
  /** Optional control before the title — a back button on a multi-step drawer. */
  leading?: ReactNode
}

function SectionHeader({ title, description, ctas, leading }: SectionHeaderProps) {
  return (
    <header className="section-header">
      <div className="section-header__headline">
        {leading}
        <div className="section-header__title-group">
          <h2 className="section-header__title">{title}</h2>
          {description && (
            <p className="section-header__description">{description}</p>
          )}
        </div>
        {ctas && <div className="section-header__ctas">{ctas}</div>}
      </div>
    </header>
  )
}

export default SectionHeader
