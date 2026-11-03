import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import { ImportCurve, Sort } from 'iconsax-react'
import CsvIcon from '@/components/icons/CsvIcon'
import Avatar from '@/components/Avatar/Avatar'
import Badge from '@/components/Badge/Badge'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Button from '@/components/Button/Button'
import Dropdown from '@/components/Dropdown/Dropdown'
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar'
import Search from '@/components/Search/Search'
import Tooltip from '@/components/Tooltip/Tooltip'
import Table, { type Column } from '@/components/Table/Table'
import ToastContainer, { ToastSpinner, useToast } from '@/components/Toast/Toast'
import EmptyState from '@/components/EmptyState/EmptyState'
import noResultsIllustration from '@/assets/empty-state-illustrations/no-results.svg'
import AnswerStats, { BandLabel } from './components/AssessmentsTab/AnswerStats'
import MultiQuestionAnswers from './components/AssessmentsTab/MultiQuestionAnswers'
import SelectAllAnswers from './components/AssessmentsTab/SelectAllAnswers'
import {
  courseAssessments,
  formatName,
  hasStatedAnswer,
  multiScore,
  NOT_DRAWN,
  perAttempt,
  PASS_SCORE,
  answerRows,
  type AssessmentResult,
  type ChoiceResponse,
  type FileResponse,
  type MultiResponse,
  type ResponseLearner,
  type NotAnswered,
  type TextResponse,
  type VoteResponse,
} from './components/AssessmentsTab/assessmentResults'
import { artOf, tintClass } from './components/AssessmentsTab/tileTint'
import MeshGradient from '@/components/MeshGradient/MeshGradient'
import { useTheme } from '@/hooks/useTheme'
import { answerMesh, hasMesh } from './answerMesh'
import { COURSE_TITLE } from './courseTitle'
import './components/AssessmentsTab/AssessmentGrid.css'
import './AssessmentAnswers.css'

const PAGE_SIZE = 10

/** Where the breadcrumb and the browser's Back both land. */
const COURSE_PATH = '/your-courses/course?tab=assessments'

/** DS table.md avatar + two-line stack cell. */
function person(learner: ResponseLearner) {
  return (
    <span className="tbl-media">
      <Avatar src={learner.avatar} size={32} />
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
        /* A sheet cannot hold the images, so it names them by their label, or their place in the question. */
        r.picks ? r.picks.map((p) => a.options[p] || `Image ${p + 1}`).join('; ') : a.options[r.optionIndex],
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
        a.questions.flatMap((q, qi) =>
          /* A bank question this learner was not given has no row. */
          r.picks[qi] === NOT_DRAWN
            ? []
            : [[
                r.learner.name,
                r.learner.role,
                r.submittedAt,
                `${qi + 1}. ${q.prompt}`,
                q.options[r.picks[qi]],
                r.picks[qi] === q.correctIndex ? 'Correct' : 'Incorrect',
              ]],
        ),
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
/** Every filter ends with the learners yet to answer, listed as Short text lists them. */
const NOT_ANSWERED = 'not-answered'
const NOT_ANSWERED_OPTION = { value: NOT_ANSWERED, label: 'Not answered' }

function filterOptions(a: AssessmentResult): { value: string; label: string }[] | null {
  /* Short text and exercises are not marked, so the only cut is whether they have answered yet. */
  if (a.kind === 'text' || a.kind === 'file')
    return [
      { value: ALL, label: 'All learners' },
      { value: 'answered', label: 'Answered' },
      { value: 'not-answered', label: 'Not answered' },
    ]

  /* A situational test is the one format scored on a scale; the rest are all or nothing. */
  if (a.kind === 'multi' && a.type === 'situational-test')
    return [
      { value: ALL, label: 'All results' },
      { value: 'pass', label: `Passed (${PASS_SCORE}% or above)` },
      { value: 'fail', label: `Below ${PASS_SCORE}%` },
      NOT_ANSWERED_OPTION,
    ]

  /* A graded question has a right answer, so the question worth asking of it is who
     got it — not which of four options each person picked. Which wrong answer they
     chose is in the chart above and in the row itself. */
  if (a.kind === 'graded' || a.kind === 'multi')
    return [
      { value: ALL, label: 'All answers' },
      { value: 'correct', label: 'Correct' },
      { value: 'incorrect', label: 'Incorrect' },
      NOT_ANSWERED_OPTION,
    ]

  /* A poll has no right answer, so its options are the only cut there is. */
  return [
    { value: ALL, label: 'All votes' },
    ...a.options.map((label, i) => ({ value: String(i), label })),
  ]
}

/** Longest cut of `text` that still fits in two lines of `probe` with the ellipsis and
    View More after it, at a word boundary. `probe` is a hidden copy at the same width. */
function fitTwoLines(text: string, probe: HTMLElement, textEl: HTMLElement): number | null {
  const max = parseFloat(getComputedStyle(probe).lineHeight) * 2 + 1
  textEl.textContent = text
  probe.dataset.full = 'true'
  if (probe.offsetHeight <= max) return null
  probe.dataset.full = 'false'
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    textEl.textContent = text.slice(0, mid).trimEnd()
    if (probe.offsetHeight <= max) lo = mid
    else hi = mid - 1
  }
  const space = text.lastIndexOf(' ', lo)
  return space > lo * 0.6 ? space : lo
}

/** A written answer, held to two lines that end in "…" and View More when it runs
    longer. The row grows to the full text with the project's 0.3s ease-in-out. */
function LongAnswer({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const probeTextRef = useRef<HTMLSpanElement>(null)
  const from = useRef<number | null>(null)
  const [open, setOpen] = useState(false)
  /* Where the collapsed answer is cut; null when it fits in two lines. */
  const [cut, setCut] = useState<number | null>(null)

  /* Measured on a hidden copy, and again when the column resizes. */
  useLayoutEffect(() => {
    const probe = probeRef.current
    const probeText = probeTextRef.current
    if (!probe || !probeText) return
    const measure = () => setCut(fitTwoLines(text, probe, probeText))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(probe)
    return () => ro.disconnect()
  }, [text])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || from.current === null) return
    const start = from.current
    from.current = null
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(el, { height: start }, { height: el.offsetHeight, duration: 0.3, ease: 'power2.inOut', clearProps: 'height' })
  }, [open])

  const toggle = (
    <Button
      variant="text"
      size="sm"
      className="asp-viewmore"
      onClick={() => {
        from.current = ref.current?.offsetHeight ?? null
        setOpen(!open)
      }}
      aria-expanded={open}
    >
      {open ? 'View Less' : 'View More'}
    </Button>
  )

  return (
    <span className="asp-longanswer">
      <span ref={ref} className="asp-answer">
        {cut === null || open ? text : `${text.slice(0, cut).trimEnd()}…`}
        {cut !== null && <> {toggle}</>}
      </span>
      {/* Hidden copy the cut is measured on: the text, the ellipsis and the button. */}
      <span ref={probeRef} className="asp-answer asp-answer--probe" aria-hidden="true">
        <span ref={probeTextRef} />
        <span className="asp-answer__probe-end">… <span className="ds-btn ds-btn--text ds-btn--sm asp-viewmore">View More</span></span>
      </span>
    </span>
  )
}

