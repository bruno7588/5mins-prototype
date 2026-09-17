---
name: 5mins-resource-card
description: Resource card for 5Mins.ai: a course resource (PDF, Word, Excel or PowerPoint file, or an external link) shown as a type tile, title, meta line and one Download or Open link action. Web/Admin and Mobile app variants. Use for any list of course resources, attachments or downloadable files, on the admin course builder or the learner course page.
---

# Resource Card

> **Figma source:** Library `EC26cSVe9KNTCWXvYovakw`. Card set `12213:3040` (Web/Admin Enabled `12213:3062`, Web/Admin Hover `12213:3965`, Mobile app `12213:3041`); Type thumbnail set `12213:2984` (PDF `12213:2985`, Excel `12213:2989`, Word `12213:2993`, PowerPoint `12213:2997`, External Link `12213:3001`). Verified 2026-09-17. Status in Figma: proposed.
> **Component:** `src/components/ResourceCard/ResourceCard.tsx` — use it, don't hand-roll.

---

## Where it's used

| Surface | Variant | Wrapper |
|---|---|---|
| Admin: Create Course → Resources tab | `device="web"` | Course Content row chrome: drag handle before, trash icon after (`ResourcesTab.tsx`) |
| Learner web app: course page → Resources tab | `device="web"` | Stacked list, 12px gap (`ProgramCourseDetails.tsx`) |
| Mobile app | `device="mobile"` | Not placed on a screen yet |

The card carries **one action only**: Download for files, Open link for links. Delete and reorder belong to the admin row around it, not the card. There is no type badge: the tile and meta line already say what kind of resource it is.

## Props

```tsx
type ResourceType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'link'

interface ResourceCardProps {
  type: ResourceType
  title: string
  size?: number             // bytes, files only → "PDF • 1.1 MB"
  device?: 'web' | 'mobile' // default 'web'
  onOpen?: () => void       // download the file / open the link
  openDisabled?: boolean    // greys the action (e.g. no file to hand back yet)
  className?: string
}
```

Helpers exported from the same file: `resourceMeta(type, size?)` ("PDF • 1.1 MB", "External link") and `formatSize(bytes)`.

## Anatomy

`[type tile] [title / meta] [action icon]`, vertically centred.

| | Web/Admin | Mobile app |
|---|---|---|
| Width | fills its container (900 in Figma) | 344 in Figma |
| Padding | 12 top, 16 right, 12 bottom, 12 left (`--space-sm` / `--space-m`) | 12 all sides (`--space-sm`) |
| Gap | 12 (`--space-sm`) | 8 (`--space-s`) |
| Radius | 12 (`--radius-sm`) | 12 (`--radius-sm`) |
| Background | `--cards-background`; Hover `--cards-background-hover` | `--cards-background`; no hover (touch) |
| Shadow | `--shadow-card` (Shadow S in light mode, none in dark) | same |
| Type tile | 48 × 48 | 56 × 56 |
| Title | Poppins Bold 16 / 1.5, `--text-primary`, one line with ellipsis | Bold 14 / 1.5, `--text-primary`, wraps |
| Meta | Regular 14 / 1.5, `--text-tertiary` | Regular 12 / 1.2, `--text-tertiary` |
| Title → meta gap | 4 (`--space-xs`) | 4 (`--space-xs`) |
| Action | 20px Iconsax Linear in a 28px round button (4px padding, `--space-xs`), `--text-secondary`; on hover `--text-primary` on an `--input-background-hover` fill (`12215:4063`) plus the Tooltip | 24px icon, no fill (touch) |

## Type tiles

| Type | Tile | Meta label |
|---|---|---|
| PDF | `src/assets/resource-type-illustrations/pdf.svg` (red tile, finished artwork) | `PDF • <size>` |
| Word | `word.svg` (blue) | `Word • <size>` |
| Excel | `excel.svg` (green) | `Excel • <size>` |
| PowerPoint | `powerpoint.svg` (orange) | `PowerPoint • <size>` |
| External link | `link-icon.svg` (Linear link-2 glyph, 24px) centred on a `--certificate-quiz` tile with `--radius-s` | `External link` |

File tiles are finished artwork with their colours baked in; don't recolour them or rebuild them from tokens. Scale the same SVG to 56px for Mobile.

## Action icon

- **Files:** `ImportCurve` (the product's one download icon, see `iconography.md`).
- **Links:** `ExportSquare`, opening in a new tab.
- Hovering the icon shows the DS Tooltip (`Position=Top, Alignment=Center, Icon=False`) reading "Download" or "Open link", as in the Web/Admin Hover variant.
- The button has a visible `:focus-visible` ring (`--primary-button-background`) and an `aria-label` of "Download <title>" or "Open link <title>".
- When there's nothing to download (e.g. an admin's file isn't in the session any more), set `openDisabled`: the icon greys out but stays in place, so every card keeps the same shape.

## Usage

```tsx
import ResourceCard from '@/components/ResourceCard/ResourceCard'

<ResourceCard
  type="pdf"
  title="Resources that everyone should know"
  size={1153434}
  onOpen={() => download(resource)}
/>
```

In a row with other chrome (drag handle, trash), let the card fill the space: `flex: 1; min-width: 0` on a class passed through `className`.
