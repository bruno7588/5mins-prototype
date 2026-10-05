---
ticket: DES-270
summary: Design: Enhanced Team Course Tracker & Weekly Manager Report
status: in Design Phase
generated: 2026-04-14T14:10:02.360Z
---

Now I have gathered substantial research. Let me compile the final dossier with all verified sources.

## Research Dossier

### Web Findings

- **[Pencil & Paper — Dashboard Design UX Patterns Best Practices](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)** — Comprehensive guide to dashboard UX patterns including status color coding (recommending blue for positive, orange for negative as alternatives to red-green), progressive disclosure via hover states and drill-downs, contextual filtering, and the explicit recommendation to "always allow the data to be exported as raw CSVs." Monitoring dashboards should prioritize alerts and warnings for actionable items — directly applicable to overdue/at-risk course surfacing.

- **[NN/g — Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/)** — Nielsen Norman Group's authoritative guide on tab design. Key findings: always use single-row tabs (multi-row destroys spatial memory); never mix in-page tabs and navigation tabs in one control; selection indicators must use at least two methods (e.g., underline + bold); tabs suffer from low discoverability so default tab content gets disproportionate attention; limit to concise 1–2 word labels; arrange highest-use content as the default selection. Critical for the proposed Course Progress / Engagement / Learning Records tab structure.

- **[UXPin — Effective Dashboard Design Principles for 2025](https://www.uxpin.com/studio/blog/dashboard-design-principles/)** — Recommends top-rail layouts for dashboards where the primary question is "Are we on track?" — ideal for a compliance/training tracker. Emphasizes F-pattern scanning behavior (important data top-left), accessible color schemes with redundant visual cues, and keeping cognitive load low through intentional information hierarchy.

- **[SafetyCulture — Performance Dashboard Help](https://help.safetyculture.com/en-US/003476/)** — Real-world example of a tab-based training compliance tracker for managers with tabs for Overview (summary KPIs), Courses (performance detail), and Groups (team segments). Each tab has its own filters, and columns can be shown/hidden — a close analog to the proposed Course Progress tab with timeframe dropdown.

- **[iSpring — LMS Dashboard](https://www.ispring.com/knowledge-hub/lms-dashboard)** — Enterprise LMS dashboard that highlights overdue courses, expired certifications, failed enrollments, and inactive learners as separate supervisor alert categories. Allows drill-down from team-level summaries into individual learner profiles with enrolled courses, points, badges, and certificates. Demonstrates the pattern of separating "at risk" and "overdue" into distinct status categories.

- **[Dashboard Design Patterns (Academic Resource)](https://dashboarddesignpatterns.github.io/)** — A scholarly collection of dashboard design patterns supporting creative exploration. Categorizes dashboard archetypes (monitoring, analytical, operational) and maps component patterns to user tasks — useful for grounding the Course Progress tracker as a monitoring dashboard.

- **[Carbon Design System — Export Pattern](https://carbondesignsystem.com/community/patterns/export-pattern/)** — IBM's design system guidance for data export. Recommends: single-click export when no configuration needed; modal with editable filename when naming is required; radio buttons for 2–5 format options with sensible default; passive modal or notification for success feedback; inline error display on failure. Directly applicable to the CSV download feature for Learning Records.

- **[Smashing Magazine — Designing an Attractive and Usable Data Importer](https://www.smashingmagazine.com/2020/12/designing-attractive-usable-data-importer-app/)** — Covers the full import/export pipeline UX. Recommends making the primary action (export) highest visual priority, providing clear feedback on progress, and testing with real users especially on critical data flows.

- **[ScholarLMS — Platform Updates March 2026](https://www.scholarlms.com/platform-updates-march-2026/)** — Recent LMS update showing industry trend toward redesigned admin dashboards that surface important information more prominently, including Smart Search for quick navigation across the platform. Demonstrates current market expectations for LMS management UIs.

- **[Educate-me — LMS Dashboard: Top 10 Examples](https://www.educate-me.co/blog/lms-dashboard)** — Survey of LMS dashboards including SkyPrep (attention items, deadline tracking, achievement tracker, group/course stats) and 360Learning (completion rates, participation tracking, per-learner stats). Validates the pattern of combining progress tracking with engagement/leaderboard features in learning platforms.

- **[RiseApps — LMS UI/UX Design: 3 Tips That Still Work in 2025](https://riseapps.co/lms-ui-ux-design/)** — Emphasizes role-based views (manager vs. learner), developing specific personas for LMS users, and that 88% of users are less likely to use a platform with poor design. Supports the need for a manager-specific "My Team" experience distinct from the learner view.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|---------------|-----|---------|-----------|
| Remote (Web) | Team Members screen | [mobbin.com/explore/screens/d357e22d…](https://mobbin.com/explore/screens/d357e22d-de8b-4fe0-9871-d7b9edb35985) | Data table with search, filters, and "Add new member" CTA | Close analog for the Course Progress tracker table layout — shows scannable team member list with action buttons and filter controls |
| Attio (Web) | Article Detail with status indicators | [mobbin.com/explore/screens/954879aa…](https://mobbin.com/explore/screens/954879aa-46c3-4214-b530-f9098e2b1ae2) | Side navigation, badge, status dot, tree, accordion, table | Demonstrates combining status dots + badges for immediate visual status communication — applicable to at-risk/overdue indicator design |
| Duolingo (Web) | Learning App Dashboard | [mobbin.com/explore/screens/1015e7a5…](https://mobbin.com/explore/screens/1015e7a5-0d19-4433-8151-0291a2e09916) | Dashboard with leaderboard standings, XP progress, learning options | Reference for the Engagement tab — shows how to combine leaderboard with progress indicators in a learning context |
| Duolingo (Web) | Top 10 Bronze League Leaderboard | [mobbin.com/explore/screens/ea68b943…](https://mobbin.com/explore/screens/ea68b943-3de2-46c6-a9f8-339d28e2c781) | Stacked list with avatars, status dots, badges, XP rankings | Direct reference for the Engagement leaderboard sub-feature — ranked list with avatar, status indicator, and score per user |
| Duolingo (Web) | Unlocked Leaderboard (Bronze League) | [mobbin.com/explore/screens/1b123798…](https://mobbin.com/explore/screens/1b123798-af7b-4f99-997b-095dad24ecda) | Progress indicator, tooltip, stacked list, avatar, coach marks | Shows tiered league system with progress indicators — informs engagement tab's competitive/motivation mechanics |
| incident.io (Web) | Exporting incidents to CSV flow | [mobbin.com/explore/flows/42ef7a42…](https://mobbin.com/explore/flows/42ef7a42-111c-476f-bacc-d5e99600dca7) | 3-step CSV export: list view → customization (checkbox toggles for private data) → download | Direct reference for Learning Records CSV download — demonstrates field selection, privacy controls, and sequential modal progression |
| Duolingo (Android) | Leaderboard Flow | [mobbin.com/explore/flows/9381d8cd…](https://mobbin.com/explore/flows/9381d8cd-e0da-4e3a-a02d-823e56223b48) | 2-screen dynamic leaderboard with ranking updates | Shows flow for viewing progress and comparing rankings — informs Engagement tab leaderboard interaction pattern |

### Confidence Check
- `web_searches_performed`: 10
- `mobbin_flows_fetched`: 7 (5 screen pages + 2 flow pages, all specific app screens/flows — not category landing pages)
- `authoritative_sources_fetched`: 2 (NN/g "Tabs, Used Right" via WebFetch; Pencil & Paper Dashboard UX Patterns via WebFetch)
- `all_urls_verified`: yes