---
name: 5mins-iconography
description: Iconography system for 5Mins.ai - Iconsax React library, Linear/Bold variants, standard sizes (16/20/24/32), color pairing via tokens, the custom 5Mins icons and the skill illustration library. Use when choosing or sizing any icon.
---

# Iconography

Icon rules for 5Mins.ai: **Iconsax React** for all UI icons, two variants (Linear and Bold), four sizes, colours from design tokens.

**Code:** `iconsax-react` (named imports); custom 5Mins icons in `src/components/icons/`; skill illustrations in `src/assets/skill-icons/`. To find an icon by meaning or check a name exists, use the `find-icon` skill (`node .claude/skills/find-icon/scripts/find-icon.mjs <keyword>`) rather than guessing.
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Icons page `5447:24698`; skill illustrations frame `9120:10291`
**Last verified:** 2026-10-14

## Usage

**Intent:** one icon family at fixed sizes so icons read as a system and pair cleanly with text.

**Use when**
- Any UI icon: buttons, inputs, navigation, menus, status, table actions.

**Don't use when**
- Skill-category artwork → use the skill illustrations (below)
- Skill levels, streaks, quiz-type artwork, certificates → [gamification.md](gamification.md)
- Empty states → the 72px DS illustrations ([doc](empty-state.md))

**Do**
- Use Iconsax React icons only, imported by name.
- Use the four sizes: 16, 20, 24, 32px (`--icon-size-sm|md|lg|xl`).
- Pass `color` explicitly on every Iconsax icon (iconsax-react 0.0.8 on React 19 ignores the default), as a token: `color="var(--text-primary)"`.
- Linear by default; Bold for active/selected states and emphasis.
- Give every icon-only button an `aria-label` and a circular `var(--radius-full)` hover background.

**Don't**
- Don't mix icon libraries. The one exception: the Ionicons 5 glyphs `IoCloseOutline` (`CloseButton`) and `IoInformationCircleOutline` (Figma's Informative badge), drawn inline as SVG; `react-icons` is not installed.
- Don't use non-standard sizes (e.g. 18px, 23px).
- Don't use arbitrary colours outside the tokens, or raw `--neutral-*` for an icon that should flip with the theme.
- Don't use Bold everywhere.
- Don't import the entire icon library.

**Canonical spec:** Iconsax React, Linear default / Bold active; sizes 16/20/24/32px; colour via token, explicit `color` prop; icon-only buttons circular hover, `aria-label`, Tooltip on web.

## Figma to code

| Figma | Figma values | Code | Code values | Notes |
|---|---|---|---|---|
| Glyph `vuesax/linear/<Name>` | exact iconsax-react name | Iconsax component | same name, `variant="Linear"` | `vuesax/linear/ArrowDown2` → `<ArrowDown2 variant="Linear" />` |
| Glyph `vuesax/bold/<Name>` | exact iconsax-react name | Iconsax component | same name, `variant="Bold"` | |
| `Icons` component set (custom 5Mins icons) | Name (27), Type linear / bold, State Enabled / Hover | `src/components/icons/*` | one component per icon | Hover is CSS, not a prop |
| Icon size | 24×24 frames (a few 20×20) | `size` prop | `16` / `20` / `24` / `32` (`--icon-size-*`) | no Figma variable for icon sizes |
| Skill illustrations | `Icons/Skill Icon/*`, `Illustrations/Skill Hugo/*` | `getSkillIllustrationByName` | see below | |

- **Figma only:** the Hover state baked into the custom `Icons` set.
- **Code only:** `--icon-size-sm|md|lg|xl` tokens (16/20/24/32px).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Icons | _to be mapped by engineering_ | | |

### Known drift

- **Names match code:** Figma glyphs carry their exact iconsax-react names (matched by shape). Two Linear glyphs used in code are still unnamed because their paths differ from iconsax-react: `Mobile` (Figma `mobile` 10215:71222) and `Refresh` (`refresh` 10215:68679); the Bold versions exist. 22 glyphs with no iconsax-react equivalent and 25 duplicate copies keep their old kebab-case names.
- **Informative badge icon:** Figma draws Ionicons `IoInformationCircleOutline`; code uses Iconsax `InfoCircle` Linear as the approved stand-in (`badges.md`).

