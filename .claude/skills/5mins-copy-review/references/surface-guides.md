# 5Mins.ai Surface Guides

Per-surface checklists and examples. Identify the surface first (see SKILL.md workflow), then run the matching checklist alongside the core conventions and `word-list.md`.

## Contents

1. Admin portal
2. Learner web and mobile
3. Frontline auth flows
4. Transactional emails
5. Lifecycle and nudge emails
6. Marketing pages

---

## 1. Admin portal

**Reader:** an L&D lead, compliance lead, HR admin, or coordinator. Time-poor, often managing many people, often mid-task. They want to do the thing and move on.

**Tone:** efficient, precise, quietly reassuring. Respect their expertise; do not over-explain. The win is that they always know what a control does and what just happened.

Checklist:

- **Page headers** name the area in a noun phrase: "Learning records", "Automations", "Roles & mapping". No verbs, no sentences.
- **Section descriptions** (one line under a header) state the purpose and, if useful, the payoff: "Set rules to enrol learners automatically when they join a role." Cut if the section is self-evident.
- **Form labels** are short noun phrases in sentence case: "Course name", "Start date", "Assigned roles". **Helper text** sits below and explains constraints or consequences, not the obvious: good - "Learners get an email as soon as the automation is active." Bad - "Enter the name of the course."
- **Empty states** do two jobs: say what would appear here, and give the one action that fills it. "No automations yet. Create one to enrol learners without manual work." Always pair with the action.
- **Confirmation modals**: the title names the action as a question or statement ("Delete this automation?"); the body states exactly what happens and what, if anything, cannot be undone. Calm and specific, never alarmist. The primary button repeats the verb ("Delete automation"), never "Yes" or "OK".
- **Destructive actions**: name the consequence in concrete terms ("Learners enrolled by this automation keep their progress; the automation stops running"). Use the danger button. Do not use "lost forever" or scare language; precision is the warning.
- **Toasts** confirm in a short specific clause: "Automation activated", "Course assigned to 12 learners", "Changes saved". No exclamation marks for routine saves.
- **Tooltips** add genuinely non-obvious information in under ~12 words. If the label is already clear, no tooltip.
- **Tab and filter labels**: sentence case, parallel in grammar across a set ("Current", "Archived", "All").
- **Table column headers**: short noun phrases, sentence case.
- **Error and validation**: name the field and the fix. "Choose a start date that is today or later", not "Invalid date".

Example - section description:

- Weak: "This is where you can manage your roles."
- Strong: "Map your company roles to 5Mins roles so new joiners get the right training automatically."

## 2. Learner web and mobile

**Reader:** a frontline worker in hospitality, finance, or healthcare. May not think of themselves as a "learner". On a phone, between tasks, with little patience for jargon.

**Tone:** friendly, encouraging, plain. Short. Celebrate progress without being saccharine. Never make the learner feel behind or judged.

Checklist:

- **Brevity is non-negotiable on mobile.** Headings of a few words; body of one short sentence. If it does not fit a phone without truncating, cut it.
- **No L&D jargon.** Not "competency", "modality", "learning objective". Say "skill", "lesson", "what you'll learn".
- **Lesson and course cards**: a clear title and, if shown, a plain duration ("4 min") and a plain progress cue ("2 of 5 done").
- **Calls to action** are inviting and concrete: "Start lesson", "Continue", "Take the quiz". Sentence case.
- **Progress, streaks, gamification**: warm and specific. "3-day streak - keep it going" / "You've earned 120 skill points". Exclamation marks allowed here, sparingly, for real milestones.
- **Quiz and assessment results**: on a pass, be genuinely celebratory but brief. On a fail, be encouraging and blame-free, and point to the next step. The existing failed-course banner ("Not passed! Review your quizzes.") should drop the exclamation mark - a failure state is not a moment to celebrate; warm and calm lands better: "Not passed yet. Review your quiz answers and try again."
- **Empty states**: encouraging, not apologetic. "Your lessons will appear here once your admin assigns them" beats "Nothing to see here".
- **Errors**: plain and reassuring, with a next step. "We couldn't load your lessons. Check your connection and pull to refresh."
- **Notifications and reminders** (in-app or push): one clear idea, value-led, never nagging. "You have 2 lessons due Friday" beats "Don't forget your training!".

Example - quiz fail:

- Weak: "You failed. Score: 40%."
- Strong: "Not passed yet - you scored 40%. Review the lesson and try the quiz again."

## 3. Frontline auth flows

**Reader:** a frontline worker signing in, often with an employee ID, OTP, PIN, or QR code rather than a company email. They may be doing this once, quickly, possibly on a shared or personal device.

**Tone:** the simplest copy 5Mins writes. Calm, concrete, zero jargon. Assume no familiarity with SSO, magic links, or account concepts.

