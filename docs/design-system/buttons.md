---
name: 5mins-buttons
description: Button component system for 5Mins.ai - Filled, Outlined, Outlined-2, Text, and Link variants; Danger/Warning/Success semantic families (filled, outlined, text); AI gradient buttons; three sizes; Enabled/Hover/Pressed/Disabled/Loading states; leading-icon support. Use when implementing any button, CTA, or clickable action.
---

# Buttons

Triggers a single action, with the variant telling the user how important or how risky that action is.

**Code:** `import Button from '@/components/Button/Button'`
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `10825:3269` (parent frame `5453:38273`)
**Last verified:** 2026-09-29

All colours are semantic tokens. Both light- and dark-mode resolutions are listed because the two modes use different state ladders.

## Usage

**Intent:** triggers a single action the user chooses to take, with the variant telling them how important or how risky that action is.

**Use when**
- The user commits, saves, submits or starts something (filled primary).
- A secondary action sits beside the primary one, such as Save Draft or Add Content (outlined).
- The user backs out of a dialog, modal or drawer (Cancel, outlined-2).
- The action destroys or removes something (`semantic="danger"`), or is a Hugo AI action (`semantic="ai"`).

**Don't use when**
- The action applies to one row of a table or list → use the row kebab menu ([doc](row-actions-menu.md))
- The action applies to the rows the user has selected → use the bulk action bar and its `.bulk-bar-btn` children ([doc](bulk-action-bar.md))
- The control closes an overlay → use `CloseButton` ([doc](overlays.md))

**Do**
- Use the shared component: `import Button from '@/components/Button/Button'`.
- Keep Filled for the one most important action in the view.
- Pair Cancel as `variant="outlined-2"`. In dialogs Cancel comes before the filled or danger commit button; in side-drawer footers the filled primary comes first, then Cancel.
- Use `variant="outlined"` for secondary actions (Save Draft, Add Content), not for Cancel.
- Use `semantic="danger"` for the commit button of a destructive confirmation.
- Keep modal, dialog and drawer footers at the default Medium size; use `size="sm"` in table rows and compact lists.
- Put icons in the leading `icon` slot: Iconsax at 16/20/24px with `color="currentColor"`.
- Keep `trailingIcon` for disclosure controls whose Figma shows a trailing chevron.
- Show async work with `loading`; add `loadingLabel` ("Marking…", "Generating…") when the wait is long enough that a bare spinner leaves the user guessing.
- Where it helps, name what the commit button acts on (the count or the person), so it reads differently from the button that opened the dialog.
- Write labels in Title Case ("Save Changes", "Delete Report").
- Give an icon-only button an `aria-label`.

**Don't**
- Don't hand-roll a `<button>` with page-level classes that copy the button styles.
- Don't fake a loading state with a disabled button and your own spinner; use `loading`.
- Don't use the legacy global `.btn-primary` / `.btn-outlined` classes in new work.
- Don't use Large buttons in modal or dialog footers.
- Don't use `--text-button-foreground` for semantic filled labels; they stay `--neutral-25` in both modes.
- Don't use `--primary-500` as text on white, and don't write raw hex or px values; use the tokens below.

### Variant selection

- **Filled** - primary CTA, form submits, the one most-important action on the page
- **Outlined** - secondary actions (Save Draft, Download, Add Content), not Cancel
- **Outlined-2** - Cancel (paired with Filled, including every dialog footer) and other neutral actions that shouldn't read as brand-coloured at rest
- **Text** - inline, subtle actions
- **Link** - navigation-like actions within content

### Semantic selection

**Primary (Cyan):** default · **Danger (Red):** delete/destructive · **Warning (Orange):** consequence-laden actions · **Success (Green):** confirm/complete · **AI (Gradient):** Hugo AI and AI-powered features

### Size selection

**Large:** hero sections, primary CTAs · **Medium:** standard (most common), including modal and dialog footers · **Small:** tables, compact UIs

