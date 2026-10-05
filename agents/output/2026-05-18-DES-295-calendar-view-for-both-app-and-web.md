---
ticket: DES-295
summary: Calendar View for both app and web
status: in Design Phase
generated: 2026-05-18T14:37:15.185Z
---



# PRD: Calendar View for Both App and Web

## 1. Overview

The platform's mobile navigation currently dedicates a prime tab-bar slot to a social feed that has the lowest engagement of any feature. Meanwhile, learners have no single place to see all their pending courses and upcoming events — these items are scattered across workspace views with no unified, time-based perspective.

This ticket replaces the social feed tab (app) and adds a new left-menu item (web) with a **Calendar/To-Do view**: a vertical, card-based list that groups courses by due date and events by event date, giving learners a one-stop hub to answer *"What do I need to do today, this week, and beyond?"* The initial implementation scope is **web only**, with cross-platform parity planned for a subsequent phase.

---

## 2. Jobs To Be Done

### Main Job

**When I open the platform, I want to instantly see every course and event that needs my attention — ordered by when they're due — so I can plan my learning without hunting across multiple screens.**

### Job Map

| Stage | What the User Does | Current Pain / Workaround |
|---|---|---|
| **Define** | Decide what learning or events need attention today | No unified view — learner must mentally compile from workspace tiles, notification emails, and calendar invites |
| **Locate** | Find the specific course or event | Courses and events live on separate pages; learner clicks through multiple nav items |
| **Prepare** | Understand urgency / due dates | Due dates are visible only inside individual course detail pages; no at-a-glance temporal grouping |
| **Confirm** | Verify nothing is missed | No "overdue" or "upcoming this week" grouping — easy to overlook items |
| **Execute** | Open and complete the course / attend the event | Tap-through works, but returning to context is disorienting (no "back to list" continuity) |
| **Monitor** | Track what's done vs. remaining | No consolidated progress snapshot; workspace shows completion but not time-based urgency |
| **Resolve** | Review past completions | Past events/courses vanish from prominence — no "previous" archive for reflection |

### Related Jobs

- **Stay informed about platform activity** — currently served by the social feed (being deprecated/moved) and notifications.
- **Manage my workspace tasks** — the existing workspace view handles project/task-level work; Calendar/To-Do must complement, not duplicate, this.
- **Receive timely reminders** — in-app nudges and notification triggers are adjacent jobs that amplify the Calendar/To-Do view's value.

### Emotional & Social Dimensions

- **Emotional:** Learners want to feel *in control* and *on top of things* — not anxious about missing a deadline or forgetting an event. A clean, date-sectioned view delivers calm confidence.
- **Social:** In team settings, completing courses on time signals diligence and professionalism. A visible "streak" or progress indicator can reinforce positive identity.
- **Delight:** The ticket explicitly calls for a "fun, engaging interface." Learners should feel a small spark of satisfaction when they see an empty "Today" section (everything done!) or a playful empty state.

---

## 3. Goals

1. **Consolidate courses and events into a single, time-ordered view** so learners never need to visit multiple pages to understand what's pending.
2. **Replace the lowest-engagement navigation element (social feed)** with a high-utility feature that earns its prime real estate.
3. **Use simple date-based logic** (no complex pass/fail) — items are grouped by temporal urgency (Overdue → Today → This Week → Later → Previous/Past).
4. **Create a delightful, card-based vertical list** inspired by Luma's event page, with enough visual interest to drive habitual check-ins.
5. **Implement discovery nudges** that contextually alert learners to pending items without being intrusive.
6. **Achieve web implementation first**, with design decisions that enable future mobile parity with minimal rework.

---

## 4. Job Stories

### Viewing & Planning

- **When** I log in at the start of my day, **I want to** see all courses due today and events happening today at the top of my Calendar/To-Do, **so I can** immediately prioritize my time.
- **When** I finish a task and have spare time, **I want to** glance at "This Week" and "Later" sections, **so I can** pull work forward and stay ahead.
- **When** I have a multi-day event (e.g., a 3-day workshop), **I want to** see it represented across all relevant days with a clear date range, **so I** don't lose track of ongoing commitments.

