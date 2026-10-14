---
name: 5mins-overlays
description: Dialog (Error/Warning/Info/Success types, 56px icons), Modal (720px, centered), Side Drawer (right-anchored) and the mobile Bottom Sheet for 5Mins.ai - shared scrim, close behavior, animations. Use for any overlay, confirmation, popup, panel, drawer or mobile bottom sheet.
---

# Overlays

The overlay components, **Dialog**, **Modal** and **Side Drawer** on desktop and the **Bottom Sheet** in the mobile app, share a common backdrop but serve distinct interaction purposes.

**Code:** Dialog and centred Modal: `import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'` ([confirm-modal.md](confirm-modal.md)); Bottom Sheet: `import BottomSheet from '@/components/BottomSheet/BottomSheet'`; close buttons: `import CloseButton from '@/components/CloseButton/CloseButton'`; Side Drawer and full-screen Modal: no shared component yet, page-local shells with `src/hooks/useOverlayA11y.ts`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Dialog dark `7789:24651` / light `12242:5728`; Modal dark `7479:4350` / light `11919:4717` (instance); Side Drawer dark `10871:12768` / light `11919:4738` (instance); Bottom sheet dark `7479:106` / light `12279:281` (instance); full-screen close: Programs `4221:63780`
**Last verified:** 2026-10-13

## Usage

| Component | Purpose | Use For |
|-----------|---------|---------|
| **Dialog** | Urgent decisions or confirmations | Delete confirmations, destructive action warnings, success/error feedback, simple yes/no decisions |
| **Modal** | Focused tasks with moderate content | Form inputs, detail views, content previews, settings, multi-step flows |
| **Side Drawer** | Extended workflows with scrollable content | Editing panels, detailed configurations, long forms, record details, bulk operations |
| **Bottom Sheet** (mobile) | Details or options for what is on screen | Lesson details behind "more", short option lists |

**Decision rule:** If the user needs to make a quick binary decision → Dialog. If they need to interact with a moderate amount of content → Modal. If they need a full working area that doesn't fully occlude the page → Side Drawer. In the mobile app, details or options for what is on screen → Bottom Sheet.

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
- Build it on `ConfirmModal` ([doc](confirm-modal.md)) without `closable`; it portals to `<body>` and traps focus.
- Let the action buttons be the only way out: no Close (×), no backdrop click, no Escape.
- End with an Outlined-2 Cancel followed by the commit button, both Medium.
- Use `semantic="danger"` for destructive commits and `semantic="warning"` for discarding unsaved changes.

**Don't**
- Don't render a dialog inside a panel that sets its own `z-index`; it gets trapped under that stacking context. `ConfirmModal` portals for this reason.
- Don't use primary Outlined for Cancel.
- Don't hard-code the scrim colour; use `var(--scrim)`.

**Canonical spec:** width 560px (max 100%); padding `var(--space-l)` (24px); radius `var(--radius-sm)` (12px); gap `var(--space-ml)` (20px); surface `var(--page-background)`; scrim `var(--scrim)`; title 20px Bold `var(--text-primary)`; body 16px Regular `var(--text-secondary)`; type icon 56px (72px Iconsax in current call sites).

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
- Build centred modals on the `ConfirmModal` shell with `closable` and set the width through `className`.
- Head it with a title, supporting text and a divider (the Section Header pattern).
- Put a `CloseButton` in the top-right corner; close on Escape and backdrop click.
- Use `<CloseButton variant="fullscreen">` on full-screen modals.
- When you write your own overlay shell, call `useOverlayA11y(panelRef, open, { onEscape })` for focus trap, focus return and Escape.

**Don't**
- Don't hand-roll the full-screen close disc; use the `CloseButton` component.
- Don't hard-code the panel colour; use `var(--page-background)`.

**Canonical spec:** width 720px in the Figma spec (current prototype modals set their own width, e.g. 600px); padding `var(--space-l)` (24px); radius `var(--radius-sm)` (12px); gap `var(--space-ml)` (20px); surface `var(--page-background)`; title 20px Bold `var(--text-primary)`, supporting text 14px Regular `var(--text-secondary)`; full-screen close 44px disc `var(--input-background)`, `var(--radius-full)`.

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

