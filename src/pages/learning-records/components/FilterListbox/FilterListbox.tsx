import { useEffect, useMemo, useRef, useState, type ComponentType, type RefObject } from 'react'
import { type DropdownOption } from '../../../../components/Dropdown/Dropdown'
import {
  Calendar,
  CalendarAdd,
  CalendarTick,
  Category,
  Danger,
  Flag,
  Location,
  PercentageSquare,
  Profile2User,
  SearchNormal1,
  Setting4,
  ShieldTick,
  Sms,
  User,
  Video,
} from 'iconsax-react'
import './FilterListbox.css'

type IconType = ComponentType<{ size?: number; color?: string; variant?: 'Linear' | 'Bold' | 'Outline' }>

interface FilterItem {
  id: string
  title: string
  description?: string
  Icon: IconType
}

interface FilterGroup {
  section: string
  items: FilterItem[]
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    section: 'Person',
    items: [
      { id: 'user-name', title: 'User Name', description: "Search by the learner's full name", Icon: User },
      { id: 'email', title: 'Email', description: "Search by the learner's email address", Icon: Sms },
      { id: 'team', title: 'Team', description: "Filter by the learner's assigned team", Icon: Profile2User },
      { id: 'region', title: 'Region', description: "Filter by the learner's region", Icon: Location },
    ],
  },
  {
    section: 'Course',
    items: [
      { id: 'course', title: 'Course', description: 'Filter by a specific course title', Icon: Video },
      { id: 'category', title: 'Category', description: 'Filter by course category (e.g. Compliance)', Icon: Category },
      { id: 'compliance-course', title: 'Compliance Course', description: 'Show only courses flagged as compliance training', Icon: ShieldTick },
    ],
  },
  {
    section: 'Status & Progress',
    items: [
      { id: 'status', title: 'Status', description: 'Active, completed, overdue, archived', Icon: Flag },
      { id: 'progress', title: 'Progress', description: 'Filter by % of course completed', Icon: PercentageSquare },
    ],
  },
  {
    section: 'Dates',
    items: [
      { id: 'start-date', title: 'Start Date', description: 'When the learner was enrolled', Icon: CalendarAdd },
      { id: 'due-date', title: 'Due Date', description: 'When the learner was due to complete the course', Icon: Calendar },
      { id: 'completion-date', title: 'Completion Date', description: 'When the learner finished the course', Icon: CalendarTick },
      { id: 'days-late', title: 'Days Late', description: 'No of days learner was late to complete or is overdue', Icon: Danger },
    ],
  },
  {
    section: 'Custom Fields',
    items: [
      { id: 'account-type', title: 'Account Type', Icon: Setting4 },
      { id: 'original-hire-date', title: 'Original Hire Date', Icon: Setting4 },
      { id: 'group-organisation', title: 'Group Organisation', Icon: Setting4 },
      { id: 'contract-type', title: 'Contract Type', Icon: Setting4 },
    ],
  },
]

export interface FilterMeta {
  id: string
  title: string
  description?: string
  Icon: IconType
  section: string
}

/** id → metadata (icon, title, section) for rendering added-filter rows elsewhere. */
export const FILTER_BY_ID: Record<string, FilterMeta> = Object.fromEntries(
  FILTER_GROUPS.flatMap((g) => g.items.map((i) => [i.id, { ...i, section: g.section }])),
)

/* Mock value options per filter (prototype) — shared by the page filter rows and the
   editable filters inside the Save Report drawer. */
