import { useSyncExternalStore } from 'react'
import { addMonthsClamped } from '@/data/externalTraining'

/* DES-366: how long a course completion stays valid, set per course in Course
   settings and read by Learning Records, Course Progress and the certificate.
   The prototype has no shared course catalogue, so rules are keyed by course
   title. A course with no rule has No expiry and no certificate. */

export interface CourseCompletionRule {
  /** Months a completion stays valid; null = No expiry. Years are stored as months. */
  validityMonths: number | null
  /** Whether the course awards a certificate. */
  certificate: boolean
}

const NO_RULE: CourseCompletionRule = { validityMonths: null, certificate: false }

let rules: Record<string, CourseCompletionRule> = {
  // Learning Records
  'HBR Guide to Communication Success': { validityMonths: 36, certificate: true },
  'Food Safety Essentials': { validityMonths: 36, certificate: true },
  'Harassment Prevention': { validityMonths: 12, certificate: true },
  'Fire Safety': { validityMonths: 12, certificate: false },
  'Anti-Money Laundering': { validityMonths: 12, certificate: true },
  // Course Progress
  'Anti Money Laundering and Terrorist Financing': { validityMonths: 12, certificate: true },
  'Fraud Prevention and Risk Assessment': { validityMonths: null, certificate: true },
  'Compliance Strategies for Financial Institutions': { validityMonths: 24, certificate: false },
  'Counteracting Financial Crimes and Corruption': { validityMonths: 12, certificate: true },
}

const listeners = new Set<() => void>()

export function getCourseRule(course: string): CourseCompletionRule {
  return rules[course] ?? NO_RULE
}

export function setCourseRule(course: string, patch: Partial<CourseCompletionRule>) {
  rules = { ...rules, [course]: { ...getCourseRule(course), ...patch } }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Every rule, re-rendering when Course settings saves one. */
export function useCourseRules(): Record<string, CourseCompletionRule> {
  return useSyncExternalStore(subscribe, () => rules)
}

/** A completion's Valid until date (ISO), from the course's current period: a period
    change moves every date (DES-366 option A). Null when there is no completion or no period. */
export function validUntil(completionDate: string | null, validityMonths: number | null): string | null {
  if (!completionDate || validityMonths == null) return null
  return addMonthsClamped(completionDate, validityMonths)
}

/** "3 years" / "35 months", for toasts. */
export function formatValidity(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12
    return `${years} year${years === 1 ? '' : 's'}`
  }
  return `${months} month${months === 1 ? '' : 's'}`
}
