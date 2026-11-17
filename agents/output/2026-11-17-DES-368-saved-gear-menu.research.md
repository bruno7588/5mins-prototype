# DES-368 research notes: Your Activity in the gear menu

Supporting evidence for `2026-11-17-DES-368-saved-gear-menu.md`. Two passes: the prototype codebase and design system, then external prior art. Date: 2026-11-17.

---

## 1. Internal pass

### 1.1 Surfaces the ticket touches

| Surface | File | What is there |
|---|---|---|
| Sidebar items | `src/pages/my-team/MyTeam.tsx` line 246, `learnerSideItems` | For You, Your Workspace, Knowledge Hub, Search, My Team, My Progress, Feed, Profile (`UserSquare`, `/profile`). The comment above the Profile row still mentions External Training, which was removed from the page in commit `d508b7a` |
| Pages that render the sidebar | `ForYou.tsx`, `Workspace.tsx`, `Events.tsx`, `ProgramDetails.tsx`, `ProgramCourseDetails.tsx`, `UserProfile.tsx`, `MyProgress.tsx`, `Profile.tsx`, plus `MyTeam.tsx` itself | All map over `learnerSideItems`; the active item is the one whose `path` equals the current route |
| Gear menu | `src/components/ProfileMenu/ProfileMenu.tsx`, `ProfileMenu.css` | Trigger: `.mt-side__profile` card with name, email and a 16px `Setting2` in `--text-secondary`. Menu `.profile-menu` (`role="menu"`) opens upward. Rows `.profile-menu__item`: Edit Profile (`User`), Dark Mode (`Moon` plus `Toggle size="sm"`, stays open on toggle), Log out (`Logout`). Icons 20px Linear `--text-primary`. Closes on outside mousedown only; no Escape handler |
| Gear at tablet width | `src/pages/my-team/MyTeam.css` lines 810-866 | Under 1200px the sidebar becomes a 72px icon rail and the profile card hides its text, leaving the gear icon. The button then has no visible label, no `aria-label` and no Tooltip |
| Narrow-web nav | `src/components/LearnerMobileNav/LearnerMobileNav.tsx` | Shown under 600px, when `.mt-topnav` and `.mt-side` are hidden. Tabs: Home, Search (inert), Progress, Feed (inert), More. More menu reuses `.profile-menu` rows with 24px Bold icons: Admin, Your Workspace, Profile, Knowledge Hub (inert), Dark Mode, Log Out. No Edit Profile row. Closes on outside mousedown and Escape |
| Profile page | `src/pages/profile/Profile.tsx` | Shell from `MyTeam.css`, header from `UserProfile.css` (`.up-header`, 56px `Avatar`, name, role and email). `TABS` constant: bookmarks, likes, following. `Tabs` with `ariaLabel="Profile sections"`. `bookmarkView` state drives the `ContentSwitcher`. `?tab=` is read once on load; switching tabs does not update the URL |
| Profile data | `src/pages/profile/profileItems.ts` | `bookmarkedLessons` (6, `LessonGridCardProps[]`), `bookmarkedCourses` (2, from `workspaceCourses`), `likedLessons` (12), `followedInstructors` (6, `InstructorCardProps[]`). Static; not linked to any save action |
| Card behaviour on Profile | `LessonGridCard`, `WorkspaceCourseCard`, `InstructorCard` | Each is interactive only when given `onOpen` or `onClick`. `Profile.tsx` passes neither, so no card opens anything |
| Routes | `src/App.tsx` | `/profile` (Profile), `/my-progress` (MyProgress), `/my-progress/profile` (UserProfile, the learner's own profile), `/mobile` (MobileApp). Redirects already use `<Navigate ... replace />` (for example `/learning-records/approved-courses`) |
| Own profile | `src/pages/user-profile/UserProfile.tsx`, `src/pages/my-progress/MyProgress.tsx` (`OWN_PROFILE`) | `/my-progress/profile` is where Edit Profile lands, and where My Progress "View All" links go. Untouched by this ticket |
| Mobile tab bar | `src/components/mobile/TabNav/TabNav.tsx` | `MobileTab = 'home' \| 'search' \| 'progress' \| 'feed' \| 'profile'`; `TABS` array of five |
| Mobile header | `src/components/mobile/TopNav/TopNav.tsx` | Variants `home`, `search`, `chips`, `title`, `detail`, `skill`, `lesson-feed`, `profile`. `home` = chips left, icon buttons right. `chips` = chips only. `profile` = `.m-topnav__avatarwrap` (40px `Avatar` plus `.m-topnav__editbadge` gear, `aria-label="Profile settings"`), name, role, `.m-topnav__fab` Add button |
| Mobile shell | `src/pages/mobile/MobileApp.tsx` | `tab` state; the `profile` case renders `<MobileTopNav variant="profile" ...>` with no `onEditProfile` or `onAdd`. No screen is rendered for the profile tab (comment: "The remaining tab screens land here as they are built"). Detail screens are pushed over tabs by state (`externalOpen`, `openCourseId`); sheets go in the `overlay` slot |
| Mobile Progress | `src/pages/mobile/MyProgressScreen.tsx` | Reuses `MyProgressContent native`; opens `ProgressInfoSheet` in a `BottomSheet` |

### 1.2 Where bookmark, like and follow are triggered

| Action | Web | Mobile |
|---|---|---|
| Bookmark a lesson | `LessonFeed.tsx`: "Bookmark" row, `ArchiveAdd`, local `bookmarked` state, Linear to Bold when on | `LessonFeedScreen.tsx`: `SideAction` "Bookmark" with `ArchiveAdd`, no handler |
| Save a course | `ProgramCourseDetails.tsx`: icon button `aria-label="Save"`, `ArchiveAdd`, no handler | `CourseScreen.tsx`: "Save" icon, `.ui-disabled` |
| Follow an instructor | `LessonFeed.tsx`: `.lf-follow` button, "Follow" / "Following", local state | None |
| Like | None | None |

So nothing a learner does in the prototype changes what Your Activity shows, and Likes has no source at all.

### 1.3 Design system: component per flow

| Need | Component and doc | Status |
|---|---|---|
| Web gear menu row | `ProfileMenu` `.profile-menu__item` | Exists in code; **no doc** (navigation.md: "`AdminMenuItem` ... and `ProfileMenu` components, which have no doc yet"). The surface roughly follows listbox.md (8px padding, 12px radius, 8px 12px rows, 20px Linear `--text-primary` icons) but uses `--border` and a custom shadow where listbox.md says `--border-elevated` and `--shadow-l`. Not in scope to fix; flagged |
| Narrow-web menu row | `LearnerMobileNav` More menu | Exists; same `.profile-menu` classes, 24px Bold icons |
| Page title and tabs | Page Header pattern, headers.md (title Bold 24, divider, tabs below) | No shared component; each page builds its own. "Simple page: title only" is a documented slot combination |
| Tabs | `Tabs`, chips-switcher-tabs.md | Exists. Already used inside the phone frame by `CourseScreen.tsx` |
| Lessons / Courses switch | `ContentSwitcher`, chips-switcher-tabs.md | Exists. The doc says a second level inside a tabbed page is chips only; drift-report.md line 146 records a sanctioned exception for a Content Switcher as the second level. Existing pattern on this page; keep |
| Web cards | `LessonGridCard`, `WorkspaceCourseCard`, `InstructorCard`, cards.md | Exist |
| Mobile cards | `mobile/LessonCard`, `mobile/InstructorCard`, cards.md | Exist |
| Mobile course in a vertical list | `mobile/CourseCard` is 272px fixed for horizontal scrollers ("Don't widen"); `mobile/ProgramCourseCard` is for a program outline | **Gap.** No documented card for a vertical list of courses in the app |
| Empty state | `EmptyState`, empty-state.md. Plain surface, no border or fill; `device="mobile"` in the phone frame; one outlined `secondaryAction` when alone | Exists. Illustrations "No bookmarks" `9120:8416`, "No likes" `9120:8452`, "Not following" `9120:8468` are already in `src/assets/empty-state-illustrations/` |
| Mobile gear menu | `BottomSheet`, overlays.md: "Details or options for what is on screen ... short option lists" | Sheet exists. **Gap:** no doc for action rows inside it. listbox.md covers the floating desktop surface only |
| Mobile header with avatar | `mobile/TopNav`, navigation.md, Library `Top nav/ App` `1910:18375` | **Gap.** Progress variant `7632:8164` is chips only. Parts exist in other variants |
| Mobile tab bar | `mobile/TabNav`, navigation.md, Library `Tab nav` `1324:35285` | Doc and Library specify five tabs with a Profile variant `9105:1851`; needs a four-tab update |
| Tooltip on icon-only controls | `Tooltip`, alerts-toast.md | Web only. Applies to the rail-width gear |
| Screen swap | motion.md: `ARRIVE(reduce)` and `arriveTransition(reduce)` from `src/components/AIWorkingCard/arrive.ts`, as `CourseScreen.tsx` does | Exists. Tab underline and switcher pill slide by themselves |

### 1.4 Icon for "Your Activity" (find-icon skill)

Checked with `node .claude/skills/find-icon/scripts/find-icon.mjs --check`; all names exist.

- **Recommended: `Activity`** (Iconsax, Business). Already used once (`src/pages/automations/Automations.tsx`). Matches the label literally and does not favour one of the three tabs.
- **Alternative: `Archive`** (Iconsax, Archive; used once). Same glyph family as `ArchiveAdd`, which the product uses for the Bookmark action, so it links the place to the action. Weaker for Likes and Following.
- Considered and dropped: `Heart` and `Bookmark` (each names only one tab, and neither is used anywhere yet); `UserSquare` (it is the old Profile icon and would read as a profile).

Use 20px Linear `--text-primary` in `ProfileMenu` and 24px Bold in the More menu, matching the rows around it. Always pass `color` explicitly (iconsax-react 0.0.8 with React 19).

### 1.5 Copy (5mins-copy-review skill, drafting mode)

Surface: learner web and mobile, in-product register. Reader: a frontline worker, on a phone, between tasks.

| Element | Copy |
|---|---|
| Menu item, page title | Your Activity |
| Tabs | Bookmarks, Likes, Following |
| Tab list name for screen readers | Your activity sections |
| Bookmarks, Lessons, empty | No bookmarked lessons yet / Bookmark a lesson and it'll be here when you want to come back to it. / Explore Lessons |
| Bookmarks, Courses, empty | No bookmarked courses yet / Bookmark a course and it'll be here when you want to come back to it. / Explore Lessons |
| Likes, empty | No likes yet / Lessons you like will be here, so they're easy to find again. / Explore Lessons |
| Following, empty | Not following anyone yet / Follow an instructor from one of their lessons and they'll be listed here. / Explore Lessons |
| Toast | None |

Why:

1. Each empty state does the two jobs the skill asks for: says what appears here, and gives one next step. Titles are short and stateful, not apologetic, per empty-state.md.
2. "Lessons" and "courses" are kept apart, and "Bookmark" is used for both because the tab is Bookmarks. The course pages currently say "Save"; that should change to match.
3. Conflict to flag: the copy skill's word list says sentence case for buttons and menu items. The house rule (Title Case for buttons), empty-state.md ("Title Case CTA labels") and the existing menu rows all use Title Case, so Title Case wins here.
4. Existing inconsistency, not changed: the web gear menu says "Log out", the narrow-web More menu says "Log Out".

---

## 2. External pass

### 2.1 Sana Labs

Searched for Sana Learn bookmarks, saved content, favourites, learner profile and settings, including a search limited to sanalabs.com. **Nothing useful.** Results were marketing pages and the changelog ([sanalabs.com/sana-learn-changelog.html](https://sanalabs.com/sana-learn-changelog.html)), which mention the personalised learner home and admin settings but nothing about saved items or where a learner's own profile and settings live. Workday's [Sana Learn capabilities reference](https://doc.workday.com/admin-guide/en-us/workday-feature-descriptions/workday-talent-management/reference--sana-learn-capabilities.html) lists capabilities with no saved-content feature. Sana's help centre was not reachable through search.

### 2.2 Adjacent LMS and HR tools

| Source | Finding | Confidence |
|---|---|---|
| [WorkRamp: learner bookmarks](https://help.workramp.com/en/articles/9248118-learner-bookmarks) | Bookmarks are at Profile > Saved Content, a tab. Learners bookmark from content cards, the Library and the course previewer | Page fetched and read |
| [Skilljar: Saved Content](https://support.skilljar.com/hc/en-us/articles/38190212732813-Saved-Content-Let-Students-Bookmark-Courses-Paths) | Saved courses and paths show at the top of the profile page; admins enable the feature in domain settings | Search summary only |
| [360Learning: bookmark a course or a path](https://support.360learning.com/hc/en-us/articles/16876847026708-Bookmark-a-course-or-a-path) | Bookmarking adds to a default playlist called "Save for later" | Search summary only; the page returned 403 when fetched, so where the playlist is viewed is unconfirmed |
| [LinkedIn Learning, university guide](https://careered.libanswers.com/AIUSLR/faq/266407) and [second guide](https://hr.ucf.edu/faqs-employee-develo/what-happens-to-courses-or-playlists-i-saved-previously/) | Saved courses in My Library; another route via the Me dropdown > Saved | Third-party guides, not LinkedIn's own help |
| [Thought Industries: bookmarking content pages](https://support.thoughtindustries.com/hc/en-us/articles/1500000620821-Bookmarking-Content-Pages) | Bookmarks shown on the learner dashboard | Search summary only |
| [Adobe Learning Manager: Saved by me widget](https://experienceleague.adobe.com/en/docs/learning-manager/using/learner/saved-by-me-widget) | Saved items as a home-page widget | Title only |
| Docebo, TalentLMS, Cornerstone, Workday Learning | **Nothing found** on where learner saved items or a settings menu live, in the searches run | - |

Pattern: learning tools put saved content inside the learner's profile area or a library, never as its own main-navigation item. None of them had "following" or "likes" as learner-facing lists.

### 2.3 General web

| Source | Finding |
|---|---|
| [NN/g: Hamburger menus and hidden navigation hurt UX metrics](https://www.nngroup.com/articles/hamburger-menus/) ([video](https://www.nngroup.com/videos/hamburger-menus/)) | Hidden navigation cuts discoverability almost in half, lengthens task time and raises perceived difficulty; many desktop participants never noticed the menu icon. Relevant because the rail-width gear is a bare 16px icon |
| Instagram, third-party guides ([Android Authority](https://androidauthority.com/how-to-see-liked-and-saved-instagram-reels-3389304), [SlashGear](https://www.slashgear.com/1387585/how-to-see-previously-liked-photos-instagram-app)) | Likes moved from Settings into Your activity > Interactions > Likes; Saved is its own row in the profile menu. No official Help Centre page surfaced |

### 2.4 Mobbin

Searches run (iOS unless noted): Instagram settings and activity; learning app saved lessons reached from profile or settings; home header with avatar and no profile tab; empty saved-items screen; web account dropdown with saved items; Spotify avatar in header; TikTok profile menu; Duolingo, Coursera, Udemy profile; flow "opening saved items from the account menu".

| Result | What the screen shows | Use |
|---|---|---|
| [Instagram, Settings and activity](https://mobbin.com/screens/f08baa0d-fca5-4c2c-bbd1-a1e10c367714) | "How you use Instagram": Saved, Archive, Your activity, Notifications, Time management | Source of the "Instagram-style" idea; three separate rows |
| [Instagram, Your activity](https://mobbin.com/screens/f4598faa-8dfb-4acd-a417-05ddf383d245) | "One place to manage your activity"; Interactions: Likes, Comments, Reposts | Naming |
| [Reddit, Saved flow](https://mobbin.com/flows/884a30cd-982c-4a03-b05d-4f6ab4483f0e) | Avatar opens a side menu (Profile, Saved, History, Settings); Saved has Posts / Comments tabs | Closest match to one item, one tabbed screen |
| [Noom, Saved lessons flow](https://mobbin.com/flows/aff8f35d-cea6-4534-8e8e-0989d6bea333) | Avatar menu "My stuff": Friends, Saved lessons, Settings. List footer: "Keep adding to your personal library by tapping on the bookmark icon in your daily tasks!" | Saved items grouped with settings; teaching line |
| [MasterClass, My Progress](https://mobbin.com/screens/125f0579-2126-4a42-bd27-811f0b255c2c) | Tabs Home, My Progress, Library. Avatar top right of My Progress; "My Bookmarks" section with a one-line explanation | Precedent for avatar in the progress header and no Profile tab |
| [Spotify, Home](https://mobbin.com/screens/e456a7ac-30f8-4533-adfa-087efc769061) | Avatar at the left of the chips row; no profile tab | Avatar plus chips in one header row |
| [Skillshare, My Classes](https://mobbin.com/screens/e6f00691-139a-479c-88f7-83629237a7eb) | Profile tab renamed My Classes: Downloads, All Saved Classes, My Lists, Watch History; gear top right | The opposite choice: saved items keep a tab |
| [Uxcel, bookmarks](https://mobbin.com/screens/ebcee278-eb32-45bc-8cb4-ad8d0927a0e7) | Exercises / Lessons switch above the list | Type switcher inside bookmarks |
| [Finimize, Profile](https://mobbin.com/screens/996f25e3-73d3-4b46-b947-786701eaf18a) | Profile with tabs Bookmarks, Ideas, Downloads; gear top right | Our current layout, elsewhere |
| [Udemy, Account](https://mobbin.com/screens/eb9eeac8-ccb1-40f1-bfd0-3664d76c3905) | Wishlist is its own tab-bar item | Counter-example |
| [The Atlantic, Saved empty](https://mobbin.com/screens/be11d892-94f3-4e86-a718-ca08c5a27b37) | "You currently have no saved stories." plus "Tap the bookmark icon on a story to save it for later."; reached from Settings | Empty state names the action |
| [Klarna, Saved empty](https://mobbin.com/screens/2ea34d6b-324c-49df-b09b-ccc61a3b2403) | Tabs stay; "Nothing saved"; "Find products" | Tabs persist; single CTA |
| [Fitbit, Favorites empty](https://mobbin.com/screens/509ce46e-2f04-4e14-a75c-208046916686) | "No favorites yet" plus one line, no button | Title pattern |
| [HYPE, Saved Articles flow](https://mobbin.com/flows/77e23527-92d8-4b23-b0d3-a2310e4ebac0) | "There is no content to display. We were unable to find any content for this page." | What not to do |
| [YouTube, web](https://mobbin.com/screens/44a3f09f-bb36-451a-a724-42ea6838e8b0) | Sidebar "You" group: History, Playlists, Watch later, Liked videos; avatar menu holds account and settings only | Web counter-example: saved lists kept in the sidebar |
| [Shopify, avatar menu](https://mobbin.com/screens/9da8d099-e186-42ac-8b92-3f273194b7de) | Avatar top right opens a small menu (Manage account, Log out) | Avatar as the account menu trigger |

**No close match:** TikTok's profile menu (results were unrelated TikTok screens); any before and after of an app removing a profile tab; Coursera and Duolingo saved lists (Duolingo's profile has a gear but no saved items).

### 2.5 Build For Mars

`bfm_find_content` (two queries) and `bfm_analyze_lessons` (one question; it returned sources, not written advice).

| Item | Principle | Applies to |
|---|---|---|
| [Where did it go?](https://builtformars.com/ux-bites/where-did-it-go) (Stripe) | Hovering where "test mode" used to be shows "Remember, test mode has moved" with a "Show me" link | The habit risk. Not adopted now (adds a component and hidden state for a low-usage feature) |
| [Reverse Prototype](https://builtformars.com/ux-glossary/reverse-prototype) | Remove functionality on purpose; the test is whether anyone misses it | Framing for the ticket and for tracking usage afterwards |
| [Progressive Disclosure](https://builtformars.com/ux-glossary/progressive-disclosure) | Essential options first; advanced ones when useful | Supports the move |
| [Experience Creep](https://builtformars.com/ux-glossary/experience-creep) | Each feature makes sense alone; together they bury the core | Why Profile loses its slot |
| [Hick's Law](https://builtformars.com/ux-glossary/hicks-law) | Fewer choices, faster decisions; the effect is narrower than often claimed | One menu row, not three |
| [A useful empty state](https://builtformars.com/ux-bites/a-useful-empty-state) (Wise) | The empty state gives tips for the next step | Empty-state copy |
| [Look, this is what you need](https://builtformars.com/ux-bites/look-this-is-what-you-need) (Plane Finder) | An arrow points at the control that fills the empty state | Not adopted: needs artwork outside the DS illustration set |
| [Context about hiding](https://builtformars.com/ux-bites/context-about-hiding) (Amazon) | When something is hidden, say it can still be found | Same family as "Where did it go?" |
| [Is This Why Users Are Ignoring Your Features?](https://builtformars.com/case-studies/monzo-perks) (Monzo) | Features go unused when their value is not clear in context | Background for the "low usage" question; not specific enough to drive a decision |

---

## 3. Not verified

- Usage figures behind "low usage": the call notes give no number and no analytics were queried.
- Where the Profile, sidebar and tab-bar screens live in Figma; no Figma read was made.
- Whether the Library has a mobile list-row component suitable for the bottom-sheet menu, or a mobile course card for vertical lists; only the docs and code were checked.
- What the mobile Profile header's Add button does in production.
- 360Learning, Skilljar, Thought Industries and Adobe rows rest on search summaries, not the pages themselves; LinkedIn Learning rests on third-party guides.
- The order of Mobbin preview images was assumed to match the order of the returned screen ids when pairing a link with what its screen shows.
