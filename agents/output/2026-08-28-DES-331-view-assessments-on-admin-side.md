---
ticket: DES-331
summary: View Assessments on admin side
status: in Design Phase
generated: 2026-08-28T21:20:12.814Z
---



# PRD: View Assessments on Admin Side

## 1. Overview

The assessment reporting surface within the admin course view is due for a ground-up redesign. The current experience — a static table with emoji icons, inconsistent modals, and no summary statistics — has been described as outdated and falls short of the expectations of L&D / People admins who periodically review cohort performance. This ticket replaces that experience with a modern, insight-first reporting interface that treats assessments as a reporting surface rather than a data dump. The redesign introduces AI-generated insights, contextual summary statistics, a dual-pivot view (by assessment / by learner), and a side drawer for sequential detail review — all within the existing Assessments tab rather than a modal.

Grading, commenting, editing, and reassigning are explicitly out of scope (V1 is read-only plus CSV export). Admin scoring for short-text and exercise types is deferred to V2, and the V1 data model deliberately excludes correctness fields for those types so scoring cannot leak into the UI.

## 2. Jobs To Be Done

### Main Job

**When a cohort finishes a course, the L&D admin needs to understand how learners performed across all assessments so they can identify knowledge gaps, report on program effectiveness, and decide whether to intervene.**

### Job Map

| Stage | What the admin does | Where they struggle today |
|-------|-------------------|--------------------------|
| **Define** | Decide which course and cohort to evaluate | No issues — course selection exists |
| **Locate** | Navigate to the Assessments tab | Tab exists but offers no summary; the admin has no signal until they click into each row |
| **Prepare** | Scan for overall performance signals | No summary statistics at all; the Correct % column shows em dashes for 3 of 5 visible types, making scanning unreliable |
| **Confirm** | Drill into a specific assessment to validate a concern | Opens a 720 px modal that is a dead end — no previous/next, so the admin must close and re-open for every assessment |
| **Execute** | Review individual responses, compare across learners | Modal anatomy differs per type (stat cards + pagination for MCQ, nothing for exercise); no "by learner" view exists |
| **Monitor** | Track patterns over time, share with stakeholders | No AI insights, no exportable summary; the only export is a "Download responses" button styled as a primary CTA because the modal template forces it |
| **Resolve** | Take action — adjust content, follow up with learners | No actionable insight layer; the admin must mentally synthesise raw data |

### Related Jobs

- **Report to leadership on L&D program ROI** — the admin needs exportable, digestible summaries, not raw CSVs alone.
- **Identify at-risk learners early** — a "by learner" pivot lets the admin spot individuals who struggled across multiple assessments.
- **Improve course content iteratively** — AI insights that surface where learners struggled inform content revisions.

### Emotional & Social Dimensions

- **Emotional:** The admin wants to feel *confident and in control* — that they have a complete picture of cohort performance without manually assembling it. The current em-dash-riddled table and dead-end modals create anxiety and distrust.
- **Social:** The admin wants to be perceived as *data-driven and thorough* by leadership and course designers. Being able to surface AI-generated insights elevates their role from "person who downloads CSVs" to "learning strategist."

## 3. Goals

1. **Insight-first experience:** An admin should grasp the headline performance story within five seconds of landing on the Assessments tab, without clicking into any individual assessment.
2. **Type-appropriate metrics:** Every assessment type displays a meaningful result metric (percent correct, vote distribution, response/file count) — no em dashes, ever.
3. **Seamless sequential review:** An admin can drill into an assessment and navigate previous/next through the full list without returning to the table.
4. **Dual-pivot analysis:** The admin can switch between "by assessment" and "by learner" views to answer different questions from the same data.
5. **AI-powered synthesis:** A single-click AI Insights card surfaces where learners struggled and what they mastered, with a clear generate → generating → generated lifecycle.
6. **Clean export:** CSV export of all answers is available and discoverable without dominating the UI.
7. **Scalable design:** The interface handles tens of assessments and hundreds of responses gracefully, with search, type filtering, and pagination.
8. **Additive type support:** The shared chrome + type-specific body architecture means a tenth assessment type can be added without a new template.

