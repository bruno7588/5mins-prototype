
# 5Mins.ai Selection Controls

Complete implementation guide for Radio buttons, Checkboxes, and Toggle switches in the 5Mins.ai micro-learning platform. Source of truth: Figma library `EC26cSVe9KNTCWXvYovakw`.

Cross-reference:
- `5mins-brand-colors` for the raw palette
- `5mins-surface-colors` for semantic surface tokens
- `5mins-typography` for label typography
- `5mins-iconography` for icon sizing conventions

---

## When to Use Which Control

| Control | Use for | Never use for |
|---|---|---|
| **Radio** | One choice from a small list of mutually exclusive options (2 to 6) | Binary on/off, very long option lists (use a dropdown instead) |
| **Checkbox** | Zero or more choices from a list, a single acknowledgement (terms, consent), or "select all" behaviour in tables and lists | Mutually exclusive choices, immediate state changes (use a toggle) |
| **Toggle** | A single binary setting that applies immediately (notifications on/off, dark mode, feature flags) | Form choices that require Save, multi-option selection |

Key rule: radios and checkboxes are **form inputs** (committed on submit). Toggles apply **instantly**.

---

## Shared Design Tokens

All three controls pull from the same token set. Selected/on state colour differs slightly between controls (see each section for the exact hex); everything else is shared.

| Role | Token / Resolved value | Notes |
|---|---|---|
| Selected state colour (radio, checkbox) | `#EDA30D` (secondary darker amber) | Maps to Figma `Text-selected` on these controls |
| On state colour (toggle track) | `--surface-selected` / `#FFBB38` (secondary-500) | Maps to Figma `Text-selected` on toggle |
| Hover halo background | `--surface-page-hover` / `#EFF0F2` (neutral-50) | Circular halo around radio and checkbox on hover |
| Default stroke colour | `--neutral-800` / `#20222A` (text-primary) | Unselected radio ring, unchecked checkbox border |
| Disabled colour | `#9EA4B3` (neutral-300, text-disabled) on light surfaces; `#656B7C` (neutral-400) on toggle track | See each section |
| Thumb colour (toggle) | `--neutral-25` / `#F9F9FA` | Toggle knob |

> Always prefer the semantic token name (`--surface-selected`, `--surface-page-hover`) over the raw hex when the token exists. The raw hex is documented so prototypes can still render correctly if tokens are not yet wired up.

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
| Enabled, unselected | no | `#20222A` (neutral-800) ring | none |
| Enabled, selected | yes | `#EDA30D` ring + filled dot | none |
| Hover, unselected | no | `#20222A` ring | 24 × 24 px `#EFF0F2` circle |
| Hover, selected | yes | `#EDA30D` ring + dot | 24 × 24 px `#EFF0F2` circle |
| Disabled, unselected | no | `#9EA4B3` ring | none |
| Disabled, selected | yes | `#9EA4B3` ring + dot | none |

### CSS

```css
.radio {
  /* Interactive target / hover halo */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 30px;
  background: transparent;
  cursor: pointer;
  transition: background 120ms ease;
}

.radio:hover:not(.radio--disabled) {
  background: var(--surface-page-hover, #EFF0F2);
}

/* Visible ring */
.radio__ring {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1.5px solid var(--neutral-800, #20222A);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* Selected dot */
.radio--selected .radio__ring {
  border-color: #EDA30D;
}
.radio--selected .radio__ring::after {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #EDA30D;
}

/* Disabled */
.radio--disabled {
  cursor: not-allowed;
}
.radio--disabled .radio__ring {
  border-color: #9EA4B3;
}
.radio--disabled.radio--selected .radio__ring {
  border-color: #9EA4B3;
}
.radio--disabled.radio--selected .radio__ring::after {
  background: #9EA4B3;
}

/* Native input is visually hidden but keyboard-focusable */
.radio__input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: inherit;
}

.radio__input:focus-visible + .radio__ring {
  outline: 2px solid #EDA30D;
  outline-offset: 2px;
}
```

### React TypeScript

```tsx
import { InputHTMLAttributes, forwardRef } from 'react';

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, checked, disabled, className, id, ...props }, ref) => {
    const controlId = id ?? `radio-${props.name}-${props.value}`;
    const wrapperClass = [
      'radio',
      checked ? 'radio--selected' : '',
      disabled ? 'radio--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');

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
    );

    if (!label) return control;

    return (
      <label htmlFor={controlId} className={`radio-row ${className ?? ''}`}>
        {control}
        <span className="radio-row__label">{label}</span>
      </label>
    );
  }
);
Radio.displayName = 'Radio';
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

### Dimensions

| Property | Value |
|---|---|
| Interactive target (hover halo) | 32 × 32 px |
| Inner padding | 8 px |
| Visible box / fill | 16 × 16 px |
| Halo border-radius | 40 px (fully round, token `--xxl`) |
| Box border-radius | 4 px |
| Box border width | 1.5 px |

### States & variants

| State | Checked variant | Box fill | Box border | Glyph | Halo |
|---|---|---|---|---|---|
| Enabled, not checked | Not checked | transparent | `#20222A` | none | none |
| Enabled, checked | Checked | `#EDA30D` | `#EDA30D` | white check | none |
| Enabled, indeterminate | Indeterminate | `#EDA30D` | `#EDA30D` | white minus bar | none |
| Hover, not checked | Not checked | transparent | `#20222A` | none | 32 × 32 `#EFF0F2` |
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
  background: var(--surface-page-hover, #EFF0F2);
}

