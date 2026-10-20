---
name: 5mins-motion
description: 5Mins.ai motion foundations - when to animate (the frequency principle), duration by element type, easing curves, which tool to use (CSS transition, Framer AnimatePresence, Collapse, layoutId), what properties to animate, and reduced motion. Use before adding or changing any animation, transition, hover effect, enter/exit, expand/collapse, or screen swap.
---

# Motion

Motion explains a change: where something came from, where it went, what caused it. It is never decoration for its own sake. Read this before adding or changing any animation in the prototype.

**Code:** no tokens yet; values below are written inline. Helpers: `src/components/Collapse/Collapse.tsx`, `src/components/AIWorkingCard/arrive.ts`, `src/components/ContentSwitcher/ContentSwitcher.tsx` (sliding pill)
**Figma:** none (motion is behaviour; Figma shows start and end frames)
**Last verified:** 2026-10-20

## When to animate

### The frequency principle

Decide how often a person will see the animation, then size it to that.

| How often | Treatment | Examples |
|---|---|---|
| **100+ times a day** | No animation, or drastically reduced (a colour change only) | Table row hover, typing in a field, filtering a list, keyboard navigation in a menu |
| **Occasional** | Standard animation from the duration table | Opening a modal or drawer, expanding a section, moving to the next quiz question |
| **Rare or first time** | Can add delight (a longer or more expressive move) | Completing a course, unlocking a certificate, the AI generating content, onboarding |

### Always animate

- **Screen, phase and step swaps:** wizard steps, drawer phases, the next question. Never hard-swap by conditional mount.
- **Expand and collapse:** any section that opens or closes in place.
- **Items added or removed from a list:** the item enters or leaves and the siblings below glide to their new place.
- **Sliding indicators:** the Content Switcher pill and tab underline move to the new selection.

### Never animate

- Content under a Content Switcher or filter (the same list, filtered): it swaps instantly; only the pill slides.
- A state change faked with opacity (disabled, read-only). States use their tokens; fading is only for elements entering or leaving.
- Anything the person has to wait on to keep working, past the durations below.

## Duration

| Element type | Duration | In the prototype |
|---|---|---|
| Micro-interactions | 100-150ms | Hover fills, button presses, checkbox ticks, icon colour changes (150ms is the house default) |
| Standard UI (tooltips, dropdowns) | 150-250ms | Tooltip, Listbox and Dropdown open, chevron rotation, modal backdrop (200ms) |
| Modals, drawers | 200-300ms | Dialog and Modal (250ms), Side Drawer (300ms), Collapse (300ms) |
| Page transitions | 300-400ms | Screen and step swaps inside a drawer or wizard |

**Rule:** UI animations stay under 300ms. Only page transitions and rare, first-time moments go longer.

### Sanctioned exceptions

These run longer on purpose. Don't copy them into everyday UI.

| Animation | Duration | Why |
|---|---|---|
| Mobile Bottom Sheet rise | in 420ms, out 240ms | Follows the finger; a gesture needs a longer tail-off (see `overlays.md`) |
| AI wait arrival (`ARRIVE`) | 420ms | The wait is the one place motion is the point (see `arrive.ts`) |
| Answer chart bars growing | 520ms, staggered 45ms | A one-off data reveal on the answers page |
| Card thumbnail hover zoom | 300ms | Slow zoom reads as calm; a fast one reads as a jump (see `cards.md`) |

## Easing

| Movement | Curve | Use |
|---|---|---|
| Entering the screen | `ease-out` | Things appearing: tooltips, menus, toasts, a new list item |
| Leaving the screen | `ease-in` | Things disappearing; keep exits shorter than entrances |
| Moving or resizing on screen | `ease-in-out` (GSAP `power2.inOut`) | Drawers, Collapse, anything travelling from A to B |
| Long arrival or zoom | `cubic-bezier(0.22, 1, 0.36, 1)` | The house decelerating curve: AI arrivals, card and image zoom, chart bars |
| Sliding indicator | Framer spring, stiffness 480, damping 38 | Content Switcher pill, any `layoutId` indicator |

Never `linear`, except for progress that tracks real time (a loading bar, a countdown).

## How to set it up

Pick the tool by what is changing.

| What changes | Tool | Pattern to copy |
|---|---|---|
| A property on hover, focus or press | CSS `transition` on that property only | `transition: background 150ms ease;` - never `transition: all` |
| One screen replaces another | Framer `AnimatePresence mode="wait"` keyed by the screen; children use `ARRIVE(reduce)` and `arriveTransition(reduce)`; exit `{ opacity: 0, y: -16 }` | `src/pages/your-courses/components/GenerateAssessmentsDrawer/GenerateAssessmentsDrawer.tsx` |
| A section opens or closes | `<Collapse open={...}>`, content kept mounted | `collapse.md` |
| Items added or removed | `AnimatePresence mode="popLayout"` + `layout` on the items and the siblings below | No example in the prototype yet |
| An indicator slides between options | Framer shared `layoutId` with the spring above | `ContentSwitcher.tsx` |
| An overlay opens | The overlay's own spec | `overlays.md` |

### What to animate

- **Animate `transform` and `opacity`.** They don't trigger layout, so they stay smooth.
- **Don't animate `width`, `height`, `top`, `left` or `margin`** to move things. Height is the one exception, and only through `Collapse` (GSAP), which handles `auto`.
- **Zoom an image inside a clipped frame:** wrap it in an element with `overflow: hidden` and the radius, and scale the image, so it grows inside its corners (course card, quiz image tile).
- **Small distances:** enters rise 8px, exits leave 16px, presses scale to 0.99, hover zooms are 1.12x. Big moves read as slow even at the right duration.

### Reduced motion

Every animation respects `prefers-reduced-motion: reduce`. No exceptions.

- **CSS:** turn the transition or animation off, and reset any hover `transform` to `none`.
- **Framer:** `useReducedMotion()`, then `duration: 0` (or opacity only, as `ARRIVE` does).
- **GSAP:** gate on the media query; `Collapse` already does.

```css
@media (prefers-reduced-motion: reduce) {
  .thing { transition: none; }
  .thing:hover { transform: none; }
}
```

## Checklist

1. How often will people see it? Size it with the frequency principle.
2. Duration from the table; under 300ms unless it is a page transition or a sanctioned exception.
3. Easing by direction: in `ease-out`, out `ease-in`, moving `ease-in-out`.
4. The right tool for what changes; `transform` and `opacity` only.
5. A `prefers-reduced-motion` fallback.
6. Never animate to fake a state, and never animate a filtered view of the same list.
