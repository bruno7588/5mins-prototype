---
ticket: DES-270
summary: Design: Enhanced Team Course Tracker & Weekly Manager Report
status: in Design Phase
generated: 2026-04-14T14:10:02.360Z
---



# PRD: Enhanced Team Course Tracker & Weekly Manager Report

## 1. Overview

Managers on the 5Mins learning platform currently have a limited view of their team's learning progress — the Team Course Tracker only surfaces courses due within the next 30 days, hiding overdue items and providing no historical context. This artificial constraint prevents managers from performing their core job: ensuring their team completes required learning and intervening when someone falls behind.

This ticket redesigns the **My Team** page into a tabbed experience with three views — **Course Progress**, **Engagement**, and **Learning Records** — removes the 30-day limitation, introduces explicit "At Risk" and "Overdue" status columns, and exposes full learning records (including external training) with CSV export. The goal is to give managers a single, complete command center for team learning oversight without requiring workarounds like manual spreadsheet tracking or clicking into individual profiles.

## 2. Jobs To Be Done

### Main Job

**Ensure every team member completes their required learning on time** — and when they don't, identify who needs help, what's overdue, and what's coming due soon, so the manager can intervene before gaps widen.

### Job Map

| Stage | What the Manager Does | Current Pain / Workaround |
|---|---|---|
| **Define** | Understand what courses are assigned to the team and their due dates | Partially supported — manager can see assignments but only within a 30-day window |
| **Locate** | Find which team members are behind or at risk | Broken — overdue courses are invisible once the due date passes; "at risk" is not a surfaced status; manager must click into individual profiles |
| **Prepare** | Prioritize who needs attention most urgently | No support — no sorting or filtering by risk/overdue status; manager manually tracks in spreadsheets |
| **Confirm** | Verify the data is accurate and up-to-date | Limited — no view of external training or full learning history; manager cannot see the complete picture |
| **Execute** | Reach out to team members, nudge completion | Manager has the information but cannot quickly act from the dashboard (out of scope for this ticket but informs future work) |
| **Monitor** | Track improvement over time, see trends | No historical view — "all time" data unavailable; no engagement or performance data in one place |
| **Resolve** | Report on team compliance, download evidence | No export capability; manager cannot produce evidence of team learning for audits or leadership reviews |

### Related Jobs

- **Review team engagement and motivation**: Managers want to see who is actively learning (leaderboard, performance metrics) beyond just compliance — addressed by the Engagement tab.
- **Maintain a complete audit trail of learning**: Both platform courses and external training need to be visible and exportable — addressed by the Learning Records tab.
- **Coach individual team members**: Managers use progress data to have informed 1:1 conversations about development — enabled by drill-down from the Course Progress tracker.

### Emotional & Social Dimensions

- **Emotional**: Managers want to feel **in control** and **confident** that nothing is slipping through the cracks. The current 30-day limitation creates anxiety — "what am I missing?"
- **Social**: Managers want to be perceived by leadership as **accountable and proactive** — they need to demonstrate their team is on track. They also want to be seen by their team as **supportive, not punitive** — the tool should help them coach, not just police.

## 3. Goals

1. **Eliminate blind spots**: Surface all overdue and at-risk courses regardless of timeframe, so no learning gap goes unnoticed.
2. **Reduce time-to-insight**: A manager should be able to assess their team's overall learning health within 10 seconds of landing on the page.
3. **Consolidate views**: Replace the need to visit multiple pages or export data manually by unifying Course Progress, Engagement, and Learning Records under one tabbed interface.
4. **Enable evidence-based action**: Provide CSV export of learning records so managers can report to leadership, support audits, or prepare for coaching conversations.
5. **Maintain simplicity**: Despite adding more data, keep the interface scannable and avoid cognitive overload through progressive disclosure and clear information hierarchy.

## 4. Job Stories

### Course Progress

