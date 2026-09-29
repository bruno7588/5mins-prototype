# Engineering skill: 5mins-ds-audit

A Claude Code skill for the production monorepo. It compares a production component against the design-system docs in this repo and the Figma Library, and reports drift. It has three modes: `audit` (default), `build` and `map`.

## Install (engineering)

1. Copy `5mins-ds-audit/` into the production repo at `.agents/skills/5mins-ds-audit/`. The repo's `postinstall` already links `.agents/skills` into `.claude/skills`, so everyone gets it on `pnpm install`.
2. Clone this repo once so the skill can read the docs: `git clone https://github.com/bruno7588/5mins-prototype.git ~/5mins-prototype` (or clone it elsewhere and set `FIVEMINS_DS_REPO`). The skill pulls it before each run.
3. Paste the block from `../production-claude-snippet.md` into the production `CLAUDE.md`, so the core rules are always on.
4. For Figma checks, the engineer needs the Figma MCP connected and a Dev or Full seat. View seats get only a handful of calls a month.

## Use

- `/5mins-ds-audit Button`: audit a component, get a drift table.
- `/5mins-ds-audit build enrol drawer`: before building, get the right components, props and rules.
- `/5mins-ds-audit map Search`: propose the doc's Production mapping row, raised as a PR to this repo.

## Keeping it current

The docs are the single source. Change a rule in `docs/design-system/<doc>.md` and every engineer's next audit uses it. Change the skill here, then copy it across again.
