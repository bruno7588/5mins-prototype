---
ticket: DES-279
summary: AI Generation of assessments and Situational tests
status: in Design Phase
generated: 2026-08-18T18:33:18.346Z
---

## Research Dossier

### Web Findings

- **[D2L — AI LMS Platforms Compared](https://www.d2l.com/blog/ai-lms/)** — D2L Lumi (powered by Anthropic's Claude) offers 14+ AI capabilities including assessment generation aligned to Bloom's Taxonomy levels and specific learning outcomes. Shows the state-of-the-art: AI quiz questions are generated from course content, not arbitrary prompts.

- **[AI-Generated MCQs in Health Science Education (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12340502/)** — Research shows ~57% of AI-generated questions are directly usable, 31% require minor edits. Key pitfalls include hallucinations, poor distractors, and misalignment with learning objectives. Recommends grounding questions in specific course material (RAG-style), mandatory human review, and starting with low-stakes formative assessments before scaling.

- **[Coursiv — AI for Course Creation: Tools, Workflow, and Pitfalls](https://coursiv.io/blog/ai-for-course-creation)** — Critical insight: "Approve structure first—fixing the outline takes minutes; fixing forty lessons built on a bad outline takes days." Treat AI facts as claims to check, replace generic examples with learner-relevant ones, and design assessments backwards from desired competence. Separating AI lesson generation from quiz generation lets admins accept one and redo the other independently.

- **[Koru UX — AI Patterns for UI Design](https://www.koruux.com/ai-patterns-for-ui-design/)** — Defines six key AI UX patterns: (1) Refine Output via contextual menus (regenerate, adjust), (2) Human Verified vs. AI-Generated badges/indicators, (3) Explainability Layers for trust, (4) User-Driven Training via thumbs up/down, (5) Error Recovery with undo/redo, (6) Data Privacy Controls. Anti-pattern: treating AI output as final with no revision path.

- **[NN/g — The AI Paradigm: Intent-Based Outcome Specification](https://www.nngroup.com/articles/ai-paradigm/)** — AI represents an intent-based paradigm where users specify *what* they want, not *how*. Critical gaps: iterative refinement is poorly supported in most tools today; users struggle to identify errors when they don't see how something was produced. Recommends hybrid UIs combining intent-based generation with GUI controls.

- **[UX Studio — AI Design Patterns in SaaS Products](https://www.uxstudioteam.com/ux-blog/ai-design-patterns-in-saas-products)** — Six patterns directly relevant: (1) Drafting & Versioning—present AI drafts, not blank slates, with side-by-side comparisons; (2) Status Indicators—layered workflow states (processing → draft ready → pending review) reduce mystery; (3) Review Interfaces—show AI output alongside source material with inline accept/reject; (4) Source Citations—link generated content back to originals; (5) Transparency Labeling; (6) Confidence/Reasoning displays.

- **[Eleken — Bulk Action UX: 8 Design Guidelines for SaaS](https://www.eleken.co/blog-posts/bulk-actions-ux)** — For bulk delete/approve: use visible checkboxes (24×24px min), show action buttons only after selection, implement explicit confirmation for destructive actions, display per-item failure reasons, and offer undo via toast notifications. Validate that bulk actions solve the real problem through multiple testing loops.

- **[eLearning Industry — 8 Types of Interactive Quiz Formats](https://elearningindustry.com/interactive-quiz-formats-use-elearning-courses-8-types)** — Covers all assessment types from the ticket (matching pairs, sequencing, categorization, fill-in-the-blank). Key UX guidelines: keep matching pairs at 5–10 items, limit drag-and-drop options to 8–12, apply fill-in-the-blanks only for unambiguous answers, and use scenario-based formats for real-world decision-making (situational tests).

- **[LearnExperts — Assessment Questions: How to Choose the Right Ones](https://learnexperts.ai/blog/choose-right-assessment-questions/)** — Emphasizes choosing question types based on the cognitive level being assessed—recognition (MCQ), recall (fill-in-blank), application (scenario/situational). Formative vs. summative distinction matters for how generated assessments should be positioned.

- **[MindStudio — Build AI-Powered Quizzes](https://www.mindstudio.ai/blog/build-ai-powered-quizzes-embed-course-site)** — A major pitfall of standalone AI quiz generators: they create disconnected assessments requiring copy-paste into the LMS. The ticket's approach of placing assessments directly on the course outline avoids this friction.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Kajabi | Adding & Creating | [View](https://mobbin.com/screens/590e1f98-c267-4f49-8ef9-b75f6fdfb7eb) | Quiz/assessment creation builder | Direct competitor—shows how a course platform structures assessment creation with type selection |
| Teachable | Adding & Creating | [View](https://mobbin.com/screens/cceee5f1-d73d-4a4f-beff-b0216b0e3c43) | Assessment builder with button/selection UI | Competitor LMS showing question type picker and creation flow |
| Podia | Adding & Creating | [View](https://mobbin.com/screens/583946a2-c81d-497b-ab3e-a2392cfe09d9) | Quiz builder interface | Shows simplified quiz creation for course creators |
| Typeform | Adding & Creating | [View](https://mobbin.com/screens/6b5e3fe0-ef03-4e96-be0f-08fea3d389b3) | Form/quiz builder with question type selection | Industry-standard pattern for multi-type question creation |
| Profound | Editing & Updating | [View](https://mobbin.com/screens/638c29ce-7d28-4b12-9073-6471955fc595) | AI content generation/review workflow | Shows AI-powered content editing with review interface |
| Gamma | Adding & Creating / Giving Feedback | [View](https://mobbin.com/screens/f8e0eb77-a765-421d-b097-7a1fc2642d07) | AI content generation with creation and feedback flows | AI-first presentation tool—relevant pattern for AI-generated content review |
| Intercom | AI workflow | [View](https://mobbin.com/screens/2936e253-f777-4863-93f3-674f3f10c56d) | AI content generation and approval | Shows how a major SaaS handles AI-generated content with approval workflow |
| Customer.io | AI review workflow | [View](https://mobbin.com/screens/1f8d2a0c-34a9-46d1-b3a7-0856ffae3e14) | AI generation with progress/review | AI-assisted content with review step pattern |
| Front | Empty state with CTA | [View](https://mobbin.com/screens/81a5ce8a-98c9-4903-8c3a-f2d24804044e) | Explanatory empty state | Empty state explaining why content is unavailable with clear next-step CTA |
| ClickUp | Empty state with CTA | [View](https://mobbin.com/screens/3f3c2432-3db0-4cfc-b469-2a088d38dde5) | Actionable empty state | Empty state with explanation and action buttons—reference for "zero transcripts" state |
| Podia | Empty state | [View](https://mobbin.com/screens/f6e387ee-1e3b-4c00-994e-42b021ac46c2) | Educational empty state | Shows how a course platform handles empty content states |
| Teachable | Course outline editor | [View](https://mobbin.com/screens/bb9c7f08-242e-44bc-bc34-707a6636dcb1) | Structured content list with lessons | Direct reference for placing generated assessments on course outline |
| Podia | Course outline editor | [View](https://mobbin.com/screens/436d5ceb-e5d1-4376-9d7e-a744388a09cf) | Course structure with sections/lessons | How a competitor structures course content where assessments would be placed |
| Whop | Content structure editor | [View](https://mobbin.com/screens/7814c49a-11a9-4124-a9aa-012b2e232fa8) | Structured content list | Course/content outline with drag-and-drop ordering |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|-------|------|-----|--------|-----------|
| A better empty state (Starling) | UX Bite | [View](https://builtformars.com/ux-bites/a-better-empty-state) | When Starling's AI search returns nothing, it opens onboarding listing what the search *can* and *can't* do yet — the dead end becomes a lesson in the AI's boundaries. | The zero-transcript empty state should teach what the generator works from and what it can't do yet, not just report that generation is unavailable. |
| Delete and redraft (Truth Social / TikTok) | UX Bite | [View](https://builtformars.com/ux-bites/delete-and-redraft) | Deleting a post offers "Delete & re-draft" rather than forcing a start from scratch. BFM's note: it makes deleting *way* less punishing when the content took effort to produce. | Strongest argument for a per-assessment "Delete & regenerate" alongside plain delete — the admin discards one weak question without losing the rest of the set. |
| Linear's "undo" warnings | UX Bite | [View](https://builtformars.com/ux-bites/linears-undo-warnings) | Linear only interrupts an undo when it's genuinely risky — action older than 10 minutes, or triggered from a different page. Recent, in-context undos stay frictionless. | Confirm the full-set regenerate (high loss), but don't put a modal in front of deleting a single generated assessment — an undo toast is enough. |
| Focusing your attention on deleted items (T-Mobile) | UX Bite | [View](https://builtformars.com/ux-bites/focusing-your-attention-on-deleted-items) | T-Mobile inverts focus on delete — everything else goes translucent and the doomed items are highlighted, forcing attention on what's about to be discarded forever. | Apply to "Regenerate all": dim the outline and highlight the AI-generated assessments about to be replaced, so the blast radius is visible before confirming. |
| Contextualising your wait (Icons8) | UX Bite | [View](https://builtformars.com/ux-bites/contextualising-your-wait) | While AI generates an image, Icons8 counts *up* rather than down — because it can't know the duration, and counting up proves the process isn't stuck. | Generation time varies with transcript length. Show lesson-by-lesson progress and elapsed time rather than a fabricated percentage or ETA. |
| The UX Psychology of Waiting (and Loading) | Cheatsheet | [View](https://builtformars.com/cheatsheets/loading) | Variability shortens a perceived wait — give people something to read. Goodreads rotates themed quotes while loading. | The generation wait is a place to show which lesson is being read right now, rather than an undifferentiated spinner. |
| Turning waiting into learning (PostHog) | UX Bite | [View](https://builtformars.com/ux-bites/turning-waiting-into-learning) | When a query is slow, PostHog uses the wait to teach you how to make it faster — progressive onboarding at exactly the moment it's relevant. | During generation, tell the admin that adding transcripts to the remaining lessons widens coverage next time — the one moment they care. |

### Confidence Check
- `web_searches_performed`: 7
- `mobbin_searches_performed`: 4
- `bfm_lookups_performed`: 6 (4 `bfm_find_content` searches + 2 `bfm_analyze_lessons` syntheses over 7 retrieved sources, via the Built for Mars MCP server — re-run 2026-08-18 after the connector was authenticated, replacing the earlier web-fallback rows)
- `authoritative_sources_fetched`: 5 (NN/g AI Paradigm article, Koru UX AI Patterns, PMC/NIH study on AI-generated MCQs, Eleken Bulk Actions UX, UX Studio AI Design Patterns)
- `all_urls_verified`: yes