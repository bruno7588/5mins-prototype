---
ticket: DES-321
summary: Lesson Quiz formats
status: in Design Phase
generated: 2026-07-20T17:36:38.579Z
---



# PRD: Lesson Quiz Formats

## 1. Overview

5Mins currently offers only single-answer multiple-choice questions (MCQ) at the end of its ~5-minute micro-lessons. This format is passive, highly guessable, and does little to reinforce learning material — a critical shortcoming for a platform serving frontline and shift workers in hospitality, finance, and healthcare who need to retain compliance knowledge. Drag-and-drop / mix-and-match is the most-requested new quiz type from users, and many prospects migrating from competitor Skillcast expect richer interaction formats.

This initiative is research-led and design-focused. It defines a small, accessible, tap/select-only core of new quiz formats — **Match-the-Pairs, Fill-in-the-Blank (word bank with free-type toggle), and Sequence Assembly** — layered on the existing MCQ/true-false backbone. All formats share a single reusable question-renderer component, are mobile-first (tap-only, no drag), meet WCAG 2.2 AA, and integrate with existing 5Mins gamification primitives (streaks, points). True drag-and-drop, open-ended/video grading, and AI-assisted question generation are explicitly out of scope for v1.

## 2. Jobs To Be Done

### Main Job

**When I finish a 5-minute compliance lesson on my phone during a break, I want the end-of-lesson quiz to actively test whether I understood the material — not just let me guess my way through — so I can feel confident that I actually learned something and my time was well spent.**

The learner is "hiring" new quiz formats to replace the current passive MCQ tap-through. The current solution is being "fired" because it fails to create a sense of active engagement, provides no meaningful retrieval practice, and makes the quiz feel like a checkbox rather than a learning moment.

### Job Map

| Stage | What the Learner Does Today | Where It Falls Short | Opportunity |
|-------|---------------------------|---------------------|-------------|
| **Define** | Learner opens a lesson knowing a quiz follows | No expectation of challenge — "I'll just guess through it" | Set a curiosity-gap hook that pulls learners into the quiz (Brilliant pattern) |
| **Locate** | Reaches the quiz at lesson end | Single format every time — no variety, no surprise | Introduce format variety so each quiz feels fresh |
| **Prepare** | Reads the MCQ question and options | Can often eliminate wrong answers without understanding content | Formats like fill-in-the-blank and sequence assembly require genuine recall, not elimination |
| **Confirm** | Selects an answer (single tap) | No active processing — recognition only, not production | Tap-to-select matching and word-bank assembly require constructive effort |
| **Execute** | Submits answer | Binary right/wrong with no partial credit | Partial credit for matching/sequencing rewards partial understanding and reduces frustration |
| **Monitor** | Sees result | Minimal feedback — no explanation of why | Instant per-answer feedback with correct answer + one-line "why" explanation |
| **Resolve** | Moves on / completes lesson | No sense of accomplishment beyond streak | Tie completion into existing streak/points; celebrate correct answers with micro-interactions |

### Related Jobs

- **Admin/Instructor authoring job:** "When I create a lesson quiz, I want to produce engaging questions quickly without needing specialized tooling, so I can focus on content quality rather than interaction design." The reusable question-renderer and structured data model must make authoring simple across all formats.
- **Compliance officer verification job:** "When I assign compliance training, I want to trust that learners genuinely engaged with the material, so I can satisfy regulatory requirements." More rigorous formats (beyond guessable MCQ) provide better evidence of comprehension.
- **Repeat learner retention job:** "When I retake a compliance module in a new cycle, I want the quiz to feel different enough that I can't just memorize the pattern, so I actually re-engage with the content." Format variety and the fill-in-the-blank free-type toggle support this.

### Emotional & Social Dimensions

- **Emotional:** Learners want to feel *capable and progressing*, not patronized by trivially easy questions. Mistakes should feel like part of learning, not failure. Partial credit and gentle "bounce-back" animations on wrong taps reduce anxiety and build confidence.
- **Social:** Frontline workers doing compliance training during shifts want to feel that their employer respects their time — that the 5 minutes spent are genuinely useful, not performative box-ticking. Active quiz formats signal that the training is real and worthwhile.
- **Identity:** Learners want to see themselves as competent professionals who know their compliance obligations, not as people being tested. The quiz should feel like practice, not examination.

## 3. Goals

