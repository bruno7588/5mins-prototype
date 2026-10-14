---
name: dropdown
description: Dropdown / Select component for 5Mins.ai. Covers states (Enabled, Hover, Active, Read-only), optional leading icon, label (top / start) and helper text, all size variants. Always use this skill when building a dropdown, select field, combobox, filter selector, or option picker.
---

# Dropdown

A closed field that opens a listbox so the user picks one value, or several, from a known list. Cross-reference with `colors`, `typography`, and `iconography` for raw token values.

**Code:** `import Dropdown from '@/components/Dropdown/Dropdown'` (default export; `src/components/Dropdown/Dropdown.tsx` is the reference)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, dark `8925:1408` / light `12113:14844`
**Last verified:** 2026-09-29

## Usage

**Intent:** a closed field that opens a listbox so the user picks one value (or several, with `multiple`) from a known list.

**Use when**
- A form field takes one value from a fixed list, e.g. Region, Department, lesson Type.
- A toolbar or tab filters by a set of values, usually with a leading `Sort` icon, e.g. course status or timeframe.
- A filter takes several values at once (`multiple`), e.g. assessment type or a scope condition.
- A value sits inside a sentence, e.g. "Repeat every [Week]" in a reminder card.

**Don't use when**
- The value is free text → use InputField ([doc](input.md))
- The user narrows a list by typing → use Search ([doc](search.md))
- The value is a date → use DatePickerField ([doc](date-picker-field.md))
- A few (2 to 6) exclusive options should all stay visible → use Radio ([doc](selection-controls.md))
- The menu runs actions rather than setting a value → use RowActionsMenu on the Listbox surface ([doc](listbox.md))

