---
ticket: DES-281
summary: Start a plain flashcard file
status: in Design Phase
generated: 2026-04-21T12:04:12.464Z
---



# PRD: Start a Plain Flashcard File

## 1. Overview

This ticket introduces a **"Create Empty Flashcards"** path into the 5Mins content creation flow, allowing Admins to start building flashcard lessons from scratch without needing to upload source material or use the AI Transformer. Today, the only entry point for flashcard creation forces Admins through the AI Transformer modal — requiring prepared source content. This creates unnecessary friction for Admins who have knowledge in their heads but no document to transform.

The change is surgically scoped: only the first card on the "Upload content" page is affected. It will be renamed from "AI Transformer" to "Create flashcards" and will present a binary choice modal — **Create Empty Flashcards** (opening a seeded editor with 3 starter cards) or **AI Transformer** (preserving the existing flow unchanged). All other upload cards (video, audio, document, external link) remain as-is.

This aligns with an established industry pattern — competitors like SafetyCulture, Elucidat, and isEazy all offer template-first or blank-creation paths alongside AI generation, operating on the principle that users should never face a truly blank canvas.

---

## 2. Jobs To Be Done

### Main Job

**When I have knowledge in my head that I want to turn into a flashcard lesson, I want to start writing cards immediately in a structured editor, so I can produce learning content without first preparing a separate source document.**

### Job Map

| Stage | What the Admin Does | Current Experience | Pain / Workaround |
|-------|--------------------|--------------------|-------------------|
| **Define** | Decides they want to create a flashcard lesson | Clear intent exists | No issue |
| **Locate** | Finds the creation entry point on the Upload content page | Sees "AI Transformer" as the only flashcard option | Misleading — implies source material is required |
| **Prepare** | Gathers or organizes source material | Must have a document/URL ready for the AI Transformer | **Blocker**: Admins with head-knowledge but no document are stopped here. Workaround: create a throwaway document, paste notes, then upload — unnecessary friction |
| **Confirm** | Chooses their creation method | No choice — AI Transformer is the only path | Cannot opt for manual authoring |
| **Execute** | Writes flashcard content in the editor | Editor works well once reached | The problem is *getting there*, not the editor itself |
| **Monitor** | Reviews and refines cards | Existing editor tools (toolbar, themes, pagination) | No issue — all preserved |
| **Resolve** | Saves and publishes the lesson | Explicit save flow | No issue — explicit save is maintained |

### Related Jobs

- **Iterating on AI-generated content**: Some Admins may start with AI Transformer output and then manually adjust. This feature doesn't change that flow but offers an alternative starting point.
- **Organizing lessons by topic**: The "Untitled flashcard lesson" placeholder nudges Admins to name their lessons, supporting content organization.
- **Onboarding new Admins to the platform**: A blank-template path lowers the barrier to first content creation — Admins don't need to understand AI features to get started.

### Emotional & Social Dimensions

- **Functional**: "I need to get flashcard content out of my head and into the platform quickly."
- **Emotional**: "I want to feel in control of my content — not forced into an AI workflow I didn't ask for." / "I don't want to feel like I need to prepare before I can create."
- **Social**: "I want my team to see me as someone who produces quality training content efficiently, regardless of whether I use AI."

---

## 3. Goals

1. **Unblock manual authoring**: Admins can create flashcard lessons without source material, eliminating the document-preparation workaround.
2. **Preserve existing flows**: The AI Transformer path remains fully intact and unchanged — zero regression.
3. **Guide, don't overwhelm**: The 3 seeded starter cards with placeholder copy provide structure without imposing a blank-canvas problem.
4. **Responsive experience**: The choice modal works seamlessly on both desktop and mobile web.
5. **Minimal surface area**: Only the first card on the Upload content page changes. No other content types, editor features, or platform flows are affected.

---

## 4. Job Stories

### Content Creation Entry

- **When** I'm on the Upload content page and I want to create flashcards, **I want to** see a clear option that doesn't assume I have source material, **so I can** choose the creation method that matches my situation.

- **When** I click the "Create flashcards" card, **I want to** quickly choose between starting from scratch or using AI, **so I can** get into the editor with minimal delay and decision fatigue.