### Quick reference

| Action | Variant | Semantic | Size |
|--------|---------|----------|------|
| Main CTA | Filled | Primary | Large |
| Form submit | Filled | Primary | Medium |
| Cancel | Outlined-2 | Primary | Medium |
| Delete | Filled | Danger | Medium |
| Neutral tertiary | Outlined-2 | Primary | Medium |
| Inline link | Link | Primary | n/a |
| AI feature | Filled (gradient) | AI | Medium |
| Mark complete | Filled | Success | Medium |

**Canonical spec:** height Small 33px / Medium 41px / Large 48px; radius `var(--radius-sm)` (12px); Poppins Bold 12px / 14px / 16px; Medium padding 10px `var(--space-ml)` (20px); icon gap `var(--space-xs)` (4px) Small, `var(--space-s)` (8px) Medium and Large. Filled `var(--primary-button-background)` with `var(--text-button-foreground)` label; Outlined-2 `var(--border-elevated)` 1px border with `var(--text-primary)` label; disabled `var(--button-background-disabled)` + `var(--text-button-disabled)`; focus 2px `var(--primary-button-background)` outline, 2px offset. Figma: Library `EC26cSVe9KNTCWXvYovakw`, `10825:3269` (parent frame `5453:38273`).

## Figma to code

| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Variant | Filled / Outlined / Outlined-2 / Text / Link | `variant` | `filled` (default) / `outlined` / `outlined-2` / `text` / `link` | one-to-one |
| Semantic | Primary / Danger / Warning / Success / AI | `semantic` | `primary` (default) / `danger` / `warning` / `success` / `ai` | one-to-one. AI exists only with Filled and Outlined, and the props type rejects `semantic="ai"` with any other variant; `variant="outlined-2"` with a semantic renders the Outlined treatment, `variant="link"` with a semantic renders the Text treatment |
| Size | Large / Medium / Small | `size` | `lg` / `md` (default) / `sm` | Figma default is Large; code default is `md` |
| State | Enabled / Hover / Pressed / Focus | n/a | CSS `:hover`, `:active`, `:focus-visible` | states are CSS, not props. Focus draws a 2px `Primary-button-background` ring 2px outside the button (a `Focus ring` layer) |
| State | Loading | `loading` | `true` / `false` | |
| State | n/a | n/a | n/a | only used with Disabled=true |
| Disabled | false / true | `disabled` | native attribute | `loading` also sets `disabled` |
| Icon | true / false | `icon` | pass an icon, or leave it out | stays a variant because the icon side's padding is one step tighter |
| Icon glyph (instance swap) | any Iconsax icon | `icon` | `<Add size={20} color="currentColor" />` | swap the glyph in Figma; code takes the matching Iconsax node |
| Label (text) | free text | `children` | Title Case string | |

The component composes one appearance class from `(semantic, variant)`: `ds-btn--filled`, `ds-btn--danger-outlined`, `ds-btn--ai`, etc. Semantic families (danger/warning/success) mirror filled/outlined/text; AI is filled + outlined only. See `Button.css` for the full class matrix.

- **Figma only:** the `State=n/a` value exists only to pair with `Disabled=true`.
- **Code only:** `trailingIcon` (disclosure controls only), `loadingLabel` (labelled loading, see States).

**Props**

```tsx
import Button from '@/components/Button/Button';

type ButtonVariant = 'filled' | 'outlined' | 'outlined-2' | 'text' | 'link';
type ButtonSemantic = 'primary' | 'danger' | 'warning' | 'success' | 'ai';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;    // default 'filled'
  semantic?: ButtonSemantic;  // default 'primary'
  size?: ButtonSize;          // default 'md'
  icon?: ReactNode;           // leading icon, rendered BEFORE the label
  trailingIcon?: ReactNode;   // AFTER the label, disclosure controls only
  loading?: boolean;
  loadingLabel?: string;      // word shown beside the spinner while loading
  children?: ReactNode;
}
```

