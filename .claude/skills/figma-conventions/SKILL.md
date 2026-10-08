---
name: figma-conventions
description: Bruno's house rules for building screens in the 5Mins Figma files - canvas layout of flows, screen anatomy, auto-layout, Library-first components, spacing/colour/text tokens, naming, callouts, cursors and arrows - plus an audit script to check a section before handing it over. Load before ANY write to a 5Mins Figma design file (use_figma that creates or edits frames, screens, flows or components), including inside figma-ship, when adding screens to an existing flow, or when asked to "send", "push", "build" or "fix" something in Figma.
---

# Figma conventions (5Mins)

How Bruno organises screens in Figma, derived from his files (analysed 2026-10-08) and his answers. Follow it on every write. When this file and a generic Figma skill disagree, this file wins; when the linked Figma frame and this file disagree, copy the Figma frame and flag the difference.

- **Reference (confirmed by Bruno):** Your Courses file `Vb5D6FLJP1vPbZQFJapILp`, page "Dashboard V2" (`6150:2`): 98% auto-layout, every instance from the Library, tokens bound throughout, no spacer frames. Open it and copy its patterns when in doubt.
- **Grid only:** the "Assign courses" section (`7605:8`) shows the row spacing in section 1 (120 / 120 / 200). Do not copy its screen internals: it has spacer frames, default screen names and unstyled text.
- **Do not copy:** pages from 2024 such as "Created by You" (1920px frames, raw values, loose text labels). That is the old way.

## 1. Canvas: sections, rows and the grid

Everything for a feature lives inside one **Section** named after the feature (`Assign courses`). Never place anything loose on the page. A big feature may hold nested sections (`Escalate to Managers` inside `Compliance Dashboard`).

Inside the section, content is stacked **rows**, all starting at the same left x:

```
Row 0   [ Why callout ]
Row 1   [ Flow callout ] 120 [ screen 01 ] 120 [ screen 02 ] 120 [ screen 03 ] ...
Row 2   [ Flow callout ] 120 [ screen 01 ] 120 [ screen 02 ] ...
...
Last    [ Proposed components ]   (only if any were built)
```

| Measure | Value |
|---|---|
| Flow callout width | 600 |
| Flow callout to first screen | 120 |
| Between screens in a row | 120 (pitch 1656 for 1536 screens) |
| Between rows | 200, measured from the bottom of the tallest item in the row above |
| Item alignment in a row | top edges aligned |
| Flow callout height | equal to the row's screen height (864 for a standard row) |

- One flow per row, in the order given. A short branch of the same flow may continue on the same row after 120px, opened by its own Flow callout carrying only the title (Bruno does this for `Flow 1 · Add courses` and `Flow 8 · Leave without launching`).
- Reference screenshots, scratch frames and captures stay out of the rows: to the right of the widest row or below everything.
- The Plugin API and `get_metadata` report different x/y for section children. Read and write coordinates through the Plugin API consistently.

## 2. Screen anatomy

### Root frame
- An auto-layout frame, **1536 wide**, vertical, gap 0, fill `Surface colours/Page-background`, clip content on.
- Height **864** by default. Grow it only when the state needs to show content below the fold (Bruno uses 900 and 1069); never shrink below 864.
- Named `<Flow> · NN · <state>`, e.g. `Review · 02 · Restart on`. NN is two digits, counting from 01 within the flow.

### Admin page shell (Dashboard V2 pattern)
```
<Flow> · NN · <state>          AL vertical, gap 0
├─ Top Nav/Admin               Library {System=Admin, Breakpoint=large}, FILL/FIXED 72
├─ Main                        AL horizontal, gap 0, FILL/FILL
│  ├─ Side navigation          Library {System=Admin, State=Expanded}, FIXED 240 / FILL
│  └─ Body                     AL vertical, gap L(24), padding ML(20) L(24) ML(20) L(24), FILL/HUG
│     ├─ Header                Library {Type=Page}
│     └─ ...page sections      each its own AL frame, FILL width, HUG height
└─ overlays (absolute)         Listbox, Cursor, Toast, scrim + modal
```

### Full-screen wizard / modal shell (Assign courses pattern)
```
<Flow> · NN · <state>          AL vertical, padding L(24) L(24) 0 L(24), counter-axis centred
├─ Page                        AL vertical, 1024 wide FIXED / FILL height, gap L(24)
│  ├─ Header                   wizard header (title + stepper)
│  └─ Content                  AL vertical, gap M(16)
├─ Footer                      full width, FIXED 1536 / HUG, padding M(16) top and bottom
└─ overlays (absolute)         close button, scroll bar, side drawer, popovers
```

