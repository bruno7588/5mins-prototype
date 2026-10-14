---
name: 5mins-confirm-modal
description: ConfirmModal, the shared centred overlay shell for 5Mins.ai dialogs and short modals - portal to body, scrim, focus trap, 560px panel; Escape, backdrop and the close X only for modals (`closable`). Use when building any confirmation dialog, destructive-action prompt, unsaved-changes prompt, or short centred modal.
---

# ConfirmModal

The shell every centred Dialog and short Modal in the prototype is built on: it supplies the scrim, the panel, the portal, the focus trap and the close behaviour, and the caller composes the content (icon, title, body, buttons) inside it.

**Code:** `import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'` (`src/components/ConfirmModal/ConfirmModal.tsx` + `ConfirmModal.css`; code is the reference)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Dialog `7789:24651`; Modal dark `7479:4350` / light `11919:4717` (instance)
**Last verified:** 2026-09-29

## Usage

The Dialog spec itself (types, icons, button colours per type) lives in [overlays.md](overlays.md).

**Intent:** holds the user on one decision, usually confirming something consequential, in a centred panel they must answer or dismiss.

**Use when**
- Confirming a destructive or hard-to-undo action (delete, deactivate, unenrol, remove a mapping).
- Confirming that unsaved changes will be lost.
- Hosting a short centred modal (a form of one to three fields) by sizing the panel with `className`.
- You need a scrim, focus trap and Escape over content from inside a drawer or another panel.

**Don't use when**
- The user edits a record or works through a long form → use a Side Drawer ([doc](overlays.md))
- The user needs feedback after an action completes → use a Toast ([doc](alerts-toast.md))
- The choice is an action on a table row → use the row kebab menu ([doc](row-actions-menu.md))

**Do**
- Import the shared shell: `import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'`.
- Pass `ariaLabel` naming the dialog ("Extend due date", "Confirm mark as completed").
- For a dialog, leave `closable` off: no close X, and only the buttons close it. For a short modal, pass `closable` (close X, Escape and backdrop close).
- Compose the content from `.confirm-modal-header` (add `--center` for icon dialogs), `.confirm-modal-icon`, `.confirm-modal-title`, `.confirm-modal-body` and `.confirm-modal-actions`.
- End with `<Button variant="outlined-2">Cancel</Button>` followed by the commit button, both Medium.
- Use `semantic="danger"` for destructive commits and `semantic="warning"` for discarding unsaved changes.
- Block closing while the commit is running (`onClose={() => !busy && cancel()}`) and show `loading` on the commit button.
- Set the width of a short modal through `className` (e.g. `.edd { width: 600px; }`), not by restyling `.confirm-modal`.

**Don't**
- Don't render your own fixed overlay for a dialog; you lose the portal, focus trap and Escape.
- Don't mount a confirm inside a panel that sets its own `z-index` without the portal; the panel's stacking context traps it and the top nav paints over it.
- Don't use primary Outlined or a text button for Cancel.
- Don't hard-code the scrim or panel colour; use `var(--scrim)` and `var(--page-background)`.

**Canonical spec:** panel width 560px, `max-width: 100%`; padding `var(--space-l)` (24px); radius `var(--radius-sm)` (12px); gap `var(--space-ml)` (20px); surface `var(--page-background)`; shadow `var(--shadow-l)`; overlay `var(--scrim)` at `z-index: 1050` with `var(--space-l)` (24px) padding; title 20px Bold `var(--text-primary)`; body 16px Regular `var(--text-secondary)`; actions gap `var(--space-m)` (16px).

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Component | Dialog / Modal | `closable` | `false` (default) / `true` | Dialog: no close X, buttons only. Modal: close X, Escape and backdrop close |
| Dialog > Type | Error / Warning / Info / Success | n/a | composed | No `type` prop. The type is the icon you put in `.confirm-modal-icon` and the commit `Button`: Error `semantic="danger"`, Warning `semantic="warning"`, Info and Success the default primary |
| Dialog > Icon | True / False | n/a | composed | Include or omit the `.confirm-modal-icon` child |
| Dialog > Secondary text | True / False | n/a | composed | Include or omit `.confirm-modal-body` |
| Dialog > Info (slot) | content | `children` | `ReactNode` | Title, body and action row |
| Modal > Placeholder (slot) | content | `children` | `ReactNode` | Header, content and CTA |

- **Figma only:** `Modal/Full screen` (`3223:31934`, State `Default`, Device `Desktop` / `Mobile`); full-screen modals do not use ConfirmModal, they use their own shell with `useOverlayA11y` and `<CloseButton variant="fullscreen">` ([overlays.md](overlays.md)).
- **Code only:** `open`, `onClose`, `ariaLabel`, `className`.

