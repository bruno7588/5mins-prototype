---
name: jira-prd
description: Turn a Jira ticket into a full PRD (product framing plus design/UX spec). Discusses the ticket with the user as a Thinking Partner first, then spawns a research agent that grounds the document in this prototype's code, the 5Mins design system, the 5Mins copy rules, and external prior art from Sana Labs, Mobbin, Build For Mars, and the web; draws the user journey in Claude Design and embeds it in the PRD; and ends the plan with a pre-build ux-auditor review. Use when the user types /jira-prd <TICKET-KEY> (e.g. /jira-prd DES-333), or asks for a PRD, spec, or written brief for a Jira ticket.
---

# Jira → PRD

Given a Jira ticket key, produce a PRD that a designer and an engineer can both build from. The ticket is the input, not the output: a good ticket already carries context and acceptance criteria, so the PRD's job is to add the framing above it and the specification below it.

The research is delegated to an agent so the main session is not flooded with file dumps.

## 1. Resolve the ticket

The 5Mins Jira cloudId is `944c118b-f708-4d9a-a0dc-39dd83e16e24` (site `https://5mins.atlassian.net`).

Load the tool if it is not already available:

```
ToolSearch: select:mcp__claude_ai_Atlassian__getJiraIssue
```

Then fetch the issue with `responseContentFormat: "markdown"` and fields including `summary, description, status, issuetype, priority, labels, components, assignee, reporter, created, updated, project, comment, parent, subtasks, issuelinks`.

If no ticket key was given in the arguments, ask for one. Do not guess.

If the ticket has a parent epic or linked issues, fetch those too — they usually carry the goal the ticket itself omits.

## 2. Thinking Partner discussion

Never go straight from ticket to PRD. Once the ticket is read, invoke `Skill: thinking-partner` and discuss the ideas in the ticket with the user, in this session (it cannot run as a subagent; it needs the back-and-forth). Explore what is actually worth solving, challenge the assumptions, and compare the options before any research starts.

Seed the discussion with what the ticket leaves unsaid, for example:

- An acceptance criterion with undefined behaviour ("skipped", "cannot", "already": skipped how, and does the user see it?).
- A capability being moved between roles, where the permission boundary is unstated.
- Anything irreversible where the ticket does not say whether it can be undone.
- A success metric implied in the context paragraph but never quantified.
- A referenced design or prototype that may or may not be binding on the spec.

It ends with the Thinking Partner summary (problem, job, decisions, rejected options, still open) confirmed by the user. Pass that summary verbatim into the agent's brief: decisions are ones it must follow, and anything not settled stays an open question in the PRD.

## 3. Spawn the research agent

One `general-purpose` agent. Pass it the **full ticket text verbatim** (summary, description, ACs, comments) inside the prompt — the agent has no Jira access of its own and must not have to guess.

The agent does two research passes before it writes anything: internal (this codebase) and external (prior art).

### Internal research

> - Find the surface(s) this ticket touches in `src/pages/` and read the relevant components, data shapes in `src/data/`, and routes in `src/App.tsx`. Name real files and real component names in the PRD.
> - Read `docs/design-system/` and `src/components/` and specify which existing components the flows should use. If a needed component has no doc, say so explicitly and flag it as an open question — never invent one or adapt a "close enough" pattern silently.
> - Follow `.claude/skills/5mins-copy-review/SKILL.md` for every piece of user-facing copy proposed (in-product register, approved terminology, Title Case buttons).
> - Use only tokens from `src/styles/tokens.css` if referencing any values.

### External research (prior art)

Tell the agent to load these deferred tools in **one** ToolSearch call:

```
ToolSearch: select:WebSearch,WebFetch,mcp__claude_ai_Mobbin__search_flows,mcp__claude_ai_Mobbin__search_screens,mcp__claude_ai_Mobbin__search_sections,mcp__claude_ai_BFM__bfm_find_content,mcp__claude_ai_BFM__bfm_analyze_lessons
```

Four sources, each with a job:

- **Sana Labs** (`sanalabs.com`, via WebSearch/WebFetch) — our closest comparator in enterprise learning. How does their admin surface solve the same job?
- **Mobbin** (`search_flows` / `search_screens` / `search_sections`) — real shipped UI patterns for the interaction in question. Search the interaction, not the feature name.
- **Build For Mars** (`bfm_find_content`, `bfm_analyze_lessons`) — UX teardown lessons on the underlying principle (friction, confirmation, error recovery, feedback).
- **General web** — adjacent LMS/HR admin tools (Workday Learning, Docebo, TalentLMS, Cornerstone) and any relevant convention.

Rules for the agent on external research:

- Cite real URLs. If a source returns nothing useful, say so plainly — an honest "Mobbin had no close match" beats a vague reference.
- Prior art informs the design; it never overrides the 5Mins design system, the token rules, or the copy skill.
- If an appealing external pattern needs a component we do not have, that is an open question, not an invented component.

### Output location

> Write the PRD to `agents/output/<YYYY-MM-DD>-<TICKET-KEY>-<kebab-slug>.md` (supporting research alongside as `<same-name>.research.md`) and return a short summary, the user journey steps, plus the open questions.

