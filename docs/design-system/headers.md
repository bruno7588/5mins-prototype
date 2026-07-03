
# 5Mins.ai Header Component System

Complete header implementation matching the Figma design system with Page Headers and Section Headers.

## Component Overview

| Component | Purpose | Title Size | Gap | Unique Feature |
|-----------|---------|------------|-----|----------------|
| **Page Header** | Main page identification | 24px (H2) | 20px | Breadcrumb support |
| **Section Header** | Content sections, modals | 20px (H3) | 16px | Compact layout |

Both components share the same configurable properties:

| Property | Description |
|----------|-------------|
| **eyebrow** | Metadata row with icon and label |
| **ctas** | Action buttons (search, dropdown, more menu, buttons) |
| **description** | Supporting text below title |
| **tabs** | Tab navigation below divider |
| **chips** | Filter chips below divider |
| **icon** | Icon displayed next to title |
| **avatar** | User avatar displayed next to title |

**Page Header only:**
| Property | Description |
|----------|-------------|
| **breadcrumb** | Navigation breadcrumb trail |

---

## Page Header

Primary header for page-level identification. Uses larger typography (24px title).

## Visual Structure

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

## Design Tokens

### Typography

| Element | Size | Weight | Line Height | Color |
|---------|------|--------|-------------|-------|
| Title | 24px | Bold (700) | 1.5 | `--text-primary` |
| Description | 16px | Regular (400) | 1.5 | `--text-secondary` |
| Breadcrumb link | 12px | Regular (400) | 1.2 | `--text-tertiary` |
| Breadcrumb current | 12px | Regular (400) | 1.2 | `--text-secondary` |
| Eyebrow metadata | 14px | Regular (400) | 1.5 | `--text-tertiary` |
| Tab selected | 14px | Bold (700) | 1.5 | `--text-primary` |
| Tab unselected | 14px | Medium (500) | 1.5 | `--text-secondary` |
| Chip selected | 14px | Bold (700) | 1.5 | `--neutral-800` |
| Chip unselected | 14px | Regular (400) | 1.5 | `--text-secondary` |

### Spacing

| Element | Value |
|---------|-------|
| Section gap | 16px (`--space-m`) |
| Breadcrumb item gap | 4px (`--space-xs`) |
| Eyebrow item gap | 8px (`--space-s`) |
| Eyebrow internal gap | 4px (`--space-xs`) |
| Title/description gap | 4px (`--space-xs`) |
| CTA buttons gap | 16px (`--space-m`) |
| Tabs gap | 24px (`--space-l`) |
| Chips gap | 16px (`--space-m`) |

### Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--text-primary` | #20222A | #F9F9FA |
| `--text-secondary` | #454C5E | #BFC2CC |
| `--text-tertiary` | #656B7C | #9EA4B3 |
| `--border` | #DFE1E6 | #383D4C |
| `--selected` | #FFBB38 | #FFBB38 |
| `--button-background` | #00CEE6 | #00CEE6 |

## React TypeScript Implementation

### Types

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

### Component

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
          <h1 className="page-header__title">{title}</h1>
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

## Usage Examples

### Minimal (Title Only)

```tsx
<PageHeader title="Dashboard" />
```

### With Description

```tsx
<PageHeader 
  title="Team Dashboard" 
  description="Manage your team's learning progress"
/>
```

### With Breadcrumb and CTAs

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

### With Eyebrow Metadata and Tabs

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

### With Chips Filter

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

### With Avatar (User Profile)

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

### With Icon (Course/Category)

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

## Sub-Components

### Breadcrumb Item

```tsx
interface BreadcrumbItemProps {
  type: 'link' | 'current';
  label: string;
  href?: string;
}

function BreadcrumbItem({ type, label, href }: BreadcrumbItemProps) {
  if (type === 'current') {
    return (
      <span className="page-header__breadcrumb-current">{label}</span>
    );
  }
  
  return (
    <div className="page-header__breadcrumb-item">
      <a href={href} className="page-header__breadcrumb-link">{label}</a>
      <ArrowRight2 size={16} className="page-header__breadcrumb-separator" />
    </div>
  );
}
```

### Tab Item

