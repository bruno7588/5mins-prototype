# DES-371 research notes: situational test scenario media

Supporting notes for `2026-11-24-DES-371-situational-test-scenario-media.md`. Gathered 2026-11-24. Prior art informs the design; it never overrides the 5Mins design system, token rules or copy skill.

---

## 1. Internal: the code today

### Admin authoring

- `src/pages/your-courses/components/SituationalTestDrawer/SituationalTestDrawer.tsx` (`SituationalTestDrawerContent`, `SituationalTestData`, `SituationalQuestion`, `snapshot`). One drawer, three paths:
  - Create: two steps. Step 1 "Add Situational Test" has the `GuidanceCallout` "Guidelines for writing a brief", Title (`st-title`) and Brief (`st-brief`, auto-growing textarea). Footer "Save & Add Questions" (disabled with a Tooltip naming the missing field). Step 2 "Add questions", `QuestionCard` per question, "Save Situational Test", "Step n of 2".
  - Edit: "Edit Situational Test", a `ContentSwitcher` with "Brief" and "Questions (n)" panes, "Update Situational Test".
  - AI review (DES-279): "Review situational test", same two panes, "Save Situational Test", AI-outlined "Generate Again", and "Preview" (outlined-2) on the right. **Preview only exists on the review path** (`{review && ...}`), not on create or edit.
  - `SituationalTestData` is `{ id, title, brief, questions }`: no media field. `snapshot()` drives the dirty check and would need the media added.
- `src/pages/your-courses/CreateCourse.tsx` mounts the drawer (imports `SituationalQuestion`, `SituationalTestData`, `generateSituationalTest`).
- Per-question media (`QuestionMedia`, `allowMedia` on `QuestionCard`, `media` on `SituationalQuestion`, rendering in quiz-lab `SingleChoice`) was prototyped and pulled on 2026-11-24 (phase 0). It is stashed as `stash@{0}` "DES-371: per-question QuestionMedia component (removed from V1, kept for later)". What it contains and could be reused:
  - `AttachMediaModal`: `ConfirmModal` (closable) + `SectionHeader` "Attach media" + `FileUploader` L with a crop stage (`filledPreview`) and a `Slider` zoom row. Images and audio only, 100MB cap, JPG/PNG/GIF/WebP and MP3/WAV/AAC/OGG.
  - `QuestionAudioPlayer`: rewind 10s, play/pause, forward 10s (Iconsax `Backward10Seconds`, `PlayCircle`/`PauseCircle`, `Forward10Seconds`), a `Slider` scrub bar, duration, optional remove. Each icon button has a `Tooltip`.
  - `QuestionMediaField`: "Attach Media (Image or Audio)" row, then the image thumbnail or the audio player, each with a remove control.
  - No video support at all.

### Learner rendering

- `src/pages/your-courses/components/SituationalTestPreview/SituationalTestPreview.tsx`: admin preview inside `ConfirmModal` + `DesktopPreview` (600 x 812). Screen 0 is the brief card "as the course feed draws it (Figma 17024:82020)": illustration, "Brief" label, title, brief text, "Start Situational Test" (`Button size="lg"`). Then one screen per question using `QuizHeader` (label, `used`/`total`, close) and the real quiz-lab renderers (`SingleChoice`, `FreeText`, `MatchPairsPartial`, `FillBlank`, `Categorization`, `SequencingDnd`). `QuizAdvanceContext` moves to the next question. Each screen remounts (`key={screen}`), so answers do not persist across screens today.
- `src/pages/quiz-lab/` (`/quiz-lab`): `QuizHeader.tsx`, `FeedbackFooter.tsx`, `ResultBanner.tsx`, formats. `QuizHeader` has a label, attempt hearts/badge and close; no slot for an extra control.
- `src/components/DesktopPreview/DesktopPreview.tsx`: "The assessment at the size it gets on the desktop course feed."

### Course feed coverage (informs the blocker)

| Surface | File | Situational tests? |
|---|---|---|
| Web learner feed | `src/pages/for-you/ForYou.tsx` (`/for-you`) opens `src/pages/for-you/components/LessonFeed.tsx` (Figma "Course feed 17024:79675") | Lessons only. Video is a still image (`lf-video__media` is an `<img>`), progress bars and an inert expand icon. No assessments, no situational tests. |
| Mobile course | `src/pages/mobile/CourseScreen.tsx` (`/mobile`, `PhoneFrame`) | Lists an "Assessments" section of `MobileAssessmentCard`s with **no `onClick`**: nothing opens. |
| Mobile lesson feed | `src/pages/mobile/LessonFeedScreen.tsx` (Figma Lessons-Feed 10748:32498) | Lessons only; tap-to-pause and 10-second skip controls on a still image. |
| Admin preview | `SituationalTestPreview.tsx` | Brief card and question screens, at desktop feed size, in a modal. The only place a situational test is played. |