- **When** I open My Team on Monday morning, **I want to** immediately see how many courses are overdue and how many are at risk across my team, **so I can** decide whether I need to intervene this week.
- **When** I notice a team member has multiple overdue courses, **I want to** see all of their overdue items in one view (not just the next 30 days), **so I can** have a complete picture before reaching out to them.
- **When** I need to report on team compliance to my director, **I want to** switch to an "all time" view, **so I can** see the full history of completions and gaps since each person joined the platform.
- **When** I'm scanning the course tracker, **I want to** clearly distinguish between "at risk" (due soon) and "overdue" (past due) courses at a glance, **so I can** prioritize urgent follow-ups over preventive nudges.

### Engagement

- **When** I want to understand which team members are actively engaged with learning (beyond just compliance), **I want to** see leaderboard rankings and performance data, **so I can** recognize top learners and motivate others.

### Learning Records

- **When** a team member tells me they completed external training, **I want to** verify it in the Learning Records tab alongside their platform courses, **so I can** get a holistic view of their development.
- **When** I need to prepare a learning summary for a performance review or audit, **I want to** download a CSV of a team member's full learning records, **so I can** share it with HR or attach it to their review without manual data gathering.

## 5. Requirements

### Functional Requirements

#### 5.1 Tab Structure (My Team Page)

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Redesign My Team page to use a horizontal single-row tab bar with three tabs: **Course Progress**, **Engagement**, **Learning Records** | Must |
| FR-2 | **Course Progress** tab is the default selected tab on page load | Must |
| FR-3 | Tab selection state uses at least two visual indicators (e.g., underline + bold text or underline + color change) | Must |
| FR-4 | Tab labels are concise (1–2 words per label as specified) | Must |
| FR-5 | Each tab maintains its own filter/sort state independently | Should |

#### 5.2 Course Progress Tab

| ID | Requirement | Priority |
|---|---|---|
| FR-6 | Add a **timeframe dropdown** filter with two options: "Next 30 days" and "All time" | Must |
| FR-7 | "All time" shows all courses since each team member registered on the platform | Must |
| FR-8 | Display separate, clearly labeled columns for **"At Risk"** count and **"Overdue"** count per team member | Must |
| FR-9 | **At Risk** is defined as: courses with a due date within the next 30 days that are not yet completed | Must |
| FR-10 | **Overdue** is defined as: courses whose due date has already passed and are not yet completed | Must |
| FR-11 | Remove the existing artificial 30-day limitation that hides overdue courses | Must |
| FR-12 | The default view (on first load) should show the "Next 30 days" timeframe but still surface overdue courses from any period | Should |
| FR-13 | Support sorting by At Risk count, Overdue count, and team member name | Should |
| FR-14 | Provide drill-down from a team member row to view their individual course list with statuses | Should |

#### 5.3 Engagement Tab

| ID | Requirement | Priority |
|---|---|---|
| FR-15 | Display **leaderboard** and **performance metrics** for the team | Must |
| FR-16 | Remove the **Sharing Insights** feature entirely — no replacement needed | Must |
| FR-17 | Retain existing engagement data points (leaderboard rankings, activity scores, etc.) | Must |

#### 5.4 Learning Records Tab

| ID | Requirement | Priority |
|---|---|---|
| FR-18 | Display both **5Mins platform courses** and **externally added training** in the Learning Records tab | Must |
| FR-19 | Use **sub-tabs** to organize platform courses vs. external training | Must |
| FR-20 | Replicate the existing admin-side learning records pattern for the manager/team-member view | Must |
| FR-21 | Provide a **CSV export/download** button for learning records | Must |
| FR-22 | CSV export includes all visible records (respecting active filters/sub-tab selection) | Must |
| FR-23 | Export triggers a single-click download when no configuration is needed, or a brief modal if filename customization is required | Should |
| FR-24 | Show success feedback (e.g., toast notification) after export completes | Should |

#### 5.5 Responsiveness

