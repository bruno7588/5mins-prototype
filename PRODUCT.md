# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally in design decisions.

- **Admins:** L&D leads, compliance leads, HR and training coordinators at enterprise customers in compliance-heavy industries (hospitality, finance, healthcare). They build and assign learning, map roles, enrol people, track completion and prove compliance.
- **Learners:** frontline and office staff at those customers. They take short lessons, often on mobile, between shifts or tasks, and earn progress (streaks, points, skill levels, certificates).

## Product Purpose

5Mins.ai is a B2B micro-learning platform. It gets a workforce trained and compliant without admins chasing people or building content from scratch. Success means high completion, low admin effort, and an audit-ready record of who learned what.

## Positioning

- **5-minute micro-lessons:** bite-size, mobile-first learning that frontline staff actually complete.
- **Ready-made catalogue:** a large off-the-shelf library of lessons across functions and skills, so admins assign rather than author.
- **Compliance on autopilot:** automations, assignments, reminders and audit trails that cut compliance admin.

## Operating Context

- Admins work in the admin portal: courses, programs, content library, people, roles, user fields, automations, learning records and audit log.
- Learners use the learner web app and the mobile app (dark mode only).
- Product work starts from Jira tickets (DES-xxx), is specified as PRDs in `docs/prd/`, prototyped here, and shipped to Figma for handoff.

## Capabilities and Constraints

- **This repo is a design and spec sandbox, not shipped code.** Engineering rebuilds features in the production stack (Nx monorepo, MUI-based). Prototype fidelity matters for decisions and handoff, not for production performance.
- **The 5Mins design system always wins.** `docs/design-system/*.md`, `src/styles/tokens.css` and `src/components/` override any other design guidance, including Impeccable's own recommendations and detector findings. Linked Figma for a specific ticket overrides the DS docs; flag the conflict. Never improvise values or components; if a component has no doc, ask for the Figma link.
- Desktop supports light and dark mode; the mobile app is dark only.
- Terminology: "lessons" are bite-size units, "courses" are multi-lesson content; end users are "learners", portal users are "admins", the workforce is "people" or the "team".

## Brand Commitments

- Name is "5Mins" or "5Mins.ai", never "5mins" or "5 Mins".
- Voice and copy rules live in the `5mins-copy-review` skill: British English, sentence case (buttons in Title Case), no em dashes, calm and economical in-product register.

## Evidence on Hand

- DS illustrations, gamification artwork and skill icons under `src/assets/`.
- Mock data in `src/data/`; it is illustrative, not customer data.
- No confirmed testimonials, customer names, benchmarks or catalogue size figures are recorded here; do not invent them.

## Product Principles

1. Fewest moving parts wins; cut added UI complexity for the plainest solution.
2. Admin effort is the enemy: assign, automate and report, don't build or chase.
3. Learning fits in 5 minutes; anything that makes a lesson feel longer is a defect.
4. Every compliance action must leave a clear, provable record.

## Accessibility & Inclusion

Semantic HTML with ARIA, visible `:focus-visible` indicators on every interactive element, tooltips on icon-only controls (web only), and reduced-motion support for all animation.
