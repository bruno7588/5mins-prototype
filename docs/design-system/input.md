---
name: 5mins-input
description: Input field system for 5Mins.ai - four types. Outlined (standard labeled text field), Inline (borderless H1 title + description editor), Radio (selectable option row with radio inside a bordered field), and Integer (numeric stepper). All states (Enabled, Hover, Active with amber border, Filled, Disabled), error/success validation, label, helper text, right icon. Use for any text entry, form field, title editing, option-with-input row, or numeric setting.
---

# Input field

Text and number entry: the labelled form field, the in-place title editor, the option-with-input row and the numeric stepper.

**Code:** `import InputField from '@/components/InputField/InputField'`, `import InputInline from '@/components/InputInline/InputInline'`, `import InputInteger from '@/components/InputInteger/InputInteger'` (all default exports). Radio: no shared component yet.
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, set `11180:1982`; Outlined `8974:24610`; Inline `10330:4736`; Radio `8974:30479`; Integer `10145:10895`
**Last verified:** 2026-10-09

## Usage

| Type | What it is | Built component |
|---|---|---|
| **Outlined** | Standard labeled text field | `src/components/InputField` |
| **Inline** | Borderless title + optional description editor, sizes L (Bold 32 / Regular 16) and M (Bold 20 / Regular 14), e.g. course title | `src/components/InputInline` |
| **Radio** | Bordered field row with a 21px radio inside - pick an option AND type its value | not built yet |
| **Integer** | Compact numeric stepper (− / value / +) | `src/components/InputInteger` |

Each type has its own block below. These rules apply to all of them:

- **Placeholder colour is `--text-disabled`, everywhere.** Any control whose value slot is empty - text input, textarea, search field, unselected dropdown trigger, unset date field - renders its placeholder in `--text-disabled`, then switches to `--text-primary` once filled. `--text-tertiary` is for helper text, captions, and icons, never for a placeholder.
- **The label is Paragraph M semibold** (Figma `5445:24009`) - 14px / 600 / 1.5, `--text-secondary`. This holds for *every* field label in the product, not just `InputField`: dropdowns, date fields, textareas, steppers, and the hand-rolled `<label>` elements in page-local drawers and modals. Never drop back to Medium 500, and never reach for Bold 700 to make a label stand out - 600 is the label weight. Option text inside a radio, checkbox, or toggle row is **not** a field label - that stays Regular 400 (see `selection-controls.md`).
- **Field borders use `--border-elevated`.** `--border` is the quiet weight for the page ground and inside drawers and modals, and `--border-elevated` is one step stronger, used on cards and menus and for field chrome. Enabled, filled and success borders are `--border-elevated`.
- **Disabled drops back to `--border`.** A disabled field should not hold an edge as firmly as a live one, so every disabled control - Outlined, Radio, Integer, and the Chip and Dropdown outside this doc - uses the quiet weight.
- **Two field fills, one rule.** `--input-background` is the default - any field, search, dropdown, or chip sitting on the page surface. Reach for `--input-background-elevated` only when the field sits on a card fill (`--cards-background`): in dark mode the default 16% tint lands within a point of the card and the field visually disappears, so the elevated token steps the tint up to 32%. Light mode already separates page and card, but the elevated token still steps up to 32% there (`tokens.css`), so the two are not interchangeable in either mode.
- **Helper text is not one colour.** Outlined helper text is `--text-tertiary`; **Integer** helper text is `--text-secondary`. Error helper text is `--text-error` in both.
- Hexes in the token tables are dark-mode values; tokens resolve per mode (see `colors.md`).

---

## InputField (Outlined)

The `InputField` component is the standard text entry control across the 5Mins.ai platform. It is an **outlined input** built on the 5Mins design system. Always use this component - never build raw `<input>` elements.

### Usage

**Intent:** the standard labelled single-line text field for any form value (names, emails, links, subjects).

