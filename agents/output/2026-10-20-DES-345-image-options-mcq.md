# DES-345 Image options in multiple choice assessments

PRD and design brief · 20 Oct 2026 · Reporter and specs owner: Nicolas Darriulat · Design: Bruno Carvalho · Customer: Park Stars Entertainment (critical) · Planned release: 27 Nov 2026

## 1. Context

### The problem

Park Stars Entertainment trains frontline staff on things that are easier to recognise than to describe: the right wristband, the correct safety sign, a clean versus a dirty station. They need multiple choice questions where the answers are pictures, and several can be right. **Table stakes:** Kahoot, Google Forms, Interact and LifterLMS all ship image answers, and multi-select via checkboxes is standard. **Novel for 5Mins:** image-only options with no text label, a multi-correct question in the course builder (today it allows one correct answer), and a classic assessment that learners can actually play on web and mobile, which the prototype does not yet do.

### What the code does today

| Area | Today | Gap for DES-345 |
|---|---|---|
| Course builder MCQ editor | `AssessmentModal.tsx` (`src/pages/your-courses/components/AssessmentModal/`), type `'single-choice'`, title "Add assessment - Multiple Choice", subtitle "Users can select one correct choice". Options are `string[]`; one `correctIndex: number` set with DS `Radio` plus a Success `Badge` "Correct". One question-level image or audio with crop. Footer `Save` only. Opened inside `ContentDrawer.tsx`. | No option mode, no image per option, no multiple correct, no Preview. |
| Preview pattern | `InteractiveDrawer.tsx`: `Save` + outlined-2 `Preview`; opens `ConfirmModal` + `DesktopPreview` (544x812, the learner panel width) running the real learner renderer with `QuizHeader`. | Reuse as is for the MCQ. |
| Question bank editor | `QuestionEditor.tsx` with `mockQuestions.ts`: `multiple_choice` and `multi_select` ("Select all that apply"), answers `{ id, text, isCorrect }`, 2 to 6. Not built from DS controls. | Out of scope (D5); stays text only. |
| Learner renderers | `src/pages/quiz-lab/formats/SingleChoice.tsx` and `SelectAll.tsx`, `FeedbackFooter` (`Check`, `Continue`), `ResultBanner` ("Well done!", "Not quite!"), `quiz-lab.css` (`--selected` fill, success and danger tints). Untouched options are never graded. | `SelectAll` reveals the count ("Select Four", "Select 2 More", caps at 4) and turns a wrong set all red. Both conflict with decisions 2 and 4. No image tile. |
| Learner web | `ProgramCourseDetails.tsx` (`/courses/:id`) plays authored interactive questions in a `pcd-quizstage` dialog; `previewCourse.ts` only carries `InteractiveQuestion`s. | Classic MCQ is not playable on learner web. |
| Learner mobile app | `CourseScreen.tsx` lists `MobileAssessmentCard`s with no `onClick`. App is dark only via `PhoneFrame`. | No assessment-taking screen. |
| Admin results | `AssessmentAnswers.tsx`, `AnswerStats.tsx`, `assessmentResults.ts` key everything on option text and one `correctIndex`. | Image options would show blank labels; D7 makes them show thumbnails. |
| DS parts | `AddImageModal` (upload, Generate With AI, Stock Footage; used for course, lesson and program thumbnails), which wraps `FileUploader` (Enabled, Uploading with `progress`, Error with `errorMessage`, Filled with `filledPreview`), `Checkbox`, `Radio`, `ConfirmModal`, `Tooltip`, `Toast`. | No documented image option tile, admin or learner. Figma `Quiz/Options` (`5504:24966`) is text only and has no code component. |

### Decisions taken

