---
name: 5mins-impersonation-banner
description: Impersonation session banner (DES-337) — the full-width bar fixed to the top of the learner app while an admin impersonates a user. Anatomy, type, spacing, the normal/warning/critical states, motion, page offsets and accessibility. Use when changing the banner or anything that must sit below it.
---

# 5Mins.ai Impersonation Banner

The bar that stays fixed to the top of the app for the whole of an impersonation session. It tells the admin who they are acting as, how long is left, and gives them one way out.

> **Spec source:** Figma People — Normal `9600:43180`, Warning `9601:44620`, Critical `9601:46094` (2026-09-15).
>
> **Code:** `src/impersonation/ImpersonationBar.tsx` + `.css`, driven by `ImpersonationContext.tsx`.

## Anatomy (left → right)

The bar is a flex row with `justify-content: space-between`: the identity group sits at the far left, the session group at the far right, and the space between them flexes with the viewport.

| Group | Part | Spec |
|---|---|---|
| Identity (gap 12px) | Prefix (gap 8px) | `ImpersonateIcon` 20px + "Impersonating", Paragraph M regular (14 / 400 / 1.5) |
| | Person (gap 8px) | 24px avatar (photo, or initials 8 / 400 / 1.5 on the state colour at 16%) + label |
| | Label (gap 4px) | Name, Paragraph M semibold (14 / 600 / 1.5) + "· {role}", Paragraph S regular (12 / 400 / 1.2) |
| Session (gap 16px) | Timer (gap 4px) | 16px dot slot + `mm:ss`, Paragraph M regular, tabular digits, 5ch minimum width |
| | End Impersonation | DS medium Filled button with `Logout` 20px, a neutral fill and tighter padding (8px top/bottom, 12px left, 16px right; 37px tall), the same in every state (below) |

Every text colour and the mask icon use the state's foreground colour.

## Layout

```
Position:  fixed, top 0, full width, z-index 1090 (above drawers 1000 and confirm modals 1050, below toasts 1100)
Padding:   12px top/bottom (--space-sm), 24px sides (--space-l)
Height:    61px (12px + the 37px End button + 12px) — published as --imp-bar-h on body.imp-impersonating
Background: the state tint layered over --page-background, so the fixed bar stays opaque over scrolling content
```

## States

| State | When | Background tint | Text + mask | Dot |
|---|---|---|---|---|
| **Normal** | > 5:00 left | Primary-500 @ 16% | `--text-progress` | `--text-progress` |
| **Warning** | ≤ 5:00 | Warning-500 @ 24% | `--text-warning` | `--text-warning` |
| **Critical** | ≤ 1:00 | Danger-500 @ 24% | `--text-error` | centre `--text-error`, ring `--danger-300` |

The End Impersonation button is DS Filled with a neutral fill in all three states: Neutral-800 fill + Neutral-25 label and icon in light mode, Neutral-25 fill + Neutral-800 label in dark (Figma `9616:47761` light, `9584:28195` dark). Hover and pressed are the DS primary Filled states (`--primary-button-background-hover` / `-pressed`). Warning buttons mean "caution" and Danger buttons mean "destructive", but ending the session is the safe, recommended exit. The tint, text, dot and toasts carry the urgency; the button stays constant so the way out never changes.

The text tokens are theme-aware (light: Primary-700 / Warning-600 / Danger-500; dark: Primary-500 / Warning-500 / Danger-400). The state switches instantly on the tick that crosses the threshold, and a toast announces 5:00 and 1:00 — see `alerts-toast.md` and the copy below.

## Motion

- Live dot: an 8px dot centred in a 16px slot; a ring of the same colour grows from it (scale 1 → 2, opacity 0.35 → 0, 1.6s ease-out, infinite).
- Under `prefers-reduced-motion: reduce` the ring stops, shown still at full size and 35% opacity.
- No other animation: no gradient line, glow or shadow pulse.

## Page offsets

While a session is live `body.imp-impersonating` is set, and everything that would otherwise start at the top of the viewport starts at `var(--imp-bar-h)`:

- body `padding-top`, the learner `.mt-topnav` and admin `.topnav`
- full-height overlays: `.side-drawer` (except the header-anchored Add Content drawer), `.overlay-backdrop`, `.lf-overlay`, `.confirm-modal-overlay`, `.pcd-quizstage`; confirm modals also cap their max-height by the bar height

Any new full-height fixed layer reachable from the learner app must join this list.

## Copy

One vocabulary for the whole feature: **impersonation** started / ended / expired. No em dashes in UI text; toasts join clauses with " - " and carry no trailing period; " · " separates metadata (name · role, time · date). Button labels are Title Case.

| Where | Text |
|---|---|
| Row menu | Impersonate user — disabled with supporting text "Not available for admins" / "Available once they've signed up" |
| Confirm button | Start Impersonation |
| Banner | Impersonating · End Impersonation |
| Toasts | Impersonating {name} · 5 minutes left · Less than 1 minute left · Impersonation ended · Impersonation expired |
| Locked action tooltip | You can't {action} while impersonating — e.g. "You can't open Admin while impersonating" |
| Audit log entries (recorded in session state; no UI in the prototype) | Impersonation of {name} by {admin} started / ended / expired after 60 minutes · Blocked: {admin} tried to {action} while impersonating · {activity} while impersonating {name} |

## Behaviour

- Only registered users who aren't admins can be impersonated.
- While impersonating, the learner side menu's Admin item is locked (see below) and the profile card shows the impersonated person's name and role.
- Clicking the timer jumps to 5:03 → 1:03 → 60:00. This is a prototype review shortcut, kept in deployed builds on purpose — remove before production.

## Locked actions (not allowed while impersonating)

The reference implementation is the learner side menu's **Admin** item (`src/components/AdminMenuItem`), built on `src/impersonation/ImpersonationLock.tsx`. **One pattern for every case:** a single link or button, or every field and control of a whole form (password, notification settings) — each locked control gets the same treatment below. There is no separate form-level variant.

| | Treatment |
|---|---|
| Visibility | The control stays in place — never hidden, so the page matches what the learner sees |
| State | Disabled look (`--text-disabled` label and icon, `cursor: not-allowed`, no hover fill), `aria-disabled="true"` — **not** the native `disabled` attribute, so it stays in the tab order |
| Reason | DS Tooltip (no info icon) on hover **and** keyboard focus: "You can't {action} while impersonating". Position it where it doesn't cover the control's neighbours (Right for a side-menu item), 4px from the control's own edge — anchor to the control itself, not a full-width row |
| Click | Swallowed — nothing happens, no toast — and recorded in the audit trail as "Blocked: {admin} tried to {action} while impersonating" |
| Outside a session | The control renders untouched |

```tsx
<ImpersonationLock action="change their email">
  {(locked) => (
    <Button variant="outlined" aria-disabled={locked || undefined} className={locked ? 'ui-disabled' : undefined} onClick={openEmailForm}>
      Change Email
    </Button>
  )}
</ImpersonationLock>
```

For a whole form, wrap each field and its submit button in its own `ImpersonationLock`, with an action that names that field ("change their password", "change their notification settings"), so every control explains itself on hover and focus. Don't add a form-level Callout: one pattern means the admin learns it once, on the Admin item, and recognises it everywhere.

## Do / Don't

✓ Keep every value on the type scale and spacing tokens above; the End button's neutral fill and padding are its only overrides
✓ Offset any new full-height overlay by `--imp-bar-h`
✗ Don't cover the banner with another layer — the admin must always see they are acting as someone else
✗ Don't add a second action to the bar; ending the session is the only one
