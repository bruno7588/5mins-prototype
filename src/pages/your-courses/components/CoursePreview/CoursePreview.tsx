import { useRef, useState } from 'react'
import { Clock, Lock, PlayCircle } from 'iconsax-react'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import Badge from '@/components/Badge/Badge'
import CloseButton from '@/components/CloseButton/CloseButton'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
import {
  getAssessmentIllustration,
  type AssessmentType as AssessmentIllustration,
} from '@/assets/assessment-illustrations'
import { TYPE_CONFIG, type InteractiveQuestion } from '@/data/interactiveQuestions'
import MatchPairsPartial from '@/pages/quiz-lab/formats/MatchPairsPartial'
import FillBlank from '@/pages/quiz-lab/formats/FillBlank'
import Categorization from '@/pages/quiz-lab/formats/Categorization'
import SequencingDnd from '@/pages/quiz-lab/formats/SequencingDnd'
import QuizHeader from '@/pages/quiz-lab/components/QuizHeader'
import type { ContentItem } from '../ContentList/ContentList'
import type { OutlineSection } from '../ContentList/ContentList'
import type { CourseDetailsDraft } from '../CourseDetailsTab/CourseDetailsTab'
import '@/pages/quiz-lab/quiz-lab.css'
import './CoursePreview.css'

interface Props {
  open: boolean
  draft: CourseDetailsDraft
  outline: OutlineSection[]
  /** Authored interactive questions, keyed by their outline card id. */
  interactive: Record<number, InteractiveQuestion>
  onClose: () => void
}

const isLesson = (item: ContentItem) =>
  item.type === 'Lesson' || item.type === 'LibraryLesson' || item.type === 'SCORM'

/* The four interactive formats have learner renderers (quiz-lab); everything
   else can be listed but not opened yet. */
const playable = (item: ContentItem, interactive: Record<number, InteractiveQuestion>) =>
  item.type === 'Assessment' && !!interactive[item.id]

/* The outline card's metadata line leads with the assessment's type, which is
   the only handle the preview has on it. Only the classic types have artwork —
   the interactive formats get a plain tile rather than a borrowed illustration
   that would name them as something they aren't. */
const ILLUSTRATION_BY_LABEL: Record<string, AssessmentIllustration> = {
  'Multiple Choice': 'multiple-choice',
  'Short Text': 'short-text',
  Exercise: 'exercise',
  Poll: 'poll',
}

function illustrationFor(item: ContentItem): AssessmentIllustration | null {
  if (item.type === 'SituationalTest') return 'situational-test'
  return ILLUSTRATION_BY_LABEL[item.metadata.split(' · ')[0]] ?? null
}

function QuizView({ question, onClose }: { question: InteractiveQuestion; onClose: () => void }) {
  const label = TYPE_CONFIG[question.type].label
  return (
    <PhoneFrame>
      <div className="ql-quizview">
        <QuizHeader label={label} used={1} total={3} onClose={onClose} />
        {question.type === 'match-pairs' ? (
          <MatchPairsPartial question={question} />
        ) : question.type === 'fill-blank' ? (
          <FillBlank question={question} formatKey="fill-blank" />
        ) : question.type === 'categorization' ? (
          <Categorization question={question} formatKey="categorization" />
        ) : (
          <SequencingDnd question={question} />
        )}
      </div>
    </PhoneFrame>
  )
}

/**
 * Learner preview of the course being built — the admin's answer to "what will
 * they actually see?". Reads the outline straight from the builder, so section
 * names, grouping and drag order all carry over.
 *
 * Assessments in the four interactive formats open in the real learner renderer
 * (shared with quiz-lab, fed the very object the authoring drawer saved). The
 * classic types have no learner design yet, so they list as locked rows rather
 * than pretending to be playable.
 */
