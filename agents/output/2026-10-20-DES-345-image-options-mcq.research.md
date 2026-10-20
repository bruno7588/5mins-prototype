# DES-345 research notes: image options in multiple choice assessments

Supporting notes for `2026-10-20-DES-345-image-options-mcq.md`. Gathered 2026-10-20.

## Internal: code today

| Area | File | What it does |
|---|---|---|
| Course builder MCQ editor | `src/pages/your-courses/components/AssessmentModal/AssessmentModal.tsx` | `type: 'single-choice'` titled "Add assessment - Multiple Choice", subtitle "Users can select one correct choice". Options are `string[]`; the correct one is `correctIndex: number`, picked with the DS `Radio` and a Success `Badge` "Correct". One optional question-level image or audio (`mediaFile`, `mediaType`) with its own crop UI in an "Attach media" modal (`ACCEPTED_TYPES` PNG/JPEG/GIF/WebP, "max 100MB"). Footer: `Save` only, no Preview. Hosted in `ContentDrawer.tsx` (variant `drawer`). |
| Assessment types | `src/pages/your-courses/components/AddContentSidebar/AddContentSidebar.tsx` | `AssessmentType = 'single-choice' \| 'short-text' \| 'exercise' \| 'poll'`. |
| Interactive formats editor | `src/pages/your-courses/components/InteractiveDrawer/InteractiveDrawer.tsx` | `Save` + `Preview` (outlined-2, disabled until a valid draft). Preview = `ConfirmModal` scrim + `DesktopPreview` (544x812, the learner feed panel width) running the real learner renderer with `QuizHeader`. Pattern to reuse for AC4. |
| Question bank editor | `src/components/QuestionEditor/QuestionEditor.tsx`, data `src/data/mockQuestions.ts` | Types `multiple_choice`, `multi_select` ("Select all that apply"), `true_false`, `free_text`. Answers `{ id, text, isCorrect }`, max 6, min 2. Native `<select>` and hand-rolled radio (not DS). Validation "Select at least one correct answer". |
| Learner renderers | `src/pages/quiz-lab/formats/SingleChoice.tsx`, `SelectAll.tsx`, `components/FeedbackFooter.tsx`, `ResultBanner.tsx`, `quiz-lab.css` | SingleChoice: DS `Radio` in a `ql-token`, Check, graded pick only, untouched options never revealed. SelectAll: fixed pick count of 4 ("Select Four", "Select 2 More", caps selection) and a wrong set turns all picks red. CTA `Check` then `Continue`; banner "Well done!" / "Not quite!". Selected = `--selected` with `--text-on-selected`; correct/incorrect = translucent success/danger tints. |
| Learner web host | `src/pages/courses/ProgramCourseDetails.tsx` | `pcd-quizstage` dialog plays authored interactive questions in a `PhoneFrame`; branches only on match-pairs, fill-blank, categorization, sequencing. Classic MCQ is not playable. |
| Builder to learner preview | `src/pages/your-courses/previewCourse.ts` | Maps builder draft to the learner page; `questions` only carries `InteractiveQuestion`s. |
| Mobile app | `src/pages/mobile/CourseScreen.tsx`, `src/components/mobile/AssessmentCard/AssessmentCard.tsx` | Assessments list uses `MobileAssessmentCard`, no `onClick` wired; no assessment-taking screen exists. App is dark only (`PhoneFrame` pins `data-theme="dark"`). |
| Admin results | `src/pages/your-courses/AssessmentAnswers.tsx`, `components/AssessmentsTab/AnswerStats.tsx`, `assessmentResults.ts` | Results and option tallies keyed on `options: string[]` and a single `correctIndex`. Image options would render with no label. |

## Internal: design system fit

