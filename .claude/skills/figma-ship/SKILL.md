---
name: figma-ship
description: Ship a prototype feature's UX/UI to a specific section in Figma. Given a route on the running dev server, the flows to show, and a Figma section link, drives the prototype to each state, captures it, then rebuilds every screen from the 5Mins Figma library (building any component the library lacks), with a "Why" callout on top and a "Flow" callout before each flow. Use when the user types /figma-ship, or asks to push, send, hand off, or sync a feature, screen, modal, or flow from the prototype to Figma.
---

# Figma ship

Turn a feature that exists in the prototype into a designer-ready section in Figma: a "Why" callout on top, then for each flow a "Flow" callout followed by every screen of that flow, left to right, all built from the 5Mins library.

The heavy lifting (driving the browser, capturing, discovering library components, building) is delegated to one agent so the main session is not flooded with tool output.

## Usage

```
/figma-ship <route> "<Flow title>: state, state, state; <Flow title>: state, state" --section <figma section URL> [--ticket <KEY>]
```

- `<route>` — a route in `src/App.tsx`, e.g. `/your-courses/course`. The dev server must already be running at `http://localhost:5173`; if it is not, say `npm run dev` is needed and stop.
- Flows are separated by `;`. Each flow is `Title: state, state, ...`. Each state is one full screen. Example: `"Single enrolment: Enrolments tab, row menu open, Mark as completed modal, Confirmation, Success toast; Bulk: rows selected, bulk bar menu open, modal with skip callout, Confirmation, Success toast"`.
- `--section` — a link to a **section** inside a Figma design file (`https://figma.com/design/<fileKey>/...?node-id=<id>`). **Ask for it every run if it is not given.** Everything is built inside that section; nothing outside it is touched. Refuse `/board/`, `/slides/` and `/make/` URLs, and a link with no `node-id`.
- `--ticket` — optional Jira key. Used to read `~/Documents/Projetos/5Mins/PRDs/<KEY>-*.md` for the Why callout.

If the route, the flows or the section are missing, ask. Do not invent flows from the code: the user decides what ships.

## 1. Settle the inputs

1. Parse the arguments. Extract `fileKey` and the section `nodeId` from the link (`node-id=12-34` becomes `12:34`).
2. Confirm the dev server answers: `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173`.
3. **Why callout content.** Three short lines: Context, Problem to solve, Solution. Draft them from the PRD when `--ticket` is given (its Context section has the problem and the decisions), otherwise from what the user said. Show the three lines to the user with `AskUserQuestion` before spawning the agent, with an option to accept and an option to edit. Keep each line to one or two plain sentences a new teammate could read in ten seconds.
4. **Flow callout content.** For each flow: its title as given, plus one plain sentence saying what the admin does and what they get. Draft these too and show them in the same question.
5. Defaults when the user does not say otherwise: **light theme, 1440 wide, admin shell**. Ask only if a state could be reached two ways or the theme or viewport matters for what ships.

## 2. Spawn the agent

One `general-purpose` agent. Pass it the route, the flows and states verbatim, the `fileKey`, the section `nodeId`, the approved Why and Flow texts, the theme and viewport, and the ticket context if any. Tell it to load, in this order and before anything else:

- `Skill: figma:figma-generate-design` and `Skill: figma:figma-use` — the mandatory Figma workflow. Every `use_figma` call must follow them.
- `Skill: figma:figma-generate-library` — for building any component the library lacks.
- `Skill: 5mins-design-system` — so the rebuild uses the right components and tokens.

And to load its tools in **two** ToolSearch calls, one per server:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__find,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__resize_window,mcp__claude-in-chrome__tabs_close_mcp
ToolSearch: select:mcp__plugin_figma_figma__generate_figma_design,mcp__plugin_figma_figma__get_libraries,mcp__plugin_figma_figma__search_design_system,mcp__plugin_figma_figma__use_figma,mcp__plugin_figma_figma__get_screenshot,mcp__plugin_figma_figma__get_metadata
```

The agent's brief, in full:

### The one rule above all others: 1:1 with the prototype

The prototype is the source of truth. Every frame must match what the browser shows for that state: the same components, the same layout, the same spacing, the same copy, the same colours, the same states of every control. Never improvise, tidy up, rearrange, add, remove, or "improve" anything. If the library component differs from what the prototype renders, use the prototype's version and build a proposed component for it (step D). If something cannot be reproduced exactly, leave it out and say so in the report rather than substituting something close.

### A. Read the feature

- Find the page for the route in `src/App.tsx` and `src/pages/`. Read the page and the components each state renders (menus, modals, dialogs, bars, toasts). List, per state, the shared components involved by their `src/components/` names — that list drives the library lookup.
- The product font is Poppins (`src/styles/typography.css`). Never default to Inter.
- Note whether any state shows images (avatars, illustrations, thumbnails). Images reach the rebuild only through the capture's image fills.

### B. Reach each state in the browser

- `tabs_context_mcp` with `createIfEmpty: true`, then `navigate` to `http://localhost:5173<route>`. Set the theme (sun/moon toggle in the top bar) and viewport (`resize_window`) to what was agreed.
- For every state, in order: perform the clicks that reach it, then take a screenshot and **confirm the state matches its name** before capturing. Tips for this prototype: row kebabs are `Actions for <name>` buttons; clicking by ref sometimes closes a freshly opened menu, so click by coordinates when that happens; modals are `role="alertdialog"`; the bulk bar appears after a row checkbox is ticked.
- Keep the browser screenshot of each state. It is the reference the Figma frame is checked against in step F.