**Canonical spec:** width 720px; height 100vh; padding `var(--space-ml)` (20px) top and bottom, `var(--space-l)` (24px) sides; gap `var(--space-ml)` (20px); no radius, no shadow; surface `var(--page-background)`; footer gap `var(--space-m)` (16px).

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
- Don't animate it linearly or with a short ease; it rises on a long decelerating curve (see States).

**Canonical spec:** fills its positioned parent (the phone screen). Overlay `var(--scrim)` (Neutral-900 at 50% in the dark mobile app). Sheet `var(--page-background)`, top corners `var(--radius-sm)` (12px), padding `0 var(--space-m) var(--space-l)` (0 16px 24px), gap `var(--space-s)` (8px), max height 90%, content scrolls. Header: `var(--space-m)` (16px) padding around a 64 × 4px handle, `var(--neutral-500)`, radius `var(--radius-s)`.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Dialog (component) | n/a | `ConfirmModal` `closable` | `false` (default) | Buttons are the only way out |
| Dialog > Type | Error / Warning / Info / Success | n/a | composed | No `type` prop: the type icon goes in `.confirm-modal-icon`; commit `Button` Error `semantic="danger"`, Warning `semantic="warning"`, Info and Success default primary |
| Dialog > Icon | True / False | n/a | composed | Include or omit `.confirm-modal-icon` |
| Dialog > Secondary text | True / False | n/a | composed | Include or omit `.confirm-modal-body` |
| Dialog > Info (slot) | content | `ConfirmModal` `children` | `ReactNode` | |
| Modal (component) | n/a | `ConfirmModal` `closable` | `true` | Width through `className` |
| Modal > Placeholder (slot) | content | `ConfirmModal` `children` | `ReactNode` | |
| Modal/Full screen > Device | Desktop / Mobile | n/a | n/a | Page-local shell with `useOverlayA11y` and `<CloseButton variant="fullscreen">` |
| Modal/Full screen > State | Default | n/a | n/a | Single-value axis |
| Side Drawer > Form (slot) | content | n/a | page-local | No shared component; `.side-drawer__*` classes |
| Bottom sheet > Sheet content (slot) | content | `BottomSheet` `children` | `ReactNode` | |
| Close icon (Modal, Side Drawer) | `io5/IoCloseOutline` | `CloseButton` `variant` | `'default'` / `'fullscreen'` | Full-screen modals use `fullscreen` |

- **Figma only:** Modal/Full screen `Device=Mobile`; Modal/Send (`5399:12437`, Type Team / Company), a feature screen with no code.
- **Code only:** `ConfirmModal` `open`, `onClose`, `ariaLabel`, `className`; `BottomSheet` `onClose`, `ariaLabel`, `hidden` (keeps the sheet open but out of sight, so it comes back as it was), `className`; `CloseButton` `onClick`, `onMouseDown`, `size`, `className`, `ariaLabel`.

**Prototype pointers**
- **Dialog:** `src/components/ConfirmModal/ConfirmModal.tsx`. `open`, `onClose` (called by your Cancel; Escape and backdrop only when `closable`), `ariaLabel`, `className` for sizing; content is composed from `.confirm-modal-*` classes.
- **Modal:** no dedicated component; centred modals use `src/components/ConfirmModal/ConfirmModal.tsx` with a `className`, full-screen ones use their own shell with `src/hooks/useOverlayA11y.ts` and `src/components/CloseButton/CloseButton.tsx` (`variant="fullscreen"`).
- **Side Drawer:** no shared component; each drawer is page-local. Follow `src/pages/people/components/LimitedAdminDrawer/LimitedAdminDrawer.tsx`, `src/pages/programs/components/EnrolPeopleDrawer/EnrolPeopleDrawer.tsx` or `src/pages/programs/components/CoursePickerDrawer/CoursePickerDrawer.tsx`, which use `useOverlayA11y` and `CloseButton`. The `.side-drawer__*` classes live in `src/pages/my-team/CoursesDrawer.css` (globally bundled; `SaveReportDrawer` also reuses them). Older drawers (`RolePanel`, `SaveReportDrawer`) run their own Escape handlers, and `RolePanel` hand-rolls its close button (`.roles-panel-close`); don't copy those.
- **Bottom Sheet:** `src/components/BottomSheet/BottomSheet.tsx` (default export). `onClose` (called after the slide-out), `ariaLabel`, `children`, `className`. Used by the mobile lesson sheet (`src/pages/mobile/LessonSheet.tsx`).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Dialog | _to be mapped by engineering_ | | |
| Modal | _to be mapped by engineering_ | | |
| Side Drawer | _to be mapped by engineering_ | | |
| Bottom Sheet | _to be mapped by engineering_ | | |

