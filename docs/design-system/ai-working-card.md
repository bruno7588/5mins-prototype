---
name: 5mins-ai-working-card
description: AI working card for 5Mins.ai - the unframed list of passes an AI task has done (ticked) and the one running now (AI icon, shimmering label). Use whenever the product waits on AI generation or reading (questions, assessments, insights, certificate reading) and the output will land in the same place.
---

# AI working card

The "AI is working" placeholder: the passes that have happened, ticked, and the one running now, with the AI icon beside it and its label shimmering. It says where the work has got to, never what comes next.

**Code:** `import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, page "AI working card" `12634:2`: AI working card `12634:131`, AI working step `12634:69`
**Last verified:** 2026-11-10

## Usage

**Intent:** keep the admin oriented during an AI wait by naming the pass that is running, in the spot where the result will appear.

**Use when**
- AI generates or reads something the user is waiting for: questions, assessments, insights, certificate reading.

**Don't use when**
- The wait is a plain load with nothing to name → a skeleton or spinner
- The work runs in the background while the user does something else → a Toast with `ToastSpinner` ([doc](alerts-toast.md))

**Do**
- Render it where the output will land; it doubles as the placeholder.
- Name each pass as what it is doing ("Writing the questions"); the running pass gets a trailing "…" in code.
- Use `detail` for what the running pass is on right now ("From "Food safety essentials"").
- Pass `lastStepDone={false}` when the last line is the work itself, so it keeps the AI icon until it reports back.

**Don't**
- Don't list passes still to come; the card shows only what has happened and what is happening.
- Don't add a progress bar or a timer; neither can say how far along the work is.
- Don't frame it in a card; it sits unframed in the body that is waiting.

**Canonical spec:** rows 8px apart, min height 28px; icon slot 16px wide, one text line tall; 16px icons (tick `Success-500`, AI icon with the Primary to Blaze quiz gradient); icon to label 8px (6px on passes behind the work); label Paragraph M 14 (Medium on the running pass); detail Paragraph S 12, `--text-tertiary`, 4px under the label.

## Figma to code

**AI working card** (`12634:131`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| State | Working / Done | `activeStep`, `lastStepDone` | Working: `activeStep` before the last step. Done: `activeStep` on the last step with `lastStepDone` | |
| (rows) | step instances | `steps` | `string[]` | every step up to `activeStep` is shown |

**AI working step** (`12634:69`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| State | Done / Active / Complete | derived | Done: before `activeStep`. Active: `steps[activeStep]` while working. Complete: last step once finished | |
| Label (text) | step text | `steps[i]` | string | code adds "…" to the running pass |
| Detail (text) + Show detail | detail line | `detail` | string | running pass only |

- **Figma only:** none.
- **Code only:** `singleLine` (only the current pass, each new one replacing the last), `className`; the shimmer animation and the AI icon moving between passes (Figma shows one still frame).

## States

| State | Icon | Label | Gap icon to label |
|---|---|---|---|
| Done (behind the work) | 16px tick, `Success-500` | Regular, `--text-tertiary` | 6px (`--space-xss`) |
| Active | 16px AI icon, gradient | Medium, `--text-primary`, shimmer | 8px (`--space-s`) |
| Complete (terminal) | 16px tick, `Success-500` | Regular, `--text-primary` | 8px (`--space-s`) |

**Shimmer:** the running label (and detail) carry a moving gradient clipped to the text: base, base 30%, `--text-button-outlined` 45%, `--blaze-quiz` 55%, base 70%, base; 200% wide, 1.6s linear loop. Base is `--text-primary` on the label, `--text-tertiary` on the detail. Under reduced motion the text is the plain base colour.

## Tokens

| Token | Used for |
|---|---|
| `--text-primary` | running and terminal labels; shimmer base |
| `--text-tertiary` | passes behind the work; detail line |
| `--success-500` | tick |
| `--text-button-outlined`, `--blaze-quiz` | AI icon gradient and shimmer band |
| `--space-s`, `--space-xss`, `--space-xs` | row and icon gaps, detail offset |

## Accessibility

- The step list is `role="status"` with `aria-live="polite"`, so a screen reader hears the current pass, not every tick.
- Icons are decorative.

## Examples

```tsx
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'

<AIWorkingCard
  steps={['Reading the lesson', 'Writing the questions', 'Adding the answer options', 'All done, your questions are ready']}
  activeStep={step}
  detail={`From "${lessonTitle}"`}
/>
```

## Related

- [motion.md](motion.md) - the arrive and shimmer timings
- [buttons.md](buttons.md) - the AI button gradient
