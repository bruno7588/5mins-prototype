---
name: 5mins-search
description: Search input component for 5Mins.ai. Use when implementing any search field, filter input, or keyword search bar in the admin or learner UI. Covers two sizes (M/L), three states (Enabled, Hover, Active/focused), and filled vs empty modes with a clear button. Trigger this skill whenever building a search box, search bar, or any input whose primary purpose is filtering or finding content.
---

# 5Mins.ai Search Component

A standalone search input with a leading search icon, placeholder text, and a clear (×) button when there is text.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — light `11927:6338` / dark `697:33529` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`). Reference width in Figma: 400px.

> **Updated 2026-09-29 (verified against code):** the clear icon is `--text-secondary` in the Token Summary and CSS sketch (the sketch also now shows the built hover and the cyan focus ring); the Do / Don't no longer mentions an `onKeyDown` prop, which does not exist.

> **Updated 2026-09-29 (clear button):** the clear (×) hover is a circular `--input-background-hover` fill with the icon moving to `--text-primary`, replacing the opacity fade; the hit area is 24px (28px at L), padded inside a negative margin so the field height is unchanged.

> **Updated 2026-09-29 (aligned to prototype usage):** every call site in the prototype uses size **M**, including page-level searches (Programs header, course list, My Team toolbar), so the size guidance in "Do / Don't" now says M is the default everywhere and L is unused. "Code reality" now reflects that the active border already uses `--selected` and lists the built props.

## Usage

**Intent:** a field whose only job is to narrow a list, table or menu as the user types.

**Use when**
- Filtering a table or list on a page, e.g. "Search for courses", "Search programs", "Search for learners".
- Filtering inside a drawer or picker, e.g. the course picker and enrol-people drawers.
- Typeahead over a listbox, e.g. the automation course search or the "Search filters" row pinned in a menu.

**Don't use when**
- The value is form data that gets saved → use InputField ([doc](input.md))
- The user picks from a short fixed list → use Dropdown ([doc](dropdown.md))

**Do**
- Use the `Search` component; don't hand-roll a `SearchNormal1` icon next to a raw `<input>`.
- Use size `M`; it is the size every prototype call site uses, including page-level searches.
- Pass `ariaLabel` (it falls back to the placeholder) so the field has an accessible name.
- Filter on `onChange`; the leading search icon is decoration, not a submit button.
- Let the built-in clear (×) empty the field; it appears whenever there is text.

**Don't**
- Don't switch the border to `--border-elevated`; Search keeps the quiet `--border` because it carries a fill at rest.
- Don't use raw `--secondary-500` for the focus border; use the mode-aware `--selected`.
- Don't wrap it in a `<form>` or add a submit button.
- Don't change the font weight on focus or fill; it stays Regular 400.

**Canonical spec:** size M: padding `var(--space-s) var(--space-sm)` (8px 12px), radius `var(--radius-sm)` (12px), gap `var(--space-s)` (8px), 18px search icon, 20px clear icon, text 14px / 400 / 1.5. Fill `--input-background` (`--input-background-hover` on hover); border `--border`, `--border-hover` on hover, `--selected` on focus. Search icon `--text-tertiary`, clear icon `--text-secondary` (`--text-primary` on hover, with a circular `--input-background-hover` fill; 24px hit area, 28px at L), placeholder `--text-disabled`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11927:6338` / dark `697:33529`.

**Prototype:** `src/components/Search/Search.tsx` (default export)
- `value`, `onChange(value)` (required), `placeholder` (default "Search")
- `size`: `'M' | 'L'` (default `'M'`; L is not used anywhere yet)
- `onClear` (optional; without it the clear button calls `onChange('')` and refocuses the input)
- `onFocus`, `onBlur`, `ariaLabel`, `className`

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Search | _to be mapped by engineering_ | | |

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
- **Placeholder** — Regular 400, `--text-disabled`
- **Value text** — Regular 400, `--text-primary`, `flex: 1`
- **Clear** — `IoCloseOutline` (io5 set, same glyph as dismissible badges), 20px M / 24px L in a 24px / 28px circular hit area, `--text-secondary` (hover `--text-primary` on an `--input-background-hover` circle), calls `onClear`. Note it is one step stronger than the leading SearchIcon: the clear is an action, the search icon is decoration.

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

.search__input::placeholder { color: var(--text-disabled); }

/* ── Clear button ── */
/* 24px hit area (28px at L): 2px padding, cancelled by a -2px margin so the
   field height doesn't grow. Icon-only, so a circular hover; never opacity. */
.search__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-xxs);
  margin: calc(-1 * var(--space-xxs));
  color: var(--text-secondary); /* the icon uses color="currentColor" */
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}
.search__clear:hover {
  background: var(--input-background-hover);
  color: var(--text-primary);
}
.search__clear:focus-visible {
  outline: 2px solid var(--primary-button-background);
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
| `--text-tertiary` | `#656B7C` | `#9EA4B3` | Search icon |
| `--text-secondary` | `#454C5E` | `#BFC2CC` | Clear (×) icon |
| `--text-disabled` | `#9EA4B3` | `#656B7C` | Placeholder (empty field) |

---

## Do / Don't

✓ Use size **M** everywhere, including page-level search at the top of a table; the prototype has no size **L** call site
✓ Always show the clear button when there is text — never hide it on hover only
✓ Use `:focus-within` on the wrapper (not just the `<input>`) to trigger Active state
✓ Derive `filled` from `value.length > 0`

✗ Don't use a `<form>` wrapper; filter live from `onChange` (the component has no `onKeyDown` or submit prop)
✗ Don't show a submit/search button — the search icon is decorative, not interactive
✗ Don't use raw `--secondary-500` for the active border — use mode-aware `--selected`
✗ Don't change font weight on focus or fill — always Regular 400

---

## Code reality

`src/components/Search/Search.tsx` implements this component. The active border uses `--selected`, as specified. Remaining drift from the node: the clear glyph is an Iconsax `Add` rotated to an × instead of io5 `IoCloseOutline`, and the L radius is written as a raw `16px` rather than `var(--radius-m)`. The built props are `size`, `value`, `placeholder`, `onChange`, `onClear`, `onFocus`, `onBlur`, `className` and `ariaLabel`; `state` and `filled` in the Props table are Figma variant axes, derived from `:hover`, `:focus-within` and `value.length` rather than passed in. Sizes, padding and the other state tokens match.

## Change Log

- **2026-09-22** — Clear icon moved from `--text-tertiary` to `--text-secondary`, matching the close glyph on CloseButton and the dismissible badge. The border stays on `--border` (see States) — that is deliberate and was re-confirmed.

---

## Related Skills

- `input.md` — full text input component (labels, validation, helper text); use Search for search-specific UX, Input for form fields
- `5mins-colors` (colors.md) — surface, border, and text tokens
- `iconography.md` — Iconsax icon sizing and variant rules
- `listbox.md` — the embedded search row pinned inside long menus
