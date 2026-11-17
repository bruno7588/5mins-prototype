# DES-368 pre-build UX audit: Your Activity in the gear menu

**Audited:** 2026-11-17 · **Inputs:** PRD `2026-11-17-DES-368-saved-gear-menu.md`, journey SVG, the running prototype at `localhost:5173` · **Nothing is built yet.**

**Verdict: Ready after plan fixes.** The direction is sound and matches how comparable products handle saved items. Three entry points the plan relies on are broken or unverified today, the journey's last step is not delivered by any phase, and nothing tells a learner where a bookmark goes. All are small fixes to the plan, listed in section 11.

Screens captured for this audit (current state) are in `2026-11-17-DES-368-ux-audit-screens/`:

| File | What it shows |
|---|---|
| `des368-02-web-gear-menu-open.png` | `/profile` at 1440px: Profile sidebar item, Profile page, gear menu open |
| `des368-03-web-rail-gear-menu.png` | `/my-progress` at 1100px: icon rail, gear menu open |
| `des368-04-narrow-web-more-menu.png` | `/profile` at 390px: More menu open |
| `des368-05-narrow-web-my-progress-more-menu.png` | `/my-progress` at 390px: More menu open (fresh load) |
| `des368-06-mobile-progress-tab.png` | `/mobile`, Progress tab |
| `des368-07-mobile-profile-tab.png` | `/mobile`, Profile tab |

The Claude Design link was not opened; the SVG next to the PRD was used.

---

## 1. Audit steps

- Read the PRD and journey, then capture today's screens at full width, rail width, narrow web and in the phone frame.
- Write the learner's job and the stage each journey step should support.
- Check each entry point (sidebar card, rail gear, More menu, mobile avatar) for whether a learner can find and read "Your Activity".
- Check the Your Activity page, the empty states and the open-and-return loop against the journey.
- Compare with Build For Mars and Mobbin, and review the planned copy.
- Check the plan: journey coverage, acceptance criteria, Confirm stage, blockers and order.

## 2. Audit plan

Heuristics: Nielsen's 10, WCAG 2.2 AA, Apple HIG (mobile), the 5Mins design system.

| Criterion | Description | Pass/Fail | Notes |
|---|---|---|---|
| Visual design | Existing DS components only, tokens, hierarchy | Pass | Plan reuses `Tabs`, `ContentSwitcher`, cards, `EmptyState`, `BottomSheet`. Mobile menu rows are a named gap (blocker 1), correctly not improvised |
| Interaction design | Every entry point reachable, readable and reversible | Fail | More menu is clipped at 390px; rail gear menu is painted over by page content; Back does not return to the same tab |
| Accessibility | Names, focus, target size, keyboard | Fail | Rail gear has no accessible name and no tooltip (confirmed in the browser); the fix sits in Risks, not in a phase |
| Brand and copy | Learner register, house rules | Pass with fixes | One button label for four different lists; "Log out" and "Log Out" both in use |
| Job fit | The journey ends with the learner sure it worked | Fail | Step 7 is promised in the journey but only partly built on web and not verified on mobile |

## 3. The job

> When a learner remembers a lesson, course or instructor they marked earlier, they want to get back to it in a couple of taps so they can carry on learning without hunting through the feed again.

- **Trigger:** a moment of recall, often days after saving. Rare, so the route is never practised.
- **Progress:** from "I know I saved it somewhere" to "it is open in front of me".
- **A second job the journey leaves out:** when a learner bookmarks something, they want to know where it went, so they can trust the bookmark without checking. This is where the new home has to be learnt, because the main navigation no longer shows it.

The PRD's job statement ends "without it taking a slot in the main navigation". That is the business's constraint, not the learner's. It does not change the plan, but it hides the cost: the learner now has to remember a route they use rarely.

