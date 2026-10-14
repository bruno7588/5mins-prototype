---
name: 5mins-selection-controls
description: Selection controls for 5Mins.ai - Radio button, Checkbox (including indeterminate), and Toggle switch in one file. All states (enabled, hover halo, disabled), dimensions, amber selected tokens, CSS and React implementations, grouping and accessibility patterns. Use for any single-choice option group, multi-choice list, consent acknowledgement, select-all table header, or instant on/off setting.
---

# Selection controls

Checkbox, Radio and Toggle: the controls that pick options or switch a setting on or off.

**Code:** `import Checkbox from '@/components/Checkbox/Checkbox'`, `import Radio from '@/components/Radio/Radio'`, `import Toggle from '@/components/Toggle/Toggle'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Checkbox `6339:10484`; Radio `5001:18926`; Toggle `8160:364`
**Last verified:** 2026-10-09

Colours are semantic tokens resolving per mode (see `colors.md`); hexes below are light-mode values unless a dark value is given. Cross-reference: `5mins-colors` (colors.md) for the raw palette and semantic surface tokens, `5mins-typography` for label typography, `5mins-iconography` for icon sizing conventions.

## Usage

### Choosing a control

| Control | Use for | Never use for |
|---|---|---|
| **Radio** | One choice from a small list of mutually exclusive options (2 to 6) | Binary on/off, very long option lists (use a dropdown instead) |
| **Checkbox** | Zero or more choices from a list, a single acknowledgement (terms, consent), or "select all" behaviour in tables and lists | Mutually exclusive choices, immediate state changes (use a toggle) |
| **Toggle** | A single binary setting: one that applies immediately (notifications on/off, feature flags), or one that switches a feature on inside a settings form or drawer and reveals its fields, saved with the form | Choosing between options, multi-option selection, a yes/no answer to a form question |

Key rule: radios and checkboxes are **form inputs** (committed on submit). Toggles switch something **on or off**; on a card or list row they apply instantly, and inside a form with a Save button (e.g. "Schedule this report", course settings) they are saved with the form.

| I need to... | Use |
|---|---|
| Pick one of 2 to 6 mutually exclusive options | Radio group |
| Pick zero or more from a list | Checkbox group |
| Toggle a setting immediately (no Save) | Toggle |
| Acknowledge terms / consent | Single checkbox |
| "Select all" in a table | Checkbox with indeterminate |
| Enable/disable a feature flag | Toggle |
| Switch between two views or modes | Tabs, not a toggle |
| Answer a single yes/no question in a form | Radio group (Yes / No) or checkbox, not a toggle |

### Checkbox

**Intent:** lets the user pick zero or more items, confirm one opt-in, or select all rows at once.

**Use when**
- Selecting rows in a table or list, including a select-all header with `indeterminate`.
- Picking several values in a filter or multi-select menu.
- A single opt-in inside a form, e.g. "This is a leadership role", "Certificate".

**Don't use when**
- Only one option can be chosen → use Radio (below)
- A setting switches a feature on or off → use Toggle (below)
- The picks are a filter value behind a field → use Dropdown with `multiple` ([doc](dropdown.md))

**Do**
- Use `Checkbox` from `src/components/Checkbox`; wrap it with its label text in a `<label>` or a clickable row so the whole row is the hit target.
- Use `indeterminate` for a parent or select-all box when only some children are selected.
- In menus and list rows, let the row own the click and pass only `checked` to the box.
- Use `disabled` for rows that can't be picked (e.g. people already enrolled).

**Don't**
- Don't nest the Checkbox inside a `<button>`; it is a button itself, so a clickable row must be a `div` or `label`.
- Don't hard-code the amber; checked fill is `--selected`.
- Don't use a checkbox for mutually exclusive choices.
- Never give the glyph its own colour.

**Canonical spec:** 32 × 32px hit area with `var(--space-s)` (8px) padding and a `var(--radius-full)` hover halo in `--page-background-hover`; 16 × 16px box, 4px radius, 1.5px border `--text-secondary`; checked and indeterminate fill `--selected` with the tick or minus bar cut out of the box, so the surface shows through; disabled `--text-disabled`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `6339:10484`.

### Radio

**Intent:** lets the user pick exactly one option from a small set that stays visible.

**Use when**
- Choosing one of 2 to 6 mutually exclusive options, e.g. a score mode, a due-date mode, a single-choice quiz answer.
- Choosing between option cards that each carry a title and description.

**Don't use when**
- The list is long → use Dropdown ([doc](dropdown.md))
- The choice is a binary on/off setting → use Toggle (below)
- Several options can be chosen → use Checkbox (above)

**Do**
- Use `Radio` from `src/components/Radio`; it is a real `<input type="radio">`, so a shared `name` gives arrow-key movement for free.
- Group radios in a `<fieldset>` with a `<legend>`, or a container with `role="radiogroup"` and a label.
- Make the whole row clickable: pass `label`, or wrap the Radio and its text in a `<label>` (not a `<button>`, which can't contain an input).
- Put `className` on the Radio to style it in context; it lands on the `.radio` wrapper that carries the state classes and, when `label` is set, on the `radio-row` label as well.

**Don't**
- Don't hand-roll a radio from a raw `<input type="radio">` plus a custom dot; use the Radio component.
- Don't re-implement radios with `div`s.
- Don't ship a lone radio; with one option use a checkbox or toggle.

**Canonical spec:** 24 × 24px hit area with a fully round (30px) hover halo in `--page-background-hover`; 15 × 15px ring, 1.5px `--text-primary` (unchanged on hover; hover only adds the halo); selected ring and 7px dot `--control-selected`; disabled `--text-disabled`; focus-visible 2px `--primary-button-background` outline. Row gap `var(--space-s)` (8px), option text 14px / 400 `--text-primary`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `5001:18926`.

### Toggle

**Intent:** switches one feature or setting on or off.

**Use when**
- Turning an automation, reminder or workflow card on or off, where it applies straight away.
- Switching on a feature inside a settings form or drawer and revealing its fields, saved with the form (e.g. "Schedule this report", "Retake quizzes and assessments").

**Don't use when**
- Choosing between two views or modes → use tabs or a content switcher ([doc](chips-switcher-tabs.md))
- Answering a yes/no question in a form → use Radio or Checkbox (above)
- Picking several options → use Checkbox (above)

**Do**
- Use `Toggle` from `src/components/Toggle`; it is a native checkbox with `role="switch"`.
- Use `size="sm"` for compact rows, such as a menu item (`ProfileMenu`), a settings card (`CourseSettings`) or a report row (`LearningRecords`); default `md` elsewhere.
- Reveal a switched-on feature's fields with the `Collapse` component so they animate in.
- Give it a visible label (`label` prop or adjacent text) or an `aria-label`.

**Don't**
- Don't hand-roll a switch from a `<button role="switch">`; use the Toggle.
- Don't add a hover halo; the toggle has none.
- Don't remove the focus outline; focus-visible draws 2px `--primary-button-background` around the track.

**Canonical spec:** md track 36 × 20px, sm track 28 × 16px; thumb 16px (sm 12px) in `--neutral-25` with a 2px inset. Track off `--neutral-400`, on `--selected`; disabled off `--text-disabled`, disabled on `--selected` at 40% opacity. Row gap `var(--space-s)` (8px), label 14px / 400 `--text-primary`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `8160:364`.

## Figma to code

### Checkbox (`6339:10484`, "Checkbox instances")

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Checked | Not checked / Checked / Indeterminate | `checked` + `indeterminate` | `checked={false}` / `checked={true}` / `indeterminate` | `checked` is required; `indeterminate` wins over `checked` |
| State | Enabled / Hover / Focus | n/a | CSS `:hover`, `:focus-visible` | states are CSS, not props; Focus is a 2px ring, 2px offset, around the box |
| State | n/a | n/a | n/a | only used with Disabled=true |
| Disabled | false / true | `disabled` | `true` / `false` (default) | |

- **Figma only:** the Focus ring: `Checkbox.css` has no `:focus-visible` rule yet.
- **Code only:** `onChange()` (no event); disabled + checked and disabled + indeterminate (Figma has Disabled only as Not checked, so a disabled box that is checked keeps the `--selected` fill).

### Radio (`5001:18926`, "radio-button instances")

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Selected | true / false | `checked` | `true` / `false` | native radio prop |
| State | Enabled / Hover / Focus | n/a | CSS `:hover`, `:focus-visible` | hovering the labelled row also shows the halo; Focus rings the 15px ring |
| State | n/a | n/a | n/a | only used with Disabled=true |
| Disabled | false / true | `disabled` | `true` / `false` | native radio prop |

- **Figma only:** none.
- **Code only:** `label` (Figma has no label in the component), `className`, all native radio props (`name`, `onChange`, `value`, `id`).

### Toggle (`8160:364`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Toggle | true / false | `checked` | `true` / `false` | On / Off |
| State | Enabled / Focus | n/a | CSS `:focus-visible` | ring around the track; axis added 2026-10-14 |

- **Figma only:** none.
- **Code only:** `size` (`'md' | 'sm'`), `label`, `labelPosition` (`'left' | 'right'`), `disabled` and the disabled states, `className`.

### Props

**Checkbox** (`src/components/Checkbox/Checkbox.tsx`, default export): `checked` (required), `indeterminate`, `onChange()`, `disabled`. Renders `<button role="checkbox" aria-checked>` (`'mixed'` when indeterminate), not a hidden native input; there is no `label`, `id` or `aria-label` prop, so callers build the label row themselves.

**Radio** (`src/components/Radio/Radio.tsx`, default export, forwards ref): all native radio props (`name`, `checked`, `onChange`, `disabled`, `value`, `id`); `label` renders a `<label class="radio-row">` around control and text; `className` goes on the `.radio` wrapper, and also on the `radio-row` label when `label` is set.

**Toggle** (`src/components/Toggle/Toggle.tsx`, default export, forwards ref): native checkbox props (`checked`, `onChange`, `disabled`, `id`); `size`: `'md' | 'sm'` (default `'md'`); `label` (ReactNode); `labelPosition` `'left' | 'right'`; `className` (applied to the `toggle-row` label only, so it is dropped when there is no `label`).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Checkbox | _to be mapped by engineering_ | | |
| Radio | _to be mapped by engineering_ | | |
| Toggle | _to be mapped by engineering_ | | |

## Anatomy

### Checkbox

| Property | Value |
|---|---|
| Interactive target (hover halo) | 32 × 32 px |
| Inner padding | 8 px |
| Visible box / fill | 16 × 16 px |
| Halo border-radius | fully round, `var(--radius-full)` |
| Box border-radius | 4 px |
| Box border width | 1.5 px |

`src/components/Checkbox/Checkbox.css` holds the hit area and hover halo; the box, tick and minus bar are inline SVG in `Checkbox.tsx`. The tick and minus bar are not white: they are cut out of a single filled path copied from Figma (`CHECKED_PATH`, `INDETERMINATE_PATH`), filled `--selected` (also when disabled), so the surface behind shows through (light on light pages, dark in dark mode).

### Radio

Single-select indicator. Sits inside a labelled row; the label itself should also be clickable.

| Property | Value |
|---|---|
| Interactive target (hover halo) | 24 × 24 px |
| Visible ring / dot | 15 × 15 px |
| Halo border-radius | 30 px (fully round) |
| Ring stroke width | 1.5 px |

### Toggle

Binary on/off control. On a card or row it applies immediately; inside a form with a Save button it is saved with the form (see Key rule).

| Property | Value |
|---|---|
| Track | 36 × 20 px, border-radius 10 px (fully pill) |
| Thumb | 16 × 16 px circle |
| Inset (thumb edge to track edge) | 2 px all sides |
| Thumb travel | 16 px horizontal |

## Variants

Checkbox has three checked variants: Not checked, Checked (tick) and Indeterminate (minus bar, for a parent row where some but not all children are selected). Radio has Selected and unselected. Toggle has On and Off.

## Sizes

Checkbox and Radio have one size. Toggle has two:

| Size | Track | Track radius | Thumb | Thumb travel |
|---|---|---|---|---|
| `md` (default) | 36 × 20 px | 10 px | 16 × 16 px | 16 px |
| `sm` | 28 × 16 px | 8 px | 12 × 12 px | 12 px |

## States

### Checkbox

| State | Checked variant | Box fill | Box border | Glyph | Halo |
|---|---|---|---|---|---|
| Enabled, not checked | Not checked | transparent | `--text-secondary` | none | none |
| Enabled, checked | Checked | `--selected` (`#EDA30D`) | `--selected` | check, cut out | none |
| Enabled, indeterminate | Indeterminate | `--selected` | `--selected` | minus bar, cut out | none |
| Hover, not checked | Not checked | transparent | `--text-secondary` | none | 32 × 32 `--page-background-hover` (`#EFF0F2`) |
| Hover, checked | Checked | `--selected` | `--selected` | check, cut out | 32 × 32 `--page-background-hover` |
| Hover, indeterminate | Indeterminate | `--selected` | `--selected` | minus bar, cut out | 32 × 32 `--page-background-hover` |
| Disabled, not checked | Not checked | transparent | `--text-disabled` (`#9EA4B3`) | none | none |
| Disabled, checked or indeterminate | (code only) | `--selected` | `--selected` | cut out | none |

