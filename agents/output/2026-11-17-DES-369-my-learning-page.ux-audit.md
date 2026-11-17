# DES-369: My Learning page - pre-build UX audit

**Date:** 2026-11-17 · **Audited:** `2026-11-17-DES-369-my-learning-page.md` (PRD), `2026-11-17-DES-369-my-learning-page.journey.svg` (journey), the code behind the seven routes · **Stage:** pre-build; nothing in the plan exists yet.

**Verdict: Ready after plan fixes** (nine fixes, listed in section 7). **Overall score: 6 / 10.**

## Evidence and limits

- **The dev server was not reachable.** Neither `http://localhost:5173` nor `http://127.0.0.1:5173` answered, and no Vite process was listening on any port. No new screenshots were captured, and no `2026-11-17-DES-369-ux-audit-screens/` folder was created. The current state was audited from the code.
- Two screenshots from earlier audits show today's state and are cited below:
  - `agents/output/DES-336-audit-screens/des336-01-admin-profile-today.png` - the profile page at `/people/1` (taken before DES-336 landed, so the fourth tab still reads Certificates; the header, tabs and Course Progress are as today).
  - `agents/output/2026-11-17-DES-368-ux-audit-screens/des368-05-narrow-web-my-progress-more-menu.png` - My Progress at 375px with the My Team / My Progress chips.
- **Figma:** the three linked nodes resolve, but each is a whole flow section 28,000 to 35,000px wide, unreadable at screenshot size. They were not inspected frame by frame and are not used as evidence.
- **Mobbin and Build For Mars:** only URLs retrieved in this audit are cited as mine. The PRD's own Mobbin links were not re-opened.
- Code read: `src/pages/user-profile/UserProfile.tsx`, `src/pages/my-progress/MyProgress.tsx`, `myProgressData.ts`, `src/pages/my-team/EngagementTab.tsx`, `MyTeam.tsx`, `src/components/LearnerMobileNav/LearnerMobileNav.tsx`, `src/components/ProfileMenu/ProfileMenu.tsx`, `src/App.tsx`.

---

## 1. Audit checklist

- Read the PRD, journey and research as claims to test, not as intent.
- Check each journey step against what the code does today and what the plan changes.
- Name the job and the stage each planned screen has to support.
- Review layout, hierarchy, dead controls and states per planned screen.
- Run Nielsen's 10, then Build For Mars and Mobbin comparisons.
- Review all planned copy against the 5Mins copy rules.
- Check the plan: journey coverage, acceptance criteria, Confirm stage, blockers and order.

## 2. Audit plan

Heuristics: Nielsen's 10, WCAG 2.2 AA, the 5Mins design system (house rules override generic advice).

| Criterion | Description | Pass/Fail | Notes |
|---|---|---|---|
| Visual design | Existing DS components, tokens, hierarchy | Pass with gaps | Chart and Leaderboard have no DS doc or component; the plan says so |
| Interaction design | Every control does something; states are real | Fail | Five dead or decoy controls carried into the new page (finding 5) |
| Navigation and wayfinding | One route to the page per viewer, on every width | Fail | Under 600px the learner's own page has no chips and the bottom tab would not light (finding 6) |
| Access and privacy | Each viewer sees only what they should | Fail | The team guard covers one tab of four (finding 2) |
| Accessibility | Headings, keyboard, focus, target size | Pass with gaps | No `h1` on the profile page; an off-screen active tab at 375px |
| Brand and copy | 5Mins voice, British English, sentence case, Title Case buttons | Pass with gaps | "Performance" over an activity chart; "62%" as a Points value |
| Job fit | The page answers "how am I doing" and lets the person move on | Partial | Engagement shows scores, not standing; Course Progress shows standing but offers the learner no way forward |

## 3. The job

> When a reminder, a review or a manager's question makes me wonder where I stand, I want to see in one place what I have done and what is still owed, so I can either relax or go and do the next thing, without working out which page holds what or worrying that I have missed something.

