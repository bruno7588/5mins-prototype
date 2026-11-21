# DES-366 supporting research: course validity period

Companion to `2026-11-20-DES-366-course-validity-period.md`. Researched 2026-11-20.

## 1. Reference prototypes (claude.ai artifacts)

Both artifacts were read in full.

### Course validity prototype (NLeKQo4tAfjgq8EbpUECoL)

- **Settings control:** a card in Course completion, after Enable Pass Score, with the inline label "Completion valid for", a number field (shown only when a unit is chosen) and one select: No expiry, Months, Years.
- **Helper text:** with a period, "Each completion is valid for 3 years from its completion date. This applies to past and new completions. The Valid until date shows in Learning Records and on the person's Course Progress tab." With No expiry, "Completions never expire. Set a number of months or years if this training has to be renewed, for example 35 months."
- **Error:** "Enter a whole number of 1 or more." (no maximum).
- **Certificate line:** under the Certificate row, only when the certificate is on and a period is set: "The certificate shows the Valid until date."
- **Learning Records:** "Valid until" column; the empty cell is blank; Download certificate per row; "Download certificates" next to Download Report.
- **Course Progress:** "Valid until" column; "Download certificate" in the row menu only on completed courses with a certificate (hidden otherwise, not disabled); bulk bar button "Download certificates"; toast "Downloading one zip with 3 certificates"; if none qualify, "None of the selected courses has a certificate".
- **Certificate:** "Date of completion" and "Valid until" side by side in the footer, US-style "Mar 14, 2028"; no Valid until when the course has no period.
- **Notes in the prototype:** skill certificates (Advanced, Expert, Master) lived on the removed Certificates tab and still need a new home; ship with or straight after DEV-5167 because a PDF is saved the first time anyone downloads it and never changes.

Differences from the repo, carried into the PRD: the repo shows empty cells as a dash (`DateCell`), disables unavailable row actions with a reason (`ACTION_RULES`) instead of hiding them, and formats certificate dates en-GB ("14 Mar 2028", `formatSignOffDate`).

### Certificates after deactivation proposal (BGqrcVbzBd1mgMEwi2Yn78)

- Three stories in order: completion date on certificates (DEV-5167), Download certificate in Learning Records (DEV-5171), bulk download (DEV-5170).
- Learning Records row: "Download certificate" only when completed and at or above the pass score; "Below pass score" otherwise.
- Bulk: "Download certificates (n)" next to Download Report, capped at 1,000 (about 400 MB); over the cap the button is disabled with "Your filters match 12,480 certificates. Narrow your filters to 1,000 or fewer, for example by course or completion date, then download again."; toast "We're preparing 4 certificates for 3 people. We'll email you a download link when the file is ready."
- **Key engineering fact:** `generateCertificateFromTemplate.ts` prints the date at generation, and generated PDFs are cached in S3 for good. This is why a live Valid until (TP decision) needs regeneration logic (PRD Blocker 1).

## 2. Code inventory (verified)

