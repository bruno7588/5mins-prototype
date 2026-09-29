---
name: 5mins-alerts-toast
description: Alert, Callout, and Toast components for 5Mins.ai. Alert/Callout are inline banners (warning strips, informational callouts, contextual guidance, CTA banners); Toast is the floating auto-dismissing feedback pill (Success/Warning/Error/Info) shown after an action. Trigger this skill whenever building any alert, callout, warning strip, info banner, notification box, toast, or snackbar in the 5Mins.ai admin or learner UI.
---

# 5Mins.ai Alert, Callout & Toast

Three message components:

- **Callout** — inline, informational, neutral surface, used for guidance, tips, and contextual help
- **Alert** — inline, warning state, yellow-tinted surface, used for system warnings and attention-required messages
- **Toast** — floating, solid-color feedback pill that confirms an action and auto-dismisses (see the Toast section at the end)

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — Alert/Callout light `node 11914:638`, dark `node 3658:32304`; Toast `node 5045:14119` (verified 2026-07-03). Alert/Callout share identical structure across modes; every color is a semantic token that resolves per mode (see `colors.md`). All Alert/Callout variants use `12px 16px` padding, rising to `16px` all round when a title/bullets body is present.

> **Updated 2026-09-29 (aligned to prototype usage):** padding, Alert type size and background, prop defaults, the Callout button style and the dark tooltip background now match `src/components/Alert`, `src/components/Tooltip` and `tokens.css`. The Callout button is always outlined; the underlined text button is Alert-only.

> **Updated 2026-09-29 (verified against code):** Alert title is 14px Bold and its button 16px; the stale Alert sample and CSS block are replaced by a short example of the real API; variant tables, Alert tint (16%), tooltip offset (2px), tooltip behaviour (no hover-out delay, no `aria-describedby`), the `ToastContainer` rule and the tooltip token note now match code; Toast and Tooltip shadows are `var(--shadow-l)`; ConfirmModal links point to `confirm-modal.md`.

---

## Usage

### Callout

**Intent:** persistent, neutral guidance inside the flow of a page, drawer or modal. It tells the admin what will happen or how something works before they act.

**Use when**
- Explaining the consequences of an action inside its modal, e.g. a "What happens:" title with bullets
- Saying why nothing can be done, or what will be skipped
- Giving guidance at the top of a create or configure drawer

**Don't use when**
- Something is at risk or needs attention → Alert type (this doc)
- Confirming an action that just happened → Toast (this doc)
- Adding nonessential context to one control → Tooltip (this doc)
- The admin must make a blocking decision → ConfirmModal ([doc](confirm-modal.md))

**Do**
- Use `<Alert type="Callout">`; for behaviour it lacks (e.g. a collapse chevron), compose from Alert's own `.alert` classes rather than copying its styling
- Use `title` + `bullets` for a list of consequences
- Use `icon` for the platform `InfoIcon`, or `customIcon` for an illustration; one or the other, never both
- Keep the button label short and in Title Case

**Don't**
- Don't hand-roll a grey guidance box with its own colours; the Callout is `--text-secondary` on `--input-background`
- Don't use `supportingText`; it is not a prop in code