## Anatomy

### Overlay backdrop

A full-screen semi-transparent layer that dims the page content and prevents interaction with elements behind the overlay.

```css
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  z-index: 1000;
}
```

Scrim values (Neutral-900 @ 25% light / 50% dark) are defined in `layout.md`; always use `var(--scrim)`, never a literal.

### Close behaviour

- **Dialog:** only the action buttons (confirm/cancel). No Close (×); backdrop click and Escape do nothing (`ConfirmModal` without `closable`).
- **Modal:** Close (×) button in the top-right corner. Clicking backdrop or pressing Escape closes the modal (`ConfirmModal` with `closable`).
- **Side Drawer:** Close (×) button in the top-right corner. Clicking backdrop or pressing Escape closes the drawer.

### Close button (Modal and Side Drawer)

Use the shared component; don't hand-roll a close button:

```tsx
import CloseButton from '@/components/CloseButton/CloseButton'

<CloseButton onClick={onClose} />
```

`src/components/CloseButton/CloseButton.css`: 32 × 32px, circular `var(--radius-full)`, transparent at rest with a `var(--text-secondary)` glyph, `var(--input-background)` fill on hover, 2px `var(--primary-button-background)` focus outline with 2px offset. The page-level wrapper only positions it in the top-right corner.

### Close button (full-screen modal)

> **Figma:** Programs `4221:63780` - DS `Icons` set, `Name=close, Type=linear` instance with overrides.

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

### Dialog

A compact, centered overlay for critical decisions. Dialogs block the page until the user responds with one of the action buttons; there is no Close (×), and backdrop click and Escape do not close them.

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

**Text content**

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

**CTA row:** always two buttons side by side, an Outlined-2 Cancel (`<Button variant="outlined-2">`) and a filled (primary) button; colours per type are under Variants.

```css
.dialog__cta {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 100%;
}
```

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

### Modal

A centered overlay panel for focused tasks with moderate content. Modals include a section header with title, supporting text, a content area, and an action button.

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

**Section header:** a title, optional supporting text, and a divider. It reuses the standard 5Mins Section Header pattern.

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

**Content area:** a flexible container for modal body content. Minimum height is 320px to ensure visual presence. Content can include forms, lists, previews, etc.

```css
.modal__content {
  width: 100%;
  min-height: 320px;
  border-radius: var(--radius-sm);
}
```

**CTA button:** a single centered primary (filled) button at the bottom.

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

### Side Drawer

A right-anchored panel that slides in from the edge of the viewport. The drawer spans the full height of the viewport and provides an extended working area with a sticky footer CTA section.

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

**Key difference from Modal:** the Side Drawer uses `padding: 20px 24px` (not uniform 24px) and anchors to the right edge instead of centering. It has no border-radius (flush to viewport edge) and no box-shadow.

**Section header:** identical to the Modal section header (title + supporting text + divider).

**Scrollable content area:** flexes to fill all available vertical space between the header and the footer CTA.

```css
.side-drawer__content {
  flex: 1 0 0;
  min-height: 0;                           /* allows flex shrinking for scroll */
  width: 100%;
  overflow-y: auto;
  border-radius: var(--radius-sm);
}
```

**Sticky footer CTA:** pinned to the bottom, a divider line followed by a row of buttons. The width is constrained to 656px (720px panel − 2×24px padding − 2×8px internal).

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

