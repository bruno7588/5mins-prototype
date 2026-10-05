---
ticket: DES-318
summary: Audit log under Account & Settings
status: in Design Phase
generated: 2026-07-09T21:00:20.207Z
---

## Research Dossier

### Web Findings

- **[Audit Logging Best Practices, Components & Challenges (Sonar)](https://www.sonarsource.com/resources/library/audit-logging/)** — Audit logs must answer "who did what, when, and from where" and be designed as immutable, lightweight summaries rather than full data dumps. Recommends capturing deltas only (log when a value actually changes) and keeping audit tables separate from business tables to preserve query performance.

- **[Martin Fowler — Audit Log Pattern](https://martinfowler.com/eaaDev/AuditLog.html)** — The classic pattern guidance: "The glory of Audit Log is its simplicity." An append-only log of changes works best when temporal querying is loosely coupled from day-to-day operations. The simpler the structure, the more extensible it is when new event types are added later.

- **[Comprehensive Research: Audit Log Paradigms & Design Patterns (DEV Community)](https://dev.to/akkaraponph/comprehensive-research-audit-log-paradigms-gopostgresqlgorm-design-patterns-1jmm)** — Covers tenant-isolated audit tables, customer-accessible audit UIs with CSV/JSON export, and event-sourced incident aggregates. Before/after values should be displayed as side-by-side field-level comparisons, not entire object dumps. Recommends per-tenant schemas and role-based audit log access.

- **[How to Add Audit Trail to SaaS Product (Velt, May 2026)](https://velt.dev/blog/how-to-add-audit-trail-to-saas-product)** — SaaS audit trails must capture user identity with role context, UTC timestamps with millisecond precision, and before/after state comparisons. Supports multi-dimensional filtering (by document, user, time range, action type). CSV/JSON export should be prominent for compliance workflows. Recommends configurable debounce timing for high-frequency events to prevent log table bloat.

- **[Audit Trail UX Pattern (AI UX Playground)](https://aiuxplayground.com/pattern/audit-trail/)** — Defines the audit trail as a table-based layout showing action types (create/update/delete), actor identification, timestamps, and action descriptions. Users should be able to search logs, filter by date or action type, and export trails. Related trust patterns include confidence scores and citations.

- **[Data Table Design UX Patterns & Best Practices (Pencil & Paper)](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables)** — Left-align text columns, right-align numeric values. Line divisions work better than zebra stripes in interactive contexts because zebra stripes create confusion when layered with hover, disabled, and selected states. Reveal actions on row hover rather than cluttering the default view. Sidebar panels or expandable rows are best for showing row details. Sticky headers and state preservation across sessions are essential.

- **[Filter UX Design Patterns & Best Practices (Pencil & Paper)](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering)** — In enterprise software with many filters, get the default state right so the main use cases are reflected without requiring configuration. Allow users to save frequently-used filter combinations. Add search within filter panels for large option sets.

- **[20 Filter UI Examples for SaaS (Arounda)](https://arounda.agency/blog/filter-ui-examples)** — Chip/tag filters provide immediate visual feedback for multi-select scenarios. Auto-apply filters save time in admin workflows; manual-apply buttons suit complex dashboards where accidental bulk changes must be prevented. Keep active filter selections visible and provide a "clear all" mechanism.

- **[19+ Filter UI Examples for SaaS (Eleken)](https://www.eleken.co/blog-posts/filter-ux-and-ui-for-saas)** — Collapsible advanced filter panels allow multiple conditions without cluttering primary interfaces. Nested/multi-level filters where users select a property then choose values work well for structured data like settings and event types.

- **[What Is Progressive Disclosure? (UXPin, 2026)](https://www.uxpin.com/studio/blog/what-is-progressive-disclosure/)** — Progressive enabling (distinct from progressive disclosure) manages feature access by keeping controls disabled until conditions are met. Common accessibility failure: treating tooltips as the sole mechanism for critical information — provide a persistent, discoverable trigger alongside hover interactions. A 2006 study showed interfaces deferring advanced features achieved 30–50% faster initial task completion. Missing affordances cause "capability invisibility" — show "More filters" links, chevrons, or tooltips to signal hidden capabilities.

- **[The Power of Progressive Disclosure in SaaS UX Design (Lollypop)](https://lollypop.design/blog/2025/may/progressive-disclosure/)** — Progressive enabling unlocks functionality incrementally; disabled controls with explanatory tooltips signal future availability without creating confusion. The key is making the disabled state visually distinct but not invisible.

- **[Designing Empty States in Complex Applications (NN/g)](https://www.nngroup.com/articles/empty-state-interface-design/)** — Three core principles: (1) Communicate system status explicitly ("No records to display" rather than blank space), (2) Provide learning cues about what the feature does and what data will appear, (3) Provide direct pathways for action (e.g., "Create your first…" buttons). Avoid misleading messages that claim "no records exist" while content loads — this damages trust.

- **[Pagination UI Design: Offset vs Keyset vs Infinite Scroll (Setproduct)](https://www.setproduct.com/blog/pagination-ui-design)** — Traditional page-number pagination works best for data tables where users need precise navigation, auditing, and comparison tasks. Rows-per-page selectors (10/25/50) give users density control. Keyset pagination avoids stale page numbers in real-time log scenarios but is harder for users to mentally model.

- **[Docebo vs Cornerstone vs TalentLMS — LMS Audit Capabilities](https://www.schoox.com/blog/docebo-vs-cornerstone-which-lms-is-right-for-your-business-2026/)** — Cornerstone has the deepest audit log capabilities refined over 20+ years with version control and multi-jurisdictional tracking, but its admin UI is "consistently described as cumbersome and complex." Docebo offers a modern audit trail with AI-driven insights. TalentLMS has a known limitation where course retakes overwrite history. The lesson: audit depth without usable UI undermines the feature.

- **[LMS Features for Tracking Training Completion & Compliance (Pifini)](https://pifini.ai/feeds/blog/lms-tracking-completion-audit-readiness)** — Compliance-focused LMS platforms require time-stamped grade modifications, detailed change logs tracking original values and modifications, and automated notifications of changes. Data export and reporting for compliance reviews is a baseline expectation.

- **[Design-Pattern Guidelines Study Guide (NN/g)](https://www.nngroup.com/articles/design-pattern-guidelines/)** — Usability guidelines depend on human behavior (which changes slowly), not technology specifics. Covers tooltips, modals, tabs, accordions, and progress indicators as foundational patterns. The 10 Usability Heuristics — especially "Visibility of System Status" — are directly applicable to audit log design.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|---------------|-----|---------|-----------|
| Cloudflare | Audit log table with filters | [View](https://mobbin.com/screens/d63c3f57-bf36-47cd-92db-15be7fd24924) | Admin audit log with filterable event table, actor column, timestamp, and action details | Direct pattern match — enterprise admin audit log with filter bar and paginated table |
| 1Password | Activity log / audit trail | [View](https://mobbin.com/screens/84dbef44-916b-4322-956f-154845c224a7) | Security-oriented activity log showing who did what and when | Shows actor + action + timestamp pattern in a security-sensitive admin context |
| Gorgias | Activity/change log in admin | [View](https://mobbin.com/screens/44a16fee-609a-40a5-afa0-f901dcacdfa8) | Admin activity log with event details and filtering | SaaS admin change log with structured event rows |
| Dropbox | Admin activity/audit view | [View](https://mobbin.com/screens/ca4bb240-9d71-47cc-9a5d-2d5af1b28b9d) | Activity log showing user actions with timestamps | Shows how a mature product structures admin activity monitoring |
| Front | Admin audit/activity log | [View](https://mobbin.com/screens/0c2efddc-d2d9-4a17-b589-34523d08e1d8) | Change log with actor, action, and timestamp columns | Compact admin log layout with clear row structure |
| Confluence | Page history / change log | [View](https://mobbin.com/screens/cc682da6-c0ab-4bfc-bbc6-9fbb17f4a01b) | Version history showing who changed what and when | Relevant as a "settings history" entry point pattern — shows per-entity change history |
| Retool | Settings change history with values | [View](https://mobbin.com/screens/074723f4-050c-4fcb-ba40-363c9956da8a) | Change history showing previous/new values with actor and timestamp | Closest match to the before/after value display requirement |
| Discord | Server audit log | [View](https://mobbin.com/screens/335d4d28-4d0f-48b8-bdda-43386205bfb0) | Audit log showing setting changes with old/new values and actor | Shows how a platform with many settings displays granular change history |
| Better Stack | Activity/change log | [View](https://mobbin.com/screens/d074d1a8-4a46-4ff4-9e76-314fff47f2e8) | Structured change log with timestamps and actors | Clean, modern audit log layout |
| Linear | Empty state in admin settings | [View](https://mobbin.com/screens/553740e6-c999-4f1e-8e72-b034cc68307e) | Empty state with illustration and guidance text | Reference for the "no changes recorded yet" empty state |
| Shopify | Empty state in admin | [View](https://mobbin.com/screens/ae6f4160-b64b-4b06-920f-b0f49b87d1e8) | Admin empty state with clear messaging and action pathway | Shows how to communicate "nothing here yet" in an admin context |
| Workable | Empty state in settings/admin | [View](https://mobbin.com/screens/29a3eac8-be4b-42e5-a33c-30237cb0590b) | Empty state with illustration and guidance | Alternative empty state pattern for admin features |
| Render | Filter bar with dropdown filters in admin | [View](https://mobbin.com/screens/b53cfe4b-f4ec-446d-82d3-a39b5efab40d) | Admin filter bar with multiple filter dropdowns | Reference for filter bar layout with mixed active/inactive filters |
| Hotjar | Filter bar in admin panel | [View](https://mobbin.com/screens/6805388b-0117-499e-918a-1324212bad66) | Admin filter bar with structured filter controls | Shows filter bar visual hierarchy in a SaaS admin panel |
| Linear | Filter bar with active filters | [View](https://mobbin.com/screens/90b0ca17-b70a-425c-b28b-ce934231b2b9) | Active filter chips/tags in a filter bar | Reference for how active filters display as chips alongside inactive filter options |
| Reddit | Tab navigation with overflow | [View](https://mobbin.com/screens/793897f5-c814-463e-9dab-0476f54937bd) | Horizontal scrolling tab bar with overflow handling | Reference for tab-bar overflow pattern needed when Audit log is added |
| Ghost | Tab bar in admin settings | [View](https://mobbin.com/screens/11d2b190-c38e-4407-b2a7-a14ff919e1b0) | Settings tabs with multiple sections | Shows admin settings tab navigation pattern |
| HubSpot | Tab navigation in settings | [View](https://mobbin.com/screens/9808b928-3000-4bb1-b001-8f4b9f5793b8) | Settings tab bar in a large admin panel | Reference for how a product with many settings tabs handles navigation |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Building a POS Store | Case study | [View](https://builtformars.com/case-studies/building-a-store) | Square's empty customers page shows that totally empty screens with minimal affordances cause users to hunt for actions (clicking the "three dots" icon). The risk of a poor empty state isn't just user frustration — it's building the wrong thing based on misleading behavioral data (e.g., heavy search usage driven by poor table UX, not actual user preference). | Directly relevant to the audit log's empty state: the "no changes recorded yet" screen must clearly communicate what will appear and not leave admins guessing. |
| Grok — Onboarding AI Features | Case study | [View](https://builtformars.com/case-studies/grok) | After a user completes their first action and the empty state transitions to a populated list, the onboarding shouldn't stop. No attempt to encourage further discovery means the feature flatlines after initial use. | Relevant to the transition from empty → populated audit log: once changes start appearing, consider guiding admins toward the filter bar and "Settings history" entry point. |
| Revolut's Progressive Onboarding | UX Bite | [View](https://builtformars.com/ux-bites/revoluts-progressive-onboarding) | Revolut uses reactive tooltips after destructive actions (e.g., deleting a card) to reassure users that mistakes are reversible. This builds confidence to experiment with features. The pattern of contextual, post-action tooltips is more effective than upfront onboarding. | Applicable to the "Coming soon" tooltip on disabled filters — reactive, contextual disclosure is more trustworthy than decorative labels. Also relevant to the "Settings history" entry point tooltip. |
| Fuzzy Context | UX Glossary | [View](https://builtformars.com/ux-glossary/fuzzy-context) | "A little context can create more ambiguity" — the relationship between context provided and questions answered is non-linear. Providing partial context can actually increase confusion rather than reduce it. | Directly relevant to the "Coming soon" tooltip copy: if the tooltip says "Coming soon" without explaining what's coming or why it's delayed, it may create more questions than it answers. Consider specifying "Date range, Actor, Course, and Surface filtering — coming in a future update." |

### Confidence Check

- `web_searches_performed`: 7 (LMS audit log patterns, SaaS admin audit trail UI, audit log table UX best practices, disabled filter coming soon tooltip, LMS competitor analysis, NNGroup audit trail, BFM empty states)
- `mobbin_searches_performed`: 5 (audit log tables with filters, settings change history with values, empty states in admin, filter bars with disabled filters, tab navigation overflow)
- `bfm_lookups_performed`: 2 (BFM MCP server was not available as a tool in this session; fell back to WebSearch `site:builtformars.com` queries × 4 plus WebFetch attempts on 4 BFM URLs — builtformars.com/case-studies/building-a-store, /case-studies/grok, /ux-bites/revoluts-progressive-onboarding, /ux-glossary/fuzzy-context. Full article content was behind paywall for most, but search result snippets and metadata provided usable lessons for 4 entries.)
- `authoritative_sources_fetched`: 4 (NN/g empty states article, Pencil & Paper data tables article, Velt SaaS audit trail guide, AI UX Playground audit trail pattern)
- `all_urls_verified`: yes
- **Note on external links:** The Atlassian Confluence link (LMS audit-trail benchmark) requires authentication and could not be fetched. The Figma prototype link was not fetched as it requires Figma access. Both should be reviewed by the design team directly.