| # | Topic | Decision |
|---|---|---|
| D1 | Assessment type | Image Choice is its own assessment type, listed after Multiple Choice in Add Content > Assessments (changed 20 Oct; was a Text/Image switch inside Multiple Choice). Every option is an image; text and image options never mix. |
| D2 | Scoring | All-or-nothing: correct only if the learner selects exactly the correct set. The prompt says "Select all that apply" and never reveals how many are correct; after Check the feedback gives counts (20 Oct, D12). |
| D3 | Alt text | No alt text field. Screen readers hear "Option 1", "Option 2" and so on. WCAG 1.1.1 is logged as a risk, not a blocker. |
| D4 | Feedback after submit | Every image stays after Check (changed 20 Oct; was picks only). Right picks: green with a tick. Wrong picks: red with a cross. Correct images not picked: dashed green frame, no badge. Unpicked wrong images: unmarked. Prior art: Canvas, Quizlet, Open edX. |
| D5 | Where it is built | Create Course > Assessments only (`AssessmentModal` in the course builder). The question bank and lesson quizzes do not get image answers. |
| D6 | Correct answers per type | Multiple Choice stays single-correct. Several correct answers exist only in Image Choice. |
| D7 | How image options are shown to admins | Image thumbnails, never "Option N", in both the assessment preview and the admin answers view (`AssessmentAnswers`, `AnswerStats`): wherever admins see learner answers to an image question. |
| D8 | File types | JPG, PNG, WebP and GIF. |
| D9 | Option count | The form starts with 2 image options; admins can add as many as they want. No maximum. |
| D10 | Learner button | Stays "Check", then "Continue", following the same patterns as the other assessments. |
| D11 | Shuffle | Not shuffled. Image options appear in the order the admin set them, on every attempt. |
| D12 | Partly correct answer | The marks on the images explain the result (D4), so the banner shows only a heading: "Partly right" when every pick was right but some were missed, "Not quite!" otherwise, followed by the admin explanation if there is one. Screen readers hear the counts: "You got {n} of {total} correct images, picked {w} wrong and missed {m}." (20 Oct). |
| D13 | Image source | Same pattern as course and lesson thumbnails: each option opens the existing `AddImageModal` (`src/pages/add-content/components/AddImageModal/AddImageModal.tsx`) with its three default tabs, "Upload image", "Generate With AI" and "Stock Footage". |

### Acceptance criteria

The ticket has no formal ACs; the "What to design" bullets and states are quoted verbatim and numbered.

1. MCQ editor (admin web): "set each option as an image"
2. MCQ editor (admin web): "upload and replace an image"
3. MCQ editor (admin web): "mark one or more options as correct"
4. MCQ editor (admin web): "preview the question as learners will see it"
5. MCQ editor states: "empty option, uploading, uploaded, upload error"
6. MCQ question with image options (learner web and learner mobile app): "view the image options"
7. Learner web and mobile: "select one or more answers and submit"
8. Learner states: "unselected, selected, correct, incorrect"
9. Deliverables: "Admin web, learner web and the learner mobile app"

### Out of scope

Image answers in the question bank (`QuestionEditor`) and lesson quizzes; image options in polls and AI generation; multiple correct answers in text MCQs; text labels on image options; mixing text and image options; partial credit; an alt text field; revealing missed correct answers; video or audio as options; redesigning the admin answers view beyond showing thumbnails.

## 2. Research

Full notes, including Mobbin screenshots, are in `2026-10-20-DES-345-image-options-mcq.research.md`.

### Authoring image options