const FILTER_VALUE_OPTIONS: Record<string, DropdownOption[]> = {
  status: [
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'not-started', label: 'Not Started' },
    { value: 'overdue', label: 'Overdue' },
  ],
  'enrolment-history': [
    { value: 'current', label: 'Current' },
    { value: 'archived', label: 'Archived' },
  ],
  team: [
    { value: 'all', label: 'All teams' },
    { value: 'operations', label: 'Operations' },
    { value: 'finance', label: 'Finance' },
    { value: 'compliance', label: 'Compliance' },
  ],
  region: [
    { value: 'na', label: 'North America' },
    { value: 'eu', label: 'Europe' },
    { value: 'apac', label: 'Asia Pacific' },
    { value: 'sea', label: 'Southeast Asia' },
    { value: 'me', label: 'Middle East' },
  ],
  category: [
    { value: 'compliance', label: 'Compliance' },
    { value: 'safety', label: 'Safety' },
    { value: 'soft-skills', label: 'Soft Skills' },
    { value: 'operations', label: 'Operations' },
    { value: 'performance', label: 'Performance' },
  ],
  progress: [
    { value: '0-25', label: '0–25%' },
    { value: '25-50', label: '25–50%' },
    { value: '50-75', label: '50–75%' },
    { value: '75-100', label: '75–100%' },
  ],
}

const DEFAULT_FILTER_OPTIONS: DropdownOption[] = [
  { value: 'opt-1', label: 'Option 1' },
  { value: 'opt-2', label: 'Option 2' },
  { value: 'opt-3', label: 'Option 3' },
]

export function filterOptions(id: string): DropdownOption[] {
  return FILTER_VALUE_OPTIONS[id] ?? DEFAULT_FILTER_OPTIONS
}

/* ── Per-filter control type (matches the product's filter UI) ──
   Prototype only — values below are sample options for context; the filters
   are not applied to the table. */

const opt = (labels: string[]): DropdownOption[] =>
  labels.map((l) => ({ value: l.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: l }))

const MULTI_OPTIONS: Record<string, DropdownOption[]> = {
  'user-name': opt([
    'Michael Thompson', 'Jessica Hart', 'David Johnson', 'Noah Williams', 'Mei Tanaka',
    'Ethan Brooks', 'Priya Shah', 'Samantha Rivers', 'Laura Chen', 'Marcus Reid',
  ]),
  email: opt([
    'michael.t@company.com', 'jessica.h@company.com', 'david.j@company.com',
    'noah.w@company.com', 'mei.t@company.com', 'ethan.b@company.com',
    'priya.s@company.com', 'samantha.r@company.com', 'laura.c@company.com', 'marcus.r@company.com',
  ]),
  team: opt([
    'People & Performance', 'Operations', 'Food & Beverage', 'Shift Operations',
    'Finance', 'Compliance', 'Front Office',
  ]),
  region: opt(['North America', 'Europe', 'Asia Pacific', 'Southeast Asia', 'Middle East']),
  course: opt([
    'HBR Guide to Communication Success', 'Food Safety Essentials', 'Harassment Prevention',
    'Allergen Awareness', 'Conflict Resolution', 'Cash Handling', 'Fire Safety',
    'POS System Training', 'Anti-Money Laundering',
  ]),
  category: opt(['Compliance', 'Safety', 'Soft Skills', 'Operations', 'Performance']),
  'group-organisation': opt(['Head Office', 'Franchise — North', 'Franchise — South', 'Partner Sites']),
}

const SINGLE_OPTIONS: Record<string, DropdownOption[]> = {
  status: opt(['Completed', 'In Progress', 'Not Started', 'Overdue']),
  'compliance-course': opt(['Yes', 'No']),
  'account-type': opt(['Standard', 'Manager', 'Administrator']),
  'contract-type': opt(['Full-time', 'Part-time', 'Contractor', 'Seasonal']),
}

export type FilterControl =
  | { kind: 'single'; options: DropdownOption[]; placeholder: string }
  | { kind: 'multi'; options: DropdownOption[]; placeholder: string }
  | { kind: 'range'; min: number; max: number; suffix?: string }
  | { kind: 'operator'; unit: string }
  | { kind: 'date' }