**Use when**
- A form needs a single line of free text with a visible label, e.g. "Name of the lesson" or "Role Name".
- The value needs inline validation feedback (error, warning or success) under the field.

**Don't use when**
- The field filters or finds content → use Search ([doc](search.md))
- The value is a small whole number → use InputInteger (below)
- The value is a date → use DatePickerField ([doc](date-picker-field.md)), not `type="date"`
- The user picks from a fixed list → use Dropdown ([doc](dropdown.md))
- The text is a page-level title edited in place → use `InputInline` (see InputInline below)

**Do**
- Use `InputField` for every labelled single-line field; never build a raw `<input>` with custom styles.
- Pass `label` so the component links `<label htmlFor>` to the input; labels are Paragraph M semibold (14px / 600) in `--text-secondary`.
- Pair `validation="error"` with `helperText` for the message; call sites show it on blur (`ResourceForm`) or after a save attempt (`SaveReportDrawer`).
- Use `validation="warning"` (amber, Linear `Danger` icon) for a soft block such as a duplicate name.
- Put trailing affordances (password eye, calendar icon) in `iconRight`; the validation icon stacks before it automatically.
- Use `disabled` for a non-editable field, not `readOnly`.

**Don't**
- Don't colour a placeholder with `--text-tertiary`; placeholders are `--text-disabled` everywhere.
- Don't hard-code hex values or px sizes in overrides; use tokens.
- Don't use `helperText` alone to signal an error; it only turns red with `validation="error"`.
- Don't drop the label weight to 500 or raise it to 700; 600 is the label weight.

| Wrong | Right |
|-------|-------|
| Raw `<input>` with custom styles | `<InputField>` |
| Hard-coded hex colors | Design tokens (`var(--border-elevated)`) |
| `helperText` alone for errors | `helperText` + `validation="error"` |
| Building your own password icon layout | Pass `iconRight`; composition is automatic |
| `readOnly` for disabled | `disabled={true}` |

**Canonical spec:** padding `var(--space-s) var(--space-sm)` (8px 12px); radius `var(--radius-sm)` (12px); label to field to helper gap `var(--space-s)` (8px); text Paragraph M (14px / 400 / 1.5). Border `--border-elevated` at rest, `--border-hover` + `--input-background` fill on hover (the component always uses `--input-background`; a caller on a card fill overrides it with `--input-background-elevated`), `--selected` on focus, `--border` when disabled, `--text-error` on error. Placeholder `--text-disabled`, helper `--text-tertiary`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `8974:24610`.

### Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| State | Enabled / Active / Filled / n/a | n/a | CSS `:focus` (Active); Filled = `value` non-empty | `n/a` is the sentinel used on Disabled variants |
| Hovering | false / true | n/a | CSS `:hover` | composes with Filled and success; not with Active or Disabled |
| Disabled | false / true | `disabled` | `false` (default) / `true` | |
| Validation | none / error / success | `validation` | `'none'` (default) / `'error'` / `'success'` | code also has `'warning'` |
| Show label (boolean) + Label (text) | true / false; "Label" | `label` | `ReactNode`, omitted = no label | |
| Show helper text (boolean) + Helper text (text) | true / false; "Helper text" | `helperText` | `string`, omitted = none | |
| Error message (text) | "Error message" | `helperText` with `validation="error"` | `string` | bound on the error variants |
| Icon right + Icon (swap) | false / true; Iconsax glyph | `iconRight` | `ReactNode`, omitted = none | still a variant: on success and error variants the trailing icon wraps the validation icon in a frame |
| Placeholder (text) | "Input text" | `placeholder` | `string` (default "Input text") | bound on Enabled, Active and n/a variants |
| Value (text) | "Input text" | `value` | `string` | bound on Filled variants |

