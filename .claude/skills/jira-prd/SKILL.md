---
name: jira-prd
description: Turn a Jira ticket into a full PRD (product framing plus design/UX spec) by spawning a research agent that grounds the document in this prototype's code, the 5Mins design system, the 5Mins copy rules, and external prior art from Sana Labs, Mobbin, Build For Mars, and the web. Use when the user types /jira-prd <TICKET-KEY> (e.g. /jira-prd DES-333), or asks for a PRD, spec, or written brief for a Jira ticket.
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

## 2. Ask before writing

Never go straight from ticket to PRD. Read the ticket first, then put the genuine ambiguities to the user with `AskUserQuestion` — the ones where two readings would produce materially different specs.

Ground every question in the actual ticket. Generic questions ("who is the audience?") waste the user's time; the useful ones come from what the ticket leaves unsaid. Typical sources of ambiguity:

- An acceptance criterion with undefined behaviour ("skipped", "cannot", "already" — skipped how, and does the user see it?).
- A capability being moved between roles, where the permission boundary is unstated.
- Anything irreversible where the ticket does not say whether it can be undone.
- A success metric implied in the context paragraph but never quantified.
- A referenced design or prototype that may or may not be binding on the spec.

Ask at most four questions, each with concrete options rather than an open prompt. If the ticket is genuinely unambiguous, say so and move on — do not manufacture questions to fill the quota.

Pass the answers verbatim into the agent's brief as decisions it must follow. Anything the user does not settle stays an open question in the PRD.

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

> Write the PRD to `docs/prd/<TICKET-KEY>-<kebab-slug>.md` and return a short summary plus the open questions.

## 4. PRD structure

Three sections. Nothing else. A PRD for a single ticket should land in **under 10 pages** — if it is running longer, the spec has stopped being a brief and become a document nobody will read.

### 1. Context

What the reader needs before they can judge anything else:

- **The problem** — why this exists, in a short paragraph. Whether it is table stakes in the category or genuinely novel.
- **What the code does today** — a compact table of the relevant current behaviour, naming real files, constants and components. This is the half a ticket never carries and the agent's research exists to supply.
- **Decisions taken** — whatever the user settled in step 2, as a table. Specified, not re-debated.
- **Acceptance criteria** — verbatim from the ticket.
- **Out of scope** — one line, semicolon-separated. Non-goals stop scope creep in review.

### 2. Research

The external pass, as tables: source, what it does, and an adopt/reject verdict. **Every row carries a real link.** Group by the interaction being studied, not by vendor.

Keep Mobbin and Build For Mars as their own subsections — they answer different questions (shipped pattern vs. underlying principle). Say plainly where a source yielded nothing; an honest "BFM had no close match for X" is worth more than a padded row.

### 3. Implementation

The plan of action, and the reason the document gets opened twice:

- **Blockers** — what must be settled before feature code is written, each with a recommendation, not just a question. Anything that makes an AC unbuildable belongs here and is labelled as such.
- **Phases** — ordered steps as a table of change + what verifies it. Map steps to AC numbers. Mark anything already shipped as done rather than deleting it, so the plan stays readable as a record.
- **Risks to watch during build** — short, and only ones that change what someone does.
- **Still open** — one line, semicolon-separated. Genuine ambiguity the user did not settle.

Do not add a separate goals/metrics/personas section, a copy table, a screen-by-screen walkthrough or an AC traceability matrix unless the user asks. Fold what matters from those into the three sections above.

## 5. Report back

In the main session: the file path, a short summary, and the open questions listed in full. Open questions are the reason the document gets read, so do not bury them.

Do **not** post the PRD to Jira or Confluence, and do not change the ticket, unless the user asks. If it seems useful, offer it in one line.