| ID | Requirement | Priority |
|---|---|---|
| FR-25 | Primary design target is **desktop** | Must |
| FR-26 | Layout must be **responsive** and remain usable on tablet and smaller viewports (no horizontal scroll for core content) | Should |

## 6. Research & Best Practices

### Dashboard Design for Monitoring & Compliance

The Course Progress tab functions as a **monitoring dashboard** — its primary job is to answer "Are we on track?" at a glance. UXPin's dashboard design principles recommend a **top-rail layout** for this type of dashboard, emphasizing F-pattern scanning behavior where the most critical data (overdue and at-risk counts) should be positioned top-left ([UXPin — Effective Dashboard Design Principles for 2025](https://www.uxpin.com/studio/blog/dashboard-design-principles/)). The academic Dashboard Design Patterns resource corroborates this, categorizing monitoring dashboards as a distinct archetype with specific component patterns mapped to supervisory tasks ([Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/)).

Pencil & Paper's comprehensive dashboard UX guide reinforces that monitoring dashboards should **prioritize alerts and warnings** for actionable items — directly supporting the decision to surface overdue and at-risk courses prominently. They recommend using **blue for positive states and orange for negative** as accessible alternatives to red-green, and advocate for progressive disclosure via hover states and drill-downs to manage complexity ([Pencil & Paper — Dashboard Design UX Patterns Best Practices](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)). This is particularly relevant for the drill-down from team-level summary into individual course lists.

### LMS Industry Patterns

Several LMS platforms validate the proposed design direction. **iSpring's LMS Dashboard** highlights overdue courses, expired certifications, failed enrollments, and inactive learners as **separate supervisor alert categories**, and allows drill-down from team-level summaries into individual learner profiles — closely mirroring the proposed At Risk/Overdue column separation with per-member drill-down ([iSpring — LMS Dashboard](https://www.ispring.com/knowledge-hub/lms-dashboard)).

**SafetyCulture's Performance Dashboard** provides a real-world example of a **tab-based training compliance tracker** for managers, using tabs for Overview (summary KPIs), Courses (performance detail), and Groups (team segments). Each tab maintains its own filters and supports show/hide columns — a close analog to the proposed Course Progress tab with its timeframe dropdown ([SafetyCulture — Performance Dashboard Help](https://help.safetyculture.com/en-US/003476/)).

