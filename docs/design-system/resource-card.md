---
name: 5mins-resource-card
description: Resource card for 5Mins.ai: a course resource (PDF, Word, Excel, PowerPoint or image file, or an external link) shown as a type tile, title, meta line and one Download or Open link action. Web/Admin and Mobile app variants. Use for any list of course resources, attachments or downloadable files, on the admin course builder or the learner course page.
---

# Resource Card

> **Figma source:** Library `EC26cSVe9KNTCWXvYovakw`. Card set `12213:3040` (Web/Admin Enabled `12213:3062`, Web/Admin Hover `12213:3965`, Mobile app `12213:3041`); Type thumbnail set `12213:2984` (PDF `12213:2985`, Excel `12213:2989`, Word `12213:2993`, PowerPoint `12213:2997`, Image `12213:3001`, External Link `12230:2631`). Verified 2026-09-21 — the set gained Image, and External Link moved to `12230:2631`. Status in Figma: proposed.
> **Component:** `src/components/ResourceCard/ResourceCard.tsx` — use it, don't hand-roll.
> **Model + form:** `src/components/ResourceCard/resources.ts` (types, accepted extensions, 50MB cap, validation) and `src/components/ResourceForm/ResourceForm.tsx` (add or edit one resource — `variant="drawer"` on the course builder, `variant="inline"` in the lesson editor).

> **Updated 2026-09-29 (aligned to prototype usage):** the Mobile type tile is 40px (as in the code and the Anatomy table), not 56px; the code sample section is renamed "Example" so this doc has one Usage section.

> **Updated 2026-09-29 (learner cards):** the whole card downloads or opens on learner surfaces; the mobile card drops the tooltip, since there is no hover on a phone.

## Usage

**Intent:** show one course or lesson resource (a file or an external link) with its type, name and size, and let the learner download or open it in one tap.

**Use when**
- Listing course resources on the learner course page (Resources tab).
- Listing a lesson's resources in the lesson feed's Take a deep dive panel (`device="mobile"`).
- Authoring resources in the admin course builder Resources tab or the lesson editor Resources tab.

**Don't use when**
- The item is a lesson, course, category or skill → use the matching content card ([doc](cards.md))
- You are picking or uploading a file → use `ResourceForm` and its File uploader, which reuses the same tile artwork (`FILE_THUMBS`)

**Do**
- On learner surfaces (no `onRemove`), let the whole card download or open: it does by default when `onOpen` is set. The icon button stays the keyboard and screen-reader target.
- Set `type` to `pdf`, `word`, `excel`, `powerpoint`, `image` or `link`; the tile, meta line and action icon follow from it.
- Pass `size` in bytes for files so the meta reads "PDF • 1.1 MB"; leave it off for links.
- Use `device="web"` on admin and learner web pages, and `device="mobile"` in the app player (the lesson feed).
- Pass `onRemove` only on authoring surfaces; learner surfaces get the single Download or Open link action.
- Set `openDisabled` when there is no file to hand back, so the icon greys but every card keeps its shape.
- In a row with a drag handle or trash, pass a `className` with `flex: 1; min-width: 0` so the card fills the row.

**Don't**
- Don't add a type badge; the tile and meta line already say what the resource is.
- Don't recolour the file tiles or rebuild them from tokens; they are complete artwork.
- Don't put reordering inside the card; it belongs to the row around it.
- Don't give Remove a red fill; the trash icon turns `--text-error` on hover over the usual `--input-background-hover` circle.

**Canonical spec:** tile 48 x 48 web, 40 x 40 mobile; padding `var(--space-sm)` top/bottom/left and `var(--space-m)` right (12px / 16px) on web, `var(--space-sm)` (12px) on mobile; gap `var(--space-sm)` (12px) web, `var(--space-s)` (8px) mobile; radius `var(--radius-sm)` (12px); `--cards-background`, hover `--cards-background-hover`; `var(--shadow-card)`; title Poppins Bold 16px/1.5 web, 14px/1.5 mobile, `--text-primary`; meta `--text-tertiary`; action a 20px icon in a 28px round button (`var(--radius-full)`), `--text-secondary`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, card set `12213:3040` (Web/Admin `12213:3062`, hover `12213:3965`, Mobile `12213:3041`); light / dark split not recorded.

**Prototype:** `src/components/ResourceCard/ResourceCard.tsx`
- `type`: `pdf | word | excel | powerpoint | image | link`
- `title`, `size?` (bytes, files only)
- `device?`: `web` (default) or `mobile`
- `onOpen?`, `openDisabled?`
- `onRemove?`: authoring only, adds Remove beside the open action
- `className?`

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| ResourceCard | _to be mapped by engineering_ | | |

---

## Where it's used

| Surface | Variant | Wrapper |
|---|---|---|
| Admin: Create Course → Resources tab | `device="web"` | Course Content row chrome: drag handle before, trash icon after (`ResourcesTab.tsx`) |
| Learner web app: course page → Resources tab | `device="web"` | Stacked list, 12px gap (`ProgramCourseDetails.tsx`) |
| Admin: content library → lesson editor → Resources tab | `device="web"` | Stacked list, card carries its own Remove (`LessonResourcesTab.tsx`) |
| Learner web app: course page → a lesson's own resources | `device="web"` | Expanded under the lesson row, indented past the thumbnail |
| Learner web app: lesson feed → Take a deep dive panel | `device="mobile"` | Stacked list under the instructor link in the Take a deep dive panel (`LessonFeed.tsx`) — the feed is the app player, so it takes the app card |
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

File tiles are finished artwork with their colours baked in; don't recolour them or rebuild them from tokens. Scale the same SVG to 40px for Mobile.

## Action icon

- **Files:** `ImportCurve` (the product's one download icon, see `iconography.md`).
- **Links:** `ExportSquare`, opening in a new tab.
- Hovering the icon shows the DS Tooltip (`Position=Top, Alignment=Center, Icon=False`) reading "Download" or "Open link", as in the Web/Admin Hover variant. This applies at every size, including `device="mobile"` (also used on desktop For You): every icon control shows a tooltip on hover (Bruno, 2026-09-30).
- Learner cards (no `onRemove`) are clickable end to end; authoring cards with Remove keep icon-only actions so a tap on the row never downloads by accident.
- The button has a visible `:focus-visible` ring (`--primary-button-background`) and an `aria-label` of "Download <title>" or "Open link <title>".
- When there's nothing to download (e.g. an admin's file isn't in the session any more), set `openDisabled`: the icon greys out but stays in place, so every card keeps the same shape.

## Example

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
