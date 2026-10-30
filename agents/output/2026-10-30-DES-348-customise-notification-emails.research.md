# DES-348 research notes: customise invitation, welcome and course reminder emails

Supporting research for `2026-10-30-DES-348-customise-notification-emails.md`. Compiled 2026-10-30.

## 1. Prototype artifact (read with the Artifact tool)

Source: https://claude.ai/artifact/FSc3hpTibwNFE5YYxjZQ1y ("Email Customisation Prototype"). It was readable. It is a single-page HTML mock of Automations > Workflows, not React code from this repo. Behaviour and content found in it:

| Area | What the prototype does |
|---|---|
| Page | Automations > Workflows tab with three cards: Team Progress Email (existing, "Preview email template" link), Course reminders ("System reminders" rows marked Changed, "Your reminders", Add Reminder), Welcome emails (new card, no on/off switch: "turning these emails off was not part of the brief") |
| Labels | `Custom reminder` chip on edited built-in reminders, `Custom email` on edited welcome rows; only when `custom` content exists |
| Editor surface | Centred dialog, 780px (1160px with the AI panel). Title "Edit 7-day reminder" / "Edit welcome email" / "Add new reminder". Close X top right |
| When line | Built-in: "Sent 7 days before a course's due date. This day is built in and can't be changed." Admin-added: day stepper (1-90) |
| Subject | Single-line contenteditable, text and fields only. For course reminders it sits in one bordered group with an "Also shown in" row: Slack, Microsoft Teams, Phone notification chips, each with an eye icon, each opening that channel's preview |
| Message | Label "Message" plus an "Email only" tag whose tooltip reads "Slack, Microsoft Teams and phone notifications don't include the message." |
| Toolbar | Bold, Italic, Underline, Heading, Bulleted list, Numbered list, Link (inline URL row with "Add link" / "Remove link"), Clear formatting, Emoji (6-column grid menu), "{ } Insert field" menu grouped Person / Organisation / Invite / Course, each with "If missing: ..." |
| Canvas | The editor sits inside the real email: org header (tenant logo + "Powered by 5Mins"), editable area above, locked block (dashed outline, "lock" badge), editable area below (placeholder "Add text below (optional)"), footer. Course card caption: "Example course. Each person sees the course the reminder is about." |
| Fields | first_name (sample Alex, fallback "there"), last_name (fallback "left out"), full_name (fallback "there"), email, org, invited_by (Phase 2, fallback organisation name), course_name, due_date, days_left, lessons, duration |
| Limits | `SUBJECT_MAX = 200`, `BODY_MAX = 5000`; counters "n / 200" and "n / 5,000"; errors "Keep the subject to 200 characters or fewer", "Keep the message to 5,000 characters or fewer" |
| Defaults | 7-day subject "Don't Miss the Boat! : Complete your Course"; 1-day "Power Up : Complete your Course"; body "Hi {first name} 👋 / Your course is waiting for you - just N days remaining to complete it. / Take a moment today to start your learning journey." + sign-off "That's it! See you in 5Mins! 🚀 / Team 5Mins". Welcome subject "Welcome to 5Mins 🎉", locked button "Learn Now". Starter for new reminders: subject "{days left} left to finish {course name}" |
| Welcome note | "Today 5Mins sends slightly different versions to managers and to people without the app; your email goes to everyone. Custom emails are text only, so today's two images aren't included." |
| Channel copy today | Slack/Teams default: "🛥️ Don't Miss the Boat!: Complete your Assigned Course. Start here" (7-day). Push default title: "Hurry up! 😅 N days left..." with the course name as body. Once customised, Slack/Teams show "{custom subject}: Complete your Assigned Course. Start here" and push title = custom subject |
| Preview | Inbox header (From, Subject), full email with header and footer (social icons, store badges, Unsubscribe). From: "5Mins" for reminders, "5Mins Team" for welcome; invite reminders "Maddie from 5Mins" by default, tenant name once custom |
| Reset | "Reset to default" text button in the edit footer; shown only for customised built-in emails. **No confirmation**; toast "{name} reset to default" |
| Save | "Save" (welcome) / "Save Reminder" (course). Toasts "Welcome email updated", "7-day reminder updated", "Reminder added" |
| Write with AI (Phase 2) | Outlined button in the edit header opens a 320px side panel: prompt textarea, Tone (Friendly / Professional / Urgent), Length (short / long), Generate; result strip with "Undo"; toast "Draft undone" |
| Phase 2 invite reminders | New starter text because today each reminder (day 3, 5, 7, 9) has different text, sender "Maddie from 5Mins", some with avatars or lesson lists |
| Not handled | Unsaved-changes guard on close; reset confirmation; Slack/Teams connected vs not (note only); AI-off organisations |

## 2. Prototype repo: what the code does today

