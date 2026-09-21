/**
 * The prototype's people, and the only population the automation builder counts
 * against. Attributes mirror the criteria fields in `triggerCriteria.ts`, so the
 * eligible-users preview can answer "who does this actually apply to?" rather
 * than quoting a number nothing produced.
 *
 * Its own module because both `Automations.tsx` and the details modal read it.
 */

import type { FilterablePerson } from './triggerCriteria'

export interface User extends FilterablePerson {
  id: string
  name: string
  email: string
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Johnson', email: 'sarah.johnson@acme.co', role: 'cro-manager', rights: 'admin', region: 'europe', cohort: 'q4-2025', team: 'sales', joinDate: '2023-02-14' },
  { id: 'u2', name: 'Marcus Chen', email: 'marcus.chen@acme.co', role: 'cx-software-engineer', region: 'apac', cohort: 'q1-2026', team: 'engineering', joinDate: '2024-06-03' },
  { id: 'u3', name: 'Aisha Patel', email: 'aisha.patel@acme.co', role: 'customer-experience-manager', rights: 'team-manager', region: 'europe', cohort: 'q1-2026', team: 'customer-success', joinDate: '2022-09-19' },
  { id: 'u4', name: 'Liam O’Connor', email: 'liam.oconnor@acme.co', role: 'field-manager-tenant', rights: 'team-manager', region: 'europe', cohort: 'q2-2026', team: 'sales', joinDate: '2025-01-07' },
  { id: 'u5', name: 'Sofia Rossi', email: 'sofia.rossi@acme.co', role: 'brand-management', region: 'europe', cohort: 'q2-2026', team: 'people-ops', joinDate: '2024-11-25' },
  { id: 'u6', name: 'Daniel Park', email: 'daniel.park@acme.co', role: 'financial-accountant', region: 'americas', cohort: 'q3-2026', team: 'finance', joinDate: '2023-07-31' },
  { id: 'u7', name: 'Emma Wright', email: 'emma.wright@acme.co', role: 'communication-manager', rights: 'subject-expert', region: 'europe', cohort: 'q4-2025', team: 'people-ops', joinDate: '2021-04-12' },
  { id: 'u8', name: 'Olufemi Adeyemi', email: 'olufemi.adeyemi@acme.co', role: 'regional-trainer-tenant', rights: 'subject-expert', region: 'mea', cohort: 'q1-2026', team: 'customer-success', joinDate: '2024-02-29' },
  { id: 'u9', name: 'Hannah Mitchell', email: 'hannah.mitchell@acme.co', role: 'account-executive', region: 'americas', cohort: 'q2-2026', team: 'sales', joinDate: '2025-03-18' },
  { id: 'u10', name: 'Tomás García', email: 'tomas.garcia@acme.co', role: 'commercial-data-analyst', region: 'europe', cohort: 'q3-2026', team: 'finance', joinDate: '2023-10-02' },
  { id: 'u11', name: 'Yuki Tanaka', email: 'yuki.tanaka@acme.co', role: 'infrastructure-architect', rights: 'admin', region: 'apac', cohort: 'q4-2026', team: 'engineering', joinDate: '2022-01-24' },
  { id: 'u12', name: 'Priya Sharma', email: 'priya.sharma@acme.co', role: 'leadership-development', rights: 'team-manager', region: 'apac', cohort: 'q1-2026', team: 'people-ops', joinDate: '2024-08-16' },
  { id: 'u13', name: 'Noah Williams', email: 'noah.williams@acme.co', role: 'customer-support-executive', region: 'americas', cohort: 'q4-2025', team: 'customer-success', joinDate: '2021-11-08' },
  { id: 'u14', name: 'Zara Ahmed', email: 'zara.ahmed@acme.co', role: 'cro-manager', rights: 'team-manager', region: 'mea', cohort: 'q2-2026', team: 'sales', joinDate: '2025-05-21' },
  { id: 'u15', name: 'Ethan Murphy', email: 'ethan.murphy@acme.co', role: 'creative-design', region: 'europe', cohort: 'q3-2026', team: 'people-ops', joinDate: '2023-03-09' },
  { id: 'u16', name: 'Mila Petrov', email: 'mila.petrov@acme.co', role: 'marketing-operations', region: 'europe', cohort: 'q4-2026', team: 'sales', joinDate: '2024-12-11' },
  { id: 'u17', name: 'Caleb Brooks', email: 'caleb.brooks@acme.co', role: 'digital-technology-lead', rights: 'admin', region: 'americas', cohort: 'q1-2026', team: 'engineering', joinDate: '2022-06-27' },
  { id: 'u18', name: 'Isabella Costa', email: 'isabella.costa@acme.co', role: 'contact-centre-agent', region: 'americas', cohort: 'q3-2026', team: 'customer-success', joinDate: '2025-07-04' },
]
