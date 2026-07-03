
# 5Mins.ai Overlay Component System

Complete implementation guide for the three overlay components in the 5Mins.ai design system: **Dialog**, **Modal**, and **Side Drawer**. All three share a common overlay backdrop but serve distinct interaction purposes.

## When to Use What

| Component | Purpose | Use For |
|-----------|---------|---------|
| **Dialog** | Urgent decisions or confirmations | Delete confirmations, destructive action warnings, success/error feedback, simple yes/no decisions |
| **Modal** | Focused tasks with moderate content | Form inputs, detail views, content previews, settings, multi-step flows |
| **Side Drawer** | Extended workflows with scrollable content | Editing panels, detailed configurations, long forms, record details, bulk operations |

**Decision rule:** If the user needs to make a quick binary decision → Dialog. If they need to interact with a moderate amount of content → Modal. If they need a full working area that doesn't fully occlude the page → Side Drawer.

---

## Shared Foundation

All overlays share these building blocks:

### Overlay Backdrop

A full-screen semi-transparent layer that dims the page content and prevents interaction with elements behind the overlay.

```css
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: var(--neutral-900, #0F1014);
  opacity: 0.64;
  z-index: 1000;
}
```

### Close Behavior

- **Dialog:** No close (×) button. Dismissal only through action buttons (confirm/cancel). Clicking backdrop does NOT close.
- **Modal:** Close (×) button in the top-right corner. Clicking backdrop closes the modal.
- **Side Drawer:** Close (×) button in the top-right corner. Clicking backdrop closes the drawer.

### Close Button (Modal & Side Drawer)

```css
.overlay-close {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-secondary, #BFC2CC);
  background: none;
  border: none;
}

.overlay-close:hover {
  color: var(--text-primary, #F9F9FA);
}
```

**Icon:** `IoCloseOutline` (Ionicons 5) at 24×24px.

### Shared Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--page-background` | `#20222A` | Surface color for all overlay panels |
| `--text-primary` | `#F9F9FA` | Titles and primary text |
| `--text-secondary` | `#BFC2CC` | Supporting text and descriptions |
| `--border` | `#383D4C` | Divider lines |
| `--neutral-900` | `#0F1014` | Backdrop base color |
| `--sm` (border-radius) | `12px` | Panel corner rounding (Modal & Side Drawer) |
| `--s` (border-radius) | `8px` | Button corner rounding |

### Shadow

Modal and Dialog panels use Shadow L:

```css
box-shadow: -4px 0px 24px 0px rgba(32, 34, 42, 0.12);
```

---

## 1. Dialog Component

A compact, centered overlay for critical decisions. Dialogs block all interaction until the user responds via one of the action buttons.

### Architecture

The Dialog has three configurable dimensions:

| Property | Options |
|----------|---------|
| **Type** | Error, Warning, Info, Success |
| **Icon** | Shown / Hidden |
| **Secondary Text** | Shown / Hidden |

This produces 16 variants (4 types × 2 icon states × 2 text states).

### Visual Anatomy

```
┌─────────────────────────────────────┐
│                                     │
│           [Icon - 72px]             │  ← optional, type-specific
│                                     │
│     Title of the dialog modal       │  ← H3 (20px Bold), always shown
│   Secondary text of the dialog      │  ← Paragraph L (16px Regular), optional
│                                     │
│     ┌──────────┐  ┌──────────┐      │
│     │  Cancel   │  │  Action  │      │  ← outlined + filled buttons
│     └──────────┘  └──────────┘      │
│                                     │
└─────────────────────────────────────┘
```

### Dimensions & Spacing

```css
.dialog {
  width: 345px;
  max-width: 900px;
  padding: var(--l, 24px);                /* 24px all sides */
  border-radius: var(--sm, 12px);         /* 12px */
  background: var(--page-background, #20222A);
  box-shadow: -4px 0px 24px 0px rgba(32, 34, 42, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ml, 20px);                   /* 20px between body and CTA */
  text-align: center;
}
```

### Icon by Type

Each dialog type has a distinct 72×72px icon:

| Type | Icon | Description |
|------|------|-------------|
| **Error** | Red triangle with exclamation | Danger/alert symbol |
| **Warning** | Orange triangle with exclamation | Caution symbol |
| **Info** | Cyan outlined info circle (`IoInformationCircleOutline`) | Informational |
| **Success** | Green circle with checkmark | Confirmation/completion |

The Info icon sits inside a 12px padding wrapper (total touch target: 96px). All other icons render directly at 72×72px.

### Text Content

```css
.dialog__title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;                     /* Bold */
  font-size: 20px;
  line-height: 1.5;
  color: var(--text-primary, #F9F9FA);
  text-align: center;
}

.dialog__description {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;                     /* Regular */
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-secondary, #BFC2CC);
  text-align: center;
}

/* Title + description wrapper */
.dialog__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--xs, 4px);                  /* 4px between title and description */
}
```

### Button Styling per Type

The CTA row always contains two buttons side by side: an outlined (secondary) button and a filled (primary) button. Colors change based on the dialog type:

```css
.dialog__cta {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 100%;
}
```

| Type | Outlined Button | Filled Button |
|------|----------------|---------------|
| **Error** | `border: 1px solid var(--text-primary, #F9F9FA)` / text `#F9F9FA` | `background: var(--danger-500, #DF1642)` / text `#F9F9FA` |
| **Warning** | `border: 1px solid var(--text-primary, #F9F9FA)` / text `#F9F9FA` | `background: var(--button-warning-background, #FFA538)` / text `var(--text-button-foreground, #20222A)` |
| **Info** | `border: 1px solid var(--primary-button-background, #00CEE6)` / text `#00CEE6` | `background: var(--primary-button-background, #00CEE6)` / text `var(--text-button-foreground, #20222A)` |
| **Success** | `border: 1px solid var(--primary-button-background, #00CEE6)` / text `#00CEE6` | `background: var(--primary-button-background, #00CEE6)` / text `var(--text-button-foreground, #20222A)` |

**Button shared styles:**

```css
.dialog__btn {
  padding: 12px 24px;
  border-radius: var(--s, 8px);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;                     /* Bold */
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
}
```

**Pattern:** Error and Warning use high-contrast/urgent colors. Info and Success share the primary cyan brand color, reinforcing positive or neutral actions.

---

## 2. Modal Component

A centered overlay panel for focused tasks with moderate content. Modals include a section header with title, supporting text, a content area, and an action button.

### Visual Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│  Title of this section/modal                            ✕    │
│  Supporting text                                             │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│                                                              │
│                     [Content Area]                           │
│                     320px min height                         │
│                                                              │
│                                                              │
│                      ┌──────────┐                            │
│                      │  Button  │                            │
│                      └──────────┘                            │
└──────────────────────────────────────────────────────────────┘
```

### Dimensions & Spacing

```css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 720px;
  padding: var(--l, 24px);                /* 24px all sides */
  border-radius: var(--sm, 12px);
  background: var(--page-background, #20222A);
  box-shadow: -4px 0px 24px 0px rgba(32, 34, 42, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ml, 20px);                   /* 20px between sections */
  z-index: 1001;
}
```

### Section Header

The header contains a title, optional supporting text, and a divider. It reuses the standard 5Mins Section Header pattern.

```css
.modal__header {
  display: flex;
  flex-direction: column;
  gap: var(--m, 16px);                    /* 16px between headline and divider */
  width: 100%;
}

.modal__headline {
  display: flex;
  flex-direction: column;
  gap: 4px;                               /* 4px between title and supporting text */
  width: 100%;
}

.modal__title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;                       /* Bold */
  font-size: 20px;
  line-height: 1.5;
  color: var(--text-primary, #F9F9FA);
}

.modal__supporting-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;                       /* Regular */
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary, #BFC2CC);
}