1. **Increase active engagement** in end-of-lesson quizzes by replacing passive single-tap MCQ with formats that require constructive effort (matching, assembly, recall).
2. **Reduce guessability** so quiz completion becomes a meaningful signal of comprehension rather than a coin flip.
3. **Maintain the 5-minute lesson format** — new quiz types must fit within the existing time envelope (~10–15 short items max).
4. **Ship accessible-by-construction interactions** that meet WCAG 2.2 AA (SC 2.5.7 Dragging Movements, SC 2.5.8 Target Size) using tap/select mechanics, not drag-and-drop.
5. **Deliver mobile-first** — all interactions work on small phone screens with discrete taps, no conflict with native scroll.
6. **Build a reusable question-renderer architecture** — one component per format, one data model, usable across lesson quizzes and (later) assessments.
7. **Integrate with existing gamification** (streaks, points) rather than building parallel reward systems.

## 4. Job Stories

### Engagement & Variety

- **When** I reach the quiz at the end of a lesson, **I want** the format to feel different from yesterday's quiz, **so I can** stay curious and engaged rather than going through the motions.
- **When** I see a matching exercise with term-definition pairs, **I want** to tap items to connect them rather than drag them across the screen, **so I can** complete the exercise comfortably on my phone without fighting scroll behavior.
- **When** I encounter a fill-in-the-blank question with a word bank, **I want** to tap chips into gaps, **so I can** actively recall and place the right term rather than just recognizing it in a list.

### Feedback & Learning from Mistakes

- **When** I get a matching pair wrong, **I want** my selection to bounce back gently with the correct answer shown, **so I can** learn from the mistake without feeling punished.
- **When** I submit a sequence assembly answer with some steps in the right order, **I want** to receive partial credit for the correct portions, **so I can** feel that my partial understanding is recognized and I'm motivated to improve.
- **When** I answer any question incorrectly, **I want** to immediately see the correct answer plus a brief explanation of why, **so I can** correct my understanding in the moment rather than at the end of the quiz.

### Accessibility & Mobile

- **When** I use a screen reader or keyboard to navigate a matching exercise, **I want** to Tab between tokens, press Enter to select, and hear an announcement of what I selected and placed, **so I can** complete the quiz with the same experience as sighted tap users.
- **When** I take a quiz on my phone during a work break, **I want** all tap targets to be large enough to hit accurately, **so I can** move through questions quickly without mis-taps.

### Progressive Difficulty & Compliance Recall

- **When** I retake a compliance module I've passed before, **I want** the fill-in-the-blank to challenge me with free-type recall instead of a word bank, **so I can** prove (and reinforce) that I truly know the statutory phrasing.
- **When** I encounter a scenario-based question describing a workplace situation, **I want** to apply judgment to select the correct response, **so I can** practice decision-making in realistic compliance contexts.

### Admin Authoring

- **When** I create a matching question for a lesson, **I want** to simply enter pairs of terms and definitions in a structured form, **so I can** author engaging content without learning a complex interaction builder.
- **When** I create quiz content for a lesson, **I want** confidence that the same question will render correctly in assessments later, **so I can** author once and reuse across learning contexts.

## 5. Requirements

### Functional Requirements

#### FR1: Match-the-Pairs

| ID | Requirement |
|----|------------|
| FR1.1 | The system shall present two columns (or groups) of items that the learner must pair by tapping. |
| FR1.2 | Interaction model: tap an item to select it (highlighted in `--selected` amber), then tap its match to pair them. Tap a paired item to unpair and return both to the pool. |
| FR1.3 | Matched pairs shall animate out (fade or slide) to reduce visual clutter and show progress. |
| FR1.4 | Scoring shall use equal-weight-per-pair partial credit (e.g., 4 pairs = 25% each), following the Blackboard precedent. |
| FR1.5 | On incorrect pairing, the wrong item shall "bounce back" to its original position with a brief incorrect-state indicator (red flash). |
| FR1.6 | Support a minimum of 3 and a maximum of 8 pairs per question. |
| FR1.7 | Each item target shall be ≥ 44 CSS px on mobile (≥ 24 CSS px minimum per WCAG 2.2 SC 2.5.8). |

#### FR2: Fill-in-the-Blank (Word Bank)

