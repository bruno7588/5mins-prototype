---
name: 5mins-resource-card
description: Resource card for 5Mins.ai: a course resource (PDF, Word, Excel, PowerPoint or image file, or an external link) shown as a type tile, title, meta line and one Download or Open link action. Web/Admin and Mobile app variants. Use for any list of course resources, attachments or downloadable files, on the admin course builder or the learner course page.
---

# Resource Card

> **Figma source:** Library `EC26cSVe9KNTCWXvYovakw`. Card set `12213:3040` (Web/Admin Enabled `12213:3062`, Web/Admin Hover `12213:3965`, Mobile app `12213:3041`); Type thumbnail set `12213:2984` (PDF `12213:2985`, Excel `12213:2989`, Word `12213:2993`, PowerPoint `12213:2997`, Image `12213:3001`, External Link `12230:2631`). Verified 2026-09-21 — the set gained Image, and External Link moved to `12230:2631`. Status in Figma: proposed.
> **Component:** `src/components/ResourceCard/ResourceCard.tsx` — use it, don't hand-roll.
> **Model + form:** `src/components/ResourceCard/resources.ts` (types, accepted extensions, 50MB cap, validation) and `src/components/ResourceForm/ResourceForm.tsx` (add or edit one resource — `variant="drawer"` on the course builder, `variant="inline"` in the lesson editor).

---

## Where it's used

| Surface | Variant | Wrapper |
|---|---|---|
| Admin: Create Course → Resources tab | `device="web"` | Course Content row chrome: drag handle before, trash icon after (`ResourcesTab.tsx`) |
| Learner web app: course page → Resources tab | `device="web"` | Stacked list, 12px gap (`ProgramCourseDetails.tsx`) |
| Admin: content library → lesson editor → Resources tab | `device="web"` | Stacked list, card carries its own Remove (`LessonResourcesTab.tsx`) |
| Learner web app: course page → a lesson's own resources | `device="web"` | Expanded under the lesson row, indented past the thumbnail |
| Learner web app: lesson feed → Resources action | `device="mobile"` | Stacked list in the feed's right panel (`LessonFeed.tsx`) — the feed is the app player, so it takes the app card |
| Mobile app | `device="mobile"` | Not placed on a screen yet |

Lesson-level resources (DES-334) are authored only in the content library's lesson editor and stored in `src/data/lessonResources.ts`; the course builder's Resources tab stays course-level.

The card carries **one action** for learners: Download for files, Open link for links. Where an admin authors resources it can take a second, `onRemove`, which puts a Remove (trash) beside it inside the card; the trash turns `--text-error` on hover. Reordering still belongs to the row around the card (the course builder's Resources tab), not to the card. There is no type badge: the tile and meta line already say what kind of resource it is.

## Props

```tsx
type ResourceType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image' | 'link'

interface ResourceCardProps {
  type: ResourceType
  title: string
  size?: number             // bytes, files only → "PDF • 1.1 MB"
  device?: 'web' | 'mobile' // default 'web'
  onOpen?: () => void       // download the file / open the link
  openDisabled?: boolean    // greys the action (e.g. no file to hand back yet)
  onRemove?: () => void     // authoring surfaces only: adds Remove beside the open action
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
| Background | `--cards-background`; Hover `--cards-background-hover` | same — hover is gated on `@media (hover: hover)`, not on the variant |
| Shadow | `--shadow-card` (Shadow S in light mode, none in dark) | same |
| Type tile | 48 × 48 | 40 × 40 |
| Title | Poppins Bold 16 / 1.5, `--text-primary`, one line with ellipsis | Bold 14 / 1.5, `--text-primary`, one line with ellipsis |
| Meta | Regular 14 / 1.5, `--text-tertiary` | Regular 12 / 1.2, `--text-tertiary` |
| Title → meta gap | 4 (`--space-xs`) | 4 (`--space-xs`) |
| Action | 20px Iconsax Linear in a 28px round button (4px padding, `--space-xs`), `--text-secondary`; on hover `--text-primary` on an `--input-background-hover` fill (`12215:4063`) plus the Tooltip | same 20px icon and 28px button; the button is invisible at rest, so it reads as Figma's bare icon |
| Actions gap | 8 (`--space-s`) between the open action and Remove | same |

## Type tiles

| Type | Tile | Meta label |
|---|---|---|
| PDF | `src/assets/resource-type-illustrations/pdf.svg` (red tile, finished artwork) | `PDF • <size>` |
| Word | `word.svg` (blue) | `Word • <size>` |
| Excel | `excel.svg` (green) | `Excel • <size>` |
| PowerPoint | `powerpoint.svg` (orange) | `PowerPoint • <size>` |
| Image | `image.svg` (purple `#9B55C9`, Iconsax **Linear** `gallery` glyph at 1.5 stroke — the one tile whose glyph is stroked, not solid) | `Image • <size>` |
| External link | `link-icon.svg` (Linear link-2 glyph, 24px) centred on a `--certificate-quiz` tile with `--radius-s` | `External link` |

Accepted extensions per type live in `RESOURCE_TYPES` (`resources.ts`): `.pdf` · `.doc,.docx` · `.xls,.xlsx` · `.ppt,.pptx` · `.jpg,.jpeg,.png` (shown to admins as `.jpg or .png` via `acceptLabel`).

The same artwork (exported as `FILE_THUMBS`) shows at 40px in the Resources drawer's File uploader once a file is picked (`fileIcon`, Create Course Figma `9979:86223`).

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
