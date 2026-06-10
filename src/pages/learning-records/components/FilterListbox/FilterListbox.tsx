import { useEffect, useMemo, useRef, useState, type ComponentType, type RefObject } from 'react'
import { type DropdownOption } from '../../../../components/Dropdown/Dropdown'
import {
  Calendar,
  CalendarAdd,
  CalendarTick,
  Category,
  Clock,
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
      { id: 'enrolment-history', title: 'Enrolment History', description: 'Filter by enrolment lifecycle stage (Current, Archived)', Icon: Clock },
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