### Radio

| State | Selected | Ring / dot colour | Halo |
|---|---|---|---|
| Enabled, unselected | no | `--text-primary` ring | none |
| Enabled, selected | yes | `--control-selected` (`#EDA30D`) ring + filled dot | none |
| Hover, unselected | no | `--text-primary` ring (unchanged) | 24 × 24 px `--page-background-hover` (`#EFF0F2`) circle |
| Hover, selected | yes | `--control-selected` ring + dot (unchanged) | 24 × 24 px `--page-background-hover` circle |
| Disabled, unselected | no | `--text-disabled` (`#9EA4B3`) ring | none |
| Disabled, selected | yes | `--text-disabled` ring + dot | none |
| Focus-visible | either | unchanged | 2px `--primary-button-background` outline, 2px offset, on the ring |

```css
/* src/components/Radio/Radio.css */
.radio {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 30px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 120ms ease;
}

.radio:hover:not(.radio--disabled) {
  background: var(--page-background-hover);
}

.radio__ring {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1.5px solid var(--text-primary);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.radio--selected .radio__ring {
  border-color: var(--control-selected);
}

.radio--selected .radio__ring::after {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--control-selected);
}

.radio--disabled {
  cursor: not-allowed;
}

.radio--disabled .radio__ring {
  border-color: var(--text-disabled);
}

.radio--disabled.radio--selected .radio__ring,
.radio--disabled.radio--selected .radio__ring::after {
  border-color: var(--text-disabled);
  background: var(--text-disabled);
}

.radio__input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: inherit;
}

.radio__input:focus-visible + .radio__ring {
  outline: 2px solid var(--primary-button-background);
  outline-offset: 2px;
}

.radio-row {
  display: inline-flex;
  align-items: center;
  gap: var(--space-s);
  cursor: pointer;
}

/* Hovering anywhere on the labelled row shows the radio hover state. */
.radio-row:hover .radio:not(.radio--disabled) {
  background: var(--page-background-hover);
}

.radio-row__label {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
}
```