### Overlays and states
- Menus, listboxes, popovers, tooltips, toasts, drawers, scrim + modal, the scroll bar and the Cursor are **absolute-positioned children of the root frame**, above the content in z-order, placed where the browser shows them.
- Every screen after the first in a flow must visibly differ from the one before (a new overlay, a ticked row, changed data). Build the flow's start state once and duplicate it for later states.

## 3. Auto-layout, always

- **Every container is an auto-layout frame.** The only frames allowed without auto-layout are vector artwork: illustrations, icon internals, confetti, a success tick.
- **Never use spacer frames** (empty frames named `Spacer` that push content apart). Use `primaryAxisAlignItems = 'SPACE_BETWEEN'` on the parent, or set the flexible child to `FILL`. Remove any spacer you find in frames you built.
- Sizing defaults: content columns and rows `FILL` width / `HUG` height; buttons, chips and badges `HUG/HUG`; fixed-width shells (`Page` 1024, `Side navigation` 240) `FIXED`.
- Wrap rows of cards (stats tiles) with `layoutWrap = 'WRAP'` and a bound gap, never by hand-placing them.
- Absolute positioning is only for the overlays listed above and for close buttons pinned to a corner.
- `figma.createAutoLayout()` gives a white fill by default; clear it (`fills = []`) unless the frame needs a surface, then bind a surface variable.

## 4. Library first

The 5Mins Library is file `EC26cSVe9KNTCWXvYovakw`. It holds Light mode / Dark mode frame pairs; duplicate names are the two themes, and colours resolve through variable modes.

1. Before building anything, list what the screen needs by its `src/components/` name, read the matching `docs/design-system/*.md` (they carry Library node ids), then `get_libraries` and `search_design_system` with `includeLibraryKeys` set to the 5Mins Library. Batch the queries in one call.
2. Use instances and set variants with `setProperties()`; never detach a Library instance, never redraw one with rectangles.
3. Components Bruno uses most: `Top Nav/Admin`, `Side navigation`, `Header` {Type=Page}, `Buttons`, `Chips`, `Search`, `Dropdown`, `Listbox`, `List itens`, `Checkbox instances`, `Badge`, `Content switcher`, `Table header`, `Table data`, `Pagination`, `Side Drawer`, `Toast`, `Tooltip`, `Empty state`, `Scroll Bar`, `Icons`, `Chevron`, `Illustrations/ ...`, `Callout`, `Cursor`.
4. **When the Library has no component** for something the screen shows: build a proper local component (variants where states differ, every value bound to a variable), named `5Mins / <Area> / <Name> (proposed)`, and place the main components in a frame named `Proposed components` on the section's last row (auto-layout horizontal, wrapping, gap 120). Use its instances in the screens. List every proposed component in the report, with what it stands in for and why the Library version could not be used.
5. Known Library gaps (flag, do not improvise): Avatar has no initials variant; `Illustrations/ Assessments` lacks `Type=Lesson quiz, Device=Desktop`; Icons has no `refresh` glyph (`repeat` is nearest).

## 5. Tokens, never raw values

Bind every gap, padding, radius, fill and stroke to a Library variable, and every text layer to a text style. A raw number that happens to equal a token still counts as a defect. Look values up in `src/styles/tokens.css` and the DS docs, then bind the Figma variable.

**Spacing and radius** (collection `Padding/Spacing/Roundness`; the same variables drive gap, padding and corner radius):

| Var | px | Var | px | Var | px |
|---|---|---|---|---|---|
| `0` | 0 | `S` | 8 | `L` | 24 |
| `XXS` | 2 | `SSM` | 10 | `XL` | 32 |
| `XS` | 4 | `SM` | 12 | `XXL` | 40 |
| `XSS` | 6 | `M` | 16 | `100` | 100 (full radius) |
| | | `ML` | 20 | | |

Common bindings: card and input radius `SM`; icon-only button radius `100`; card padding `SM` vertical, `M` horizontal; page body gap `L`.

**Colour collections:** `Surface colours` (Page-background, Cards-background, Input-background, Input-background-elevated, Border, Border-elevated, Selected-row), `Text colours` (Text-primary, Text-secondary, Text-tertiary, Text-disabled), `Brand colours` (Primary-*, Secondary-*), `System colours` (Success-*, Warning-*, Danger-*). Border rule: `Border` on the page ground and inside drawers and modals, `Border-elevated` on cards and menus.

Raw colours are allowed only where no variable exists: illustration artwork, confetti, content-type colours inside thumbnails, and the black flow arrows on the canvas (section 7).

**Text styles** (all Poppins; never Inter):

