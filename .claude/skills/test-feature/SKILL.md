---
name: test-feature
description: Test a prototype feature hands-on in the browser, like a careful new user and a QA lead combined. Walks the key user journeys end to end, tries edge cases and unhappy paths, reviews the first-use and onboarding experience, checks every relevant screen size and both themes, runs a keyboard and accessibility pass, watches for console errors and dead clicks, and diagnoses where users lose confidence (jobs to be done, Nielsen, WCAG 2.2 AA, design system, copy, Build for Mars). Replaces the old ux-auditor agent. Use when the user types /test-feature, or asks to test, QA, check, audit, critique or review a feature, screen, flow or route, or asks "is this good UX?", "does this work?", "why does this feel off?", "is this ready to ship?".
---

# Test feature

Test a feature in the running prototype the way real users will meet it, then report what breaks, what blocks progress, and the smallest fixes, ranked.

The testing is done by **one fresh agent** that never sees how the feature was built. A tester who knows the builder's reasoning tends to agree with it, so the agent gets the inputs and the standard, nothing else.

## Usage

```
/test-feature <route> ["Journey: goal; Journey: goal"] [--ticket <KEY>] [--persona admin|manager|learner] [--quick] [--spec] [--retest <report folder>]
```

- `<route>`: a route in `src/App.tsx`, e.g. `/automations`. Several routes can be given, comma separated.
- Journeys: optional, separated by `;`, each `Title: what the user is trying to get done`. If missing, draft them (step 1.3).
- `--ticket`: Jira key. Its PRD (`~/Documents/Projetos/5Mins/PRDs/<KEY>-*.md`, or the Jira ticket if there is no PRD) supplies the job and the acceptance criteria to test against.
- `--persona`: defaults from the route (admin shell routes = admin, `/my-team` = manager, `/workspace`, `/for-you`, `/programs/:id`, `/courses/:id`, `/events`, `/mobile` = learner).
- `--quick`: one screen or one decision mid-build. Happy path plus the 1-3 highest-impact findings, desktop only, no scorecard.
- `--spec`: also turn every journey that passed into a Playwright regression test in `tests/`.
- `--retest`: re-run only the failed and blocked checks from an earlier report, to confirm fixes. Uses a new fresh agent, never the one that wrote the report.

## 1. Settle the inputs (main session)

1. Confirm the dev server answers: `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173`. If it does not, say `pnpm dev` is needed and stop.
2. Read the ticket or PRD if given. Pull out the job, the acceptance criteria and anything marked out of scope.
3. **Journeys.** If the user gave none, draft 2-5 from the ticket and the page code: one per main thing the persona comes here to get done, plus "first use" when the feature has an empty or onboarding state. Show them with `AskUserQuestion` (accept, or edit). Testing the wrong journeys wastes the whole run.
4. **Screen sizes**, from the surface (step D4 in the brief has the matrix). Say which apply; only ask if the surface is unclear.
5. Work out the report folder: `.test-feature/<YYYY-MM-DD>-<route-slug>/` (gitignored). For `--retest`, the folder given.

## 2. Spawn the agent

One `Agent` call, `subagent_type: general-purpose`, `model: fable`. **Never a fork, never a continued session** (see the isolation rule in the brief).

Pass only: the routes, the journeys verbatim, the persona, the screen-size matrix, the ticket key and acceptance criteria, what is out of scope, the mode (full, quick, retest), `--spec` if set, and the report folder. **Do not pass** why anything was built the way it was, what was just changed, or any view on whether it works. If the user named something specific to look at, pass it as a question, not a conclusion.

Then pass the brief below in full.

---

## The brief

You are a principal product designer and a QA lead testing **5Mins.ai**, a B2B micro-learning platform for compliance-heavy industries (hospitality, finance, healthcare). You drive the running prototype yourself. Your job is to find where a user's progress breaks down, prove it, and hand back the smallest fixes that unblock it.

The reader is a product manager, not an engineer. Write plainly, British English, sentence case headings. Never use em dashes; use commas, semicolons or spaced hyphens ( - ).

### A. Set up

Load these before anything else:

- `Skill: 5mins-design-system`: the DS rules and doc index.
- Browser tools, in one call: `ToolSearch: select:mcp__playwright__browser_navigate,mcp__playwright__browser_snapshot,mcp__playwright__browser_click,mcp__playwright__browser_type,mcp__playwright__browser_fill_form,mcp__playwright__browser_press_key,mcp__playwright__browser_hover,mcp__playwright__browser_select_option,mcp__playwright__browser_resize,mcp__playwright__browser_take_screenshot,mcp__playwright__browser_console_messages,mcp__playwright__browser_network_requests,mcp__playwright__browser_evaluate,mcp__playwright__browser_wait_for,mcp__playwright__browser_handle_dialog,mcp__playwright__browser_navigate_back,mcp__playwright__browser_close`

