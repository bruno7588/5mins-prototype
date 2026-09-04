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
/* Marks which seed a browser already holds. Without it, deleting every field would
   look like a fresh store and the seed would come back on reload; with a version,
   fields added to the seed later still reach a browser that holds an older one. */
const SEEDED_KEY = '5mins-user-fields-seeded'
const SEED_VERSION = '2'

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
  {
    id: 3,
    name: 'Country',
    options: ['United Kingdom', 'Portugal', 'Spain', 'Germany', 'Singapore'],
    required: false,
  },
  {
    id: 4,
    name: 'Brand',
    options: ['Meridian', 'Coastline', 'Urban Stay'],
    required: false,
  },
  {
    id: 5,
    name: 'Employment type',
    options: ['Full time', 'Part time', 'Contractor', 'Seasonal'],
    required: false,
  },
  {
    id: 6,
    name: 'Shift',
    options: ['Morning', 'Afternoon', 'Night'],
    required: false,
  },
]

export function loadUserFields(): UserField[] {
  try {
    const seeded = localStorage.getItem(SEEDED_KEY)
    if (!seeded) {
      localStorage.setItem(SEEDED_KEY, SEED_VERSION)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_FIELDS))
      return SEED_FIELDS
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    const stored = raw ? (JSON.parse(raw) as UserField[]) : []
    if (!Array.isArray(stored)) return []

    if (seeded !== SEED_VERSION) {
      /* Only fields this browser has never seen: anything already stored keeps the
         edits made to it, and a seed field deleted on purpose stays deleted only
         until the seed version moves, which is the price of topping it up at all. */
      const known = new Set(stored.map((f) => f.id))
      const added = SEED_FIELDS.filter((f) => !known.has(f.id))
      const merged = [...stored, ...added]
      localStorage.setItem(SEEDED_KEY, SEED_VERSION)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      return merged
    }

    return stored
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
