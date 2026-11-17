---
name: 5mins-summary-stat
description: Summary stat tile, a bordered tile with one headline number (icon, label, value, optional info tooltip) in a Stacked or Inline layout, plus a Mobile variant for the app; use for KPI rows at the top of a page or tab.
---

# Summary stat

A bordered tile that shows one headline number, for KPI rows at the top of a page or tab.

**Code:** `import StatTile from '@/components/StatTile/StatTile'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `12636:76`, on the **Cards** page under "Summary stats" (one component set; light and dark come from the variable modes on the parent frame)
**Last verified:** 2026-11-17

## Usage

- **Use when:** a page or tab opens with 3 or 4 headline numbers (completion rate, people enrolled, overdue).
- **Stacked** (default): the main KPI row. **Inline**: a compact row where vertical space is tight, such as above a table or inside a tab.
- **Mobile** (`device="mobile"`): the mobile app. Always Stacked, with a smaller icon, label and value so two tiles sit side by side; lay them out two per row with a 16px gap. There is no Inline tile on mobile: it is wider than half the screen.
- **Don't use** for a number inside a table or card; write it as text there.
- **Do** pick an icon that carries meaning and colour it by it (success, warning, danger, primary).
- **Don't** put more than one value in a tile; use `sub` for a small qualifier ("of 40", "+12 this month").
- **Canonical spec:** 12px 16px padding, 1px `--border`, 12px radius, no fill (sits on the page ground). Pages lay tiles out in their own row or grid.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Layout | Stacked / Inline | `layout` | `'stacked'` (default) / `'inline'` | |
| Device | Desktop / Mobile | `device` | `'desktop'` (default) / `'mobile'` | Mobile exists for Stacked only; `device="mobile"` ignores `layout` |
| Label (text) | label | `label` | `ReactNode` | |
| Value (text) | value | `value` | `ReactNode` | |
| Icon (instance) | any Iconsax Linear glyph | `icon` | `ReactNode` | the tile sizes it |
| Info icon | shown | `tooltip` | `ReactNode` | the icon shows only when `tooltip` is set; its text opens in a DS Tooltip |

- **Figma only:** none.
- **Code only:** `labelMeta` (quieter text after the label, e.g. "(Nov)"), `sub` + `subTone` (small text after the value; `success` colours it as a positive change), `className`.

## Anatomy

| | Stacked | Inline | Mobile (Stacked) |
|---|---|---|---|
| Order | icon, then a column of label row over value | icon, value, label row on one line | as Stacked |
| Gap | 12px (`--space-sm`) | 8px (`--space-s`) | 12px (`--space-sm`) |
| Icon | 32px | 24px | 24px (an illustration image too) |
| Label | Regular 14/1.5 | Regular 14/1.5 | Paragraph S, Regular 12/1.2 |
| Value | H2, Bold 24/1.5 | H3, Bold 20/1 | H3, Bold 20/1.5 |
| Width in Figma | 280 | 280 | 164 (half a 375px screen) |

- **Label row:** label Poppins Regular 14/1.5 (12/1.2 on Mobile) `--text-tertiary`, then the 16px info icon, 4px gap. The mobile app has no hover, so leave `tooltip` unset there or give the tile its own info button (`trailing`) that opens a Bottom Sheet.
- **Value:** `--text-primary`, tabular numbers, no wrapping. In Stacked, `sub` sits after it on the baseline, 8px gap.
- **Sub:** Regular 12/1.2 `--text-tertiary`; `success` tone is Medium `--text-success`.

## States

Static: no hover, focus or disabled state. Only the info icon is interactive (see [alerts-toast.md](alerts-toast.md) for the Tooltip).

## Tokens

`var(--border)`, `var(--radius-sm)`, `var(--space-sm)`, `var(--space-m)`, `var(--space-s)`, `var(--space-xs)`, `var(--text-primary)`, `var(--text-tertiary)`, `var(--text-success)`, `var(--font-size-h2)`, `var(--font-size-h3)`, `var(--font-size-md)`, `var(--font-size-sm)`.

## Accessibility

- Plain text; the label reads before the value in Stacked, after it in Inline.
- The info icon is a focusable Tooltip trigger with a visible focus ring.
- The icon is decorative; the label carries the meaning.

## Content

Sentence case labels, two or three words ("Completed", "Overdue"). Values are short: a number, a % or a count.

## Examples

```tsx
import StatTile from '@/components/StatTile/StatTile'
import { TickCircle } from 'iconsax-react'

<StatTile
  icon={<TickCircle color="var(--success-500)" variant="Linear" />}
  label="Completed"
  value="62%"
  tooltip="Share of enrolled people who passed"
/>
<StatTile layout="inline" icon={<TickCircle color="var(--success-500)" variant="Linear" />} label="Completed" value="62%" />
{/* Mobile app: two per row, 16px gap */}
<StatTile device="mobile" icon={<TickCircle color="var(--success-500)" variant="Linear" />} label="Completed" value="62%" />
```

## Related

[cards.md](cards.md), [table.md](table.md), [alerts-toast.md](alerts-toast.md)