## 4. Job Stories

### Orientation & Summary

- **When** I open the Assessments tab after a cohort has completed a course, **I want to** see summary statistics (response count vs. enrolment, average score, completion rate) at a glance, **so I can** immediately gauge overall cohort performance without drilling into individual assessments.
- **When** I see the summary stat cards, **I want** each card to show the metric appropriate to the assessment type (percent correct for auto-graded, vote distribution for polls, response count for short text/exercise), **so I can** trust the data and never encounter meaningless placeholders.

### AI Insights

- **When** I need to report on where learners struggled and what they mastered, **I want to** generate an AI-powered insight summary with one click, **so I can** get a synthesised narrative instead of manually reviewing every response.
- **When** the AI insight is generating, **I want to** see progress context (e.g., "Analysing 47 responses…") and skeleton placeholders, **so I can** understand the system is working and estimate how long it will take.
- **When** the AI insight has been generated, **I want to** see the timestamp of generation, **so I can** judge whether it reflects the latest submissions or needs refreshing.

### Detail Review

- **When** I want to review a specific assessment's responses, **I want to** open a side drawer that shows the detail without leaving the table, **so I can** keep the list context visible and reference other assessments.
- **When** I am reviewing an assessment in the drawer, **I want to** navigate to the previous or next assessment using arrows and see my position (e.g., "3 of 12"), **so I can** work through all assessments sequentially without closing and reopening.
- **When** I am reviewing responses in the drawer, **I want to** see learner identity and role alongside each response, **so I can** follow up with specific individuals if needed.

### Pivot & Filter

- **When** I want to understand a specific learner's performance across all assessments, **I want to** switch to a "By learner" view, **so I can** see their complete assessment profile in one place.
- **When** the course has many assessments, **I want to** search by title, filter by type, and paginate, **so I can** quickly find the assessment I care about.

### Export

- **When** I need to share raw response data with a stakeholder or import it into another tool, **I want to** export all answers as a CSV, **so I can** get the data out without screenshots or manual copying.

## 5. Requirements

### Functional Requirements

#### FR-1: Summary Stat Cards
- Display a row of stat cards at the top of the Assessments tab summarising cohort-level performance.
- Minimum cards: total assessments, overall response count vs. enrolment denominator, average score (auto-graded types only), completion rate.
- Each card must show the type-appropriate metric; if a metric is not applicable to a type, that type is excluded from the card's calculation rather than showing an em dash.

#### FR-2: AI Insights Card
- A dedicated card below the stat row with an explicit three-state lifecycle:
  - **Generate:** A "Generate Insights" button when no insight exists or the admin wants to refresh.
  - **Generating:** Skeleton placeholder with contextual message (e.g., "Analysing 47 responses…"). No bare spinner.
  - **Generated:** The insight text with a "Generated at [timestamp]" label.
- Insights should surface: where learners struggled, what they mastered, and any notable patterns.
- The insight must be clearly labelled as AI-generated.

#### FR-3: Assessment List (By Assessment View)
- A filterable, searchable, paginated data table replacing the current table.
- Columns: Title, Type (with design-system-compliant icons, not emoji), Responses (as "n / enrolled"), Result (type-appropriate: % correct, vote distribution, response/file count).
- Search by assessment title.
- Filter by assessment type (multi-select).
- Pagination for lists exceeding a configurable page size.
- Row click opens the side drawer.

#### FR-4: By Learner View
- A toggle/segmented control switches between "By assessment" and "By learner" pivots.
- The By Learner view lists learners with their aggregated performance across all assessments.
- Row click opens a side drawer showing that learner's responses per assessment.