```tsx
interface TabItemProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function TabItem({ label, selected, onClick }: TabItemProps) {
  return (
    <button
      role="tab"
      aria-selected={selected}
      className={`page-header__tab ${selected ? 'page-header__tab--active' : ''}`}
      onClick={onClick}
    >
      {label}
      {selected && <span className="page-header__tab-indicator" />}
    </button>
  );
}
```

### Chip

```tsx
interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      className={`page-header__chip ${selected ? 'page-header__chip--selected' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
```

## Accessibility

### ARIA Attributes

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

### Focus States

```css
.page-header__breadcrumb-link:focus-visible,
.page-header__tab:focus-visible,
.page-header__chip:focus-visible {
  outline: 2px solid var(--primary-600);
  outline-offset: 2px;
}
```

## Quick Reference

### Property Combinations

| Use Case | Properties |
|----------|------------|
| Simple page | title only |
| Detail page | breadcrumb, ctas, description |
| Course page | eyebrow, description, tabs |
| List/filter page | breadcrumb, ctas, chips |
| Profile page | avatar, breadcrumb, ctas |
| Category page | icon, breadcrumb, description |

### "What properties for...?"

| Page Type | eyebrow | breadcrumb | ctas | description | tabs | chips | icon | avatar |
|-----------|:-------:|:----------:|:----:|:-----------:|:----:|:-----:|:----:|:------:|
| Dashboard | - | - | ✓ | ✓ | - | - | - | - |
| Course detail | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | - |
| Course list | - | ✓ | ✓ | - | - | ✓ | - | - |
| User profile | - | ✓ | ✓ | ✓ | ✓ | - | - | ✓ |
| Team list | - | ✓ | ✓ | ✓ | - | ✓ | - | - |
| Settings | - | ✓ | - | ✓ | ✓ | - | - | - |

## Assets

Complete CSS implementation: `assets/headers.css`

---

## Section Header

Secondary header for content sections and modals. Uses smaller typography (20px title) and tighter spacing (16px gap).

### Visual Structure

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

### Design Token Differences from Page Header

| Element | Page Header | Section Header |
|---------|-------------|----------------|
| Title | 24px Bold | 20px Bold |
| Description | 16px Regular | 14px Regular |
| Section gap | 16px | 16px |
| Eyebrow icon | 21.333px | 26.667px |

### Types

```tsx
interface SectionHeaderProps {
  // Core content
  title: string;
  description?: string;
  
  // Feature toggles (matching Figma properties)
  eyebrow?: {
    icon?: ReactNode;
    label: string;
  };
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

### Component

```tsx
export function SectionHeader({
  title,
  description,
  eyebrow,
  ctas,
  tabs,
  chips,
  icon,
  avatar
}: SectionHeaderProps) {
  const hasBottomSection = tabs || chips;
  
  return (
    <header className="section-header">
      {/* Row 1: Eyebrow + CTAs */}
      {(eyebrow || ctas) && (
        <div className="section-header__top-row">
          {eyebrow && (
            <div className="section-header__eyebrow">
              {eyebrow.icon && (
                <span className="section-header__eyebrow-icon">
                  {eyebrow.icon}
                </span>
              )}
              <span>{eyebrow.label}</span>
            </div>
          )}
          
          {ctas && (
            <div className="section-header__ctas">
              {ctas}
            </div>
          )}
        </div>
      )}
      
      {/* Row 2: Title with optional Icon/Avatar */}
      <div className="section-header__headline">
        {(icon || avatar) && (
          <div className="section-header__media">
            {avatar ? (
              <img 
                src={avatar.src} 
                alt={avatar.alt} 
                className="section-header__avatar"
              />
            ) : icon}
          </div>
        )}
        <div className="section-header__title-group">
          <h2 className="section-header__title">{title}</h2>
          {description && (
            <p className="section-header__description">{description}</p>
          )}
        </div>
      </div>
      
      {/* Divider */}
      {hasBottomSection && (
        <div className="section-header__divider" />
      )}
      
      {/* Row 3: Tabs OR Chips */}
      {tabs && (
        <div className="section-header__tabs" role="tablist">
          {tabs.items.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={tab.value === tabs.activeValue}
              className={`section-header__tab ${
                tab.value === tabs.activeValue ? 'section-header__tab--active' : ''
              }`}
              onClick={() => tabs.onChange?.(tab.value)}
            >
              {tab.label}
              {tab.value === tabs.activeValue && (
                <span className="section-header__tab-indicator" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {chips && (
        <div className="section-header__chips">
          {chips.items.map((chip) => {
            const isSelected = chips.selectedValues.includes(chip.value);
            return (
              <button
                key={chip.value}
                className={`section-header__chip ${
                  isSelected ? 'section-header__chip--selected' : ''
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

### Section Header Usage Examples

#### Minimal (Title Only)

```tsx
<SectionHeader title="Your Progress" />
```

#### With Description

```tsx
<SectionHeader 
  title="Assigned Courses" 
  description="Complete these by the end of the month"
/>
```

#### With Eyebrow and CTAs

```tsx
<SectionHeader 
  title="Course Library"
  description="Browse available courses"
  eyebrow={{
    icon: <BookIcon />,
    label: "Courses"
  }}
  ctas={
    <>
      <Search placeholder="Search courses" />
      <Dropdown options={sortOptions} />
      <IconButton icon={<More />} />
      <Button variant="outlined">Export</Button>
      <Button icon={<Add />}>Add Course</Button>
    </>
  }
/>
```

#### With Tabs

```tsx
<SectionHeader 
  title="Team Activity"
  eyebrow={{ icon: <UsersIcon />, label: "Team" }}
  tabs={{
    items: [
      { label: "All Activity", value: "all" },
      { label: "Completions", value: "completions" },
      { label: "In Progress", value: "progress" },
    ],
    activeValue: "all",
    onChange: setActiveTab
  }}
/>
```

#### With Chips

```tsx
<SectionHeader 
  title="Filter Results"
  description="Select categories to filter"
  chips={{
    items: [
      { label: "All", value: "all" },
      { label: "Compliance", value: "compliance" },
      { label: "Safety", value: "safety" },
    ],
    selectedValues: ["all"],
    onChange: setFilters
  }}
/>
```

#### With Icon

```tsx
<SectionHeader 
  title="Food Safety Module"
  description="4 lessons remaining"
  icon={<CourseIcon size={40} />}
/>
```

---

## When to Use Each Header

| Scenario | Use | Reason |
|----------|-----|--------|
| Top of a page | Page Header | Main page identification, breadcrumb navigation |
| Inside a card | Section Header | Smaller typography fits card context |
| Modal header | Section Header | Compact spacing for modals |
| Dashboard widget | Section Header | Content grouping within page |
| Settings section | Section Header | Organizing settings groups |
| Course detail page | Page Header | Main page with breadcrumb to library |
| Course list within page | Section Header | Secondary content area |

## Heading Hierarchy

```html
<main>
  <PageHeader title="Team Dashboard" />           <!-- h1 -->
  
  <SectionHeader title="Your Progress" />         <!-- h2 -->
  <!-- Progress cards -->
  
  <SectionHeader title="Assigned Courses" />      <!-- h2 -->
  <!-- Course list -->
  
  <SectionHeader title="Team Activity" />         <!-- h2 -->
  <!-- Activity feed -->
</main>
```

## Quick Reference

### Typography Comparison

| Element | Page Header | Section Header |
|---------|-------------|----------------|
| Title | 24px Bold (H2) | 20px Bold (H3) |
| Description | 16px Regular | 14px Regular |
| Eyebrow | 14px Regular | 14px Regular |
| Tab selected | 14px Bold | 14px Bold |
| Tab unselected | 14px Medium | 14px Medium |
| Chip | 14px | 14px |

### Spacing Comparison

| Element | Page Header | Section Header |
|---------|-------------|----------------|
| Section gap | 16px | 16px |
| Title/description gap | 4px | 4px |
| CTA buttons gap | 16px | 16px |
| Tabs gap | 24px | 24px |
| Chips gap | 16px | 16px |

### CSS Class Prefixes

| Component | Prefix |
|-----------|--------|
| Page Header | `.page-header__*` |
| Section Header | `.section-header__*` |

## Assets

Complete CSS implementation: `assets/headers.css`
