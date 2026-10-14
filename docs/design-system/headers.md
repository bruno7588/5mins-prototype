---
name: 5mins-headers
description: Page Header and Section Header for 5Mins.ai - slot-based base component where the label row swaps between eyebrow metadata and breadcrumb, the navigation row swaps between tabs and chips, and the CTA cluster (search, AI icon button, outlined/filled buttons) is configurable. Use for any page or section heading, title bar, or header with actions.
---

# Headers

The Page Header names a page and holds its actions and tabs; the Section Header titles a block, card, drawer or modal inside it.

**Code:** no shared component yet. Section Header: `import SectionHeader from '@/pages/your-courses/components/SectionHeader/SectionHeader'` (page-local). Page Header: built per page with a page-prefixed class (e.g. `.roles-header` in `src/pages/roles/Roles.tsx`); the builder pages (Create Course, Program Builder, SCORM Create Course) share the page-local `src/pages/your-courses/components/PageHeader/PageHeader.tsx`.
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `Header` component set dark `7902:1019` / light `11921:13215` (mode frames dark `7902:1018` / light `9531:2974`)
**Last verified:** 2026-09-29

The base component exposes three swappable slots: **label** (eyebrow metadata ↔ breadcrumb), **header** (headline + CTA cluster), and **navigation** (tabs ↔ chips).

## Usage

### Page Header

**Intent:** name the page, say what it is for, and hold the page-level actions and section tabs in one predictable block at the top.

**Use when**
- The top of any admin or learner page.

**Don't use when**
- Titling a card, drawer, modal or a block within a page → use the Section Header (below)
- The app bar itself → TopNav ([doc](navigation.md))

**Do**
- Render the title as `<h2>` at 24px Bold `--text-primary`, with the description at 16px Regular `--text-secondary` 4px below it.
- Put a 1px `--border` divider between the headline block and the tabs.
- Use the Breadcrumb component in the label slot when the page sits under a parent ([doc](navigation.md)).
- Mark up tabs as `role="tablist"` with `role="tab"` and `aria-selected`.
- Keep header CTAs right-aligned with a 16px gap (`var(--space-m)`); icon-only CTAs keep the circular hover.
- Button labels are Title Case; the title and description are sentence case.

**Don't**
- Don't nest a second row of tabs inside a page that already has tabs; filter within a tab with chips instead ([doc](chips-switcher-tabs.md)).
- Don't use a Content Switcher for page sections; tabs are for sibling sections, the switcher for two views of one object.
- Don't use raw hex or `--neutral-*` for header text; semantic `--text-*` tokens only.

**Canonical spec:** title Poppins Bold 24px/1.5 `--text-primary`; description Regular 16px/1.5 `--text-secondary`; section gap `var(--space-m)` (16px); title/description gap `var(--space-xs)` (4px); CTA gap `var(--space-m)` (16px; Figma draws 12px); tabs gap `var(--space-m)` (16px); divider `1px var(--border)`. Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `9531:2974` / dark `7902:1018`.

**Prototype:** no shared component. Each page builds its own header with a page-prefixed class, e.g. `.roles-header` in `src/pages/roles/Roles.tsx` (24px title group, divider, tabs) and `.cd-header` in `src/pages/your-courses/CourseDetails.tsx` (CTA cluster at 16px gap, tabs). The builder pages use the page-local `PageHeader` (title, Save Draft / primary action, close, tabs). The composition reference under Examples describes a `PageHeader` API that does not exist; treat it as a composition reference.

### Section Header

**Intent:** title a block inside a page, card, drawer or modal, with optional description, actions and a rule underneath.

**Use when**
- The title of a drawer or modal form, a card, or a titled block within a page.

**Don't use when**
- The top of a page → use the Page Header (above)
- Confirm dialogs (ConfirmModal) → follow the dialog title spec ([doc](overlays.md))

**Do**
- Render the title as `<h3>` at 20px Bold, description 14px Regular `--text-secondary`.
- Put CTAs in the `ctas` slot and a back button (multi-step drawer) in the `leading` slot.
- Keep the 1px divider under the headline to separate it from the form or content below. It is `--border` everywhere, including drawers and modals (their panels are `--page-background`).

**Don't**
- Don't hand-roll a new title block for a drawer or modal; reuse the Section Header.

