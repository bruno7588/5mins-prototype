---
name: 5mins-navigation
description: Navigation system for 5Mins.ai - Top Navigation bar (Web app and Admin variants, large + small breakpoints), Side Panel Navigation (Web app and Admin, Expanded + Collapsed states) with the full menu-item state matrix (Enabled, Hover, Selected, Selected+Hover, collapsed hover tooltip) and sub-menu groups, and the Breadcrumb trail component. Use when building any app shell, top bar, sidebar, menu item, breadcrumb, or navigation chrome.
---

# Navigation

The app shell chrome: a fixed **Top Navigation** bar and a left **Side Panel Navigation**, plus the Breadcrumb trail and the mobile app chrome. Top nav and side panel come in two systems, **Web app** (learner) and **Admin**, that share tokens but differ in density and item styling.

**Code:** `import TopNav from '@/components/TopNav/TopNav'`, `import LeftSidebar from '@/components/LeftSidebar/LeftSidebar'`, `import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'`, `import TabNav from '@/components/mobile/TabNav/TabNav'`, `import TopNav from '@/components/mobile/TopNav/TopNav'` (mobile). The Web app (learner) top nav and side panel have no shared component yet: hand-rolled per page as `.mt-topnav` / `.mt-side`.
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`. Top Nav/Admin dark `5385:20137` / light `12328:8954` (Admin large `5385:20161`); Side navigation dark `4697:13314` / light `12048:2302`; Menu/Itens/WebApp dark `4674:25675` / light `12048:2401`; Menu/Itens/Admin dark `10372:4045` / light `12048:2440`; Breadcrumb dark `8497:2231` / `8497:1494`, light `11935:2368` / `8517:34946`; mobile `Top nav/ App` `1910:18375`, `Tab nav` `1324:35285` (dark nodes)
**Last verified:** 2026-09-29

Colours are semantic tokens resolving per mode (see `colors.md`).

## Usage

### TopNav

**Intent:** the fixed admin app bar: brand, the way back to the learner app, theme and account actions.

**Use when**
- Any admin route. It is mounted once for the whole app shell.

**Don't use when**
- Inside the mobile phone-frame prototype → use the mobile TopNav (see "Mobile nav" below)
- For a page's own title, actions or tabs → use a Page Header ([doc](headers.md))

**Do**
- Mount it once in the app shell (`App.tsx`), never per page.
- Keep Exit Admin as the Outlined-2 `Button`, size Small (`size="sm"`, Bold 12).
- Icon-only buttons: 36px, circular `var(--radius-full)` hover on `--page-background-hover`, 20px glyphs in `--text-primary` (Moon/Sun Linear, Logout Bold), with a Tooltip naming the action. They sit flush in one group, so the hover circles carry the 16px spacing between glyphs.
- Hide an icon button's tooltip while its menu is open.
- Give the icon buttons an `aria-label`; the theme toggle also carries `aria-pressed`.

**Don't**
- Don't add page-specific actions to the top nav.
- Don't use a squared hover on the icon buttons.

**Canonical spec:** height 70px; `var(--page-background)` with a `1px solid var(--border)` bottom edge; padding `var(--space-s) var(--space-l) var(--space-s) var(--space-xl)` (the right 24px plus the icon button's 8px inset puts the last glyph 32px from the edge); logo 102×22; Exit Admin Small Outlined-2; 16px from Exit Admin to the first glyph and between glyphs; icon buttons 36px, `var(--radius-full)`, 20px `--text-primary` glyphs. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `12328:8954` / dark `5385:20137` (Admin large `5385:20161`).

**Prototype:** `src/components/TopNav/TopNav.tsx`
- No props. Logo and Exit Admin go to `/workspace`; the Moon/Sun button calls `useTheme().toggle`; the Logout button opens a menu (Log Out, Mobile App).

### LeftSidebar

**Intent:** the admin side panel that shows where the user is and moves them between admin sections.

**Use when**
- Any admin page with the standard shell. Render it as the first child of the page layout.

**Don't use when**
- The learner app → it has its own hand-rolled shell (`.mt-topnav` / `.mt-side`, see "Figma to code"); mobile uses TabNav
- Switching views inside one page → use tabs or chips ([doc](chips-switcher-tabs.md))
- A picker of things to add (e.g. the Create Course Add Content menu) → that is a DS listbox with hover flyouts ([doc](listbox.md)), not this menu-item language

**Do**
- Render `<LeftSidebar />` with no props; the selected item comes from the current route.
- Add a new admin section as a route plus an item in `LeftSidebar.tsx`, so selection follows the URL.
- Selected = Bold label in `--text-selected` with the amber Bold icon; no filled row.
- Hover fills the row with `--input-background`.
- Animate group expand/collapse with `Collapse` (see "Behaviour").

**Don't**
- Don't pass or store "active page" state; derive it from the route.
- Don't use a filled amber row for the selected item.
- Don't use raw `--secondary-*` for selected text; use the mode-aware `--text-selected`.

**Canonical spec:** width 240px; `var(--page-background)` with `1px solid var(--border)` right edge; item padding `var(--space-sm) var(--space-m)` (12px 16px), gap `var(--space-s)` (8px); menu padding 16px top, 12px sides; 4px between top-level entries; sub-items (padding 12px 16px 12px 42px) stack flush, 0 gap, directly under their group heading; 20px Linear icons; Regular 14 `--text-secondary`, selected Bold `--text-selected`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `12048:2302`, Admin items `12048:2440` / dark `4697:13314`, `4674:25675`, `10372:4045`.

**Prototype:** `src/components/LeftSidebar/LeftSidebar.tsx`
- No props. Expandable People & Teams and Content groups; selection from `useLocation().pathname`.

### Breadcrumb

**Intent:** show where the current page sits in the hierarchy and give a one-click way back up.

**Use when**
- A page sits below a parent the user came from: a person under People, a course under a program, answers under a course.

**Don't use when**
- The page is a top-level section already selected in the sidebar → no breadcrumb
- Moving between sibling views of one page → use tabs ([doc](chips-switcher-tabs.md))

**Do**
- Use `src/components/Breadcrumb`; don't hand-roll a trail.
- Make the last item the current page: plain `{ label }`, no `onClick`.
- Navigate with `onClick` + `useNavigate`, not `href`.
- Place it as the first row of the Page Header (the label slot).
- Render it only when the parent exists (e.g. only when the course belongs to a program).

**Don't**
- Don't add a chevron after the last item or make it a link.
- Don't restyle the hover; links go `--text-primary` with an underline.

**Canonical spec:** Poppins Regular 14px/1.5; items gap `var(--space-xs)` (4px); 16px `ArrowRight2` Linear separator in `--text-tertiary`; links `--text-tertiary` (hover `--text-primary` + underline), current `--text-secondary`, disabled `--text-disabled`; focus ring `2px solid var(--primary-button-background)`, 2px offset. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `11935:2368` / `8517:34946`, dark `8497:2231` / `8497:1494`.

**Prototype:** `src/components/Breadcrumb/Breadcrumb.tsx`
- `items: { label, onClick?, disabled? }[]`; the last entry renders as the current page (`aria-current="page"`).
- `className` for page-level placement only.

### Mobile nav

**Intent:** the learner mobile app chrome: a per-page top header and a five-tab bottom bar.

**Use when**
- Screens inside the mobile phone-frame prototype (`/mobile`).

**Don't use when**
- Desktop admin pages → use TopNav and LeftSidebar (above)

**Do**
- Use `src/components/mobile/TopNav` with the `variant` that matches the page, and `src/components/mobile/TabNav` for the bottom bar.
- Show the selected tab with colour only: icon and label switch to `--selected`, with `aria-current="page"`.

**Don't**
- Don't add weight changes, dots, pills or underlines to the selected tab.
- Don't use `--scrim` for the Lesson feed back-button fill; it is a fixed legibility fill.

**Canonical spec:** tab bar 375×66, `var(--page-background)`, `1px solid var(--border)` top; 24px Bold icons; label Regular 10px/1.4; header rows 65px with `1px solid var(--border)` bottom (none on Home and Lesson feed); back button 40px `var(--radius-full)` on `--input-background`. Figma: `Top nav/ App` `1910:18375`, `Tab nav` `1324:35285` (dark nodes).

**Prototype:**
- `src/components/mobile/TabNav/TabNav.tsx`: `active` (`home` | `search` | `progress` | `feed` | `profile`), `onNavigate(tab)`.
- `src/components/mobile/TopNav/TopNav.tsx`: `variant` (`home` | `search` | `chips` | `title` | `detail` | `skill` | `lesson-feed` | `profile`) plus per-variant props (`chips`, `title`, `onBack`, `pointsLabel`, `name`, `hideStatusBar`, and so on).

## Figma to code

### TopNav (Top Nav/Admin `5385:20137` / `12328:8954`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| System | Admin / Web app | n/a | `TopNav` is the Admin bar | Web app is hand-rolled per page (`.mt-topnav`) |
| Breakpoint | large / small | n/a | large only | no small (375) Admin bar in code |

- **Figma only:** `System=Web app` (no shared component), `Breakpoint=small`.
- **Code only:** the Moon/Sun theme toggle state (`aria-pressed`), the Logout menu (Log Out, Mobile App).
- **Drift:** `TopNav` is the Admin top nav (inline SVG logo, Exit Admin, Moon/Sun dark-mode toggle, Logout button that opens a menu with Log Out and Mobile App), background `--page-background`. Figma draws the Moon/Logout glyphs at 21px; the code uses 20px, the nearest icon-scale size.

### LeftSidebar (Side navigation `4697:13314` / `12048:2302`; Menu/Itens/Admin `10372:4045` / `12048:2440`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Side navigation · System | Web app / Admin | n/a | `LeftSidebar` is the Admin panel | Web app is hand-rolled (`.mt-side`) |
| Side navigation · State | Collapsed / Expanded | n/a | Expanded only | collapsed states are not implemented (fixed 240px) |
| Menu/Itens/Admin · Type | Menu / Sub-menu | n/a | `.sidebar-item` / `.sidebar-sub-item` | rows are internal to `LeftSidebar`, no props |
| Menu/Itens/Admin · Selected | false / true | n/a | route match (`useLocation().pathname`) | `.sidebar-sub-item--active` |
| Menu/Itens/Admin · chevron right | false / true | n/a | groups only (People & Teams, Content) | `ArrowDown2` / `ArrowUp2` chevron |
| Menu/Itens/Admin · State | Hover / Enabled | n/a | CSS `:hover` | states are CSS, not props |
| Menu/Itens/Admin · Expanded | true / false | n/a | internal `peopleOpen` / `contentOpen` | not a prop |

- **Figma only:** `State=Collapsed` and the collapsed hover flyout tooltip; the open-group row fill (`--page-background-hover`).
- **Code only:** a red count badge on the Roles sub-item and a red dot on the collapsed People & Teams group (neither is part of the Library component).
- **Drift:** sub-menus mount and unmount instantly (`{peopleOpen && ...}`) instead of animating with `Collapse`; the active item has no `aria-current="page"`; selected icons use `--secondary-600` rather than `--text-selected`; items have no `:focus-visible` style; no open-group fill.

**Menu/Itens/WebApp** (`4674:25675` / `12048:2401`): `Selected` (false / true), `State` (Hover / Enabled), `Expanded` (true / false). No shared component: each learner page hand-rolls the shell with `.mt-topnav` / `.mt-side` classes (defined in `pages/my-team/MyTeam.css`), in `MyTeam.tsx`, `ForYou.tsx`, `Workspace.tsx`, `ProgramDetails.tsx`, `ProgramCourseDetails.tsx`, `UserProfile.tsx` and `Events.tsx`. The side panel reuses the shared `AdminMenuItem` (the learner menu's Admin entry, a `.mt-side__item` locked during impersonation, [doc](impersonation-banner.md)) and `ProfileMenu` components, which have no doc yet. Its selected icon is raw `--secondary-500`, not `--text-selected`. Extracting a shared learner shell is a candidate clean-up.

### Breadcrumb (Breadcrumb `8497:2231`; Breadcrumb item `8497:1494` / `11935:2383`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Breadcrumb (no properties) | trail of 6 nested items, 3 hidden | `items` | `{ label, onClick?, disabled? }[]` | trail length comes from the array |
| Breadcrumb item · Type | Link / Current page | n/a | position in `items` | the last entry is Current page |
| Breadcrumb item · State | Hover / Enabled / n/a | n/a | CSS `:hover` | n/a on Current page |
| Breadcrumb item · Disabled | false / true | `items[i].disabled` | `boolean` | |

- **Figma only:** none.
- **Code only:** `className`, `onClick` per item, the focus-visible ring (no Focus variant in Figma).

`src/components/Breadcrumb/` is the implementation; use it. Three pages hand-roll the same trail with their own classes; they match the state table, but they are still three copies of one component, so migrate them when you next touch those headers:

| Page | Class prefix |
|---|---|
| `pages/add-content/AddContent` | `.add-content-breadcrumb-*` |
| `pages/your-courses/CourseDetails` | `.cd-breadcrumb-*` |
| `pages/your-courses/YourCoursesList` | `.courses-list-breadcrumb-*` |

### Mobile nav (Tab nav `1324:35285` / `9897:18192`; Top nav/ App `1910:18375` / `11235:11758`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Tab nav · Page | Enabled / Home / Search / Progress / Feed / Profile | `active` | `undefined` / `home` / `search` / `progress` / `feed` / `profile` | Enabled = no tab selected |
| Top nav/ App · Page | Home / Search / Progress / Feed / Profile / Detail page / Skill / Lesson feed / Mobile web | `variant` | `home` / `search` / `chips` / `title` / `profile` / `detail` / `skill` / `lesson-feed` / n/a | Progress uses the `chips` variant, Feed the `title` variant |

- **Figma only:** `Page=Mobile web` (browser-chrome mock, reference only, not built).
- **Code only:** `onNavigate`; TopNav per-variant props (`chips`, `notificationDot`, `onStreakClick`, `onNotificationsClick`, `searchPlaceholder`, `onSearchClick`, `title`, `skillIcon`, `onBack`, `onMore`, `pointsLabel`, `name`, `role`, `avatar`, `onEditProfile`, `onAdd`, `hideStatusBar`).
- **Drift:** TopNav's status bar is a lightweight stand-in (system font clock + simple glyphs, not the Figma SF Pro assets).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| TopNav | _to be mapped by engineering_ | | |
| LeftSidebar | _to be mapped by engineering_ | | |
| Breadcrumb | _to be mapped by engineering_ | | |
| Mobile TabNav | _to be mapped by engineering_ | | |
| Mobile TopNav | _to be mapped by engineering_ | | |

## Anatomy

### Top navigation

Shared container:

```
Height:      70px (small/mobile Admin: 72px)
Background:  var(--page-background)
Border:      1px solid var(--border), bottom only
Padding:     8px 24px 8px 32px   (--s --l --s --xl)  · mobile: 8px 16px
Logo:        5Mins.ai SVG, 102×22
```

```css
.topnav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 70px;
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-s) var(--space-l) var(--space-s) var(--space-xl); /* 8px 24px 8px 32px */
  background: var(--page-background);
  border-bottom: 1px solid var(--border);
}
```

### Side panel navigation

```
Width:       240px expanded · icon rail when collapsed
Height:      full viewport (column: menu ▸ footer ▸ powered-by)
Background:  var(--page-background)
Border:      Admin only - 1px solid var(--border), right side
             (the Web app panel has NO right border)
