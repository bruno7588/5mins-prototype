---
name: 5mins-empty-state
description: Empty State component for 5Mins.ai — centered illustration + title + supporting copy + CTA pair. Use when a list, table, tab, folder, search result, or content area has nothing to show yet, or to prompt a first action (upload content, create a course, invite people).
---

# 5Mins.ai Empty State

A centered composition shown when a content area has nothing to display — always paired with the action(s) that fill it.

Spec source: Figma Library (`EC26cSVe9KNTCWXvYovakw`) — light `11921:5779` / dark `5452:37234` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`).

> **Updated 2026-09-29 (verified against code):** the CTA rule now matches code: a single action may be the outlined button alone (Resources), a pair is outlined then filled (Content); the loading rule is softened, since there is no shared skeleton component.

---

## Usage

**Intent:** tells the admin that an area has nothing in it yet, and hands them the action that fills it.

**Use when**
- A list, table, tab, folder or search result has nothing to show
- A course builder area is empty and the admin fills it by adding content (use `surface="dropzone"`)
- Prompting a first action, such as adding content or resources

**Don't use when**
- Content is loading → a loading placeholder instead (there is no shared skeleton component; Roles uses a page-local one)
- Something failed → Alert ([doc](alerts-toast.md)) or a dialog ([doc](overlays.md))

**Do**
- Use the shared `EmptyState`
- Use a real 72px illustration from the Library "Illustrations Empty state" set, chosen for the context
- Include the action that fills the area when the admin can fix the emptiness themselves: one action on its own as `secondaryAction` (outlined, e.g. `ResourcesTab.tsx`), or a pair of outlined `secondaryAction` then filled `primaryAction` (e.g. `ContentList.tsx`)
- Use `surface="dropzone"` only for an area the admin fills by adding or dropping content
- Pass `device="mobile"` inside the phone frame
- Write a short, stateful title, a benefit-led description of one or two lines, and Title Case CTA labels
- Centre it in the space the missing content would occupy

**Don't**
- Don't hand-roll a page-level empty block with its own title and button styles
- Don't wrap the plain empty state in card chrome (border or fill); only the dropzone surface has a fill
- Don't scale or redraw the illustration
- Don't stack more than two CTAs

**Canonical spec:** padding `var(--space-l)` (24px), `var(--space-xl)` (32px) on the dropzone; gap `var(--space-ml)` (20px); info gap `var(--space-s)` (8px); illustration 72 × 72px; title 20px Bold `var(--text-primary)` (16px on mobile); description 14px Regular `var(--text-secondary)`, max width 600px; CTA gap `var(--space-m)` (16px); radius `var(--radius-ml)` (20px); dropzone fill `var(--input-background)` with a 2px dashed `DashedBorder` outline. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11921:5779` / dark `5452:37234` (mobile `5452:37381`).

**Prototype:** `src/components/EmptyState/EmptyState.tsx`
- `title` (required), `description`, `illustration` (72px node)
- `primaryAction` (filled) and `secondaryAction` (outlined, renders first): `{ label, onClick, icon? }`
- `device`: `desktop` (default) | `mobile`
- `surface`: `plain` (default) | `dropzone` (code-only extension)

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Empty State | _to be mapped by engineering_ | | |

---

## Anatomy (top → bottom, all centered)

```
        [ illustration 72×72 ]

         Empty state title          ← Poppins Bold 20 (H3), --text-primary
   Supporting copy, max 600px wide  ← Poppins Regular 14, --text-secondary
                                       centered, benefit-oriented
   [ Outlined Button ] [ Filled Button ]   ← optional CTA row, 16px gap
```

## Visual Spec (Desktop)

| Property | Value |
|---|---|
| Layout | column, centered, `padding: 24px`, `gap: 20px` (`--space-ml`) |
| Radius | 20px (`--radius-ml`) — relevant when the empty state sits in its own container |
| Illustration | 72 × 72 px slot (swappable per context; Figma ships a neutral placeholder) |
| Info block | `gap: 8px`; title H3 Bold 20 `--text-primary`; description Regular 14 `--text-secondary`, **max-width 600px**, centered |
| CTA row | `gap: 16px` — outlined primary + filled primary Medium buttons (see `buttons.md`); one or both optional |

## Visual Spec (Mobile)

Figma-verified 2026-07-13 (variant `Device=Mobile`, dark node `5452:37381`). Used in the mobile app prototype (phone-frame).

Differences from desktop — everything else (illustration 72px, info gap 8px, CTA row 16px gap, Medium buttons, radius 20px, tokens) is identical:

