# DES-336 research: external training improvements

Supporting evidence for `2026-11-05-DES-336-external-training-improvements.md`. Date: 2026-11-05. Sources were read, not just listed; where a source returned nothing useful, it says so.

---

## 1. What 5Mins does today

### Help centre (live product)

[External training records](https://help.5mins.ai/articles/1886875-external-training-records):

- Learning Records > External Training > Add training opens the "Add External Training" drawer, or Bulk upload CSV.
- Fields: learner email (records can exist before the person registers), training name (free text), provider (free text), start date, completion date, optional expiration date, duration (minutes, hours, days), optional score, optional result (Passed / Not Passed), optional certificate (PDF, JPG, PNG, max 10 MB).
- Expiring records feed **Automate Reports**: a recurring email of training expiring within a look-ahead window, **default 3 months**. This supports the 90-day Due soon window in the plan.
- Records are edited from the row's three-dot menu; bulk delete via checkboxes.
- The article does not say how CSV duplicates or errors are handled.

### Prototype code

| File | What it does | Relevance |
|---|---|---|
| `src/pages/learning-records/LearningRecords.tsx` | Admin `/learning-records`. Page-local `externalData: ExternalRecord[]` (10 rows) with `email`, `training`, `provider` (free text), `startDate`, `completionDate`, `expiration`, `duration`, `score`, `result`, `hasCertificate`. `externalColumns` render on the shared `Table`; Download and the kebab are `.ui-disabled`. **No Add Training button on this page.** Has a `showArchived` `Toggle` pattern for the 5Mins tab | Gets the Add Training menu and a Retraining due column |
| `src/pages/my-team/LearningRecordsTab.tsx` | My Team > Learning Records (learner app chrome, manager view). `ContentSwitcher` 5Mins Courses / External Training; on External, an **Add Training** button opens a menu: "Add training" (opens `AddTrainingDrawer`) and "Bulk upload CSV" (`.ui-disabled`) | Conflicts with "managers view only" (epic out of scope). The add actions belong on the admin page |
| `src/pages/my-team/AddTrainingDrawer.tsx` | Page-local side drawer: Email, Training name, Training provider name (`InputField`), start / completion / expiration dates as `InputField type="date"` (DS says use `DatePickerField`), hand-rolled duration and score steppers (DS says `InputInteger`), Result `Dropdown`, `FileUploader size="L"` at the bottom, one Add Training button | Rebuilt: certificate first, approved course picker, calculated due date |
| `src/pages/account/Account.tsx` | `/account`, `TABS` array (Layout, Audit Log, Skill Lessons Visibility, ... Hugo AI, Content Access), page-local tab bar `.acs-tab`, `?tab=` deep link | New `external-training` tab |
| `src/pages/user-profile/UserProfile.tsx` | One page for `/people/:id` (admin chrome) and `/my-team/people/:id` (learner chrome, `isLearnerView`). `TABS = ['Engagement', 'Skills', 'Course Progress', 'Certificates']`; only Course Progress is live, others `.ui-disabled`. Resolves `PEOPLE[id] ?? teamProfiles[id]`, so a manager URL finds anyone | New External Training tab; manager scope guard |
| `src/pages/my-team/MyTeam.tsx` | `learnerSideItems` includes "Profile" and "My Progress" **with no path** | No learner own-profile page exists |
| `src/pages/people/components/BulkUploadModal/BulkUploadModal.tsx` | Steps `upload` → `preview` → `success`; error categories with chip filters, per-cell error tooltip, downloadable error file | Pattern to reuse for both CSV uploads |
| `src/components/` | `Table`, `RowActionsMenu`, `Badge`, `Toggle`, `Radio`, `Dropdown` (searchable, multiple, option `icon`/`description`/`action`, `helperText`, `error`), `InputField`, `InputInteger`, `DatePickerField`, `FileUploader` (one file, states Enabled/Uploading/Filled/Error, Preview + Change File), `AIWorkingCard`, `Alert` (Callout / Alert), `Toast`, `ConfirmModal`, `EmptyState`, `Search`, `Chip`, `ContentSwitcher`, `Collapse`, `CloseButton` | Everything the flows need exists except a "create new" row inside a select, and a per-field "AI filled" marker |
| `src/assets/empty-state-illustrations/` | `certificates.svg`, `empty-box.svg`, `no-results.svg` among others | Illustrations for the three empty states |

### Reference prototype (behaviour, not binding)

Artifact `3c75ae0e` (saved HTML). Useful content and behaviour:

- **Approved list**: providers show "N courses · N records"; courses show "Provider A or Provider B · 2 days · Expires after 36 months" and "Also matches: “Food Hygiene L2”". Rows with records offer **Archive**, unused rows offer **Delete**. Footer: "Once a provider or course has records, it's archived instead of deleted. Archived ones aren't offered for new records or uploads, and their records keep counting."
- **Course form**: name, accepted providers (checkboxes, "A certificate from any of them counts. The same licence often comes from different trainers."), duration + unit, expiration (Doesn't expire / 6 / 12 / 24 / 36 / 60 months), other names. Editing a course with records: "N records point at this course, so they show the new name."
- **Add training drawer**: person, course combobox (matches names and aliases; no match → "Nothing on the approved list matches “x”. Add it to the approved list"), completion date, certificate; a read-only "From the approved list" panel shows provider (radio when several), duration, calculated expiration date.
- **CSV + zip review**: People ("45 rows matched to people by email. Row 31 ... isn't anyone in 5Mins, so it's skipped."), Training (matched list, names not on list with "Close to X" and a choose-or-skip select, "Remember these names for the next upload"), Certificates ("44 rows matched a file in certificates.zip by its file name. Rows 12 and 40 have no file, so they're added without a certificate."), **Already in 5Mins** ("39 rows match a record you already have, with the same person, training and completion date, so they're skipped"), **What changes** (list of new records), commit "Add N records".
- **Latest record logic**: only the newest record per person and course counts; earlier ones collapse into "2 earlier records: 12 Mar 2021, ...". `SOON = 90` days.
- Differences from the plan: separate "External Trainings" menu item, no one-off setting, no AI, overdue only when the person's role requires the course, Delete with Undo toast.

---

## 2. Prior art

### Approved catalogue and retraining rules

| Source | What it does | Adopt / reject |
|---|---|---|
| [Mapal Flow: What is External Training?](https://help.mapal-os.com/flow-learning/learning-and-development/external-training/introduction-to-external-training/) | External training items are built in a catalogue (type, provider, instructions), follow "the same refresher rules as internal training", support bulk historical upload and **archiving** to keep the catalogue current; certificates sit on the learner profile next to the record | Adopt: catalogue + archive is what Mapal switchers expect (epic context) |
| [Mapal: add and edit refresher rules](https://help.mapal-os.com/flow-learning/learning-and-development/landd-settings/refresher-l-d-settings/add-and-edit-refresher-rules/) | Refresher fires a set time after completion; new rules apply from the day they are added | Adopt: "rule changes apply to new records only" matches |
| [Mapal Flow release 15 Jan 2026](https://mapal-os.com/en/solutions/learning/flow-learning-releases/flow-learning-release-15012026) | Same training can refresh at **different intervals per department** (as reported by search summary; page not read in full) | Reject for MVP; log as a follow-up (see "Research suggests revisiting") |
| Mapal: [Build External Training](https://support.dev.mapal-os.com/hc/en-gb/articles/34498464383890-Build-External-Training), [Archive External Training](https://support.dev.mapal-os.com/hc/en-gb/articles/34498442289042-Archive-External-Training), [Mark complete](https://support.dev.mapal-os.com/hc/en-gb/articles/34488602879634-Mark-an-External-Training-record-as-complete) | Returned HTTP 403; titles only | Nothing usable beyond the titles |
| [Workday Learning admin guide](https://doc.workday.com/admin-guide/en-us/human-capital-management/learning/learning-content/usx1517492748668.html) | Per search summary: external learning content **can't** use retraining or expiration rules; expiration by duration is calculated from the completion date | Shows the gap: calculated retraining for external training is not table stakes in big LMSs |
| [Docebo: external training and certifications](https://help.docebo.com/hc/en-us/articles/360020083240) | Certifications are linked to external training from the External Training area; the external completion date becomes the certificate issue date; expiry in days / weeks / months / years | Adopt: completion date drives the due date. Reject days/weeks granularity: months only (plan) |
| [Docebo community: renewals](https://community.docebo.com/product-q-a-7/renewals-and-certification-4622) | Renewal archives the previous enrolment and certificate; the new completion carries the new award | Adopt: newest record supersedes older ones and they never flag |
| [TalentLMS: re-assign before certification expires](https://help.talentlms.com/hc/en-us/articles/9651339325340-How-to-re-assign-courses-to-users-before-a-certification-expires-in-TalentLMS) | Expiry set per course; re-assign 1 week or 30 days before expiry | Informs only; no external records found |
| [Articulate community: tracking external certifications](https://community.articulate.com/discussions/building-better-courses/tracking-external-certifications-in-lms) | Admins work around missing external tracking with "course shells" per external course | Confirms the approved-list model is what admins improvise elsewhere |
| [Sana: manually completing learner progress](https://help.sana.ai/en/articles/96382-manually-completing-or-resetting-learner-progress) | Only "Set to complete" / "Reset progress" for Sana courses. [Sana external training](https://sanalabs.com/solutions/external-training) is about training external audiences (customers, partners), not outside training | **Nothing useful from Sana** for this feature |

### Recording a training and the certificate

| Source | What it does | Adopt / reject |
|---|---|---|
| [Cornerstone: add external training to certification](https://help.csod.com/help/csod_0/Content/User/Learning/Manage_Your_Transcript/Certifications/External_Training_-_Add_to_Certification_Details.htm), [Minnesota courts QRG](https://MNCourts.gov/mncourtsgov/media/scao_library/CJI/QRG-Employee-Learning-Adding-an-External-Training.pdf) | Learner-submitted external training with free-text title, provider, dates, cost, credit hours; supervisor approval | Reject: learner submission is out of scope and free text is the problem we are fixing |
| [Mapal: upload supporting documents](https://help.mapal-os.com/flow-learning/learning-and-development/external-training/upload-supporting-documents-for-an-external-training/) | Certificate uploaded to an existing record after the event | Adopt: certificate can be added later (supports "still open" answer) |
| SafetyCulture credentials help ([004559](https://help.safetyculture.com/004559), [003827](https://help.safetyculture.com/003827)) | Credentials carry issue and expiry dates with "expiring soon" / "expired"; bulk upload up to 20,000; media is required by default but the admin can choose **"Make media optional"** to upload first | Adopt: certificate optional to save, with the row showing "–" |
| [Schoox: reassignment after manual completion](https://sigmasupport.schoox.com/hc/en-us/articles/35746619812247-Understanding-Immediate-Course-Reassignment-After-Manual-Completion) | Backdated completions can create an already-expired certificate that immediately triggers reassignment | Adopt as a risk: show the due state in the drawer before saving |
| [Totara: upload certification records](https://totara.help/18/docs/upload-certification-records) | CSV import calculates expiry from completion date when no expiry is given | Adopt: CSV rows get the due date from the course rule |

### AI reading a document into a form

| Source | What it does | Adopt / reject |
|---|---|---|
| [Expensify SmartScan (Mobbin)](https://mobbin.com/screens/7ac3095f-78b8-43f8-8cfe-0a686ffea815) | "SmartScanning... We're transcribing the details of your receipt. No need to wait around" with a **"Fill out the details myself"** button; receipt preview beside the form | Adopt: a manual escape is always visible while AI reads |
| [Acctual new bill (Mobbin)](https://mobbin.com/screens/b812e034-b340-4c0d-b7ee-41d556ea1f07) | "Scanning your invoice to auto-fill the details" banner; fields greyed until filled; document shown beside the form | Adopt the banner; reject the side-by-side preview (720px drawer can't fit it; FileUploader Preview opens the file) |
| [QuickBooks uploaded receipt (Mobbin)](https://mobbin.com/screens/13555932-4086-4811-a214-0deccbce373d) | "Review details. Double-check the details and add any missing info." above pre-filled fields | Adopt: one Callout flags the filled fields for checking |
| [Mercury expense (Mobbin)](https://mobbin.com/screens/739e3947-628e-4a2c-8f32-b31114a3df5b) | Receipt drop zone at the top of the form: "We can pull your transaction details automatically" | Adopt: upload sits first in the drawer |
| [Deel add items (Mobbin)](https://mobbin.com/screens/10d935d5-f3f8-448b-8bb5-0c7195e61ed4) | Uploaded file preview, required fields listed below, unmatched values left empty | Adopt: empty course when no confident match |
| Expensify review guides ([Mintlify mirror](https://www.mintlify.com/Expensify/App/features/expenses/smartscan)) | When extraction fails, the app says which fields are missing and asks for manual entry | Adopt: unreadable certificate keeps the form open, never a dead end |

### Picking from a list, or adding a new entry

| Source | What it does | Adopt / reject |
|---|---|---|
| [Melio add vendor (Mobbin)](https://mobbin.com/screens/22b6930f-3b4a-421f-9b67-e53578b97a26) | Search field; "No options" then **"Add new vendor"** inside the menu | Adopt the idea; built as a button under the field because `Dropdown` has no footer row |
| [HubSpot add to list (Mobbin)](https://mobbin.com/screens/86857734-421a-4c66-97f3-b03af54ce9e0), [Bonsai new project (Mobbin)](https://mobbin.com/screens/c7bbb8d9-25a5-4b69-823d-d7ca93eb7ac8) | "Create new list" / "+ New Client" as a row in the select | Same as above |
| [folk no results (Mobbin)](https://mobbin.com/screens/88bfa6c2-d2a2-4b42-9f86-0d8bf29a02fd) | No results state offers `Create "alex"` with the typed text | Adopt: carry the typed or read text into the new course form |

### Bulk import with preview

| Source | What it does | Adopt / reject |
|---|---|---|
| [Customer.io import review (Mobbin)](https://mobbin.com/screens/ea216cbe-fc77-4dd1-ae77-66bb8f2bce1b) | Counts (new, existing, warnings, errors), "Export error file", "Go back to upload" | Adopt counts and error file |
| [Attio review values (Mobbin)](https://mobbin.com/screens/60a1cfe5-3788-49e3-b3ae-3da62a33f7ee) | "Needs review" group: raw value → mapped value, fix inline | Supports matching unknown course names to approved courses (see revisit item 2) |
| [Fresha preview client list (Mobbin)](https://mobbin.com/screens/2d5e41af-fe36-493e-a2e3-0e1b0306d8a0) | Tabs "To be imported (1)" / "Errors (2)" with reasons per row | Adopt as Chip filters (no nested tabs) |
| [Square review and fix errors (Mobbin)](https://mobbin.com/screens/2bf8396f-b5eb-4c32-ad6e-ee71118f27ae) | Download error report, Upload fixed errors | Adopt: error file + re-upload |
| [7shifts import (Mobbin)](https://mobbin.com/screens/6b45f042-7f89-46f1-b46f-8270604842b8) | Imports valid rows and skips errors, with a re-upload button | Adopt: partial import of valid rows |

### Expiry status in tables

| Source | What it does | Adopt / reject |
|---|---|---|
| [7shifts certifications (Mobbin)](https://mobbin.com/screens/806539a9-f62a-44fd-aad4-db4283e65b31) | Employee, certification type, status badge (Valid), expiration date, file link | Adopt: date plus badge; reject a "Valid" badge (plain date for upcoming, no invented state) |
| [Vanta tests (Mobbin)](https://mobbin.com/screens/eb1d71b4-2b3c-4a83-8435-bdc0e7cbb9e2) | "Needs attention" counts Overdue / Due soon; Due soon badge | Adopt naming "Overdue" and "Due soon" |
| [Employment Hero compliance (Mobbin)](https://mobbin.com/screens/ecc8864e-8e9f-441b-b923-4d5ff3a765f9) | "Overdue by 1 day" text per row | Reject: badge plus date is shorter and consistent with DS badges |

### Build For Mars

| Lesson | How it applies |
|---|---|
| [Wise: upload an invoice](https://builtformars.com/ux-bites/upload-an-invoice) | Says what the file must contain, and "We use AI to process your document. Please check the results." Adopt both in the drawer |
| [Monzo: incorrect recipient details](https://builtformars.com/ux-bites/incorrect-recipient-details) | Name the exact mismatch field by field. Learner mismatch alert names both people |
| [Slack: catching common typos](https://builtformars.com/ux-bites/catching-common-typos) | Warn, but let the user carry on. Mismatch alert never blocks saving |
| [Substack's danger zone](https://builtformars.com/ux-bites/highway-to-the-danger-zone), [intentional friction](https://builtformars.com/ux-glossary/intentional-friction) | Confirm Delete with the exact loss; Archive is reversible, so a lighter confirm |
| [TikTok: reducing deletion churn](https://builtformars.com/ux-bites/reducing-deletion-churn) | A softer alternative to delete keeps data. Supports Archive over Delete for used entries |

BFM search for bulk-import previews returned nothing specific (Monzo, Asana, Stripe items only); Mobbin covered it.

---

## 3. Findings that questioned the plan (resolved 2026-11-05)

1. **Certificate-first with no skip.** Resolved: upload first with "Fill In Manually" always visible (D14), certificate optional to save (D17).
2. **CSV spelling variants.** Resolved: a match step in the CSV preview remembers each mapping as the course's other name (D15); no other-names field to maintain in Settings.
3. **Department-specific intervals.** Resolved: one rule per course (D16); per-department intervals are a follow-up.
4. **Due soon = 90 days** is backed by 5Mins' own Automate Reports default (3 months). No change.
