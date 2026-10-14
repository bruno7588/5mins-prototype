# Component doc template

Every component doc in `docs/design-system/` follows this order. Omit a section only when it cannot apply (for example Sizes on a component with one size); never leave an empty heading. Sections marked **required** are always present.

History does not live in component docs. Dated "Updated" notes, "(was X)" asides and "corrected on" remarks go in [CHANGELOG.md](CHANGELOG.md). A doc states only the current rule.

```markdown
---
name: 5mins-<component>
description: <one sentence: what it is, its variants, when to use it>
---

# <Component name>

<One line: what the component is for.>

**Code:** `import X from '@/components/X/X'` (or "no shared component yet: <where it lives>")
**Figma:** Library `EC26cSVe9KNTCWXvYovakw`, `<node id>` (one component set; light and dark come from the variable modes on the parent frame)
**Last verified:** YYYY-MM-DD

## Usage (required)
Intent, Use when, Don't use when (each with the named alternative and a doc link), Do, Don't, Canonical spec.

## Figma to code (required)
| Figma property | Figma values | React prop | Prop values | Notes |
|---|---|---|---|---|
| Size | Large / Medium / Small | `size` | `lg` / `md` (default) / `sm` | |
| State | Enabled / Hover / Pressed | n/a | CSS `:hover`, `:active` | states are CSS, not props |

- **Figma only:** variants or properties with no code equivalent.
- **Code only:** props with no Figma equivalent.

**Production:**
| Design system | `@web/ui` component | Props mapping | Known drift |
|---|---|---|---|

## Anatomy
## Variants
## Sizes
## States (required)
Table of state x tokens (light and dark where they differ). Include focus-visible.

## Tokens
Semantic tokens only, written as `var(--token)`.

## Accessibility (required)
Role, keyboard, labels, focus-visible, contrast.

## Content
Casing, length, microcopy rules.

## Examples
Short snippets that import the real component. No re-implementations of shared components.

## Related
Links to neighbouring docs.
```

Foundation docs (colours, typography, layout, iconography) use the same skeleton, with **Figma to code** mapping Figma variables and styles to CSS custom properties instead of component properties to props.
