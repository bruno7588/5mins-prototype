# DES-335 Trainer sign-off as an end-of-course requirement (Scottish licensing)

PRD and design brief · 12 Oct 2026 (revised after Bruno's answers and Figma review) · Engineering: DEV-4731 (epic), DEV-4732, DEV-4733, DEV-4734

## 1. Context

### The problem

Scottish alcohol licensing customers (Millennium hotels) need every staff training record to carry the Personal Licence Holder's confirmation: the holder's name, personal licence number, issuing licensing board, and a statement that they delivered the training. The licence holder belongs to the premises and changes often across a multi-site group, so it cannot be a static admin value; it has to be captured when the learner completes the course. **Table stakes:** a locked end-of-course step, a short form with a required declaration, details printed on the certificate, an admin list with CSV export. Highfield's Scottish staff course works the same way. **Novel for 5Mins:** this is our first course step completed by someone other than the learner, on the learner's device. The handover moment has no precedent in our product or in the Electronic Signature Figma, and is where the design effort should go.

### What the code does today

| Area | What exists | Gap for DES-335 |
|---|---|---|
| Electronic Signature (the "sibling") | Not in code. Designed in Figma (`V3yRE8eWKS14Fchx1rqRgT`, section `16575:140178`); see the Figma map in section 3. | Figma is the placement and locking reference; we rebuild it with DS components. |
| Learner course page, web | `src/pages/courses/ProgramCourseDetails.tsx` at `/courses/:id`, data from `getCourseDetail()` in `src/pages/courses/mockCourse.ts`. Tabs Course / About / Resources; outline is collapsible `.pcd-section` groups with `Collapse`. | No Signature, Sign-off or Certification section after the outline; the certificate is only a header helper line. No per-course flag for extra requirements. |
| Learner course page, mobile app | `src/pages/mobile/MobileApp.tsx` in `PhoneFrame` (dark only): For You, Workspace, Program (`ProgramScreen.tsx`), lesson feed. `MobileProgramCourseCard` has no tap action. `MobileLessonCard` and `MobileAssessmentCard` exist in `src/components/mobile/` but no screen uses them. | No mobile course screen. Bruno's decision D7 adds one. |
| Certificate | `ProgramCertificate` (`src/pages/programs/components/ProgramCertificate/`, doc `program-certificate.md`): Locked and Unlocked cards, program level. | The issued certificate document is not built in code. Bruno's decision D8 points to the Certificates Figma. |
| Admin course details | `src/pages/your-courses/CourseDetails.tsx` at `/your-courses/course`; `TABS` = Course Content, Enrolments, Assessments, Settings, Overview; tab kept in `?tab=`. Assessments tab = `AssessmentsTab.tsx` (outlined-2 "Download Answers" with `CsvIcon`, paginated lists). | One mocked course, no per-course config, no 5Mins-authored versus own course distinction. |
| How an admin reaches a 5Mins course | Prototype: Your Courses > Active Enrolments rows open `/your-courses/course` for any enrolled course. The Electronic Signature Figma shows a "5Mins Courses" admin menu item and a breadcrumb "Courses > 5Mins Picks > [course]" landing on the same tabbed course details page. | Confirmed by Bruno: admins can open 5Mins courses (D15). |

### Decisions taken

| # | Question | Decision |
|---|---|---|
| D1 | Admin scope | DES-335 only: responses list with status, submitted details, date and CSV export. Filters, admin reset with superseded history and the learner-record view (DEV-4734) are not designed here. |
| D2 | Admin home | A **Sign-off** tab on the course details page, next to Assessments, shown for any course with the requirement on. (The Electronic Signature Figma used a column in Enrolments instead; we keep Bruno's tab.) |
| D3 | Prototype HTML files | Reference only. The 5Mins DS and the existing course page win. |
| D4 | Build target | Prototype across all four surfaces: web learner course page + form, mobile app, certificate, admin Sign-off tab. |
| D5 | Wording | Use the ticket's wording for now: the three fields (Personal Licence Holder name, personal licence number, issuing licensing board) and an attestation that the holder delivered the training. Legal copy replaces it later as a straight copy swap. The council form's extra fields (licence date of issue, training dates, staff declaration) are **not built**. |
| D6 | Sign-off design reference | Electronic Signature Figma `16575:140178` is reference only (a bit old). Rebuild with DS components. |
| D7 | Mobile course page | Make the mobile course cards tappable and build the mobile course details page from Figma `13760:212196`, using DS components. |
| D8 | Certificate | Design the certificate from the Certificates Figma (`Sxl87AiAktDvd6SW6fAtVj`, section `8303:159`). |
| D9 | Form container, web (recommended here) | Centred Modal on the `ConfirmModal` shell, as the Figma "Sign course" modal does, with two steps inside: handover, then form. |
| D10 | Form container, mobile (recommended here) | Full screen pushed over the mobile course screen (back returns to it), same two steps. Not a Bottom Sheet: overlays.md keeps sheets for short details, and the keyboard would cover three fields. |
| D12 | Certificate layout | The sign-off block fits on the **one** certificate page; no second page and no taller page. |
| D13 | Figma parts with no DS component | Build them as the Figma shows (page-local), restyled with tokens: Sign-off row card and its illustration, the grey statement panel, the mobile course header and its two-tone progress bar. Do not wait for new DS components. |
| D14 | Mobile Certification | Reuse `ProgramCertificate`. |
| D15 | Admin access to 5Mins courses | Confirmed: customer admins can open 5Mins-authored courses, so the Sign-off tab on the course details page (D2) works in production. |
| D11 | Handover (recommended here) | A dedicated handover step before the form on both platforms: who holds the device now, what they will confirm, one button only the licence holder should press (Kit and Amazon Alexa use the same pattern). Figma has no equivalent because Electronic Signature is self-signed. |

### Acceptance criteria (verbatim from DES-335)

1. **Sign-off section on the learner course page (web + mobile app)** - sits between the course content and the Certificate item, mirroring the existing Signature section's placement. States: locked (with "finish the course first" messaging), ready (call to action to start the sign-off), and completed (what the learner sees afterwards, e.g. signed-by and date).
2. **The sign-off form / handover moment** - the framing that tells the learner to hand the device over, the three licence fields, the attestation checkbox, and the disabled-until-complete submit. Decide full-page vs modal, and the mobile handover treatment.
3. **Certificate** - the sign-off block: signer role, the three licence details, attestation wording and date, rendered consistently on the existing certificate layout.
4. **Admin responses view (customer admin)** - per-course list of learners with signed / awaiting sign-off status, the submitted details, date, and CSV export; lives with the existing course-page response surfaces.

### Out of scope

Backoffice toggle (DEV-4732); tenant configuration, custom fields and editable attestation wording; Reflection and Rating activities; drawn or captured signatures (the Figma Draw tab) and sign-off from the licence holder's own account; standalone sign-offs outside a course; custom positioning on the certificate; issuing-board dropdown (free text); prefill of the last licence holder per venue; non-licence-holder trainers with an SQA qualification; the council form's licence date of issue, training dates and staff declaration (D5); admin filters by status and date range, admin reset with superseded history, and sign-off details on the learner's course record (DEV-4734, deferred).

## 2. Research

Full notes, quotes and extra links: `2026-10-12-DES-335-trainer-sign-off.research.md`.

### The regulation and its form

| Source | What it says | Verdict |
|---|---|---|
| [SSI 2007/397, reg. 2](https://www.legislation.gov.uk/ssi/2007/397/regulation/2/made) | Staff must receive training "from a person who at the time of providing the training holds (a) a personal licence; or (b) a qualification accredited ... by the Scottish Qualifications Authority". No record or wording here. | Adopt (a) only, per DEV-4732. (b) out of scope. |
| [SSI 2007/546 Schedule, "Form of training record"](https://www.legislation.gov.uk/ssi/2007/546/schedule/made) | The statutory form. legislation.gov.uk shows it only as an image; its PDF is encrypted, so we could not quote it directly. | Source of truth for the later legal copy swap. |
| [Highland Council staff training record](https://www.highland.gov.uk/downloads/file/4610/staff-training-record) (council copy of the statutory form) | Trainer statement: "I [name of trainer] confirm that I have provided the above named member of staff with the training required under the Licensing (Training of Staff) (Scotland) Regulations 2007 on [date or dates]", then a signature. Licence holder fields: **Personal Licence Number, Licensing Board, Date of Issue**. The form also has a trainee declaration: "I [name] confirm that I have received the training required by ...". | Not adopted for the prototype (Decision D5 uses the ticket wording). Kept as input for legal: the form also asks for the licence date of issue and the training date(s), and has a trainee declaration. |
| [East Ayrshire training record](https://www.east-ayrshire.gov.uk/Resources/PDF/L/Licensing-applications/Staff-Training-Record-Licensing.pdf) | Same trainer and trainee statements as Highland. | Corroborates the wording. |

### Handover moment

| Source | What it does | Verdict |
|---|---|---|
| [Highfield STARS](https://www.highfieldelearning.com/online-courses/scottish-training-for-alcohol-retailers-and-servers/) | "Trainer/personal licence holder sign-in is required to open this course and sign-off is required to complete the course"; must provide "name, licence number and issuing licensing board". | Adopt sign-off to complete. Reject sign-in to open (not requested; adds a second handover). |
| [Mobbin: Kit "Hand the device back to the Boss"](https://mobbin.com/screens/40adcbdf-e1ad-43fa-ae1a-ea1ac6b98214) | Full-screen interstitial naming who holds the phone next, one button "It's the Boss' turn again!". | Adopt the pattern: a dedicated handover step with one button. |
| [Mobbin: Amazon Alexa "Hand your phone to Sam"](https://mobbin.com/screens/14ad5889-b8d7-43f1-891b-7ac593308435) | Illustration, the title names the person, one line on what they will do, Continue. | Adopt the copy structure (who, what, one action). |
| [Built For Mars: Intercepting a share (Flo)](https://builtformars.com/ux-bites/intercepting-a-share-2) | Explains a mode change at the exact moment it matters. | Adopt: explain why sign-off is needed on the handover step, not earlier. |

### Attestation form

| Source | What it does | Verdict |
|---|---|---|
| [Mobbin: Lemonade consent](https://mobbin.com/screens/e6c23f90-ce67-4754-84f4-ffec65aa713a), [Turo review and submit](https://mobbin.com/screens/1d6e517a-72ef-46ad-90aa-3a6a140c901c) | The statement is the checkbox label; primary button stays disabled until it is ticked. | Adopt (matches DEV-4733). |
| [Mobbin: Grab Driver declarations](https://mobbin.com/screens/81d09a30-2fbe-4e65-8b5f-6f2263faf0f1) | Declaration as its own titled block above the submit. | Adopt: the attestation sits in its own block under the fields. |
| [Mobbin: Instacart business info](https://mobbin.com/screens/59352f06-dbf6-4138-b603-0beb8cf4c12c) | Legal text as small print under a disabled Confirm. | Reject: the regulation's wording must be ticked, not small print. |
| [Mobbin: Shopee personal information](https://mobbin.com/screens/3e6abfc1-10b0-472b-8969-375e0f4c24b4) | Confirm is greyed out with nothing saying why. | Reject the silent version: a helper line next to the disabled button says what is still needed. |

### Locked completion step

| Source | What it does | Verdict |
|---|---|---|
| [Mobbin: Uxcel course page](https://mobbin.com/screens/5827d2fe-01a3-433d-aa90-a6f0d02a061a) | "Earn your course certificate - Complete the course to earn your certificate" card under the outline. | Adopt: a plain "complete X first" line on the locked card. |
| [Mobbin: Podia locked lessons](https://mobbin.com/screens/7890346d-5fb2-41db-ada6-7f292028d87c) | Lock glyph on rows not yet available. | Already our pattern (`Lock` Bold on `.pcd-lesson--locked`). |
| [Docebo: observation checklists](https://help.docebo.com/hc/en-us/articles/11828280338834-Completing-observation-checklists-as-a-learner) (403 to fetch; summary from search) | A checklist that needs approval counts as complete only once approved, and gates course completion. Community threads report observers not finding checklists. | Adopt the gating. Reject observer-in-own-account (out of scope and fragile). |

### Certificate block

| Source | What it does | Verdict |
|---|---|---|
| Highland / East Ayrshire forms (above) | The record lists trainer name, licence number, licensing board, statement and date. | Adopt as the content of the certificate block. |
| [Sana Learn compliance training](https://www.sanalabs.com/products/sana-learn/solutions/compliance-training) | "Certificates and badges are issued automatically on completion." No sign-off, attestation or signature. | Nothing to adopt. |

### Admin responses

| Source | What it does | Verdict |
|---|---|---|
| [Click Learning: sign off the Care Certificate](https://support.click-learning.co.uk/portal/en-gb/kb/articles/how-to-sign-off-the-care-certificate) | Manager dashboard lists learners with "Not signed off" sections; certificate follows full sign-off. | Adopt the per-learner status list. Reject manager-side signing. |
| [LearnUpon OTJ verification](https://support.learnupon.com/hc/en-us/articles/7306365833501) (403; search summary) | Observer approves; approvals can't be rejected. | Note only. |
| [Mobbin: Docusign users](https://mobbin.com/screens/e760bd28-c2d5-4ab1-835e-13da4af99ca5), [Navan users](https://mobbin.com/screens/35faac99-392e-4a4e-b527-cdc404973323) | Status badges in a column; Export or Download as a secondary button top right. | Adopt; matches our Assessments "Download Answers". |

### Mobbin

Useful: the handover interstitials (Kit, Alexa), declaration checkboxes gating a disabled button (Lemonade, Turo, Grab), the course-certificate card (Uxcel) and status-plus-export admin lists (Docusign, Navan). Nothing on Mobbin shows a licence or trainer sign-off itself.

### Build For Mars

`bfm_analyze_lessons` found no lessons on attestations, legal sign-off or shared devices. The nearest were [Intercepting a share](https://builtformars.com/ux-bites/intercepting-a-share-2) (explain a mode change at the moment it happens) and [Progress bar personality](https://builtformars.com/ux-bites/progress-bar-personality) (make a locked reward feel tangible). Its advice on disabled buttons is general UX practice, not a BFM study.

### Where sources yielded nothing

Sana Labs: no sign-off, observation or attestation feature found (site and search). Flow Learning / MAPAL: nothing public on how their licence-holder sign-off works. TalentLMS, Cornerstone, Workday Learning: no native trainer sign-off on course completion found. legislation.gov.uk: the 2007/546 form is an image only.

## 3. Implementation

### Blockers

None. Resolved by Bruno: attestation wording (D5), Electronic Signature reference and sign-off card design (D6), mobile course page (D7), certificate (D8), certificate layout (D12), parts with no DS component (D13), mobile Certification (D14), admin access to 5Mins courses (D15).

### Figma reference and component map

Figma is from before the current DS (light mode only, 2024-25 copy). Rebuild every part with the components below; never copy Figma values that disagree with tokens.

**Sign-off reference: Electronic Signature, `16575:140178`** (web learner frames `16575:140179` locked, `16575:140767` ready, `16575:140969` completed; modal `16575:141170` Draw and `16575:141375` Type; completion page `16575:142912`; admin `16575:142524`).

| Figma part | What it shows | Build with | Stale versus current DS |
|---|---|---|---|
| Course page order | Lessons, Assessments, **Signature**, **Certification**, as flat titled sections. | Keep the prototype's collapsible outline; add Sign-off and Certification sections after it with the `.pcd-section` heading style. | Figma has a Score tab and flat lesson lists; the prototype's Course / About / Resources tabs and grouped outline win. |
| Signature card | Row card: pen-nib illustration, "Digital signature" / "Sign to complete this course", trailing button. Locked: whole card dimmed and a grey "Sign Course" button. Ready: a section line "You have completed every step on this course..." and a filled "Sign Course". Completed: outlined "View Signature". | Card surface tokens (`--cards-background`, radius tokens), `Button` (filled primary, outlined), `Badge` success for the completed state. | Locked state fakes disabled with opacity: use `--text-disabled` and `--button-background-disabled` instead. Copy "Sign to proof completion" is a typo. No DS component for this row card: build it page-local from the Figma (D13); export the pen-nib illustration from Figma. |
| "Sign course" modal | 900px modal: title, subtitle, Draw / Type tabs, dashed draw pad with Clear, grey statement panel ("By signing, I confirm..." + Date of issue + Signature ID), centred disabled "Sign & Complete Course". Type tab: "Your name" field with amber active border. | `ConfirmModal` shell + `CloseButton`, `InputField` x3, `Checkbox` in a `<label>` for the attestation, `Button` (outlined-2 + filled) bottom right. | DS modal is 720px with buttons right-aligned, not 900px centred. Draw / Type tabs not needed (typed fields only). The grey statement panel has no DS component: build it page-local from the Figma (D13), holding the attestation checkbox and the date. |
| Completion page | Full page: green tick, "Congratulations!", "You've completed the course [title]", "Keep Learning". | Not built here: the existing course completion moment is outside this ticket. After sign-off we return to the course page with a toast. | "Congratulations!" exclamation is fine for a completed course per the copy rules if the screen is ever reused. |
| Admin Enrolments | Enrolments table with a Signature column holding a per-row download button ("Download Digital Signature" tooltip) and "Download Report" CSV top right. | Not followed (D2). Our Sign-off tab uses `Table`, `Badge`, `Search`, outlined-2 "Download CSV" with `CsvIcon`. | Figma table predates the DS `Table`; row button labelled "Button" is a placeholder. |

**Mobile course details page, `13760:212196`** (375 × 1615, dark).

| Figma part | What it shows | Build with | Stale versus current DS |
|---|---|---|---|
| Header ("Home Header", 344px) | Gradient cover, circular back, bookmark and share icon buttons over it; inner card with meta (lessons, minutes), 3-line title, "Recommended by", helper row (jewels, Certificate, Pass score) and a two-tone progress bar with %. | Icon-only buttons (no tooltips in the mobile app); `ProgramScreen` banner CSS pattern for the cover; meta icons from Iconsax. | No shared mobile course-header component and no DS doc for the two-tone progress bar: build both page-local from the Figma (D13). |
| Tabs | Course / Score / Overview / Resources (with count badge). | Same tab set as the web prototype: Course / About / Resources, `chips-switcher-tabs.md` tab spec. | Score and Overview tabs do not exist in the prototype. |
| Lessons | `Card/Lesson` 343 × 88: thumbnail, title, instructor, time, progress bar or tick. | `MobileLessonCard`. | None found. |
| Situational test | Card with assessment illustration and a "Start" tooltip pointer. | `MobileAssessmentCard`; "Start" pointer as on web (`.pcd-tooltip`). | Prototype has no situational test in the mock course; skip unless Bruno wants it. |
| Assessments | Locked cards (dimmed, lock icon trailing). | `MobileAssessmentCard` with `disabled`. | Dimming must use disabled tokens, not opacity. |
| Certification | Row card: 56px medallion, "Certificate of completion", "Finish all lessons and complete the assessments...", trailing lock. | `ProgramCertificate` with a course title prop (D14). | Copy says "Finish"; use "Complete". |
| Sign-off section | Not in this frame. | Mobile version of the web Sign-off card, placed between Assessments and Certification. | n/a |
| Tab nav | Home / Search / Progress / Feed / Profile. | Existing `MobileTabNav`. | None. |

**Certificate, `8303:159`** (five `Certificate/Courses` variants, 900 × 599 landscape).

| Figma part | What it shows | Build with | Notes |
|---|---|---|---|
| Frame | Off-white card with guilloche pattern, gold medallion top right (240px), 56px padding. | New `CourseCertificate` component (page-local), tokens only. | **Guilloche and gold medallion assets need exporting from Figma**; the repo's `certificate/medallion.svg` is the cyan program star. |
| Header | Company logo (72px tall slot), or company name text, or nothing. | Logo slot; demo uses company name text. | Variants show with and without logo. |
| Body | "Certificate of Completion", "This is to certify that", learner name (large), "has successfully completed the course", course title. | Typography tokens. | None. |
| Footer | Date of issue, Certificate ID (optional), accreditation logos ISO / IAF / CPD (optional), "Powered by 5Mins". | Logos optional; demo shows Powered by only. | None. |
| Sign-off block | **Not in the frame.** The 900 × 599 layout is full; the body ends 32px above the edge. | Fit the block on the same 900 × 599 page (D12): tighten the body spacing and run the sign-off as a compact band above the footer (see phase 5). | Needs a layout pass so the page does not feel crowded. |

### Phases

| # | Change | Files | Verifies | AC |
|---|---|---|---|---|
| 1 | **Data.** Add `requiresSignOff` to `CourseDetail`. New `src/data/trainerSignOff.ts`: record type (holder name, licence number, issuing board, attestation text as shown, signed at, learner id), `SIGN_OFF_ATTESTATION` holding the ticket wording (D5): "I confirm that I am a Personal Licence Holder and that I delivered this training to [learner name].", learner sign-off store, about 25 admin rows (signed, awaiting, in progress) and `signOffCsv()`. One demo course at 100% needing sign-off, one in progress. | `src/pages/courses/mockCourse.ts`, `src/data/trainerSignOff.ts` (new) | `npm run build`; both demo courses render. | 1-4. Done |
| 2 | **Web Sign-off section.** After the outline: "Sign-off" section, then "Certification". Card built page-local from the Figma Signature row (D13), with the Figma illustration. **Locked**: title "Licence holder sign-off", body "Complete the course first. Then your Personal Licence Holder signs off your training here.", disabled **Start Sign-Off** (DS disabled tokens). **Ready**: section line "You have completed every step. Hand your device to your Personal Licence Holder to sign off.", filled **Start Sign-Off**. **Completed**: success `Badge` "Signed off", "Signed off by [name] on [12 Oct 2026]", "Licence [number] · [board]". Course stays under 100% and the certificate stays locked until signed. State swaps animate (`Collapse` / `AnimatePresence` + `arrive.ts`). Classes `.pcd-signoff-`. | `ProgramCourseDetails.tsx` + `.css`, `src/pages/courses/components/SignOffCard/` (new), `ProgramCertificate.tsx` (optional title prop) | Each demo course shows the right state; keyboard reachable with `:focus-visible`; certificate locked until signed. | 1. Done |
| 3 | **Web form.** `ConfirmModal` shell at the DS 720px width, `CloseButton`, Escape and backdrop close. **Step 1, handover**: "Hand over to your Personal Licence Holder" / "[Learner name] has completed this course. A Personal Licence Holder needs to confirm they delivered the training. Only the licence holder should continue." / **Cancel**, **Continue as Licence Holder**. **Step 2, form** (anatomy from the Figma Type tab): "Confirm the training"; `InputField`s "Personal Licence Holder name", "Personal licence number", "Issuing licensing board"; grey statement panel built from the Figma (D13) holding `Checkbox` + `SIGN_OFF_ATTESTATION` and today's date; **Back**, **Sign Off Training** disabled until complete, with a helper line saying what is missing. Empty field on blur: `validation="error"`, "Enter the [field]". Submit: "Signing off...", close, toast "Training signed off", card to Completed, certificate unlocks. Steps swap with `AnimatePresence` + `arrive.ts`; reduced motion respected. | `src/pages/courses/components/SignOffModal/` (new, `.pcd-signoff-modal-`) | Button disabled with any gap; focus trap and return; stored record holds the exact text shown. | 2. Done |
| 4 | **Mobile course page and sign-off.** (a) Make course cards tappable: optional `onClick` on `MobileProgramCourseCard`, passed from `ProgramScreen`. (b) `MobileApp` gains `openCourseId` and pushes `CourseScreen` (back returns to the program). (c) `CourseScreen` from Figma `13760:212196` per the map above: header and two-tone progress bar built page-local (D13), Course / About / Resources tabs, Lessons (`MobileLessonCard`), Assessments (`MobileAssessmentCard`), Sign-off card, Certification (`ProgramCertificate`, D14). (d) Start Sign-Off pushes `SignOffScreen`, same two steps and copy as web, primary button pinned at the bottom; back returns to the course. Dark tokens only. Classes `.m-course-` / `.m-signoff-`. | `src/components/mobile/ProgramCourseCard/ProgramCourseCard.tsx`, `src/pages/mobile/ProgramScreen.tsx`, `MobileApp.tsx`, `CourseScreen.tsx` + `.css`, `SignOffScreen.tsx` + `.css` (new) | At `/mobile`: program > course > Start Sign-Off > handover > form > course shows Completed and the certificate unlocks. | 1, 2. Done |
| 5 | **Certificate.** `CourseCertificate` from Figma `8303:159` (company-name header variant, Powered by footer). Same page (D12): a compact "Training sign-off" band above the footer with "Signed by: [name], Personal Licence Holder", "Personal licence number: [number]", "Issuing licensing board: [board]", the attestation exactly as stored, "Date: [12 Oct 2026]". Opened from **Get Certificate** in a modal on web; mobile shows the certificate card without a CTA, as `ProgramCertificate` does today. | `src/pages/courses/components/CourseCertificate/` (new), exported Figma assets | Block shows the values typed in phases 3-4; wording matches the record character for character. | 3. Done |
| 6 | **Admin Sign-off tab.** `{ key: 'signoff', label: 'Sign-off' }` after Assessments when `requiresSignOff`. `SignOffTab`: `Search`, outlined-2 **Download CSV** with `CsvIcon`, `Table` with Learner (name + email), Status (`Badge` success "Signed off" / warning "Awaiting sign-off"), Licence holder, Licence number, Issuing board, Signed on; pagination at 10. `EmptyState` (72px illustration, no chrome): "No sign-offs yet" / "Learners appear here once they complete the course and their licence holder signs off." CSV: learner name, email, team, completion date, status, holder name, licence number, issuing board, attestation text, signed on. Classes `.cd-signoff-`. | `CourseDetails.tsx`, `src/pages/your-courses/components/SignOffTab/` (new) | `?tab=signoff` deep-links and survives Back; CSV opens with UTF-8 names; pagination over 25 rows. | 4. Done |
| 7 | **Checks.** `npm run build`; copy review over new strings; walk web in light and dark and mobile in dark; fresh `ux-auditor` briefed with the ticket and routes only. | n/a | No type errors; no copy Blockers; auditor findings triaged. | 1-4. Build and walkthroughs done; copy review and ux-auditor not run yet |

Copy note: the copy skill's word list asks for sentence-case buttons; project rules say Title Case, so buttons are Title Case. "Finish" in the ticket and Figma becomes "Complete".

### Risks to watch during build

- The learner can fill in the form themselves; the handover step only makes it deliberate (accepted in DES-326, matching Highfield). Legal should know.
- Holding the course under 100% until sign-off may confuse learners who have done every lesson; keep the Sign-off card in view.
- The Figma locked states use opacity; rebuilding them literally breaks the DS disabled rule.
- `ProgramCertificate` is shared; the new title prop must default to today's text.
- CSS is globally bundled: grep `.pcd-signoff-`, `.m-course-`, `.m-signoff-`, `.cd-signoff-` before adding.

### Still open

Legal copy swap for the attestation and field labels, plus legal's view on the council form's licence date of issue, training dates and staff declaration (not built, D5); whether the page-local parts built under D13 (Sign-off row card, statement panel, mobile course header, two-tone progress bar) should become DS components later; guilloche, gold medallion and pen-nib illustration assets to export from Figma; "Awaiting sign-off" versus a third "In progress" status for learners still learning (recommend "In progress"); what learners see if the requirement is switched off mid-course or after a retake.
