---
ticket: DES-308
summary: Limited Admin Access
status: In Consideration
generated: 2026-09-04T11:47:32.909Z
---



# PRD: Limited Admin Access

## 1. Overview

5Mins needs a **Limited Admin** role that sits between full Admin and Team Manager, giving regional coordinators, entity leads, and similar mid-level operators admin-like capabilities scoped to a dynamic subset of users. The immediate driver is the Millenium deal (hotel chain needing per-property admins), but the design must generalise to any multi-entity organisation - regions, brands, sites, divisions.

This PRD focuses on **the admin-facing experience of making a user a Limited Admin and defining their scope**. It covers the entry point (People page row menu), the dedicated Limited Admin side drawer, the scope-definition condition builder inside that drawer, and the save behaviour.

The MVP targets end of September 2026, scoped to a single custom field with multi-value OR conditions. Fast-follow and Phase 2 expand to multiple fields, Region scoping, and richer preview.

---

## 2. Jobs To Be Done

### Main Job

**When** I am a full Admin of an organisation with multiple entities (hotels, regions, offices), **I want to** delegate day-to-day admin tasks to a trusted person within each entity **so I can** decentralise operations without exposing the entire organisation's data to every delegate.

### Job Map

| Stage | What the Admin does | Current pain / workaround |
|---|---|---|
| **Define** | Decide which person should manage a subset of the org | Mental decision - no friction here |
| **Locate** | Find that person in the system | People page exists; no issue |
| **Prepare** | Understand what the Limited Admin role entails | No Limited Admin role exists today; must choose between full Admin (too much access) or Team Manager (too narrow) |
| **Configure** | Assign the role and define the scope (which users this person manages) | Impossible today - no scoped role, no condition builder |
| **Confirm** | Review the assignment before saving - verify scope correctness and capability bundle | No confirmation flow exists |
| **Execute** | Save and have the system enforce the scope | No server-side scope filtering today |
| **Monitor** | Verify the Limited Admin sees only what they should | Would require logging in as that user; no preview or audit |
| **Resolve** | Change scope or revoke the role when the person moves | Would need to remove full Admin and reassign - risky manual process |

Users struggle most at **Prepare → Configure → Confirm**. These are the stages this PRD directly addresses.

### Related Jobs

- **Limited Admin's own job:** "When I log into 5Mins, I want to see only the people and data I'm responsible for, so I can focus without being overwhelmed or confused by irrelevant information."
- **Compliance officer's job:** "When auditing who can see what, I want to quickly see each admin's scope, so I can confirm we meet data-governance requirements."
- **IT administrator's job:** "When a custom field's values change (e.g., a hotel is renamed), I want scoped roles to remain valid, so I don't create silent access failures."

### Emotional & Social Dimensions

- **Assigning Admin feels:** confident that they are giving the right level of access - not too much, not too little. They want to feel in control and responsible.
- **Limited Admin feels:** empowered and trusted. They should not feel like a "lesser" admin; the interface should feel purposeful, not crippled.
- **Organisation perceives:** professional, governed, enterprise-ready. The ability to delegate admin access signals maturity.

---

## 3. Goals

1. **An Admin can assign the Limited Admin role and define scope in a single, continuous flow** - from the People page, via a side drawer, without navigating away.
2. **Scope is expressed as conditions on custom user fields** (MVP: one field, multi-value OR) and resolves dynamically as user data changes.
3. **The Admin has clarity before saving** - they see what scope they defined, what capabilities the Limited Admin will have, and what surfaces will be hidden.
4. **The design generalises beyond Millenium** - it works for any custom field, any number of values, and is architecturally ready for multi-field AND conditions in fast-follow.
5. **The system prevents misuse** - only full Admins can create Limited Admins; role changes are never auto-saved; orphaned scope conditions surface a visible error state.

---

## 4. Job Stories

### Assigning the role