| Journey step | Stage it should support | Holds? |
|---|---|---|
| 1 Trigger | Trigger | Yes |
| 2 Opens the gear menu | Orient | Weak. Nothing on the trigger suggests saved items live there, on any surface |
| 3 Picks Your Activity | Decide | At risk. The label and the planned icon do not say "saved" |
| 4 Lands on Bookmarks | Orient | Yes on web. Mobile depends on blockers 1, 2 and 6 |
| 5 Switches tab, scans | Decide | Yes |
| 6 Opens the card | Act | Only course cards have a destination on web |
| 7 Back to the same tab | Confirm | No. Not delivered as planned |

## 4. Layout and visual analysis

### Layout

- **Web, full width** (`des368-02`). The gear menu is a three-row popover above the profile card. Adding a fourth row first is clean and needs nothing new. The trigger is the whole card (name, email, 16px gear), a comfortable target.
- **Web, rail width, 600 to 1199px** (`des368-03`). The card collapses to a lone 16px gear in a 48px button. The open menu is 220px wide and extends over the page, where the page's cards paint on top of it: "Dark Mode" is half covered by the External Training card. A fourth row makes the menu taller and more of it covered.
- **Narrow web, under 600px** (`des368-04`, `des368-05`). The More menu is 240px wide but starts at the More tab's left edge, so it runs from 309px to 549px in a 390px viewport. Only the icons and the first three letters of each label show. Measured in the browser on two pages, one after a fresh load. Likely cause: `.profile-menu { left: 0 }` and `.lmn-more__menu { left: auto }` have equal weight and the wrong one wins.
- **Mobile** (`des368-06`, `des368-07`). The Progress header holds two chips and nothing else, so there is room for a 40px avatar. The Profile tab is an empty screen under its header, so on mobile this ticket builds the saved lists for the first time; it does not move them.

### Typography

No issues. The planned page header (title, divider, tabs) follows headers.md. Page titles that name a navigation destination are already Title Case in the product ("My Progress"), so "Your Activity" as a title is consistent.

### Colour

No issues in the plan. Menu icons are specified as `--text-primary`, matching the house rule.

### Interactions

- **Tab state is not kept.** `Profile.tsx` reads `?tab=` once on load and never writes it; the Lessons / Courses switcher is not in the URL at all. Opening a course from Bookmarks > Courses and pressing Back returns to Bookmarks > Lessons.
- **Most cards have nowhere to go.** Web has a route for courses (`/courses/:id`) but none for a single lesson or an instructor. The default view (Bookmarks > Lessons) would stay a grid of cards that do nothing.
- **The gear menu has no Escape handling** and closes only on an outside click. Not new, but it now leads to content.
- **Mobile sheet.** With Dark Mode dropped (blocker 4) and Edit Profile inert (blocker 5), the sheet has two working rows: Your Activity and Log Out.

### Detected issues and system-level fixes

| Issue | System-level fix |
|---|---|
| More menu clipped under 600px | One positioning rule for `.profile-menu` variants, so order of CSS imports cannot break it |
| Rail gear menu painted over by content | The menu sits above page content at every width; check on all 8 learner pages, since each hand-rolls the shell |
| Rail gear has no name or tooltip | Every icon-only web control gets `aria-label` and the DS Tooltip (existing house rule) |
| Tab and switcher state lost on Back | Tabs and switchers that a learner can leave and return to keep their state in the URL |
| "Save" on course pages, "Bookmark" on lessons | One verb for one action across web and mobile |

## 5. Heuristic evaluation

Severity is rated by impact on the learner's progress, 0 (none) to 4 (blocks it).

