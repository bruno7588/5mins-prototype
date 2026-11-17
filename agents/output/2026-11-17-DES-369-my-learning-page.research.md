# DES-369: My Learning page - supporting research

Date: 2026-11-17. Companion to `2026-11-17-DES-369-my-learning-page.md`. Two passes: the prototype's code, then external prior art. Nothing in the code was changed.

---

## 1. Internal research

### 1.1 The foundation: `src/pages/user-profile/UserProfile.tsx`

- **Routes** (`src/App.tsx`): `/people/:id` (admin shell), `/my-team/people/:id` (learner shell, My Team lit), `/my-progress/profile` (learner shell, My Progress lit; no id, so it falls back to id `'1'`).
- **Tabs:** `TABS = ['Engagement', 'Skills', 'Course Progress', 'External Training']`. The `Tabs` items set `disabled: tab !== 'Course Progress' && tab !== 'External Training'`, so Engagement and Skills are greyed out and have no content.
- **Landing tab:** `useState` opens on Course Progress, or on External Training when the URL has `?tab=external-training`. The parameter is read once and never written back, and no other tab has a key.
- **How it tells viewers apart:** by the route only.
  - `fromMyProgress = pathname.startsWith('/my-progress')`
  - `isLearnerView = fromMyProgress || pathname.startsWith('/my-team')` picks the learner shell over the admin shell and hides the breadcrumb and Assign Courses.
  - `externalViewer` is the nearest thing to a viewer role: `'admin'` outside the learner shell; `'learner'` when the id equals `SIGNED_IN_LEARNER_ID` (`'1'`, Anthonny Wallace, in `src/data/externalTraining.ts`); `'manager'` when the id is in `teamProfiles` (exported from `MyTeam.tsx`); otherwise `null`, which shows "You can only see people in your team." on the External Training tab only.
- **Header:** `Avatar` (56px), name, "role · email", and a filled **Edit Profile** button that is not wired. It shows for every viewer, including the learner on their own page.
- **Course Progress tab:** `ContentSwitcher` (All Courses / Compliance Only), four inline `StatTile`s from `COURSE_STATUS_CARDS` (`src/data/courseStatusCards`), `CourseFilters`, then the shared `Table` with selection checkboxes, sortable columns, a per-row certificate Download button and a `RowActionsMenu`.
- **Row actions** (`ROW_MENU_ITEMS`): View progress, Send reminder, Extend due date, Edit start date, Edit repeat rules, Give another attempt, Restart enrolment, Unenrol. The bulk bar (`BulkActionBar`, `BULK_MENU_ITEMS`) offers five of them.
- **What the learner sees on their own page today:** everything a manager sees. Row actions, checkboxes and the bulk bar are not gated by viewer. Only two controls are: Download Certificates (hidden when `externalViewer === 'learner'`) and Assign Courses (admin shell only). So the learner can, in the prototype, send themselves a reminder, extend their own due date and unenrol themselves.
- **External Training tab:** `components/ExternalTrainingTab/ExternalTrainingTab.tsx`, built for DES-336. One component for all viewers through its `viewer` prop: admins add, edit and delete; manager and learner are view only. Already complete.

### 1.2 The dashboard being dissolved: `src/pages/my-progress/`

`MyProgress.tsx` exports the page (`MyProgress`) and its content (`MyProgressContent`), which the native app screen reuses.

| Piece | Code | Notes |
|---|---|---|
| Stat tiles | `progressStats` in `myProgressData.ts`, rendered with `StatTile` and `getProgressIllustration` | Points, Jewels, Streak, Certificates. Each has an info tooltip. Tiles look clickable (arrow) but go nowhere. The Points value in the sample data is "62%", which reads as a mistake |
| 5Mins Courses card | `courseResults` (4 rows): Course, Score, Result (Passed / Not Passed) | View All goes to `/my-progress/profile` |
| Skill Development card | `skillProgress` (3 rows): level illustration, name, "Earn N points to complete this level", progress bar, points | View All Skills is disabled; the code comment says "there is no skills list page yet" |
| External Training card | Latest 3 of the learner's records | View All goes to `/my-progress/profile?tab=external-training` |
| Leaderboard card | `leaderboards` (team, company), `leaderboardPeriods` (This week, This month), `ContentSwitcher` + `Dropdown`, medals from `getRankMedal` | Documented in gamification.md. No highlight on the learner's own row |
| Version switcher | `VERSIONS`, `?hide=leaderboard,skills,external` | Prototype control showing that a tenant can switch off Leaderboard, Skill Development and External Training |
| Card backgrounds | `progressMesh.ts`, `MeshGradient` | Only used here |

### 1.3 Team level: `src/pages/my-team/`

