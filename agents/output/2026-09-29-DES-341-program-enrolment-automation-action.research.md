---
ticket: DES-341
summary: Program enrolment automation action
status: In Design Phase
generated: 2026-09-29T18:20:22.441Z
---

## Research Dossier

### Web findings

- **[Designing Automation Rules in DelightChat (Medium)](https://shrutichaturvedi98.medium.com/designing-automation-rules-in-delightchat-892a03b2e9e0)** — Covers the standard trigger-condition-action UX structure for rule builders. Recommends progressive disclosure: a top-level template selection lets users see common examples first, with a "start from scratch" option for advanced users.

- **[Rule Builder design pattern (UI Patterns)](https://ui-patterns.com/patterns/rule-builder)** — Documents the canonical rule-builder pattern: rules contain grouped conditions with AND/OR logic, and fire a set of actions when matched. Aligns directly with the existing automation builder structure described in the ticket.

- **[PatternFly Date Picker design guidelines](https://www.patternfly.org/components/date-and-time/date-picker/design-guidelines/)** — Recommends preselecting common date options (e.g. "Execute now" or "Schedule for later") in scheduling forms. Date picker fields should only appear when the user opts for scheduled execution, reducing cognitive load via progressive disclosure.

- **[Date-Input Form Fields: UX Design Guidelines (NN/g)](https://www.nngroup.com/articles/date-input/)** — Calendar pickers work best for dates within one year of the present. For further-out dates, text input is more efficient. Systems should accept flexible date formats (dashes, slashes, dots). Illogical date options (e.g. past dates when scheduling future enrolment) should be disabled and greyed out.

- **[Choosing the Right Automation Approach for Your LMS Ecosystem (eLearning Industry)](https://elearningindustry.com/choosing-the-right-automation-approach-for-your-lms-ecosystem)** — Emphasises that rerunning a workflow must not double-enrol a learner. Recommends unique IDs, "already processed" checks, and idempotent API calls. Suggests using event-driven triggers for learner-facing moments and schedules for compliance batch operations. Advises documenting purpose, triggers, inputs/outputs, and error handling for each workflow.

- **[Idempotency in Distributed Systems (Dev.to)](https://dev.to/aloknecessary/idempotency-in-distributed-systems-design-patterns-beyond-retry-safely-k66)** — Covers upsert operations (INSERT or UPDATE if exists) as a naturally idempotent pattern. Also recommends the two-phase reservation approach (atomically insert key as IN_PROGRESS, then update to COMPLETED) to eliminate race conditions during concurrent duplicate requests. Directly relevant to "silently skip" requirement.

- **[Kajabi vs Teachable (Zapier)](https://zapier.com/blog/kajabi-vs-teachable/)** — Kajabi stands out among LMS platforms for its native automation rules tied to enrolment: automations fire based on quiz outcomes, assignment submissions, and can drip-release content. Teachable's drip is time-based only. Thinkific supports prerequisites (quiz pass, video watch percentage) for program progression. These represent the competitive landscape for program-level automation.

- **[Audit logging for internal tools (AppMaster)](https://appmaster.io/blog/audit-logging-internal-tools-activity-feed)** — Recommends an append-only event log data model for admin activity feeds: each row stores actor, timestamp, action type, target entity, and a JSON payload. Entries must be immutable. For automation-triggered actions, set `actor_type` to `system` and store the automation name as the actor label. Timeline layout: newest first, one row per event, with drill-down for detail.

- **[Building Audit Trails for Automated Workflows (GS Consulting)](https://gsconsultingllc.com/insights/building-audit-trails-automated-workflows)** — For automated workflow logs, use consistent structured fields (event ID, correlation ID, workflow name, step, actor, timestamp, result). Apply append-only patterns and restricted write access for critical events.

- **[NNgroup: 4 Principles to Reduce Cognitive Load](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)** — Progressive disclosure is one of four key principles for reducing cognitive load. Show only what is relevant to the current task; hide advanced options behind a user action. Directly supports the pattern of revealing the date picker only when "Specific date" is selected.

### Mobbin UX references

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Contractbook | Automation rule builder with action config | [View](https://mobbin.com/screens/69c87003-6f25-4214-9597-346982c51977) | Trigger-condition-action rule builder with dropdown configuration | Direct parallel to the automation builder where the new program action will be added |
| Coda | Automation action configuration | [View](https://mobbin.com/screens/91c18f06-72a8-4440-81f7-d4ace2d322be) | Automation rule setup with action type selection and conditional fields | Shows how a SaaS tool structures action configuration within a rule builder |
| Calendly | Scheduling configuration with date/time options | [View](https://mobbin.com/screens/9ef6225d-5ae2-40e1-bb9c-cc25c65e4497) | Scheduling form with timing options and date picker | Reference for immediate vs scheduled timing selection in a configuration panel |
| ClickUp | Automation action dropdown and rule builder | [View](https://mobbin.com/screens/a46d689b-a3fc-46fc-bba6-652fde9bdbe6) | Automation builder with action type selection | Pattern for adding new action types alongside existing ones in a rule builder |
| Kit | Automation rule builder with action config | [View](https://mobbin.com/screens/d1a77063-7b00-4c6e-852a-879f095085e0) | Email/action automation configuration | Shows how an action row is configured with timing within an automation |
| Kajabi | Enrolment scheduling admin panel | [View](https://mobbin.com/screens/6dde802e-25ed-4ac1-ad8a-9f6625b61ea8) | LMS-style admin configuration for enrolment | Directly relevant: Kajabi is a course/program platform with enrolment scheduling |
| Teachable | Enrolment configuration in admin | [View](https://mobbin.com/screens/ad1ce4b9-6b3f-4869-917d-bcdc28351f01) | Course/program admin setup with scheduling | Competitor LMS enrolment configuration pattern |
| Gusto | Scheduling config with immediate/date options | [View](https://mobbin.com/screens/780e913a-4dc8-4c11-a5c0-e0d64b8b22f2) | Admin panel with timing selection (now vs specific date) | Pattern for "immediate vs specific date" dropdown with conditional date picker reveal |
| Podia | Enrolment/membership admin config | [View](https://mobbin.com/screens/5e1327bc-13f0-40ab-8536-5d8984413f34) | Course platform admin enrolment settings | Competitor LMS enrolment flow reference |

### Built for Mars lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Avoiding duplicate payments | UX bite | [View](https://builtformars.com/ux-bites/avoiding-duplicate-payments) | Capital One detects when a user tries to make a payment that duplicates an existing automatic payment, and asks them to confirm or skip. The system proactively surfaces the conflict rather than silently processing a duplicate. | Directly relevant to the idempotency requirement: when the automation fires for an already-enrolled user, the system should silently skip but log the trigger, similar to how financial products handle duplicate actions. |
| Wait, is this a duplicate? | UX bite | [View](https://builtformars.com/ux-bites/wait-is-this-a-duplicate) | Monzo warns users when they attempt a transfer identical to a recent one, showing how long ago the last identical action occurred. | Reinforces the "records a trigger" requirement: even when skipping a duplicate enrolment, the system should log the attempt. The ticket specifies silent skip, which is the right call for automated (non-interactive) actions. |
| Hiding the advanced onboarding | UX bite | [View](https://builtformars.com/ux-bites/hiding-the-advanced-onboarding) | Stuff hides advanced options behind a collapsible section, a form of progressive disclosure that keeps the primary list short and focused while making advanced options discoverable. | Supports the UI pattern for the enrolment column: default to "Immediate" (the common case) and only reveal the date picker when "Specific date" is selected, keeping the action row compact. |
| Suggested field types | UX bite | [View](https://builtformars.com/ux-bites/suggested-field-types) | Notion suggests new field types based on existing table content, reducing the cognitive load of configuring new columns. | Applicable to the "add Program alongside Course" pattern: when an admin adds a new action row, the search/selector could differentiate programs from courses clearly (e.g. with type labels or icons) to avoid confusion. |
| Progressively disclosing an upsell | UX bite | [View](https://builtformars.com/ux-bites/progressively-disclosing-an-upsell) | Impulse uses progressive disclosure to reveal options only after the user has context for them, avoiding information overload. | General pattern support: the date picker should only appear after the user selects "Specific date", not before. Progressive disclosure keeps the action configuration row clean. |

**Synthesised advice from BFM analyse_lessons:** Progressive disclosure is the consistent thread across BFM sources. For an admin automation builder, the recommended pattern is: (1) default the enrolment timing dropdown to "Immediate" as the most common case; (2) reveal the date picker only when "Specific date" is chosen; (3) clearly differentiate programs from courses in the search/selector (using labels, icons, or grouping); (4) for duplicate/idempotent handling, log every trigger attempt even when silently skipping, so the Activity tab always has a complete record.

### Confidence check

- `web_searches_performed`: 5
- `mobbin_searches_performed`: 2
- `bfm_lookups_performed`: 4 (3 via `bfm_find_content`, 1 via `bfm_analyze_lessons`)
- `authoritative_sources_fetched`: 2 (NN/g date-input article, PatternFly date picker guidelines)
- `all_urls_verified`: yes