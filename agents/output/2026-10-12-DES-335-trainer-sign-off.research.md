# DES-335 research notes

12 Oct 2026. Supporting notes for the PRD. Quotes are verbatim; summaries are marked.

## Internal: code read

- `src/App.tsx`: learner `/courses/:id` -> `ProgramCourseDetails`; admin `/your-courses/course` -> `CourseDetails`; `/your-courses/course/assessments/:id` -> `AssessmentAnswers`; `/mobile` -> `MobileApp`.
- `src/pages/courses/ProgramCourseDetails.tsx`: learner chrome (`mt-app`, `learnerSideItems`), header with "Certificate of completion" helper, segmented progress, tabs Course / About / Resources, outline sections with `Collapse`, `LessonCard` (local) with `Lock` for locked rows. Ends with the last section; no certificate block. Supports a builder Preview via router state.
- `src/pages/courses/mockCourse.ts`: one shared outline for every course; `getCourseDetail(id)` reads progress from the program course in `workspace/mockItems.ts`.
- `src/pages/mobile/MobileApp.tsx`: tab shell plus pushed detail screens (program, lesson feed, web view). No course screen. `ProgramScreen.tsx` ends with "Certification" + `ProgramCertificate` (no CTA on mobile).
- `src/components/mobile/LessonCard/LessonCard.tsx` (`MobileLessonCard`): exists, unused anywhere.
- `src/pages/programs/components/ProgramCertificate/ProgramCertificate.tsx` + `docs/design-system/program-certificate.md`: two states only; unlock rule `outline.every(c => c.status === 'completed')`.
- `src/pages/your-courses/CourseDetails.tsx`: `TABS` constant, `?tab=` param, Enrolments uses DS `Table`; header shows "Certificate of completion".
- `src/pages/your-courses/components/AssessmentsTab/AssessmentsTab.tsx`: Download Answers (outlined-2, `CsvIcon`) builds a Blob from `responsesCsv()`; `AssessmentList` / `LearnerList` paginate at 10.
- `src/pages/your-courses/YourCourses.tsx`: tabs Created by You / Active Enrolments / Dashboard; Active Enrolments rows open the course details page.
- `src/pages/programs/coursesCatalog.ts`: `source: 'yours' | '5mins'`, used by the program course picker only.
- Grep for `signature|sign-off|signoff` in `src` and `docs`: no feature hits (only an unrelated code comment and an audit skill table header).

## Internal: design system checked

| Need | Component / doc | Status |
|---|---|---|
| Text fields | `InputField`, `docs/design-system/input.md` (label, helperText, validation error) | Documented |
| Attestation tick | `Checkbox`, `selection-controls.md` (wrap in `<label>`; single opt-in in a form is a listed use) | Documented |
| Buttons | `Button`, `buttons.md` | Documented |
| Web form container | Modal on `ConfirmModal` shell, `overlays.md` | Documented (no dedicated Modal component; shell + className) |
| Mobile form container | Pushed screen; Bottom Sheet ruled out by `overlays.md` ("long or multi-step work gets its own screen") | Documented |
| Status | `Badge` success / warning / in-progress, `badges.md` | Documented |
| Admin list | `Table` + pagination, `table.md` | Documented |
| Empty state | `EmptyState`, `empty-state.md` (no card chrome, 72px illustration) | Documented |
| Confirmation | `Toast`, `alerts-toast.md` | Documented |
| Sign-off card (locked / ready / completed) | none | **Missing: ask for Figma** |
| Certificate document with sign-off block | none (Figma `2504:51984` only) | **Missing: ask for Figma** |
| Mobile course detail screen | none | **Missing: ask for Figma** |

## External: regulation

