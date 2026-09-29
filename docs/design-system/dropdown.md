---
name: dropdown
description: Dropdown / Select component for 5Mins.ai. Covers states (Enabled, Hover, Active, Read-only), optional leading icon, label (top / start) and helper text, all size variants. Always use this skill when building a dropdown, select field, combobox, filter selector, or option picker.
---

# 5Mins.ai Dropdown Component

> **Figma source:** Library (`EC26cSVe9KNTCWXvYovakw`) — light `11920:5290` / dark `8925:1408` (verified 2026-07-03; earlier baseline node `11659:2103`)

Implementation guide for the 5Mins.ai Dropdown/Select. Cross-reference with `colors`, `typography`, and `iconography` for raw token values.

> **Updated 2026-09-29 (verified against code):** the superseded Menu sketch (selected `--secondary-500` + `--neutral-800`, `TickCircle`) is replaced by what `Dropdown.css` draws (`--selected` / `--text-on-selected`, no tick) and the React sketch no longer renders a tick; error helper text is `--text-error`; `role="combobox"` and arrow-key navigation marked as not built; the read-only leading-icon grey now depends on `currentColor`; Dropdown and InputField now share the `--text-error` error border (ruled 2026-09-29); the menu border is now `--border-elevated`, matching Figma `9162:1042`.

> **Updated 2026-09-29 (aligned to prototype usage):** the built Dropdown supports multi-select (`multiple`, `values`, `onChangeValues`, `allLabel`, `summaryLabel`), option `description` lines, `menuClassName` and `menuAlign`, and portals its menu to `<body>`. The 2026-04-14 changelog line saying multi-select was removed no longer holds, and the "React TypeScript Implementation" sketch below predates these props; `src/components/Dropdown/Dropdown.tsx` is the reference.

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

**Don't**
- Don't give the trigger a fill at rest; it is transparent with a border only.
- Don't use raw `--secondary-500` for the active border or the selected row; use the mode-aware `--selected`.
- Don't use `--danger-500` for the error border; Dropdown and InputField share `--text-error`, held on hover.
- Don't copy the `.dropdown-*` classes into a new component; extend `Dropdown` instead.

**Canonical spec:** md trigger 37px high, padding `var(--space-s) var(--space-sm)` (8px 12px), radius `var(--radius-sm)` (12px), text 14px / 400 / 1.5; sm is 33px with 4px 12px padding and 12px text. Border `--border-elevated`, hover `--border-hover` + `--input-background`, open or focused `--selected`, read-only `--border` with `--text-disabled`, error `--text-error`. Placeholder `--text-disabled`, label Paragraph M semibold `--text-secondary`, helper `--text-tertiary`. Menu: `--cards-background`, radius `var(--radius-sm)` (12px), padding `var(--space-s)` (8px), max height 240px, selected row `--selected` with `--text-on-selected`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11920:5290` / dark `8925:1408`.

**Prototype:** `src/components/Dropdown/Dropdown.tsx` (default export)
- `options` (`value`, `label`, optional `description`, `disabled`), `value`, `onChange`, `placeholder` (default "Select")
- `size`: `'sm' | 'md' | 'lg'` (default `'md'`); `label` with `labelPlacement` `'top' | 'start'`; `helperText`; `error`
- `iconLeft`; `readOnly`
- `multiple` with `values`, `onChangeValues`, `allLabel`, `summaryLabel`
- `className`, `menuClassName`, `menuAlign` `'start' | 'end'`

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Dropdown | _to be mapped by engineering_ | | |

---

## Component Architecture

1. **Trigger** — the always-visible field the user clicks to open
2. **Menu** — the floating list of options (not fully specced in the Figma library; use the pattern in the "Menu" section below)
3. **Label** (optional) — top or start
4. **Helper / Error text** (optional) — below the trigger

```
┌─────────────────────────────┐  ← Trigger (transparent, bordered)
│  ⇅  Input              ▾    │
└─────────────────────────────┘
```

---

## Variant Matrix

| Dimension | Options |
|-----------|---------|
| **State** | Enabled, Hover, Active, Read-only |
| **Leading icon** | With icon, Without icon |
| **Label** | No label, Label on top, Label on start |
| **Helper text** | With, Without |
| **Size** | Small (33px), Medium (37px), Large (48px) |

States in the Figma library are exactly **Enabled / Hover / Active / Read-only**. There is no separate "Selected" or "Open" state at the trigger level — `Active` covers the open/focused state. Use `aria-disabled` + the Read-only styling for disabled.

---

## Trigger — Anatomy & Tokens

The trigger is **transparent by default** with only a border — it is *not* a filled input. Radius is `12px` (`--radius-sm`).

### Enabled (default)

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
```

### Hover

```css
.dropdown-trigger:hover {
  background: var(--input-background);      /* translucent tint — light: #BFC2CC @16% */
  border-color: var(--border-hover);        /* #9EA4B3 */
}
```

### Active (open / focused)

