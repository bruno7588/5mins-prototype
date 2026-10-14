---
name: 5mins-chips-switcher-tabs
description: >
  Chip / filter-tag, Content Switcher (segmented control), and Tabs components
  for 5Mins.ai. Use when implementing chips, tags, filter pills, selection
  chips, dismissible tags, segmented controls, view switchers, tab bars,
  underlined tab navigation, page section tabs, or any small pill-shaped
  interactive label or horizontal switcher in the admin or learner UI.
  Covers all chip variants (default, hover, selected, disabled, with optional
  left/right icons), the content-switcher item states, and all tab variants
  (default, hover, selected, with optional counter pill), plus design tokens
  and React TypeScript usage. Trigger this skill whenever someone needs a chip,
  filter chip, tag pill, selection pill, dismissible label, segmented control,
  content switcher, tab, tab bar, or section switcher in the 5Mins.ai platform.
---

# Chips, content switcher and tabs

Three related navigation and selection components used across the 5Mins.ai admin and learner UI:

1. **Chips** - pill-shaped labels for filters, tags, and dismissible selections
2. **Content switcher** - a segmented control inside a filled track, for exclusive view switching
3. **Tabs** - underlined horizontal section switcher with optional counter pills

All colours are semantic tokens that resolve per mode (see `colors.md`).

**Last verified:** 2026-09-29

## Choosing between them

| Use case                                              | Component |
|-------------------------------------------------------|-----------|
| Filter a list by category (multi or single select)    | Chips     |
| Switch between exclusive views of the same data (grid/list, week/month) | Content Switcher |
| Show applied filters that can be removed              | Chips with `iconRight` |
| Switch between sibling views of the same object       | Tabs      |
| Show counts alongside section labels                  | Tabs with `counter` |
| Tag a person or entity (e.g. assignee, audience)      | Chips with `iconLeft` |
| Navigate to a different page or route                 | Neither, use sidebar or buttons |
| List values a control elsewhere owns, each removable   | Badge with `onDismiss` (`badges.md`) |

A second level inside a tabbed page is chips only; a Content Switcher stays allowed for two views of one object in a drawer.

---

# Chip

Pill-shaped label the admin presses to filter or pick an option, or that stands for a chosen value they can remove.

