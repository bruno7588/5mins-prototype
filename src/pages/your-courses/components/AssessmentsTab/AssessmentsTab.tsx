import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sort } from 'iconsax-react'
import CsvIcon from '@/components/icons/CsvIcon'
import Dropdown from '@/components/Dropdown/Dropdown'
import Button from '@/components/Button/Button'
import { GENERATABLE_TYPES, typeLabel } from '@/data/aiAssessmentGeneration'
import emptyBoxIllustration from '@/assets/empty-state-illustrations/empty-box.svg'
import searchIllustration from '@/assets/empty-state-illustrations/search.svg'
import AssessmentList from './AssessmentList'
import InsightsCard from './InsightsCard'
import {
  attentionRows,
  correctPct,
  courseAssessments,
  responsesCsv,
  totalResponses,
  type AssessmentResult,
} from './assessmentResults'
import '@/components/Table/Table.css'
import './AssessmentsTab.css'

const PAGE_SIZE = 10
/* Not a format — the filter value for a row that is a lesson quiz whatever its
   questions are. */
const LESSON_QUIZ = 'lesson-quiz'
/* Above this the results and the insights sit side by side; below it they stack. */
const SIDE_BY_SIDE = '(min-width: 1201px)'

/** The DS table progress cell (table.md): 8 segments, cyan fill, the percentage beside it. */
const SEGMENTS = 8
function ProgressCell({ value }: { value: number }) {
  const filled = Math.round((value / 100) * SEGMENTS)
  return (
    <span className="tbl-progress asm-progress">
      <span className="bar" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={`seg${i < filled ? ' fill' : ''}`} />
        ))}
      </span>
      <span className="pct">{value}%</span>
    </span>
  )
}

/**
 * The result column. A scored format shows its score as a bar: across its questions
 * when it has more than one (correctPct averages every answer). A poll, written answer
 * or file upload has no right answer, so it shows the same muted dash as an unscored
 * row on the Enrolments tab.
 */
function ResultCell({ a }: { a: AssessmentResult }) {
  if (a.responses.length === 0) {
    return <span className="asm-result__none">Nothing submitted yet</span>
  }
  if (a.kind === 'graded' || a.kind === 'multi') return <ProgressCell value={correctPct(a) ?? 0} />
  return <span className="asm-result__none">—</span>
}