| Heuristic | Assessment | Severity | Suggested fix |
|---|---|---|---|
| 1 Visibility of system status | Bookmarking gives no sign of where the item went. On the Your Activity page no navigation item is lit, so the title carries location alone | 3 | Confirm the bookmark with a toast that names Your Activity |
| 2 Match with the real world | "Your Activity" next to My Progress reads as learning history, not saved items. The planned `Activity` icon is a pulse line, which reinforces that reading | 3 | Use the bookmark-family icon the save control already uses; check the name with five learners |
| 3 User control and freedom | Back does not return to the tab the learner left. Old `/profile` links are forwarded, which is right | 3 | Keep tab and switcher in the URL |
| 4 Consistency and standards | "Save" and "Bookmark" for the same action; "Log out" and "Log Out"; Edit Profile is in the gear menu but not in More | 2 | Align in this ticket or record as deferred |
| 5 Error prevention | No destructive actions in this flow | 0 | None |
| 6 Recognition rather than recall | The whole route relies on recall: nothing visible says saved items exist. On mobile the route passes through a tab called Progress | 3 | Teach the route at the moment of saving |
| 7 Flexibility and efficiency | Two or three taps to reach the list is acceptable for a rare task | 1 | None |
| 8 Aesthetic and minimalist design | One menu row and one page for three lists is the lightest option | 0 | Keep |
| 9 Help users recover | A learner who looks for Profile finds nothing. Empty states do explain themselves | 2 | Covered by the toast; hold the Stripe-style pointer in reserve |
| 10 Help and documentation | Empty states carry the only guidance and are well placed, since most learners will see them | 1 | Name the control in the empty-state copy |

## 6. Build For Mars and Mobbin

Only links retrieved during this audit are listed.

### Build For Mars