## Variants

### Dialog

| Property | Options |
|----------|---------|
| **Type** | Error, Warning, Info, Success |
| **Icon** | Shown / Hidden |
| **Secondary Text** | Shown / Hidden |

This produces 16 variants (4 types × 2 icon states × 2 text states).

**Icon by type:** each dialog type has a distinct 56×56px icon.

| Type | Icon | Description |
|------|------|-------------|
| **Error** | Red triangle with exclamation | Danger/alert symbol |
| **Warning** | Orange triangle with exclamation | Caution symbol |
| **Info** | Cyan outlined info circle (`IoInformationCircleOutline`) | Informational |
| **Success** | Green circle with checkmark | Confirmation/completion |

All four icons render at 56×56px; the Info icon sits inside a plain flex wrapper (no extra padding).

**Button styling per type**

| Type | Cancel Button | Filled Button |
|------|----------------|---------------|
| **Error** | `border: 1px solid var(--border-elevated)` / text `var(--text-primary)` (Outlined-2) | `background: var(--danger-500)` / text `var(--neutral-25)` |
| **Warning** | `border: 1px solid var(--border-elevated)` / text `var(--text-primary)` (Outlined-2) | `background: var(--button-warning-background)` / text `var(--neutral-25)` |
| **Info** | `border: 1px solid var(--border-elevated)` / text `var(--text-primary)` (Outlined-2) | `background: var(--primary-button-background, #00AFC4)` / text `var(--text-button-foreground, #F9F9FA)` |
| **Success** | `border: 1px solid var(--border-elevated)` / text `var(--text-primary)` (Outlined-2) | `background: var(--primary-button-background, #00AFC4)` / text `var(--text-button-foreground, #F9F9FA)` |

**Pattern:** Error and Warning use high-contrast/urgent colors. Info and Success share the primary cyan brand color, reinforcing positive or neutral actions.

### Modal

- **Centred modal:** `ConfirmModal` with `closable`, default `CloseButton`.
- **Full-screen modal:** replaces the whole viewport with `--page-background`; own shell, `<CloseButton variant="fullscreen">`.

## Sizes

| Property | Dialog | Modal | Side Drawer |
|----------|--------|-------|-------------|
| **Width** | 560px | 720px | 720px |
| **Height** | Auto (content) | Auto (content) | 100vh |
| **Position** | Centered | Centered | Right-anchored |
| **Padding** | 24px uniform | 24px uniform | 20px vert / 24px horiz |
| **Border radius** | 12px | 12px | None (flush) |
| **Shadow** | Shadow L | Shadow L | None |
| **Close button** | None | ✓ top-right | ✓ top-right |
| **Backdrop click** | Does nothing | Closes | Closes |
| **Escape key** | Does nothing | Closes | Closes |
| **Header style** | Centered, type icon | Left-aligned, section header | Left-aligned, section header |
| **CTA buttons** | 2 (type-colored) | 1 (primary centered) | 2 (primary, sticky footer) |
| **Scrollable content** | No | Optional | Yes (flex body) |

## States

**Open and close transitions**

| Component | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| **Backdrop** | Fade in (opacity 0 → 1, scrim carries its own alpha) | 200ms | ease-out |
| **Dialog** | Scale up + fade (0.96 → 1, opacity 0 → 1) | 250ms | ease |
| **Modal** | Scale up + fade (0.96 → 1, opacity 0 → 1) | 250ms | ease |
| **Side Drawer** | Slide in from right (translateX(100%) → 0) | 300ms | ease-in-out (in and out) |
| **Bottom Sheet** | Rise from bottom (translateY(100%) → 0); overlay fades with it | in 420ms, out 240ms | in cubic-bezier(0.32, 0.72, 0, 1), out cubic-bezier(0.4, 0, 1, 1); follows the finger while dragged |

```css
/* Entry animations */
@keyframes overlay-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes dialog-enter {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes drawer-slide-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
```

**Close button states**