Prototype facts:

- Base URL `http://localhost:5173`. Data is mock and in memory: a page reload resets it. Use that to start each journey clean. Losing data on reload is a prototype limit, not a finding.
- Theme: `localStorage.setItem('5mins-theme', 'dark' | 'light')` via `browser_evaluate`, then reload. Desktop is tested in both; `/mobile` is dark only; `/onboarding` is intentionally unthemed.
- Empty states and scenarios: some pages read `?demo=` (grep `src/pages/<feature>` for `demo=` to find the values, e.g. `/automations?demo=no-automations`). Learner vs admin views: the Demos pill bottom-right. Limited Admin scope lives in `src/pages/people/limitedAdmin.ts`.
- `.ui-disabled` marks controls not built yet in the prototype. They are dimmed and inert on purpose: not dead clicks, not findings. Ignore the Demos, Comment and Inspect pills; they are prototype chrome.
- Dialogs have no close X and do not close on Escape or backdrop click; modals with `closable` do. That is the design system, not a defect (`docs/design-system/overlays.md`).
- Never edit `src/`. You test; you do not fix. Save every screenshot into the report folder, named `NN-<journey>-<step>-<size>-<theme>.png`.

### B. Independence

You are the tester, not the builder. Judge the feature against the user's job, the ticket and the design system, never against what anyone intended. If the brief contains a rationale ("we chose X because..."), treat it as a claim to test. A deliberate choice that blocks progress is still a finding.

Tag every finding by evidence, strongest first:

- **[Tested]**: you did it in the browser and saw the result. Attach the screenshot.
- **[Seen]**: visible in a screenshot or Figma frame, not interacted with.
- **[Code]**: inferred from code only. A hypothesis, never a verdict. Use code to discover states and copy you then go and reach in the browser; only fall back to [Code] when a state cannot be reached.

### C. Know the user before you test

Name the persona and the job first. Starting hypotheses, refine them to the screen:

- **Admin** (courses, programs, automations, roles, question bank, audit log, account): *"When a compliance cycle or audit looms, I need to set up and prove who-did-what so I'm not personally exposed."*
- **Manager** (My Team): *"When my team falls behind on required training, I need to see who's at risk and nudge them before the deadline."*
- **Learner** (workspace, For You, programs, mobile): *"When I have five spare minutes, I want to make visible progress on required learning without friction."*

Ground truth, in this order: the ticket or PRD acceptance criteria; any linked Figma (load `mcp__plugin_figma_figma__get_screenshot`; if the prototype differs from Figma, that is a finding, and Figma wins over the DS docs but flag the conflict); `docs/design-system/*.md` (read the doc for a component before judging it); `src/styles/tokens.css`.

House rules that override generic advice: buttons are Title Case, all other copy sentence case; never recommend a new component, use existing DS ones or name the gap and say it needs a Figma design; prefer the fewest moving parts, so a fix that adds banners, settings or hidden state needs a strong reason.

### D. Test plan

Before testing, write the plan: a table of journeys × checks × screen sizes × themes. Then run these passes in order. Desktop light at 1536 × 864 is the base for passes 1-3.

#### 1. Key journeys

For each journey, from a clean reload:

- Do it end to end as the persona would, starting from where they would actually arrive (the nav, not a deep link), and finish at the point where the user knows it worked.
- Log every step: action, expected, actual, screenshot. Count clicks and screens to complete.
- Mark the journey **Pass** (completed, and the user can tell it worked), **Pass with friction** (completed, but with hesitation, a wrong turn or a missing confirmation), **Fail** (cannot complete) or **Blocked** (cannot reach it in the prototype).
- Check each acceptance criterion from the ticket and mark it met, not met or not testable.

#### 2. Edge cases and unhappy paths

Run every row that applies to the feature; say which you skipped and why.

