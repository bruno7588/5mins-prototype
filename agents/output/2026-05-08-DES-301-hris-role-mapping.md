---
ticket: DES-301
summary: HRIS Role Mapping
status: in Design Phase
generated: 2026-05-08T16:40:51.910Z
---



# PRD: HRIS Role Mapping

## 1. Overview

When organizations connect their HRIS (Human Resource Information System) to 5mins via Merge.dev, synced employees arrive without a job role. Today, every one of those employees must manually pick a role during onboarding — a friction point that delays access to relevant learning paths and scales painfully for large customers syncing hundreds or thousands of users.

This feature introduces **automatic HRIS-to-5mins role mapping**: during the existing Dry Run phase, the system fetches HRIS job titles, attempts to match them to 5mins roles, and presents the results in a reviewable mapping table. Admins refine the mappings, and when the integration switches to Full or Partial sync, users are invited with their roles pre-assigned — skipping the role-selection step entirely during onboarding. On subsequent syncs, title changes are detected and roles updated accordingly.

The core **job to be done** is straightforward: large-org admins need their HRIS investment to flow through to learning-platform readiness without per-user manual intervention.

## 2. Jobs To Be Done

### Main Job

**Ensure every HRIS-synced employee lands in the correct 5mins learning path automatically**, so that neither the admin nor the employee wastes time on manual role selection.

### Job Map

| Stage | What Happens Today | Pain / Workaround | What This Feature Does |
|---|---|---|---|
| **Define** | Admin decides which employees need which learning paths | No way to express intent at scale — role assignment is per-user | Mapping table lets admin define intent once per job title |
| **Locate** | Admin connects HRIS via Merge.dev Dry Run | Dry Run fetches employees but ignores job titles | Dry Run now fetches distinct titles + counts |
| **Prepare** | N/A — no preparation step exists | Admin has no preview of what roles users will get | Auto-matching computes suggested mappings; admin reviews |
| **Confirm** | Admin switches Dry Run → Full/Partial | No role information is carried into the sync | Mappings are stored and applied when sync activates |
| **Execute** | Invites sent; users onboard and manually pick roles | Every user hits the role-picker — slow, error-prone, inconsistent | Users with mapped roles skip role selection entirely |
| **Monitor** | Admin has no visibility into role assignment status | No way to know if roles are correct post-sync | Mapping table shows statuses (Mapped / Unmapped / Broken); banner alerts for new titles |
| **Resolve** | Admin manually reassigns roles one-by-one | Unscalable for large orgs | Admin edits mappings; next sync propagates changes |

### Related Jobs

- **IT Admin:** "Keep our HRIS as the single source of truth for employee data across all SaaS tools."
- **L&D Manager:** "Get employees into relevant learning content on day one, not day five."
- **End User (Employee):** "Start learning immediately without bureaucratic setup steps."

### Emotional & Social Dimensions

- **Admin** wants to feel **in control and confident** — they need to trust that the system won't silently assign wrong roles to hundreds of people. The Dry Run → review → activate flow gives them a safety net.
- **Admin** wants to be perceived as **efficient and competent** by their organization — automating role assignment at scale demonstrates operational sophistication.
- **Employee** wants to feel **expected and welcomed** — landing directly in a personalized learning path (rather than being asked "what do you do?") signals that the organization prepared for their arrival.

## 3. Goals

1. **Zero-touch role assignment for mapped titles** — employees whose HRIS title has a mapping should never see the role-selection step during onboarding.
2. **High auto-match rate on first run** — case-insensitive exact matching against tenant roles (priority) then public roles should resolve the majority of titles without admin intervention.
3. **Clear admin triage workflow** — admins should be able to scan, filter, and resolve all unmapped or broken titles in a single session, with confidence in what each action does.
4. **Safe re-sync behavior** — title changes propagate correctly; unmapped titles never silently remove an existing role; broken mappings are surfaced, not hidden.
5. **Prototype scope: ~20 job titles** — the initial implementation should be designed to handle dozens to hundreds of titles, but the prototype will target roughly 20 for validation.

## 4. Job Stories

### Admin — Initial Setup
- **When** I connect my HRIS in Dry Run mode, **I want** the system to automatically match HRIS job titles to 5mins roles, **so I can** review suggested mappings instead of building them from scratch.
- **When** I see the mapping table after Dry Run, **I want** to filter to only unmapped titles, **so I can** focus my time on the titles that need my attention.
- **When** I see an auto-matched title that maps to the wrong 5mins role, **I want** to change the mapping via an inline dropdown, **so I can** correct it without navigating away.

