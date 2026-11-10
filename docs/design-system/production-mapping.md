---
name: 5mins-production-mapping
description: Draft mapping from 5Mins Figma Library components and their properties to production `@web/ui` components and props. Engineering fills in the production columns. Use when building production UI from a Figma design, when filling in a doc's Production table, or when preparing Figma Code Connect.
---

# Figma to production mapping (draft)

**Status:** draft, 2026-11-10. Design columns are filled from the DS docs; **production columns are for engineering to fill in.**
**Figma:** Library `EC26cSVe9KNTCWXvYovakw` (one component set per component; light and dark come from variable modes)
**Production:** `@web/ui` (MUI underneath). Map to the `@web/ui` component, never to raw MUI.

## Why this exists

Figma Code Connect (which shows production code for each Library component in Dev Mode and to AI coding tools) needs a Figma Organization plan; we are on Professional. This table does the same job in plain text:

1. **Claude Code in production:** reference this file from the production repo's CLAUDE.md. When an engineer builds from a Figma link, Claude reads the design through the Figma MCP and uses this table to pick the real `@web/ui` component and props.
2. **Drift backlog:** every row marked **Drift** is a place where design and production disagree. Each needs a decision: change the design, change the code, or accept it.
3. **Code Connect:** the plan is to map components through Figma Code Connect. Each finished table becomes one Code Connect file with no extra discovery.

## How to fill it in

For each row, engineering adds:

- **`@web/ui` prop / value:** the production prop and value that produce the Figma value. Write `CSS` if it is a state handled by styling (hover, focus), `n/a` if it does not exist.
- **Status:** `OK` (one-to-one), `Renamed` (same thing, different name or values), `Drift` (behaves or looks different), or `Missing` (production has no equivalent).
- **Notes:** anything the next person needs, e.g. "Figma default is Large, `@web/ui` default is medium".

The **Prototype** column shows how the prototype (`src/components/`) maps the same property, as a reference. Production does not have to match it.

## Components (first batch)

### Button

