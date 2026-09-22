/**
 * Trigger criteria for automations (DEV-4403).
 *
 * The trigger card narrows who an automation applies to with a linear list of
 * `[field] [operator] [value]` rows, all combined with AND — the same shape
 * Learning Records and Enrol People use. **No filters means it applies to
 * everyone**, which is why there is no "all roles" sentinel here: not wanting a
 * constraint is expressed by not adding the row.
 *
 * This module owns the people taxonomies too, so the filter definitions can reach
 * them without importing back from `Automations.tsx`. That file re-exports them,
 * so existing consumers are unaffected.
 */

import type { ContentSource } from './courseCatalog'
import { loadUserFields } from '@/data/userFields'

/** Roles come from 5Mins' public library or the tenant's own set. */
export type RoleSource = ContentSource

export interface RoleOption {
  value: string
  label: string
  source: RoleSource
}

export const ROLE_VALUES: RoleOption[] = [
  { value: 'account-executive',          label: 'Account Executive',          source: '5mins'  },
  { value: 'affiliate-marketing',        label: 'Affiliate Marketing',        source: '5mins'  },
  { value: 'brand-management',           label: 'Brand Management',           source: '5mins'  },
  { value: 'business-strategy',          label: 'Business Strategy',          source: '5mins'  },
  { value: 'commercial-data-analyst',    label: 'Commercial Data Analyst',    source: '5mins'  },
  { value: 'communication-manager',      label: 'Communication Manager',      source: '5mins'  },
  { value: 'contact-centre-agent',       label: 'Contact Centre Agent',       source: '5mins'  },
  { value: 'creative-design',            label: 'Creative Design',            source: '5mins'  },
  { value: 'creative-graphic-design',    label: 'Creative/Graphic Design',    source: '5mins'  },
  { value: 'credit-control-refunds',     label: 'Credit Control/Refunds',     source: '5mins'  },
  { value: 'cro-manager',                label: 'CRO Manager',                source: '5mins'  },
  { value: 'csr-ncd-advisor',            label: 'CSR/NCD Advisor',            source: '5mins'  },
  { value: 'custom',                     label: 'Custom',                     source: '5mins'  },
  { value: 'customer-experience-manager',label: 'Customer Experience Manager',source: '5mins'  },
  { value: 'customer-support-executive', label: 'Customer Support Executive', source: '5mins'  },
  { value: 'cx-software-engineer',       label: 'CX Software Engineer',       source: '5mins'  },
  { value: 'digital-technology-lead',    label: 'Digital Technology Lead',    source: '5mins'  },
  { value: 'engagement-marketing',       label: 'Engagement Marketing',       source: '5mins'  },
  { value: 'financial-accountant',       label: 'Financial Accountant',       source: '5mins'  },
  { value: 'infrastructure-architect',   label: 'Infrastructure Architect',   source: '5mins'  },
  { value: 'leadership-development',     label: 'Leadership Development',     source: '5mins'  },
  { value: 'marketing-operations',       label: 'Marketing Operations',       source: '5mins'  },
  { value: 'custom-tenant-role',         label: 'Custom Tenant Role',         source: 'tenant' },
  { value: 'field-manager-tenant',       label: 'Field Manager',              source: 'tenant' },
  { value: 'regional-trainer-tenant',    label: 'Regional Trainer',           source: 'tenant' },
]

export const COHORT_VALUES = [
  { value: 'q4-2025', label: 'Q4 2025' },
  { value: 'q1-2026', label: 'Q1 2026' },
  { value: 'q2-2026', label: 'Q2 2026' },
  { value: 'q3-2026', label: 'Q3 2026' },
  { value: 'q4-2026', label: 'Q4 2026' },
] as const

export const REGION_VALUES = [
  { value: 'europe',   label: 'Europe' },
  { value: 'americas', label: 'Americas' },
  { value: 'apac',     label: 'APAC' },
  { value: 'mea',      label: 'Middle East & Africa' },
] as const