### Admin — Ongoing Management
- **When** a re-sync discovers new HRIS job titles, **I want** to see a specific in-app banner (e.g., "3 new job titles discovered — 12 employees need role mapping"), **so I can** act on it promptly rather than discovering gaps later.
- **When** a 5mins role that was part of a mapping gets deleted, **I want** the mapping to show as "Broken" with a visual indicator, **so I can** reassign those titles before the next sync.
- **When** I remove a mapping, **I want** existing users to keep their current role, **so I can** clean up mappings without disrupting active learners.

### Employee — Onboarding
- **When** my role has been pre-assigned from HRIS, **I want** to skip the role-selection step during onboarding, **so I can** start learning immediately.
- **When** my HRIS title has no mapping, **I want** to be prompted to pick a role during onboarding, **so I can** still get a personalized experience even if my title wasn't pre-mapped.

### Admin — Conflict Resolution
- **When** a user's HRIS title changes and the new title has a mapping, **I want** the system to update their role automatically, **so I can** keep learning paths aligned with organizational changes.
- **When** a user's HRIS title changes to an unmapped title, **I want** the system to keep their existing role and flag the new title as unmapped, **so I can** avoid disrupting the user's learning while I review the new title.

## 5. Requirements

### Functional Requirements

#### FR-1: Dry Run Enhancement — Title Fetching & Auto-Matching
- **FR-1.1:** During Dry Run, the system SHALL fetch all employees from the connected HRIS via Merge.dev and compute a list of distinct job titles with associated employee counts.
- **FR-1.2:** The system SHALL auto-match each distinct HRIS title to a 5mins role using case-insensitive exact string match, checking tenant-specific roles first, then public roles. (Tenant role wins in case of conflict per clarifying answer.)
- **FR-1.3:** The system SHALL store the resulting mappings (matched and unmatched) as the tenant's HRIS role mapping configuration.
- **FR-1.4:** Dry Run SHALL NOT create invites, users, or team assignments.

#### FR-2: Admin Mapping Table (Integration Settings Screen)
- **FR-2.1:** The mapping table SHALL display: HRIS Job Title, Employee Count, Mapped 5mins Role (with Edit/Remove actions), and Status (Mapped / Unmapped / Broken).
- **FR-2.2:** Status SHALL use color-coded badges: green for Mapped, amber/gray for Unmapped, red for Broken.
- **FR-2.3:** Admins SHALL be able to change any mapping at any time by selecting a different 5mins role from an inline dropdown (tenant and public roles available).
- **FR-2.4:** Admins SHALL be able to remove a mapping. Removing a mapping SHALL NOT change existing users' roles; future syncs for that title will not assign a role.
- **FR-2.5:** The table SHALL support a filter/tab to show only unmapped titles.
- **FR-2.6:** When a mapped 5mins role is deleted from the system, the mapping status SHALL change to "Broken."
- **FR-2.7:** The table SHALL support frozen headers for scrollability.

#### FR-3: Notifications for New Titles
- **FR-3.1:** When a re-sync discovers new HRIS job titles not present in the current mapping configuration, those titles SHALL be added as unmapped.
- **FR-3.2:** An in-app informational banner SHALL appear on the integration settings screen, specifying the count of new titles and affected employees (e.g., "3 new job titles discovered — 12 employees need role mapping").

#### FR-4: Sync Activation (Full / Partial)
- **FR-4.1:** When a SuperAdmin switches from Dry Run to Full or Partial sync, the initial sync SHALL apply mapped roles to corresponding users at invite time.
- **FR-4.2:** Users whose HRIS title is unmapped SHALL proceed through the standard onboarding role-selection flow.

#### FR-5: Re-Sync Role Update Logic
- **FR-5.1:** The system SHALL store `hrisJobTitle` on each user's profile.
- **FR-5.2:** On each sync, the system SHALL compare the incoming HRIS title against the stored `hrisJobTitle`.
- **FR-5.3:** If the title has changed AND the new title has a mapping, the system SHALL update the user's 5mins role and trigger the existing skill-update behavior.
- **FR-5.4:** If the title has changed AND the new title has NO mapping, the system SHALL keep the user's existing role and add the new title as unmapped in the mapping table.
- **FR-5.5:** If the title has NOT changed, no role update SHALL occur.