| File | Today |
|---|---|
| `src/App.tsx:126` | `/automations` route renders `src/pages/automations/Automations.tsx` |
| `src/pages/automations/Automations.tsx:1144-1159, 1552` | Page-local underline tabs Manage / Activity / Workflows (`.automations-tab`); Workflows renders `WorkflowsTab` |
| `src/pages/your-courses/components/WorkflowsTab/WorkflowsTab.tsx` | Admin-only. Seeds two `system: true` reminders (7 and 1 day), both subject "Reminder: your course is due soon" and a placeholder body, not the real 5Mins text. Renders `WorkflowCard` (Team Progress Email) and `CourseRemindersCard` |
| `.../WorkflowsTab/CourseRemindersCard.tsx` | `Reminder { id, days, subject, body, system?, paused? }`. "Default Reminders" group: text row + Toggle only, no edit. "Your reminders": Edit2 and Trash icon buttons with Tooltip, delete via `ConfirmModal`, Add Reminder (`Button variant="text"`). Card copy: "Send automatic emails to learners before a course's due date. Sent at 9:00 AM UTC on the scheduled day." Toasts "Reminder updated", "Reminder added", "Reminder paused/resumed" |
| `.../WorkflowsTab/EditReminderModal.tsx` | Hand-composed centred modal on `.confirm-modal` classes: day stepper (1-30), `InputField` subject, plain `<textarea>` message, Cancel (`outlined-2`) + Save. No limits, no formatting, no preview |
| `.../WorkflowsTab/EmailPreviewModal.tsx` | Team Progress Email sample preview (static sample, closes on Escape and backdrop) |
| `.../WorkflowsTab/WorkflowCard.tsx` | Team Progress Email card (toggle, frequency, scope, preview link) |
| `src/pages/add-content/components/FlashcardEditor/FlashcardEditor.tsx:459-464` | Decorative `aria-hidden` toolbar (Font, Bold, Italic, Underline) with no behaviour; page-local `.fce-toolbar` |
| `src/components/AIGenerateDrawer` | AI question generation drawer (steps, AIWorkingCard). Different job; reusable only for the AI working pattern |
| No welcome-email, invitation-email or channel-preview code exists. No rich-text, emoji or merge-field component exists. No Tabs shared component (page-local bars per `chips-switcher-tabs.md`) |

## 3. Design system findings

| Need | DS status | Source |
|---|---|---|
| Editor container | Full-screen Modal is sanctioned for "a full-screen editor ... (lesson editors)"; page-local shell with `useOverlayA11y` + `<CloseButton variant="fullscreen">`. Side Drawer is 720px and "the user edits a record or works through a long form"; it can't hold a 600px email plus the Phase 2 AI panel | `overlays.md` lines 52-76, 78-101 |
| Confirm dialogs | `ConfirmModal`, no X, buttons only; Outlined-2 Cancel then commit; `semantic="danger"` for destructive, `semantic="warning"` for discarding unsaved changes | `confirm-modal.md` |
| Labels "Custom reminder" / "Custom email" | `Badge`, Informative type (metadata), no icon | `badges.md` |
| Channel preview switcher | Tabs: no shared component, page-local bar (`.roles-header__tab` reference). Content Switcher allowed "for two views of one object in a drawer" | `chips-switcher-tabs.md` lines 29-46, 434 |
| Channel chips in "Also shown in" | Chip (pressable pill) with `iconLeft` | `chips-switcher-tabs.md` |
| Fields menu, emoji menu | Listbox surface (grouped with headers); no shared Listbox component, rendered by `RowActionsMenu` or `Dropdown` menu | `listbox.md` |
| Subject field | `InputField` (Outlined) supports label, helper, error; counter not specified | `input.md` |
| Image notice | Callout (inline, informational) | `alerts-toast.md` |
| Toast | Label only, **no Undo or action** | `alerts-toast.md` line 301 |
| Tooltip on icon-only controls | `Tooltip` | `alerts-toast.md` |
| AI button | `Button semantic="ai"` with sparkle icon; outlined AI variant exists | `buttons.md` lines 337-370, 553 |
| Rich-text editor (toolbar + editable area) | Missing from the DS. **Decided (D5):** mui-tiptap via `@web/ui`, restyled to tokens; plain Tiptap in the prototype | section 5 |
| Emoji picker | Missing. **Decided (D6):** operating system picker, helper text hint only | section 5 |
| Merge-field token inside text | Missing. **Decided (D7):** wrapper with `--input-background`, `--text-primary`, `--radius-xs`, padding `0 var(--space-xs)` | `src/styles/tokens.css` lines 120 / 258 (input-background), 133 / 270 (text-primary), 202 (radius-xs), 190 (space-xs) |
| Email canvas / locked block / transactional email template | Missing. **Decided (D8):** compose-card editor with a plain body; header and footer only in Preview, which still needs the real sent HTML | section 5 |
| Slack / Teams / phone notification mock | Missing. **Decided (D10, D11):** built from the official app anatomy; Slack and Teams share one message | section 5 |
| Character counter | **Missing** from `InputField` spec | `input.md` |

Copy rule conflict: the 5mins-copy-review skill says buttons are sentence case; Bruno's global rule and memory say button labels are Title Case. Title Case wins for buttons.

## 4. External research

### Learning platforms

