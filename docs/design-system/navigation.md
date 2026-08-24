---
name: 5mins-navigation
description: Navigation system for 5Mins.ai — Top Navigation bar (Web app and Admin variants, large + small breakpoints), Side Panel Navigation (Web app and Admin, Expanded + Collapsed states) with the full menu-item state matrix (Enabled, Hover, Selected, Selected+Hover, collapsed hover tooltip) and sub-menu groups, and the Breadcrumb trail component. Use when building any app shell, top bar, sidebar, menu item, breadcrumb, or navigation chrome.
---

# 5Mins.ai Navigation

The app shell chrome: a fixed **Top Navigation** bar and a left **Side Panel Navigation**. Both come in two systems — **Web app** (learner) and **Admin** — that share tokens but differ in density and item styling.

Spec source: Figma Library — Top nav light `11925:5139` / dark `5385:20137`; Side navigation light `11925:5294`, Web-app items `11925:5226`, Admin items `11925:5713` / dark `4697:13314`, `4674:25675`, `5453:37876` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`).

---

## Top Navigation

Shared container:

```
Height:      70px (small/mobile Admin: 72px)
Background:  var(--page-background)
Border:      1px solid var(--border), bottom only
Padding:     8px 32px   (--s --xl)  · mobile: 8px 16px
Logo:        5Mins.ai SVG, 102×22
```

### Variants

| Variant | Left | Right (CTA cluster) |
|---|---|---|
| **Web app · large** | Logo (content column is centered at 1536px, `padding-left: 32px`) | gap 24: **Get App** text button (Bold 14 `--text-secondary` + 20px `Mobile` icon, 4px gap) · **Create** outlined button (Bold 14 `--text-primary`, 1px `--text-primary` border, `8px 16px`, radius 8, + 20px `Add` icon) · icon group gap 16: `FlashCircle` 24px (4px padding) + events/calendar 24px with an 8px `--danger-500` notification dot at its top-right |
| **Admin · large** | Logo, with a 16px-gap slot before it for the sidebar expand/collapse control | gap 16: **Exit Admin** Outlined-2 button (Bold **12** `--text-primary`, 1px `--text-primary` border, `8px 16px`, radius 8) · `Moon` 21px (theme toggle) · `Logout` 21px |
| **Admin · small** (375) | Hamburger menu icon 32px | gap 12: **Exit Admin** (same as large) · 34×34 icon button (radius 4) with 21px logout icon |

Notes:
- The Exit Admin button is the **Outlined-2** family (border follows text color, not primary) — see `buttons.md`.
- Icon-only buttons take the standard circular hover backdrop (`--page-background-hover`, radius-full).

```css
.topnav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 70px;
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-s) var(--space-xl);       /* 8px 32px */
  background: var(--page-background);
  border-bottom: 1px solid var(--border);
}
```

---

## Side Panel Navigation

```
Width:       240px expanded · icon rail when collapsed
Height:      full viewport (column: menu ▸ footer ▸ powered-by)
Background:  var(--page-background)
Border:      Admin only — 1px solid var(--border), right side
             (the Web app panel has NO right border)
```

### Menu container

| System | Padding | Item gap |
|---|---|---|
| Web app | `16px` | 0 |
| Admin | `16px 12px` (expanded) · `16px 8px` (collapsed) | 4px |

### Menu items — Web app

Base: `padding: 16px` · radius 8 · icon **24px Iconsax Bold** · label **Regular 16**, 8px gap. Items: For You, Your Workspace, Knowledge Hub, Search, My Team, My Progress, Feed, Profile, Admin.

### Menu items — Admin

Base: `padding: 12px 16px` · radius 8 · icon **20px Iconsax Linear** · label **Regular 14**, 8px gap. Items: Home, People & Teams ▾, Content ▾, Automations, Reports, Skills, Learning Records, Events, Account & Settings.

**Expandable groups** (People & Teams, Content) append a 14px `ArrowDown2`/`ArrowUp2` chevron right-aligned (label flexes). **Sub-menu items** are text-only rows: `padding: 12px 16px 12px 42px` (aligns text under the parent label), Regular 14 `--text-tertiary`.

> Reversed 2026-08-13. The assembled panel (`11925:5294`) draws sub-items at `44px` left / `8px` vertical, the item component at `42px` / `12px`; this doc previously took the panel as reference. The component set — `10372:4045`, which carries the full Menu/Sub-menu × selected × Enabled/Hover matrix — is now the reference, so sub-items are **42px / 12px** and menu items share the same `12px 16px` row metrics. `LeftSidebar` follows this.

### Item states (both systems)

| State | Background | Icon | Label |
|---|---|---|---|
| Enabled | transparent | Bold 24 (Web) / Linear 20 (Admin), `--text-secondary` tone | Regular, `--text-secondary` (sub-items `--text-tertiary`) |
| Hover | `--input-background` | unchanged | unchanged |
| **Selected** | transparent | **amber Bold variant** | **Bold**, `--text-selected` (`#EDA30D` light / `#FFBB38` dark) |
| Selected + Hover | `--input-background` | amber Bold | Bold `--text-selected` |
| Open group with selected child (Admin) | `--page-background-hover` | unchanged | Regular `--text-secondary`, chevron up |