### Blank Template Authoring

- **When** I choose "Create Empty Flashcards," **I want to** land in an editor pre-seeded with a few starter cards showing me the expected structure, **so I can** immediately understand the format and start writing without guessing.

- **When** I see placeholder text in a card field, **I want to** tap into it and have the placeholder disappear, **so I can** type my own content without manually selecting and deleting text.

- **When** I open the editor with seeded cards but navigate away without saving, **I want** nothing to persist in my lesson list, **so I** don't accumulate empty drafts I have to clean up later.

### AI Transformer Continuity

- **When** I choose "AI Transformer" from the choice modal, **I want to** land in the exact same Transform Your Content modal I've always used, **so I can** continue my established workflow without relearning anything.

### Mobile Experience

- **When** I'm creating flashcards on my phone, **I want** the choice modal and editor to be fully usable on a small screen, **so I can** author content on the go without switching to a desktop.

---

## 5. Requirements

### Functional Requirements

#### FR1: Upload Content Card Rename
- The first card on the Upload content page must display:
  - **Title**: "Create flashcards" (replacing "AI Transformer")
  - **Description**: "Start from a blank template or transform existing content with AI."
- All other cards (video, audio, document, external link) remain unchanged.

#### FR2: Choice Modal
- Clicking the "Create flashcards" card opens a **modal dialog** (not a new page) overlaying the Upload content page.
- The modal presents exactly two options:
  - **"Create Empty Flashcards"** — opens the flashcard editor with seeded cards.
  - **"AI Transformer"** — opens the existing Transform Your Content modal with no behavioral changes.