**Canonical spec:** title Bold 20px/1.5 `--text-primary`; description Regular 14px/1.5 `--text-secondary`; title/description gap `var(--space-xs)` (4px); CTA gap `var(--space-m)` (16px); divider `1px var(--border)`; section gap `var(--space-m)` (16px; Figma draws 12px). Figma: Library `EC26cSVe9KNTCWXvYovakw`, light `9531:2974` / dark `7902:1018`.

**Prototype:** `src/pages/your-courses/components/SectionHeader/SectionHeader.tsx` (page-local, used by the course drawers and modals). It renders an `<h3>` title (20px Bold) with the description 4px below, the `ctas` cluster on the right (16px gap), and always draws the 1px `--border` divider under the headline, 16px below it. It has no eyebrow, tabs, chips, icon or avatar slots; compose those around it if a design needs them.

### When to use each header

| Scenario | Use | Reason |
|----------|-----|--------|
| Top of a page | Page Header | Main page identification, breadcrumb navigation |
| Inside a card | Section Header | Smaller typography fits card context |
| Modal header | Section Header | Compact spacing for modals |
| Dashboard widget | Section Header | Content grouping within page |
| Settings section | Section Header | Organising settings groups |
| Course detail page | Page Header | Main page with breadcrumb to library |
| Course list within page | Section Header | Secondary content area |

## Figma to code

**Header** (component set `7902:1019` / `11921:13215`)

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Type | Page / Section | n/a (component choice) | Page: per-page header or builder `PageHeader`; Section: `SectionHeader` | no single Header component in code |
| Label (slot) | eyebrow or breadcrumb | n/a | compose `Breadcrumb` ([doc](navigation.md)) or an eyebrow row | `SectionHeader` has no label slot |
| Header (slot) | headline + CTA cluster | `title`, `description`, `ctas`, `leading` (`SectionHeader`) | `string`, `ReactNode`, `ReactNode`, `ReactNode` | builder `PageHeader`: `title`, `leadingAction`, `primaryAction`, `secondaryLabel`, `primaryLabel`, `primaryIcon`, `onPrimary`, `onSecondary`, `onClose` |
| Navigation (slot) | tabs or chips | builder `PageHeader`: `tabs`, `activeTab`, `onTabChange`, `tabsAction` | `{ label, disabled? }[]` | `SectionHeader` has no navigation slot; chips compose `Chip` ([doc](chips-switcher-tabs.md)) |

Slot contents shared by both headers in the Figma base:

| Property | Description |
|----------|-------------|
| **eyebrow** | Metadata row with icon and label |
| **ctas** | Action buttons (search, dropdown, more menu, buttons) |
| **description** | Supporting text below title |
| **tabs** | Tab navigation below divider |
| **chips** | Filter chips below divider |
| **icon** | Icon displayed next to title |
| **avatar** | User avatar displayed next to title |
| **breadcrumb** | Navigation breadcrumb trail (Page Header only) |

`SectionHeader` props:

```tsx
interface SectionHeaderProps {
  title: string
  /** Rich content allowed: some headers carry an inline status colour. */
  description?: ReactNode
  ctas?: ReactNode
  /** Optional control before the title, e.g. a back button on a multi-step drawer. */
  leading?: ReactNode
}
```

- **Figma only:** the eyebrow, icon and avatar slot contents; Section Header tabs and chips; `Type` as a property (code picks a component instead).
- **Code only:** `SectionHeader` `leading`; builder `PageHeader` `tabsAction`, `hideSecondary`, `secondaryDisabled`, `primaryDisabled`, `onClose` and disabled tabs (`.ui-disabled`).

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Page Header | _to be mapped by engineering_ | | |
| Section Header | _to be mapped by engineering_ | | |

## Anatomy

