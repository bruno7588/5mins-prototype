---
name: 5mins-chips-and-tabs
description: >
  Chip / filter-tag and Tabs components for 5Mins.ai. Use when implementing
  chips, tags, filter pills, selection chips, dismissible tags, tab bars,
  underlined tab navigation, page section tabs, or any small pill-shaped
  interactive label or horizontal tab switcher in the admin or learner UI.
  Covers all chip variants (default, hover, selected, disabled, with optional
  left/right icons) and all tab variants (default, hover, selected, with
  optional counter pill), plus design tokens and React TypeScript usage.
  Trigger this skill whenever someone needs a chip, filter chip, tag pill,
  selection pill, dismissible label, tab, tab bar, or section switcher in the
  5Mins.ai platform, even if they just say "add a chip", "filter tag", or
  "switch this to tabs".
---

# 5Mins.ai - Chips & Tabs Components

This file documents two related navigation/selection components used across
the 5Mins.ai admin and learner UI:

1. **Chips** - pill-shaped labels for filters, tags, and dismissible selections
2. **Tabs** - underlined horizontal section switcher with optional counter pills

Both components share the dark admin theme and the same Poppins type scale.

---

# Part 1: Chips Component

Figma source: `Library` › node `11100-2179`
Screenshot: pill-shaped labels, yellow selected state.

## Visual Overview

```
[ Content ]           ← Enabled (border only)
[ Content  x ]        ← Enabled + iconRight (close)
[ 👤 Content ]        ← Enabled + iconLeft (user)
[ Content ]           ← Hover (slightly lit background + brighter border)
[ Content ]           ← Selected (yellow fill, bold dark text)
[ Content ]           ← Disabled (muted border + muted text)
```

## Design Tokens

All values use 5Mins.ai design tokens.

| CSS Variable               | Value      | Usage                                  |
|----------------------------|------------|----------------------------------------|
| `--border`                 | `#383d4c`  | Default & disabled border              |
| `--border-hover`           | `#9ea4b3`  | Hover state border                     |
| `--page-background-hover`  | `#2d313d`  | Hover state background fill            |
| `--selected`               | `#ffbb38`  | Selected background (yellow/amber)     |
| `--text-secondary`         | `#bfc2cc`  | Default & hover label color            |
| `--text-disabled`          | `#656b7c`  | Disabled label & icon color            |
| `--neutral-800`            | `#20222a`  | Selected label color (dark on yellow)  |

### Spacing tokens

| Token  | px  | Used for                                         |
|--------|-----|--------------------------------------------------|
| `--xs` | 4   | Gap when no icons or iconLeft present            |
| `--s`  | 8   | Gap when iconRight present                       |
| `--sm` | 12  | Horizontal padding on the icon side of chip      |
| `--m`  | 16  | Horizontal padding on the text side of chip      |

- **Vertical padding:** `8px` (both sides)
- **Border radius:** `24px` (fully rounded pill)

### Typography

| Variant          | Font     | Weight  | Size | Line height |
|------------------|----------|---------|------|-------------|
| Default / hover  | Poppins  | 400     | 14px | 1.5         |
| Selected         | Poppins  | 700     | 14px | 1.5         |
| Disabled         | Poppins  | 400     | 14px | 1.5         |

## Props

| Prop        | Type                          | Default     | Description                          |
|-------------|-------------------------------|-------------|--------------------------------------|
| `label`     | `string`                      | `"Content"` | Text displayed inside chip           |
| `selected`  | `boolean`                     | `false`     | Yellow fill, bold dark text          |
| `disabled`  | `boolean`                     | `false`     | Muted border + text, non-interactive |
| `iconLeft`  | `boolean`                     | `false`     | Show 16×16 user icon before label    |
| `iconRight` | `boolean`                     | `false`     | Show 16×16 close (×) icon after label|
| `state`     | `"Enabled" \| "Hover"`        | `"Enabled"` | Visual state (Hover is usually CSS)  |
| `onClick`   | `() => void`                  | -           | Click handler                        |
| `onDismiss` | `() => void`                  | -           | Close-icon click (only with iconRight)|
| `className` | `string`                      | -           | Extra CSS classes                    |

> **Note:** `state` is typically driven by CSS `:hover` in prototypes. Only use the prop for forced-hover stories/tests.

## State × Appearance Matrix