| State | Default `CloseButton` | Full-screen `CloseButton` |
|---|---|---|
| Rest | transparent, glyph `var(--text-secondary)` | fill `var(--input-background)`, glyph `var(--text-secondary)` |
| Hover | fill `var(--input-background)` | fill `var(--input-background-hover)`, glyph `var(--text-primary)` |
| Focus-visible | 2px `var(--primary-button-background)` outline, 2px offset | 2px `var(--primary-button-background)` outline, 2px offset |

Dialog and drawer buttons take their states from [buttons.md](buttons.md).

## Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--page-background` | `#F9F9FA` | `#20222A` | Surface color for all overlay panels |
| `--text-primary` | `#20222A` | `#F9F9FA` | Titles and primary text |
| `--text-secondary` | `#454C5E` | `#BFC2CC` | Supporting text and descriptions |
| `--border` | `#DFE1E6` | `#2D313D` | Divider lines |
| `--scrim` | Neutral-900 @ 25% | Neutral-900 @ 50% | Backdrop fill (see `layout.md`) |
| `--radius-sm` | `12px` | same | Panel corner rounding (Dialog & Modal; Drawer has none) and button corner rounding |

**Shadow:** Modal and Dialog panels use Shadow L, `box-shadow: var(--shadow-l);`.

## Accessibility

| Requirement | Dialog | Modal | Side Drawer |
|-------------|--------|-------|-------------|
| `role` attribute | `alertdialog` (set by `ConfirmModal`) | `dialog` (`alertdialog` when built on `ConfirmModal`) | `dialog` |
| `aria-modal="true"` | ✓ | ✓ | ✓ |
| Accessible name | `aria-label` via `ConfirmModal`'s `ariaLabel` | `aria-label` via `ariaLabel` on `ConfirmModal`, or `aria-labelledby` pointing to the title | `aria-labelledby` pointing to the title |
| Focus trap | ✓ (mandatory) | ✓ (mandatory) | ✓ (mandatory) |
| Return focus on close | ✓ | ✓ | ✓ |
| Escape key closes | ✗ (buttons only) | ✓ | ✓ |
| Backdrop click closes | ✗ (buttons only) | ✓ | ✓ |

**Focus management:** when any overlay opens, focus must move to the first interactive element inside the panel. When closed, focus returns to the element that triggered the overlay. Tab key must cycle only through elements inside the overlay (focus trap). Use `useOverlayA11y(panelRef, open, { onEscape })` (`src/hooks/useOverlayA11y.ts`), which `ConfirmModal` already calls.

**Focus-visible:** close buttons show a 2px `var(--primary-button-background)` outline with 2px offset (see States).

## Content

- Dialog title: a short sentence-case statement of the action ("Delete report"); let the body name what is affected and the consequence.
- Dialog commit button: the action and its object in Title Case ("Delete Report", "Mark 3 As Completed").

## Examples

### Dialog

Compose the dialog inside `ConfirmModal` ([doc](confirm-modal.md)) with `Button`, and leave `closable` off. `ConfirmModal` supplies the scrim, portal and focus trap; only the buttons close it.

```tsx
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Button from '@/components/Button/Button'

<ConfirmModal open={open} onClose={() => !busy && setOpen(false)} ariaLabel="Delete report">
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

Build centred modals on the shared `ConfirmModal` shell with `closable` on (close ×, backdrop click and Escape), and set the width through `className`.

```tsx
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Button from '@/components/Button/Button'

<ConfirmModal open={open} onClose={() => setOpen(false)} closable ariaLabel="Edit details" className="people-details-modal">
  {/* header, content and CTA composed per the spec above */}
  <Button onClick={handleSave}>Save</Button>
</ConfirmModal>
```

### Side Drawer

There is no shared drawer component; this is the page-local shape to follow.

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

Usage, e.g. a user detail panel:

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

## Related

- [confirm-modal.md](confirm-modal.md) - the shell behind Dialog and centred Modal
- [buttons.md](buttons.md) - Outlined-2 Cancel and semantic commit buttons
- [alerts-toast.md](alerts-toast.md) - Toast, for feedback after an action
- [layout.md](layout.md) - scrim values
