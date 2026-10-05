---
ticket: DES-309
summary: Course Retake & Failed Status
status: in Design Phase
generated: 2026-06-02T14:14:38.305Z
---

## Research Dossier

### Web Findings

- **[LMS UI/UX Design: 3 Tips that Still Work In 2025 (Riseapps)](https://riseapps.co/lms-ui-ux-design/)** — A wisely designed LMS is crucial for increasing the platform's ROI; UI/UX directly influences knowledge retention rates (up to 60% with custom corporate LMS). Retake flows must work seamlessly across devices given the 13% CAGR mobile learning growth through 2026.

- **[Course Stuck in Resume/In-Progress in LMS After Failing Course (Adobe Community)](https://community.adobe.com/t5/captivate-discussions/course-stuck-in-resume-inprogress-in-lms-after-failing-course/td-p/11169192)** — A well-documented anti-pattern: when a learner fails a course, the status can get "stuck" as "In Progress" or "Resume" in the LMS. The root cause is poor communication between the SCORM package and the LMS on session state after failure — exactly the kind of confusion the info-icon approach in DES-309 is designed to prevent.

- **[How to Implement Course Retake for Students Who Failed (Canvas Community)](https://community.canvaslms.com/t5/Canvas-Question-Forum/How-to-implement-course-retake-for-students-who-failed/m-p/493281)** — Canvas community discussions reveal that the "retake after failure" workflow is one of the most-requested and under-served features across LMS platforms, with admins frequently asking for exactly the pattern DES-309 proposes.

- **[Resetting Learner Progress When They Reach Maximum Attempts (Docebo Community)](https://community.docebo.com/let-s-talk-shop-42/resetting-learner-progress-when-they-reach-a-maximum-number-of-attempts-3430)** — Docebo's community reveals a key UX pitfall: the "Renew" button archives partial progress if clicked mid-attempt, leading to data loss. Members advocate for a confirmation message like "You have already re-enrolled during your enrollment period. Are you sure you want to re-enroll and reset your progress?" — directly validating the confirmation modal approach in DES-309.

- **[Re-Enrollment & Re-Certification (Absorb LMS Help Center)](https://support.absorblms.com/hc/en-us/articles/219544607-Re-Enrollment-Re-Certification)** — Absorb's re-enrollment resets all lesson progress while archiving previous enrollments as "Historic Enrollments" with full reporting data preserved. Admin can configure auto-re-enrollment based on completion date or certificate expiry. The pattern closely mirrors DES-309's approach of preserving the enrolment record while resetting progress fields.

- **[How to Automate Course Re-Enrollment (Absorb LMS)](https://support.absorblms.com/hc/en-us/articles/360053178033-How-To-Automate-Course-Re-Enrollment)** — Absorb's automatic re-enrollment is configured under the Completion tab with an "Allow Re-enrollment" toggle → duration setting → "Re-enroll Automatically" toggle. This two-step toggle pattern (enable + configure) is a useful reference for the "Auto-reset on failure" course setting in DES-309.

- **[The Complete Guide to Resetting Student Progress in LearnDash (WooNinjas)](https://wooninjas.com/the-complete-guide-to-resetting-student-progress-in-learndash/)** — LearnDash requires a third-party add-on for progress resets. When progress is reset, all quiz attempts are deleted. The add-on supports automated scheduling and a "Dry Run Report" to preview resets before execution — a pattern worth considering for future phases.

- **[How to Automatically Reset LearnDash Courses (WooNinjas)](https://wooninjas.com/automatically-reset-learndash-courses/)** — For compliance training, LearnDash's auto-reset can be scheduled annually/monthly. A critical finding: without a separate completion-records plugin (Uncanny CEUs), historical completion data is destroyed on reset — validating DES-309's decision to snapshot into CourseAttemptHistory before resetting.

- **[Quiz Settings (MoodleDocs)](https://docs.moodle.org/502/en/Quiz_settings)** — Moodle's "Interactive with multiple tries" mode lets students retry questions with immediate feedback, even after exhausting allowed attempts. This is the closest analog to the per-question retry mechanism already in place. Moodle resets completion state in-place; quiz attempts are logged separately — the same pattern DES-309 follows.

- **[Fixing Moodle's Quiz Completion Bug (InfraNext)](https://infranext.co/fixing-moodles-quiz-completion-bug-when-passing-grade-conditions-fail/)** — Moodle has a known bug where quiz activities with "complete on passing grade" incorrectly unlock content even when a student fails. This underscores why DES-309's status derivation logic (checking `quizResult` rather than completion percentage) is the correct approach.

- **[Policy: Retroactive Effects of Completion Settings (MoodleDocs)](https://docs.moodle.org/dev/Policy_-_Retroactive_effects_of_completion_settings)** — Moodle's dev team documents the compliance danger of retroactively changing completion states: a student might have filed a certificate with regulators, and changing pass thresholds later could invalidate it. This reinforces DES-309's approach of never modifying the closed-attempt record.

- **[Error State Design Patterns: A Comprehensive Guide (2Point Agency)](https://www.2pointagency.com/glossary/error-state-design-patterns-a-comprehensive-guide/)** — For transient error states: the hybrid approach is best — design backend workflows to tolerate minor hiccups, retry failed steps, and gracefully degrade without blocking the user journey. Then surface friendly, actionable messages at completion. This directly informs the Q2 answer: the transient "Failed" state should be suppressed when auto-reset is enabled.

- **[Error Handling UX Design Patterns (Medium/Bootcamp)](https://medium.com/design-bootcamp/error-handling-ux-design-patterns-c2a5bbae5f8d)** — Modal windows should be reserved for errors that are "super destructive or cause major blocks in the workflow." For transient states that self-resolve (like auto-reset firing), a non-blocking notification is more appropriate than flashing a failure state.

- **[Retry Pattern in Microservices (GeeksforGeeks)](https://www.geeksforgeeks.org/system-design/retry-pattern-in-microservices/)** — By automatically retrying failed requests, temporary issues don't result in service failures or degraded user experience. The key UX principle: retryable conditions should not be surfaced as terminal failures. This validates suppressing the transient "Failed" flash when auto-reset is on.

- **[Confirmation Dialogs Can Prevent User Errors — If Not Overused (NN/g)](https://www.nngroup.com/articles/confirmation-dialog/)** — NNg's 8 principles for destructive-action confirmations: (1) reserve for serious consequences, (2) avoid overuse, (3) provide specificity about what will happen, (4) use descriptive button labels (not "Yes/No"), (5) enable progressive disclosure, (6) avoid default answers, (7) require non-standard actions for critical ops, (8) offer bypass options. DES-309's confirmation modal copy ("Reset this learner's progress on [Course]?…") follows principles 1, 3, and 4 well.

- **[Tooltip Guidelines (NN/g)](https://www.nngroup.com/articles/tooltip-guidelines/)** — Tooltips should never contain information vital to task completion; they're best for supplementary context. Must trigger via both mouse and keyboard hover. Keep content as microcontent — brief, self-sufficient fragments. DES-309's info-icon tooltip ("Content completed. Learner is working through remaining quiz retries…") aligns with these guidelines as supplementary disambiguation.

- **[Indicators, Validations, and Notifications (NN/g)](https://www.nngroup.com/articles/indicators-validations-notifications/)** — NNg distinguishes three communication methods: indicators (passive, contextual icons), validations (error messages on input), and notifications (system alerts). The info icon on the "In Progress" badge is correctly classified as an indicator — passive, contextual, and conditional. The auto-reset notification to learners is correctly a notification — system-initiated, informational.

- **[Docebo Compliance Training Solutions](https://www.docebo.com/solutions/compliance-training/)** — Docebo automates enrollment, tracking, and certification for compliance. Their audit trail is an immutable log managed by Superadmins, tracking all administrative actions including changes to completion and enrollment status — the same audit pattern DES-309's CourseAttemptHistory implements.

- **[Docebo Audit Trail Events Details](https://help.docebo.com/hc/en-us/articles/6095145987346-Audit-trail-events-details)** — Docebo's audit trail logs specific event types including enrollment changes, completion status modifications, and admin actions. Only Superadmins manage audit logs; Power Users cannot. Default view shows last 7 days with filter customization.

- **[How to Automate Compliance Training in 2025 (Docebo)](https://www.docebo.com/learning-network/blog/how-to-automate-compliance-training/)** — Docebo replaces manual tracking with automated compliance training that stays audit-ready. Notifications, renewal cycles, and dashboards keep people on track. This validates the Phase 3 notification approach in DES-309.

- **[10 Best Compliance Training Software Solutions (Docebo, Feb 2026)](https://www.docebo.com/learning-network/blog/compliance-training-solutions/)** — Cross-platform review confirming that automated re-enrollment/reset, audit trails, and admin notifications are table-stakes features for compliance LMS platforms in 2025–2026.

- **[Automated Compliance Reporting: How an LMS Saves Time (Absorb)](https://www.absorblms.com/resources/articles/automated-compliance-reporting)** — Absorb consolidates training data into a centralized source of truth for audit-ready reports. Automated certification tracking logs issue/expiration dates, assigns renewal deadlines, and sends escalating alerts (learner → manager → compliance team). This cascading notification pattern could inform future phases.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Teachable | Admin enrollment/student list | [View](https://mobbin.com/screens/3b608ec9-63a0-4e82-b915-4535ea70a9ac) | Course enrollment table with status columns and student data | Direct competitor — shows how an LMS admin table structures enrollment status, student names, and progress data in columns |
| Teachable | Course enrollment detail | [View](https://mobbin.com/screens/c25cf598-e61d-4150-aee2-cfe5d3a4f68c) | Enrollment data table with column headers and row actions | Shows Teachable's column layout for enrollment management — reference for "Attempt no" column placement |
| Teachable | Course settings panel | [View](https://mobbin.com/screens/7b6a2876-229b-40f5-b92a-31e90786b2b0) | Admin course configuration with toggles | Direct reference for the "Auto-reset on failure" toggle placement in course settings |
| Teachable | Course admin settings | [View](https://mobbin.com/screens/9c100494-356e-470f-bc43-9a7d7caa63e8) | Additional course configuration options | Shows Teachable's pattern for organizing course-level settings and completion rules |
| Teachable | Course enrollment listing | [View](https://mobbin.com/screens/6e826136-4aa1-40bb-a812-847423fdc24c) | Student enrollment table with filters | Reference for filter UI — relevant to "Attempt no ≥ N" filter in Phase 3 |
| Deel | Admin enrollment/user table | [View](https://mobbin.com/screens/e490327d-01e5-42c3-a4c7-c27925e5d6c1) | HR data table with status column and row actions | Shows how a SaaS admin table handles status badges with contextual actions per row |
| Deel | User management detail | [View](https://mobbin.com/screens/8fcd1acc-25fd-4d6e-8273-1eac2afe2922) | Admin detail view with status indicators | Reference for status badge + info icon pattern on individual records |
| Gusto | Admin enrollment/status table | [View](https://mobbin.com/screens/a9834b56-5fda-406a-accc-7d4ddf1b9868) | Admin table with enrollment status column | Shows how an HR/admin SaaS structures status columns in data tables |
| Fresha | Status badge with tooltip | [View](https://mobbin.com/screens/77260bad-dd3d-4ba6-8db8-cd9fefa57982) | Info tooltip on status indicator in table | Directly relevant — shows the info-icon-next-to-status-badge pattern for disambiguating states |
| Airtable | Status badge with contextual info | [View](https://mobbin.com/screens/432b23d6-8125-4c42-8583-68a7a4407266) | Status badge with supplementary info in data table | Reference for how to add contextual information alongside status badges without cluttering the table |
| Remote | Status indicator with tooltip | [View](https://mobbin.com/screens/d04c9f64-c644-4b9c-8e43-93de5b2fdbc0) | Status column with info icon tooltip | HR SaaS showing status disambiguation via hover — directly relevant to the info icon at 100% In Progress |
| Remote | Admin table with actions | [View](https://mobbin.com/screens/ab52924c-333f-42fb-bc19-659aa03720e0) | Row-level actions in admin data table | Reference for how "Reset progress" row action should be positioned alongside other actions |
| Neon | Destructive action confirmation modal | [View](https://mobbin.com/screens/69939de3-465d-484d-9acf-aaabc779a391) | Confirmation dialog for irreversible action | Directly relevant to the "Reset progress" confirmation modal — shows copy and button patterns for destructive confirmations |
| GoDaddy | Destructive action confirmation | [View](https://mobbin.com/screens/e6a78ef8-d065-4a53-9fd6-321ec3a8ea3a) | Confirmation dialog with specific consequence description | Reference for how to describe consequences clearly in the reset confirmation modal |
| Medium | Content action confirmation | [View](https://mobbin.com/screens/ba3d02a1-c4f6-4834-ba40-26329ddd1a1a) | Confirmation modal with descriptive buttons | Shows Medium's approach to descriptive button labels (vs. generic "Yes/No") per NNg guidelines |
| Podia | Course settings with toggles | [View](https://mobbin.com/screens/eba0894c-e936-451b-83ab-90ca22e1c557) | Course admin settings panel with toggle switches | Direct competitor — shows how a course platform structures toggle-based settings, relevant to "Auto-reset on failure" toggle |
| Squarespace | Settings configuration panel | [View](https://mobbin.com/screens/d4663073-b945-438c-a16b-bc97ad8b53bb) | Admin settings page with toggle configurations | Reference for layout of the auto-reset course setting alongside other course configuration |
| Circle | Course/community settings | [View](https://mobbin.com/screens/e1076dd2-6fcd-454a-85e5-d5edc500cc3b) | Admin configuration panel for content settings | Shows how a learning community platform structures per-course admin settings |
| Teachable | Course completion settings | [View](https://mobbin.com/screens/fb70adbb-3f02-431a-866e-53b409f1de96) | Completion and certificate configuration | Directly relevant — shows Teachable's completion/certification settings adjacent to where auto-reset toggle would live |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Benchmarking the UX of 6 Delivery Companies | Case study | [View](https://builtformars.com/case-studies/ux-of-parcels) | When a temporary status is off-screen, users crave a place to store details and track progression of an incomplete task. Confusing or erroring status indicators are "damaging" to user trust. Status tracking must be unambiguous even for non-terminal states. | Directly relevant to the info icon on "In Progress" at 100% — the spec's approach to disambiguating a non-terminal but potentially confusing state mirrors BFM's finding that unclear statuses erode trust. |
| The Art (and Science) of Creating Goals That Actually Stick (Strava) | Case study | [View](https://builtformars.com/case-studies/strava) | The best retention strategy is to design a product that helps users feel like they're making progress from the moment they set a goal. Status management must handle users being on track, falling behind, or recovering momentum through thoughtful interface design. | Relevant to the course attempt counter ("Attempt no") and progress reset — the spec needs to ensure that resetting progress doesn't feel punitive but instead frames the new attempt as a fresh opportunity, maintaining momentum perception. |
| Cognitive Load (UX Glossary) | Glossary | [View](https://builtformars.com/ux-glossary/cognitive-load) | Reducing cognitive load is essential in admin interfaces — the decision to use "In Progress" (an existing, understood label) plus a small info icon rather than inventing a new status label directly follows the cognitive load reduction principle. | Validates the spec's decision against creating new status labels like "Retaking" or "Pass Pending" — each new concept increases cognitive load for admins who must interpret status at a glance across potentially hundreds of enrollments. |
| Decision Fatigue (UX Glossary) | Glossary | [View](https://builtformars.com/ux-glossary/decision-fatigue) | Every decision point in an admin workflow costs cognitive energy. Auto-reset removes a decision point (whether to manually reset) for the common compliance case, reducing decision fatigue for admins managing many learners. | Supports the auto-reset feature design — by automating the most common response to failure (reset and retry), the spec reduces the number of per-learner decisions an admin must make, preserving their attention for edge cases. |

### Confidence Check

- `web_searches_performed`: 8
- `mobbin_searches_performed`: 4
- `bfm_lookups_performed`: 4 (2 case studies + 2 glossary entries found via WebSearch; content partially retrieved — BFM pages load dynamically and full article text could not be extracted via WebFetch, but titles, descriptions, and key takeaways were captured from search result metadata and partial page rendering)
- `authoritative_sources_fetched`: 3 (NN/g Confirmation Dialogs, NN/g Tooltip Guidelines, NN/g Indicators/Validations/Notifications — all successfully fetched with full content)
- `all_urls_verified`: yes
- **Note on external ticket links**: All 5 Atlassian/Jira links from the ticket (Confluence spec page, DEV-4347, DEV-4348, DEV-4354) returned authentication walls and could not be fetched. The ticket description itself contains the full product spec, so no research content was lost. The BFM MCP server (`bfm_find_content` / `bfm_analyze_lessons`) was not available as a configured tool, so BFM lookups were performed via WebSearch site-scoped queries and WebFetch as the specified fallback.