- Dismissal paths: X button, Escape key, and click-outside must all close the modal and return the Admin to the Upload content page.
- Focus must be trapped inside the modal while open (ARIA `role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
- On close, focus returns to the "Create flashcards" card trigger.

#### FR3: AI Transformer Path Preserved
- Selecting "AI Transformer" from the choice modal must open the existing Transform Your Content modal with **zero** behavioral changes.
- No nested modals: the choice modal should close/transition before the Transform Your Content modal opens.

#### FR4: Seeded Flashcard Editor State
- Selecting "Create Empty Flashcards" opens the flashcard editor with:
  - **3 pre-filled cards** using placeholder copy:
    - Card 1 — Title: "Your card title goes here" / Text: "Add the main content for this card"
    - Card 2 — Title: "Give your next card a title" / Text: "Describe the key idea in a sentence or two"
    - Card 3 — Title: "Keep building your lesson" / Text: "Add another idea, fact, or example"
  - **Lesson name field**: empty, with placeholder "Untitled flashcard lesson"
  - **Default theme** applied to all 3 cards.
  - **No images** on seeded cards (out of scope).
- Final placeholder copy to be confirmed against the Figma file: `https://www.figma.com/design/Ea9mRoH83x2p1aAwJZnHip/AI-Transformer?node-id=4454-15775&t=5Dwf9WCzZ0cMNvPM-4`

#### FR5: Placeholder Behavior
- All placeholder text behaves as **true HTML placeholder text**:
  - Displayed in a visually distinct style (e.g., grey/muted).
  - Disappears on field focus/tap.
  - Reappears if the Admin clears the field content and leaves the field empty.
- Placeholder-only cards are treated as "empty" — they do not constitute saved content.

#### FR6: Explicit Save (No Autosave)
- No lesson entity is created or persisted until the Admin explicitly taps **Save**.
- If the Admin navigates away before saving, nothing is persisted in the lesson list. On return to the creation flow, the Admin starts fresh.
- This differs from SafetyCulture's autosave approach and is an intentional design decision for 5Mins.

#### FR7: Existing Editor Behavior Preserved
- All existing flashcard editor features must work identically with seeded cards:
  - Per-card toolbar (edit, image, add, duplicate, delete)
  - Pagination between cards
  - Rich text formatting
  - Edit Theme
  - Update Lesson / Save

#### FR8: Responsive Design
- The choice modal must be fully functional on **mobile web** alongside desktop.
- On mobile, the modal should scale appropriately (potentially full-screen or bottom-sheet pattern) while maintaining the two-option layout and all dismissal paths.

#### FR9: Access Control
- This feature is available to the **Admin role only**. No additional roles are in scope.

---

## 6. Research & Best Practices

### Competitor Patterns: Template-First Authoring

SafetyCulture provides the closest competitive reference. Their lesson creation flow offers three explicit paths: AI-assisted generation, document conversion (PPT/PDF/DOCX), and a **"Create blank"** option to "start from scratch and tailor your course to your needs" ([SafetyCulture Lesson Creation Docs](https://help.safetyculture.com/en-US/003467/)). Their slide library further supports this with a catalog of structural building blocks — Teach slides (text, image, file, video), Quiz slides, Engage slides, and advanced options — though notably, **the library does not document pre-filled placeholder content on blank slides**, suggesting SafetyCulture relies on structural templates rather than seeded starter copy ([SafetyCulture Slide Library](https://help.safetyculture.com/en-US/003994/)).

A broader industry analysis reveals that among 10+ microlearning competitors (Axonify, Cornerstone, Elucidat, 7taps, GoSkills, isEazy), the consistent pattern is that **a blank canvas is avoided in favor of pre-committed structure the user overwrites**. SafetyCulture differentiates with 80+ interactive templates and a "you never start with a blank page" philosophy. Elucidat and isEazy also offer template-driven creation ([SafetyCulture vs Competitors](https://safetyculture.com/apps/microlearning-platform)). The 5Mins approach of seeding 3 placeholder cards directly inherits this principle.

SC Training's five-step creation flow — select platform → choose topic → add content via templates → incorporate interactive elements → deliver — shows how the dual-path pattern (AI generation vs. template-first authoring) functions in practice. Their "Create with AI" generates fully populated courses automatically, while template-first authoring provides structured formats that break content into manageable pieces. This **directly mirrors the proposed 5Mins choice screen** ([SC Training — Effective Microlearning Courses](https://training.safetyculture.com/blog/how-to-create-effective-microlearning-courses/)).

A key design divergence: SafetyCulture's changes **autosave automatically** and draft courses stay unpublished until explicitly released ([SafetyCulture Lesson Creation Docs](https://help.safetyculture.com/en-US/003467/)). The 5Mins ticket intentionally requires **explicit save**, meaning the system must handle the "navigate away before saving" case by discarding unsaved seeded content entirely.

### Modal UX Best Practices

The choice of a modal for the two-option picker is well-supported by UX research. NN/g identifies that modals are appropriate when the decision is **task-relevant and streamlines the current flow** — fitting use case #3 in their framework. They warn that modals "interrupt workflow" and users may "forget what they were doing," but keeping the modal **lightweight (two clear options + close/X)** minimizes this cost. On mobile, NN/g notes that nonmodal dialogs often become modal anyway, further reinforcing the modal choice for responsive design ([NN/g — Modal & Nonmodal Dialogs](https://www.nngroup.com/articles/modal-nonmodal-dialog/)).

LogRocket's modal best practices specify: use **clear, descriptive-but-concise titles** with instructional subtitles; provide **multiple dismissal paths** (X button, Escape key, click-outside); avoid nested modals; and ensure ARIA labels (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`). On mobile, proper scaling and focus management are critical — **focus must be trapped inside the modal and returned to the trigger on close** ([LogRocket — Modal UX Best Practices](https://blog.logrocket.com/ux-design/modal-ux-design-patterns-examples-best-practices/)). The FR2 requirements above directly encode these practices.

### Empty State & Placeholder Design

The seeded flashcard approach is validated by multiple empty-state design references. Mobbin's glossary defines empty states as screens with no user content that **should never feel literally empty** — best practice calls for a headline, supporting description, relevant visual, and a clear CTA. The 3 starter cards with placeholder copy function as a **"guided empty state"** that avoids the blank-canvas problem ([Mobbin — Empty State UI Design](https://mobbin.com/glossary/empty-state)).

Material Design recommends that empty states **display informative content helping users understand what the screen is for and what action to take next** — supporting the pre-filling of cards with instructional placeholder text rather than showing an empty editor ([Material Design — Empty States](https://m2.material.io/design/communication/empty-states.html)). Eleken's analysis warns against lazy placeholders like "No data," recommending that **placeholder text should demonstrate intent** (e.g., "Your card title goes here" is better than "Title") and that every empty state should answer "What should the user do now?" — validating the ticket's differentiated placeholder copy across three cards ([Eleken — Empty State UX](https://www.eleken.co/blog-posts/empty-state-ux)).

Dropbox Paper's blank editor demonstrates a similar pattern in production: **placeholder text and image scaffolding** orient new users in a content editor, with initial guidance text that disappears on interaction ([Dropbox Paper — Mobbin](https://mobbin.com/explore/screens/e49f5f2b-8b12-4ae3-b0fe-e50ac4ff5737)).

### Flashcard Organization

Brainscape's guidelines recommend dividing complex topics into discrete sub-topics aligned to lessons/chapters, with **clear, explicit naming** for context and simpler UX. This supports making the "Untitled flashcard lesson" name field **prominent and easy to fill** to encourage good naming practices from the start ([Brainscape — Flashcard Organization](https://brainscape.zendesk.com/hc/en-us/articles/115002369891-What-are-some-guidelines-for-creating-great-flashcards-and-organizing-my-content-the-right-way)).

### UX References

| App | Flow / Screen | Mobbin URL | Pattern Description | Relevance |
|-----|--------------|------------|---------------------|-----------|
| Canva Web | Generating a Video (8 screens) | [Link](https://mobbin.com/explore/flows/3fd996d1-165e-4db4-bc30-13d0c16287be) | AI-powered content generation with select → describe → generate → review flow | Parallels the AI Transformer path; validates keeping the AI flow as a direct, low-decision-point experience |
| Canva Web | Onboarding (19 screens) | [Link](https://mobbin.com/explore/flows/11b3ca8d-85da-45e2-bea3-43f7a173eb8a) | Progressive disclosure with goal-based personalization before creation options | Supports the intent-capture step (choice modal) before branching into creation paths |
| Dropbox Paper Web | Document Editor with Placeholder | [Link](https://mobbin.com/explore/screens/e49f5f2b-8b12-4ae3-b0fe-e50ac4ff5737) | Blank editor with placeholder text and image scaffolding | Directly relevant to seeded flashcard editor — demonstrates placeholder-as-guidance pattern in content editors |

*Note: Slite Web ("Browse templates," 7 screens) and Dovetail Web ("Choosing a template," 7 screens) are worth examining directly in Mobbin for additional choice-screen pattern references but could not be fully fetched during research.*

---

## 7. Plan of Action

### Phase 1: Design Finalization & Alignment
- [ ] Confirm final placeholder copy against the Figma file (`AI-Transformer?node-id=4454-15775`) — ensure card titles, card text, and lesson name placeholder are signed off.
- [ ] Design the choice modal for desktop and mobile web — include layout, spacing, typography, icon/illustration for each option, and all dismissal affordances (X, Escape, click-outside).
- [ ] Define the mobile-responsive behavior of the choice modal (e.g., bottom-sheet vs. centered modal vs. full-screen on small viewports).
- [ ] Review accessibility requirements: ARIA attributes, focus trap, keyboard navigation, screen reader announcements for the modal.
- [ ] Conduct a brief design review with engineering to confirm feasibility and identify any technical constraints.

### Phase 2: Upload Content Page Changes
- [ ] Update the first card's title from "AI Transformer" to "Create flashcards."
- [ ] Update the first card's description to "Start from a blank template or transform existing content with AI."
- [ ] Update the click handler to open the choice modal instead of directly launching the Transform Your Content modal.
- [ ] Verify no regressions on other cards (video, audio, document, external link).

### Phase 3: Choice Modal Implementation
- [ ] Build the choice modal component with two options: "Create Empty Flashcards" and "AI Transformer."
- [ ] Implement dismissal paths: X button, Escape key, click-outside — all returning focus to the trigger card.
- [ ] Implement focus trapping and ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
- [ ] Wire "AI Transformer" option to open the existing Transform Your Content modal (ensure no nested modal issues — choice modal closes first).
- [ ] Ensure responsive behavior on mobile web (test across breakpoints).

### Phase 4: Seeded Flashcard Editor State
- [ ] Wire "Create Empty Flashcards" to open the flashcard editor with 3 pre-populated cards using the finalized placeholder copy.
- [ ] Implement placeholder behavior as true HTML placeholders: grey/muted styling, disappear on focus, reappear if field is emptied and blurred.
- [ ] Set the lesson name field to empty with "Untitled flashcard lesson" as its HTML placeholder.
- [ ] Apply the default theme to all 3 seeded cards.
- [ ] Ensure no lesson entity is created/persisted until explicit Save — navigating away discards the seeded state entirely.
- [ ] Confirm that all existing editor features (per-card toolbar, pagination, rich text, Edit Theme, Update Lesson) work identically on seeded cards.

### Phase 5: Testing & QA
- [ ] Functional testing against all 6 Acceptance Criteria (AC1–AC6).
- [ ] Test the full happy path: Upload content → Create flashcards card → choice modal → Create Empty Flashcards → edit cards → Save.
- [ ] Test the AI Transformer path: Upload content → Create flashcards card → choice modal → AI Transformer → Transform Your Content modal.
- [ ] Test dismissal: choice modal close via X, Escape, click-outside — verify no side effects.
- [ ] Test navigate-away-before-save: confirm no lesson entity persists, placeholder text reappears on re-entry.
- [ ] Test placeholder behavior: focus clears placeholder, blur with empty field restores placeholder, saved content persists normally.
- [ ] Accessibility testing: keyboard navigation, screen reader compatibility, focus management.
- [ ] Mobile web testing: modal rendering, touch interactions, responsive layout across common device sizes.
- [ ] Regression testing: verify no changes to other upload cards, AI Transformer behavior, or existing editor functionality.

### Phase 6: Release
- [ ] Merge to staging, conduct final smoke test.
- [ ] Release to production behind feature flag (if applicable) or direct deploy per team process.
- [ ] Monitor for errors or unexpected behavior in the first 48 hours post-release.

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Nested modal conflict**: Choice modal → AI Transformer modal could create a jarring double-modal experience | Medium — UX confusion, accessibility violations | Ensure choice modal fully closes/transitions before Transform Your Content modal opens. Test the transition explicitly. LogRocket best practices explicitly warn against nested modals ([source](https://blog.logrocket.com/ux-design/modal-ux-design-patterns-examples-best-practices/)). |
| **Placeholder copy confusion**: Admins may mistake placeholder text for real content and save lessons with default copy | Medium — Low-quality published lessons | Use visually distinct placeholder styling (grey/muted); treat placeholder-only fields as empty for validation purposes; consider a soft warning on Save if all cards still contain only placeholder text. |
| **Navigate-away data loss**: Admins spend time editing seeded cards, accidentally navigate away, and lose all work (no autosave) | High — Frustration, lost effort | Implement a browser-standard "unsaved changes" confirmation dialog (`beforeunload`) when the editor has been modified from its initial seeded state. |
| **Mobile modal usability**: Two-option modal may feel cramped or have touch-target issues on small screens | Medium — Poor mobile experience | Design mobile-specific modal layout (bottom sheet or full-screen on small viewports); test on iOS Safari and Android Chrome; ensure touch targets meet 44×44pt minimum. |
| **Scope creep to other content types**: Stakeholders may request extending the blank-creation pattern to video, audio, or document cards mid-sprint | Low — Sprint overcommitment | The choice modal component should be built with reasonable reusability in mind, but extending to other content types is explicitly out of scope for this ticket. Document the pattern for future reference. |
| **Figma-to-implementation copy drift**: Final placeholder copy in Figma may diverge from what's implemented if not synced | Low — Inconsistent UX | Treat the Figma file as the single source of truth for copy. Conduct a copy review checkpoint before Phase 4 implementation begins. |
| **Admin confusion about renamed card**: Existing Admins familiar with "AI Transformer" may not recognize "Create flashcards" or may think the AI feature was removed | Low — Temporary confusion | The card description explicitly mentions "transform existing content with AI," and the AI Transformer option is one click away in the choice modal. Monitor support tickets post-launch. |