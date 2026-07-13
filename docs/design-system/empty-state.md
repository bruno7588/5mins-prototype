---
name: 5mins-empty-state
description: Empty State component for 5Mins.ai — centered illustration + title + supporting copy + CTA pair. Use when a list, table, tab, folder, search result, or content area has nothing to show yet, or to prompt a first action (upload content, create a course, invite people).
---

# 5Mins.ai Empty State

A centered composition shown when a content area has nothing to display — always paired with the action(s) that fill it.

Spec source: Figma Library — light `11921:5779` / dark `5452:37234` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`).

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

Figma-verified 2026-07-13 (variant `Device=Mobile`, dark node `5452:37381`). Used in the mobile app prototype (phone-frame). Implemented as the shared component `src/components/mobile/EmptyState` — use it, don't hand-roll.

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

## CSS

```css
.empty-state {
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

## React TypeScript

```tsx
import { ReactNode } from 'react';

interface EmptyStateProps {
  illustration?: ReactNode;      // 72×72 graphic for the context
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };  // outlined, renders BEFORE primary
}

export function EmptyState({ illustration, title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      {illustration && <div className="empty-state__illustration">{illustration}</div>}
      <div className="empty-state__info">
        <h3 className="empty-state__title">{title}</h3>
        {description && <p className="empty-state__description">{description}</p>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="empty-state__cta">
          {secondaryAction && (
            <button className="btn-outlined" onClick={secondaryAction.onClick}>{secondaryAction.label}</button>
          )}
          {primaryAction && (
            <button className="btn-primary" onClick={primaryAction.onClick}>{primaryAction.label}</button>
          )}
        </div>
      )}
    </div>
  );
}
```

## Content guidelines

- **Title:** short and stateful ("No courses yet", "Nothing assigned"), not apologetic.
- **Description:** sell the action's benefit — the Figma example copy is benefit-led ("…drives a 38% boost in information retention"). One or two lines, never more than the 600px measure.
- **CTA labels:** Title Case, 1–3 words; the filled button is the action that fills the empty area.
- Swap the illustration per context (courses, people, folders); keep it at 72px.

## Do / Don't

✓ Center the empty state in the space the missing content would occupy  
✓ Include at least the filled CTA when the user can fix the emptiness themselves  
✗ Don't use it for loading (use skeletons) or errors (use alerts/dialogs)  
✗ Don't scale the illustration or stack more than two CTAs  

## Related Skills

- `buttons.md` — the outlined/filled Medium buttons in the CTA row
- `5mins-colors` (colors.md) — text tokens