function CoursePreview({ open, draft, outline, interactive, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [openQuizId, setOpenQuizId] = useState<number | null>(null)
  useOverlayA11y(panelRef, open, {
    onEscape: () => (openQuizId === null ? onClose() : setOpenQuizId(null)),
  })

  if (!open) return null

  const items = outline.flatMap((s) => s.items)
  const lessonCount = items.filter(isLesson).length
  const assessmentCount = items.length - lessonCount
  const openQuiz = openQuizId === null ? null : interactive[openQuizId] ?? null

  const count = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`

  return (
    <div
      ref={panelRef}
      className="cpv-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Course preview"
      tabIndex={-1}
    >
      <div className="cpv-bar">
        <span className="cpv-bar__label">
          <Badge type="informative" label="Preview" />
          <span className="cpv-bar__hint">This is how learners will see the course</span>
        </span>
        <CloseButton onClick={onClose} className="cpv-close" />
      </div>

      {openQuiz ? (
        <div className="cpv-quiz">
          <QuizView question={openQuiz} onClose={() => setOpenQuizId(null)} />
        </div>
      ) : (
        <div className="cpv-scroll">
          {/* No thumbnail yet means no cover — an empty 240px slab reads as a
              broken image rather than a deliberate blank. */}
          {draft.thumbnail && (
            <div
              className="cpv-cover"
              style={{ backgroundImage: `url(${draft.thumbnail})` }}
              aria-hidden="true"
            />
          )}

          <div className="cpv-body">
            <header className="cpv-head">
              <h1 className="cpv-title">{draft.title || 'Untitled course'}</h1>
              {draft.description && <p className="cpv-desc">{draft.description}</p>}
              <div className="cpv-meta">
                <span className="cpv-meta__item">
                  <PlayCircle size={16} color="var(--text-secondary)" variant="Linear" />
                  {count(lessonCount, 'lesson')}
                </span>
                <span className="cpv-meta__item">
                  <Clock size={16} color="var(--text-secondary)" variant="Linear" />
                  {count(assessmentCount, 'assessment')}
                </span>
              </div>
            </header>

            {items.length === 0 ? (
              <p className="cpv-empty">
                Nothing to preview yet — add content on the Course Content tab.
              </p>
            ) : (
              outline
                .filter((section) => section.items.length > 0)
                .map((section) => (
                  <section className="cpv-section" key={section.id}>
                    <h2 className="cpv-section__name">{section.name}</h2>
                    <div className="cpv-rows">
                      {section.items.map((item) => {
                        const canPlay = playable(item, interactive)
                        return (
                          <article
                            className={`cpv-row${canPlay ? ' cpv-row--playable' : ''}`}
                            key={`${item.type}-${item.id}`}
                            role={canPlay ? 'button' : undefined}
                            tabIndex={canPlay ? 0 : undefined}
                            onClick={canPlay ? () => setOpenQuizId(item.id) : undefined}
                            onKeyDown={
                              canPlay
                                ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      setOpenQuizId(item.id)
                                    }
                                  }
                                : undefined
                            }
                          >
                            <span
                              className="cpv-row__thumb"
                              style={
                                isLesson(item) && item.thumbColor
                                  ? { background: item.thumbColor }
                                  : undefined
                              }
                            >
                              {!isLesson(item) &&
                                (() => {
                                  const art = illustrationFor(item)
                                  return art ? (
                                    <img src={getAssessmentIllustration(art, 'desktop')} alt="" />
                                  ) : null
                                })()}
                            </span>
                            <span className="cpv-row__info">
                              <span className="cpv-row__title">{item.title}</span>
                              <span className="cpv-row__meta">{item.metadata}</span>
                            </span>
                            {canPlay ? (
                              <PlayCircle size={20} color="var(--text-button-outlined)" variant="Bold" />
                            ) : (
                              <Lock size={20} color="var(--text-disabled)" variant="Linear" />
                            )}
                          </article>
                        )
                      })}
                    </div>
                  </section>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursePreview
