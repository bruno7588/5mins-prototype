---
name: 5mins-search
description: Search input component for 5Mins.ai. Use when implementing any search field, filter input, or keyword search bar in the admin or learner UI. Covers two sizes (M/L), three states (Enabled, Hover, Active/focused), and filled vs empty modes with a clear button. Trigger this skill whenever building a search box, search bar, or any input whose primary purpose is filtering or finding content.
---

# 5Mins.ai Search Component

A standalone search input with a leading search icon, placeholder text, and a clear (×) button when there is text.

Spec source: Figma Library — light `11927:6338` / dark `697:33529` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`). Reference width in Figma: 400px.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"M" \| "L"` | `"M"` | Controls padding, border-radius, icon size, and font size |
| `state` | `"Enabled" \| "Hover" \| "Active"` | `"Enabled"` | Visual state — map to `:hover` and `:focus-within` in CSS |
| `filled` | `boolean` | `false` | Whether the input has a value (shows clear button, value text) |
| `value` | `string` | `""` | Current input value |
| `placeholder` | `string` | `"Search"` | Placeholder text shown when empty |
| `onChange` | `(value: string) => void` | — | Called on every keystroke |
| `onClear` | `() => void` | — | Called when the clear (×) button is clicked |

---

## Visual Spec

### Size M

```
Border-radius:  12px   (--radius-sm)
Padding:        8px 12px   (--space-s --space-sm)
Gap:            8px    (--space-s)
Search icon:    18 × 18px
Clear icon:     20 × 20px
Font:           Poppins 14px / 1.5  (Regular 400)
```

### Size L

```
Border-radius:  16px   (--radius-m)
Padding:        12px 16px  (--space-sm --space-m)
Gap:            12px   (--space-sm)
Search icon:    20 × 20px
Clear icon:     24 × 24px
Font:           Poppins 16px / 1.5  (Regular 400)
```

---

## States

| State | Background | Border (1px) |
|---|---|---|
| Enabled | `--input-background` | `--border` |
| Hover | `--input-background-hover` | `--border-hover` |
| Active (focused) | `--input-background` | `--selected` (`#EDA30D` light / `#FFBB38` dark) |

- The border is the primary state signal — background only changes on Hover.
- **Search keeps the quiet `--border`, not `--border-elevated`.** It is the one field that carries a fill at rest, so it does not need the stronger edge the transparent fields (input, dropdown, date) use to define themselves. Both Figma nodes agree — the dark set has no `Border-elevated` binding at all. Do not "fix" this to match the other fields.
- Token rule: **form-field active borders use the mode-aware `--selected` token** (same as inputs, dropdowns, date fields).
- In Figma, Active is modeled on the unfilled variant and shows in-progress typing (value text + clear button) — i.e. Active = focused, whatever the content; `filled` styling applies once the field has a value.

---

## Anatomy

### Empty
```
[ SearchIcon ] [ placeholder text ]
```

### Filled / typing
```
[ SearchIcon ] [ value text          ] [ × ]
```

- **SearchIcon** — Iconsax `SearchNormal1` Outline, `--text-tertiary` (18px M / 20px L)
- **Placeholder** — Regular 400, `--text-tertiary`
- **Value text** — Regular 400, `--text-primary`, `flex: 1`
- **Clear** — `IoCloseOutline` (io5 set, same glyph as dismissible badges), 20px M / 24px L, `--text-tertiary`, calls `onClear`

---

## React TypeScript Implementation