### Acting on Items

- **When** I tap a course card, **I want to** be taken directly into the course, **so I can** start learning without extra clicks.
- **When** I complete a course or an event passes, **I want** the card to move into a "Previous" section automatically, **so** my active list stays clean and focused.
- **When** I see an overdue course in a prominent "Overdue" section, **I want to** understand how late it is, **so I can** decide whether to tackle it now or escalate.

### Discovering & Being Nudged

- **When** I have pending items due today, **I want to** see a subtle badge or indicator on the Calendar/To-Do icon in the nav, **so I** know there's something waiting without having to open the view.
- **When** I add or am assigned a new course/event, **I want** an option to set my own reminder preferences, **so I** receive alerts that are helpful rather than noisy.
- **When** the Calendar/To-Do view is empty for a given section, **I want to** see a playful, branded empty state, **so** the experience still feels alive and encouraging.

### Navigation Changes

- **When** I look for the social feed on web, **I want to** find it merged into the Notifications icon, **so I** still have access without it cluttering the primary navigation.
- **When** I use the left-side menu on web, **I want to** see a "Calendar/To-Do" item with a calendar icon, **so I** can access my unified schedule from the main nav.

---

## 5. Requirements

### Functional Requirements

#### FR-1: Vertical List View (Primary View)

| ID | Requirement |
|---|---|
| FR-1.1 | Display all assigned courses (grouped by due date) and events (grouped by event date) in a single vertical, scrollable list. |
| FR-1.2 | Group items into temporal sections: **Overdue**, **Today**, **This Week**, **Next Week**, **Later**, and **Previous** (completed/past). |
| FR-1.3 | Each section header displays the section name and a count of items within it. |
| FR-1.4 | Sections collapse/expand; "Previous" section is collapsed by default. |
| FR-1.5 | Items within each section are sorted chronologically (earliest first for upcoming; most recent first for Previous). |

#### FR-2: Card Design

| ID | Requirement |
|---|---|
| FR-2.1 | Each card displays: item type indicator (course vs. event), title, date/time, thumbnail image (if available), and a visual due-date badge. |
| FR-2.2 | Course cards show due date and progress indicator (e.g., "3 of 8 lessons complete"). |
| FR-2.3 | Event cards show event date, time, and duration. Multi-day events display a date range (e.g., "May 12 – 14"). |
| FR-2.4 | Multi-day events appear once in the list under the start date, with the date range clearly visible — not repeated on each day. |
| FR-2.5 | Cards are tappable/clickable; clicking opens the course or event detail page. Returning navigates back to the Calendar/To-Do view, preserving scroll position. |

#### FR-3: Navigation Changes (Web)

| ID | Requirement |
|---|---|
| FR-3.1 | Add a "Calendar/To-Do" item with a calendar icon to the left-side menu on web. |
| FR-3.2 | Merge the existing social feed and notifications into a single "Notifications" icon on the top nav bar. Social feed content is accessible within the Notifications panel. |
| FR-3.3 | The social feed tab is fully removed as a standalone navigation item on web. |

#### FR-4: Discovery Nudges & Indicators

| ID | Requirement |
|---|---|
| FR-4.1 | Display a badge (numeric count) on the Calendar/To-Do nav icon when there are items due today or overdue. |
| FR-4.2 | On first visit after the feature launches, show a tooltip/coachmark highlighting the new Calendar/To-Do nav item explaining its purpose. |
| FR-4.3 | When a user is assigned a new course or event, show a non-blocking inline banner or toast within the Calendar/To-Do view on next visit. |
| FR-4.4 | Optionally, provide a contextual prompt when a user adds/is assigned an item: "Want to be reminded when this is due?" with a simple opt-in for day-of or day-before reminders. |

#### FR-5: Date-Based Logic

