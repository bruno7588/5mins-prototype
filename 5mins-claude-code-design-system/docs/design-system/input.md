# 5Mins.ai Input Field Component

## Overview

The `InputField` component is the standard text entry control across the 5Mins.ai platform. It is an **outlined input** built on the 5Mins design system. Always use this component — never build raw `<input>` elements.

**Figma source:** `Library → Input Field (Outlined)` — node `8974-24610`

---

## Import

```tsx
import { InputField } from '@/components/ui/InputField';
// Icon library
import { Eye, Danger, TickCircle } from 'iconsax-react';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label displayed above the field |
| `placeholder` | `string` | `'Input text'` | Greyed placeholder shown when empty |
| `value` | `string` | — | Controlled value |
| `onChange` | `ChangeEventHandler` | — | Input change handler |
| `helperText` | `string` | — | Hint below the field; styled as error when `validation="error"` |
| `validation` | `'none' \| 'error' \| 'success'` | `'none'` | Drives border, icon, and text colours |
| `iconRight` | `ReactNode` | — | Optional 20px icon slot on the trailing edge |
| `disabled` | `boolean` | `false` | Mutes all colours and blocks interaction |
| `type` | `string` | `'text'` | HTML input type (`text`, `email`, `password`, etc.) |
| `className` | `string` | — | Extra class names on the outer wrapper |

---

## States (handled automatically)

| State | Trigger | Visual |
|-------|---------|--------|
| **Enabled** | Default | Border `#383d4c` |
| **Hover** | Mouse over field | Border `#9ea4b3`, background `#2d313d` |
| **Active / Focused** | Input focused | Border `#ffbb38` (gold) |
| **Filled** | `value.length > 0` | Text switches to `#f9f9fa` |
| **Disabled** | `disabled={true}` | All text `#656b7c`, no hover |

---

## Validation

### Error

```tsx
<InputField
  label="Email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  validation="error"
  helperText="Please enter a valid email address"
/>
```

- Border → `#e95c7b` (red)
- Label → `#e95c7b`
- Helper text → `#e95c7b`
- Danger icon auto-appears on right

### Success

```tsx
<InputField
  label="Email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  validation="success"
/>
```

- Border stays `#383d4c`
- TickCircle icon (Bold, green) auto-appears on right

---

## Password Field Pattern

```tsx
const [show, setShow] = useState(false);
const [password, setPassword] = useState('');

<InputField
  label="Password"
  type={show ? 'text' : 'password'}
  placeholder="Enter password"
  value={password}
  onChange={e => setPassword(e.target.value)}
  iconRight={
    <button
      type="button"
      onClick={() => setShow(s => !s)}
      aria-label={show ? 'Hide password' : 'Show password'}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
    >
      <Eye size={20} color="var(--text-tertiary, #9ea4b3)" variant="Linear" />
    </button>
  }
/>
```

> When `validation="error"` or `"success"` is combined with `iconRight`, the validation icon and the right icon automatically stack side-by-side with `8px` gap — no extra code needed.

---

## Design Tokens Reference

```css
--border:                 #383d4c;   /* default border */
--border-hover:           #9ea4b3;   /* hovered border */
--selected:               #ffbb38;   /* focused / active border */
--text-error:             #e95c7b;   /* error text + border */
--input-background-hover: #2d313d;   /* hovered background fill */
--text-primary:           #f9f9fa;   /* filled input value */
--text-secondary:         #bfc2cc;   /* label */
--text-tertiary:          #9ea4b3;   /* placeholder + helper */
--text-disabled:          #656b7c;   /* all text when disabled */
--text-success:           #18a957;   /* success tick icon */
```

---

## Typography

| Element | Font | Weight | Size | Line height |
|---------|------|--------|------|------------|
| Label | Poppins | 500 (Medium) | 14px | 1.5 |
| Input text | Poppins | 400 (Regular) | 14px | 1.5 |
| Helper text | Poppins | 400 (Regular) | 14px | 1.5 |

---

## Spacing

| Property | Value |
|----------|-------|
| Field padding | `8px 12px` |
| Field border-radius | `12px` |
| Gap (label → field → helper) | `8px` |
| Icon size | `20×20px` |
| Icon gap (when stacked) | `8px` |

---

## Accessibility Checklist

- [ ] `<label>` linked to `<input>` via `htmlFor` / `id`
- [ ] `aria-describedby` links helper/error text to input
- [ ] `aria-invalid="true"` set when `validation="error"`
- [ ] Password toggle button has `aria-label="Show/Hide password"`
- [ ] Disabled inputs use `disabled` attribute (not just `pointer-events: none`)

---

## Common Mistakes

