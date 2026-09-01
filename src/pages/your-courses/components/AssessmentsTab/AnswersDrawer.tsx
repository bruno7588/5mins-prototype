import { useRef, useState } from 'react'
import { ImportCurve } from 'iconsax-react'
import CsvIcon from '@/components/icons/CsvIcon'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Table, { type Column } from '@/components/Table/Table'
import SituationalAnswers from './SituationalAnswers'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import { typeLabel } from '@/data/aiAssessmentGeneration'
import '@/pages/my-team/CoursesDrawer.css'
import {
  correctPct,
  hasStatedAnswer,
  type AssessmentResult,
  type ChoiceResponse,
  type FileResponse,
  type ResponseLearner,
  type TextResponse,
  type VoteResponse,
} from './assessmentResults'
import './AnswersDrawer.css'

/** DS table.md avatar + two-line stack cell. */
function person(learner: ResponseLearner) {
  return (
    <span className="tbl-media">
      {learner.avatar ? (
        <img className="avatar-32" src={learner.avatar} alt="" />
      ) : (
        <span className="avatar-32 answ-initials" aria-hidden="true">
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
  /* Basis at the DS sticky-column floor, free to take the slack the fixed
     answer column leaves. */
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
  if (a.kind === 'situational')
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

interface Props {
  assessment: AssessmentResult
  onClose: () => void
}

function AnswersDrawer({ assessment: a, onClose }: Props) {
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const { toasts, show: showToast } = useToast()

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 300)
  }

  useOverlayA11y(panelRef, !closing, { onEscape: handleClose })

  const pct = correctPct(a)

  /* Every cell quoted: answers are free text and carry commas, quotes and line
     breaks. The BOM is what stops Excel reading the accents as mojibake. */
  const download = () => {
    const body = sheet(a)
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8' }))
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
          width: '0 0 140px',
          /* The correct answer is stated above the table, so the row only has to
             say whether they matched it. */
          render: (r) =>
            r.correct ? <Badge type="success" label="Correct" /> : <Badge type="error" label="Incorrect" />,
        },
      ]
      return <Table columns={columns} rows={a.responses} getRowKey={(r) => r.learner.id} />
    }

    if (a.kind === 'poll') {
      const columns: Column<VoteResponse>[] = [
        learnerColumn<VoteResponse>(),
        { key: 'vote', header: 'Voted for', width: '0 0 320px', render: (r) => a.options[r.optionIndex] },
      ]
      return <Table columns={columns} rows={a.responses} getRowKey={(r) => r.learner.id} />
    }

    if (a.kind === 'text') {
      const columns: Column<TextResponse>[] = [
        learnerColumn<TextResponse>(),
        {
          key: 'text',
          header: 'Answer',
          width: '0 0 320px',
          render: (r) => <span className="answ-answer">{r.text}</span>,
        },
      ]
      return <Table columns={columns} rows={a.responses} getRowKey={(r) => r.learner.id} />
    }

    /* Not a table: a scenario has no one answer to put in a cell, so each learner is
       a row that opens onto the questions. */
    if (a.kind === 'situational') return <SituationalAnswers assessment={a} />

    const columns: Column<FileResponse>[] = [
      learnerColumn<FileResponse>(),
      {
        key: 'file',
        header: 'File',
        render: (r) => (
          <span className="tbl-stack answ-file">
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
          <button
            className="icon-btn"
            onClick={() => showToast('info', `Downloading ${r.fileName}`)}
            aria-label={`Download ${r.fileName}`}
          >
            <ImportCurve size={20} color="var(--text-primary)" variant="Linear" />
          </button>
        ),
      },
    ]
    return <Table columns={columns} rows={a.responses} getRowKey={(r) => r.learner.id} />
  })()

  return (
    <>
      <div
        className={`overlay-backdrop${closing ? ' overlay-backdrop--closing' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={`side-drawer${closing ? ' side-drawer--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="answ-title"
        tabIndex={-1}
      >
        <div className="side-drawer__header">
          <div className="side-drawer__headline">
            <div className="answ-headline">
              <h2 className="answ-title" id="answ-title">
                {a.title}
              </h2>
              <p className="answ-meta">
                {typeLabel(a.type)} · {a.responses.length} of {a.enrolled} responded
                {pct !== null ? ` · ${pct}% correct` : ''}
              </p>
            </div>
            <CloseButton onClick={handleClose} />
          </div>

          {/* The question and the answer it was marked against, held above the
              table so the rows can be read without scrolling back up. */}
          <section className="answ-brief">
            <div className="answ-brief__field">
              <span className="answ-brief__label">
                {a.kind === 'situational' ? `Brief · ${a.questions.length} questions` : 'Question'}
              </span>
              <p className="answ-brief__value">{a.prompt}</p>
            </div>
            {/* Only where there is an answer to state: a poll, a written answer and an
                upload are not scored, and the banded formats record how much of an
                arrangement was right rather than which option was picked. */}
            {hasStatedAnswer(a) && (
              <div className="answ-brief__field">
                <span className="answ-brief__label answ-brief__label--right">Correct answer</span>
                <p className="answ-brief__value">{a.options[a.correctIndex]}</p>
              </div>
            )}
          </section>
        </div>

        <div className="side-drawer__content">
          {a.responses.length === 0 ? (
            <p className="answ-none">Nobody has answered this yet.</p>
          ) : (
            table
          )}
        </div>

        {/* An exercise has nothing to export as a sheet — the answers are the
            uploaded files themselves, fetched row by row. */}
        {a.kind !== 'file' && (
          <div className="side-drawer__footer">
            <div className="side-drawer__footer-divider" />
            <div className="side-drawer__buttons">
              <Button
                variant="outlined"
                icon={<CsvIcon size={20} color="currentColor" />}
                onClick={download}
                disabled={a.responses.length === 0}
              >
                Download Answers
              </Button>
            </div>
          </div>
        )}
      </aside>

      <ToastContainer toasts={toasts} />
    </>
  )
}

export default AnswersDrawer