```

Menu container:

| System | Padding | Item gap |
|---|---|---|
| Web app | `16px` | 0 |
| Admin | `16px 12px 8px` (`--space-m --space-sm --space-s`, expanded; `LeftSidebar`) · `16px 8px` (collapsed, Figma only) | 4px (`--space-xs`) between top-level entries |

Footer:

| System | Content |
|---|---|
| Web app (expanded) | **Profile card** - `--input-background` fill, `padding: 8px 16px`, radius 12, full width: name Medium 14 `--text-primary` + email Regular 12 `--text-secondary` (2px column gap), 16px `Setting2` icon right (8px gap) |
| Admin | **Help block** - 5Mins Academy (`Teacher` 20px) and Help (`MessageQuestion` 20px) items, Regular 14 `--text-tertiary`, same item metrics as the menu |

Powered by (bottom row):

| System | Spec |
|---|---|
| Web app | `padding: 12px 24px` - "Powered by" Regular **10** `--text-tertiary` + logo at 12px height, 4px gap |
| Admin | `padding: 12px 28px` (Figma; `LeftSidebar` uses `12px`) - "Powered by" Regular **12** `--text-tertiary` + logo at 14px height, 4px gap |

CSS (Admin panel, matches `LeftSidebar`):

```css
.side-nav {
  width: 240px; min-width: 240px;
  display: flex; flex-direction: column;
  background: var(--page-background);
  border-right: 1px solid var(--border);       /* Admin only */
  padding: var(--space-m) var(--space-sm) var(--space-s);  /* 16px 12px 8px */
}
.side-nav__menu { flex: 1; display: flex; flex-direction: column; gap: var(--space-xs); }  /* 4px */

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
  padding: var(--space-sm) var(--space-m);     /* 12px 16px */
  padding-left: 42px;
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-tertiary);
}
.side-nav__sub-item:hover     { background: var(--input-background); }
.side-nav__sub-item--selected { font-weight: 700; color: var(--text-selected); }
```

### Breadcrumb

A chevron-separated trail. A horizontal list, `4px` gap between items. Each item is a label (Poppins **Regular 14px**, line-height 1.5; the app uses 14px, the Figma Library frames show 12px) followed by an `ArrowRight2` (Iconsax Linear, 16px) chevron separator, **except the last item**, which is the current page and has **no chevron**. Label↔chevron gap is `2px`. Same structure in both modes; all colours are semantic tokens, so it flips automatically.

### Mobile app navigation

The learner **mobile app** chrome (phone-frame prototype): a top header and a bottom tab bar.

**Bottom tab bar (375 x 66).** 5 equal-width tabs, in order: **Home** (Iconsax `Home` Bold), **Search** (`SearchNormal1` Bold), **Progress** (`Award` Bold), **Feed** (custom people-in-circle glyph, `src/components/icons/FeedIcon.tsx`, no Iconsax equivalent), **Profile** (`UserSquare` Bold).

- Container: `--page-background`, 1px top border `--border`, 16px/8px padding, no radius/shadow.
- Item: column, centred, 4px gap, 4px padding, flex 1. Icon 24px; label Poppins Regular **10px**/1.4 (literal in Figma, the one place below the normal type scale).
- Variant nodes: Enabled `50:29236`, Home `9105:1719`, Search `9105:1752`, Progress `9105:1785`, Feed `9105:1818`, Profile `9105:1851`.

**Top header (375 wide, per-page variants).** The Figma component includes the iOS status bar (clock "9:41" + signal/wifi/battery, 16px/4px padding) above the header row; the prototype component renders a lightweight equivalent. Header row: `--page-background`, 1px bottom border `--border`, **no divider on Home and Lesson feed**; **Lesson feed is fully transparent** (floats over content).

Shared elements:

- **Back button**: 40px circle, 8px padding around a 24px `ArrowLeft` Linear icon, radius full, `--input-background` fill (`rgba(15,16,20,0.5)` on Lesson feed, a fixed legibility fill over video, not the `--scrim` overlay token, which is mode-aware; see `layout.md` §7).
- **Header chips** (Home/Progress), per `mobile/TopNav.css`: selected = `--secondary-500` fill and border, Poppins Medium 14, `--text-on-selected` text (always-dark text on amber); unselected = transparent, 1px `--border-elevated`, Regular 14 `--text-secondary`. Both: `var(--space-xss) var(--space-sm)` (6px 12px) padding, `var(--radius-full)`, 8px gap; focus ring `2px solid var(--primary-button-background)`. (Figma draws selected Bold, 12px/8px padding, radius 24px.)
- Title is Bold 16 when alone, Bold 14 when paired with a leading icon (Skill).

## Variants

### Top nav variants

| Variant | Left | Right (CTA cluster) |
|---|---|---|
| **Web app · large** | Logo (content column is centred at 1536px, `padding-left: 32px`) | gap 24: **Get App** text button (Bold 14 `--text-secondary` + 20px `Mobile` icon, 4px gap) · **Create** outlined button (Bold 14 `--text-primary`, 1px `--text-primary` border, `8px 16px`, radius 8, + 20px `Add` icon) · icon group gap 16: `FlashCircle` 24px (4px padding) + events/calendar 24px with an 8px `--danger-500` notification dot at its top-right |
| **Admin · large** | Logo, with a 16px-gap slot before it for the sidebar expand/collapse control | gap 16: **Exit Admin** Outlined-2 Small button (Bold **12** `--text-primary`, 1px `--border-elevated` border, `8px 16px`, radius 12) · `Moon` (theme toggle) · `Logout` (Bold), both `--text-primary`; Figma draws them at 21px, the prototype uses 20px, the nearest icon-scale size |
| **Admin · small** (375) | Hamburger menu icon 32px | gap 12: **Exit Admin** (same as large) · 34×34 icon button (radius 4) with 21px logout icon |

- The Exit Admin button is the **Outlined-2** family (border follows text colour, not primary); see `buttons.md`.
- Icon-only buttons take the standard circular hover backdrop (`--page-background-hover`, radius-full).

### Menu items

**Web app.** Base: `padding: 16px` · radius 8 · icon **24px Iconsax Bold** · label **Regular 16**, 8px gap. Items: For You, Your Workspace, Knowledge Hub, Search, My Team, My Progress, Feed, Profile, Admin.

**Admin.** Base: `padding: 12px 16px` · radius 8 · icon **20px Iconsax Linear** · label **Regular 14**, 8px gap. Items: Home, People & Teams ▾, Content ▾, Automations, Reports, Skills, Learning Records, Events, Account & Settings.

**Expandable groups** (People & Teams, Content) append a 16px `ArrowDown2`/`ArrowUp2` chevron in `--text-tertiary`, right-aligned (label flexes). **Sub-menu items** are text-only rows: `padding: 12px 16px 12px 42px` (aligns text under the parent label), Regular 14 `--text-tertiary`. The reference is the component set `10372:4045` (full Menu/Sub-menu × selected × Enabled/Hover matrix), not the assembled panel `12048:2302`, which draws sub-items at 44px left / 8px vertical.

### Collapsed side panel

- **Web app:** icon-only tiles (`padding: 16px`, 24px Bold icons); a `Setting2` icon is pinned at the bottom of the menu column.
- **Admin:** 52×44 centred tiles, 20px Linear icons, 4px gap; panel keeps its right border.
- **Hover (collapsed, both):** the icon tile fills with `--input-background`, and a **tooltip flies out to the right**: left-pointing caret + `--tooltip-background` body, `padding: 8px 12px`, radius 8, label Regular 14 `--neutral-25`, Shadow L. Selected collapsed items show the amber Bold icon.

### Mobile top header variants

| Page variant | Node | Height | Contents |
|---|---|---|---|
| Home | `1092:34690` | 65px, 16px/12px pad | Chips left ("For You" selected / "Your Workspace"); right cluster 16px gap: 28px flash-circle + 28px bell with red Nudge dot |
| Search | `7632:8029` | 65px | Full-width search field: `--input-background` fill, 1px `--border`, radius 12px, 12px/8px padding, 18px magnifier, placeholder Poppins Regular 14 `--text-disabled` |
| Progress | `7632:8164` | 65px | Chips "My Team" / "My Progress" |
| Feed | `7632:8202` | 65px | Centred title Poppins Bold 16/1.5 `--text-primary` |
| Profile | `7632:8270` | auto, 16px/12px pad | 40px avatar with settings mini-badge (top-right, `--input-background`, 9px `setting-2` icon), name Bold 14 + role Regular 12 `--text-secondary` (2px gap); right 40px `--primary-500` circular add button |
| Detail page | `6162:9788` | auto, 16px/8px pad | Back button left, centred title Bold 16, empty 32px right spacer to keep the title centred |
| Skill | `8377:1056` | auto, 16px/8px pad | Back button, 24px skill illustration + title Bold **14**, right 24px vertical kebab |
| Lesson feed | `7645:4829` | auto, 16px/8px pad | Transparent; back button on a fixed `rgba(15,16,20,0.5)` legibility fill; right "45 Pt" Bold 12 + small trophy |
| Mobile web | `9465:24352` | n/a | Browser-chrome mock (white, Chrome URL pill "app.5mins.ai"), reference only, not built |

## States

### Side panel item states (both systems)

| State | Background | Icon | Label |
|---|---|---|---|
| Enabled | transparent | Bold 24 (Web) / Linear 20 (Admin), `--text-secondary` tone | Regular, `--text-secondary` (sub-items `--text-tertiary`) |
| Hover | `--input-background` | unchanged | unchanged |
| **Selected** | transparent | **amber Bold variant** | **Bold**, `--text-selected` (`#EDA30D` light / `#FFBB38` dark) |
| Selected + Hover | `--input-background` | amber Bold | Bold `--text-selected` |
| Open group with selected child (Admin) | `--page-background-hover` (Figma; `LeftSidebar` leaves it transparent) | unchanged | Regular `--text-secondary`, chevron up |

