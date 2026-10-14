---
name: 5mins-impersonation-banner
description: Impersonation session banner (DES-337) - the full-width bar fixed to the top of the learner app while an admin impersonates a user. Anatomy, type, spacing, the normal/warning/critical states, motion, page offsets and accessibility. Use when changing the banner or anything that must sit below it.
---

# Impersonation banner

The bar that stays fixed to the top of the app for the whole of an impersonation session. It tells the admin who they are acting as, how long is left, and gives them one way out.

**Code:** no shared component in `src/components`: `src/impersonation/ImpersonationBar.tsx` + `.css`, driven by `ImpersonationContext.tsx`; locked actions use `src/impersonation/ImpersonationLock.tsx`
**Figma:** People file (not the Library): Normal `9600:43180`, Warning `9601:44620`, Critical `9601:46094`; End button light `9616:47761` / dark `9584:28195`
**Last verified:** 2026-09-15

## Usage

**Intent:** keep the admin aware, at all times, that they are acting as someone else, show how long the session has left and give one way out.

**Use when**
- An impersonation session is live in the learner app. `ImpersonationBar` renders only while a person is being impersonated.
- Building any full-height fixed layer reachable from the learner app: it must start below the bar (see "Page offsets").
- Showing an action that is not allowed while impersonating: use `ImpersonationLock` (see "Locked actions").

**Don't use when**
- Announcing the 5:00 and 1:00 thresholds, or the session ending → toasts ([doc](alerts-toast.md))

**Do**
- Keep every value on the type scale and spacing tokens below; the End button's neutral fill and padding are its only overrides.
- Offset any new full-height overlay by `--imp-bar-h`.

**Don't**
- Don't cover the banner with another layer; the admin must always see they are acting as someone else.
- Don't add a second action to the bar; ending the session is the only one.

### Behaviour

- Only registered users who aren't admins can be impersonated.
- While impersonating, the learner side menu's Admin item is locked (see "Locked actions") and the profile card shows the impersonated person's name and role.
- Clicking the timer jumps to 5:03 → 1:03 → 60:00. This is a prototype review shortcut, kept in deployed builds on purpose; remove before production.

### Locked actions (not allowed while impersonating)

The reference implementation is the learner side menu's **Admin** item (`src/components/AdminMenuItem`), built on `src/impersonation/ImpersonationLock.tsx`. **One pattern for every case:** a single link or button, or every field and control of a whole form (password, notification settings); each locked control gets the same treatment below. There is no separate form-level variant.

| | Treatment |
|---|---|
| Visibility | The control stays in place, never hidden, so the page matches what the learner sees |
| State | Disabled look (`--text-disabled` label and icon, `cursor: not-allowed`, no hover fill), `aria-disabled="true"`, **not** the native `disabled` attribute, so it stays in the tab order |
| Reason | DS Tooltip (no info icon) on hover **and** keyboard focus: "You can't {action} while impersonating". Position it where it doesn't cover the control's neighbours (Right for a side-menu item), 4px from the control's own edge; anchor to the control itself, not a full-width row |
| Click | Swallowed (nothing happens, no toast) and recorded in the audit trail as "Blocked: {admin} tried to {action} while impersonating" |
| Outside a session | The control renders untouched |

For a whole form, wrap each field and its submit button in its own `ImpersonationLock`, with an action that names that field ("change their password", "change their notification settings"), so every control explains itself on hover and focus. Don't add a form-level Callout: one pattern means the admin learns it once, on the Admin item, and recognises it everywhere.

## Figma to code

The Figma frames are screens in the People file, not a Library component set, so there are no component properties. The states map to the session phase:

| Figma frame | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Banner state | Normal / Warning / Critical | `phase` (from `useImpersonation()`, not a prop) | `'normal'` / `'warning'` / `'critical'` | class `.imp-bar--warning`, `.imp-bar--critical`; derived from the remaining time |
| Person | avatar + name + role | `person` (context) | `{ name, role, avatarImg }` | |
| Timer | `mm:ss` | `remaining` (context) | seconds | formatted with tabular digits |
| End Impersonation | button | `exit` (context) | `() => void` | |

`ImpersonationLock` props: `action: string` (verb phrase read into "You can't {action} while impersonating"), `children: (locked: boolean) => ReactNode`, `position?: 'Top' | 'Bottom' | 'Left' | 'Right'` (default `'Top'`), `className?: string`.

- **Figma only:** none.
- **Code only:** `skipAhead` (the timer review shortcut); `ImpersonationLock` and its props.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Impersonation banner | _to be mapped by engineering_ | | |

## Anatomy

Left to right. The bar is a flex row with `justify-content: space-between`: the identity group sits at the far left, the session group at the far right, and the space between them flexes with the viewport.

| Group | Part | Spec |
|---|---|---|
| Identity (gap 12px) | Prefix (gap 8px) | `ImpersonateIcon` 20px + "Impersonating", Paragraph M regular (14 / 400 / 1.5) |
| | Person (gap 8px) | 24px DS `Avatar` ([doc](avatars.md)) + label |
| | Label (gap 4px) | Name, Paragraph M semibold (14 / 600 / 1.5) + "· {role}", Paragraph S regular (12 / 400 / 1.2) |
| Session (gap 16px) | Timer (gap 4px) | 16px dot slot + `mm:ss`, Paragraph M regular, tabular digits, 5ch minimum width |
| | End Impersonation | DS medium Filled button with `Logout` 20px, a neutral fill and tighter padding (8px top/bottom, 12px left, 16px right; 37px tall), the same in every state (below) |

