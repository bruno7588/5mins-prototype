import type { ReactNode } from 'react'
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
export function SummaryCardList({ children }: { children: ReactNode }) {
  return <div className="summary-cards">{children}</div>
}

interface SummaryCardProps {
  /** The ordinal for an ordered list, or an icon for a criterion. */
  badge: ReactNode
  title: string
  /** The terms, already joined — "Immediate · No due date · Never repeats". */
  meta?: string
}

export function SummaryCard({ badge, title, meta }: SummaryCardProps) {
  return (
    <div className="summary-card">
      <span className="summary-card__badge">{badge}</span>
      <span className="summary-card__body">
        <span className="summary-card__title">{title}</span>
        {meta && <span className="summary-card__meta">{meta}</span>}
      </span>
    </div>
  )
}
