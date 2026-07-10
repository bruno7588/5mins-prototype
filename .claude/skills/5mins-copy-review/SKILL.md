---
name: 5mins-copy-review
description: Review and pressure-test UI and email copy for the 5Mins.ai platform against the 5Mins voice, tone, and writing conventions. Use whenever the user wants to check, audit, critique, or improve copy for any 5Mins surface - admin portal screens, learner web or mobile screens, marketing pages, or transactional and lifecycle emails - or asks things like "does this read right", "is this on-brand", "tighten this microcopy", "review this email", or "what should this button / heading / error say". Also use when drafting fresh copy for a 5Mins page, modal, empty state, notification, or email, since this skill carries the voice rules and approved terminology. Trigger this even when the word "copy" is not used, as long as the task is about the wording of any 5Mins-facing text.
---

# 5Mins.ai Copy Review

A reviewer's toolkit for 5Mins.ai copy. Use it to audit existing wording, or as the source of truth when drafting new wording, across every surface the company ships text on.

## What this skill does

Given a piece of copy and a surface, produce a structured review: a verdict, a severity-ranked list of issues, and concrete rewrites. The same voice rules also apply when writing new copy from scratch.

It covers four surfaces:

- **Admin portal** - the dark-themed admin app used by L&D leads, compliance leads, HR, and coordinators.
- **Learner web and mobile** - the TikTok-style learner experience, including frontline auth flows.
- **Emails** - transactional and lifecycle messages (invites, reminders, escalations, nudges, reports).
- **Marketing pages** - the public www.5mins.ai site.

## Two registers, one brand

5Mins writes in two registers. Do not blur them.

**Marketing register** sells. It is confident, benefit-led, and saturated with concrete proof. It can use sentence fragments for punch and address an unconvinced buyer. Example energy: "Faster onboarding. Zero chasing. Development on autopilot."

**In-product register** serves. The user has already bought; now they need to get something done. It is clear, calm, and economical. It never sells, never hypes, and never makes the user feel slow. A button tells you what will happen; an error tells you how to recover; an empty state tells you what to do next.

When reviewing, first decide which register applies. Marketing voice inside the product reads as noise. In-product flatness on a landing page reads as weak.

## The five voice pillars

These hold across both registers; the dial just turns.

1. **Outcome first, mechanism second.** Lead with the result the reader gets, then explain how. "Cut compliance admin to near zero" beats "Configurable automation rules engine". In-product, the "outcome" is usually just clarity about what happens next.

2. **Concrete over vague.** Prefer real numbers, named things, and specific verbs. 5Mins copy earns trust with specifics ("95%+ completion", "2-4 weeks to launch", "3 lessons left"), not adjectives. If a claim cannot be made specific, question whether it should be there.

3. **Brief and plainspoken.** Short sentences. One idea per sentence. Cut throat-clearing ("In order to", "Please note that", "We are pleased to inform you"). Write the way a sharp colleague talks, not the way a policy document reads.

4. **Confident, not hyped.** State things plainly and let the specifics carry the weight. Avoid empty superlatives ("revolutionary", "world-class", "best-in-class") and intensifiers ("very", "truly", "incredibly"). Confidence is calm.

5. **Human and on the reader's side.** Address the reader as "you". Be warm without being cute. In moments of friction (errors, failures, empty states) the tone is reassuring and blame-free: the product, not the user, owns the problem.

## Core conventions (quick version)

Full detail is in `references/word-list.md`. The essentials:

- **Spelling: British English.** "Personalise", "enrolment", "organisation", "behaviour", "licence" (noun). 5Mins AI Ltd is UK-registered and the customer and compliance base is UK-centric. The marketing FAQ currently drifts to American spelling - treat that as a defect to flag, not a precedent.
- **Capitalisation: sentence case** for everything in-product (headings, body, form labels, buttons, menu items, empty states, errors). Capitalise only the first word and genuine proper nouns. Feature names that are genuine product nouns stay capitalised: see the proper-noun list in `references/word-list.md`.
- **The brand is "5Mins"** (or "5Mins.ai" for the full name). Never "5mins", "5 Mins", "Five Mins", or "FiveMins". When you mean the literal duration, write "5 minutes", not "5Mins".
- **Numbers:** numerals in UI and for stats ("3 days left", "20,000+ lessons"). Spell out only when a number opens a sentence. Numeric ranges use an unspaced hyphen: "60-80%", "6-10x", "2-4 weeks".
- **Punctuation:** no em dashes anywhere. For a parenthetical break use a spaced hyphen ( - ). Use the Oxford comma. Reserve the ellipsis for in-progress states ("Saving..."). Exclamation marks are for genuine positive moments only (a passed course, a streak milestone) - never in errors, warnings, or neutral text.
- **"Lessons"** are the bite-sized units. "Courses" are grouped or uploaded multi-lesson content. Do not use them interchangeably. End users are **learners**; portal users are **admins**; the workforce is the **team** or **people**.