.modal__divider {
  width: 100%;
  height: 1px;
  background: var(--border, #383D4C);
  border-radius: var(--x, 4px);
}
```

### Content Area

A flexible container for modal body content. Minimum height is 320px to ensure visual presence. Content can include forms, lists, previews, etc.

```css
.modal__content {
  width: 100%;
  min-height: 320px;
  border-radius: var(--sm, 12px);
}
```

### CTA Button

A single centered primary (filled) button at the bottom:

```css
.modal__cta {
  background: var(--primary-button-background, #00CEE6);
  color: var(--text-button-foreground, #20222A);
  padding: 10px var(--ml, 20px);
  border-radius: var(--s, 8px);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  cursor: pointer;
}
```

---

## 3. Side Drawer Component

A right-anchored panel that slides in from the edge of the viewport. The drawer spans the full height of the viewport and provides an extended working area with a sticky footer CTA section.

### Visual Anatomy

```
┌───────────────────┬──────────────────────────────────────────┐
│                   │  Title of this section/modal         ✕   │
│                   │  Supporting text                         │
│                   │  ─────────────────────────────────────── │
│                   │                                          │
│   Backdrop        │                                          │
│   (64% opacity)   │           [Scrollable Content]           │
│                   │                                          │
│                   │                                          │
│                   │  ─────────────────────────────────────── │
│                   │  ┌──────────┐  ┌──────────┐             │
│                   │  │  Action  │  │  Cancel   │             │
│                   │  └──────────┘  └──────────┘             │
└───────────────────┴──────────────────────────────────────────┘
```

### Dimensions & Spacing

```css
.side-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 720px;
  height: 100vh;
  padding: var(--ml, 20px) var(--l, 24px);  /* 20px top/bottom, 24px left/right */
  background: var(--page-background, #20222A);
  display: flex;
  flex-direction: column;
  gap: var(--ml, 20px);                      /* 20px between sections */
  z-index: 1001;
}
```

**Key difference from Modal:** The Side Drawer uses `padding: 20px 24px` (not uniform 24px) and anchors to the right edge instead of centering. It has no border-radius (flush to viewport edge) and no box-shadow.

### Section Header

Identical to the Modal section header (title + supporting text + divider). See Modal Section Header above.

### Scrollable Content Area

The content area flexes to fill all available vertical space between the header and the footer CTA.

```css
.side-drawer__content {
  flex: 1 0 0;
  min-height: 0;                           /* allows flex shrinking for scroll */
  width: 100%;
  overflow-y: auto;
  border-radius: var(--sm, 12px);
}
```

### Sticky Footer CTA

The footer is pinned to the bottom and contains a divider line followed by a row of buttons. The width is constrained to 656px (720px panel − 2×24px padding − 2×8px internal).

```css
.side-drawer__footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;                             /* fills padded area */
  background: var(--page-background, #20222A);
}

.side-drawer__footer-divider {
  width: 100%;
  height: 1px;
  background: var(--border, #383D4C);
  border-radius: var(--x, 4px);
}

.side-drawer__buttons {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
```

The Side Drawer CTA section uses **two buttons** side by side: a filled primary button and an outlined primary button (both using the cyan brand color).

```css
/* Filled primary */
.side-drawer__btn-primary {
  background: var(--primary-button-background, #00CEE6);
  color: var(--text-button-foreground, #20222A);
  padding: 10px var(--ml, 20px);
  border-radius: var(--s, 8px);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  cursor: pointer;
}

/* Outlined primary */
.side-drawer__btn-secondary {
  background: transparent;
  color: var(--primary-button-background, #00CEE6);
  border: 1px solid var(--primary-button-background, #00CEE6);
  padding: 10px var(--ml, 20px);
  border-radius: var(--s, 8px);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
}
```

---

## React TypeScript Implementation

### Dialog

```tsx
import { ReactNode } from 'react';

type DialogType = 'error' | 'warning' | 'info' | 'success';

interface DialogProps {
  type?: DialogType;
  icon?: boolean;
  title: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary: () => void;
}

const DIALOG_CONFIG: Record<DialogType, {
  filledBg: string;
  filledText: string;
  outlinedBorder: string;
  outlinedText: string;
}> = {
  error: {
    filledBg: 'var(--danger-500, #DF1642)',
    filledText: 'var(--neutral-25, #F9F9FA)',
    outlinedBorder: 'var(--text-primary, #F9F9FA)',
    outlinedText: 'var(--text-primary, #F9F9FA)',
  },
  warning: {
    filledBg: 'var(--button-warning-background, #FFA538)',
    filledText: 'var(--text-button-foreground, #20222A)',
    outlinedBorder: 'var(--text-primary, #F9F9FA)',
    outlinedText: 'var(--text-primary, #F9F9FA)',
  },
  info: {
    filledBg: 'var(--primary-button-background, #00CEE6)',
    filledText: 'var(--text-button-foreground, #20222A)',
    outlinedBorder: 'var(--primary-button-background, #00CEE6)',
    outlinedText: 'var(--primary-button-background, #00CEE6)',
  },
  success: {
    filledBg: 'var(--primary-button-background, #00CEE6)',
    filledText: 'var(--text-button-foreground, #20222A)',
    outlinedBorder: 'var(--primary-button-background, #00CEE6)',
    outlinedText: 'var(--primary-button-background, #00CEE6)',
  },
};

export function Dialog({
  type = 'error',
  icon = true,
  title,
  description,
  primaryLabel = 'Confirm',
  secondaryLabel = 'Cancel',
  onPrimary,
  onSecondary,
}: DialogProps) {
  const config = DIALOG_CONFIG[type];

  return (
    <>
      {/* Backdrop */}
      <div className="overlay-backdrop" />

      {/* Dialog panel */}
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog__body">
          {icon && <DialogIcon type={type} />}
          <div className="dialog__info">
            <h2 id="dialog-title" className="dialog__title">{title}</h2>
            {description && (
              <p className="dialog__description">{description}</p>
            )}
          </div>
        </div>

        <div className="dialog__cta">
          <button
            className="dialog__btn"
            style={{
              background: 'transparent',
              border: `1px solid ${config.outlinedBorder}`,
              color: config.outlinedText,
            }}
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
          <button
            className="dialog__btn"
            style={{
              background: config.filledBg,
              color: config.filledText,
              border: 'none',
            }}
            onClick={onPrimary}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </>
  );
}
```

### Modal

```tsx
import { ReactNode } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

interface ModalProps {
  title: string;
  supportingText?: string;
  children: ReactNode;
  ctaLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}

export function Modal({
  title,
  supportingText,
  children,
  ctaLabel = 'Save',
  onAction,
  onClose,
}: ModalProps) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />

      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="overlay-close" onClick={onClose} aria-label="Close">
          <IoCloseOutline size={24} />
        </button>

        <div className="modal__header">
          <div className="modal__headline">
            <h2 id="modal-title" className="modal__title">{title}</h2>
            {supportingText && (
              <p className="modal__supporting-text">{supportingText}</p>
            )}
          </div>
          <div className="modal__divider" />
        </div>

        <div className="modal__content">
          {children}
        </div>

        {onAction && (
          <button className="modal__cta" onClick={onAction}>
            {ctaLabel}
          </button>
        )}
      </div>
    </>
  );
}
```

### Side Drawer

```tsx
import { ReactNode } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

interface SideDrawerProps {
  title: string;
  supportingText?: string;
  children: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onClose: () => void;
}

export function SideDrawer({
  title,
  supportingText,
  children,
  primaryLabel = 'Save',
  secondaryLabel = 'Cancel',
  onPrimary,
  onSecondary,
  onClose,
}: SideDrawerProps) {
  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />

      <div className="side-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <button className="overlay-close" onClick={onClose} aria-label="Close">
          <IoCloseOutline size={24} />
        </button>

        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <h2 id="drawer-title" className="modal__title">{title}</h2>
            {supportingText && (
              <p className="modal__supporting-text">{supportingText}</p>
            )}
          </div>
          <div className="modal__divider" />
        </div>

        <div className="side-drawer__content">
          {children}
        </div>

        <div className="side-drawer__footer">
          <div className="side-drawer__footer-divider" />
          <div className="side-drawer__buttons">
            {onPrimary && (
              <button className="side-drawer__btn-primary" onClick={onPrimary}>
                {primaryLabel}
              </button>
            )}
            {onSecondary && (
              <button className="side-drawer__btn-secondary" onClick={onSecondary}>
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
```

---

## Animation Guidelines

### Recommended Transitions

| Component | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| **Backdrop** | Fade in (opacity 0 → 0.64) | 200ms | ease-out |
| **Dialog** | Scale up + fade (0.95 → 1, opacity 0 → 1) | 200ms | ease-out |
| **Modal** | Scale up + fade (0.95 → 1, opacity 0 → 1) | 250ms | ease-out |
| **Side Drawer** | Slide in from right (translateX(100%) → 0) | 300ms | cubic-bezier(0.32, 0.72, 0, 1) |

```css
/* Entry animations */
@keyframes overlay-fade-in {
  from { opacity: 0; }
  to   { opacity: 0.64; }
}

@keyframes dialog-enter {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes drawer-slide-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
```

---

## Accessibility

### Required Practices

| Requirement | Dialog | Modal | Side Drawer |
|-------------|--------|-------|-------------|
| `role` attribute | `alertdialog` | `dialog` | `dialog` |
| `aria-modal="true"` | ✓ | ✓ | ✓ |
| `aria-labelledby` | Points to title | Points to title | Points to title |
| Focus trap | ✓ (mandatory) | ✓ (mandatory) | ✓ (mandatory) |
| Return focus on close | ✓ | ✓ | ✓ |
| Escape key closes | ✗ (buttons only) | ✓ | ✓ |
| Backdrop click closes | ✗ | ✓ | ✓ |

### Focus Management

When any overlay opens, focus must move to the first interactive element inside the panel. When closed, focus returns to the element that triggered the overlay. Tab key must cycle only through elements inside the overlay (focus trap).

```tsx
// Minimal focus trap hook
function useFocusTrap(ref: React.RefObject<HTMLElement>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const focusable = ref.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, ref]);
}
```

---

## Usage Examples

### Delete Confirmation (Dialog)

```tsx
<Dialog
  type="error"
  icon
  title="Delete this course?"
  description="This action cannot be undone. All learner progress will be lost."
  primaryLabel="Delete"
  secondaryLabel="Cancel"
  onPrimary={handleDelete}
  onSecondary={closeDialog}
/>
```

### Edit Course Settings (Modal)

```tsx
<Modal
  title="Course Settings"
  supportingText="Configure visibility and access controls"
  ctaLabel="Save Changes"
  onAction={handleSave}
  onClose={closeModal}
>
  <CourseSettingsForm />
</Modal>
```

### User Detail Panel (Side Drawer)

```tsx
<SideDrawer
  title="Learner Profile"
  supportingText="View and edit learner details"
  primaryLabel="Save"
  secondaryLabel="Discard"
  onPrimary={handleSave}
  onSecondary={handleDiscard}
  onClose={closeDrawer}
>
  <LearnerDetailForm />
</SideDrawer>
```

---

## Quick Reference

### Component Comparison

| Property | Dialog | Modal | Side Drawer |
|----------|--------|-------|-------------|
| **Width** | 345px | 720px | 720px |
| **Height** | Auto (content) | Auto (content) | 100vh |
| **Position** | Centered | Centered | Right-anchored |
| **Padding** | 24px uniform | 24px uniform | 20px vert / 24px horiz |
| **Border radius** | 12px | 12px | None (flush) |
| **Shadow** | Shadow L | Shadow L | None |
| **Close button** | None | ✓ top-right | ✓ top-right |
| **Backdrop click** | No close | Closes | Closes |
| **Escape key** | No close | Closes | Closes |
| **Header style** | Centered, type icon | Left-aligned, section header | Left-aligned, section header |
| **CTA buttons** | 2 (type-colored) | 1 (primary centered) | 2 (primary, sticky footer) |
| **Scrollable content** | No | Optional | Yes (flex body) |