Conclusion: the brief card and question screens exist (in the admin preview), but no learner surface opens a situational test on web or mobile, and no real video or audio element plays anywhere in learner chrome.

### Design system

- Documented and usable: `FileUploader` (file-uploader.md: states Enabled, Hover, Error with bullet list, Uploading with `progress`, Filled with file name and "Select File", Image via `filledPreview`; `icon`, `fileIcon`, `helpText`, `buttonLabel`; label hint above the zone e.g. "(PDF, DOCX • max. 50MB)"; "Change File" text button precedent for Add external training). `ConfirmModal` with `closable` (confirm-modal.md, overlays.md). `BottomSheet` (overlays.md, mobile.md: details and short option sets; traps focus, closes on Escape, overlay tap and drag; `hidden` keeps it mounted). `CloseButton` default and `fullscreen` (44px disc). `Button`, `Tooltip` (alerts-toast.md), `Collapse`, `ContentSwitcher`, `Toast`. `--scrim` for every overlay backdrop (layout.md).
- `Slider` exists in `src/components/Slider/` but has **no doc of its own** (mentioned only in file-uploader.md and colour-field.md).
- **No doc and no shared component:** video player, audio player, full-screen image viewer, full-screen video, an admin "media preview with change/remove" block. overlays.md says full-screen modals have "no shared component yet, page-local shells with `src/hooks/useOverlayA11y.ts`". cards.md maps media icons: Video `PlayCircle`, Audio `VolumeHigh`; iconography.md lists `Video`, `Image`.
- navigation.md: Lesson feed back button uses a fixed legibility fill over video, not `--scrim`.
- motion.md: animate screen swaps and overlays; respect `prefers-reduced-motion`.

---

## 2. External prior art

### Where media sits and how learners revisit it

