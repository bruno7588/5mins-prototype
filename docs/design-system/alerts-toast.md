---
name: 5mins-alerts-toast
description: Alert, Callout, and Toast components for 5Mins.ai. Alert/Callout are inline banners (warning strips, informational callouts, contextual guidance, CTA banners); Toast is the floating auto-dismissing feedback pill (Success/Warning/Error/Info) shown after an action. Trigger this skill whenever building any alert, callout, warning strip, info banner, notification box, toast, or snackbar in the 5Mins.ai admin or learner UI.
---

# 5Mins.ai Alert, Callout & Toast

Three message components:

- **Callout** — inline, informational, neutral surface, used for guidance, tips, and contextual help
- **Alert** — inline, warning state, yellow-tinted surface, used for system warnings and attention-required messages
- **Toast** — floating, solid-color feedback pill that confirms an action and auto-dismisses (see the Toast section at the end)

Spec source: Figma Library — Alert/Callout light `node 11914:638`, dark `node 3658:32304`; Toast `node 5045:14119` (verified 2026-07-03). Alert/Callout share identical structure across modes; every color is a semantic token that resolves per mode (see `colors.md`). All Alert/Callout variants use a uniform `8px 12px` padding.

---

## Component Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"Callout" \| "Alert"` | `"Callout"` | Visual style and semantic intent |
| `illustration` | `boolean` | `true` | Small decorative image (20px) before text — Callout: pin/rocket-style; Alert: bell |
| `icon` | `boolean` | `false` | Callout: info-circle outline 20px; Alert: warning triangle (Iconsax `Danger`, Bold) 20px. Use icon *or* illustration, not both |
| `supportingText` | `boolean` | `false` | Title + bullet list body (Callout only) |
| `button` | `boolean` | `false` | Show a CTA button |

---

## Type: Callout

### Visual Spec

```
Background:    var(--input-background)          /* translucent, per mode */
Border-radius: 12px   (--radius-sm)
Padding:       8px 12px   (--space-s --space-sm) — all variants
Gap:           8px    (--space-s)
Text:          Poppins 14px / 1.5, Regular, var(--text-secondary)
Alignment:     center (single line)  →  flex-start (with supportingText)
```

### Anatomy (left → right)

```
[ illustration? | icon? ] [ text / body ] [ inline button? ]
```

- **illustration** — 20×20px decorative image, `shrink-0`; with supportingText it top-aligns (2px offset)
- **icon** — 20×20px info-circle outline, `shrink-0`; only one of `illustration` / `icon` shows
- **text area** — `flex: 1; min-width: 0`, contains either:
  - Simple: single `<p>` 14px Regular `--text-secondary`
  - Supporting: body column — title `<p>` 14px **Medium** + `<ul>` 14px Regular bullets (21px indent), `gap: 8px`; when a button follows, the description block and button sit in the body with `gap: 16px`
- **button** — two different styles depending on placement (below)

### Callout Buttons — two styles

**Inline (no supportingText):** an underlined text button at the end of the row — same pattern as the Alert button but in `--text-primary`:

```css
color: var(--text-primary);
font: 700 14px/1.5 Poppins;
text-decoration: underline;
text-decoration-skip-ink: none;
background: transparent;
border: none;
padding: 0;
```

**Below supporting text:** an outlined button under the description (16px gap above):

```css
border: 1px solid var(--text-primary);
border-radius: 8px;              /* --radius-s */
padding: 8px 16px;               /* --space-s --space-m */
color: var(--text-primary);
font: 700 14px/1.5 Poppins;      /* no underline */
background: transparent;
```

---

## Type: Alert

### Visual Spec

```
Background:    rgba(255, 187, 56, 0.12)   /* Secondary-500 @ 12% — same in both modes */
Border-radius: 12px   (--radius-sm)
Padding:       8px 12px   (--space-s --space-sm)
Gap:           24px between info area and button
Text:          Poppins 14px / 1.5, Medium (500), var(--text-warning)
```

### Anatomy (left → right)

```
[ info: illustration? / icon? + title ] [ underline button? ]
```

- **illustration** — bell image, 20×20px, `shrink-0`
- **icon** — warning triangle, Iconsax `Danger` **Bold** variant, 20px, warning color
- **title** — `flex: 1`, single `<p>` 14px **Medium**, `color: var(--text-warning)`; 12px gap after illustration (8px when illustration + icon combine)
- **button** — underlined text button, right-aligned

### Alert Button

```css
color: var(--text-warning);
font: 700 14px/1.5 Poppins;
text-decoration: underline;
text-decoration-skip-ink: none;
background: transparent;
border: none;
padding: 0;
```

---

## React TypeScript Implementation