## Variants

### Linear (default)

Most UI elements, default states, general interface icons: default navigation items, form field icons, general UI elements, inactive states.

```jsx
<Home size="24" color="var(--text-primary)" variant="Linear" />
```

### Bold

Active states, selected items, emphasis: active navigation items, selected states, important actions, emphasised elements.

```jsx
<Home size="24" color="var(--text-selected)" variant="Bold" />
```

## Sizes

Icons come in exactly four sizes - 16, 20, 24, 32px (`--icon-size-sm/md/lg/xl`). The scale and usage table live in `layout.md`.

| Context | Size | Example |
|---------|------|---------|
| Badge | 16px | Small indicator |
| Button | 20px | Icon in button |
| Form input | 20px | Search icon |
| Navigation | 24px | Sidebar nav |
| Card header | 24px | Card title icon |
| Hero section | 32px | Large feature icon |

```jsx
<InfoCircle size="16" color="var(--text-secondary)" />    /* Small */
<SearchNormal1 size="20" color="var(--text-secondary)" /> /* Medium */
<Home size="24" color="var(--text-primary)" />            /* Large (default) */
<User size="32" color="var(--text-primary)" />            /* Extra large */
```

## States

### Icon colours

| State | Token | Usage |
|-------|-------|-------|
| Primary | `--text-primary` | Interactive elements; menu, listbox and filter leading icons |
| Secondary | `--text-secondary` | Supporting elements, inactive navigation |
| Muted | `--text-disabled` | Disabled/inactive |
| Selected | `--text-selected` | Selected navigation item (Bold) |
| Success | `--success-500` | Success states |
| Warning | `--warning-500` | Warnings |
| Danger | `--danger-500` | Errors, delete |
| Brand | `--primary-600` | Brand elements |

Status icon colours are raw palette tokens on purpose: they are mode-invariant.

### Interactive icon hover

When an icon is a standalone clickable element (close button, action icon), the hover background is always **circular** (`var(--radius-full)`), never squared.

```css
.icon-button {
  display: flex;
  padding: var(--space-xs);
  border-radius: var(--radius-full);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
}

.icon-button:hover {
  background: var(--page-background-hover);
}
```

✓ Always a circular hover background for icon-only controls
✗ Never squared corners (`border-radius: 4px` or `8px`) for icon hover states

### Close icon

Two close treatments exist; both are the shared `CloseButton` (`src/components/CloseButton/CloseButton.tsx`), never a hand-rolled × or an Iconsax `CloseCircle` (that one is a status icon, see below).

| Where | Variant | Look |
|---|---|---|
| Side drawers, centred modals, popovers, chips | `CloseButton` (default) | Bare glyph in `--text-secondary`, circular `--input-background` fill on hover only |
| **Full-screen modals** | `CloseButton variant="fullscreen"` | 44px `--input-background` disc, 4px padding, 36px `IoCloseOutline` glyph (1.5px stroke) in `--text-secondary`; hover lifts to `--input-background-hover` + `--text-primary` |

> **Figma:** full-screen close is Programs `4221:63780` (DS `Icons` set, `Name=close, Type=linear`, overridden to 44px with an `Input-background` fill and a `Text-secondary` stroke). Full spec in `overlays.md` → Close Button (Full-screen modal).

## Content

### Commonly used icons

| Category | Icons |
|----------|-------|
| **Navigation** | `Home` (dashboard), `Book1` (courses, learning), `Profile2User` (team, users), `Setting2` (settings), `NotificationBing` (notifications) |
| **Actions** | `Add`, `Edit`, `Trash` (delete), `Eye` (view), `ImportCurve` (download), `Share` |
| **Status** | `TickCircle` (success, completed), `InfoCircle` (information, warning), `CloseCircle` (error, failed), `Clock` (pending, in progress) |
| **Forms** | `SearchNormal1` (search), `Calendar` (date picker), `Location`, `Sms` (email), `Lock` (password) |
| **Content** | `Video`, `Image`, `DocumentText` (documents), `MicrophoneSlash` (audio) |
| **Quiz types** | `Flash` (blaze), `Book1` (lesson), `Award` (certificate), `DocumentText` (course assessments) |