The Educate-me survey of LMS dashboards highlights SkyPrep (attention items, deadline tracking, achievement tracker) and 360Learning (completion rates, participation tracking, per-learner stats), validating the pattern of **combining progress tracking with engagement/leaderboard features** — exactly the Course Progress + Engagement tab combination proposed here ([Educate-me — LMS Dashboard: Top 10 Examples](https://www.educate-me.co/blog/lms-dashboard)).

**ScholarLMS's March 2026 platform update** shows the industry trend toward redesigned admin dashboards that **surface important information more prominently**, confirming that the market expectation for LMS management UIs is moving toward more proactive, at-a-glance information surfacing ([ScholarLMS — Platform Updates March 2026](https://www.scholarlms.com/platform-updates-march-2026/)).

### Tab Design

Nielsen Norman Group's authoritative guidance on tab design provides critical constraints for implementation: always use a **single row of tabs** (multi-row destroys spatial memory); never mix in-page tabs and navigation tabs in one control; the selection indicator must use **at least two methods** (e.g., underline + bold); tabs suffer from **low discoverability** so the default tab's content gets disproportionate attention; and labels should be limited to **1–2 concise words** ([NN/g — Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/)). Given that Course Progress is the highest-priority view, making it the default tab aligns with this research.

### Role-Based UX

RiseApps emphasizes the importance of **role-based views** in LMS design — specifically that the manager experience should be distinct from the learner view — and notes that 88% of users are less likely to use a platform with poor design ([RiseApps — LMS UI/UX Design: 3 Tips That Still Work in 2025](https://riseapps.co/lms-ui-ux-design/)). This reinforces the need for a purpose-built "My Team" experience rather than simply exposing raw admin tools to managers.

### CSV Export Best Practices

The **Carbon Design System's Export Pattern** recommends a **single-click export** when no configuration is needed; a modal with editable filename when naming is required; radio buttons for 2–5 format choices with a sensible default; passive modal or toast notification for success feedback; and inline error display on failure ([Carbon Design System — Export Pattern](https://carbondesignsystem.com/community/patterns/export-pattern/)). Since we're supporting CSV only, the single-click pattern is most appropriate, with a toast notification confirming the download.

Pencil & Paper's dashboard guide explicitly states platforms should **"always allow the data to be exported as raw CSVs"** — validating the Learning Records download requirement ([Pencil & Paper — Dashboard Design UX Patterns Best Practices](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)).

Smashing Magazine's data import/export guidance adds that the **primary action (export) should have the highest visual priority**, with clear progress feedback, and should be tested with real users on critical data flows ([Smashing Magazine — Designing an Attractive and Usable Data Importer](https://www.smashingmagazine.com/2020/12/designing-attractive-usable-data-importer-app/)).

### UX References

| App | Flow / Screen | URL | Pattern Description | Relevance |
|---|---|---|---|---|
| Remote (Web) | Team Members screen | [mobbin.com/explore/screens/d357e22d…](https://mobbin.com/explore/screens/d357e22d-de8b-4fe0-9871-d7b9edb35985) | Data table with search, filters, and "Add new member" CTA | Close analog for the Course Progress tracker table layout — shows scannable team member list with action buttons and filter controls |
| Attio (Web) | Article Detail with status indicators | [mobbin.com/explore/screens/954879aa…](https://mobbin.com/explore/screens/954879aa-46c3-4214-b530-f9098e2b1ae2) | Side navigation, badge, status dot, tree, accordion, table | Demonstrates combining status dots + badges for immediate visual status communication — applicable to at-risk/overdue indicator design |
| Duolingo (Web) | Learning App Dashboard | [mobbin.com/explore/screens/1015e7a5…](https://mobbin.com/explore/screens/1015e7a5-0d19-4433-8151-0291a2e09916) | Dashboard with leaderboard standings, XP progress, learning options | Reference for the Engagement tab — shows how to combine leaderboard with progress indicators in a learning context |
| Duolingo (Web) | Top 10 Bronze League Leaderboard | [mobbin.com/explore/screens/ea68b943…](https://mobbin.com/explore/screens/ea68b943-3de2-46c6-a9f8-339d28e2c781) | Stacked list with avatars, status dots, badges, XP rankings | Direct reference for the Engagement leaderboard — ranked list with avatar, status indicator, and score per user |
| Duolingo (Web) | Unlocked Leaderboard (Bronze League) | [mobbin.com/explore/screens/1b123798…](https://mobbin.com/explore/screens/1b123798-af7b-4f99-997b-095dad24ecda) | Progress indicator, tooltip, stacked list, avatar, coach marks | Shows tiered league system with progress indicators — informs engagement tab's competitive/motivation mechanics |
| incident.io (Web) | Exporting incidents to CSV flow | [mobbin.com/explore/flows/42ef7a42…](https://mobbin.com/explore/flows/42ef7a42-111c-476f-bacc-d5e99600dca7) | 3-step CSV export: list view → customization (checkbox toggles for private data) → download | Direct reference for Learning Records CSV download — demonstrates field selection, privacy controls, and sequential modal progression |
| Duolingo (Android) | Leaderboard Flow | [mobbin.com/explore/flows/9381d8cd…](https://mobbin.com/explore/flows/9381d8cd-e0da-4e3a-a02d-823e56223b48) | 2-screen dynamic leaderboard with ranking updates | Shows flow for viewing progress and comparing rankings — informs Engagement tab leaderboard interaction pattern |

## 7. Plan of Action

### Phase 1: Tab Structure & Course Progress Redesign
- [ ] Audit existing My Team page components — identify reusable elements (tables, filters, status badges) and components to deprecate (Sharing Insights)
- [ ] Design the horizontal single-row tab bar component (Course Progress | Engagement | Learning Records) with proper selection indicators per NN/g guidance
- [ ] Redesign the Course Progress tab layout: add timeframe dropdown ("Next 30 days" / "All time"), add separate "At Risk" and "Overdue" columns
- [ ] Define status badge visual design — use accessible color alternatives (e.g., orange for overdue, amber/yellow for at risk) with redundant cues (icon + color + label)
- [ ] Design the team member row drill-down interaction to view individual course list with statuses
- [ ] Remove the 30-day data limitation from the backend query/API
- [ ] Build and integrate the timeframe dropdown filter logic
- [ ] Implement sortable columns (At Risk count, Overdue count, Name)
- [ ] Desktop-first implementation with responsive breakpoints for tablet

### Phase 2: Engagement Tab
- [ ] Move existing leaderboard and performance metrics into the new Engagement tab
- [ ] Remove Sharing Insights feature and all related UI/code
- [ ] Validate Engagement tab layout against Duolingo leaderboard references for ranked list patterns
- [ ] Ensure Engagement tab filters operate independently from Course Progress tab

### Phase 3: Learning Records Tab & CSV Export
- [ ] Replicate admin-side learning records pattern for the manager view
- [ ] Implement sub-tabs within Learning Records: "Platform Courses" and "External Training"
- [ ] Design and build the CSV export flow — single-click download with toast notification for success feedback (per Carbon Design System pattern)
- [ ] Ensure CSV export respects active sub-tab and filter selection
- [ ] Define CSV columns (course title, type, provider, status, due date, completion date, duration, team member name)
- [ ] Test export with realistic data volumes to validate performance

### Phase 4: QA, Responsiveness & Polish
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge) at desktop and tablet breakpoints
- [ ] Accessibility audit — keyboard navigation through tabs, screen reader labels for status badges, color contrast compliance
- [ ] Verify tab state persistence (deep-linking, browser back/forward behavior)
- [ ] Stakeholder review and sign-off
- [ ] Communicate Sharing Insights removal to any affected users (if applicable, per product team guidance)

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **"All time" queries for large teams degrade performance** | Slow page loads, poor UX for managers with many reports or long-tenured teams | Implement server-side pagination and lazy loading; consider caching team-level aggregate counts; monitor query performance during Phase 1 and set a performance budget (e.g., <2s load) |
| **Tab discoverability is low — users miss Engagement and Learning Records tabs** | Key features go unused; managers continue using workarounds | Make Course Progress the default (highest-value tab); consider onboarding tooltip or coach mark on first visit to highlight new tabs; track tab usage analytics |
| **Removing Sharing Insights upsets existing users** | Negative feedback, support tickets | Confirm with product team whether any stakeholders depend on it; if so, provide advance notice before removal; the Q&A confirms no replacement is needed |
| **CSV export exposes sensitive learning data (PII or performance data)** | Privacy/compliance risk if managers download and share data improperly | Scope CSV export to only the manager's direct reports; include only fields necessary for reporting; consult with legal/compliance on data handling guidelines; consider adding a brief disclaimer in the download flow |
| **Admin-side Learning Records pattern doesn't translate cleanly to manager context** | Rework needed, design delays | Conduct early design review with eng to identify gaps between admin and manager data models; prototype the manager view before full build |
| **Sub-tabs within Learning Records tab creates nested tab confusion** | Violates NN/g guidance on not mixing tab types; users lose spatial orientation | Visually differentiate sub-tabs from primary tabs (e.g., use pill/toggle style for sub-tabs vs. underline for primary tabs); limit to exactly two sub-tabs to keep it simple |
| **Responsive design is deprioritized and breaks on tablet** | Managers using tablets (e.g., in meetings) have a degraded experience | Define minimum responsive breakpoints in Phase 1; test at 768px and 1024px widths during each phase, not just Phase 4 |