#### FR-6: Edge Cases
- **FR-6.1:** Empty HRIS title → no role assigned; user selects role during onboarding.
- **FR-6.2:** Inactive HRIS employee → skipped entirely (existing behavior).
- **FR-6.3:** Users SHALL NOT be able to change their HRIS-assigned role themselves; only admins can change it (per clarifying answer).

#### FR-7: Onboarding UX — Skip Role Selection (Deliverable 2)
- **FR-7.1:** When a user's role has been pre-assigned via HRIS mapping, the role-selection step in onboarding SHALL be skipped entirely.
- **FR-7.2:** Users with no mapped role (unmapped or empty title) SHALL see the standard role-selection step.

## 6. Research & Best Practices

### Synthesis

The mapping table is the centrepiece of the admin experience, and research strongly supports the design decisions already outlined in the ticket.

**Table design fundamentals.** NN/g's research on data tables identifies four core user tasks — finding records, comparing data, viewing/editing records, and taking batch actions — all of which apply to the mapping table ([NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/)). Frozen headers, human-readable status labels (not codes), and discoverable filters are called out as essential for tables with 20+ rows. Pencil & Paper's enterprise data table analysis recommends inline editing via dropdowns as the lowest-friction pattern for reassigning values like roles, and suggests sidebar panels when admins need to drill into detail (e.g., viewing which employees hold a given title) ([Pencil & Paper — Data Tables](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables)).

**Filtering patterns.** The ticket's requirement to "filter to show only unmatched titles" aligns precisely with Pencil & Paper's recommendation for pre-filtered tabs when filter sets grow large, especially when connected to HR databases ([Pencil & Paper — Filtering](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering)). Visible filter tags and search-within-filter are also recommended as the mapping table scales.

**SaaS user management conventions.** Perpetual's guide to SaaS user management advocates color-coded pill badges for status columns and context-aware actions — e.g., "Map" for unmapped, "Edit" for mapped, "Fix" for broken — which directly maps to our three statuses ([Perpetual — SaaS User Management](https://www.perpetualny.com/blog/better-saas-user-management-experience)). Success notifications should confirm exact changes ("3 titles mapped successfully"), and empty states after filtering should say "No unmapped titles found" with a clear-filter action.

