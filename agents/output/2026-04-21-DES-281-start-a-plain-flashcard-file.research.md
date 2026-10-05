---
ticket: DES-281
summary: Start a plain flashcard file
status: in Design Phase
generated: 2026-04-21T12:04:12.464Z
---

## Research Dossier

### Web Findings

- **[SafetyCulture Lesson Creation Docs](https://help.safetyculture.com/en-US/003467/)** — SafetyCulture offers three explicit creation paths: AI-assisted, document conversion (PPT/PDF/DOCX), and a "Create blank" option to "start from scratch and tailor your course to your needs." Changes autosave automatically, and draft courses stay unpublished until explicitly released — a key difference from the 5Mins ticket which requires explicit save.

- **[SafetyCulture Slide Library](https://help.safetyculture.com/en-US/003994/)** — The slide library acts as a centralized building-block catalog with Teach slides (text, image, file, video), Quiz slides (multiple choice, match, words), Engage slides (games, feedback), and advanced options (SCORM, URL embed, slide import). The library does not document pre-filled placeholder content on blank slides, suggesting SafetyCulture relies on structural templates rather than seeded starter copy.

- **[SC Training — How to Create Effective Microlearning Courses](https://training.safetyculture.com/blog/how-to-create-effective-microlearning-courses/)** — SC Training follows a five-step flow: select platform → choose topic → add content via templates → incorporate interactive elements → deliver. Their "Create with AI" generates fully populated courses automatically, while template-first authoring provides structured formats (text sequences, galleries, games) that break content into manageable pieces. This dual-path (AI vs. template) pattern directly mirrors the proposed 5Mins choice screen.

- **[SafetyCulture vs Competitors — Microlearning Platforms](https://safetyculture.com/apps/microlearning-platform)** — Among 10+ competitors (Axonify, Cornerstone, Elucidat, 7taps, GoSkills, isEazy), SafetyCulture differentiates with 80+ interactive templates and a "you never start with a blank page" philosophy. Elucidat and isEazy also offer template-driven creation. The consistent industry pattern is that a blank canvas is avoided in favor of pre-committed structure the user overwrites — validating the ticket's "template-first authoring" design principle.

- **[NN/g — Modal & Nonmodal Dialogs: When (& When Not) to Use Them](https://www.nngroup.com/articles/modal-nonmodal-dialog/)** — Modals are appropriate when (1) the decision has critical consequences, (2) required information blocks progress, or (3) the decision is task-relevant and streamlines the current flow. The ticket's binary choice (blank vs. AI) fits use case #3. NN/g warns that modals "interrupt workflow" and users "forget what they were doing" — keeping the modal lightweight (two clear options + close/X) minimizes this cost. On mobile, nonmodal dialogs often become modal anyway, reinforcing the modal choice for responsive design.

- **[LogRocket — Modal UX Design Patterns, Examples & Best Practices](https://blog.logrocket.com/ux-design/modal-ux-design-patterns-examples-best-practices/)** — For two-option decision modals: use clear, descriptive-but-concise titles with instructional subtitles; provide multiple dismissal paths (X button, Escape key, click-outside); avoid nested modals; ensure ARIA labels (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`). On mobile, implement proper scaling, pagination for multi-step flows, and autosave where applicable. Focus management must trap focus inside the modal and return it to the trigger on close.

- **[Mobbin — Empty State UI Design](https://mobbin.com/glossary/empty-state)** — Mobbin's glossary defines empty states as screens with no user content that should never feel literally empty. Best practice: provide a headline, supporting description, relevant visual, and a clear CTA. This maps directly to the seeded flashcard pattern — the 3 starter cards with placeholder copy function as a "guided empty state" that avoids the blank-canvas problem.

- **[Material Design — Empty States](https://m2.material.io/design/communication/empty-states.html)** — Material Design recommends that empty states display informative content helping users understand what the screen is for and what action to take next. The guidance to provide context and a clear next step supports the ticket's approach of pre-filling 3 cards with instructional placeholder text rather than showing an empty editor.

- **[Eleken — Empty State UX Examples & Rules](https://www.eleken.co/blog-posts/empty-state-ux)** — Avoid lazy placeholders like "No data" — instead, explain why the state is empty and what users can do. Placeholder text should demonstrate intent (e.g., "Your card title goes here" is better than "Title"). Every empty state should answer "What should the user do now?" — validating the ticket's three-card seeded approach where each card's placeholder copy models the expected behavior.

- **[Canva Web — Generating a Video Flow (Mobbin)](https://mobbin.com/explore/flows/3fd996d1-165e-4db4-bc30-13d0c16287be)** — Canva's 8-screen AI video generation flow follows a select → describe → generate → review pattern. The "edit-after-generate" workflow parallels the AI Transformer path in the ticket. Canva minimizes decision points during the AI flow, suggesting the AI Transformer option in 5Mins should similarly remain a direct, low-friction path.

- **[Canva Web — Onboarding Flow (Mobbin)](https://mobbin.com/explore/flows/11b3ca8d-85da-45e2-bea3-43f7a173eb8a)** — Canva's 19-screen onboarding uses progressive disclosure and goal-based personalization before presenting creation options. The pattern of understanding user intent before branching into creation paths supports the ticket's approach of presenting the choice screen (blank vs. AI) as a quick intent-capture step.

- **[Dropbox Paper — Document Editor Screen (Mobbin)](https://mobbin.com/explore/screens/e49f5f2b-8b12-4ae3-b0fe-e50ac4ff5737)** — Dropbox Paper's blank editor uses placeholder text and an image as scaffolding, following a common blank-state pattern where initial guidance text orients new users. The accordion UI element suggests collapsible sections for managing document structure — relevant to how flashcard editors might organize multiple cards.

- **[Brainscape — Flashcard Organization Best Practices](https://brainscape.zendesk.com/hc/en-us/articles/115002369891-What-are-some-guidelines-for-creating-great-flashcards-and-organizing-my-content-the-right-way)** — Divide complex topics into discrete sub-topics (decks) aligned to lessons/chapters. Clear, explicit naming provides context and simplifies UX. This supports the ticket's "Untitled flashcard lesson" placeholder — the name field should be prominent and easy to fill to encourage good naming practices.

### Mobbin UX References

| App | Flow / Screen | URL | Pattern | Relevance |
|-----|--------------|-----|---------|-----------|
| Canva Web | Generating a Video (8 screens) | [Link](https://mobbin.com/explore/flows/3fd996d1-165e-4db4-bc30-13d0c16287be) | AI-powered content generation with select → describe → generate → review flow | Parallels the AI Transformer path; validates keeping AI flow as a direct, low-decision-point experience |
| Canva Web | Onboarding (19 screens) | [Link](https://mobbin.com/explore/flows/11b3ca8d-85da-45e2-bea3-43f7a173eb8a) | Progressive disclosure with goal-based personalization before creation | Supports intent-capture step (choice modal) before branching into creation paths |
| Dropbox Paper Web | Document Editor with Placeholder | [Link](https://mobbin.com/explore/screens/e49f5f2b-8b12-4ae3-b0fe-e50ac4ff5737) | Blank editor with placeholder text and image scaffolding | Directly relevant to seeded flashcard editor — demonstrates placeholder-as-guidance pattern in content editors |

**Note:** Mobbin's content is rendered dynamically via JavaScript and largely behind authentication. The flows above were fetchable at a metadata/summary level but full screen-by-screen details require direct browser access to Mobbin. Category/explore pages (e.g., `/explore/web/flows/adding-creating`) were excluded per the dossier rules. Additional relevant apps on Mobbin that could not be fully fetched include: Slite Web (220 flows including "Browse templates" and "Creating a template"), Dovetail Web ("Choosing a template" — 7 screens), and Jasper Web ("Using a template" — 2 screens).

### Confidence Check

- `web_searches_performed`: 10
- `mobbin_flows_fetched`: 3 (Canva Generating a Video, Canva Onboarding, Dropbox Paper Editor — all specific flow/screen URLs, not category pages; however, content extracted was at summary/metadata level due to Mobbin's dynamic rendering)
- `authoritative_sources_fetched`: 2 (NN/g Modal & Nonmodal Dialogs article, LogRocket Modal UX Best Practices)
- `all_urls_verified`: yes — every URL in this dossier was returned by a WebSearch result or successfully fetched via WebFetch during this session. No URLs were fabricated.

**Limitation noted:** Mobbin pages are heavily JavaScript-rendered single-page applications. WebFetch could extract metadata, flow descriptions, and screen counts but not individual screen screenshots or detailed step-by-step UI breakdowns. For full visual reference, the design team should browse the linked Mobbin pages directly in a browser. The Slite "Browse templates" (7 screens) and Dovetail "Choosing a template" (7 screens) flows are particularly worth examining for the choice-screen pattern but could not be fetched at the individual flow URL level.