#### FR-5: Side Drawer (Detail View)
- Opens from the right, overlaying the table (overlay variant per the design system's Side Drawer at 720 px).
- Contains:
  - Assessment title and type badge.
  - Type-specific result display (e.g., bar chart for MCQ distribution, list of text responses for short text).
  - Individual responses with learner name and role.
  - Submission timestamps and attempt history (demoted to drawer per stakeholder direction).
- Previous/Next navigation arrows with "n of m" position indicator.
- Keyboard shortcut support (arrow keys) for sequential navigation.
- Close button and click-outside-to-close behaviour.

#### FR-6: CSV Export
- A secondary action (e.g., icon button or dropdown item) on the Assessments tab — not a primary CTA.
- Exports all responses across all assessments for the course in a single CSV.
- Includes: assessment title, type, learner name, learner role, response, result (where applicable).

#### FR-7: Shared Chrome, Type-Specific Bodies
- The side drawer chrome (header, navigation, close, export) is shared across all nine assessment types.
- The body area renders a type-specific component:
  - **Multiple Choice:** Option distribution bar/chart, correct answer highlighted, per-response list.
  - **Match the Pairs:** Pair accuracy summary, per-response correctness.
  - **Sequence:** Sequence accuracy summary, per-response correctness.
  - **Categorise:** Category accuracy summary, per-response correctness.
  - **Fill in the Blanks:** Blank-level accuracy, per-response list.
  - **Short Text:** Response list only (no correctness field in V1).
  - **Exercise (file upload):** File list with download links (no correctness field in V1).
  - **Poll:** Vote distribution chart, per-response list.
  - **Situational Test:** Option distribution, scoring summary, per-response list.
- Adding a tenth type requires only a new body component, no changes to chrome.

#### FR-8: Empty & Edge States
- Zero responses: stat cards show "0 / [enrolled]", AI Insights button is disabled with tooltip "No responses yet."
- Single response: all views functional; AI Insights available but may note limited data.
- No assessments in course: empty state with guidance message.

#### FR-9: No Correctness for Short Text & Exercise
- The UI must not display, imply, or reserve space for a correctness metric on Short Text or Exercise types.
- This aligns with the V1 data model where these types have no correctness field, preventing any accidental scoring leakage before V2.

## 6. Research & Best Practices

### Synthesis

The redesign is grounded in a clear industry consensus: admin reporting surfaces should lead with insight, not raw data. The UXPin dashboard design guide establishes the **five-second rule** — users should grasp the main insight within five seconds — and recommends limiting visible KPIs to 3–5 items to respect working memory limits, deferring secondary metrics via progressive disclosure ([UXPin](https://www.uxpin.com/studio/blog/dashboard-design-principles/)). This directly informs the stat card row: a small number of high-signal cards (response rate, average score, completion) above the table, with detailed breakdowns deferred to the drawer.

The **AI Insights card** draws on multiple precedents. Google Forms now offers a "Summarise with Gemini" button that generates a concise summary of key insights across all responses with one click — directly analogous to our generate → generating → generated lifecycle ([xFanatical](https://xfanatical.com/blog/use-gemini-ai-in-google-forms-to-summarize-responses/)). AufaitUX's enterprise AI patterns emphasise **Explainability Layers** and **Human-Verified vs AI-Generated labeling**, both of which mandate that our AI insight card is clearly marked as AI-generated with a timestamp ([AufaitUX](https://www.aufaitux.com/blog/ai-design-patterns-enterprise-dashboards/)). Eleken's SaaS AI dashboard guide notes that embedded workflow modules (insight → action) cut response time by 42% per Forrester 2025 ([Eleken](https://www.eleken.co/blog-posts/ai-dashboard-design)). GitNexa's SaaS patterns survey confirms the trend: Gartner predicts 60% of SaaS analytics platforms will integrate generative AI interfaces by 2027 ([GitNexa](https://www.gitnexa.com/blogs/saas-dashboard-ux-patterns)).

The decision to **replace modals with a side drawer** is strongly supported by NN/g's data tables research, which explicitly states that modals "cover adjacent records and the user won't be able to reference or copy data from a similar record," favouring non-modal side panels for detail views ([NN/g Data Tables](https://www.nngroup.com/articles/data-tables/)). NN/g's progressive disclosure article reinforces this: the master-detail side panel is itself a form of progressive disclosure, with the table as summary and the panel as detail ([NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)). The UX Planet case study from Grubtech found that replacing modals with layered drawers improved context preservation, concluding that "modals don't scale when depth, flexibility, and memory are required" ([UX Planet](https://uxplanet.org/enhancing-data-input-with-layered-drawer-form-d9883b588cd3)). PatternFly's drawer guidelines confirm the overlay variant (floats over content) as appropriate for primary-detail layouts spanning the height of primary content ([PatternFly](https://www.patternfly.org/components/drawer/design-guidelines/)).

The **previous/next navigation** pattern is well-established. DataTables Editor demonstrates previous/next buttons that save and load sequentially without closing the detail view ([DataTables Editor](https://editor.datatables.net/examples/api/backNext.html)). Oracle Sales Cloud implements next/previous arrows with a "list name" return link when drilling into list items ([Oracle](https://docs.oracle.com/en/cloud/saas/sales/fadsu/navigate-from-one-record-to-the-next-as-you-work-a-list.html)). The "n of m" indicator is critical for orientation.

The **by assessment vs. by learner pivot** is standard in LMS assessment reporting. Educate-me's LMS reporting guide identifies this dual pivot as standard across Blackboard, LearnDash, and Instancy, alongside key metrics: completion rate, pass/fail ratio, average score, and question-level discrimination index ([Educate-me](https://www.educate-me.co/blog/lms-reporting)). InsightsRoom demonstrates the market shift from raw data tables to insight-first reporting with auto-generated dashboards and interactive filtering ([InsightsRoom](https://insightsroom.ai/docs/industry-guides/google-forms-alternative-for-analytics-choose-the-right-survey-platform-for-your-data-needs-2026/)). The admin dashboard best practices guide on Medium reinforces that best-in-class dashboards prioritize clarity, conciseness (5–7 core KPIs), and contextual insights that tell a story ([Medium](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)).

SaaSFrame catalogues 62 side panel examples from SaaS products, confirming the pattern maximises screen real estate by keeping users in context ([SaaSFrame](https://www.saasframe.io/patterns/side-panel)). The competitive landscape, including Sana Labs and WorkRamp, confirms that AI-driven analytics dashboards are table stakes for modern L&D platforms ([Teachfloor](https://www.teachfloor.com/blog/best-sana-labs-alternatives)).

### UX References

| App | Flow / Screen | URL | Pattern Description | Relevance |
|-----|---------------|-----|--------------------|-----------| 
| Deel | Admin dashboard with stat cards and data table | [View](https://mobbin.com/screens/9f5af254-f966-4810-adbb-c428854523e3) | Summary stat cards above a filterable data table | Direct precedent for the stat cards + assessment list layout on the Assessments tab |
| Vanta | Dashboard with summary statistics and table | [View](https://mobbin.com/screens/d33c50cb-a1db-4dbd-a420-49bbf678ba3d) | Compliance/security dashboard with stats and list | Mentioned in the ticket's competitor analysis; validates the stat-card-above-table pattern |
| Uxcel | Assessment/learning dashboard | [View](https://mobbin.com/screens/77c59f96-3d72-4179-90e3-7d7ead5acd11) | Learning platform admin with results display | LMS-adjacent product showing assessment-like reporting surfaces |
| Maze | Side drawer detail panel | [View](https://mobbin.com/screens/b2fd43ba-0660-417d-9166-4321a194dd94) | Drawer for research/test result details | Mentioned in the ticket's competitor analysis; validates drawer-based detail for research/test results |
| Workable | Side drawer for record detail | [View](https://mobbin.com/screens/32528886-f7f1-4e0c-96ad-ccf5e05bd78f) | HR/admin side panel for candidate/record details | Closest persona match — HR admin reviewing records via side drawer |
| Asana | Detail panel alongside list | [View](https://mobbin.com/screens/db414ef9-2379-47fa-9399-96581dfad938) | Master-detail with persistent list context | Well-known side panel pattern preserving list context during detail review |
| Fibery | Side panel for list item detail | [View](https://mobbin.com/screens/a0f4b2f8-30ec-48e4-ac84-ddf21f4d52c2) | Inline detail panel with main view visible | Shows how a detail panel can push content rather than overlay |
| Sprig | AI insights in analytics dashboard | [View](https://mobbin.com/screens/831d6ee6-0c98-434b-8042-dfc2ce572b3e) | AI-generated analysis cards within reporting UI | Direct precedent for the AI Insights card with generate/display lifecycle |
| Dovetail | AI insights in research analytics | [View](https://mobbin.com/screens/885e428e-0081-4967-966e-b35e00aa68aa) | AI-powered insight summaries for qualitative data | Shows AI analysis of open-ended responses — analogous to short-text/exercise assessment types |
| Amplitude | Analytics dashboard with generated insights | [View](https://mobbin.com/screens/e1856900-5667-4ff3-8e7e-1526f649ad49) | AI-assisted analytics with data visualisations | Enterprise analytics showing how AI insights sit alongside charts and tables |
| Productboard | AI-generated insights in reporting | [View](https://mobbin.com/screens/72b7ed97-ea84-4cef-aa1d-6d33696d2571) | AI insights card within product analytics view | Shows the generate → generated lifecycle for AI analysis |
| Hotjar | Tab/view switcher in analytics | [View](https://mobbin.com/screens/5582db23-7406-46a2-baa7-cd6921c0b071) | Segmented control switching between data views | Direct precedent for the "By assessment" vs "By learner" switcher |
| Google Analytics | Tab navigation between data views | [View](https://mobbin.com/screens/68fdabfc-0330-44ba-a993-2cdd3e103181) | Tab bar toggling between analytics perspectives | Standard pattern for switching data pivots in a reporting interface |
| Gamma | View switcher in reporting/analytics | [View](https://mobbin.com/screens/162ab0c8-8771-485e-81f9-af633780c41b) | Toggle between presentation views of same data | Shows how to switch between item-centric vs audience-centric views |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Post-video analytics (Loom) | UX Bite | [View](https://builtformars.com/ux-bites/loom) | Loom surfaces motivating analytics in visually distinct card-based modules — presenting derived insights in card form, not just raw data, makes analytics feel actionable and engaging. | Direct pattern for the AI Insights card: surface derived insights (where learners struggled, what they mastered) as standalone cards above the data table, not buried in it. |
| Global summary settings (Zillow) | UX Bite | [View](https://builtformars.com/ux-bites/global-summary-settings) | Zillow lets users customise which summary facts appear on property cards, making browsing feel more efficient and specific to their needs. | Applicable to the stat card row: let the type-appropriate metric surface contextually rather than forcing a single metric template that results in em-dash placeholders for incompatible types. |
| The UX Psychology of Waiting (and Loading) | Cheatsheet | [View](https://builtformars.com/cheatsheets/loading) | Effective loading states add variability — display rotating tips, relevant context, or preview skeletons rather than bare spinners. Meaningful loading content reduces perceived wait time. | Directly applicable to the AI Insights card's generate → generating → generated lifecycle: show skeleton cards, progress context ("Analysing 47 responses…"), and avoid jarring layout shifts when insights arrive. |
| BFM Synthesised Advice | Analysis | N/A | Three key recommendations: (1) Use modular insight cards above data tables, styled distinctly from raw data — inspired by Loom; (2) For AI generation loading states, show skeleton placeholders with contextual messages rather than spinners, and display "n of m" position plus keyboard nav in drawers; (3) Allow users to customise which summary stats surface, inspired by Zillow. | Synthesised guidance covering all three core UX challenges: AI insight presentation, loading lifecycle, and drawer navigation. |

## 7. Plan of Action

### Phase 1: Foundation — Stat Cards & Modernised Table
- [ ] Audit the existing Assessments tab component tree and data-fetching layer; document current API contracts.
- [ ] Design and implement summary stat cards (total assessments, response rate vs. enrolment, average score, completion rate) with type-aware metric logic (no em dashes).
- [ ] Replace emoji type icons with design-system-compliant icons across all nine types.
- [ ] Implement search-by-title, multi-select type filter, and pagination on the assessment list table.
- [ ] Ensure the Correct % column is replaced with a "Result" column showing type-appropriate metrics.
- [ ] Implement empty and edge states (zero responses, no assessments).

### Phase 2: Side Drawer & Sequential Navigation
- [ ] Build the shared drawer chrome: header (title + type badge), close button, previous/next arrows with "n of m" indicator.
- [ ] Implement keyboard navigation (arrow keys for previous/next, Escape to close).
- [ ] Build type-specific body components for all nine assessment types with individual response lists (learner name + role).
- [ ] Integrate submission timestamps and attempt history within the drawer.
- [ ] Ensure click-outside-to-close and maintain list scroll position on drawer open/close.
- [ ] Ensure Short Text and Exercise body components render no correctness metric per FR-9.

### Phase 3: By Learner View & Pivot Switcher
- [ ] Design and implement the segmented control ("By assessment" / "By learner") at the top of the tab.
- [ ] Build the By Learner list view with aggregated per-learner performance.
- [ ] Wire the By Learner row click to open the drawer with that learner's assessment-by-assessment responses.
- [ ] Ensure search, filter, and pagination work in both pivot views.

### Phase 4: AI Insights Card
- [ ] Design the AI Insights card with three-state lifecycle UI: generate button → skeleton with contextual message → generated insight with timestamp.
- [ ] Build the backend endpoint to generate insights from assessment responses (integration with AI service).
- [ ] Implement "AI-generated" labelling on the card per enterprise AI UX patterns.
- [ ] Handle edge cases: disable generation when zero responses; show "limited data" caveat for very few responses.
- [ ] Implement refresh/regenerate capability.

### Phase 5: CSV Export & Polish
- [ ] Implement CSV export as a secondary action (icon button or toolbar dropdown) — not a primary CTA.
- [ ] Include all required fields: assessment title, type, learner name, role, response, result.
- [ ] Conduct cross-browser and responsive testing.
- [ ] Conduct accessibility audit (keyboard navigation, screen reader support, ARIA labels on drawer and stat cards).
- [ ] Conduct usability testing with L&D admins reviewing a course with 15+ assessments and 50+ learners.

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **AI insight quality is poor or misleading for small cohorts** | Admin loses trust in the feature; reputational risk | Disable generation below a minimum response threshold; add "limited data" caveat for small samples; clearly label as AI-generated with timestamp |
| **Nine type-specific body components create high implementation cost** | Phase 2 timeline overruns | Prioritise the four most-used types first (Multiple Choice, Short Text, Exercise, Poll); ship remaining five in a fast-follow; shared chrome ensures consistency regardless of body readiness |
| **Side drawer at 720 px may crowd the table on smaller screens** | Poor experience on laptops with ≤ 1280 px viewports | Use overlay (not inline push) variant so the table is not compressed; test at 1280 px breakpoint; consider responsive collapse to near-full-width drawer on small screens |
| **"By learner" view requires a new API aggregation endpoint** | Backend dependency delays frontend work | Stub the frontend with mock data behind a feature flag; define the API contract in Phase 1 so backend can work in parallel |
| **Previous/next navigation desyncs if the underlying list changes (new responses arrive)** | Admin sees stale data or skips an item | Snapshot the list order when the drawer opens; show a subtle "List updated — refresh?" indicator if the underlying data changes |
| **CSV export for large courses (hundreds of learners × tens of assessments) is slow** | Admin experiences timeout or assumes failure | Generate CSV asynchronously; show progress indicator; consider server-side generation with a download link delivered via notification |
| **V2 scoring for Short Text / Exercise requires data model changes** | V1 architecture doesn't accommodate V2 | V1 deliberately omits correctness fields for these types (unrepresentable, not hidden); V2 migration adds the field, and the body component conditionally renders scoring UI — no V1 refactoring needed |
| **Design system lacks a documented full-page or large-panel component** | Inconsistency with existing patterns | Use the documented Side Drawer (720 px) from overlays.md; avoid inventing undocumented components; propose a design system contribution if a wider variant is needed later |