/**
 * Tenant-defined custom user fields.
 *
 * Defined on the User fields page, shown as optional columns on People, and
 * used as the scoping dimension for Limited Admins. The store is localStorage
 * so a field created in one session survives into the next; it seeds itself on
 * first read so the prototype always has something to scope on.
 */

export interface UserField {
  id: number
  name: string
  options: string[]
  required: boolean
}

const STORAGE_KEY = '5mins-user-fields'
/* Marks that the seed has been written once. Without it, deleting every field
   would look like a fresh store and the seed would come back on reload. */
const SEEDED_KEY = '5mins-user-fields-seeded'

/** Seeded on first load. Hotel name is the field the first customer scopes on. */
const SEED_FIELDS: UserField[] = [
  {
    id: 1,
    name: 'Hotel name',
    options: [
      'The Grand Riverside',
      'Harbour View',
      'Old Town Residence',
      'Airport Central',
      'Lakeside Retreat',
    ],
    required: false,
  },
  {
    id: 2,
    name: 'Division',
    options: ['Front of House', 'Housekeeping', 'Food & Beverage', 'Back Office'],
    required: false,
  },
]

export function loadUserFields(): UserField[] {
  try {
    if (!localStorage.getItem(SEEDED_KEY)) {
      localStorage.setItem(SEEDED_KEY, '1')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_FIELDS))
      return SEED_FIELDS
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    const stored = raw ? (JSON.parse(raw) as UserField[]) : []
    return Array.isArray(stored) ? stored : []
  } catch {
    return SEED_FIELDS
  }
}

export function saveUserFields(fields: UserField[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
  } catch {
    /* storage unavailable — the in-memory state is still correct for this session */
  }
}

export function userFieldById(fields: UserField[], id: number): UserField | undefined {
  return fields.find((f) => f.id === id)
}