| ID | Requirement |
|----|------------|
| FR2.1 | The system shall display a sentence or passage with one or more gaps, and a word bank of tappable chip tokens below. |
| FR2.2 | Learners tap a chip to select it, then tap a gap to place it (or the system auto-places into the next empty gap). Tap a placed chip to return it to the bank. |
| FR2.3 | The word bank shall include distractors (incorrect options) to prevent trivial completion. |
| FR2.4 | A toggle shall allow switching from assisted word-bank mode to free-type recall mode (keyboard input), configurable by the admin per question. |
| FR2.5 | Free-type mode shall accept case-insensitive matching with configurable tolerance for minor typos. |
| FR2.6 | Scoring: each gap scored independently; partial credit across multiple gaps in one question. |

#### FR3: Sequence / Sentence Assembly

| ID | Requirement |
|----|------------|
| FR3.1 | The system shall present a shuffled set of token chips that the learner must tap in the correct order to assemble a sentence, process, or sequence. |
| FR3.2 | Tapped tokens move from the bank to an answer area in the order tapped. Tap a placed token to return it to the bank. |
| FR3.3 | Scoring shall support two configurable modes: (a) position-based (exact slot match — for regulatory step-by-step procedures) and (b) pairwise/relative-order (more forgiving — for prioritization tasks). |
| FR3.4 | Support 3–10 tokens per question. |

#### FR4: Scenario-Anchored MCQ

| ID | Requirement |
|----|------------|
| FR4.1 | The system shall support a content pattern where a short vignette (2–4 sentences describing a workplace situation) precedes a standard single- or multi-select MCQ. |
| FR4.2 | This is a content/template pattern layered on the existing MCQ renderer — no new interaction mechanic required. |
| FR4.3 | Admin authoring UI shall provide a dedicated "scenario" text field above the question stem. |

#### FR5: Instant Feedback

| ID | Requirement |
|----|------------|
| FR5.1 | Every question type shall provide instant per-answer feedback upon submission: green/correct flash or red/incorrect flash. |
| FR5.2 | On incorrect answers, the system shall always reveal the correct answer plus a one-line "why" explanation (authored by admin). |
| FR5.3 | For matching and word-bank formats, wrong taps shall bounce back with low penalty — no harsh error states. |
| FR5.4 | Feedback shall be reactive and in-the-moment, not deferred to end-of-quiz summary. |

#### FR6: Accessibility (WCAG 2.2 AA)

| ID | Requirement |
|----|------------|
| FR6.1 | All interactions shall be tap/select only — no drag-and-drop. This satisfies WCAG 2.2 SC 2.5.7 (Dragging Movements) by construction. |
| FR6.2 | Full keyboard operability: Tab between tokens/targets, Enter/Space to select and place, Esc to cancel selection. |
| FR6.3 | Use semantic `<button>` elements with `aria-pressed` or `aria-selected` states. Do not use deprecated `aria-grabbed` / `aria-dropeffect`. |
| FR6.4 | Each question widget shall include an `aria-live` region that announces select, place, and return actions to screen readers. |
| FR6.5 | Interactive targets ≥ 24 CSS px (WCAG SC 2.5.8 minimum); ≥ 44 CSS px recommended and required on mobile viewports. |
| FR6.6 | Selected state shall use the project's `--selected` amber token. Never indicate selection via opacity alone. |

#### FR7: Reusable Question Renderer Architecture

| ID | Requirement |
|----|------------|
| FR7.1 | Each format shall be implemented as a single reusable question-renderer component — one implementation of interaction, scoring, and feedback. |
| FR7.2 | The question data model shall carry: question type, answer structure (ordered list, pair mapping, gap/word-bank fills), content fields, scoring metadata (partial-credit weights, scoring mode), and admin-authored explanation. |
| FR7.3 | The same renderer and grader shall serve lesson quizzes and (later) assessments and other learning contexts — no per-context forks. |
| FR7.4 | The data model shall be structured so that AI-generated content could target any format in a future initiative. |

#### FR8: Gamification Integration

| ID | Requirement |
|----|------------|
| FR8.1 | Quiz completion and scoring shall feed into the existing 5Mins streak and points system. |
| FR8.2 | Correct-answer celebrations shall use micro-interactions (animation) consistent with existing gamification UI. |
| FR8.3 | No parallel or new reward system shall be introduced. |

#### FR9: Microlearning Constraints

