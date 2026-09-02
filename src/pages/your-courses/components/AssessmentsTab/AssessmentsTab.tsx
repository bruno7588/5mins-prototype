import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sort } from 'iconsax-react'
import CsvIcon from '@/components/icons/CsvIcon'
import SparkleIcon from '@/components/icons/SparkleIcon'
import Dropdown from '@/components/Dropdown/Dropdown'
import Button from '@/components/Button/Button'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import { GENERATABLE_TYPES, typeLabel } from '@/data/aiAssessmentGeneration'
import emptyBoxIllustration from '@/assets/empty-state-illustrations/empty-box.svg'
import searchIllustration from '@/assets/empty-state-illustrations/search.svg'
import AssessmentList from './AssessmentList'
import LearnerList from './LearnerList'
import InsightsCard from './InsightsCard'
import {
  attentionRows,
  correctPct,
  courseAssessments,
  learnerRows,
  optionTally,
  responsesCsv,
  totalResponses,
  type AssessmentResult,
} from './assessmentResults'
import './AssessmentsTab.css'

const PAGE_SIZE = 10
/* Not a format — the filter value for a row that is a lesson quiz whatever its
   questions are. */
const LESSON_QUIZ = 'lesson-quiz'
/* Above this the results and the insights sit side by side; below it they stack. */
const SIDE_BY_SIDE = '(min-width: 1201px)'

/**
 * The fourth column. Every format gets something true here — a poll has no right
 * answer and free text isn't scored in V1, so neither of them borrows a correctness
 * metric, and none of them renders an em dash.
 */
function ResultCell({ a }: { a: AssessmentResult }) {
  if (a.responses.length === 0) {
    return <span className="asm-result__none">Nothing submitted yet</span>
  }

  /* A multi-question assessment scores the same way, just over its questions rather
     than over its learners — correctPct does that division, so the cell does not. */
  if (a.kind === 'graded' || a.kind === 'multi') {
    const pct = correctPct(a) ?? 0
    return (
      <div className="asm-result">
        <span className="asm-bar" aria-hidden="true">
          <span
            className="asm-bar__fill"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="asm-result__pct">
          {pct}% correct
          {a.kind === 'multi' ? ` · ${a.questions.length} questions` : ''}
        </span>
      </div>
    )
  }

  if (a.kind === 'poll') {
    const tally = optionTally(a)
    const top = Math.max(...tally)
    const leading = a.options[tally.indexOf(top)]
    const share = Math.round((top / a.responses.length) * 100)
    return (
      <div className="asm-result">
        <span className="asm-result__lead">{leading}</span>
        <span className="asm-result__sub">leads with {share}%</span>
      </div>
    )
  }

  if (a.kind === 'text') {
    /* Written answers are not scored in V1, so there is no aggregate to report — just
       how many there are to read. It used to call answers under 24 characters "very
       brief" and advise a second look: a character count dressed as a judgement, which
       an admin could neither see nor check. */
    return (
      <div className="asm-result">
        <span className="asm-result__lead">
          {a.responses.length} answer{a.responses.length === 1 ? '' : 's'}
        </span>
      </div>
    )
  }

  const kinds = [...new Set(a.responses.map((r) => r.fileKind))].join(', ')
  return (
    <div className="asm-result">
      <span className="asm-result__lead">{a.responses.length} files</span>
      <span className="asm-result__sub">{kinds}</span>
    </div>
  )
}