**Code:** `import Chip from '@/components/Chip/Chip'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `5162:28510`
**Last verified:** 2026-09-29

## Usage

**Intent:** a small pill the admin presses to filter or pick an option, or that stands for a chosen value they can remove.

**Use when**
- Filtering a list by category, single or multi-select (e.g. error categories in a bulk upload, the question picker in assessment results)
- Picking one mode from a short set inside a form (e.g. All / People / Cohort when enrolling)
- Showing chosen people or filter values that can be removed with a ×
- Filtering inside a page that already has a tab bar, instead of nesting a second tab bar

**Don't use when**
- Switching between exclusive views of the same content → Content Switcher (this doc)
- Moving between sibling sections of a page → Tabs (this doc)
- Navigating to another page → sidebar or buttons ([doc](navigation.md))
- Showing a read-only status or a value that is only ever read and removed → Badge ([doc](badges.md))

**Do**
- Use `selected` + `onClick` to toggle
- Pass `iconRight` and `onDismiss` together: `iconRight` draws the ×, `onDismiss` makes it act
- Use `iconLeft` for a person; `customIconLeft` for any other 16px icon
- Use `disabled` when an option is unavailable, not merely unselected

**Don't**
- Don't nest a tab bar inside an already tabbed page; filter with chips
- Don't use chips for navigation
- Don't use both a left icon and `iconRight`, except on a person or filter chip that also needs its × (code extension, not in the Library)
- Don't hardcode hover styles inline; CSS `:hover` handles it
- Don't change the radius; it is always `var(--radius-full)`

**Canonical spec:** padding `var(--space-xss) var(--space-sm)` (6px 12px), `var(--space-ssm)` (10px) on the icon side; radius `var(--radius-full)`; gap `var(--space-xs)` (4px) with an icon; border 1px `var(--border-elevated)`, hover `var(--border-hover)` on `var(--page-background-hover)`; selected fill `var(--secondary-500)` with `var(--text-on-selected)` Bold; label 14px Regular `var(--text-secondary)`; icons 16px. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `5162:28510`.

## Figma to code

Figma set `Chips` (`5162:28510`).

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Selected | false / true | `selected` | `false` (default) / `true` | |
| Disabled | false / true | `disabled` | `false` (default) / `true` | |
| State | Enabled / Hover / Focus / n/a | n/a | CSS `:hover`, `:focus-visible` | `n/a` is the disabled variants; states are CSS, not props |
| Icon left | false / true | `iconLeft` or `customIconLeft` | `boolean` / `ReactNode` | `iconLeft` draws the user icon; `customIconLeft` replaces it with any 16px node. Kept as a variant: the icon side's padding drops to 10px |
| Leading icon (swap) | 16px glyph | `customIconLeft` | `ReactNode` | |
| Icon right | False / True | `iconRight` | `false` (default) / `true` | pair with `onDismiss` so the × acts. Kept as a variant (padding change) |
| Trailing icon (swap) | 16px glyph | n/a | n/a | code always draws the close (×) icon |
| Label (text) | chip text | `label` | `string` (required) | |

- **Figma only:** none.
- **Code only:** `variant="warning"` (warning border; not used on any page yet), `onClick`, `onDismiss`, `className`, Selected + Hover (`--secondary-600`), a left icon and the × together on one chip.

**Props:**

| Prop        | Type                          | Default     | Description                          |
|-------------|-------------------------------|-------------|--------------------------------------|
| `label`     | `string`                      | required    | Text displayed inside chip           |
| `selected`  | `boolean`                     | `false`     | Yellow fill, bold dark text          |
| `disabled`  | `boolean`                     | `false`     | Muted border + text, non-interactive |
| `iconLeft`  | `boolean`                     | `false`     | Show 16×16 user icon before label    |
| `customIconLeft` | `ReactNode`              | -           | Replaces the user icon with any 16px node |
| `iconRight` | `boolean`                     | `false`     | Show 16×16 close (×) icon after label|
| `variant`   | `"default" \| "warning"`      | `"default"` | `warning` swaps the border for `--button-warning-background` |
| `state`     | -                             | -           | Not a prop in code; hover is CSS `:hover` only |
| `onClick`   | `() => void`                  | -           | Click handler; makes the chip a keyboard-operable toggle |
| `onDismiss` | `() => void`                  | -           | Close-icon click (only with iconRight)|
| `className` | `string`                      | -           | Extra CSS classes                    |

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Chip | _to be mapped by engineering_ | | |

## Anatomy

Screenshot: pill-shaped labels, yellow selected state.

```
[ Content ]           ← Enabled (border only)
[ Content  x ]        ← Enabled + iconRight (close)
[ 👤 Content ]        ← Enabled + iconLeft (user)
[ Content ]           ← Hover (slightly lit background + brighter border)
[ Content ]           ← Selected (yellow fill, bold dark text)
[ Content ]           ← Disabled (muted border + muted text)
```

- **Padding:** `6px` top and bottom for every variant (`--xss`). Horizontally `12px` (`--sm`), dropping to `10px` (`--ssm`) on the side an icon sits on: `10px 12px` for icon-left, `12px 10px` for icon-right, `12px` both sides with no icon. A glyph carries its own optical margin, so an equal 12px reads wider beside an icon than beside a word.
- **Gap:** `4px` (`--xs`) whenever an icon is present
- **Icons:** 16 × 16 px, left or right; both only for a person chip with a leading icon and a trailing × (code extension, insets 10px at both ends)
- **Border radius:** `var(--radius-full)` (fully rounded pill)

## Variants

- **Default** - border only.
- **Warning** (code only) - `variant="warning"` swaps the border for `--button-warning-background`.
- **Icon left** - user icon (`iconLeft`) or any 16px node (`customIconLeft`).
- **Icon right** - close (×) icon; acts through `onDismiss`.

## States

| `disabled` | `selected` | `state`    | Border         | Background             | Text color        | Text weight |
|------------|------------|------------|----------------|------------------------|-------------------|-------------|
| false      | false      | Enabled    | `--border-elevated` | transparent            | `--text-secondary`| 400         |
| false      | false      | Hover      | `--border-hover`| `--page-background-hover`| `--text-secondary`| 400         |
| false      | true       | Enabled    | transparent (keeps the 1px, so the row doesn't shift) | `--secondary-500`, `--secondary-600` on hover | `--text-on-selected` | 700         |
| true       | false      | n/a        | `--border`     | transparent            | `--text-disabled` | 400         |

**Focus-visible:** `2px solid var(--primary-button-background)` outline, 2px offset (the same cyan ring the buttons and the switcher use).

## Tokens

| CSS Variable               | Light      | Dark       | Usage                                  |
|----------------------------|------------|------------|----------------------------------------|
| `--border-elevated`        | `#BFC2CC`  | `#383D4C`  | Enabled chip border                    |
| `--border`                 | `#DFE1E6`  | `#2D313D`  | Disabled chip border                   |
| `--border-hover`           | `#9EA4B3`  | `#9EA4B3`  | Hover state border                     |
| `--page-background-hover`  | `#EFF0F2`  | `#2D313D`  | Hover state background fill            |
| `--secondary-500`          | `#FFBB38`  | `#FFBB38`  | **Selected background - raw palette token, same in both modes (not `--selected`)** |
| `--text-secondary`         | `#454C5E`  | `#BFC2CC`  | Default & hover label color            |
| `--text-disabled`          | `#9EA4B3`  | `#656B7C`  | Disabled label & icon color            |
| `--text-on-selected`       | `#20222A`  | `#20222A`  | Selected label color (dark on yellow)  |

