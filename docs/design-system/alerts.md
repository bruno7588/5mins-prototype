---
name: 5mins-alerts
description: Alert and Callout banner component for 5Mins.ai. Use when implementing inline notifications, warning banners, informational callouts, contextual guidance messages, empty-state prompts, or any component that surfaces a message with optional icon, supporting text, or CTA button. Trigger this skill whenever building any alert, callout, warning strip, info banner, or notification box in the 5Mins.ai admin or learner UI.
---

# 5Mins.ai Alert & Callout Component

Two distinct banner types for surfacing messages inline with content.

- **Callout** — informational, neutral surface, used for guidance, tips, and contextual help
- **Alert** — warning state, yellow-tinted surface, used for system warnings and attention-required messages

---

## Component Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"Callout" \| "Alert"` | `"Callout"` | Visual style and semantic intent |
| `illustration` | `boolean` | `true` | Show small decorative icon/graphic before text |
| `icon` | `boolean` | `false` | Show info-circle icon (overrides illustration in Callout; stacks with text in Alert) |
| `supportingText` | `boolean` | `false` | Show title + bullet list body (Callout only) |
| `button` | `boolean` | `false` | Show a CTA button |

---

## Type: Callout

### Visual Spec

```
Background:    var(--surface-input)  →  rgba(191, 194, 204, 0.16)
Border-radius: 12px  (--spacing-sm)
Padding:       12px 16px  (--spacing-sm --spacing-m)  →  16px all sides when supportingText
Text color:    var(--text-secondary)  →  #BFC2CC  (Neutral-200)
Font:          Poppins 14px / 1.5 line-height
```

### Anatomy (left → right)

```
[ illustration? ] [ icon? ] [ text / body ] [ button? ]
```

- **illustration** — 20×20px decorative SVG/image, `shrink-0`, sits flush left
- **icon** — 20×20px Iconsax `InformationCircle` (outline variant), `shrink-0`; only one of `illustration` or `icon` shows at a time
- **text area** — `flex: 1`, contains either:
  - Simple: single `<p>` 14px Regular
  - Supporting: `<p>` 14px Medium (title) + `<ul>` 14px Regular (bullets), `gap: 8px` between
- **button** — see Button spec below

### Callout Button

Outlined style, appears at the **end** of the row (simple) or **below** the description (supporting text):

```css
border: 1px solid var(--text-primary);   /* #F9F9FA */
border-radius: 8px;                      /* --spacing-s */
padding: 8px 16px;                       /* --spacing-s --spacing-m */
color: var(--text-primary);
font: 700 14px/1.5 Poppins;             /* Bold */
background: transparent;
```

---

## Type: Alert

### Visual Spec

```
Background:    rgba(255, 187, 56, 0.12)  →  Warning-500 @ 12% opacity
Border-radius: 12px
Padding:       12px 16px
Text color:    var(--text-warning)  →  #996322  (Warning-700, accessible on yellow bg)
Font:          Poppins 16px / 1.5 line-height
Gap:           24px between info area and button
```

### Anatomy (left → right)

```
[ icon/illustration ] [ text ] [ button? ]
```

- **illustration** — bell icon (21×21px SVG), `shrink-0`
- **icon** — 24×24px Iconsax `InformationCircle` (outline), wrapped in a flex container, `shrink-0`
- **text** — `flex: 1`, single `<p>` 16px Regular, `color: var(--text-warning)`
- **button** — see Alert Button spec below

### Alert Button

Inline underline style, floats to the right:

```css
color: var(--text-warning);   /* same as text */
font: 700 16px/1.5 Poppins;  /* Bold */
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
import { InfoCircle } from 'iconsax-react';

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
    <div className={`alert alert--${type.toLowerCase()} ${hasBody ? 'alert--with-body' : ''}`}>

      {/* Illustration / Icon */}
      {!isAlert && icon && (
        <InfoCircle size={20} variant="Outline" className="alert__icon" />
      )}
      {!isAlert && illustration && !icon && illustrationSrc && (
        <img src={illustrationSrc} alt="" className="alert__illustration" />
      )}
      {isAlert && illustration && !icon && (
        <span className="alert__bell" aria-hidden="true">🔔</span>
      )}
      {isAlert && icon && (
        <InfoCircle size={24} variant="Outline" className="alert__icon" />
      )}

      {/* Text body */}
      {hasBody ? (
        <div className="alert__body">
          <p className="alert__title">{title}</p>
          {bullets.length > 0 && (
            <ul className="alert__bullets">
              {bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
          {button && (
            <button className="alert__btn alert__btn--outlined" onClick={onButtonClick}>
              {buttonLabel}
            </button>
          )}
        </div>
      ) : (
        <p className="alert__message">{message}</p>
      )}

      {/* Inline button (simple / Alert variants) */}
      {button && !hasBody && (
        <button
          className={`alert__btn ${isAlert ? 'alert__btn--inline' : 'alert__btn--outlined'}`}
          onClick={onButtonClick}
        >
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
  border-radius: 12px;         /* --spacing-sm */
  padding: 12px 16px;          /* --spacing-sm --spacing-m */
  gap: 8px;                    /* --spacing-s */
  width: 100%;
  position: relative;
}

/* ── Callout ── */
.alert--callout {
  background: var(--surface-input);    /* rgba(191,194,204,0.16) */
  color: var(--text-secondary);        /* #BFC2CC */
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

/* ── Alert ── */
.alert--alert {
  background: rgba(255, 187, 56, 0.12);  /* Warning-500 @ 12% */
  color: var(--text-warning);            /* #996322 */
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  gap: 24px;
}

/* ── With supporting text: align top, add padding ── */
.alert--with-body {
  align-items: flex-start;
  padding: 16px;               /* --spacing-m all sides */
}

/* ── Icon ── */
.alert__icon {
  flex-shrink: 0;
  color: inherit;
}

.alert__illustration {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* ── Message (simple) ── */
.alert__message {
  flex: 1;
  min-width: 0;
  margin: 0;
  color: inherit;
  font: inherit;
}

/* ── Body (supporting text) ── */
.alert__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;           /* Medium */
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

.alert__bullets li + li {
  margin-top: 0;
}

/* ── Buttons ── */
.alert__btn {
  flex-shrink: 0;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;            /* Bold */
  line-height: 1.5;
  cursor: pointer;
}

/* Outlined — Callout */
.alert__btn--outlined {
  font-size: 14px;
  color: var(--text-primary);              /* #F9F9FA */
  border: 1px solid var(--text-primary);
  border-radius: 8px;                      /* --spacing-s */
  padding: 8px 16px;                       /* --spacing-s --spacing-m */
  background: transparent;
}

.alert__btn--outlined:hover {
  background: rgba(249, 249, 250, 0.08);
}

/* Inline underline — Alert */
.alert__btn--inline {
  font-size: 16px;
  color: var(--text-warning);
  background: transparent;
  border: none;
  padding: 0;
  text-decoration: underline;
  text-decoration-skip-ink: none;
}
```

---

## Variants at a Glance

### Callout variants

| illustration | icon | supportingText | button | Layout notes |
|---|---|---|---|---|
| ✗ | ✗ | ✗ | ✗ | Text only, `py-12` |
| ✓ | ✗ | ✗ | ✗ | Illustration + text, `py-12` |
| ✗ | ✓ | ✗ | ✗ | Icon + text, `py-12` |
| ✓ | ✗ | ✗ | ✓ | Illustration + text + button (end), `py-12` |
| ✗ | ✓ | ✗ | ✓ | Icon + text + button (end), `py-12` |
| ✓ | ✗ | ✓ | ✗ | Illustration + title + bullets, `p-16`, align top |
| ✓ | ✗ | ✓ | ✓ | Illustration + title + bullets + button (below), `p-16`, align top |
| ✗ | ✓ | ✓ | ✗ | Icon + title + bullets, `p-16`, align top |
| ✗ | ✓ | ✓ | ✓ | Icon + title + bullets + button (below), `p-16`, align top |

### Alert variants

| illustration | icon | button | Notes |
|---|---|---|---|
| ✗ | ✗ | ✗ | Text only |
| ✓ | ✗ | ✗ | Bell icon + text |
| ✗ | ✓ | ✗ | Info icon + text |
| ✗ | ✗ | ✓ | Text + underline button |
| ✓ | ✗ | ✓ | Bell + text + underline button |
| ✗ | ✓ | ✓ | Info icon + text + underline button |

---

## Token Summary

| Token | Value | Used for |
|---|---|---|
| `--surface-input` | `rgba(191,194,204,0.16)` | Callout background |
| `rgba(255,187,56,0.12)` | hardcoded | Alert background (Warning-500 @ 12%) |
| `--text-secondary` | `#BFC2CC` | Callout text |
| `--text-warning` | `#996322` | Alert text (Warning-700, accessible) |
| `--text-primary` | `#F9F9FA` | Callout button border + label |
| `--spacing-sm` | `12px` | Border-radius, vertical padding |
| `--spacing-m` | `16px` | Horizontal padding |
| `--spacing-s` | `8px` | Gap, button padding vertical |

---

## Do / Don't

✓ Use **Callout** for tips, guidance, onboarding hints, feature announcements  
✓ Use **Alert** for system warnings, expiring content, required actions  
✓ Keep button labels short (1–2 words)  
✓ Use `supportingText` only when the message genuinely needs a title + list structure  

✗ Don't use both `illustration` and `icon` together in Callout — pick one  
✗ Don't use `supportingText` on Alert type — it has no spec for it  
✗ Don't use the Alert's inline button style on Callout — they have different button patterns  
✗ Don't hardcode warning yellow (`#FFBB38`) as text — use `--text-warning` which is the darker, accessible Warning-700  

---

## Related Skills

- `5mins-surface-colors` — `--surface-input` token used for Callout background
- `5mins-text-colors` — `--text-secondary`, `--text-warning`, `--text-primary` tokens
- `buttons` — for full standalone button component (Alert uses inline patterns, not the button component)
- `5mins-brand-colors` — Warning-500/700 palette values