| `disabled` | `selected` | `state`    | Border         | Background             | Text color        | Text weight |
|------------|------------|------------|----------------|------------------------|-------------------|-------------|
| false      | false      | Enabled    | `--border`     | transparent            | `--text-secondary`| 400         |
| false      | false      | Hover      | `--border-hover`| `--page-background-hover`| `--text-secondary`| 400         |
| false      | true       | Enabled    | none           | `--selected`           | `--neutral-800`   | 700         |
| true       | false      | n/a        | `--border`     | transparent            | `--text-disabled` | 400         |

**Padding rules:**
- `iconLeft` only: `pl-[12px] pr-[16px]`, gap `4px`
- `iconRight` only: `pl-[16px] pr-[12px]`, gap `8px`
- No icons: `px-[16px]`, gap `0`

## React TypeScript Implementation

```tsx
import React from 'react';

// Iconsax icons - use these exact imports
import { CloseCircle, User } from 'iconsax-react';

type ChipState = 'Enabled' | 'Hover';

interface ChipProps {
  label?: string;
  selected?: boolean;
  disabled?: boolean;
  iconLeft?: boolean;
  iconRight?: boolean;
  state?: ChipState;
  onClick?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function Chip({
  label = 'Content',
  selected = false,
  disabled = false,
  iconLeft = false,
  iconRight = false,
  state = 'Enabled',
  onClick,
  onDismiss,
  className = '',
}: ChipProps) {
  const isHover = state === 'Hover';

  // Base classes
  const base = 'inline-flex items-center justify-center rounded-[24px] py-[8px] cursor-pointer select-none transition-colors';

  // Background / border
  const visual = disabled
    ? 'border border-[#383d4c]'
    : selected
    ? 'bg-[#ffbb38]'
    : isHover
    ? 'border border-[#9ea4b3] bg-[#2d313d]'
    : 'border border-[#383d4c] hover:border-[#9ea4b3] hover:bg-[#2d313d]';

  // Padding
  const padding = iconLeft && !iconRight
    ? 'pl-[12px] pr-[16px] gap-[4px]'
    : iconRight && !iconLeft
    ? 'pl-[16px] pr-[12px] gap-[8px]'
    : 'px-[16px]';

  // Text style
  const textStyle = disabled
    ? 'text-[14px] font-normal text-[#656b7c] leading-[1.5] font-[Poppins]'
    : selected
    ? 'text-[14px] font-bold text-[#20222a] leading-[1.5] font-[Poppins]'
    : 'text-[14px] font-normal text-[#bfc2cc] leading-[1.5] font-[Poppins]';

  // Icon color
  const iconColor = disabled ? '#656b7c' : selected ? '#20222a' : '#bfc2cc';

  return (
    <div
      className={`${base} ${visual} ${padding} ${className}`}
      onClick={disabled ? undefined : onClick}
      role="button"
      aria-disabled={disabled}
      aria-pressed={selected}
    >
      {iconLeft && (
        <User size={16} color={iconColor} variant="Linear" />
      )}
      <span className={textStyle}>{label}</span>
      {iconRight && (
        <button
          className="flex items-center justify-center p-0 bg-transparent border-none cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onDismiss?.(); }}
          aria-label="Remove"
          disabled={disabled}
        >
          <CloseCircle size={16} color={iconColor} variant="Linear" />
        </button>
      )}
    </div>
  );
}
```

### CSS variable approach (if token vars are available in the project)

```css
/* In your global CSS or component stylesheet */
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  padding: 8px 16px;
  border: 1px solid var(--border, #383d4c);
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary, #bfc2cc);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}
.chip:hover {
  border-color: var(--border-hover, #9ea4b3);
  background-color: var(--page-background-hover, #2d313d);
}
.chip--selected {
  border: none;
  background-color: var(--selected, #ffbb38);
  color: var(--neutral-800, #20222a);
  font-weight: 700;
}
.chip--disabled {
  border-color: var(--border, #383d4c);
  color: var(--text-disabled, #656b7c);
  cursor: not-allowed;
  pointer-events: none;
}
.chip--icon-left  { padding-left: 12px; gap: 4px; }
.chip--icon-right { padding-right: 12px; gap: 8px; }
```

## Usage Examples