const CONTROL_BY_ID: Record<string, FilterControl> = {
  'user-name': { kind: 'multi', options: MULTI_OPTIONS['user-name'], placeholder: 'Select user names' },
  email: { kind: 'multi', options: MULTI_OPTIONS.email, placeholder: 'Select emails' },
  team: { kind: 'multi', options: MULTI_OPTIONS.team, placeholder: 'Select teams' },
  region: { kind: 'multi', options: MULTI_OPTIONS.region, placeholder: 'Select regions' },
  course: { kind: 'multi', options: MULTI_OPTIONS.course, placeholder: 'Select courses' },
  category: { kind: 'multi', options: MULTI_OPTIONS.category, placeholder: 'Select categories' },
  'group-organisation': { kind: 'multi', options: MULTI_OPTIONS['group-organisation'], placeholder: 'Select organisations' },
  status: { kind: 'single', options: SINGLE_OPTIONS.status, placeholder: 'Select status' },
  'compliance-course': { kind: 'single', options: SINGLE_OPTIONS['compliance-course'], placeholder: 'Select compliance status' },
  'account-type': { kind: 'single', options: SINGLE_OPTIONS['account-type'], placeholder: 'Select account type' },
  'contract-type': { kind: 'single', options: SINGLE_OPTIONS['contract-type'], placeholder: 'Select contract type' },
  progress: { kind: 'range', min: 0, max: 100, suffix: '%' },
  'days-late': { kind: 'operator', unit: 'days' },
  'start-date': { kind: 'date' },
  'due-date': { kind: 'date' },
  'completion-date': { kind: 'date' },
  'original-hire-date': { kind: 'date' },
}

export function filterControl(id: string): FilterControl {
  return CONTROL_BY_ID[id] ?? { kind: 'single', options: DEFAULT_FILTER_OPTIONS, placeholder: 'Select' }
}

/** Operator options shared by numeric-operator filters (e.g. Days Late). */
export const OPERATOR_OPTIONS: DropdownOption[] = [
  { value: 'more-than', label: 'More than' },
  { value: 'less-than', label: 'Less than' },
  { value: 'between', label: 'Between' },
]

interface FilterListboxProps {
  open: boolean
  onClose: () => void
  onSelect: (id: string) => void
  /** Wrapper element (trigger + listbox) used for click-outside detection. */
  anchorRef: RefObject<HTMLElement | null>
}

function FilterListbox({ open, onClose, onSelect, anchorRef }: FilterListboxProps) {
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      const anchor = anchorRef.current
      if (anchor && !anchor.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose, anchorRef])

  // Reset the query each time the listbox is opened
  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FILTER_GROUPS
    return FILTER_GROUPS
      .map((g) => ({ ...g, items: g.items.filter((i) => i.title.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0)
  }, [query])

  if (!open) return null

  return (
    <div className="flb" ref={ref} role="listbox" aria-label="Add filter">
      <div className="flb-search">
        <SearchNormal1 size={20} color="var(--text-tertiary)" variant="Linear" />
        <input
          type="text"
          className="flb-search-input"
          placeholder="Search filters"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flb-list">
        {groups.map((group, gi) => (
          <div className="flb-group" key={group.section}>
            {gi > 0 && <div className="flb-divider" />}
            <div className="flb-section">{group.section}</div>
            {group.items.map((item) => (
              <button
                type="button"
                role="option"
                aria-selected={false}
                className={`flb-item${item.description ? '' : ' flb-item--compact'}`}
                key={item.id}
                onClick={() => onSelect(item.id)}
              >
                <span className="flb-item-icon">
                  <item.Icon size={20} color="var(--text-primary)" variant="Linear" />
                </span>
                <span className="flb-item-text">
                  <span className="flb-item-title">{item.title}</span>
                  {item.description && <span className="flb-item-desc">{item.description}</span>}
                </span>
              </button>
            ))}
          </div>
        ))}

        {groups.length === 0 && <div className="flb-empty">No filters match “{query}”.</div>}
      </div>
    </div>
  )
}

export default FilterListbox