| ID | Requirement |
|----|------------|
| FR9.1 | A quiz shall contain a maximum of 10–15 items to protect the 5-minute lesson format. |
| FR9.2 | Mixed-format quizzes (e.g., 2 MCQ + 1 matching + 1 fill-in-blank) shall be supported. |

## 6. Research & Best Practices

### Synthesis

The research strongly validates the decision to use **tap/select interactions rather than true drag-and-drop**. WCAG 2.2 SC 2.5.7 (Level AA) requires every drag-based function to be achievable with a single pointer without dragging; button-based tap-to-select combined with keyboard shortcuts provides the most accessible pattern ([TestParty WCAG 2.5.7 Guide](https://testparty.ai/blog/wcag-2-5-7-dragging-movements-2025-guide)). This is not merely a theoretical concern: approximately 15 million Americans have conditions affecting upper limb mobility that prevent precise drag-and-drop control, and the European Accessibility Act became effective June 2025, making compliance a near-term legal requirement ([AccessiCart Dragging Movements Guide](https://accessicart.com/wcag-2-2-aa-sc-2-5-7-dragging-movements/)). Manual testing remains essential, as automated tools detect only 30–40% of WCAG 2.2 EdTech accessibility issues — all drag alternatives should be tested with keyboard-only navigation ([Hireplicity EdTech Accessibility Tests](https://www.hireplicity.com/blog/15-wcag-accessibility-tests-edtech-apps)).

**Duolingo's interaction model** is the primary benchmark. Its lesson flow uses progressive difficulty: challenges 1–3 are multiple choice (recognition), 4–7 use word bank tap-to-select (constrained production), 8–11 require typing (full production), and 12–14 mix formats. The word bank interaction is fully reversible — tap to select, tap again to remove — supporting user control and reducing anxiety ([925 Studios Duolingo Breakdown](https://www.925studios.co/blog/duolingo-design-breakdown)). Duolingo's "play first, profile second" approach and its streak-based loss aversion are the most powerful retention tools ([Blake Crosley Duolingo Guide](https://blakecrosley.com/guides/design/duolingo)), validating 5Mins' existing gamification primitives as the right reward system to integrate with.

**Partial credit scoring** is strongly supported by evidence. A study of partial credit on MCQs in pharmacology found it improved student performance and created a more encouraging assessment experience, with lower-performing students showing greater score increases. Themes included recognition of effort, reduced pressure, increased confidence, and motivation to learn from mistakes ([Schneid et al., BJCP 2025](https://bpspubs.onlinelibrary.wiley.com/doi/10.1002/bcp.70127)). Blackboard Ultra's matching questions distribute credit as a percentage across matching pairs by default, providing the standard LMS precedent ([Blackboard Matching Questions](https://help.blackboard.com/Learn/Instructor/Ultra/Tests_Pools_Surveys/Question_Types/Matching_Questions)).

**SC Training (formerly EdApp)**, a leading mobile-first microlearning platform for frontline workers, offers matching, fill-in-the-blank, sequencing, and categorization quiz types with 10–15 questions per quiz and 80%+ completion rates — their use case closely mirrors 5Mins ([SC Training Quiz Types](https://training.safetyculture.com/blog/types-of-quiz/)). The broader eLearning landscape recommends eight interactive formats including match-the-pair, fill-in-the-blanks, sequencing, and sorting/classification ([eLearning Industry Quiz Formats](https://elearningindustry.com/interactive-quiz-formats-use-elearning-courses-8-types)). Question variety itself is a key engagement driver for digitally distracted workforces, and retrieval practice — testing knowledge by asking learners to recall information — is particularly powerful when spaced after training sessions ([Qstream Microlearning](https://qstream.com/blog/microlearning-question-variety-the-key-to-engaging-training-a-digitally-distracted-workforce/)).

### UX References

| App | Flow / Screen | Mobbin URL | Pattern Description | Relevance |
|-----|--------------|------------|---------------------|-----------|
| Duolingo | Quiz matching pairs — tap to select | [View](https://mobbin.com/screens/36d3bd38-87bc-4f71-ba8e-41217fdf9687) | Match-the-pairs interaction with tap-to-select | Direct reference for the match-the-pairs format; shows tap-based pair matching UI on mobile |
| Duolingo | Matching pairs exercise variant | [View](https://mobbin.com/screens/aac77036-b23b-458e-abff-5b3de9bab287) | Match-the-pairs with visual feedback on selection | Shows how matched pairs are visually indicated and remaining pairs presented |
| Duolingo | Matching exercise with progress | [View](https://mobbin.com/screens/3c555090-893d-42b7-b65c-2b50e6e4f23c) | Match-the-pairs mid-exercise state | Demonstrates progress indicator and mid-quiz state for matching exercises |
| Quizlet | Quiz matching/flashcard interaction | [View](https://mobbin.com/screens/454b2935-007b-4b92-bed7-921bad95f397) | Card-based matching quiz | Alternative matching pattern from a study/quiz-focused app |
| Nibble | Learning quiz with tap selection | [View](https://mobbin.com/screens/0babcb70-ec2f-4513-b7e2-e946922b72f1) | Tap-to-select quiz in compliance learning app | Nibble targets compliance/financial learning — close to 5Mins persona |
| Duolingo | Fill-in-the-blank with word bank | [View](https://mobbin.com/screens/1b3b4043-e0e6-4da9-9244-15085a82a5f4) | Word bank chips below sentence gap | Core reference for fill-in-the-blank: tappable chips placed into sentence gaps |
| Duolingo | Word bank sentence completion | [View](https://mobbin.com/screens/47ce1499-18da-48e0-a493-d50021486614) | Tap word chips to fill sentence | Shows the chip-in-gap interaction mid-completion with placed and available tokens |
| Duolingo | Word bank with free-type toggle | [View](https://mobbin.com/screens/b899b299-8fd4-4751-8627-bf32671ab570) | Word bank with keyboard input option | Critical reference: shows the toggle between assisted word-bank and free-type recall |
| Duolingo | Sentence completion feedback | [View](https://mobbin.com/screens/ac53016a-c57a-4c9d-9fd3-5ea239d0e2f1) | Fill-in-blank result with correct/incorrect feedback | Shows the instant feedback state after submitting a fill-in-the-blank answer |
| Duolingo | Sentence assembly from shuffled bank | [View](https://mobbin.com/screens/9c1d0c4d-1f22-4930-a59b-80f1ede58526) | Full sentence construction from chips | Direct reference for sequence/sentence assembly format |
| Imprint | Fill-in-the-blank learning interaction | [View](https://mobbin.com/screens/37df75bb-d63f-43a0-9f5e-3d9f3a624463) | Word bank fill-in-blank in knowledge app | Alternative fill-in-blank implementation from a learning-focused app |
| Vocabulary | Word completion quiz | [View](https://mobbin.com/screens/ee92742d-dbac-4963-8afc-63f7cfd1ea41) | Fill-in-blank for vocabulary/terminology recall | Shows fill-in-blank applied to terminology recall |
| Duolingo | Sentence ordering / tap to assemble | [View](https://mobbin.com/screens/f677e276-0b54-4f01-9359-08e9c393e039) | Tap chips to order sentence | Core reference for sequence assembly: tap tokens in order to build answer |
| Duolingo | Sentence ordering in progress | [View](https://mobbin.com/screens/0da208dc-9e11-476d-afc9-eac0d5942ba5) | Sequence assembly mid-state | Shows partially assembled sentence with remaining chips in bank |
| Duolingo | Sentence ordering completion | [View](https://mobbin.com/screens/3a9024f6-6ac9-4f50-86f2-712dc504803d) | Completed sequence assembly | Shows fully assembled answer ready for submission |
| Babbel | Word ordering exercise | [View](https://mobbin.com/screens/22c0a95b-e826-4a3f-b82c-ab18906f8c5b) | Tap-to-order sentence construction | Alternative implementation of sequence assembly from Babbel |
| Nibble | Correct answer feedback screen | [View](https://mobbin.com/screens/1b1f087b-bdc1-4550-9f33-164af252aa3b) | Green checkmark instant correct feedback | Instant positive feedback with explanation — matches the "reveal correct answer + why" pattern |
| Quizlet | Quiz result feedback | [View](https://mobbin.com/screens/43651d31-049a-4c99-8f4f-d27c71bc9957) | Quiz answer result with correct/incorrect state | Answer feedback with correct answer revealed |
| Brilliant | Quiz interaction with feedback | [View](https://mobbin.com/screens/3c5f9cbd-0ee9-4766-9bd4-578c5c297ab9) | Interactive quiz with curiosity-gap pattern | Brilliant's approach to quiz engagement with explanatory feedback |
| Duolingo ABC | Correct answer celebration | [View](https://mobbin.com/screens/453bb899-1900-4d7c-a557-3d784aca5e62) | Celebration animation on correct answer | Reward micro-interaction after correct answer — relevant for gamification |

### Built for Mars Lessons

| Title | Type | builtformars.com URL | Lesson | Relevance |
|-------|------|---------------------|--------|-----------|
| Time-Limited Onboarding (Queue) | UX Bite | [View](https://builtformars.com/ux-bites/time-limited-onboarding) | Queue limits matching exercises to 30 seconds, reframing the task as "what can you get done in 30 seconds?" — time constraints reduce decision fatigue, increase interactions, and improve input quality versus open-ended matching. | Directly applicable to keeping quiz interactions within the 5-minute lesson; a time-bounded matching exercise prevents the interaction from dragging on and maintains microlearning pacing. |
| Mobbin's 404 Quiz | UX Bite | [View](https://builtformars.com/ux-bites/mobbins-404-quiz) | Gamification and play can transform even negative moments into engagement opportunities; quiz mechanics create engagement through play rather than passive consumption. | Validates the principle that varied quiz formats are engagement drivers rather than assessment tools — supports the core thesis of this initiative. |
| Onboarding Proof of Value (Arc) | UX Bite | [View](https://builtformars.com/ux-bites/onboarding-proof-of-value) | Interactive demonstrations outperform passive instruction: users who actively interact with a feature discover value themselves, creating stronger conviction through curiosity-driven "Aha! Moments." | Reinforces the core thesis: active quiz formats (matching, fill-in-blank, sequencing) will outperform passive MCQ because learners who *do* something retain better than those who merely *select*. |
| How to Stop People Skipping Your Onboarding (YNAB) | Case Study | [View](https://builtformars.com/case-studies/ynab) | Making engagement feel optional rather than mandatory — letting users engage directly with features while providing contextual guidance — produces better retention than blocking access behind required tutorials. | New quiz types should be introduced contextually within the lesson flow rather than requiring learners to read instructions upfront; the interaction should be self-explanatory through visual hierarchy and microcopy. |
| Learn UX Design from Duolingo | Company Page | [View](https://builtformars.com/company/duolingo) | Covers engagement mechanics, habit formation, gamification (streaks, rewards, progress), and mobile UX optimization. Specific: nudging friends in a single tap, early-day streak extensions, breaking daily records as motivation shots. | Validates Duolingo as the primary UX benchmark; confirms the gamification patterns (streak/points) that 5Mins should integrate with rather than building parallel reward systems. |

## 7. Plan of Action

### Phase 1: Architecture & Data Model (Weeks 1–2)

- [ ] Design the extended question data model supporting: question type enum (MCQ, true-false, match-pairs, fill-blank, sequence-assembly, scenario-MCQ), variable answer structures (ordered lists, pair mappings, gap/word-bank fills), scoring metadata (partial-credit weights, position-based vs. pairwise scoring mode), and admin-authored explanation text
- [ ] Define the reusable question-renderer component interface — input contract (question model), output contract (answer submission, score), and callback hooks (feedback display, gamification events)
- [ ] Validate the data model can be targeted by future AI question generation (structured enough for LLM output)
- [ ] Engineering spike: assess impact on existing quiz engine (currently assumes fixed single-answer MCQ) and identify migration/extension path
- [ ] Define API contracts for question CRUD, answer submission, and scoring

### Phase 2: Core Interaction Components — Design & Build (Weeks 3–5)

- [ ] **Match-the-Pairs:** Design and build the tap-to-select, tap-to-pair interaction component with fade-out animation for matched pairs, bounce-back for incorrect pairings, and `--selected` amber highlight state
- [ ] **Fill-in-the-Blank (Word Bank):** Design and build the chip-in-gap interaction with word bank, distractor support, and the free-type toggle for progressive difficulty
- [ ] **Sequence Assembly:** Design and build the tap-to-order token assembly interaction with answer area and return-to-bank mechanics
- [ ] **Scenario-Anchored MCQ:** Add scenario text field to existing MCQ authoring and renderer (content pattern, minimal new UI)
- [ ] Implement shared interaction primitives: `<button>` semantics with `aria-pressed`/`aria-selected`, `aria-live` announcement region, keyboard navigation (Tab/Enter/Space/Esc), and ≥44 CSS px touch targets

### Phase 3: Scoring & Feedback Engine (Week 5–6)

- [ ] Implement per-pair partial credit scoring for Match-the-Pairs (equal weight distribution)
- [ ] Implement configurable scoring for Sequence Assembly (position-based exact slot vs. pairwise relative order)
- [ ] Implement per-gap partial credit for Fill-in-the-Blank
- [ ] Build instant feedback layer: green/correct flash, red/incorrect flash, correct-answer reveal with one-line explanation, bounce-back animation for wrong taps
- [ ] Integrate scoring output with existing 5Mins streak and points system (no new reward UI)

### Phase 4: Admin Authoring UI (Weeks 6–7)

- [ ] Build authoring form for Match-the-Pairs: structured pair entry (term ↔ definition), 3–8 pairs, explanation field per pair
- [ ] Build authoring form for Fill-in-the-Blank: sentence editor with gap markers, word bank entry with distractors, free-type toggle setting
- [ ] Build authoring form for Sequence Assembly: ordered token list entry, scoring mode selector (position vs. pairwise), 3–10 tokens
- [ ] Add scenario text field to existing MCQ authoring form
- [ ] Support mixed-format quiz composition (admin selects format per question within a quiz of 10–15 items)

### Phase 5: Accessibility & Mobile QA (Week 7–8)

- [ ] Manual keyboard-only navigation testing for all new formats (automated tools detect only 30–40% of WCAG 2.2 issues)
- [ ] Screen reader testing (JAWS, NVDA, VoiceOver) — validate `aria-live` announcements for select/place/return actions across all formats
- [ ] WCAG 2.2 AA compliance audit: SC 2.5.7 (Dragging Movements — confirm no drag required), SC 2.5.8 (Target Size — verify ≥ 24 CSS px minimum, ≥ 44 CSS px on mobile)
- [ ] Mobile device testing matrix: small-screen phones (320px width), mid-range, tablets — verify no scroll conflicts, all tap targets reachable
- [ ] Verify selected states use `--selected` amber token, never opacity-only indication

### Phase 6: Pilot & Iteration (Weeks 8–10)

- [ ] Deploy to a pilot cohort of learners (select 2–3 customer accounts across hospitality, finance, healthcare)
- [ ] Instrument quiz engagement analytics: completion rate, time-per-question, format-level drop-off, partial-credit distribution
- [ ] Collect qualitative feedback from pilot learners and admins
- [ ] Iterate on interaction polish, feedback copy, and scoring calibration based on pilot data
- [ ] Prepare for general availability rollout

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data model extension breaks existing MCQ quiz engine** | High — could disrupt current lesson quizzes in production | Engineering spike in Phase 1 to assess migration path; feature-flag new formats; ensure backward compatibility with existing MCQ data |
| **New interactions are not self-explanatory to learners** | Medium — learners confused by unfamiliar formats may abandon quiz | Follow YNAB/BFM principle: make interactions self-explanatory through visual hierarchy and microcopy, not upfront instructions; test with real frontline workers in pilot |
| **Accessibility gaps despite tap-only design** | High — legal risk (European Accessibility Act effective June 2025) and user exclusion | Build from semantic `<button>` elements by construction; manual screen reader and keyboard testing (not just automated); dedicated accessibility QA phase |
| **Quiz formats extend lesson beyond 5 minutes** | Medium — breaks the core microlearning value proposition | Cap at 10–15 items per quiz; time-test during pilot; consider time-limit cues inspired by BFM Queue pattern |
| **Admin authoring complexity increases for new formats** | Medium — admins resist creating matching/sequencing content if it's too complex | Design simple structured forms (pair entry, gap markers); scenario-MCQ is near-free (just a text field); validate with admin usability testing |
| **Partial credit scoring confuses learners or admins** | Low — unfamiliar scoring model may create support queries | Clear in-quiz indication of partial credit ("3 of 4 correct"); admin-facing documentation of scoring logic per format |
| **Free-type fill-in-the-blank has typo/matching edge cases** | Medium — strict matching frustrates learners; loose matching undermines accuracy | Case-insensitive by default; configurable typo tolerance; pilot testing to calibrate strictness per compliance domain |
| **Scope creep toward AI generation, open-ended grading, or categorization** | Medium — delays v1 delivery | Explicitly scoped out in this PRD; data model designed to support future formats without blocking current delivery |