| Source | What it does | Verdict |
|---|---|---|
| Sana Labs, Renaissance release, https://sanalabs.com/renaissance | "Set the domain, terms and conditions, welcome messages, email sender, branding in email templates"; refreshed templates for inviting users and reminding learners | Adopt the scope signal: welcome and reminder text is customer-editable at peers. No public detail on editor, fields or preview |
| Sana Labs changelog, https://sanalabs.com/sana-learn-changelog | Per-course due-date reminder cadence overriding the org default | Reject for now: PM decided custom text is organisation-wide; cadence is DES-291 |
| Sana Labs help centre | Not found by search | Nothing usable |
| Docebo, https://help.docebo.com/hc/en-us/articles/29547314721938 and community https://community.docebo.com/docebo-superadmins-46/using-shortcodes-in-learner-emails-12816 | Shortcodes per notification event; only listed ones work; users report confusion when lists differ | Adopt: offer only the fields valid for each email (course fields only on course reminders). Reject typed shortcodes; insert from a menu |
| TalentLMS, https://help.talentlms.com/hc/en-us/articles/9651467253660-How-to-customize-the-default-system-emails-in-TalentLMS and https://help.talentlms.com/hc/en-us/articles/9651467334044-How-to-work-with-notifications-in-TalentLMS | Smart tags in curly brackets from a menu; tags don't populate in test emails; system emails editable on paid plans; subject taken from the body's first line | Adopt menu insertion. Reject blank tags in preview: 5Mins preview fills sample values |
| 360Learning, https://support.360learning.com/hc/en-us/articles/40150537238932-Track-360Learning-email-notifications | Only an email-tracking article found; no editor docs | Nothing usable |
| Cornerstone (Wisconsin job aid), https://dpm.wi.gov/Documents/JobAids/Cornerstone/Manage_Email_Administration.pdf | Email Administration: emails tied to triggers, Email Tags inserted dynamically | Confirms table stakes; no UI detail to adopt |
| Workday, https://doc.workday.com/admin-guide/en-us/human-capital-management/learning/learning-content/concept--calendar-message-templates.html and Notification Designer https://doc.workday.com/user-guide/en-us/workday-notification-designer/bzo1601673588430.html | Tenant-level templates; edits only live after publish | Adopt tenant-level scope (matches organisation-wide decision). Reject a separate publish step: Save is the commit |
| Adobe Learning Manager, https://experienceleague.adobe.com/en/docs/learning-manager/using/admin/email-templates | Admin email templates for LMS events | Confirms table stakes |

### Merge fields with fallbacks

| Source | What it does | Verdict |
|---|---|---|
| Intercom, https://www.intercom.com/help/en/articles/248-personalizing-messages-using-variables | `first_name|fallback:"there"` gives "Hi there" when missing; fallback only fires on null or empty | Adopt "there" for first name, shown in the menu. Flag that placeholder data (e.g. "N/A") in HRIS won't trigger a fallback |
| Customer.io, https://docs.customer.io/journeys/liquid/using-liquid | `default:` filter; with no fallback and a missing attribute the message fails to send | Adopt: every person field needs a fallback so a send never fails |
| Mailchimp (via QuickBooks help), https://quickbooks.intuit.com/learn-support/en-us/help-article/audience-management/getting-started-merge-tags/L60wZKQxn_US_en_US | Audience-level default ("Friend"); blank if none | Adopt fixed defaults set by 5Mins, not per-email admin input (simplest) |

### Channel and client limits (for the character limits)

| Source | Finding |
|---|---|
| Microsoft Graph, https://learn.microsoft.com/en-us/graph/api/teamwork-sendactivitynotificationtorecipients | "Microsoft Teams only shows the first 150 characters" of preview text |
| Teams community, https://techcommunity.microsoft.com/t5/microsoft-teams/activity-feed-notification-cards-character-limit/td-p/3572178 | Same 150 observation; no documented API-side cap |
| Slack, https://docs.slack.dev/reference/methods/chat.postmessage.md | Truncates above 40,000 characters; recommends text under 4,000 |
| Batch, https://help.batch.com/articles/2117730-how-many-characters-can-contain-my-push-notifications | Push title 15-30 characters recommended (15-40 before iOS 15); Android lock screen shows one line |
| Braze, https://www.Braze.com/docs/user_guide/message_building_by_channel/push/ios/rich_notifications/ | About 30-40 characters per line for title and body |
| Email subject display, https://www.emailtooltester.com/en/blog/email-subject-lines-character-limit/ and https://www.buzzstream.com/blog/email-subject-line-length/ | Phones show about 30-48 characters; desktop Gmail about 70-88, Outlook about 50-60. No official vendor numbers |
| RFC 5322 line length, https://mailformat.dan.info/body/linelength.html | 998 characters per header line hard cap (not a practical constraint here) |
| Gmail clipping, https://www.spamresource.com/2022/01/what-is-gmail-clipping-and-what-to-do.html | Gmail clips messages above about 102KB of HTML with "[Message clipped]" |

(Superseded by revised D4 in section 6; the suffix it relied on is also dropped, so it no longer applies.) Original derived proposal: subject 100 characters (5Mins appends ": Complete your Assigned Course. Start here", about 43 characters, in Slack and Teams, so 100 + 43 stays under the 150 Teams preview); helper text tells admins phones show about the first 40. Message 5,000 characters of visible text, about 800 words, far below Gmail clipping once wrapped in the template.

### Mobbin (web)