- Selection is expressed by **colour + weight only**, no filled amber row (unlike listbox items).
- `--text-selected` = `--secondary-600` light / `--secondary-500` dark, the text-safe amber ramp (see `colors.md`).

### Breadcrumb item states

| State | Applies to | Label colour | Notes |
|---|---|---|---|
| **Default** | Link items (all but last) | `--text-tertiary` | + trailing chevron |
| **Hover** | Link items | `--text-primary` | underline |
| **Disabled** | Link items | `--text-disabled` | non-interactive, `cursor: not-allowed` |
| **Current** | Last item | `--text-secondary` | no chevron, `aria-current="page"`, not a link |
| Separator | between items | `--text-tertiary` | `ArrowRight2`, 16px |
| Focus-visible | Link items | unchanged | `2px solid var(--primary-button-background)`, 2px offset |

### Mobile tab states

- **Selection**: icon fill + label switch from `--text-secondary` to `--selected` (amber). Nothing else: same Bold glyph in both states, no weight bump, no indicator dot/pill/underline, no badges. No hover/pressed states (touch).
- Header chips focus-visible: `2px solid var(--primary-button-background)`.

### TopNav icon buttons

- Hover: circular `--page-background-hover` backdrop, `var(--radius-full)`.

### Behaviour

- Expandable Admin groups toggle their sub-menu; expand/collapse animates per the project GSAP ease-in-out convention (`Collapse` component). The chevron flips between `ArrowDown2`/`ArrowUp2`.
- A group stays visually "open" (`--page-background-hover` row) while one of its children is selected.
- Collapsing the panel keeps the selected state on the icon (amber Bold); labels move into the flyout tooltip on hover.
- Selected item = current route; navigation items are links/buttons with `aria-current="page"` on the active one.

