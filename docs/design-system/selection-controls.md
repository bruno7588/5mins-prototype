---
name: 5mins-selection-controls
description: Selection controls for 5Mins.ai — Radio button, Checkbox (including indeterminate), and Toggle switch in one file. All states (enabled, hover halo, disabled), dimensions, amber selected tokens, CSS and React implementations, grouping and accessibility patterns. Use for any single-choice option group, multi-choice list, consent acknowledgement, select-all table header, or instant on/off setting.
---

# 5Mins.ai Selection Controls

Complete implementation guide for Radio buttons, Checkboxes, and Toggle switches in the 5Mins.ai micro-learning platform.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — Checkbox light `11917:3924` / dark `6339:10484`, Radio light `11917:3950` / dark `5001:18926`, Toggle light `11917:3970` / dark `8160:364` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`); hexes below are light-mode values.

Cross-reference:
- `5mins-colors` (colors.md) for the raw palette and semantic surface tokens
- `5mins-typography` for label typography
- `5mins-iconography` for icon sizing conventions

> **Updated 2026-09-29 (verified against code):** the Common Patterns and indeterminate examples now compile against the real Checkbox API (`checked`, `indeterminate`, `onChange()`, `disabled`; no label, name or aria-label); the unchecked checkbox border is `--text-secondary`; `--control-selected` light/dark values stated; halo radius is `var(--radius-full)`; Radio and Toggle CSS and React samples now mirror the built components (tokens, no raw hex); `className` behaviour and `size="sm"` usage corrected.

> **Updated 2026-09-29 (aligned to prototype usage):** Toggles are used inside Save forms in the prototype (report scheduling, course settings), so the "never inside a Save form" rule is replaced by the Key rule below. `--control-selected` is `#FFBB38` in dark mode, not `#EDA30D`. The built Checkbox is a button with no label prop, draws its unchecked border in `--text-secondary` and fills with `--selected`. The unselected Radio ring turns `--border-hover` on hover. Toggle has a `size="sm"` variant.

## Usage

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

**Canonical spec:** 32 × 32px hit area with `var(--space-s)` (8px) padding and a `var(--radius-full)` hover halo in `--page-background-hover`; 16 × 16px box, 4px radius, 1.5px border `--text-secondary`; checked and indeterminate fill `--selected` with a white glyph; disabled `--text-disabled`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11917:3924` / dark `6339:10484`.

**Prototype:** `src/components/Checkbox/Checkbox.tsx` (default export)
- `checked` (required), `indeterminate`, `onChange()`, `disabled`
- Renders `<button role="checkbox" aria-checked>`; no label prop

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Checkbox | _to be mapped by engineering_ | | |

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

**Canonical spec:** 24 × 24px hit area with a `var(--radius-full)` hover halo in `--page-background-hover`; 15 × 15px ring, 1.5px `--text-primary` (`--border-hover` on hover when unselected); selected ring and 7px dot `--control-selected`; disabled `--text-disabled`; focus-visible 2px `--primary-button-background` outline. Row gap `var(--space-s)` (8px), option text 14px / 400 `--text-primary`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11917:3950` / dark `5001:18926`.

**Prototype:** `src/components/Radio/Radio.tsx` (default export, forwards ref)
- All native radio props (`name`, `checked`, `onChange`, `disabled`, `value`, `id`)
- `label` renders a `<label class="radio-row">` around control and text
- `className` goes on the `.radio` wrapper, and also on the `radio-row` label when `label` is set

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Radio | _to be mapped by engineering_ | | |

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