| Interaction | Screen | What it does | Verdict |
|---|---|---|---|
| Field insertion | Klaviyo https://mobbin.com/screens/08cd3807-1511-4681-8463-be48d6ca3e31 | Field shows as an inline token ("first_name") in the body; "Insert" menu in toolbar | Adopt inline token + toolbar menu |
| Field insertion | Employment Hero https://mobbin.com/screens/527b14ef-fd1f-4b0c-9145-726550a744b5 | Every variable highlighted as a token; side table of variables | Adopt token look; reject the side table (heavier than a menu) |
| Field insertion | Wrangle https://mobbin.com/screens/b7d80d36-0b2b-4024-9413-834a0c8b95ff | Typing a trigger opens a field menu inline; "Variable" hint in footer | Consider as a later shortcut; menu first |
| Field insertion | AutoSend https://mobbin.com/screens/2368a4fe-0ee5-429a-b189-0db164804062 | `{{email}}` raw handlebars in a dropdown | Reject raw syntax for admins |
| Field insertion | Salesforce https://mobbin.com/screens/000ba1f7-9a85-4cc3-9bf5-9283e564d5cb | Full modal with categories and search to insert one field | Reject: too heavy for 11 fields |
| Locked block | User Interviews https://mobbin.com/screens/daf8f767-8311-4b78-b69f-40ece8a3df92 | "Required email variables" (sign-up button) must stay in the content; "Reset to UI default" link next to Send test | Adopt the required block idea, but enforce it structurally (locked, not removable) instead of relying on the admin keeping a token |
| Template code | Kit https://mobbin.com/screens/268ec61b-ae69-426b-8cf6-2a0434c4666a, Teachable https://mobbin.com/screens/9952bca8-27ee-4970-86f4-e3c6c2d3d90a | Raw HTML / Liquid template editing | Reject for 5Mins admins |
| Preview | Fresha https://mobbin.com/screens/5dec67dd-3c20-4c61-bd29-9a7f273196cb | Preview step with Desktop / Mobile switcher | Adopt switcher pattern for channels; device toggle not needed |
| Preview | Eventbrite https://mobbin.com/screens/4b9073b9-d433-4e3c-88d7-f3e3f9190aff | Preview shows Subject and From above the rendered email | Adopt inbox header (From, Subject) above the email |
| Preview | Loops https://mobbin.com/screens/6716f07d-5f03-4b72-a12e-0822b018e2bc | Name, From, Subject rows above preview | Adopt same idea |
| AI drafting | Apollo https://mobbin.com/screens/67875c9e-a736-4bf6-95cc-df1da5d6fd29 | "Write with AI" in editor; side panel with presets and "Insert text" | Adopt side panel and explicit apply step |
| AI drafting | GoDaddy https://mobbin.com/screens/457da2c5-71ad-43f0-aac4-87f432704b08 | Side panel: tone dropdown, email type, free prompt, Suggest | Adopt tone + prompt; keep length as the only other option |
| AI drafting | Mailchimp https://mobbin.com/screens/b28c2603-fe77-470b-97c3-0a20346a145f | Inline "Tell AI how to edit" with Generate, "AI may produce inaccurate content" note | Adopt the review-before-save disclaimer |
| Unsaved changes | Customer.io https://mobbin.com/screens/25eb3dc6-8fb5-4b98-a213-7503d661e8ab | "You have unsaved changes" with Go back / Discard changes / Save & Continue | Adopt two buttons only (DS: Cancel + commit); reject the third Save path |
| Unsaved changes | Toggl Track https://mobbin.com/screens/4af9d4cb-f2d7-4037-95f7-400343b15ce7 | Discard changes / Save changes | Same verdict |
| Customised-state list | Deel https://mobbin.com/screens/92ce1fe5-a2b8-4abb-9250-ad5b00f93b76 | Category rows with channel list as supporting text | Partial: channel list idea is already in the card copy |
| Reset to default confirmation | Searched "reset email template to default confirmation dialog" | Only password-reset screens returned | Nothing usable |
| Channel preview tabs (email / Slack / push) | Searched | Only notification-preference settings screens returned | Nothing usable |

### Build For Mars

| Lesson | Link | What it says | Verdict |
|---|---|---|---|
| Intentional friction | https://builtformars.com/ux-glossary/intentional-friction | Friction helps before irreversible actions only when specific: name the action, the target and the consequence; generic "Are you sure?" is skipped | Adopt for the reset dialog: name the email and say the custom text is deleted for good |
| Substack's danger zone | https://builtformars.com/ux-bites/highway-to-the-danger-zone | Keep data-losing actions apart from routine ones, with the consequence spelt out | Adopt: Reset sits apart from Save, as a text button on the left |
| Linear's undo warnings | https://builtformars.com/ux-bites/linears-undo-warnings | Only warn when the action is risky (old or off-page); don't nag on recent ones | Adopt: show the unsaved-changes dialog only when something changed |
| Asana needs to be reloaded | https://builtformars.com/ux-bites/asanas-needs-to-be-reloaded | Warn before work is lost and say what to do | Supports the unsaved-changes guard |
| Notion rendering your preview | https://builtformars.com/ux-bites/rendering-your-preview | Preview renders the real content, not a placeholder, before publishing | Adopt: preview uses the admin's text with sample values and the real header and footer |
| Claude artifacts | https://builtformars.com/ux-bites/creating-artifacts | Live filling of a preview builds confidence | Optional for Phase 2 AI drafting |

## 5. PM decisions (update, 2026-10-30)

Blockers B1-B7 from the first draft were settled by the PM the same day and are now decisions D5-D12 in the PRD. Research behind each:

### D5 rich-text editor: mui-tiptap