**Size and state coverage in Figma.** One component set serves both modes. Primary variants (Filled/Outlined/Outlined-2/Text/Link) and AI/AI-Outlined cover all three sizes. Semantic coverage:

| Family | Sizes in Figma |
|--------|----------------|
| Danger | S, M, L |
| Danger-outlined | S, L |
| Danger-text | S, M, L |
| Warning | S, M, L |
| Warning-outlined | S, M, L |
| Warning-text | S, L |
| Success | S, M, L |
| Success-outlined | S, M, L |
| Success-text | S, L |

Every present size has all states (Enabled, Hover, Pressed, Focus, Loading, disabled). For the missing Medium sizes, extrapolate from the Sizes table.

**Implementation notes.** `src/components/Button/Button.tsx` is the canonical component; use it for all new work. It is namespaced `ds-btn` rather than `btn` so it doesn't collide with the legacy global `.btn-*` utility classes (CSS is globally bundled in this app). Two legacy button patterns also still exist, to be migrated opportunistically (convert a call site when you're already editing that file, no big-bang sweep):

- **Legacy global classes** in `src/styles/tokens.css`: `.btn-primary`, `.btn-outlined`, `.btn-success`, `.btn-danger`, `.btn-text` (~50 usages). These predate the component and cover only the common cases.
- **Raw `<button>` elements** with hand-rolled styling across pages.

**Production:**

| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|
| Button | _to be mapped by engineering_ | | |

## Anatomy

`[leading icon?] Label [trailing icon?]`, with a centred spinner replacing the label in the Loading state.

Icons are **leading**: before the label, Iconsax Linear at the size-bound dimension (16/20/24px), `currentColor`. AI variants always carry an icon.

```tsx
<Button icon={<Add size={20} color="currentColor" />}>Add Course</Button>
{/* renders: [ + Button ], icon first, label after */}
```

Any call site that visually relies on a trailing icon should be re-checked against Figma; `trailingIcon` is for disclosure controls only.

**Borders.** Fill configurations (Filled, Danger, Warning, Success, AI) render **no border**; bordered configurations draw their 1px border inside the size by taking that pixel out of the padding (`--btn-bw`), so every configuration of a size matches the heights in Sizes (S 33 · M 41 · L 48).

## Variants

### Filled (default)

