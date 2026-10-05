---
ticket: DES-321
summary: Lesson Quiz formats
status: in Design Phase
generated: 2026-07-20T17:36:38.579Z
---

## Research Dossier

### Web Findings

- **[WCAG 2.5.7 Dragging Movements: 2025 Guide (TestParty)](https://testparty.ai/blog/wcag-2-5-7-dragging-movements-2025-guide)** — WCAG 2.2 SC 2.5.7 (Level AA) requires every drag-based function to be achievable with a single pointer without dragging. Acceptable alternatives include buttons, tap/click actions, menus, and selection controls. For quiz interactions, button-based tap-to-select combined with keyboard shortcuts provides the most accessible pattern; the alternative must be functionally equivalent, reasonably efficient, and discoverable by assistive technology.

- **[Dragging Movements Guide (AccessiCart)](https://accessicart.com/wcag-2-2-aa-sc-2-5-7-dragging-movements/)** — Approximately 15 million Americans have conditions affecting upper limb mobility and cannot perform the precise motor control required for drag-and-drop. WCAG 2.5.7 specifically benefits users with tremors, limited dexterity, cognitive disabilities, and those using head pointers, eye-trackers, or switches. The European Accessibility Act became effective June 2025, making compliance a near-term legal requirement.

- **[15 UI/UX Accessibility Tests for EdTech Apps (Hireplicity)](https://www.hireplicity.com/blog/15-wcag-accessibility-tests-edtech-apps)** — Drag-and-drop interactions in quizzes, card sorting, and matching activities are one of the most critical accessibility test points for education apps. Manual testing remains essential as automated tools detect only 30–40% of WCAG 2.2 EdTech accessibility issues. All drag interactions should have tap-based alternatives tested with keyboard-only navigation.

- **[Duolingo UX Design Breakdown: 12 Patterns (925 Studios)](https://www.925studios.co/blog/duolingo-design-breakdown)** — Duolingo's lesson flow uses progressive difficulty: challenges 1–3 are multiple choice (recognition), 4–7 use word bank tap-to-select (constrained production), 8–11 require typing (full production), and 12–14 mix formats. The word bank interaction is reversible — tap to select, tap again to remove — supporting user control and reducing anxiety. Lessons end with an easier challenge to reinforce positive feelings and drive return.

- **[Duolingo: Gamification as Design Language (Blake Crosley)](https://blakecrosley.com/guides/design/duolingo)** — Duolingo's "play first, profile second" approach means users complete their first lesson and earn XP within 15 minutes before even creating a profile. Streaks leverage loss aversion as the most powerful retention tool. Variable XP rewards create unpredictability that encourages deeper participation.

- **[Beyond Right or Wrong: Partial Credit Scoring (Schneid et al., BJCP 2025)](https://bpspubs.onlinelibrary.wiley.com/doi/10.1002/bcp.70127)** — A study of partial credit scoring on MCQs in a pharmacology course found it improved student performance and created a more encouraging assessment experience. Lower-performing students showed greater score increases than high performers. Nine themes emerged from reflections including recognition of effort, reduced pressure, increased confidence, and motivation to learn from mistakes. The Ottawa Conference consensus criteria recommend assessment results that "motivate all stakeholders to create, enhance, and support education."

- **[Matching Questions: Partial Credit (Blackboard)](https://help.blackboard.com/Learn/Instructor/Ultra/Tests_Pools_Surveys/Question_Types/Matching_Questions)** — Blackboard Ultra enables partial and negative credit for matching questions by default, automatically distributing credit as a percentage across matching pairs. Instructors can edit partial credit values to weight specific pairs. This is the standard LMS precedent for matching-type partial credit scoring.

- **[10 Types of Quizzes — SC Training (formerly EdApp)](https://training.safetyculture.com/blog/types-of-quiz/)** — SC Training, a leading mobile-first microlearning platform for frontline workers, offers matching (Connect/Drag-to-Match templates), fill-in-the-blank (Missing Word/Word Construction), sequencing (Reorder/Select-in-Order), and categorization (drag items into buckets) quiz types. They recommend 10–15 questions per quiz for microlearning and report 80%+ completion rates. Their mobile-first approach closely matches the 5Mins use case.

- **[8 Interactive Quiz Formats for eLearning (eLearning Industry)](https://elearningindustry.com/interactive-quiz-formats-use-elearning-courses-8-types)** — The eight recommended formats are: multiple-choice, match-the-pair, fill-in-the-blanks, open-ended, closed-ended (true/false), sorting/classification, sequencing, and labeling/identification. Match-the-pair uses two adjacent lists; sequencing tests procedural understanding of processes and chronology; sorting/classification organizes items into groups — all of which map directly to the candidate quiz types for this ticket.

- **[Microlearning Question Variety (Qstream)](https://qstream.com/blog/microlearning-question-variety-the-key-to-engaging-training-a-digitally-distracted-workforce/)** — Question variety is the key to engaging a digitally distracted workforce. Retrieval practice — testing learners' knowledge by asking them to recall information from memory — is particularly powerful when used in the days after a training session, supporting the spaced-repetition pattern that 5Mins could layer onto new quiz formats.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Duolingo | Quiz matching pairs — tap to select | [View](https://mobbin.com/screens/36d3bd38-87bc-4f71-ba8e-41217fdf9687) | Match-the-pairs interaction with tap-to-select | Direct reference for the match-the-pairs format; shows Duolingo's tap-based pair matching UI on mobile |
| Duolingo | Matching pairs exercise variant | [View](https://mobbin.com/screens/aac77036-b23b-458e-abff-5b3de9bab287) | Match-the-pairs with visual feedback on selection | Shows how matched pairs are visually indicated and how remaining pairs are presented |
| Duolingo | Matching exercise with progress | [View](https://mobbin.com/screens/3c555090-893d-42b7-b65c-2b50e6e4f23c) | Match-the-pairs mid-exercise state | Demonstrates progress indicator and mid-quiz state for matching exercises |
| Quizlet | Quiz matching/flashcard interaction | [View](https://mobbin.com/screens/454b2935-007b-4b92-bed7-921bad95f397) | Card-based matching quiz | Alternative matching pattern from a study/quiz-focused app |
| Nibble | Learning quiz with tap selection | [View](https://mobbin.com/screens/0babcb70-ec2f-4513-b7e2-e946922b72f1) | Tap-to-select quiz in compliance learning app | Relevant as Nibble targets compliance/financial learning — close to 5Mins persona |
| Duolingo | Fill-in-the-blank with word bank | [View](https://mobbin.com/screens/1b3b4043-e0e6-4da9-9244-15085a82a5f4) | Word bank chips below sentence gap | Core reference for fill-in-the-blank: tappable chips placed into sentence gaps |
| Duolingo | Word bank sentence completion | [View](https://mobbin.com/screens/47ce1499-18da-48e0-a493-d50021486614) | Tap word chips to fill sentence | Shows the chip-in-gap interaction mid-completion with placed and available tokens |
| Duolingo | Word bank with free-type toggle | [View](https://mobbin.com/screens/b899b299-8fd4-4751-8627-bf32671ab570) | Word bank with keyboard input option | Critical reference: shows the toggle between assisted word-bank and free-type recall |
| Duolingo | Sentence completion feedback | [View](https://mobbin.com/screens/ac53016a-c57a-4c9d-9fd3-5ea239d0e2f1) | Fill-in-blank result with correct/incorrect feedback | Shows the instant feedback state after submitting a fill-in-the-blank answer |
| Duolingo | Sentence assembly from shuffled bank | [View](https://mobbin.com/screens/9c1d0c4d-1f22-4930-a59b-80f1ede58526) | Full sentence construction from chips | Direct reference for sequence/sentence assembly format |
| Imprint | Fill-in-the-blank learning interaction | [View](https://mobbin.com/screens/37df75bb-d63f-43a0-9f5e-3d9f3a624463) | Word bank fill-in-blank in knowledge app | Alternative fill-in-blank implementation from a learning-focused app |
| Vocabulary | Word completion quiz | [View](https://mobbin.com/screens/ee92742d-dbac-4963-8afc-63f7cfd1ea41) | Fill-in-blank for vocabulary learning | Shows fill-in-blank applied to vocabulary/terminology recall |
| Duolingo | Sentence ordering / tap to assemble | [View](https://mobbin.com/screens/f677e276-0b54-4f01-9359-08e9c393e039) | Tap chips to order sentence | Core reference for sequence assembly: tap tokens in order to build answer |
| Duolingo | Sentence ordering in progress | [View](https://mobbin.com/screens/0da208dc-9e11-476d-afc9-eac0d5942ba5) | Sequence assembly mid-state | Shows partially assembled sentence with remaining chips in bank |
| Duolingo | Sentence ordering completion | [View](https://mobbin.com/screens/3a9024f6-6ac9-4f50-86f2-712dc504803d) | Completed sequence assembly | Shows fully assembled answer ready for submission |
| Babbel | Word ordering exercise | [View](https://mobbin.com/screens/22c0a95b-e826-4a3f-b82c-ab18906f8c5b) | Tap-to-order sentence construction | Alternative implementation of sequence assembly from Babbel |
| Nibble | Correct answer feedback screen | [View](https://mobbin.com/screens/1b1f087b-bdc1-4550-9f33-164af252aa3b) | Green checkmark instant correct feedback | Shows instant positive feedback with explanation — matches the "reveal correct answer + why" pattern |
| Quizlet | Quiz result feedback | [View](https://mobbin.com/screens/43651d31-049a-4c99-8f4f-d27c71bc9957) | Quiz answer result with correct/incorrect state | Shows answer feedback with correct answer revealed |
| Brilliant | Quiz interaction with feedback | [View](https://mobbin.com/screens/3c5f9cbd-0ee9-4766-9bd4-578c5c297ab9) | Interactive quiz with curiosity-gap pattern | Shows Brilliant's approach to quiz engagement with explanatory feedback |
| Duolingo ABC | Correct answer celebration | [View](https://mobbin.com/screens/453bb899-1900-4d7c-a557-3d784aca5e62) | Celebration animation on correct answer | Shows reward micro-interaction after correct answer — relevant for gamification |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| Time-Limited Onboarding (Queue) | UX Bite | [View](https://builtformars.com/ux-bites/time-limited-onboarding) | Queue limits their matching exercise to 30 seconds, reframing the task as "what can you get done in 30 seconds?" This paradoxically increases interactions: time constraints reduce decision fatigue (learners don't ask "when am I done?"), increase swipes per user, and improve input quality versus open-ended matching. | Directly applicable to keeping quiz interactions within the 5-minute lesson format; a time-bounded matching exercise prevents the interaction from dragging on and maintains microlearning pacing. |
| Mobbin's 404 Quiz | UX Bite | [View](https://builtformars.com/ux-bites/mobbins-404-quiz) | Mobbin turned their 404 error page into an interactive quiz, demonstrating that gamification and play can transform even negative moments into engagement opportunities. The quiz functions as "an in-joke" for their design community, leveraging tribalism and shared understanding. | Validates the principle that quiz mechanics create engagement through play rather than passive consumption; supports the case for varied quiz formats as engagement drivers rather than assessment tools. |
| Onboarding Proof of Value (Arc) | UX Bite | [View](https://builtformars.com/ux-bites/onboarding-proof-of-value) | Interactive demonstrations outperform passive instruction: "A video, or a text callout wouldn't work nearly as well." When users actively interact with a feature (versus reading about it), they discover value themselves, creating stronger conviction through curiosity-driven "Aha! Moments." | Reinforces the ticket's core thesis: active quiz formats (matching, fill-in-blank, sequencing) will outperform passive MCQ because learners who *do* something retain better than those who merely *select*. |
| How to Stop People Skipping Your Onboarding (YNAB) | Case Study | [View](https://builtformars.com/case-studies/ynab) | Three common onboarding techniques fail because they don't cater to user intent. Making onboarding feel optional rather than mandatory — letting users engage with features directly while providing contextual guidance — produces better retention than blocking access behind required tutorials. | Relevant to quiz format introduction: new quiz types should be introduced contextually within the lesson flow rather than requiring learners to read instructions upfront; the interaction should be self-explanatory through visual hierarchy and microcopy. |
| Learn UX Design from Duolingo | Company Page | [View](https://builtformars.com/company/duolingo) | Built for Mars's Duolingo library covers engagement mechanics, habit formation, gamification (streaks, rewards, progress), and mobile UX optimization. Specific observations: nudging friends in a single tap acts as a retention hook; early-day streak extensions trigger competitive "how well you did" messaging; breaking daily records provides motivation shots. | Validates Duolingo as the primary UX benchmark for this initiative; confirms the gamification patterns (streak/points) that 5Mins should integrate with new quiz completion rather than building parallel reward systems. |

### Confidence Check

- `web_searches_performed`: 6
- `mobbin_searches_performed`: 4
- `bfm_lookups_performed`: 5 (5 Built for Mars pages fetched via WebFetch — the BFM MCP server tools `bfm_find_content` / `bfm_analyze_lessons` were not available, so I fell back to WebSearch `site:builtformars.com` + WebFetch on resulting article URLs as instructed)
- `authoritative_sources_fetched`: 4 (TestParty WCAG 2.5.7 guide, 925 Studios Duolingo design breakdown, eLearning Industry quiz formats, SC Training quiz types)
- `all_urls_verified`: yes