### Page Header

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Eyebrow: 📚 Course  ▶ 17 lessons  ⏱ 20 min]                        │
│ ─── OR ───                                                          │
│ [Breadcrumb > Breadcrumb > Current]           [Search] [⋯] [Btn] [Btn+] │
├─────────────────────────────────────────────────────────────────────┤
│ [Avatar/Icon]  Title of this page             [CTAs if no breadcrumb]│
│                Supporting text (description)                         │
├─────────────────────────────────────────────────────────────────────┤
│ ───────────────────── Divider ─────────────────────                 │
├─────────────────────────────────────────────────────────────────────┤
│ [Tab Name]  [Tab Name]  [Tab Name]  ─── OR ───  [Chip] [Chip] [Chip]│
└─────────────────────────────────────────────────────────────────────┘
```

### Section Header

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Eyebrow: 📚 Label]              [Search] [Dropdown] [⋯] [Btn] [Btn+]│
├─────────────────────────────────────────────────────────────────────┤
│ [Icon]  Title of this section/modal                                 │
│         Supporting text (description)                               │
├─────────────────────────────────────────────────────────────────────┤
│ ───────────────────── Divider ─────────────────────                 │
├─────────────────────────────────────────────────────────────────────┤
│ [Tab Name]  [Tab Name]  ─── OR ───  [Chip] [Chip] [Chip]            │
└─────────────────────────────────────────────────────────────────────┘
```

### CTA cluster (reference composition)

The `ctas` slot is free-form, but the Figma base ships this reference layout, right-aligned with a **12px gap** (the prototype pages use 16px, `var(--space-m)`):

1. **Search field** - 400px wide (Page) / 300px (Section); `--input-background` fill, 1px `--border`, radius 12, `8px 12px` padding, 18px search icon, placeholder Regular 14 `--text-disabled` (see `search.md`)
2. **AI icon button** - 40px circular hit area (`radius-full`), 24px AI-sparkle icon
3. **Outlined button** - Medium (see `buttons.md`)
4. **Filled button with trailing add icon** - Medium

Swap, drop, or reorder items per page needs; icon-only buttons always keep the circular hover.

### CSS class prefixes

| Component | Prefix |
|-----------|--------|
| Page Header | `.page-header__*` |
| Section Header | `.section-header__*` |

## Variants

| Component | Purpose | Title size | Gap | Unique feature |
|-----------|---------|------------|-----|----------------|
| **Page Header** | Main page identification | 24px (`<h2>`) | 16px | Breadcrumb support |
| **Section Header** | Content sections, modals | 20px (`<h3>`) | 16px (Figma 12px) | Compact layout |

Page Header compared with Section Header:

| Element | Page Header | Section Header |
|---------|-------------|----------------|
| Title | 24px Bold | 20px Bold |
| Description | 16px Regular | 14px Regular |
| Section gap | 16px | 16px (Figma 12px) |
| Title/description gap | 4px | 4px |
| CTA cluster gap | 16px (Figma 12px) | 16px (Figma 12px) |
| Eyebrow icon / text | 16px / 14px (1.5) | 14px / 12px (1.2) |
| Tab selected | 14px Bold | 14px Bold |
| Tab unselected | 14px Medium | 14px Medium |
| Tabs gap | 16px | 20px (Figma; no prototype tabs) |
| Chip | 14px | 14px |
| Chips gap | 16px | 16px |
| Search width (reference) | 400px | 300px |

### Slot combinations by page type

| Use case | Properties |
|----------|------------|
| Simple page | title only |
| Detail page | breadcrumb, ctas, description |
| Course page | eyebrow, description, tabs |
| List/filter page | breadcrumb, ctas, chips |
| Profile page | avatar, breadcrumb, ctas |
| Category page | icon, breadcrumb, description |

| Page type | eyebrow | breadcrumb | ctas | description | tabs | chips | icon | avatar |
|-----------|:-------:|:----------:|:----:|:-----------:|:----:|:-----:|:----:|:------:|
| Dashboard | - | - | ✓ | ✓ | - | - | - | - |
| Course detail | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | - |
| Course list | - | ✓ | ✓ | - | - | ✓ | - | - |
| User profile | - | ✓ | ✓ | ✓ | ✓ | - | - | ✓ |
| Team list | - | ✓ | ✓ | ✓ | - | ✓ | - | - |
| Settings | - | ✓ | - | ✓ | ✓ | - | - | - |

## States

