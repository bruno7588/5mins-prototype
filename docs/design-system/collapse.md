---
name: 5mins-collapse
description: Collapse for 5Mins.ai - the animated expand/collapse container that eases content open and closed with a GSAP height and opacity tween instead of mounting or unmounting it. Use when building any accordion, expandable section, "show more" region, disclosure panel, or content that appears and disappears in place.
---

# Collapse

An invisible wrapper that opens and closes its children in place. It tweens height and opacity with GSAP on an ease-in-ease-out curve, so the page around it moves smoothly instead of jumping.

Spec source: Figma: not recorded; code is the reference (`src/components/Collapse/Collapse.tsx`).

## Usage

**Intent:** let content appear and disappear in place without the layout snapping, so the user can see what opened and where it went.

**Use when**
- An accordion or expandable section (a filters panel, a guidelines list, a "show more" row of cards).
- A form field or block that appears when a toggle or radio changes (a schedule section, a custom score stepper).
- A status region that comes and goes and would otherwise shove the page (an AI working card).

**Don't use when**
- Showing a panel over the page → use a drawer, modal or dialog ([doc](overlays.md))
- Showing a floating menu or tooltip → use Dropdown, Listbox or Tooltip ([doc](listbox.md), [doc](alerts-toast.md))
- Animating between two non-zero heights (e.g. a one-row chip strip that wraps to several rows) → Collapse only goes to 0; tween the height with GSAP directly, as `SaveReportDrawer` does

**Do**
- Wrap the content in `<Collapse open={...}>` and keep it in the tree; let `open` drive it.
- Give the trigger `aria-expanded` and a visible `:focus-visible` style.
- Rotate the trigger chevron 180° when open, with a short CSS transition, and turn that transition off under `prefers-reduced-motion`.
- Keep the default 0.3s duration unless there is a reason not to.
- Put spacing on an inner element, not on the Collapse wrapper itself, so it closes fully to 0.

**Don't**
- Don't hard mount and unmount expandable content (`{open && <Panel />}`); it snaps in and out.
- Don't hand-roll a `grid-template-rows: 0fr` / `1fr` transition or measure heights yourself for a plain open/close.
- Don't add your own `aria-hidden` or `inert` to the content; Collapse sets both while closed.

**Canonical spec:** GSAP `height` 0 ↔ `auto` and `opacity` 0 ↔ 1, ease `power2.inOut`, duration 0.3s; `overflow: hidden` while animating and closed, cleared once open. First render sets the state with no animation. Figma: Library `EC26cSVe9KNTCWXvYovakw`, node not recorded.

**Prototype:** `src/components/Collapse/Collapse.tsx`
- `open: boolean` (required) - expanded when true, height 0 when false.
- `children: ReactNode` - the content; it stays mounted.
- `duration?: number` - seconds, default `0.3`.
- `className?: string` - class on the wrapper.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Collapse | _to be mapped by engineering_ | | |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | required | `true` expands to the content's natural height; `false` collapses to 0. |
| `children` | `ReactNode` | required | Content to show and hide. Always mounted. |
| `duration` | `number` | `0.3` | Tween length in seconds. |
| `className` | `string` | none | Extra class on the wrapper `div`. |

## Anatomy and behaviour

- **Wrapper:** a single `div` with no styling of its own. Everything visual belongs to the children.
- **First render:** no animation. If `open` is false the wrapper is set to `height: 0; opacity: 0; overflow: hidden`; if true, `height: auto; opacity: 1`.
- **Opening:** kills any running tween, then animates to `height: auto`, `opacity: 1` with `overflow: hidden`. When the tween ends, the inline `overflow` is cleared so focus rings and menus inside are not clipped.
- **Closing:** animates to `height: 0`, `opacity: 0`, `overflow: hidden`.
- **Interrupting:** toggling mid-tween starts the new tween from the current height, so rapid clicks don't jump.
- **Accessibility:** while closed the wrapper has `aria-hidden="true"` and `inert`, so hidden buttons and inputs can't take keyboard focus or be read out. The trigger is the caller's; give it `aria-expanded`.
- **Reduced motion:** Collapse does not check `prefers-reduced-motion` today; the tween always runs. Callers only switch off their own chevron transitions.

### Example

```tsx
import Collapse from '@/components/Collapse/Collapse'

<button
  type="button"
  className={`new-lesson-guidelines__toggle${open ? ' new-lesson-guidelines__toggle--open' : ''}`}
  aria-expanded={open}
  onClick={() => setOpen((o) => !o)}
>
  Guidelines
  <ArrowDown2 size={20} color="var(--text-secondary)" />
</button>
<Collapse open={open}>
  <ul className="new-lesson-guidelines__list">...</ul>
</Collapse>
```

## Code reality

Used in 15 files (22 instances), e.g. the Learning Records filters panel, the Save report drawer, the New lesson guidelines, Set completed, Insights and Summary cards. Places that still open and close without it:

| File | What it does instead |
|---|---|
| `src/components/LeftSidebar/LeftSidebar.tsx` | Sub-menus mount and unmount instantly (`{peopleOpen && ...}`) |
| `src/pages/your-courses/components/WorkflowsTab/WorkflowsTab.css` | `grid-template-rows: 0fr` / `1fr` transition on `.workflow-card__collapsible` |
| `src/pages/people/components/BulkUploadModal/BulkUploadModal.css` | `grid-template-rows: 0fr` / `1fr` transition on `.bulk-upload-accordion-panel` |

## Related docs

- `overlays.md` - drawers, modals and dialogs, for content that sits over the page
- `navigation.md` - sidebar groups, which should expand with Collapse
- `iconography.md` - the `ArrowDown2` chevron used on triggers