- Selection is expressed by **color + weight only** — no filled amber row (unlike listbox items).
- `--text-selected` = `--secondary-600` light / `--secondary-500` dark — the text-safe amber ramp (see `colors.md`).

### Collapsed state

- **Web app:** icon-only tiles (`padding: 16px`, 24px Bold icons); a `Setting2` icon is pinned at the bottom of the menu column.
- **Admin:** 52×44 centered tiles, 20px Linear icons, 4px gap; panel keeps its right border.
- **Hover (collapsed, both):** the icon tile fills with `--input-background`, and a **tooltip flies out to the right**: left-pointing caret + `--tooltip-background` body, `padding: 8px 12px`, radius 8, label Regular 14 `--neutral-25`, Shadow L. Selected collapsed items show the amber Bold icon.

### Footer

| System | Content |
|---|---|
| Web app (expanded) | **Profile card** — `--input-background` fill, `padding: 8px 16px`, radius 12, full width: name Medium 14 `--text-primary` + email Regular 12 `--text-secondary` (2px column gap), 16px `Setting2` icon right (8px gap) |
| Admin | **Help block** — 5Mins Academy (`Teacher` 20px) and Help (`MessageQuestion` 20px) items, Regular 14 `--text-tertiary`, same item metrics as the menu |

### Powered by (bottom row)

| System | Spec |
|---|---|
| Web app | `padding: 12px 24px` — "Powered by" Regular **10** `--text-tertiary` + logo at 12px height, 4px gap |
| Admin | `padding: 12px 28px` — "Powered by" Regular **12** `--text-tertiary` + logo at 14px height, 4px gap |

### CSS (Admin panel, matches `LeftSidebar`)

```css
.side-nav {
  width: 240px; min-width: 240px;
  display: flex; flex-direction: column;
  background: var(--page-background);
  border-right: 1px solid var(--border);       /* Admin only */
}
.side-nav__menu { flex: 1; padding: var(--space-m) var(--space-sm); display: flex; flex-direction: column; gap: var(--space-xs); }

.side-nav__item {
  display: flex; align-items: center; gap: var(--space-s);
  width: 100%;
  padding: var(--space-sm) var(--space-m);     /* 12px 16px */
  border-radius: var(--radius-s);
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-secondary);
  transition: background 150ms ease;
}
.side-nav__item:hover      { background: var(--input-background); }
.side-nav__item--selected  { font-weight: 700; color: var(--text-selected); }  /* + Bold icon variant */
.side-nav__item--open      { background: var(--page-background-hover); }

.side-nav__sub-item {
  padding: var(--space-s) var(--space-m);
  padding-left: 44px;
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-tertiary);
}
.side-nav__sub-item:hover     { background: var(--input-background); }
.side-nav__sub-item--selected { font-weight: 700; color: var(--text-selected); }
```

---

## Breadcrumb

A chevron-separated trail showing where the current page sits in the hierarchy. Component: `src/components/Breadcrumb/`.
Spec source: Figma Library — dark `8497:2231` / `8497:1494`, light `11935:2368` / `8517:34946` (verified 2026-07-07). Same structure in both modes; all colours are semantic tokens, so it flips automatically.

**Structure.** A horizontal list, `4px` gap between items. Each item is a label (Poppins **Regular 14px**, line-height 1.5 — the app uses 14px; the Figma Library frames show 12px) followed by an `ArrowRight2` (Iconsax Linear, 16px) chevron separator — **except the last item**, which is the current page and has **no chevron**. Label↔chevron gap is `2px`.

### Item states

