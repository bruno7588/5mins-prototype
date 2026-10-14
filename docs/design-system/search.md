---
name: 5mins-search
description: Search input component for 5Mins.ai. Use when implementing any search field, filter input, or keyword search bar in the admin or learner UI. Covers two sizes (M/L), three states (Enabled, Hover, Active/focused), and filled vs empty modes with a clear button. Trigger this skill whenever building a search box, search bar, or any input whose primary purpose is filtering or finding content.
---

# Search

A standalone search input with a leading search icon, placeholder text, and a clear (×) button when there is text.

**Code:** `import Search from '@/components/Search/Search'` (default export)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `697:33529`. Reference width in Figma: 400px.
**Last verified:** 2026-09-30

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
- Use size **M** everywhere, including page-level search at the top of a table (Programs header, course list, My Team toolbar); the prototype has no size **L** call site.
- Pass `ariaLabel` (it falls back to the placeholder) so the field has an accessible name.
- Filter on `onChange`; the leading search icon is decoration, not a submit button.
- Let the built-in clear (×) empty the field; it appears whenever there is text. Never hide it on hover only.
- Use `:focus-within` on the wrapper (not just the `<input>`) to trigger the Active state.
- Derive `filled` from `value.length > 0`.

**Don't**
- Don't use `--border-elevated` on the page ground or inside drawers and modals; there Search keeps the quiet `--border`. On a card or menu, pass `elevated` instead (see States).
- Don't use raw `--secondary-500` for the focus border; use the mode-aware `--selected`.
- Don't wrap it in a `<form>` or add a submit button; filter live from `onChange` (the component has no `onKeyDown` or submit prop). The search icon is decorative, not interactive.
- Don't change the font weight on focus or fill; it stays Regular 400.

**Canonical spec:** size M: padding `var(--space-s) var(--space-sm)` (8px 12px), radius `var(--radius-sm)` (12px), gap `var(--space-s)` (8px), 18px search icon, 20px clear icon, text 14px / 400 / 1.5. Fill `--input-background` (`--input-background-hover` on hover); border `--border`, `--border-hover` on hover, `--selected` on focus. Search icon `--text-tertiary`, clear icon `--text-secondary` (`--text-primary` on hover, with a circular `--input-background-hover` fill; 24px hit area, 28px at L), placeholder `--text-disabled`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `697:33529`.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Size | M / L | `size` | `'M'` (default) / `'L'` | L has no call site |
| State | Enabled / Hover / Active | n/a | CSS `:hover`, `:focus-within` | states are CSS, not props |
| Filled | false / true | `value` | Filled = `value.length > 0` | shows the clear button |
| Placeholder (text) | "Search" | `placeholder` | `string` | bound on the empty Enabled and Hover variants |
| Value (text) | "Text input" | `value` | `string` | bound on the Filled variants; Active keeps its own sample text |

