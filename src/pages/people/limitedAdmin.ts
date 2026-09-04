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
 * The short form for a toast, e.g. "Harbour View or Airport Central". Only one
 * condition can be summarised by its values alone: across several fields the
 * values are ANDed, and a flat "a or b or c" list would misstate the scope.
 */
export function scopeValuesSummary(scope: LimitedAdminScope): string | null {
  const complete = scope.conditions.filter(isConditionComplete)
  if (complete.length !== 1) return null
  return formatList(complete[0].values, 'or')
}

function formatList(items: string[], joiner: 'and' | 'or'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} ${joiner} ${items[items.length - 1]}`
}

export const emptyScope = (): LimitedAdminScope => ({ conditions: [{ fieldId: 0, values: [] }] })