| Element | State | Tokens |
|---|---|---|
| Tab | Selected | 14px Bold `--text-primary` |
| Tab | Unselected | 14px Medium `--text-secondary` |
| Chip | Selected | 14px Bold `--neutral-800` |
| Chip | Unselected | 14px Regular `--text-secondary` |
| Breadcrumb | Link / current | `--text-tertiary` / `--text-secondary` (hover and disabled: [navigation.md](navigation.md)) |
| Breadcrumb link, tab, chip | Focus-visible | `outline: 2px solid var(--primary-button-background)`, `outline-offset: 2px` |

Colours are the same in both modes through the semantic tokens; see Tokens for the light and dark values.

## Tokens

### Typography (Page Header)

| Element | Size | Weight | Line height | Colour |
|---------|------|--------|-------------|-------|
| Title | 24px | Bold (700) | 1.5 | `--text-primary` |
| Description | 16px | Regular (400) | 1.5 | `--text-secondary` |
| Breadcrumb link | 14px | Regular (400) | 1.5 | `--text-tertiary` |
| Breadcrumb current | 14px | Regular (400) | 1.5 | `--text-secondary` |
| Eyebrow metadata | 14px | Regular (400) | 1.5 | `--text-tertiary` |
| Tab selected | 14px | Bold (700) | 1.5 | `--text-primary` |
| Tab unselected | 14px | Medium (500) | 1.5 | `--text-secondary` |
| Chip selected | 14px | Bold (700) | 1.5 | `--neutral-800` |
| Chip unselected | 14px | Regular (400) | 1.5 | `--text-secondary` |

### Spacing (Page Header)

| Element | Value |
|---------|-------|
| Section gap | 16px (`--space-m`) |
| Breadcrumb item gap | 4px (`--space-xs`) |
| Eyebrow item gap | 8px (`--space-s`) |
| Eyebrow internal gap | 4px (`--space-xs`) |
| Title/description gap | 4px (`--space-xs`) |
| CTA cluster gap | 16px (`--space-m`; Figma 12px) |
| Tabs gap | 16px (`--space-m`) |
| Chips gap | 16px (`--space-m`) |

### Colours

| Token | Light mode | Dark mode |
|-------|------------|-----------|
| `--text-primary` | #20222A | #F9F9FA |
| `--text-secondary` | #454C5E | #BFC2CC |
| `--text-tertiary` | #656B7C | #9EA4B3 |
| `--border` | #DFE1E6 | #2D313D |
| `--selected` | #EDA30D | #FFBB38 |
| `--primary-button-background` | #00AFC4 | #00AFC4 |

## Accessibility

- Page Header titles are `<h2>`; Section Header titles are `<h3>`. Pages do not render an `<h1>`.
- Breadcrumb is a `<nav aria-label="Breadcrumb">` with `aria-current="page"` on the last item.
- Tabs use `role="tablist"` / `role="tab"` with `aria-selected`; filter chips use `aria-pressed`.
- Every breadcrumb link, tab and chip shows the cyan focus ring on `:focus-visible`.

```tsx
// Breadcrumb navigation
<nav aria-label="Breadcrumb">
  <a href="/library">Library</a>
  <span aria-hidden="true"><ArrowRight2 /></span>
  <span aria-current="page">Current Page</span>
</nav>

// Tabs
<div role="tablist">
  <button role="tab" aria-selected="true">Active Tab</button>
  <button role="tab" aria-selected="false">Other Tab</button>
</div>

// Chips (filter)
<button aria-pressed="true">Selected Chip</button>
<button aria-pressed="false">Unselected Chip</button>
```

```css
.page-header__breadcrumb-link:focus-visible,
.page-header__tab:focus-visible,
.page-header__chip:focus-visible {
  outline: 2px solid var(--primary-button-background);
  outline-offset: 2px;
}
```

Heading hierarchy:

```html
<main>
  <PageHeader title="Team Dashboard" />           <!-- h2 -->
  
  <SectionHeader title="Your Progress" />         <!-- h3 -->
  <!-- Progress cards -->
  
  <SectionHeader title="Assigned Courses" />      <!-- h3 -->
  <!-- Course list -->
  
  <SectionHeader title="Team Activity" />         <!-- h3 -->
  <!-- Activity feed -->
</main>
```

## Content

- Title and description are sentence case; button labels are Title Case.

## Examples

### Section Header

