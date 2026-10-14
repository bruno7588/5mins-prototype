---
name: find-icon
description: Search the 5Mins icon library (iconsax-react plus the custom icons in src/components/icons) by keyword and get exact names and import lines. Use whenever you need an icon for any UI in this prototype - a button, menu item, empty state, badge, nav item, table action - or need to check that an icon name actually exists before importing it, or are looking for an icon by meaning ("delete", "upload", "warning", "settings", "AI") rather than by exact name. This is a utility skill - 5mins-design-system, figma-ship and any prototype build work should call it as needed instead of guessing Iconsax names from memory.
---

# Find icon

Iconsax has about 1,000 icons with names that often don't match what you'd search for ("delete" is `Trash`, "warning" is `Danger`, "settings" is `Setting2`/`Setting4`). Guessing names from memory produces imports that fail the build, or pulls in a different icon from the one the rest of the app uses for the same job. This skill's script searches by meaning and ranks icons the prototype already uses first, so the same action looks the same everywhere.

## How to search

Run from the repo root:

```bash
node .claude/skills/find-icon/scripts/find-icon.mjs <keywords>      # e.g. delete | upload csv | lock certificate
node .claude/skills/find-icon/scripts/find-icon.mjs --check Trash Edit2   # confirm names exist before importing
node .claude/skills/find-icon/scripts/find-icon.mjs --used           # every icon the repo already imports, by frequency
```

Add `--all` to see more than 12 results per group. Results are grouped in this order:

1. **Custom 5Mins icons** (`src/components/icons/`): default exports, imported via `@/components/icons/Name`. These exist because Iconsax had nothing suitable (e.g. `SparkleIcon` for AI, `CsvIcon`, `MoreIcon`), so prefer them for their job.
2. **Already used in the prototype**: with a use count and an example file. Pick from here when it fits, and open the example file to see the size, colour and variant used.
3. **Other Iconsax icons**: available but not used yet. Fine to use when nothing above fits.

## Choosing

- Reuse beats novelty. If the app already uses `Trash` for delete in 22 places, use `Trash`, not `ProfileDelete`, even if the latter sounds closer.
- If nothing matches, try a different word for the same idea (the script maps common synonyms, but not all), or browse with `--used`.
- If two plausible icons exist and the choice is visible to users (a primary action, a nav item), say which you picked and the alternative, so Bruno can overrule it.
- Always `--check` any icon name you wrote from memory before relying on it.

## Not every icon need is an icon

Some jobs already have a shared component or a set pattern. Use those instead of a raw icon:

| Need | Use |
|---|---|
| Close X on a drawer, modal or panel | `CloseButton` component (`src/components/CloseButton`) |
| Row "more" actions (kebab) | `RowActionsMenu` component, or `MoreIcon` custom icon |
| Search field magnifier | `Search` component |
| Drag handle on reorderable rows | the inline 6-dot SVG in `src/pages/your-courses/components/ContentList/ContentList.tsx` (`.content-card-drag`) |
| Skill/category artwork | `getSkillIllustration` in `src/assets/skill-icons/` (see `docs/design-system/iconography.md`) |
| Levels, certificates, streaks, quiz types | illustrations in `src/assets/*-illustrations/` (see `docs/design-system/gamification.md`) |

## After you've picked one

This skill only finds the icon. Size, colour and variant come from the design system: read `docs/design-system/iconography.md` and `layout.md` (sizes are 16/20/24/32 via `--icon-size-*`). Two project rules that commonly trip people up:

- iconsax-react 0.0.8 on React 19 ignores default props, so always pass `color` (and `size`) explicitly, using a token: `<Trash size={20} color="var(--text-primary)" />`.
- Menu, listbox and filter leading icons use `--text-primary`; status icons use raw palette tokens. The design-system docs have the full rules.
