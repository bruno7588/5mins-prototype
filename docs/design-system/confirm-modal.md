---
name: 5mins-confirm-modal
description: ConfirmModal, the shared centred overlay shell for 5Mins.ai dialogs and short modals - portal to body, scrim, focus trap, Escape and backdrop close, 560px panel. Use when building any confirmation dialog, destructive-action prompt, unsaved-changes prompt, or short centred modal.
---

# 5Mins.ai ConfirmModal

The shell every centred Dialog in the prototype is built on. It supplies the scrim, the panel, the portal, the focus trap and the close behaviour; the caller composes the content (icon, title, body, buttons) inside it. The Dialog spec itself (types, icons, button colours per type) lives in [overlays.md](overlays.md).

> **Updated 2026-09-29 (verified against code):** shadow now named as `var(--shadow-l)` (what `ConfirmModal.css` uses); the "commit label never repeats the opener" rule softened to a recommendation, matching buttons.md.

Spec source: Figma: not recorded; code is the reference (`src/components/ConfirmModal/ConfirmModal.tsx` + `ConfirmModal.css`).

## Usage

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
- Put a `CloseButton` in the top-right corner of the panel.
- Compose the content from `.confirm-modal-header` (add `--center` for icon dialogs), `.confirm-modal-icon`, `.confirm-modal-title`, `.confirm-modal-body` and `.confirm-modal-actions`.
- End with `<Button variant="outlined-2">Cancel</Button>` followed by the commit button, both Medium.
- Use `semantic="danger"` for destructive commits and `semantic="warning"` for discarding unsaved changes.
- Label the commit button with the action and its object ("Delete Report"); for bulk actions, including the count or the person helps it read differently from the button that opened the dialog.
- Block closing while the commit is running (`onClose={() => !busy && cancel()}`) and show `loading` on the commit button.
- Set the width of a short modal through `className` (e.g. `.edd { width: 600px; }`), not by restyling `.confirm-modal`.

**Don't**
- Don't render your own fixed overlay for a dialog; you lose the portal, focus trap and Escape.
- Don't mount a confirm inside a panel that sets its own `z-index` without the portal; the panel's stacking context traps it and the top nav paints over it.
- Don't use primary Outlined or a text button for Cancel.
- Don't hard-code the scrim or panel colour; use `var(--scrim)` and `var(--page-background)`.

**Canonical spec:** panel width 560px, `max-width: 100%`; padding `var(--space-l)` (24px); radius `var(--radius-sm)` (12px); gap `var(--space-ml)` (20px); surface `var(--page-background)`; shadow `var(--shadow-l)`; overlay `var(--scrim)` at `z-index: 1050` with `var(--space-l)` (24px) padding; title 20px Bold `var(--text-primary)`; body 16px Regular `var(--text-secondary)`; actions gap `var(--space-m)` (16px). Figma: Library `EC26cSVe9KNTCWXvYovakw`, light not recorded / dark not recorded.

**Prototype:** `src/components/ConfirmModal/ConfirmModal.tsx`
- `open` / `onClose`: renders nothing when closed; `onClose` fires on Escape and backdrop mousedown.
- `ariaLabel`: accessible name (defaults to "Confirm action").
- `className`: added to the panel for sizing or layout.
- `children`: the whole content, including the `CloseButton` and the action row.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| ConfirmModal (Dialog shell) | _to be mapped by engineering_ | | |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | `false` returns `null` (no exit animation). |
| `onClose` | `() => void` | required | Called on Escape and on mousedown on the scrim. |
| `children` | `ReactNode` | required | All panel content. |
| `className` | `string` | none | Appended to `.confirm-modal`. |
| `ariaLabel` | `string` | `'Confirm action'` | Sets `aria-label` on the panel. |

## Anatomy and behaviour

```
.confirm-modal-overlay   fixed, inset 0, var(--scrim), z-index 1050, scrolls
└─ .confirm-modal        role="alertdialog", aria-modal, 560px panel
   ├─ CloseButton        (caller) top-right
   ├─ .confirm-modal-header [--center]
   │  ├─ .confirm-modal-icon   optional, 72px Iconsax in current call sites
   │  ├─ .confirm-modal-title
   │  └─ .confirm-modal-body
   └─ .confirm-modal-actions   Cancel (Outlined-2) + commit
```

- **Portal:** renders into `document.body`. A confirm opened from inside a panel with its own `z-index` (the automations details modal is 90) would otherwise be trapped in that stacking context, under the top nav at 100.
- **Layering:** `z-index: 1050` sits above side drawers (1000-1002) so drawer-spawned confirms show, and below toasts (1100).
- **Focus and keys:** `useOverlayA11y` moves focus to the first focusable element (or the panel, which has `tabIndex={-1}`), traps Tab, restores focus to the trigger on close, locks body scroll and calls `onClose` on Escape.
- **Backdrop:** mousedown on the scrim calls `onClose`; mousedown inside the panel is stopped from bubbling.
- **Tall content:** the panel centres with `margin: auto` and the overlay scrolls, so a dialog taller than the window keeps its top reachable.
- **Motion:** overlay fades in over 200ms; panel pops from `scale(0.96)` over 250ms. No exit animation.
- **Other shapes:** the shell also hosts short modals (Extend due date, Edit start date, Give another attempt) and a bare scrim with no card (the situational test preview).

**Known quirks**
- The `.confirm-modal-*` content classes are defined in `src/pages/people/People.css` (lines 562-870), not in `ConfirmModal.css`. They are globally bundled, so they work everywhere, but moving them into the component folder is outstanding.
- `.confirm-modal-actions--center` is used (e.g. `Roles.tsx`) but has no CSS rule; `.confirm-modal-actions` is already centred.
- Most current call sites do not yet include the `CloseButton`; the rule above is the target.
- No `prefers-reduced-motion` override on the enter animations.
