# Program Certificate

Figma-verified (2026-07). Nodes: **Locked** `2495:20734`, **Unlocked card** `2510:23596` (the issued document itself is `2504:51984`, opened/downloaded via the card). File `vZnrpDkWeiDM259uLeY396`.
Implementation: `src/pages/programs/components/ProgramCertificate/`.

The learner-facing certificate at the bottom of a program (`ProgramDetails`, the "Certification" section). It has **two states only — Locked and Unlocked** — there is no expired state.

## Gating rule

The certificate is **Unlocked when every course in the program is complete AND passed** (a course is passed when its pass score is met). A single failed *or* still-incomplete course keeps it **Locked**. There is no separate "withheld/failed" certificate visual — a failure simply leaves the certificate Locked, and the failed **course card** surfaces the fix (see Failed → Retake below).

```ts
const certificateUnlocked = outline.length > 0 && outline.every((c) => c.status === 'completed')
```

## Locked state (`2495:20734`)

Compact card, 280 × 175, `1.5px var(--border)`, radius 12, `var(--cards-background)`.
- Circular 56px badge (`--page-background-hover` fill) with a Bold `Lock` icon (`--neutral-400`).
- Bold-14 title "Earn your Program certificate" (`--text-secondary`).
- Two skeleton lines (`--cards-background-hover`, 8px tall, radius 3): 133px + 107px.

## Unlocked state — "Get Certificate" card (`2510:23596`)

A compact horizontal card (not the full document): `--cards-background`, radius 12, Shadow-S, `16px` padding, `16px` gap.
- 72px medallion (`certificate/medallion.svg` — a transparent cyan star).
- Bold-16 "Certificate of Completion" (`--text-primary`), flex-fill.
- Filled-primary **"Get Certificate"** button (`--primary-button-background` / `-hover`, `--text-button-foreground`).

The `onGetCertificate` handler downloads/opens the issued document (`2504:51984`). The full-document artifact is kept in Figma; the app surface is just this card.

## Related: Failed → Retake course card

Introduced alongside this feature (`ProgramDetails` course card):
- **`failed`** course status → error **"Failed"** badge (`STATUS_BADGE.failed`).
- **`retake`** course state → **DS Danger-outlined** "Retake" CTA (`.pd-course__cta--retake`) routing to the course. Retake is **course-level** — there is no program-level retake.
