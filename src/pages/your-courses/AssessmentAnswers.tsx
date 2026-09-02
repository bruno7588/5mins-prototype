import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import { ImportCurve, Sort } from 'iconsax-react'
import CsvIcon from '@/components/icons/CsvIcon'
import Badge from '@/components/Badge/Badge'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Button from '@/components/Button/Button'
import Dropdown from '@/components/Dropdown/Dropdown'
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar'
import Search from '@/components/Search/Search'
import Tooltip from '@/components/Tooltip/Tooltip'
import Table, { type Column } from '@/components/Table/Table'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { typeLabel } from '@/data/aiAssessmentGeneration'
import searchIllustration from '@/assets/empty-state-illustrations/search.svg'
import AnswerStats from './components/AssessmentsTab/AnswerStats'
import MultiQuestionAnswers from './components/AssessmentsTab/MultiQuestionAnswers'
import {
  courseAssessments,
  multiScore,
  PASS_SCORE,
  type AssessmentResult,
  type ChoiceResponse,
  type FileResponse,
  type MultiResponse,
  type ResponseLearner,
  type TextResponse,
  type VoteResponse,
} from './components/AssessmentsTab/assessmentResults'
import { COURSE_TITLE } from './courseTitle'
import './AssessmentAnswers.css'

const PAGE_SIZE = 10

/** Where the breadcrumb and the browser's Back both land. */
const COURSE_PATH = '/your-courses/course?tab=assessments'

/** DS table.md avatar + two-line stack cell. */
function person(learner: ResponseLearner) {
  return (
    <span className="tbl-media">
      {learner.avatar ? (
        <img className="avatar-32" src={learner.avatar} alt="" />
      ) : (
        <span className="avatar-32 asp-initials" aria-hidden="true">
          {learner.initials}
        </span>
      )}
      <span className="tbl-stack">
        <span className="primary">{learner.name}</span>
        <span className="supporting">{learner.role}</span>
      </span>
    </span>
  )
}

function learnerColumn<T extends { learner: ResponseLearner }>(): Column<T> {
  return { key: 'learner', header: 'Learner', width: '1 1 240px', render: (r) => person(r.learner) }
}

/* The answers as a sheet. The table renders them as badges, stacks and icons —
   none of which survives a CSV — so each shape restates its answer in words, and
   the columns follow the shape rather than being flattened to a common four. */
function sheet(a: AssessmentResult): string[][] {
  if (a.kind === 'graded')
    return [
      ['Learner', 'Role', 'Submitted', 'Answer', 'Result'],
      ...a.responses.map((r) => [
        r.learner.name,
        r.learner.role,
        r.submittedAt,
        a.options[r.optionIndex],
        r.correct ? 'Correct' : 'Incorrect',
      ]),
    ]

  if (a.kind === 'poll')
    return [
      ['Learner', 'Role', 'Submitted', 'Voted for'],
      ...a.responses.map((r) => [r.learner.name, r.learner.role, r.submittedAt, a.options[r.optionIndex]]),
    ]

  if (a.kind === 'text')
    return [
      ['Learner', 'Role', 'Submitted', 'Answer'],
      ...a.responses.map((r) => [r.learner.name, r.learner.role, r.submittedAt, r.text]),
    ]

  /* A row per question rather than per learner: a scenario's answers are the twelve
     picks, and a sheet holding only the score throws away what was exported for. */
  if (a.kind === 'multi')
    return [
      ['Learner', 'Role', 'Submitted', 'Question', 'Answer', 'Result'],
      ...a.responses.flatMap((r) =>
        a.questions.map((q, qi) => [
          r.learner.name,
          r.learner.role,
          r.submittedAt,
          `${qi + 1}. ${q.prompt}`,
          q.options[r.picks[qi]],
          r.picks[qi] === q.correctIndex ? 'Correct' : 'Incorrect',
        ]),
      ),
    ]

  return [
    ['Learner', 'Role', 'Submitted', 'File', 'Type', 'Size'],
    ...a.responses.map((r) => [
      r.learner.name,
      r.learner.role,
      r.submittedAt,
      r.fileName,
      r.fileKind,
      r.fileSize,
    ]),
  ]
}

