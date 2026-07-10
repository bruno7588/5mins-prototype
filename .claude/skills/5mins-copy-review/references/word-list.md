# 5Mins.ai Word List and Conventions

The detailed reference behind the "Core conventions" section of SKILL.md. When reviewing or drafting copy, check wording against this file.

## Contents

1. Brand and product names
2. Spelling standard (British English)
3. Capitalisation
4. Approved terms vs terms to avoid
5. Words and phrases to avoid
6. Numbers, dates, and time
7. Punctuation

---

## 1. Brand and product names

- The brand is **5Mins** in running text, **5Mins.ai** for the full name (first mention, marketing, legal). Never "5mins", "5 Mins", "Five Mins", "FiveMins", or "5MINS".
- The legal entity is **5Mins AI Ltd**.
- When you mean the literal duration, write **"5 minutes"**, not "5Mins". "Train your team in just 5 minutes a day" - correct. "5Mins a day" conflates the brand with the duration; avoid it even though the marketing hero currently does this.
- **Hugo** is the AI assistant. It is a name, so always capitalised, never "the Hugo" or "hugo".
- Feature names are proper nouns and stay capitalised consistently wherever they appear in-product. Current set includes: **AI Studio**, **AI Transformer**, **Roles & Mapping**, **Learning Profile**, **Learning Records**, **Automations**, **Skill Pathways**, **Course Collection**. Use the ampersand in "Roles & Mapping" as the registered feature name. If a name is not on this list, treat it as a common noun and use sentence case ("the reports tab", "the role library") unless the team has explicitly branded it.
- Generic capability words are **not** proper nouns: compliance training, leadership development, microlearning, gamification, leaderboards, streaks. Lowercase them.

## 2. Spelling standard: British English

5Mins AI Ltd is UK-registered; the customer base, named regulations (GDPR, AML, UK H&S), CPD accreditation, and pricing (£) are UK-centric. **British English is the house standard on every surface, including marketing.**

The marketing FAQ block currently uses American spelling ("personalized", "organizations", "auto-enroll"). This is an inconsistency to flag and fix, not a precedent to follow.

Common words, correct form:

| Use (British) | Not (American) |
|---------------|----------------|
| personalise, personalised, personalisation | personalize, personalized |
| organise, organisation | organize, organization |
| enrolment, enrol, enrolled | enrollment, enroll |
| behaviour | behavior |
| licence (noun), license (verb) | license (noun) |
| catalogue | catalog |
| centre | center |
| colour, favourite | color, favorite |
| fulfil, fulfilment | fulfill, fulfillment |
| analyse | analyze |
| programme (a training programme); program (software) | program (for everything) |

Note "enrolment" takes a single L in British English. Keep this consistent with the product's existing "Enrolment History" filter.

## 3. Capitalisation

**Sentence case everywhere in-product.** Headings, subheadings, body text, form labels, helper text, button labels, menu and tab names, table column headers, empty states, toasts, tooltips, and error messages. Capitalise the first word and genuine proper nouns only.

- Buttons: "Add learner", "Save changes", "Create automation", "Mark as complete". Not "Add Learner" or "Save Changes". (Note: the existing `buttons` skill shows Title Case examples; those should be aligned to sentence case - flag this if it comes up.)
- Tabs and nav: "Learning records", "My team", "Reports", "Automations".
- Proper nouns keep their capitals mid-sentence: "Open AI Studio", "Ask Hugo", "the Roles & Mapping page".
- Job-role names are lowercase unless part of a proper noun: "admin", "compliance lead", "learner".
- Acronyms stay uppercase: SSO, SAML, HRIS, CPD, AI, OTP, PIN, QR, CSV, GDPR, AML. "Gen AI" - both words as shown.
- Marketing may use title-case in logos, lockups, and award badges, but body copy and headings on marketing pages are still sentence case.

## 4. Approved terms vs terms to avoid