function AssessmentsTab() {
  const navigate = useNavigate()
  const location = useLocation()
  const [types, setTypes] = useState<string[]>([])
  const [page, setPage] = useState(0)
  /* Insights is a panel the admin asks for, not furniture: until it is opened the
     table has the whole width. Closing it ends the summary with it — keeping one in
     memory would promise a persistence a reload does not have, and leave the button
     offering to show something the next visit cannot. */
  const [insightsOpen, setInsightsOpen] = useState(false)

  /* The panel leaves by closing the space it held, so the results widen into it rather
     than snapping across. Below 1200px the two stack (see the media query in the CSS) and
     the panel is full-width — there is no horizontal space to close, so it only fades. */
  const reduce = useReducedMotion()
  const [wide, setWide] = useState(() => window.matchMedia(SIDE_BY_SIDE).matches)
  useEffect(() => {
    const mq = window.matchMedia(SIDE_BY_SIDE)
    const sync = () => setWide(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  /* What the panel occupies while it is open, mirroring .asm-side and .asm-split's gap:
     Framer animates numbers, and these two are the ones the layout already uses. */
  const room = wide ? { width: 360, marginLeft: 0 } : {}
  const gone = wide ? { width: 0, marginLeft: -24 } : {}

  const downloadCsv = () => {
    const blob = new Blob([responsesCsv()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assessment-responses.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* What a row calls itself: a lesson quiz by that name, everything else by its
     format. The filter and the rows have to agree, so both read it from here. */
  const rowType = (a: AssessmentResult) => (a.lesson ? LESSON_QUIZ : a.type)

  /* Only offer a filter for formats this course actually contains — a menu of nine
     when the course has three is a menu of dead ends. */
  const typeOptions = useMemo(() => {
    const present = new Set(courseAssessments.map(rowType))
    const formats = GENERATABLE_TYPES.filter((t) => present.has(t)).map((t) => ({
      value: t as string,
      label: typeLabel(t),
    }))
    /* First in the menu, because it is the one cut that is not a format: the checks
       at the end of lessons, apart from what the admin placed on the course. */
    return present.has(LESSON_QUIZ)
      ? [{ value: LESSON_QUIZ, label: 'Lesson Quiz' }, ...formats]
      : formats
  }, [])

  const filtered = useMemo(
    () => (types.length ? courseAssessments.filter((a) => types.includes(rowType(a))) : courseAssessments),
    [types],
  )

  const stats = useMemo(() => {
    const scores = courseAssessments
      .map((a) => correctPct(a))
      .filter((n): n is number => n !== null)
    const responders = new Set(
      courseAssessments.flatMap((a) => a.responses.map((r) => r.learner.id)),
    ).size
    return {
      total: courseAssessments.length,
      responders,
      enrolled: courseAssessments[0]?.enrolled ?? 0,
      average: scores.length ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length) : null,
      scored: scores.length,
    }
  }, [])

  /* A filter change can strand the reader on a page that no longer exists. */
  const lastPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1)
  const safePage = Math.min(page, lastPage)
  const from = safePage * PAGE_SIZE
  const rows = filtered.slice(from, from + PAGE_SIZE)



  if (courseAssessments.length === 0) {
    return (
      <section className="asm asm--empty">
        <img className="asm-empty__art" src={emptyBoxIllustration} alt="" width={72} height={72} />
        <h3 className="asm-empty__title">No answers yet</h3>
        <p className="asm-empty__body">
          Lesson quizzes and assessments you add to this course appear here, with how learners answered them.
        </p>
      </section>
    )
  }

  return (
    <section className="asm">
      <div className="asm-split">
        <div className="asm-main">

      <div className="asm-pivotrow">
        <div className="asm-pivotrow__actions">
          <Dropdown
            options={typeOptions}
            multiple
            values={types}
            onChangeValues={(v) => { setTypes(v); setPage(0) }}
            placeholder="All types"
            allLabel="All types"
            summaryLabel="Types"
            iconLeft={<Sort size={20} color="var(--text-primary)" variant="Linear" />}
            size="md"
            className="asm-typefilter"
            menuClassName="asm-typefilter-menu"
            menuAlign="start"
          />
        <Button
          variant="outlined-2"
          onClick={downloadCsv}
          icon={<CsvIcon size={20} color="currentColor" />}
        >
          Download Answers
        </Button>
        {/* Generate Insights button removed for now — to be rebuilt later. The insights
            panel machinery below stays wired so it can be reconnected to a new trigger. */}
        </div>
      </div>


      {filtered.length === 0 ? (
        <div className="asm-noresults">
          <img className="asm-empty__art" src={searchIllustration} alt="" width={72} height={72} />
          <h3 className="asm-empty__title">Nothing matches these types</h3>
          <p className="asm-empty__body">Clear the filter to see everything in this course.</p>
        </div>
      ) : (
        <AssessmentList
          rows={rows}
          resultCell={(a) => <ResultCell a={a} />}
          onView={(a) =>
              /* Carrying the course title on, because the course page holds it in router
                 state and the answers page needs it for its breadcrumb. */
              navigate(`/your-courses/course/assessments/${a.id}`, {
                state: (location.state as object | null) ?? undefined,
              })
            }
          pagination={{
            from: from + 1,
            to: from + rows.length,
            total: filtered.length,
            onPrev: safePage > 0 ? () => setPage(safePage - 1) : undefined,
            onNext: safePage < lastPage ? () => setPage(safePage + 1) : undefined,
          }}
        />
      )}

        </div>

        {/* Insights reads beside the results rather than over them. */}
        <AnimatePresence initial={false}>
          {insightsOpen ? (
        <motion.aside
          key="insights"
          className="asm-side"
          initial={{ opacity: 0, ...gone }}
          animate={{ opacity: 1, ...room }}
          exit={{ opacity: 0, ...gone }}
          /* The panel fades first and the space closes after it, so the results are not
             sliding under something still visible. */
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.32, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.18 } }
          }
        >
          <div className="asm-side__inner">
          <InsightsCard
            responseCount={totalResponses()}
            autoStart={insightsOpen}
            onClose={() => setInsightsOpen(false)}
            stats={{
              assessments: stats.total,
              responders: stats.responders,
              enrolled: stats.enrolled,
              average: stats.average,
              attention: attentionRows.length,
            }}
          />
          </div>
        </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>

    </section>
  )
}

export default AssessmentsTab
