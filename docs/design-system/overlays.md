---
name: 5mins-overlays
description: Dialog (Error/Warning/Info/Success types, 56px icons), Modal (720px, centered), Side Drawer (right-anchored) and the mobile Bottom Sheet for 5Mins.ai — shared scrim, close behavior, animations. Use for any overlay, confirmation, popup, panel, drawer or mobile bottom sheet.
---

# 5Mins.ai Overlay Component System

Complete implementation guide for the overlay components in the 5Mins.ai design system: **Dialog**, **Modal** and **Side Drawer** on desktop, and the **Bottom Sheet** in the mobile app. All of them share a common overlay backdrop but serve distinct interaction purposes.

> **Updated 2026-09-29 (verified against code):** Side Drawer prototype pointers now name the drawers that use `useOverlayA11y` + `CloseButton` (and where `.side-drawer__*` lives); the hand-rolled `.overlay-close` CSS is replaced by `<CloseButton />`; the Dialog React sample is now `ConfirmModal` + `Button`; Modal and Side Drawer samples use `CloseButton` and `Button`; Warning and Error filled labels are `--neutral-25`; buttons use `--radius-sm` (12px); `.dialog` max-width is 100%; shadows are `var(--shadow-l)`; the drawer backdrop is `var(--scrim)`; divider hex fallbacks removed; the Accessibility table reflects `ConfirmModal`'s `alertdialog` + `aria-label`.

> **Updated 2026-09-29 (Bottom Sheet added, Figma Library `7479:106`):** the mobile Bottom Sheet is a shared component, `BottomSheet`, with a `--scrim` overlay, a long decelerating rise and drag-to-dismiss.

> **Updated 2026-09-29 (aligned to prototype usage):** Dialogs carry a Close (×) button, and close on backdrop click and Escape, like Modals and Side Drawers.

> **Updated 2026-09-29 (aligned to prototype usage):** Dialog and Side Drawer Cancel buttons are **Outlined-2** (`<Button variant="outlined-2">`), not primary Outlined; the Dialog is **560px** wide (`ConfirmModal.css`), not 345px; the Accessibility table now matches the Dialog close behaviour above.

## Usage

### Dialog

**Intent:** stops the user for one decision, usually a confirmation of something consequential, before it happens.

**Use when**
- Confirming a destructive or hard-to-undo action (delete, deactivate, unenrol, remove a mapping).
- Confirming that the user will lose unsaved changes.
- Telling the user an action can't go ahead and offering the way forward.

**Don't use when**
- The user fills in more than one or two fields → use a Modal (below)
- The user edits a record or works through a long form → use a Side Drawer (below)
- The user needs feedback after an action completes → use a Toast ([doc](alerts-toast.md))

**Do**
- Build it on `ConfirmModal` ([doc](confirm-modal.md)); it portals to `<body>`, traps focus and closes on Escape and backdrop click.
- Put a `CloseButton` in the top-right corner.
- End with an Outlined-2 Cancel followed by the commit button, both Medium.
- Use `semantic="danger"` for destructive commits and `semantic="warning"` for discarding unsaved changes.
- Write the title as a short sentence-case statement of the action ("Delete report") and let the body name what is affected and the consequence.
- Label the commit button with the action and its object in Title Case ("Delete Report", "Mark 3 As Completed").

**Don't**
- Don't render a dialog inside a panel that sets its own `z-index`; it gets trapped under that stacking context. `ConfirmModal` portals for this reason.
- Don't use primary Outlined for Cancel.
- Don't hard-code the scrim colour; use `var(--scrim)`.

**Canonical spec:** width 560px (max 100%); padding `var(--space-l)` (24px); radius `var(--radius-sm)` (12px); gap `var(--space-ml)` (20px); surface `var(--page-background)`; scrim `var(--scrim)`; title 20px Bold `var(--text-primary)`; body 16px Regular `var(--text-secondary)`; type icon 56px (72px Iconsax in current call sites). Figma: Library `EC26cSVe9KNTCWXvYovakw`, light not recorded / dark not recorded.

**Prototype:** `src/components/ConfirmModal/ConfirmModal.tsx`
- `open`, `onClose` (Escape, backdrop, Cancel), `ariaLabel`, `className` for sizing; content is composed from `.confirm-modal-*` classes.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Dialog | _to be mapped by engineering_ | | |

### Modal

