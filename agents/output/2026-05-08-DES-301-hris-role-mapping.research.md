---
ticket: DES-301
summary: HRIS Role Mapping
status: in Design Phase
generated: 2026-05-08T16:40:51.910Z
---

## Research Dossier

### Web Findings

- **[NN/g — Data Tables: Four Major User Tasks](https://www.nngroup.com/articles/data-tables/)** — Tables must support four core tasks: finding records via filtering/search, comparing data across rows, viewing/editing single records, and taking batch actions. For a mapping table with ~20+ rows, frozen headers, discoverable filters, and inline editing (e.g., dropdowns for role assignment) are essential. Status columns should use human-readable labels, not codes.

- **[Pencil & Paper — Data Table Design UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables)** — Enterprise data tables should support inline editing for low-friction changes (ideal for reassigning a role via dropdown), multi-select with contextual bulk actions, and display density controls. Five approaches to row detail exist: expandable rows, tooltips, modals, sidebars, and full-screen — sidebar panels are the most scalable when admins need to inspect employee lists per title.

- **[Pencil & Paper — Enterprise Filtering UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering)** — When connected to HR databases, filter sets can grow unmanageable. Recommend adding search within filter panels, pre-filtered tabs (e.g., "Unmapped Only"), and visible filter tags. The ticket's "filter to show only unmatched titles" requirement aligns with the pre-filtered view pattern.

- **[Perpetual — Better SaaS User Management Experience](https://www.perpetualny.com/blog/better-saas-user-management-experience)** — SaaS user directories should organize data into distinct columns (Name, Status, Role, etc.) with color-coded pill badges for status. Actions should be context-aware: available actions vary by status (e.g., "Map" for unmapped, "Edit" for mapped, "Fix" for broken). Success notifications should confirm exact changes (e.g., "3 titles mapped successfully"). Empty states after filtering should say "No unmapped titles found" with a clear-filter action.

- **[Apideck — Guide to HRIS Integrations](https://www.apideck.com/blog/a-guide-to-hris-integrations-best-practices-use-cases-and-trends-for-2025)** — Field naming varies wildly across HRIS providers (BambooHR's "employee_id" vs Workday's "employee_reference_id"). Before integrating, create a data dictionary of field mappings. Clean data before syncing — standardize formats and names. Establish a single source of truth for each field to prevent conflicting updates. This reinforces why auto-matching should start with case-insensitive exact match and why fuzzy matching is correctly deferred.

- **[Merge.dev — Syncing Data Best Practices](https://docs.merge.dev/merge-unified/reading-data/syncing-best-practices)** — Merge recommends combining webhooks with polling for reliability. Use `modified_after` timestamps for incremental syncs. Each Employee can have multiple Employment objects; when job title changes, a new Employment is created with an `effective_date` — the most recent date corresponds to the latest role. This directly informs how the re-sync "compare incoming title vs. stored" logic should work.

- **[Merge.dev — HRIS API Overview](https://www.merge.dev/blog/guide-to-hris-api-integrations)** — The Employment object tracks job positions; the `job_title` query parameter can filter employees by title. In cases where there's no clear enum mapping, the original value is passed through. This confirms the ticket's approach of fetching distinct titles from Merge and displaying them as-is for admin review.

- **[Eleken — Table Design UX Guide for SaaS](https://www.eleken.co/blog-posts/table-design-ux)** — Pre-filtered views like tabs for "Needs Review" help users start from relevant data slices. Inline editing with dropdowns for status/role assignment reduces navigation. When filters are buried or actions unclear, productivity suffers. Offer undo and redo for inline edits; highlight cells with errors non-blockingly.

- **[SaaS UI Workflow Patterns (GitHub Gist)](https://gist.github.com/mpaiva-cc/d4ef3a652872cb5a91aa529db98d62dd)** — Admin Views combine navigation, data tables, filters, and action buttons as a foundational SaaS admin pattern. Split Pane patterns support master-detail views useful for dry run comparison (before/after mapping preview).

- **[Google Cloud — Dry Run Mode for VPC Service Controls](https://docs.google.com/vpc-service-controls/docs/dry-run-mode)** — Google's dry run mode lets admins create configurations with no impact to existing environments. Requests that violate the configuration are logged but not blocked. This validates the ticket's Dry Run approach: fetch and compute mappings but don't create invites or assignments until Full/Partial is activated.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Attio | Importing Data (Web) | [mobbin.com/flows/81dfb7b0...](https://mobbin.com/flows/81dfb7b0-fa9e-4487-9fb7-304f70915ad6) | 13-screen CSV import flow: file selection → attribute mapping (column-to-field matching) → review/preview → confirmation → processing. Validation at each step. | Directly analogous to HRIS title → role mapping review. The attribute mapping step (matching CSV columns to destination fields) mirrors mapping HRIS titles to 5mins roles. The review step before committing mirrors the Dry Run → Full transition. |
| Luma | Importing People (Web) | [mobbin.com/explore/flows/7bcf9bd6...](https://mobbin.com/explore/flows/7bcf9bd6-5b34-451d-bec1-7409b82dcb10) | 12-screen people import: CSV upload → data preview with tagging → updated contact list. Emphasizes bulk data review before commit. | Relevant to the admin reviewing HRIS-synced employee titles with counts. The tagging step parallels assigning roles to title groups. The "view updated list" step parallels the mapping table's post-review state. |
| Slite | Importing a Doc (Web) | [mobbin.com/explore/flows/255d2fa9...](https://mobbin.com/explore/flows/255d2fa9-09b2-426a-826d-ca6d6166d889) | 9-screen doc import: source selection → channel configuration → progress indicators → results view. Clear step progression and progress communication. | Demonstrates best practice for multi-step import with progress indicators — applicable to the Dry Run fetching state and showing sync progress to admins. |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Slack Hides Complexity to Create Effortless Onboarding | Case Study | [builtformars.com/case-studies/slack](https://builtformars.com/case-studies/slack) | Slack incrementally exposes interface complexity during onboarding rather than showing everything at once. Key tradeoff: hiding complexity creates a smooth first run but can lead to cumulative noise. Applied to HRIS mapping: the Dry Run → review → Full flow correctly stages complexity. | Supports the phased approach (Dry Run → mapping review → Full sync). Warns against surfacing too many mapping options at once — the "filter to unmapped only" pattern helps stage admin attention. |
| How to Stop People from Skipping Your Onboarding (YNAB) | Case Study | [builtformars.com/case-studies/ynab](https://builtformars.com/case-studies/ynab) | Users have action bias — they prefer progress-feeling CTAs over pausing to learn. Muted tutorials don't teach. For onboarding, the learning content itself must feel like progress. When role is pre-assigned via HRIS, skipping the role step removes a friction point that users would have skipped or rushed through anyway. | Validates the "skip role selection when pre-set" design for Deliverable 2. Users with HRIS-assigned roles should go straight to learning content (the product's core value), not pause at a role picker they didn't choose. |
| Linear's "undo" Warnings | UX Bite | [builtformars.com/ux-bites/linears-undo-warnings](https://builtformars.com/ux-bites/linears-undo-warnings) | Linear only shows undo confirmation warnings when the action is contextually risky (>10 min old or on a different page), not for every action. This prevents modal fatigue while protecting against costly mistakes. | Applicable to the mapping table: when an admin changes or removes a mapping, a confirmation dialog should only appear for high-risk changes (e.g., removing a mapping affecting 40+ employees), not for routine edits. Avoids alert fatigue. |
| Framing the Value of Notifications (Citymapper) | UX Bite | [builtformars.com/ux-bites/framing-the-value-of-notifications](https://builtformars.com/ux-bites/framing-the-value-of-notifications) | Citymapper frames notification value by showing specific examples of what alerts the user will receive, not generic "enable notifications" copy. Notifications should explain their value to the recipient. | When notifying admins about new unmatched titles after a re-sync, the in-app banner should be specific: "3 new job titles discovered — 12 employees need role mapping" rather than a generic "New unmatched titles." Actionable, value-framed copy drives admin action. |
| Timed Custom Statuses (Discord) | UX Bite | [builtformars.com/ux-bites/timed-custom-statuses](https://builtformars.com/ux-bites/timed-custom-statuses) | Discord's status system uses color-coded, clearly differentiated badges (Online/Idle/DND/Invisible) with auto-reset logic. Users can scan status at a glance without reading labels. | Directly applicable to the three mapping statuses (Mapped / Unmapped / Broken). Use visually distinct, color-coded badges — green for Mapped, gray/amber for Unmapped, red for Broken — so admins can triage at a glance across dozens of titles. |

### Confidence Check
- `web_searches_performed`: 7
- `mobbin_flows_fetched`: 3 (Attio importing data, Luma importing people, Slite importing doc)
- `bfm_lookups_performed`: 8 (6 × `bfm_find_content` + 2 × `bfm_analyze_lessons`)
- `authoritative_sources_fetched`: 5 (NN/g data tables, Pencil & Paper enterprise tables, Merge.dev syncing docs, Apideck HRIS guide, Perpetual SaaS user management)
- `all_urls_verified`: yes