Checklist:

- Name the thing the reader is holding in plain words: "Enter the 6-digit code we sent you", "Scan the QR code from your manager".
- Say where to find it if it is not obvious.
- Do not explain the underlying mechanism (OTP, SSO, SAML). The reader does not need it.
- Errors are gentle and recoverable: "That code didn't work. Check it and enter it again, or ask for a new one."
- Avoid the words "credentials", "authenticate", "session", "token". Say "code", "sign in", "PIN".
- Keep success quiet and forward-moving: "You're in. Let's start." then move them on.

## 4. Transactional emails

**Reader:** someone who needs to do or know one thing - accept an invite, reset a password, see what training is due, read a report. They scan; they may be on a phone.

**Tone:** clear, direct, useful. Transactional emails do not sell. One job per email, one primary action.

Checklist:

- **Subject line** states the value or action plainly, front-loaded, no clickbait, no ALL CAPS, no emoji stuffing. "Your 5Mins training is due Friday" / "Reset your 5Mins password" / "You've been invited to 5Mins".
- **Preheader** (the preview snippet) extends the subject with the next most useful detail; never repeats it and never left as boilerplate.
- **Opening line** gets to the point in one sentence. No "We hope this email finds you well."
- **One primary CTA**, as a button, with a named action ("Accept invite", "Reset password", "View your training"). Any secondary link is plainly subordinate.
- **Deadlines are explicit and unambiguous**: a real date and, where relevant, a day ("due Friday 30 May"). Not "soon" or "shortly".
- **Sender identity** is clear - it is from 5Mins, and if a person or company is relevant, name them ("[Company] uses 5Mins for training").
- **No marketing fluff** in a transactional email: no stats, no feature pitches, no "did you know".
- **Plain-text fallback** should carry the same message and a usable link.
- **Escalation emails** (to a manager about an overdue learner) are factual and non-accusatory: state who, what, the deadline missed, and the action. No blame language.
- **Scheduled report emails** say what the report covers and the period, and either attach it or link to it clearly: "Your training expiry report for May is attached."

Example - reminder subject and opening:

- Weak subject: "Don't forget!!!" / Opening: "We hope you're well. We wanted to reach out regarding your outstanding training requirements."
- Strong subject: "2 lessons due Friday 30 May" / Opening: "You have 2 lessons to complete by Friday 30 May."

## 5. Lifecycle and nudge emails

**Reader:** an existing learner or admin being gently encouraged toward an action that benefits them - finishing a streak, trying SSO, coming back after a lapse.

**Tone:** warmer than transactional, still honest and low-pressure. One nudge, one CTA. Never guilt-trip.

Checklist:

- Lead with what is in it for the reader, not for 5Mins. "Sign in faster with single sign-on" beats "We'd like you to enable SSO".
- One clear CTA; make opting out or ignoring it feel fine.
- Re-engagement emails acknowledge the gap without scolding: "It's been a while - here's what's new in your lessons."
- Keep it short. A lifecycle email earns a second one only by being light the first time.
- Frequency and tone should never tip into nagging; if a draft feels pushy, soften the verb and cut a sentence.

## 6. Marketing pages

**Reader:** a prospective buyer (L&D, compliance, HR, or an exec) who does not yet know or trust 5Mins. Skimming, sceptical, comparing options.

**Tone:** the full marketing register - confident, benefit-led, proof-heavy. Fragments for punch are welcome. Still British English, still no hype words, still specific.

Checklist:

- **Headlines** lead with an outcome and, where possible, a number. The supporting line explains the mechanism. "Cut training time by 60-80%" then "AI turns your content into bite-sized lessons your team finishes."
- **Proof everywhere**: real stats, named customers, real case-study outcomes. A claim without proof nearby is a weak claim.
- **Benefit before feature.** Name the customer's pain or gain first; introduce the feature as the answer.
- **CTAs** are consistent with the live site: primary "Start free trial" and "Get a demo" (sentence case; note the site currently uses Title Case "Start Free Trial" / "Get Your Demo" - flag for alignment, do not silently follow). Each section ends with a clear next step.
- **Scannability**: short paragraphs, meaningful subheads, fragments where they punch. A buyer should get the gist from headings alone.
- **No empty superlatives** (see `word-list.md`). The site's credibility comes from specifics, not adjectives.
- **Consistency with the product**: feature names on marketing pages must match their in-product names exactly.
- **Spelling**: British throughout - the area to police hardest here is the FAQ, which currently drifts American.

Example - hero:

- Weak: "The world's most advanced, revolutionary learning platform."
- Strong: "Train and upskill your team in just 5 minutes a day." then "One AI-powered platform for compliance, leadership, and role-based training - finished, not just assigned."