**Canonical spec:** background `var(--input-background)`; radius `var(--radius-sm)` (12px); padding `var(--space-sm) var(--space-m)` (12px 16px), `var(--space-m)` (16px) with a body; gap `var(--space-s)` (8px); text 14px Regular `var(--text-secondary)`, title 14px Medium; icon 20px. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11914:638` / dark `3658:32304`.

**Prototype:** `src/components/Alert/Alert.tsx`
- `type="Callout"` (default)
- `message` for one line; `title` + `bullets` or `title` + `message` for a body
- `icon` (InfoIcon 20px) or `customIcon` (any 20px node)
- `button` + `buttonLabel` + `onButtonClick` (outlined button)
- `onClose` adds a dismiss ×

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Callout | _to be mapped by engineering_ | | |

### Alert

**Intent:** persistent inline warning that something needs attention, or that an action will affect other people.

**Use when**
- Warning before an edit that changes things for others (e.g. learners who hold a role)
- Flagging a data problem the admin should fix, with a button that takes them to the fix
- Stating what an action will skip or cannot do

**Don't use when**
- The message is neutral guidance → Callout (this doc)
- Confirming an action → Toast (this doc)
- The admin must decide before continuing → ConfirmModal ([doc](confirm-modal.md))

**Do**
- Use `<Alert type="Alert">`
- Pass the warning triangle as `customIcon` (Iconsax `Danger`, `variant="Bold"`, `color="currentColor"`); the `icon` prop gives the InfoIcon instead
- Use `title` + `message` when the warning needs a headline and an explanation
- Use `button` for the fix; it renders the underlined text button, label in Title Case

**Don't**
- Don't pass `bullets`; the Alert type ignores them
- Don't hardcode the warning colour; use `var(--text-warning)`

**Canonical spec:** background Warning-500 at 16% (literal `rgba(255, 165, 56, 0.16)` in `Alert.css`, no token yet); radius `var(--radius-sm)` (12px); padding `var(--space-sm) var(--space-m)` (12px 16px); gap `var(--space-sm)` (12px); text 16px Regular `var(--text-warning)`, title 14px Bold; icon 24px. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11914:638` / dark `3658:32304`.

**Prototype:** `src/components/Alert/Alert.tsx`
- `type="Alert"`
- `customIcon` for the triangle or bell; `illustration` for the emoji bell
- `message`, or `title` + `message`
- `button` + `buttonLabel` + `onButtonClick` (underlined inline button)

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Alert | _to be mapped by engineering_ | | |

### Toast

**Intent:** floating, auto-dismissing feedback that an action succeeded or failed, with an optional one-step undo.

**Use when**
- Confirming a save, add, remove or publish (most call sites are `success`)
- Offering Undo after a delete, instead of a confirmation dialog in front of every delete
- Reporting a failed save or a follow-up warning after an action
- Confirming a draft save, which does not earn the course-created modal

**Don't use when**
- The message must stay on screen or be read before acting → Alert or Callout (this doc)
- The admin must decide → ConfirmModal ([doc](confirm-modal.md))
- Celebrating a newly created course → the success modal on Your Courses
- Explaining a control on hover → Tooltip (this doc)

**Do**
- Call `useToast()` in the component that triggers the toast and render its `<ToastContainer toasts={toasts} />` there; trigger with `show(type, message)`. Several components on one page can each own a container (Course details composes five), and they all stack at the bottom centre
- Pick the type by outcome: `success`, `error`, `warning`, `info`
- For Undo, pass `show(type, message, { label: 'Undo', onClick })` and give the container `onDismiss={dismiss}` so taking the action removes the pill
- Keep the message to one short line; the pill never wraps

**Don't**
- Don't add more than one action, or any other button, to a toast
- Don't shorten the 5s auto-dismiss; long messages need the reading time
- Don't hand-roll a toast or recolour the fills

**Canonical spec:** padding `var(--space-sm) var(--space-m)` (12px 16px); radius `var(--radius-sm)` (12px); gap `var(--space-s)` (8px); label 16px Bold `var(--neutral-25)` on every fill; icon 24px; fills `var(--success-500)`, `var(--danger-500)`, `var(--warning-600)`, `var(--neutral-600)` (info); stacked bottom centre, `var(--space-l)` (24px) from the bottom, above drawers; 5s including a 300ms fade. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `5045:14119` (single node, no light/dark pair).

**Prototype:** `src/components/Toast/Toast.tsx`
- `useToast()` returns `{ toasts, show, dismiss }`
- `show(type: 'success' | 'error' | 'warning' | 'info', message, action?)`
- `<ToastContainer toasts icon? onDismiss? />` (`icon` defaults to true)
- `role="alert"` for warning and error, `role="status"` otherwise

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Toast | _to be mapped by engineering_ | | |

### Tooltip

**Intent:** a short, nonessential label or explanation shown on hover or focus of a trigger.

**Use when**
- Naming an icon-only button
- Explaining why a button is disabled, naming the field that is actually missing
- Explaining a metric, column header or toggle through the info-icon anchor

**Don't use when**
- The content is needed to complete the task → inline text or Callout (this doc)
- The content needs links or buttons → a menu or listbox ([doc](listbox.md))
- Confirming an action → Toast (this doc)

