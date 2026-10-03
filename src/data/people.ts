/**
 * Org people for the enrol and assign wizards (prototype seed data). Generated
 * deterministically so every reload shows the same 716 people.
 */

export const COMPANY = 'Acme Inc.'

export const TEAMS = ['Front Office', 'Food & Beverage', 'Housekeeping', 'Finance', 'Compliance', 'People & Performance']
export const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Middle East']
export const JOB_ROLES = ['Receptionist', 'Server', 'Chef', 'Accountant', 'Room Attendant', 'Duty Manager']

export interface CohortRow {
  id: string
  name: string
}

export const COHORTS: CohortRow[] = [
  { id: 'cohort-1', name: 'New Joiners 2026' },
  { id: 'cohort-2', name: 'Leadership Group Q1 2026' },
  { id: 'cohort-3', name: 'Night Shift Team' },
  { id: 'cohort-4', name: 'Food Safety Champions' },
  { id: 'cohort-5', name: 'Graduate Programme' },
  { id: 'cohort-6', name: 'Regional Managers' },
]

export interface PersonRow {
  id: string
  /** Position in the seed; drives the deterministic mock enrolments. */
  index: number
  name: string
  email: string
  team: string
  region: string
  jobRole: string
  isManager: boolean
  /** Empty when the person is in no cohort. */
  cohortId: string
}

const FIRST_NAMES = [
  'Alice', 'Marcus', 'Priya', 'Tom', 'Sofia', 'Daniel', 'Hannah', 'Omar', 'Grace', 'Lucas',
  'Ingrid', 'Carlos', 'Nadia', 'Ethan', 'Yuki', 'Fatima', 'Sven', 'Maria', 'David', 'Emily',
  'Raj', 'Chloe', 'Andre', 'Mei', 'Noah', 'Laura', 'Kenji', 'Julia', 'Ibrahim', 'Fiona',
]
const LAST_NAMES = [
  'Johnson', 'Reid', 'Nair', 'Becker', 'Alvarez', 'Wu', 'Schmidt', 'Haddad', 'Bennett', 'Moreau',
  'Larsson', 'Mendes', 'Petrova', 'Clarke', 'Tanaka', 'Khan', 'Eriksson', 'Costa', 'Okoro', 'Foster',
  'Patel', 'Martin', 'Silva', 'Chen',
]

export const HEADCOUNT = 716

export const PEOPLE: PersonRow[] = Array.from({ length: HEADCOUNT }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length]
  const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]
  return {
    id: `person-${i + 1}`,
    index: i,
    name: `${first} ${last}`,
    email: `${first}.${last}@acme.com`.toLowerCase(),
    // Vary by surname too, so a name-sorted page mixes teams and regions.
    team: TEAMS[(i + Math.floor(i / FIRST_NAMES.length)) % TEAMS.length],
    region: REGIONS[(i + 2 * Math.floor(i / FIRST_NAMES.length)) % REGIONS.length],
    jobRole: JOB_ROLES[(i * 5) % JOB_ROLES.length],
    isManager: i % 9 === 0,
    cohortId: i % 3 === 0 ? COHORTS[(i / 3) % COHORTS.length].id : '',
  }
})