### Toggle

| State | Track colour | Thumb colour | Thumb position |
|---|---|---|---|
| Off (enabled) | `--neutral-400` (`#656B7C`) | `--neutral-25` (`#F9F9FA`) | left |
| On (enabled) | `var(--selected)` (`#EDA30D` light / `#FFBB38` dark) | `--neutral-25` | right |
| Off (disabled) | `--text-disabled` (`#9EA4B3`, neutral-300) | `--neutral-25` | left |
| On (disabled) | `var(--selected)` at 40% opacity | `--neutral-25` | right |
| Focus-visible (either) | same + 2px `--primary-button-background` outline around track, 2px offset | n/a | n/a |

No hover halo on the toggle (unlike radio/checkbox). Optional subtle darkening of the track on hover is acceptable.

```css
.toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
}

.toggle__input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: inherit;
}

.toggle__track {
  position: absolute;
  inset: 0;
  background: var(--neutral-400);   /* Off */
  border-radius: 10px;
  transition: background 150ms ease;
}

.toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--neutral-25);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: transform 150ms ease;
}

/* On */
.toggle--on .toggle__track {
  background: var(--selected);
}
.toggle--on .toggle__thumb {
  transform: translateX(16px);
}

/* Disabled */
.toggle--disabled { cursor: not-allowed; }
.toggle--disabled .toggle__track { background: var(--text-disabled); }
.toggle--disabled.toggle--on .toggle__track { background: var(--selected); opacity: 0.4; }

/* Focus */
.toggle__input:focus-visible + .toggle__track {
  outline: 2px solid var(--primary-button-background);
  outline-offset: 2px;
}
```

