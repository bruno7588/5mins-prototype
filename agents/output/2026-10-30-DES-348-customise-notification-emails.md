# DES-348: Customise invitation, welcome and course reminder emails

**Ticket:** DES-348 (In Design Phase) · **Epic:** DEV-4866 · **Release:** 25 November 2026 · **Owner:** Bruno Carvalho · **Requested by:** dLocal via Nicolas Darriulat · **Date:** 2026-10-30
**Prototype:** https://claude.ai/artifact/FSc3hpTibwNFE5YYxjZQ1y (behaviour reference) · **Related:** DES-291 · **Full evidence:** `2026-10-30-DES-348-customise-notification-emails.research.md`

---

## 1. Context

### The problem

Every email 5Mins sends to an organisation's people uses 5Mins text. The invitation, welcome email, invite reminders and built-in 7-day and 1-day course reminders can't be changed; admins can only write plain text for reminders they add themselves, with no formatting, personalisation or preview. dLocal asked for emails that sound like their organisation.

This is **table stakes**: Sana Labs, Docebo, TalentLMS, Workday and others ship editable notification templates. 5Mins stands out on the editing model: a compose card with the button or course card locked in place, readable field pills, a sample-filled preview, and the Slack, Teams and phone views of the subject.

### What the code does today

| File | Today | Change |
|---|---|---|
| `src/pages/automations/Automations.tsx` | `/automations`, Workflows tab renders `WorkflowsTab` | None (AC 7) |
| `.../your-courses/components/WorkflowsTab/WorkflowsTab.tsx` | Seeds 7-day and 1-day reminders with placeholder text | Seed real 5Mins text; add Welcome emails card |
| `.../WorkflowsTab/CourseRemindersCard.tsx` | Built-in rows: toggle only. Own reminders: Edit, Delete. Copy "Sent at 9:00 AM UTC" | Edit and Badge on built-ins; copy per D15 |
| `.../WorkflowsTab/EditReminderModal.tsx` | Day stepper, `InputField` subject, plain textarea | Replaced by the email editor |
| `.../WorkflowsTab/WorkflowCard.tsx`, `EmailPreviewModal.tsx` | Team Progress Email | Untouched (D1) |
| `src/components/` | `Button`, `Badge`, `Chip`, `ConfirmModal`, `CloseButton`, `InputField`, `Tooltip`, `Toast`, `Alert`, `ContentSwitcher`, `AIWorkingCard` | No rich-text editor, field token or email frame exists |

### Decisions taken

