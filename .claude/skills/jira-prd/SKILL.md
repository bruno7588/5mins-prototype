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

The agent writes these sections, in this order.

**Part 1 — Product**
1. **Summary** — two or three sentences; what ships and for whom.
2. **Problem & context** — drawn from the ticket, expanded with what the code shows about today's behaviour.
3. **Goals / Non-goals** — non-goals matter most; they are what stops scope creep in review.
4. **Users** — which 5Mins persona (L&D lead, compliance lead, HR, coordinator, Super Admin) and what they are trying to finish.
5. **Success metrics** — how anyone would know this worked.
6. **Scope** — in this ticket vs. deliberately deferred.

**Part 2 — Prior art**
7. **Prior art & references** — per pattern found: source, what it does, and a one-line verdict on whether we follow it or deliberately do not. This section must then visibly shape Part 3; cite adopted patterns inline where they land.

**Part 3 — Design & UX spec**
8. **User flows** — step by step, one subsection per distinct path (e.g. single vs. bulk).
9. **Screen-by-screen** — entry points, layout, and the named design-system components for each screen or overlay.
10. **States** — default, loading, empty, partial success, error, disabled, permission-denied.
11. **Edge cases** — enumerate them; every AC that says "skipped", "cannot", or "already" is an edge case that needs a defined behaviour and a message.
12. **Copy** — every label, heading, button, toast, confirmation, and error, in a table.
13. **Data & permissions** — what is stored, what is audited, who can do it.
14. **Analytics** — events worth firing and their properties.

**Part 4 — Closing**
15. **Risks**.
16. **Open questions** — numbered, each one addressed to a named role where possible. Ambiguity in the ticket belongs here, not resolved silently in the spec.
17. **AC traceability** — a table mapping each acceptance criterion from the ticket to the section that specifies it. Any AC without a section is a gap; say so.

## 5. Report back

In the main session: the file path, a short summary, and the open questions listed in full. Open questions are the reason the document gets read, so do not bury them.

Do **not** post the PRD to Jira or Confluence, and do not change the ticket, unless the user asks. If it seems useful, offer it in one line.