```tsx
import React from 'react';
import { InfoCircle, Danger } from 'iconsax-react';

type AlertType = 'Callout' | 'Alert';

interface AlertProps {
  type?: AlertType;
  illustration?: boolean;
  icon?: boolean;
  supportingText?: boolean;
  button?: boolean;
  title?: string;
  message?: string;
  bullets?: string[];
  buttonLabel?: string;
  onButtonClick?: () => void;
  illustrationSrc?: string;   // custom illustration image src
}

export const Alert: React.FC<AlertProps> = ({
  type = 'Callout',
  illustration = false,
  icon = false,
  supportingText = false,
  button = false,
  title = 'Callout title',
  message = 'You can add your content here.',
  bullets = [],
  buttonLabel = 'Button',
  onButtonClick,
  illustrationSrc,
}) => {
  const isAlert = type === 'Alert';
  const hasBody = supportingText && !isAlert;

  return (
    <div
      className={[
        'alert',
        `alert--${type.toLowerCase()}`,
        hasBody ? 'alert--with-body' : '',
      ].join(' ').trim()}
    >
      {/* Leading element */}
      {!isAlert && icon && (
        <InfoCircle size={20} variant="Outline" color="currentColor" className="alert__icon" />
      )}
      {!isAlert && illustration && !icon && illustrationSrc && (
        <img src={illustrationSrc} alt="" className="alert__illustration" />
      )}
      {isAlert && illustration && !icon && (
        <span className="alert__bell" aria-hidden="true">🔔</span>
      )}
      {isAlert && icon && (
        <Danger size={20} variant="Bold" color="currentColor" className="alert__icon" />
      )}

      {/* Text body */}
      {hasBody ? (
        <div className="alert__body">
          <div className="alert__description">
            <p className="alert__title">{title}</p>
            {bullets.length > 0 && (
              <ul className="alert__bullets">
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
          </div>
          {button && (
            <button className="alert__btn alert__btn--outlined" onClick={onButtonClick}>
              {buttonLabel}
            </button>
          )}
        </div>
      ) : (
        <p className="alert__message">{message}</p>
      )}

      {/* Inline underline button (simple Callout / Alert) */}
      {button && !hasBody && (
        <button className="alert__btn alert__btn--inline" onClick={onButtonClick}>
          {buttonLabel}
        </button>
      )}
    </div>
  );
};
```

---

## CSS

```css
/* ── Base ── */
.alert {
  display: flex;
  align-items: center;
  border-radius: var(--radius-sm);   /* 12px */
  padding: var(--space-s) var(--space-sm);  /* 8px 12px — all variants */
  gap: var(--space-s);               /* 8px */
  width: 100%;
  box-sizing: border-box;
  position: relative;
  font-family: 'Poppins', sans-serif;
}

/* ── Callout ── */
.alert--callout {
  background: var(--input-background);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

/* ── Alert (warning) ── */
.alert--alert {
  background: rgba(255, 187, 56, 0.12);  /* Secondary-500 @ 12% */
  color: var(--text-warning);
  font-size: 14px;
  font-weight: 500;                      /* Medium */
  line-height: 1.5;
  gap: var(--space-l);                   /* 24px */
}

/* ── With supporting text: align top ── */
.alert--with-body {
  align-items: flex-start;
}

/* ── Leading elements ── */
.alert__icon { flex-shrink: 0; }

.alert__illustration {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.alert--with-body .alert__illustration,
.alert--with-body .alert__icon {
  margin-top: 2px;                       /* optical top-align with title */
}

.alert__bell {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ── Message (simple) ── */
.alert__message {
  flex: 1;
  min-width: 0;
  margin: 0;
  color: inherit;
  font: inherit;
  word-break: break-word;
}

/* ── Body (supporting text) ── */
.alert__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-m);                   /* 16px between description and button */
}

.alert__description {
  display: flex;
  flex-direction: column;
  gap: var(--space-s);                   /* 8px between title and bullets */
}

.alert__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;                      /* Medium */
  line-height: 1.5;
  color: var(--text-secondary);
}

.alert__bullets {
  margin: 0;
  padding-left: 21px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* ── Buttons ── */
.alert__btn {
  flex-shrink: 0;
  font-family: inherit;
  font-weight: 700;                      /* Bold */
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
}

/* Inline underline — simple Callout and Alert */
.alert__btn--inline {
  color: var(--text-primary);            /* Callout */
  background: transparent;
  border: none;
  padding: 0;
  text-decoration: underline;
  text-decoration-skip-ink: none;
}

.alert--alert .alert__btn--inline {
  color: var(--text-warning);            /* Alert */
}

/* Outlined — below supporting text only */
.alert__btn--outlined {
  color: var(--text-primary);
  border: 1px solid var(--text-primary);
  border-radius: var(--radius-s);        /* 8px */
  padding: var(--space-s) var(--space-m); /* 8px 16px */
  background: transparent;
}

.alert__btn--outlined:hover {
  background: rgba(32, 34, 42, 0.04);
}
```