| File | Relevant detail |
|---|---|
| `src/pages/your-courses/components/CourseSettings/CourseSettings.tsx` | `SettingKey` union, `INITIAL_VALUES`, sections array; Course completion = enablePassScore (expand), accessAfterDue, rewards, certificate. `sectionDirty`, `saveSection`, toast only for auto-reset. Uses `Checkbox`, `Toggle`, `InputInteger`, `Collapse`. |
| `src/pages/learning-records/LearningRecords.tsx` | `CourseRecord` (no score, no certificate flag), `courseData` incl. Archived record `11` (older Michael Thompson completion of the same course), `deactivatedData` d1-d4; `courseColumns`; `DateCell`; Include toggles; `downloadCurrentView` toast only. |
| `src/pages/user-profile/UserProfile.tsx` | `TABS` (Engagement, Skills, Course Progress, External Training); `CourseProgress` type and `COURSES`; `DateCell` (dash when null); `downloadCourseCertificate`; `columns` incl. `certificate`; `ROW_MENU_ITEMS`, `BULK_ACTION_KEYS`, `ACTION_RULES`; header "Download Certificates" button with Tooltip "No certificates to download". |
| `src/pages/courses/components/CourseCertificate/CourseCertificate.tsx` | `Field` label/value; "Date of issue" in footer or in the sign-off row; "Certificate ID". |
| `src/data/externalTraining.ts` | `addMonthsClamped`, `retrainingDueDate`, `retrainingLabel` ("No expiry" / "Expires after N months"), `formatDay`, `ADMIN_ROLE` / `isFullAdmin`. |
| `src/pages/account/components/ExternalTraining/CourseDrawer.tsx` | "Expiry" radiogroup: `Radio` "No expiry", `Radio` "Expires after" + `InputInteger` (min 1, max 240, suffix "months"); subtitle about new records only. |
| `src/pages/learning-records/components/ExternalTraining/ExternalRecordsTable.tsx` | `RetrainingDueCell` plain date (Divjot, 2026-11-12); header "Expiry". |
| `ExternalTrainingRecords.tsx`, `src/pages/my-team/LearningRecordsTab.tsx` | Filter "Expiry" with description "Overdue, due soon, valid or no expiry" and option "No expiry". |
| `AddExternalTrainingDrawer.tsx` | Read-only "Expiry" with "No expiry date for a training that wasn't passed." and "Expires after". |
| `src/pages/account/components/ExternalTraining/ExternalTraining.tsx` | Approved list column "Expiry" via `retrainingLabel`; archive copy "still count towards expiry". |
| `src/pages/mobile/ExternalTrainingScreen.tsx` | Learner "Expiry" label (learner view; out of scope). |
| `src/pages/programs/programStore.ts` | `ProgramCertificate.expiryMonths` unused. |

## 3. Design system check

| Need | Component | Doc |
|---|---|---|
| On/off setting with reveal | `Checkbox` + `Collapse` | `selection-controls.md`, `collapse.md` |
| Period number | `InputInteger` (`min`, `max`, `input-integer--inline`, `helperText`, `validation`) | `input.md` |
| Unit | `Dropdown` (`size="md"`, options Months, Years) | `dropdown.md` |
| Date cells | `Table` + `.tbl-date` | `table.md` |
| Row action | `RowActionsMenu` | `row-actions-menu.md` |
| Bulk action | `BulkActionBar` + Actions `RowActionsMenu` | `bulk-action-bar.md` |
| Feedback | `Toast`, `Tooltip` | `alerts-toast.md` |

Gap: `input.md` lists a Radio input type (option row inside a bordered field) with "no shared component yet". Only relevant if the prototype's alternative B became a radio layout.

## 4. Copy decisions (5mins-copy-review applied; Bruno's Title Case button rule overrides the skill's sentence-case buttons)

| Element | Proposed | Note |
|---|---|---|
| Setting title | Completion validity | Checkbox row title |
| Setting description | Set how long a completion counts for, from its completion date. Off = No expiry. | Mirrors "Off = 1 attempt"; answers "from when?" |
| Inline label | Completion valid for | Ticket wording |
| Units | Months, Years | Dropdown options |
| Helper, certificate off | Valid until shows in Learning Records and on Course Progress. | AC4 |
| Helper, certificate on | Valid until shows in Learning Records, on Course Progress and on certificates. | AC3 |
| Error | Enter a whole number from 1 to 240 | 1 to 20 for years |
| Save toast | Completion validity set to 3 years / Completion validity removed | Toast confirms a visible change |
| Column header | Valid until | Both tables |
| Empty cell | the table's dash | Existing `DateCell` |
| Report column | Valid until | After Completion date |
| Certificate field | Valid until | Value "12 Nov 2029" |
| Row action | Download certificate | Disabled reason "Only for completed courses with a certificate" |
| Bulk action | Download certificates | Menu item; toast "Downloading 3 certificates" |
| External: column, filter | Valid until | Was Expiry |
| External: drawer label, radio | Valid for | Was Expiry / Expires after |
| External: summary | Valid for 12 months | Was Expires after 12 months |
| External: subtitle | Changes apply to new records only. The 3 existing records keep their Valid until dates. | Wording only |

"No expiry" is kept: it is the ticket's default name and already used in external training.

## 5. External prior art, detail

