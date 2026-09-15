---
name: 5mins-impersonation-banner
description: Impersonation session banner (DES-337) — the full-width bar fixed to the top of the learner app while an admin impersonates a user. Anatomy, type, spacing, the normal/warning/critical states, motion, page offsets and accessibility. Use when changing the banner or anything that must sit below it.
---

# 5Mins.ai Impersonation Banner

The bar that stays fixed to the top of the app for the whole of an impersonation session. It tells the admin who they are acting as, how long is left, and gives them one way out.

> **Spec source:** code-defined, reviewed in the prototype with the designer (2026-09). There is no Figma node yet — when one lands, verify against it and add the node ref here.
>
> **Code:** `src/impersonation/ImpersonationBar.tsx` + `.css`, driven by `ImpersonationContext.tsx`.

## Anatomy (left → right)

| Part | Spec |
|---|---|
| Mask icon | `ImpersonateIcon` (Lucide "venetian-mask", redrawn at Iconsax's 1.5px Linear stroke), 20px, `--neutral-200` |
| Prefix | "Impersonating" — Paragraph M regular (14 / 400 / 1.5), `--neutral-200` |
| Avatar | 24px circle (avatars.md), photo or initials at 8px / 400 / 1.5 on `--neutral-25` @ 16% |
| Name | Paragraph M semibold (14 / 600 / 1.5), `--neutral-25` |
| Role | " · {role}" — Paragraph S regular (12 / 400 / 1.2), `--neutral-300` |
| Spacer | flexes to push the timer and button right |
| Timer | 8px live dot + `mm:ss` in Paragraph M regular (14 / 400 / 1.5) with tabular digits and a 5ch minimum width, `--neutral-200` |
| End button | DS filled button, "End Impersonation", `LogoutCurve` 20px — `--neutral-25` fill with `--neutral-900` label at rest; hover takes the DS filled hover pair |

## Layout

```
Position:  fixed, top 0, full width, z-index 1090 (above drawers 1000 and confirm modals 1050, below toasts 1100)
Padding:   16px all sides (--space-m)
Gap:       12px between groups (--space-sm)
Identity:  4px base gap (--space-xs); +4px after the mask (8px), +8px before the avatar (12px), +4px before the name (8px)
Timer:     8px between dot and digits (--space-s)
Button:    8px 16px, 12px on the icon side
Height:    71px — published as --imp-bar-h on body.imp-impersonating
Edge:      1px line + 10px blurred glow below the bar, a gradient of DS hues drifting sideways (8s loop)
```

## States

| State | When | Fill | Dot | Line + glow | Text & icon |
|---|---|---|---|---|---|
| **Normal** | > 5:00 left | `--neutral-900` | `--primary-500` | DS hue spread (primary, quiz colours, warning, success) | as in Anatomy |
| **Warning** | ≤ 5:00 | `--warning-600` | `--warning-300` | warning 300–700 | all `--neutral-25` |
| **Critical** | ≤ 1:00 | `--danger-500` | `--danger-300` | danger 300–700 | all `--neutral-25`, plus a red box-shadow pulse |

> **Known contrast gap:** `--neutral-25` on `--warning-600` is 2.6:1 (below AA). Deliberate design choice so both escalation states read the same; revisit if the bar needs to pass an accessibility audit (`--warning-700` would pass).

A toast accompanies each threshold (5:00 and 1:00) and the end of the session — see `alerts-toast.md` and the copy below.

## Motion

- Live dot: a ring grows from the dot and fades (scale 1 → 2.6, 1.6s, ease-out, infinite).
- Edge line and glow: background drifts sideways, 8s linear, infinite.
- Critical: box-shadow pulse, 1.6s ease-in-out.
- All three stop under `prefers-reduced-motion: reduce`.

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
| Toasts | Impersonation started for {name} - this session is logged · 5 minutes left - impersonation ends automatically after 60 minutes · Less than 1 minute left - impersonation will end automatically · Impersonation ended - you're back as {admin} · Impersonation expired after 60 minutes - you're back as {admin} |
| Locked action tooltip | You can't {action} while impersonating — e.g. "You can't open Admin while impersonating" |
| Audit trail | Impersonation of {name} by {admin} started / ended / expired after 60 minutes · Blocked: {admin} tried to {action} while impersonating · {activity} while impersonating {name} |

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

✓ Keep every value on the type scale and spacing tokens above
✓ Offset any new full-height overlay by `--imp-bar-h`
✗ Don't cover the banner with another layer — the admin must always see they are acting as someone else
✗ Don't add a second action to the bar; ending the session is the only one