```tsx
import SectionHeader from '@/pages/your-courses/components/SectionHeader/SectionHeader'

// Drawer or modal title with description and a close button
<SectionHeader
  title="Attach media"
  description="Add an image or audio file to your quiz"
  ctas={<CloseButton onClick={handleClose} />}
/>

// Multi-step drawer: a back control goes in `leading`
<SectionHeader title="Choose questions" leading={backButton} />
```

### Breadcrumb in the label slot

Use the shared component ([doc](navigation.md)); the last entry renders as the current page:

```tsx
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'

<Breadcrumb items={[{ label: 'Courses', onClick: () => navigate('/courses') }, { label: 'Fire safety' }]} />
```

### Chips in the navigation slot

Use the shared component ([doc](chips-switcher-tabs.md)):

```tsx
import Chip from '@/components/Chip/Chip'

<Chip label="Compliance" selected={filter === 'compliance'} onClick={() => setFilter('compliance')} />
```

### Page Header composition reference

There is no shared `PageHeader` with this API. The types, component and usages below show how the slots compose; build the page's own header with a page-prefixed class.

#### Types

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EyebrowMeta {
  icon?: ReactNode;
  label: string;
}

interface TabItem {
  label: string;
  value: string;
  href?: string;
}

interface ChipItem {
  label: string;
  value: string;
}

interface PageHeaderProps {
  // Core content
  title: string;
  description?: string;
  
