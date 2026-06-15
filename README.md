# 5mins Admin — Prototype

Interactive admin prototype for the 5mins platform, built with React + Vite + TypeScript.
This is a front-end-only prototype: there is no backend. Sample data is seeded in code and
state persists in the browser's `localStorage`.

## Prerequisites

- **Node.js 18+** (Vite 6 requires it) — check with `node -v`
- **npm** (ships with Node)

## Getting started

```bash
git clone https://github.com/bruno7588/5mins-admin.git
cd 5mins-admin
npm install
npm run dev
```

The dev server starts at **http://localhost:5173** with hot reload.

## Scripts

| Command           | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload (localhost:5173) |
| `npm run build`   | Type-check (`tsc -b`) and build for production         |
| `npm run preview` | Serve the production build locally to verify it        |

## Project structure

```
src/
  App.tsx                  Routes
  components/              Shared design-system components (Button, Toggle, Chip, Drawer, …)
  pages/                   One folder per page/area (learning-records, your-courses, automations, …)
  utils/                   Helpers and data models (e.g. lrSavedFilters.ts for saved reports)
public/                    Static assets (avatars, etc.)
```

Page-specific components live alongside their page under `pages/<area>/components/`.

## Working as a team

To keep `main` stable, please use a branch + pull request workflow:

```bash
git checkout -b feature/short-description   # branch off main
# …make changes…
git add -A
git commit -m "feat: describe your change"
git push -u origin feature/short-description
```

Then open a Pull Request on GitHub for a quick review before merging into `main`.
Run `npm run build` before pushing to catch type errors.

## Notes

- **No backend / no env vars** — nothing to configure to run locally.
- **Data is local** — reports, settings, etc. are stored in `localStorage`. Clearing your
  browser storage resets the prototype to its seeded defaults.