### C. Capture each state into the section

`generate_figma_design` captures a live page by URL, so a state that needs clicks (an open menu or modal) cannot be captured by URL alone. For each state:

1. Call `generate_figma_design` with `fileKey`, the section `nodeId`, and no `captureId`. It returns a capture script and a `captureId`.
2. With the tab already in the state, run the capture script inside that tab with `javascript_tool`, exactly as returned. If the script cannot be run this way, capture the base route by URL and mark the state "rebuild only".
3. Poll with the `captureId` every 5 seconds, up to 10 times, until `completed`.
4. Record the capture's root node id per state.

Capture every state before rebuilding any, so the section carries the whole flow even if the rebuild stalls.

### D. Map the 5Mins library

Follow `figma-generate-design` step 2. Repo-specific facts:

- There are **no Code Connect files** here. Step 2a-i is N/A; log it and move on.
- `get_libraries` on the file, find the 5Mins library, and scope every `search_design_system` call to it with `includeLibraryKeys`. Query with the component names from `docs/design-system/*.md`; those docs also carry the library node ids.
- Also search the library for an annotation or callout component to use for the Why and Flow callouts (try "callout", "annotation", "note", "documentation").
- Tokens: the docs and `src/styles/tokens.css` name every colour, space and radius token. Bind the matching library variables; never type a hex or a pixel value that a token covers.

**If the library has no component for something the prototype shows** (a callout, a bulk action bar, a badge variant, a menu with descriptions): build it. Follow `figma-generate-library`: a proper component or variant set with token bindings, named `5Mins / <Component> / <name> (proposed)`, placed in its own frame named `Proposed components` at the bottom of the section. Use instances of it in the screens. Report every proposed component so the design team can adopt or replace it. Never approximate with loose rectangles inside a screen.

### E. Build the section

Everything goes inside the given section node, laid out top to bottom, 200px between rows, 120px between frames in a row:

1. **Why callout** at the top. One instance of the callout component with the heading "Why" and the three approved lines, labelled Context, Problem to solve, Solution. Width 1440.
2. **Per flow**, in order: a **Flow callout** (heading = the flow title, body = the approved sentence), then that flow's screens in one row, left to right, named `<Flow> · NN · <state>` (`Single enrolment · 03 · Mark as completed modal`).
3. **Every state is a full screen**, the base page plus whatever is open on it. If two states share the same base, duplicate it. A designer reads the flow by scanning the row; never a floating modal on white.
4. Page states are 1440 wide; an overlay's own width comes from its CSS (the modal is 600, the confirmation 480).
5. Copy comes from the prototype verbatim (Title Case buttons, sentence case everything else). Do not rewrite it.
6. Move each capture next to its rebuilt frame, named `<Flow> · NN · <state> · capture`. Do not delete captures; the user decides when the reference has served its purpose.
7. `Proposed components` frame last, if any were built.

### F. Verify and report

- `get_screenshot` each rebuilt frame and compare it side by side with the browser screenshot of the same state. Anything that differs is a defect: clipped text, overlapping nodes, wrong variants, missing copy, different spacing, a control in a different state. Fix it before moving on. The only allowed difference is a gap named in the report.
- Close every browser tab the agent opened.
- Return: the section link, one line per state with rebuilt and capture node ids, every proposed component with what it stands in for, any state marked "rebuild only" or "capture only" and why, and anything left unverified.

## 3. Report back

In the main session: the section link, the per-state table from the agent, then the proposed components and the gaps in full. Proposed components come first; they are what the design team needs to act on.

Keep the language short and plain everywhere: in the callouts, in frame names, and in the report.

Do not delete anything in the Figma file, do not touch anything outside the section, and do not commit unless the user asks.