export const RIGHTS_VALUES = [
  { value: 'admin',          label: 'Admin' },
  { value: 'team-manager',   label: 'Team Manager' },
  { value: 'subject-expert', label: 'Subject Expert' },
] as const

export const TEAM_VALUES = [
  { value: 'customer-success', label: 'Customer Success' },
  { value: 'engineering',      label: 'Engineering' },
  { value: 'finance',          label: 'Finance' },
  { value: 'people-ops',       label: 'People Ops' },
  { value: 'sales',            label: 'Sales' },
] as const

/* ── Filters ─────────────────────────────────────────────────────────────── */

export type BuiltInFilterField = 'role' | 'rights' | 'region' | 'cohort' | 'team' | 'joinDate'

/** Built-ins plus the tenant's own user fields, keyed `custom:<id>` (DEV-4403). */
export type FilterField = BuiltInFilterField | `custom:${number}`

export type FilterOperator = 'one-of' | 'not-one-of' | 'before' | 'after' | 'on'

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  'one-of':     'is one of',
  'not-one-of': 'is not one of',
  before:       'is before',
  after:        'is after',
  on:           'is on',
}

export interface TriggerFilter {
  /** Stable per row so React keys and patches survive reordering. */
  id: string
  field: FilterField
  operator: FilterOperator
  /** Multi- and single-select fields. Empty until the admin picks something. */
  values: string[]
  /** Date fields only, ISO yyyy-mm-dd. */
  date?: string
}

type ControlKind = 'multi' | 'single' | 'date'

export interface FilterFieldDef {
  label: string
  control: ControlKind
  operators: FilterOperator[]
  options: readonly { value: string; label: string }[]
  placeholder?: string
  /** Shown beside the field name in the Add Filter menu. */
  hint?: string
  /** Tenant flag that has to be on for the field to be addable. */
  gate?: keyof typeof TENANT_FLAGS
}

/**
 * Tenant flags from DEV-4403. Real tenants set these per account; the prototype
 * hard-codes a plausible mid-size customer — teams off, everything else on — so
 * the gated states are reachable without a settings screen.
 */
export const TENANT_FLAGS = {
  SHOW_REGION_IN_AUTOMATIONS: true,
  SHOW_TEAMS_IN_AUTOMATIONS: false,
  SHOW_JOIN_DATE_IN_AUTOMATIONS: true,
}

export const FILTER_FIELDS: Record<BuiltInFilterField, FilterFieldDef> = {
  role: {
    label: 'Role',
    control: 'multi',
    operators: ['one-of'],
    options: ROLE_VALUES,
    placeholder: 'Search roles',
  },
  rights: {
    label: 'Rights',
    control: 'single',
    operators: ['one-of'],
    options: RIGHTS_VALUES,
    placeholder: 'Select rights',
  },
  region: {
    label: 'Region',
    control: 'multi',
    operators: ['one-of', 'not-one-of'],
    options: REGION_VALUES,
    placeholder: 'Search regions',
    gate: 'SHOW_REGION_IN_AUTOMATIONS',
  },
  cohort: {
    label: 'Cohorts',
    control: 'multi',
    operators: ['one-of'],
    options: COHORT_VALUES,
    placeholder: 'Search cohorts',
  },
  team: {
    label: 'Team',
    control: 'multi',
    operators: ['one-of', 'not-one-of'],
    options: TEAM_VALUES,
    placeholder: 'Search teams',
    gate: 'SHOW_TEAMS_IN_AUTOMATIONS',
  },
  joinDate: {
    label: 'Join date',
    control: 'date',
    operators: ['before', 'after', 'on'],
    options: [],
    hint: 'Requires HRIS integration',
  },
}

/** Order the Add Filter menu and the rows, so added filters never swap places. */
export const FILTER_ORDER: BuiltInFilterField[] = ['role', 'rights', 'joinDate', 'region', 'cohort', 'team']

export function isCustomField(field: FilterField): boolean {
  return field.startsWith('custom:')
}

/* The tenant's user fields, read when the Add Filter menu opens so a field
   added on the User fields page shows up without a reload. Cached between
   reads because matching walks every person for every criterion. */