## Tokens

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--page-background` | `#F9F9FA` | `#20222A` | Bar + panel background |
| `--border` | `#DFE1E6` | `#2D313D` | Bottom / right hairline |
| `--input-background` | `#BFC2CC` @16% | `#454C5E` @16% | Item hover, profile card |
| `--page-background-hover` | `#EFF0F2` | `#2D313D` | Open-group row |
| `--text-selected` | `#EDA30D` | `#FFBB38` | Selected item label + icon |
| `--text-secondary` / `--text-tertiary` | per colors.md | per colors.md | Item / sub-item + footer labels |
| `--tooltip-background` | `#20222A` | `#20222A` | Collapsed-hover flyout |
| `--danger-500` | `#DF1642` | `#DF1642` | Notification dot (Web app top nav) |

## Accessibility

- The active navigation item carries `aria-current="page"` (side panel, Breadcrumb current item, mobile TabNav).
- TopNav icon buttons have an `aria-label` and a Tooltip naming the action; the theme toggle also carries `aria-pressed`. Hide the tooltip while the button's menu is open.
- Breadcrumb is a `<nav aria-label="Breadcrumb">`; links show the cyan focus ring `2px solid var(--primary-button-background)`, 2px offset.
- Mobile header chips show the same cyan focus ring.
- Collapsed side panel items expose their label through the flyout tooltip on hover.

## Examples

```tsx
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar'

// Selection follows the route; no props.
<LeftSidebar />
```

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

The learner **course-inside-a-program** header uses this component as the first child of `.pcd-header` (`pages/courses/ProgramCourseDetails.tsx`): `{Program} › {Course}` (the program links back to `/programs/{id}`, the course is the current page). It only renders when the course belongs to a program (`findProgramForCourse`).

## Related

- `buttons.md` - Outlined / Outlined-2 / text buttons in the top nav
- `alerts-toast.md` - the Tooltip spec (collapsed-hover flyout)
- `iconography.md` - Iconsax Bold (Web app) vs Linear (Admin) icon variants
- `5mins-colors` (colors.md) - `--text-selected` ramp and surface tokens
- `headers.md` - Page Header label slot (Breadcrumb)
- `listbox.md` - the Create Course Add Content picker (`src/pages/your-courses/components/AddContentMenu/`, Figma Create Course `10210:26756`) is a DS listbox with hover flyouts, not this menu-item language
- `impersonation-banner.md` - the locked learner Admin item (`AdminMenuItem`)