.checkbox__box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid var(--neutral-800, #20222A);
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
  background: #EDA30D;
  border-color: #EDA30D;
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
  border-color: #9EA4B3;
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
  outline: 2px solid #EDA30D;
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
  onChange={(e) => e.target.checked ? selectAll() : clearAll()}
  aria-label="Select all rows"
/>
```

---

## 3. Toggle

Binary on/off control. Applies immediately on change; never use inside forms that require Save.

### Dimensions

| Property | Value |
|---|---|
| Track | 36 × 20 px, border-radius 10 px (fully pill) |
| Thumb | 16 × 16 px circle |
| Inset (thumb edge to track edge) | 2 px all sides |
| Thumb travel | 16 px horizontal |

### States

| State | Track colour | Thumb colour | Thumb position |
|---|---|---|---|
| Off (enabled) | `#656B7C` (neutral-400) | `#F9F9FA` (neutral-25) | left |
| On (enabled) | `#FFBB38` / `--surface-selected` | `#F9F9FA` | right |
| Off (disabled) | `#9EA4B3` (neutral-300) | `#F9F9FA` | left |
| On (disabled) | `#FFBB38` at 40% opacity | `#F9F9FA` | right |
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
  background: #656B7C;              /* Off */
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
  background: var(--neutral-25, #F9F9FA);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: transform 150ms ease;
}

/* On */
.toggle--on .toggle__track {
  background: var(--surface-selected, #FFBB38);
}
.toggle--on .toggle__thumb {
  transform: translateX(16px);
}

/* Disabled */
.toggle--disabled { cursor: not-allowed; }
.toggle--disabled .toggle__track { background: #9EA4B3; }
.toggle--disabled.toggle--on .toggle__track { background: #FFBB38; opacity: 0.4; }

/* Focus */
.toggle__input:focus-visible + .toggle__track {
  outline: 2px solid #EDA30D;
  outline-offset: 2px;
}
```

### React TypeScript

```tsx
import { InputHTMLAttributes, forwardRef } from 'react';

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: string;
  labelPosition?: 'left' | 'right';
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, labelPosition = 'right', checked, disabled, id, className, ...props }, ref) => {
    const controlId = id ?? `toggle-${props.name ?? ''}`;
    const wrapperClass = [
      'toggle',
      checked ? 'toggle--on' : '',
      disabled ? 'toggle--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');

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
    );

    if (!label) return control;

    return (
      <label htmlFor={controlId} className={`toggle-row toggle-row--${labelPosition} ${className ?? ''}`}>
        {labelPosition === 'left' && <span className="toggle-row__label">{label}</span>}
        {control}
        {labelPosition === 'right' && <span className="toggle-row__label">{label}</span>}
      </label>
    );
  }
);
Toggle.displayName = 'Toggle';
```

Note the use of `role="switch"` so assistive tech announces this as a toggle rather than a generic checkbox.

---

## Accessibility Rules (apply to all three)

1. **Always pair with a visible label** via `<label htmlFor>`, or provide `aria-label` / `aria-labelledby` for unlabelled controls (e.g. table-row checkboxes use `aria-label="Select row 3"`).
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
    <Checkbox
      key={d.id}
      name="dept"
      value={d.id}
      label={d.name}
      checked={selected.has(d.id)}
      onChange={() => toggleDept(d.id)}
    />
  ))}
</fieldset>
```

### Table "select all" header

```tsx
<th>
  <Checkbox
    checked={allSelected}
    indeterminate={!allSelected && someSelected}
    onChange={e => e.target.checked ? selectAll() : clearAll()}
    aria-label="Select all"
  />
</th>
```

### Radio card group (radios inside visual cards)

The radio itself remains the same; the card handles its own selected border using `--surface-selected`. Only one radio can be `checked` per group.

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
| Radio | `#EDA30D` | `#EFF0F2`, 24 × 24 |
| Checkbox | `#EDA30D` | `#EFF0F2`, 32 × 32 |
| Toggle | `#FFBB38` (`--surface-selected`) | none |

### Disabled summary

| Control | Disabled colour |
|---|---|
| Radio (ring + dot) | `#9EA4B3` |
| Checkbox (border) | `#9EA4B3` |
| Toggle off (track) | `#9EA4B3` |
| Toggle on (track) | `#FFBB38` at 40% opacity |