- **Workday Learning** ([doc](https://doc.workday.com/admin-guide/en-us/human-capital-management/learning/learning-content/usx1517492748668.html)): expiry by date, duration ("relative to the date the learner completes the content") or recurrence; "Workday automatically runs a daily background job to recalculate expiration dates on learning records." Manual resets are exempt. Closest to option A.
- **Docebo** ([community thread](https://community.docebo.com/docebo-superadmins-46/certification-renewal-change-11633), [help](https://help.docebo.com/hc/en-us/articles/37477792146194)): moving from Never to 2 years left existing learners on Never; the renewal date is set on issue. Admins re-import by CSV. Evidence that freezing (option B) creates admin work.
- **TalentLMS** ([certifications](https://help.talentlms.com/hc/en-us/articles/9651316373148-How-to-work-with-certifications), [2019 update](https://www.talentlms.com/blog/2019-talentlms-winter-update/), [reassign before expiry](https://help.talentlms.com/hc/en-us/articles/9651339325340-How-to-re-assign-courses-to-users-before-a-certification-expires-in-TalentLMS)): duration from "Forever" to months or years; reassignment and notifications are separate options (we keep those out).
- **Mitti, formerly SafetyCulture EdApp** ([help](https://help.mitti.com/007121)): "Expiry can be displayed on the completion certificate for recurring courses." "Issued certificates remain valid for that specific completion." When a course becomes recurring, "existing completions are checked against the new schedule".
- **Schoox** ([help](https://support.schoox.com/hc/en-us/articles/4412559738519), 403 on fetch; search snippet): editing expiry after completion "will have no effect on this user's certificate".
- **Thought Industries** ([help](https://support.thoughtindustries.com/hc/en-us/articles/360045729094), search snippet): no expiry, after N days, or on a date.
- **iHasco** ([article](https://ihasco.freshdesk.com/support/solutions/articles/103000270009)): only the title "How to hide/show the Expiry date on certificates" was readable; the help centre has moved.
- **Cornerstone** ([what's new](https://help.csod.com/help/csod_0/Content/0_Whats_New/242/Learning/Certification_Enhancement_for_Expired_Certs/Certification_Enhancement_for_Expired_Certifications_242.htm), 404 on fetch; search snippet): expired certifications and recertification start-date rules. Status-heavy; rejected.
- **Moodle Workplace** ([certifications](https://docs.moodle.org/405/en/Certifications), search snippet): expiry dates and grace periods.
- **Sana Labs**: two searches and one fetch of sanalabs.com returned nothing on certificate validity. No verdict.

## 6. Mobbin (web)

| Screen | Notes |
|---|---|
| [Squarespace](https://mobbin.com/screens/3f23e195-c201-407a-a8b5-bafb7c9c79f7) | Billing cycle dropdown "Never Expires / Expires After..." then a number |
| [Clerk](https://mobbin.com/screens/bceecfc6-3efc-4ef5-a682-54f7ede1dae5) | "Free trial" toggle with description; when on, a number with a "Days" unit |
| [Sweatpals](https://mobbin.com/screens/a527bcdf-f3d1-4b49-b412-c3a5ac999708) | Number field beside a "Hours" unit dropdown |
| [Vanta settings](https://mobbin.com/screens/f4bbf4e3-67c1-44e4-b930-2f8bce72d735) | Single dropdown of preset durations |
| [7shifts](https://mobbin.com/screens/806539a9-f62a-44fd-aad4-db4283e65b31) | Certifications table: Expiration Date column and a "Valid" status pill; Export CSV |
| [Vanta people](https://mobbin.com/screens/c1b82d05-6d17-453c-8beb-bf6e757f24b5) | Empty End date cells as a dash |
| [Deel](https://mobbin.com/screens/9f5af254-f966-4810-adbb-c428854523e3) | Compliance documents table with Bulk action menu; status-led, not date-led |

## 7. Build For Mars

- [Fuzzy Context](https://builtformars.com/ux-glossary/fuzzy-context): answer who sees it and what it changes; two names for one concept create ambiguity. Supports the helper text and the rename.
- [Dynamic insurance reminder](https://builtformars.com/ux-bites/dynamic-insurance-reminder) and [Contextualising dates](https://builtformars.com/ux-bites/contextualising-dates): relative cues ("in 32 days") save mental arithmetic. The BFM analysis suggested an Expiring soon badge; rejected because AC11 rules out statuses. The underlying need (find what runs out before the inspection) is the open Valid until filter question.
