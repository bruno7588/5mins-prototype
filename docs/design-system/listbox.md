---
name: 5mins-listbox
description: Listbox / menu component for 5Mins.ai — the floating options surface used by dropdowns, action menus, and pickers. Covers the container (caret top/bottom, plain, grouped with headers + dividers) and the list item with its full slot matrix (icon left/right, avatar, skill icon, checkbox, radio, embedded search, supporting text, helper/options text) and states (Enabled, Hover, Selected, Read-only). Use for any menu, options list, action popover, or picker surface.
---

# 5Mins.ai Listbox

The floating menu surface: a container of list items that appears from a trigger (dropdown, "more" button, picker). Items support a wide range of slot configurations.

Spec source: Figma Library — Listbox light `11923:3466` / dark `9162:1042`, List items light `11908:6300` / dark `9162:941` (verified 2026-07-03). Colors are semantic tokens resolving per mode (see `colors.md`).

---

## Container

```
Background:  var(--cards-background)
Border:      1px solid var(--border)
Radius:      12px (--radius-sm)
Padding:     8px (--space-s)
Shadow:      Shadow L — -4px 0 24px rgba(32, 34, 42, 0.12)
```

### Variants

| Variant | Use |
|---|---|
| **Caret = Bottom** | Menu opens *below* the trigger — caret (8px arrow) points up from the container's top-right |
| **Caret = Top** | Menu opens *above* — caret points down at bottom-right (16px inset) |
| **No caret** | Default attached menu (dropdown lists) |
| **Wrapping menu items** (grouped) | Sections with a **group header** (Poppins Medium 14, `--text-tertiary`, `4px` h-padding / `8px` v-padding; subsequent groups `12px` top) separated by a 1px `--border` divider; 4px gap between groups |

```css
.listbox {
  background: var(--cards-background);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);      /* 12px */
  padding: var(--space-s);              /* 8px */
  box-shadow: -4px 0 24px rgba(32, 34, 42, 0.12);   /* Shadow L */
  display: flex;
  flex-direction: column;
  max-height: 320px;                    /* then scroll */
  overflow-y: auto;
}

.listbox__group-header {
  padding: 8px 4px;
  font: 500 14px/1.5 'Poppins', sans-serif;
  color: var(--text-tertiary);
}
.listbox__group + .listbox__group .listbox__group-header { padding-top: 12px; }

.listbox__divider { height: 1px; margin: 0 4px; background: var(--border); border-radius: 4px; }
```

---

## List Item

Base: `padding: 8px 12px` · `radius: 8px` (`--radius-s`) · label Poppins Regular 14 `--text-primary`.

### States

| State | Background | Label |
|---|---|---|
| Enabled | transparent (container bg) | `--text-primary` |
| Hover | `--cards-background-hover` | `--text-primary` |
| **Selected** | `--secondary-500` `#FFBB38` (both modes) | **`--text-on-selected`** (weight 500) — dark on amber, same family as chips/switcher |
| Selected + Hover | `--secondary-500` | `--text-on-selected` |
| Read-only (disabled) | transparent | `--text-disabled`, muted slots |

### Slot matrix

All combinable per the Figma variant axes; gaps are the load-bearing detail:

| Slot | Spec | Gap to label |
|---|---|---|
| **Icon left** | 20px Iconsax Linear, `currentColor` | 8px |
| **Icon right / chevron** | 21px `ArrowRight2` for submenu / drill-in | in right cluster |
| **Helper ("options") text** | Regular 14 `--text-secondary` + chevron, right-aligned cluster (8px internal gap) | **24px** from the label cluster |
| **Avatar** | 40px circular (see `avatars.md`) | 12px |
| **Skill icon** | 20px illustration (see skill card) | 8px |
| **Checkbox** | 32px checkbox (see `selection-controls.md`) — multi-select lists | 8px |
| **Radio** | 24px radio — single-select lists | 8px |
| **Supporting text** | second line, Regular 14 `--text-secondary`; the label becomes **Medium 14**; 2px column gap | — |
| **Search** | an embedded search field as the first item: 240px, `--input-background` fill, radius 12, `8px 12px` padding, 18px icon, placeholder `--text-tertiary` | — |

Item heights for reference: 37px plain · 40px with avatar/radio · ~60–62px with supporting text · 53px search row.

### CSS

```css
.listbox__item {
  display: flex;
  align-items: center;
  gap: var(--space-s);                  /* 8px; avatar rows use 12px */
  padding: var(--space-s) var(--space-sm);  /* 8px 12px */
  border-radius: var(--radius-s);       /* 8px */
  font: 400 14px/1.5 'Poppins', sans-serif;
  color: var(--text-primary);
  cursor: pointer;
  white-space: nowrap;
}
.listbox__item:hover        { background: var(--cards-background-hover); }
.listbox__item.is-selected  { background: var(--secondary-500); color: var(--text-on-selected); font-weight: 500; }
.listbox__item.is-readonly  { color: var(--text-disabled); pointer-events: none; }

/* Right-aligned options cluster (helper text + chevron) */
.listbox__item-options {
  display: flex;
  align-items: center;
  gap: var(--space-s);
  margin-left: var(--space-l);          /* 24px from label */
  color: var(--text-secondary);
}

/* Supporting-text rows */
.listbox__item--rich { align-items: center; }
.listbox__item--rich .listbox__item-info { display: flex; flex-direction: column; gap: 2px; }
.listbox__item--rich .listbox__item-title { font-weight: 500; }
.listbox__item--rich .listbox__item-supporting { color: var(--text-secondary); }
```

### React sketch

```tsx
interface ListboxItemProps {
  label: string;
  supporting?: string;
  iconLeft?: ReactNode;      // 20px
  avatar?: string;           // 40px src
  options?: string;          // right helper text (+ chevron for submenu)
  checkbox?: boolean;
  radio?: boolean;
  selected?: boolean;
  readOnly?: boolean;
  onSelect?: () => void;
}

<div className="listbox" role="listbox">
  <ListboxItem label="Rename" iconLeft={<Edit2 size={20} />} />
  <ListboxItem label="Move to" options="Folder" />          {/* chevron submenu */}
  <ListboxItem label="Archive" selected />
</div>
```

---

## Behaviour

- Anchored to its trigger; caret variants for detached/tooltip-style anchoring, no-caret for flush dropdown menus.
- Max height then scroll; the embedded Search item stays pinned at the top for long filterable lists.
- Keyboard: `↑ ↓` move, `Enter` selects, `Esc` closes; `role="listbox"` / `role="option"` + `aria-selected` (or `role="menu"`/`menuitem` for action menus).
- Checkbox rows toggle without closing the menu; radio and plain rows select and close.

## Relationship to other components

- **`dropdown.md`** — the dropdown trigger opens this listbox (its previous "extrapolated menu" section is superseded by this spec).
- **`chips-switcher-tabs.md`** — the selected-item amber (`--secondary-500` + `--neutral-800`) matches chips and the content switcher.
- **`avatars.md` / `selection-controls.md` / `search.md`** — the slot components used inside items.
