import { useMemo, useState } from 'react'
import { Table, type Column } from '@/components/Table/Table'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Search from '@/components/Search/Search'
import EmptyState from '@/components/EmptyState/EmptyState'
import CsvIcon from '@/components/icons/CsvIcon'
import {
  SIGN_OFF_DEMO_COURSE,
  SIGN_OFF_STATUS_LABEL,
  formatSignOffDate,
  getSignOffRows,
  signOffCsv,
  useSignOff,
  type SignOffRow,
  type SignOffStatus,
} from '@/data/trainerSignOff'
import emptyIllustration from '@/assets/empty-state-illustrations/certificates.svg'
import searchIllustration from '@/assets/empty-state-illustrations/no-results.svg'
import './SignOffTab.css'

const PAGE_SIZE = 10

const STATUS_BADGE: Record<SignOffStatus, 'success' | 'warning' | 'in-progress'> = {
  signed: 'success',
  awaiting: 'warning',
  'in-progress': 'in-progress',
}

/** Status order for the list: who still needs a licence holder comes first. */
const STATUS_ORDER: Record<SignOffStatus, number> = { awaiting: 0, 'in-progress': 1, signed: 2 }

const empty = <span className="cd-signoff-muted">-</span>

/**
 * Admin Sign-off tab on the course details page (DES-335, D1/D2): each learner's
 * sign-off status, the licence holder's details and the date, with a CSV export.
 * No filters and no reset (deferred to DEV-4734).
 */
function SignOffTab() {
  const ownRecord = useSignOff(SIGN_OFF_DEMO_COURSE.id)
  const allRows = useMemo(
    () => [...getSignOffRows(ownRecord)].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    [ownRecord],
  )
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const q = search.trim().toLowerCase()
  const rows = q
    ? allRows.filter((r) =>
        [r.name, r.email, r.holderName, r.licenceNumber].some((v) => v?.toLowerCase().includes(q)),
      )
    : allRows
  const lastPage = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1)
  const safePage = Math.min(page, lastPage)
  const from = safePage * PAGE_SIZE
  const pageRows = rows.slice(from, from + PAGE_SIZE)

  const counts = (status: SignOffStatus) => allRows.filter((r) => r.status === status).length
  const summary = `${counts('awaiting')} awaiting sign-off · ${counts('in-progress')} course in progress · ${counts('signed')} signed off`

  /* Always the whole course: search only finds people on screen, never trims the record. */
  const downloadCsv = () => {
    const url = URL.createObjectURL(new Blob([signOffCsv(allRows)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${SIGN_OFF_DEMO_COURSE.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-sign-offs.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns: Column<SignOffRow>[] = [
    {
      key: 'learner',
      header: 'Learner',
      width: '1 1 200px',
      render: (r) => (
        <span className="tbl-stack">
          <span className="primary">{r.name}</span>
          <span className="supporting">{r.email}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '0 0 184px',
      render: (r) => <Badge type={STATUS_BADGE[r.status]} icon label={SIGN_OFF_STATUS_LABEL[r.status]} />,
    },
    {
      key: 'holder',
      header: 'Licence holder',
      width: '1 1 140px',
      render: (r) => r.holderName ?? empty,
    },
    {
      key: 'licence',
      header: 'Licence number',
      width: '0 0 124px',
      render: (r) => r.licenceNumber ?? empty,
    },
    {
      key: 'board',
      header: 'Issuing board',
      width: '1 1 200px',
      render: (r) => r.issuingBoard ?? empty,
    },
    {
      key: 'completed',
      header: 'Completed on',
      width: '0 0 112px',
      render: (r) => (r.completedOn ? formatSignOffDate(r.completedOn) : empty),
    },
    {
      key: 'signed',
      header: 'Signed on',
      width: '0 0 112px',
      render: (r) => (r.signedOn ? formatSignOffDate(r.signedOn) : empty),
    },
  ]

  if (allRows.length === 0) {
    return (
      <EmptyState
        illustration={<img src={emptyIllustration} alt="" width={72} height={72} />}
        title="No sign-offs yet"
        description="Enrolled learners appear here with their sign-off status."
      />
    )
  }

  return (
    <section className="cd-signoff">
      <div className="cd-signoff-actions">
        <span className="cd-select-count cd-signoff-summary">{summary}</span>
        <Search
          size="M"
          value={search}
          onChange={(v) => {
            setSearch(v)
            setPage(0)
          }}
          placeholder="Search for learners or licence holders"
          ariaLabel="Search for learners or licence holders"
          className="cd-signoff-search"
        />
        <Button variant="outlined-2" onClick={downloadCsv} icon={<CsvIcon size={20} color="currentColor" />}>
          Download CSV
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          illustration={<img src={searchIllustration} alt="" width={72} height={72} />}
          title="No learners match your search"
          description="Try a learner's name or email, or a licence holder's name or licence number."
        />
      ) : (
        <Table
          columns={columns}
          rows={pageRows}
          getRowKey={(r) => r.id}
          pagination={{
            from: from + 1,
            to: from + pageRows.length,
            total: rows.length,
            onPrev: safePage > 0 ? () => setPage(safePage - 1) : undefined,
            onNext: safePage < lastPage ? () => setPage(safePage + 1) : undefined,
          }}
        />
      )}
    </section>
  )
}

export default SignOffTab