The ladder is **mode-aware**: light gets darker on interaction, dark gets *lighter* on hover, and the label flips to dark on the bright dark-mode fill. Token values are in [Tokens](#tokens).

```css
.btn-filled {
  background: var(--primary-button-background);
  color: var(--text-button-foreground);           /* dark on cyan in dark mode, the token handles it */
  border: none;
}
.btn-filled:hover    { background: var(--primary-button-background-hover); }
.btn-filled:active   { background: var(--primary-button-background-pressed); }
.btn-filled:disabled { background: var(--button-background-disabled); color: var(--text-button-disabled); }
```

### Outlined

**Transparent at rest.** Fill ladder: transparent → **16% Primary-500 tint on hover** → transparent on press. Border and text share one colour per state:

| State | Fill | Border + text | Light | Dark |
|-------|------|---------------|-------|------|
| Enabled | transparent | `--text-button-outlined` | Primary-700 `#008393` | Primary-500 `#00CEE6` |
| Hover | `rgba(0,206,230,0.16)` | `--text-button-hover` | Primary-700 `#008393` | Primary-400 `#33E2F7` |
| Pressed | transparent | `--primary-button-background-pressed` | Primary-900 `#002C31` | Primary-600 `#00AFC4` |
| Disabled | transparent | `--text-disabled` | Neutral-300 | Neutral-400 |

In **light** mode the rest and hover chrome are the same colour; the hover cue is the 16% fill. In **dark** mode the chrome also brightens.

```css
.btn-outlined {
  background: transparent;
  color: var(--text-button-outlined);
  border: 1px solid var(--text-button-outlined);
}
.btn-outlined:hover {
  background: rgba(0, 206, 230, 0.16);            /* Primary-500 @ 16%, both modes */
  color: var(--text-button-hover);
  border-color: var(--text-button-hover);
}
.btn-outlined:active {
  background: transparent;
  color: var(--primary-button-background-pressed);
  border-color: var(--primary-button-background-pressed);
}
.btn-outlined:disabled {
  background: transparent;
  color: var(--text-disabled);
  border-color: var(--text-disabled);
}
```

### Outlined-2

Neutral at rest: `--border-elevated` hairline + `--text-primary` label, transparent fill. Hover/Pressed are **identical to Outlined** (16% cyan tint on hover, brand chrome). Use for tertiary actions where the brand colour should only surface on interaction. Has Loading in all three sizes.

```css
.btn-outlined-2 {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-elevated);
}
/* :hover / :active, same as .btn-outlined */
```

### Text

No background, border, or padding, just the bold label. Same chrome ladder as Outlined:

```css
.btn-text {
  background: transparent; border: none; padding: 0;
  color: var(--text-button-outlined);
}
.btn-text:hover    { color: var(--text-button-hover); }
.btn-text:active   { color: var(--primary-button-background-pressed); }
.btn-text:disabled { color: var(--text-disabled); }        /* note: --text-disabled, not --text-button-disabled */
```

### Link

Use for navigation-like actions within content. No box, no padding, no icon. Link is **Medium (500), not Bold**, it takes the **Filled button's colour ladder** rather than the Text/Outlined chrome ladder, and the underline **skips descenders** (`skip-ink: auto`).

| Size | Text style | Font | Line height |
|---|---|---|---|
| Small | Paragraph S medium | 12px / 500 | 1.2 |
| Medium | Paragraph M medium | 14px / 500 | 1.5 |
| Large | Paragraph L medium | 16px / 500 | 1.5 |

| State | Colour |
|---|---|
| Enabled | `--primary-button-background` |
| Hover | `--primary-button-background-hover` |
| Pressed | `--primary-button-background-pressed` |
| Disabled | `--text-disabled` |

```css
.btn-link {
  font-weight: 500;
  color: var(--primary-button-background);
  text-decoration: underline;
  text-decoration-skip-ink: auto;
}
.btn-link:hover    { color: var(--primary-button-background-hover); }
.btn-link:active   { color: var(--primary-button-background-pressed); }
.btn-link:disabled { color: var(--text-disabled); }
.btn-link.btn-sm   { line-height: 1.2; }  /* Paragraph S medium */
```

### Semantic variants

Semantic **filled labels are always `Neutral-25`** (`--neutral-25`, both modes); do **not** use `--text-button-foreground`, which flips dark in dark mode. Semantic **outlined** follows the same fill ladder as primary Outlined but with a **24%** hover tint (vs 16% for primary). The semantic families (Danger, Warning, Success) all darken on hover in both modes; only the primary filled button lightens on dark hover. Semantic-text variants (Danger/Warning/Success-text) are first-class, and Loading exists for the semantic-outlined families.

#### Danger (destructive actions)

Darkens on interaction in **both** modes:

```css
.btn-danger          { background: var(--danger-500); color: var(--neutral-25); }
.btn-danger:hover    { background: var(--button-danger-hover); }     /* Danger-600 #9C0F2E */
.btn-danger:active   { background: var(--button-danger-pressed); }   /* Danger-700 #59091A */

.btn-danger-outlined          { background: transparent; color: var(--danger-500); border: 1px solid var(--danger-500); }
.btn-danger-outlined:hover    { background: rgba(223, 22, 66, 0.24); /* Danger-500 @ 24% */
                                color: var(--text-error); border-color: var(--text-error); } /* light #DF1642 / dark Danger-400 #E95C7B */
.btn-danger-outlined:active   { background: transparent;
                                color: var(--button-danger-hover); border-color: var(--button-danger-pressed); } /* text and border differ, per Figma */
.btn-danger-text     { background: transparent; border: none; padding: 0; color: var(--danger-500); }
```

#### Warning (caution actions)

Default is **Warning-600**. One darkening ladder in both modes (token values in [Tokens](#tokens)).

```css
.btn-warning          { background: var(--button-warning-background); color: var(--neutral-25); }
.btn-warning:hover    { background: var(--button-warning-background-hover); }
.btn-warning:active   { background: var(--button-warning-background-pressed); }

.btn-warning-outlined          { background: transparent; color: var(--button-warning-background); border: 1px solid var(--button-warning-background); }
.btn-warning-outlined:hover    { background: rgba(255, 165, 56, 0.24); /* Warning-500 @ 24% */
                                 color: var(--text-warning); border-color: var(--text-warning); }
.btn-warning-outlined:active   { background: transparent;
                                 color: var(--button-warning-background-pressed); border-color: var(--button-warning-background-pressed); }
.btn-warning-text     { background: transparent; border: none; padding: 0; color: var(--button-warning-background); }
```

#### Success (positive actions)

One darkening ladder in both modes (token values in [Tokens](#tokens)).

```css
.btn-success          { background: var(--button-success-background); color: var(--neutral-25); }
.btn-success:hover    { background: var(--button-success-background-hover); }
.btn-success:active   { background: var(--button-success-background-pressed); }

.btn-success-outlined          { background: transparent; color: var(--button-success-background); border: 1px solid var(--button-success-background); }
.btn-success-outlined:hover    { background: rgba(24, 169, 87, 0.24); /* Success-500 @ 24% */
                                 border-color: var(--button-success-background-hover);
                                 color: var(--button-success-background); }  /* text stays base on hover, per Figma */
.btn-success-outlined:active   { background: transparent;
                                 color: var(--button-success-background-pressed); border-color: var(--button-success-background-pressed); }
.btn-success-text     { background: transparent; border: none; padding: 0; color: var(--button-success-background); }
```

Disabled state for all semantic variants = the shared disabled treatment (`--button-background-disabled` fill for filled; transparent fill + `--text-disabled` chrome for outlined/text).

### AI (Hugo AI)

AI buttons use a diagonal **gradient that ends at Blaze `#8158EC`** and *starts* at the primary filled colour for the current state and mode, so the gradient follows the same mode-aware ladder as `.btn-filled`. The sparkle "AI Generate" icon is **leading** and size-bound. Label is `--neutral-25` (white) in both modes. All three sizes, all five states.

| State | Light gradient start | Dark gradient start | Extra chrome |
|-------|---------------------|---------------------|--------------|
| Enabled | Primary-700 `#008393` | Primary-500 `#00CEE6` | none |
| Hover | Primary-800 `#005862` | Primary-400 `#33E2F7` | **2px `#00CEE6` ring + glow** `drop-shadow(1px 1px 16px rgba(129,88,236,0.5))` |
| Pressed | Primary-900 `#002C31` | Primary-600 `#00AFC4` | 1px `#00CEE6` ring |
| Disabled | standard disabled fill + label | standard | none |

**Gradient geometry:** Figma uses a **diamond gradient centred at the button's top-left corner** (its 6 stops are collinear, so only the two endpoint colours matter). The closest CSS equivalent is `radial-gradient(circle at top left, start, end)`; corner samples match within ~4%. A `linear-gradient(120deg, …)` is an acceptable fallback; ~100deg is too flat (the left edge visibly shifts toward purple as it descends).

The fill has no border to colour, so the AI hover's 2px cyan ring is drawn as an inset 2px ring (1px on press); nothing reflows.

```css
.btn-ai {
  /* start = the mode-resolved primary filled token, end = Blaze */
  background: radial-gradient(circle at top left, var(--primary-button-background) 0%, var(--blaze-quiz) 100%);
  color: var(--neutral-25);
  border: none;
}
.btn-ai:hover {
  background: radial-gradient(circle at top left, var(--primary-button-background-hover) 0%, var(--blaze-quiz) 100%);
  box-shadow: inset 0 0 0 2px var(--primary-500);   /* 2px cyan ring, both modes */
  filter: drop-shadow(1px 1px 16px rgba(129, 88, 236, 0.5));
}
.btn-ai:active {
  background: radial-gradient(circle at top left, var(--primary-button-background-pressed) 0%, var(--blaze-quiz) 100%);
  box-shadow: inset 0 0 0 1px var(--primary-500);   /* 1px cyan ring */
}
```

#### AI-Outlined

**Transparent at rest**; the wash appears only on hover, at 24%. The 1px stroke is **the AI gradient, not a flat cyan**: it sweeps cyan through purple along the edge, on the same per-state ladder as the label it frames. The **label + icon are gradient-filled** via background-clip with that same gradient. The MCP code export flattens this stroke to its first stop and reports `border: 1px solid #00cee6`; that export is wrong. Figma paints a diamond gradient, so CSS uses the `radial-gradient(circle at top left, …)` approximation, exactly as `.btn-ai` does for its fill.

The ring is drawn as a **masked pseudo-element**, not a border: the button is transparent at rest, so the usual two-background border trick (which needs an opaque inner fill) does not apply, and `border-image` ignores the 12px radius. Keep the transparent `border` in the box model so nothing reflows between states.

```css
.btn-ai-outlined {
  background: transparent;
  border: 1px solid transparent;                   /* holds the box, ring is painted below */
}
.btn-ai-outlined::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;                                    /* = stroke width */
  background: radial-gradient(circle at top left, var(--text-button-outlined) 0%, #8158EC 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
/* the ring follows the same state ladder as the label */
.btn-ai-outlined:hover::before  { background: radial-gradient(circle at top left, var(--text-button-hover) 0%, #8158EC 100%); }
.btn-ai-outlined:active::before { background: radial-gradient(circle at top left, var(--primary-button-background-pressed) 0%, #8158EC 100%); }
.btn-ai-outlined:disabled::before { display: none; }   /* disabled takes the shared flat treatment */
.btn-ai-outlined:hover {
  /* wash = the HOVER gradient at 24% opacity, plus a soft glow */
  background: radial-gradient(circle at top left,
    rgb(from var(--primary-button-background-hover) r g b / 0.24) 0%,
    rgba(129, 88, 236, 0.24) 100%);
  box-shadow: 1px 1px 32px 0 rgba(129, 88, 236, 0.16);
}
.btn-ai-outlined:active { background: transparent; }

/* Label/icon gradient starts on the TEXT-chrome ladder (Figma node 11210:4067 binds the
   start stop to Text-button-outlined), NOT the filled background token. The 24% hover
   wash behind the button does use the background-hover ladder. */
.btn-ai-outlined .btn-label,
.btn-ai-outlined .btn-icon {
  background: radial-gradient(circle at top left, var(--text-button-outlined) 0%, #8158EC 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.btn-ai-outlined:hover .btn-label  { background-image: radial-gradient(circle at top left, var(--text-button-hover) 0%, #8158EC 100%); }
.btn-ai-outlined:active .btn-label { background-image: radial-gradient(circle at top left, var(--primary-button-background-pressed) 0%, #8158EC 100%); }
```

## Sizes

All sizes share `border-radius: var(--radius-sm)` (12px) and Poppins **Bold** labels (Link is Medium, see Variants).

| Size | Height | Padding (no icon) | Padding (with icon) | Icon gap | Font | Icon |
|------|--------|-------------------|---------------------|----------|------|------|
| **Small** | 33px | 8px 16px | 8px **12px**/16px | 4px (`--space-xs`) | 12px / 1.4 (Button S) | 16px |
| **Medium** | 41px | **10px** 20px (10px is intentionally off the 4px scale) | 10px **16px**/20px | 8px (`--space-s`) | 14px / 1.5 (H5) | 20px |
| **Large** | 48px | 12px 24px | 12px **20px**/24px | 8px (`--space-s`) | 16px / 1.5 (H4) | 24px |

With an icon, the **icon-side (left) padding is one step tighter** than the label-side padding; the icon leads.

```css
.btn    { border-radius: var(--radius-sm); font-family: 'Poppins'; font-weight: 700; }
.btn-sm { padding: var(--space-s) var(--space-m);  font-size: 12px; line-height: 1.4; gap: var(--space-xs); }
.btn-md { padding: 10px var(--space-ml);           font-size: 14px; line-height: 1.5; gap: var(--space-s); }
.btn-lg { padding: var(--space-sm) var(--space-l); font-size: 16px; line-height: 1.5; gap: var(--space-s); }
/* with icon: tighten the leading (icon) side one step */
.btn-sm.has-icon { padding-left: var(--space-sm); }  /* 12px */
.btn-md.has-icon { padding-left: var(--space-m); }   /* 16px */
.btn-lg.has-icon { padding-left: var(--space-ml); }  /* 20px */
```

## States

| State | Filled bg | Outlined (fill / chrome) | Text colour | Link colour |
|-------|-----------|--------------------------|------------|------------|
| Enabled | `--primary-button-background` (L: 700 / D: 500) | **transparent** / `--text-button-outlined` | `--text-button-outlined` | `--primary-button-background` |
| Hover | `…-hover` (L: 800 / D: **400** ↑) | **16% cyan** (24% for semantic families) / `--text-button-hover` | `--text-button-hover` | `--primary-button-background-hover` |
| Pressed | `…-pressed` (L: 900 / D: 700) | **transparent** / `…-pressed` | `--primary-button-background-pressed` | `--primary-button-background-pressed` |
| Disabled | `--button-background-disabled` + `--text-button-disabled` | transparent / `--text-disabled` | `--text-disabled` | `--text-disabled` |
| Loading | `--button-background-disabled` + 20px spinner, width preserved | same pattern | spinner replaces label | n/a |
| Focus-visible | 2px `var(--primary-button-background)` outline, 2px offset | same | same | same |

### Loading

The button takes the **disabled background** (`--button-background-disabled` for filled variants; text/outlined keep their chrome), the label is replaced by a **20px spinner** (arc, `currentColor`), and the width is preserved: the label and icon are hidden with `visibility: hidden`, so they still hold the width.

```css
.btn-loading {
  pointer-events: none;
  background: var(--button-background-disabled);  /* filled variants */
}
.btn-loading .btn-label { visibility: hidden; }
.btn-loading::after {
  content: '';
  width: 20px; height: 20px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

### Labelled loading (`loadingLabel`)

Not in the Figma board; an app extension for waits long enough that a bare spinner leaves the reader guessing what is happening. Pass a word and the spinner moves out of the centre into the **leading-icon slot**, and the button says what it is doing: "Generating", "Saving", "Uploading".

Everything else is the plain Loading state: disabled background, 20px `currentColor` spinner, no pointer events. **The one thing it gives up is the preserved width**: the button sizes to whichever word it is showing, so it changes width on entering and leaving the state. That is the cost of the label; use plain `loading` where the button sits in a row whose widths have to hold still.

## Tokens

**Primary filled.** The ladder is mode-aware:

| Token | Light | Dark |
|-------|-------|------|
| `--primary-button-background` | Primary-700 `#008393` | Primary-500 `#00CEE6` |
| `--primary-button-background-hover` | Primary-800 `#005862` | Primary-400 `#33E2F7` |
| `--primary-button-background-pressed` | Primary-900 `#002C31` | Primary-600 `#00AFC4` |
| `--text-button-foreground` (label) | Neutral-25 `#F9F9FA` | **Neutral-800 `#20222A`** |
| `--button-background-disabled` | Neutral-100 `#DFE1E6` | Neutral-400 `#656B7C` |
| `--text-button-disabled` | Neutral-300 `#9EA4B3` | Neutral-300 `#9EA4B3` |

**Outlined chrome:** `--text-button-outlined`, `--text-button-hover`, `--text-disabled` (values in the Outlined table above).

**Danger:** `--danger-500`, `--button-danger-hover` (Danger-600 `#9C0F2E`), `--button-danger-pressed` (Danger-700 `#59091A`), `--text-error` (light `#DF1642` / dark Danger-400 `#E95C7B`).

**Warning** (Figma Library variables):

| Token | Light | Dark |
|-------|-------|------|
| `--button-warning-background` | Warning-600 `#E88206` | Warning-600 `#E88206` |
| `--button-warning-background-hover` | Warning-700 `#996322` | Warning-700 `#996322` |
| `--button-warning-background-pressed` | Warning-800 `#664216` | Warning-800 `#664216` |
| `--text-warning` (outlined hover chrome) | Warning-600 `#E88206` | Warning-500 `#FFA538` |

**Success** (Figma Library variables):

| Token | Light | Dark |
|-------|-------|------|
| `--button-success-background` | Success-500 `#18A957` | Success-500 `#18A957` |
| `--button-success-background-hover` | Success-600 `#11763D` | Success-600 `#11763D` |
| `--button-success-background-pressed` | Success-700 `#0A4423` | Success-700 `#0A4423` |

**AI:** gradient start follows the primary filled tokens; end `var(--blaze-quiz)` (Blaze `#8158EC`); hover ring `var(--primary-500)`.

## Accessibility

```tsx
<Button>Save Changes</Button>                              // always descriptive, Title Case
// Icon-only: not <Button> (it has no circular shape). Use a plain button with a
// circular var(--radius-full) hover, an aria-label, and an explicit icon colour.
<button type="button" className="page-icon-btn" aria-label="Delete Item">
  <Trash size={20} color="currentColor" />
</button>
<Button loading aria-busy="true">Submitting…</Button>
```

```css
.btn:focus-visible { outline: 2px solid var(--primary-button-background); outline-offset: 2px; }
```

- **Loading name.** The label is the button's accessible name, and the Loading state hides it, so the component keeps it as an `aria-label` for the duration (only when the label is a string and the caller has not named the button themselves). Without that, a button in this state is announced as an unnamed disabled button for as long as the work runs.
- **Contrast.** The light filled base is Primary-700 and the dark filled base uses a dark label on Primary-500; both exist to meet WCAG AA. Never use `--primary-500` as text on white.

## Content

- Write labels in Title Case ("Save Changes", "Delete Report").
- Where it helps, name what the commit button acts on (the count or the person), so it reads differently from the button that opened the dialog.
- Title Case a `loadingLabel` like any other label, and keep it to one word where you can; it is read at a glance, not studied.

## Examples

```tsx
{/* Primary + secondary pair */}
<Button variant="outlined-2">Cancel</Button>
<Button variant="filled">Save Changes</Button>

{/* Destructive confirmation */}
<Button variant="outlined-2">Cancel</Button>
<Button semantic="danger">Delete Course</Button>

{/* AI action */}
<Button semantic="ai" icon={<AiGenerateIcon size={20} />}>Generate</Button>

{/* Labelled loading */}
<Button semantic="ai" loading={busy} loadingLabel="Generating" icon={<SparkleIcon />}>
  Generate Insights
</Button>
```

## Related

- [row-actions-menu.md](row-actions-menu.md) - per-row actions
- [bulk-action-bar.md](bulk-action-bar.md) - actions on selected rows
- [overlays.md](overlays.md) - `CloseButton`, dialog and drawer footers
- [colors.md](colors.md) - the palette behind the button tokens