**HRIS integration realities.** Apideck's guide to HRIS integrations warns that field naming varies wildly across providers and recommends creating a data dictionary of field mappings and cleaning data before syncing ([Apideck — HRIS Guide](https://www.apideck.com/blog/a-guide-to-hris-integrations-best-practices-use-cases-and-trends-for-2025)). This validates the decision to start with case-insensitive exact match and defer fuzzy matching. Merge.dev's syncing best practices recommend combining webhooks with polling and using `modified_after` timestamps for incremental syncs ([Merge.dev — Syncing Best Practices](https://docs.merge.dev/merge-unified/reading-data/syncing-best-practices)). Crucially, each Employee can have multiple Employment objects — when a title changes, a new Employment is created with an `effective_date`, so the re-sync logic should resolve to the most recent employment's title. Merge.dev's HRIS API overview confirms that the `job_title` field is passed through as-is when no enum mapping exists, validating the approach of displaying raw titles for admin review ([Merge.dev — HRIS API](https://www.merge.dev/blog/guide-to-hris-api-integrations)).

**Dry Run pattern.** Google Cloud's dry run mode for VPC Service Controls provides a strong precedent: configurations are created and logged but not enforced until activated ([Google Cloud — Dry Run](https://docs.google.com/vpc-service-controls/docs/dry-run-mode)). This validates the ticket's Dry Run approach of fetching and computing mappings without creating invites or assignments.

**Inline editing and undo.** Eleken's table design guide recommends inline editing with dropdowns for role/status assignment and undo/redo for inline edits, with non-blocking error highlights ([Eleken — Table Design](https://www.eleken.co/blog-posts/table-design-ux)). The SaaS UI Workflow Patterns gist notes that admin views combining navigation, data tables, filters, and action buttons form a foundational SaaS pattern, and that split-pane/master-detail views support before/after comparison useful for dry run previews ([SaaS UI Patterns Gist](https://gist.github.com/mpaiva-cc/d4ef3a652872cb5a91aa529db98d62dd)).

### UX References

| App | Flow / Screen | URL | Pattern Description | Relevance |
|-----|--------------|-----|---------------------|-----------|
| Attio | Importing Data (Web) | [mobbin.com/flows/81dfb7b0…](https://mobbin.com/flows/81dfb7b0-fa9e-4487-9fb7-304f70915ad6) | 13-screen CSV import: file selection → attribute mapping (column-to-field matching) → review/preview → confirmation → processing. Validation at each step. | Directly analogous to HRIS title → role mapping. The attribute mapping step mirrors matching titles to roles; the review step before committing mirrors Dry Run → Full transition. |
| Luma | Importing People (Web) | [mobbin.com/explore/flows/7bcf9bd6…](https://mobbin.com/explore/flows/7bcf9bd6-5b34-451d-bec1-7409b82dcb10) | 12-screen people import: CSV upload → data preview with tagging → updated contact list. Bulk data review before commit. | Relevant to admin reviewing HRIS-synced titles with counts. Tagging step parallels assigning roles to title groups. |
| Slite | Importing a Doc (Web) | [mobbin.com/explore/flows/255d2fa9…](https://mobbin.com/explore/flows/255d2fa9-09b2-426a-826d-ca6d6166d889) | 9-screen doc import: source selection → channel configuration → progress indicators → results view. Clear step progression. | Demonstrates best practice for multi-step import with progress indicators — applicable to Dry Run fetching state and sync progress. |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Slack Hides Complexity to Create Effortless Onboarding | Case Study | [builtformars.com/case-studies/slack](https://builtformars.com/case-studies/slack) | Incrementally expose complexity rather than showing everything at once. Hiding complexity creates a smooth first run but can lead to cumulative noise. | Supports the phased Dry Run → review → Full flow. The "filter to unmapped only" pattern correctly stages admin attention rather than overwhelming with all titles at once. |
| How to Stop People from Skipping Your Onboarding (YNAB) | Case Study | [builtformars.com/case-studies/ynab](https://builtformars.com/case-studies/ynab) | Users have action bias — they prefer progress-feeling CTAs over pausing to learn. When role is pre-assigned, skipping the role step removes friction users would have rushed through anyway. | Validates "skip role selection when pre-set" for Deliverable 2. HRIS-assigned users should go straight to learning content. |
| Linear's "undo" Warnings | UX Bite | [builtformars.com/ux-bites/linears-undo-warnings](https://builtformars.com/ux-bites/linears-undo-warnings) | Only show undo confirmation warnings when the action is contextually risky (>10 min old or different page), not for every action. Prevents modal fatigue. | When admin removes a mapping affecting many employees, show a confirmation. For routine single-title edits, skip the confirmation to avoid alert fatigue. |
| Framing the Value of Notifications (Citymapper) | UX Bite | [builtformars.com/ux-bites/framing-the-value-of-notifications](https://builtformars.com/ux-bites/framing-the-value-of-notifications) | Frame notification value with specific examples, not generic copy. | In-app banners for new unmatched titles should be specific: "3 new job titles discovered — 12 employees need role mapping" rather than generic "New unmatched titles." |
| Timed Custom Statuses (Discord) | UX Bite | [builtformars.com/ux-bites/timed-custom-statuses](https://builtformars.com/ux-bites/timed-custom-statuses) | Color-coded, clearly differentiated badges allow at-a-glance scanning without reading labels. | Directly applicable to Mapped (green) / Unmapped (amber) / Broken (red) status badges in the mapping table. |

## 7. Plan of Action

### Phase 1: Backend — Mapping Engine & Data Model
- [ ] Design data model for HRIS role mappings: `hris_role_mapping` table (tenant_id, hris_job_title, fivemins_role_id, status, employee_count, created_at, updated_at)
- [ ] Add `hrisJobTitle` field to user profile schema
- [ ] Extend Dry Run logic to fetch distinct job titles and employee counts from Merge.dev Employment objects (resolving to most recent `effective_date` per employee)
- [ ] Implement auto-match algorithm: case-insensitive exact match against tenant roles first, then public roles
- [ ] Build CRUD API endpoints for mapping management (list, update, remove mappings)
- [ ] Implement re-sync comparison logic: detect title changes, resolve mappings, update roles or flag unmapped
- [ ] Handle edge cases: empty titles, inactive employees, deleted roles (mark mapping as Broken)
- [ ] Write unit and integration tests for all mapping engine logic

### Phase 2: Admin UI — Mapping Table (Deliverable 1)
- [ ] Request Figma references from design team for mapping table components (per clarifying answer: reuse existing design system)
- [ ] Build mapping table component on integration settings screen: HRIS Job Title, Employee Count, 5mins Role (inline dropdown), Status (color-coded badge)
- [ ] Implement inline role dropdown populated with tenant + public roles
- [ ] Implement "Unmapped Only" filter tab/toggle
- [ ] Implement frozen table headers for scroll behavior
- [ ] Build in-app informational banner for new unmatched titles (specific copy with title count + employee count)
- [ ] Implement empty states: "No unmapped titles found" with clear-filter action; "No mappings yet — run Dry Run to discover titles"
- [ ] Add confirmation dialog for high-impact mapping removals (e.g., affecting many employees); skip for routine edits
- [ ] Build success toast notifications for mapping actions (e.g., "3 titles mapped successfully")
- [ ] Test admin flows end-to-end: Dry Run → review mappings → edit/remove → filter

### Phase 3: Onboarding UX — Skip Role Selection (Deliverable 2)
- [ ] Modify onboarding flow to check for HRIS-assigned role on user profile
- [ ] If role is pre-assigned, skip the role-selection step entirely
- [ ] If role is not pre-assigned (unmapped/empty title), show standard role-selection step
- [ ] Ensure users cannot change their HRIS-assigned role from their profile (admin-only control)
- [ ] End-to-end validation: Dry Run → mapping review → Full sync → new user onboarding without role step

### Phase 4: Polish & Hardening
- [ ] Test with ~20 job titles prototype dataset (per clarifying answer)
- [ ] Verify re-sync behavior: title changes with mapped roles, title changes with unmapped roles, no title changes
- [ ] Verify Broken status detection when a mapped 5mins role is deleted
- [ ] Verify banner notification accuracy after re-syncs with new titles
- [ ] Cross-browser and responsive testing for mapping table
- [ ] Performance check: ensure mapping table renders smoothly with hundreds of rows (future-proofing)
- [ ] Accessibility review: keyboard navigation for table, screen reader support for status badges

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Low auto-match rate** — HRIS titles are freeform and rarely match 5mins role names exactly (e.g., "Sr. SWE" vs "Software Engineer") | Admins face a mostly-unmapped table, reducing perceived value of the feature | Clearly communicate that exact match is V1; design the UI so manual mapping is fast (inline dropdowns, bulk review); track match rates to build the case for fuzzy matching in a future phase |
| **HRIS title inconsistency across providers** — different providers structure Employment objects differently; some may not populate `job_title` at all | Empty or missing titles create unmapped users, increasing admin workload | Handle empty titles gracefully (FR-6.1); log and surface providers with low title coverage; leverage Merge.dev's unified model to normalize where possible ([Apideck — HRIS Guide](https://www.apideck.com/blog/a-guide-to-hris-integrations-best-practices-use-cases-and-trends-for-2025)) |
| **Multiple Employment objects per employee** — Merge.dev creates new Employment records for title changes; resolving to the "current" title requires correct `effective_date` logic | Wrong title resolved → wrong role assigned | Use the most recent Employment `effective_date` per Merge.dev best practices ([Merge.dev — Syncing Best Practices](https://docs.merge.dev/merge-unified/reading-data/syncing-best-practices)); add logging for title resolution decisions |
| **Stale Broken mappings go unnoticed** — a 5mins role is deleted but the admin doesn't visit the integration settings page to see the Broken status | Users on subsequent syncs don't get roles assigned; no one notices | In-app banner for Broken mappings (same pattern as new-title banners); consider extending to email digest in a future phase |
| **Admin confusion about mapping removal impact** — admin removes a mapping thinking it will reset existing users' roles | Mismatched expectations; support tickets | Confirmation dialog for removals should explicitly state: "Existing users will keep their current role. Future syncs for this title will not assign a role." |
| **Race condition between manual role edit and HRIS sync** — admin edits a mapping while a sync is in progress | Sync could overwrite the just-edited mapping or apply stale data | Apply mapping changes atomically; sync reads mappings at start of run and applies consistently; document that in-progress syncs use the mapping state at sync start |
| **Users locked out of role changes** — HRIS-assigned users cannot change their role (FR-6.3), which may frustrate users whose HRIS title is wrong | User stuck in wrong learning path; support burden | Provide clear messaging to the user that their role is managed by their organization; direct them to their admin; ensure admins can quickly update individual mappings |