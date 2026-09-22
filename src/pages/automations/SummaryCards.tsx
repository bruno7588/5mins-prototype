import { Children, useState, type ReactNode } from 'react'
import { ArrowUp2 } from 'iconsax-react'
import Collapse from '@/components/Collapse/Collapse'
import type { AutomationCourse } from './Automations'
import './SummaryCards.css'

/** "Immediate · Due 7 days after start date · Repeats every 12 months" */
export function formatCourseMeta(c: AutomationCourse): string {
  const parts: string[] = []

  // Enrollment
  if (c.enrollmentType.kind === 'immediate') {
    parts.push('Immediate')
  } else {
    const unit = c.enrollmentType.days === 1 ? 'day' : 'days'
    parts.push(`${c.enrollmentType.days} ${unit} after previous course`)
  }

  // Due date
  if (c.dueDate.kind === 'none') {
    parts.push('No due date')
  } else {
    const unit = c.dueDate.daysAfterStart === 1 ? 'day' : 'days'
    parts.push(`Due ${c.dueDate.daysAfterStart} ${unit} after start date`)
  }

  // Recurrence
  if (c.recurrence.enabled) {
    const { interval, unit } = c.recurrence
    const unitLabel =
      unit === 'months' ? (interval === 1 ? 'month' : 'months') : interval === 1 ? 'week' : 'weeks'
    parts.push(`Repeats every ${interval} ${unitLabel}`)
  } else {
    parts.push('Never repeats')
  }

  return parts.join(' \u00b7 ')
}


/**
 * The card list an automation is summarised with — one card per thing it will
 * do, each naming the thing and its terms underneath.
 *
 * Shared because two surfaces summarise the same automation: the review before
 * it is saved (DEV-4768) and the Trigger automation drawer. They showed the
 * same facts in two different shapes before this.
 */
export function SummaryCardList({
  children,
  /** One container holding every row, for facts that read as a set — the
      criteria of a single trigger — rather than as separate things. */
  grouped = false,
  /** Show this many, then a View all that eases the rest open. */
  previewCount,
}: {
  children: ReactNode
  grouped?: boolean
  previewCount?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const items = Children.toArray(children)
  const overflows = previewCount != null && items.length > previewCount
  const shown = overflows ? items.slice(0, previewCount) : items
  const rest = overflows ? items.slice(previewCount) : []

  return (
    <div className={`summary-cards${grouped ? ' summary-cards--grouped' : ''}`}>
      {shown}
      {overflows && (
        <>
          <Collapse open={expanded} className="summary-cards__rest">
            <div className="summary-cards__rest-inner">{rest}</div>
          </Collapse>
          <button
            type="button"
            className="summary-cards__toggle"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'View less' : `View all ${items.length}`}
            <ArrowUp2
              size={16}
              color="currentColor"
              variant="Linear"
              className={`summary-cards__toggle-icon${expanded ? '' : ' summary-cards__toggle-icon--down'}`}
            />
          </button>
        </>
      )}
    </div>
  )
}

interface SummaryCardProps {
  /** The ordinal for an ordered list, or an icon for a criterion. */
  badge: ReactNode
  title: string
  /** The terms, already joined — "Immediate · No due date · Never repeats". */
  meta?: string
}

export function SummaryCard({ badge, title, meta }: SummaryCardProps) {
  /* An icon is its own mark; only an ordinal needs a disc behind it to read as
     a number in a sequence. */
  const ordinal = typeof badge === 'number' || typeof badge === 'string'
  return (
    <div className="summary-card">
      <span className={`summary-card__badge${ordinal ? '' : ' summary-card__badge--icon'}`}>
        {badge}
      </span>
      <span className="summary-card__body">
        <span className="summary-card__title">{title}</span>
        {meta && <span className="summary-card__meta">{meta}</span>}
      </span>
    </div>
  )
}