- SSI 2007/397 reg. 2, verbatim: "The training requirement prescribed for the purposes of paragraph 6 of schedule 3 to the Act is that any person working in the capacity mentioned in sub-paragraph (2) of that paragraph must have received relevant training from a person who at the time of providing the training holds- (a) a personal licence; or (b) a qualification accredited for the purposes of this regulation by the Scottish Qualifications Authority." https://www.legislation.gov.uk/ssi/2007/397/regulation/2/made
- SSI 2007/397 reg. 3: relevant training is "training of at least 2 hours' duration which covers each of the matters specified in the Schedule." https://www.legislation.gov.uk/ssi/2007/397/regulation/3/made
- SSI 2007/546 (Licensing (Mandatory Conditions No. 2) (Scotland) Regulations 2007): inserts para 6(2A)/(2B) into schedule 3; the training record must be kept on the premises, "in the form set out in the Schedule", and produced to a Licensing Standards Officer on request. The Schedule ("Form of training record") is an image on legislation.gov.uk, and the PDF is encrypted, so we could not extract it. https://www.legislation.gov.uk/ssi/2007/546/schedule/made , draft: https://www.legislation.gov.uk/sdsi/2007/9780110784632
- Highland Council copy of the form (text extracted from the PDF), verbatim:
  - Trainee: "I ____ (insert name of staff member) Confirm that I have received the training required by the Licensing (Training of Staff) (Scotland) Regulations 2007." + signature.
  - Trainer: "I ____ (insert name of trainer) Confirm that I have PROVIDED the above named member of staff with the training required under the Licensing (Training of Staff) (Scotland) Regulations 2007 On ____ (insert date or dates)" + signature.
  - "Where signatory (trainer) is the holder of a Personal Licence issued under the Licensing (Scotland) Act 2005, please insert the number and the name of the Licensing Board which issued the licence, below: Personal Licence Number / Licensing Board / Date of Issue".
  - Otherwise: SQA qualification details and company.
  https://www.highland.gov.uk/downloads/file/4610/staff-training-record
- East Ayrshire copy: same trainee and trainer statements. https://www.east-ayrshire.gov.uk/Resources/PDF/L/Licensing-applications/Staff-Training-Record-Licensing.pdf
- Implication: the ticket's three fields match the form, but the form also has Date of Issue, the training date(s) and a trainee declaration. Legal must confirm before the record schema is fixed.

## External: vendors

- Highfield STARS, verbatim: "trainer/personal licence holder sign-in is required to open this course and sign-off is required to complete the course"; "The personal licence holder's name, licence number and issuing licensing board must be provided." No declaration text and no certificate detail on the page. https://www.highfieldelearning.com/online-courses/scottish-training-for-alcohol-retailers-and-servers/
- Sana Labs: the homepage and the compliance page mention automatic certificates and regulator-ready reports, but no sign-off, observation, attestation or signature. https://www.sanalabs.com/products/sana-learn/solutions/compliance-training . No help-centre hits.
- Docebo (search summary; page returned 403): a checklist that needs approval completes only once approved; a rejected checklist lesson can stop the course completing; a mobile app is supported; community threads report observers not seeing checklists. https://help.docebo.com/hc/en-us/articles/11828280338834-Completing-observation-checklists-as-a-learner , https://community.docebo.com/product-q-a-7/can-observation-checklists-be-used-by-the-instructor-of-an-ilt-course-9573
- LearnUpon (403; search summary): the observer approves; checklists can be approved but not rejected. https://support.learnupon.com/hc/en-us/articles/7306365833501
- Click Learning: the manager signs off sections from their own dashboard; the certificate follows a full sign-off. https://support.click-learning.co.uk/portal/en-gb/kb/articles/how-to-sign-off-the-care-certificate
- Flow Learning / MAPAL: nothing public on licence-holder sign-off. Search results: https://theslta.co.uk/?p=1522
- TalentLMS: ILT attendance grading only (2021 note), no completion sign-off. https://www.talentlms.com/blog/2021-november-talentlms-update/
- Cornerstone, Workday Learning: not found in searches.

## External: Mobbin (screens reviewed)