| # | Decision |
|---|---|
| D1 | Team Progress Email (epic AC 6) is out of scope; tracked separately under DEV-4866. |
| D2 | Custom course reminders, including the built-in 7-day and 1-day, are **organisation-wide**: one version for every course, not per workflow. |
| D3 | Reset to default is **permanent** after a confirmation dialog; no undo. |
| D4 | **Limits:** subject 200 characters hard, with guidance "about 60"; message 4,000 characters of visible text; a field counts as its visible label ("First name" = 10). Industry practice: Litmus, Mailchimp, Campaign Monitor recommend 28-60 with generous caps; editor body limits run 1,000-4,000; Braze, Customer.io and Iterable count fields as written (research sections 4, 6). Confirmed. |
| D5 | **Rich-text editor:** mui-tiptap (MIT, MUI 5.16+, React 19, Tiptap v2/v3) wrapped in `@web/ui`, restyled to DS tokens; it covers every toolbar control. Fields and the locked block are custom Tiptap atom nodes. The prototype uses plain `@tiptap/react` (research section 5). |
| D6 | **Emoji:** the operating system picker (macOS Ctrl+Cmd+Space, Windows Win+.). No custom picker, no toolbar button. |
| D7 | **Field token:** fill `var(--input-background)`, text `var(--text-primary)`, radius `var(--radius-xs)`, padding `0 var(--space-xs)`, Medium, inherited size and line height. Same in subject and message. |
| D8 | **Editor layout:** compose card from Bruno's reference: header (title, close), Subject row between dividers, plain body with the locked block, toolbar pinned at the bottom. No To / Cc / Bcc, alignment or strikethrough. Header and footer show only in Preview. Hosted in a **full-screen Modal**: the card alone fits a 720px drawer, but the Phase 2 AI panel sits beside it, and the DS allows full-screen for editors (`overlays.md`). |
| D9 | **A custom subject replaces the text everywhere it shows:** email subject, Slack, Teams and the phone notification title (today these differ). |
| D10 | **Channel previews** follow real Slack, Teams, iOS and Android anatomy, with the 5Mins app icon as sender; no Library components needed (research section 5). |
| D11 | **Slack and Teams show the same message:** the custom subject alone, no ": Complete your Assigned Course. Start here" suffix. Each shows only when the organisation has connected it. |
| D12 | **AI writing is on** for the demo organisation; Write with AI stays hidden for organisations with AI generation off. |
| D13 | **We build the live email** in the prototype (organisation header, 5Mins footer with Facebook, Instagram, LinkedIn, YouTube icons, App Store and Google Play badges, Unsubscribe); engineering connects it to the email provider. |
| D14 | **Teams reminders are bot chat messages**, not activity feed notifications, so no 150-character cut applies (research section 6). |
| D15 | **Reminders go at 10:00 in each person's local time**; the code's "9:00 AM UTC" copy must change. |
| D16 | **States follow DS conventions** (`iconography.md`, `layout.md`, `design-system-guidelines.md` rule 8, `colors.md`). Toolbar icon button: hover circular `var(--radius-full)` fill `var(--page-background-hover)`; active (format on, `aria-pressed="true"`) Iconsax Bold on circular `var(--selected-tint)`, `var(--selected-tint-hover)` on hover; pressed uses the hover fill; focus `2px solid var(--primary-button-background)`, offset 2px; icon `var(--text-primary)`. Field token selected: fill `var(--selected-tint)`, no separate ring. |
| D17 | **Uncustomised reminders keep today's Slack and Teams text**; D11 applies once a custom subject is saved; Reset returns to today's text. |
| D18 | **One custom welcome email for everyone**, including managers and people without the app. Uncustomised organisations keep today's per-group versions; Reset returns to them. |
| D19 | **Sender:** every customised email (including Phase 2 invitation and invite reminders) comes from **"{Organisation name} via 5Mins"**; uncustomised emails keep today's senders ("5Mins", "5Mins Team", "Maddie from 5Mins"); an organisation's custom sender set up through Customer Success ([help centre](https://help.5mins.ai/articles/9247014-replace-your-organizations-email-sender)) wins. Reason: recipients know their employer, "via 5Mins" is honest about the sender Gmail flags anyway, and a person's name on automated mail resembles spoofing (research section 10). The inviter goes in the subject or body, never the From name. |

### Acceptance criteria (verbatim from DEV-4866)

Phase 1:
1. Admins can edit the full text of every course reminder, including the built-in 7-day and 1-day reminders.
2. Admins can edit the welcome email.
3. Admins edit in one editor with formatting, emoji and personal fields. The button or course card stays fixed and is always sent.
4. Admins can see which emails they have customised and reset any of them to the 5Mins default.
5. Admins can preview each email before saving. For course reminders, they can see and preview where else the subject appears: Slack, Microsoft Teams and phone notifications.
7. All email customisation is done in Automations > Workflows.

Phase 2:
8. Admins can customise the invitation email and the invite reminders.
9. Admins can draft a custom email with AI, unless their organisation has AI generation turned off.

### Out of scope

Images in customised emails; the course assignment email; non-English emails; the weekly overdue-course email; the "Welcome to 5Mins!" phone notification; the Team Progress Email (AC 6); per-course or per-workflow reminder text; reminder timing (DES-291); a custom emoji picker.

---

## 2. Research

Only rows that drove a decision are listed. Full evidence, quotes and rejected options are in the research file.

### Prototype

The artifact confirms the ticket's flows, field fallbacks and "Email only" tag. It also had four gaps this PRD closes: no Reset confirmation, no unsaved-changes guard, a centred dialog editor, and AI undo in a toast the DS can't hold (research section 1).

### Prior art

| Source | Finding | Verdict |
|---|---|---|
| [Docebo shortcodes](https://help.docebo.com/hc/en-us/articles/29547314721938) | Field lists differ per event; typed shortcodes confuse admins | Show only valid fields per email; insert from a menu |
| [TalentLMS](https://help.talentlms.com/hc/en-us/articles/9651467334044-How-to-work-with-notifications-in-TalentLMS) | Tags blank in test sends | Preview fills sample values |
| [Workday Notification Designer](https://doc.workday.com/user-guide/en-us/workday-notification-designer/bzo1601673588430.html) | Tenant-level templates; separate publish step | Organisation-wide (D2); Save is the commit |
| [Intercom](https://www.intercom.com/help/en/articles/248-personalizing-messages-using-variables), [Customer.io](https://docs.customer.io/journeys/liquid/using-liquid) | Fallback "there"; a missing value with no fallback fails the send | Fixed fallback on every person field |
| [Klaviyo (Mobbin)](https://mobbin.com/screens/08cd3807-1511-4681-8463-be48d6ca3e31) | Fields as inline tokens; Insert menu in toolbar | Adopted (D7) |
| [User Interviews (Mobbin)](https://mobbin.com/screens/daf8f767-8311-4b78-b69f-40ece8a3df92) | Required button the admin must keep | Lock it structurally instead |
| [Rox (Mobbin)](https://mobbin.com/screens/3d205a5d-5ead-4787-af2c-9b0a36ed2fc7) | Compose card, toolbar at the bottom | Adopted (D8) |
| [Apollo (Mobbin)](https://mobbin.com/screens/67875c9e-a736-4bf6-95cc-df1da5d6fd29), [Mailchimp (Mobbin)](https://mobbin.com/screens/b28c2603-fe77-470b-97c3-0a20346a145f) | AI side panel; review note before use | Adopted for 2.3 |
| [mui-tiptap](https://github.com/sjdemartini/mui-tiptap), [Tiptap nodes](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/node) | All required controls; `atom: true` nodes act as one unit | D5 |
| [Litmus](https://www.litmus.com/blog/the-great-debate-subject-line-length), [Campaign Monitor](https://www.campaignmonitor.com/blog/email-marketing/email-length-best-practices-for-email-marketers-and-email-newbies), [Braze](https://braze.com/docs/user_guide/channels/push/best_practices/) | Short subjects recommended, not capped; fields counted as written | D4 |
| [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/notifications), [Android notifications](https://developer.android.com/design/ui/mobile/guides/home-screen/notifications) | System adds app icon; title truncates (Android: one line) | Phone tab (1.9) |
| [Teams notification types](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/design/design-app-notification), [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5794339/when-post-triggered-by-workflow-in-ms-teams-channe) | Bot chat messages; plain text not truncated | D14 |
| [Gmail "via" label](https://support.google.com/mail/answer/1311182?hl=en) | Shown when the sending domain differs from From | D19 |

### Build For Mars

| Lesson | Verdict |
|---|---|
| [Intentional friction](https://builtformars.com/ux-glossary/intentional-friction): name the action, target and consequence | Reset dialog (1.11) |
| [Substack's danger zone](https://builtformars.com/ux-bites/highway-to-the-danger-zone): keep data-losing actions apart | Reset on the left, away from Save |
| [Linear's undo warnings](https://builtformars.com/ux-bites/linears-undo-warnings): warn only on real risk | Unsaved dialog only after edits (1.10) |

---

## 3. Implementation

### Blockers

**No blockers remain.** No AC is unbuildable.

### Limits (D4)

- Subject: 200 characters, live counter, helper "Most inboxes show about 60 characters, phones about 40."
- Message: 4,000 characters of visible text; counter from 80%.
- Required: subject, and message above the locked block; text below it is optional.
- Errors on Save (`--text-error`): "Keep the subject to 200 characters or fewer", "Keep the message to 4,000 characters or fewer", "Add a subject", "Add a message above the button" / "Add a message above the course card".

### Phases

**Phase 1: email editor and preview** (25 November 2026)

| # | Change | Components | Verify | AC |
|---|---|---|---|---|
| 1.1 | **Workflows tab.** Built-in 7-day and 1-day rows gain Edit (Tooltip "Edit reminder") and a `Custom reminder` Badge once saved. New **Welcome emails** card below with a "Welcome email" row, Edit and a `Custom email` Badge; no on/off switch. Card copy: 10:00 local time (D15) | `Badge` (Informative), icon buttons + `Tooltip`, `Toggle` | Badges appear only after Save, go after Reset | 4, 7 |
| 1.2 | **Editor shell (D8).** Full-screen Modal, compose card centred at 720px. Titles "Edit 7-day reminder", "Edit 1-day reminder", "Edit welcome email", "Edit reminder", "Add reminder". When line for built-ins ("Sent 7 days before a course's due date. This day is built in and can't be changed."); day stepper for admin-added. Footer: Reset to Default (left, customised built-ins only), Preview, Save / Save Reminder | `useOverlayA11y`, `CloseButton variant="fullscreen"`, `InputInteger`, `Button` | Right title per entry point; no Reset on admin-added reminders | 1, 2 |
| 1.3 | **Pre-filled text.** Built-ins open with today's 5Mins text; new reminders get starter text (subject "{Days left} left to complete {Course name}") and note "Starter text so you don't begin from a blank page. Edit it or write your own." Welcome email: Callout "Custom emails are text only, so the 2 images in today's welcome email won't be sent." and line "Your email goes to everyone who joins, including managers and people without the app." (D18) | `Alert` Callout | Text matches today's emails; welcome notes only on welcome | 1, 2 |
| 1.4 | **Subject group (D9).** Reminders only: "Also shown in" row under the subject with Slack, Microsoft Teams (if connected) and Phone notification Chips, each opening that Preview tab. Body tagged "Email only" Badge, Tooltip "Slack, Microsoft Teams and phone notifications don't include the message." | Single-line editor (text, emoji, fields), `Chip` `iconLeft`, `Badge`, `Tooltip` | Chips match connected integrations | 5 |
| 1.5 | **Formatting (D5, D16).** Toolbar: Bold, Italic, Underline, Heading \| Bulleted list, Numbered list \| Link, Clear formatting \| Insert Field. Tooltip and `aria-pressed` on each. Paste keeps supported formatting only, drops images | mui-tiptap via `@web/ui` | Each control shows in Preview; Word paste drops colours and fonts | 3 |
| 1.6 | **Emoji (D6).** Helper under the body: "Add emoji with Ctrl + Cmd + Space." (Mac) / "Add emoji with Windows key + full stop." (Windows); none elsewhere | Helper text (`--text-tertiary`) | Emoji work in subject and body | 3 |
| 1.7 | **Fields (D7, D16).** Insert Field menu (toolbar and end of Subject row), grouped: Person (First name, Last name, Full name, Email), Organisation (Organisation name), Course, reminders only (Course name, Due date, Days left, Number of lessons, Course duration). Fallbacks shown: First and Full name "If missing: there", Last name "If missing: left out". Tokens delete as one unit | Listbox surface; token per D7 | No course fields on welcome; missing first name sends "Hi there" | 3 |
| 1.8 | **Locked block.** "Learn Now" button (welcome) or course card (reminders, caption "Example course. Each person sees the course the reminder is about."). Can't be edited, moved or deleted; optional text below. Accessible name "Part of the email added by 5Mins" | Custom Tiptap node | Select-all + delete leaves it; every send contains it | 3 |
| 1.9 | **Preview (D9-D11, D13, D14, D17, D19).** Centred Modal. **Email**: From and Subject rows above the live email (1.13) with sample values; From shows the real sender per D19. Reminders add Tabs with icons: **Slack** and **Microsoft Teams** (if connected): same message from "5Mins" with app icon and time, subject only; Slack as an app message with App label, Teams as a chat message in full. Untouched reminders show today's text. **Phone notification**: 5Mins icon, "5Mins", "now", subject as one-line title, course name as body; caption "Android shows the title on one line." Reflects unsaved edits | `ConfirmModal` `closable`, page-local Tabs | All ticket states render; a 200-character subject shows in full in Slack and Teams, truncated on phone | 5 |
| 1.10 | **Unsaved changes.** Closing after edits: "Discard your changes?", "Your edits to this email haven't been saved.", Keep Editing / Discard Changes. Escape does nothing | `ConfirmModal` (no X), `semantic="warning"` | Dialog only after edits | 1, 2 |
| 1.11 | **Reset (D3).** "Reset the 7-day reminder to the 5Mins default?", "Your custom subject and message will be deleted and can't be recovered. Learners get the 5Mins text from the next reminder." Cancel / Reset to Default. Toast "7-day reminder reset to default" | `ConfirmModal` (no X), `semantic="danger"`, `Toast` | Reopening shows 5Mins text | 4 |
| 1.12 | **Save and send (D2, D9, D19).** One organisation-wide version per email; toast "7-day reminder updated" / "Welcome email updated" | `Toast` | Next send uses the text and D19 sender in email, Slack, Teams and phone; editing 7-day leaves 1-day alone | 1, 2 |
| 1.13 | **Live email (D13).** Organisation header (logo, name, "Powered by 5Mins"), admin text with locked block, footer with social icons, store badges (above Unsubscribe in reminders, below in welcome) and Unsubscribe. 600px column, light in both admin themes; engineering connects it to the provider | Email markup, outside DS token rules | Matches a provider test send in Gmail, Outlook and Apple Mail | 3, 5 |

**Phase 2: invitation email, invite reminders and Write with AI**

| # | Change | Components | Verify | AC |
|---|---|---|---|---|
| 2.1 | **Invitation email** row in Welcome emails card. Extra field "Invited by" (If missing: organisation name). Locked "Activate your account" button. D19 sender once customised | As Phase 1 | Invited-by fills; button always sent | 8 |
| 2.2 | **Invite reminders**: one subject and message for every automatic invite reminder, replacing today's varied ones; starter subject "Your {Organisation name} account is waiting for you". D19 sender replaces "Maddie from 5Mins" once customised | As Phase 1 | All reminders send the custom text; Reset restores today's set | 8 |
| 2.3 | **Write with AI (D12).** "Write with AI" opens a side panel beside the card: "What should the email say?", Tone (Friendly, Professional, Urgent), Length (Short, Long), Generate. Draft fills subject and body with fields; panel shows "Draft added. Review it before saving." and Undo. Hidden when AI is off | `Button semantic="ai"`, `ContentSwitcher`, `InputField`, `AIWorkingCard` | Undo restores prior text; nothing saves until Save | 9 |

### Risks to watch during build

- **Channel change (D9).** A saved subject replaces the phone title and Slack and Teams message for every course; the channel row and Preview must make this clear before Save.
- **Locked block.** Atom nodes block editing but not deletion or moving; test select-all, cut, drag and paste over it.
- **Restyling mui-tiptap.** MUI defaults must map to D16 tokens through `@web/ui`.
- **Provider rendering (D13).** The sent email must match Preview: header, footer, badge order, spacing, fonts. Compare a real test send before release.
- **Sender (D19).** Long organisation names make long senders and some systems cap display names; confirm the Customer Success sender always wins, including its fall-back.
- **Welcome groups (D18).** Neither the prototype nor the code shows how the manager and no-app welcome emails differ. Engineering must list the differences; any group-only link or button (e.g. manager dashboard link, app download button) stays in that group's locked block or is dropped with PM sign-off.
- **Field counts (D4).** Long values can make the sent subject longer than the counter shows.
- **Paste and rendering.** Strip unsupported formatting; check headings and lists in Outlook desktop.
- **HRIS placeholders.** Values like "N/A" bypass fallbacks.

### Still open

**Nothing remains open.**