- **Trigger situation (PRD step 1):** a reminder email, a completed lesson, a review coming up. Two of the three are about obligations (courses due), not about points.
- **Progress, from → to:** from "I think I am behind but I am not sure" to "I know exactly what is outstanding, and I have started on it or know I can stop".
- **Manager's version:** when one of my team is flagged as behind, I want to open that person and see what they owe and when, so I can chase or help without asking them.
- **Stage each surface should support:** sidebar item = Orient; Engagement tab = Orient; tab bar = Decide; Course Progress, Skills, External Training = Act; the URL holding the tab = Confirm (as planned; see finding 7).

The PRD's job statement ("see where things stand without working out which of two overlapping pages holds what") describes the consolidation well. It leaves out the second half of the job: what the person does once they know. That gap drives findings 1 and 3.

## 4. Layout and visual analysis

**Layout**
- Planned page: person header (avatar, name, role · email, Edit Profile), divider, four flat tabs, then the tab body. This is today's `UserProfile` layout (`des336-01-admin-profile-today.png`) and it holds.
- Engagement stacks stat tiles, chart, Leaderboard. The Leaderboard card today is half a row inside a two-column grid; the plan does not say whether it goes full width under the chart or sits beside it. Decide in Figma.
- The learner's own page shows their own name as the title and never says "My Learning" on the page. The lit sidebar item carries that alone. Acceptable on desktop; under 600px there is no sidebar (finding 6).
- No `h1`: the name is an `h2` and My Progress's screen-reader `h1` goes away with the dashboard.

**Typography**
- No new type. Tab labels keep Title Case as feature names. Nothing to fix.

**Color**
- The chart has one raw colour with a lint exception and no chart palette in the tokens. The plan is right not to restyle it here; it must stay flagged as unapproved in Figma.
- A Leaderboard "own row" would need a new state. None exists. This is a design system gap; it needs a Figma design, not an improvised tint.

**Interactions**
- Dead or decoy controls that the plan carries over (finding 5): the filled Edit Profile button, the Cumulative checkbox, the stat tiles' trailing arrow, the skill rows built as buttons, the chart's "Last 6 months" button.
- Tab state goes into the URL (1.2). The plan does not say push or replace, nor what happens with an unknown or switched-off tab key.
- At 375px the fourth tab is off-screen; arriving with `?tab=external-training` would show a tab row with nothing visibly selected unless the active tab is scrolled into view.

**System-level fixes**
- One rule for unbuilt controls on this page: `.ui-disabled` or removed, never clickable and inert.
- One rule for "who is looking": derive it once (`learner`, `manager`, `admin`, none) and let the guard, the view-only table and the header all read it. Today it is derived for one tab only.
- One chart, one Leaderboard, one skills list at person level; the plan already accepts the team-level copies as deliberate.

## 5. Heuristic evaluation

| Heuristic | Assessment | Severity (0-4) | Suggested fix |
|---|---|---|---|
| Visibility of system status | Engagement shows points and rank but nothing about what is overdue; the Leaderboard does not show which row is the person | 3 | Send course-context links to Course Progress; mark the person's row once designed |
| Match with the real world | "Engagement" and "Performance" are manager words on a learner's page; the chart counts activity | 2 | Title the chart for what it counts; keep tab names |
| User control and freedom | If each tab change adds a history entry, Back walks through tabs instead of leaving the page | 2 | Write the tab with replace |
| Consistency and standards | Same page, three viewers, one layout: good. View-only is planned by route while "who is looking" already exists in code | 2 | Gate on the viewer, not the route |
| Error prevention | Removing the learner's row actions closes a real hole (a learner could unenrol themselves) | 0 | Keep 1.7 |
| Recognition over recall | Same icon and position for the renamed item; four flat tabs | 1 | None |
| Flexibility and efficiency | Managers and admins who come to chase courses gain a click on every person | 3 | Course-context rows open Course Progress |
| Aesthetic and minimalist design | Dropping the two summary cards removes duplication | 0 | None |
| Help users recover from errors | "You can only see people in your team." has no way on, and covers one tab | 3 | Guard the whole page |
| Help and documentation | Tile tooltips carry over; the chart's "Total learning moments" tooltip is drafted | 1 | Confirm the tooltip copy |