---

## Variants at a Glance

### Callout variants

All variants share the same `8px 12px` padding.

| illustration | icon | supportingText | button | Layout notes |
|---|---|---|---|---|
| ✗ | ✗ | ✗ | ✗ | Text only |
| ✓ | ✗ | ✗ | ✗ | Illustration + text |
| ✗ | ✓ | ✗ | ✗ | Icon + text |
| ✗/✓ | ✓/✗ | ✗ | ✓ | + **underlined** text button at row end |
| ✓ | ✗ | ✓ | ✗ | Illustration + title + bullets, align top |
| ✗ | ✓/✗ | ✓ | ✗ | Icon/plain + title + bullets, align top |
| any | — | ✓ | ✓ | … + **outlined** button below (16px gap) |

### Alert variants

| illustration | icon | Leading element |
|---|---|---|
| ✗ | ✗ | none — title only |
| ✓ | ✗ | bell (20px) |
| ✓ | ✓ | warning triangle — Iconsax `Danger` Bold (20px) |

Each can carry the underlined button on the right (24px gap).

---

## Token Summary

| Token | Light mode | Dark mode | Used for |
|---|---|---|---|
| `--input-background` | `#BFC2CC` @ 16% | `#454C5E` @ 16% | Callout background |
| `rgba(255,187,56,0.12)` | same | same | Alert background (Secondary-500 @ 12%, literal) |
| `--text-secondary` | Neutral-500 `#454C5E` | Neutral-200 `#BFC2CC` | Callout text |
| `--text-warning` | Warning-600 `#E88206` | Warning-500 `#FFA538` | Alert text + button |
| `--text-primary` | Neutral-800 `#20222A` | Neutral-25 `#F9F9FA` | Callout button border + label |
| `--radius-sm` / `--radius-s` | 12px / 8px | — | Container / outlined button radius |
| `--space-s` / `--space-sm` | 8px / 12px | — | Container padding (vertical / horizontal) |
| `--space-m` / `--space-l` | 16px / 24px | — | Body↔button gap / Alert info↔button gap |

---

## Do / Don't

✓ Use **Callout** for tips, guidance, onboarding hints, feature announcements  
✓ Use **Alert** for system warnings, expiring content, required actions  
✓ Keep button labels short (1–2 words, Title Case)  
✓ Use `supportingText` only when the message genuinely needs a title + list structure  

✗ Don't use both `illustration` and `icon` together in Callout — pick one  
✗ Don't use `supportingText` on Alert type — it has no spec for it  
✗ Don't use the outlined button inline — outlined only appears below supporting text; inline is always the underlined text button  
✗ Don't hardcode warning text color — use `--text-warning` (resolves per mode)  

---

## Code Extensions (src/components/Alert)

The built component adds practical props beyond the Figma spec — keep them: `customIcon` (ReactNode leading icon), `onClose` (renders a 24px close ✕ at row end), and `title`+`message` body (title + paragraph instead of bullets, 2px gap).

---

# Toast

A floating feedback pill that appears after an action (save, delete, error) and auto-dismisses. Unlike Alert/Callout it is not inline: it overlays the page, hugs its content, and uses solid semantic fills with a near-white Bold label in **both modes**.

Spec source: Figma Library — `node 5045:14119`.

## Visual Spec

```
Padding:   12px 16px   (--space-sm --space-m)
Radius:    12px        (--radius-sm)
Gap:       8px         (icon ↔ label)
Shadow:    Shadow L — -4px 0 24px rgba(32, 34, 42, 0.12)
Label:     Poppins Bold 16 (H4), var(--neutral-25) — near-white on every fill
Icon:      optional, 24px, same near-white
Width:     hugs content (no fixed width)
```

## Types

| Type | Background | Icon (24px) |
|---|---|---|
| **Info** | `--border` (`#383D4C` dark) — a dark neutral pill | io5 `IoInformationCircleOutline` |
| **Success** | `--success-500` `#18A957` | Iconsax `TickCircle` |
| **Warning** | `--warning-600` `#E88206` | warning triangle (Iconsax `Danger`) |
| **Error** | `--danger-500` `#DF1642` | warning triangle (Iconsax `Danger`) |

> **Library gap:** the Toast has a single Figma node (no light/dark pair) and the Info fill is bound to the `Border` variable, whose *light* value (`#DFE1E6`) would make the near-white label illegible. Treat the Info pill as a fixed dark neutral (`--neutral-600` `#383D4C`) in both modes until the library adds a light node.

## CSS