- **When** I see a person on the People page who should manage a subset of our organisation, **I want to** assign them the Limited Admin role from the row's context menu, **so I can** initiate the delegation without leaving the list.
- **When** the role-assignment drawer opens, **I want to** see a clear description of what "Limited Admin" means (capabilities included and excluded), **so I can** be certain this is the right role before configuring scope.

### Defining scope

- **When** I am setting up a Limited Admin's scope, **I want to** pick a custom field (e.g., "Hotel name") and select one or more of its values (e.g., "Hotel A", "Hotel B"), **so I can** define exactly which users this person will manage.
- **When** I select multiple values for the same field, **I want to** see that these are combined with OR logic (and have this clearly labelled), **so I can** trust the scope matches my intent.
- **When** I have defined the scope, **I want to** see a dynamic summary line (e.g., "Limited Admin for Hotel A, Hotel B"), **so I can** verify correctness at a glance without re-opening the condition builder.

### Saving

- **When** I am about to save the Limited Admin assignment, **I want to** see the scope summary and what the role includes in the drawer itself, **so I can** save with confidence and without a separate confirmation step.
- **When** I save, **I want to** receive clear feedback that the role was applied successfully, **so I can** move on with confidence.

### Modifying and revoking

- **When** a Limited Admin's responsibilities change, **I want to** edit their scope or remove the role from the same People page entry point, **so I can** keep access aligned with the organisation's structure.
- **When** a custom field used for scoping is deleted or a value is removed, **I want to** see a visible warning on the affected Limited Admin's scope, **so I can** fix the orphaned condition before it causes silent access failures.

### Dual roles

- **When** a person is already a Team Manager and I make them a Limited Admin, **I want to** be told that this replaces their Team Manager role, **so I can** avoid creating access conflicts. The two roles are mutually exclusive.

---

## 5. Requirements

### Functional Requirements