| State | Applies to | Label colour | Notes |
|---|---|---|---|
| **Default** | Link items (all but last) | `--text-tertiary` | + trailing chevron |
| **Hover** | Link items | `--text-primary` | underline |
| **Disabled** | Link items | `--text-disabled` | non-interactive, `cursor: not-allowed` |
| **Current** | Last item | `--text-secondary` | no chevron, `aria-current="page"`, not a link |
| Separator | between items | `--text-tertiary` | `ArrowRight2`, 16px |

### React

```tsx
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'

// The last entry is rendered as the current page (no chevron, not a link).
<Breadcrumb
  items={[
    { label: 'Programs', onClick: () => navigate('/programs') },
    { label: program.title, onClick: () => navigate(`/programs/${program.id}`) },
    { label: course.title }, // current page
  ]}
/>
```

`items: { label, onClick?, disabled? }[]`. Provide `onClick` (the app navigates via `useNavigate`, not `href`). Full CSS lives with the component.

> Usage note: the learner **course-inside-a-program** header uses this component as the first child of `.cd-header` — `{Program} › {Course}` (the program links back to `/programs/{id}`, the course is the current page). It only renders when the course belongs to a program (`findProgramForCourse`).

### Code reality

`src/components/Breadcrumb/` is the implementation — use it. Three pages predate it and hand-roll the same trail with their own classes, which is how they drifted (all three had a `--text-secondary` hover and no underline until 2026-08-13):

| Page | Class prefix |
|---|---|
| `pages/add-content/AddContent` | `.add-content-breadcrumb-*` |
| `pages/your-courses/CourseDetails` | `.cd-breadcrumb-*` |
| `pages/your-courses/YourCoursesList` | `.courses-list-breadcrumb-*` |

They now match the state table above, but they are still three copies of one component — migrate them when you next touch those headers.

---

## Mobile App Navigation

The learner **mobile app** chrome (phone-frame prototype): a top header and a bottom tab bar. Figma-verified 2026-07-13: `Top nav/ App` `1910:18375`, `Tab nav` `1324:35285` (dark nodes; semantic tokens resolve per mode). Implemented as `src/components/mobile/TopNav` and `src/components/mobile/TabNav` — use those.

### Bottom tab bar (375 x 66)

5 equal-width tabs, in order: **Home** (Iconsax `Home` Bold), **Search** (`SearchNormal1` Bold), **Progress** (`Award` Bold), **Feed** (custom people-in-circle glyph — `src/components/icons/FeedIcon.tsx`, no Iconsax equivalent), **Profile** (`UserSquare` Bold).

- Container: `--page-background`, 1px top border `--border`, 16px/8px padding, no radius/shadow.
- Item: column, centered, 4px gap, 4px padding, flex 1. Icon 24px; label Poppins Regular **10px**/1.4 (literal in Figma — the one place below the normal type scale).
- **Selection**: icon fill + label switch from `--text-secondary` to `--selected` (amber). Nothing else — same Bold glyph in both states, no weight bump, no indicator dot/pill/underline, no badges. No hover/pressed states (touch).
- Variant nodes: Enabled `50:29236`, Home `9105:1719`, Search `9105:1752`, Progress `9105:1785`, Feed `9105:1818`, Profile `9105:1851`.

### Top header (375 wide, per-page variants)

The Figma component includes the iOS status bar (clock "9:41" + signal/wifi/battery, 16px/4px padding) above the header row; the prototype component renders a lightweight equivalent. Header row: `--page-background`, 1px bottom border `--border` — **no divider on Home and Lesson feed**; **Lesson feed is fully transparent** (floats over content).

| Page variant | Node | Height | Contents |
|---|---|---|---|
| Home | `1092:34690` | 65px, 16px/12px pad | Chips left ("For You" selected / "Your Workspace"); right cluster 16px gap: 28px flash-circle + 28px bell with red Nudge dot |
| Search | `7632:8029` | 65px | Full-width search field: `--input-background` fill, 1px `--border`, radius 12px, 12px/8px padding, 18px magnifier, placeholder Poppins Regular 14 `--text-disabled` |
| Progress | `7632:8164` | 65px | Chips "My Team" / "My Progress" |
| Feed | `7632:8202` | 65px | Centered title Poppins Bold 16/1.5 `--text-primary` |
| Profile | `7632:8270` | auto, 16px/12px pad | 40px avatar with settings mini-badge (top-right, `--input-background`, 9px `setting-2` icon), name Bold 14 + role Regular 12 `--text-secondary` (2px gap); right 40px `--primary-500` circular add button |
| Detail page | `6162:9788` | auto, 16px/8px pad | Back button left, centered title Bold 16, empty 32px right spacer to keep the title centered |
| Skill | `8377:1056` | auto, 16px/8px pad | Back button, 24px skill illustration + title Bold **14**, right 24px vertical kebab |
| Lesson feed | `7645:4829` | auto, 16px/8px pad | Transparent; back button on a fixed `rgba(15,16,20,0.5)` legibility fill; right "45 Pt" Bold 12 + small trophy |
| Mobile web | `9465:24352` | — | Browser-chrome mock (white, Chrome URL pill "app.5mins.ai") — reference only, not built |

