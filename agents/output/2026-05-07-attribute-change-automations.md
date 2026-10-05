---
ticket: (none — exploratory)
summary: Add a new "Attribute change" automation type — fires when one of a user's attributes (Role / Cohort / Region) changes to a target value
status: in Design Phase
generated: 2026-05-07
---

# Attribute Change Automations Implementation Plan

## Overview

Today an automation has exactly one trigger ("when a user registers on 5Mins.ai") and four hardcoded condition dropdowns that aren't wired into the data model. We're adding a second trigger type — *attribute change* — that fires whenever a user's **Role**, **Cohort**, or **Region** changes to a specific target value. This shifts the automation system from a single-purpose "registration funnel" tool to a general-purpose response system for user-state transitions.

The action layer (course picker + Enrollment / Due date / Frequency popovers) doesn't change. Only the trigger model, the trigger UI, the filter wiring, and the templates strip change.

## Current State Analysis

**Trigger:**
- Hardcoded copy in `AutomationDetailsModal.tsx:141`: *"When a user registers on 5Mins.ai"*
- No `trigger` field on `AutomationRow` (`Automations.tsx:54-60`)

**Filters (4 dropdowns):**
- `AutomationDetailsModal.tsx:142-177` — all four show a single `value="all"` placeholder option (`{ value: 'all', label: 'All roles' }`, etc.)
- Not persisted to the automation row — UI-only stubs
- No taxonomy of role/cohort/region values exists in the codebase

**Templates strip:**
- `Automations.tsx:667-695` — purple "New Employee Automation" card (calls `openDetails(...)` with `mode='new'`)
- `Automations.tsx:697-709` — blue "Existing Employee Automation" card with no `onClick`

**Save flow oddity:**
- `Automations.tsx:399-410` — in `'edit'` mode, `saveAutomation` only writes `lastUpdated`. Course edits propagate via separate handlers (`patchCourse`, `removeCourse`, `reorderCourses`) that mutate state directly. Trigger and filter edits will need the same direct-mutation pattern.

**Duplicate flow:**
- `Automations.tsx:530-547` — copies `name` and `courses` only. Will need to copy `trigger` and `filters` too.

**Dropdown component:**
- `src/components/Dropdown/Dropdown.tsx` — accepts `options: { value, label, description?, disabled? }[]`, `size: 'sm' | 'md' | 'lg'`, `value`, `onChange`, `placeholder`. Used at `size="md"` everywhere in the modal today.

## Desired End State

After this plan:

1. `AutomationRow` has a discriminated-union `trigger` field and a structured `filters` field.
2. The Manage tab has a third template card — "Attribute change" — using the `--lesson-quiz` accent colour.
3. Clicking the card opens the details modal in `'new'` mode with `trigger.kind === 'attribute-changed'`.
4. The trigger section in `AutomationDetailsModal` renders one of two variants based on `trigger.kind`:
   - `'user-registered'`: existing copy unchanged.
   - `'attribute-changed'`: *"When a user's [Attribute] changes to [Value]"* with two `Dropdown` controls.
5. All four filter dropdowns are wired to real options drawn from a shared taxonomy and persist into `automation.filters`. On attribute-change automations, the dropdown for the watched attribute is hidden.
6. Editing or duplicating an attribute-change automation preserves the trigger and filters.
7. Mock data includes 2–3 example attribute-change automations so the list and Activity tab demo realistically.