- `MyTeam.tsx`: tabs `MT_TABS` (Course Tracker, Engagement, Learning Records). Exports `learnerSideItems` (the learner sidebar, including `{ label: 'My Progress', icon: Medal, path: '/my-progress' }`), `teamProfiles` and `Logo`. Course Tracker rows open `/my-team/people/:id`.
- `EngagementTab.tsx`: three hand-built cards.
  - `SkillsCompetency`: Hard Skills / Soft Skills switcher, 8-segment level bars. Team level.
  - `EngagementChart`: **this is the Performance chart in the screenshot, at team level.** Title "Engagement", subtitle "Team learning activity over time", an inert "Last 6 months" button, legend ("Total learning moments" with a `Diagram` icon, "Lessons completed", "Quizzes & Polls"), a Cumulative `Checkbox`, six monthly bar pairs. The checkbox toggles but does not change the chart (code comment). One series colour is a raw hex with a lint exception that reads "no chart palette in the DS yet".
  - `Leaderboard`: a second leaderboard implementation, with inline SVG medals and its own row layout. The My Progress one uses the documented Library medals.
- `LearningRecordsTab.tsx`: `ContentSwitcher` (5Mins Courses / External Training). External Training rows link to `/my-team/people/:id?tab=external-training`.

### 1.4 Charts

- `src/pages/chart-lab/` holds assessment answer charts only (`OptionBars`, `ImageTiles`, `OutcomeBars`, `BlankSentence`, `OpenResponse`). No time-series chart.
- `src/components/` has no chart component. `package.json` has no chart library.
- `docs/design-system/` has no chart doc. The word "chart" appears only in motion.md (answer chart bars) and empty-state.md (an illustration name).
- Differences between the screenshot and `EngagementChart`: title ("Performance" v "Engagement"), no subtitle and no period control in the screenshot, an info icon after "Total learning moments", "Lessons watched" v "Lessons completed", and a filled area under the line.

### 1.5 Skills

There is no learner skills page in the prototype. The pieces that exist: the three-row Skill Development list on My Progress, the team-level `SkillsCompetency` card, and `SkillCard` (`src/components/SkillCard`, used on For You and onboarding). The meeting notes say the skills page is "already built by Johan"; that is in production, not here.

### 1.6 Navigation and links

| Where | Code | Today |
|---|---|---|
| Learner sidebar | `learnerSideItems` in `MyTeam.tsx`, reused by the learner pages | "My Progress" to `/my-progress` |
| Narrow web bottom bar | `LearnerMobileNav.tsx` | Progress tab opens `/my-team`; lit for `/my-team` and `/my-progress` |
| Narrow web chips | `MyTeam.tsx` and `MyProgress.tsx` (`.mt-mobile-chips`) | "My Team" / "My Progress" |
| Gear menu | `ProfileMenu.tsx` | Saved, Edit Profile, Dark Mode, Log out. In the working tree Edit Profile only closes the menu (uncommitted change); in the last commit it opened `/my-progress/profile` |
| `/profile` | `ProfileRedirect` in `App.tsx` | Already forwards to `/saved` (DES-368). The Profile page itself is gone |
| Admin records list | `learning-records/components/ExternalTraining/ExternalTrainingRecords.tsx` | Learner link to `/people/:id?tab=external-training` |
| navigation.md | Web app items list | Still lists My Progress and Profile |

### 1.7 Native app (current state only)

- `src/pages/mobile/MyProgressScreen.tsx` renders `MyProgressContent` with `native`: the same cards in one column, tables included, leaderboard cut to 10 rows, View All inert.
- `ExternalTrainingScreen.tsx` is the one table already adapted: a card list with a bottom sheet for the detail, as the meeting describes.
- `MobileApp.tsx`: the Progress tab has chips My Team / My Progress and opens on My Progress; My Team has no screen. There is no profile screen, no Course Progress and no Skills screen.
- The app is dark mode only.

### 1.8 Design system components the page would use

`Tabs` (chips-switcher-tabs.md; no nested tab bars, a second level is chips), `StatTile` (summary-stat.md), `Table` (table.md), `ContentSwitcher`, `Dropdown`, `Avatar`, `Badge`, `Button`, `Tooltip`, `EmptyState`, `RowActionsMenu`, `BulkActionBar`, gamification assets (gamification.md: progress illustrations, level illustrations, rank medals). **Missing docs:** a chart; a leaderboard component (gamification.md says "no code component"); a skills list.

---

## 2. External research

Queries were generic; no names or customer details were sent.

### 2.1 Sana Labs