## Tokens

All three controls pull from the same token set. Selected/on state colour differs slightly between controls; everything else is shared.

| Role | Token | Light | Dark | Notes |
|---|---|---|---|---|
| Selected colour (radio, checkbox) | `--control-selected` (radio) / `--selected` (checkbox) | `#EDA30D` | `#FFBB38` | Ring + dot, box fill; mode-aware, both tokens resolve to the same values |
| On colour (toggle track) | `--selected` | `#EDA30D` | `#FFBB38` | Mode-aware, brighter amber in dark mode |
| Hover halo background | `--page-background-hover` | `#EFF0F2` | `#2D313D` | Circular halo around radio and checkbox on hover |
| Default stroke colour | `--text-primary` (radio) / `--text-secondary` (checkbox) | `#20222A` / `#454C5E` | `#F9F9FA` / `#BFC2CC` | Unselected radio ring; unchecked checkbox border |
| Disabled colour | `--text-disabled` | `#9EA4B3` | `#656B7C` | Rings, borders, off-track when disabled |
| Thumb colour (toggle) | `--neutral-25` | `#F9F9FA` | `#F9F9FA` | Toggle knob |

Always use the semantic token; the hexes are documented so prototypes render correctly if tokens are not yet wired up. `--control-selected` is defined in `tokens.css` as `var(--secondary-600)` in light and `var(--secondary-500)` in dark.

