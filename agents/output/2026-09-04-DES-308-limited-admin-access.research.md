---
ticket: DES-308
summary: Limited Admin Access
status: In Consideration
generated: 2026-09-04T11:47:32.909Z
---

## Research Dossier

### Web findings

- **[SaaS Permissions & Roles UX Patterns (SaaS UI Design)](https://www.saasui.design/blog/saas-permissions-roles-ux-patterns)** - The most usable role systems keep a small set of clearly differentiated roles (Owner, Admin, Member, Viewer) with plain-language descriptions shown at assignment time. Scope should be assigned during the invitation or role-change flow itself, not after. The members page should display name, role, and status per row, allowing admins to verify access without opening individual profiles.

- **[User Permissions Settings UX (setting.page)](https://setting.page/user-permissions-settings-ux)** - Authoritative guide on permissions UX. Key principles: make scope visibly explicit using structured language (e.g., "Can edit reports *in assigned workspaces*"); treat overrides as marked exceptions, not silent merges; use role cards with disclosure drawers rather than exposing every permission by default. Warns specifically against creating too many near-duplicate roles ("Admin, Limited Admin, Workspace Admin, Content Admin") without clear separation. Match save behaviour to risk level: role changes warrant explicit review and confirmation, not inline auto-save.

- **[Quick Guide for Group Admins in Sana (Sana Labs Help)](https://help.sana.ai/en/articles/196188-quick-guide-for-group-admins-in-sana)** - Sana's Group Admin is the closest LMS competitor pattern. Scope is determined by two mechanisms: (1) being assigned as the manager attribute for specific learners, and/or (2) being designated as group administrator for a specific static or smart group. Group Admins do not get automatic access; an administrator must explicitly assign scope. Without assignment, the "Manage" pages appear blank.

- **[User Roles: Administrators, Group Admins & Learners (Sana Labs Help)](https://help.sana.ai/en/articles/114939-user-roles-administrators-group-admins-learners)** - Sana uses three roles: Admin (full access), Group Admin (scoped), and Learner. Group Admins can manage users, assign content, and access reports, but only within their assigned groups. They cannot make content "visible to everyone", create groups, or access full administrator settings. Role assignment happens via Manage > Users > click user > Settings button.

- **[Rule Builder Design Pattern (UI-Patterns.com)](https://ui-patterns.com/patterns/rule-builder)** - A rule builder allows users to specify conditions to dynamically group items. Each rule appears as a separate line, with field selector, operator, and value picker. Users specify AND/OR logic between conditions. Best used when searches involve an unknown number of conditions and results should update dynamically as underlying data changes, which maps directly to the scope-definition requirement.

- **[Condition Builder Component (ServiceNow Horizon Design System)](https://horizon.servicenow.com/workspace/components/now-condition-builder-connected)** - ServiceNow's well-documented condition builder provides: a field selector dropdown, an operator choice list (contextual to field type), a value picker, and AND/OR condition grouping with add/delete controls. This is the canonical enterprise pattern for the scope-definition UI.

- **[RBAC Implementation Guide (IBM)](https://www.ibm.com/think/topics/role-based-access-control-implementation)** - Common RBAC pitfalls include role explosion (creating overly granular roles), privilege creep (accumulating permissions across role changes), and scattered permission checks. Recommends governance procedures requiring business justification for new roles and regular consolidation reviews.

- **[Best Practices for Managing User Roles in an LMS (eLearning Industry)](https://elearningindustry.com/best-practices-for-managing-user-roles-and-permissions-in-your-lms)** - Advocates delegated administration by granting limited admin rights to mid-level managers scoped to their department or region. Contrasts RBAC with ABAC (Attribute-Based Access Control), noting ABAC suits complex, distributed environments using department, location, or seniority variables. Recommends six-monthly permission audits and immediate access revocation on role changes.

- **[Delegated Administration (LoginRadius)](https://www.loginradius.com/glossary/delegated-administration)** - Defines the four components of delegated admin: Central Admin (full access), Delegated Admin (limited rights), Scope Definition (which users/resources the delegate can manage), and Permission Limits (what actions the delegate can perform). Considered non-negotiable in modern SaaS.

- **[Delegated Admin with Administrative Units (Microsoft Entra ID)](https://medium.com/@shaheerkj/how-to-delegate-admin-access-with-administrative-units-in-microsoft-entra-id-9c3b50df7c70)** - Microsoft's pattern: create Administrative Units to subdivide a tenant by region/division/department, then assign admin roles scoped to that AU. The assignment flow is: select role > add assignment > choose user > select scope (the AU). This "role + scope" two-step is the dominant enterprise pattern.

- **[Delegated Administration Dashboard (Auth0)](https://auth0.com/blog/delegated-admin-v2/)** - Auth0's approach grants organisation-specific scopes via access tokens, ensuring delegated admins can only modify the specific organisation to which they belong. Demonstrates the "virtual tenant" approach to scoping.

- **[Scoped Admin Role Assignment UX Best Practices (DRC Systems)](https://www.drcsystems.com/blogs/ux-design-for-saas-platforms-best-practices-to-follow/)** - In 2026, role-based design has moved beyond permissions into experience design. The best products show meaningfully different interfaces based on what a user actually does, not just what they are allowed to see. Recommends role previews so admins can simulate the user experience before applying changes.

- **[Delegated Administration in LMS (Educate Me)](https://www.educate-me.co/blog/lms-administration)** - LMS delegated administration involves granting scoped admin rights to mid-level managers or department heads, decentralising oversight while maintaining systemic cohesion. Scoped feature menus vary by role level.

- **[Roles and Access to LMS Functionality (LatitudeLearning)](https://support.latitudelearning.com/administrator-home-page/administrator-organize-people/roles-and-access-to-lms-functionality/)** - Defines a four-tier admin hierarchy: Portal Administrator, Administrator, Location Administrator, and Instructor, each with a progressively scoped feature menu. Location Administrators handle user maintenance for their location only.

### Mobbin UX references

| App | Flow / Screen | URL | Pattern | Relevance |
|---|---|---|---|---|
| Airwallex | Admin role assignment with scope/permissions | [View](https://mobbin.com/screens/20f6cf65-6657-48c5-8ab9-448a58540679) | Role assignment drawer with permission selection in settings | Direct reference for how a SaaS admin panel structures role assignment with permission controls |
| Pipedrive | Role/permission settings | [View](https://mobbin.com/screens/684e6e79-f99d-4fba-8b9c-a437cdf4aad3) | Role editing with field selection | Shows how CRM/SaaS products present role configuration with field-level controls |
| Deel | Admin role assignment | [View](https://mobbin.com/screens/15fb662e-c13b-4a92-96c6-4e7b6a0eadf5) | HR platform role assignment with scope selection | Relevant as a people-management platform with scoped admin roles |
| Revolut Business | Admin role/permissions settings | [View](https://mobbin.com/screens/874360f4-3daa-4368-975c-68173010c473) | Business admin role configuration | Shows how a multi-entity financial product handles scoped admin roles |
| Supabase | Role/permissions settings | [View](https://mobbin.com/screens/b30e12e5-030e-4723-a73a-ff46f1dbc2fd) | Developer platform role assignment | Technical role assignment pattern with scope controls |
| Gusto | User role edit with field selection | [View](https://mobbin.com/screens/f9089623-4085-4102-881f-87ee4bee2481) | HR platform role/field editing in drawer/form | Shows drawer-based role editing with multi-value field pickers in an HR context |
| Jira | Role/field editing in side panel | [View](https://mobbin.com/screens/645e71eb-bd61-476e-a304-f0b80b2d206c) | Project management field editing | Familiar Atlassian pattern for side-panel field editing with multi-value selection |
| Vercel | Condition/rule builder with field and value selection | [View](https://mobbin.com/screens/857d6073-d5d4-47f6-b470-5a9b8cd88ae6) | Condition builder with field dropdown and value picker | Directly relevant to the scope-definition condition builder pattern |
| beehiiv | Condition builder for audience filtering | [View](https://mobbin.com/screens/6cc5a7c8-92a3-4656-8305-412ebd97ebda) | Segment/audience rule builder with multi-value fields | Shows how to build dynamic user segments via field + value conditions |
| Flodesk | Audience condition builder | [View](https://mobbin.com/screens/7b475d63-3621-45e4-bfe1-6dc50a99eb95) | Rule builder for audience segmentation | Email platform's segment builder with field/value conditions |
| Apollo | Contact filter/condition builder | [View](https://mobbin.com/screens/78c77f00-7150-4bfb-9996-619b87b2c041) | Advanced filter builder with AND/OR and multi-value pickers | Shows a sophisticated condition builder for contact filtering, close to the scope-definition UX needed |
| Twingate | People list row menu with role options | [View](https://mobbin.com/screens/f42e3c97-bd96-4da7-b576-689e7302e81a) | Three-dot row menu on people list with role/edit actions | Directly relevant to the entry point: triggering role change from a people list row menu |
| Tailscale | People list with contextual actions | [View](https://mobbin.com/screens/0d01803d-431e-49b1-954a-bf3b15fc1e6b) | People list row actions | Shows how a security-focused product exposes user management actions from a list |
| Asana | Team member list with role actions | [View](https://mobbin.com/screens/5c8ac940-052c-4e8b-8598-52686804cbbd) | Member list with contextual role-change options | Shows how a project management tool handles role changes from a member list |
| 15Five | People list admin actions | [View](https://mobbin.com/screens/c954f568-4621-4ab0-9e39-8f7734483112) | HR/people platform row menu with edit actions | HR platform's approach to people-list contextual actions |

### Built for Mars lessons

| Title | Type | URL | Lesson | Relevance |
|---|---|---|---|---|
| Hiding the advanced onboarding | UX bite | [View](https://builtformars.com/ux-bites/hiding-the-advanced-onboarding) | Progressive disclosure keeps the initial UI simple: hide advanced configuration behind a collapsible section so users engage with the core action first, then expand to see complexity. In a role-assignment drawer, show the role picker first and reveal scope definition only after role selection. | Directly applicable to the drawer flow: role selection first, then progressive reveal of scope configuration fields. |
| Upselling non-paying users | UX bite | [View](https://builtformars.com/ux-bites/upselling-non-paying-users) | When an action affects another person (e.g., triggering a notification or changing permissions), show exactly who will be affected and what will happen. Transparency about consequences reduces hesitation. | Applies to the confirmation step: the assigning admin should see exactly what the Limited Admin will gain access to and what they will not see. |
| Slack's dynamic subtitles | UX bite | [View](https://builtformars.com/ux-bites/slacks-dynamic-subtitles) | Contextualising a label with dynamic, situation-specific detail (e.g., "View or manage your Free Plan") adds certainty about what you are managing. This reduces ambiguity without adding screen clutter. | Applies to the scope summary: dynamically show "Limited Admin for Hotel A, Hotel B" beneath the role label so the assigning admin has immediate certainty about what scope they have defined. |
| How (and why) Wise leverage radical transparency | Case study | [View](https://builtformars.com/case-studies/wise) | Radical transparency in showing exactly what a change does builds trust. Wise shows comparison data upfront so users understand precisely what they are getting. Apply this to role assignment: show a clear before/after of what the scoped admin will and will not be able to access. | Relevant to the confirmation/summary step of role assignment: transparent display of the capability bundle and scope before saving. |

**BFM synthesised advice (via `bfm_analyze_lessons`):** For the scoped role assignment drawer, BFM lessons recommend: (1) start simple, reveal complexity only as needed via collapsible sections; (2) provide dynamic, contextual summaries as scope is defined (e.g., update a subtitle showing "Limited Admin for [Field: Values]"); (3) offer a preview of the scoped user's experience before confirming; (4) be radically transparent about all effects of the change, including what the user will and will not see.

### Confidence check

- `web_searches_performed`: 6
- `mobbin_searches_performed`: 4
- `bfm_lookups_performed`: 6 (4 `bfm_find_content` searches + 2 `bfm_analyze_lessons` calls)
- `authoritative_sources_fetched`: 4 (setting.page permissions UX guide, Sana Labs help articles x2, eLearning Industry LMS roles article, UI-Patterns.com rule builder)
- `all_urls_verified`: yes

**Note on BFM results:** Built for Mars does not have content specifically covering admin role/permission UX. The most relevant matches were about progressive disclosure, dynamic contextual labels, and transparency in consequence communication. These were synthesised via `bfm_analyze_lessons` into actionable advice for the scoped role assignment drawer pattern.