## Reviewing copy: the workflow

1. **Identify the surface and register.** Admin portal, learner web/mobile, email, or marketing. This sets which checklist in `references/surface-guides.md` applies and how far to turn the voice dial.

2. **Read it as the reader would.** Who is this person, what are they trying to do, what state are they in (new, blocked, mid-task, finished, failing)? Copy that ignores the reader's state is the most common failure.

3. **Run the surface checklist** in `references/surface-guides.md`, then the core conventions above and the word list.

4. **Rank every issue by severity:**
   - **Blocker** - factually wrong, genuinely confusing, breaks trust, inaccessible, or wrong terminology that misleads. Must fix before shipping.
   - **Should-fix** - off-voice, inconsistent, wordy, weak or vague CTA, wrong register. Fix unless there is a deadline reason not to.
   - **Polish** - minor tightening; optional but cheap.

5. **Give a concrete rewrite for every issue.** "This is wordy" is not a review. Show the better version. If a single fix has trade-offs, offer two options and say what each optimises for.

6. **Output using the format below.**

## Output format

Always structure the review like this:

```
## Copy review: [surface] - [page or component name]

**Verdict:** [one line - e.g. "Ship after two should-fixes" / "Solid, polish only" / "Needs a rethink: wrong register"]

**Issues**

| # | Location | Severity | Issue | Suggested rewrite |
|---|----------|----------|-------|-------------------|
| 1 | [where] | Blocker | [what is wrong and why] | [the fix] |
| 2 | ...     | Should-fix | ... | ... |

**Rewritten copy**
[Only if the user asked for a clean version, or if there are 3+ issues. Give the full corrected copy as a block so it can be pasted straight in.]

**Notes**
[Optional. Cross-cutting observations, open questions for the user, or things outside copy that affect it - e.g. "the empty state and the error say the same thing; pick one".]
```

If reviewing several screens or a whole flow, give one verdict line per screen, then a combined issues table, then an overall note about consistency across the flow.

When **drafting** rather than reviewing, skip the table: produce the copy directly, on-voice, then add a short "Why" note explaining the two or three judgement calls you made.

## Worked example

**Input** - admin portal, confirmation modal for removing a learner:

> Are you sure you want to do this? This will permanently delete the user from your organization and cannot be undone. All of their data will be lost forever.

**Review:**

| # | Location | Severity | Issue | Suggested rewrite |
|---|----------|----------|-------|-------------------|
| 1 | Heading / first line | Should-fix | "Are you sure you want to do this?" is filler; the modal title should name the action. | Title: "Remove [name] from your team?" |
| 2 | Body | Blocker | "organization" is American spelling; 5Mins standard is British. | "organisation" |
| 3 | Body | Should-fix | "lost forever" is alarmist and vague. State what actually happens, calmly and specifically. | "Their learning history and progress will be removed and can't be recovered." |
| 4 | Body | Polish | "permanently delete the user" - "user" is system-speak; learners are people. | "permanently remove this learner" |

**Rewritten copy:**

> **Remove [name] from your team?**
> This permanently removes the learner from your organisation. Their learning history and progress will be removed and can't be recovered.
> [Cancel] [Remove learner]

**Notes:** Destructive-action copy should be calm and precise, not dramatic. The reader is an admin doing routine cleanup; tell them exactly what is lost so they can decide, and let the red button carry the weight of the warning.

## Quick reference

| Situation | Do | Avoid |
|-----------|-----|-------|
| Button label | Name the action, verb first, sentence case: "Add learner", "Save changes" | "Submit", "OK", "Click here", Title Case |
| Empty state | Say what this is and the one next step | A shrug ("Nothing here yet") with no action |
| Error | What happened + how to fix it, blame-free | "Invalid input", "Something went wrong" with no recovery |
| Destructive confirm | Name the action in the title; state exactly what is lost | "Are you sure?"; "lost forever" |
| Success toast | Short, specific, calm: "Course assigned to 12 learners" | "Success!"; vague "Done" |
| Email subject | State the value or action plainly | Clickbait, ALL CAPS, emoji-stuffing |
| Marketing headline | Outcome + proof | Feature names; empty superlatives |
| Loading state | Present continuous + ellipsis: "Generating lessons..." | A bare spinner with no words on long waits |

For full per-surface checklists see `references/surface-guides.md`. For the spelling standard, approved terms, the proper-noun list, and words to avoid see `references/word-list.md`.
