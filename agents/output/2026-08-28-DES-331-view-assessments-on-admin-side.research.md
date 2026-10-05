---
ticket: DES-331
summary: View Assessments on admin side
status: in Design Phase
generated: 2026-08-28T21:20:12.814Z
---

## Research Dossier

### Web Findings

- **[Admin Dashboard UI/UX: Best Practices for 2025 (Medium)](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)** — Best-in-class admin dashboards prioritize clarity (communicate key information without visual noise), conciseness (5–7 core KPIs), and contextual insights that tell a story rather than dump raw numbers. Customizability is essential — no two admin users should see the same default view.

- **[Dashboard Design Principles: The Definitive Guide (UXPin)](https://www.uxpin.com/studio/blog/dashboard-design-principles/)** — The 5-second rule: users should understand the main insight within five seconds. Cognitive load management is critical since human working memory holds only 3–5 items; progressive disclosure should defer secondary metrics to drill-down views.

- **[AI Design Patterns for Enterprise Dashboards (AufaitUX)](https://www.aufaitux.com/blog/ai-design-patterns-enterprise-dashboards/)** — AI-powered dashboards should include space for dynamic insights that update in real time, with automation frameworks that trigger reports contextually. Key UX patterns include Predictive Assistance, Explainability Layers, and Human-Verified vs AI-Generated labeling.

- **[AI Dashboard Design: A Guide for SaaS Teams (Eleken)](https://www.eleken.co/blog-posts/ai-dashboard-design)** — AI enables predictive analytics (forecasting trends) and prescriptive analytics (recommending actions). Dashboard design must include space for dynamic insights, recommendations, and alert systems. Embedded workflow modules cut response time from insight to action by 42% (Forrester 2025).

- **[SaaS Dashboard UX Patterns Guide (GitNexa)](https://www.gitnexa.com/blogs/saas-dashboard-ux-patterns)** — Emerging trends include AI-assisted dashboards with natural language queries, predictive insights replacing static reports, and adaptive dashboards that change by user behavior. Gartner predicts 60% of SaaS analytics platforms will integrate generative AI interfaces by 2027.

- **[Data Tables: Four Major User Tasks (NN/g)](https://www.nngroup.com/articles/data-tables/)** — Tables must support four tasks: finding records, comparing data, viewing/editing single records, and taking actions. For detail views, NN/g strongly favors non-modal side panels over modals because modals "cover adjacent records and the user won't be able to reference or copy data from a similar record." Batch actions scale better than inline single-record actions.

- **[Progressive Disclosure (NN/g)](https://www.nngroup.com/articles/progressive-disclosure/)** — Progressive disclosure improves learnability, efficiency, and error rate by revealing secondary options only on request. The master-detail side panel is itself a form of progressive disclosure: the table shows the summary, and the panel progressively reveals full details on selection.

- **[SaaS Side Panel UI Design Examples (SaaSFrame)](https://www.saasframe.io/patterns/side-panel)** — 62 side panel examples from SaaS products including Zeda.io (customer/feedback details), Clay (contact details), Intercom (content/article settings), and Narrative BI (analytics details). The pattern maximizes screen real estate by keeping users in context.

- **[PatternFly Drawer Design Guidelines](https://www.patternfly.org/components/drawer/design-guidelines/)** — Drawers come in overlay (floats over content) and inline (pushes content aside) variants. Commonly used in primary-detail layouts where the drawer spans the height of the primary content. Supports resizable splitters and defaults to right-side placement.

- **[Previous/Next Editing Buttons (DataTables)](https://editor.datatables.net/examples/api/backNext.html)** — DataTables Editor demonstrates previous/next buttons that save the current record and immediately load the next one, enabling sequential review without closing the detail view — exactly the "n of m" pattern needed for assessment drill-through.

- **[Navigate to Next/Previous Record (Oracle Sales Cloud)](https://docs.oracle.com/en/cloud/saas/sales/fadsu/navigate-from-one-record-to-the-next-as-you-work-a-list.html)** — Oracle implements next/previous arrows when drilling into a list item, with a "list name" link to return to the master view. This pattern lets admins work through all items sequentially.

- **[Use Gemini AI in Google Forms to Summarize Responses (xFanatical)](https://xfanatical.com/blog/use-gemini-ai-in-google-forms-to-summarize-responses/)** — Google Forms added a "Summarize with Gemini" button at the top of the Responses tab. One click generates a concise summary of key insights across all responses. For HR teams, this provides a snapshot of engagement survey morale and suggestions for timely action — directly analogous to the AI Insights card in this ticket.

- **[Google Forms Alternative for Analytics (InsightsRoom)](https://insightsroom.ai/docs/industry-guides/google-forms-alternative-for-analytics-choose-the-right-survey-platform-for-your-data-needs-2026/)** — InsightsRoom offers auto-generated dashboards with interactive filtering, instant cross-tabulation without pivot tables, and stakeholder-specific dashboard versions — illustrating the market shift from raw data tables to insight-first reporting surfaces.

- **[LMS Reporting: 11 Reports and 6 Metrics to Track (Educate-me)](https://www.educate-me.co/blog/lms-reporting)** — Key LMS assessment metrics include completion rate, pass/fail ratio, average score, time-to-complete, and question-level discrimination index. The "by learner" vs "by question" pivot is standard in assessment reporting across Blackboard, LearnDash, and Instancy.

- **[Sana Labs Alternatives & Competitors (Teachfloor)](https://www.teachfloor.com/blog/best-sana-labs-alternatives)** — Sana Labs excels at AI-driven personalization and admin dashboards but scores below top rivals on custom reporting depth. WorkRamp pairs generative AI for content creation with strong analytics dashboards. Both are direct competitors mentioned in the ticket's design session.

- **[Layered Drawer Navigation (UX Planet)](https://uxplanet.org/enhancing-data-input-with-layered-drawer-form-d9883b588cd3)** — At Grubtech, a modal-based structure made complex nested flows "disjointed and frustrating." Replacing modals with layered drawers improved context preservation. Key lesson: modals don't scale when depth, flexibility, and memory are required — directly supporting this ticket's recommendation against modals.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Deel | Admin dashboard with stat cards and data table | [View](https://mobbin.com/screens/9f5af254-f966-4810-adbb-c428854523e3) | Summary stat cards above a filterable data table | Direct precedent for the stat cards + assessment list layout |
| Vanta | Dashboard with summary statistics and table | [View](https://mobbin.com/screens/d33c50cb-a1db-4dbd-a420-49bbf678ba3d) | Compliance/security dashboard with stats and list | Mentioned in the ticket's competitor analysis; shows stat-card-above-table pattern |
| Uxcel | Assessment/learning dashboard | [View](https://mobbin.com/screens/77c59f96-3d72-4179-90e3-7d7ead5acd11) | Learning platform admin with results display | LMS-adjacent product showing assessment-like reporting |
| Maze | Side drawer detail panel | [View](https://mobbin.com/screens/b2fd43ba-0660-417d-9166-4321a194dd94) | Drawer for research/test result details | Mentioned in the ticket's competitor analysis; shows drawer-based detail view for UX research results |
| Workable | Side drawer for record detail | [View](https://mobbin.com/screens/32528886-f7f1-4e0c-96ad-ccf5e05bd78f) | HR/admin side panel for candidate/record details | HR admin reviewing records via side drawer — closest persona match (L&D admin) |
| Asana | Detail panel alongside list | [View](https://mobbin.com/screens/db414ef9-2379-47fa-9399-96581dfad938) | Master-detail with persistent list context | Well-known side panel pattern preserving list context during detail review |
| Fibery | Side panel for list item detail | [View](https://mobbin.com/screens/a0f4b2f8-30ec-48e4-ac84-ddf21f4d52c2) | Inline detail panel with main view visible | Shows how a detail panel can push content rather than overlay |
| Sprig | AI insights in analytics dashboard | [View](https://mobbin.com/screens/831d6ee6-0c98-434b-8042-dfc2ce572b3e) | AI-generated analysis cards within reporting UI | Direct precedent for AI Insights card with generate/display lifecycle |
| Dovetail | AI insights in research analytics | [View](https://mobbin.com/screens/885e428e-0081-4967-966e-b35e00aa68aa) | AI-powered insight summaries for qualitative data | Shows AI analysis of open-ended responses — analogous to short-text/exercise assessment types |
| Amplitude | Analytics dashboard with generated insights | [View](https://mobbin.com/screens/e1856900-5667-4ff3-8e7e-1526f649ad49) | AI-assisted analytics with data visualizations | Enterprise analytics showing how AI insights sit alongside charts and tables |
| Productboard | AI-generated insights in reporting | [View](https://mobbin.com/screens/72b7ed97-ea84-4cef-aa1d-6d33696d2571) | AI insights card within product analytics view | Shows generate → generated lifecycle for AI analysis |
| Hotjar | Tab/view switcher in analytics | [View](https://mobbin.com/screens/5582db23-7406-46a2-baa7-cd6921c0b071) | Segmented control switching between data views | Precedent for the "By assessment" vs "By learner" switcher |
| Google Analytics | Tab navigation between data views | [View](https://mobbin.com/screens/68fdabfc-0330-44ba-a993-2cdd3e103181) | Tab bar toggling between analytics perspectives | Standard pattern for switching data pivots in a reporting interface |
| Gamma | View switcher in reporting/analytics | [View](https://mobbin.com/screens/162ab0c8-8771-485e-81f9-af633780c41b) | Toggle between presentation views of same data | Shows how to switch between item-centric vs audience-centric views |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Post-video analytics (Loom) | UX Bite | [View](https://builtformars.com/ux-bites/loom) | Loom surfaces motivating analytics in visually distinct card-based modules (e.g. "Your video helped 11 people stay in sync, saving 3 hours"). Presenting derived insights in card form — not just raw data — makes analytics feel actionable and engaging. | Direct pattern for the AI Insights card: surface derived insights (where learners struggled, what they mastered) as standalone cards above the data table, not buried in it. |
| Global summary settings (Zillow) | UX Bite | [View](https://builtformars.com/ux-bites/global-summary-settings) | Zillow lets users customize which summary facts appear on property cards, making browsing feel more efficient and specific to their needs. | Applicable to the stat card row: let the type-appropriate metric (% correct, vote distribution, response count) surface contextually rather than forcing a single metric template that results in em-dash placeholders for incompatible types. |
| The UX Psychology of Waiting (and Loading) | Cheatsheet | [View](https://builtformars.com/cheatsheets/loading) | Effective loading states add variability — display rotating tips, relevant context, or preview skeletons rather than bare spinners. Meaningful loading content reduces perceived wait time and keeps users engaged. | Directly applicable to the AI Insights card's generate → generating → generated lifecycle: show skeleton cards, progress context ("Analyzing 47 responses…"), and avoid jarring layout shifts when insights arrive. |
| BFM Synthesized Advice (via bfm_analyze_lessons) | Analysis | N/A | Three key recommendations: (1) Use modular insight cards above data tables, styled distinctly from raw data — inspired by Loom's post-video analytics; (2) For AI generation loading states, show skeleton placeholders with contextual messages ("Analyzing responses…") rather than spinners, and display "n of m" position plus keyboard nav in drawers; (3) Allow users to customize which summary stats surface, inspired by Zillow's configurable summary cards. | Synthesized guidance covering all three core UX challenges in this ticket: AI insight presentation, loading lifecycle, and drawer navigation. |

### Confidence Check

- `web_searches_performed`: 6
- `mobbin_searches_performed`: 4
- `bfm_lookups_performed`: 4 (2 × bfm_find_content + 1 × bfm_find_content on loading states + 1 × bfm_analyze_lessons)
- `authoritative_sources_fetched`: 4 (NN/g Data Tables, PatternFly Drawer, SaaSFrame Side Panels, DataTables Editor)
- `all_urls_verified`: yes