**Do**
- Use the shared `Tooltip`: the default `icon` renders the info-icon anchor; pass `icon={false}` and wrap your own trigger as `children`
- Wrap a disabled button rather than rendering the tooltip conditionally; the hover handlers sit on Tooltip's own wrapper, so it still fires over the disabled button
- Keep the wrapper mounted and silence it with `disabled`, rather than swapping it in and out
- Hide it while a menu it would overlap is open
- Default to `position="Top"`; choose another side only when Top would clip
- Make the text specific to the current state

**Don't**
- Don't hand-roll tooltip bubbles; use `Tooltip`, not a native `title=` attribute
- Don't put bold text, links or buttons inside
- Don't hardcode the background; use `var(--tooltip-background)`

**Canonical spec:** background `var(--tooltip-background)` (#20222A light / #0F1014 dark); text 14px Regular `var(--neutral-25)`; padding `var(--space-s) var(--space-sm)` (8px 12px); radius `var(--radius-sm)` (12px); max width 288px; caret 12×6px; anchor icon 20px (16px in dense rows). Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11927:8087` / dark `2683:29027`.

**Prototype:** `src/components/Tooltip/Tooltip.tsx`
- `text` (string or node)
- `position`: `Top` (default) | `Bottom` | `Left` | `Right`; `alignment`: `Center` (default) | `Start` | `End`
- `icon` (default true), `iconSize`, `iconColor`
- `disabled` silences it without unmounting; `children` is the trigger when `icon={false}`
- Portals the bubble to `<body>` so overflow never clips it

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Tooltip | _to be mapped by engineering_ | | |

---

## Component Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"Callout" \| "Alert"` | `"Callout"` | Visual style and semantic intent |
| `illustration` | `boolean` | `false` | In code, Alert only: a bell before the text. For a Callout illustration, pass it as `customIcon` |
| `icon` | `boolean` | `false` | The platform `InfoIcon` (20px on Callout, 24px on Alert). For the Alert warning triangle, pass Iconsax `Danger` Bold as `customIcon`. Use icon *or* illustration, not both |
| `supportingText` | - | - | Not a prop in code: passing `title` + `bullets` (Callout) or `title` + `message` (either type) renders the body |
| `button` | `boolean` | `false` | Show a CTA button |

---

## Type: Callout

### Visual Spec

```
Background:    var(--input-background)          /* translucent, per mode */
Border-radius: 12px   (--radius-sm)
Padding:       12px 16px  (--space-sm --space-m); 16px (--space-m) with a body
Gap:           8px    (--space-s)
Text:          Poppins 14px / 1.5, Regular, var(--text-secondary)
Alignment:     center (single line)  →  flex-start (with a body)
```

### Anatomy (left → right)

```
[ icon? ] [ text / body ] [ outlined button? ] [ close? ]
```

- **icon**: 20×20px, `shrink-0`; `icon` renders the platform `InfoIcon`, `customIcon` renders any node (use it for an illustration)
- **text area**: `flex: 1; min-width: 0`, contains either:
  - Simple: single `<p>` 14px Regular `--text-secondary`
  - Body: title `<p>` 14px **Medium** + `<ul>` 14px Regular bullets (21px indent, 4px apart) or a message `<p>`; column gap 8px (2px between title and message)
- **button**: always outlined; at the row end with no body, or inside the body 8px below the text

### Callout button

```css
border: 1px solid var(--text-primary);
border-radius: 12px;             /* --radius-sm */
padding: 8px 16px;               /* --space-s --space-m */
color: var(--text-primary);
font: 700 14px/1.5 Poppins;      /* no underline */
background: transparent;
/* hover: background var(--page-background-hover) */
```

---

## Type: Alert

### Visual Spec

```
Background:    rgba(255, 165, 56, 0.16)   /* Warning-500 @ 16%, same in both modes */
Border-radius: 12px   (--radius-sm)
Padding:       12px 16px  (--space-sm --space-m); 16px with title + message
Gap:           12px icon → text; 24px between info area and button
Text:          Poppins 16px / 1.5, Regular (400), var(--text-warning);
               with title + message: title 14px Bold, message 14px Regular
```

### Anatomy (left → right)

```
[ icon? / bell? ] [ message, or title + message ] [ underline button? ] [ close? ]
```

- **bell**: `illustration` renders a 🔔 emoji in a 21×21px box, `shrink-0`; hidden when `icon` is set
- **icon**: warning triangle, Iconsax `Danger` **Bold**, 24px, passed as `customIcon`; the `icon` prop renders the 24px `InfoIcon` instead
- **text**: `message` alone renders one 16px Regular line in `--text-warning`; `title` + `message` renders a 14px **Bold** title over a 14px Regular message. A `title` without `message` renders nothing
- **button**: underlined text button, right of the text

### Alert button

```css
color: var(--text-warning);
font: 700 16px/1.5 Poppins;
text-decoration: underline;
text-decoration-skip-ink: none;
background: transparent;
border: none;
padding: 0;
margin-left: 12px;   /* + the row's 12px gap = 24px */
```

---

## React usage

> Superseded, see Usage: the older hand-written component and CSS that lived here predated `src/components/Alert` (they used a `supportingText` prop, an `.alert__description` wrapper and an underlined Callout button, none of which exist). `Alert.tsx` and `Alert.css` are the reference.

```tsx
import { Danger } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'

// Callout: one line with the info icon
<Alert icon message="Learners see this change the next time they open the course." />

// Callout with a body and an outlined button below it
<Alert
  icon
  title="What happens:"
  bullets={['Learners keep their progress', 'Reminders stop for this course']}
  button
  buttonLabel="View Course"
  onButtonClick={openCourse}
/>

// Alert: warning triangle, headline + explanation, underlined fix button
<Alert
  type="Alert"
  customIcon={<Danger size={24} variant="Bold" color="currentColor" />}
  title="3 roles have no courses"
  message="Learners in these roles won't be assigned anything."
  button
  buttonLabel="Assign Courses"
  onButtonClick={openRoles}
/>
```

Key values from `Alert.css`:
- Body column (`.alert__body`) gap `var(--space-s)` (8px), tightened to `var(--space-xxs)` (2px) between a title and message; bullets sit `var(--space-xs)` (4px) apart with a 21px indent
- The Callout's outlined button sits inside the body, 8px below the text; with no body it sits at the row end
- The Alert's underlined button (16px Bold) adds a 12px left margin to the row's 12px gap, so it is 24px from the text
- `onClose` adds a 24px circular dismiss button at the row end

---

## Variants at a Glance

### Callout variants

All variants share the same `12px 16px` padding (`16px` with a body).

| Leading | Body (`title` + `bullets`/`message`) | button | Layout notes |
|---|---|---|---|
| none | ✗ | ✗ | Text only |
| `customIcon` (illustration) | ✗ | ✗ | Illustration + text |
| `icon` | ✗ | ✗ | Info icon + text |
| any | ✗ | ✓ | + **outlined** button at row end |
| any | ✓ | ✗ | Title + bullets or message, align top |
| any | ✓ | ✓ | … + **outlined** button below (8px gap) |

### Alert variants

| Prop | Leading element |
|---|---|
| none | none, `message` only |
| `illustration` | bell emoji (21px box) |
| `icon` | platform `InfoIcon` (24px) |
| `customIcon` | any node; pass Iconsax `Danger` Bold (24px) for the warning triangle |

The text is always `message`, or `title` + `message`; a `title` on its own renders nothing. Each can carry the underlined button on the right (24px gap).

---

## Token Summary

| Token | Light mode | Dark mode | Used for |
|---|---|---|---|
| `--input-background` | `#BFC2CC` @ 16% | `#454C5E` @ 16% | Callout background |
| `rgba(255,165,56,0.16)` | same | same | Alert background (Warning-500 @ 16%, literal) |
| `--text-secondary` | Neutral-500 `#454C5E` | Neutral-200 `#BFC2CC` | Callout text |
| `--text-warning` | Warning-600 `#E88206` | Warning-500 `#FFA538` | Alert text + button |
| `--text-primary` | Neutral-800 `#20222A` | Neutral-25 `#F9F9FA` | Callout button border + label |
| `--radius-sm` | 12px | - | Container and outlined button radius |
| `--space-sm` / `--space-m` | 12px / 16px | - | Container padding (vertical / horizontal); `--space-m` all round with a body |
| `--space-s` / `--space-l` | 8px / 24px | - | Callout body↔button gap / Alert info↔button gap (12px gap + 12px margin) |

---

## Do / Don't

✓ Use **Callout** for tips, guidance, onboarding hints, feature announcements  
✓ Use **Alert** for system warnings, expiring content, required actions  
✓ Keep button labels short (1–2 words, Title Case)  
✓ Use `title` + `bullets` only when the message genuinely needs a title + list structure  

✗ Don't use both `illustration` and `icon` together in Callout — pick one  
✗ Don't pass `bullets` to the Alert type; the component ignores them; use `title` + `message`  
✗ Don't mix the button styles: Callout buttons are always outlined; the underlined text button is Alert-only  
✗ Don't hardcode warning text color — use `--text-warning` (resolves per mode)  

---

## Code Extensions (src/components/Alert)

The built component adds practical props beyond the Figma spec — keep them: `customIcon` (ReactNode leading icon), `onClose` (renders a 24px close ✕ at row end), and `title`+`message` body (title + paragraph instead of bullets, 2px gap).

---

# Toast

A floating feedback pill that appears after an action (save, delete, error) and auto-dismisses. Unlike Alert/Callout it is not inline: it overlays the page, hugs its content, and uses solid semantic fills with a near-white Bold label in **both modes**.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — `node 5045:14119`.

## Visual Spec

```
Padding:   12px 16px   (--space-sm --space-m)
Radius:    12px        (--radius-sm)
Gap:       8px         (icon ↔ label)
Shadow:    Shadow L, var(--shadow-l)
Label:     Poppins Bold 16 (H4), var(--neutral-25) — near-white on every fill
Icon:      optional, 24px, same near-white
Width:     hugs content (no fixed width)
```

## Types

| Type | Background | Icon (24px) |
|---|---|---|
| **Info** | `--border` (`#2D313D` dark) — a dark neutral pill | io5 `IoInformationCircleOutline` |
| **Success** | `--success-500` `#18A957` | Iconsax `TickCircle` |
| **Warning** | `--warning-600` `#E88206` | warning triangle (Iconsax `Danger`) |
| **Error** | `--danger-500` `#DF1642` | warning triangle (Iconsax `Danger`) |

> **Library gap:** the Toast has a single Figma node (no light/dark pair) and the Info fill is bound to the `Border` variable, whose *light* value (`#DFE1E6`) would make the near-white label illegible. Treat the Info pill as a fixed dark neutral (`--neutral-600` `#383D4C`) in both modes until the library adds a light node.

## CSS

```css
.toast {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-s);                    /* 8px */
  padding: var(--space-sm) var(--space-m); /* 12px 16px */
  border-radius: var(--radius-sm);        /* 12px */
  box-shadow: var(--shadow-l);
  font: 700 16px/1.5 'Poppins', sans-serif;
  color: var(--neutral-25);
  width: fit-content;
}

.toast--info    { background: var(--neutral-600); }  /* see library-gap note */
.toast--success { background: var(--success-500); }
.toast--warning { background: var(--warning-600); }
.toast--error   { background: var(--danger-500); }
```

## Behaviour

- Appears on action feedback, stacked bottom-center (or per app convention), auto-dismisses after ~5s with a fade. Budget roughly 1s to notice the pill plus ~300ms per word (200wpm) — raise the duration rather than let a long message time out before it can be read.
- `role="status"` (Info/Success) or `role="alert"` (Warning/Error) so screen readers announce it.
- One line, no wrapping — keep messages short ("Saved", "Course published"). No buttons apart from the single optional action (Undo) described under Code reality; if the user must act, use a Dialog or Alert instead.

## Alert vs Callout vs Toast

| | Callout | Alert | Toast |
|---|---|---|---|
| Placement | inline with content | inline with content | floating overlay |
| Purpose | guidance / tips | warnings needing attention | action feedback |
| Persistence | persistent | persistent | auto-dismisses |
| Fill | translucent neutral | Warning-500 @ 16% tint | solid semantic color |
| Type scale | Regular/Medium 14 | Regular 16 (title Bold 14) | **Bold 16** |

## Code reality (src/components/Toast)

`src/components/Toast/Toast.tsx` implements the pill with a `useToast()` stack hook (5s auto-dismiss + 300ms fade) and matches the spec above: near-white `--neutral-25` label on every fill, Warning on `--warning-600`, Info on `--neutral-600`, the warning triangle for both Warning and Error, and `role="alert"` / `role="status"`. Two deliberate extensions:

- **Info icon** is Iconsax `InfoCircle` (Figma: io5 `IoInformationCircleOutline`) — Iconsax is the project's only icon set.
- **Optional action** (`show(type, message, { label, onClick })`, rendered as an underlined inline button) — used for Undo in the course content list. Not in the Figma node; the "no buttons" rule still holds for everything else.

---

# Tooltip

A small dark floating label that appears on hover, focus, or click of a trigger. The information must be contextual, useful, and **nonessential** — never put required content in a tooltip.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — light `11927:8087` / dark `2683:29027`.

## Props

| Prop | Values | Default | Description |
|---|---|---|---|
| `position` | `Top \| Bottom \| Right \| Left` | `Top` | Which side of the trigger the tooltip appears on (caret points back at the trigger) |
| `alignment` | `Center \| Start \| End` | `Center` | Caret placement along the edge — Start/End apply to Top/Bottom only; Left/Right are always Center |
| `icon` | `boolean` | `true` | Renders the platform `InfoIcon` (20px, `iconSize` 16 for dense rows) as the anchor (info-icon-with-tooltip pattern), 2px gap to the body. Pass `icon={false}` to wrap your own trigger as `children` |

## Visual Spec

```
Background:  var(--tooltip-background)   /* #20222A (Neutral-800) light, #0F1014 (Neutral-900) dark */
Padding:     8px 12px   (--space-s --space-sm)
Radius:      12px       (--radius-sm)
Text:        Poppins Regular 14 / 1.5, var(--neutral-25)
Max width:   288px — wrap, don't overflow
Shadow:      Shadow L, var(--shadow-l)
Caret:       12×6px triangle pointing at the trigger;
             Start/End alignments inset it 16px from the body edge;
             rotated 90° for Left/Right positions
```

> Token rule: the tooltip background is always `var(--tooltip-background)` in the app. `tokens.css` resolves it to `#20222A` in light mode and `#0F1014` in dark mode. The token is the rule, never a hex.

## Behaviour

- Shows on `mouseenter` and focus; hides immediately on leave, blur or Esc (there is no hover-out delay).
- Choose `position` so the tooltip never clips a viewport edge; the component does not flip automatically.
- One short phrase or sentence, Regular weight only — no bold, no links, no buttons (interactive content belongs in a popover/listbox).
- The bubble has `role="tooltip"`. The component does not set `aria-describedby` on the trigger; the default info-icon trigger carries `aria-label="More information"`, and a custom trigger needs its own accessible name.

## Code reality (src/components/Tooltip)

`src/components/Tooltip/Tooltip.tsx` implements the full position/alignment matrix incl. the optional info-icon anchor and 288px max-width — use it, don't hand-roll. It matches this spec: the bubble and caret use `var(--tooltip-background)` with no hex fallback.

## Alert vs Callout vs Toast vs Tooltip

All four are informative components; pick by persistence and placement:

| | Callout | Alert | Toast | Tooltip |
|---|---|---|---|---|
| Placement | inline | inline | floating overlay | floating, anchored to a trigger |
| Trigger | always visible | always visible | after an action | hover / focus |
| Content | guidance, tips | warnings | action feedback | nonessential context |
| Dismissal | persistent | persistent | auto (~5s) | on leave/blur |

## Related Skills

- `5mins-colors` (colors.md) — surface, text, and palette tokens
- `layout.md` — spacing and radius tokens, Shadow L
- `buttons` — for full standalone button component (Alert uses inline patterns, not the button component)
- `confirm-modal.md`: ConfirmModal, for blocking feedback that needs user action