**Canonical spec:** md track 36 × 20px, sm track 28 × 16px; thumb 16px (sm 12px) in `--neutral-25` with a 2px inset. Track off `--neutral-400`, on `--selected`; disabled off `--text-disabled`, disabled on `--selected` at 40% opacity. Row gap `var(--space-s)` (8px), label 14px / 400 `--text-primary`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11917:3970` / dark `8160:364`.

**Prototype:** `src/components/Toggle/Toggle.tsx` (default export, forwards ref)
- Native checkbox props (`checked`, `onChange`, `disabled`, `id`)
- `size`: `'md' | 'sm'` (default `'md'`); `label` (ReactNode); `labelPosition` `'left' | 'right'`; `className` (applied to the `toggle-row` label only, so it is dropped when there is no `label`)

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Toggle | _to be mapped by engineering_ | | |

---

## When to Use Which Control

| Control | Use for | Never use for |
|---|---|---|
| **Radio** | One choice from a small list of mutually exclusive options (2 to 6) | Binary on/off, very long option lists (use a dropdown instead) |
| **Checkbox** | Zero or more choices from a list, a single acknowledgement (terms, consent), or "select all" behaviour in tables and lists | Mutually exclusive choices, immediate state changes (use a toggle) |
| **Toggle** | A single binary setting: one that applies immediately (notifications on/off, feature flags), or one that switches a feature on inside a settings form or drawer and reveals its fields, saved with the form | Choosing between options, multi-option selection, a yes/no answer to a form question |

Key rule: radios and checkboxes are **form inputs** (committed on submit). Toggles switch something **on or off**; on a card or list row they apply instantly, and inside a form with a Save button (e.g. "Schedule this report", course settings) they are saved with the form.

---

## Shared Design Tokens

All three controls pull from the same token set. Selected/on state colour differs slightly between controls (see each section for the exact hex); everything else is shared.

| Role | Token | Light | Dark | Notes |
|---|---|---|---|---|
| Selected colour (radio, checkbox) | `--control-selected` (radio) / `--selected` (checkbox) | `#EDA30D` | `#FFBB38` | Ring + dot, box fill; mode-aware, both tokens resolve to the same values |
| On colour (toggle track) | `--selected` | `#EDA30D` | `#FFBB38` | Mode-aware — brighter amber in dark mode |
| Hover halo background | `--page-background-hover` | `#EFF0F2` | `#2D313D` | Circular halo around radio and checkbox on hover |
| Default stroke colour | `--text-primary` (radio) / `--text-secondary` (checkbox) | `#20222A` / `#454C5E` | `#F9F9FA` / `#BFC2CC` | Unselected radio ring; unchecked checkbox border |
| Disabled colour | `--text-disabled` | `#9EA4B3` | `#656B7C` | Rings, borders, off-track when disabled |
| Thumb colour (toggle) | `--neutral-25` | `#F9F9FA` | `#F9F9FA` | Toggle knob |

> Always use the semantic token; the hexes are documented so prototypes render correctly if tokens are not yet wired up. `--control-selected` is defined in `tokens.css` as `var(--secondary-600)` in light and `var(--secondary-500)` in dark.

---

## 1. Radio Button

Single-select indicator. Sits inside a labelled row; the label itself should also be clickable.

### Dimensions

| Property | Value |
|---|---|
| Interactive target (hover halo) | 24 × 24 px |
| Visible ring / dot | 15 × 15 px |
| Halo border-radius | 30 px (fully round) |
| Ring stroke width | 1.5 px |

### States & variants

| State | Selected | Ring / dot colour | Halo |
|---|---|---|---|
| Enabled, unselected | no | `--text-primary` ring | none |
| Enabled, selected | yes | `#EDA30D` ring + filled dot | none |
| Hover, unselected | no | `--border-hover` ring | 24 × 24 px `#EFF0F2` circle |
| Hover, selected | yes | `#EDA30D` ring + dot | 24 × 24 px `#EFF0F2` circle |
| Disabled, unselected | no | `#9EA4B3` ring | none |
| Disabled, selected | yes | `#9EA4B3` ring + dot | none |

### CSS

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

