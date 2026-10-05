---
ticket: DES-284
summary: Automations Improvements
status: in Design Phase
generated: 2026-04-07T12:26:38.488Z
---

# PRD: Automations Improvements (DES-284)

## 1. Overview

5mins is promoting Automations from a sub-tab inside the Courses page to a top-level section in the admin sidebar. This architectural change gives Automations first-class status — reflecting its growing complexity and strategic importance — and creates room for two internal views: **Manage** (existing automations list, relocated) and **Activity** (a new global trigger log).

The primary motivation is **visibility and trust**. Tenant admins currently have no centralised view of automation activity. They must open each automation individually to check limited history, or resort to workarounds like asking Customer Success to query the database or exporting CSVs. This change eliminates those workarounds, reduces CS ticket load ("Did this automation actually fire?"), supports compliance audits (proof-of-enrollment), and surfaces Automations as a first-class product concept rather than a Courses sub-feature.

---

## 2. Jobs To Be Done

### Main Job

**When I'm responsible for onboarding workflows and compliance, I want a single, centralised, chronological record of every automation trigger across my organisation, so I can verify who was enrolled, when, and by which automation — without manual workarounds.**

### Job Map

| Stage | What the admin does | Current pain / workaround |
|---|---|---|
| **Define** | Set up automations for new/existing employee enrolment | Works fine today — out of scope |
| **Locate** | Find where automation management lives in the product | Buried under Courses → Automations tab. Admins forget it's there or can't find it when onboarding new team members |
| **Prepare** | Decide which automation to investigate or audit | No global view — must remember automation names and open each individually |
| **Confirm** | Verify a specific automation fired for a specific user | No trigger log exists globally. Workaround: ask CS, export CSVs, or query DB via engineering |
| **Execute** | Take action based on findings (e.g., re-enrol someone, flag a gap) | Delayed — the verification step is so painful that admins often skip it or postpone |
| **Monitor** | Track automation health over time (are they firing? how often?) | No summary stats. Admins have no at-a-glance sense of automation volume or health |
| **Resolve** | Address issues (automation not firing, wrong users triggered) | Slow resolution because root-cause data is inaccessible without engineering help |

### Related Jobs

- **Compliance reporting**: When an auditor asks for proof that training was assigned to all new hires within 7 days, the admin needs a filterable, date-sorted record of triggers.
- **Onboarding troubleshooting**: When a manager reports a new hire didn't receive their courses, the admin needs to search by user name/email to confirm whether the automation fired.
- **Automation lifecycle management**: When deciding whether to keep, modify, or delete an automation, the admin wants to see how often it fires and whether it's still active.
- **Team handoff**: When onboarding a new L&D admin, the outgoing admin wants to show them where automation management and monitoring lives — a top-level sidebar item is far more discoverable.

### Emotional & Social Dimensions

| Dimension | Description |
|---|---|
| **Confidence** | Admins want to *trust* that automations are working. Today's lack of visibility breeds anxiety — "Is this thing actually doing what I set up?" |
| **Competence** | L&D and People Ops professionals want to be seen as in control of their systems. Needing to ask CS or engineering for basic data undermines that perception |
| **Accountability** | When auditors or leadership ask questions, admins want to answer immediately with data, not say "I'll need to get back to you" |
| **Professionalism** | The ability to pull up a filterable log during a compliance review signals operational maturity |

---

## 3. Goals

1. **Discoverability**: Automations are findable in ≤ 1 click from any page in admin (top-level sidebar item).
2. **Verification**: An admin can confirm whether a specific user was triggered by a specific automation in ≤ 30 seconds (search by name/email + filter by automation).
3. **At-a-glance health**: Summary stat cards provide instant read on automation volume and activity without requiring any interaction.
4. **Audit readiness**: A chronological, sortable, filterable log exists that can serve as proof-of-enrollment during compliance reviews.
5. **Zero-regression**: Existing Manage tab functionality is preserved 1:1 — no functionality lost during the relocation.
6. **Design system alignment**: All new components (table, stat cards, pagination, empty states, dropdown filter) are designed consistently with the 5mins design system and flagged as new component recommendations for the library.

---

