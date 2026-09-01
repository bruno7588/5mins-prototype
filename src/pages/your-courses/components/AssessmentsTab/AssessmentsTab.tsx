import { useMemo, useState } from 'react'
import { Sort } from 'iconsax-react'
import CsvIcon from '@/components/icons/CsvIcon'
import Dropdown from '@/components/Dropdown/Dropdown'
import Button from '@/components/Button/Button'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import { GENERATABLE_TYPES, typeLabel } from '@/data/aiAssessmentGeneration'
import emptyBoxIllustration from '@/assets/empty-state-illustrations/empty-box.svg'
import searchIllustration from '@/assets/empty-state-illustrations/search.svg'
import AssessmentList from './AssessmentList'
import AnswersDrawer from './AnswersDrawer'
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

/* Under this many characters a written answer is a non-answer ("Not sure yet."). */
const BRIEF_ANSWER = 24
const PAGE_SIZE = 10

/**
 * The fourth column. Every format gets something true here — a poll has no right
 * answer and free text isn't scored in V1, so neither of them borrows a correctness
 * metric, and none of them renders an em dash.
 */
function ResultCell({ a }: { a: AssessmentResult }) {
  if (a.responses.length === 0) {
    return <span className="asm-result__none">Nothing submitted yet</span>
  }

  /* A situational test scores the same way, just over its questions rather than over
     its learners — correctPct does that division, so the cell does not have to. */
  if (a.kind === 'graded' || a.kind === 'situational') {
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
          {a.kind === 'situational' ? ` · ${a.questions.length} questions` : ''}
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
    /* Written answers are not scored in V1, so there is no aggregate result. The
       useful fact that survives is whether anyone fobbed it off — quoting one
       arbitrary respondent said nothing about the other eight. */
    const brief = a.responses.filter((r) => r.text.length < BRIEF_ANSWER).length
    return (
      <div className="asm-result">
        <span className="asm-result__lead">
          {brief === 0 ? 'All replies substantive' : `${brief} very brief`}
        </span>
        <span className="asm-result__sub">
          {brief === 0 ? 'nothing needs a second look' : 'may need a second look'}
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
  const [types, setTypes] = useState<string[]>([])
  const [page, setPage] = useState(0)
  /* Index into the *filtered* list — prev/next should walk what the admin is
     actually looking at, not the whole course. */
  /* Which axis the admin is reading — the same responses, across or down. */
  const [pivot, setPivot] = useState<'assessment' | 'learner'>('assessment')
  /* Which learner the Insights card last sent us to. The nonce is what makes a second
     click on the same name arrive at all. */
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null)
  /* Which assessment's answers are open in the drawer, if any. */
  const [viewing, setViewing] = useState<AssessmentResult | null>(null)

  const downloadCsv = () => {
    const blob = new Blob([responsesCsv()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assessment-responses.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* Only offer a filter for formats this course actually contains — a menu of nine
     when the course has three is a menu of dead ends. */
  const typeOptions = useMemo(() => {
    const present = new Set(courseAssessments.map((a) => a.type))
    return GENERATABLE_TYPES.filter((t) => present.has(t)).map((t) => ({ value: t, label: typeLabel(t) }))
  }, [])

  const filtered = useMemo(
    () => (types.length ? courseAssessments.filter((a) => types.includes(a.type)) : courseAssessments),
    [types],
  )

  const filteredLearners = learnerRows

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
      <InsightsCard
        onOpenLearner={openLearner}
        responseCount={totalResponses()}
        summary={
          <span className="asm-summary">
            <span>{stats.total} assessments</span>
            <span className="asm-summary__dot">·</span>
            <span>
              {stats.responders} of {stats.enrolled} learners responded
            </span>
            {stats.average !== null ? (
              <>
                <span className="asm-summary__dot">·</span>
                <span>{stats.average}% average score</span>
              </>
            ) : null}
            {/* The people, not the papers: an admin acts on a learner who is behind,
                and the block below names these same rows. A count of low-scoring
                assessments is an authoring note, and "Where learners struggled"
                already says which content is weak in words. */}
            {attentionRows.length > 0 ? (
              <>
                <span className="asm-summary__dot">·</span>
                <span className="asm-summary__warn">
                  {attentionRows.length === 1
                    ? '1 learner needs attention'
                    : `${attentionRows.length} learners need attention`}
                </span>
              </>
            ) : null}
          </span>
        }
      />

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
          onView={setViewing}
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
          pagination={{
            from: from + 1,
            to: from + learnerPage.length,
            total: filteredLearners.length,
            onPrev: safePage > 0 ? () => setPage(safePage - 1) : undefined,
            onNext: safePage < lastPage ? () => setPage(safePage + 1) : undefined,
          }}
        />
      )}

      {viewing ? <AnswersDrawer assessment={viewing} onClose={() => setViewing(null)} /> : null}
    </section>
  )
}

export default AssessmentsTab