| Concept | Use | Avoid |
|---------|-----|-------|
| The bite-sized unit of content | lesson, micro-lesson | course (for a single unit), module, nugget |
| Grouped or uploaded multi-lesson content | course | lesson, pathway (unless AI-generated) |
| An AI-generated sequence of content | skill pathway, pathway | track, journey (overused), curriculum |
| End user of the learner app | learner | user, student, employee (in-product), trainee |
| Portal user | admin | user, manager (unless specifically the manager role), superuser |
| The customer's workforce | team, people, workforce | resources, headcount, users |
| The act of starting a learner on content | assign, enrol | provision, push, deploy |
| Short-format learning as a category | microlearning (one word) | micro-learning, micro learning |
| Reducing long content to lessons | bite-size (verb), bite-sized (adjective) | bitesize, bite size |
| Building skills | upskill (one word) | up-skill, up skill |
| The TikTok-style feed | feed, learning feed | timeline, wall, stream |
| Required compliance content | compliance training, required training | mandatory training (acceptable but "required" is warmer) |
| Finishing a lesson or course | complete, completed | finish, done with, passed (passing is for quizzes/assessments) |
| AI features | AI-powered | AI-driven, AI-enabled, smart (vague) |

## 5. Words and phrases to avoid

**Hype and empty superlatives:** revolutionary, world-class, best-in-class, cutting-edge, game-changing (fine only inside a genuine customer quote), next-generation, unparalleled, state-of-the-art.

**Empty intensifiers:** very, really, truly, incredibly, simply, just (when used as filler), actually.

**Corporate filler:** leverage (use "use"), utilise (use "use"), facilitate (use "help" or "let"), in order to (use "to"), at this time (use "now" or cut), please be advised, we are pleased to inform you, kindly.

**Vague tech-speak in-product:** "Something went wrong" (say what), "Invalid input" (say what is wrong and what is valid), "An error occurred", "Oops!", "Uh oh".

**Weak CTAs:** "Submit", "OK", "Click here", "Learn more" with no object, "Continue" where a named action would be clearer.

**Cute or jokey error and empty-state copy:** the reader is often blocked or frustrated; whimsy reads as the product not taking their problem seriously. Be warm and plain instead.

**"Seamless" / "seamlessly":** borderline cliché. Allowed sparingly in marketing, but prefer a concrete claim ("connects to your HRIS in a few clicks").

## 6. Numbers, dates, and time

- Use numerals in UI and for any statistic: "3 days left", "12 learners", "95%+ completion", "20,000+ lessons".
- Spell out a number only when it starts a sentence, or rephrase so it does not.
- Numeric ranges: unspaced hyphen, no spaces. "60-80%", "6-10x", "2-4 weeks", "3-5 days".
- Large numbers: use a comma separator ("20,000+") or "k" only in tight UI spaces ("1.2k learners").
- Percentages: "%" symbol, no space. "95%".
- Currency: "£5 per seat per month" in prose; "£5/seat/month" acceptable in pricing UI.
- Dates: "27 May 2026" in prose and emails; "27 May" where the year is obvious. Avoid all-numeric dates (ambiguous between UK and US order).
- Time: 12-hour with lowercase "am"/"pm", no space ("9am", "2:30pm"). Always state the time zone for scheduled or live events.
- Relative time is friendlier in-product when accurate: "in 3 days", "just now", "2 hours ago".

## 7. Punctuation

- **No em dashes (-) anywhere.** For a parenthetical break use a spaced hyphen ( - ) or restructure into two sentences. Brackets are also fine.
- **Numeric ranges** use an unspaced hyphen (see section 6).
- **Oxford comma**: use it. "compliance, leadership, and onboarding".
- **Ellipsis**: only for in-progress states ("Generating lessons...", "Saving..."). Not for trailing off or suspense.
- **Exclamation marks**: genuine positive moments only - a passed quiz, a completed course, a streak milestone, a celebratory empty state. Never in errors, warnings, destructive confirmations, or neutral informational text. One per screen at most.
- **Ampersand (&)**: only in registered feature names ("Roles & Mapping") and tight table headers. In running text write "and".
- **Quotation marks**: double for quotes; British practice puts punctuation outside the quote unless it belongs to the quoted text.
- **Colons**: fine to introduce a list or a consequence. The word after a colon is lowercase unless it is a proper noun.
- **Sentence-ending periods**: use them in body copy, helper text, and multi-sentence messages. Omit them on short standalone UI fragments - button labels, single-line empty-state headings, table cells, chips, badges, and toasts of a few words.