- **Figma only:** the `n/a` State value. The Outlined disabled variants bind their border to `Border-elevated`; the Radio, Integer, Chip and Dropdown sets bind disabled to `Border`. Treat the Outlined disabled binding as stale, and `--border` as the rule.
- **Code only:** `validation="warning"`, `onChange`, `onBlur`, `type` (default `'text'`), `autoFocus`, `className`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | none | Label displayed above the field; text, or a node for a label with an inline aside such as "(optional)" |
| `placeholder` | `string` | `'Input text'` | Greyed placeholder shown when empty |
| `value` | `string` | none | Controlled value |
| `onChange` | `ChangeEventHandler` | none | Input change handler |
| `onBlur` | `FocusEventHandler` | none | Input blur handler |
| `helperText` | `string` | none | Hint below the field; styled as error when `validation="error"` |
| `validation` | `'none' \| 'error' \| 'warning' \| 'success'` | `'none'` | Drives border, icon, and text colours; `warning` uses `--text-warning` and a Linear `Danger` icon |
| `iconRight` | `ReactNode` | none | Optional 20px icon slot on the trailing edge |
| `disabled` | `boolean` | `false` | Mutes all colours and blocks interaction |
| `type` | `string` | `'text'` | HTML input type (`text`, `email`, `password`, `url`, etc.) |
| `className` | `string` | none | Extra class names on the outer wrapper |
| `autoFocus` | `boolean` | none | Focuses the input on mount |

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| InputField (Outlined) | _to be mapped by engineering_ | | |

### Anatomy

| Element | Font | Weight | Size | Line height |
|---------|------|--------|------|------------|
| Label | Poppins | **600 (Semibold)** | 14px | 1.5 |
| Input text | Poppins | 400 (Regular) | 14px | 1.5 |
| Helper text | Poppins | 400 (Regular) | 14px | 1.5 |

| Property | Value |
|----------|-------|
| Field padding | `8px 12px` |
| Field border-radius | `12px` |
| Gap (label → field → helper) | `8px` |
| Gap (input text → icon cluster) | `24px` |
| Icon size | `20×20px` |
| Icon gap (when stacked) | `8px` |

When `validation="error"` or `"success"` is combined with `iconRight`, the validation icon and the right icon automatically stack side-by-side with `8px` gap - no extra code needed.

### States

| State | Trigger | Visual |
|-------|---------|--------|
| **Enabled** | Default | Border `--border-elevated` |
| **Hover** | Mouse over field | Border `--border-hover` + background `--input-background` (translucent tint) - `--input-background-elevated` when the field sits on a card fill |
| **Active / Focused** | Input focused | Border `--selected` (gold) - **no** background fill |
| **Filled** | `value.length > 0` | Text switches from `--text-disabled` (placeholder) to `--text-primary` |
| **Disabled** | `disabled={true}` | Border drops to `--border`; label, value and helper all `--text-disabled`; no hover |
| **Error** | `validation="error"` | Border, label and helper text `--text-error`; Danger icon (20px, Bold) auto-appears on the right, before any `iconRight` |
| **Warning** | `validation="warning"` | `--text-warning` and a Linear `Danger` icon |
| **Success** | `validation="success"` | Border stays `--border-elevated`; label and helper keep their normal colours; TickCircle icon (20px, Bold, `--text-success`) auto-appears on right |

**Hover is its own axis.** In Figma `Hovering` is a separate boolean from `State`, so hover composes with Filled and with `validation="success"` - a filled, valid field still picks up the `--border-hover` ring and `--input-background` fill on mouse-over. The two combinations it does *not* apply to are **Active** (focus wins: gold border, transparent background) and **Disabled**.

### Tokens