/** The answer filter's options, which differ by what the format records. */
const ALL = 'all'

function filterOptions(a: AssessmentResult): { value: string; label: string }[] | null {
  /* Neither is marked, so there is nothing to narrow by but the name. */
  if (a.kind === 'text' || a.kind === 'file') return null

  if (a.kind === 'multi')
    return [
      { value: ALL, label: 'All results' },
      { value: 'pass', label: `Passed (${PASS_SCORE}% or above)` },
      { value: 'fail', label: `Below ${PASS_SCORE}%` },
    ]

  /* A graded question has a right answer, so the question worth asking of it is who
     got it — not which of four options each person picked. Which wrong answer they
     chose is in the chart above and in the row itself. */
  if (a.kind === 'graded')
    return [
      { value: ALL, label: 'All answers' },
      { value: 'correct', label: 'Correct' },
      { value: 'incorrect', label: 'Incorrect' },
    ]

  /* A poll has no right answer, so its options are the only cut there is. */
  return [
    { value: ALL, label: 'All votes' },
    ...a.options.map((label, i) => ({ value: String(i), label })),
  ]
}

function AssessmentAnswers() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, show: showToast } = useToast()

  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState(ALL)
  const [page, setPage] = useState(0)
  /* Unsorted until asked: the order responses arrive in is a fact too, and a list that
     sorts itself on arrival hides who answered first. */
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('none')

  /* Nothing in this app restores scroll on a route change, so a page opened from
     halfway down the assessments list would otherwise open halfway down itself. */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const assessment = courseAssessments.find((x) => x.id === id)
  const courseTitle = (location.state as { courseTitle?: string } | null)?.courseTitle ?? COURSE_TITLE

  /* An id that names nothing goes back to the list rather than rendering a page
     about an assessment that does not exist. */
  if (!assessment) return <Navigate to={COURSE_PATH} replace />

  const a = assessment
  const options = filterOptions(a)

  /* The line the card leads with, and what to call it.

     A situational test names its brief — the scenario the questions run on — so the label
     is Title. A fill-in-the-blanks states its whole sentence, because each chip below
     shows one clause of it and the clauses alone never spell it out. Everything else has
     one question and the title is it. A lesson quiz gets nothing: see the section below. */
  const leadText =
    a.kind !== 'multi' || a.type === 'fill-blank' || a.prompt ? a.title : null
  const leadLabel =
    a.kind === 'multi' && a.type === 'situational-test' ? 'Title' : 'Question'

  /* Both filters read the same rows, so they compose: a name and an answer together
     ask "did this person get it right", which is the question a search exists for. */
  const matches = <T extends { learner: ResponseLearner }>(r: T, i: number): boolean => {
    const q = query.trim().toLowerCase()
    if (q && !r.learner.name.toLowerCase().includes(q)) return false
    if (answer === ALL) return true
    if (a.kind === 'multi') {
      const pct = Math.round((multiScore(a, a.responses[i]) / a.questions.length) * 100)
      return answer === 'pass' ? pct >= PASS_SCORE : pct < PASS_SCORE
    }
    if (a.kind === 'graded') {
      return (a.responses[i] as ChoiceResponse).correct === (answer === 'correct')
    }
    if (a.kind === 'poll') {
      return String((a.responses[i] as VoteResponse).optionIndex) === answer
    }
    return true
  }

  /* Indices kept alongside the rows: the multi filter scores a response against its
     own assessment, which needs to know where in the original list it sat. */
  const kept = useMemo(
    () => a.responses.map((r, i) => ({ r, i })).filter(({ r, i }) => matches(r, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [a.id, query, answer],
  )

  /* Before the slice, so the order is the cohort's rather than this page's. Lowest first
     on the first press — a scenario is read to find who struggled. */
  const ordered =
    sort === 'none' || a.kind !== 'multi'
      ? kept
      : [...kept].sort(({ r: x }, { r: y }) => {
          const d = multiScore(a, x as MultiResponse) - multiScore(a, y as MultiResponse)
          return sort === 'asc' ? d : -d
        })

  const total = ordered.length
  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)
  const safePage = Math.min(page, lastPage)
  const from = safePage * PAGE_SIZE
  const pageRows = ordered.slice(from, from + PAGE_SIZE).map(({ r }) => r)

  const pagination = {
    from: total === 0 ? 0 : from + 1,
    to: Math.min(from + PAGE_SIZE, total),
    total,
    onPrev: safePage > 0 ? () => setPage(safePage - 1) : undefined,
    onNext: safePage < lastPage ? () => setPage(safePage + 1) : undefined,
  }

  /* Every cell quoted: answers are free text and carry commas, quotes and line
     breaks. The BOM is what stops Excel reading the accents as mojibake. */
  const download = () => {
    const body = sheet(a)
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${a.title} answers.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  /* One table per response shape — the columns differ, and the union of arrays
     cannot be narrowed from inside a shared renderer. */
  const table = (() => {
    if (a.kind === 'graded') {
      const columns: Column<ChoiceResponse>[] = [
        learnerColumn<ChoiceResponse>(),
        {
          key: 'answer',
          header: 'Answer',
          width: '1 1 240px',
          /* The page has the width the drawer did not, so the answer itself is here
             rather than only the verdict on it. */
          render: (r) => <span className="asp-choice">{a.options[r.optionIndex]}</span>,
        },
        {
          key: 'result',
          header: 'Result',
          width: '0 0 140px',
          render: (r) =>
            r.correct ? <Badge type="success" label="Correct" /> : <Badge type="error" label="Incorrect" />,
        },
      ]
      return (
        <Table
          columns={columns}
          rows={pageRows as ChoiceResponse[]}
          getRowKey={(r) => r.learner.id}
          pagination={pagination}
        />
      )
    }

    if (a.kind === 'poll') {
      const columns: Column<VoteResponse>[] = [
        learnerColumn<VoteResponse>(),
        { key: 'vote', header: 'Voted for', width: '1 1 240px', render: (r) => a.options[r.optionIndex] },
      ]
      return (
        <Table
          columns={columns}
          rows={pageRows as VoteResponse[]}
          getRowKey={(r) => r.learner.id}
          pagination={pagination}
        />
      )
    }

    if (a.kind === 'text') {
      const columns: Column<TextResponse>[] = [
        learnerColumn<TextResponse>(),
        {
          key: 'text',
          header: 'Answer',
          width: '1 1 420px',
          /* Whole, not clamped to two lines. A written answer has no length limit, and
             a drawer row that showed the first hundred characters was the reason an
             admin had to download the sheet to find out what their team had said. */
          render: (r) => <span className="asp-answer">{r.text}</span>,
        },
      ]
      return (
        <Table
          columns={columns}
          rows={pageRows as TextResponse[]}
          getRowKey={(r) => r.learner.id}
          pagination={pagination}
        />
      )
    }

    /* Not a table: several questions have no one answer to put in a cell, so each
       learner is a row that opens onto them. */
    if (a.kind === 'multi')
          return (
        <MultiQuestionAnswers
          assessment={a}
          responses={pageRows as MultiResponse[]}
          sort={sort}
          onToggleSort={() => {
            setSort(sort === 'asc' ? 'desc' : 'asc')
            setPage(0)
          }}
          pagination={pagination}
        />
      )

    const columns: Column<FileResponse>[] = [
      learnerColumn<FileResponse>(),
      {
        key: 'file',
        header: 'File',
        render: (r) => (
          <span className="tbl-stack asp-file">
            <span className="primary">{r.fileName}</span>
            <span className="supporting">
              {r.fileKind} · {r.fileSize}
            </span>
          </span>
        ),
      },
      {
        key: 'download',
        header: '',
        width: '0 0 52px',
        cellClassName: 'tbl-action',
        render: (r) => (
          /* An icon on its own in a column with no header — the tooltip is where it says
             what it does. */
          <Tooltip text="Download File" position="Top" icon={false}>
            <button
              className="icon-btn"
              onClick={() => showToast('info', `Downloading ${r.fileName}`)}
              aria-label={`Download ${r.fileName}`}
            >
              <ImportCurve size={20} color="var(--text-primary)" variant="Linear" />
            </button>
          </Tooltip>
        ),
      },
    ]
    return (
      <Table
        columns={columns}
        rows={pageRows as FileResponse[]}
        getRowKey={(r) => r.learner.id}
        pagination={pagination}
      />
    )
  })()

  const narrowed = query.trim() !== '' || answer !== ALL

  return (
    <div className="asp-layout">
      <LeftSidebar />
      <main className="asp-main">
        <div className="asp-page">
          <Breadcrumb
            items={[
              { label: 'Your Courses', onClick: () => navigate('/your-courses') },
              {
                label: courseTitle,
                /* Carrying the title back, because the course page reads it from router
                   state and would otherwise fall back to its own default. */
                onClick: () => navigate(COURSE_PATH, { state: { courseTitle } }),
              },
              /* Not the assessment's name, because it does not have one — a question is
                 its whole identity, and one of those is too long for a crumb while a
                 lesson quiz has three. The crumb says where you are instead. */
              { label: 'View Answers' },
            ]}
          />

          <header className="asp-header">
            <div className="asp-headline">
              <h1 className="asp-title">View Answers</h1>
              {/* The same name the row carries: a lesson quiz's underlying type is
                  Multiple Choice, and saying so contradicts the list it was opened from. */}
              {/* What kind of assessment this is, and how big. How many answered belongs
                  to the chart below, where it is the denominator of every figure — said
                  in both places it was the same sentence printed twice. */}
              <p className="asp-meta">
                {[
                  a.lesson ? 'Lesson Quiz' : typeLabel(a.type),
                  a.kind === 'multi'
                    ? `${a.questions.length} ${a.type === 'fill-blank' ? 'blanks' : 'questions'}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </header>

          {a.responses.length === 0 ? (
            <p className="asp-none">Nobody has answered this yet.</p>
          ) : (
            <>
              {/* What the card leads with, above the chart that summarises the rows.
                  Questions live here rather than in the header, which carries only the
                  format — the header cannot hold a question when a quiz has three.

                  A lesson quiz is the one format with nothing to put here: it has no name
                  of its own, its title IS its first question, and the chips below already
                  show that one. Printing it would be the same sentence twice. */}
              <section className="asp-brief">
                {leadText ? (
                  <div className="asp-brief__field">
                    {/* Named, now that the header no longer carries it: on its own the
                        line could be a heading, a note or an instruction. */}
                    <span className="asp-brief__label">{leadLabel}</span>
                    <p className="asp-brief__value">{leadText}</p>
                  </div>
                ) : null}
                <AnswerStats key={a.id} assessment={a} />
              </section>

              <div className="asp-toolbar">
                <Search
                  size="M"
                  value={query}
                  onChange={(v) => {
                    setQuery(v)
                    setPage(0)
                  }}
                  placeholder="Search learners"
                  ariaLabel="Search learners"
                  className="asp-search"
                />
                {/* Grouped, so the export sits at the edge whether or not a filter is
                    beside it — short text and exercise have nothing to filter by. */}
                <div className="asp-toolbar__end">
                {options ? (
                  <Dropdown
                    options={options}
                    value={answer}
                    onChange={(v) => {
                      setAnswer(v)
                      setPage(0)
                    }}
                    size="md"
                    menuAlign="end"
                    iconLeft={<Sort size={20} color="var(--text-primary)" variant="Linear" />}
                    className="asp-filter"
                  />
                ) : null}
                {/* With the two controls that narrow the table, above the table it
                    exports. An exercise has nothing to export as a sheet — its answers
                    are the uploaded files, fetched row by row. */}
                {a.kind !== 'file' ? (
                  <Button
                    variant="outlined-2"
                    icon={<CsvIcon size={20} color="currentColor" />}
                    onClick={download}
                    disabled={a.responses.length === 0}
                  >
                    Download Answers
                  </Button>
                ) : null}
                </div>
              </div>

              {total === 0 ? (
                <div className="asp-noresults">
                  <img className="asp-empty__art" src={searchIllustration} alt="" width={72} height={72} />
                  <h2 className="asp-empty__title">No answers match</h2>
                  <p className="asp-empty__body">
                    {narrowed
                      ? 'Clear the search or the answer filter to see every response.'
                      : 'Nobody has answered this yet.'}
                  </p>
                </div>
              ) : (
                table
              )}
            </>
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default AssessmentAnswers