**Intent:** gives the user a focused, centred space for one short task with a moderate amount of content.

**Use when**
- A short form acts on one record or a selection (Extend due date, Edit start date, Give another attempt).
- Previewing content (the situational test preview).
- A full-screen editor or success screen replaces the page (lesson editors, Course created, Launch success).

**Don't use when**
- The user only confirms or cancels → use a Dialog (above)
- The content is long, scrolls, or edits a record's many fields → use a Side Drawer (below)

**Do**
- Build centred modals on the `ConfirmModal` shell and set the width through `className`.
- Head it with a title, supporting text and a divider (the Section Header pattern).
- Put a `CloseButton` in the top-right corner; close on Escape and backdrop click.
- Use `<CloseButton variant="fullscreen">` on full-screen modals.
- When you write your own overlay shell, call `useOverlayA11y(panelRef, open, { onEscape })` for focus trap, focus return and Escape.

**Don't**
- Don't hand-roll the full-screen close disc; use the `CloseButton` component.
- Don't hard-code the panel colour; use `var(--page-background)`.

**Canonical spec:** width 720px in the Figma spec (current prototype modals set their own width, e.g. 600px); padding `var(--space-l)` (24px); radius `var(--radius-sm)` (12px); gap `var(--space-ml)` (20px); surface `var(--page-background)`; title 20px Bold `var(--text-primary)`, supporting text 14px Regular `var(--text-secondary)`; full-screen close 44px disc `var(--input-background)`, `var(--radius-full)`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light not recorded / dark not recorded (full-screen close: Programs `4221:63780`).

**Prototype:** no dedicated component; centred modals use `src/components/ConfirmModal/ConfirmModal.tsx` with a `className`, full-screen ones use their own shell with `src/hooks/useOverlayA11y.ts` and `src/components/CloseButton/CloseButton.tsx` (`variant="fullscreen"`).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Modal | _to be mapped by engineering_ | | |

### Side Drawer

**Intent:** opens a full-height working area from the right so the user can edit or configure something without leaving the page.

**Use when**
- Creating or editing a record with several fields (roles, limited admin scope, saved reports).
- Picking from a large set (course picker, enrol people).
- Showing a record's details (learner progress).

**Don't use when**
- The user only confirms or cancels → use a Dialog (above)
- The task is one short form → use a Modal (above)

**Do**
- Make it 720px wide, full height, with `role="dialog"` and `aria-modal="true"`.
- Put a `CloseButton` in the top-right corner and close on Escape (`useOverlayA11y`) and backdrop click.
- Pin the footer: a divider, then the filled primary button followed by the Outlined-2 Cancel.
- Open confirmations from a drawer with `ConfirmModal`; its overlay sits above drawers.

**Don't**
- Don't give the drawer a radius or a shadow; it sits flush with the viewport edge.
- Don't hard-code the panel colour; use `var(--page-background)`.

**Canonical spec:** width 720px; height 100vh; padding `var(--space-ml)` (20px) top and bottom, `var(--space-l)` (24px) sides; gap `var(--space-ml)` (20px); no radius, no shadow; surface `var(--page-background)`; footer gap `var(--space-m)` (16px). Figma: Library `EC26cSVe9KNTCWXvYovakw`, light not recorded / dark not recorded.

**Prototype:** no shared component; each drawer is page-local. Follow `src/pages/people/components/LimitedAdminDrawer/LimitedAdminDrawer.tsx`, `src/pages/programs/components/EnrolPeopleDrawer/EnrolPeopleDrawer.tsx` or `src/pages/programs/components/CoursePickerDrawer/CoursePickerDrawer.tsx`, which use `useOverlayA11y` and `CloseButton`. The `.side-drawer__*` classes live in `src/pages/my-team/CoursesDrawer.css` (globally bundled; `SaveReportDrawer` also reuses them). Older drawers (`RolePanel`, `SaveReportDrawer`) run their own Escape handlers, and `RolePanel` hand-rolls its close button (`.roles-panel-close`); don't copy those.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Side Drawer | _to be mapped by engineering_ | | |

### Bottom Sheet (mobile)

**Intent:** shows more about the thing on screen, or a short set of actions, without leaving it: the sheet rises from the bottom edge and the screen behind stays in place, dimmed.

