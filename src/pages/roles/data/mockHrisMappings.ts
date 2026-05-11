import type { CompanyRole, FiveMinsRole } from './mockRoles'

/* ─── Types ─────────────────────────────────────────────── */

export interface HrisJobTitle {
  title: string
  employeeCount: number
}

export type MappedRoleRef =
  | { kind: 'tenant'; id: number }
  | { kind: 'fivemins'; id: number }

export type MappingStatus = 'mapped' | 'unmapped'

export interface HrisRoleMapping {
  hrisJobTitle: string
  employeeCount: number
  role: MappedRoleRef | null
  status: MappingStatus
}

export interface ResyncResult {
  mappings: HrisRoleMapping[]
  newTitles: HrisJobTitle[]
  removedTitles: string[]
}

/* ─── Mock HRIS Dataset (~20 distinct titles) ───────────── */

export const mockHrisJobTitles: HrisJobTitle[] = [
  { title: 'Account Executive', employeeCount: 12 },
  { title: 'Customer Success Manager', employeeCount: 8 },
  { title: 'Software Engineer', employeeCount: 15 },
  { title: 'Senior Software Engineer', employeeCount: 10 },
  { title: 'Frontend Engineer', employeeCount: 5 },
  { title: 'DevOps Engineer', employeeCount: 3 },
  { title: 'Product Manager', employeeCount: 6 },
  { title: 'UX Designer', employeeCount: 4 },
  { title: 'Data Engineer', employeeCount: 7 },
  { title: 'Compliance Manager', employeeCount: 3 },
  { title: 'HR Coordinator', employeeCount: 8 },
  { title: 'Sales Manager', employeeCount: 5 },
  { title: 'Senior Frontend Developer', employeeCount: 3 },
  { title: 'Junior Marketing Specialist', employeeCount: 5 },
  { title: 'Sr. SWE', employeeCount: 2 },
  { title: 'Mid-level Account Manager', employeeCount: 3 },
  { title: 'VP, People Operations', employeeCount: 1 },
  { title: 'Hospitality Floor Lead', employeeCount: 4 },
  { title: 'Lead Software Engineer', employeeCount: 2 },
  { title: 'Brand Designer', employeeCount: 3 },
]

/* ─── Auto-match Algorithm ──────────────────────────────── */

const norm = (s: string) => s.trim().toLowerCase()

export function autoMatch(
  titles: HrisJobTitle[],
  tenantRoles: CompanyRole[],
  publicRoles: FiveMinsRole[],
): HrisRoleMapping[] {
  const tenantByName = new Map<string, CompanyRole>()
  for (const r of tenantRoles) {
    const key = norm(r.name)
    if (!tenantByName.has(key)) tenantByName.set(key, r)
  }

  const publicByName = new Map<string, FiveMinsRole>()
  for (const r of publicRoles) {
    const key = norm(r.name)
    if (!publicByName.has(key)) publicByName.set(key, r)
  }

  return titles.map(({ title, employeeCount }) => {
    if (!title.trim()) {
      return { hrisJobTitle: title, employeeCount, role: null, status: 'unmapped' as const }
    }
    const key = norm(title)
    const tenant = tenantByName.get(key)
    if (tenant) {
      return {
        hrisJobTitle: title,
        employeeCount,
        role: { kind: 'tenant', id: tenant.id },
        status: 'mapped' as const,
      }
    }
    const pub = publicByName.get(key)
    if (pub) {
      return {
        hrisJobTitle: title,
        employeeCount,
        role: { kind: 'fivemins', id: pub.id },
        status: 'mapped' as const,
      }
    }
    return { hrisJobTitle: title, employeeCount, role: null, status: 'unmapped' as const }
  })
}

/* ─── Re-sync Logic ─────────────────────────────────────── */

export function resyncTitles(
  prev: HrisRoleMapping[],
  incoming: HrisJobTitle[],
  tenantRoles: CompanyRole[],
  publicRoles: FiveMinsRole[],
): ResyncResult {
  const prevByTitle = new Map(prev.map(m => [norm(m.hrisJobTitle), m]))
  const incomingByTitle = new Map(incoming.map(t => [norm(t.title), t]))

  const newTitles: HrisJobTitle[] = []
  const updated: HrisRoleMapping[] = []

  for (const t of incoming) {
    const key = norm(t.title)
    const existing = prevByTitle.get(key)
    if (existing) {
      updated.push({ ...existing, employeeCount: t.employeeCount })
    } else {
      newTitles.push(t)
    }
  }

  const autoForNew = autoMatch(newTitles, tenantRoles, publicRoles)
  const next = [...updated, ...autoForNew]
  const reconciled = reconcileStatuses(next, tenantRoles, publicRoles)

  const removedTitles = prev
    .filter(m => !incomingByTitle.has(norm(m.hrisJobTitle)))
    .map(m => m.hrisJobTitle)

  return { mappings: reconciled, newTitles, removedTitles }
}

/* ─── Status Reconciliation ─────────────────────────────── */
/* If a mapped role no longer exists in the tenant or public lists
 * (e.g. it was deleted), reset that mapping to unmapped so the admin
 * can pick a fresh role. */

export function reconcileStatuses(
  mappings: HrisRoleMapping[],
  tenantRoles: CompanyRole[],
  publicRoles: FiveMinsRole[],
): HrisRoleMapping[] {
  const tenantIds = new Set(tenantRoles.map(r => r.id))
  const publicIds = new Set(publicRoles.map(r => r.id))

  return mappings.map(m => {
    if (m.role === null) {
      return m.status === 'unmapped' ? m : { ...m, status: 'unmapped' }
    }
    const exists =
      m.role.kind === 'tenant' ? tenantIds.has(m.role.id) : publicIds.has(m.role.id)
    if (!exists) {
      return { ...m, role: null, status: 'unmapped' }
    }
    return m.status === 'mapped' ? m : { ...m, status: 'mapped' }
  })
}

/* ─── Initial Mappings (auto-match seed) ────────────────── */

export function buildInitialMappings(
  tenantRoles: CompanyRole[],
  publicRoles: FiveMinsRole[],
): HrisRoleMapping[] {
  return autoMatch(mockHrisJobTitles, tenantRoles, publicRoles)
}

/* ─── Lookup Helper ─────────────────────────────────────── */

export function resolveRoleName(
  ref: MappedRoleRef,
  tenantRoles: CompanyRole[],
  publicRoles: FiveMinsRole[],
): string | null {
  if (ref.kind === 'tenant') return tenantRoles.find(r => r.id === ref.id)?.name ?? null
  return publicRoles.find(r => r.id === ref.id)?.name ?? null
}