function AssessmentAnswers() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, show: showToast } = useToast()

  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState(ALL)
  /* A poll filters by any number of options at once; empty means every vote. */
  const [votes, setVotes] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  /* Unsorted until asked: the order responses arrive in is a fact too, and a list that
     sorts itself on arrival hides who answered first. */
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('none')

  /* Nothing in this app restores scroll on a route change, so a page opened from
     halfway down the assessments list would otherwise open halfway down itself. */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const assessment = courseAssessments.find((x) => x.id === id)
  /* The question card glows with a mesh gradient where its format has one (answerMesh.ts). */
  const { theme } = useTheme()
  const meshArt = assessment ? artOf(assessment) : undefined
  const mesh = useMemo(
    () => (meshArt && hasMesh(meshArt) ? answerMesh(meshArt) : null),
    [meshArt, theme],
  )
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
  /* The lesson quiz question the deck is showing; the deck reports it as it turns. */
  const lessonQuestion =
    a.kind === 'multi' && a.lesson ? a.questions[questionIndex]?.prompt : undefined
  const leadText =
    a.kind !== 'multi' || a.type === 'fill-blank' || a.prompt ? a.title : null

  /* Both filters read the same rows, so they compose: a name and an answer together
     ask "did this person get it right", which is the question a search exists for. */
  const matches = <T extends { learner: ResponseLearner }>(r: T): boolean => {
    const q = query.trim().toLowerCase()
    if (q && !r.learner.name.toLowerCase().includes(q)) return false
    if (a.kind === 'text' || a.kind === 'file') {
      if (answer === ALL) return true
      return !('notAnswered' in r) === (answer === 'answered')
    }
    /* Everywhere else the learners yet to answer show only under Not answered. */
    if ('notAnswered' in r) {
      return a.kind === 'poll' ? votes.includes(NOT_ANSWERED) : answer === NOT_ANSWERED
    }
    if (a.kind === 'poll') {
      return votes.length === 0 || votes.includes(String((r as unknown as VoteResponse).optionIndex))
    }
    if (answer === ALL) return true
    if (answer === NOT_ANSWERED) return false
    if (a.kind === 'multi') {
      const score = multiScore(a, r as unknown as MultiResponse)
      if (a.type !== 'situational-test') return (score === perAttempt(a)) === (answer === 'correct')
      const pct = Math.round((score / perAttempt(a)) * 100)
      return answer === 'pass' ? pct >= PASS_SCORE : pct < PASS_SCORE
    }
    if (a.kind === 'graded') {
      return (r as unknown as ChoiceResponse).correct === (answer === 'correct')
    }
    return true
  }

  /* Every format carries the learners yet to answer: Short text and exercises list them
     among the answers, the rest only under the Not answered filter. */
  const rows: { learner: ResponseLearner }[] = answerRows<{ learner: ResponseLearner }>(a.responses)

  /* Indices kept alongside the rows: the multi filter scores a response against its
     own assessment, which needs to know where in the original list it sat. */
  const kept = useMemo(
    () => rows.map((r, i) => ({ r, i })).filter(({ r }) => matches(r)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [a.id, query, answer, votes],
  )

  /* Before the slice, so the order is the cohort's rather than this page's. Lowest first
     on the first press — a scenario is read to find who struggled. */
  const ordered =
    sort === 'none' || a.kind !== 'multi' || answer === NOT_ANSWERED
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
    /* Not answered: the Short text layout, the learner and a dash where the answer goes. */
    if (a.kind !== 'text' && a.kind !== 'file' && a.kind !== 'poll' && answer === NOT_ANSWERED) {
      const columns: Column<NotAnswered>[] = [
        learnerColumn<NotAnswered>(),
        { key: 'answer', header: 'Answer', width: '1 1 420px', render: () => '–' },
      ]
      return (
        <Table
          columns={columns}
          rows={pageRows as NotAnswered[]}
          getRowKey={(r) => r.learner.id}
          pagination={pagination}
        />
      )
    }

    /* Select all that apply: several ticked options to a learner, so each row opens onto
       them, as the scenario and lesson quiz rows open onto their questions. */
    if (a.kind === 'graded' && a.correctIndices && !a.optionImages) {
      return <SelectAllAnswers assessment={a} responses={pageRows as ChoiceResponse[]} pagination={pagination} />
    }

    if (a.kind === 'graded') {
      /* Banded formats record how much of an arrangement was right, not which option
         was chosen — see hasStatedAnswer. */
      const banded = !hasStatedAnswer(a)
      const answerColumn: Column<ChoiceResponse> = {
          key: 'answer',
          header: 'Answer',
          width: '1 1 240px',
          /* The page has the width the drawer did not, so the answer itself is here
             rather than only the verdict on it. A banded format has no answer to print —
             its "option" is how much of the arrangement was right — so the count leads
             and the phrase steps back, the way the chart above states it. */
          render: (r) => {
            /* Image options (DES-345): the images they picked, never "Option N". */
            if (a.optionImages && r.picks) {
              return (
                <span className="asp-thumbs">
                  {r.picks.map((p) => (
                    <img
                      key={p}
                      className={`asp-thumb ${a.correctIndices?.includes(p) ? 'is-correct' : 'is-incorrect'}`}
                      src={a.optionImages![p]} alt={a.options[p] || `Image ${p + 1}`} />
                  ))}
                  {/* One dashed square per right image they did not pick. */}
                  {a.correctIndices
                    ?.filter((c) => !r.picks!.includes(c))
                    .map((c) => (
                      <span
                        key={`missed-${c}`}
                        className="asp-thumb-missed"
                        role="img"
                        aria-label={`Missed: ${a.options[c] || `Image ${c + 1}`}`}
                      />
                    ))}
                </span>
              )
            }
            const answer = a.options[r.optionIndex]
            return (
              <span className="asp-choice">
                {banded ? <BandLabel label={answer} /> : answer}
              </span>
            )
          },
        }
      const columns: Column<ChoiceResponse>[] = [
        learnerColumn<ChoiceResponse>(),
        answerColumn,
        {
          key: 'result',
          header: 'Result',
          align: 'right',
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
      const columns: Column<VoteResponse | NotAnswered>[] = [
        learnerColumn<VoteResponse | NotAnswered>(),
        /* Laid out like the short text table: the answer left-aligned beside the learner. */
        { key: 'vote', header: 'Voted for', width: '1 1 420px', render: (r) => ('notAnswered' in r ? '–' : a.options[r.optionIndex]) },
      ]
      return (
        <Table
          columns={columns}
          rows={pageRows as (VoteResponse | NotAnswered)[]}
          getRowKey={(r) => r.learner.id}
          pagination={pagination}
        />
      )
    }

    if (a.kind === 'text') {
      const columns: Column<TextResponse | NotAnswered>[] = [
        learnerColumn<TextResponse | NotAnswered>(),
        {
          key: 'text',
          header: 'Answer',
          width: '1 1 420px',
          /* Whole, not clamped to two lines. A written answer has no length limit, and
             a drawer row that showed the first hundred characters was the reason an
             admin had to download the sheet to find out what their team had said. */
          render: (r) => ('notAnswered' in r ? '–' : <LongAnswer text={r.text} />),
        },
      ]
      return (
        <Table
          columns={columns}
          rows={pageRows as (TextResponse | NotAnswered)[]}
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

    const columns: Column<FileResponse | NotAnswered>[] = [
      learnerColumn<FileResponse | NotAnswered>(),
      {
        key: 'file',
        header: 'File',
        render: (r) => 'notAnswered' in r ? '–' : (
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
        render: (r) => 'notAnswered' in r ? null : (
          /* An icon on its own in a column with no header — the tooltip is where it says
             what it does. */
          <Tooltip text="Download File" position="Top" alignment="End" icon={false}>
            <button
              className="icon-btn"
              onClick={() => showToast('success', `Downloading ${r.fileName}`, ToastSpinner)}
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
        rows={pageRows as (FileResponse | NotAnswered)[]}
        getRowKey={(r) => r.learner.id}
        pagination={pagination}
      />
    )
  })()

  const narrowed = query.trim() !== '' || answer !== ALL || votes.length > 0

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

          {/* The question and its charts share one bordered card. */}
          <div className={mesh ? 'asp-card asp-card--mesh' : `asp-card asp-card--tinted${tintClass(a, new Set())}`}>
          {mesh && <MeshGradient config={mesh} interactive={false} breathe={0} className="asp-card__mesh" />}
          <header className="asp-header">
            <div className="asp-headline">
              {/* The question leads the page. A lesson quiz has several, so the title is
                  the one the deck below is showing. */}
              <h2 className="asp-title">{lessonQuestion ?? leadText ?? a.title}</h2>
              {/* The same name the row carries: a lesson quiz's underlying type is
                  Multiple Choice, and saying so contradicts the list it was opened from. */}
              {/* What kind of assessment this is, and how big. How many answered belongs
                  to the chart below, where it is the denominator of every figure — said
                  in both places it was the same sentence printed twice. */}
              <div className="asp-meta">
                {[
                  formatName(a),
                  /* A question bank has no single question count to state, so it is named,
                     and the tooltip says why learners' questions differ. */
                  a.kind === 'multi' && a.drawCount
                    ? `Question bank of ${a.questions.length}, picked at random for each learner`
                    /* A question deck already says "Question 1 of N", so only the blanks
                       count is stated here. */
                    : a.kind === 'multi' && a.type === 'fill-blank'
                      ? `${a.questions.length} blanks`
                      : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                {/* How many of the enrolled learners have answered, so the gap shows; in the
                    table's "3 of 4" style, the count at full strength. */}
                <span aria-hidden="true">·</span>
                <span>
                  <BandLabel label={`${a.responses.length} of ${a.enrolled} answered`} />
                </span>
                {a.kind === 'multi' && a.drawCount ? (
                  <Tooltip
                    text="Learners answer different questions, so each question shows how many learners answered it."
                    iconSize={16}
                    iconColor="var(--text-secondary)"
                  />
                ) : null}
              </div>
            </div>
          </header>

          {a.responses.length === 0 ? (
            <p className="asp-none">Nobody has answered this yet.</p>
          ) : (
            <section className="asp-brief">
              <AnswerStats key={a.id} assessment={a} onQuestionChange={setQuestionIndex} />
            </section>
          )}
          </div>

          {a.responses.length === 0 ? null : (
            <>
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
                {a.kind === 'poll' ? (
                  <Dropdown
                    options={[...a.options.map((label, i) => ({ value: String(i), label })), NOT_ANSWERED_OPTION]}
                    multiple
                    values={votes}
                    onChangeValues={(v) => {
                      setVotes(v)
                      setPage(0)
                    }}
                    placeholder="All votes"
                    allLabel="All votes"
                    summaryLabel="Votes"
                    size="md"
                    menuAlign="start"
                    iconLeft={<Sort size={20} color="var(--text-primary)" variant="Linear" />}
                    className="asp-filter"
                  />
                ) : options ? (
                  <Dropdown
                    options={options}
                    value={answer}
                    onChange={(v) => {
                      setAnswer(v)
                      setPage(0)
                    }}
                    size="md"
                    menuAlign="start"
                    iconLeft={<Sort size={20} color="var(--text-primary)" variant="Linear" />}
                    className="asp-filter"
                  />
                ) : null}
                {/* The filter sits beside the search it narrows with; the export keeps the
                    far edge. Short text and exercise have nothing to filter by. */}
                <div className="asp-toolbar__end">
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
                <EmptyState
                  illustration={<img src={noResultsIllustration} alt="" width={72} height={72} />}
                  title="No results"
                  description={
                    narrowed
                      ? "Clear the search or the answer filter to see every answer"
                      : "Nobody has answered this yet."
                  }
                />
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