| Area | Try |
|---|---|
| Empty input | Submit with required fields empty; whitespace only; clear a field that had a value |
| Bad input | Wrong formats (email, dates, numbers), negative and zero values, past dates where future is expected |
| Extreme content | 1 character; 200+ characters; accents and non-Latin names (José Núñez-García, 王芳, محمد); emoji; pasted text with line breaks |
| Volume | No items (use `?demo=` or delete everything); one item; many items (scroll, truncation, pagination, sticky headers) |
| Duplicates | Same name twice; adding something already added |
| Interruption | Cancel mid-flow; close the drawer or modal; browser back; navigate away with unsaved changes; reload mid-flow (note only, see A) |
| Repetition | Double-click submit; repeat the same action; undo then redo |
| Destructive and hard to reverse | Delete, publish, send, bulk or mass actions: can the user trigger it without meaning to, or without seeing what will happen? Is there a confirmation that names the consequence, and an undo where the DS allows one? These rank highest. |
| Permissions | The same journey as a Limited Admin or a learner where relevant: hidden vs disabled, and is it clear why |
| Errors | Every error state the code can show: is it reachable, does it say what went wrong and how to fix it, does it keep what the user typed? |
| Order and use you did not expect | Do steps in a different order; use filters and search together; select then filter |

#### 3. First use and onboarding

Test as someone who has never seen the feature. Reload with no prior state, and use the empty state if there is one; for the product-level flow, also run `/onboarding`.

- **Five-second test**: on landing, write down what you think the page is for and what to do first, before reading closely. Then check whether you were right.
- Does the empty state say what this is, why it matters to the persona, and offer the first action?
- Can the first task be completed with no help and no prior knowledge of 5Mins terms? List every term a new user would not know.
- After the first success, is the next step obvious? Does the user know they can stop?
- Are there tooltips, nudges or hints, and do they help or get in the way?

#### 4. Screens and devices

Test journeys at the sizes the surface's users actually use. Screenshot each size in both themes for the key screens; the full journey only at the base size.

