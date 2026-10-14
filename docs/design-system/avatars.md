---
name: 5mins-avatars
description: Avatar and Avatar Group components for 5Mins.ai. Use when displaying a user or entity photo, a fallback avatar, or a stacked set of member avatars with a "+N" remaining counter - people lists, tables, cards, enrolment lists, team indicators, recipient pickers. Covers all seven avatar sizes (24 to 72px), the picture/fallback variants, and the three group sizes with overlap and counter-bubble specs.
---

# Avatars

A visual representation of a user or entity, alone or stacked in a group with a "+N" overflow counter.

**Code:** `import Avatar from '@/components/Avatar/Avatar'` and `import AvatarGroup from '@/components/AvatarGroup/AvatarGroup'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, board `5453:37805`; Avatar dark `5097:5884` / light `11914:2605`; Avatar Group dark `5097:5584` / light `11915:3296`
**Last verified:** 2026-09-29

Identical structure in both modes; borders, fallback and counter colours are semantic tokens that resolve per mode (see `colors.md`).

## Usage

**Intent:** puts a face (or the fallback smiley) to a person, alone or as a stacked group with a "+N" count, so the admin can see who at a glance.

**Use when**
- Showing the person in a table row, beside their name and role
- Showing who is enrolled or involved as a compact stacked group with a "+N" overflow
- Showing a person in a profile header or detail panel (48 to 72px)

**Don't use when**
- The person is a selection the admin can remove → Chip with `iconLeft` ([doc](chips-switcher-tabs.md))
- The image is a content thumbnail, not a person → table thumbnail `.tbl-thumb` ([doc](table.md))

**Do**
- Use the shared `Avatar` / `AvatarGroup` components; never hand-roll a circle `<img>` or an initials chip
- In table rows, put a 32 or 40px `<Avatar>` inside the `.tbl-media` cell
- When there is no photo, show the Library fallback smiley at the same size: a `var(--border)` circle with a `var(--text-tertiary)` smile
- Use `alt=""` (or `aria-hidden` on a group) when the name or count is already written beside it
- Show at most 3 avatars plus "+N" (the Figma pattern), with the true remaining count in the bubble
- Give every avatar in a group a 1px `var(--page-background)` ring, so it blends with the surface behind
- Size by density: 24 for dense lists and chips, 32 for table rows, 40 for prominent rows and headers, 48 to 72 for profile views and detail panels
- Use group size 24 in dense table cells, 32/40 where the group is the row's focus

**Don't**
- Don't add a border to a standalone avatar; the ring is group-only
- Don't use squares or other radii; avatars are always fully circular
- Don't scale the counter text independently; it is bound to the group size (8/10/12px)
- Don't mix avatar sizes within one group
- Don't use initials or a coloured letter chip as the fallback; the Library has no initials variant
- Don't hard-code the fallback colours; the smiley's circle and smile flip with the mode

**Canonical spec:** sizes 24, 32, 40, 48, 56, 64, 72px; radius `var(--radius-full)`; photo `object-fit: cover`; fallback smiley circle `var(--border)`, smile `var(--text-tertiary)`; group sizes 24 / 32 / 40px with overlap -8 / -12 / -16px; ring 1px `var(--page-background)`; "+N" bubble `var(--border)` (ring 0.5px at 24px) with `var(--text-tertiary)` Regular text 8 / 10 / 12px. Figma: Library `EC26cSVe9KNTCWXvYovakw`, board `5453:37805`, Avatar light `11914:2605` / dark `5097:5884`, Avatar Group light `11915:3296` / dark `5097:5584`.

## Figma to code

**Avatar** (`5097:5884`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Size | 24px / 32px / 40px / 48px / 56px / 64px / 72px | `size` | `24` / `32` (default) / `40` / `48` / `56` / `64` / `72` | Figma uses "24px" strings and defaults to 72px; code takes numbers and defaults to 32 |
| Picture | true / false | `src` | URL set / omitted | omit `src` and the fallback smiley renders |

**Avatar group** (`5097:5584`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Size | 24px / 32px / 40px | `size` | `24` (default) / `32` / `40` | pass the same `size` to the `<Avatar>` children |
| (none) | "+N" is fixed layer text | `remaining` | number, default `0` | renders the "+N" bubble when above 0 |

- **Figma only:** none. (The Library's separate `Emojies` set has no code component; `Avatar` renders the smiley fallback.)
- **Code only:** `alt` and `className` on Avatar; `remaining`, `ariaLabel`, `className` and the `--avatar-group-ring` custom property on AvatarGroup; children may be wrapped (e.g. in a Tooltip).

**Avatar props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | none | Photo URL. Omit it and the fallback smiley renders (Figma's `Picture=false`) |
| `size` | `24 \| 32 \| 40 \| 48 \| 56 \| 64 \| 72` | `32` | Diameter in px |
| `alt` | `string` | `''` | Leave empty when the name is written beside the avatar |
| `className` | `string` | none | Extra class on the wrapper |

**AvatarGroup props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `24 \| 32 \| 40` | `24` | Diameter of each avatar; pass the same `size` to the `<Avatar>` children |
| `children` | `<Avatar>` × up to 3 | none | Shown avatars (Figma shows 3), optionally wrapped |
| `remaining` | `number` | `0` | True count not shown; renders the "+N" bubble when above 0 |
| `ariaLabel` | `string` | none | Names the group; without it the group is `aria-hidden` |

On a surface other than the page, set the ring with a page class: `--avatar-group-ring: var(--cards-background)`.

The CSS classes in Anatomy (`.avatar`, `.avatar-group*`) are the spec sketch; the components use `ds-avatar*` / `ds-avatar-group*`.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Avatar / Avatar Group | _to be mapped by engineering_ | | |

## Anatomy

### Avatar

```
Shape:      circle, border-radius var(--radius-full) (Figma token `100`)
Sizes:      24, 32, 40, 48, 56, 64, 72 px  (all on the 4px/8px grid)
Picture:    <img> fills the circle, object-fit: cover
Fallback:   Library smiley fills the circle: circle var(--border), smile var(--text-tertiary)
            (light #DFE1E6 / #656B7C, dark #2D313D / #9EA4B3)
```

No border on standalone avatars; the border only appears inside a group.

```css
.avatar {
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}
/* size via width/height: 24/32/40/48/56/64/72 */
```

### Avatar group

A horizontal stack of avatars with a trailing "+N" counter bubble.

- **Stacking:** each avatar overlaps the next via `margin-right: -8/-12/-16px`; earlier avatars sit **on top** (the first avatar is frontmost). The group sets a descending `z-index` on each item.
- **Separator border:** every avatar in a group gets a `1px solid var(--page-background)` ring so overlapping edges read cleanly against any surface.
- **Counter bubble ("Num remaining"):** same diameter as the avatars; `background: var(--border)`; same `--page-background` ring (1px, 0.5px at 24px); text `+N` in Poppins Regular, `color: var(--text-tertiary)`, centred; no overlap margin (it's the last element).

```css
.avatar-group {
  display: flex;
  align-items: center;
}

.avatar-group .avatar {
  border: 1px solid var(--page-background);
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

/* size-specific */
.avatar-group--24 .avatar { width: 24px; height: 24px; margin-right: -8px; }
.avatar-group--32 .avatar { width: 32px; height: 32px; margin-right: -12px; }
.avatar-group--40 .avatar { width: 40px; height: 40px; margin-right: -16px; }

.avatar-group__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: 1px solid var(--page-background);
  background: var(--border);
  color: var(--text-tertiary);
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  flex-shrink: 0;
}

.avatar-group--24 .avatar-group__count { width: 24px; height: 24px; font-size: 8px;  line-height: 1.5; border-width: 0.5px; }
.avatar-group--32 .avatar-group__count { width: 32px; height: 32px; font-size: 10px; line-height: 1.5; }
.avatar-group--40 .avatar-group__count { width: 40px; height: 40px; font-size: 12px; line-height: 1.2; }
```

## Variants

| Variant | Figma | Renders |
|---|---|---|
| Picture | `Picture=true` | the photo, `object-fit: cover` |
| Fallback | `Picture=false` | the Library smiley: `var(--border)` circle, `var(--text-tertiary)` smile |

## Sizes

**Avatar:** 24, 32, 40, 48, 56, 64, 72px (size guidance in Usage).

**Avatar group:**

| Size | Overlap (negative margin) | Counter font size / line-height |
|---|---|---|
| 24px | -8px | 8px / 1.5 |
| 32px | -12px | 10px / 1.5 |
| 40px | -16px | 12px / 1.2 (Paragraph S) |

## States

Display only: avatars and groups have no hover, pressed, disabled or focus state in Figma or code. The only variation is Picture versus Fallback (see Variants).

## Tokens

| Token | Light mode | Dark mode | Used for |
|---|---|---|---|
| `--page-background` | Neutral-25 `#F9F9FA` | Neutral-800 `#20222A` | Group separator ring (1px) |
| `--border` | Neutral-100 `#DFE1E6` | Neutral-700 `#2D313D` | "+N" counter bubble background; fallback smiley circle |
| `--text-tertiary` | Neutral-400 `#656B7C` | Neutral-300 `#9EA4B3` | "+N" counter text; fallback smiley smile |
| `--radius-full` (Figma `100`) | n/a | n/a | Border radius (fully circular) |

## Accessibility

- `alt` names the photo; leave it empty (`alt=""`) when the person's name is already written beside the avatar.
- `AvatarGroup` with `ariaLabel` gets `role="img"` and that name (e.g. "12 learners enrolled"); without it the group is decorative and `aria-hidden`, for when the count is written beside it.
- The fallback smiley is `aria-hidden`.

## Examples

```tsx
import Avatar from '@/components/Avatar/Avatar'
import AvatarGroup from '@/components/AvatarGroup/AvatarGroup'

// Single avatar: photo, or the fallback smiley when there is none
<Avatar src={person.photo} size={32} />

// Group: at most 3 shown, the true remaining count in the bubble
<AvatarGroup size={24} remaining={enrolled.length - 3} ariaLabel={`${enrolled.length} learners enrolled`}>
  {enrolled.slice(0, 3).map(p => <Avatar key={p.id} src={p.photo} size={24} />)}
</AvatarGroup>
```

## Related

- [colors.md](colors.md) - the semantic tokens above
- [table.md](table.md) - avatar and avatar-group table cells (`<Avatar>` in `.tbl-media`)
- [chips-switcher-tabs.md](chips-switcher-tabs.md) - Chip with `iconLeft` for removable people
