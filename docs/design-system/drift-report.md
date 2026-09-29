---
name: 5mins-drift-report
description: A list of known prototype drift to fix, not guidance. Places in the 5Mins prototype where a page hand-rolls something a shared component in src/components/ already covers. Read it when cleaning up the prototype or when an existing page looks like a pattern to copy; do not copy anything listed here.
---

# Prototype drift report

Places inside the prototype where a page hand-rolls UI that a shared component (or a DS spec) already covers. This is a to-fix list, not guidance: when a page below looks like a pattern to copy, use the "Should use" column instead. Every entry was confirmed by grep on 2026-09-29; line numbers drift as files change, so re-grep the class name before fixing.

## Overlays (drawers and modals)

There is no shared Drawer or Modal shell component yet, so each drawer and modal builds its own backdrop. Fix target: the [overlays.md](overlays.md) spec (no shared shell yet).

| Component | Hand-rolled instance | Should use |
|---|---|---|
| Drawer overlay | `.lad-overlay`, `pages/people/components/LimitedAdminDrawer/LimitedAdminDrawer.css:3` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.epd-overlay`, `pages/programs/components/EnrolPeopleDrawer/EnrolPeopleDrawer.css:3` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.cpd-overlay`, `pages/programs/components/CoursePickerDrawer/CoursePickerDrawer.css:2` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.lpd-overlay`, `pages/programs/components/LearnerProgressDrawer/LearnerProgressDrawer.css:2` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.uf-drawer-overlay`, `pages/people/components/UserFieldDrawer/UserFieldDrawer.css:2` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.scorm-drawer-overlay` (plus `--with-sidebar`), `pages/your-courses/components/ScormDrawer/ScormDrawer.css:2` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.sc-scorm-drawer-overlay`, `pages/scorm-content/components/ScormDrawer/ScormDrawer.css:2` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.roles-panel-overlay`, `pages/roles/Roles.css:776` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.overlay-backdrop`, `pages/my-team/CoursesDrawer.css:7` | overlays.md spec (no shared shell yet) |
| Drawer overlay | `.overlay-backdrop`, `pages/your-courses/components/ContentList/ContentList.css:635` | overlays.md spec (no shared shell yet) |
| Modal overlay | `.assessment-modal-overlay`, `pages/your-courses/components/AssessmentModal/AssessmentModal.css:2` | overlays.md spec (no shared shell yet) |
| Modal overlay | `.media-modal-overlay`, `pages/your-courses/components/AssessmentModal/AssessmentModal.css:450` | overlays.md spec (no shared shell yet) |
| Modal overlay | `.lsm-overlay`, `pages/programs/components/LaunchSuccessModal/LaunchSuccessModal.css:2` | overlays.md spec (no shared shell yet) |
| Modal overlay | `.ccs-overlay`, `pages/your-courses/components/CourseCreatedModal/CourseCreatedModal.css:5` | overlays.md spec (no shared shell yet) |
| Modal overlay | `.force-trigger-overlay`, `pages/automations/ForceTriggerModal.css:5` | overlays.md spec (no shared shell yet) |
| Modal overlay | `.fce-overlay`, `pages/add-content/components/FlashcardEditor/FlashcardEditor.css:1` | overlays.md spec (no shared shell yet) |

## Buttons

| Component | Hand-rolled instance | Should use |
|---|---|---|
| Button | `.programs-create-btn`, `pages/programs/ProgramsAdmin.tsx:196` | `Button` ([buttons.md](buttons.md)) |
| Button | `.pb-next-btn`, `pages/programs/ProgramBuilder.tsx:165` | `Button` |
| Button | `.qb-content-table-add-btn`, `pages/questions-bank/components/ContentTable/ContentTable.tsx:328` | `Button` |
| Button | `.sc-content-table-add-btn`, `pages/scorm-content/components/ContentTable/ContentTable.tsx:295` | `Button` |
| Button | `.create-course-btn-submit`, `pages/your-courses/components/CreateCourseModal/CreateCourseModal.tsx:32` (the Save Draft beside it already uses `Button`) | `Button` |
| Button | `.epd-view-btn`, `pages/programs/components/EnrolPeopleDrawer/EnrolPeopleDrawer.tsx:474` | `Button` |
| Button | `.aim-generate-btn`, `pages/add-content/components/AddImageModal/AddImageModal.tsx:329` | `Button` |
| Button | `.cffm-generating-btn`, `pages/add-content/components/CreateFlashcardsFromFileModal.tsx:218` | `Button` |
| Button | legacy `.btn-primary`, `pages/calendar/CalendarView.tsx:148` | `Button` |

## Bulk action bar

| Component | Hand-rolled instance | Should use |
|---|---|---|
| BulkActionBar | `.lr__bulk-bar`, `pages/my-team/LearningRecordsTab.tsx:471` | `BulkActionBar` (`src/components/BulkActionBar`) |
| BulkActionBar clear control | rotated `Add` icon as "Clear selection", `pages/my-team/LearningRecordsTab.tsx:477` | `BulkActionBar` `onClear` |
| BulkActionBar action | `.lr__bulk-bar-btn`, `pages/my-team/LearningRecordsTab.tsx:481` | `BulkActionBar` children with the `.bulk-bar-btn` classes |