**Verification:** in the running dev server (background task `bi4jvcq6j`, http://localhost:5173/), an admin can create a new attribute-change automation, configure it, edit it, duplicate it, and see it in the Activity tab.

### Key Discoveries
- The save flow for trigger/filter edits must follow the existing course-edit pattern (`patchCourse` → direct state mutation), not the misleading `saveAutomation` flow which only touches `lastUpdated` (`Automations.tsx:399-410`).
- The `Dropdown` component supports descriptions on options (`Dropdown.tsx:8, 121`) — useful if we later want to annotate cohort dates, etc., but not needed for v1.
- `var(--lesson-quiz)` is already a known token (used at `Automations.tsx:855` for the "This month" stat icon).
- Date format in mock data is mixed: `lastUpdated` is human-readable (`'Sep 30, 2024'`), but `triggeredAt` is ISO (`'2026-04-07'`). New mock automations should match `'Mmm DD, YYYY'` for `lastUpdated`.
- Existing duplicate preservation already works for `courses` — line 540-543 deep-copies them with new IDs. Trigger/filters are plain objects with no IDs, so a shallow copy via spread is fine.

## What We're NOT Doing

- **No re-trigger dedup.** Always re-enrol on every transition, even if the user is already enrolled in the course. Revisit later.
- **No "from" value picker.** The trigger fires when the attribute *becomes* the target value, regardless of prior state. (Loose semantics, locked in with user.)
- **No multi-attribute change tracking.** One automation tracks exactly one attribute.
- **No new DS components.** All controls reuse the existing `Dropdown` (per memory: check Figma library / DS first; ask Bruno if a gap appears during implementation).
- **No backend / event infrastructure.** This is a prototype — mock data is the source of truth. We're not modelling how the change events would actually flow in production.
- **No trigger-type switcher inside the modal.** The trigger kind is locked at creation time based on which template card was clicked. (Per user: *"add a new automation type, like Attribute change"* as a template, not a step zero.)
- **No edits to the templates' second card.** The blue "Existing Employee Automation" card is left as-is (no `onClick` wired up — pre-existing state).
- **No changes to the Activity tab schema.** `TriggerRow` already records by `automationId`; attribute-change automations show up there naturally once they're in the automations list.

## Implementation Approach

Four phases, each landing in a buildable state:

1. **Foundation** — types, taxonomy constants, mock data, save/duplicate plumbing. After this phase the existing UI continues to work; new fields are present but unused.
2. **Trigger section UI** — branch the modal's trigger section on `trigger.kind`. After this phase, attribute-change automations render correctly in the modal (visible only by editing one of the new mock entries).
3. **Templates entry** — add the third template card. After this phase, admins can create new attribute-change automations from the Manage tab.
4. **Filters wiring** — replace the four stub dropdowns with real, persisted filters drawn from the taxonomy; conditionally hide the watched-attribute filter.

Phases are sequential because each builds on the previous: phase 2 requires the model from phase 1, phase 3 requires the rendering from phase 2, phase 4 doesn't strictly require attribute-change but is most testable alongside it.

---

## Phase 1: Foundation — types, taxonomy, mock data, save/duplicate plumbing

### Overview
Introduce the data model and the static taxonomy that drives both the trigger pickers and the filter dropdowns. Wire up the save and duplicate flows to round-trip the new fields. The existing registration automations get a `trigger: { kind: 'user-registered' }` and an empty `filters` object backfilled into mock data.

### Changes Required

#### 1. Types and taxonomy
**File**: `src/pages/automations/Automations.tsx`
**Changes**: Add `TrackedAttribute`, `AutomationTrigger`, `AutomationFilters` types. Add taxonomy constants. Extend `AutomationRow`.

```ts
// Add near the existing exported types (around line 32-60)

export type TrackedAttribute = 'role' | 'cohort' | 'region'

export type AutomationTrigger =
  | { kind: 'user-registered' }
  | { kind: 'attribute-changed'; attribute: TrackedAttribute; toValue: string }

export interface AutomationFilters {
  role?: string       // value from ROLE_VALUES, or undefined = "All roles"
  cohort?: string     // value from COHORT_VALUES, or undefined = "All cohorts"
  region?: string     // value from REGION_VALUES, or undefined = "All regions"
  joinDate?: 'none'   // placeholder; only "not required" exists today
}

export interface AutomationRow {
  id: string
  name: string
  lastUpdated: string
  active: boolean
  trigger: AutomationTrigger        // NEW
  filters: AutomationFilters        // NEW
  courses: AutomationCourse[]
}

// Taxonomy — used by both the trigger "To" picker and the filter dropdowns.
// Kept inline in this file because the prototype has no shared constants module.

export const ROLE_VALUES = [
  { value: 'employee',       label: 'Employee' },
  { value: 'team-lead',      label: 'Team Lead' },
  { value: 'manager',        label: 'Manager' },
  { value: 'senior-manager', label: 'Senior Manager' },
  { value: 'director',       label: 'Director' },
] as const

export const COHORT_VALUES = [
  { value: 'q4-2025', label: 'Q4 2025' },
  { value: 'q1-2026', label: 'Q1 2026' },
  { value: 'q2-2026', label: 'Q2 2026' },
  { value: 'q3-2026', label: 'Q3 2026' },
  { value: 'q4-2026', label: 'Q4 2026' },
] as const

export const REGION_VALUES = [
  { value: 'europe',    label: 'Europe' },
  { value: 'americas',  label: 'Americas' },
  { value: 'apac',      label: 'APAC' },
  { value: 'mea',       label: 'Middle East & Africa' },
] as const

export const ATTRIBUTE_LABELS: Record<TrackedAttribute, string> = {
  role:   'Role',
  cohort: 'Cohort',
  region: 'Region',
}

export function getAttributeValues(attribute: TrackedAttribute): readonly { value: string; label: string }[] {
  switch (attribute) {
    case 'role':   return ROLE_VALUES
    case 'cohort': return COHORT_VALUES
    case 'region': return REGION_VALUES
  }
}

export function getAttributeValueLabel(attribute: TrackedAttribute, value: string): string {
  return getAttributeValues(attribute).find((v) => v.value === value)?.label ?? value
}
```

#### 2. Backfill existing mock data
**File**: `src/pages/automations/Automations.tsx`
**Changes**: Add `trigger: { kind: 'user-registered' }` and `filters: {}` to all 14 entries in `mockAutomations` (lines 101-271).

Mechanical edit — every existing object gets two new fields. Example:

```ts
{
  id: '1',
  name: 'New Hire Compliance Onboarding',
  lastUpdated: 'Sep 30, 2024',
  active: true,
  trigger: { kind: 'user-registered' },   // NEW
  filters: {},                            // NEW
  courses: mkCourses('1', [ /* … */ ]),
},
```

#### 3. Add example attribute-change automations to mock data
**File**: `src/pages/automations/Automations.tsx`
**Changes**: Append three new entries to `mockAutomations` (after the existing 14, IDs `15`, `16`, `17`) showcasing different attributes.

```ts
{
  id: '15',
  name: 'Manager Promotion — Leadership Path',
  lastUpdated: 'May 02, 2026',
  active: true,
  trigger: { kind: 'attribute-changed', attribute: 'role', toValue: 'manager' },
  filters: { region: 'europe' },
  courses: mkCourses('15', [
    ['Leadership Foundations', '0 days after registration', 14],
    ['Coaching Fundamentals', '3 days after previous course', 14],
    ['Giving Effective Feedback', '3 days after previous course'],
  ]),
},
{
  id: '16',
  name: 'Director Onboarding',
  lastUpdated: 'Apr 28, 2026',
  active: true,
  trigger: { kind: 'attribute-changed', attribute: 'role', toValue: 'director' },
  filters: {},
  courses: mkCourses('16', [
    ['Strategic Decision Making', '0 days after registration'],
    ['Executive Communication', '2 days after previous course'],
    ['Financial Acumen for Directors', '3 days after previous course', 14],
  ]),
},
{
  id: '17',
  name: 'Americas Region — Compliance Welcome',
  lastUpdated: 'Apr 22, 2026',
  active: true,
  trigger: { kind: 'attribute-changed', attribute: 'region', toValue: 'americas' },
  filters: { cohort: 'q2-2026' },
  courses: mkCourses('17', [
    ['US Workplace Compliance Overview', '0 days after registration', 14],
    ['Federal Anti-Harassment Standards', '2 days after previous course', 14, 12],
  ]),
},
```

#### 4. Duplicate flow preserves trigger and filters
**File**: `src/pages/automations/Automations.tsx`
**Changes**: Update `duplicateAutomation` (lines 530-547) to copy `trigger` and `filters`.

```ts
function duplicateAutomation(id: string) {
  const automation = automations.find((a) => a.id === id)
  if (!automation) return
  const tempId = `duplicate-${automation.id}-${Date.now()}`
  openDetails(
    {
      id: tempId,
      name: `Copy of ${automation.name}`,
      lastUpdated: new Date().toISOString().slice(0, 10),
      active: false,
      trigger: { ...automation.trigger },         // NEW — shallow copy is fine, no nested IDs
      filters: { ...automation.filters },         // NEW
      courses: automation.courses.map((c, i) => ({
        ...c,
        id: `${tempId}-c${i + 1}`,
      })),
    },
    'duplicate',
  )
}
```

#### 5. New automation creation paths set initial trigger
**File**: `src/pages/automations/Automations.tsx`
**Changes**: The existing "New Employee Automation" template button (lines 671-682) creates an automation with no `trigger` / `filters` today. Add them.

```ts
onClick={() =>
  openDetails(
    {
      id: 'template-new-employee',
      name: 'Copy of New Employee Onboarding',
      lastUpdated: new Date().toISOString().slice(0, 10),
      active: false,
      trigger: { kind: 'user-registered' },       // NEW
      filters: {},                                // NEW
      courses: [],
    },
    'new',
  )
}
```

#### 6. Trigger and filter mutation handlers
**File**: `src/pages/automations/Automations.tsx`
**Changes**: Add two new handler functions following the pattern of `patchCourse` (lines 549-562). Pass them down to the modal.

```ts
function patchTrigger(automationId: string, trigger: AutomationTrigger) {
  const apply = (a: AutomationRow): AutomationRow => ({ ...a, trigger })
  setAutomations((rows) => rows.map((r) => (r.id === automationId ? apply(r) : r)))
  setDetailsAutomation((current) =>
    current && current.id === automationId ? apply(current) : current,
  )
}

function patchFilters(automationId: string, filters: AutomationFilters) {
  const apply = (a: AutomationRow): AutomationRow => ({ ...a, filters })
  setAutomations((rows) => rows.map((r) => (r.id === automationId ? apply(r) : r)))
  setDetailsAutomation((current) =>
    current && current.id === automationId ? apply(current) : current,
  )
}
```

Wire into the `<AutomationDetailsModal>` props at lines 1221-1229:

```tsx
<AutomationDetailsModal
  automation={detailsAutomation}
  mode={detailsMode}
  onClose={closeDetails}
  onSave={saveAutomation}
  onTriggerChange={patchTrigger}            // NEW
  onFiltersChange={patchFilters}            // NEW
  onCourseChange={patchCourse}
  onCourseRemove={removeCourse}
  onCoursesReorder={reorderCourses}
/>
```

#### 7. Modal prop types extended
**File**: `src/pages/automations/AutomationDetailsModal.tsx`
**Changes**: Extend the `AutomationDetailsModalProps` interface (lines 54-62).

```ts
import type {
  AutomationCourse,
  AutomationFilters,         // NEW
  AutomationRow,
  AutomationTrigger,         // NEW
  DueDateConfig,
  EnrollmentType,
  RecurrenceConfig,
} from './Automations'

interface AutomationDetailsModalProps {
  automation: AutomationRow | null
  mode?: AutomationDetailsMode
  onClose: () => void
  onSave?: (automation: AutomationRow) => void
  onTriggerChange?: (automationId: string, trigger: AutomationTrigger) => void   // NEW
  onFiltersChange?: (automationId: string, filters: AutomationFilters) => void   // NEW
  onCourseChange?: (automationId: string, courseId: string, patch: Partial<AutomationCourse>) => void
  onCourseRemove?: (automationId: string, courseId: string) => void
  onCoursesReorder?: (automationId: string, fromIndex: number, toIndex: number) => void
}
```

Destructure the new props in the function signature; they're not used yet in this phase but the type contract is in place.

### Success Criteria

#### Automated Verification
- [ ] Type check + build passes: `npm run build`
- [ ] No TS errors anywhere in `src/pages/automations/**`
- [ ] All 14 existing mock automations have `trigger: { kind: 'user-registered' }` and `filters: {}`
- [ ] Three new mock automations exist with `trigger.kind === 'attribute-changed'`

#### Manual Verification
- [ ] Dev server still loads `/automations` without runtime errors
- [ ] Existing 14 automations render in the Manage tab list (no visual regression)
- [ ] Clicking "Edit automation" on any existing row still opens the modal correctly
- [ ] Clicking "Duplicate" on any row creates a copy with all fields preserved
- [ ] The three new mock automations appear in the list with their names

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human before proceeding to Phase 2.

---

## Phase 2: Trigger section UI — branch on `trigger.kind`

### Overview
Replace the hardcoded *"When a user registers on 5Mins.ai"* line with a render that branches on `automation.trigger.kind`. For `'attribute-changed'`, show two `Dropdown`s: an Attribute picker (Role / Cohort / Region) and a Value picker (whose options change based on the selected attribute).

The existing four filter dropdowns stay in place untouched in this phase — they're handled in phase 4.

### Changes Required

#### 1. Conditional trigger lead in the modal
**File**: `src/pages/automations/AutomationDetailsModal.tsx`
**Changes**: Replace the hardcoded paragraph at line 141 with a branch. The four condition rows below it stay as-is for now.

```tsx
import {
  ATTRIBUTE_LABELS,
  getAttributeValues,
  type AutomationTrigger,
  type TrackedAttribute,
  // …existing imports
} from './Automations'

// Inside the component, replace the existing line 141:
// <p className="automation-details-card-lead">When a user registers on 5Mins.ai</p>

{automation.trigger.kind === 'user-registered' && (
  <p className="automation-details-card-lead">When a user registers on 5Mins.ai</p>
)}

{automation.trigger.kind === 'attribute-changed' && (
  <div className="automation-details-trigger-attribute">
    <span className="automation-details-card-lead">When a user's</span>
    <Dropdown
      size="md"
      options={[
        { value: 'role',   label: 'Role'   },
        { value: 'cohort', label: 'Cohort' },
        { value: 'region', label: 'Region' },
      ]}
      value={automation.trigger.attribute}
      onChange={(next) => {
        const attribute = next as TrackedAttribute
        // Reset toValue when attribute changes — old value belongs to a different taxonomy.
        const firstValue = getAttributeValues(attribute)[0]?.value ?? ''
        onTriggerChange?.(automation.id, {
          kind: 'attribute-changed',
          attribute,
          toValue: firstValue,
        })
      }}
      className="automation-details-condition-dropdown"
    />
    <span className="automation-details-card-lead">changes to</span>
    <Dropdown
      size="md"
      options={getAttributeValues(automation.trigger.attribute).map((v) => ({
        value: v.value,
        label: v.label,
      }))}
      value={automation.trigger.toValue}
      onChange={(next) =>
        onTriggerChange?.(automation.id, {
          kind: 'attribute-changed',
          attribute: (automation.trigger as Extract<AutomationTrigger, { kind: 'attribute-changed' }>).attribute,
          toValue: next,
        })
      }
      className="automation-details-condition-dropdown"
    />
  </div>
)}
```

(TypeScript narrowing inside callbacks is awkward because the closure captures the union — the `Extract<…>` cast is the cleanest way. Alternative: hoist `const trigger = automation.trigger` into a local before rendering and narrow once.)

#### 2. Section description copy
**File**: `src/pages/automations/AutomationDetailsModal.tsx`
**Changes**: The current description (line 137) reads *"Set conditions for automatic course enrolment"*. That still works for both kinds, so leave it.

#### 3. Layout CSS for the inline trigger row
**File**: `src/pages/automations/AutomationDetailsModal.css`
**Changes**: Add a flex layout for `.automation-details-trigger-attribute` so the lead text and two dropdowns sit on a single row, wrapping cleanly on narrow screens.

```css
.automation-details-trigger-attribute {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Match the spacing of the existing condition rows below */
.automation-details-trigger-attribute + .automation-details-condition {
  margin-top: 12px;
}
```

(Verify the exact gap value against the existing `.automation-details-condition` rules — match whatever's there.)

### Success Criteria

#### Automated Verification
- [ ] `npm run build` passes
- [ ] No new TS errors

#### Manual Verification
- [ ] Editing any of the 14 registration automations still shows *"When a user registers on 5Mins.ai"*
- [ ] Editing one of the three new attribute-change automations shows *"When a user's [Attribute] changes to [Value]"* with both dropdowns
- [ ] Changing the Attribute dropdown resets the Value dropdown to the first option of the new taxonomy and persists
- [ ] Changing the Value dropdown persists across modal close → reopen
- [ ] Closing and reopening the modal does not revert any selection

**Implementation Note**: Pause for manual confirmation before Phase 3.

---

## Phase 3: Templates entry — add the "Attribute change" card

### Overview
Add a third card to the templates strip on the Manage tab, using the `--lesson-quiz` accent colour (per Bruno's instruction). Clicking it opens the details modal in `'new'` mode with `trigger.kind === 'attribute-changed'` and a sensible default attribute (Role) and toValue (first role).

### Changes Required

#### 1. New template card in the Manage tab
**File**: `src/pages/automations/Automations.tsx`
**Changes**: Add a third `<button>` inside `.automations-templates` (lines 667-710), placed *after* the existing two cards.

```tsx
import {
  // existing imports
  Refresh,
} from 'iconsax-react'

// Inside .automations-templates, after the blue card:

<button
  type="button"
  className="automations-template automations-template--quiz"
  onClick={() =>
    openDetails(
      {
        id: 'template-attribute-change',
        name: 'Untitled attribute change automation',
        lastUpdated: new Date().toISOString().slice(0, 10),
        active: false,
        trigger: { kind: 'attribute-changed', attribute: 'role', toValue: ROLE_VALUES[0].value },
        filters: {},
        courses: [],
      },
      'new',
    )
  }
>
  <span className="automations-template-icon">
    <Refresh size={48} color="var(--lesson-quiz)" variant="Linear" />
  </span>
  <span className="automations-template-body">
    <span className="automations-template-title">Attribute Change Automation</span>
    <span className="automations-template-desc">
      Enrol users in courses when their role, cohort, or region changes.
      <br />
      Triggers every time the attribute changes to the target value.
    </span>
  </span>
</button>
```

**Icon choice note**: `Refresh` from `iconsax-react` reads as "change" semantically. Alternates worth checking in Figma during implementation: `ArrowSwapHorizontal`, `Convertshape`, `RecordCircle`, `UserEdit`. If Figma already has a dedicated illustration for this template, use that and ignore the iconsax suggestion (per memory: Figma wins over DS docs when they conflict).

**Copy**: First-pass copy above; final copy should come from product/design (mirroring how the existing two cards are phrased).

#### 2. Template card variant CSS
**File**: `src/pages/automations/Automations.css`
**Changes**: Add a `.automations-template--quiz` variant alongside the existing `--purple` and `--blue` variants. Match their structure exactly — only the accent colour changes.

```css
/* Find the existing .automations-template--purple and .automations-template--blue rules
   and mirror them under --quiz. Use var(--lesson-quiz) wherever the others use their
   accent colour (border-left, icon background tint, hover treatment, etc.). */

.automations-template--quiz {
  /* same layout/border/spacing as the other two */
  border-left-color: var(--lesson-quiz);
}
.automations-template--quiz:hover {
  /* match the hover treatment of the other two, swapped to the quiz colour */
}
```

(Exact rules depend on what's already in `Automations.css` for the other two variants — mirror them rather than reinvent.)

### Success Criteria

#### Automated Verification
- [ ] `npm run build` passes
- [ ] No new TS errors

#### Manual Verification
- [ ] Three template cards visible on the Manage tab — purple, blue, and a new one in the lesson-quiz colour
- [ ] Clicking the new card opens the details modal with the trigger reading *"When a user's Role changes to Employee"* (or whichever first role you chose)
- [ ] Saving creates a new automation that appears at the top of the list
- [ ] Newly created automation can be edited and duplicated, with trigger preserved
- [ ] The existing purple template still works unchanged
- [ ] The new card matches the visual style of the other two (border, padding, hover, icon size) — only the colour differs

**Implementation Note**: Pause for manual confirmation before Phase 4.

---

## Phase 4: Filters wiring — connect dropdowns, hide watched-attribute

### Overview
Replace the four hardcoded filter dropdowns (`AutomationDetailsModal.tsx:142-177`) with real ones that read from / write to `automation.filters`, using the same taxonomy as the trigger picker. On attribute-change automations, hide the dropdown for the watched attribute (e.g. when `trigger.attribute === 'role'`, hide the *"With [role]"* row).

### Changes Required

#### 1. Replace stub filter dropdowns
**File**: `src/pages/automations/AutomationDetailsModal.tsx`
**Changes**: Rebuild the four condition rows (lines 142-177).

```tsx
import {
  COHORT_VALUES,
  REGION_VALUES,
  ROLE_VALUES,
  // …existing imports
} from './Automations'

// Helper: is this filter for the watched attribute?
const watchedAttribute =
  automation.trigger.kind === 'attribute-changed' ? automation.trigger.attribute : null

// Replace the four .automation-details-condition rows:

{watchedAttribute !== 'role' && (
  <div className="automation-details-condition">
    <span className="automation-details-condition-label">With</span>
    <Dropdown
      size="md"
      options={[
        { value: 'all', label: 'All roles' },
        ...ROLE_VALUES.map((v) => ({ value: v.value, label: v.label })),
      ]}
      value={automation.filters.role ?? 'all'}
      onChange={(next) =>
        onFiltersChange?.(automation.id, {
          ...automation.filters,
          role: next === 'all' ? undefined : next,
        })
      }
      className="automation-details-condition-dropdown"
    />
  </div>
)}

{watchedAttribute !== 'cohort' && (
  <div className="automation-details-condition">
    <span className="automation-details-condition-label">
      {watchedAttribute === 'role' ? 'With' : 'And with'}
    </span>
    <Dropdown
      size="md"
      options={[
        { value: 'all', label: 'All cohorts' },
        ...COHORT_VALUES.map((v) => ({ value: v.value, label: v.label })),
      ]}
      value={automation.filters.cohort ?? 'all'}
      onChange={(next) =>
        onFiltersChange?.(automation.id, {
          ...automation.filters,
          cohort: next === 'all' ? undefined : next,
        })
      }
      className="automation-details-condition-dropdown"
    />
  </div>
)}

{watchedAttribute !== 'region' && (
  <div className="automation-details-condition">
    <span className="automation-details-condition-label">
      {watchedAttribute === null || (watchedAttribute !== 'role' && watchedAttribute !== 'cohort')
        ? 'And from'
        : 'From'}
    </span>
    <Dropdown
      size="md"
      options={[
        { value: 'all', label: 'All regions' },
        ...REGION_VALUES.map((v) => ({ value: v.value, label: v.label })),
      ]}
      value={automation.filters.region ?? 'all'}
      onChange={(next) =>
        onFiltersChange?.(automation.id, {
          ...automation.filters,
          region: next === 'all' ? undefined : next,
        })
      }
      className="automation-details-condition-dropdown"
    />
  </div>
)}

<div className="automation-details-condition">
  <span className="automation-details-condition-label">And join date is</span>
  <Dropdown
    size="md"
    options={[{ value: 'none', label: 'not required' }]}
    value={automation.filters.joinDate ?? 'none'}
    onChange={() => { /* only one option for now */ }}
    className="automation-details-condition-dropdown"
  />
</div>
```

**Note on the conjunction labels** (`With` / `And with` / `And from` / `And join date is`): the prefix has to flip from "With" to "And with" depending on whether the row above it is rendered or not. Cleaner alternative — drop the prefixes inside the JSX and compute them once:

```tsx
const visibleFilters: Array<'role' | 'cohort' | 'region' | 'joinDate'> = [
  ...(watchedAttribute !== 'role'   ? ['role']   as const : []),
  ...(watchedAttribute !== 'cohort' ? ['cohort'] as const : []),
  ...(watchedAttribute !== 'region' ? ['region'] as const : []),
  'joinDate',
]
const labelFor = (kind: typeof visibleFilters[number], index: number) => {
  const root =
    kind === 'role'     ? 'With'
    : kind === 'cohort' ? 'with'
    : kind === 'region' ? 'from'
    :                     'join date is'
  return index === 0 ? capitalize(root) : `And ${root.toLowerCase()}`
}
```

Pick whichever pattern is more readable when implementing — the goal is that the prose stays grammatical regardless of which rows are hidden. (E.g. when Role is the watched attribute, the visible rows should read *"With [cohort] / And from [region] / And join date is [...]"*.)

#### 2. Save flow — make sure filters persist across edit/save cycle
**File**: `src/pages/automations/Automations.tsx`
**Changes**: Verify that the `patchFilters` pattern from Phase 1 actually persists through edit. The existing `saveAutomation` (lines 399-410) only updates `lastUpdated` in edit mode — the `patchFilters` handler is what writes the actual filter changes back, mirroring the course-edit pattern. No code change here, but confirm during testing.

### Success Criteria

#### Automated Verification
- [ ] `npm run build` passes
- [ ] No new TS errors

#### Manual Verification
- [ ] On a registration automation, all four filter dropdowns are visible and selectable
- [ ] Picking a non-default value (e.g. *"Manager"* in the Role filter) persists across modal close → reopen
- [ ] Picking a non-default filter and then duplicating preserves it on the duplicate
- [ ] On an attribute-change automation watching Role: the Role filter row is hidden; Cohort / Region / Join date rows visible
- [ ] On an attribute-change automation watching Cohort: the Cohort row is hidden; Role / Region / Join date rows visible
- [ ] On an attribute-change automation watching Region: the Region row is hidden; Role / Cohort / Join date rows visible
- [ ] When the watched-attribute filter is hidden, the conjunction prose still reads grammatically (no orphan *"And"* at the start)
- [ ] Switching the watched attribute (in the trigger picker) immediately updates which filter row is hidden
- [ ] One of the new mock automations (`id: '15'`, with `filters.region: 'europe'`) opens the modal with *"And from Europe"* selected in the Region filter

**Implementation Note**: Pause for manual confirmation. After Phase 4 the feature is complete.

---

## Testing Strategy

### Unit Tests
N/A — this prototype has no test suite (`package.json` has no test script).

### Integration / Manual End-to-End Scenarios
Walk these in the dev server (background task `bi4jvcq6j`, http://localhost:5173/automations):

1. **Create a fresh attribute-change automation**:
   - Click the new "Attribute Change Automation" template card
   - Configure: Role → Senior Manager
   - Set filters: Region = Europe, Cohort = Q2 2026
   - Add 2 courses with mixed enrollment delays
   - Save → confirm it appears in the list with `lastUpdated: 'Just now'`
2. **Edit it**:
   - Reopen the new row
   - Change attribute to Cohort, then change toValue to Q3 2026
   - Confirm the Cohort filter row is now hidden; the Role filter row reappears
3. **Duplicate it**:
   - From the row menu, click Duplicate
   - Confirm the modal opens in 'duplicate' mode with all trigger + filter + courses preserved
   - Confirm save creates a new row with name "Copy of …"
4. **Activity tab integration**:
   - Switch to Activity tab
   - Confirm the new automation appears in the "All Automations" filter dropdown
   - Confirm there are no rendering errors when the filter is set to one of the new attribute-change automations (it'll show 0 rows — none of the mock triggers reference these new IDs, which is fine)
5. **Regression — registration automations untouched**:
   - Edit one of the original 14 automations
   - Confirm the trigger still reads *"When a user registers on 5Mins.ai"* exactly
   - Confirm all four filter rows render
   - Confirm no behaviour change

### Edge Cases to Verify Manually
- Switching attribute in the trigger picker resets `toValue` to the first option of the new taxonomy (so the Value dropdown never shows a stale value from a different attribute)
- The "All [attribute]" option deselects the filter (writes `undefined` into `automation.filters`)
- An attribute-change automation with `filters: {}` shows 3 visible filter dropdowns (excluding the watched one) all set to "All"

## Performance Considerations
Not relevant — prototype with synchronous in-memory state and ≤ 20 mock automations. No measurable cost.

## Migration Notes
Not relevant — no real data, no API. Existing mock automations get backfilled in source.

## Open Items Surfaced (resolved before writing this plan)

- ✅ **Mock taxonomy** — defined as `ROLE_VALUES`, `COHORT_VALUES`, `REGION_VALUES` constants in `Automations.tsx`. Same source feeds the trigger picker and the filter dropdowns.
- ✅ **Trigger type picker placement** — entry-point template card only. No step-zero in the modal.
- ✅ **Duplicate flow** — extended in Phase 1 to copy `trigger` and `filters`.
- ✅ **Same-attribute filter** — hidden on attribute-change automations.
- ✅ **Re-trigger semantics** — always re-enrol; revisit later (not in scope).

## References

- Existing related work:
  - `agents/output/2026-04-07-DES-284-automations-improvements.md` (DES-284 — broader automations improvements)
  - `agents/output/2026-04-09-DES-293-force-trigger-automations.md` (DES-293 — force trigger PRD; the action-side counterpart to "what fires the enrolment")
- Key files:
  - `src/pages/automations/Automations.tsx:32-60` — types
  - `src/pages/automations/Automations.tsx:101-271` — mock automations
  - `src/pages/automations/Automations.tsx:530-547` — duplicate flow
  - `src/pages/automations/Automations.tsx:667-710` — templates strip
  - `src/pages/automations/AutomationDetailsModal.tsx:133-179` — trigger + filters section
  - `src/components/Dropdown/Dropdown.tsx` — reusable Dropdown API
- Design system:
  - `5mins-claude-code-design-system/docs/design-system/dropdown.md`
  - `var(--lesson-quiz)` token (used at `Automations.tsx:855`)
