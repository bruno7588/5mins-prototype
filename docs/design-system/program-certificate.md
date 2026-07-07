# Program Certificate

Figma-verified (2026-07). Nodes: **Locked** `2495:20734`, **Unlocked / issued document** `2504:51984` (file `vZnrpDkWeiDM259uLeY396`).
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

## Unlocked state (`2504:51984`)

The issued certificate **document** — a white "paper" artifact. It intentionally uses the **raw neutral palette** (`--neutral-0` bg, `--neutral-800` title/name, `--neutral-400` eyebrows, `--neutral-500` date) because those tokens **do not flip** between themes — so the certificate stays light in both light and dark mode.

- Fixed **975 × 558** proportions (`aspect-ratio: 975/558`); the whole document scales with **container-query units (`cqw`)** so every element stays proportional at any width (capped `max-width: 720px`).
- Ornamental full-bleed border (SVG), 120px medallion, then:
  - eyebrow "Program Certificate" (14) + Bold-32 program title
  - eyebrow "Issued to" (14) + Bold-20 learner name
  - footer: "Date of issue" + date (left) · customer org logo (center) · "Powered by" 5Mins logo (right)
- Below the document: a **filled-primary "Download Certificate"** button (theme-aware — it is app UI, not the paper).

## Related: Failed → Retake course card

Introduced alongside this feature (`ProgramDetails` course card):
- **`failed`** course status → error **"Failed"** badge (`STATUS_BADGE.failed`).
- **`retake`** course state → **DS Danger-outlined** "Retake" CTA (`.pd-course__cta--retake`) routing to the course. Retake is **course-level** — there is no program-level retake.