Nothing usable. The [Sana Learn changelog](https://sanalabs.com/sana-learn-changelog.html) has no entry on a learner profile, a "my learning" page, a manager's view of a person, skills on a profile, leaderboards or streaks. The nearest entries are "Admin mode in Insights" (8 Sep 2026) and "Admin mode for group admins" (12 Aug 2026), both about reporting dashboards. A web search for a Sana help article on the manager view found none.

### 2.2 General web

| Source | What it does | Use |
|---|---|---|
| [Cornerstone: Universal Profile, View Team flyout](https://help.csod.com/help/csod_0/Content/User/Universal_Profile/Universal_Profile_-_My_Team_Drop-down.htm) | One profile for everyone. A manager on their own profile picks a report and lands on the same page of that person's profile; if they lack access they are redirected with an alert | Closest precedent for "the same page for learner, manager and admin" |
| [Workday: View My Team's Learning](https://hr.emerson.edu/hc/en-us/articles/49252845385747-View-My-Team-s-Learning) and [View your learning transcript](https://support.lesley.edu/support/solutions/articles/4000218634) (customer guides; the first could not be opened, read from the search summary) | A team report for the manager, and a per-person transcript on the worker profile under a Learning tab | Supports the split: My Team is the overview, the profile is the individual |
| [Docebo: Gamification and the Reward Shop](https://help.docebo.com/hc/en-us/articles/360020081200-Gamification-and-the-Reward-Shop) (page blocked; read from the search summary) | Learners open "My gamification" from the profile menu: badges, points, leaderboard rank. Leaderboard names can be anonymised by the admin | Placement rejected (hidden behind a menu). The anonymise option matters for the manager-visibility question |
| [TalentLMS: How to view a user's gamification statistics](https://help.talentlms.com/hc/en-us/articles/26652216307100-How-to-view-a-user-s-gamification-statistics-in-TalentLMS) (page blocked; title and search summary only) | An admin can open one user's points, badges and level | Precedent for an admin seeing a person's gamification |
| [NN/g: Tabs, used right](https://www.nngroup.com/articles/tabs-used-right/) | "Arrange tab content so high-use content is first in the list and selected by default." Avoid stacked tab rows. "The fewer tabs, the better." | Supports four flat tabs. Raises a question about Engagement as the default for managers |

No source found for Workday's, Docebo's or TalentLMS's learner page layout in enough detail to copy.

### 2.3 Mobbin

| Screen | What it shows |
|---|---|
| [Unity Learn: My Learning, Activity](https://mobbin.com/screens/90e21642-8418-4035-a9d7-336a1fff4eb3) | "My Learning" in the main nav. One flat tab row: Activity, In Progress, Submissions, Completed, Saved, My Profile, Settings. Activity is the landing tab: XP, levels per skill area, badges |
| [Unity Learn: My Profile tab](https://mobbin.com/screens/ddbc48ee-e072-4b7e-bdf8-d0af7141c54b) | The profile is a tab of My Learning, not a separate page |
| [Coursera: My Learning](https://mobbin.com/screens/ff884482-7343-4d72-b38d-74436b6dc450) | "My Learning" as the nav label; In Progress / Completed chips; a weekly goal card |
| [Duolingo: Profile](https://mobbin.com/screens/79f40392-fe31-44d0-97b6-65858708cfec) | Name header, then four Statistics tiles (streak, XP, league, top-three placings), then achievements |
| [Uxcel: profile](https://mobbin.com/screens/0aa18b68-0727-40e1-8d15-e7ad3f751c70) | Statistics card (points, league, streaks) next to course certificates on one profile |
| [Circle: Leaderboard](https://mobbin.com/screens/cd5daccd-6265-486c-be44-b4c182c6c4f0) | The viewer's own standing in a card above the list; period chips; a "How do points work?" link |
| [Canva Design School: Achievements](https://mobbin.com/screens/df585897-2949-4329-a6c6-ee2a827423e2) | Three headline numbers, then a second level as chips (Overview, Badges, History) |
| [Remote: employee profile](https://mobbin.com/screens/55627e95-ef55-472e-9580-fb1e2615d345) | Manager's view of a person: one flat row of nine tabs |
| [Workable: employee profile](https://mobbin.com/screens/dc543f3e-fe10-4abf-a3cd-5f002d81b001) | Two levels of tabs (Information, then Personal, Job and so on) |
| [15Five: Profile](https://mobbin.com/screens/c5bd2a1a-eec1-4233-b4d3-17b0025b90f8) | A person's profile with tabs My team, About, Activity, Wins |
| [Mindvalley (iOS): Progress](https://mobbin.com/screens/15b37d80-6b50-4618-82c6-06db8da02423) | Streak, four stat tiles, then progress bars; no table. For the native phase |
| [Uxcel Go (iOS): Profile](https://mobbin.com/screens/90071f3f-7e49-4430-9431-475af3dcf00a) | Four stat tiles and nothing else. For the native phase |

No close match for the same profile shown to its owner and to their manager side by side; Mobbin captures one viewer per screen. No close match for a monthly activity chart on a learner profile.

### 2.4 Build For Mars

| Lesson | Principle |
|---|---|
| [Gamification](https://builtformars.com/ux-glossary/gamification) (glossary) | "Points, badges and leaderboards bolted on ... rarely change anyone's behaviour." "Visualise progress richly." |
| [Dynamic leaderboard motivation](https://builtformars.com/ux-bites/dynamic-leaderboard-motivation) (Duolingo) | The leaderboard frames the viewer's own position |
| [Leaderboards and the promotion zone](https://builtformars.com/ux-bites/leaderboards-the-promotion-zone) (Duolingo) | People are ranked against a small, comparable group so the next place feels reachable |
| [Changing the default tab](https://builtformars.com/ux-bites/changing-the-default-tab) (Nike) | The default tab depends on who is looking |
| [Default Bias](https://builtformars.com/ux-glossary/default-bias) (glossary) | Most people stay with the default |
| [Where did it go?](https://builtformars.com/ux-bites/where-did-it-go) (Stripe) | A reminder where a moved control used to be |

No close match for merging two overlapping pages into one, or for renaming a navigation item.
