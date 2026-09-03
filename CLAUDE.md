# 5Mins.ai — Claude Code Instructions

## Project Overview

5Mins.ai is a B2B micro-learning platform for enterprise customers in compliance-heavy industries (hospitality, finance, healthcare). Tech stack: React TypeScript, CSS with design tokens (CSS custom properties).

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173
- `npm run build` — type-check (`tsc -b`) + production build; run this to verify changes compile

## Project Structure

- `src/pages/<feature>/` — one folder per route/feature; page-local components live in `<feature>/components/`
- `src/components/` — shared reusable components, one folder per component (`Name/Name.tsx` + `Name.css`). Check here AND `docs/design-system/*.md` before building anything new — never improvise a custom component.
- `src/data/` — mock data stores
- `src/styles/` — global `tokens.css`, `reset.css`, `typography.css`
- `docs/design-system/` — design system documentation (see below)
- Routes are declared in `src/App.tsx`
- Import shared code via the `@/` alias (e.g. `@/components/Toast/Toast`), never deep relative paths like `../../../../components/...`
- **CSS is globally bundled** — class names collide across pages. Prefix page-level classes with the page name (e.g. `.roles-`, `.people-`) and grep for a class name before adding or restyling it.

## Design System

All design system guidance lives in the **5mins-design-system skill** (`.claude/skills/5mins-design-system/SKILL.md`), which indexes the Figma-verified component docs in `docs/design-system/`. The skill loads automatically for any UI work.

Non-negotiables that apply even outside the skill:

- **Never improvise design values.** Use only tokens from `src/styles/tokens.css`.
- Check `src/components/` and the design system docs before building any new component.
- If a needed component has no doc, say which one is missing and ask for the Figma link; do not adapt a "close enough" pattern silently.

## Code Style

- React functional components with TypeScript
- CSS custom properties (design tokens) for all styling values
- Semantic HTML with proper ARIA attributes
- All interactive elements must have visible `:focus-visible` indicators

## Karpathy Skills — Coding Principles

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