| Need | DS component / doc | Fit |
|---|---|---|
| Upload states (empty, uploading, uploaded, error) | `FileUploader` size `S` (180px), `docs/design-system/file-uploader.md` | Covers Enabled, Uploading (`progress`), Error (`errorMessage`), Filled/Image (`filledPreview`). Image state has no Select File, so replace is drop-only. No slot for a "correct" control or remove. |
| Mark correct (several) | `Checkbox`, `docs/design-system/selection-controls.md` | Checkbox = zero or more choices. Radio stays for text mode. |
| Text vs image mode | `Radio` group, selection-controls.md | "Pick one of 2 to 6 mutually exclusive options" in a form. ContentSwitcher is for views of the same data, so not this. |
| Preview | `ConfirmModal` + `DesktopPreview` | As InteractiveDrawer. |
| Learner image option tile | none | Figma `Quiz/Options` (`5504:24966`, gamification.md) is text-only and has no code component. No doc for a selectable image tile. Gap. |
| Admin image option tile (upload + correct + replace + remove) | none as a whole | Composition of FileUploader S + Checkbox + icon buttons with Tooltip has no Figma. Gap. |
| Errors / confirmations | `Toast` (alerts-toast.md), FileUploader Error state | Error copy lives in the uploader. |

Copy note: the 5mins-copy-review skill says buttons are sentence case; the project CLAUDE.md and the user's rules say button copy is Title Case. Title Case is used in the PRD per the user.

## External: prior art

### Image answer options (authoring)