**Use when**
- The mobile app needs details or options for what is on screen (e.g. a lesson's instructor, skills, deep dive and resources behind "more").
- The content is short enough to read in one sheet; long or multi-step work gets its own screen.

**Don't use when**
- On desktop → use a Modal or Side Drawer (above)
- A destructive or blocking decision → use a Dialog ([doc](confirm-modal.md))

**Do**
- Use the shared `BottomSheet`; put your content in its children.
- Mount it to open and unmount it in `onClose`, which fires after the slide-out completes.
- Let every way out work: tapping the overlay, Escape, and dragging the handle down more than 80px.
- Pause or freeze what is behind it (e.g. a playing lesson) while it is open.
- Keep links from the sheet inside the app (an in-app web view), so back returns to the sheet.

**Don't**
- Don't hand-roll a sheet or its drag; reuse the component.
- Don't use a raw overlay colour; it is `var(--scrim)`.
- Don't animate it linearly or with a short ease; it rises on a long decelerating curve (see Animation).

**Canonical spec:** fills its positioned parent (the phone screen). Overlay `var(--scrim)` (Neutral-900 at 50% in the dark mobile app). Sheet `var(--page-background)`, top corners `var(--radius-sm)` (12px), padding `0 var(--space-m) var(--space-ml)` (0 16px 20px), gap `var(--space-s)` (8px), max height 90%, content scrolls. Header: `var(--space-m)` (16px) padding around a 64 × 4px handle, `var(--neutral-500)`, radius `var(--radius-s)`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `7479:106`.

**Prototype:** `src/components/BottomSheet/BottomSheet.tsx` (default export)
- `onClose` (called after the slide-out), `ariaLabel`, `children`, `className`
- Used by the mobile lesson sheet (`src/pages/mobile/LessonSheet.tsx`)

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Bottom Sheet | _to be mapped by engineering_ | | |

## When to Use What

| Component | Purpose | Use For |
|-----------|---------|---------|
| **Dialog** | Urgent decisions or confirmations | Delete confirmations, destructive action warnings, success/error feedback, simple yes/no decisions |
| **Modal** | Focused tasks with moderate content | Form inputs, detail views, content previews, settings, multi-step flows |
| **Side Drawer** | Extended workflows with scrollable content | Editing panels, detailed configurations, long forms, record details, bulk operations |
| **Bottom Sheet** (mobile) | Details or options for what is on screen | Lesson details behind "more", short option lists |

**Decision rule:** If the user needs to make a quick binary decision → Dialog. If they need to interact with a moderate amount of content → Modal. If they need a full working area that doesn't fully occlude the page → Side Drawer. In the mobile app, details or options for what is on screen → Bottom Sheet.

---

## Shared Foundation

All overlays share these building blocks:

### Overlay Backdrop

A full-screen semi-transparent layer that dims the page content and prevents interaction with elements behind the overlay.

```css
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  z-index: 1000;
}
```

Scrim values (Neutral-900 @ 25% light / 50% dark) are defined in `layout.md` — always use `var(--scrim)`, never a literal.

### Close Behavior

- **Dialog:** Close (×) button (`CloseButton`) in the top-right corner, plus the action buttons (confirm/cancel). Clicking the backdrop or pressing Escape also closes it (`ConfirmModal`).
- **Modal:** Close (×) button in the top-right corner. Clicking backdrop closes the modal.
- **Side Drawer:** Close (×) button in the top-right corner. Clicking backdrop closes the drawer.

### Close Button (Dialog, Modal & Side Drawer)

Use the shared component; don't hand-roll a close button:

```tsx
import CloseButton from '@/components/CloseButton/CloseButton'

<CloseButton onClick={onClose} />
```

`src/components/CloseButton/CloseButton.css`: 32 × 32px, circular `var(--radius-full)`, transparent at rest with a `var(--text-secondary)` glyph, `var(--input-background)` fill on hover, 2px `var(--primary-button-background)` focus outline with 2px offset. The page-level wrapper only positions it in the top-right corner.

### Close Button (Full-screen modal)

> **Figma:** Programs `4221:63780` — DS `Icons` set, `Name=close, Type=linear` instance with overrides (verified 2026-09-28).

A full-screen modal (lesson editors, Create Flashcard, the Add Content lesson forms: anything that replaces the whole viewport with `--page-background`) closes with a **filled disc**, not the bare glyph above. It sits in the overlay's top-right corner, outside the centred content column.

| Property | Value |
|---|---|
| Size | 44 × 44px |
| Padding | 4px (`--space-xs`) |
| Shape | Circle (`--radius-full`) |
| Fill | `--input-background` (Neutral-500 @ 16% dark, Neutral-200 @ 16% light) |
| Glyph | `IoCloseOutline`, 36 × 36px box, two 15.75px strokes at 1.5px, round caps |
| Glyph colour | `--text-secondary` |
| Hover | Fill `--input-background-hover`, glyph `--text-primary` |
| Focus | 2px `--primary-button-background` outline, 2px offset (shared `.close-btn`) |

**Use the component, never hand-roll it:**

```tsx
<CloseButton variant="fullscreen" onClick={onClose} className="lesson-editor-close" />
```

The page-level class only positions it (`position: absolute; top: var(--space-l); right: 40px`); size, fill, glyph and hover all come from `.close-btn--fullscreen` in `src/components/CloseButton/CloseButton.css`. Side drawers and centred modals keep the default `CloseButton`.

### Shared Design Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--page-background` | `#F9F9FA` | `#20222A` | Surface color for all overlay panels |
| `--text-primary` | `#20222A` | `#F9F9FA` | Titles and primary text |
| `--text-secondary` | `#454C5E` | `#BFC2CC` | Supporting text and descriptions |
| `--border` | `#DFE1E6` | `#2D313D` | Divider lines |
| `--scrim` | Neutral-900 @ 25% | Neutral-900 @ 50% | Backdrop fill (see `layout.md`) |
| `--radius-sm` | `12px` | — | Panel corner rounding (Dialog & Modal; Drawer has none) and button corner rounding |

### Shadow

Modal and Dialog panels use Shadow L:

```css
box-shadow: var(--shadow-l);
```

---

## 1. Dialog Component

A compact, centered overlay for critical decisions. Dialogs block the page until the user responds: an action button, the Close (×) button, a backdrop click or Escape.

### Architecture

The Dialog has three configurable dimensions:

| Property | Options |
|----------|---------|
| **Type** | Error, Warning, Info, Success |
| **Icon** | Shown / Hidden |
| **Secondary Text** | Shown / Hidden |

This produces 16 variants (4 types × 2 icon states × 2 text states).

### Visual Anatomy

```
┌─────────────────────────────────────┐
│                                     │
│           [Icon - 56px]             │  ← optional, type-specific
│                                     │
│     Title of the dialog modal       │  ← H3 (20px Bold), always shown
│   Secondary text of the dialog      │  ← Paragraph L (16px Regular), optional
│                                     │
│     ┌──────────┐  ┌──────────┐      │
│     │  Cancel   │  │  Action  │      │  ← Outlined-2 Cancel + filled buttons
│     └──────────┘  └──────────┘      │
│                                     │
└─────────────────────────────────────┘
```

### Dimensions & Spacing

```css
.dialog {
  width: 560px;
  max-width: 100%;
  padding: var(--space-l);                /* 24px all sides */
  border-radius: var(--radius-sm);         /* 12px */
  background: var(--page-background, #20222A);
  box-shadow: var(--shadow-l);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-ml);                   /* 20px between body and CTA */
  text-align: center;
}
```

### Icon by Type

Each dialog type has a distinct 56×56px icon:

| Type | Icon | Description |
|------|------|-------------|
| **Error** | Red triangle with exclamation | Danger/alert symbol |
| **Warning** | Orange triangle with exclamation | Caution symbol |
| **Info** | Cyan outlined info circle (`IoInformationCircleOutline`) | Informational |
| **Success** | Green circle with checkmark | Confirmation/completion |

All four icons render at 56×56px; the Info icon sits inside a plain flex wrapper (no extra padding).

### Text Content

```css
.dialog__title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;                     /* Bold */
  font-size: 20px;
  line-height: 1.5;
  color: var(--text-primary, #F9F9FA);
  text-align: center;
}

.dialog__description {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;                     /* Regular */
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-secondary, #BFC2CC);
  text-align: center;
}

/* Title + description wrapper */
.dialog__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);                  /* 4px between title and description */
}
```

### Button Styling per Type

The CTA row always contains two buttons side by side: an Outlined-2 Cancel button (`<Button variant="outlined-2">`) and a filled (primary) button. Colors change based on the dialog type:

```css
.dialog__cta {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 100%;
}
```

| Type | Cancel Button | Filled Button |
|------|----------------|---------------|
| **Error** | `border: 1px solid var(--border-elevated)` / text `var(--text-primary)` (Outlined-2) | `background: var(--danger-500)` / text `var(--neutral-25)` |
| **Warning** | `border: 1px solid var(--border-elevated)` / text `var(--text-primary)` (Outlined-2) | `background: var(--button-warning-background)` / text `var(--neutral-25)` |
| **Info** | `border: 1px solid var(--border-elevated)` / text `var(--text-primary)` (Outlined-2) | `background: var(--primary-button-background, #00AFC4)` / text `var(--text-button-foreground, #F9F9FA)` |
| **Success** | `border: 1px solid var(--border-elevated)` / text `var(--text-primary)` (Outlined-2) | `background: var(--primary-button-background, #00AFC4)` / text `var(--text-button-foreground, #F9F9FA)` |

**Button shared styles:**

```css
.dialog__btn {
  padding: 10px var(--space-ml);   /* Medium button */
  border-radius: var(--radius-sm);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;                     /* Bold */
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
}
```

**Pattern:** Error and Warning use high-contrast/urgent colors. Info and Success share the primary cyan brand color, reinforcing positive or neutral actions.

---

## 2. Modal Component

A centered overlay panel for focused tasks with moderate content. Modals include a section header with title, supporting text, a content area, and an action button.

### Visual Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│  Title of this section/modal                            ✕    │
│  Supporting text                                             │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│                                                              │
│                     [Content Area]                           │
│                     320px min height                         │
│                                                              │
│                                                              │
│                      ┌──────────┐                            │
│                      │  Button  │                            │
│                      └──────────┘                            │
└──────────────────────────────────────────────────────────────┘
```

### Dimensions & Spacing

```css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 720px;
  padding: var(--space-l);                /* 24px all sides */
  border-radius: var(--radius-sm);
  background: var(--page-background, #20222A);
  box-shadow: var(--shadow-l);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-ml);                   /* 20px between sections */
  z-index: 1001;
}
```

### Section Header

The header contains a title, optional supporting text, and a divider. It reuses the standard 5Mins Section Header pattern.

```css
.modal__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-m);                    /* 16px between headline and divider */
  width: 100%;
}

