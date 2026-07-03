---
name: 5mins-search
description: Search input component for 5Mins.ai. Use when implementing any search field, filter input, or keyword search bar in the admin or learner UI. Covers two sizes (M/L), three states (Enabled, Hover, Active/focused), and filled vs empty modes with a clear button. Trigger this skill whenever building a search box, search bar, or any input whose primary purpose is filtering or finding content.
---

# 5Mins.ai Search Component

A standalone search input with a leading search icon, placeholder text, and a clear (×) button when filled.

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
Border-radius:  12px   (--spacing-sm)
Padding:        8px 12px   (--spacing-s --spacing-sm)
Gap:            8px    (--spacing-s)
Search icon:    18 × 18px
Clear icon:     20 × 20px
Font:           Poppins 14px / 1.5  (Regular 400)
```

### Size L

```
Border-radius:  16px   (--spacing-m)
Padding:        12px 16px  (--spacing-sm --spacing-m)
Gap:            12px   (--spacing-sm)
Search icon:    20 × 20px
Clear icon:     24 × 24px
Font:           Poppins 16px / 1.5  (Regular 400)
```

---

## States

| State | Background | Border |
|---|---|---|
| Enabled | `--surface-input` → `rgba(191,194,204,0.16)` | `--border-default` → `#383D4C` dark |
| Hover | `--surface-input-hover` → `#2D313D` (Neutral-700) | `--border-hover` → `#9EA4B3` |
| Active (focused) | `--surface-input` | `--surface-selected` → `#FFBB38` |

> The border changes are the primary state signal — background only changes on Hover.

---

## Anatomy

### Empty state (not filled)
```
[ SearchIcon ] [ placeholder text ]
```

### Filled state (has value)
```
[ SearchIcon ] [ value text ] [ CloseIcon × ]
```

- **SearchIcon** — Iconsax `SearchNormal1` or equivalent, `Outline` variant, color `--text-tertiary`
- **Placeholder** — `--text-tertiary` color, Regular 400
- **Value text** — `--text-primary` color, Regular 400, `flex: 1`
- **CloseIcon** — Iconsax `CloseCircle` or `IoCloseOutline` (20px M / 24px L), clickable, calls `onClear`, color `--text-tertiary`

---

## React TypeScript Implementation

```tsx
import React, { useState, useRef } from 'react';
import { SearchNormal1, CloseCircle } from 'iconsax-react';

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
      <SearchNormal1
        size={iconSize}
        variant="Outline"
        className="search__icon"
      />

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
          tabIndex={0}
        >
          <CloseCircle size={clearSize} variant="Outline" className="search__clear-icon" />
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
  border: 1px solid var(--border-default);
  background: var(--surface-input);
  cursor: text;
  width: 100%;
  transition: border-color 0.15s ease, background 0.15s ease;
}

/* ── Size M ── */
.search--m {
  gap: 8px;                  /* --spacing-s */
  padding: 8px 12px;         /* --spacing-s --spacing-sm */
  border-radius: 12px;       /* --spacing-sm */
}

/* ── Size L ── */
.search--l {
  gap: 12px;                 /* --spacing-sm */
  padding: 12px 16px;        /* --spacing-sm --spacing-m */
  border-radius: 16px;       /* --spacing-m */
}

/* ── Hover ── */
.search:hover {
  background: var(--surface-input-hover);   /* #2D313D — Neutral-700 */
  border-color: var(--border-hover);        /* #9EA4B3 */
}

/* ── Active / Focused ── */
.search--active,
.search:focus-within {
  background: var(--surface-input);
  border-color: var(--surface-selected);   /* #FFBB38 */
}

/* ── Search icon ── */
.search__icon {
  flex-shrink: 0;
  color: var(--text-tertiary);             /* #9EA4B3 */
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
  color: var(--text-primary);              /* #F9F9FA */
}

.search--m .search__input { font-size: 14px; }
.search--l .search__input { font-size: 16px; }

.search__input::placeholder {
  color: var(--text-tertiary);             /* #9EA4B3 */
}

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

.search__clear:hover {
  color: var(--text-secondary);
}

.search__clear:focus-visible {
  outline: 2px solid var(--surface-selected);
  border-radius: 4px;
}
```

---

## Variants at a Glance

| Size | State | Filled | Border | Background |
|---|---|---|---|---|
| M | Enabled | ✗ | `--border-default` | `--surface-input` |
| M | Hover | ✗ | `--border-hover` | `--surface-input-hover` |
| M | Active | ✗ | `--surface-selected` | `--surface-input` |
| M | Enabled | ✓ | `--border-default` | `--surface-input` |
| M | Hover | ✓ | `--border-hover` | `--surface-input-hover` |
| L | Enabled | ✗ | `--border-default` | `--surface-input` |
| L | Hover | ✗ | `--border-hover` | `--surface-input-hover` |
| L | Active | ✗ | `--surface-selected` | `--surface-input` |
| L | Enabled | ✓ | `--border-default` | `--surface-input` |
| L | Hover | ✓ | `--border-hover` | `--surface-input-hover` |

> **Note:** Active state only appears on unfilled (empty) inputs in Figma. Once filled, Hover is the elevated state.

---

## Token Summary

| Token | Value | Used for |
|---|---|---|
| `--surface-input` | `rgba(191,194,204,0.16)` | Default background |
| `--surface-input-hover` | `#2D313D` (Neutral-700) | Hover background |
| `--surface-selected` | `#FFBB38` (Secondary-500) | Active/focused border |
| `--border-default` | `#383D4C` (Neutral-600) | Default border |
| `--border-hover` | `#9EA4B3` (Neutral-300) | Hover border |
| `--text-primary` | `#F9F9FA` (Neutral-25) | Input value text |
| `--text-tertiary` | `#9EA4B3` (Neutral-300) | Placeholder + icons |
| `--spacing-s` | `8px` | M gap, M vertical padding |
| `--spacing-sm` | `12px` | M horizontal padding, M radius, L gap, L vertical padding |
| `--spacing-m` | `16px` | L horizontal padding, L radius |

---

## Do / Don't

✓ Use size **L** for prominent page-level search (top of a table, main content search)
✓ Use size **M** for compact search within panels, drawers, or filter rows
✓ Always show the clear button when `filled` — never hide it on hover only
✓ Use `:focus-within` on the wrapper (not just the `<input>`) to trigger Active state
✓ Manage `filled` state externally — derive it from `value.length > 0`

✗ Don't use a `<form>` wrapper — handle search with `onChange` and `onKeyDown` directly
✗ Don't show a submit/search button — the search icon is decorative, not interactive
✗ Don't use `--border-elevated` for the active border — use `--surface-selected` (yellow)
✗ Don't change font weight on focus or fill — always Regular 400

---

## Related Skills

- `5mins-inputs` — full text input component (labels, validation, helper text); use Search for search-specific UX, Input for form fields
- `5mins-surface-colors` — `--surface-input`, `--surface-input-hover`, `--surface-selected`, `--border-default`, `--border-hover` tokens
- `5mins-text-colors` — `--text-primary`, `--text-tertiary` tokens
- `5mins-iconography` — Iconsax icon sizing and variant rules