function AssessmentsTab() {
  const navigate = useNavigate()
  const location = useLocation()
  const [types, setTypes] = useState<string[]>([])
  const [page, setPage] = useState(0)
  /* Unsorted until asked: the order the pool arrives in is a fact too. */
  const [learnerSort, setLearnerSort] = useState<'none' | 'asc' | 'desc'>('none')
  /* Index into the *filtered* list — prev/next should walk what the admin is
     actually looking at, not the whole course. */
  /* Which axis the admin is reading — the same responses, across or down. */
  const [pivot, setPivot] = useState<'assessment' | 'learner'>('assessment')
  /* Which learner the Insights card last sent us to. The nonce is what makes a second
     click on the same name arrive at all. */
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null)
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

  /* Sorted before the slice, so the order is the cohort's rather than this page's.
     Lowest first on the first press — the list is read to find who is behind. A learner
     with nothing scored is not the lowest scorer, so those settle at the end either way
     rather than crowding the top of an ascending sort. */
  const filteredLearners = useMemo(() => {
    if (learnerSort === 'none') return learnerRows
    return [...learnerRows].sort((x, y) => {
      if (x.pct === null || y.pct === null) return (x.pct === null ? 1 : 0) - (y.pct === null ? 1 : 0)
      return learnerSort === 'asc' ? x.pct - y.pct : y.pct - x.pct
    })
  }, [learnerSort])

  /* A name in the summary is a door into the row it describes: switch the pivot, page
     to wherever that learner sits, and let the list open and reveal them. */
  const openLearner = (id: string) => {
    const i = learnerRows.findIndex((r) => r.learner.id === id)
    if (i === -1) return
    setPivot('learner')
    setPage(Math.floor(i / PAGE_SIZE))
    setFocus({ id, n: Date.now() })
  }

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
  const listLength = pivot === 'assessment' ? filtered.length : filteredLearners.length
  const lastPage = Math.max(0, Math.ceil(listLength / PAGE_SIZE) - 1)
  const safePage = Math.min(page, lastPage)
  const from = safePage * PAGE_SIZE
  const rows = filtered.slice(from, from + PAGE_SIZE)
  const learnerPage = filteredLearners.slice(from, from + PAGE_SIZE)



  if (courseAssessments.length === 0) {
    return (
      <section className="asm asm--empty">
        <img className="asm-empty__art" src={emptyBoxIllustration} alt="" width={72} height={72} />
        <h3 className="asm-empty__title">No assessments yet</h3>
        <p className="asm-empty__body">
          Assessments you add to this course will appear here, along with how learners answered them.
        </p>
      </section>
    )
  }

  return (
    <section className="asm">
      <div className="asm-split">
        <div className="asm-main">

      <div className="asm-pivotrow">
      <ContentSwitcher
        items={[
          { key: 'assessment', label: 'By Assessment' },
          { key: 'learner', label: 'By Learner' },
        ]}
        activeKey={pivot}
        onChange={(k) => {
          setPivot(k as 'assessment' | 'learner')
          setPage(0)
        }}
        ariaLabel="Results view"
        className="asm-pivot"
      />
        <div className="asm-pivotrow__actions">
        {pivot === 'assessment' ? (
          <Dropdown
            options={typeOptions}
            multiple
            values={types}
            onChangeValues={(v) => { setTypes(v); setPage(0) }}
            placeholder="All assessments"
            iconLeft={<Sort size={20} color="var(--text-primary)" variant="Linear" />}
            size="md"
            className="asm-typefilter"
            menuAlign="end"
          />
        ) : null}
        <Button
          variant="outlined-2"
          onClick={downloadCsv}
          icon={<CsvIcon size={20} color="currentColor" />}
        >
          Download Answers
        </Button>
        {/* Only ever opens. A visible panel is closed from the panel. */}
        {insightsOpen ? null : (
          <Button
            semantic="ai"
            onClick={() => setInsightsOpen(true)}
            icon={<SparkleIcon size={20} color="currentColor" />}
          >
            Generate Insights
          </Button>
        )}
        </div>
      </div>


      {listLength === 0 ? (
        <div className="asm-noresults">
          <img className="asm-empty__art" src={searchIllustration} alt="" width={72} height={72} />
          <h3 className="asm-empty__title">No assessments match this filter</h3>
          <p className="asm-empty__body">Clear the type filter to see everything in this course.</p>
        </div>
      ) : pivot === 'assessment' ? (
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
      ) : (
        <LearnerList
          focus={focus}
          rows={learnerPage}
          sort={learnerSort}
          onToggleSort={() => {
            setLearnerSort(learnerSort === 'asc' ? 'desc' : 'asc')
            setPage(0)
          }}
          pagination={{
            from: from + 1,
            to: from + learnerPage.length,
            total: filteredLearners.length,
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
            onOpenLearner={openLearner}
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
