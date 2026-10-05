---
ticket: DES-295
summary: Calendar View for both app and web
status: in Design Phase
generated: 2026-05-18T14:37:15.185Z
---

## Research Dossier

### Web Findings

- **[Calendar UI Examples: 33 Inspiring Designs + UX Tips (Eleken)](https://www.eleken.co/blog-posts/calendar-ui)** — Vertical agenda/list views outperform calendar grids for daily planning; card-based event display with date grouping (upcoming/active/past) reduces cognitive load; multi-day events should use continuous visual treatment (color fills, connecting lines); engagement can be boosted through gamification (streaks, badges) à la Duolingo and Habitica.

- **[The Problem with Calendar Views — How to Improve UX on Your Events Page (Stratifi Creative)](https://stratificreative.com/blog/the-problem-with-calendar-views-how-to-improve-ux-on-your-events-page/)** — Calendar grid views create information overload, poor mobile UX, and accessibility issues; list views enable effortless scanning with title, date, time, and location at a glance; most users default to day/week list views even in Google Calendar and Outlook, validating the vertical list approach for this feature.

- **[Luma Event Platform (party.pro)](https://party.pro/luma/)** — Luma's vertical event list with card-based layout, "Upcoming/Past" toggle, date-grouped entries, and community calendar subscriptions is the explicit design reference cited in the ticket; ~2 million users sign up for Luma events monthly, with slick UI praised versus Eventbrite.

- **[Luma UX/UI Design Examples (SaaSFrame)](https://www.saasframe.io/saas/luma)** — SaaSFrame catalogs 24 Luma screens including event registrations, marketing pages, and product UI flows, providing direct reference material for the card and list patterns.

- **[Luma web app UI screens (NicelyDone)](https://nicelydone.club/apps/luma)** — 151 Luma UI screens and 8 marketing screens available for detailed pattern study of the vertical event list approach.

- **[The Ultimate Guide to In-App Nudges 2026 (Plotline)](https://www.plotline.so/blog/in-app-nudges-ultimate-guide)** — Six nudge types (tooltips, animations, spotlights, coachmarks, stories, PiP video) for driving feature discovery and task completion; nudges must be contextual, strategically timed, and non-disruptive; critical for the "discovery nudge" requirement to notify users of pending courses/events.

- **[In-App Nudges: Strategies and Examples (NudgeNow)](https://www.nudgenow.com/blogs/in-app-nudges)** — In-app nudges guide users toward actions without being intrusive; passive indicators (red dots), progress bars, and checklists are effective for pending-task reminders; apps with in-app messages see 3.5x higher user retention.

- **[The UX Hierarchy of In-App Notification Patterns (UX Collective)](https://uxdesign.cc/the-ux-hierarchy-of-in-app-notification-patterns-ff8f702b9f4e)** — Establishes a hierarchy from passive indicators (badges/dots) through banners to full-screen interstitials; pending task nudges should sit at the lower-intrusiveness end (badges, inline banners) to avoid disrupting flow.

- **[Smart Nudges Guide (Apxor)](https://www.apxor.com/blog/a-guide-to-using-smart-nudges-to-enhance-user-experience)** — Nudging appeals to user psychology to promote desired behavior; edtech apps can use progress bars to nudge learners toward lesson completion or streak maintenance; balance discovery with restraint to avoid trust erosion.

- **[How to Increase Engagement in Your LMS (Fit Learning)](https://fitls.com/en/how-to-increase-engagement-in-your-lms/)** — LMS engagement is a persistent challenge—the problem is getting users to access the LMS voluntarily; the solution often requires rethinking the entire experience from design to communication, not just switching platforms; directly supports the rationale for replacing a low-engagement social feed with a calendar/to-do hub.

- **[Calendar View Pattern (UX Patterns for Developers)](https://uxpatterns.dev/patterns/data-display/calendar)** — Covers best practices for date navigation, event display, and calendar interactions; recommends combining a compact month overview (for navigation) with a detailed agenda list (for content), supporting the sidebar + list approach.

- **[SaaS UX Design Best Practices (Mouseflow)](https://mouseflow.com/blog/saas-ux-design-best-practices/)** — Design based on user data, not assumptions; Asana's focus on simplicity and task-focused design is a strong model; be cautious with radical changes to familiar patterns—beta test before full rollout.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Luma | Vertical event list with date badges, thumbnails, "Show Past" button | [View](https://mobbin.com/screens/e6f57ecd-27fe-4341-a7a9-333bda53ac64) | Card-based vertical event list grouped by date with image thumbnails and "Show Past" toggle | **Primary reference** — exact pattern cited in ticket; date badge + thumbnail + title + time per card |
| Luma | Host events dashboard with "Upcoming/Past" toggle and timeline | [View](https://mobbin.com/screens/4c3ab22f-86f9-42b0-80ae-2eb937dc6f2c) | Upcoming/Past segmented control with date-grouped vertical timeline and event cards | Shows how Luma splits upcoming vs. past events with a clean toggle — directly maps to the "previous section" requirement |
| Luma | Past events section with reverse-chronological date-grouped list | [View](https://mobbin.com/screens/f129ba6f-f166-46f4-84c0-dfaaa3155024) | Past events displayed in same card format but in "Past" section with date badges | Reference for how past/overdue items should remain visible and scannable |
| Time2book | Schedule view with "Upcoming/Past" tabs and day-grouped session cards | [View](https://mobbin.com/screens/515b06ca-69c6-475b-97ee-510f26b203dd) | Left sidebar nav + Upcoming/Past tabs + day-grouped appointment cards with time, location, capacity | Strong reference for course/session scheduling in a SaaS context with sidebar navigation |
| Calendly | Scheduled events list with Upcoming/Pending/Past tabs and date grouping | [View](https://mobbin.com/screens/b3e0fae3-2e15-4f7b-bf01-01585ecabf57) | Tab bar (Upcoming/Pending/Past) + Date Range filter + date-grouped event rows + Filter/Export | Shows how to add a "Pending" state and filter/export — relevant for overdue course management |
| Calendly | Event details expanded inline within vertical list | [View](https://mobbin.com/screens/838730bc-e57d-42ab-8467-c166cf5e3de8) | Inline event expansion with reschedule/cancel actions in vertical list context | Reference for "tap card to open" interaction — shows inline expansion vs. navigation |
| Calendly | Filtered scheduled events with advanced filter bar | [View](https://mobbin.com/screens/cb543ef7-922d-4912-bdbf-9e842fe24240) | Advanced filter bar (Teams, Host, Event Types, Status) above date-grouped list | Useful if filtering by course type vs. event type is needed |
| Apple | Upcoming Sessions list grouped by date with "Details" buttons | [View](https://mobbin.com/screens/904d8181-bd78-45e4-a508-98e87bfde2da) | Clean minimal date-grouped session list with title, time range, location, and Details CTA | Reference for minimal, elegant course/session listing with clear CTAs |
| monday.com | "My Work" view with Overdue/Today/This Week/Next Week/Later/Without Date sections | [View](https://mobbin.com/screens/dbe5b273-187f-4f5f-9983-bf7aa7e6bfbd) | Temporal grouping (Overdue → Today → This Week → Next Week → Later → No Date) with item counts | **Key reference** for the date-based sectioning logic (today/this week/month) described in the ticket |
| ClickUp | Task list grouped by due date (Today/Monday/Thursday/Future) with task cards | [View](https://mobbin.com/screens/777d598b-8796-4971-8cc6-c85d8742c975) | Due-date-grouped task list with assignee, priority flags, and "+ New task" per section | Shows how to group heterogeneous items (tasks of different types) by due date — maps to courses + events |
| Todoist | Card-based task view with List/Board/Calendar layout toggle and filters | [View](https://mobbin.com/screens/a8b34ad5-5892-42c4-b5fe-665fa98a3e89) | Layout toggle (List/Board/Calendar) + filter/sort panel + card-based task display | Reference for offering layout options and filter/sort controls alongside card UI |
| Asana | "My tasks" list with Recent/Do Today/Do Next Week/Do Later sections | [View](https://mobbin.com/screens/ef9ce287-ae51-4243-9c7f-4c0be2e5e515) | Collapsible temporal sections (Recently assigned → Do today → Do next week → Do later) with due dates | **Strong reference** for the "one-stop pending view" — sections exactly match the ticket's today/week/month concept |
| Asana | "My tasks" list with Recently Assigned/Do Today/Do Next Week/Do Later/On Hold sections | [View](https://mobbin.com/screens/6e9cb0bb-2696-495e-8953-5bf76cfac755) | Same sectioned layout with additional "On Hold" section | Shows progressive disclosure with an "On Hold" state for paused items |
| Motion | Kanban task board grouped by deadline week with card details | [View](https://mobbin.com/screens/79b98ea0-8a24-42f9-9ca6-3ae680047ef3) | Kanban columns grouped by deadline week (Current / Next week) with todo status cards | Reference for the "Kanban" visual metaphor mentioned in the ticket |
| Craft | Calendar/to-do vertical day view with date blocks and tasks | [View](https://mobbin.com/screens/c0e34ca5-a9e3-4eda-a15f-03b549cdccdf) | Vertical day-by-day timeline with date blocks, inline tasks, and "show previous days" | **Excellent reference** for the vertical calendar + to-do combination — each day is a block with associated tasks |
| Wrike | Dashboard with "To do this week" / "To review" / "Tasks completed" widget cards | [View](https://mobbin.com/screens/d750f820-568f-4a4f-8540-1692449871de) | Dashboard widgets grouping tasks by status (To Do / To Review / Completed) with weekly grouping | Reference for dashboard-style overview that could complement the main calendar list |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Dynamic calendar sidebar | UX Bite | [View](https://builtformars.com/ux-bites/dynamic-calendar-sidebar) | Cron's sidebar highlights the days currently in view with smooth real-time animation, keeping users oriented as they scroll through a vertical calendar — a dynamic overview element helps users navigate temporal lists without losing context. | Directly applicable: a mini-calendar or date indicator sidebar/header that updates as users scroll the vertical event list would solve navigation within the today/week/month scope. |
| Playful empty states | UX Bite | [View](https://builtformars.com/ux-bites/playful-empty-states) | Superlist uses hand-drawn scribbles instead of generic grey placeholders for empty states, exposing brand personality and adding delight — this is an easy, low-cost way to make empty sections feel intentional and engaging. | Directly relevant to the "fun, engaging interface" requirement: when a user has no pending courses or events for today, the empty state is an opportunity for branded delight rather than a dead-end. |
| Reward-based streaks | UX Bite | [View](https://builtformars.com/ux-bites/reward-based-streaks) | Peerlist rewards users with power features (e.g., "more influence," "better profiles") after hitting streak milestones, leveraging the Endowment Effect — earned rewards feel more exclusive and valued because users worked for them. | Maps to the engagement/gamification goal: streaks for completing courses or attending events on consecutive days could drive repeat visits to the Calendar/To-Do view. |
| Setting notification triggers | UX Bite | [View](https://builtformars.com/ux-bites/setting-notification-triggers) | Libby uses a traffic-light system letting users customize how and when they're alerted (email, shelf notice, or ignore) — user-initiated optionality over alerts increases the likelihood of action and reduces notification fatigue. | Critical for the "discovery nudge" requirement: letting users choose notification preferences for pending courses/events (e.g., day-of reminder, week-ahead alert) increases engagement without being intrusive. |
| Dice's wait list | UX Bite | [View](https://builtformars.com/ux-bites/dices-wait-list) | When joining a wait list on Dice, the app contextually prompts users to enable notifications specifically for that event — this "framed reason" approach only appears when notifications are off, turning a permission request into a value proposition. | Relevant to the in-app nudge strategy: when a user adds a course/event to their calendar, prompt them to enable notifications with a contextual reason ("Get reminded when this course is due"). |

**BFM Synthesized Advice (via `bfm_analyze_lessons`):** Combine a dynamic sidebar/header for orientation as users scroll, card-based UI with clear upcoming/past separation, playful branded empty states when no items are pending, customizable notification triggers (inspired by Libby's traffic-light system), and optional streak/milestone mechanics to drive repeat engagement. Each card should support quick actions (mark done, view details) without deep navigation. A/B test notification frequency and optionality to find the right balance between helpful and overwhelming.

### Confidence Check

- `web_searches_performed`: 5
- `mobbin_searches_performed`: 2
- `bfm_lookups_performed`: 3 (2 × `bfm_find_content` + 1 × `bfm_analyze_lessons`)
- `authoritative_sources_fetched`: 3 (Eleken calendar UI guide, Stratifi Creative events page UX, Plotline in-app nudges guide)
- `all_urls_verified`: yes