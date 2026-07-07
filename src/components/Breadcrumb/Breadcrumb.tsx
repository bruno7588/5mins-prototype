import { ArrowRight2 } from 'iconsax-react'
import './Breadcrumb.css'

/**
 * Breadcrumb (Figma Library: dark 8497:2231 / 8497:1494, light 11935:2368 / 8517:34946).
 *
 * A chevron-separated trail. Every item except the last is a Link
 * (`--text-tertiary`, hover underline); the last item is the Current page
 * (`--text-secondary`, no chevron, not interactive). All tokens are semantic,
 * so the component flips automatically between light and dark mode.
 */
export interface BreadcrumbEntry {
  label: string
  onClick?: () => void
  disabled?: boolean
}

interface BreadcrumbProps {
  /** Ordered trail; the last entry is rendered as the (non-interactive) current page. */
  items: BreadcrumbEntry[]
  className?: string
}

function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      <ol className="breadcrumb__list">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1
          return (
            <li key={i} className="breadcrumb__item">
              {isCurrent ? (
                <span className="breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  className="breadcrumb__link"
                  onClick={item.onClick}
                  disabled={item.disabled}
                >
                  {item.label}
                </button>
              )}
              {!isCurrent && (
                <span className="breadcrumb__sep" aria-hidden="true">
                  <ArrowRight2 size={16} color="var(--text-tertiary)" variant="Linear" />
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