- [Where did it go?](https://builtformars.com/ux-bites/where-did-it-go) (Stripe). When a control moves, people return to the old spot out of habit, and the product meets them there. The PRD declines this for now. That is reasonable for web, where the gear is on every page, but it leaves mobile with no bridge at all.
- [Familiarity Bias](https://builtformars.com/ux-glossary/familiarity-bias). People pick what feels familiar. A learner who has always tapped Profile will keep looking for a Profile, and Edit Profile in the same menu is the nearest match. Expect mis-taps on Edit Profile.
- [Content Blindness](https://builtformars.com/ux-glossary/content-blindness). Repeated identical messages stop being read. This argues for a short, specific bookmark toast, and against a standing banner about the move.
- [Progressive Disclosure](https://builtformars.com/ux-glossary/progressive-disclosure) and [Experience Creep](https://builtformars.com/ux-glossary/experience-creep). Both support taking a low-use page out of the main navigation. The decision itself is right.

What BFM teaches about this kind of problem: moving a feature is safe when the product tells people at the moment they care, either where they used to look or when they next use the feature. The plan does neither.

### Mobbin

| Screen or flow | What it shows | What it implies here |
|---|---|---|
| [DoorDash: first saved store](https://mobbin.com/screens/49f539f4-d05f-4abd-bfb2-914b38193e30) | On the first save, a sheet says "You can view the stores you save in your Account settings" with a button to go there | The location is taught when the learner saves. This is the missing step in the journey; a toast is the lighter version |
| [Noom: Saved lessons](https://mobbin.com/flows/aff8f35d-cea6-4534-8e8e-0989d6bea333) | Avatar menu, a row literally named "Saved lessons" with a bookmark icon, then a list that ends with how to save more | A literal label and a bookmark icon carry the scent. Supports changing the icon |
| [Speak: Profile](https://mobbin.com/flows/6a8199eb-35c3-4284-9d99-6d2284d3eff8) | "Saved Lines" and "Your Activity Log" sit on the same screen as two different things; the activity log is a history of lessons done | In a learning app, "activity" already means history. Evidence for the naming risk |
| [Reddit: My Account sheet](https://mobbin.com/screens/9d0089b7-8982-431c-8112-1358f31ebc94) | A bottom sheet of icon and label rows, with a toggle row | Confirms the bottom sheet as the mobile menu surface (blocker 1) |
| [Uxcel: Bookmarks](https://mobbin.com/flows/5c8ddec6-9b7c-437a-9085-9acf39fb2b99) | Exercises / Lessons switch inside bookmarks; the empty state reads "Sorry, we couldn't find any matches" | Keep the switcher. Avoid an empty state that reads as a failed search |
| [Co-Star: Saved](https://mobbin.com/screens/c55ff12a-3816-49e9-90e6-dc0be57927b3) | Saved is a tab on the profile page | Saved items one level down is normal, as the PRD says |

## 7. Copy review: learner web and mobile - Your Activity

**Verdict:** ship after three should-fixes.

| # | Location | Severity | Issue | Suggested rewrite |
|---|---|---|---|---|
| 1 | Empty states, all four buttons | Should-fix | "Explore Lessons" is the button for bookmarked courses too. It sends the learner to a feed where a course cannot be bookmarked | Courses: **Browse Courses**, opening Your Workspace. Lessons, Likes and Following keep **Explore Lessons** |
| 2 | Bookmarks empty, body | Should-fix | "Bookmark a lesson and it'll be here..." does not say how. The adopted pattern (The Atlantic) names the control | "Use the bookmark on any lesson to keep it here for later." Same for courses |
| 3 | Likes empty, body | Should-fix | There is no Like control in the prototype, so the copy describes an action the learner cannot find. Fine for Figma; in the prototype it reads as a dead end | Keep the copy, and note in the Figma callout that the Like control is a production feature |
| 4 | Gear menu and More menu | Polish | "Log out" in the gear menu, "Log Out" in More and in the PRD's mobile row | **Log Out** everywhere, to match Edit Profile and Dark Mode |
| 5 | Course page icon label | Should-fix | "Save" on courses, "Bookmark" on lessons, "Bookmarks" as the tab. The PRD notes it but no phase changes it | Rename the course control to **Bookmark** in phase 1, or list it under Out of scope |
| 6 | Toast | Should-fix | "None" is right for the move itself, but leaves the bookmark action silent | On bookmarking: **Bookmarked. Find it in Your Activity.** |
| 7 | Tabs `aria-label` | Polish | Still "Profile sections" in code | "Your Activity sections" |

**Notes.** The headings ("No bookmarked lessons yet", "Not following anyone yet") are plain, blame-free and on voice. British spelling holds throughout.

## 8. Findings, ranked by impact on progress

### F1. Nothing tells the learner where a bookmark goes

- **Job context:** keeping something for later and trusting it will be findable.
- **Job stage:** Confirm (of saving), which sets up Trigger and Orient days later.
- **Observed friction:** the web lesson feed's Bookmark row toggles silently. After this ticket there is no Profile item in the sidebar or tab bar to imply a home. The journey starts at "remembers something they saved" and skips the save itself. The PRD's own side path says "nothing points to the new home".
- **Forces:** Habit is dominant. Learners look for Profile; the product answers with silence. Anxiety follows: "did it save at all?"
- **Behavioural consequence:** learners search the feed again, or stop bookmarking. Usage falls, and the reverse-prototype test the PRD wants to run reads as "nobody missed it" when the real cause is that nobody could find it.
- **Recommendation:** confirm each bookmark with the existing DS Toast, "Bookmarked. Find it in Your Activity." Add the save moment to the journey as its first step. It is one toast, it uses an existing component, and it covers web, narrow web and mobile.

### F2. Under 600px the menu that holds Your Activity is cut off

- **Job context:** finding the saved list on a phone browser.
- **Job stage:** Decide.
- **Observed friction:** `des368-04` and `des368-05`. The More menu overflows the right edge; labels show as "Adr", "You", "Pro". After the change, "Your Workspace" and "Your Activity" would both read "You".
- **Forces:** Anxiety. The learner cannot tell which row is which.
- **Behavioural consequence:** guessing, or abandoning the menu. The plan's check for 1.3 ("More shows no Profile and Your Activity opens the page") would pass with the label unreadable.
- **Recommendation:** fix the menu's position as part of 1.3 and add a check that every row label is fully visible at 375px.

### F3. Between 600 and 1199px the entry point is a bare 16px gear, and its menu is covered

- **Job context:** finding the saved list on a small laptop or tablet.
- **Job stage:** Orient.
- **Observed friction:** `des368-03`. The trigger has no accessible name, no tooltip and no text. The open menu is overlapped by the page's cards. The PRD lists the tooltip and name under Risks, but no phase row delivers them.
- **Forces:** Habit and Anxiety. A gear means settings; nothing suggests content is behind it.
- **Behavioural consequence:** learners at this width do not open the menu for saved items at all. Screen reader users hear "button".
- **Recommendation:** move the fix into phase 1.2: `aria-label` "Account menu", the DS Tooltip, and the menu painted above page content. Verify at 1100px on each of the 8 pages.

### F4. The journey's last step is not delivered

- **Job context:** opening the saved item and getting back to the list.
- **Job stage:** Act and Confirm.
- **Observed friction:** step 7 says "the item opens where they left off; Back returns to Your Activity on the same tab". In the code, tab and switcher state are not kept, so Back resets to Bookmarks > Lessons. Only courses have a web destination; phase 1.7 says lesson and instructor cards open "as far as the prototype has a destination", which today is nowhere. "Where they left off" is not specified in any phase. On mobile, phase 2.3 claims steps 4 to 7 but its check covers only Back to Progress.
- **Forces:** Anxiety. A list whose cards do nothing, or that loses its place, does not feel like a reliable home.
- **Behavioural consequence:** learners re-find the tab each time, or decide the page is broken. Reviewers of the prototype cannot complete the journey from the default view.
- **Recommendation:** in 1.4, write the tab and the switcher to the URL (`?tab=bookmarks&view=courses`). In 1.7, name the destination for each card type: courses open `/courses/:id`; lessons open the For You lesson feed; instructors are stated as having no destination yet. Change step 7 in the journey to "the item opens", unless resume position is in scope. Add card opening and Back to the 2.3 check.

### F5. The label and icon do not say "saved"

- **Job context:** choosing the right row in a four-row menu.
- **Job stage:** Decide.
- **Observed friction:** the PRD's own step 3 thought is "Is this where my bookmarks went?". "Your Activity" sits near My Progress and reads as what I have done. The recommended `Activity` icon is a pulse line, the icon of analytics. The save control in the product uses `ArchiveAdd`.
- **Forces:** Anxiety (fear of picking wrong) plus Habit (Edit Profile is the familiar word).
- **Behavioural consequence:** learners try Edit Profile first, land on a profile page with no saved lists, and conclude bookmarks are gone.
- **Recommendation:** use the `Archive` icon, the PRD's own alternative and the same family as the save control, so the row is recognised by its icon. Treat the name as an assumption: ask five learners where they would look for a saved lesson before Figma is finalised.

### F6. On mobile the route runs through a tab with no connection to saving

- **Job context:** finding a saved lesson in the app, where most bookmarking happens.
- **Job stage:** Orient.
- **Observed friction:** `des368-06`. The learner must go to Progress, then tap an avatar with a gear, then pick a row. The journey shows this as one step. The plan does not say whether the avatar shows under both chips (My Team and My Progress), and the avatar has no stated accessible name.
- **Forces:** Habit. The Profile tab was the fifth tab; it is now gone with nothing in its place.
- **Behavioural consequence:** learners do not find the list on mobile unless told.
- **Recommendation:** rely on the F1 toast as the bridge. In 2.2, state that the avatar shows under both chips and give it the name "Account menu". Split step 2 in the journey into two for mobile so the extra tap is visible.

### F7. Empty states point every list at the same place

- **Job context:** arriving with nothing saved, which the PRD says is most learners.
- **Job stage:** Orient, then Decide.
- **Observed friction:** four empty states, one button, "Explore Lessons". The courses list sends learners to a lesson feed; the copy does not name the control that fills the list.
- **Forces:** Pull is weak. The page should make saving feel worth trying.
- **Behavioural consequence:** learners follow the button, do not see how to bookmark a course, and do not come back.
- **Recommendation:** see copy review rows 1 and 2.

## 9. Validation

| Job | UI that serves it | Mapping holds? |
|---|---|---|
| Know where a bookmark went | Nothing planned | No. Needs the toast (F1) |
| Reach the saved list | Gear menu row, More row, mobile avatar and sheet | Partly. Full-width web holds; rail, narrow web and mobile need the fixes in F2, F3, F6 |
| Pick the right list | Tabs and the Lessons / Courses switcher | Yes |
| Open the item and return | Cards and Back | No. See F4 |
| Understand an empty list | Empty states | Yes, with copy fixes |

**Does this flow help the learner feel confident enough to make progress?** Not yet. A learner who already knows the route and uses a wide screen will be fine. Everyone else is missing two things: being told where saved items live, and a menu they can read at their screen width. Further review is needed once the Figma for the mobile sheet rows exists (blocker 1).

## 10. Scores

| Screen or flow | Score | Summary |
|---|---|---|
| Web gear menu, full width (steps 2 and 3) | 7 | Clean and light; the icon and name carry weak scent |
| Web gear at rail width | 4 | Unnamed 16px gear; menu covered by page content |
| Narrow web More menu | 3 | Menu clipped; labels unreadable |
| Your Activity page (steps 4 and 5) | 7 | Existing layout works; plain title is the right call |
| Open and return (steps 6 and 7) | 4 | Only courses open; Back loses the tab |
| Empty states | 6 | Good structure and tone; one button for four lists |
| Mobile route: Progress, avatar, sheet | 4 | Three taps through an unrelated tab, on three open blockers |
| Mobile Your Activity screen | 5 | A new build, not a move; card pattern undecided |
| Looking for Profile out of habit | 3 | Named as a risk, with no answer in the plan |
| Plan as a whole | 6 | Right direction and honest about gaps; fixes are small |

### Executive summary

Moving Bookmarks, Likes and Following behind the account menu is the right call and matches Noom, Reddit and the learning tools in the PRD's research. The plan's weakness is the route, not the destination. Two of the three web entry points have defects today that the plan would inherit: the More menu is cut off under 600px, and at rail width the gear is an unnamed icon whose menu is covered by the page. The journey's closing step, open the item and come back to the same tab, is not built by any phase. And no step tells a learner where a bookmark goes, which is the one moment the new home can be learnt now that Profile is leaving the navigation. One toast and four small plan edits close most of this.

### Recommendations, easiest first

| # | Change | Job and screen it improves | Effort |
|---|---|---|---|
| 1 | Use the `Archive` icon for the Your Activity row, not `Activity` | Picking the right row; gear menu, More, mobile sheet | Trivial |
| 2 | Copy: "Browse Courses" for the courses empty state; name the bookmark control in the body; "Log Out" everywhere | Understanding an empty list; empty states | Trivial |
| 3 | Reword journey step 7 to "the item opens"; add the save moment as the first step; split mobile step 2 in two | Honest journey; SVG and PRD | Trivial |
| 4 | Add to 1.2: `aria-label` "Account menu" and DS Tooltip on the rail gear; menu above page content; verify at 1100px | Reaching the list; `des368-03` | Small |
| 5 | Add to 1.3: fix the More menu position; verify labels are fully visible at 375px | Reaching the list; `des368-04`, `des368-05` | Small |
| 6 | Add to 1.4 and 1.7: tab and switcher in the URL; name each card's destination | Open and return; Your Activity page | Small |
| 7 | New row in phase 1: toast on bookmark, "Bookmarked. Find it in Your Activity." (web feed; mobile in Figma) | Knowing where a bookmark went; lesson feed | Small |
| 8 | Rename the course "Save" control to "Bookmark", or list it under Out of scope | One verb for one action; course page | Small |
| 9 | 2.2: avatar under both chips, named "Account menu"; add card opening and Back to the 2.3 check | Mobile route and return; `des368-06` | Small, after blockers |
| 10 | Move the Library work (3.3) ahead of phase 2 | Plan order | Planning only |
| 11 | Check the name "Your Activity" with five learners before Figma is final | Picking the right row | Half a day |

## 11. Plan check

### Journey coverage

| Journey step | Phase that delivers it | Gap |
|---|---|---|
| 1 Trigger | None needed | The save moment that precedes it has no step and no phase |
| 2 Opens the gear menu | 1.2, 1.3, 2.2 | Rail width is not verified anywhere. Tooltip and accessible name are in Risks only |
| 3 Picks Your Activity | 1.2, 1.3, 2.2 | None |
| 4 Lands on Bookmarks | 1.4, 2.3 | None |
| 5 Switches tab, scans | 1.4, 2.3 | None |
| 6 Opens the card | 1.7, 2.3 | Lessons and instructors have no web destination. 2.3 does not say cards open |
| 7 Back to the same tab | 1.7, 2.3 | State is not kept, so the 1.7 check fails for anything but Bookmarks > Lessons. "Where they left off" has no phase |
| Side path: empty tab | 1.6, 2.3 | None |
| Side path: old `/profile` link | 1.5 | None |
| Side path: looking for Profile | None | Accepted as a risk, with no mitigation |

Phases that serve no journey step: 3.4 (docs), which is fine. Phase 0 is accurate.

### Acceptance criteria

| AC | Journey step | Phase | Can the plan meet it? |
|---|---|---|---|
| AC1 Find Bookmarks, Likes, Following from the gear menu | 2 to 5 | 1.2, 1.3, 1.4, 2.2, 2.3 | Yes at full width. Not credibly at rail width or under 600px until F2 and F3 are in the plan. Mobile waits on blockers 1 and 2 |
| AC2 Navigation no longer shows a separate Profile page | 2 | 1.1, 1.3, 2.1, 3.3 | Yes. Edit Profile still opens a profile-like page; the PRD says so, which is enough |
| AC3 Updated flows cover web and mobile | All | Phase 3 | Yes, once the Library variants exist. The ACs ask for designs, so the mobile prototype screen (2.3) is more than AC3 needs; see the note below |

### Confirm stage

The journey ends at Confirm on paper. As planned, it ends at Act for lessons and instructors on web (cards do not open), and Confirm fails for any tab other than the default. Mobile Confirm is not checked.

### Blockers and order

- **Blockers 1, 2 and 6 are real.** Blocker 1 (rows inside the bottom sheet) is the right call under the no-improvising rule; the Reddit sheet above is a usable reference to bring to Figma.
- **Blockers 3, 4 and 5 are decisions, not blockers.** Each has a clear recommendation and can be confirmed in one message.
- **Blocker 7** is correctly marked as non-blocking.
- **Order problem.** Phase 2 waits on blocker 2, a Library variant, but the Library work is row 3.3, after phase 2. Move 3.3 (four-tab bar and the Progress header with avatar) ahead of phase 2.
- **Phase 1 can be verified as it lands**, row by row, once the checks in F2, F3 and F4 are added.
- **Scope note for the PM.** On mobile nothing is being moved: the saved lists have never existed there, so 2.3 is a new screen with three tabs, a switcher, three card types and an undecided card pattern. Since the ACs are about designs, one option is to build 2.1 and 2.2 in the prototype and deliver the mobile Your Activity screen in Figma only. That removes blocker 6 from the build path.
- **One open question not in the PRD.** While an admin is impersonating a learner, the gear menu shows that learner. Your Activity would then show the learner's likes and follows to the admin. The Profile page has the same behaviour today, so this is not new, but the move is a good moment to decide whether it is intended.

### Verdict

**Ready after plan fixes:**

1. Add the bookmark toast as a phase 1 row and as the journey's first step.
2. Add the More menu position fix and a 375px label check to 1.3.
3. Move the rail gear's accessible name, tooltip and stacking fix from Risks into 1.2, with an 1100px check.
4. Keep tab and switcher in the URL (1.4) and name each card's destination (1.7); reword step 7.
5. Swap the icon to `Archive`; fix the empty-state button for courses.
6. Move the Library work ahead of phase 2, and add card opening and Back to the 2.3 check.