| Wrong | Right |
|-------|-------|
| Raw `<input>` with custom styles | `<InputField>` |
| Hard-coded hex colors | Design tokens (`var(--border, ...)`) |
| `helperText` alone for errors | `helperText` + `validation="error"` |
| Building your own password icon layout | Pass `iconRight`; composition is automatic |
| `readOnly` for disabled | `disabled={true}` |

---

## Examples at a Glance

```tsx
{/* 1. Simple */}
<InputField placeholder="Search learners..." value={q} onChange={e => setQ(e.target.value)} />

{/* 2. Full — label + helper */}
<InputField label="Full name" placeholder="Jane Smith" helperText="As it appears on your ID" value={name} onChange={e => setName(e.target.value)} />

{/* 3. Error */}
<InputField label="Email" validation="error" helperText="Invalid email" value={email} onChange={e => setEmail(e.target.value)} />

{/* 4. Success */}
<InputField label="Email" validation="success" value={email} onChange={e => setEmail(e.target.value)} />

{/* 5. Disabled */}
<InputField label="Account ID" value="ACC-00123" disabled />

{/* 6. Password */}
<InputField label="Password" type={show ? 'text' : 'password'} iconRight={<EyeToggle />} value={pw} onChange={e => setPw(e.target.value)} />
```

---

# 5Mins.ai Input Field — Integer

## Overview

The `InputInteger` component is the numeric stepper used for small whole-number settings (e.g. *Maximum course attempts*, *Due days to complete course*). It is a bordered field with a **minus** control, a **centred, typeable value**, and a **plus** control. The value can be both stepped (− / +) and typed directly.

**Figma source:** `Library → Input Field / Integer` — node `11820-2571`

---

## Import

```tsx
import InputInteger from '@/components/InputInteger/InputInteger';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label displayed above the field |
| `value` | `number` | — | Controlled value (required) |
| `onChange` | `(value: number) => void` | — | Fires on step and on typing (required) |
| `min` | `number` | `0` | Lower bound; `−` disables at min, typed values clamp up on blur |
| `max` | `number` | — | Upper bound; `+` disables at max, typed values clamp down live |
| `step` | `number` | `1` | Increment for the − / + controls |
| `helperText` | `ReactNode` | — | Hint below the field (accepts rich content, e.g. an emphasised word) |
| `validation` | `'none' \| 'error' \| 'success'` | `'none'` | Drives border + helper colour |
| `disabled` | `boolean` | `false` | Mutes colours and blocks interaction |
| `className` | `string` | — | Extra class names (e.g. `input-integer--inline` for label-before-field) |
| `ariaLabel` | `string` | — | Accessible name when no visible `label` |

---

## Typing behaviour

- The value is a real `<input inputMode="numeric">`, so users can **type** a number as well as step it.
- While focused, a local draft holds the raw text so clearing/partial entry isn't fought by the controlled value. Non-digit characters are stripped.
- Values above `max` clamp **live**; values below `min` (and an empty field) clamp on **blur**.
- Native number spinners are hidden; the − / + controls are the only steppers.

---

## States

| State | Trigger | Visual |
|-------|---------|--------|
| **Enabled** | Default | Border `#383d4c` |
| **Hover** | Mouse over field | Border `#9ea4b3` |
| **Active / Focused** | Field focused (typing) | Border `#ffbb38` (gold) |
| **Error** | `validation="error"` | Border `#e95c7b`, helper red |
| **Disabled** | `disabled={true}` | Label / value / helper `#656b7c` |

---

## Layout variants

| Variant | Class | Layout |
|---------|-------|--------|
| **Stacked** (default) | — | Label on top, then field, then helper |
| **Inline** | `input-integer--inline` | Label before (left of) the field; helper wraps full-width below |

---

## Spacing

| Property | Value |
|----------|-------|
| Field padding | `8px 12px`  (`--space-s --space-sm`) |
| Field border-radius | `12px` (`--radius-sm`) |
| Gap (− / value / +) | `12px` (`--space-sm`) |
| Step control size | `24×24px`, circular hover |
| Value box | `32px` wide, centred |
| Gap (label → field → helper) | `8px` |

---

## Examples

```tsx
{/* 1. Simple bounded stepper */}
<InputInteger label="Maximum course attempts" value={attempts} onChange={setAttempts} min={1} />

{/* 2. With rich helper text */}
<InputInteger
  label="Maximum course attempts"
  value={attempts}
  onChange={setAttempts}
  min={1}
  helperText={<>…they're marked <span className="cs-failed">Failed</span>.</>}
/>

{/* 3. Inline label */}
<InputInteger className="input-integer--inline" label="Due days to complete course" value={days} onChange={setDays} min={1} />
```