/* Unselected ring picks up the hover border colour (selected keeps its amber). */
.radio:hover:not(.radio--disabled):not(.radio--selected) .radio__ring {
  border-color: var(--border-hover);
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

.radio-row:hover .radio:not(.radio--disabled):not(.radio--selected) .radio__ring {
  border-color: var(--border-hover);
}

.radio-row__label {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
}
```

### React TypeScript

```tsx
// src/components/Radio/Radio.tsx
import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import './Radio.css'

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, checked, disabled, className, id, ...props },
  ref,
) {
  const reactId = useId()
  const controlId = id ?? `radio-${reactId}`

  /* className lands on the wrapper, not the input: the wrapper is what carries the
     state classes and what a host scopes its overrides to. It was accepted and then
     dropped, so callers styling a radio in context silently got nothing. */
  const wrapperClass = [
    'radio',
    checked ? 'radio--selected' : '',
    disabled ? 'radio--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const control = (
    <span className={wrapperClass}>
      <input
        ref={ref}
        type="radio"
        id={controlId}
        className="radio__input"
        checked={checked}
        disabled={disabled}
        {...props}
      />
      <span className="radio__ring" aria-hidden="true" />
    </span>
  )

  if (!label) return control

  return (
    <label htmlFor={controlId} className={`radio-row${className ? ` ${className}` : ''}`}>
      {control}
      <span className="radio-row__label">{label}</span>
    </label>
  )
})

export default Radio
```

### Grouping

Always wrap a set of radios in a `<fieldset>` with a `<legend>`, or a container with `role="radiogroup"` and `aria-labelledby`. Never ship a lone radio; if only one option exists, use a checkbox or toggle instead.

```tsx
<fieldset className="radio-group">
  <legend>Enrolment mode</legend>
  <Radio name="mode" value="auto" label="Automatic" defaultChecked />
  <Radio name="mode" value="manual" label="Manual review" />
  <Radio name="mode" value="hybrid" label="Hybrid" />
</fieldset>
```

---

## 2. Checkbox

Multi-select or single acknowledgement indicator. Also supports an **indeterminate** state for partial selection (e.g. a parent row where only some children are selected).

> **Built component differs from the sketch below.** `src/components/Checkbox/Checkbox.tsx` is a `<button role="checkbox">` with `aria-checked` (`'mixed'` when indeterminate), not a hidden native input. Its props are `checked`, `indeterminate`, `onChange()` (no event) and `disabled`; there is no `label`, `id` or `aria-label` prop, so callers build the label row themselves. Checked and indeterminate fill `--selected`; disabled checked fills `--text-disabled`.

### Dimensions

| Property | Value |
|---|---|
| Interactive target (hover halo) | 32 × 32 px |
| Inner padding | 8 px |
| Visible box / fill | 16 × 16 px |
| Halo border-radius | fully round, `var(--radius-full)` |
| Box border-radius | 4 px |
| Box border width | 1.5 px |

### States & variants

| State | Checked variant | Box fill | Box border | Glyph | Halo |
|---|---|---|---|---|---|
| Enabled, not checked | Not checked | transparent | `--text-secondary` | none | none |
| Enabled, checked | Checked | `#EDA30D` | `#EDA30D` | white check | none |
| Enabled, indeterminate | Indeterminate | `#EDA30D` | `#EDA30D` | white minus bar | none |
| Hover, not checked | Not checked | transparent | `--text-secondary` | none | 32 × 32 `#EFF0F2` |
| Hover, checked | Checked | `#EDA30D` | `#EDA30D` | white check | 32 × 32 `#EFF0F2` |
| Hover, indeterminate | Indeterminate | `#EDA30D` | `#EDA30D` | white minus bar | 32 × 32 `#EFF0F2` |
| Disabled, not checked | Not checked | transparent | `#9EA4B3` | none | none |

### CSS