## 4. Job Stories

### Navigation & Discovery

- **When** I need to manage or monitor automations, **I want** to see "Automations" as a clearly labelled item in the sidebar, **so I can** navigate there in one click without remembering it lives under Courses.
- **When** I'm training a new admin on our platform, **I want** automations to be visually prominent in the navigation, **so I can** easily direct them to the right section.

### Verification & Troubleshooting

- **When** a manager tells me a new hire didn't receive their onboarding courses, **I want** to search the activity log by user name or email, **so I can** confirm whether the automation triggered for that person.
- **When** I notice an automation hasn't fired recently, **I want** to filter the activity log by that automation name and sort by date, **so I can** identify when it last triggered and begin troubleshooting.
- **When** I see a "Deleted automation" entry in the log, **I want** it to be clearly visually distinct (muted, italic), **so I can** understand why I can't find it in the Manage tab.

### Monitoring & Compliance

- **When** I open the Activity tab, **I want** to see summary stats (total triggers, this month's triggers, active automations), **so I can** quickly gauge automation health without scrolling through the log.
- **When** an auditor asks for proof that onboarding training was assigned to all March hires, **I want** to filter by automation and sort by date descending, **so I can** present a chronological record of triggers.
- **When** I'm reviewing activity and see a user whose account was later deleted, **I want** the log to still show their name as captured at trigger time, **so I can** maintain a complete audit trail.

### Zero-activity States

- **When** I visit the Activity tab for the first time and no automations have ever fired, **I want** a clear empty state with guidance, **so I** understand this isn't an error and know where to go next (Manage tab).
- **When** my search returns no results, **I want** a contextual inline message, **so I** know to adjust my search rather than thinking data is missing.

---

## 5. Requirements

### Functional Requirements

#### FR1: Sidebar Navigation Update

| # | Requirement |
|---|---|
| FR1.1 | Add "Automations" as a top-level sidebar item between "Content & Courses" and "Reports" |
| FR1.2 | Sidebar order: Home → People & Teams → Content & Courses → **Automations** → Reports → Skills → Learning Records → Events → Account & Settings |
| FR1.3 | Icon: Iconsax `Flash` icon — Linear variant when inactive, Bold variant when active (consistent with sidebar icon pattern) |
| FR1.4 | Remove the "Automations" tab from the Courses page. Courses tabs become: "Created by You" and "Course Reports" only |
| FR1.5 | Clicking "Automations" in the sidebar navigates to the Automations section with the Manage tab active by default |

#### FR2: Automations Section — Manage Tab

| # | Requirement |
|---|---|
| FR2.1 | Page title: "Automations" (replaces "Courses" as the page heading) |
| FR2.2 | Tab bar with two tabs: "Manage" (active by default) and "Activity" |
| FR2.3 | Tab bar uses existing underline pattern with `secondary-500` (#FFBB38) active indicator |
| FR2.4 | Manage tab content is the existing automations list view, relocated as-is: New Employee / Existing Employee type cards, automation list table (name, last updated, active toggle, overflow menu), page header and description text |
| FR2.5 | No functional changes to the Manage tab — visual relocation only |

#### FR3: Automations Section — Activity Tab

**Stat Cards**

| # | Requirement |
|---|---|
| FR3.1 | Three stat cards displayed horizontally across the top of the Activity tab |
| FR3.2 | Card 1 — "Total Triggers": cumulative count since tenant creation. Icon: `People` (Iconsax) |
| FR3.3 | Card 2 — "This Month": count for current calendar month (resets on the 1st). Icon: `Calendar` (Iconsax) |
| FR3.4 | Card 3 — "Active Automations": count of automations currently toggled active. Icon: `Flash` (Iconsax) |
| FR3.5 | Stat cards are read-only (no interaction) |
| FR3.6 | Stat cards remain visible in the first-run empty state, displaying zeroes |
| FR3.7 | Numbers ≥ 1,000 display with comma separators (e.g., "1,247") |

**Filter Bar**

| # | Requirement |
|---|---|
| FR3.8 | Search input (left-aligned): placeholder "Search by user name or email". Uses existing Search component pattern (size M or L per design system) |
| FR3.9 | Automation dropdown filter (right-aligned): default label "All automations". Lists all automation names (active and disabled). Disabled automations shown but visually marked as disabled in the dropdown |
| FR3.10 | Filter bar is hidden in the first-run empty state (no triggers ever). Shown in all other states |
| FR3.11 | Filters persist across pagination (server-side filtering) |

**Activity Table**

| # | Requirement |
|---|---|
| FR3.12 | Three columns: User, Automation, Triggered |
| FR3.13 | User column: two-line cell — name (primary text, `--text-primary`) + email (secondary text, smaller, `--text-tertiary`) |
| FR3.14 | Automation column: automation name with a small status dot. Green dot (`--success-500` #18A957) for active automations |
| FR3.15 | Deleted automation display: muted/grey text (`--text-disabled` #9EA4B3), italic, label "Deleted automation" — grey dot or no dot |
| FR3.16 | Triggered column: date formatted as "22 Mar 2026". Sortable — default descending. Show sort indicator (ascending/descending arrow) |
| FR3.17 | Only the Triggered column is sortable in v1 |
| FR3.18 | Row hover state using `--surface-page-hover` (#EFF0F2) |
| FR3.19 | If a user was deleted after trigger, still display name as captured at trigger time (no link/click behaviour) |
| FR3.20 | If an automation was renamed, display the current name |

**Pagination**

| # | Requirement |
|---|---|
| FR3.21 | 10 rows per page |
| FR3.22 | Footer: "Showing 1–10 of 1,247" with previous/next page controls |
| FR3.23 | Pagination respects active filters and sort order |

**Empty & Zero-Result States**

| # | Requirement |
|---|---|
| FR3.24 | First-run empty state (no triggers ever): centre-aligned vertical stack — illustration/icon (communicates "waiting", not error), heading "No automation activity yet", description "Activity will appear here once your automations start triggering for users.", primary CTA button "Go to Manage" (navigates to Manage tab). Stat cards visible (showing 0), filter bar hidden |
| FR3.25 | Search no results: inline table-area message "No results found" |
| FR3.26 | Automation filter no results: inline table-area message "No activity for this automation." |

---

## 6. Research & Best Practices

### Industry Patterns for Automation Activity Logs

**Zapier's Task History** is the closest analogue in market. Zapier uses a two-tab structure (Usage + Task Log) inside a dedicated history section, with per-run status indicators, multi-status filtering, searchable fields, and 10 items per page pagination. Notably, their 2024 refresh promoted task history to a more accessible location and surfaced more data upfront — the same trajectory 5mins is following by promoting Automations to the sidebar. Zapier retains 60 days of data; 5mins's 3-year retention is a significant compliance advantage.

**HubSpot's Audit Log** uses tiered filtering (category → subcategory → action → user) and places summary analytics cards at the top of the page showing total daily logins, deletions, exports, and reports. This stat-cards-above-table pattern directly validates the design approach for the Activity tab. HubSpot also includes AI-generated summaries — a potential future enhancement for 5mins.

**Stripe's Dashboard** follows the established pattern of KPI summary cards at the top, followed by a searchable/filterable/sortable transaction table with drill-down capability. Their stat cards show total revenue, transaction count, average order value, and pending items — structurally identical to the three stat cards proposed here.

**Enterprise audit log best practices** (EnterpriseReady.io) emphasise that SaaS applications should log all user-facing and automated actions, index events for search and filtering, link actors/events/timestamps for drill-down, and support configurable retention (typically 1–3 years).

### Sidebar Navigation Promotion

**Linear's sidebar redesign** demonstrates the importance of limiting primary navigation to 5–7 items and using a clear three-level visual hierarchy. When Linear moved items behind sub-menus for cleanliness, power users pushed back — leading them to restore one-click access. The 5mins sidebar with 9 top-level items after adding Automations is at the upper bound. The design should ensure items remain scannable with clear icon+label pairs and that Automations doesn't feel "squeezed in" but rather naturally placed between Content & Courses (where it used to live) and Reports (which it now feeds into).

**Sidebar UX best practices** (ALF Design Group, 2026) emphasise: (1) never rely on icons alone — always pair with text labels, (2) use filled/bold icon variants for active states, (3) limit primary items to 5–7 maximum, and (4) active states must be unmistakable on page load.

### UX References

| Product | Pattern | Relevance to 5mins |
|---|---|---|
| **Zapier** — Task History | Two-tab layout (Usage / Task Log), filter chips below filter bar, 10 items/page, status-per-row, bulk actions | Direct structural parallel: Manage + Activity tabs. 5mins's simpler scope (no bulk actions, no replay) is appropriate for v1 |
| **HubSpot** — Audit Log | Summary stat cards at top, tiered category filtering, drill-down from chart to table, 90-day retention | Validates stat-cards-above-table layout. HubSpot's subcategory drilldown is a good v2 candidate |
| **Stripe** — Dashboard | KPI cards → chart → transaction table pattern. Searchable, sortable, filterable. Side panel for row details | Confirms the stat → filter → table vertical flow. 5mins skips charts (appropriate for v1) |
| **Intercom** — Activity Logs (via Mobbin) | Teammate activity table with date filter, clean two-column layout, muted secondary text | Good reference for the User column's two-line cell pattern (name + email) |
| **Better Stack** — Log Data Table (via Mobbin) | Time-source-origin-destination-message columns, monospaced timestamps, dense data display | Reference for Triggered column date formatting and sort indicator placement |
| **Linear** — Sidebar Navigation | Icon + label primary nav, bold icon for active state, dimmed sidebar to emphasise content area, 5–7 primary items | Direct pattern for the sidebar update. Use Linear's approach of filled icon variant for active nav item |
| **Salesforce Lightning** — Design System | Utility icon library with ⚡ lightning bolt for automation/triggers, consistent sizing (24px default) | Validates Iconsax `Flash` as the correct metaphor for Automations |

---

## 7. Plan of Action

### Phase 1: Sidebar Navigation Update

- [ ] Update sidebar component (`src/components/LeftSidebar/LeftSidebar.tsx`) to add "Automations" as a top-level item
- [ ] Implement sidebar ordering: Home → People & Teams → Content & Courses → Automations → Reports → Skills → Learning Records → Events → Account & Settings
- [ ] Add Iconsax `Flash` icon — Linear variant (inactive), Bold variant (active) — at 24px default size
- [ ] Create route `/automations` that renders the Automations section with Manage tab active by default
- [ ] Remove the "Automations" tab from the Courses page tab bar
- [ ] Verify Courses page tabs display correctly with only "Created by You" and "Course Reports"
- [ ] QA: Confirm sidebar active state (yellow underline/highlight if applicable, bold icon) renders correctly
- [ ] QA: Confirm deep links to old Courses → Automations tab redirect gracefully to `/automations`

### Phase 2: Manage Tab (Relocation)

- [ ] Scaffold the Automations section page layout with tab bar (Manage | Activity)
- [ ] Implement tab bar using existing underline pattern with `secondary-500` (#FFBB38) active indicator
- [ ] Relocate existing automations list view content into the Manage tab
- [ ] Update page title from "Courses" to "Automations"
- [ ] Preserve all existing functionality: type cards, list table, active toggle, overflow menu, header/description text
- [ ] QA: Full regression test of Manage tab — verify no functionality was lost during relocation
- [ ] QA: Verify tab switching between Manage and Activity preserves state correctly

### Phase 3: Activity Tab — Stat Cards

- [ ] Design and implement the Stat Card component (icon + label + value, read-only)
- [ ] Implement three-across horizontal layout with responsive behaviour
- [ ] Wire up "Total Triggers" card to API (cumulative count, comma-formatted)
- [ ] Wire up "This Month" card to API (current calendar month count)
- [ ] Wire up "Active Automations" card to API (count of active automations)
- [ ] Ensure stat cards display zeroes in the first-run empty state
- [ ] Document Stat Card component for design system library

### Phase 4: Activity Tab — Filter Bar & Table

- [ ] Design and implement the Dropdown Filter component (single-select, "All automations" default)
- [ ] Implement filter bar layout: Search input (left) + Automation dropdown (right)
- [ ] Populate automation dropdown with all automation names (active + disabled, with disabled indicator)
- [ ] Build the Activity data table with three columns: User, Automation, Triggered
- [ ] Implement User column as two-line cell (name primary, email secondary/muted)
- [ ] Implement Automation column with status dot (green = active, grey/none = deleted)
- [ ] Implement deleted automation display (muted text, italic "Deleted automation")
- [ ] Implement Triggered column with "DD Mon YYYY" date format
- [ ] Add sort functionality to Triggered column (default descending, toggle ascending)
- [ ] Add sort indicator icon (arrow up/down) on Triggered column header
- [ ] Implement row hover state using `--surface-page-hover`
- [ ] Implement server-side search (by user name or email)
- [ ] Implement server-side automation filter
- [ ] Ensure filter + sort state persists across pagination and is reflected in URL query params
- [ ] Document Data Table, Dropdown Filter, and Status Dot components for design system library

### Phase 5: Activity Tab — Pagination

- [ ] Design and implement the Pagination component
- [ ] Implement server-side pagination (10 rows per page)
- [ ] Display "Showing X–Y of Z" footer with prev/next page controls
- [ ] Ensure pagination respects active filter and sort state
- [ ] Handle edge cases: last page with fewer than 10 items, page 1 disables prev, last page disables next
- [ ] Document Pagination component for design system library

### Phase 6: Empty & Zero-Result States

- [ ] Design and implement the Empty State component (full-page variant)
- [ ] First-run empty state: illustration/icon + "No automation activity yet" heading + description + "Go to Manage" primary CTA
- [ ] Ensure first-run state shows stat cards (with zeroes) but hides filter bar
- [ ] Design and implement inline empty state variant for table area
- [ ] Search no-results: "No results found" in table area
- [ ] Automation filter no-results: "No activity for this automation." in table area
- [ ] Document Empty State component for design system library

### Phase 7: QA, Accessibility & Polish

- [ ] Keyboard navigation: all interactive elements (tabs, search, dropdown, sort, pagination, CTA) are keyboard accessible
- [ ] Screen reader: stat cards use `aria-label` for context, table uses proper `<table>` semantics, sort state announced
- [ ] Colour contrast: verify all text meets 4.5:1 against backgrounds (especially muted/deleted automation text against `--surface-card`)
- [ ] Responsive: verify layout at standard breakpoints (1440px, 1024px, 768px)
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Performance: verify Activity tab loads < 2s with 10,000+ records
- [ ] Verify URL query params for filter/sort/page state support back-button and shareability

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Sidebar reaches 9 primary items** — exceeds the 5–7 recommended maximum, potentially overwhelming navigation | Medium | Monitor sidebar usability post-launch. Consider grouping lower-traffic items (Learning Records, Events) under a "More" section if feedback indicates clutter. Ensure icon + label pairs are highly distinct |
| **Stat card data latency** — eventual consistency means stats could briefly show stale counts after a trigger fires | Low | Accept up to 60s lag for v1 (documented in NFR4). Stat cards are read-only context, not source-of-truth for audits. Add "Last updated" timestamp in v2 if needed |
| **Deleted automation display confusion** — admins may not understand why an automation appears as "Deleted automation" with no way to inspect it | Medium | Italic muted styling + grey dot provides clear visual differentiation. Consider a tooltip on hover: "This automation was deleted on [date]" as a nice-to-have |
| **Large datasets cause slow table rendering** — tenants with 50,000+ triggers could stress pagination/filtering | Medium | Server-side pagination and filtering (NFR2) prevent client-side overload. API should support indexed queries on user name/email, automation ID, and trigger date. Add database indices early |
| **Regression in Courses page** — removing the Automations tab could break deep links, bookmarks, or integrations pointing to the old URL | High | Implement a 301 redirect from the old Courses → Automations tab URL to `/automations`. Announce the navigation change in release notes. Monitor 404s for 30 days post-launch |
| **Filter bar hidden in first-run state causes discoverability gap** — admins who arrive at a zero-state may not realise filtering exists | Low | Once the first trigger fires, the filter bar appears permanently. Stat cards remain visible in the empty state, providing visual continuity. The "Go to Manage" CTA guides the user to the right next action |