| Source | What it does | Adopt or reject |
|---|---|---|
| [Interact image answers](https://help.tryinteract.com/en/articles/736700-how-to-add-image-answers-to-your-quiz) | One question-level "Use Image Answers" switch; recommends 300x250px. | Rejected (D1): a separate Image Choice type replaces the switch. |
| [Kahoot images as answers](https://support.kahoot.com/hc/articles/360055063614) | Image button beside each answer; PNG, JPEG, GIF; up to 80MB and 3264x3264px. | Adopt per-option upload. Reject 80MB; too heavy for a mobile feed. |
| [TalentLMS question types](https://help.talentlms.com/hc/en-us/articles/9652288801820-What-are-the-available-question-types) | Multiple response with checkboxes; media only above answers; 10MB image cap. | Adopt checkboxes for "correct" and a 10MB cap. |
| [Typeform image sizes](https://www.typeform.com/developers/create/image-sizes/) and [community](https://community.typeform.com/build-your-typeform-7/why-are-the-images-for-picture-choice-so-small-4230) | Resizes uploads (800px, 460px mobile); learners find picture tiles too small. | Adopt server resize; keep tiles large (2 columns). |
| [LifterLMS picture multiple choice, multiple correct](https://lifterlms.com/docs/picture-multiple-choice-multiple-correct-answers-question-type/) | Dedicated type for picture options with several correct. | Confirms table stakes. |
| [Google Forms image answers](https://alicekeeler.com/2016/08/22/google-forms-images/) | Image per option on Multiple choice and Checkboxes, always with a text label. | Adopt checkbox semantics for multi-select; reject labels for now. |
| [Sana question generator](https://help.sana.ai/en/articles/7497-using-sana-s-question-generator) | MCQ generation documented. | Sana yielded nothing on image answer options. |
| [Docebo community](https://community.docebo.com/product-tips-tricks-3/gift-with-medias-format-is-there-a-plugin-or-other-way-to-get-pictures-in-questions-8020), [Cornerstone release note](https://help.csod.com/help/csod_0/Content/0_Whats_New/Past_Releases/2020/Whats_New_02212020.htm) | Images in question stems only. Workday Learning: nothing found. | Nothing usable. |

### Selecting, grading and accessibility

| Source | What it does | Adopt or reject |
|---|---|---|
| [Duolingo exercise types](https://duolingo.fandom.com/wiki/Exercise) | Pick-the-picture grid, Check, then green or red. | Adopt; quiz-lab already follows this rhythm. |
| [UGA multi-select grading](https://help.elc.uga.edu/assessments/quizzes/types_of_questions.html) | All-or-nothing versus right-minus-wrong. | All-or-nothing (D2). |
| [NYU WCAG 1.1.1 notes](https://digitalaccessibility.nyu.edu/testing/sc111.html) | An image that is a control's only label fails 1.1.1 and 4.1.2 without a text alternative. | Logged as a risk (D3). |
| [VCCS accessible assessment](https://www.vccs.edu/?p=960617) | Alt text must describe what is visible without giving the answer away. | Input for a later alt text phase. |

### Mobbin

| Screen | What it shows | Adopt or reject |
|---|---|---|
| [MacroFactor body fat picker](https://mobbin.com/screens/e9b0da95-4ee5-4e68-a43b-838f0dd9d6b5) | Image grid; selected tile gets a heavy border plus a tick. | Adopt: selection never by colour alone. |
| [Shopify select files](https://mobbin.com/screens/fe4c261c-8197-4870-b362-a4156979d55c) | Corner checkbox on each photo, "3 selected" count. | Adopt the corner checkbox. Reject the count; it hints at the answer count. |
| [Lloyds choose an image](https://mobbin.com/screens/29c4c331-1bf5-4ce3-8ed6-d2464576f0b1) | 2-column tiles, CTA pinned at the bottom. | Adopt 2 columns and the pinned CTA (already `FeedbackFooter`). |
| [Mintlify select image](https://mobbin.com/screens/b3577b1a-4241-411c-b5ae-1dfde5c82f63) | Upload tile sits inside the grid of images. | Adopt: an empty option is an upload tile in the grid. |
| [Recraft upload](https://mobbin.com/screens/6809d485-ceb3-421c-ad3b-249decdf973f) | Formats line next to the upload. | Adopt the formats hint in the field label. |
| [Bloom logo issue](https://mobbin.com/screens/a291e401-7442-4a35-a66f-95af90872263) | Error in place, with reason and re-upload. | Adopt (FileUploader Error state). |
| [fal image inputs](https://mobbin.com/screens/1f39059b-e27c-4973-aacf-5fe18aeca376) | Error shown away from the failed slot. | Reject. |

Mobbin had no admin editor where every answer is an image upload; the editor is assembled from the upload-tile and image-grid patterns above.

### Build For Mars

| Lesson | Principle | Adopt or reject |
|---|---|---|
| [Hinge's photo tips](https://builtformars.com/ux-bites/hinges-photo-tips) | A grid of upload tiles plus a short tip on what works. | Adopt a one-line hint. |
| [Incorrect recipient details (Monzo)](https://builtformars.com/ux-bites/incorrect-recipient-details) | Mark each item right or wrong in place. | Adopt per-pick marks (D4). |
| [Creating confidence from errors (Lovable)](https://builtformars.com/ux-bites/creating-confidence-from-errors) | An error says what happens next. | Adopt: every upload error names the fix. |
| [Animated quiz master (Ahead)](https://builtformars.com/ux-bites/animated-quiz-master) | Small motion makes answering feel responsive. | Adopt the existing quiz-lab select cue. |

BFM had no lesson specific to image-only multi-select quizzes.

## 3. Implementation

### Blockers

| # | Blocker | Recommendation |
|---|---|---|
| B1 | **Makes AC3 unbuildable.** `AssessmentData.correctIndex` is one number, and the editor uses a `Radio`. Several correct answers cannot be stored. | Change options to `{ id, text?, image?, isCorrect }[]` (the shape `mockQuestions.ts` already uses), with `optionMode: 'text' \| 'image'` on the question. Text mode is unchanged: `Radio`, exactly one correct, and the existing "Users can select one correct choice" subtitle (D6). Only image mode uses `Checkbox` and allows one or more correct; switching back to text never carries several correct flags over. |
| B2 | **Makes AC1, AC5, AC6 and AC8 unbuildable to DS standard.** No Figma or doc for the admin image option tile (upload, correct, replace, remove) or the learner selectable image tile (unselected, selected, correct, incorrect, focus, both themes). | Ask for Figma for both before build. Proposed admin tile: the course thumbnail box (`cdt-thumb__box`, empty and filled) that opens `AddImageModal` (D13), a `Checkbox` "Correct" under it, and icon-only Replace and Remove with `Tooltip`. Proposed learner tile: 1:1 image in a `ql-token`-style frame, corner `Checkbox` glyph on select, `--selected` border, success and danger tints plus `TickCircle` and `CloseCircle` icons after Check. |
| B3 | **Makes AC6 to AC8 unbuildable on learner surfaces.** Classic MCQs have no learner screen: web only plays interactive formats, mobile cards have no tap. | New renderer `ImageChoice` in `src/pages/quiz-lab/formats/`, hosted in the existing `pcd-quizstage` (web) and a new branch from `MobileAssessmentCard` `onClick` in `CourseScreen.tsx` (mobile, inside `PhoneFrame`). |
| B4 | Image rules: file types and option count are now set (D8, D9); size cap and aspect ratio still need Nicolas's sign-off. | JPG, PNG, WebP and GIF; max 10MB each; square 1:1 crop using `AddImageModal`'s `upload.confirm` zoom-and-Save step (D13). That step re-encodes to PNG through a canvas, which would freeze a GIF, so GIFs skip it and keep their animation, framed square by the tile instead. 2 options by default, no maximum. |
| B5 | Correct picks can sit beside a wrong result: with D2 and D4, a learner who picks 2 of 3 correct images sees 2 green marks but fails. The ticket does not define this state. | **Resolved (20 Oct, D4 and D12).** Missed correct images are shown with a dashed green frame; the banner heading says "Partly right" or "Not quite!". |

### Proposed behaviour and copy

Copy follows the 5mins-copy-review skill; button copy is Title Case per house rules.

- **Entry point (AC1).** "Image Choice" in Add Content > Assessments, after Multiple Choice, with the Iconsax `Gallery` icon. Form title "Add assessment - Image Choice", subtitle "Users can select one or more correct images". No mode switch: Multiple Choice keeps its text form unchanged. The outline card borrows the Multiple Choice illustration until design supplies one.
- **Options grid (AC1, AC2, AC5).** Starts with 2 empty tiles (D9). Label "Images (JPG, PNG, WebP, GIF • max. 10MB)" with hint "Use clear, similar-sized photos. Learners see them as squares." Empty tile: dashed box with `GalleryAdd` and an "Add Image" button, as in the course thumbnail row (`CourseDetailsTab.tsx`). Clicking it opens `AddImageModal` (D13) with the default tabs `['upload', 'generate', 'freepik']`, `showSuggest={false}`, and `upload` set to `accept: '.jpg,.jpeg,.png,.webp,.gif'`, a `validate` for the 10MB cap and `confirm: true` for the square crop (skipped for GIFs, B4). Uploading, AI generating and stock loading show the modal's own progress. Uploaded: the tile shows the image, then icon buttons "Replace image" (reopens `AddImageModal`) and "Remove option" (aria-label and Tooltip). Upload errors show inside the modal's `FileUploader`: "This image is over 10MB. Choose a smaller file.", "Use a JPG, PNG, WebP or GIF image.", "Upload failed. Try again." The existing "Add Option" button adds a tile, with no limit.
- **Correct answers (AC3).** `Checkbox` labelled "Correct" under each uploaded tile, aria-label "Mark option 2 as correct". Save stays disabled until there are at least 2 uploaded images and 1 correct, and no upload is in progress.
- **Preview (AC4).** Outlined-2 "Preview" beside "Save", as in `InteractiveDrawer`, opening `ConfirmModal` + `DesktopPreview` with the learner renderer, so the admin sees the image thumbnails, not "Option N" (D7).
- **Learner (AC6 to AC8).** Question text, then "Select all that apply" in `--text-secondary`. Options are laid out in a 2-column grid of square tiles in both the 544px web panel and the 375px phone. Each tile is a checkbox-role button named "Option 1", "Option 2" and so on, in the order the admin set them (D11). `FeedbackFooter` `Check` (D10) is disabled until 1 pick and never shows a count. After Check: picks marked correct or incorrect; unpicked tiles dim and stay unmarked; banner "Well done!" or "Not quite!" (plus "You missed at least one correct image." when a correct image was missed, D12); then `Continue`.
- **Themes.** Admin and learner web in light and dark; the mobile app is dark only. Semantic tokens only (`--selected`, `--text-on-selected`, `--border-elevated`, success and danger tints as in `quiz-lab.css`).

### Phases

| # | Change | ACs | What verifies it |
|---|---|---|---|
| 0 | Figma for both tiles (B2); Nicolas confirms the size cap and crop (B4) and B5. | 1, 5, 6, 8 | Figma links in the ticket. |
| 1 | **Done (20 Oct).** Data model: a new `image-choice` assessment type with `optionImages` and `correctIndices`; Multiple Choice limited to one correct; all-or-nothing scoring helper keyed on option ids. | 3, 7 | Vitest: exact set passes; subset, superset and mixed fail; text mode rejects a second correct. `pnpm build`. |
| 2 | **Done (20 Oct).** Editor: Image Choice menu entry and form (replaced the Option type radio on 20 Oct), image grid of thumbnail tiles opening `AddImageModal` (upload, generate, stock), Checkbox correct, replace and remove, validation. | 1, 2, 3, 5 | /test-feature on the course builder: each state reachable, keyboard only, both themes. |
| 3 | **Done (20 Oct).** `ImageChoice` renderer, with a `/quiz-lab` entry for review. | 6, 7, 8 | Vitest for grading and for "no count shown"; screen reader names "Option N" follow the admin's order. |
| 3a | ~~Shuffle per attempt~~ Dropped (D11): options keep the admin's order. | n/a | n/a |
| 4 | **Done (20 Oct).** Editor Preview button. | 4 | Preview renders the same component as phase 3 at 544px. |
| 5 | **Done in Quiz Lab (20 Oct):** the image question plays at /quiz-lab, Mobile and Desktop, instead of the course page or mobile app. Original plan: Learner web: `pcd-quizstage` branch and `previewCourse.ts` carries the MCQ. | 6, 7, 8, 9 | Play it from builder Preview at `/courses/:id`. |
| 6 | **Done in Quiz Lab (20 Oct):** the image question plays at /quiz-lab, Mobile and Desktop, instead of the course page or mobile app. Original plan: Mobile: `MobileAssessmentCard` `onClick` in `CourseScreen.tsx` opens the renderer in `PhoneFrame`. | 6, 7, 8, 9 | /test-feature on `/mobile`, dark theme. |
| 6a | **Done (20 Oct).** Admin answers view: `AnswerStats` and `AssessmentAnswers` show image thumbnails for image options (D7). | 9 | An image MCQ's results show thumbnails, not blank labels or "Option N". |
| 7 | Hand-off with /figma-ship. | 9 | Screens in the agreed Figma section. |

### Risks to watch during build

- WCAG 1.1.1 and 4.1.2: "Option N" is a name, not a text alternative, so a screen reader user cannot answer. Keep this visible to Park Stars (D3).
- Reusing `SelectAll` as is would reveal the answer count and turn all picks red; fork the grading, do not reuse its CTA logic.
- `.ql-` and `.assessment-modal-` classes are globally bundled; grep before adding tile classes.
- No option maximum (D9): a long list makes a tall grid on a 375px phone, and many large images or animated GIFs slow the feed. Mitigation, not a cap: serve resized images (Typeform pattern), lazy-load tiles below the fold, play GIFs only while on screen and respect reduced motion, keep the `Check` footer pinned so it stays reachable.
- `AddImageModal`'s square-crop step (`confirm`) outputs a PNG, so an uploaded GIF would lose its animation. Branch on file type so GIFs bypass it (B4), and check this in phase 2.
- `AddImageModal` currently returns a data URL. Fine for the prototype, but many options per question means production needs real upload storage and resizing (see the option-count risk above).
- `AnswerStats` and `AssessmentAnswers` will show empty labels for image options until phase 6a lands.

### Still open

Nicolas's sign-off on the 10MB cap and square crop (B4).