```css
.toast {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-s);                    /* 8px */
  padding: var(--space-sm) var(--space-m); /* 12px 16px */
  border-radius: var(--radius-sm);        /* 12px */
  box-shadow: -4px 0 24px rgba(32, 34, 42, 0.12);   /* Shadow L */
  font: 700 16px/1.5 'Poppins', sans-serif;
  color: var(--neutral-25);
  width: fit-content;
}

.toast--info    { background: var(--neutral-600); }  /* see library-gap note */
.toast--success { background: var(--success-500); }
.toast--warning { background: var(--warning-600); }
.toast--error   { background: var(--danger-500); }
```

## Behaviour

- Appears on action feedback, stacked bottom-center (or per app convention), auto-dismisses after ~5s with a fade. Budget roughly 1s to notice the pill plus ~300ms per word (200wpm) — raise the duration rather than let a long message time out before it can be read.
- `role="status"` (Info/Success) or `role="alert"` (Warning/Error) so screen readers announce it.
- One line, no wrapping — keep messages short ("Saved", "Course published"). No buttons; if the user must act, use a Dialog or Alert instead.

## Alert vs Callout vs Toast

| | Callout | Alert | Toast |
|---|---|---|---|
| Placement | inline with content | inline with content | floating overlay |
| Purpose | guidance / tips | warnings needing attention | action feedback |
| Persistence | persistent | persistent | auto-dismisses |
| Fill | translucent neutral | amber @12% tint | solid semantic color |
| Type scale | Regular/Medium 14 | Medium 14 | **Bold 16** |

## Code reality (src/components/Toast)

`src/components/Toast/Toast.tsx` implements the pill with a `useToast()` stack hook (5s auto-dismiss + 300ms fade). Drift from the node: Warning uses `--warning-500` + `--neutral-800` text (Figma: `--warning-600` + near-white), Info uses `--neutral-500` (Figma: `#383D4C`), Success/Error label color is `--neutral-0` (Figma: `--neutral-25`), and the Error icon is `CloseCircle` (Figma: warning triangle).

---

# Tooltip

A small dark floating label that appears on hover, focus, or click of a trigger. The information must be contextual, useful, and **nonessential** — never put required content in a tooltip.

Spec source: Figma Library — light `11927:8087` / dark `2683:29027`.

## Props

| Prop | Values | Default | Description |
|---|---|---|---|
| `position` | `Top \| Bottom \| Right \| Left` | `Top` | Which side of the trigger the tooltip appears on (caret points back at the trigger) |
| `alignment` | `Center \| Start \| End` | `Center` | Caret placement along the edge — Start/End apply to Top/Bottom only; Left/Right are always Center |
| `icon` | `boolean` | `false` | Renders a 20px io5 `IoInformationCircleOutline` as the anchor (info-icon-with-tooltip pattern), 4px gap to the body |

## Visual Spec

```
Background:  var(--tooltip-background)   /* #20222A (Neutral-800), both modes */
Padding:     8px 12px   (--space-s --space-sm)
Radius:      12px       (--radius-sm)
Text:        Poppins Regular 14 / 1.5, var(--neutral-25)
Max width:   288px — wrap, don't overflow
Shadow:      Shadow L — drop-shadow(-4px 0 24px rgba(32, 34, 42, 0.12))
Caret:       12×6px triangle pointing at the trigger;
             Start/End alignments inset it 16px from the body edge;
             rotated 90° for Left/Right positions
```

> Token rule: the tooltip background is always `var(--tooltip-background)` (`#20222A`) in the app. Some Figma nodes carry a stale `#0F1014` value on the variable — the token is the rule.

## Behaviour

- Show on `mouseenter` and `:focus-visible`; hide on leave/blur/Esc. Keep hover-out forgiving (small delay) so the pointer can travel.
- Choose `position` so the tooltip never clips a viewport edge; flip if needed.
- One short phrase or sentence, Regular weight only — no bold, no links, no buttons (interactive content belongs in a popover/listbox).
- `role="tooltip"` + `aria-describedby` on the trigger.

## Code reality (src/components/Tooltip)

`src/components/Tooltip/Tooltip.tsx` implements the full position/alignment matrix incl. the optional info-icon anchor and 288px max-width — use it, don't hand-roll. It matches this spec (its `#0f1014` fallback never applies since `tokens.css` defines the variable).

## Alert vs Callout vs Toast vs Tooltip

All four are informative components; pick by persistence and placement:

| | Callout | Alert | Toast | Tooltip |
|---|---|---|---|---|
| Placement | inline | inline | floating overlay | floating, anchored to a trigger |
| Trigger | always visible | always visible | after an action | hover / focus |
| Content | guidance, tips | warnings | action feedback | nonessential context |
| Dismissal | persistent | persistent | auto (~5s) | on leave/blur |

## Related Skills

- `5mins-colors` (colors.md) — surface, text, and palette tokens
- `layout.md` — spacing and radius tokens, Shadow L
- `buttons` — for full standalone button component (Alert uses inline patterns, not the button component)
- `overlays.md` — Dialogs, for blocking feedback that needs user action