| ID | Requirement |
|---|---|
| FR-5.1 | No pass/fail or completion-status logic governs grouping — items move between sections based purely on date relative to today. |
| FR-5.2 | A course whose due date has passed moves to "Overdue" (not "Previous") until it is completed, at which point it moves to "Previous." |
| FR-5.3 | An event whose date has passed moves directly to "Previous." |
| FR-5.4 | Items in "Previous" remain indefinitely and are not auto-deleted. |

#### FR-6: Empty & Delight States

| ID | Requirement |
|---|---|
| FR-6.1 | When a temporal section has no items, display a branded, playful empty-state illustration (not a generic grey placeholder). |
| FR-6.2 | When the entire Calendar/To-Do view is empty, show a celebratory or encouraging full-page empty state (e.g., "You're all caught up!"). |

#### FR-7: Dynamic Orientation Aid

| ID | Requirement |
|---|---|
| FR-7.1 | Provide a compact mini-calendar or sticky date header that updates as the user scrolls through the vertical list, keeping temporal context visible at all times. |

---

## 6. Research & Best Practices

### Synthesis

The decision to favor a **vertical list over a traditional calendar grid** is strongly validated by UX research. Eleken's calendar UI guide found that vertical agenda/list views outperform grids for daily planning, and card-based event display with date grouping (upcoming/active/past) reduces cognitive load ([Eleken](https://www.eleken.co/blog-posts/calendar-ui)). Stratifi Creative corroborates this, warning that calendar grid views create information overload, especially on mobile, and noting that even Google Calendar and Outlook users default to day/week list views — effectively validating the vertical list approach for event-centric features ([Stratifi Creative](https://stratificreative.com/blog/the-problem-with-calendar-views-how-to-improve-ux-on-your-events-page/)).

The **Luma event platform** is the explicit design reference cited in the Jira ticket. Luma's vertical event list uses card-based layouts with date badges, thumbnails, and an "Upcoming/Past" toggle, serving approximately 2 million monthly sign-ups with a UI praised for its cleanliness compared to alternatives like Eventbrite ([party.pro/luma](https://party.pro/luma/)). Detailed screen references are available via SaaSFrame (24 screens) ([SaaSFrame](https://www.saasframe.io/saas/luma)) and NicelyDone (151 screens) ([NicelyDone](https://nicelydone.club/apps/luma)), providing ample pattern study material.

