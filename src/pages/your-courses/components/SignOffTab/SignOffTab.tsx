import { useMemo, useState } from 'react'
import { Danger, SmsNotification } from 'iconsax-react'
import { Table, type Column } from '@/components/Table/Table'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Search from '@/components/Search/Search'
import Tooltip from '@/components/Tooltip/Tooltip'
import BulkActionBar from '@/components/BulkActionBar/BulkActionBar'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import Avatar from '@/components/Avatar/Avatar'
import { ReminderDrawerShell, ReminderRecipients } from '@/pages/my-team/ReminderDrawer'
import EmptyState from '@/components/EmptyState/EmptyState'
import CsvIcon from '@/components/icons/CsvIcon'
import {
  SIGN_OFF_DEMO_COURSE,
  SIGN_OFF_STATUS_LABEL,
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

/** Status order for the list: who still needs a licence holder comes first, longest
 *  wait (earliest completion) first; signed off and not completed follow mixed, in
 *  the order learners were enrolled. */
const STATUS_ORDER: Record<SignOffStatus, number> = { awaiting: 0, signed: 1, 'in-progress': 1 }

const byPriority = (a: SignOffRow, b: SignOffRow) =>
  STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
  (a.status === 'awaiting' && b.status === 'awaiting' ? (a.completedOn ?? '').localeCompare(b.completedOn ?? '') : 0)

/** Sign-off reminder copy, in the My Team reminder drawer. */
const reminderSubject = (rows: SignOffRow[]) =>
  rows.length === 1
    ? `${rows[0].name.split(' ')[0]}, your training needs signing off`
    : 'Your training needs signing off'
const REMINDER_MESSAGE =
  `Hi there,\nYou've completed ${SIGN_OFF_DEMO_COURSE.title}. To get your certificate, find your personal licence holder, open the course on your device and hand it to them to sign off.\nThanks.`

/** Only learners whose course is complete and not yet signed off can be reminded. */
const canRemind = (r: SignOffRow) => r.status === 'awaiting'

const empty = <span className="cd-signoff-muted">-</span>

/** Table date cell per table.md: "Oct 8," over the year in --text-tertiary. */
function DateCell({ value }: { value?: string | null }) {
  if (!value) return empty
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return (
    <span className="tbl-date">
      <span className="day">{d.toLocaleString('en-US', { month: 'short' })} {d.getDate()},</span>
      <span className="year">{d.getFullYear()}</span>
    </span>
  )
}

/**
 * Admin Sign-off tab on the course details page (DES-335, D1/D2): each learner's
 * sign-off status, the licence holder's details and the date, with a CSV export.
 * No filters and no reset (deferred to DEV-4734). Learners who need sign-off can be
 * sent a reminder, one at a time or in bulk: the learner is the only person the
 * admin can reach, since the licence holder is only known once they sign.
 */
function SignOffTab() {
  const ownRecord = useSignOff(SIGN_OFF_DEMO_COURSE.id)
  const allRows = useMemo(
    () => [...getSignOffRows(ownRecord)].sort(byPriority),
    [ownRecord],
  )
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { toasts, show: showToast } = useToast()

  /* Who the open reminder drawer is for: one row (its icon) or the selection (bulk bar). */
  const [recipients, setRecipients] = useState<SignOffRow[] | null>(null)
  const remind = (ids: string[]) => setRecipients(allRows.filter((r) => ids.includes(r.id)))
  const sendReminders = () => {
    if (!recipients) return
    showToast('success', recipients.length === 1 ? `Reminder sent to ${recipients[0].name}` : `Reminder sent to ${recipients.length} learners`)
    setRecipients(null)
    setSelected(new Set())
  }

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

  const remindable = pageRows.filter(canRemind)
  const allSelected = remindable.length > 0 && remindable.every((r) => selected.has(r.id))
  const someSelected = remindable.some((r) => selected.has(r.id))
  const toggleRow = (r: SignOffRow) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(r.id)) next.delete(r.id)
      else next.add(r.id)
      return next
    })
  const toggleAll = () =>
    setSelected((s) => {
      const next = new Set(s)
      remindable.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)))
      return next
    })

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
      /* Fits the widest badge, "Course not completed" with no icon, plus the cell padding. */
      width: '0 0 208px',
      render: (r) => (
        <Badge
          type={STATUS_BADGE[r.status]}
          // Course not completed has no icon, to keep the column narrow; Needs sign-off
          // takes Danger; Signed off keeps the badge default tick.
          icon={r.status !== 'in-progress'}
          customIcon={r.status === 'awaiting' ? <Danger size={16} color="currentColor" variant="Linear" /> : undefined}
          label={SIGN_OFF_STATUS_LABEL[r.status]}
        />
      ),
    },
    {
      key: 'holder',
      header: 'Licence holder',
      width: '1 1 140px',
      cellClassName: 'cd-signoff-wrap',
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
      width: '1 1 176px',
      cellClassName: 'cd-signoff-wrap',
      render: (r) => r.issuingBoard ?? empty,
    },
    {
      key: 'signed',
      header: 'Signed on',
      width: '0 0 112px',
      render: (r) => <DateCell value={r.signedOn} />,
    },
    {
      key: 'remind',
      header: '',
      width: '0 0 52px',
      cellClassName: 'tbl-action is-overflow',
      /* Same row action as My Team's Course tracker: SmsNotification with a tooltip. */
      render: (r) =>
        canRemind(r) ? (
          <Tooltip text="Send reminder" position="Top" alignment="End" icon={false}>
            <button type="button" className="icon-btn" aria-label={`Send reminder to ${r.name}`} onClick={() => remind([r.id])}>
              <SmsNotification size={20} color="var(--text-primary)" variant="Linear" />
            </button>
          </Tooltip>
        ) : null,
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
          selectable
          isSelected={(r) => selected.has(r.id)}
          isRowSelectable={canRemind}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          allSelected={allSelected}
          selectAllIndeterminate={someSelected && !allSelected}
          selectAllDisabled={remindable.length === 0}
          pagination={{
            from: from + 1,
            to: from + pageRows.length,
            total: rows.length,
            onPrev: safePage > 0 ? () => setPage(safePage - 1) : undefined,
            onNext: safePage < lastPage ? () => setPage(safePage + 1) : undefined,
          }}
        />
      )}

      <BulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        <button
          type="button"
          className="bulk-bar-btn bulk-bar-btn--primary"
          onClick={() => remind([...selected])}
        >
          <SmsNotification size={20} color="currentColor" variant="Linear" />
          Send Reminders
        </button>
      </BulkActionBar>
      <ReminderDrawerShell
        open={recipients !== null}
        onClose={() => setRecipients(null)}
        onSend={sendReminders}
        content={{
          subject: reminderSubject(recipients ?? []),
          message: REMINDER_MESSAGE,
          count: recipients?.length ?? 0,
          table: recipients ? (
            <ReminderRecipients total={recipients.length} shown={Math.min(5, recipients.length)}>
              <div className="rd-table__header">
                <div className="rd-table__cell rd-table__cell--name">Name</div>
                <div className="rd-table__cell rd-table__cell--head-progress">Completed on</div>
              </div>
              {recipients.slice(0, 5).map((r) => (
                <div className="rd-table__row" key={r.id}>
                  <div className="rd-table__cell rd-table__cell--name">
                    <Avatar size={40} />
                    <div className="rd-member-info">
                      <span className="rd-member-name">{r.name}</span>
                      <span className="rd-member-role">{r.email}</span>
                    </div>
                  </div>
                  <div className="rd-table__cell rd-table__cell--progress">
                    <DateCell value={r.completedOn} />
                  </div>
                </div>
              ))}
            </ReminderRecipients>
          ) : null,
        }}
      />
      <ToastContainer toasts={toasts} />
    </section>
  )
}

export default SignOffTab