| Source | What it does | Verdict |
|---|---|---|
| [Kahoot: images as answers (support)](https://support.kahoot.com/hc/articles/360055063614), [blog](https://kahoot.com/blog/2020/03/13/new-feature-images-as-answers/) | Image button beside each answer field; quiz types only; PNG/JPEG/GIF, under 80MB and 3264x3264px. Paid tier. | Adopt per-option upload; reject 80MB (too large for mobile feeds). |
| [Google Forms images in answers (Alice Keeler)](https://alicekeeler.com/2016/08/22/google-forms-images/) | Image per option on Multiple choice and Checkboxes; text label still present; no sizing options. | Adopt: multi-select uses checkbox semantics. Reject: we have no labels. |
| [Typeform image sizes (developers)](https://www.typeform.com/developers/create/image-sizes/), [community: picture choice too small](https://community.typeform.com/build-your-typeform-7/why-are-the-images-for-picture-choice-so-small-4230) | Server resizes uploads (800px default, 460px mobile). Users complain picture-choice tiles are too small. | Adopt server resize; keep tiles large (2 columns). |
| [Interact image answers](https://help.tryinteract.com/en/articles/736700-how-to-add-image-answers-to-your-quiz) | Question-level "Use Image Answers" switch; 300x250px recommended. | Adopt question-level switch (matches decision 1). |
| [LifterLMS picture multiple choice, multiple correct](https://lifterlms.com/docs/picture-multiple-choice-multiple-correct-answers-question-type/) | A dedicated question type for picture options with several correct. | Confirms the pattern is table stakes in LMSs. |
| [TalentLMS question types](https://help.talentlms.com/hc/en-us/articles/9652288801820-What-are-the-available-question-types) | Multiple response via checkboxes; media sits above answers, not as answers. 10MB image cap. | Adopt 10MB cap; no image-as-answer prior art. |
| [Docebo community: pictures in questions](https://community.docebo.com/product-tips-tricks-3/gift-with-medias-format-is-there-a-plugin-or-other-way-to-get-pictures-in-questions-8020) | Images in question stems; nothing found on image answer options. | Nothing usable. |
| [Sana question generator](https://help.sana.ai/en/articles/7497-using-sana-s-question-generator) | MCQ generation documented; no public doc on image answer options. | Sana yielded nothing on this interaction. |
| [Cornerstone 2020 test engine note](https://help.csod.com/help/csod_0/Content/0_Whats_New/Past_Releases/2020/Whats_New_02212020.htm) | Test engine beta; nothing on image options. Workday Learning: nothing found. | Nothing usable. |

### Learner selection and grading

| Source | What it does | Verdict |
|---|---|---|
| [Duolingo exercise types (wiki)](https://duolingo.fandom.com/wiki/Exercise) | Pick-the-picture grid, Check, then green/red. | Adopt Check then feedback rhythm (already in quiz-lab). |
| [UGA ELC multi-select grading](https://help.elc.uga.edu/assessments/quizzes/types_of_questions.html) | All-or-nothing vs right-minus-wrong. | All-or-nothing (decision 2). |
| [NYU 1.1.1 testing notes](https://digitalaccessibility.nyu.edu/testing/sc111.html) | Image as the only label of a control fails 1.1.1 and 4.1.2 without a text alternative. | Risk logged; decision 3 stands. |
| [VCCS accessibility in assessment](https://www.vccs.edu/?p=960617) | Alt text must not give the answer away; describe what is visible. | Input for a later alt text phase. |

### Mobbin

| Screen | What it shows | Verdict |
|---|---|---|
| [MacroFactor body fat picker](https://mobbin.com/screens/e9b0da95-4ee5-4e68-a43b-838f0dd9d6b5) | 3-column image grid; selected tile gets a heavy border plus a tick chip. | Adopt: border plus tick, not colour alone. |
| [Shopify select files](https://mobbin.com/screens/fe4c261c-8197-4870-b362-a4156979d55c) | Multi-select photo grid, checkbox in tile corner, "3 selected". | Adopt corner checkbox; reject the count (it would hint at the answer count). |
| [Lloyds choose an image](https://mobbin.com/screens/29c4c331-1bf5-4ce3-8ed6-d2464576f0b1) | 2-column image tiles, single select, Confirm pinned at bottom. | Adopt 2 columns and pinned CTA on mobile. |
| [Polarsteps gift card picker](https://mobbin.com/screens/96e38264-f981-46e3-859c-9e35d5cf3aff) | 2-column photo tiles with captions. | Reject captions (no labels for now). |
| [Recraft upload plus looks](https://mobbin.com/screens/6809d485-ceb3-421c-ad3b-249decdf973f) | Upload zone with formats line above a grid of image choices. | Adopt formats hint next to upload. |
| [Mintlify select image](https://mobbin.com/screens/b3577b1a-4241-411c-b5ae-1dfde5c82f63) | Upload tile sits in the grid with the images. | Adopt: empty option = upload tile in the grid. |
| [Bloom logo issue](https://mobbin.com/screens/a291e401-7442-4a35-a66f-95af90872263) | Upload error in place with reason and a re-upload button. | Adopt in-place error with retry (FileUploader Error). |
| [fal image inputs](https://mobbin.com/screens/1f39059b-e27c-4973-aacf-5fe18aeca376) | Empty image slots as placeholders; error shown far from the cause. | Reject the distant error. |

Mobbin had no shipped admin editor where every quiz answer is an image upload tile; the editor is assembled from upload-tile and image-grid patterns.

### Build For Mars

| Lesson | Principle | Verdict |
|---|---|---|
| [Hinge's photo tips](https://builtformars.com/ux-bites/hinges-photo-tips) | Grid of upload tiles with optional tips about what works. | Adopt a short hint for image guidance. |
| [Incorrect recipient details (Monzo)](https://builtformars.com/ux-bites/incorrect-recipient-details) | Mark each item right or wrong in place, not one global "wrong". | Adopt per-pick marks (decision 4). |
| [Creating confidence from errors (Lovable)](https://builtformars.com/ux-bites/creating-confidence-from-errors) | Errors say what happens next. | Adopt: upload errors name the fix. |
| [Animated quiz master (Ahead)](https://builtformars.com/ux-bites/animated-quiz-master) | Small motion makes answering feel responsive. | Adopt existing quiz-lab select cue and motion. |

BFM had no lesson specific to image-only multi-select quizzes; the above are adapted principles.