| Property | Desktop | Mobile |
|---|---|---|
| Width | hug content | 375px in Figma; fill the parent in code |
| Padding | 24px | **16px** |
| Container gap | 20px | **16px** |
| Title | Bold 20 (H3) | **Bold 16 (H4)** |
| Description | max-width 600px | full container width |

## Illustrations

The illustration slot swaps in one of 33 flat slate/blue-gray vector illustrations from the `Illustrations Empty state` set (node `9120:8372`; all 72×72 except Share at 120×72; the default `null` placeholder is a solid `#5e6780` square). Pick by context:

Certificates `9120:8373` · Pie chart `9120:8385` · Empty box `9120:8397` · Search `9120:8404` · Share `9120:8413` · No bookmarks `9120:8416` · No automations `11635:3750` · Connect brain `9120:8425` · No likes `9120:8452` · Not following `9120:8468` · Cloud `9120:8483` · UFO `9120:8493` · Party `9120:8506` · Flashcards `9120:8528` · Custom Fields `11511:9958` · Computer screen `9120:8540` · Calendar `9120:8556` · Rocket `9120:8643` · Message `9120:8664` · Buble `9120:8671` · No results `9120:8715` · No activity `11637:3786` · No internet `9120:8719` · Skill level `9120:8733` · Add users `9120:8805` · No playlists `9120:8837` · Add `9565:9506` · Category `9878:20389` · Quiz `10254:8479` · Resources `11058:291` · Deactivated `11497:12646` · HRIS mapping `11765:570` · Programs `11887:19`

Download the SVG from Figma per context when a page needs one; don't redraw them.

## Implementation

One shared component, `src/components/EmptyState/EmptyState.tsx`, carries both device variants — **use it, don't hand-roll**. Desktop is the default; pass `device="mobile"` inside the phone frame.

```tsx
<EmptyState
  illustration={<img src={resourcesIllustration} width={72} height={72} alt="" />}
  title="Add resources to your course"
  description="Upload PDF, Word, Excel, PowerPoint or image files, or add links."
  secondaryAction={{ label: 'Add Resource', icon: <Add size={20} color="currentColor" />, onClick: add }}
/>
```

| Prop | Purpose |
|---|---|
| `illustration` | 72×72 node from the set below |
| `title` / `description` | Bold-20 (Bold-16 on mobile) / Regular-14 |
| `secondaryAction` | outlined button, renders BEFORE the primary |
| `primaryAction` | filled button — the action that fills the empty area |
| `device` | `desktop` (default) \| `mobile` — the Figma `Device` variant |
| `surface` | `plain` (default) \| `dropzone` — see below |

### `surface="dropzone"` — code-only extra

Not a Figma variant. Puts the empty state on `--input-background` inside a dashed outline, for an area the admin fills themselves (the course builder's Content and Resources tabs, the lesson editor's Resources tab). The outline is a `DashedBorder` overlay rather than `border: dashed`, because CSS gives no control over dash length or the space between dashes.

## CSS

```css
.empty-state {
  position: relative;               /* anchors the dropzone outline */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-l);          /* 24px */
  gap: var(--space-ml);             /* 20px */
  border-radius: var(--radius-ml);  /* 20px */
  text-align: center;
}

.empty-state__illustration { width: 72px; height: 72px; flex-shrink: 0; }

.empty-state__info { display: flex; flex-direction: column; align-items: center; gap: var(--space-s); }

.empty-state__title {
  margin: 0;
  font: 700 20px/1.5 'Poppins', sans-serif;
  color: var(--text-primary);
}

.empty-state__description {
  margin: 0;
  max-width: 600px;
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-secondary);
}

.empty-state__cta { display: flex; gap: var(--space-m); justify-content: center; }
```

## Content guidelines

- **Title:** short and stateful ("No courses yet", "Nothing assigned"), not apologetic.
- **Description:** sell the action's benefit — the Figma example copy is benefit-led ("…drives a 38% boost in information retention"). One or two lines, never more than the 600px measure.
- **CTA labels:** Title Case, 1–3 words; with a pair, the filled button is the action that fills the empty area.
- Swap the illustration per context (courses, people, folders); keep it at 72px.

## Do / Don't

✓ Center the empty state in the space the missing content would occupy  
✓ Include the action that fills the area when the user can fix the emptiness themselves (outlined alone, or outlined + filled)  
✗ Don't use it for loading (show a loading placeholder) or errors (use alerts/dialogs)  
✗ Don't scale the illustration or stack more than two CTAs  

## Related Skills

- `buttons.md` — the outlined/filled Medium buttons in the CTA row
- `5mins-colors` (colors.md) — text tokens
- `layout.md` — the 20px radius and the spacing scale