**Typography:**

| Variant          | Font     | Weight  | Size | Line height |
|------------------|----------|---------|------|-------------|
| Default / hover  | Poppins  | 400     | 14px | 1.5         |
| Selected         | Poppins  | 700     | 14px | 1.5         |
| Disabled         | Poppins  | 400     | 14px | 1.5         |

## Accessibility

- With `onClick`, the component supplies `role="button"`, `aria-pressed` and Enter/Space handling.
- Visible `:focus-visible` ring: `2px solid var(--primary-button-background)`, 2px offset.
- Disabled chips are non-interactive (`pointer-events: none`, `cursor: not-allowed`).

## Content

- Keep labels short, 1 to 3 words.

## Examples

Use the shared component; don't re-implement it. Hover is CSS `:hover`, not a prop.

```tsx
import Chip from '@/components/Chip/Chip'

<Chip label="Finance" selected={active} onClick={() => setActive(!active)} />
<Chip label="Ricardo" iconLeft iconRight onDismiss={() => removePerson('ricardo')} />
```

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

CSS variable approach (if token vars are available in the project):

```css
/* In your global CSS or component stylesheet */
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  padding: var(--space-xss) var(--space-sm);   /* 6px 12px */
  border: 1px solid var(--border-elevated);
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}
.chip:not(.chip--disabled):not(.chip--selected):hover {
  border-color: var(--border-hover);
  background-color: var(--page-background-hover);
}
.chip--selected {
  border-color: transparent;
  background-color: var(--secondary-500);   /* #FFBB38 - raw token, both modes */
  color: var(--text-on-selected);
  font-weight: 700;
}
.chip--disabled {
  border-color: var(--border);
  color: var(--text-disabled);
  cursor: not-allowed;
  pointer-events: none;
}
.chip--icon { gap: 4px; }                    /* left or right icon, 16px */
```