```css
.dropdown-trigger.is-active,
.dropdown-trigger:focus-visible {
  background: transparent;
  border-color: var(--selected);            /* mode-aware: #EDA30D light / #FFBB38 dark */
  outline: none;
}
```

> All form-field active borders (dropdown, date field, inputs, search) use the mode-aware `--selected` token (`#EDA30D` light / `#FFBB38` dark), the same token as selection fills.

### Read-only (disabled)

```css
.dropdown-trigger[aria-disabled="true"] {
  background: transparent;
  border-color: var(--border);
  color: var(--text-disabled);              /* #656B7C */
  cursor: not-allowed;
}
```

The leading icon (when present) greys to `--text-disabled` in read-only only if the caller passes `color="currentColor"`; `.dropdown-trigger-leading` sets no colour, so an icon given an explicit colour keeps it.

### Error (extension — not in the Figma library, follow pattern)

```css
.dropdown-trigger.has-error,
.dropdown-trigger.has-error:hover { border-color: var(--text-error); }
```

The error border and helper text are both `var(--text-error)`, the same token InputField uses (`InputField.css`).

### Size variants

| Size | Height | Padding | Font | Icon |
|------|--------|---------|------|------|
| Small | 33px | 4px 12px | 12px | 16px |
| **Medium (default)** | 37px | 8px 12px | 14px | 20px |
| Large | 48px | 12px 16px | 16px | 20px |

```css
.dropdown-sm .dropdown-trigger { height: 33px; padding: 4px 12px; font-size: 12px; }
.dropdown-md .dropdown-trigger { height: 37px; padding: 8px 12px;  font-size: 14px; }
.dropdown-lg .dropdown-trigger { height: 48px; padding: 12px 16px; font-size: 16px; }
```

### Leading icon (`iconLeft`)

First-class in the Figma library. Use any Iconsax Linear icon at the size matching the trigger. In the reference flows the icon is `Sort` at 20px (medium).

```tsx
<Dropdown
  size="md"
  iconLeft={<Sort size={20} color="var(--text-primary)" variant="Linear" />}
  // ...
/>
```

With `color="currentColor"` the leading icon follows the trigger text colour (`--text-primary` Enabled/Hover/Active, `--text-disabled` Read-only). Current call sites pass an explicit colour, so their icon does not grey in read-only.

### Chevron icon

Use `ArrowDown2` from Iconsax. Rotate 180° in the Active state, OR swap to `ArrowUp2` to mirror the Figma asset exactly.

```css
.dropdown-chevron { transition: transform 150ms ease; }
.dropdown-trigger.is-active .dropdown-chevron { transform: rotate(180deg); }
```

Chevron color is `--text-secondary`, not the value's colour — it is the control's affordance, not part of the text. Read-only tints it `--text-disabled` with the rest of the trigger.

---

## Menu

> **Superseded, see Usage and `listbox.md`:** the older menu sketch that stood here (selected row `--secondary-500` + `--neutral-800`, a `TickCircle` on the selected option, `--neutral-25` fill) no longer matches the built component and has been removed.

What `src/components/Dropdown/Dropdown.css` draws today:

- `.dropdown-menu`: portalled to `<body>`, `position: fixed`, `z-index: 1060`, `var(--cards-background)`, 1px border, radius `var(--radius-sm)` (12px), `var(--shadow-l)`, padding `var(--space-s)` (8px), max height 240px then scroll.
- `.dropdown-option`: padding `var(--space-s) var(--space-sm)` (8px 12px), radius `var(--radius-s)` (8px), 14px / 400 / 1.5 `var(--text-primary)`; hover `var(--cards-background-hover)`.
- Selected: `var(--selected)` fill with `var(--text-on-selected)` text at weight 500. No tick icon.
- Disabled: `var(--text-disabled)`, not clickable.
- Option with `description`: label 600 over a `var(--text-secondary)` description that may wrap.

The menu border is `var(--border-elevated)` (Figma `9162:1042`), as `RowActionsMenu` uses; `--border` would vanish against `--cards-background` in dark mode.

---

## Label

Two placements supported in the Figma library: **top** (default) and **start** (inline to the left).

```css
.dropdown-label {
  font: 600 14px/1.5 'Poppins', sans-serif; /* Paragraph M semibold — the label weight */
  color: var(--text-secondary);             /* #BFC2CC — Figma value */
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

---

## Helper / Error text

```css
.dropdown-helper {
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-tertiary);              /* #9EA4B3 */
  margin-top: 8px;                          /* column gap --s */
}
.dropdown-helper.is-error { color: var(--text-error); }
```

Visible only when `helperText` is true (matches the Figma variant). In error state, the helper text replaces the neutral helper.

---

## React TypeScript Implementation

```tsx
import { useState, useRef, useEffect, ReactNode } from 'react';
import { ArrowDown2 } from 'iconsax-react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  labelPlacement?: 'top' | 'start';
  helperText?: string;
  error?: string;
  iconLeft?: ReactNode;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: string) => void;
  className?: string;
}