## Close buttons

| Component | Hand-rolled instance | Should use |
|---|---|---|
| CloseButton | `.aim-close`, `pages/add-content/components/AddImageModal/AddImageModal.tsx:177` | `CloseButton` |
| CloseButton | `.cfm-close` (rotated `Add` icon), `pages/add-content/components/CreateFlashcardsModal.tsx:40` | `CloseButton` |
| CloseButton | `.up-filter-row-remove` (rotated `Add` icon), `pages/user-profile/components/CourseFilters/CourseFilters.tsx:307` | `CloseButton` with `ariaLabel` |
| CloseButton | `.assessment-modal-media-remove` (rotated `Add` icon), `pages/your-courses/components/AssessmentModal/AssessmentModal.tsx:507` | `CloseButton` with `ariaLabel` |
| CloseButton | `.assessment-modal-audio-pill-close` (rotated `Add` icon), `pages/your-courses/components/AssessmentModal/AssessmentModal.tsx:584` | `CloseButton` with `ariaLabel` |

## Tooltips

| Component | Hand-rolled instance | Should use |
|---|---|---|
| Tooltip | `.aim-suggest-tooltip`, `pages/add-content/components/AddImageModal/AddImageModal.tsx:262` | `Tooltip` ([alerts-toast.md](alerts-toast.md)) |
| Tooltip | `.force-trigger-tooltip`, `pages/automations/ForceTriggerModal.tsx:258` | `Tooltip` |
| Tooltip | `.cal-mini__tooltip`, `pages/calendar/CalendarView.tsx:374` | `Tooltip` |
| Tooltip | `.pcd-tooltip` ("Start Here!" marker drawn as a tooltip), `pages/courses/ProgramCourseDetails.tsx:65` | `Tooltip` styling |
| Tooltip | `.uf-table-tooltip`, `pages/people/UserFields.tsx:116` | `Tooltip` |
| Tooltip | `.bulk-cell-warning-tooltip`, `pages/people/components/BulkUploadModal/BulkUploadModal.tsx:192` | `Tooltip` |
| Tooltip | `.bulk-cell-error-tooltip`, `pages/people/components/BulkUploadModal/BulkUploadModal.tsx:225` | `Tooltip` |
| Tooltip | `.invite-modal-card-remove-tooltip`, `pages/people/components/InviteModal/InviteModal.tsx:155` | `Tooltip` |
| Tooltip | `.uf-drawer-tooltip`, `pages/people/components/UserFieldDrawer/UserFieldDrawer.tsx:124` | `Tooltip` |
| Tooltip | `.qb-content-table-ai-tooltip`, `pages/questions-bank/components/ContentTable/ContentTable.tsx:212` | `Tooltip` |

## Search

Each of these builds its own `SearchNormal1` icon plus text input.

| Component | Hand-rolled instance | Should use |
|---|---|---|
| Search | `pages/people/People.tsx:847` | `Search` ([search.md](search.md)) |
| Search | `pages/automations/Automations.tsx:1244` | `Search` |
| Search | `pages/roles/components/FiveMinsRolesTab.tsx:192` | `Search` |
| Search | `pages/roles/components/CompanyRolesTab.tsx:133` | `Search` |
| Search | `pages/roles/components/HrisMappingTab.tsx:270` | `Search` |
| Search | `pages/roles/components/RolePanel.tsx:248` | `Search` |
| Search | `pages/your-courses/components/ScormDrawer/ScormDrawer.tsx:116` | `Search` |
| Search | `pages/scorm-content/components/ScormDrawer/ScormDrawer.tsx:114` | `Search` |
| Search | `pages/learning-records/components/FilterListbox/FilterListbox.tsx:265` | `Search` |
| Search | `pages/add-content/components/AddImageModal/AddImageModal.tsx:365` | `Search` |

## Menus

| Component | Hand-rolled instance | Should use |
|---|---|---|
| RowActionsMenu | `.programs-kebab-menu`, `pages/programs/ProgramsAdmin.tsx:281` | `RowActionsMenu` ([listbox.md](listbox.md)) |
| RowActionsMenu | `.pad-menu__list` (header More), `pages/programs/ProgramAdminDetails.tsx:322` | `RowActionsMenu` |
| RowActionsMenu | `.pad-menu__list--reports` (Download Report), `pages/programs/ProgramAdminDetails.tsx:480` | `RowActionsMenu` with `triggerContent` and `caret={false}` |
| RowActionsMenu | `.pad-menu__list`, `pages/programs/ProgramAdminDetails.tsx:559` | `RowActionsMenu` |
| RowActionsMenu | `.content-table-menu`, `pages/your-courses/components/ContentTable/ContentTable.tsx:316` | `RowActionsMenu` |
| RowActionsMenu | `.kebab__menu`, `pages/your-courses/components/ContentList/CurriculumSection.tsx:56` | `RowActionsMenu` |
| RowActionsMenu | `.rd-menu`, `pages/learning-records/components/SaveReportDrawer/SaveReportDrawer.tsx:387` | `RowActionsMenu` |
| RowActionsMenu | `.automations-action-menu`, `pages/automations/Automations.tsx:866` | `RowActionsMenu` |
| RowActionsMenu | `.lr__add-menu` (Add Training), `pages/my-team/LearningRecordsTab.tsx:407` | `RowActionsMenu` with `triggerContent` |

