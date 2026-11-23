---
name: 5mins-mobile
description: Foundations for the 5Mins learner mobile app (native) - always dark, no hover or tooltips, the 375px screen frame, body padding and gaps, the compact type scale, button sizes per placement, and where each component's mobile spec lives. Read before building or changing any screen under /mobile.
---

# Mobile app

The rules every learner mobile app screen shares. Component specs stay in their own docs (each has a Mobile section or `device="mobile"` variant); this page holds what is true across all of them.

**Code:** screens in `src/pages/mobile/`, mobile-only components in `src/components/mobile/<Name>/` (CSS prefix `m-`), shell `PhoneFrame` + `TopNav` + `TabNav`; the app opens at `/mobile` (Demos pill → Native App)
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, Screens template `Type=Mobile App` `7632:8501`; Top nav/ App `1910:18375`; Tab nav `1324:35285`
**Last verified:** 2026-11-18

## Usage

**Intent:** a phone-first learner app that feels native: one column, touch only, dark, with the same tokens and components as web.

**Use when**
- Building or changing any screen that renders inside `PhoneFrame` (`/mobile`).

**Don't use when**
- The learner web app at a narrow width (mobile web, under 600px, `LearnerMobileNav`) → that is the web app, it follows the theme and keeps web rules ([doc](navigation.md))
- Admin screens → web only

**Do**
- Render inside `PhoneFrame`; it pins `data-theme="dark"`, so use semantic tokens and let them resolve to dark.
- Use the shared mobile components first (`src/components/mobile/`), then the shared web components with their mobile variant (`device="mobile"` on `EmptyState`, `StatTile`; the Mobile app variant of `ResourceCard`; `BottomSheet`).
- Lay content out in one column inside 16px body padding with 16px between blocks.
- Put details and short option sets in a `BottomSheet`; give long or multi-step work its own screen with a back button.
- Keep links inside the app (in-app web view), so back returns to where the learner was.

**Don't**
- Don't add hover states; there is no pointer. Pressed and focus states only.
- Don't add DS Tooltips or info-icon tooltips; put the explanation in the content or a sheet.
- Don't design a light mode for the app.
- Don't hand-roll a card, sheet or nav that exists in `src/components/mobile/`.
- Don't use desktop-only overlays (Modal, Side Drawer) in the app.

**Canonical spec:** screen 375 x 812, `var(--page-background)`; status bar then Top nav (64px, 12px 16px padding, 1px `var(--border)` bottom, none on Home and Lesson feed); Body padding `var(--space-m)` (16px) all round, blocks `var(--space-m)` apart, content 343px wide; Tab nav at the foot (8px 16px padding, 1px `var(--border)` top); dark only; no hover, no tooltips.

## Figma to code

| Figma | Figma values | Code | Notes |
|---|---|---|---|
| Screens > Type | Mobile App | `PhoneFrame` + `TopNav` + `TabNav` | No shared screen component; each screen in `src/pages/mobile/` |
| Screens > Body (slot) | content | screen body | 16px padding, 16px gap |
| Top nav/ App > Page | Home / Search / Progress / Feed / Profile / Detail page / Skill / Lesson feed | `TopNav` `variant` | 'home' / 'search' / 'chips' / 'title' / 'profile' / 'detail' / 'skill' / 'lesson-feed' |
| Tab nav > Page | Enabled / Home / Search / My Learning / My Team / Feed | `TabNav` `active` | undefined / 'home' / 'search' / 'learning' / 'team' / 'feed' |
| Device (on shared components) | Mobile | `device="mobile"` | EmptyState, StatTile |

- **Figma only:** the iOS status bar (the prototype draws a lightweight equivalent).
- **Code only:** `PhoneFrame` bezel (prototype presentation, not part of the app).

## Layout

| Relationship | Value |
|---|---|
| Body padding | 16px `--space-m` |
| Block → block | 16px `--space-m` |
| Inside a card or row | 8px `--space-s` or 12px `--space-sm` |
| Icon ↔ label | 4px `--space-xs` or 8px `--space-s` |
| Two-up tiles (summary stats) | two per row, 16px gap |
| Bottom sheet padding | 0 16px 32px, 8px between items ([doc](overlays.md)) |

Full web and app composition table: [layout.md](layout.md) Page composition.

## Type

The app runs one step smaller than web: body is 14px, not 16px.

| Role | Style | Token |
|---|---|---|
| Screen heading (rare, e.g. a hero number) | H3 Bold 20/1.5 | `--font-size-h3` |
| Top nav title | Bold 16 alone, Bold 14 beside a leading icon | `--font-size-h4` / `--font-size-h5` |
| Card or section title | H4 Bold 16 or H5 Bold 14 | `--font-size-h4` / `--font-size-h5` |
| Body, list text, chips | Regular or Medium 14/1.5 | `--font-size-md` |
| Meta, captions, stat labels | Regular 12/1.2 | `--font-size-sm` |
| Tab bar label | Regular 10/1.4 | literal, the one sanctioned size below the scale ([doc](typography.md)) |

## Buttons

| Placement | Size |
|---|---|
| The screen's one primary action, full width at the foot (Sign Off, Download Certificate screen) | Large, `width: 100%` |
| Actions inside content or a sheet (Log Out, Download Certificate in a sheet) | Medium |
| A call to action inside a card (course sign-off card) | Small |

Labels in Title Case, as on web ([doc](buttons.md)). Row chevrons are `--text-secondary`.

## States

| State | Treatment |
|---|---|
| Enabled | as specified per component |
| Hover | none in the app |
| Pressed | the component's pressed token where it has one |
| Focus-visible | `outline: 2px solid var(--focus-ring); outline-offset: 2px` |
| Disabled / not built | `--text-disabled` / `--button-background-disabled`; unbuilt controls `.ui-disabled` |

Surfaces: cards `var(--cards-background)` with no shadow (Shadow S is light mode only, so `var(--shadow-card)` resolves to none in the app); mobile list cards radius 8px.

## Where the mobile specs live

| Need | Doc |
|---|---|
| Top nav variants, tab bar, tab states | [navigation.md](navigation.md) Mobile app navigation |
| Lesson, Assessment, Course, Category, Instructor mobile cards | [cards.md](cards.md) Mobile cards |
| Bottom sheet | [overlays.md](overlays.md) Bottom Sheet (mobile) |
| Summary stat tiles | [summary-stat.md](summary-stat.md) Mobile variant |
| Empty states | [empty-state.md](empty-state.md) `Device=Mobile` |
| Course resources | [resource-card.md](resource-card.md) Mobile app variant |
| Quiz and scheduled badges | [badges.md](badges.md) App extensions |
| Levels, streaks, quiz-type and certificate art | [gamification.md](gamification.md) |

## Accessibility

- Every tappable element is a `<button>` or link with an accessible name; icon-only controls carry an `aria-label` (no tooltip in the app).
- Focus-visible rings stay on, for keyboard and switch access.
- Bottom sheets trap focus, close on Escape, overlay tap and drag, and return focus on close.
- Respect reduced motion on sheet and screen transitions ([doc](motion.md)).
- Contrast is checked against the dark tokens only.

## Not yet specified

No Library source yet; ask before deciding:
- Minimum touch target size
- Safe-area insets beyond the status bar and tab bar
- A pressed state for cards and rows

## Related

[layout.md](layout.md) · [typography.md](typography.md) · [navigation.md](navigation.md) · [cards.md](cards.md) · [overlays.md](overlays.md) · [colors.md](colors.md)