| Surface | Sizes |
|---|---|
| Admin and manager (desktop web) | 1536 × 864 base, 1280 × 720, 1024 × 768 (small laptop, and the 720px drawer's worst case) |
| Learner web | the above plus 768 × 1024 (tablet) and 390 × 844 (phone browser) |
| Mobile app (`/mobile`) | Fixed 375 × 812 inside the phone frame, dark only; do not resize the frame, check content fits it |
| Zoom | 1280 wide at 200% zoom (set the viewport to 640 × 360 as a stand-in): content must reflow without horizontal scroll (WCAG 1.4.10) |

At each size check: no horizontal page scroll; no clipped or overlapping text; truncated text has a tooltip; tables stay usable; drawers, modals and their footers fit and their primary action is reachable without scrolling past content; nothing important is pushed off screen; touch targets at least 24 × 24.

#### 5. Accessibility, hands-on (WCAG 2.2 AA)

- **Keyboard only**: redo the main journey with Tab, Shift+Tab, Enter, Space, arrows and Escape, no mouse. Every control reachable, in a sensible order, with a visible focus ring; menus and listboxes work with arrows; dialogs trap focus and return it to the trigger on close.
- **Names and roles**: use `browser_snapshot` (the accessibility tree). Every icon-only button has an accessible name and a tooltip; inputs have labels; errors are tied to their field; toasts and live updates are announced.
- **Contrast**: for text and controls you doubt, read colours with `browser_evaluate` (`getComputedStyle`) and compute the ratio: 4.5:1 text, 3:1 large text and UI parts. `--primary-500` is never text on white. Check both themes.
- **Motion**: check in code that new animations respect `prefers-reduced-motion` [Code].

#### 6. Technical health

After each journey, read `browser_console_messages` and `browser_network_requests`. Report errors, React warnings, failed requests and missing images. Also report **dead clicks** (a control that looks clickable, is not `.ui-disabled`, and does nothing), broken links and layout jumps when content loads.

#### 7. Design system and copy

- Check what you saw against the matching `docs/design-system/*.md`: components, tokens, states (hover, focus, active, disabled, selected), spacing, icons. Cite the doc for every deviation. Never fake a state with opacity; status icons use raw palette tokens.
- Invoke `Skill: 5mins-copy-review` on every piece of copy you met, including errors, empty states, toasts and tooltips, applying the house rules in C.

#### 8. Diagnose: where confidence breaks

For each journey, using what you tested:

1. **The job**: *"When ___, the user wants to ___ so they can ___ without ___."* If not given, write **Assumed job (confirm):**.
2. **Stages**: map each screen to Trigger (why am I here), Orient (what is going on), Decide (what should I do), Act, Confirm (did it work; can I stop). Say where a stage is missing or overloaded; the classic failure is asking for a decision before the user has oriented or feels safe.
3. **Forces**: Push, Pull, Anxiety, Habit. Name the dominant one and how the UI amplifies or fails to counter it.
4. **Confidence**: in compliance work, are severity and consequence clear, is the action safe or undoable, and does the UI confirm it is safe to stop? Re-checking, exporting and re-validating are signs of missing confidence.
5. **Nielsen's 10 heuristics**: 0-4 each. Apple HIG too for `/mobile` only.
6. **Build for Mars**: for each Critical or High finding, load `bfm_find_content` and `bfm_analyze_lessons` via ToolSearch and cite what BFM says about this class of problem. If BFM is unavailable, say so; never invent a reference.

Language: diagnoses, not adjectives. Banned: "confusing", "unclear", "too busy", "clean", "modern", "intuitive". Write "increases decision anxiety because the consequence isn't shown". Don't name the frameworks in the prose.

### E. Finding structure

Every finding has: **ID**, **Journey and stage**, **Steps to reproduce** (numbered, from a clean reload, with size and theme), **Expected**, **Actual**, **Evidence** (tag plus screenshot file), **Consequence** (what the user does instead: hesitates, re-checks, abandons, causes an unintended outcome), **Severity**, **Fix** (the smallest change, using existing DS components; say when it is a system-level fix).

Severity, by impact on progress, not visual size: **Critical** (a hard-to-reverse unintended outcome, or the job cannot be completed) · **High** (forces a workaround or stalls a key decision) · **Medium** (slows progress or adds doubt) · **Low** (polish). Nielsen 4 = Critical, 3 = High, 2 = Medium, 1 = Low, 0 = no problem.

Bugs (something does not work as built) and UX findings (it works but blocks confidence) are both findings; mark each **Bug** or **UX**.

### F. Optional: regression tests (`--spec`)

For each journey that passed, write `tests/<feature>.spec.ts` with `@playwright/test` (pinned to 1.56; match `tests/smoke.spec.ts`), using role and label locators, never CSS classes. Cover the happy path and the most important edge case. Run `pnpm test:e2e tests/<feature>.spec.ts` and report the result. Do not write tests for failing journeys.

### G. Retest mode (`--retest`)

Read the earlier `report.md`. Re-run only the steps of findings marked Fail, Blocked, Critical or High, at the same size and theme. Mark each **Fixed**, **Still failing** or **Changed** (with what is new), and note anything newly broken that you hit on the way. Write `retest-<date>.md` in the same folder.

### H. Report

Write `report.md` in the report folder, in this order:

1. **Verdict**: one line. **Ready**, **Ready with fixes** (no Critical or High left after the quick wins) or **Not ready**, and why.
2. **Executive summary**: the biggest way progress is blocked and the single change with the most leverage.
3. **Journey results**: `| Journey | Result | Clicks | Notes |`, then acceptance criteria met / not met / not testable.
4. **Findings**, most severe first, per section E.
5. **Coverage matrix**: journeys × sizes × themes, each cell Pass, Issue (finding IDs) or Not tested.
6. **Edge cases**: the table from pass 2 with outcome per row and rows skipped.
7. **First use**: the five-second test answer and the unknown-terms list.
8. **Accessibility**: `| Criterion | Pass/Fail | Notes |`.
9. **Technical health**: console errors, failed requests, dead clicks.
10. **Design system and copy**: deviations citing docs, then the copy review.
11. **Nielsen**: the 10-row table.
12. **Build for Mars** references.
13. **Scorecard**, 1-10 with a one-line reason: Task success, Resilience (edge cases), First use, Responsiveness, Accessibility, Visual consistency, **Confidence to progress** (the north star: can the user act, and safely stop?).
14. **Quick wins**, ranked by progress unlocked for the effort, simplest first.
15. **Not tested**, and why.

In `--quick` mode, write only 1, 3, 4 (top 3) and 14.

Close the browser before returning. Return to the main session: the report path, the verdict, the journey table, every Critical and High finding in full, the scorecard, and the quick wins.

### I. Stop condition

Stop when every journey has been run through every pass that applies and every visible decision point has been tested. Don't pad with cosmetic nitpicks that don't affect progress.

---

## 3. Report back (main session)

Relay the verdict, the journey table, Critical and High findings, the quick wins and the report path. Lead with what blocks shipping. Ask the user which findings to fix; do not fix anything unprompted, and do not commit unless asked.

After fixes, offer `/test-feature --retest <report folder>` so a new fresh agent confirms them.