**Do**
- Reuse the DS `Dropdown` for single-select, multi-select and date-adjacent filter rows rather than building a page-local trigger and popover.
- For multi-select, pass `multiple` with `values` / `onChangeValues`; add `allLabel` for a "no filter" first row.
- Pass `summaryLabel` to read the picks back in the trigger ("Selected: 3"); leave it out when chips below the field already list the picks.
- Use `readOnly` for a disabled dropdown (e.g. while its card's toggle is off).
- Default to `size="md"` (the most used size); `size="sm"` is used for compact filter rows, small popovers and the label-start course status filter. `lg` has no call site.
- Style the menu through `menuClassName`; it is portalled to `<body>`, so descendant selectors from the field's ancestors won't reach it.
- Show errors with the `error` prop: it draws the `--text-error` border and replaces the helper text.
- Colour a leading icon `--text-primary`, the same as the trigger text; the chevron is `--text-secondary`.
- Constrain the width at the wrapper level (`<div style={{ width: 'auto' }}>` or a utility class) rather than mutating the component.

**Don't**
- Don't give the trigger a fill at rest; it is transparent with a border only.
- Don't use raw `--secondary-500` for the active border or the selected row; use the mode-aware `--selected`.
- Don't use `--danger-500` for the error border; Dropdown and InputField share `--text-error`, held on hover.
- Don't copy the `.dropdown-*` classes into a new component; extend `Dropdown` instead.

**Canonical spec:** md trigger 37px high, padding `var(--space-s) var(--space-sm)` (8px 12px), radius `var(--radius-sm)` (12px), text 14px / 400 / 1.5; sm is 33px with 4px 12px padding and 12px text. Border `--border-elevated`, hover `--border-hover` + `--input-background`, open or focused `--selected`, read-only `--border` with `--text-disabled`, error `--text-error`. Placeholder `--text-disabled`, label Paragraph M semibold `--text-secondary`, helper `--text-tertiary`. Menu: `--cards-background`, radius `var(--radius-sm)` (12px), padding `var(--space-s)` (8px), max height 320px, selected row `--selected` with `--text-on-selected`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `12113:14844` / dark `8925:1408`.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| State | Enabled / Hover / Active / Read-only / Error | `readOnly`, `error` | Read-only = `readOnly`; Error = `error` message string | Enabled, Hover, Active are CSS (`:hover`, `.is-active`, `:focus-visible`) |
| Disabled | false / true | `readOnly` | `false` (default) / `true` | Figma pairs `Disabled=true` with `State=Read-only`; code has one prop |
| Icon left | true / false | `iconLeft` | `ReactNode`, omitted = none | Figma variant, code content prop |
| Label top | false / true | `label` + `labelPlacement` | `labelPlacement="top"` (default) | two Figma booleans map to one enum |
| Label start | false / true | `label` + `labelPlacement` | `labelPlacement="start"` | |
| Helper text | false / true | `helperText` | `string`, omitted = none | `error` replaces it |

- **Figma only:** the separate `Disabled` axis (code uses `readOnly` alone). The set has **no size axis**: Small and Large are not in it and still need their own link.
- **Code only:** `size` (`'sm'` / `'md'` default / `'lg'`), `options` (`value`, `label`, optional `description`, `disabled`, `icon`), `value`, `onChange`, `placeholder` (default "Select"), `multiple` with `values`, `onChangeValues`, `allLabel`, `summaryLabel`; `searchable` and `searchPlaceholder` (pins the listbox search item at the top of the menu, filters by label); `radio` (single-select rows carry the listbox radio item instead of the amber fill); `triggerText` (fixed trigger text that replaces the selection read-back); `className`, `menuClassName`, `menuAlign` `'start' | 'end'` (default `'start'`).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Dropdown | _to be mapped by engineering_ | | |

## Anatomy

1. **Trigger** - the always-visible field the user clicks to open
2. **Menu** - the floating list of options (not fully specced in the Figma library; see Menu below and `listbox.md`)
3. **Label** (optional) - top or start
4. **Helper / Error text** (optional) - below the trigger

```
┌─────────────────────────────┐  ← Trigger (transparent, bordered)
│  ⇅  Input              ▾    │
└─────────────────────────────┘
```

The trigger is **transparent by default** with only a border - it is *not* a filled input. Radius is `12px` (`--radius-sm`).

### Leading icon (`iconLeft`)

First-class in the Figma library. Use any Iconsax Linear icon at the size matching the trigger. In the reference flows the icon is `Sort` at 20px (medium). With `color="currentColor"` the leading icon follows the trigger text colour (`--text-primary` Enabled/Hover/Active, `--text-disabled` Read-only). Current call sites pass an explicit colour, so their icon does not grey in read-only.

### Chevron icon

Use `ArrowDown2` from Iconsax. Rotate 180° in the Active state, OR swap to `ArrowUp2` to mirror the Figma asset exactly.

```css
.dropdown-chevron { transition: transform 150ms ease; }
.dropdown-trigger.is-active .dropdown-chevron { transform: rotate(180deg); }
```

Chevron color is `--text-secondary`, not the value's colour - it is the control's affordance, not part of the text. Read-only tints it `--text-disabled` with the rest of the trigger.

### Label

Two placements supported in the Figma library: **top** (default) and **start** (inline to the left).

```css
.dropdown-label {
  font: 600 14px/1.5 'Poppins', sans-serif; /* Paragraph M semibold - the label weight */
  color: var(--text-secondary);             /* #BFC2CC - Figma value */
}

/* labelStart variant */
.dropdown-field.label-start {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
```

Required-field indicator:

```css
.dropdown-label .required-mark { color: var(--danger-500); margin-left: 2px; }
```

### Helper / Error text

```css
.dropdown-helper {
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-tertiary);              /* #9EA4B3 */
  margin-top: 8px;                          /* column gap --s */
}
.dropdown-helper.is-error { color: var(--text-error); }
```

Visible only when `helperText` is true (matches the Figma variant). In error state, the helper text replaces the neutral helper.

### Menu

What `src/components/Dropdown/Dropdown.css` draws:

- `.dropdown-menu`: portalled to `<body>`, `position: fixed`, `z-index: 1060`, `var(--cards-background)`, 1px border, radius `var(--radius-sm)` (12px), `var(--shadow-l)`, padding `var(--space-s)` (8px), max height 320px then scroll.
- `.dropdown-option`: padding `var(--space-s) var(--space-sm)` (8px 12px), radius `var(--radius-s)` (8px), 14px / 400 / 1.5 `var(--text-primary)`; hover `var(--cards-background-hover)`.
- Selected: `var(--selected)` fill with `var(--text-on-selected)` text at weight 500. No tick icon.
- Disabled: `var(--text-disabled)`, not clickable.
- Option with `description`: label 600 over a `var(--text-secondary)` description that may wrap.

The menu border is `var(--border-elevated)` (Figma `9162:1042`), as `RowActionsMenu` uses; `--border` would vanish against `--cards-background` in dark mode.

## Variants

| Dimension | Options |
|-----------|---------|
| **State** | Enabled, Hover, Active, Read-only, Error |
| **Leading icon** | With icon, Without icon |
| **Label** | No label, Label on top, Label on start |
| **Helper text** | With, Without |
| **Size** | Small (33px), Medium (37px), Large (48px) |

There is no separate "Selected" or "Open" state at the trigger level - `Active` covers the open/focused state. Use `aria-disabled` + the Read-only styling for disabled.

## Sizes

| Size | Height | Padding | Font | Icon |
|------|--------|---------|------|------|
| Small | 33px | 4px 12px | 12px | 16px |
| **Medium (default)** | 37px | 8px 12px | 14px | 20px |
| Large | 48px | 12px 16px | 16px | 20px |

Medium is 37px: the Figma node states no height, and 37px is the frame with its 1px stroke drawn inside, so the stated frame wins over padding arithmetic (the same way `lg`'s 48px does).

```css
.dropdown-sm .dropdown-trigger { height: 33px; padding: 4px 12px; font-size: 12px; }
.dropdown-md .dropdown-trigger { height: 37px; padding: 8px 12px;  font-size: 14px; }
.dropdown-lg .dropdown-trigger { height: 48px; padding: 12px 16px; font-size: 16px; }
```

## States

| State | Background | Border | Text |
|---|---|---|---|
| Enabled | transparent | `--border-elevated` | `--text-primary` (placeholder `--text-disabled`) |
| Hover | `--input-background` | `--border-hover` | `--text-primary` |
| Active (open / focused, incl. `:focus-visible`) | transparent | `--selected` | `--text-primary` |
| Read-only (disabled) | transparent | `--border` | `--text-disabled`, `cursor: not-allowed` |
| Error | transparent | `--text-error` (held on hover) | helper `--text-error` |

All form-field active borders (dropdown, date field, inputs, search) use the mode-aware `--selected` token (`#EDA30D` light / `#FFBB38` dark), the same token as selection fills.

```css
.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: transparent;
  border: 1px solid var(--border-elevated); /* #DFE1E6 light / #383D4C dark */
  border-radius: var(--radius-sm);          /* 12px */
  padding: 8px 12px;                        /* --s, --sm */
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);               /* #20222A */
  cursor: pointer;
  user-select: none;
}

.dropdown-trigger:hover {
  background: var(--input-background);      /* translucent tint - light: #BFC2CC @16% */
  border-color: var(--border-hover);        /* #9EA4B3 */
}

.dropdown-trigger.is-active,
.dropdown-trigger:focus-visible {
  background: transparent;
  border-color: var(--selected);            /* mode-aware: #EDA30D light / #FFBB38 dark */
  outline: none;
}

.dropdown-trigger[aria-disabled="true"] {
  background: transparent;
  border-color: var(--border);
  color: var(--text-disabled);              /* #656B7C */
  cursor: not-allowed;
}

.dropdown-trigger.has-error,
.dropdown-trigger.has-error:hover { border-color: var(--text-error); }
```

The leading icon (when present) greys to `--text-disabled` in read-only only if the caller passes `color="currentColor"`; `.dropdown-trigger-leading` sets no colour, so an icon given an explicit colour keeps it. The error border and helper text are both `var(--text-error)`, the same token InputField uses (`InputField.css`).

## Tokens

| Context | Token | Value |
|---|---|---|
| Trigger background (Enabled/Active) | *none (transparent)* | - |
| Trigger background (Hover) | `var(--input-background)` | `#BFC2CC` @16% light / `#454C5E` @16% dark |
| Border default | `var(--border-elevated)` | `#DFE1E6` light / `#383D4C` dark |
| Border hover | `var(--border-hover)` | `#9EA4B3` |
| Border disabled / read-only | `var(--border)` | `#DFE1E6` light / `#2D313D` dark |
| Border active / focus | `var(--selected)` | `#EDA30D` light / `#FFBB38` dark |
| Border error | `var(--text-error)` | `#DF1642` light / `#E95C7B` dark |
| Value text (something selected) | `var(--text-primary)` | `#20222A` |
| Placeholder text (nothing selected) | `var(--text-disabled)` | `#9EA4B3` light / `#656B7C` dark |
| Label text | `var(--text-secondary)` | `#454C5E` light / `#BFC2CC` dark |
| Helper text | `var(--text-tertiary)` | `#9EA4B3` |
| Read-only text / icon | `var(--text-disabled)` | `#9EA4B3` light / `#656B7C` dark |
| Radius | `var(--radius-sm)` | `12px` |
| Medium padding | `var(--space-s) var(--space-sm)` | `8px 12px` |

## Accessibility

```tsx
// ARIA
<button aria-haspopup="listbox" aria-expanded={isActive} aria-disabled={readOnly} />  // no role="combobox" yet
<ul role="listbox" />
<button role="option" aria-selected={isSelected} />
```

Keyboard today: `Enter` / `Space` opens (native button), `Esc` closes, `Tab` moves focus. `role="combobox"` on the trigger and `↑ ↓` option navigation are the target but are not built yet. Focus-visible shows the `--selected` active border.

## Examples

Use the shared component; don't re-implement it. Sizes are `'sm' | 'md' | 'lg'`; `multiple`, `searchable` and `radio` are built in.

```tsx
import Dropdown from '@/components/Dropdown/Dropdown'

<Dropdown
  label="Department"
  options={[{ value: 'hr', label: 'HR' }, { value: 'finance', label: 'Finance' }]}
  value={department}
  onChange={setDepartment}
/>
```

Filter in a toolbar (leading icon + hug content):

```tsx
<Dropdown
  size="md"
  iconLeft={<Sort size={20} color="var(--text-primary)" variant="Linear" />}
  value={timeframe}
  onChange={setTimeframe}
  options={[
    { value: 'next-30-days', label: 'Next 30 Days' },
    { value: 'all-time', label: 'All Time' },
  ]}
/>
```

Required form field:

```tsx
<Dropdown
  label="Department *"
  options={departments}
  error={errors.department}
  helperText="Select the learner's department"
  onChange={(v) => setField('department', v)}
/>
```

## Related

- [listbox.md](listbox.md) - the menu surface the trigger opens
- [input.md](input.md) - shared field label, placeholder and error rules
- [search.md](search.md) - filter by typing
- [date-picker-field.md](date-picker-field.md) - date entry