Shared elements:

- **Back button**: 40px circle — 8px padding around a 24px `ArrowLeft` Linear icon, radius full, `--input-background` fill (`rgba(15,16,20,0.5)` on Lesson feed, a fixed legibility fill over video — not the `--scrim` overlay token, which is mode-aware; see `layout.md` §7).
- **Header chips** (Home/Progress): selected = `--secondary-500` fill, Poppins Bold 14, `--neutral-800` text (always-dark text on amber, both modes); unselected = transparent, 1px `--border`, Regular 14 `--text-secondary`. Both: 12px/8px padding, **radius 24px**, 8px gap (16px between chip group items on Progress).
- Title is Bold 16 when alone, Bold 14 when paired with a leading icon (Skill).

---

## Behaviour

- Expandable Admin groups toggle their sub-menu; expand/collapse animates per the project GSAP ease-in-out convention (`Collapse` component). The chevron flips between `ArrowDown2`/`ArrowUp2`.
- A group stays visually "open" (`--page-background-hover` row) while one of its children is selected.
- Collapsing the panel keeps the selected state on the icon (amber Bold); labels move into the flyout tooltip on hover.
- Selected item = current route; navigation items are links/buttons with `aria-current="page"` on the active one.

---

## Token Summary

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--page-background` | `#F9F9FA` | `#20222A` | Bar + panel background |
| `--border` | `#DFE1E6` | `#2D313D` | Bottom / right hairline |
| `--input-background` | `#BFC2CC` @24% | `#454C5E` @24% | Item hover, profile card |
| `--page-background-hover` | `#EFF0F2` | `#2D313D` | Open-group row |
| `--text-selected` | `#EDA30D` | `#FFBB38` | Selected item label + icon |
| `--text-secondary` / `--text-tertiary` | per colors.md | per colors.md | Item / sub-item + footer labels |
| `--tooltip-background` | `#20222A` | `#20222A` | Collapsed-hover flyout |
| `--danger-500` | `#DF1642` | `#DF1642` | Notification dot (Web app top nav) |

---

## Code reality

- `src/components/TopNav/TopNav.tsx` — the Admin top nav (inline SVG logo, Exit Admin, disabled Moon toggle, Logout with tooltip). Drift from the node: background is `--neutral-25` instead of `--page-background` (same value in light mode) and the Moon/Logout icons render at 24px vs Figma's 21px.
- `src/components/LeftSidebar/LeftSidebar.tsx` — the Admin side panel (expandable People & Teams / Content groups, route-driven selection). Aligned to `10372:4045` on 2026-08-13: row metrics `12px 16px`, sub-items indented 42px, hover `--input-background`, selected `--text-selected` (was `--secondary-600`, which matched only in light mode). Remaining drift: it adds section eyebrows and red count badges that aren't part of the Library component.
- `src/pages/your-courses/components/AddContentIconStrip/` — the Create Course rail reuses this menu-item language. Its Assessments group and sub-items follow the same states, per the product file (`9051:187870` expanded group, `9052:198939` selected sub-item): Bold label for an open group, Bold `--text-selected` for the selected sub-item, neither with a fill. Note its sub-items sit at `8px 40px`, not the Library's `12px 42px`.
- The **Web app** top nav and side panel are not built in this prototype.
- Collapsed states are not implemented (`LeftSidebar` is fixed-width 240px).
- `src/components/mobile/TabNav/TabNav.tsx` and `src/components/mobile/TopNav/TopNav.tsx` — the mobile app chrome (see "Mobile App Navigation" above). TopNav's status bar is a lightweight stand-in (system font clock + simple glyphs, not the Figma SF Pro assets); the Mobile web (browser chrome) variant is not built.

## Related Skills

- `buttons.md` — Outlined / Outlined-2 / text buttons in the top nav
- `alerts-toast.md` — the Tooltip spec (collapsed-hover flyout)
- `iconography.md` — Iconsax Bold (Web app) vs Linear (Admin) icon variants
- `5mins-colors` (colors.md) — `--text-selected` ramp and surface tokens