---

# Content switcher

A segmented control: mutually exclusive sections inside a filled track. Use it to switch between views of the same data (e.g. grid/list, week/month) where the options should read as one connected control rather than separate chips.

**Code:** `import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `7128:23859` + item `8497:24186`
**Last verified:** 2026-09-29

## Usage

**Intent:** a segmented control that switches between 2 to 5 exclusive views of the same content, read as one connected control.

**Use when**
- Pivoting the same results (e.g. By Assessment / By Learner)
- Switching the axis you browse by (e.g. Functions / Skills)
- Showing two views of one object inside a drawer or panel, especially over a page that already has its own tab bar

**Don't use when**
- Filtering by category or picking several values → Chip (this doc)
- Moving between sibling sections of a page → Tabs (this doc)
- Walking through steps that must happen in order → a stepped flow with footer buttons

**Do**
- Use the shared `ContentSwitcher` with `items`, `activeKey` and `onChange`, and give it an `ariaLabel`
- Put a count in the label when needed, e.g. "Questions (3)"; there is no counter slot
- Keep the sliding selection pill; it already respects reduced motion

**Don't**
- Don't add icons; the shared component has no icon slot. If the component gains them, don't mix icon and no-icon items in one track.
- Don't use it for sibling page sections

**Canonical spec:** track `var(--input-background)`, padding and gap `var(--space-xs)` (4px), radius `var(--radius-sm)` (12px); item padding `var(--space-xss) var(--space-sm)` (6px 12px), radius `var(--radius-s)` (8px), 14px Regular `var(--text-secondary)`; unselected hover `var(--input-background-hover)`; selected `var(--secondary-500)` with `var(--text-on-selected)` Bold. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `7128:23859` + item `8497:24186`.

## Figma to code

Figma: `Content switcher` (`7128:23859`, standalone component with no properties and a fixed 4 items) built from the `Content switcher item` set (`8497:24186`).

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Selected (item) | True / False | `activeKey` | the selected item's `key` | `onChange(key)` sets it |
| Disabled (item) | false / true | `items[].disabled` | `boolean` | |
| State (item) | Enabled / Hover / Focus | n/a | CSS `:hover`, `:focus-visible` | states are CSS, not props |
| Show leading icon (switch) + Leading icon (swap) | off / on, glyph | n/a | n/a | no icon slot in code |
| Show trailing icon (switch) + Trailing icon (swap) | off / on, glyph | n/a | n/a | no icon slot in code |
| Label (item text) | section label | `items[].label` | `string` | each item also needs a `key` |

- **Figma only:** per-item icons (left 20px, right 16px) and their swaps; the fixed 4-item track.
- **Code only:** `ariaLabel`, `onChange`, `className`, any item count, the sliding selection pill.

**Props:** `items: { key, label, disabled? }[]`, `activeKey`, `onChange(key)`, `ariaLabel` (labels the tablist), `className`.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Content Switcher | _to be mapped by engineering_ | | |

## Anatomy

```
┌────────────────────────────────────────────┐
│ [ Section ]  Section   Section   Section   │   ← track (filled), selected segment yellow
└────────────────────────────────────────────┘
```

**Track:** `background: var(--input-background)` · padding `4px` (`--xs`) · gap `4px` · radius `12px` (`--radius-sm`).

**Item:** padding `6px 12px` · radius `8px` (`--radius-s`) · text 14px/1.5 Poppins.

Optional icons per item in Figma: **left 20px** (e.g. trash) or **right 16px** (e.g. info-circle), `gap: 4px`, `currentColor`. The prototype `ContentSwitcher` has no icon slot (items are `key`, `label`, `disabled`).

## States

| Item state | Background | Text |
|---|---|---|
| Selected | `--secondary-500` `#FFBB38` (both modes) | Bold 700, `--text-on-selected` |
| Unselected | transparent | Regular, `--text-secondary` |
| Unselected hover | `--input-background-hover` | Regular, `--text-secondary` |
| Disabled | transparent | Regular, `--text-disabled` |
| Focus-visible | unchanged | `2px solid var(--primary-button-background)` outline, 2px offset |