| Token | Dark value | Used for |
|---|---|---|
| `var(--border-elevated)` | `#383d4c` | field border - enabled, filled, success |
| `var(--border)` | `#2d313d` | the quiet weight - any field border when disabled |
| `var(--border-hover)` | `#9ea4b3` | hovered border |
| `var(--selected)` | `#ffbb38` | focused / active border |
| `var(--text-error)` | `#e95c7b` | error label + border + helper |
| `var(--input-background)` | `rgba(69,76,94,0.16)` | hover background fill (light: #BFC2CC @16%) |
| `var(--input-background-elevated)` | `rgba(69,76,94,0.32)` | same fill for a field on a card surface (light: #BFC2CC @32%) |
| `var(--page-background-hover)` | `#2d313d` | circular hover fill behind an Integer − / + control |
| `var(--text-primary)` | `#f9f9fa` | filled input value |
| `var(--text-secondary)` | `#bfc2cc` | label; Integer helper text |
| `var(--text-tertiary)` | `#9ea4b3` | Outlined helper text |
| `var(--text-disabled)` | `#656b7c` | placeholder; all text when disabled |
| `var(--text-success)` | `#18a957` | success tick icon |

### Accessibility

- [ ] `<label>` linked to `<input>` via `htmlFor` / `id`
- [ ] `aria-describedby` links helper/error text to input
- [ ] `aria-invalid="true"` set when `validation="error"`
- [ ] Password toggle button has `aria-label="Show/Hide password"`
- [ ] Disabled inputs use `disabled` attribute (not just `pointer-events: none`)

### Examples

```tsx
import InputField from '@/components/InputField/InputField';
// Icon library
import { Eye, Danger, TickCircle } from 'iconsax-react';
```

```tsx
{/* 1. Simple (to search or filter, use Search instead) */}
<InputField placeholder="Role Name" value={role} onChange={e => setRole(e.target.value)} />

{/* 2. Full - label + helper */}
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

Error:

```tsx
<InputField
  label="Email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  validation="error"
  helperText="Please enter a valid email address"
/>
```

Success:

```tsx
<InputField
  label="Email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  validation="success"
/>
```

Password field pattern:

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
      <Eye size={20} color="var(--text-tertiary)" variant="Linear" />
    </button>
  }
/>
```

---

## InputInteger (Integer)

The `InputInteger` component is the numeric stepper used for small whole-number settings (e.g. *Maximum course attempts*, *Due days to complete course*). It is a bordered field with a **minus** control, a **centred, typeable value**, and a **plus** control. The value can be both stepped (− / +) and typed directly.

### Usage

**Intent:** a compact − / value / + stepper for small whole-number settings that can also be typed into.

**Use when**
- A setting is a small bounded whole number, e.g. "Maximum retakes allowed", "Days to complete each re-attempt", "Days to add".
- A range filter needs a from/to pair of numbers (two steppers with `ariaLabel`s like "from" and "to").
- The number carries a unit such as a percentage (`suffix="%"`).

**Don't use when**
- The value is free text or a long number such as an ID → use InputField (above)
- The value is a date → use DatePickerField ([doc](date-picker-field.md))

**Do**
- Set `min` (and `max` where one exists); `−` and `+` disable at the bounds and typed values clamp.
- Give an `ariaLabel` whenever there is no visible `label`.
- Use `className="input-integer--inline"` to put the label to the left of the field.
- Keep the unit inside the control with `suffix` when it is a symbol such as `%`.

**Don't**
- Don't hand-roll − / + buttons next to a text input; `InputInteger` is the numeric stepper.
- Don't show native number spinners; the − / + controls are the only steppers.
- Don't give the whole box a hover fill; hover shows on the − / + control under the pointer (circular `--page-background-hover`).

**Canonical spec:** height 37px (matches the medium Dropdown, `8925:1408`, so the two line up in a row; the 24px hover circles overhang the 8px padding instead of growing the field to 42px); padding `var(--space-s) var(--space-sm)` (8px 12px); radius `var(--radius-sm)` (12px); gap between controls `var(--space-sm)` (12px); 20px Iconsax glyph in a 24px `var(--radius-full)` hover target; width fits content. Border `--border-elevated`, `--border-hover` on hover, `--selected` on focus, `--text-error` on error, `--border` when disabled. Helper `--text-secondary`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `10145:10895`.

### Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| State | Enabled / Hover / Active / Filled / n/a | n/a | CSS `:hover`, `:focus-within`; Filled = value set | `n/a` is the sentinel used on Disabled variants |
| Validation | none / success / error | `validation` | `'none'` (default) / `'success'` / `'error'` | |
| Disabled | false / true | `disabled` | `false` (default) / `true` | |
| Label + Label (text) | true / false; "Label" | `label` / `ariaLabel` | `string`; omit `label` and pass `ariaLabel` for no visible label | still a variant: the error variant without a label draws its message in the label style |
| Helper text + Helper text (text) | false / true; "Helper text" | `helperText` | `ReactNode`, omitted = none | still a variant: error variants show their message under `Helper text=false` |
| Error message (text) | "Error message" | `helperText` with `validation="error"` | `ReactNode` | |

- **Figma only:** the `n/a` State value. The value text ("0" / "100") has no property because it differs by state. Figma draws the step icons at `21×21px`; code uses 20px (see Anatomy).
- **Code only:** `value`, `onChange`, `min` (default 0), `max`, `step` (default 1), `suffix`, `className` (incl. `input-integer--inline`), `ariaLabel`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | none | Label displayed above the field |
| `value` | `number` | none | Controlled value (required) |
| `onChange` | `(value: number) => void` | none | Fires on step and on typing (required) |
| `min` | `number` | `0` | Lower bound; `−` disables at min, typed values clamp up on blur |
| `max` | `number` | none | Upper bound; `+` disables at max, typed values clamp down live |
| `step` | `number` | `1` | Increment for the − / + controls |
| `helperText` | `ReactNode` | none | Hint below the field (accepts rich content, e.g. an emphasised word) |
| `validation` | `'none' \| 'error' \| 'success'` | `'none'` | Drives border + helper colour |
| `disabled` | `boolean` | `false` | Mutes colours and blocks interaction |
| `className` | `string` | none | Extra class names (e.g. `input-integer--inline` for label-before-field) |
| `ariaLabel` | `string` | none | Accessible name when no visible `label` |
| `suffix` | `string` | none | Static unit shown right after the value, inside the control (e.g. `%`) |

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| InputInteger (Integer) | _to be mapped by engineering_ | | |

### Anatomy

| Property | Value |
|----------|-------|
| Field padding | `8px 12px`  (`--space-s --space-sm`) |
| Field border-radius | `12px` (`--radius-sm`) |
| Field height | `37px` |
| Gap (− / value / +) | `12px` (`--space-sm`) |
| Step control icons | Figma draws `21×21px`; the built control uses the DS-standard **20px** Iconsax glyph inside a **24px** circular hover target (`--radius-full`), the one deliberate deviation - 21px would sit under the minimum pointer target |
| Value box | `26px` wide, centred |
| Gap (label → field → helper) | `8px` |
| Field width | Content-sized (`fit-content`) - ~116px at the default 3-digit value |

### Variants

| Variant | Class | Layout |
|---------|-------|--------|
| **Stacked** (default) | none | Label on top, then field, then helper |
| **Inline** | `input-integer--inline` | Label before (left of) the field; helper wraps full-width below |

### States

| State | Trigger | Visual |
|-------|---------|--------|
| **Enabled** | Default | Border `--border-elevated`; helper `--text-secondary` |
| **Hover** | Mouse over field | Border `--border-hover`. **The field itself gets no fill** - instead the − / + control under the pointer picks up a circular `--page-background-hover` background |
| **Active / Focused** | Field focused (typing) | Border `--selected` (gold), blinking caret |
| **Filled** | Value set by the user | Value `--text-primary`, including the resting `0` |
| **Error** | `validation="error"` | Border, **label** and helper all `--text-error` |
| **Success** | `validation="success"` | Border stays `--border-elevated` - no tick icon; the Integer has no icon slot |
| **Disabled** | `disabled={true}` | Border drops to `--border`; label / value / helper `--text-disabled` |

**Hover differs from Outlined.** The Outlined field tints its whole box on hover (`--input-background`); the Integer does not. Its hover affordance is per-control - a circular `--page-background-hover` behind whichever stepper you are pointing at - because the − and + are the interactive targets, not the box.

**Typing behaviour**
- The value is a real `<input inputMode="numeric">`, so users can **type** a number as well as step it.
- While focused, a local draft holds the raw text so clearing/partial entry isn't fought by the controlled value. Non-digit characters are stripped.
- Values above `max` clamp **live**; values below `min` (and an empty field) clamp on **blur**.
- Native number spinners are hidden; the − / + controls are the only steppers.

### Tokens

Shares the InputField tokens above; the Integer adds `var(--page-background-hover)` for the circular step-control hover and uses `var(--text-secondary)` for helper text.

### Accessibility

- Give an `ariaLabel` whenever there is no visible `label`.
- `−` and `+` disable at the bounds.
- The 24px circular hover target keeps the step controls above the minimum pointer target.

### Examples

```tsx
import InputInteger from '@/components/InputInteger/InputInteger';
```

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

---

## InputInline (Inline)

A borderless editor for a title and optional description, used where the content IS the field (course, program and automation names). No box, no label: the text styles are the affordance. Built as `src/components/InputInline`.

### Usage

**Intent:** edits a title (and optional description) in place where the text is the content, so the page reads as the finished thing rather than a form.

**Use when**
- The field is the headline of what is being built: a course, program or automation name.
- The value should look like the page heading it becomes, with no label or box.

**Don't use when**
- The field sits in a form with other labelled fields → use InputField (above)
- The title only needs a short name in a drawer or card form (e.g. a situational test title) → use InputField

**Do**
- Use `size="L"` for page headlines (course, program) and `size="M"` inside modals and drawers (automation details).
- Pass `titleAriaLabel` (and `descriptionAriaLabel`); there is no visible label.
- Pass the error as a short message via `error`; it shows between the title and the description, and the title turns `--text-error`.
- Hold the error back until the field has been left (`onTitleBlur`), so an untouched form never opens in red.

**Don't**
- Don't add a box, border, hover fill or focus ring; Active is the caret alone.
- Don't add an error icon; the red title and the message carry the error.
- Don't hand-roll a borderless title `<input>`; use `InputInline`.

**Canonical spec:** L title H1 Bold 32 / 1.5, description Paragraph L Regular 16 / 1.5; M title H3 Bold 20 / 1.5, description Paragraph M Regular 14 / 1.5. Gap `var(--space-xs)` (4px). Placeholders `--text-disabled` ("Add Title", "Add a description"); filled title `--text-primary`, description `--text-secondary`; caret `--text-primary`. Error: title and message `--text-error`, message Paragraph M Regular 14. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `10330:4736`.

Used by Course details (L, with error), Program builder (L) and Automation details (M, title only).

### Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Size | L / M | `size` | `'L'` (default) / `'M'` | |
| State | Enabled / Active / Filled | n/a | CSS `:focus` (caret); Filled = `title` non-empty | |
| Validation + Error message (text) | none / error; "Error message" | `error` | `string` message, omitted = none | |
| Description | true / false | `onDescriptionChange` | pass it to show the description line | still a variant: the gap changes (4px with a description, 8px without) |
| Disabled | false | n/a | n/a | single-value axis; no disabled state |
| Title (text) | "Title of the Course/Card" | `title` | `string` | bound on Filled variants |
| Title placeholder (text) | "Add Title" | `titlePlaceholder` | `string` (default "Add Title") | bound on Enabled and Active variants |
| Description (text) | "Description of the course" | `description` | `string` | bound on Filled variants |
| Description placeholder (text) | "Add a description" | `descriptionPlaceholder` | `string` (default "Add a description") | bound on Enabled and Active variants |

- **Figma only:** the `Disabled` axis (only `false` exists).
- **Code only:** `onTitleChange`, `titleAriaLabel`, `onTitleBlur`, `titleRef`, `titleId` (for a dialog that takes its name from the title via `aria-labelledby`), `descriptionAriaLabel`, `className`.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| InputInline (Inline) | _to be mapped by engineering_ | | |

### Anatomy

| Element | Size L | Size M | Placeholder | Filled |
|---|---|---|---|---|
| Title | H1 Bold 32 / 1.5 | H3 Bold 20 / 1.5 | `--text-disabled` ("Add Title") | `--text-primary` |
| Description (optional) | Paragraph L Regular 16 / 1.5 | Paragraph M Regular 14 / 1.5 | `--text-disabled` ("Add a description") | `--text-secondary` |
| Error message | Paragraph M Regular 14 | Paragraph M Regular 14 | - | `--text-error` |

- Column gap `var(--space-xs)` (4px); reference width 900px.
- The description wraps and grows with its text; it never scrolls.

### Sizes

L for page headlines (course, program); M inside modals and drawers (automation details). See the Anatomy table for type per size.

### States

- **Enabled** (placeholders), **Active** (blinking `--text-primary` caret, nothing else), **Filled**.
- **Error (Filled):** the title turns `--text-error` and the message renders **between the title and the description**. The description keeps its normal colour. There is no error icon.
- No hover treatment and no focus ring: the editor reads as text until clicked, and the caret is the focus indicator.

### Accessibility

- There is no visible label: pass `titleAriaLabel` and `descriptionAriaLabel`.
- The caret is the focus indicator; there is no focus ring by design.

### Examples

```tsx
import InputInline from '@/components/InputInline/InputInline'

<InputInline
  size="L"
  title={draft.title}
  onTitleChange={(title) => set({ title })}
  onTitleBlur={() => setTitleBlurred(true)}
  titleAriaLabel="Course title"
  error={titleError ? 'Your course needs a title' : undefined}
  description={draft.description}
  onDescriptionChange={(description) => set({ description })}
  descriptionAriaLabel="Course description"
/>
```

---

## Radio (not built)

A bordered field row with a **21px radio button inside** - the user both selects the option and can type into it (e.g. quiz answer options, "other" choices). Shares the Outlined field chrome. There is no shared React component yet.

### Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| State | Enabled / Hover / Active / Filled / n/a | n/a | not built | |
| Selected | false / true | n/a | not built | radio behaviour per `selection-controls.md` |
| Validation | none / success | n/a | not built | no error state in Figma |
| Disabled | false / true | n/a | not built | |
| Show label (boolean) + Label (text) | true / false; "Label" | n/a | not built | |
| Placeholder (text) | "Input text" | n/a | not built | bound on Enabled and Hover variants |
| Value (text) | "Text" | n/a | not built | bound on Active, Filled and n/a variants |

- **Figma only:** the whole set; no code exists.
- **Code only:** none.

### Anatomy

- Layout: `[radio 21px] [text]`, gap **8px**, padding `8px 12px`, radius 12px, optional label above (Semibold 600 14 `--text-secondary`, gap 8).
- Text: placeholder `--text-disabled`, value `--text-primary` (Regular 14).

### States

| State | Border | Radio | Notes |
|---|---|---|---|
| Enabled | `--border-elevated` | unselected | |
| Hover | `--border-hover` | unselected | + `--input-background` fill |
| Active (typing) | `--selected` | unselected | blinking caret |
| Selected + Filled | `--border-elevated` | **on** (amber dot) | selecting does not keep the amber border |
| Success validation | `--border-elevated` | on | trailing 20px bold tick-circle |
| Disabled | `--border` | per state | all text `--text-disabled` |

### Accessibility

Radio behaviour (halo, amber dot, grouping) follows `selection-controls.md`.

---

## Related

- [search.md](search.md) - filter and find fields
- [dropdown.md](dropdown.md) - pick from a fixed list
- [date-picker-field.md](date-picker-field.md) - date entry
- [selection-controls.md](selection-controls.md) - radio, checkbox, toggle
- [colors.md](colors.md) - token values per mode