| Interaction | Screen | Note |
|---|---|---|
| Handover | [Kit](https://mobbin.com/screens/40adcbdf-e1ad-43fa-ae1a-ea1ac6b98214) | "Hand the device back to the Boss to complete signing up." One button. |
| Handover | [Amazon Alexa](https://mobbin.com/screens/14ad5889-b8d7-43f1-891b-7ac593308435) | "Hand your phone to Sam"; one line on why; Continue. |
| Attestation | [Lemonade](https://mobbin.com/screens/e6c23f90-ce67-4754-84f4-ffec65aa713a) | The statement is the checkbox label; Next disabled. |
| Attestation | [Turo](https://mobbin.com/screens/1d6e517a-72ef-46ad-90aa-3a6a140c901c) | Acknowledgement checkbox; Submit disabled. |
| Attestation | [Grab Driver](https://mobbin.com/screens/81d09a30-2fbe-4e65-8b5f-6f2263faf0f1) | Titled "Declarations" block. |
| Attestation (rejected) | [Instacart](https://mobbin.com/screens/59352f06-dbf6-4138-b603-0beb8cf4c12c) | Legal text as small print under the button. |
| Locked step | [Uxcel](https://mobbin.com/screens/5827d2fe-01a3-433d-aa90-a6f0d02a061a) | "Earn your course certificate" card with a completion prompt. |
| Locked step | [Podia](https://mobbin.com/screens/7890346d-5fb2-41db-ada6-7f292028d87c) | Lock glyphs on unavailable lessons. |
| Admin list | [Docusign](https://mobbin.com/screens/e760bd28-c2d5-4ab1-835e-13da4af99ca5), [Navan](https://mobbin.com/screens/35faac99-392e-4a4e-b527-cdc404973323), [Google Workspace](https://mobbin.com/screens/c7e98dbc-32a0-4f57-8cef-3659ebfc0899) | Status column, Download / Export top right. |

Not found on Mobbin: any licence, trainer or supervisor sign-off flow.

## External: Build For Mars

`bfm_analyze_lessons` (detailed) returned five UX Bites; none covers attestations, legal sign-off or shared devices. Relevant:
- [Intercepting a share (Flo)](https://builtformars.com/ux-bites/intercepting-a-share-2): explain a mode change in context, at the moment it happens. Supports the handover step.
- [Progress bar personality (Lego)](https://builtformars.com/ux-bites/progress-bar-personality): makes a locked reward feel tangible. Weak support for keeping the locked certificate visible.
The tool's advice on disabled buttons (say what is missing) was general practice, not cited to a BFM study.

## Figma frames reviewed (added after Bruno's answers)

Read with `get_screenshot` and `get_metadata` only.

- **Electronic Signature, `V3yRE8eWKS14Fchx1rqRgT` section `16575:140178` ("light mode")**: web learner course page in locked (`16575:140179`, 90%), ready (`16575:140767`, 85%, line "You have completed every step on this course. Sign to proof completion.") and completed (`16575:140969`, 100%, "View Signature", certificate unlocked with "Download") states; a certificate-preview variant (`16575:140325`, "Certificate of Completion ... Martina Wallace ... Date of issue ... Certificate ID"); "Sign course" modal 900px in Draw (`16575:141170`) and Type (`16575:141375`) tabs with statement "By signing, I confirm that I have successfuly completed the course [title]", Date of issue, Signature ID, button "Sign & Complete Course"; "Congratulations!" completion pages (`16575:142912` and siblings); admin course page (`16575:142524`) with Enrolments tab, a Signature column of per-row download buttons ("Download Digital Signature" tooltip), "Download Report", side nav item "5Mins Courses" and breadcrumb "Courses > 5Mins Picks > Building Company Culture - A Guide for HR Teams". Other frames in the section (quiz, feed, playlist) are unrelated to sign-off.
- **Mobile course details, `13760:212196`**: 375 × 1615 dark frame. Home Header (cover, back, bookmark, share, info card with meta, title, recommended by, jewels / certificate / pass score, two-tone progress 62%); tabs Course / Score / Overview / Resources (3); sections Lessons (three `Card/Lesson` 343 × 88), Situational test (card + "Start" tooltip), Assessments (three locked cards), Certification (row card with medallion, "Certificate of completion", "Finish all lessons and complete the assessments to unlock your certification", lock); Tab nav.
- **Certificates, `Sxl87AiAktDvd6SW6fAtVj` section `8303:159`**: five `Certificate/Courses` frames, 900 × 599. Variants: St James's Place logo + Certificate ID + ISO / IAF / CPD logos; Dropbox logo + CPD; company-name text, Powered by only; two redline variants specifying the logo slot (72px tall). Text: "Certificate of Completion", "This is to certify that", [name], "has successfully completed the course", [course], "Date of issue", "Certificate ID", "Powered by". No sign-off or signature area in any variant.
