---
name: 5mins-colour-field
description: Colour field for 5Mins.ai - an Outlined-input-styled field showing a swatch and hex value, a trailing eyedropper where supported, and a popover picker (saturation/brightness square, hue slider, hex input). Use for any single brand or theme colour choice.
---

# Colour field

Picks one colour as a `#rrggbb` hex value, for tenant branding such as the Edit theme modal.

**Code:** `import ColourField from '@/components/ColourField/ColourField'` (`src/components/ColourField/ColourField.tsx` + `ColourField.css`, helpers in `colour.ts`)
**Figma:** none yet. **Source: production Edit theme recording (2026-10-19); pending the Library component, not Figma-verified.**
**Last verified:** 2026-10-19

## Usage

**Intent:** lets an admin set an exact colour by eye (picker or eyedropper) or by value (hex).

**Use when**
- A setting stores one colour, such as the header bar, navigation or selected menu item colour of a tenant theme.

**Don't use when**
- The user picks from a fixed set of colours → use Chips ([doc](chips-switcher-tabs.md)) or a Dropdown ([doc](dropdown.md))
- The value is free text → use InputField ([doc](input.md))

**Do**
- Always pass `label`; it renders as the standard field label (14px / 600, `--text-secondary`).
- Hold edits as a draft in the parent when the colours are applied together (Apply / Cancel).

**Don't**
- Don't offer RGB or HSL formats; HEX is the only format, shown as a static box, not a dropdown.
- Don't restyle the field chrome; it follows the Outlined input states.

**Canonical spec:** field padding `var(--space-s) var(--space-sm)`, radius `var(--radius-sm)`, border `--border-elevated`, hover `--border-hover` + `--input-background`, active and open `--selected`. Swatch 20px, radius `var(--radius-xs)`, 1px `--border-elevated`; value 14px / 400 lowercase `--text-primary`; 8px gap. Eyedropper 20px `Colorfilter` icon in a 28px circular hover target. Popover 264px, 4px below the field, `--cards-background`, 1px `--border-elevated`, radius `var(--radius-sm)`, padding `var(--space-sm)`, gap `var(--space-sm)`, `var(--shadow-l)`. Square 160px tall, radius `var(--radius-s)`; hue track 12px, fully rounded; handles 16px with a 2px white ring and `var(--shadow-s)`.

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Label | text | `label` | `string` | required |
| Value | hex | `value` | `#rrggbb` | displayed lowercase |
| n/a | n/a | `onChange` | `(hex: string) => void` | fires while dragging, on arrow keys, on a valid typed hex and on an eyedropper pick |
| n/a | n/a | `id` | `string` | id of the field trigger; defaults to a generated one |

- **Figma only:** none (no Library component yet).
- **Code only:** all props.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| ColourField | _to be mapped by engineering_ | | |

## Anatomy

```
.colour-field
├─ label.colour-field__label
├─ .colour-field__control          Outlined input chrome
│  ├─ button.colour-field__trigger  swatch + hex value, opens the popover
│  └─ button.colour-field__dropper  only when window.EyeDropper exists, with a Tooltip
└─ .colour-field__popover          role="dialog"
   ├─ .colour-field__square        role="slider" saturation (x) and brightness (y)
   ├─ .colour-field__hue           role="slider" 0-360
   └─ .colour-field__hex-row       static "HEX" box + InputField
```

The popover renders inside the field (not portalled) so it stays inside a modal's focus trap. It opens towards the end edge when it would run past the dialog or window.

## States

| State | Visual | Tokens |
|---|---|---|
| Enabled | Border | `--border-elevated` |
| Hover | Border and tint | `--border-hover`, `--input-background` |
| Active / open | Amber border | `--selected` (mode-aware) |
| Eyedropper hover | Circular tint | `--input-background` |
| Focus-visible | 2px ring, 2px offset on the eyedropper, square and hue slider; the field shows the active border | `--primary-button-background`, `--selected` |
| Popover open | Fades and drops 4px in over 150ms; no motion with reduced motion | |

## Tokens

`var(--border-elevated)`, `var(--border-hover)`, `var(--input-background)`, `var(--input-background-elevated)`, `var(--selected)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--cards-background)`, `var(--shadow-l)`, `var(--shadow-s)`, `var(--primary-button-background)`. The square and hue gradients are the colour model itself and stay raw (commented `stylelint-disable` lines).

## Accessibility

- The trigger is a button labelled by the field label, with `aria-haspopup="dialog"` and `aria-expanded`.
- Square and hue are `role="slider"` with `aria-valuetext` ("Saturation 40%, brightness 80%", "Hue 210 degrees"). Arrow keys step 1, Shift + arrow steps 10.
- Escape closes the popover (without closing a surrounding modal) and returns focus to the field; an outside click closes it.
- The eyedropper button's Tooltip text equals its `aria-label` ("Pick colour from screen"). It is hidden where the EyeDropper API is unsupported (Safari, Firefox).
- The hex input is labelled "<label> hex value".

## Content

- Labels in sentence case: "Header bar", "Navigation menu items", "Selected menu item".
- Hex values display lowercase with the leading `#`.

## Examples

```tsx
<ColourField label="Header bar" value={set.header} onChange={(hex) => update('header', hex)} />
```

## Related

- [input.md](input.md) - Outlined input states the field follows
- [listbox.md](listbox.md) - the elevated surface the popover uses
- [overlays.md](overlays.md) - the Modal that hosts it in Edit theme
