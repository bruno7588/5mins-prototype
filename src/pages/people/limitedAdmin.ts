/**
 * Limited Admin scope model.
 *
 * A Limited Admin is an admin whose reach is confined to the people matching
 * their scope. Scope is a list of conditions on custom user fields, evaluated
 * live: values within one condition are OR'd, conditions are AND'd, so people
 * move in and out of scope as their field values change.
 */

import type { UserField } from '@/data/userFields'

export interface ScopeCondition {
  fieldId: number
  values: string[]
}

export interface LimitedAdminScope {
  conditions: ScopeCondition[]
}

/** Custom-field values for one person, keyed by field id. */
export type FieldValues = Record<number, string>

/** A condition is only usable once it names a field and at least one value. */
export function isConditionComplete(c: ScopeCondition): boolean {
  return c.fieldId > 0 && c.values.length > 0
}

export function isScopeComplete(scope: LimitedAdminScope): boolean {
  return scope.conditions.length > 0 && scope.conditions.every(isConditionComplete)
}

/** Does this person fall inside the scope? Values OR within a field, fields AND. */
export function personInScope(values: FieldValues | undefined, scope: LimitedAdminScope): boolean {
  if (!isScopeComplete(scope)) return false
  return scope.conditions.every((c) => {
    const value = values?.[c.fieldId]
    return value !== undefined && c.values.includes(value)
  })
}

/**
 * Conditions whose field no longer exists, or whose values have all been
 * removed from that field. These make a scope invalid rather than empty: the
 * Limited Admin sees nobody until an admin repairs it.
 */
export function orphanedConditions(
  scope: LimitedAdminScope,
  fields: UserField[],
): ScopeCondition[] {
  return scope.conditions.filter((c) => {
    const field = fields.find((f) => f.id === c.fieldId)
    if (!field) return true
    return !c.values.some((v) => field.options.includes(v))
  })
}

export function isScopeValid(scope: LimitedAdminScope, fields: UserField[]): boolean {
  return isScopeComplete(scope) && orphanedConditions(scope, fields).length === 0
}

/** Human-readable scope, e.g. "Hotel name is Harbour View or Airport Central". */
export function scopeSummary(scope: LimitedAdminScope, fields: UserField[]): string {
  const parts = scope.conditions.filter(isConditionComplete).map((c) => {
    const field = fields.find((f) => f.id === c.fieldId)
    const name = field ? field.name : 'Deleted field'
    return `${name} is ${formatList(c.values, 'or')}`
  })
  return formatList(parts, 'and')
}

/**
 * The Limited Admins table cell: one line per field, each naming the field and
 * how much of it the scope takes. Naming the values themselves needs badges or
 * a string that truncates mid-word, and neither survives a table of rows; the
 * count carries the one thing the field name cannot say, which is how wide the
 * reach is. The values are a hover and a click away.
 */
export interface ScopeCellLine {
  field: string
  /** The single value where a condition names one, e.g. "Contractor"; a count
      of the field where it names several, e.g. "3 of 5". */
  detail: string
}

export interface ScopeCell {
  lines: ScopeCellLine[]
  /** Fields the cell had no room for, e.g. "+1 more field". */
  more: string
  /** A deleted field or value leaves the scope matching nobody. */
  invalid: boolean
}

/**
 * The scope as badges: one group per condition, so the values inside a group
 * read as OR and the groups themselves as AND. A single flat list of every
 * value would say the scope is any of them, which is the opposite of what an
 * ANDed scope means.
 */
export function scopeGroups(
  scope: LimitedAdminScope,
  fields: UserField[],
): { field: string; values: string[] }[] {
  return scope.conditions.filter(isConditionComplete).map((c) => {
    const field = fields.find((f) => f.id === c.fieldId)
    return { field: field ? field.name : 'Deleted field', values: c.values }
  })
}

/** Fields named in the cell before the rest become a "+N" badge. Two, because
    the cell is one line: a third badge wraps and takes the row with it. */
const CELL_FIELDS = 2

export function scopeCell(scope: LimitedAdminScope, fields: UserField[]): ScopeCell {
  const complete = scope.conditions.filter(isConditionComplete)
  if (complete.length === 0 || !isScopeValid(scope, fields)) {
    return { lines: [], more: '', invalid: true }
  }

  const lines = complete.slice(0, CELL_FIELDS).map((c) => {
    const field = fields.find((f) => f.id === c.fieldId)
    return {
      field: field ? field.name : 'Deleted field',
      /* One value is worth naming; several are only worth counting, and the
         count says how much of the field the scope takes. */
      detail:
        c.values.length === 1
          ? c.values[0]
          : field
            ? `${c.values.length} of ${field.options.length}`
            : '',
    }
  })

  const hidden = complete.length - lines.length
  return {
    lines,
    more: hidden > 0 ? `+${hidden}` : '',
    invalid: false,
  }
}

function formatList(items: string[], joiner: 'and' | 'or'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} ${joiner} ${items[items.length - 1]}`
}

export const emptyScope = (): LimitedAdminScope => ({ conditions: [{ fieldId: 0, values: [] }] })