  // Feature toggles (matching Figma properties)
  eyebrow?: {
    category: EyebrowMeta;
    lessons?: number;
    duration?: string;
  };
  breadcrumb?: BreadcrumbItem[];
  ctas?: ReactNode;
  tabs?: {
    items: TabItem[];
    activeValue: string;
    onChange?: (value: string) => void;
  };
  chips?: {
    items: ChipItem[];
    selectedValues: string[];
    onChange?: (values: string[]) => void;
  };
  icon?: ReactNode;
  avatar?: {
    src: string;
    alt: string;
  };
}
```

#### Component

```tsx
export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumb,
  ctas,
  tabs,
  chips,
  icon,
  avatar
}: PageHeaderProps) {
  const hasBottomSection = tabs || chips;
  
  return (
    <header className="page-header">
      {/* Row 1: Breadcrumb OR Eyebrow with CTAs */}
      {(breadcrumb || eyebrow || ctas) && (
        <div className="page-header__top-row">
          {eyebrow && (
            <div className="page-header__eyebrow">
              <div className="page-header__eyebrow-item">
                {eyebrow.category.icon && (
                  <span className="page-header__eyebrow-icon">
                    {eyebrow.category.icon}
                  </span>
                )}
                <span>{eyebrow.category.label}</span>
              </div>
              {eyebrow.lessons && (
                <div className="page-header__eyebrow-item">
                  <PlayCircle size={12} />
                  <span>{eyebrow.lessons} lessons</span>
                </div>
              )}
              {eyebrow.duration && (
                <div className="page-header__eyebrow-item">
                  <Clock size={15} />
                  <span>{eyebrow.duration}</span>
                </div>
              )}
            </div>
          )}
          
          {breadcrumb && (
            <nav className="page-header__breadcrumb" aria-label="Breadcrumb">
              {breadcrumb.map((item, index) => (
                <div key={index} className="page-header__breadcrumb-item">
                  {item.href ? (
                    <>
                      <a href={item.href} className="page-header__breadcrumb-link">
                        {item.label}
                      </a>
                      <ArrowRight2 size={16} className="page-header__breadcrumb-separator" />
                    </>
                  ) : (
                    <span className="page-header__breadcrumb-current">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
          
          {ctas && (
            <div className="page-header__ctas">
              {ctas}
            </div>
          )}
        </div>
      )}
      
      {/* Row 2: Title with optional Icon/Avatar */}
      <div className="page-header__headline">
        {(icon || avatar) && (
          <div className="page-header__media">
            {avatar ? (
              <img 
                src={avatar.src} 
                alt={avatar.alt} 
                className="page-header__avatar"
              />
            ) : icon}
          </div>
        )}
        <div className="page-header__title-group">
          <h2 className="page-header__title">{title}</h2>
          {description && (
            <p className="page-header__description">{description}</p>
          )}
        </div>
      </div>
      
      {/* Divider (shown when tabs or chips present) */}
      {hasBottomSection && (
        <div className="page-header__divider" />
      )}
      
      {/* Row 3: Tabs OR Chips */}
      {tabs && (
        <div className="page-header__tabs" role="tablist">
          {tabs.items.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={tab.value === tabs.activeValue}
              className={`page-header__tab ${
                tab.value === tabs.activeValue ? 'page-header__tab--active' : ''
              }`}
              onClick={() => tabs.onChange?.(tab.value)}
            >
              {tab.label}
              {tab.value === tabs.activeValue && (
                <span className="page-header__tab-indicator" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {chips && (
        <div className="page-header__chips">
          {chips.items.map((chip) => {
            const isSelected = chips.selectedValues.includes(chip.value);
            return (
              <button
                key={chip.value}
                className={`page-header__chip ${
                  isSelected ? 'page-header__chip--selected' : ''
                }`}
                onClick={() => {
                  const newValues = isSelected
                    ? chips.selectedValues.filter(v => v !== chip.value)
                    : [...chips.selectedValues, chip.value];
                  chips.onChange?.(newValues);
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
```

**Usages**

#### Minimal (title only)

```tsx
<PageHeader title="Dashboard" />
```

#### With description

```tsx
<PageHeader 
  title="Team Dashboard" 
  description="Manage your team's learning progress"
/>
```

#### With breadcrumb and CTAs

```tsx
<PageHeader 
  title="Food Safety Training"
  description="Essential food handling protocols"
  breadcrumb={[
    { label: "Library", href: "/library" },
    { label: "Compliance", href: "/library/compliance" },
    { label: "Food Safety" }
  ]}
  ctas={
    <>
      <Search placeholder="Search" />
      <IconButton icon={<More />} />
      <Button variant="outlined">Preview</Button>
      <Button icon={<Add />}>Assign</Button>
    </>
  }
/>
```

#### With eyebrow metadata and tabs

```tsx
<PageHeader 
  title="Workplace Safety Course"
  description="Learn essential safety protocols"
  eyebrow={{
    category: { icon: <BookIcon />, label: "Course" },
    lessons: 17,
    duration: "20 min"
  }}
  tabs={{
    items: [
      { label: "Overview", value: "overview" },
      { label: "Lessons", value: "lessons" },
      { label: "Assessment", value: "assessment" },
    ],
    activeValue: "overview",
    onChange: setActiveTab
  }}
/>
```

#### With chips filter

```tsx
<PageHeader 
  title="Course Library"
  description="Browse all available courses"
  breadcrumb={[
    { label: "Home", href: "/" },
    { label: "Library" }
  ]}
  chips={{
    items: [
      { label: "All", value: "all" },
      { label: "Compliance", value: "compliance" },
      { label: "Safety", value: "safety" },
      { label: "Onboarding", value: "onboarding" },
    ],
    selectedValues: ["all"],
    onChange: setFilters
  }}
  ctas={
    <>
      <Search />
      <Button variant="outlined">Export</Button>
      <Button icon={<Add />}>Add Course</Button>
    </>
  }
/>
```

#### With avatar (user profile)

```tsx
<PageHeader 
  title="John Smith"
  description="Senior Training Manager"
  avatar={{
    src: "/avatars/john.jpg",
    alt: "John Smith"
  }}
  breadcrumb={[
    { label: "Team", href: "/team" },
    { label: "John Smith" }
  ]}
  ctas={
    <Button variant="outlined">Edit Profile</Button>
  }
/>
```

#### With icon (course or category)

```tsx
<PageHeader 
  title="Food Safety Essentials"
  description="4 lessons • 15 minutes"
  icon={<CourseIcon size={48} />}
  breadcrumb={[
    { label: "Library", href: "/library" },
    { label: "Food Safety" }
  ]}
  ctas={
    <>
      <Button variant="outlined">Preview</Button>
      <Button>Start Course</Button>
    </>
  }
/>
```

## Related

- [navigation.md](navigation.md): Breadcrumb, TopNav
- [chips-switcher-tabs.md](chips-switcher-tabs.md): tabs, chips, Content Switcher
- [search.md](search.md): search field in the CTA cluster
- [buttons.md](buttons.md): CTA buttons
- [overlays.md](overlays.md): drawer, modal and dialog titles
