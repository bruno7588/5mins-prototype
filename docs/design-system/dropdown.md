---
name: dropdown
description: Dropdown / Select component for 5Mins.ai. Covers states (Enabled, Hover, Active, Read-only), optional leading icon, label (top / start) and helper text, all size variants. Always use this skill when building a dropdown, select field, combobox, filter selector, or option picker.
---

# 5Mins.ai Dropdown Component

> **Figma source:** [Library → Dropdown](https://www.figma.com/design/EC26cSVe9KNTCWXvYovakw/Library?node-id=11659-2103)

Implementation guide for the 5Mins.ai Dropdown/Select. Cross-reference with `surface-colors`, `brand-colors`, `typography`, and `iconography` for raw token values.

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
| **Size** | Small (33px), Medium (41px), Large (48px) |

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
  border: 1px solid var(--border);          /* #DFE1E6 */
  border-radius: var(--radius-sm);          /* 12px */
  padding: 8px 16px;                        /* --s, --m */
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
  background: var(--page-background-hover); /* #EFF0F2 */
  border-color: var(--border-hover);        /* #9EA4B3 */
}
```

### Active (open / focused)

```css
.dropdown-trigger.is-active,
.dropdown-trigger:focus-visible {
  background: transparent;
  border-color: var(--selected);            /* #FFBB38 */
  outline: none;
}
```

### Read-only (disabled)

```css
.dropdown-trigger[aria-disabled="true"] {
  background: transparent;
  border-color: var(--border);
  color: var(--text-disabled);              /* #656B7C */
  cursor: not-allowed;
}
```

The leading-icon (when present) is also tinted `--text-disabled` in read-only state.

### Error (extension — not in the Figma library, follow pattern)

```css
.dropdown-trigger.has-error { border-color: var(--danger-500); }  /* #DF1642 */
.dropdown-trigger.has-error:hover { border-color: var(--danger-600); }
```

### Size variants

| Size | Height | Padding | Font | Icon |
|------|--------|---------|------|------|
| Small | 33px | 4px 12px | 12px | 16px |
| **Medium (default)** | 41px | 8px 16px | 14px | 20px |
| Large | 48px | 12px 16px | 16px | 20px |

```css
.dropdown-sm .dropdown-trigger { height: 33px; padding: 4px 12px; font-size: 12px; }
.dropdown-md .dropdown-trigger { height: 41px; padding: 8px 16px;  font-size: 14px; }
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

The leading icon color follows the current trigger text color (`--text-primary` Enabled/Hover/Active, `--text-disabled` Read-only).

### Chevron icon

Use `ArrowDown2` from Iconsax. Rotate 180° in the Active state, OR swap to `ArrowUp2` to mirror the Figma asset exactly.

```css
.dropdown-chevron { transition: transform 150ms ease; }
.dropdown-trigger.is-active .dropdown-chevron { transform: rotate(180deg); }
```

Chevron color tracks the current text color.

---

## Menu (not fully specced in the Figma library)

The Figma library node focuses on trigger states. The menu below is the recommended pattern — extrapolated from related DS surfaces. Use it as the default until a dedicated Figma menu node exists.

```css
.dropdown-menu {
  position: absolute;
  z-index: 1000;
  margin-top: 4px;
  min-width: 160px;
  max-height: 240px;
  overflow-y: auto;
  background: var(--neutral-25);            /* #F9F9FA */
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);          /* 12px — match trigger */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 4px 0;
  list-style: none;
}

.dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 100ms ease;
}

.dropdown-option:hover { background: var(--page-background-hover); }

.dropdown-option.is-selected {
  background: var(--selected);              /* #FFBB38 */
  color: var(--text-primary);
  font-weight: 500;
}

.dropdown-option.is-disabled {
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

A 16px `TickCircle` (color `--selected`) marks the selected option.

---

## Label

Two placements supported in the Figma library: **top** (default) and **start** (inline to the left).

```css
.dropdown-label {
  font: 500 14px/1.4 'Poppins', sans-serif;
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
  margin-top: 4px;
}
.dropdown-helper.is-error { color: var(--danger-500); }
```

Visible only when `helperText` is true (matches the Figma variant). In error state, the helper text replaces the neutral helper.

---

## React TypeScript Implementation

```tsx
import { useState, useRef, useEffect, ReactNode } from 'react';
import { ArrowDown2, TickCircle } from 'iconsax-react';

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
                  {isSelected && (
                    <TickCircle size={16} color="var(--selected)" variant="Bold" />
                  )}
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
<button role="combobox" aria-expanded={isActive} aria-haspopup="listbox" aria-disabled={readOnly} />
<ul role="listbox" />
<button role="option" aria-selected={isSelected} />
```

Keyboard: `Enter` / `Space` opens, `Esc` closes, `Tab` closes and moves focus, `↑ ↓` navigates options.

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
| Trigger background (Hover) | `--page-background-hover` | `#EFF0F2` |
| Border default | `--border` | `#DFE1E6` |
| Border hover | `--border-hover` | `#9EA4B3` |
| Border active / focus | `--selected` | `#FFBB38` |
| Border error | `--danger-500` | `#DF1642` |
| Value text | `--text-primary` | `#20222A` |
| Label text | `--text-secondary` | `#BFC2CC` |
| Helper text | `--text-tertiary` | `#9EA4B3` |
| Read-only text / icon | `--text-disabled` | `#656B7C` |
| Radius | `--radius-sm` | `12px` |
| Medium padding | `--s --m` | `8px 16px` |

---

## Change Log

- **2026-04-14** — Rewritten to match the Figma library (node `11659:2103`). Corrected: trigger radius is `12px` (not 8px); trigger background is transparent (not filled `--surface-input`); hover bg is `--page-background-hover` (not `--surface-input-hover`); padding for medium is `8px 16px` (not `10px 16px`); state names are **Enabled / Hover / Active / Read-only**; `iconLeft` is first-class. Multi-select and searchable-within-dropdown are not in the current Figma library node and have been removed from the doc until they are added.