`ImportCurve` is the one download icon across the product (Iconsax React has no `Download`). Resource cards pair it with `ExportSquare` for Open link (`resource-card.md`).

### Skill illustrations (gamification)

Multi-colour skill-category illustrations, separate from the Iconsax UI icon set. Used on skill pages, skill/instructor cards, and role panels. Source: Figma `Icons/Skill Icon/*` + `Illustrations/Skill Hugo/*` (frame `9120:10291`). Full library lives in `src/assets/skill-icons/` - **100 skills** as SVG (kebab-case filenames) plus **8 "Skill Hugo"** alternates (`*-hugo.svg`: Automation Testing & Deployment, Financial Compliance, Data & Security Compliance, Workplace Compliance, ESG, Sustainability, Buyer Psychology, Generative ai).

Usage - always via the index, never raw paths:

```tsx
import { getSkillIllustrationByName, skillIllustrationHugoByName } from '@/assets/skill-icons'

<img src={getSkillIllustrationByName('Machine Learning')} alt="" width={16} height={16} />
```

- `getSkillIllustrationByName(name)` - case-insensitive lookup by official skill name; unknown names fall back to a stable hash pick so mock data never renders empty.
- `skillIllustrationHugoByName` - the 8 Hugo-style alternates, keyed by the same names.
- `getSkillIllustration(skillId)` - legacy modulo pick over the original 20; existing call sites only, don't use in new code.
- Render at 16, 20, or 96px depending on context (skill row, chip, skill page hero); they're decorative - pair with a text label, `alt=""`.

## Accessibility

- Provide an `aria-label` for every icon-only button; on web it also shows a DS Tooltip with the same text on hover and focus.
- Decorative icons next to a text label need no label of their own.

```jsx
<button aria-label="Delete course">
  <Trash size="20" color="var(--danger-500)" />
</button>
```

## Examples

```jsx
import { Home, User, Setting2 } from 'iconsax-react';

<Home size="24" color="var(--text-primary)" variant="Linear" />
```

Import only the icons you need:

```jsx
// ✓ Good
import { Home, User } from 'iconsax-react';

// ✗ Bad
import * as Icons from 'iconsax-react';
```

**Navigation**

```jsx
// Inactive
<Home size="24" color="var(--text-secondary)" variant="Linear" />

// Active
<Home size="24" color="var(--text-selected)" variant="Bold" />
```

**Button icons:** use the `Button` component's icon slot ([doc](buttons.md)); icons lead the label.

**Input icons**

```jsx
<SearchNormal1 size="20" color="var(--text-secondary)" />
```

**Status icons**

```jsx
<TickCircle size="20" color="var(--success-500)" variant="Bold" />   // Success
<InfoCircle size="20" color="var(--warning-500)" variant="Linear" /> // Warning
<CloseCircle size="20" color="var(--danger-500)" variant="Linear" /> // Error
```

**Quiz type icons**

```jsx
<Flash size="24" color="var(--blaze-quiz)" variant="Bold" />                 // Blaze Quiz
<Book1 size="24" color="var(--lesson-quiz)" variant="Linear" />              // Lesson Quiz
<Award size="24" color="var(--certificate-quiz)" variant="Bold" />           // Certificate Quiz
<DocumentText size="24" color="var(--course-assessments)" variant="Linear" /> // Course assessments
```

### Quick decisions

**"What icon size for...?"** Navigation → 24px · Button → 20px · Form input → 20px · Badge/indicator → 16px · Hero/feature → 32px

**"What icon colour for...?"** Active element → `--text-primary` · Inactive element → `--text-secondary` · Disabled → `--text-disabled` · Success → `--success-500` · Warning → `--warning-500` · Error → `--danger-500`

**"What variant for...?"** Default state → Linear · Active/selected → Bold · Emphasis → Bold · Standard UI → Linear

## Related

- [layout.md](layout.md) - icon size tokens
- [colors.md](colors.md) - icon colour tokens
- [gamification.md](gamification.md) - level, streak and quiz artwork
- [overlays.md](overlays.md) - close button spec
- [Iconsax React docs](https://iconsax-react.pages.dev/) · [Iconsax library](https://iconsax.io/)