| Control | Selected / On colour | Hover halo | Disabled colour |
|---|---|---|---|
| Radio | `var(--control-selected)` | `var(--page-background-hover)`, 24 × 24 | `var(--text-disabled)` (ring + dot) |
| Checkbox | `var(--selected)` | `var(--page-background-hover)`, 32 × 32 | `var(--text-disabled)` (border) |
| Toggle | `var(--selected)` | none | off track `var(--text-disabled)`; on track `var(--selected)` at 40% opacity |

## Accessibility

1. **Always pair with a visible label** via `<label htmlFor>`, or provide `aria-label` / `aria-labelledby` for unlabelled controls (Radio and Toggle pass `aria-label` through; the built Checkbox has no `aria-label` prop, so its name has to come from the surrounding row).
2. **Hit target is the label row**, not just the control glyph. The entire row should be clickable.
3. **Keyboard support is free** if you use real native inputs: Space toggles, Tab moves focus, arrow keys move within a radio group. Do not re-implement with `div`s.
4. **Focus indicator** must be visible (2 px outline). Never set `outline: none` without a replacement.
5. **Group radios** in a `<fieldset><legend>` or `role="radiogroup"` with `aria-labelledby`.
6. **Do not use colour alone** to convey selection; the glyph (dot, check, thumb position) must differ between states.
7. **Contrast**: all selected-state colours meet WCAG AA against the paired backgrounds.
8. **Roles**: Checkbox is `<button role="checkbox">` with `aria-checked` (`'mixed'` when indeterminate); Radio is a native `<input type="radio">`; Toggle is a native checkbox with `role="switch"`, so assistive tech announces it as a toggle rather than a generic checkbox.

## Examples

### Radio

```tsx
import Radio from '@/components/Radio/Radio'

<Radio name="mode" value="auto" label="Automatic" checked={mode === 'auto'} onChange={() => setMode('auto')} />
```

Always wrap a set of radios in a `<fieldset>` with a `<legend>`, or a container with `role="radiogroup"` and `aria-labelledby`. Never ship a lone radio; if only one option exists, use a checkbox or toggle instead.

```tsx
<fieldset className="radio-group">
  <legend>Enrolment mode</legend>
  <Radio name="mode" value="auto" label="Automatic" defaultChecked />
  <Radio name="mode" value="manual" label="Manual review" />
  <Radio name="mode" value="hybrid" label="Hybrid" />
</fieldset>
```

**Radio card group (radios inside visual cards):** the radio itself remains the same; the card handles its own selected border using `--selected`. Only one radio can be `checked` per group.

### Checkbox: indeterminate and select all

Use indeterminate for a parent row where some (but not all) children are selected, most commonly in table headers and tree lists.

```tsx
const allSelected = rows.every(r => selected.has(r.id));
const someSelected = rows.some(r => selected.has(r.id));

<th>
  <Checkbox
    checked={allSelected}
    indeterminate={!allSelected && someSelected}
    onChange={() => (allSelected ? clearAll() : selectAll())}
  />
</th>
```

The built `Table` component already renders this header (`src/components/Table/Table.tsx`); prefer it over a hand-built table.

### Checkbox: filter list

```tsx
<fieldset className="filter-group">
  <legend>Department</legend>
  {departments.map(d => (
    <div key={d.id} className="filter-group__row" onClick={() => toggleDept(d.id)}>
      <Checkbox checked={selected.has(d.id)} />
      <span>{d.name}</span>
    </div>
  ))}
</fieldset>
```

### Toggle

```tsx
import Toggle from '@/components/Toggle/Toggle'

<Toggle label="Send reminders" checked={reminders} onChange={(e) => setReminders(e.target.checked)} />
```

Settings row with toggle:

```tsx
<div className="settings-row">
  <div>
    <div className="settings-row__title">Email notifications</div>
    <div className="settings-row__help">Get an email when a learner finishes a course</div>
  </div>
  <Toggle checked={emailOn} onChange={e => setEmailOn(e.target.checked)} aria-label="Email notifications" />
</div>
```

## Related

- [dropdown.md](dropdown.md) - long option lists and multi-select fields
- [chips-switcher-tabs.md](chips-switcher-tabs.md) - switching between views or modes
- [table.md](table.md) - select-all header in the shared Table
- [collapse.md](collapse.md) - revealing a switched-on feature's fields
- [colors.md](colors.md) - palette and semantic surface tokens