For the **temporal sectioning** (Overdue → Today → This Week → Later), task management tools provide well-established patterns. UX Patterns for Developers recommends combining a compact month overview for navigation with a detailed agenda list for content ([UXPatterns.dev](https://uxpatterns.dev/patterns/data-display/calendar)), which supports the mini-calendar sidebar plus vertical list approach.

The **discovery nudge** requirement is a critical engagement lever. Plotline's 2026 guide catalogs six nudge types — tooltips, animations, spotlights, coachmarks, stories, and PiP video — emphasizing that nudges must be contextual, strategically timed, and non-disruptive ([Plotline](https://www.plotline.so/blog/in-app-nudges-ultimate-guide)). NudgeNow reports that apps with in-app messages see 3.5× higher user retention, and recommends passive indicators (red dots), progress bars, and checklists for pending-task reminders ([NudgeNow](https://www.nudgenow.com/blogs/in-app-nudges)). The UX Collective's notification hierarchy framework places badges and inline banners at the lower-intrusiveness end, which is where pending-task nudges should sit to avoid disrupting flow ([UX Collective](https://uxdesign.cc/the-ux-hierarchy-of-in-app-notification-patterns-ff8f702b9f4e)). Apxor further supports this, noting that edtech apps can use progress bars to nudge learners toward completion or streak maintenance, but must balance discovery with restraint to avoid trust erosion ([Apxor](https://www.apxor.com/blog/a-guide-to-using-smart-nudges-to-enhance-user-experience)).

The broader **LMS engagement** challenge is directly addressed by Fit Learning, which argues that the problem isn't the LMS platform itself but getting users to access it voluntarily — often requiring a rethink of the entire experience from design to communication ([Fit Learning](https://fitls.com/en/how-to-increase-engagement-in-your-lms/)). This reinforces the strategic rationale for replacing the low-engagement social feed with a utility-first Calendar/To-Do hub. Mouseflow's SaaS UX guide cautions to design based on user data, not assumptions, citing Asana's simplicity-focused design as a model, and advises beta testing before full rollout when making radical navigation changes ([Mouseflow](https://mouseflow.com/blog/saas-ux-design-best-practices/)).

### UX References

| App | Flow / Screen | Mobbin URL | Pattern Description | Relevance |
|---|---|---|---|---|
| Luma | Vertical event list with date badges, thumbnails, "Show Past" button | [View](https://mobbin.com/screens/e6f57ecd-27fe-4341-a7a9-333bda53ac64) | Card-based vertical event list grouped by date with image thumbnails and "Show Past" toggle | **Primary reference** — exact pattern cited in ticket; date badge + thumbnail + title + time per card |
| Luma | Host events dashboard with "Upcoming/Past" toggle and timeline | [View](https://mobbin.com/screens/4c3ab22f-86f9-42b0-80ae-2eb937dc6f2c) | Upcoming/Past segmented control with date-grouped vertical timeline and event cards | Directly maps to the "Previous section" requirement with a clean toggle |
| Luma | Past events section with reverse-chronological date-grouped list | [View](https://mobbin.com/screens/f129ba6f-f166-46f4-84c0-dfaaa3155024) | Past events displayed in same card format but in "Past" section with date badges | Reference for how past/overdue items should remain visible and scannable |
| Time2book | Schedule view with "Upcoming/Past" tabs and day-grouped session cards | [View](https://mobbin.com/screens/515b06ca-69c6-475b-97ee-510f26b203dd) | Left sidebar nav + Upcoming/Past tabs + day-grouped appointment cards with time, location, capacity | Strong reference for course/session scheduling in a SaaS context with sidebar navigation |
| Calendly | Scheduled events list with Upcoming/Pending/Past tabs and date grouping | [View](https://mobbin.com/screens/b3e0fae3-2e15-4f7b-bf01-01585ecabf57) | Tab bar (Upcoming/Pending/Past) + Date Range filter + date-grouped event rows + Filter/Export | Shows how to add a "Pending" state and filter/export for overdue course management |
| Calendly | Event details expanded inline within vertical list | [View](https://mobbin.com/screens/838730bc-e57d-42ab-8467-c166cf5e3de8) | Inline event expansion with reschedule/cancel actions in vertical list context | Reference for "tap card to open" interaction — inline expansion vs. navigation |
| Calendly | Filtered scheduled events with advanced filter bar | [View](https://mobbin.com/screens/cb543ef7-922d-4912-bdbf-9e842fe24240) | Advanced filter bar (Teams, Host, Event Types, Status) above date-grouped list | Useful if filtering by course type vs. event type becomes needed |
| Apple | Upcoming Sessions list grouped by date with "Details" buttons | [View](https://mobbin.com/screens/904d8181-bd78-45e4-a508-98e87bfde2da) | Clean minimal date-grouped session list with title, time range, location, and Details CTA | Reference for minimal, elegant course/session listing with clear CTAs |
| monday.com | "My Work" view with Overdue/Today/This Week/Next Week/Later sections | [View](https://mobbin.com/screens/dbe5b273-187f-4f5f-9983-bf7aa7e6bfbd) | Temporal grouping (Overdue → Today → This Week → Next Week → Later → No Date) with item counts | **Key reference** for the date-based sectioning logic described in the ticket |
| ClickUp | Task list grouped by due date with task cards | [View](https://mobbin.com/screens/777d598b-8796-4971-8cc6-c85d8742c975) | Due-date-grouped task list with assignee, priority flags, and "+ New task" per section | Shows how to group heterogeneous items (tasks of different types) by due date |
| Todoist | Card-based task view with List/Board/Calendar layout toggle | [View](https://mobbin.com/screens/a8b34ad5-5892-42c4-b5fe-665fa98a3e89) | Layout toggle (List/Board/Calendar) + filter/sort panel + card-based task display | Reference for offering layout options and filter/sort controls alongside card UI |
| Asana | "My tasks" list with Recent/Do Today/Do Next Week/Do Later sections | [View](https://mobbin.com/screens/ef9ce287-ae51-4243-9c7f-4c0be2e5e515) | Collapsible temporal sections (Recently assigned → Do today → Do next week → Do later) with due dates | **Strong reference** for the "one-stop pending view" — sections match today/week/month concept |
| Asana | "My tasks" with Recently Assigned/Do Today/Do Next Week/Do Later/On Hold | [View](https://mobbin.com/screens/6e9cb0bb-2696-495e-8953-5bf76cfac755) | Same sectioned layout with additional "On Hold" section | Shows progressive disclosure with an "On Hold" state for paused items |
| Motion | Kanban task board grouped by deadline week | [View](https://mobbin.com/screens/79b98ea0-8a24-42f9-9ca6-3ae680047ef3) | Kanban columns grouped by deadline week (Current / Next week) with todo status cards | Reference for the "Kanban" visual metaphor mentioned in the ticket |
| Craft | Calendar/to-do vertical day view with date blocks and tasks | [View](https://mobbin.com/screens/c0e34ca5-a9e3-4eda-a15f-03b549cdccdf) | Vertical day-by-day timeline with date blocks, inline tasks, and "show previous days" | **Excellent reference** for the vertical calendar + to-do combination |
| Wrike | Dashboard with "To do this week" / "To review" / "Tasks completed" widgets | [View](https://mobbin.com/screens/d750f820-568f-4a4f-8540-1692449871de) | Dashboard widgets grouping tasks by status (To Do / To Review / Completed) with weekly grouping | Reference for dashboard-style overview that could complement the main list |

### Built for Mars Lessons

| Title | Type | builtformars.com URL | Lesson | Relevance |
|---|---|---|---|---|
| Dynamic calendar sidebar | UX Bite | [View](https://builtformars.com/ux-bites/dynamic-calendar-sidebar) | Cron's sidebar highlights the days currently in view with smooth real-time animation, keeping users oriented as they scroll a vertical calendar. | Directly applicable: a mini-calendar or sticky date header that updates as the user scrolls solves navigation within today/week/month scope (FR-7.1). |
| Playful empty states | UX Bite | [View](https://builtformars.com/ux-bites/playful-empty-states) | Superlist uses hand-drawn scribbles instead of generic grey placeholders, exposing brand personality and adding delight. | Directly relevant to "fun, engaging interface" requirement: empty sections should use branded delight, not dead-ends (FR-6.1, FR-6.2). |
| Reward-based streaks | UX Bite | [View](https://builtformars.com/ux-bites/reward-based-streaks) | Peerlist rewards users with power features after streak milestones, leveraging the Endowment Effect — earned rewards feel more exclusive. | Maps to engagement/gamification goal: streaks for consecutive course completions could drive repeat visits. Future-phase consideration. |
| Setting notification triggers | UX Bite | [View](https://builtformars.com/ux-bites/setting-notification-triggers) | Libby uses a traffic-light system letting users customize alert preferences (email, shelf notice, or ignore), increasing action likelihood and reducing fatigue. | Critical for discovery nudge: letting users choose reminder preferences for pending items increases engagement without intrusiveness (FR-4.4). |
| Dice's wait list | UX Bite | [View](https://builtformars.com/ux-bites/dices-wait-list) | When joining a wait list on Dice, the app contextually prompts users to enable notifications with a "framed reason" — turning a permission request into a value proposition. | Relevant to nudge strategy: when a user is assigned a course, prompt to enable reminders with contextual reason ("Get reminded when this course is due") (FR-4.3, FR-4.4). |

---

## 7. Plan of Action

### Phase 1: Design & Prototyping (Web)

- [ ] Create wireframes for the Calendar/To-Do vertical list view with temporal sections (Overdue → Today → This Week → Next Week → Later → Previous), referencing monday.com and Asana patterns.
- [ ] Design card components for course cards (title, due date, progress indicator, thumbnail) and event cards (title, date/time, duration, date range for multi-day).
- [ ] Design the dynamic sticky date header / mini-calendar orientation aid, referencing Cron's dynamic sidebar (Built for Mars).
- [ ] Design playful empty states for individual sections and full-view empty state, referencing Superlist's approach (Built for Mars).
- [ ] Design the discovery nudge system: nav badge, first-visit coachmark tooltip, inline new-item banner, and optional reminder opt-in prompt.
- [ ] Design the navigation changes: add "Calendar/To-Do" with calendar icon to left-side menu; merge social feed + notifications into single "Notifications" icon on top nav bar.
- [ ] Create interactive prototype and conduct internal design review with stakeholders.

### Phase 2: Prototype Implementation (Web)

- [ ] Implement the Calendar/To-Do page with temporal section layout, collapsible sections, and item counts.
- [ ] Build course card and event card components from the design system, with click-through to detail pages and scroll-position preservation on return.
- [ ] Implement the sticky date header / mini-calendar that updates on scroll.
- [ ] Implement empty states (per-section and full-view) with branded illustrations.
- [ ] Implement nav changes: add Calendar/To-Do to left menu; merge social feed into Notifications icon on top nav.
- [ ] Implement discovery nudge: badge count on nav icon, first-visit coachmark, inline new-item banner.
- [ ] Implement optional reminder preference prompt (contextual, triggered on new course/event assignment).

> Backend, API work, QA/beta/rollout, and mobile parity are out of scope for this prototype and will be handled in a separate engineering project.

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Users resist removal of social feed** — some users may rely on it despite low aggregate engagement. | Medium — potential complaints, loss of niche engagement. | Merge social feed content into Notifications rather than deleting it entirely; communicate the change in advance; monitor for any spike in support tickets during beta. |
| **Data model gaps** — courses or events may lack required fields (e.g., due dates not consistently set, multi-day flags missing). | High — incomplete or inaccurate Calendar/To-Do view. | Conduct data audit in Phase 1; add a "Without Date" section (à la monday.com) as a fallback for items missing due dates; work with backend team to backfill critical fields. |
| **Notification fatigue from nudges** — over-nudging could erode trust and cause users to ignore or disable notifications. | Medium — reduced engagement, negative sentiment. | Follow the UX Collective's hierarchy (start with low-intrusiveness badges/banners); implement Libby-style user-controlled notification preferences; A/B test nudge frequency during beta. |
| **Scope creep into workspace territory** — Calendar/To-Do could gradually duplicate workspace task management features. | Medium — user confusion, maintenance burden. | Clearly define the Calendar/To-Do as a read-only, date-ordered *view* of existing courses and events — not a task creation or project management tool. Document this boundary explicitly. |
| **Navigation change disorientation** — moving the social feed and adding a new nav item simultaneously changes two familiar landmarks. | Medium — temporary user confusion and increased support load. | Use a first-visit coachmark/tooltip (FR-4.2) to orient users; consider a one-time "what's new" banner; phase the change behind a beta flag. |
| **Cross-platform divergence** — building web first may create design decisions that are difficult to port to mobile. | Low-Medium — rework cost in Phase 5. | Design with mobile constraints in mind from Phase 1 (touch targets, card sizes, collapsible sections); use shared design tokens and component specs. |
| **Performance with large item lists** — users with many courses and events could experience slow rendering. | Medium — degraded UX for power users. | Implement pagination or virtual scrolling; collapse "Previous" section by default; lazy-load thumbnails. |