| Check | Finding | Source |
|---|---|---|
| Version and licence | v1.31.0, published 1 June 2026; MIT | https://www.npmjs.com/package/mui-tiptap, https://github.com/sjdemartini/mui-tiptap |
| Fits production (MUI 5.18, React 19.2) | Peer dependencies `@mui/material` ^5.16.0, ^6, ^7 or ^9; `react` ^16.8 to ^19; `@tiptap/*` ^2 or ^3; `@emotion/react` ^11.4.1 (read from the npm registry) | npm registry |
| Bold, italic, underline | Built-in menu buttons | GitHub README |
| Headings | `MenuSelectHeading` | GitHub README |
| Bulleted and numbered lists | Built-in bullet and ordered list buttons | GitHub README |
| Links | `MenuButtonEditLink` plus a link bubble menu | GitHub README |
| Clear formatting | `MenuButtonRemoveFormatting` | GitHub README |
| Custom inline nodes for fields | Any Tiptap extension can be added; README notes the Mention extension must come after list extensions. Tiptap `Node.create` with `inline: true` and `atom: true` makes a node that "doesn't have directly editable content and should be treated as a single unit" | https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/node, https://tiptap.dev/docs/editor/extensions/nodes/mention |
| Not needed | Image upload, colour, font, alignment, tables: leave out | GitHub README |
| Alternatives | MUI core and MUI X have no rich-text editor; Lexical and Quill have no MUI controls. No reason found to reject mui-tiptap | n/a |
| Not verified | Inserting a field token from a menu by code (Tiptap's `insertContent` command) and blocking deletion of the locked block need an engineering spike | n/a |

The prototype keeps its own CSS tokens and no MUI (production stack note), so the prototype build uses `@tiptap/react` with the same extensions.

### D6 emoji

Operating system picker only: macOS Ctrl+Cmd+Space, Windows Win+. (Windows key and full stop). The hint uses the existing `InputField` helper text style (`--text-tertiary`), shown only for the detected operating system. No new component.

### D7 field token

`--input-background` exists in `src/styles/tokens.css` for both modes (light `rgba(191, 194, 204, 0.16)`, Neutral-200 at 16%; dark `rgba(69, 76, 94, 0.16)`, Neutral-500 at 16%). Proposed: text `--text-primary`, radius `--radius-xs` (4px), padding `0 var(--space-xs)` (0 4px), weight Medium, font size and line height inherited from the surrounding text.

### D8 compose-card layout

Reference image supplied by Bruno (a compose card, same pattern as Rox on Mobbin, https://mobbin.com/screens/3d205a5d-5ead-4787-af2c-9b0a36ed2fc7): header row with title and close; To / Cc / Bcc row; labelled Subject row between dividers; plain body; toolbar pinned at the bottom (Bold, Italic, Strikethrough | four alignment buttons | bulleted and numbered lists | link). Adapted: To / Cc / Bcc dropped; strikethrough and alignment dropped (not in the brief); Underline, Heading, Clear formatting and Insert Field added; the subject group carries the "Also shown in" row; the locked block sits in the body. Full-screen vs drawer re-checked: the card alone would fit a 720px drawer, but the Phase 2 AI side panel can't, so full-screen stays.

### D9-D11 channels

A custom subject replaces the email subject, the whole Slack and Teams message and the phone title. Slack and Teams show the same message: the custom subject alone, with no ": Complete your Assigned Course. Start here" suffix (PM decision, superseding the earlier shared rule).

| Channel | Anatomy to mirror | Source |
|---|---|---|
| Slack | App message from the app's name and icon with Slack's App label and a timestamp; top-level `text` is also the notification fallback | https://docs.slack.dev/reference/methods/chat.postmessage.md; mock tool https://app.slack.com/block-kit-builder (needs Slack login, not opened) |
| Microsoft Teams | Activity feed preview text is cut at 150 characters; Superseded by D14: 5Mins sends Teams reminders as bot chat messages, so the 150-character activity feed cut does not apply (see section 6) | https://learn.microsoft.com/en-us/graph/api/teamwork-sendactivitynotificationtorecipients, https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/design/design-app-notification; designer https://adaptivecards.io/designer/ (not opened) |
| iOS | App icon at the leading edge is added by the system; title at the top "like a headline, event name, or email subject"; don't repeat the app name or icon in content; the system truncates | https://developer.apple.com/design/human-interface-guidelines/notifications |
| Android | Small icon, header with app name, timestamp, content title "truncated to a single line, even when expanded", keep under 30 characters, text under 40 | https://developer.android.com/design/ui/mobile/guides/home-screen/notifications |
| Figma kits | Apple's official iOS 18 UI kit is on Figma Community; no free Android notification kit found | https://www.iclarified.com/94062/apple-releases-ios-18-and-ipados-18-ui-kit-for-figma |

### D12 AI writing

AI writing is on for the demo organisation, so Write with AI shows in Phase 2. It stays hidden for any organisation with AI generation turned off.

## 6. PM decisions, second update (2026-10-30)

| # | Decision | Notes |
|---|---|---|
| D13 | We build the live email preview in the prototype (organisation header, 5Mins footer with Facebook, Instagram, LinkedIn, YouTube icons, App Store and Google Play badges, Unsubscribe); engineering connects it to the email provider | Removes the dependency on production HTML. New PRD phase row 1.13; new risk that the provider's rendering must match |
| D4 (revised) | Subject 200 characters hard limit with "about 60" guidance; message 4,000 characters; a field counts as its visible label. Confirmed by the PM | Replaces 100 / 5,000 / 20 per field. Evidence below |
| D14 | Teams reminders are bot chat messages, not activity feed notifications | Teams tab is a chat message; no 150-character cut |
| D15 | Reminders go at 10:00 in each person's local time | `CourseRemindersCard.tsx` says "Sent at 9:00 AM UTC"; that copy must change |

### Subject length guidance

| Source | Finding |
|---|---|
| Litmus, https://www.litmus.com/blog/the-great-debate-subject-line-length | No settled length; shorter is better, especially on mobile; desktop shows about 60 characters, mobile about 25-30 |
| Mailchimp (secondary): https://www.enrichlabs.ai/blog/email-subject-lines-complete-guide-2026, https://design.intuit.com/quickbooks/marketing/email/content-in-email/ | Under 9 words and about 60 characters. Mailchimp's own page not found. No 150-character Mailchimp cap could be verified |
| Campaign Monitor, https://www.campaignmonitor.com/blog/email-marketing/email-length-best-practices-for-email-marketers-and-email-newbies | 28-50 characters; 28-39 for mostly mobile audiences |
| HubSpot | No official number found; third-party guides say put the key message in the first 30-40 characters |
| Zoho Campaigns, https://help.zoho.com/portal/en/kb/campaigns/faqs/mobile-edition/articles/what-are-the-character-limit-and-restricted-special-characters-for-a-campaign | Subject hard limit 200 characters (only documented product cap found) |
| SendGrid, https://twilio.com/docs/sendgrid/api-reference/mail-send | Subject follows RFC 2822 length rules; no product cap |

Pattern: tools recommend about 30-60 characters and rarely block below a generous cap. Adopted: 200 hard limit, helper "Most inboxes show about 60 characters, phones about 40."

### How merge fields count towards a limit

| Tool | How fields count | Source |
|---|---|---|
| Braze | Counter "doesn't account for Liquid characters"; final count "depends on how Liquid renders for each user" | https://braze.com/docs/user_guide/channels/push/best_practices/ |
| Customer.io | "The count is before Liquid renders, so leave room for personalized values" | https://docs.customer.io/messaging/channels/push/web/send.md |
| Iterable | Count uses the template, so `{{firstName}}` counts as 13; counts are estimates (page returned 403, finding from search) | https://support.iterable.com/hc/en-us/articles/205480365 |
| Salesforce Marketing Cloud | Adds a fixed 10 characters per merge field | https://help.salesforce.com/apex/HTViewHelpDoc?id=mktg.mktg_content_sms_message_length.htm |
| Airship | Counts don't account for value lengths; estimate only | https://docs.airship.com/guides/messaging/messages/content/sms |
| Intercom, Mailchimp, SendGrid | Nothing documented found | n/a |

Pattern: count as written; nobody counts the rendered value at edit time; one fixed-allowance outlier. Adopted: a field counts as its visible label (our tokens show labels, not raw tags).

### Body limits in notification template editors

| Product | Limit | Source |
|---|---|---|
| Yousign | Custom notification and reminder email text raised from 500 to 2,000 | https://developers.youtrust.com/changelog/increased-character-limit-for-notification-and-reminder-emails |
| CA Service Management | Custom notifications 1,000 characters | https://communities.ca.com/thread/241790794-custom-notification-limit-1000-characters-empty-mail-when-reaching-the-limit |
| SAP SuccessFactors Learning | No character limit; whole email under 20MB | https://userapps.support.sap.com/sap/support/knowledge/en/2540366 |
| Slack | Recommends message text under 4,000 | https://docs.slack.dev/reference/methods/chat.postmessage.md |

Pattern: 1,000-4,000. Adopted: 4,000; today's welcome email body is about 1,000 characters.

### Teams chat messages and truncation

- Notification bots send plain text or Adaptive Cards to a personal chat: https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/design/design-app-notification
- Plain-text posts "are not truncated in the same way and will display the full content"; card titles and summaries can be cut: https://learn.microsoft.com/en-us/answers/questions/5794339/when-post-triggered-by-workflow-in-ms-teams-channe
- The 150-character limit is documented only for activity feed preview text: https://learn.microsoft.com/en-us/graph/api/teamwork-sendactivitynotificationtorecipients
- Desktop toast previews for bot cards can show "Sent a card" instead of text, and users can turn previews off: https://techcommunity.microsoft.com/t5/microsoft-teams/teams-notification-preview-summary/td-p/2821411. No documented character cut for chat message toasts was found.

## 7. PM decision, third update (2026-10-30)

D11 revised: Slack and Microsoft Teams show the custom subject alone. The ": Complete your Assigned Course. Start here" suffix that 5Mins adds today is dropped, so no limit reasoning depends on it any more. Slack shows an app message and Teams a chat message (D14), both with exactly the subject text. Today's default reminders (not customised) keep their current Slack and Teams text until an admin saves a custom subject.

## 8. PM decisions, fourth update (2026-10-30)

| # | Decision | Source in the DS |
|---|---|---|
| D4 | 200 / 4,000 character limits and label-length field counting are confirmed; no engineering confirmation needed | n/a |
| D16 | Toolbar icon buttons: hover circular `--radius-full` fill `--page-background-hover`; active (format on) Iconsax Bold on circular `--selected-tint`, `--selected-tint-hover` on hover; pressed = hover fill (no separate icon-button pressed state is defined); focus 2px `--primary-button-background` outline, 2px offset; icon `--text-primary`. Field token: rest `--input-background`, selected `--selected-tint`, text `--text-primary` | `docs/design-system/iconography.md` ("Interactive icon hover", "Linear default / Bold active"), `layout.md` (circular icon-button hover), `design-system-guidelines.md` rule 8 (focus ring), `colors.md` (`--selected-tint` as the highlight fill derived from `--selected`). Tokens in `src/styles/tokens.css`: `--page-background-hover` (lines 109 / 252), `--selected-tint` and `--selected-tint-hover` (170, 178 / 293, 294), `--primary-button-background` (147 / 285), `--input-background` (120 / 258), `--radius-full` (208) |
| D17 | Reminders nobody has customised keep today's Slack and Teams text until an admin saves a custom subject; Reset returns to it | Confirms the assumption in section 7 |

Still undecided: whether the welcome email variants for managers and people without the app can be merged.

## 9. PM decision, fifth update (2026-10-30)

D18: one custom welcome email for everyone. Once saved, it goes to every new user, including managers and people without the app. Organisations that haven't customised it keep today's 5Mins default versions for each group.

What the sources show about how the versions differ:
- Prototype artifact: only the note "Today 5Mins sends slightly different versions to managers and to people without the app; your email goes to everyone." Its `legacyMail("welcome")` renders a single version (greeting, "Our library", "Track your progress", two image placeholders, locked "Learn Now" button, footer). No manager-only or no-app-only link or button is modelled.
- Related but not the welcome email: invite reminders say "Managers also get one on days 14 and 21", and the day 9 invite reminder mentions team managers.
- Codebase: no welcome email code anywhere in `src/` or `docs/`.
- Result: the differences can't be determined from the available sources. The PRD adds a risk that engineering must list them; any group-only link or button (for example a manager dashboard link or app download button) stays in the locked block for that group or is dropped deliberately.

## 10. Sender name research (Phase 2 invite reminders and customised emails), 2026-10-30

Question from the PM: today invite reminders come from "Maddie from 5Mins". Options: (a) "{Organisation name} via 5Mins", (b) the inviting admin's name, e.g. "Jane via 5Mins", (c) the organisation name alone, (d) keep "Maddie from 5Mins". Research only; the PRD is not changed yet.

### Already in 5Mins

| Source | Finding |
|---|---|
| 5Mins help centre, "Replace your organisation's email sender", https://help.5mins.ai/articles/9247014-replace-your-organizations-email-sender | Organisations can already set a custom **From Name**, **From Email** and **Reply-To** through Customer Success, with no DNS changes. "All future emails will come from your custom sender"; on a verification problem "emails automatically fall back to the default 5Mins sender". Any rule chosen here must defer to this setting when an organisation has one |

### B2B SaaS invitation emails

| Product | From display name | Source | Confidence |
|---|---|---|---|
| Google Docs / Drive (Workspace accounts) | Sharer's name with "(via Google Docs)", from a Google system address | SaneBox help, https://www.sanebox.com/help/377-for-g-suite-google-doc-share-notices-show-as-google-drive-in-sanebox-trainings | Third-party; no official Google page found |
| Jira | Default "E-mail from" template is the acting user's full name plus "(JIRA)"; admin-configurable. Jira Service Management lets admins set a portal name as sender | Atlassian KB, https://support.atlassian.com/jira/kb/notifications-showing-incorrect-sender-name/; community announcement, https://community.atlassian.com/t5/Jira-Service-Management-articles/Announcing-Custom-Sender-Names-for-Jira-Service-Management/ba-p/2023833 | Official and community |
| Microsoft Teams guest invites | Historically from a Microsoft no-reply address with the inviter named in the subject; Microsoft announced invitations moving to the inviter's own address from late June 2026 | https://techcommunity.microsoft.com/t5/microsoft-teams/teams-guest-invitation-emails-pose-serious-information-leakage/m-p/3669238; https://www.itelio.com/en/microsoft-message-center/mc1325416 | Message-centre summaries; rollout not confirmed |
| Slack, Descript (Mobbin inbox) | Product name ("Slack", "Descript") as sender; the inviter is named in the subject ("Sam Lee invited you to join Alex's Drive on Descript"; "Don't forget, you have a pending invite in Slack") | Mobbin, Proton inbox, https://mobbin.com/screens/e0fea5e4-cf4b-4110-8794-1fcc0ab5536b | Screenshot evidence |
| Superhuman | "The Superhuman Team" | Mobbin, https://mobbin.com/screens/7dc3d38a-9e20-49c9-8149-03f2d77b7cd5 | Screenshot |
| Calendly | Invite page says "Alex Smith has sent you an invitation", "from Alex Smith" with a "This is not me" link | Mobbin, https://mobbin.com/screens/7ac1e36a-0bf2-45b3-a50d-7bbcb98a9648 | Screenshot (landing page, not inbox) |
| Figma | Sends from no-reply@email.figma.com; recipients see the inviter's email in the body. Display name not found | https://forum.figma.com/report-a-problem-6/suspicious-scam-user-has-invited-you-to-view-the-file-untitled-emails-being-sent-to-contacts-51706 | Forum |
| Notion | Sends from no-reply@notion.so. Display name not found | https://www.notion.com/en-gb/help/add-members-admins-guests-and-groups | Official, partial |
| Linear | Sends from notifications@linear.app; the admin can add a personal note. Display name not found | https://linear.app/docs/invite-members | Official, partial |
| Asana | Nothing found | n/a | n/a |

Pattern: the product (or "{person} via {product}") is the sender; the inviter appears in the subject or body. No product found sends invites under the customer organisation's name alone, and no product uses a fixed staff persona for invitations.

### Enterprise LMS and HR tools

| Product | Sender name control | Source |
|---|---|---|
| 360Learning | Default no-reply@360learning.com; admins can replace it with their own verified address (DKIM needed for other domains). Display name not covered | https://support.360learning.com/hc/en-us/articles/360055045411 |
| Docebo | Admins configure email sender domains (Domain management > Email sender domains) and send from any address on them; @docebo.com senders no longer allowed. Display name field not found | https://help.docebo.com/hc/en-us/articles/14656947588114 |
| TalentLMS | Default noreply@talentlms.com; a custom sending domain sends notifications from the customer's domain. No display-name-only setting found | https://help.talentlms.com/hc/en-us/articles/360039321274 |
| Workday | Tenant-level "From Display Name" (max 40 alphanumeric characters) separate from the From address | https://doc.workday.com/admin-guide/en-us/manage-workday/tenant-configuration/notifications-and-alerts/email-notifications/tar1431980339489.html; display name change notice, https://it.osu.edu/news/2022/08/05/workday-email-display-name-change |
| Seismic Learning (Lessonly) | Welcome emails come from the inviter's address or noreply@seismic.com; support can set a custom address on request. Display name not covered | https://intercom.help/lessonly/en/articles/2511052-email-notifications-for-learners |
| Sana Labs | Admins can set "email sender" and "branding in email templates"; no detail on the name format | https://sanalabs.com/renaissance |
| Cornerstone, Rippling | Nothing found in search | n/a |
| Other HR tools, for pattern: ClayHR (sender = organisation name), HiBob (triggering person's name, admins can swap in a generic profile such as "HR team"), HR Cloud (system admin or acting employee), SAP SuccessFactors ("Single Sender" company-wide name) | Org-level control is the norm | https://clayhr.com/articles/setting-up-senders-name-in-email-notifications; https://heartcorehr.hibob.com/cx-support-processes-268/hibob-system-emails-explained-6874; https://support.hrcloud.com/en/help-center/how-to-customize-email-senders-from-the-system; https://userapps.support.sap.com/sap/support/knowledge/en/2226180 |

Pattern: enterprise tools default to the vendor's no-reply sender and let the organisation set its own sender (address, domain and sometimes display name) at organisation level, not per email.

### Deliverability, trust and spoofing

| Source | Finding | Bearing on the options |
|---|---|---|
| Gmail Help, "Extra info next to sender's name", https://support.google.com/mail/answer/1311182?hl=en | Gmail adds "via {domain}" when the sending domain doesn't match the From address domain, "so you're aware of where your messages are coming from"; it can't be turned off | If the display name says "Acme" but the mail comes from a 5Mins domain, the mismatch is visible anyway. Saying "via 5Mins" in the name is honest about it |
| Postmark, https://postmarkapp.com/blog/dkim-and-the-via-label-in-gmail | The "via" label disappears once mail is DKIM-signed for the From domain | Only an organisation using the existing custom sender with its own domain avoids it |
| Litmus (secondary: Ghost, https://ghost.org/resources/email-sender-names/) | The sender name is the first thing many people check (42%); keep it consistent; "Sarah from [Brand]" style is a valid hybrid; avoid "noreply" | Supports a recognisable organisation name, and consistency across all emails from one organisation |
| Mailchimp, https://mailchimp.com/resources/sender-name/ | Use a name recipients recognise | Recipients know their employer, not "Maddie" |
| Benchmark Email, https://www.benchmarkemail.com/blog/email-sender-name-person-or-brand/; Loops, https://loops.so/glossary/email-sender-name | Transactional and account emails should come from the brand; a person's name suits relationship mail where a real person reads replies; recipients spot fake personas and trust drops | Argues against (d) once an organisation writes the text, and against (b) for automated reminders |
| Display name spoofing guidance: https://autospf.com/email-spoofing/display-name-spoofing/, https://www.phishingbox.com/glossary/display-name-spoofing, https://dmarcreport.com/blog/emails-sent-with-my-name-display-name-spoofing-prevention-guide/ | Attackers set the display name to a trusted colleague or executive; mobile shows only the display name; security training teaches staff to distrust a colleague's name on mail from an outside domain | (b) "Jane via 5Mins" on mail from a 5Mins domain matches the pattern staff are trained to report, especially for reminders Jane never sent. (Vendor marketing sources; no NIST, CISA or NCSC page found) |

### Should automated reminders carry a person's name?

- Sources agree a person's name belongs on mail a real person sent or will answer (Benchmark Email, Loops above). Invite reminders are sent automatically on days 3, 5, 7 and 9 (and 14 and 21 for managers), long after the admin's action.
- Google Docs and Jira show the acting person because that person did act at that moment. A reminder has no such person.
- "Maddie from 5Mins" is a 5Mins persona. Once the organisation writes the text, the words are no longer Maddie's, so the name misstates who wrote them.
- The inviter is still useful context: put "Invited by" (the Phase 2 field) in the subject or body, as Slack, Descript and Calendly do, not in the From name.

### Mobbin

- Proton inbox, https://mobbin.com/screens/e0fea5e4-cf4b-4110-8794-1fcc0ab5536b: invitation emails from "Descript" and "Slack" (product as sender, inviter in the subject).
- Superhuman, https://mobbin.com/screens/7dc3d38a-9e20-49c9-8149-03f2d77b7cd5: "The Superhuman Team".
- Calendly, https://mobbin.com/screens/7ac1e36a-0bf2-45b3-a50d-7bbcb98a9648: inviter named on the landing page with "This is not me".
- No Mobbin screen showed an organisation-name sender or a "{org} via {product}" sender.

### Verdict

- Standard practice: the product, or a person "via" the product, sends; the inviter goes in the subject or body; enterprise tools let the organisation set its own sender at organisation level.
- Evidence supports **(a) "{Organisation name} via 5Mins"** as the default for customised emails: recipients recognise their employer, "via 5Mins" is honest about the sending service (Gmail shows the mismatch anyway), and it avoids a persona or a colleague's name on automated mail.
- Reject (b): automated reminders the admin never sent, and it matches display-name spoofing patterns. Reject (c): hides the sending service and invites the Gmail "via" mismatch with no explanation. Reject (d) for customised emails: a fake author once the organisation writes the text.
- Precedence: an organisation's existing custom sender (5Mins help centre) overrides (a).
- Scope: apply to every customised email, not only invites, for consistency (Litmus). Uncustomised emails keep today's senders, matching D17 and D18. Gap: whether Workday-style 40-character display-name limits apply to 5Mins's email provider is unknown; long organisation names may need truncation.