```css
.checkbox {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 40px;
  background: transparent;
  cursor: pointer;
  transition: background 120ms ease;
}

.checkbox:hover:not(.checkbox--disabled) {
  background: var(--page-background-hover);
}

.checkbox__box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid var(--text-secondary);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  box-sizing: border-box;
}

/* Checked + indeterminate share fill/border */
.checkbox--checked .checkbox__box,
.checkbox--indeterminate .checkbox__box {
  background: var(--selected);
  border-color: var(--selected);
}

.checkbox__check,
.checkbox__dash {
  width: 10px;
  height: 10px;
  display: none;
}
.checkbox--checked .checkbox__check { display: block; }
.checkbox--indeterminate .checkbox__dash { display: block; }

/* Disabled */
.checkbox--disabled {
  cursor: not-allowed;
}
.checkbox--disabled .checkbox__box {
  border-color: var(--text-disabled);
  background: transparent;
}

/* Hidden but focusable native input */
.checkbox__input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: inherit;
}
.checkbox__input:focus-visible + .checkbox__box {
  outline: 2px solid var(--selected);
  outline-offset: 2px;
}
```

Use inline SVG for the check and dash glyphs (both 10 × 10, white stroke, 2 px):

```tsx
// Checkmark glyph
<svg className="checkbox__check" viewBox="0 0 10 10" fill="none" aria-hidden="true">
  <path d="M1.5 5.2 L4 7.5 L8.5 2.5" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"/>
</svg>

// Indeterminate dash
<svg className="checkbox__dash" viewBox="0 0 10 10" fill="none" aria-hidden="true">
  <path d="M2 5 H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>
```

### React TypeScript

```tsx
import { InputHTMLAttributes, forwardRef, useEffect, useRef } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string;
  indeterminate?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, indeterminate = false, disabled, id, className, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement | null>(null);

    // Support the indeterminate DOM property
    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const controlId = id ?? `cb-${props.name ?? ''}-${props.value ?? ''}`;
    const wrapperClass = [
      'checkbox',
      checked && !indeterminate ? 'checkbox--checked' : '',
      indeterminate ? 'checkbox--indeterminate' : '',
      disabled ? 'checkbox--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const control = (
      <span className={wrapperClass}>
        <input
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          type="checkbox"
          id={controlId}
          className="checkbox__input"
          checked={checked}
          disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : checked ? 'true' : 'false'}
          {...props}
        />
        <span className="checkbox__box" aria-hidden="true">
          {/* svg check */}
          {/* svg dash */}
        </span>
      </span>
    );

    if (!label) return control;

    return (
      <label htmlFor={controlId} className={`checkbox-row ${className ?? ''}`}>
        {control}
        <span className="checkbox-row__label">{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
```

### Indeterminate pattern

Use indeterminate for a parent row where some (but not all) children are selected, most commonly in table headers and tree lists.

```tsx
const allSelected = rows.every(r => selected.has(r.id));
const someSelected = rows.some(r => selected.has(r.id));

<Checkbox
  checked={allSelected}
  indeterminate={!allSelected && someSelected}
  onChange={() => (allSelected ? clearAll() : selectAll())}
/>
```

---

## 3. Toggle

Binary on/off control. On a card or row it applies immediately; inside a form with a Save button it is saved with the form (see Key rule above).

### Dimensions

| Property | Value |
|---|---|
| Track | 36 × 20 px, border-radius 10 px (fully pill) |
| Thumb | 16 × 16 px circle |
| Inset (thumb edge to track edge) | 2 px all sides |
| Thumb travel | 16 px horizontal |
| Small (`size="sm"`) | track 28 × 16 px (radius 8 px), thumb 12 × 12 px, travel 12 px |

### States

| State | Track colour | Thumb colour | Thumb position |
|---|---|---|---|
| Off (enabled) | `#656B7C` (neutral-400) | `#F9F9FA` (neutral-25) | left |
| On (enabled) | `var(--selected)` (`#EDA30D` light / `#FFBB38` dark) | `#F9F9FA` | right |
| Off (disabled) | `#9EA4B3` (neutral-300) | `#F9F9FA` | left |
| On (disabled) | `var(--selected)` at 40% opacity | `#F9F9FA` | right |
| Focus (either) | same + 2 px outline around track | - | - |

No hover halo on the toggle (unlike radio/checkbox). Optional subtle darkening of the track on hover is acceptable.

### CSS

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

### React TypeScript