```tsx
import React, { useState, useRef } from 'react';
import { SearchNormal1 } from 'iconsax-react';
import { IoCloseOutline } from 'react-icons/io5';

type SearchSize = 'M' | 'L';

interface SearchProps {
  size?: SearchSize;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const Search: React.FC<SearchProps> = ({
  size = 'M',
  value = '',
  placeholder = 'Search',
  onChange,
  onClear,
  className,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filled = value.length > 0;
  const iconSize = size === 'L' ? 20 : 18;
  const clearSize = size === 'L' ? 24 : 20;

  return (
    <div
      className={`search search--${size.toLowerCase()} ${focused ? 'search--active' : ''} ${className || ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <SearchNormal1 size={iconSize} color="var(--text-tertiary)" variant="Outline" className="search__icon" />

      <input
        ref={inputRef}
        type="text"
        className="search__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={placeholder}
      />

      {filled && (
        <button
          className="search__clear"
          onClick={(e) => { e.stopPropagation(); onClear?.(); }}
          aria-label="Clear search"
        >
          <IoCloseOutline size={clearSize} />
        </button>
      )}
    </div>
  );
};
```

---

## CSS

```css
/* ── Base ── */
.search {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--input-background);
  cursor: text;
  width: 100%;
  transition: border-color 150ms ease, background 150ms ease;
}

/* ── Size M ── */
.search--m {
  gap: var(--space-s);                /* 8px */
  padding: var(--space-s) var(--space-sm);   /* 8px 12px */
  border-radius: var(--radius-sm);    /* 12px */
}

/* ── Size L ── */
.search--l {
  gap: var(--space-sm);               /* 12px */
  padding: var(--space-sm) var(--space-m);   /* 12px 16px */
  border-radius: var(--radius-m);     /* 16px */
}

/* ── Hover ── */
.search:hover {
  background: var(--input-background-hover);
  border-color: var(--border-hover);
}

/* ── Active / Focused ── */
.search--active,
.search:focus-within {
  background: var(--input-background);
  border-color: var(--selected);      /* mode-aware amber */
}

/* ── Input ── */
.search__input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
}

.search--m .search__input { font-size: 14px; }
.search--l .search__input { font-size: 16px; }

.search__input::placeholder { color: var(--text-tertiary); }

/* ── Clear button ── */
.search__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--text-tertiary);
}
.search__clear:hover { color: var(--text-secondary); }
.search__clear:focus-visible {
  outline: 2px solid var(--selected);
  border-radius: var(--radius-xs);
}
```

---

## Token Summary

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--input-background` | `#BFC2CC` @16% | `#454C5E` @16% | Default + Active background |
| `--input-background-hover` | `#DFE1E6` (Neutral-100) | `#2D313D` (Neutral-700) | Hover background |
| `--border` / `--border-hover` | `#DFE1E6` / `#9EA4B3` | `#2D313D` / `#9EA4B3` | Default / hover border |
| `--selected` | `#EDA30D` | `#FFBB38` | Active/focused border |
| `--text-primary` | `#20222A` | `#F9F9FA` | Value text |
| `--text-tertiary` | `#9EA4B3` | `#9EA4B3` | Placeholder + icons |

---

## Do / Don't

✓ Use size **L** for prominent page-level search (top of a table, main content search)
✓ Use size **M** for compact search within panels, drawers, or filter rows
✓ Always show the clear button when there is text — never hide it on hover only
✓ Use `:focus-within` on the wrapper (not just the `<input>`) to trigger Active state
✓ Derive `filled` from `value.length > 0`

✗ Don't use a `<form>` wrapper — handle search with `onChange` and `onKeyDown` directly
✗ Don't show a submit/search button — the search icon is decorative, not interactive
✗ Don't use raw `--secondary-500` for the active border — use mode-aware `--selected`
✗ Don't change font weight on focus or fill — always Regular 400

---

## Code reality

`src/components/Search/Search.tsx` implements this component. Drift from the node: the active border uses raw `--secondary-500` instead of `--selected` (`Search.css` line ~37 — a one-line fix), and the clear glyph is an Iconsax `Add` rotated to an × instead of io5 `IoCloseOutline`. Sizes, padding, radius, and the other state tokens match.

## Related Skills

- `input.md` — full text input component (labels, validation, helper text); use Search for search-specific UX, Input for form fields
- `5mins-colors` (colors.md) — surface, border, and text tokens
- `iconography.md` — Iconsax icon sizing and variant rules
- `listbox.md` — the embedded search row pinned inside long menus