```tsx
// Filter chip - default
<Chip label="Finance" />

// Filter chip - selected (user clicked it)
<Chip label="Finance" selected onClick={() => toggleFilter('finance')} />

// Dismissible tag
<Chip label="Ricardo" iconRight onDismiss={() => removeTag('ricardo')} />

// With left user icon
<Chip label="Admin" iconLeft />

// Disabled
<Chip label="Locked" disabled />

// Group of filter chips
const filters = ['All', 'Compliance', 'HR', 'Finance'];
filters.map(f => (
  <Chip
    key={f}
    label={f}
    selected={activeFilter === f}
    onClick={() => setActiveFilter(f)}
  />
))
```

## Do's and Don'ts (Chips)

**Do:**
- Use `selected` + `onClick` to toggle filter state
- Use `iconRight` + `onDismiss` for dismissible chips (e.g. applied filters)
- Use `iconLeft` for chips that represent people/users
- Use `disabled` when the option is unavailable (not just unselected)
- Keep chip label short, 1 to 3 words max

**Don't:**
- Don't use both `iconLeft` and `iconRight` simultaneously (not in the design spec)
- Don't use chips for navigation, use tabs or buttons instead
- Don't hardcode hover styles inline; let CSS `:hover` handle it unless forcing a state in tests
- Don't change border-radius, `24px` is fixed for all chip sizes

---

# Part 2: Tabs Component

Figma source: `Library` › tab item node `11490-8863`, tab bar node `11490-8891`
Screenshot: row of text labels, the active one bolded with a yellow underline beneath it.

## Visual Overview

```
Tab Name   Tab Name   Tab Name   Tab Name   Tab Name
─────────                                              ← yellow indicator (selected)
  bold      medium     medium     medium     medium    ← typography
```

With counters:

```
Tab Name 0   Tab Name 0   Tab Name 0
──────────                                              ← yellow indicator on selected
```

States for a single tab item:

```
Tab Name        ← Selected (bold, white text, yellow underline 2px)
─────────
Tab Name 0      ← Selected + Counter (counter pill alongside label)
──────────
Tab Name        ← Enabled (medium, secondary grey text)
Tab Name 0      ← Enabled + Counter (counter text dimmer)
Tab Name        ← Hover (medium, brighter white text on hover)
Tab Name 0      ← Hover + Counter (counter text brightens too)
```

## Design Tokens

| CSS Variable          | Value                       | Usage                                       |
|-----------------------|-----------------------------|---------------------------------------------|
| `--text-primary`      | `#f9f9fa`                   | Selected label text, hover label text       |
| `--text-secondary`    | `#bfc2cc`                   | Default (enabled, not selected) label text  |
| `--text-tertiary`     | `#9ea4b3`                   | Counter text in default enabled state       |
| `--selected`          | `#ffbb38`                   | Yellow 2px indicator underline              |
| `--input-background`  | `rgba(69, 76, 94, 0.16)`    | Counter pill background                     |

### Spacing tokens

| Token  | px  | Used for                                                       |
|--------|-----|----------------------------------------------------------------|
| `--xs` | 4   | Gap between label and indicator (vertical); label↔counter gap  |
| `--m`  | 16  | Gap between tab items in the tab bar                           |

- **Indicator height:** `2px`
- **Indicator width:** matches the width of the label row (text + optional counter)
- **Counter padding:** `0 6px` horizontal
- **Counter border-radius:** `100px` (fully rounded pill)
- **Tab bar bottom border:** none in the component itself; if you need a divider beneath the whole bar, add a 1px `--border` line in the parent container

### Typography

| Variant                     | Font     | Weight  | Size | Line height |
|-----------------------------|----------|---------|------|-------------|
| Selected label              | Poppins  | 700     | 14px | 1.5         |
| Default / Hover label       | Poppins  | 500     | 14px | 1.5         |
| Counter (all states)        | Poppins  | 500     | 14px | 1.5         |

## Props

### `<Tabs>` (the container)

| Prop        | Type                        | Default     | Description                              |
|-------------|-----------------------------|-------------|------------------------------------------|
| `items`     | `TabItem[]`                 | required    | Array of tab items to render             |
| `activeKey` | `string`                    | required    | `key` of the currently selected tab      |
| `onChange`  | `(key: string) => void`     | required    | Called when user clicks a tab            |
| `className` | `string`                    | -           | Extra CSS classes on the bar             |