## Tables and pagination

| Component | Hand-rolled instance | Should use |
|---|---|---|
| Table | `.lrn-head` header + rows, `.lrn-pagination`, `pages/your-courses/components/AssessmentsTab/LearnerList.tsx:54` / `:172` | `Table` ([table.md](table.md)) |
| Table | `.lrn-head` header + rows, `.lrn-pagination`, `pages/your-courses/components/AssessmentsTab/MultiQuestionAnswers.tsx:48` / `:150` | `Table` |
| Table | `.asl-head` header + rows, `.asl-pagination`, `pages/your-courses/components/AssessmentsTab/AssessmentList.tsx:22` / `:72` | `Table` |
| Table pagination | `.courses-list-pagination`, `pages/your-courses/YourCoursesList.tsx:218` | `Table` `pagination` prop |
| Table pagination | `.your-courses-enrol-pagination`, `pages/your-courses/YourCourses.tsx:113` | `Table` `pagination` prop |
| Table pagination | `.rd-pagination`, `pages/my-team/ReminderDrawer.tsx:166` | `Table` `pagination` prop |
| Table pagination | `.pad-pagination`, `pages/programs/ProgramAdminDetails.tsx:121` | `Table` `pagination` prop |
| Table pagination | `.epd-pagination`, `pages/programs/components/EnrolPeopleDrawer/EnrolPeopleDrawer.tsx:93` | `Table` `pagination` prop |
| Table | native `<table className="csv-preview-table">`, `pages/people/components/BulkUploadModal/BulkUploadModal.tsx:599` | `Table` |

## Selection controls

| Component | Hand-rolled instance | Should use |
|---|---|---|
| Toggle | `role="switch"` button `.automations-toggle`, `pages/automations/Automations.tsx:832` | `Toggle` ([selection-controls.md](selection-controls.md)) |
| Radio | raw `<input type="radio">`, `pages/people/People.tsx:1020`, `:1033`, `:1067`, `:1080` | `Radio` |

## Date inputs

| Component | Hand-rolled instance | Should use |
|---|---|---|
| DatePickerField | native `type="date"`, `pages/learning-records/LearningRecords.tsx:485`, `:494` | `DatePickerField` |
| DatePickerField | native `type="date"`, `pages/my-team/AddTrainingDrawer.tsx:131`, `:140`, `:151` | `DatePickerField` |
| DatePickerField | native `type="date"`, `pages/people/components/InviteModal/InviteModal.tsx:221` | `DatePickerField` |

## Badges and chips

| Component | Hand-rolled instance | Should use |
|---|---|---|
| Badge | `pages/my-team/StatusBadge.tsx` (`.mt-cp__status-badge--*`, literal rgba fills in `pages/my-team/MyTeam.css:801`) | `Badge` ([badges.md](badges.md)) |
| Badge | `.lrp-badge--*` with literal rgba fills, `pages/learning-records/LearningRecords.css:646` | `Badge` |
| Chip | `.lrp-pill` (filter pill with remove), `pages/learning-records/LearningRecords.tsx:709` | `Chip` with `onDismiss` ([chips-switcher-tabs.md](chips-switcher-tabs.md)) |

## Switcher, breadcrumb, collapse

| Component | Hand-rolled instance | Should use |
|---|---|---|
| ContentSwitcher | `.eng-switcher`, `pages/my-team/EngagementTab.tsx:129` | `ContentSwitcher` ([chips-switcher-tabs.md](chips-switcher-tabs.md)) |
| Breadcrumb | `.add-content-breadcrumb`, `pages/add-content/AddContent.tsx:154` | `Breadcrumb` ([navigation.md](navigation.md)) |
| Collapse | `grid-template-rows: 0fr` expand, `pages/your-courses/components/WorkflowsTab/WorkflowsTab.css:91` | `Collapse` |
| Collapse | `grid-template-rows: 0fr` expand, `pages/people/components/BulkUploadModal/BulkUploadModal.css:206` | `Collapse` |

## Dead code

| Component | Instance | Note |
|---|---|---|
| QuestionEditor | `src/components/QuestionEditor/` | No importers |
| Mobile AssessmentCard | `src/components/mobile/AssessmentCard/` | No importers; spec in [cards.md](cards.md) |
| Mobile InstructorCard | `src/components/mobile/InstructorCard/` | No importers; spec in cards.md |
| Mobile LessonCard | `src/components/mobile/LessonCard/` | No importers; spec in cards.md |
