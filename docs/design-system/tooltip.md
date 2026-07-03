# 5Mins.ai — Tooltip Component

Figma source: `Library` › node `2683-29027`  
Reference: [Carbon Design System — Tooltip usage](https://www.carbondesignsystem.com/components/tooltip/usage/)

> Tooltips display additional information upon click, hover, or focus. The information should be contextual, useful, and nonessential. Max width: **288px**.

---

## Visual Overview

```
         ┌─────────────────┐
         │  Tooltip text   │      ← Body (dark bg, white text)
         └────────┬────────┘
                  ▼                ← Caret (6px tall, 12px wide)
              [ trigger ]

Position: Top | Bottom | Left | Right
Alignment: Center | Start | End
Icon: with info icon anchor (ⓘ) | standalone body only
```

---

## Design Tokens

| CSS Variable              | Value                                      | Usage                        |
|---------------------------|--------------------------------------------|------------------------------|
| `--tooltip-background`    | `#0f1014`                                  | Tooltip body background      |
| `--neutral-25`            | `#f9f9fa`                                  | Tooltip text color           |
| `--sm` (spacing)          | `12px`                                     | Horizontal padding + radius  |
| `--s` (spacing)           | `8px`                                      | Vertical padding             |
| `--xs` (spacing)          | `4px`                                      | Gap when icon present        |
| Shadow L                  | `drop-shadow(-4px 0px 24px rgba(32,34,42,0.12))` | Tooltip container shadow |

### Typography

| Property    | Value                   |
|-------------|-------------------------|
| Font family | Poppins                 |
| Weight      | 400 (Regular)           |
| Size        | 14px                    |
| Line height | 1.5                     |

---

## Props

| Prop        | Type                              | Default    | Description                                                   |
|-------------|-----------------------------------|------------|---------------------------------------------------------------|
| `text`      | `string`                          | —          | Content displayed inside the tooltip body                     |
| `position`  | `"Top" \| "Bottom" \| "Left" \| "Right"` | `"Top"` | Which side of the trigger the tooltip appears on         |
| `alignment` | `"Center" \| "Start" \| "End"`    | `"Center"` | Caret/body alignment along the axis perpendicular to position |
| `icon`      | `boolean`                         | `true`     | When true, renders an ⓘ info icon as the visible anchor       |
| `children`  | `ReactNode`                       | —          | Custom trigger element (used when `icon` is false)            |
| `className` | `string`                          | —          | Extra CSS classes on the wrapper                              |

> **`icon` prop explained:** When `icon={true}`, the component renders a standalone 20px `IoInformationCircleOutline` icon as the trigger — the tooltip floats relative to it. When `icon={false}`, wrap your own trigger element via `children` and the tooltip body attaches to it.

---

## Caret Rules

The caret is a **12×6px** triangle (pointing toward the trigger). Its position shifts based on `alignment`:

| Alignment | Caret position on the tooltip edge |
|-----------|-------------------------------------|
| Center    | Horizontally/vertically centred      |
| Start     | Near the start edge (left/top), offset `16px` from edge |
| End       | Near the end edge (right/bottom), offset `16px` from edge |

For `Left` and `Right` positions, the caret rotates 90°.

---

## State × Layout Matrix

| Position | Alignment | Caret location         | Body alignment |
|----------|-----------|------------------------|----------------|
| Top      | Center    | Bottom-center of body  | Centred above trigger |
| Top      | Start     | Bottom-left of body    | Left-aligned above trigger |
| Top      | End       | Bottom-right of body   | Right-aligned above trigger |
| Bottom   | Center    | Top-center of body     | Centred below trigger |
| Bottom   | Start     | Top-left of body       | Left-aligned below trigger |
| Bottom   | End       | Top-right of body      | Right-aligned below trigger |
| Left     | Center    | Right side of body     | Centred left of trigger |
| Right    | Center    | Left side of body      | Centred right of trigger |

---

## React TypeScript Implementation

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { InformationCircle } from 'iconsax-react'; // IoInformationCircleOutline equivalent

type TooltipPosition = 'Top' | 'Bottom' | 'Left' | 'Right';
type TooltipAlignment = 'Center' | 'Start' | 'End';

interface TooltipProps {
  text: string;
  position?: TooltipPosition;
  alignment?: TooltipAlignment;
  icon?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Tooltip({
  text,
  position = 'Top',
  alignment = 'Center',
  icon = true,
  children,
  className = '',
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const trigger = icon ? (
    <button
      type="button"
      className="tooltip__trigger flex items-center justify-center bg-transparent border-none p-0 cursor-pointer"
      aria-label="More information"
      aria-describedby="tooltip-body"
      onClick={() => setVisible(v => !v)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <InformationCircle size={20} color="var(--text-secondary, #bfc2cc)" variant="Linear" />
    </button>
  ) : (
    <div
      className="tooltip__trigger"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
    </div>
  );

  return (
    <div className={`tooltip-wrapper relative inline-flex ${className}`} ref={triggerRef}>
      {trigger}
      {visible && (
        <div
          id="tooltip-body"
          role="tooltip"
          className={`tooltip__body ${getPositionClass(position, alignment)}`}
        >
          {/* Caret — rendered before body for Top/Left, after for Bottom/Right */}
          {(position === 'Top' || position === 'Left') && (
            <TooltipCaret position={position} alignment={alignment} direction="after" />
          )}
          <div className="tooltip__content">
            {text}
          </div>
          {(position === 'Bottom' || position === 'Right') && (
            <TooltipCaret position={position} alignment={alignment} direction="before" />
          )}
        </div>
      )}
    </div>
  );
}

// Helper: caret SVG triangle
function TooltipCaret({ position, alignment, direction }: {
  position: TooltipPosition;
  alignment: TooltipAlignment;
  direction: 'before' | 'after';
}) {
  const isHorizontal = position === 'Left' || position === 'Right';
  const alignClass = isHorizontal ? '' :
    alignment === 'Start' ? 'justify-start pl-[16px]' :
    alignment === 'End'   ? 'justify-end pr-[16px]' :
                            'justify-center';

  return (
    <div className={`flex w-full ${alignClass} ${direction === 'after' ? '' : 'rotate-180'}`}>
      <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6L0 0H12L6 6Z" fill="var(--tooltip-background, #0f1014)" />
      </svg>
    </div>
  );
}

function getPositionClass(position: TooltipPosition, alignment: TooltipAlignment): string {
  const base = 'absolute z-50 flex flex-col';
  const positions: Record<string, string> = {
    'Top-Center':    'bottom-full left-1/2 -translate-x-1/2 mb-[2px] items-center',
    'Top-Start':     'bottom-full left-0 mb-[2px] items-start',
    'Top-End':       'bottom-full right-0 mb-[2px] items-end',
    'Bottom-Center': 'top-full left-1/2 -translate-x-1/2 mt-[2px] items-center',
    'Bottom-Start':  'top-full left-0 mt-[2px] items-start',
    'Bottom-End':    'top-full right-0 mt-[2px] items-end',
    'Left-Center':   'right-full top-1/2 -translate-y-1/2 mr-[2px] flex-row-reverse items-center',
    'Right-Center':  'left-full top-1/2 -translate-y-1/2 ml-[2px] flex-row items-center',
  };
  return `${base} ${positions[`${position}-${alignment}`] ?? ''}`;
}
```

### CSS

```css
.tooltip__content {
  background-color: var(--tooltip-background, #0f1014);
  color: var(--neutral-25, #f9f9fa);
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  padding: var(--s, 8px) var(--sm, 12px);
  border-radius: var(--sm, 12px);
  max-width: 288px;
  white-space: nowrap;          /* remove for multi-line tooltips */
  filter: drop-shadow(-4px 0px 24px rgba(32, 34, 42, 0.12));
}

.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

/* Focus-visible indicator on the trigger */
.tooltip__trigger:focus-visible {
  outline: 2px solid var(--primary-500, #00c4cc);
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## Usage Examples

```tsx
// Basic — top center, info icon trigger
<Tooltip text="This field is required for compliance reporting." />

// Bottom, start-aligned
<Tooltip
  text="Learners see this in their dashboard."
  position="Bottom"
  alignment="Start"
/>

// Right of trigger, no icon — wrap your own element
<Tooltip text="Edit role" position="Right" icon={false}>
  <button>✏️</button>
</Tooltip>

// Left-positioned
<Tooltip text="Remove from team" position="Left" />

// Multi-line (remove whitespace: nowrap in CSS)
<Tooltip
  text="This course is locked until the prerequisite is completed."
  position="Top"
  alignment="Center"
/>
```

---

## Do's and Don'ts

**Do:**
- Keep tooltip text short and scannable — one sentence max
- Use `icon={true}` (the ⓘ anchor) for contextual help next to labels and form fields
- Use `icon={false}` + `children` to attach a tooltip to any custom trigger (icon buttons, truncated text, etc.)
- Always support keyboard (focus) and mouse (hover) triggers — both are required
- Respect the 288px max-width; let text wrap rather than overflow

**Don't:**
- Don't put interactive elements (links, buttons) inside the tooltip body — use a popover instead
- Don't use tooltips for critical information the user must act on — use an Alert or Dialog
- Don't show tooltips on disabled elements (screen readers can't focus them)
- Don't change the background colour — `--tooltip-background` (`#0f1014`) is the only approved value
- Don't use font weights other than 400 inside tooltip body