The selected item's hover has no further change; it is already the active segment.

## Tokens

`--input-background` (track), `--input-background-hover` (unselected hover), `--secondary-500` (selected fill, raw palette token, both modes), `--text-on-selected`, `--text-secondary`, `--text-disabled`, `--primary-button-background` (focus ring); spacing `--space-xs`, `--space-xss`, `--space-sm`; radius `--radius-sm`, `--radius-s`.

## Accessibility

- Renders `role="tablist"` with `role="tab"` buttons and `aria-selected`; `ariaLabel` labels the tablist.
- Visible `:focus-visible` ring: `2px solid var(--primary-button-background)`, 2px offset.
- The selected pill slides via Framer Motion `layoutId` and respects reduced motion.

## Content

- Keep labels short, one word where possible.
- Put a count in the label when needed, e.g. "Questions (3)".

## Examples

Use the shared component; don't re-implement it.

```tsx
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'

<ContentSwitcher
  ariaLabel="Results view"
  items={[
    { key: 'assessment', label: 'By Assessment' },
    { key: 'learner', label: 'By Learner' },
  ]}
  activeKey={view}
  onChange={setView}
/>
```

Reference CSS (the shared component already implements this):

```css
.switcher {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: var(--input-background);
  border-radius: var(--radius-sm);      /* 12px */
}

.switcher__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-s);       /* 8px */
  background: transparent;
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.15s;
}

.switcher__item:hover:not(.is-selected):not(:disabled) {
  background: var(--input-background-hover);
}

.switcher__item.is-selected {
  background: var(--secondary-500);     /* #FFBB38 - raw token, both modes */
  color: var(--text-on-selected);
  font-weight: 700;                     /* H5 - the active section label */
}

.switcher__item:disabled {
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

---

# Tabs

An underlined bar that moves between sibling sections of one page or object.

**Code:** no shared component yet: each page builds its own bar with a page-prefixed class, an `--active` modifier and an `::after` indicator. Reference: `src/pages/roles/Roles.tsx` (`.roles-header__tab`).
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `8497:24855` + item `1939:18281`
**Last verified:** 2026-09-29

## Usage

**Intent:** an underlined bar that moves between sibling sections of one page or object.

**Use when**
- Splitting a page into sibling sections (e.g. 5Mins Roles / Company Roles, the sections of a course)
- Showing a count beside a section label, when the count is genuinely informative

**Don't use when**
- Filtering a list → Chip (this doc)
- Adding a second level inside a page that already has tabs → Chip (this doc)
- Switching views of the same data → Content Switcher (this doc)
- Navigating between unrelated pages → sidebar ([doc](navigation.md))

**Do**
- Show the selected tab with a 2px `var(--selected)` indicator and a Bold `var(--text-primary)` label; others Medium `var(--text-secondary)`, `var(--text-primary)` on hover
- Let CSS `:hover` drive the hover state
- Add a 1px `var(--border)` divider in the parent if the panel needs separating
- Select the first tab on mount unless the URL or saved state says otherwise

**Don't**
- Don't nest tabs inside tabs
- Don't render more than about 6 tabs in a row; use a dropdown or secondary filter, or split the view
- Don't change the indicator colour or thickness, and never hide it on the selected tab
- Don't put tabs and chips in the same row

**Canonical spec:** label 14px, Medium (500) unselected / Bold (700) selected; indicator 2px `var(--selected)` (#EDA30D light / #FFBB38 dark); label to indicator gap `var(--space-xs)` (4px); gap between tabs `var(--space-m)` (16px); counter pill `var(--input-background)`, radius `var(--radius-full)`, text `var(--text-tertiary)`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `8497:24855` + item `1939:18281`.

**Prototype pages:** `src/pages/roles/Roles.tsx` (`.roles-header__tab`) is compliant: `--selected` indicator, 16px tab gap, cyan focus ring; its one drift is an 8px label-to-indicator gap (spec 4px). `src/pages/your-courses/CourseDetails.tsx` (`.cd-tab`) drifts: `.cd-tab-count` text is `--text-secondary` (spec `--text-tertiary`) and `.cd-tab` has no `:focus-visible` style; don't copy it.

## Figma to code

Figma: `Tabs` (`8497:24855`, standalone component with no properties and a fixed 5 tabs) built from the `Tab items` set (`1939:18281`). There is no shared React component, so Figma properties map to the page-local CSS classes.

| Figma property | Figma values | Code | Values | Notes |
|---|---|---|---|---|
| Selected | true / false | `--active` modifier (e.g. `.roles-header__tab--active`), `aria-selected` | present / absent | `selected` in the reference prop shape below |
| State | Enabled / Hover / Focus | n/a | CSS `:hover`, `:focus-visible` | states are CSS, not props |
| counter | false / true | page-local count span (e.g. `.cd-tab-count`) | rendered / omitted | `counter?: number` in the reference prop shape |
| Label (text) | tab label | label text | `string` | |
| Count (text) | counter number | `counter` | `number` | |

- **Figma only:** the fixed 5-tab bar.
- **Code only:** any number of tabs.

**Reference prop shape** for a page-local tab bar (there is no shared component):

`<Tabs>` (the container)

| Prop        | Type                        | Default     | Description                              |
|-------------|-----------------------------|-------------|------------------------------------------|
| `items`     | `TabItem[]`                 | required    | Array of tab items to render             |
| `activeKey` | `string`                    | required    | `key` of the currently selected tab      |
| `onChange`  | `(key: string) => void`     | required    | Called when user clicks a tab            |
| `className` | `string`                    | -           | Extra CSS classes on the bar             |

`TabItem` shape

| Field      | Type        | Required | Description                                    |
|------------|-------------|----------|------------------------------------------------|
| `key`      | `string`    | yes      | Unique identifier, used for selection          |
| `label`    | `string`    | yes      | Visible tab label                              |
| `counter`  | `number`    | no       | If provided, shows a counter pill (e.g. `0`)   |

`<TabItem>` (low-level, if used standalone)

| Prop        | Type                          | Default     | Description                                |
|-------------|-------------------------------|-------------|--------------------------------------------|
| `label`     | `string`                      | required    | Text displayed in the tab                  |
| `selected`  | `boolean`                     | `false`     | Bold `--text-primary` text, amber underline visible |
| `counter`   | `number \| undefined`         | `undefined` | If defined, renders counter pill next to label |
| `state`     | `"Enabled" \| "Hover"`        | `"Enabled"` | Visual state (Hover normally driven by CSS) |
| `onClick`   | `() => void`                  | -           | Click handler                              |
| `className` | `string`                      | -           | Extra CSS classes                          |

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Tabs | _to be mapped by engineering_ | | |

## Anatomy

Screenshot: row of text labels, the active one bolded with an amber underline beneath it.

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

- Tab item is a vertical column: `[label row]` on top, optional `[indicator]` below
- Label row is horizontal: `[label] [counter?]` with `gap: 4px`
- Indicator (when selected) is a 2px tall bar matching the full width of the label row (text + optional counter)
- In the tab bar, items are laid out horizontally with `gap: 16px`, aligned to the top
- **Counter padding:** `0 6px` horizontal; **counter border-radius:** `100px` (fully rounded pill)
- **Tab bar bottom border:** none in the component itself; if you need a divider beneath the whole bar, add a 1px `--border` line in the parent container

## States

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

| `selected` | `state`  | Counter present | Label color         | Label weight | Counter text color   | Indicator |
|------------|----------|-----------------|---------------------|--------------|----------------------|-----------|
| true       | Enabled  | no              | `--text-primary`    | 700          | -                    | yes (2px) |
| true       | Enabled  | yes             | `--text-primary`    | 700          | `--text-secondary`   | yes (2px) |
| false      | Enabled  | no              | `--text-secondary`  | 500          | -                    | none      |
| false      | Enabled  | yes             | `--text-secondary`  | 500          | `--text-tertiary`    | none      |
| false      | Hover    | no              | `--text-primary`    | 500          | -                    | none      |
| false      | Hover    | yes             | `--text-primary`    | 500          | `--text-secondary`   | none      |

**Focus-visible:** `2px solid var(--primary-button-background)` outline, 2px offset (the same cyan ring Chip and ContentSwitcher use).

## Tokens

| CSS Variable          | Light                       | Dark                      | Usage                                       |
|-----------------------|-----------------------------|---------------------------|---------------------------------------------|
| `--text-primary`      | `#20222A`                   | `#F9F9FA`                 | Selected label text, hover label text       |
| `--text-secondary`    | `#454C5E`                   | `#BFC2CC`                 | Default (enabled, not selected) label text  |
| `--text-tertiary`     | `#656B7C`                   | `#9EA4B3`                 | Counter text in default enabled state       |
| `--selected`          | `#EDA30D`                   | `#FFBB38`                 | Amber 2px indicator underline - **mode-aware, unlike the chip/switcher fill** |
| `--input-background`  | `#BFC2CC` @16%              | `#454C5E` @16%            | Counter pill background                     |