#### FR-1: Entry Point - People Page Row Menu
- The three-dot context menu on each person row in the People page **must** include a "Make Limited Admin" action. For an existing Limited Admin the menu **must** offer "Edit scope" and "Remove Limited Admin" instead.
- This action **must** open a side drawer (consistent with the product's established pattern for role edits).
- The action **must** only be visible to full Admins. Limited Admins **must not** see this action.
- If the person is already a full Admin, the Limited Admin option **must** be disabled or hidden with a tooltip explaining that full Admins already have unrestricted access.

#### FR-2: Limited Admin Drawer - Structure
- The drawer is dedicated to the Limited Admin role. It **must not** contain a role selector; other roles (Learner, Team Manager, Admin) are managed elsewhere.
- The drawer **must** show the person (name and avatar), a short plain-language description of the Limited Admin role, the scope-definition section, and the Save and Cancel actions.
- The role description **must** cover:
  - **Capabilities included:** view/search/edit people in scope, single invite (fast-follow), enrol and bulk-enrol in scope, edit enrolments, view and export Learning Records in scope, browse 5Mins library, create/edit/publish own courses, set enrolment dates and sponsor.
  - **Capabilities excluded:** Reports, Teams, Cohorts, Your Content, Custom Fields admin, Skills, Events, Automations, Settings, role management, delete users, bulk invite.
  - **Navigation surfaces:** 5Mins Courses, Your Courses, Learning Records, Help.

#### FR-3: Scope Definition - Condition Builder (MVP)
- The scope-definition section is the drawer's main content and **must** be visible as soon as the drawer opens.
- **MVP scope:** one custom-field condition row - a field dropdown (listing all custom user fields configured by the tenant) and a multi-value picker for that field's values.
- Multiple values within the same field **must** be combined with OR logic, and this **must** be visually indicated (e.g., "is any of" operator label or OR chips between values).
- The scope section **must** include a dynamic summary line that updates as values are selected (e.g., "Scope: Hotel name is Hotel A or Hotel B").
- The field dropdown **must not** list system fields (name, email) - only custom user fields.
- If no custom fields exist for the tenant, the scope section **must** display an informational message directing the Admin to create custom fields first, and the Save button **must** be disabled.

#### FR-4: Scope Definition - Fast-Follow Extension
- In fast-follow, the scope builder **must** support multiple condition rows (multiple custom fields), combined with AND logic between fields.
- Each row: field dropdown + operator ("is any of") + multi-value picker + delete button.
- An "Add condition" button **must** allow adding additional field rows.
- A live "N people in scope" count **must** update dynamically as conditions change.
- Region **must** be available as a scope field in addition to custom fields.

#### FR-5: Save Behaviour
- There is no separate confirmation view. The drawer itself shows the person, the scope summary line and the short role description, so Save applies the change directly.
- On success the drawer closes and a toast names the scope, e.g. "Ana is now a Limited Admin for Hotel A and Hotel B". The People page row updates to show the Limited Admin badge.
- If the person currently holds Team Manager, the drawer **must** show an inline warning (see FR-8) and the primary action reads "Replace Team Manager Role".
- Removing the Limited Admin role **must** go through the standard destructive-action confirm dialog (see FR-6).
- Role changes **must not** auto-save; an explicit Save is always required.

#### FR-6: Editing and Revoking
- Re-opening the drawer for an existing Limited Admin **must** pre-populate the current scope conditions.
- An Admin **must** be able to change scope values or remove the Limited Admin role ("Remove Limited Admin" in the row menu or in the drawer).
- Removing the Limited Admin role **must** open the standard destructive-action confirm dialog, warning that scoped access will be revoked, and then clear the scope definition.

#### FR-7: Orphaned Scope Handling
- If a custom field used in a Limited Admin's scope is deleted, the system **must** display a visible error/warning state on that scope condition (e.g., "Field deleted - scope invalid") and restrict the Limited Admin's access to an empty scope until an Admin corrects it.
- If a specific value within a scoped field is removed, the system **must** remove that value from the scope condition and, if no values remain, treat the scope as invalid with the same error state.
- The People page **must** display a visual indicator (e.g., warning icon) next to any Limited Admin with an invalid/orphaned scope.

#### FR-8: Mutual Exclusivity with Team Manager
- **Decision (4 Sep 2026):** Limited Admin and Team Manager are mutually exclusive. A person holds one or the other, never both. Rationale: two scoped roles with different scope mechanisms (team-based vs. field-based) create ambiguous access boundaries and complicate both the UI and server-side enforcement. Team scoping for Limited Admins arrives in Phase 2.
- The drawer **must** warn the Admin if the person currently holds Team Manager and they are about to assign Limited Admin: "This will replace their Team Manager role. They will no longer manage their current team." The primary action then reads "Replace Team Manager Role".

#### FR-9: Access Control
- Only full Admins can assign, edit, or revoke the Limited Admin role.
- Limited Admins **must not** see role-management options for any user.
- There is no cap on the number of Limited Admins per tenant.
- Overlapping scopes between Limited Admins are permitted and require no special UI treatment.

#### FR-10: MVP vs. Multi-Field Conflict Resolution
- **Conflict flagged:** The Confluence MVP spec limits scope to a single custom field, but the clarifying answers indicate multi-field support is desired. **Recommendation:** Build the data model to store multiple conditions from day one (array of {field, operator, values} objects), but constrain the MVP UI to a single condition row with an architecture note. This avoids schema migration for fast-follow and keeps the MVP visually simple.

---

## 6. Research & Best Practices

### Narrative Synthesis

The Limited Admin pattern - variously called "delegated administration," "scoped admin," or "group admin" - is a well-established enterprise SaaS pattern. The research dossier confirms both the necessity and the dominant design patterns.

**Role architecture.** The most usable role systems keep a small, clearly differentiated set of roles with plain-language descriptions shown at assignment time ([SaaS Permissions & Roles UX Patterns](https://www.saasui.design/blog/saas-permissions-roles-ux-patterns)). The setting.page permissions UX guide explicitly warns against creating too many near-duplicate roles ("Admin, Limited Admin, Workspace Admin, Content Admin") without clear separation, and recommends role cards with disclosure drawers rather than exposing every permission by default ([User Permissions Settings UX](https://setting.page/user-permissions-settings-ux)). This validates our approach of a single "Limited Admin" role with a fixed capability bundle (no per-action customisation) and a drawer-based assignment flow.

**The "role + scope" two-step.** Microsoft Entra ID's Administrative Units pattern - select role → add assignment → choose user → select scope - is the dominant enterprise approach ([Delegated Admin with Administrative Units](https://medium.com/@shaheerkj/how-to-delegate-admin-access-with-administrative-units-in-microsoft-entra-id-9c3b50df7c70)). LoginRadius formalises this as four components: Central Admin, Delegated Admin, Scope Definition, and Permission Limits ([Delegated Administration](https://www.loginradius.com/glossary/delegated-administration)). Our drawer flow mirrors this: choose the person → define scope → save.

**Sana Labs as the closest competitor.** Sana's Group Admin role is scoped by group membership (static or smart groups) and by manager-attribute assignment. Critically, Group Admins do not get automatic access - an administrator must explicitly assign scope, and without it, the "Manage" pages appear blank ([Quick Guide for Group Admins](https://help.sana.ai/en/articles/196188-quick-guide-for-group-admins-in-sana)). Sana uses three roles: Admin, Group Admin, and Learner, with role assignment accessed via Manage → Users → click user → Settings button ([User Roles](https://help.sana.ai/en/articles/114939-user-roles-administrators-group-admins-learners)). Our approach improves on Sana by using dynamic, attribute-based scoping (custom fields with OR/AND conditions) rather than static group assignment, which reduces maintenance burden.

**Scope definition as a condition/rule builder.** The UI-Patterns.com rule builder pattern describes the canonical approach: each rule as a separate line with field selector, operator, and value picker, with AND/OR logic between conditions ([Rule Builder Design Pattern](https://ui-patterns.com/patterns/rule-builder)). ServiceNow's Horizon design system provides a production-grade reference implementation with contextual operators, value pickers, and grouping controls ([Condition Builder Component](https://horizon.servicenow.com/workspace/components/now-condition-builder-connected)). For MVP (single field, multi-value OR), a simplified version of this pattern suffices; the full condition builder activates in fast-follow.

**RBAC governance.** IBM's RBAC implementation guide warns against role explosion, privilege creep, and scattered permission checks ([RBAC Implementation Guide](https://www.ibm.com/think/topics/role-based-access-control-implementation)). Our decision to keep a fixed capability bundle (not per-action customisation) directly mitigates role explosion. The eLearning Industry guide advocates delegated administration scoped to departments or regions, and recommends immediate access revocation on role changes and regular permission audits ([Best Practices for Managing User Roles in an LMS](https://elearningindustry.com/best-practices-for-managing-user-roles-and-permissions-in-your-lms)). Auth0's delegated admin approach uses organisation-specific scopes via tokens, demonstrating the "virtual tenant" model ([Delegated Administration Dashboard](https://auth0.com/blog/delegated-admin-v2/)).

**LMS-specific patterns.** LatitudeLearning defines a four-tier admin hierarchy where Location Administrators manage users only for their location ([Roles and Access to LMS Functionality](https://support.latitudelearning.com/administrator-home-page/administrator-organize-people/roles-and-access-to-lms-functionality/)). Educate Me describes delegated LMS administration with scoped feature menus varying by role level ([Delegated Administration in LMS](https://www.educate-me.co/blog/lms-administration)). Both reinforce that our Limited Admin's reduced navigation (5Mins Courses, Your Courses, Learning Records, Help) is standard practice.

**Experience design for roles.** DRC Systems recommends that the best products show meaningfully different interfaces based on what a user actually does, not just what they can see, and advocates role previews so admins can simulate the user experience before applying changes ([Scoped Admin Role Assignment UX Best Practices](https://www.drcsystems.com/blogs/ux-design-for-saas-platforms-best-practices-to-follow/)). While a full preview is out of scope for MVP, the drawer's role description and scope summary serve as a lightweight version of this.

### UX References

| App | Flow / Screen | URL | Pattern Description | Relevance |
|---|---|---|---|---|
| Airwallex | Admin role assignment with scope/permissions | [View](https://mobbin.com/screens/20f6cf65-6657-48c5-8ab9-448a58540679) | Role assignment drawer with permission selection in settings | Direct reference for structuring the Limited Admin drawer with role + permission summary |
| Pipedrive | Role/permission settings | [View](https://mobbin.com/screens/684e6e79-f99d-4fba-8b9c-a437cdf4aad3) | Role editing with field selection | Shows field-level role configuration in a CRM context - relevant to field-based scope definition |
| Deel | Admin role assignment | [View](https://mobbin.com/screens/15fb662e-c13b-4a92-96c6-4e7b6a0eadf5) | HR platform role assignment with scope selection | People-management platform with scoped admin roles - closely matches our domain |
| Revolut Business | Admin role/permissions settings | [View](https://mobbin.com/screens/874360f4-3daa-4368-975c-68173010c473) | Business admin role configuration | Multi-entity financial product handling scoped admin roles - validates the multi-entity generalisation |
| Supabase | Role/permissions settings | [View](https://mobbin.com/screens/b30e12e5-030e-4723-a73a-ff46f1dbc2fd) | Developer platform role assignment | Technical role assignment with scope controls - reference for clean, minimal role drawer |
| Gusto | User role edit with field selection | [View](https://mobbin.com/screens/f9089623-4085-4102-881f-87ee4bee2481) | HR platform role/field editing in drawer/form | Drawer-based role editing with multi-value field pickers - directly applicable to our drawer pattern |
| Jira | Role/field editing in side panel | [View](https://mobbin.com/screens/645e71eb-bd61-476e-a304-f0b80b2d206c) | Project management field editing | Familiar Atlassian side-panel field editing with multi-value selection - team is likely already familiar |
| Vercel | Condition/rule builder with field and value selection | [View](https://mobbin.com/screens/857d6073-d5d4-47f6-b470-5a9b8cd88ae6) | Condition builder with field dropdown and value picker | Directly relevant to the scope-definition condition builder - clean, minimal implementation |
| beehiiv | Condition builder for audience filtering | [View](https://mobbin.com/screens/6cc5a7c8-92a3-4656-8305-412ebd97ebda) | Segment/audience rule builder with multi-value fields | Dynamic user segment builder via field + value conditions - mirrors scope definition |
| Flodesk | Audience condition builder | [View](https://mobbin.com/screens/7b475d63-3621-45e4-bfe1-6dc50a99eb95) | Rule builder for audience segmentation | Email platform's segment builder - reference for visual treatment of OR conditions |
| Apollo | Contact filter/condition builder | [View](https://mobbin.com/screens/78c77f00-7150-4bfb-9996-619b87b2c041) | Advanced filter builder with AND/OR and multi-value pickers | Sophisticated condition builder - reference for fast-follow multi-field AND/OR UI |
| Twingate | People list row menu with role options | [View](https://mobbin.com/screens/f42e3c97-bd96-4da7-b576-689e7302e81a) | Three-dot row menu on people list with role/edit actions | Directly relevant to the entry point: triggering role change from row context menu |
| Tailscale | People list with contextual actions | [View](https://mobbin.com/screens/0d01803d-431e-49b1-954a-bf3b15fc1e6b) | People list row actions | Security-focused product exposing user management actions from a list - validates row-menu pattern |
| Asana | Team member list with role actions | [View](https://mobbin.com/screens/5c8ac940-052c-4e8b-8598-52686804cbbd) | Member list with contextual role-change options | Role changes from a member list - validates discoverability of role actions in list context |
| 15Five | People list admin actions | [View](https://mobbin.com/screens/c954f568-4621-4ab0-9e39-8f7734483112) | HR/people platform row menu with edit actions | HR platform's approach to people-list contextual actions - domain-appropriate reference |

### Built for Mars Lessons

| Title | Type | URL | Lesson | Relevance |
|---|---|---|---|---|
| Hiding the advanced onboarding | UX bite | [View](https://builtformars.com/ux-bites/hiding-the-advanced-onboarding) | Progressive disclosure: hide advanced configuration behind a collapsible section so users engage with the core action first, then expand for complexity. | Partly applicable: the drawer is dedicated to Limited Admin, so scope is the primary content. Keep fast-follow extras (additional condition rows, live count) behind an "Add condition" action. |
| Upselling non-paying users | UX bite | [View](https://builtformars.com/ux-bites/upselling-non-paying-users) | When an action affects another person, show exactly who will be affected and what will happen. Transparency about consequences reduces hesitation. | Applies to the drawer's role description and the Team Manager warning: the assigning admin should see exactly what the Limited Admin will gain access to and what they will lose. |
| Slack's dynamic subtitles | UX bite | [View](https://builtformars.com/ux-bites/slacks-dynamic-subtitles) | Contextualising a label with dynamic, situation-specific detail adds certainty without clutter. | Applies to the scope summary: dynamically show "Limited Admin for Hotel A, Hotel B" beneath the role label as values are selected. |
| How (and why) Wise leverage radical transparency | Case study | [View](https://builtformars.com/case-studies/wise) | Radical transparency in showing exactly what a change does builds trust. Show clear before/after comparison so users understand precisely what they are getting. | Relevant to the drawer's scope summary line and the save toast: transparent display of the scope before and after saving builds admin confidence. |

---

## 7. Plan of Action

### Phase 0: Alignment & Data Model (Week 1)

- [ ] Resolve the MVP vs. multi-field conflict with engineering: confirm the data model stores an array of conditions `[{field_id, operator, values[]}]` from day one, but MVP UI renders only one row.
- [x] Limited Admin and Team Manager are mutually exclusive (decided 4 Sep 2026); update the Confluence spec.
- [ ] Define the API contract for scope storage and the server-side enforcement points (course-enrolments table, Learning Records, enrol people-picker).
- [ ] Add "Limited Admin" as a role option in the backend role enum.

### Phase 1: Entry Point & Drawer Shell (Week 2)

- [ ] Add a "Make Limited Admin" action to the three-dot row menu on the People page - visible only to full Admins. Existing Limited Admins get "Edit scope" and "Remove Limited Admin" instead.
- [ ] Implement the side drawer shell: header (person's name + avatar), short plain-language role description, scope-definition section, Save and Cancel. No role selector.
- [ ] If the person is already a full Admin, hide or disable the action with a tooltip.

### Phase 2: Scope Definition - MVP Single-Field Condition (Week 2–3)

- [ ] Build the scope-definition section: one condition row with a field dropdown (populated from tenant's custom user fields) and a multi-value tag picker for the selected field's values.
- [ ] Label the operator as "is any of" to make OR logic explicit.
- [ ] Implement the dynamic summary line below the condition row: "Scope: [Field name] is [Value 1] or [Value 2] or …" - updates on every selection change (per BFM "Slack's dynamic subtitles" pattern).
- [ ] Handle edge case: no custom fields configured → show info message + disable Save.
- [ ] Handle edge case: field selected but no values chosen → disable Save with inline validation message.

### Phase 3: Save & Feedback (Week 3)

- [ ] No separate confirmation view. Save applies directly from the drawer; "Cancel" discards. No auto-save.
- [ ] If the person is a Team Manager, show the inline warning and relabel the primary action "Replace Team Manager Role".
- [ ] On save: API call to update user role + scope; success toast naming the scope; People page row updates to show the Limited Admin badge.
- [ ] If saving fails, show inline error in the drawer without closing it.

### Phase 4: Edit, Revoke & Orphan Handling (Week 3–4)

- [ ] Re-opening the drawer for an existing Limited Admin pre-populates current role and scope conditions.
- [ ] Removing the Limited Admin role opens the standard confirm dialog: "This will remove their Limited Admin scope. They will no longer manage [scope summary]."
- [ ] Implement orphaned-scope detection: on drawer open, check if the scoped field still exists and values are still valid. If not, show a warning banner in the drawer: "Scope invalid - the field [name] has been deleted / the value [name] has been removed. Please update the scope."
- [ ] Add a warning icon on the People page row for any Limited Admin with an invalid scope.

### Phase 5: Fast-Follow - Multi-Field & Live Count (Weeks 5–7)

- [ ] Expand the scope section to support multiple condition rows (one per field), connected with AND logic between rows.
- [ ] Add "Add condition" button and per-row delete button.
- [ ] Add Region as an available scope field alongside custom fields.
- [ ] Implement live "N people in scope" count, debounced, updating as conditions change.
- [ ] Build the full scope-definition drawer variant with the condition builder UI (reference: Vercel, Apollo, beehiiv patterns from Mobbin).

### Phase 6: Phase 2 - Team Scoping & Preview (Weeks 8–10)

- [ ] Add Team as a scope field option.
- [ ] Add remaining system fields: Function, Job Role, Country, Division, City.
- [ ] Implement cross-field AND logic in the server-side scope resolver.
- [ ] Add "Preview matched people" - a scrollable list showing the first N users matching the scope conditions, with a total count.

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **MVP vs. multi-field scope conflict** - Confluence spec says single field; clarifying answers suggest multi-field. Engineering may build a single-field data model that requires migration later. | High - schema migration delays fast-follow | Store scope as an array of conditions from day one (`[{field, op, values}]`). MVP UI constrains to one row; data model is already extensible. |
| **Replacing a Team Manager silently** - Limited Admin and Team Manager are mutually exclusive, so making a Team Manager a Limited Admin removes their team access. | Medium - unexpected loss of team management | Show a clear warning when replacing Team Manager with Limited Admin and require explicit confirmation. Revisit in Phase 2 when team scoping is added to Limited Admin. |
| **Orphaned scope from deleted custom fields** - A full Admin deletes a custom field that another admin's scope depends on. | High - silent access failure; Limited Admin sees no users or, worse, all users | Detect orphaned fields/values on scope evaluation. Restrict Limited Admin to empty scope (deny-by-default) when scope is invalid. Show warning icon on People page. |
| **Custom field proliferation** - Tenants with many custom fields make the field dropdown unwieldy. | Low - UX friction | Use a searchable dropdown for the field selector. Consider grouping or recently-used ordering in fast-follow. |
| **Performance of live scope count** - For large tenants, counting matching users on every condition change may be slow. | Medium - laggy UX during scope definition | Debounce the count query (300–500ms). Show a loading spinner. Cache intermediate results. This is fast-follow, not MVP. |
| **Privilege creep** - Limited Admins accumulate scope over time without review. | Medium - governance risk | Log all scope changes. Recommend periodic access reviews in product documentation. Consider an admin audit log surface in a future phase (per [RBAC Implementation Guide](https://www.ibm.com/think/topics/role-based-access-control-implementation) and [eLearning Industry best practices](https://elearningindustry.com/best-practices-for-managing-user-roles-and-permissions-in-your-lms)). |
| **Millenium timeline pressure** - MVP must ship by end of September 2026; scope creep from multi-field desire could delay. | High - deal blocker | Strict MVP boundary: one field, multi-value OR, no live count, no preview. Multi-field is explicitly fast-follow. Weekly scope reviews with PM. |
| **Drawer complexity** - Condition builder, inline warnings and orphan states in a single drawer may overwhelm. | Medium - design debt, user confusion | User-test the drawer flow with 3–5 internal admins before launch. Keep MVP visually minimal (one condition row, direct Save, no confirmation view). Expand complexity only in fast-follow. |