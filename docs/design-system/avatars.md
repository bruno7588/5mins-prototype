---
name: 5mins-avatars
description: Avatar and Avatar Group components for 5Mins.ai. Use when displaying a user or entity photo, a fallback avatar, or a stacked set of member avatars with a "+N" remaining counter — people lists, tables, cards, enrolment lists, team indicators, recipient pickers. Covers all seven avatar sizes (24–72px), the picture/fallback variants, and the three group sizes with overlap and counter-bubble specs.
---

# 5Mins.ai Avatar & Avatar Group

A visual representation of a user or entity, alone or stacked in a group with a "+N" overflow counter.

Spec source: Figma Library — Avatar light `11914:2605` / dark `5097:5884`, Avatar Group light `11914:2656` / dark `5097:5584` (verified 2026-07-03). Identical structure in both modes; borders and counter colors are semantic tokens that resolve per mode (see `colors.md`).

---

## Avatar

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `24 \| 32 \| 40 \| 48 \| 56 \| 64 \| 72` | `72` | Diameter in px |
| `picture` | `boolean` | `true` | Photo (object-cover) vs fallback |
| `src` | `string` | — | Photo URL when `picture` |

### Visual Spec

```
Shape:      circle — border-radius: 100px (Figma token `100`; --radius-full works too)
Sizes:      24, 32, 40, 48, 56, 64, 72 px  (all on the 4px/8px grid)
Picture:    <img> fills the circle, object-fit: cover
Fallback:   emoji/graphic asset fills the circle (Figma ships a gradient smiley)
```

- No border on standalone avatars — the border only appears inside a group.
- Size guidance: 24 for dense lists and chips · 32 for table rows · 40 for prominent rows and headers · 48–72 for profile views and detail panels.

```css
.avatar {
  border-radius: 100px;
  object-fit: cover;
  flex-shrink: 0;
}
/* size via width/height: 24/32/40/48/56/64/72 */
```

> **Code reality:** the app already uses this pattern — `.avatar-32` / `.avatar-40` in `src/components/Table/Table.css` (radius 100px, object-cover). Elsewhere the app falls back to **two-letter initials chips** (e.g. recipients autocomplete, `src/data/orgUsers.ts` `initials`) instead of the Figma emoji graphic — an accepted code extension for prototype data without photos.

---

## Avatar Group

A horizontal stack of avatars with a trailing "+N" counter bubble.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `24 \| 32 \| 40` | `24` | Diameter of each avatar |
| `avatars` | `{ src?, fallback? }[]` | — | Shown avatars (Figma shows 3) |
| `remaining` | `number` | — | Count for the "+N" bubble |

### Visual Spec

| Size | Overlap (negative margin) | Counter font size / line-height |
|---|---|---|
| 24px | −8px | 8px / 1.5 |
| 32px | −12px | 10px / 1.5 |
| 40px | −16px | 12px / 1.2 (Paragraph S) |

- **Stacking:** each avatar overlaps the next via `margin-right: -8/-12/-16px`; earlier avatars sit **on top** (first avatar is frontmost, DOM order with no z-index tricks — later siblings render underneath the negative margin of the previous).
- **Separator border:** every avatar in a group gets a `1px solid var(--page-background)` ring so overlapping edges read cleanly against any surface.
- **Counter bubble ("Num remaining"):** same diameter as the avatars; `background: var(--page-background-hover)`; same 1px `--page-background` border; text `+N` in Poppins Regular, `color: var(--text-tertiary)`, centered; no overlap margin (it's the last element).

### CSS

```css
.avatar-group {
  display: flex;
  align-items: center;
}

.avatar-group .avatar {
  border: 1px solid var(--page-background);
  border-radius: 100px;
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
  border-radius: 100px;
  border: 1px solid var(--page-background);
  background: var(--page-background-hover);
  color: var(--text-tertiary);
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  flex-shrink: 0;
}

.avatar-group--24 .avatar-group__count { width: 24px; height: 24px; font-size: 8px;  line-height: 1.5; }
.avatar-group--32 .avatar-group__count { width: 32px; height: 32px; font-size: 10px; line-height: 1.5; }
.avatar-group--40 .avatar-group__count { width: 40px; height: 40px; font-size: 12px; line-height: 1.2; }
```

### React TypeScript

```tsx
interface AvatarGroupProps {
  size?: 24 | 32 | 40;
  avatars: { src?: string; alt?: string }[];
  remaining?: number;
}

export function AvatarGroup({ size = 24, avatars, remaining }: AvatarGroupProps) {
  return (
    <div className={`avatar-group avatar-group--${size}`}>
      {avatars.map((a, i) => (
        <img key={i} className="avatar" src={a.src} alt={a.alt ?? ''} />
      ))}
      {remaining != null && remaining > 0 && (
        <span className="avatar-group__count">+{remaining}</span>
      )}
    </div>
  );
}
```

---

## Token Summary

| Token | Light mode | Dark mode | Used for |
|---|---|---|---|
| `--page-background` | Neutral-25 `#F9F9FA` | Neutral-800 `#20222A` | Group separator ring (1px) |
| `--page-background-hover` | Neutral-50 `#EFF0F2` | Neutral-700 `#2D313D` | "+N" counter bubble background |
| `--text-tertiary` | Neutral-400 `#656B7C` | Neutral-300 `#9EA4B3` | "+N" counter text |
| `100` (Figma) → `100px` | — | — | Border radius (fully circular) |

---

## Do / Don't

✓ Use group size 24 in dense table cells, 32/40 where the group is the row's focus  
✓ Show at most 3 avatars + "+N" (Figma pattern); put the true total in the counter  
✓ Keep the separator ring `--page-background` so it blends with the surface behind  

✗ Don't add borders to standalone avatars — group-only  
✗ Don't use squares or other radii — avatars are always fully circular  
✗ Don't scale counter text independently — font size is bound to the group size (8/10/12px)  
✗ Don't mix avatar sizes within one group  

---

## Related Skills

- `5mins-colors` (colors.md) — the semantic tokens above
- `table.md` — avatar and avatar-group table cells (`.avatar-32`, `.avatar-40`)