.modal__headline {
  display: flex;
  flex-direction: column;
  gap: 4px;                               /* 4px between title and supporting text */
  width: 100%;
}

.modal__title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;                       /* Bold */
  font-size: 20px;
  line-height: 1.5;
  color: var(--text-primary, #F9F9FA);
}

.modal__supporting-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;                       /* Regular */
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary, #BFC2CC);
}

.modal__divider {
  width: 100%;
  height: 1px;
  background: var(--border);
  border-radius: var(--radius-xs);
}
```

### Content Area

A flexible container for modal body content. Minimum height is 320px to ensure visual presence. Content can include forms, lists, previews, etc.

```css
.modal__content {
  width: 100%;
  min-height: 320px;
  border-radius: var(--radius-sm);
}
```

### CTA Button

A single centered primary (filled) button at the bottom:

```css
.modal__cta {
  background: var(--primary-button-background, #00AFC4);
  color: var(--text-button-foreground, #F9F9FA);
  padding: 10px var(--space-ml);
  border-radius: var(--radius-sm);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  cursor: pointer;
}
```

---

## 3. Side Drawer Component

A right-anchored panel that slides in from the edge of the viewport. The drawer spans the full height of the viewport and provides an extended working area with a sticky footer CTA section.

### Visual Anatomy

```
┌───────────────────┬──────────────────────────────────────────┐
│                   │  Title of this section/modal         ✕   │
│                   │  Supporting text                         │
│                   │  ─────────────────────────────────────── │
│                   │                                          │
│   Backdrop        │                                          │
│   (var(--scrim))  │           [Scrollable Content]           │
│                   │                                          │
│                   │                                          │
│                   │  ─────────────────────────────────────── │
│                   │  ┌──────────┐  ┌──────────┐             │
│                   │  │  Action  │  │  Cancel   │             │
│                   │  └──────────┘  └──────────┘             │
└───────────────────┴──────────────────────────────────────────┘
```

### Dimensions & Spacing

```css
.side-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 720px;
  height: 100vh;
  padding: var(--space-ml) var(--space-l);  /* 20px top/bottom, 24px left/right */
  background: var(--page-background, #20222A);
  display: flex;
  flex-direction: column;
  gap: var(--space-ml);                      /* 20px between sections */
  z-index: 1001;
}
```

**Key difference from Modal:** The Side Drawer uses `padding: 20px 24px` (not uniform 24px) and anchors to the right edge instead of centering. It has no border-radius (flush to viewport edge) and no box-shadow.

### Section Header

Identical to the Modal section header (title + supporting text + divider). See Modal Section Header above.

### Scrollable Content Area

The content area flexes to fill all available vertical space between the header and the footer CTA.

```css
.side-drawer__content {
  flex: 1 0 0;
  min-height: 0;                           /* allows flex shrinking for scroll */
  width: 100%;
  overflow-y: auto;
  border-radius: var(--radius-sm);
}
```

### Sticky Footer CTA

The footer is pinned to the bottom and contains a divider line followed by a row of buttons. The width is constrained to 656px (720px panel − 2×24px padding − 2×8px internal).

```css
.side-drawer__footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;                             /* fills padded area */
  background: var(--page-background, #20222A);
}

.side-drawer__footer-divider {
  width: 100%;
  height: 1px;
  background: var(--border);
  border-radius: var(--radius-xs);
}

.side-drawer__buttons {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
```

The Side Drawer CTA section uses **two buttons** side by side: a filled primary button followed by an Outlined-2 Cancel (`<Button variant="outlined-2">`).

```css
/* Filled primary (prefer <Button>) */
.side-drawer__btn-primary {
  background: var(--primary-button-background, #00AFC4);
  color: var(--text-button-foreground, #F9F9FA);
  padding: 10px var(--space-ml);
  border-radius: var(--radius-sm);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  cursor: pointer;
}

/* Outlined-2 Cancel (prefer <Button variant="outlined-2">) */
.side-drawer__btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-elevated);
  padding: 10px var(--space-ml);
  border-radius: var(--radius-sm);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
}
```

---

## React TypeScript Implementation

### Dialog

Compose the dialog inside `ConfirmModal` ([doc](confirm-modal.md)) with the shared `CloseButton` and `Button`. `ConfirmModal` supplies the scrim, portal, focus trap, Escape and backdrop close.

```tsx
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CloseButton from '@/components/CloseButton/CloseButton'
import Button from '@/components/Button/Button'

<ConfirmModal open={open} onClose={() => !busy && setOpen(false)} ariaLabel="Delete report">
  <CloseButton onClick={() => setOpen(false)} />
  <div className="confirm-modal-header confirm-modal-header--center">
    <h2 className="confirm-modal-title">Delete report</h2>
    <p className="confirm-modal-body">This can't be undone. Recipients will stop receiving it.</p>
  </div>
  <div className="confirm-modal-actions">
    <Button variant="outlined-2" onClick={() => setOpen(false)}>Cancel</Button>
    <Button semantic="danger" loading={busy} onClick={handleDelete}>Delete Report</Button>
  </div>
</ConfirmModal>
```

### Modal

```tsx
import { ReactNode } from 'react';
import CloseButton from '@/components/CloseButton/CloseButton';
import Button from '@/components/Button/Button';

interface ModalProps {
  title: string;
  supportingText?: string;
  children: ReactNode;
  ctaLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}

export function Modal({
  title,
  supportingText,
  children,
  ctaLabel = 'Save',
  onAction,
  onClose,
}: ModalProps) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />

      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <CloseButton onClick={onClose} />

        <div className="modal__header">
          <div className="modal__headline">
            <h2 id="modal-title" className="modal__title">{title}</h2>
            {supportingText && (
              <p className="modal__supporting-text">{supportingText}</p>
            )}
          </div>
          <div className="modal__divider" />
        </div>

        <div className="modal__content">
          {children}
        </div>

        {onAction && <Button onClick={onAction}>{ctaLabel}</Button>}
      </div>
    </>
  );
}
```

### Side Drawer

```tsx
import { ReactNode } from 'react';
import CloseButton from '@/components/CloseButton/CloseButton';
import Button from '@/components/Button/Button';

interface SideDrawerProps {
  title: string;
  supportingText?: string;
  children: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onClose: () => void;
}

export function SideDrawer({
  title,
  supportingText,
  children,
  primaryLabel = 'Save',
  secondaryLabel = 'Cancel',
  onPrimary,
  onSecondary,
  onClose,
}: SideDrawerProps) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />

      <div className="side-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <CloseButton onClick={onClose} />

        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <h2 id="drawer-title" className="modal__title">{title}</h2>
            {supportingText && (
              <p className="modal__supporting-text">{supportingText}</p>
            )}
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          {children}
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            {onPrimary && <Button onClick={onPrimary}>{primaryLabel}</Button>}
            {onSecondary && <Button variant="outlined-2" onClick={onSecondary}>{secondaryLabel}</Button>}
          </div>
        </div>
      </div>
    </>
  );
}
```

---

## Animation Guidelines

### Recommended Transitions

| Component | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| **Backdrop** | Fade in (opacity 0 → 1, scrim carries its own alpha) | 200ms | ease-out |
| **Dialog** | Scale up + fade (0.95 → 1, opacity 0 → 1) | 200ms | ease-out |
| **Modal** | Scale up + fade (0.95 → 1, opacity 0 → 1) | 250ms | ease-out |
| **Side Drawer** | Slide in from right (translateX(100%) → 0) | 300ms | cubic-bezier(0.32, 0.72, 0, 1) |
| **Bottom Sheet** | Rise from bottom (translateY(100%) → 0); overlay fades with it | in 420ms, out 240ms | in cubic-bezier(0.32, 0.72, 0, 1), out cubic-bezier(0.4, 0, 1, 1); follows the finger while dragged |

```css
/* Entry animations */
@keyframes overlay-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes dialog-enter {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes drawer-slide-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
```

---

## Accessibility

### Required Practices

| Requirement | Dialog | Modal | Side Drawer |
|-------------|--------|-------|-------------|
| `role` attribute | `alertdialog` (set by `ConfirmModal`) | `dialog` (`alertdialog` when built on `ConfirmModal`) | `dialog` |
| `aria-modal="true"` | ✓ | ✓ | ✓ |
| Accessible name | `aria-label` via `ConfirmModal`'s `ariaLabel` | `aria-label` via `ariaLabel` on `ConfirmModal`, or `aria-labelledby` pointing to the title | `aria-labelledby` pointing to the title |
| Focus trap | ✓ (mandatory) | ✓ (mandatory) | ✓ (mandatory) |
| Return focus on close | ✓ | ✓ | ✓ |
| Escape key closes | ✓ | ✓ | ✓ |
| Backdrop click closes | ✓ | ✓ | ✓ |

### Focus Management

When any overlay opens, focus must move to the first interactive element inside the panel. When closed, focus returns to the element that triggered the overlay. Tab key must cycle only through elements inside the overlay (focus trap).

```tsx
// Minimal focus trap hook
function useFocusTrap(ref: React.RefObject<HTMLElement>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const focusable = ref.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, ref]);
}
```

---

## Usage Examples

### Delete Confirmation (Dialog)

See the `ConfirmModal` sample under React TypeScript Implementation > Dialog above.

### Edit Course Settings (Modal)

```tsx
<Modal
  title="Course Settings"
  supportingText="Configure visibility and access controls"
  ctaLabel="Save Changes"
  onAction={handleSave}
  onClose={closeModal}