Figma `10825:3269` · Prototype `Button` · Doc [buttons.md](buttons.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Variant | Filled / Outlined / Outlined-2 / Text / Link | `variant` `filled` / `outlined` / `outlined-2` / `text` / `link` | | | |
| Semantic | Primary / Danger / Warning / Success / AI | `semantic` `primary` / `danger` / `warning` / `success` / `ai` | | | AI only with Filled and Outlined |
| Size | Large / Medium / Small | `size` `lg` / `md` / `sm` | | | Figma default Large |
| State | Enabled / Hover / Pressed / Focus | CSS | | | Focus: 2px ring, 2px offset |
| State | Loading | `loading` | | | |
| Disabled | false / true | `disabled` | | | |
| Icon + glyph | true / false, any Iconsax icon | `icon` (Iconsax node) | | | leading icon |
| Label | text | `children` | | | Title Case |

### Input (Outlined)

Figma `8974:24610` · Prototype `InputField` · Doc [input.md](input.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| State | Enabled / Active / Filled | CSS `:focus`; Filled = `value` set | | | |
| Hovering | false / true | CSS `:hover` | | | |
| Disabled | false / true | `disabled` | | | |
| Validation | none / error / success | `validation` `none` / `error` / `success` | | | |
| Show label + Label | true / false, text | `label` | | | |
| Show helper text + Helper text | true / false, text | `helperText` | | | |
| Error message | text | `helperText` + `validation="error"` | | | |
| Icon right + glyph | true / false, Iconsax icon | `iconRight` | | | |
| Placeholder | text | `placeholder` | | | |
| Value | text | `value` | | | |

### Dropdown

Figma `8925:1408` · Prototype `Dropdown` · Doc [dropdown.md](dropdown.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| State | Enabled / Hover / Active / Read-only / Error | CSS; `readOnly`; `error` | | | |
| Disabled | false / true | `readOnly` | | | |
| Icon left + glyph | true / false, Iconsax icon | `iconLeft` | | | |
| Label top / Label start | booleans | `label` + `labelPlacement` `top` / `start` | | | two Figma booleans, one prop |
| Helper text | false / true, text | `helperText` | | | |
| Value | text | selected option label or `placeholder` | | | |
| Error message | text | `error` | | | |
| (menu) | Listbox `9162:1042` | built in | | | single and multi-select |

### Checkbox, Radio, Toggle

Figma Checkbox `6339:10484`, Radio `5001:18926`, Toggle `8160:364` · Prototype `Checkbox`, `Radio`, `Toggle` · Doc [selection-controls.md](selection-controls.md) · **`@web/ui` components:** _____

| Component | Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|---|
| Checkbox | Checked | Not checked / Checked / Indeterminate | `checked`, `indeterminate` | | | |
| Checkbox | State | Enabled / Hover / Focus | CSS | | | |
| Checkbox | Disabled | false / true | `disabled` | | | |
| Radio | Selected | true / false | `checked` | | | |
| Radio | State | Enabled / Hover / Focus | CSS | | | |
| Radio | Disabled | false / true | `disabled` | | | |
| Toggle | Toggle | true / false | `checked` | | | |
| Toggle | Size | two sizes | `size` `md` / `sm` | | | |
| Toggle | Live (automations) | Success-500 track | `live` | | | amber for settings, green for live automations |

### Chip

Figma `5162:28510` · Prototype `Chip` · Doc [chips-switcher-tabs.md](chips-switcher-tabs.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Selected | false / true | `selected` | | | |
| Disabled | false / true | `disabled` | | | |
| State | Enabled / Hover / Focus | CSS | | | |
| Icon left + glyph | false / true, 16px icon | `iconLeft` / `customIconLeft` | | | |
| Icon right | false / true | `iconRight` + `onDismiss` | | | removable chip |
| Label | text | `label` | | | |

### Tabs

Figma `8497:24855`, item `1939:18281` · Prototype `Tabs` · Doc [chips-switcher-tabs.md](chips-switcher-tabs.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Selected | true / false | `activeKey` | | | amber underline |
| State | Enabled / Hover / Focus | CSS | | | |
| counter | false / true | `items[].counter` | | | |
| Label | text | `items[].label` | | | |
| Count | number | `counter` | | | |

### Badge

Figma `5799:479` · Prototype `Badge` · Doc [badges.md](badges.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Type | Success / Warning / Error / In progress / Informative / New | `type` | | | |
| Icon left | true / false | `icon` | | | |
| Icon right | true / false | `onDismiss` present | | | dismissible |
| State | Enabled / Hover / Focus | CSS | | | dismissible only |
| Label | per-type default | `label` | | | |

### Avatar

Figma `5097:5884`, group `5097:5584` · Prototype `Avatar`, `AvatarGroup` · Doc [avatars.md](avatars.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Size | 24 / 32 / 40 / 48 / 56 / 64 / 72px | `size` | | | |
| Picture | true / false | `src` set / omitted | | | |
| Initials | text, e.g. "BM" | `name` (derived) or `initials` | | | no-photo fallback, changed 2026-11-10 |
| (shape) | not in Library yet | `shape` `circle` / `square` | | | square for companies and instructors |
| Group: Size | 24 / 32 / 40px | `AvatarGroup` `size` | | | |
| Group: Count | "+N" | `remaining` | | | max 3 avatars shown |

### Table

Figma table `7896:2624`, rows `7896:2804`, header `11872:3077`, cells `11766:619` · Prototype `Table` · Doc [table.md](table.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Header | header row | `columns[].header` | | | |
| Rows | row slots | `rows` + `columns[].render` | | | |
| Row State | Enabled / Hover | `getRowState`, CSS `:hover` | | | |
| Row Selected | false / true | `isSelected` | | | `--selected-row` fill |
| Row Disabled | false / true | `getRowState` `disabled` | | | |
| Header checkbox | off / on | `selectable` | | | select all |
| Header sort icon | off / on | `columns[].sortable` + `onSort` | | | 16px ArrowDown |
| Cell types | Text / Supporting text / date / Avatar / Thumbnail / Progress bar / Badge / Button / Dropdown | `columns[].render` | | | dates use two-line `.tbl-date` |
| Pagination | footer | `pagination` | | | |

### Search

Figma `697:33529` · Prototype `Search` · Doc [search.md](search.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Size | M / L | `size` | | | |
| State | Enabled / Hover / Active | CSS | | | |
| Filled | false / true | `value` non-empty | | | shows clear button |
| Placeholder | text | `placeholder` | | | |
| (surface) | on a card or menu | `elevated` | | | border steps up to `--border-elevated` |

### Alert and Callout

Figma `3658:32304` · Prototype `Alert` · Doc [alerts-toast.md](alerts-toast.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Type | Callout / Alert | `type` | | | |
| Icon + glyph | false / true | `icon`, `customIcon` | | | |
| Illustration | false / true | `illustration` | | | |
| Button | false / true | `button`, `buttonLabel`, `onButtonClick` | | | |
| Title | text | `title` | | | |
| Message / Body | text | `message` / `bullets` | | | |

### Toast

Figma `5045:14119` · Prototype `useToast().show` · Doc [alerts-toast.md](alerts-toast.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Type | Success / Warning / Error / Info | `show(type, …)` | | | |
| Show icon | true / false | `ToastContainer` `icon` | | | |
| Message | text | `show(…, message)` | | | one short line |

### Tooltip

Figma `2683:29027` · Prototype `Tooltip` · Doc [alerts-toast.md](alerts-toast.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Position | Top / Bottom / Left / Right | `position` | | | |
| Alignment | Center / Start / End | `alignment` | | | |
| Icon | true / false | `icon` | | | info-icon trigger |
| Text | text | `text` | | | every icon-only button has one |

### Dialog and Modal

Figma Dialog `7789:24651`, Modal `7479:4350` · Prototype `ConfirmModal` · Doc [confirm-modal.md](confirm-modal.md), [overlays.md](overlays.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Component | Dialog / Modal | `closable` `false` / `true` | | | Dialog: no X, no Escape or backdrop close |
| Dialog Type | Error / Warning / Info / Success | composed (icon + Button `semantic`) | | | |
| Dialog Icon | true / false | composed | | | |
| Dialog Secondary text | true / false | composed | | | |
| Content | slot | `children` | | | |

### Side Drawer

Figma `10871:12768` · Prototype `SideDrawer` · Doc [overlays.md](overlays.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Width | 720px | fixed | | | always 720px |
| Close | X, backdrop, footer buttons | `onClose` (X, backdrop; never Escape) | | | never closes on Escape |
| Form | slot | `children`, `header`, `subheader`, `footer` | | | |

### Empty state

Figma `5452:37234` (mobile `5452:37381`) · Prototype `EmptyState` · Doc [empty-state.md](empty-state.md) · **`@web/ui` component:** _____

| Figma property | Figma values | Prototype | `@web/ui` prop / value | Status | Notes |
|---|---|---|---|---|---|
| Device | Desktop / Mobile | `device` | | | |
| Surface | Plain / Dropzone | `surface` | | | |
| Title | text | `title` | | | |
| Description | text | `description` | | | |
| (illustration) | 72px Library illustration | `illustration` | | | no border or fill |

## Questions for engineering

1. Which of these has **no `@web/ui` component** today, and is built per page instead?
2. Does `@web/ui` read the same colour, spacing and type tokens as the Library, or its own MUI theme values?
3. Where `@web/ui` uses MUI names (e.g. a `variant` called `contained`), do we keep MUI's names and record the translation here, or rename to match Figma?
4. Who owns keeping this file current when a component changes?

## Next batch

Once these are mapped: Content switcher, Filter bar, File uploader, Date picker field, Stepper, Header, Top nav and Side navigation, Listbox and row actions menu, Pagination.