| Source | Finding | Verdict |
|---|---|---|
| [eduMe, Adding scenario videos](https://help.edume.com/adding-scenario-videos) | Video attaches to an answer as feedback ("The learner can see the video once they've selected an answer"); learner can go back and choose again. Web authoring only. | Reject placement (video as feedback); our video sets up the scenario. |
| [eduMe, Scenario video recommendations](https://help.edume.com/scenario-video-recommendations) | Accepts any length, up to 80MB and 1080p; recommends portrait 9:16, first-person POV, scenario video about 2 minutes or less, file under 25MB for load time. | Adopt as guidance for admin helper text and defaults (to confirm). |
| [Sana, Learner assessments](https://help.sana.ai/en/articles/100288-learner-assessments) | Learners move back and forth between questions; nothing on media inside assessments. | Nothing useful on media; supports free navigation. |
| [Sana, Video block](https://help.sana.ai/en/articles/7490-the-video-block) | MP4 only format "playable on all modern browsers without conversion"; 8GB cap; auto transcripts and CC; a video can be set mandatory, "the learner will have to watch the entire video before moving onto the next card". | Adopt MP4; note mandatory viewing is an opt-in per block, not a default. |
| [Sana, Uploading images, GIFs and videos](https://help.sana.ai/en/articles/96964-uploading-images-gifs-and-videos) | MP4, 2GB, 720p minimum recommended. Conflicts with the 8GB article. | Background only. |
| [Articulate community, Rise: revisit scenario details before making a choice](https://community.articulate.com/discussions/rise-360/rise-revisit-scenario-details-before-making-a-choice) | Thread title alone states the need (403 on fetch; search snippet only). Other threads: Rise Scenario block cannot embed video ([thread](https://community.articulate.com/discussions/rise-360/embedding-mp4-in-rise-360-s-scenario)); answers and video position are not kept when revisiting ([thread](https://community.articulate.com/discussions/rise-360/allow-a-storyline-block-to-retain-it-s-resume-position-when-revisiting-a-lesson)). | Adopt the need; avoid Rise's gap: keep answer and position. |
| [TalentLMS, Add audio or video to test questions](https://help.talentlms.com/hc/en-us/articles/360014659873-How-to-add-audio-or-video-to-test-questions) | Media per question via iframe HTML; article warns it "is not a straightforward one". | Reject: per-question and awkward. Confirms per-question is the common LMS shape we deliberately defer. |
| [TalentLMS, TalentCraft multimedia](https://help.talentlms.com/hc/en-us/articles/10963431979676-How-to-add-multimedia-content-in-TalentCraft) | 600MB cap for video and audio; MP4 and WebM. | Background for size defaults. |
| [iSpring QuizMaker media](https://www.ispringsolutions.com/docs/x/AIge) | Media per question slide; per-media "controls" and "autoplay" options. | Reject autoplay option; keep controls always on. |
| Docebo | No official docs found on media in tests; [community](https://community.docebo.com/product-q-a-7/media-upload-800mb-and-ftp-plus-errors-when-laptop-sleeps-during-upload-4694) mentions an 800MB upload cap. | Nothing useful beyond a size data point. |
| Cornerstone, Workday Learning | Searched; nothing specific to scenario media in assessments surfaced. | No verdict. |

### Forced viewing

| Source | Finding | Verdict |
|---|---|---|
| [Sana, Video block](https://help.sana.ai/en/articles/7490-the-video-block) | Mandatory is an option per video, off unless set. | Supports no forced viewing by default; proof-of-viewing as a later admin setting. |
| [Ausmed, Prevent skipping ahead](https://knowledge.organisations.ausmed.com.au/en/knowledge/how-to-prevent-skipping-ahead-of-videos-for-assigned-learning) | Org setting; blocks forward scrub on the first watch only, assigned learning only; afterwards "learners can scrub through the video freely". | Supports: even where forcing exists, revisits are free. |
| [Articulate community, disable forward seeking](https://community.articulate.com/discussions/discuss/new-feature-in-rise-disable-forward-seeking/892374/replies/892375) and [forcing users to watch](https://community.articulate.com/discussions/discuss/forcing-users-to-watch-majority-or-entire-video-clip/707549/replies/1251908) | Forcing needs extra blocks; practitioners report learners minimise the window and wait; advice to agree "retention is the goal, not forced viewing" and check whether a regulator actually requires viewing. | Supports no forced viewing; the questions are the check. |
| [Docebo community, video completion dilemma](https://community.docebo.com/product-q-a-7/video-completion-dilemma-8455) | Scrub tracking "nothing guarantees that a person has actually consumed that video"; accessibility and watch-percentage rules conflict. | Supports: forcing proves little and fights accessibility. |
| Empirical studies | None found. No peer-reviewed evidence either way. | Stated plainly in the PRD. |

**Net:** prior art does not contradict the decision. Forcing exists in the market (Sana mandatory video, Ausmed, Rise) but always as an opt-in, and the practitioner evidence against it is anecdotal. Risk: some compliance buyers will ask for proof of viewing; keep it as a later per-test setting.

### Accessibility and formats

| Source | Finding | Verdict |
|---|---|---|
| [WCAG 2.2, 1.4.2 Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control) | Audio that plays automatically for over 3 seconds needs pause/stop or independent volume. | No autoplay avoids it outright. |
| [WCAG 2.2, 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) | Moving content over 5 seconds alongside other content needs pause. | Video always has a visible pause. |
| [axe rule, no autoplay audio](https://dequeuniversity.com/rules/axe/4.8/no-autoplay-audio) | `<video>`/`<audio>` must not autoplay with sound. | Adopt. |
| [WCAG 2.2, 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard) | All controls operable by keyboard (not fetched; standard reference). | Adopt: play, scrub, full screen, Scenario, overlay close. |
| [MDN, Web video codec guide](https://developer.mozilla.org/docs/Web/Media/Formats/Video_codecs) | H.264 in MP4 is the pragmatic choice for widest compatibility; VP9/WebM as the open alternative. | Default MP4 (H.264); MOV and WebM to confirm with engineering (transcoding). |
| [web.dev, Media file basics](https://web.dev/media-file-basics) | MP4 is a good general container. | Same. |

---

## 3. Mobbin

| Screen | What it shows | Verdict |
|---|---|---|
| [YouTube, Ask about this video](https://mobbin.com/screens/509b5353-f619-47d5-92fa-25c6f2aa8759) | Video stays visible and controllable while a sheet opens below it; full-screen icon on the player. | Adopt: full-screen control on the player; media keeps its position across the sheet. |
| [Liven, captions sheet over paused video](https://mobbin.com/screens/5f3f2686-9e1d-42c3-a594-3366accc039c) | Video pauses behind a bottom sheet; 10s back/forward and centred pause. | Adopt: pause while covered; 10s rewind. |
| [LinkedIn, sheet over video](https://mobbin.com/screens/0b3001bc-4a3c-49a1-ab02-b42a04150aa0) | Player bar (play, scrub, time, volume) above a sheet. | Background. |
| [Noom, quiz in a card](https://mobbin.com/screens/1e72c86b-e88f-4407-8fd5-f60146d6cf6a) | Context sentence sits inside the question card. | Reject for video: an inline player pushes options below the fold (matches the rejected inline card). |
| [Matter, sheet over reading](https://mobbin.com/screens/3762e7f0-1b4c-4182-b6e8-1a112542e325) | Sheet over the source text, source still visible behind. | Adopt the shape: overlay, not navigation away. |
| [Upwork, project video](https://mobbin.com/screens/5c9749d8-6da9-4cca-8e74-85573ac2bcab) | One video, rules in the helper ("(.mp4), up to 100MB and less than 90 seconds"), edit and delete icons on the thumbnail, native player for preview. | Adopt: limits in the hint, preview playable in place. |
| [Squarespace, add lesson video](https://mobbin.com/screens/8ab83cf6-6568-42e8-b81c-083eb2caaccf) | Uploaded video preview, file name + duration, "Replace" and a trash icon below. | Adopt: file name and length under the preview, change and remove beside it. |
| [TikTok Studio, upload](https://mobbin.com/screens/3d52a510-7dbd-4a8c-b7ad-abd784826d15) | File name, "Uploaded (65.92MB)", "Replace" button. | Adopt "replace keeps the rest of the form". |
| [Patreon, create video](https://mobbin.com/screens/03822e19-93e2-4334-a828-d105ccf9fba8) | "Uploading 51%" in the zone; rest of the form stays editable. | Adopt: the admin can keep editing the brief while it uploads. |
| [Contra, video intro](https://mobbin.com/screens/02f02c96-7d71-436d-983f-e0c836fdfc90) | Delete and play overlaid on the preview. | Reject overlay controls: our FileUploader keeps actions below. |
| [Finch, error loading video](https://mobbin.com/screens/eaebf4be-46a2-4769-b6d9-189dd755756e) | In-place "Error loading video" with cause and the rest of the flow still usable. | Adopt: failure stays in the media slot; Start stays enabled. |
| [Muse, retry sheet](https://mobbin.com/screens/50152b0f-e47c-4f0d-83df-640d16c8787f) | "Something went wrong" + Retry. | Adopt a Try Again action. |
| [Prime Video, network error](https://mobbin.com/screens/7f93f562-2680-4876-9cc2-c11898ae4092) | Full-screen error with "Try again". | Reject full-screen takeover; keep it local to the media. |
| [MasterClass, audio](https://mobbin.com/screens/09572f38-4886-446b-8b15-fa19d50d7772), [Liven, audio](https://mobbin.com/screens/8c33451b-40fe-4659-a955-57d375a7c195) | Scrubber with elapsed/total, 10s back, play/pause, 10s forward. | Adopt: matches the stashed `QuestionAudioPlayer`. |

Searches that gave nothing useful: "quiz with reference passage reopen" (no app keeps a reference behind a button during a quiz; closest were feedback sheets).

---

## 4. Build For Mars

| Lesson | Principle | Verdict |
|---|---|---|
| [Context Shifting](https://builtformars.com/ux-glossary/context-shifting) | Switching has a cost, highest after an error; users lose their place. | Adopt: overlay over the question, answer kept, media position kept. |
| [Pausing the video](https://builtformars.com/ux-bites/pausing-the-video) | Dropout pauses the video automatically when another layer opens. | Adopt: closing the overlay or going full screen out pauses; position kept. |
| [Did you miss what they said?](https://builtformars.com/ux-bites/did-you-miss-what-they-said) | Rewinding 10s briefly shows subtitles. | Adopt 10s rewind; the subtitle trick belongs to the production player (captions out of scope). |
| [Show, Don't Tell (6 onboarding rules)](https://builtformars.com/cheatsheets/6-onboarding-rules) | Show only what is necessary; don't block experienced users. | Supports no forced viewing and an always-enabled Start. |

BFM's synthesis also recommended that a playback failure never blocks answering and, where possible, offers an alternative (transcript or the brief text). The brief text is always there, so we adopt "the brief stays readable" rather than adding a transcript.