>
  <CourseSettingsForm />
</Modal>
```

### User Detail Panel (Side Drawer)

```tsx
<SideDrawer
  title="Learner Profile"
  supportingText="View and edit learner details"
  primaryLabel="Save"
  secondaryLabel="Discard"
  onPrimary={handleSave}
  onSecondary={handleDiscard}
  onClose={closeDrawer}
>
  <LearnerDetailForm />
</SideDrawer>
```

---

## Quick Reference

### Component Comparison

| Property | Dialog | Modal | Side Drawer |
|----------|--------|-------|-------------|
| **Width** | 560px | 720px | 720px |
| **Height** | Auto (content) | Auto (content) | 100vh |
| **Position** | Centered | Centered | Right-anchored |
| **Padding** | 24px uniform | 24px uniform | 20px vert / 24px horiz |
| **Border radius** | 12px | 12px | None (flush) |
| **Shadow** | Shadow L | Shadow L | None |
| **Close button** | ✓ top-right | ✓ top-right | ✓ top-right |
| **Backdrop click** | Closes | Closes | Closes |
| **Escape key** | Closes | Closes | Closes |
| **Header style** | Centered, type icon | Left-aligned, section header | Left-aligned, section header |
| **CTA buttons** | 2 (type-colored) | 1 (primary centered) | 2 (primary, sticky footer) |
| **Scrollable content** | No | Optional | Yes (flex body) |