export function Dropdown({
  options,
  value,
  placeholder = 'Select',
  label,
  labelPlacement = 'top',
  helperText,
  error,
  iconLeft,
  readOnly = false,
  size = 'md',
  onChange,
  className = '',
}: DropdownProps) {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsActive(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div
      ref={ref}
      className={[
        'dropdown-field',
        `dropdown-${size}`,
        labelPlacement === 'start' && 'label-start',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label && <label className="dropdown-label">{label}</label>}

      <button
        type="button"
        className={[
          'dropdown-trigger',
          isActive && 'is-active',
          error && 'has-error',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="listbox"
        aria-expanded={isActive}
        aria-disabled={readOnly}
        disabled={readOnly}
        onClick={() => !readOnly && setIsActive((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsActive(false);
        }}
      >
        {iconLeft && <span className="dropdown-trigger-leading">{iconLeft}</span>}
        <span className="dropdown-trigger-text">
          {selected?.label ?? placeholder}
        </span>
        <ArrowDown2
          size={size === 'sm' ? 16 : 20}
          color="currentColor"
          variant="Linear"
          className="dropdown-chevron"
        />
      </button>

      {isActive && (
        <ul className="dropdown-menu" role="listbox">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={[
                    'dropdown-option',
                    isSelected && 'is-selected',
                    opt.disabled && 'is-disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange?.(opt.value);
                    setIsActive(false);
                  }}
                >
                  <span>{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {(error || helperText) && (
        <span className={`dropdown-helper${error ? ' is-error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
}
```

---

## Accessibility

```tsx
// ARIA
<button aria-haspopup="listbox" aria-expanded={isActive} aria-disabled={readOnly} />  // no role="combobox" yet
<ul role="listbox" />
<button role="option" aria-selected={isSelected} />
```

Keyboard today: `Enter` / `Space` opens (native button), `Esc` closes, `Tab` moves focus. `role="combobox"` on the trigger and `↑ ↓` option navigation are the target but are not built yet.

---

## Common Patterns

### Filter in a toolbar (leading icon + hug content)

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

Constrain the width at the wrapper level (`<div style={{ width: 'auto' }}>` or a utility class) rather than mutating the component.

### Required form field

```tsx
<Dropdown
  label="Department *"
  options={departments}
  error={errors.department}
  helperText="Select the learner's department"
  onChange={(v) => setField('department', v)}
/>
```

---

## Token Quick Reference

| Context | Token | Value |
|---|---|---|
| Trigger background (Enabled/Active) | *none (transparent)* | — |
| Trigger background (Hover) | `--input-background` | `#BFC2CC` @16% light / `#454C5E` @16% dark |
| Border default | `--border-elevated` | `#DFE1E6` light / `#383D4C` dark |
| Border hover | `--border-hover` | `#9EA4B3` |
| Border disabled / read-only | `--border` | `#DFE1E6` light / `#2D313D` dark |
| Border active / focus | `--selected` | `#EDA30D` light / `#FFBB38` dark |
| Border error | `--text-error` | `#DF1642` light / `#E95C7B` dark |
| Value text (something selected) | `--text-primary` | `#20222A` |
| Placeholder text (nothing selected) | `--text-disabled` | `#9EA4B3` light / `#656B7C` dark |
| Label text | `--text-secondary` | `#454C5E` light / `#BFC2CC` dark |
| Helper text | `--text-tertiary` | `#9EA4B3` |
| Read-only text / icon | `--text-disabled` | `#9EA4B3` light / `#656B7C` dark |
| Radius | `--radius-sm` | `12px` |
| Medium padding | `--s --sm` | `8px 12px` |

---

## Change Log

- **2026-09-22** — Re-verified the trigger against library `8925:1408`. **Medium is 37px**: that node states no height at all, and 37px is the frame with its 1px stroke drawn inside, so the stated frame wins over padding arithmetic (the same way `lg`'s 48px does). The overview table's `41px` had no source and is gone, and the `md` CSS rule now carries the height like `sm` and `lg` do. Chevron colour is `--text-secondary`, not the value's colour. `--border-elevated` is `#DFE1E6` in light, not `#BFC2CC`. Note that node has **no size axis** — Small and Large are not in it and still need their own link.
- **2026-07-03** — Re-verified against light `11920:5290` / dark `8925:1408`. Corrected: medium padding is `8px 12px` (not `8px 16px`); hover background is the translucent `--input-background` (not `--page-background-hover`); label line-height 1.5; helper gap 8px; token table now lists light/dark values.
- **2026-04-14** — Rewritten to match the Figma library (node `11659:2103`). Corrected: trigger radius is `12px` (not 8px); trigger background is transparent (not filled `--surface-input`); hover bg is `--page-background-hover` (not `--surface-input-hover`); padding for medium is `8px 16px` (not `10px 16px`); state names are **Enabled / Hover / Active / Read-only**; `iconLeft` is first-class. Multi-select and searchable-within-dropdown are not in the current Figma library node and have been removed from the doc until they are added. (Superseded 2026-09-29: the built component now supports multi-select; see Usage.)