## 4. Draw the user journey in Claude Design

After the research agent returns, and before the plan is final, turn the PRD's journey steps into a diagram of how the user gets the job done.

1. **Content.** One diagram per main journey (most tickets have one). Left to right, grouped by stage: Trigger, Orient, Decide, Act, Confirm. Each step shows the screen or surface, what the user does, and the question on their mind. Show key branches (an error, a cancel, a permission limit) as short side paths. It must end at Confirm: the user knows it worked and can stop.
2. **Claude Design.** Run `Artifact` with `action: "quickstart"` and `intent: "design"`, then create the diagram from the Design type it names, titled `<TICKET-KEY> user journey`, following the type's instructions. Use 5Mins colours from `src/styles/tokens.css`. Give the user the link so they can open, edit and share it.
3. **In the PRD.** Save the same diagram as a standalone SVG next to the PRD, `<same-name>.journey.svg` (load `Skill: artifact-diagramming` for the SVG mechanics; light background, readable at A4 width). Embed it in the PRD's user journey section with `![User journey](./<same-name>.journey.svg)` and add the Claude Design link under it.
4. If the user asks for changes to the journey, update both the Claude Design artifact and the SVG so they never drift.

## 5. PRD structure

Three sections. Nothing else. A PRD for a single ticket should land in **under 10 pages** — if it is running longer, the spec has stopped being a brief and become a document nobody will read.

### 1. Context

What the reader needs before they can judge anything else:

- **The problem** — why this exists, in a short paragraph. Whether it is table stakes in the category or genuinely novel.
- **What the code does today** — a compact table of the relevant current behaviour, naming real files, constants and components. This is the half a ticket never carries and the agent's research exists to supply.
- **Decisions taken** — whatever the user settled in step 2, as a table. Specified, not re-debated.
- **The user journey**: the job ("When ___, [persona] wants to ___ so they can ___ without ___."), the journey diagram from step 4, then a short numbered list of the steps, each with its stage (Trigger, Orient, Decide, Act, Confirm) and screen.
- **Acceptance criteria** — verbatim from the ticket.
- **Out of scope** — one line, semicolon-separated. Non-goals stop scope creep in review.

### 2. Research

The external pass, as tables: source, what it does, and an adopt/reject verdict. **Every row carries a real link.** Group by the interaction being studied, not by vendor.

Keep Mobbin and Build For Mars as their own subsections — they answer different questions (shipped pattern vs. underlying principle). Say plainly where a source yielded nothing; an honest "BFM had no close match for X" is worth more than a padded row.

### 3. Implementation

The plan of action, and the reason the document gets opened twice:

- **Blockers** — what must be settled before feature code is written, each with a recommendation, not just a question. Anything that makes an AC unbuildable belongs here and is labelled as such.
- **Phases** — ordered steps as a table of change + what verifies it. Map steps to AC numbers and to the user journey steps they deliver. Mark anything already shipped as done rather than deleting it, so the plan stays readable as a record.
- **Risks to watch during build** — short, and only ones that change what someone does.
- **UX audit**: the final step of the plan, filled in by step 6: the auditor's verdict, scores, and what changed in the plan as a result.
- **Still open** — one line, semicolon-separated. Genuine ambiguity the user did not settle.

Do not add a separate goals/metrics/personas section, a copy table, a screen-by-screen walkthrough or an AC traceability matrix unless the user asks. Fold what matters from those into the three sections above.

## 6. UX audit before build

The last step of the implementation plan. Before anyone builds, spawn the `ux-auditor` agent (`.claude/agents/ux-auditor.md`) to check the journey and the plan against the user's job, and that the plan will work.

- **Fresh agent, never a fork** and never the research agent continued: a reviewer who saw how the plan was made tends to agree with it.
- **Brief with inputs only**: the PRD path, the journey SVG path and Claude Design link, the routes the feature touches today (so it can capture current screens if the dev server is running), any linked Figma, and the output path `agents/output/<same-name>.ux-audit.md`. Do not pass the Thinking Partner discussion, the research agent's summary, or any view on whether the plan is good.
- When it returns, show the user its verdict, scores and recommendations. Ask which recommendations to take into the plan; do not change the PRD unprompted.
- Then fill in the PRD's **UX audit** item: verdict, scores, link to the audit file, and the changes made to the plan (or "none"). If the journey changed, update the diagram in both places (step 4).

## 7. Render the PDF

Once the PRD markdown is written and the UX audit is folded in, render it alongside (same name, `.pdf`). The journey SVG next to the PRD is embedded automatically:

```
cd agents/jira-prd-agent && npx tsx src/render-pdf.ts ../output/<prd-file>.md
```

Re-run this whenever the user edits the markdown, so the PDF never drifts from it. Research files get no PDF.

## 8. Report back

In the main session: the file paths (markdown, PDF, journey SVG, UX audit), the Claude Design link, a short summary, the UX audit verdict, and the open questions listed in full. Open questions are the reason the document gets read, so do not bury them.

Do **not** post the PRD to Jira or Confluence, and do not change the ticket, unless the user asks. If it seems useful, offer it in one line.
