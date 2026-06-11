/**
 * Registered / enrolled users in the org — source for recipient autocomplete
 * on scheduled reports. Prototype seed data (mirrors the People page records,
 * extended with a few more so the typeahead feels populated).
 */
export interface OrgUser {
  name: string
  email: string
  /** Two-letter initials for the avatar chip (fallback when no photo). */
  initials: string
  /** Optional profile photo URL (served from /public/avatars). */
  avatar?: string
  role?: string
}

export const ORG_USERS: OrgUser[] = [
  { name: 'Anthonny Wallace', email: 'anthonny@example.com', initials: 'AW', avatar: '/avatars/a1.jpg', role: 'Customer Support Specialist' },
  { name: 'Brenda Kwasaki', email: 'brenda@example.com', initials: 'BK', avatar: '/avatars/a2.jpg', role: 'Operations Manager' },
  { name: 'Carlos Mendes', email: 'carlos@example.com', initials: 'CM', avatar: '/avatars/a3.jpg', role: 'Software Engineer' },
  { name: 'Diana Ross', email: 'diana.ross@company.com', initials: 'DR', avatar: '/avatars/a4.jpg', role: 'Marketing Lead' },
  { name: 'Erik Johansson', email: 'erik.j@example.com', initials: 'EJ', avatar: '/avatars/a5.jpg', role: 'Data Analyst' },
  { name: 'Fiona Chen', email: 'fiona.chen@example.com', initials: 'FC', avatar: '/avatars/a6.jpg', role: 'UX Designer' },
  { name: 'Gabriel Santos', email: 'gabriel.s@example.com', initials: 'GS', avatar: '/avatars/a7.jpg', role: 'Sales Representative' },
  { name: 'Hannah Lee', email: 'hannah.lee@example.com', initials: 'HL', role: 'People Operations' },
  { name: 'Ibrahim Khan', email: 'ibrahim.khan@example.com', initials: 'IK', role: 'Compliance Officer' },
  { name: 'Julia Romano', email: 'julia.romano@example.com', initials: 'JR', role: 'Finance Manager' },
  { name: 'Kenji Watanabe', email: 'kenji.w@example.com', initials: 'KW', role: 'Product Manager' },
  { name: 'Laura Pereira', email: 'laura.pereira@example.com', initials: 'LP', role: 'L&D Coordinator' },
]

const norm = (s: string) => s.trim().toLowerCase()

/** Filter org users by a free-text query over name + email. */
export function searchOrgUsers(query: string, exclude: string[] = []): OrgUser[] {
  const q = norm(query)
  const taken = new Set(exclude.map(norm))
  return ORG_USERS.filter((u) => {
    if (taken.has(norm(u.email))) return false
    if (!q) return true
    return norm(u.name).includes(q) || norm(u.email).includes(q)
  })
}

/** Look up a known user by email (to show their name on a recipient chip). */
export function orgUserByEmail(email: string): OrgUser | undefined {
  return ORG_USERS.find((u) => norm(u.email) === norm(email))
}