| Style | Font | Style | Font |
|---|---|---|---|
| `Display (48)` | Bold 48 | `H5 (14)` | Bold 14 |
| `H1 (32)` | Bold 32 | `H6 (12)` | Bold 12 |
| `H2 (24)` | Bold 24 | `Paragraph L regular (16)` | Regular 16 |
| `H3 (20)` | Bold 20 | `Paragraph M regular (14)` | Regular 14 |
| `H4 (16)` | Bold 16 | `Paragraph M medium` | Medium 14 |
| | | `Paragraph M semibold (14)` | SemiBold 14 |
| | | `Paragraph S regular (12)` | Regular 12 |

Import with `figma.importStyleByKeyAsync(key)` / `figma.variables.importVariableByKeyAsync(key)`; read the keys from `search_design_system` or from an existing bound node in the target file. Copy comes verbatim from the prototype: button labels in Title Case, everything else in sentence case.

## 6. Naming

| Thing | Name |
|---|---|
| Section | the feature, sentence case (`Assign courses`) |
| Screen | `<Flow> · NN · <state>` |
| Flow callout instance | `Flow N · <title>` |
| Why callout instance | `Why` |
| Layers inside a screen | what they are, short: `Header`, `Content`, `Filters`, `Stats`, `Review list`, `Course 1`. Never leave `Frame 1317` or a default component name on a frame you built. |
| Proposed component | `5Mins / <Area> / <Name> (proposed)` |
| Arrow | `<source layer> -> <target screen>` |

## 7. Annotating the flow

All annotation uses the Library **Callout** component set (`Type` = `Why`, `Flow description`, `Note`). Fill its existing text layers; never add loose text to the canvas.

- **Why** (row 0, 1536 wide): heading "Why", body in three labelled lines: Context, Problem to solve, Solution. One or two plain sentences each.
- **Flow description** (start of each row, 600 wide, row height): `Flow` = the flow title, `Description` = one plain sentence on what the admin does and what they get.
- **Note** (as needed): a short label placed just above the screen it explains, aligned to the detail it points at, width hugging the text (Bruno's run about 330-520 wide, 72-120 tall). Use it for edge cases, sticky behaviour, or copy such as an email subject line.
- **Cursor:** on every screen reached by a click, put a Library `Cursor` {Type=Pointer} instance on the element that is clicked to go to the next screen, absolute-positioned inside that element's parent frame, tip on the element.
- **Arrows:** connect the clicked element to the next screen when the next screen is not simply the one to its right (a jump to another row, a branch, an email or external page). Draw an elbow vector on the section, not inside a screen: stroke weight 3, black, round join, corner radius 20, end cap `ARROW_LINES`, no dash. Name it `<source layer> -> <target>`.

## 8. Workflow for any Figma write

1. Load `figma:figma-use` (and `figma:figma-generate-design` for screens, `figma:figma-generate-library` for proposed components) plus `5mins-design-system`.
2. Inspect the target section first (read-only): existing rows, callouts, screens, proposed components. Reuse what is there; never modify a pre-existing frame you were not asked to change, duplicate it instead.
3. Map every component to the Library (section 4) before writing.
4. Build top-down in retry-safe calls (one screen, or one row of small changes, per call). Clone an existing screen with `frame.clone()` and retext it rather than rebuilding, when a similar screen exists; it keeps every instance linked.
5. Run the audit (section 9) on the section. Fix every finding in frames you built.
6. Screenshot each new screen once and compare with the prototype.
7. Report: section link, one line per screen with node id, proposed components, audit result, anything left unverified.

## 9. Audit before reporting

Run `audit.js` from this folder with `use_figma`, replacing `SECTION_ID`. It walks only frames you built (it skips instance internals) and returns:

- frames without auto-layout (excluding vector artwork), spacer frames, frames with default names (`Frame 123`, `Modal/Full screen`)
- gaps, padding and radius not bound to a variable
- solid fills and strokes not bound to a variable
- text layers without a text style, or not in Poppins
- local component instances that are not `(proposed)`
- screens whose name does not match `<Flow> · NN · <state>`, or not 1536 wide
- screens identical to the one before in the same row (same visible layers and same text), the "row of identical base pages" failure

A clean audit has every list empty except intentional raw colours (section 5). Report anything left and why.

## 10. Plugin API gotchas seen in these files

- `resize()` on a child inside an instance is silently ignored. The DS `Table row` ships fixed 292px cells, so build table rows as your own auto-layout frame (radius `SM`, 1px `Border` stroke, min height 56) holding `Table data` instances, and size those.
- `setProperties()` on an instance invalidates references to its children; re-read `children` after it.
- `Supporting text=true` on `Table data` collapses to one text node; carry the second line as `"lead\nsub"` and style ranges.
- Load each text node's own fonts (`getStyledTextSegments(['fontName'])`) before editing characters. The style is `SemiBold`, not `Semi Bold`, for Poppins in these files.
- Page context resets every call: `await figma.setCurrentPageAsync(page)` once per call, and address sections by node id (they are often not on the first page).