let customDefs: Record<string, FilterFieldDef> = {}

/** Offered under "Custom Fields" in the Add Filter menu, newest store wins. */
export function customFilterFields(): { field: FilterField; def: FilterFieldDef }[] {
  const fields = loadUserFields().map((f) => ({
    field: `custom:${f.id}` as FilterField,
    def: {
      label: f.name,
      control: 'multi' as ControlKind,
      /* "All" means any value set for the field, per DEV-4403. */
      options: f.options.map((o) => ({ value: o, label: o })),
      operators: ['one-of', 'not-one-of'] as FilterOperator[],
      placeholder: `Search ${f.name.toLowerCase()}`,
    },
  }))
  customDefs = Object.fromEntries(fields.map((f) => [f.field, f.def]))
  return fields
}

/** The definition behind a criterion, built-in or custom. */
export function getFilterField(field: FilterField): FilterFieldDef {
  if (!isCustomField(field)) return FILTER_FIELDS[field as BuiltInFilterField]
  if (!customDefs[field]) customFilterFields()
  return customDefs[field] ?? { label: field, control: 'multi', operators: ['one-of'], options: [] }
}

/** A field the tenant cannot use yet still lists, disabled, with this reason. */
export const GATED_REASON = 'Requires HRIS integration with 5Mins — contact Customer Success'

export function isFieldAvailable(field: BuiltInFilterField): boolean {
  const gate = FILTER_FIELDS[field].gate
  if (gate) return TENANT_FLAGS[gate]
  if (field === 'joinDate') return TENANT_FLAGS.SHOW_JOIN_DATE_IN_AUTOMATIONS
  return true
}

export function newFilter(field: FilterField): TriggerFilter {
  const def = getFilterField(field)
  return {
    id: `${field}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    field,
    operator: def.operators[0],
    values: [],
  }
}

/** "Role is one of Account Executive, CRO Manager" — used by the list summary. */
export function describeFilter(filter: TriggerFilter): string {
  const def = getFilterField(filter.field)
  const op = OPERATOR_LABELS[filter.operator]
  if (def.control === 'date') return `${def.label} ${op} ${filter.date || '—'}`
  const labels = filter.values.map((v) => def.options.find((o) => o.value === v)?.label ?? v)
  return `${def.label} ${op} ${labels.join(', ') || '—'}`
}

/* ── Matching ────────────────────────────────────────────────────────────── */

/**
 * The attributes a criterion can test. Structural on purpose: the people list
 * lives in its own module, and typing against the shape rather than the type
 * keeps this module free of an import cycle.
 */
export interface FilterablePerson {
  role: string
  rights?: string
  region: string
  cohort: string
  team: string
  /** ISO yyyy-mm-dd. */
  joinDate: string
}

function matchesOne(person: FilterablePerson, filter: TriggerFilter): boolean {
  if (filter.field === 'joinDate') {
    if (!filter.date) return true // an unset date constrains nothing yet
    if (filter.operator === 'before') return person.joinDate < filter.date
    if (filter.operator === 'after') return person.joinDate > filter.date
    return person.joinDate === filter.date
  }

  // An empty value list is an unfinished row, not "match nothing".
  if (filter.values.length === 0) return true

  /* The prototype's people carry no values for the tenant's own fields, so a
     custom criterion cannot be evaluated here. It is left as not-narrowing
     rather than compared against whichever built-in attribute fell through. */
  if (isCustomField(filter.field)) return true

  const actual =
    filter.field === 'role' ? person.role
    : filter.field === 'rights' ? person.rights
    : filter.field === 'region' ? person.region
    : filter.field === 'cohort' ? person.cohort
    : person.team

  const hit = actual != null && filter.values.includes(actual)
  return filter.operator === 'not-one-of' ? !hit : hit
}

/** Every criterion must hold — the rows are combined with AND (DEV-4403). */
export function matchesCriteria(person: FilterablePerson, filters: TriggerFilter[]): boolean {
  return filters.every((f) => matchesOne(person, f))
}