### `TabItem` shape

| Field      | Type        | Required | Description                                    |
|------------|-------------|----------|------------------------------------------------|
| `key`      | `string`    | yes      | Unique identifier, used for selection          |
| `label`    | `string`    | yes      | Visible tab label                              |
| `counter`  | `number`    | no       | If provided, shows a counter pill (e.g. `0`)   |

### `<TabItem>` (low-level, if used standalone)

| Prop        | Type                          | Default     | Description                                |
|-------------|-------------------------------|-------------|--------------------------------------------|
| `label`     | `string`                      | required    | Text displayed in the tab                  |
| `selected`  | `boolean`                     | `false`     | Bold white text, yellow underline visible  |
| `counter`   | `number \| undefined`         | `undefined` | If defined, renders counter pill next to label |
| `state`     | `"Enabled" \| "Hover"`        | `"Enabled"` | Visual state (Hover normally driven by CSS) |
| `onClick`   | `() => void`                  | -           | Click handler                              |
| `className` | `string`                      | -           | Extra CSS classes                          |

## State × Appearance Matrix

| `selected` | `state`  | Counter present | Label color         | Label weight | Counter text color   | Indicator |
|------------|----------|-----------------|---------------------|--------------|----------------------|-----------|
| true       | Enabled  | no              | `--text-primary`    | 700          | -                    | yes (2px) |
| true       | Enabled  | yes             | `--text-primary`    | 700          | `--text-secondary`   | yes (2px) |
| false      | Enabled  | no              | `--text-secondary`  | 500          | -                    | none      |
| false      | Enabled  | yes             | `--text-secondary`  | 500          | `--text-tertiary`    | none      |
| false      | Hover    | no              | `--text-primary`    | 500          | -                    | none      |
| false      | Hover    | yes             | `--text-primary`    | 500          | `--text-secondary`   | none      |

**Layout rules:**
- Tab item is a vertical column: `[label row]` on top, optional `[indicator]` below
- Label row is horizontal: `[label] [counter?]` with `gap: 4px`
- Indicator (when selected) is a 2px tall bar matching the full width of the label row
- In the tab bar, items are laid out horizontally with `gap: 16px`, aligned to the top

## React TypeScript Implementation

```tsx
import React from 'react';

type TabState = 'Enabled' | 'Hover';

export interface TabItem {
  key: string;
  label: string;
  counter?: number;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ items, activeKey, onChange, className = '' }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-start gap-[16px] ${className}`}
    >
      {items.map((item) => (
        <TabItemView
          key={item.key}
          label={item.label}
          counter={item.counter}
          selected={item.key === activeKey}
          onClick={() => onChange(item.key)}
        />
      ))}
    </div>
  );
}

interface TabItemViewProps {
  label: string;
  selected?: boolean;
  counter?: number;
  state?: TabState;
  onClick?: () => void;
  className?: string;
}

export function TabItemView({
  label,
  selected = false,
  counter,
  state = 'Enabled',
  onClick,
  className = '',
}: TabItemViewProps) {
  const isHover = state === 'Hover';
  const hasCounter = typeof counter === 'number';

  // Label color + weight
  const labelStyle = selected
    ? 'font-bold text-[#f9f9fa]'
    : isHover
    ? 'font-medium text-[#f9f9fa]'
    : 'font-medium text-[#bfc2cc] group-hover:text-[#f9f9fa]';

  // Counter text color depends on (selected or hover) vs default
  const counterTextColor = selected || isHover
    ? 'text-[#bfc2cc]'
    : 'text-[#9ea4b3] group-hover:text-[#bfc2cc]';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`group inline-flex flex-col items-center gap-[4px] cursor-pointer bg-transparent border-0 p-0 ${className}`}
    >
      <div className="inline-flex items-start gap-[4px]">
        <span
          className={`text-[14px] leading-[1.5] font-[Poppins] whitespace-nowrap ${labelStyle}`}
        >
          {label}
        </span>
        {hasCounter && (
          <span
            className="inline-flex items-center justify-center px-[6px] rounded-[100px] bg-[rgba(69,76,94,0.16)]"
          >
            <span
              className={`text-[14px] leading-[1.5] font-medium font-[Poppins] ${counterTextColor}`}
            >
              {counter}
            </span>
          </span>
        )}
      </div>
      {/* Indicator only when selected */}
      <div
        className={`h-[2px] w-full rounded-[1px] ${selected ? 'bg-[#ffbb38]' : 'bg-transparent'}`}
        aria-hidden
      />
    </button>
  );
}
```

### CSS variable approach (if token vars are available in the project)

```css
.tabs {
  display: inline-flex;
  align-items: flex-start;
  gap: 16px; /* --m */
}