**Props**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | `false` returns `null` (no exit animation). |
| `onClose` | `() => void` | required | Your Cancel calls it. Also called by the close X, Escape and mousedown on the scrim, all only when `closable`; a dialog leaves only through its buttons. |
| `closable` | `boolean` | `false` | Modal: close X top-right, Escape and backdrop close. Off: dialog, buttons only. |
| `children` | `ReactNode` | required | All panel content, including the action row. |
| `className` | `string` | none | Appended to `.confirm-modal`, for sizing or layout. |
| `ariaLabel` | `string` | `'Confirm action'` | Sets `aria-label` on the panel. |

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| ConfirmModal (Dialog shell) | _to be mapped by engineering_ | | |

## Anatomy

```
.confirm-modal-overlay   fixed, inset 0, var(--scrim), z-index 1050, scrolls
└─ .confirm-modal        role="alertdialog", aria-modal, 560px panel
   ├─ CloseButton        only when closable (modal), top-right
   ├─ .confirm-modal-header [--center]
   │  ├─ .confirm-modal-icon   optional, 72px Iconsax in current call sites
   │  ├─ .confirm-modal-title
   │  └─ .confirm-modal-body
   └─ .confirm-modal-actions   Cancel (Outlined-2) + commit
```

- **Portal:** renders into `document.body`. A confirm opened from inside a panel with its own `z-index` (the automations details modal is 90) would otherwise be trapped in that stacking context, under the top nav at 100.
- **Layering:** `z-index: 1050` sits above side drawers (1000-1002) so drawer-spawned confirms show, and below toasts (1100).
- **Backdrop:** when `closable`, mousedown on the scrim calls `onClose`; a dialog ignores it. Mousedown inside the panel is stopped from bubbling.
- **Tall content:** the panel centres with `margin: auto` and the overlay scrolls, so a dialog taller than the window keeps its top reachable.
- **Motion:** overlay fades in over 200ms; panel pops from `scale(0.96)` over 250ms. No exit animation.

**Known quirks**
- The `.confirm-modal-*` content classes are defined in `src/pages/people/People.css` (lines 562-870), not in `ConfirmModal.css`. They are globally bundled, so they work everywhere, but moving them into the component folder is outstanding.
- `.confirm-modal-actions--center` is used (e.g. `Roles.tsx`) but has no CSS rule; `.confirm-modal-actions` is already centred.
- No `prefers-reduced-motion` override on the enter animations.

## Variants

- **Dialog** (`closable` off): one decision, buttons only.
- **Modal** (`closable` on): a short centred modal sized through `className` (Extend due date, Edit start date, Give another attempt).
- **Bare scrim:** the shell also hosts a scrim with no card (the situational test preview).

## States

| State | Behaviour | Tokens |
|---|---|---|
| Closed | Renders nothing | n/a |
| Opening | Overlay fades in 200ms; panel pops from `scale(0.96)` over 250ms | `var(--scrim)`, `var(--page-background)`, `var(--shadow-l)` |
| Busy | Closing blocked (`onClose={() => !busy && cancel()}`); commit button shows `loading` | per [buttons.md](buttons.md) |
| Focus-visible | Supplied by the content: `Button` and `CloseButton` rings; the panel itself takes programmatic focus only (`tabIndex={-1}`) | per [buttons.md](buttons.md) |

## Tokens

`var(--scrim)`, `var(--page-background)`, `var(--shadow-l)`, `var(--radius-sm)`, `var(--space-l)`, `var(--space-ml)`, `var(--space-m)`, `var(--text-primary)`, `var(--text-secondary)`.

## Accessibility

- **Role:** the panel is `role="alertdialog"` with `aria-modal`; `ariaLabel` sets its accessible name.
- **Focus and keys:** `useOverlayA11y` moves focus to the first focusable element (or the panel, which has `tabIndex={-1}`), traps Tab, restores focus to the trigger on close, locks body scroll and, when `closable`, calls `onClose` on Escape. A child marked `data-autofocus` takes the first focus instead.

## Content

- Label the commit button with the action and its object ("Delete Report"); for bulk actions, including the count or the person helps it read differently from the button that opened the dialog.

## Examples

See the Dialog and Modal samples in [overlays.md](overlays.md#examples).

## Related

- [overlays.md](overlays.md) - Dialog, Modal, Side Drawer and Bottom Sheet spec
- [buttons.md](buttons.md) - Outlined-2 Cancel and semantic commit buttons
- [alerts-toast.md](alerts-toast.md) - Toast, for feedback after an action
