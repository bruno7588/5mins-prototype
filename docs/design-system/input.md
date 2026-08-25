---
name: 5mins-input
description: Input field system for 5Mins.ai — four types. Outlined (standard labeled text field), Inline (borderless H1 title + description editor), Radio (selectable option row with radio inside a bordered field), and Integer (numeric stepper). All states (Enabled, Hover, Active with amber border, Filled, Disabled), error/success validation, label, helper text, right icon. Use for any text entry, form field, title editing, option-with-input row, or numeric setting.
---

# 5Mins.ai Input Field Component

## The four input types

| Type | What it is | Built component |
|---|---|---|
| **Outlined** | Standard labeled text field | `src/components/InputField` |
| **Inline** | Borderless title (Bold 32) + description (Regular 16) editor — e.g. course title | page-local patterns |
| **Radio** | Bordered field row with a 21px radio inside — pick an option AND type its value | not built yet |
| **Integer** | Compact numeric stepper (− / value / +) | `src/components/InputInteger` |

Spec source: Figma Library — set light `12111:3346` / dark `11180:1982`; Outlined `12111:2866`/`8974:24610`; Inline `12111:3347`/`10330:4736`; Radio `12111:3351`/`8974:30479`; Integer `12111:2565`/`10145:10895` (re-verified 2026-08-20). Hexes below are dark-mode fallbacks; tokens resolve per mode (see `colors.md`).

> **2026-08-20 — field borders use `--border-elevated`.** The border token was split in two: `--border` is the quiet weight for table rows, dividers and cards, and `--border-elevated` is one step stronger for field chrome. Enabled, filled and success borders are `--border-elevated`.
>
> **Disabled drops back to `--border`.** A disabled field should not hold an edge as firmly as a live one, so every disabled control — Outlined, Radio, Integer, and the Chip and Dropdown outside this doc — uses the quiet weight. The Radio, Integer, Chip and Dropdown sets all bind their disabled variants to `Border` in Figma; only the Outlined set still paints `Border-elevated`. Four-to-one — treat the Outlined disabled binding as stale, and `--border` as the rule.

## Overview — Outlined

The `InputField` component is the standard text entry control across the 5Mins.ai platform. It is an **outlined input** built on the 5Mins design system. Always use this component — never build raw `<input>` elements.

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
| **Enabled** | Default | Border `--border-elevated` |
| **Hover** | Mouse over field | Border `--border-hover` + background `--input-background` (translucent tint) — `--input-background-elevated` when the field sits on a card fill |
| **Active / Focused** | Input focused | Border `--selected` (gold) — **no** background fill |
| **Filled** | `value.length > 0` | Text switches from `--text-disabled` (placeholder) to `--text-primary` |
| **Disabled** | `disabled={true}` | Border drops to `--border`; label, value and helper all `--text-disabled`; no hover |

**Placeholder colour is `--text-disabled`, everywhere.** Any control whose value slot is empty — text input, textarea, search field, unselected dropdown trigger, unset date field — renders its placeholder in `--text-disabled`, then switches to `--text-primary` once filled. `--text-tertiary` is for helper text, captions, and icons, never for a placeholder.

**Hover is its own axis.** In Figma `Hovering` is a separate boolean from `State`, so hover composes with Filled and with `validation="success"` — a filled, valid field still picks up the `--border-hover` ring and `--input-background` fill on mouse-over. The two combinations it does *not* apply to are **Active** (focus wins: gold border, transparent background) and **Disabled**.

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

- Border → `--text-error`
- Label → `--text-error`
- Helper text → `--text-error`
- Danger icon (20px, Bold) auto-appears on the right, before any `iconRight`

### Success

```tsx
<InputField
  label="Email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  validation="success"
/>
```