| Token  | px  | Used for                                                       |
|--------|-----|----------------------------------------------------------------|
| `--xs` | 4   | Gap between label and indicator (vertical); label↔counter gap  |
| `--m`  | 16  | Gap between tab items in the tab bar                           |

**Typography:**

| Variant                     | Font     | Weight  | Size | Line height |
|-----------------------------|----------|---------|------|-------------|
| Selected label              | Poppins  | 700     | 14px | 1.5         |
| Default / Hover label       | Poppins  | 500     | 14px | 1.5         |
| Counter (all states)        | Poppins  | 500     | 14px | 1.5         |

## Accessibility

- Mark up with `role="tablist"`, `role="tab"` and `aria-selected`.
- Give each tab a visible `:focus-visible` outline: `2px solid var(--primary-button-background)`, 2px offset.

## Content

- Keep labels to 1 or 2 words, 3 at most.

## Examples

Reference implementation for a page-local tab bar (no shared component exists; use page-prefixed class names in real pages):

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
    ? 'font-bold text-[var(--text-primary)]'
    : isHover
    ? 'font-medium text-[var(--text-primary)]'
    : 'font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]';

  // Counter text color depends on (selected or hover) vs default
  const counterTextColor = selected || isHover
    ? 'text-[var(--text-secondary)]'
    : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]';

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
            className="inline-flex items-center justify-center px-[6px] rounded-[100px] bg-[var(--input-background)]"
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
        className={`h-[2px] w-full rounded-[1px] ${selected ? 'bg-[var(--selected)]' : 'bg-transparent'}`}
        aria-hidden
      />
    </button>
  );
}
```

CSS variable approach (if token vars are available in the project):

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
  background-color: var(--input-background);
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
  background-color: var(--selected);
}
```

Usage:

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
  <div className="border-t border-[var(--border)] mt-[-1px]" /> {/* optional underline */}
  <div className="pt-[24px]">{/* tab panel content */}</div>
</div>
```

---

## Related

- [badges.md](badges.md) - read-only status and removable values owned elsewhere
- [navigation.md](navigation.md) - sidebar and page navigation
- [colors.md](colors.md) - the token system
- [buttons.md](buttons.md) - the shared cyan focus ring