## 6. Build For Mars and Mobbin

**Build For Mars** (retrieved in this audit)

- [Changing the default tab](https://builtformars.com/ux-bites/changing-the-default-tab): Nike picks the default tab from the signed-in profile. The lesson is that a default is a guess about why the person came. The plan applies this to External Training rows (D5) and not to the far more common course rows. That is the same principle left half applied (finding 1).
- [Dynamic leaderboard motivation](https://builtformars.com/ux-bites/dynamic-leaderboard-motivation) and [Leaderboards and the promotion zone](https://builtformars.com/ux-bites/leaderboards-the-promotion-zone): in both, the viewer's own row is filled and the list is framed around it. A leaderboard only answers "where do I stand?" when the viewer can find themselves in it. The PRD lists this as an open question; on a page whose stated question is "where do I stand?" it is the point of the section (finding 4).
- [This restaurant is closed](https://builtformars.com/ux-bites/this-restaurant-is-closed): when the state is bad news, Uber Eats puts the next action next to it. An Overdue badge with nothing to press is the opposite (finding 3).
- [Context Craving](https://builtformars.com/ux-glossary/context-craving): people want to know what happens next more than they want speed. A learner who does not know their manager sees the same Engagement tab will read a chart titled "Performance" as an appraisal.

**Mobbin** (retrieved in this audit)

- [Searchable: competitor ranking](https://mobbin.com/screens/79debca3-ef7d-4f0d-a0bd-0df1dd9f8243): a ranked list where the viewer's own row carries a small "You" badge. This is the lightest way to mark the row, and the 5Mins `Badge` already exists; it still needs a Figma decision before use (finding 4).
- [Canva Design School: course page](https://mobbin.com/screens/99101067-5ad3-414f-8489-cdba0a27b2e5): progress and a "Continue course" action sit together. Supports giving a learner a way from a course row into the course (finding 3).
- Two searches ("my learning page with overdue courses", "leaderboard with own row highlighted") returned little else that fits. No comparable screen was found for one profile shown to both its owner and their manager, which matches the PRD's own note.

## 7. Copy review

## Copy review: learner web - My Learning

**Verdict:** Ship after three should-fixes.

| # | Location | Severity | Issue | Suggested rewrite |
|---|---|---|---|---|
| 1 | Chart title, "Performance" | Should-fix | The chart counts lessons and quizzes, which is activity. "Performance" reads as a judgement, on a page the manager also opens. The plan's own empty state calls the same thing "learning activity" | "Learning activity" (flag to Bruno: the meeting screenshot says Performance) |
| 2 | Points tile value, "62%" (`myProgressData.ts`) | Should-fix | Points are a count; a percentage on the first tile of the landing tab looks like a bug, and the Leaderboard shows the same person at 1,078 pts | Use a count that agrees with the Leaderboard, for example "1,078" |
| 3 | Chart legend, "Lessons watched" v "Lessons completed" | Should-fix | The PRD notes the clash and leaves it. Streak and the empty state both say "complete a lesson" | "Lessons completed" on both charts |
| 4 | Tab "Engagement" on the learner's own page | Polish | A manager's word for the learner's own points and streak. It is the landing tab, so it explains itself on arrival | Keep; revisit only if testing shows learners hunting for points |
| 5 | Empty Engagement | Pass | Says what this is and the next step; uses "complete"; no exclamation mark | Keep both variants |
| 6 | "You can only see people in your team." | Polish | Correct and blame-free, but a dead end | Keep the line; the lit My Team item is the way back, so make sure the shell still renders around it |
| 7 | Tooltip, "Lessons watched plus quizzes and polls answered." | Polish | Follows from issue 3 | "Lessons completed plus quizzes and polls answered." |

**Notes:** tab labels in Title Case are fine as feature names. Buttons on the page (Edit Profile, Download, Download Certificates, Assign Courses, Clear Filters) are already Title Case.

---

## 8. Findings, ranked by impact on progress

### Finding 1. The landing tab answers a question most visitors did not ask (severity 3)

- **Job context:** a learner prompted by a reminder, or a manager who clicked a person in Course Tracker, wants to know what is owed and by when.
- **Job stage:** Orient (journey step 3, and the manager and admin side paths).
- **Observed friction:** every door except External Training rows opens on Engagement: points, jewels, streak, a six-month chart, a leaderboard. None of it says whether anything is overdue. The two cards that did say so on My Progress (5Mins Courses, External Training) are dropped. Course Tracker rows (`MyTeam.tsx`, `navigate('/my-team/people/:id')`) and People rows open the same tab. Today both land on Course Progress (`des336-01-admin-profile-today.png`).
- **Forces explanation:** habit. Managers and admins have a working habit of click a person, read the courses. The plan breaks it for a tab whose content for them is still undecided (blocker 3). For the learner, anxiety: the reminder said something is due and the page opens on a trophy.
- **Behavioural consequence:** an extra click on every person, every time; or managers stay in Course Tracker and stop opening the person at all. Learners skim Engagement for a warning that is not there.
- **Recommendation:** apply D5 to course doors now, in step 1.2, since 1.2 already gives every tab a key. Course Tracker rows, People rows and reminder email links open `?tab=course-progress`; the sidebar item keeps Engagement (D4 holds for the learner's own unprompted visit). This is the PRD's own "smallest fix", moved from Still open to decided.

### Finding 2. The team guard protects one tab of four (severity 3)

- **Job context:** a manager opens a person; a pasted or guessed link reaches someone outside their team.
- **Job stage:** Orient ("Not in your team" side path).
- **Observed friction:** in `UserProfile.tsx` the guard line renders only inside the External Training branch. For a person outside the team, the header (name, role, email) and Course Progress with every row action still render. Once Engagement is the landing tab, that person's points, activity chart and rank render too. The side path is in the PRD's journey and has no phase.
- **Forces explanation:** anxiety, on the learner's side. Gamification data feels personal; seeing it exposed to a manager who is not theirs, or learning that it could be, costs trust in the whole page.
- **Behavioural consequence:** none visible to the manager, which is the problem. It surfaces as a complaint, not a click.
- **Recommendation:** when the viewer is none, show only the guard line inside the learner shell: no header data, no tabs. Add it to phase 1 with a verify line ("`/my-team/people/<someone outside the team>` shows the guard on every tab key").

### Finding 3. The learner can see what is overdue and cannot act on it (severity 3)

- **Job context:** the learner has found the overdue or failed course and wants to get it done.
- **Job stage:** Act into Confirm (journey steps 5 and 6).
- **Observed friction:** step 1.7 removes checkboxes, the bulk bar and the row menu for the learner. That is right for enrolment changes, but the row then has no interactive element except Download on completed rows. The course name is plain text. The journey's step 5 ends at "spots what is overdue" and step 6 at "I know where I stand".
- **Forces explanation:** push without a pull. The red Overdue badge raises pressure and the page offers nothing to relieve it.
- **Behavioural consequence:** the learner leaves the page and searches for the course by name in For You or Workspace, or waits for the next reminder email because that one has a link.
- **Recommendation:** on the learner's own page, the course name opens the course (`/courses/:id` exists). It changes no enrolment, so D9 holds. No new component: a link in the existing cell. If course ids do not line up in the prototype data, link the rows that do and say so in the callout.

### Finding 4. The Leaderboard does not say where the person stands (severity 2)

- **Job context:** "Am I keeping up, and where do I stand?" (the journey's own words for step 3).
- **Job stage:** Orient.
- **Observed friction:** the list has no state for the page owner's row. On the learner's own page they must find their name among eleven. On a manager's or admin's view of a person, it is the team's list again, identical for every team member and already on My Team's Engagement tab.
- **Forces explanation:** weak pull. A rank you have to hunt for is not a reward; a list that is the same on every profile carries no information about this person.
- **Behavioural consequence:** learners ignore the section; managers scroll past it.
- **Recommendation:** two steps. Now: on the manager's and admin's view, leave the Leaderboard out (tiles and chart only), which also settles half of blocker 3 and removes a third copy of the same list. Later: mark the owner's row. That state does not exist in the design system; it needs a Figma design before anyone builds it. Name it in the phase 2.2 callout as a gap, not as an open question.

### Finding 5. Five controls on the new page look live and do nothing (severity 2)

- **Job context:** reading the page and trusting what it shows.
- **Job stage:** Orient and Act.
- **Observed friction:**
  1. **Edit Profile**, a filled button, the only primary action on a view-only page, wired to nothing for every viewer (`UserProfile.tsx`). The earlier screenshot shows it disabled; the code now shows it enabled.
  2. **Cumulative** checkbox on the chart toggles and changes nothing (`EngagementTab.tsx`, "Toggles only").
  3. **Stat tiles** carry a trailing arrow that signals a destination; 1.3 says "not clickable" but does not say the arrow goes.
  4. **Skill rows** are `<button>` elements with no action; the Skills tab would be a full list of them.
  5. **"Last 6 months"** on the chart is an inert button (not in the screenshot, so it should simply not come across).
- **Forces explanation:** anxiety. One control that does nothing makes people doubt the others, on a page whose whole purpose is to be believed.
- **Behavioural consequence:** repeat clicks, then distrust of the numbers beside the dead control.
- **Recommendation:** house rule, no new design: Edit Profile gets `.ui-disabled` until its destination is designed, and is hidden for managers (a manager editing someone's profile is not a decided capability); Cumulative is either wired or `.ui-disabled`; the tile arrow is removed; skill rows render as plain list items; the period button is left behind.

### Finding 6. Under 600px the learner has no marked route to their own page (severity 2)

- **Job context:** the same check, on a phone browser.
- **Job stage:** Orient (journey step 2, narrow web).
- **Observed friction:** there is no sidebar at this width. Today the route is the Progress bottom tab, which opens My Team, then the My Progress chip (`des368-05-narrow-web-my-progress-more-menu.png`). The chips live in `MyTeam.tsx` and `MyProgress.tsx`. `UserProfile.tsx` has none, and the bottom tab lights only for `/my-team` and `/my-progress`. Step 1.1 says "rename the chip" but the page that will be My Learning has no chip row to rename, and at `/my-learning` no bottom tab would be lit.
- **Forces explanation:** anxiety at "Is this where my progress went?". With no lit tab, no chip and no page title, the only sign is the learner's own name.
- **Behavioural consequence:** learners bounce between Progress and the page; non-managers land on a My Team page first on every visit (existing behaviour, now more visible).
- **Recommendation:** add to 1.1: the learner's own page shows the My Team / My Learning chip row under 600px, and the Progress tab lights for `/my-learning`. Add to 1.11: the active tab is scrolled into view on arrival, so `?tab=external-training` at 375px shows its selected tab.

### Finding 7. The journey's Confirm is a URL, not an answer (severity 2)

- **Job context:** knowing it is safe to stop.
- **Job stage:** Confirm (journey step 6).
- **Observed friction:** step 6 is delivered by "the tab is in the address bar". That is persistence. The interpretation that lets someone stop sits on Course Progress (the four status tiles: completed, in progress, at risk, overdue), one tab away from where everyone lands, and Engagement has no equivalent line. Separately, the plan does not say whether a tab change pushes or replaces history, or what an unknown or switched-off `?tab=` does.
- **Forces explanation:** anxiety. Without a "nothing overdue" signal people re-check.
- **Behavioural consequence:** repeat visits and tab-flipping to make sure; with pushed history, Back steps through tabs instead of returning to the records list they came from.
- **Recommendation:** finding 1 fixes most of this by landing course-prompted visits on the tab that has the interpretation. In 1.2, state: tab changes use replace (as `?hide=` already does), and an unknown or switched-off key falls back to Engagement without an error. Verify: from the admin records list, open a person, change tab twice, press Back once, land on the records list.

### Finding 8. View-only is planned by route, but the route does not say who is looking (severity 2)

- **Job context:** a learner must not change their own enrolments (D9).
- **Job stage:** Act.
- **Observed friction:** 1.7's verify says "on `/my-team/people/:id` nothing changes". `/my-team/people/1` is the signed-in learner, and the code already resolves that as `learner`. Followed literally, the plan leaves the learner able to unenrol themselves through that URL. Also, no phase adds the `/my-learning` route itself or updates the two route checks that pick the shell and light the sidebar (`pathname.startsWith('/my-progress')`, `path === '/my-progress'`).
- **Forces explanation:** not a behavioural force; a correctness gap that would surface as "it works on one link and not the other".
- **Behavioural consequence:** inconsistent pages for the same person.
- **Recommendation:** gate 1.7 on the viewer (`learner`), add "`/my-team/people/1` is also view only" to the verify, and name the route and the two route checks in 1.1 or 1.8.

### Finding 9. The learner does not know who else sees this page (severity 1)

- **Job context:** checking their own numbers.
- **Job stage:** Orient.
- **Observed friction:** if blocker 3 lands on "managers see the same three sections", nothing on the learner's page says so.
- **Forces explanation:** anxiety, amplified by a chart called "Performance".
- **Behavioural consequence:** low; some learners treat points as surveillance and disengage from the gamification.
- **Recommendation:** no new UI. Retitle the chart (copy issue 1) and record the visibility decision in the Figma callout so support and customer success can answer the question.

### Mapping check

| Job | UI that serves it | Mapping holds? |
|---|---|---|
| See what is owed | Course Progress status tiles and table | Yes, but not where people land (finding 1) |
| Do the next thing | Nothing on the learner's page | No (finding 3) |
| See how active I am | Stat tiles, chart | Yes, once dead controls and the "62%" are fixed |
| See where I rank | Leaderboard | Partly (finding 4) |
| See my skills | Skills tab | Unverifiable until blocker 1 closes |
| See external training | External Training tab | Yes (built, DES-336) |
| Manager: check one person | Same page | Yes for courses; undecided for Engagement (blocker 3) |

Further review needed: Skills (after the production source arrives) and the manager's Engagement (after blocker 3).

**Does this page help the user feel confident enough to make progress?** Not yet. It tells people more clearly where things are, which is the consolidation the ticket asks for. It does not yet tell a prompted visitor where they stand on arrival, and it gives a learner with an overdue course nothing to do about it. Findings 1 and 3 close that.

---

## 9. Scores

| Screen or flow | Score | One line |
|---|---|---|
| Step 2 - My Learning in the sidebar (desktop) | 8 | Same icon and place; old links forward; low risk |
| Step 3 - Engagement as the landing tab, learner | 5 | Shows scores, not standing; dead controls; rank not marked |
| Step 4 - four flat tabs | 7 | Clear and flat; needs replace-history and a fallback for hidden tabs |
| Step 5 - Course Progress, learner view only | 6 | Correctly removes enrolment actions; leaves no way into an overdue course |
| Step 6 - Confirm | 5 | Keeps the place; does not tell the person they can stop |
| Side path - manager or admin opens a person | 4 | One click further from their job, on a tab whose content for them is undecided |
| Side path - arrival from an External Training row | 8 | Already works; keep |
| Side path - old My Progress links | 8 | Forwarding with the tab kept is right |
| Side path - not in your team | 3 | In the journey, absent from the plan, and today leaks the rest of the page |
| Side path - empty Engagement | 7 | Good copy; say what the Leaderboard shows for a new learner |
| Narrow web (under 600px) | 4 | No chips, no lit tab, active tab can be off-screen |
| Skills tab | Not scored | No source in the prototype (blocker 1) |

## 10. Executive summary

The consolidation is sound: one existing page, four flat tabs, the dashboard retired, old links forwarded, and a real hole closed (a learner can no longer change their own enrolments). The weak point is the arrival. Almost every visit that starts from a prompt is about courses owed, and the plan lands all of them on Engagement, which shows points and rank and nothing about what is overdue; for managers and admins that adds a click to a daily habit, onto a tab whose content for them is still undecided. Three smaller gaps would be found in the first review after build: the team guard covers one tab of four, the learner's Course Progress has no way into a course, and narrow web has no marked route to the page. None of this needs new components. The plan is ready once the nine fixes in section 12 are written into it.

## 11. Recommendations, easiest first

1. **Fix the sample Points value** ("62%" to a count that matches the Leaderboard). Why: the first number on the landing tab looks broken. Affects: step 3, phase 1.3.
2. **Use one legend label, "Lessons completed", on both charts**, and say in the PRD that this touches My Team's chart. Why: the PRD notes the clash and its out-of-scope list forbids My Team changes. Affects: phase 1.4, copy table.
3. **Remove or disable the five dead controls** (Edit Profile `.ui-disabled` and hidden for managers; Cumulative wired or `.ui-disabled`; tile arrows removed; skill rows as plain list items; "Last 6 months" not carried over). Why: a control that does nothing makes people doubt the numbers next to it. Affects: steps 3 and 4, phases 1.3, 1.4, 1.6, header.
4. **Write the tab to the URL with replace, and fall back to Engagement for an unknown or switched-off key.** Why: Back should leave the page, not walk the tabs; `?tab=skills` with Skills off must not break. Affects: step 6, phases 1.2 and 1.9.
5. **Gate view-only on the viewer, not the route**, and name the `/my-learning` route and the two route checks that choose the shell and light the sidebar. Why: `/my-team/people/1` is the learner too. Affects: step 5, phases 1.1, 1.7, 1.8.
6. **Open Course Progress from course doors**: Course Tracker rows, People rows, reminder email links. The sidebar item keeps Engagement. Why: restores the manager's and admin's one-click habit and lands prompted learners on the tab that shows what is owed. Affects: step 3, manager and admin side paths, phase 1.2, D5.
7. **Guard the whole page for someone outside the team**: guard line only, no header data, no tabs. Why: the side path is in the journey with no phase, and Engagement would expose a non-report's activity. Affects: "Not in your team" side path, new phase 1 row.
8. **On the learner's own page, make the course name open the course.** Why: an Overdue badge with nothing to press sends people off to search. Affects: steps 5 and 6, phase 1.7.
9. **Narrow web: chip row on the learner's own page, Progress tab lit for `/my-learning`, active tab scrolled into view.** Why: under 600px there is no other sign the learner is in the right place. Affects: step 2, phases 1.1 and 1.11.
10. **Retitle the chart "Learning activity"** (confirm with Bruno, since the meeting screenshot says Performance). Why: it counts activity, and the manager opens the same page. Affects: step 3, phase 1.4, copy table.
11. **Leave the Leaderboard off the manager's and admin's view; record the "own row" state as a design system gap needing a Figma design.** Why: an unmarked team list on a person's page says nothing about the person and is a third copy. Affects: step 3, blocker 3, phases 1.5 and 2.2.
12. **Close blocker 3 before phase 1 starts, not "before Figma".** Why: phase 1 comes first and 1.2 lands managers on that tab. Affects: blockers, phase order.
13. **Add the two missing side paths to the journey SVG** ("Not in your team", "Nothing to show yet"). Why: the PRD lists six side paths and the diagram draws three (it merges manager and admin). Affects: journey diagram.
14. **Split the mobile half of AC1 into a follow-up ticket.** Why: the plan cannot meet it and says so. Affects: AC1, phase 3.

## 12. Plan check

**Journey coverage**

| Journey step or side path | Phase | Covered? |
|---|---|---|
| 1 Trigger | none | Not a build item, but the reminder email's link target is undefined; see fix 1 |
| 2 Sidebar item | 1.1 | Yes on desktop; partial under 600px |
| 3 Lands on Engagement | 1.2 to 1.5 | Yes |
| 4 Picks a tab | 1.2, 1.6 | Yes; Skills depends on blocker 1 |
| 5 Reads, filters, downloads | 1.7 | Yes for reading; no way into a course |
| 6 Confirm | 1.2 | Persistence only |
| Manager opens a person | 1.2, 1.7 | Yes; Engagement content undecided (blocker 3) |
| Arriving from an External Training row | 0.3, 1.2 | Yes |
| Admin opens a person | 1.2 | Yes |
| Old link | 1.8 | Yes |
| **Not in your team** | **none** | **No phase** |
| Nothing to show yet | 1.10 | Yes |

Phases that serve no journey step: 1.9 (switched-off panels) and 1.11 (narrow web). Both map to AC3 and are worth keeping; 2.3 (docs) is housekeeping.

**Acceptance criteria**

- **AC1** (web and mobile design of one page): the web half maps to steps 2 and 3 and phases 1.1, 1.8, 2.1, 2.4. **The mobile half cannot be met by this plan** (D11); the PRD says so.
- **AC2** (where the four areas live): maps to steps 3 and 4 and phases 1.2 to 1.6. **Skills cannot be shown faithfully until blocker 1 closes**; the stand-in is acceptable if the callout says so.
- **AC3** (reuse, flag duplication and mobile issues): maps to 1.6, 1.9, 1.11, 2.2. Met, provided the callout also lists the Leaderboard row state and the chart as design system gaps.

**Confirm stage:** the journey has a Confirm step, so it does not end at Act. The step confirms that the place is kept, not that the person has their answer or a next move. With fixes 1, 4 and 5 below it becomes a real Confirm.

**Blockers and order**

- Blockers 1, 2, 4, 5 and 6 are real and correctly sized. Blocker 2's "reuse as it is" should exclude the dead Cumulative checkbox and the period button.
- **Blocker 3 is real and mis-timed.** "Decide before Figma" puts it after phase 1, but phase 1.2 is what lands managers on that tab.
- Order otherwise lets each step be verified as it lands: 1.1 and 1.8 (route and nav) first, 1.2 (tabs), 1.3 to 1.6 (content), 1.7 (view only), 1.9 to 1.11 (variants). Move 1.8 next to 1.1; the sidebar item cannot be verified until `/my-learning` resolves.
- One contradiction: the copy note changes a label on My Team's chart while "changes to My Team's own tabs" is out of scope.

**Plan fixes required before build**

1. Decide blocker 3 and the course-door default before phase 1; write "course rows and reminder links open `?tab=course-progress`" into 1.2.
2. Add a phase 1 row for the whole-page team guard.
3. Gate 1.7 on the viewer; add `/my-team/people/1` to its verify; name the `/my-learning` route and the two route checks; move 1.8 beside 1.1.
4. Add to 1.7: on the learner's own page the course name opens the course.
5. Add to 1.2: replace history; unknown or switched-off key falls back to Engagement.
6. Add the dead-control rule to 1.3, 1.4, 1.6 and the header.
7. Add to 1.1 and 1.11: chip row on the learner's own page, Progress tab lit for `/my-learning`, active tab scrolled into view.
8. Fix the copy table: chart title (pending Bruno), one legend label, Points sample value; note the My Team chart label change against the out-of-scope list.
9. Leaderboard: off for manager and admin until an own-row state is designed in Figma; list it and the chart as design system gaps in 2.2. Add the two missing side paths to the SVG and split AC1's mobile half into a follow-up.

**Verdict: Ready after plan fixes** - the nine above.
