# Program certificate

The learner-facing certificate at the bottom of a program (`ProgramDetails`, the "Certification" section). It has **two states only, Locked and Unlocked**; there is no expired state.

**Code:** no shared component yet: page-local `src/pages/programs/components/ProgramCertificate/ProgramCertificate.tsx` (default export)
**Figma:** feature file `vZnrpDkWeiDM259uLeY396` (not the Library), **Locked** `2495:20734`, **Unlocked card** `2510:23596` (the issued document itself is `2504:51984`, opened/downloaded via the card)
**Last verified:** 2026-07

## Usage

**Intent:** show the learner whether the program certificate is earned, and let them get it once it is.

**Gating rule:** the certificate is **Unlocked when every course in the program is complete AND passed** (a course is passed when its pass score is met). A single failed *or* still-incomplete course keeps it **Locked**. There is no separate "withheld/failed" certificate visual: a failure simply leaves the certificate Locked, and the failed **course card** surfaces the fix (see Related: Failed → Retake course card).

```ts
const certificateUnlocked = outline.length > 0 && outline.every((c) => c.status === 'completed')
```

**Do**
- Derive `unlocked` from the gating rule above.
- Keep the app surface to the compact card; the full-document artefact is kept in Figma.

**Don't**
- Don't add an expired, withheld or failed certificate state.
- Don't add a program-level retake; retake is course-level.

## Figma to code

| Figma frame | Figma state | React prop | Prop values | Notes |
|---|---|---|---|---|
| Locked `2495:20734` | Locked | `unlocked` | `false` | |
| Unlocked card `2510:23596` | Unlocked | `unlocked` | `true` | |
| Issued document `2504:51984` | n/a | `onGetCertificate` | `() => void` | downloads/opens the issued document |

- **Figma only:** the issued certificate document `2504:51984` (not rendered in the app).
- **Code only:** `lockedTitle` (defaults to "Earn your Program certificate"; a course passes its own), `medallion` (defaults to the program medallion; a course passes its own); omitting `onGetCertificate` leaves the CTA out rather than rendering a button that does nothing (mobile).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Program certificate | _to be mapped by engineering_ | | |

## Anatomy

### Locked (`2495:20734`)

Compact card, 280 × 175, `1.5px var(--border)`, radius 12, `var(--cards-background)`.
- Circular 56px badge (`--page-background-hover` fill) with a Bold `Lock` icon (`--neutral-400`).
- Bold-14 title "Earn your Program certificate" (`--text-secondary`).
- Two skeleton lines (`--cards-background-hover`, 8px tall, radius 3): 133px + 107px.

### Unlocked, "Get Certificate" card (`2510:23596`)

A compact horizontal card (not the full document): `--cards-background`, radius 12, Shadow-S, `16px` padding, `16px` gap.
- 72px medallion (`certificate/medallion.svg`, a transparent cyan star).
- Bold-16 "Certificate of Completion" (`--text-primary`), flex-fill.
- Filled-primary **"Get Certificate"** button (`--primary-button-background` / `-hover`, `--text-button-foreground`).

The `onGetCertificate` handler downloads/opens the issued document (`2504:51984`). The full-document artefact is kept in Figma; the app surface is just this card.

## States

| State | Surface | Content |
|---|---|---|
| Locked | `var(--cards-background)`, `1.5px var(--border)` | Lock badge, `--text-secondary` title, skeleton lines |
| Unlocked | `var(--cards-background)`, Shadow-S | medallion, `--text-primary` title, Get Certificate button |
| Get Certificate hover | `var(--primary-button-background-hover)` | |
| Get Certificate focus-visible | 2px `var(--primary-button-background)` outline, offset 2px | |

## Accessibility

- The lock badge, skeleton lines and medallion are decorative (`aria-hidden`).
- "Get Certificate" is a native `<button>` with a visible focus-visible ring.

## Related

- `gamification.md` - certificate illustrations
- `badges.md` - the "Failed" badge
- `buttons.md` - the filled-primary and Danger-outlined buttons

### Failed → Retake course card

Introduced alongside this feature (`ProgramDetails` course card):
- **`failed`** course status → error **"Failed"** badge (`STATUS_BADGE.failed`).
- **`retake`** course state → **DS Danger-outlined** "Retake" CTA (`.pd-course__cta--retake`) routing to the course. Retake is **course-level**; there is no program-level retake.