.tab-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px; /* --xs */
  cursor: pointer;
  background: transparent;
  border: 0;
  padding: 0;
}

.tab-item__row {
  display: inline-flex;
  align-items: flex-start;
  gap: 4px;
}

.tab-item__label {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
  color: var(--text-secondary, #bfc2cc);
  white-space: nowrap;
  transition: color 0.15s;
}

.tab-item:hover .tab-item__label {
  color: var(--text-primary, #f9f9fa);
}

.tab-item--selected .tab-item__label {
  font-weight: 700;
  color: var(--text-primary, #f9f9fa);
}

.tab-item__counter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 100px;
  background-color: var(--input-background, rgba(69, 76, 94, 0.16));
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
  color: var(--text-tertiary, #9ea4b3);
}

.tab-item:hover .tab-item__counter,
.tab-item--selected .tab-item__counter {
  color: var(--text-secondary, #bfc2cc);
}

.tab-item__indicator {
  height: 2px;
  width: 100%;
  background-color: transparent;
}

.tab-item--selected .tab-item__indicator {
  background-color: var(--selected, #ffbb38);
}
```

## Usage Examples

```tsx
// Basic tabs
const [active, setActive] = useState('overview');

<Tabs
  activeKey={active}
  onChange={setActive}
  items={[
    { key: 'overview', label: 'Overview' },
    { key: 'enrolments', label: 'Enrolments' },
    { key: 'completions', label: 'Completions' },
    { key: 'observations', label: 'Observations' },
  ]}
/>

// Tabs with counters (e.g. queues, inboxes)
<Tabs
  activeKey={active}
  onChange={setActive}
  items={[
    { key: 'open',     label: 'Open',     counter: 12 },
    { key: 'in_review', label: 'In review', counter: 3 },
    { key: 'closed',   label: 'Closed' },
  ]}
/>

// Inside a section header
<div>
  <Tabs
    activeKey={tab}
    onChange={setTab}
    items={[
      { key: 'team',   label: 'My Team',  counter: teamSize },
      { key: 'pulse',  label: 'Pulse' },
      { key: 'config', label: 'Settings' },
    ]}
  />
  <div className="border-t border-[#383d4c] mt-[-1px]" /> {/* optional underline */}
  <div className="pt-[24px]">{/* tab panel content */}</div>
</div>
```

## Do's and Don'ts (Tabs)

**Do:**
- Use tabs for switching between sibling views of the same object (e.g. Overview / Enrolments / Completions for a course)
- Use `counter` for tabs where a count is genuinely informative (queue size, badge count)
- Keep labels short, 1 to 2 words is ideal, 3 is the upper limit
- Pair the tab bar with a 1px `--border` divider in the parent container if the panels below need a clear separation
- Let CSS `:hover` drive the hover state in production code; only use `state="Hover"` in stories or visual tests
- Default to the first tab being selected on mount unless the URL or saved state says otherwise

**Don't:**
- Don't use tabs for primary navigation between unrelated pages, use the sidebar instead
- Don't use tabs as a filter mechanism, use chips for that
- Don't render more than ~6 tabs in a single row; if you need more, consider a dropdown, secondary filter, or splitting the view
- Don't change the indicator color or thickness, `#ffbb38` and `2px` are fixed
- Don't combine tabs with chips in the same row, it makes the visual hierarchy ambiguous
- Don't hide the indicator on the selected tab, it's the primary affordance signalling which tab is active

## Chips vs Tabs: which one to use

| Use case                                              | Component |
|-------------------------------------------------------|-----------|
| Filter a list by category (multi or single select)    | Chips     |
| Show applied filters that can be removed              | Chips with `iconRight` |
| Switch between sibling views of the same object       | Tabs      |
| Show counts alongside section labels                  | Tabs with `counter` |
| Tag a person or entity (e.g. assignee, audience)      | Chips with `iconLeft` |
| Navigate to a different page or route                 | Neither, use sidebar or buttons |