```tsx
// src/components/Toggle/Toggle.tsx
import { InputHTMLAttributes, forwardRef, useId } from 'react'
import './Toggle.css'

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: React.ReactNode
  labelPosition?: 'left' | 'right'
  size?: 'md' | 'sm'
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, labelPosition = 'right', size = 'md', checked, disabled, id, className, ...props }, ref) => {
    const reactId = useId()
    const controlId = id ?? `toggle-${reactId}`
    const wrapperClass = [
      'toggle',
      size === 'sm' ? 'toggle--sm' : '',
      checked ? 'toggle--on' : '',
      disabled ? 'toggle--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const control = (
      <span className={wrapperClass}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={controlId}
          className="toggle__input"
          checked={checked}
          disabled={disabled}
          aria-checked={checked ? 'true' : 'false'}
          {...props}
        />
        <span className="toggle__track" aria-hidden="true" />
        <span className="toggle__thumb" aria-hidden="true" />
      </span>
    )

    if (!label) return control

    return (
      <label
        htmlFor={controlId}
        className={`toggle-row toggle-row--${labelPosition} ${className ?? ''}`.trim()}
      >
        {labelPosition === 'left' && <span className="toggle-row__label">{label}</span>}
        {control}
        {labelPosition === 'right' && <span className="toggle-row__label">{label}</span>}
      </label>
    )
  },
)

Toggle.displayName = 'Toggle'

export default Toggle
```

Note the use of `role="switch"` so assistive tech announces this as a toggle rather than a generic checkbox.

---

## Accessibility Rules (apply to all three)

1. **Always pair with a visible label** via `<label htmlFor>`, or provide `aria-label` / `aria-labelledby` for unlabelled controls (Radio and Toggle pass `aria-label` through; the built Checkbox has no `aria-label` prop, so its name has to come from the surrounding row).
2. **Hit target is the label row**, not just the control glyph. The entire row should be clickable.
3. **Keyboard support is free** if you use real native inputs: Space toggles, Tab moves focus, arrow keys move within a radio group. Do not re-implement with `div`s.
4. **Focus indicator** must be visible (2 px outline). Never set `outline: none` without a replacement.
5. **Group radios** in a `<fieldset><legend>` or `role="radiogroup"`.
6. **Do not use colour alone** to convey selection; the glyph (dot, check, thumb position) must differ between states.
7. **Contrast**: all selected-state colours meet WCAG AA against the paired backgrounds.

---

## Common Patterns

### Settings row with toggle

```tsx
<div className="settings-row">
  <div>
    <div className="settings-row__title">Email notifications</div>
    <div className="settings-row__help">Get an email when a learner finishes a course</div>
  </div>
  <Toggle checked={emailOn} onChange={e => setEmailOn(e.target.checked)} aria-label="Email notifications" />
</div>
```

### Filter list with checkboxes

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

### Table "select all" header

```tsx
<th>
  <Checkbox
    checked={allSelected}
    indeterminate={!allSelected && someSelected}
    onChange={() => (allSelected ? clearAll() : selectAll())}
  />
</th>
```

The built `Table` component already renders this header (`src/components/Table/Table.tsx`); prefer it over a hand-built table.

```tsx
```

### Radio card group (radios inside visual cards)

The radio itself remains the same; the card handles its own selected border using `--selected`. Only one radio can be `checked` per group.

---

## Quick Reference Cheatsheet

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

### Colour summary

| Control | Selected / On colour | Hover halo |
|---|---|---|
| Radio | `var(--control-selected)` | `var(--page-background-hover)`, 24 × 24 |
| Checkbox | `var(--selected)` | `var(--page-background-hover)`, 32 × 32 |
| Toggle | `var(--selected)` | none |

### Disabled summary

| Control | Disabled colour |
|---|---|
| Radio (ring + dot) | `var(--text-disabled)` |
| Checkbox (border) | `var(--text-disabled)` |
| Toggle off (track) | `var(--text-disabled)` |
| Toggle on (track) | `var(--selected)` at 40% opacity |