- **Figma only:** a hidden outlined AI "Buttons" layer in every variant (no property, not in code). The clear button belongs to the Filled and Active variants rather than being a property. The dark set has no `Border-elevated` binding.
- **Code only:** `elevated`, `onClear`, `onFocus`, `onBlur`, `ariaLabel`, `className`, `onChange`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"M" \| "L"` | `"M"` | Controls padding, border-radius, icon size, and font size |
| `value` | `string` | required | Current input value. Figma's "Filled" state is any non-empty value (shows the clear button) |
| `placeholder` | `string` | `"Search"` | Placeholder text shown when empty |
| `onChange` | `(value: string) => void` | required | Called on every keystroke |
| `onClear` | `() => void` | - | Called when the clear (×) button is clicked; without it the clear button calls `onChange('')`. Either way the input is refocused |
| `onFocus` / `onBlur` | `() => void` | - | Focus handlers |
| `elevated` | `boolean` | `false` | Set when the search sits on a card or menu: border steps up to `--border-elevated` |
| `ariaLabel` | `string` | - | Accessible label |
| `className` | `string` | `""` | Extra class |

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Search | _to be mapped by engineering_ | | Clear glyph is an Iconsax `Add` rotated to an × instead of io5 `IoCloseOutline`; the L radius is written as a raw `16px` rather than `var(--radius-m)` |

## Anatomy

### Empty
```
[ SearchIcon ] [ placeholder text ]
```

### Filled / typing
```
[ SearchIcon ] [ value text          ] [ × ]
```

- **SearchIcon** - Iconsax `SearchNormal1` Outline, `--text-tertiary` (18px M / 20px L)
- **Placeholder** - Regular 400, `--text-disabled`
- **Value text** - Regular 400, `--text-primary`, `flex: 1`
- **Clear** - `IoCloseOutline` (io5 set, same glyph as dismissible badges), 20px M / 24px L in a 24px / 28px circular hit area, `--text-secondary` (hover `--text-primary` on an `--input-background-hover` circle), calls `onClear`. Note it is one step stronger than the leading SearchIcon: the clear is an action, the search icon is decoration. The clear icon colour matches the close glyph on CloseButton and the dismissible badge.

## Sizes

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

## States

| State | Background | Border (1px) |
|---|---|---|
| Enabled | `--input-background` | `--border` (`--border-elevated` with `elevated`) |
| Hover | `--input-background-hover` | `--border-hover` |
| Active (focused) | `--input-background` | `--selected` (`#EDA30D` light / `#FFBB38` dark) |
| Clear focus-visible | n/a | 2px `--primary-button-background` outline on the clear button |

- The border is the primary state signal - background only changes on Hover.
- **On the page ground and inside drawers and modals, Search keeps the quiet `--border`.** It carries a fill at rest, so there it does not need the stronger edge the transparent fields use. This is deliberate.
- **On a card or menu, Search uses `--border-elevated`:** pass `elevated`. In dark mode `--border` equals `--cards-background`, so the quiet border disappears on a card. Hover (`--border-hover`) and Active (`--selected`) are unchanged.
- Token rule: **form-field active borders use the mode-aware `--selected` token** (same as inputs, dropdowns, date fields).
- In Figma, Active is modeled on the unfilled variant and shows in-progress typing (value text + clear button) - i.e. Active = focused, whatever the content; `filled` styling applies once the field has a value.

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

## Tokens

| Token | Light | Dark | Used for |
|---|---|---|---|
| `var(--input-background)` | `#BFC2CC` @16% | `#454C5E` @16% | Default + Active background |
| `var(--input-background-hover)` | `#DFE1E6` (Neutral-100) | `#2D313D` (Neutral-700) | Hover background |
| `var(--border)` / `var(--border-hover)` | `#DFE1E6` / `#9EA4B3` | `#2D313D` / `#9EA4B3` | Default / hover border |
| `var(--selected)` | `#EDA30D` | `#FFBB38` | Active/focused border |
| `var(--text-primary)` | `#20222A` | `#F9F9FA` | Value text |
| `var(--text-tertiary)` | `#656B7C` | `#9EA4B3` | Search icon |
| `var(--text-secondary)` | `#454C5E` | `#BFC2CC` | Clear (×) icon |
| `var(--text-disabled)` | `#9EA4B3` | `#656B7C` | Placeholder (empty field) |

## Accessibility

- Pass `ariaLabel`; it falls back to the placeholder as the input's `aria-label`.
- The clear button is a `<button>` with `aria-label="Clear search"` and a 2px `--primary-button-background` focus-visible outline; clearing refocuses the input.
- Focus on the input shows the `--selected` border through `:focus-within` on the wrapper.

## Examples

Use the shared component; don't re-implement it. Pass `elevated` when the field sits on a card or menu.

```tsx
import Search from '@/components/Search/Search'

<Search value={query} onChange={setQuery} placeholder="Search people" />
<Search value={query} onChange={setQuery} elevated />
```

## Related

- `input.md` - full text input component (labels, validation, helper text); use Search for search-specific UX, Input for form fields
- `5mins-colors` (colors.md) - surface, border, and text tokens
- `iconography.md` - Iconsax icon sizing and variant rules
- `listbox.md` - the embedded search row pinned inside long menus