- Border stays `--border-elevated`
- Label and helper keep their normal colours
- TickCircle icon (20px, Bold, `--text-success`) auto-appears on right

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
--border-elevated:        #383d4c;   /* field border — enabled, filled, success */
--border:                 #2d313d;   /* the quiet weight — any field border when disabled */
--border-hover:           #9ea4b3;   /* hovered border */
--selected:               #ffbb38;   /* focused / active border */
--text-error:             #e95c7b;   /* error label + border + helper */
--input-background:       rgba(69,76,94,0.16);   /* hover background fill (light: #BFC2CC @16%) */
--input-background-elevated: rgba(69,76,94,0.24);   /* same fill for a field on a card surface (light: #BFC2CC @16%) */
--page-background-hover:  #2d313d;   /* circular hover fill behind an Integer − / + control */
--text-primary:           #f9f9fa;   /* filled input value */
--text-secondary:         #bfc2cc;   /* label; Integer helper text */
--text-tertiary:          #9ea4b3;   /* Outlined helper text */
--text-disabled:          #656b7c;   /* placeholder; all text when disabled */
--text-success:           #18a957;   /* success tick icon */
```

> **Helper text is not one colour.** Outlined helper text is `--text-tertiary`; **Integer** helper text is `--text-secondary`. Error helper text is `--text-error` in both.

> **Two field fills, one rule.** `--input-background` is the default — any field, search, dropdown, or chip sitting on the page surface. Reach for `--input-background-elevated` only when the field sits on a card fill (`--cards-background`): in dark mode the default 16% tint lands within a point of the card and the field visually disappears, so the elevated token steps the tint up to 24%. Light mode already separates page and card, so both tokens hold at 16% there and are interchangeable.

---

## Typography

| Element | Font | Weight | Size | Line height |
|---------|------|--------|------|------------|
| Label | Poppins | **600 (Semibold)** | 14px | 1.5 |
| Input text | Poppins | 400 (Regular) | 14px | 1.5 |
| Helper text | Poppins | 400 (Regular) | 14px | 1.5 |

> **The label is Paragraph M semibold** (Figma `5445:24009`, 2026-08-25) — 14px / 600 / 1.5, `--text-secondary`. This holds for *every* field label in the product, not just `InputField`: dropdowns, date fields, textareas, steppers, and the hand-rolled `<label>` elements in page-local drawers and modals. Never drop back to Medium 500, and never reach for Bold 700 to make a label stand out — 600 is the label weight.
>
> Option text inside a radio, checkbox, or toggle row is **not** a field label — that stays Regular 400 (see `selection-controls.md`).

---

## Spacing

| Property | Value |
|----------|-------|
| Field padding | `8px 12px` |
| Field border-radius | `12px` |
| Gap (label → field → helper) | `8px` |
| Gap (input text → icon cluster) | `24px` |
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
| Hard-coded hex colors | Design tokens (`var(--border-elevated, ...)`) |
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

# 5Mins.ai Input Field — Inline

## Overview — Inline

A borderless editor for a page-level title and optional description — used where the content IS the field (course builder title, card names). No box, no label: the text styles are the affordance.

| Element | Style | Placeholder | Filled |
|---|---|---|---|
| Title | Poppins **Bold 32** (H1), 1.5 | `--text-disabled` ("Add Title") | `--text-primary` |
| Description (optional) | Poppins Regular 16, 1.5 | `--text-disabled` ("Add a description") | `--text-secondary` |

- Column gap **4px**; reference width 900px.
- **States:** Enabled (placeholders) → Active (blinking `--text-primary` caret) → Filled.
- **Error (Filled):** title turns `--text-error`, a 24px `Danger` (Linear) icon appears at the row end, and an "Error message" line (Regular 14, `--text-error`) renders under the title. The description keeps its normal color.
- No hover treatment — the inline editor reads as text until clicked.

```tsx
<div className="inline-input">
  <input className="inline-input__title" placeholder="Add Title" />
  <input className="inline-input__description" placeholder="Add a description" />
</div>
```

```css
.inline-input { display: flex; flex-direction: column; gap: 4px; }
.inline-input__title { border: 0; background: none; font: 700 32px/1.5 Poppins; color: var(--text-primary); }
.inline-input__title::placeholder { color: var(--text-disabled); }
.inline-input__title.has-error { color: var(--text-error); }
.inline-input__description { border: 0; background: none; font: 400 16px/1.5 Poppins; color: var(--text-secondary); }
.inline-input__description::placeholder { color: var(--text-disabled); }
```

---

# 5Mins.ai Input Field — Radio

## Overview — Radio

A bordered field row with a **21px radio button inside** — the user both selects the option and can type into it (e.g. quiz answer options, "other" choices). Shares the Outlined field chrome.

- Layout: `[radio 21px] [text]`, gap **8px**, padding `8px 12px`, radius 12px, optional label above (Medium 14 `--text-secondary`, gap 8).
- Text: placeholder `--text-disabled`, value `--text-primary` (Regular 14).

| State | Border | Radio | Notes |
|---|---|---|---|
| Enabled | `--border-elevated` | unselected | |
| Hover | `--border-hover` | unselected | + `--input-background` fill |
| Active (typing) | `--selected` | unselected | blinking caret |
| Selected + Filled | `--border-elevated` | **on** (amber dot) | selecting does not keep the amber border |
| Success validation | `--border-elevated` | on | trailing 20px bold tick-circle |
| Disabled | `--border` | per state | all text `--text-disabled` |

Radio behavior (halo, amber dot, grouping) follows `selection-controls.md`.

---

# 5Mins.ai Input Field — Integer

## Overview

The `InputInteger` component is the numeric stepper used for small whole-number settings (e.g. *Maximum course attempts*, *Due days to complete course*). It is a bordered field with a **minus** control, a **centred, typeable value**, and a **plus** control. The value can be both stepped (− / +) and typed directly.

**Figma source:** `Library → Input Field / Integer` — light `12111:2565` / dark `10145:10895`

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
| **Enabled** | Default | Border `--border-elevated`; helper `--text-secondary` |
| **Hover** | Mouse over field | Border `--border-hover`. **The field itself gets no fill** — instead the − / + control under the pointer picks up a circular `--page-background-hover` background |
| **Active / Focused** | Field focused (typing) | Border `--selected` (gold), blinking caret |
| **Filled** | Value set by the user | Value `--text-primary` (the resting `0` renders `--text-disabled`) |
| **Error** | `validation="error"` | Border, **label** and helper all `--text-error` |
| **Success** | `validation="success"` | Border stays `--border-elevated` — no tick icon; the Integer has no icon slot |
| **Disabled** | `disabled={true}` | Border drops to `--border`; label / value / helper `--text-disabled` |

**Hover differs from Outlined.** The Outlined field tints its whole box on hover (`--input-background`); the Integer does not. Its hover affordance is per-control — a circular `--page-background-hover` behind whichever stepper you are pointing at — because the − and + are the interactive targets, not the box.

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
| Step control icons | Figma draws `21×21px`; the built control uses the DS-standard **20px** Iconsax glyph inside a **24px** circular hover target (`--radius-full`), the one deliberate deviation — 21px would sit under the minimum pointer target |
| Value box | `26px` wide, centred |
| Gap (label → field → helper) | `8px` |
| Field width | Content-sized (`fit-content`) — ~116px at the default 3-digit value |

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