Every text colour and the mask icon use the state's foreground colour.

### Layout

```
Position:  fixed, top 0, full width, z-index 1090 (above drawers 1000 and confirm modals 1050, below toasts 1100)
Padding:   12px top/bottom (--space-sm), 24px sides (--space-l)
Height:    61px (12px + the 37px End button + 12px) - published as --imp-bar-h on body.imp-impersonating
Background: the state tint layered over --page-background, so the fixed bar stays opaque over scrolling content
```

### Page offsets

While a session is live `body.imp-impersonating` is set, and everything that would otherwise start at the top of the viewport starts at `var(--imp-bar-h)`:

- body `padding-top`, the learner `.mt-topnav` and admin `.topnav`
- full-height overlays: `.side-drawer` (except the header-anchored Add Content drawer), `.overlay-backdrop`, `.lf-overlay`, `.confirm-modal-overlay`, `.pcd-quizstage`; confirm modals also cap their max-height by the bar height

Any new full-height fixed layer reachable from the learner app must join this list.

## States

| State | When | Background tint | Text + mask | Dot |
|---|---|---|---|---|
| **Normal** | > 5:00 left | Primary-500 @ 16% | `--text-progress` | `--text-progress` |
| **Warning** | ≤ 5:00 | Warning-500 @ 24% | `--text-warning` | `--text-warning` |
| **Critical** | ≤ 1:00 | Danger-500 @ 24% | `--text-error` | centre `--text-error`, ring `--danger-300` |

The End Impersonation button is DS Filled with a neutral fill in all three states: Neutral-800 fill + Neutral-25 label and icon in light mode, Neutral-25 fill + Neutral-800 label in dark (Figma `9616:47761` light, `9584:28195` dark). Hover and pressed are the DS primary Filled states (`--primary-button-background-hover` / `-pressed`). Warning buttons mean "caution" and Danger buttons mean "destructive", but ending the session is the safe, recommended exit. The tint, text, dot and toasts carry the urgency; the button stays constant so the way out never changes.

The text tokens are theme-aware (light: Primary-700 / Warning-600 / Danger-500; dark: Primary-500 / Warning-500 / Danger-400). The state switches instantly on the tick that crosses the threshold, and a toast announces 5:00 and 1:00; see `alerts-toast.md` and the copy below.

Locked controls: see "Locked actions" (disabled look, `aria-disabled`, Tooltip on hover and focus).

### Motion

- Live dot: an 8px dot centred in a 16px slot; a ring of the same colour grows from it (scale 1 → 2, opacity 0.35 → 0, 1.6s ease-out, infinite).
- Under `prefers-reduced-motion: reduce` the ring stops, shown still at full size and 35% opacity.
- No other animation: no gradient line, glow or shadow pulse.

## Tokens

- Text and mask: `var(--text-progress)`, `var(--text-warning)`, `var(--text-error)`; critical dot ring `var(--danger-300)`.
- Background: state tint over `var(--page-background)`.
- End button hover / pressed: `var(--primary-button-background-hover)` / `var(--primary-button-background-pressed)`.
- Spacing: `var(--space-sm)` (12px) top/bottom, `var(--space-l)` (24px) sides.
- Offset: `var(--imp-bar-h)`.
- Locked controls: `var(--text-disabled)`.

## Accessibility

- The bar is `role="status"` with `aria-live="polite"`.
- Locked controls use `aria-disabled="true"`, not the native `disabled` attribute, so they stay in the tab order and their Tooltip shows on keyboard focus as well as hover.
- The live dot ring stops under `prefers-reduced-motion: reduce`.
- The banner is never covered by another layer.

## Content

One vocabulary for the whole feature: **impersonation** started / ended / expired. No em dashes in UI text; toasts join clauses with " - " and carry no trailing period; " · " separates metadata (name · role, time · date). Button labels are Title Case.

| Where | Text |
|---|---|
| Row menu | Impersonate user - disabled with supporting text "Not available for admins" / "Available once they've signed up" |
| Confirm button | Start Impersonation |
| Banner | Impersonating · End Impersonation |
| Toasts | Impersonating {name} · 5 minutes left · Less than 1 minute left · Impersonation ended · Impersonation expired |
| Locked action tooltip | You can't {action} while impersonating, e.g. "You can't open Admin while impersonating" |
| Audit log entries (recorded in session state; no UI in the prototype) | Impersonation of {name} by {admin} started / ended / expired after 60 minutes · Blocked: {admin} tried to {action} while impersonating · {activity} while impersonating {name} |

## Examples

```tsx
<ImpersonationLock action="change their email">
  {(locked) => (
    <Button variant="outlined" aria-disabled={locked || undefined} className={locked ? 'ui-disabled' : undefined} onClick={openEmailForm}>
      Change Email
    </Button>
  )}
</ImpersonationLock>
```

## Related

- [alerts-toast.md](alerts-toast.md): threshold toasts and the Tooltip
- [buttons.md](buttons.md): Filled button states
- [navigation.md](navigation.md): learner side menu and TopNav offsets
- [overlays.md](overlays.md): drawers and modals that take the offset
- [avatars.md](avatars.md): the 24px avatar
