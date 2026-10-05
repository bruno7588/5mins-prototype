---
ticket: DES-276
summary: Admins can add situational tests to courses
status: in Design Phase
generated: 2026-08-10T16:42:41.964Z
---

## Research Dossier

### Web Findings

- **[NN/g — Wizards: Definition and Design Recommendations](https://www.nngroup.com/articles/wizards/)** — Wizards are best for infrequent processes performed by novice users. Each step should be self-sufficient (users shouldn't need to leave to retrieve info), enforce sequential order, use descriptive button labels (e.g., "Save Brief" not "Next"), and support save-and-resume for interruptions. Common pitfalls include excessive clicking, difficulty comparing info across steps, and modal windows blocking needed context.

- **[PatternFly — Drawer Design Guidelines](https://www.patternfly.org/components/drawer/design-guidelines/)** — Drawers come in two variants: *overlay* (appears on top, must be dismissed to see underlying content) and *inline* (pushes content aside, keeping it visible). For a course builder where the admin needs to reference the course outline while adding a test, an inline drawer is preferable. Splitters can be added for resizable panes if content needs more room.

- **[UX Planet — Designing Side Panels That Add Value](https://uxplanet.org/designing-side-panels-that-add-value-to-your-websites-ux-fc44211fa8e1)** — Side panels are ideal for contextual sub-tasks without navigating away. Key components: clear header with title and close button, scrollable body for content, and sticky footer for primary actions. Modal drawers auto-dismiss on background click; non-modal drawers let users interact with both panel and background.

- **[Growform — Multi-Step Form UX Best Practices](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/)** — For forms with 7+ fields, multi-step designs convert 86% higher than single-step (HubSpot data). Essential practices: progress indicators, inline validation (on field blur, not submit), top-aligned labels, clear marking of required vs. optional fields, and specific error messages that guide correction.

- **[TestGorilla — Writing Situational Judgement Questions](https://support.testgorilla.com/hc/en-us/articles/9028585383707-Writing-situational-judgement-questions)** — SJT items consist of a scenario brief (the situation) followed by response options. Each scenario can have multiple questions. Response options are always multiple-choice and are pre-scored by experts. This maps directly to DES-276's model: one scenario brief → N multiple-choice questions.

- **[Teachable vs Thinkific vs Kajabi — Course Builder Comparison](https://www.courseplatformsreview.com/blog/teachable-vs-thinkific-vs-kajabi/)** — Kajabi treats quizzes as separate lesson objects (one content type per lesson), while Teachable allows mixing content types within a single lecture. Thinkific has the richest assessment suite (quiz, exam, survey, assignment) with Excel import and randomized question banks. For DES-276, Kajabi's model of "assessment as a distinct learning object in the sidebar" is the closest analog to the planned approach.

- **[U.S. OPM — Situational Judgment Tests](https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/situational-judgment-tests/)** — SJTs present a work scenario and ask respondents to choose or rank responses. A common variant presents one scenario with multiple questions about that scenario — exactly the "scenario brief + N questions" model DES-276 requires. SJTs are always multiple-choice; no free-text responses.

- **[Zapier — Kajabi vs Teachable (2026)](https://zapier.com/blog/kajabi-vs-teachable/)** — Kajabi's quiz builder supports multiple choice, checkbox, short answer, and file upload responses with auto-grading or manual grading and pass-grade thresholds. Admin workflow: create quiz as a separate lesson → add questions one by one → set grading. This two-level creation pattern (shell → questions) mirrors the planned two-step drawer flow.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Kajabi | Course builder — add content side panel | [View](https://mobbin.com/screens/e697e0bb-7875-4348-acce-33930007c2a7) | Side drawer with content type selection in course builder | Direct competitor — shows how Kajabi's "Add Content" sidebar lists learning object types for selection |
| Teachable | Course builder — quiz/assessment editing | [View](https://mobbin.com/screens/037aa8d2-21eb-4b91-b495-679d6dd54929) | Inline assessment editing within course curriculum | Shows Teachable's approach to editing quiz questions within the course builder context |
| Kajabi | Multiple choice question builder form | [View](https://mobbin.com/screens/590e1f98-c267-4f49-8ef9-b75f6fdfb7eb) | Question authoring form with answer options | Shows MCQ creation UI: question text field + answer option list with correct answer toggle |
| Teachable | Question builder with scenario/description | [View](https://mobbin.com/screens/5373d2cf-adea-4344-996f-d3f8532f233f) | Assessment question editing with description area | Shows how Teachable handles question + description text areas in assessment editing |
| Podia | Multiple choice question form with options | [View](https://mobbin.com/screens/ac106b26-5894-4d5f-aba3-78d4ff53fa0c) | MCQ builder with radio-button answer selection | Clean question builder pattern: text area for question, inline answer options with correct marking |
| Typeform | Question builder with answer choices | [View](https://mobbin.com/screens/6a97e76a-c1da-48b8-bd10-5388b9bb741f) | Form builder with multiple choice options | Typeform's approach to MCQ authoring — inline editing of question and answer choices |
| Whop | Course content sidebar with object types | [View](https://mobbin.com/screens/7814c49a-11a9-4124-a9aa-012b2e232fa8) | Content type picker sidebar in course builder | Shows sidebar listing of available learning object types to add to a course |
| Teachable | Course outline with content type sidebar | [View](https://mobbin.com/screens/bb9c7f08-242e-44bc-bc34-707a6636dcb1) | Course structure view with add-content sidebar | Shows how Teachable positions the "add content" panel relative to the course outline |
| Coursera | Course content sidebar with learning objects | [View](https://mobbin.com/screens/24efcb48-835b-4dc8-acc4-a502cff8078a) | Course builder with content type selection | Enterprise LMS showing structured content type sidebar alongside course outline |
| Deel | Admin form in side drawer panel | [View](https://mobbin.com/screens/35c083aa-c4f1-404b-aa62-f92170f83f40) | Side drawer with multi-field form | SaaS pattern for complex form entry in a drawer overlaying main content |
| Workable | Multi-step form in side drawer | [View](https://mobbin.com/screens/af2b23c5-8c33-4f5c-8d81-9b04407513ba) | Side drawer with structured form steps | HR SaaS showing a multi-step creation flow inside a side panel |
| Asana | Task creation side panel | [View](https://mobbin.com/screens/ecbaca38-1db4-4034-a02d-2b9dc4fa872f) | Side panel for creating/editing structured content | Canonical SaaS pattern: side panel for creating items without leaving the main view |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Progressive Disclosure | Glossary | [View](https://builtformars.com/ux-glossary/progressive-disclosure) | Progressive disclosure is "the art of progressively exposing complications." The key concept is the *information horizon* — what a user can see at any moment. If the horizon is too broad, users feel overwhelmed. For a two-step drawer (brief → questions), each step should reveal only the fields relevant to that phase, not the entire form at once. | Directly applies to the two-step drawer design: Step 1 shows only the scenario brief; Step 2 reveals question authoring. Avoids overwhelming admins with the full form surface. |
| Revolut's Progressive Onboarding | UX Bite | [View](https://builtformars.com/ux-bites/revoluts-progressive-onboarding) | Revolut teaches features *in context* — showing a card recovery tooltip only after the user deletes a card. Education is bound to the moment it's relevant, not front-loaded. For DES-276, this means: don't explain all situational test options upfront; instead, provide contextual hints (e.g., "Add at least 2 questions" prompt) when the admin reaches the question-adding step. | Supports the decision to keep the flow simple (no upfront config) and provide guidance contextually during each step. |
| Why Adding Friction Improved BFM's Sign-Up | Case Study | [View](https://builtformars.com/case-studies/bfm) | Strategic friction improves outcomes — BFM increased conversions 25% by adding steps that set expectations and filtered for genuine intent. For DES-276: requiring the scenario brief as a mandatory first step before question authoring is *good* friction; it ensures the admin has a clear scenario context before writing questions, preventing low-quality tests. | Validates the two-step design choice. Making the brief a prerequisite (rather than optional) is intentional friction that improves content quality. |
| How to Stop People from Skipping Your Onboarding (YNAB) | Case Study | [View](https://builtformars.com/case-studies/ynab) | YNAB demonstrates that visible progress, early value, and sensible defaults prevent abandonment in multi-step flows. For DES-276: show a step indicator (1/2), provide placeholder/example text in the brief field to reduce blank-page anxiety, and allow saving a partially complete test so admins can return later. | Applies to preventing admin abandonment during the two-step creation flow. Placeholder examples and visible progress reduce friction. |

### Confidence Check

- `web_searches_performed`: 7
- `mobbin_searches_performed`: 4
- `bfm_lookups_performed`: 4 (progressive disclosure glossary, Revolut UX bite, BFM sign-up case study, YNAB case study — all fetched via WebFetch from builtformars.com as the BFM MCP server was not available)
- `authoritative_sources_fetched`: 2 (NN/g Wizards article, PatternFly Drawer guidelines)
- `all_urls_verified`: yes