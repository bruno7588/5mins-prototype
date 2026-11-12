import { useCallback, useMemo, useRef, useState } from 'react'
import { Add, Danger, Book1, Buildings2, Calendar, Profile, TickCircle } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Search from '@/components/Search/Search'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import EmptyState from '@/components/EmptyState/EmptyState'
import FilterBar, { FilterBarAddButton, type FilterBarFilter } from '@/components/FilterBar/FilterBar'
import noResults from '@/assets/empty-state-illustrations/no-results.svg'
import FilterListbox, { type FilterGroup } from '../FilterListbox/FilterListbox'
import FilterMultiSelect from '../FilterControls/FilterMultiSelect'
import {
  deleteRecord,
  dueRank,
  dueState,
  personById,
  recordProviderName,
  recordTrainingName,
  saveRecord,
  useExternalTraining,
  type ExternalRecord,
} from '@/data/externalTraining'
import AddExternalTrainingDrawer from './AddExternalTrainingDrawer'
import CsvIcon from '@/components/icons/CsvIcon'
import BulkUploadRecordsDrawer from './BulkUploadRecordsDrawer'
import ExternalRecordsTable from './ExternalRecordsTable'
import './ExternalTraining.css'

/* Learning Records > External Training (PRD 2.9), the admin's list of every
   external training record, narrowed with the shared Filter bar. Prefix: lret- */

type FilterId = 'learner' | 'retraining' | 'course' | 'provider' | 'result'

const FILTER_META: Record<FilterId, { title: string; description: string; Icon: typeof Calendar }> = {
  learner: { title: 'Learner', description: 'Filter by the person the training belongs to', Icon: Profile },
  retraining: { title: 'Expiry', description: 'Overdue, due soon, valid or no expiry', Icon: Calendar },
  course: { title: 'Course', description: 'Filter by approved course', Icon: Book1 },
  provider: { title: 'Provider', description: 'Filter by training provider', Icon: Buildings2 },
  result: { title: 'Result', description: 'Passed or not passed', Icon: TickCircle },
}

const GROUPS: FilterGroup[] = [
  { section: 'Person', items: [{ id: 'learner', ...FILTER_META.learner }] },
  { section: 'Training', items: (['course', 'provider'] as FilterId[]).map((id) => ({ id, ...FILTER_META[id] })) },
  { section: 'Status', items: (['retraining', 'result'] as FilterId[]).map((id) => ({ id, ...FILTER_META[id] })) },
]

const RETRAINING_OPTIONS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'due-soon', label: 'Due soon' },
  { value: 'upcoming', label: 'Valid' },
  { value: 'none', label: 'No expiry' },
]
const RESULT_OPTIONS = [
  { value: 'Passed', label: 'Passed' },
  { value: 'Not Passed', label: 'Not Passed' },
]

interface Props {
  showToast: (type: 'success', message: string) => void
}

function ExternalTrainingRecords({ showToast }: Props) {
  const { records } = useExternalTraining()
  /* Stays set while the drawer plays its exit; key remounts it fresh on each open. */
  const [drawer, setDrawer] = useState<{ record: ExternalRecord | null; open: boolean; key: number } | null>(null)
  const openDrawer = (record: ExternalRecord | null) => setDrawer({ record, open: true, key: Date.now() })
  const closeDrawer = () => setDrawer((d) => d && { ...d, open: false })
  const [csvOpen, setCsvOpen] = useState(false)
  const [csvKey, setCsvKey] = useState(0)
  const openCsv = () => {
    setCsvKey((k) => k + 1)
    setCsvOpen(true)
  }
  const [toDelete, setToDelete] = useState<ExternalRecord | null>(null)

  /* ── Filter bar state ── */
  const [active, setActive] = useState<FilterId[]>([])
  const [values, setValues] = useState<Partial<Record<FilterId, string[]>>>({})
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const headerAddRef = useRef<HTMLDivElement>(null)
  const bottomAddRef = useRef<HTMLDivElement>(null)

  const addFilter = useCallback((id: string) => {
    setActive((prev) => (prev.includes(id as FilterId) ? prev : [...prev, id as FilterId]))
    setMenuOpen(false)
    setExpanded(true)
  }, [])
  const removeFilter = useCallback((id: string) => {
    setActive((prev) => prev.filter((f) => f !== id))
    setValues((prev) => ({ ...prev, [id]: undefined }))
  }, [])

  /* Option lists come from the records, so every option finds at least one row. */
  const unique = (list: { value: string; label: string }[]) =>
    [...new Map(list.map((o) => [o.value, o])).values()].sort((a, b) => a.label.localeCompare(b.label))
  const optionsFor = (id: FilterId) =>
    id === 'learner'
      ? unique(records.map((r) => ({ value: r.personId, label: personById(r.personId)?.name ?? r.personId })))
      : id === 'course'
        ? unique(records.map((r) => ({ value: recordTrainingName(r), label: recordTrainingName(r) })))
        : id === 'provider'
          ? unique(records.map((r) => recordProviderName(r)).filter(Boolean).map((p) => ({ value: p, label: p })))
          : id === 'retraining'
            ? RETRAINING_OPTIONS
            : RESULT_OPTIONS

  const valueOf = (id: FilterId, r: ExternalRecord) =>
    id === 'learner'
      ? r.personId
      : id === 'course'
        ? recordTrainingName(r)
        : id === 'provider'
          ? recordProviderName(r)
          : id === 'retraining'
            ? dueState(r, records) ?? 'none'
            : r.result

  const rows = useMemo(
    () =>
      records
        .filter((r) => active.every((id) => !values[id]?.length || values[id]!.includes(valueOf(id, r))))
        /* Search narrows by learner, course or provider, on top of the filters. */
        .filter((r) => {
          const q = query.trim().toLowerCase()
          return !q || [personById(r.personId)?.name, recordTrainingName(r), recordProviderName(r)].some((t) => t?.toLowerCase().includes(q))
        })
        .sort(
          (a, b) =>
            dueRank(dueState(a, records)) - dueRank(dueState(b, records)) || b.completionDate.localeCompare(a.completionDate),
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, active, values, query],
  )

  const pillLabel = (id: FilterId) => {
    const v = values[id] ?? []
    if (v.length !== 1) return FILTER_META[id].title
    return optionsFor(id).find((o) => o.value === v[0])?.label ?? FILTER_META[id].title
  }

  const filters: FilterBarFilter[] = active.map((id) => ({
    id,
    title: FILTER_META[id].title,
    Icon: FILTER_META[id].Icon,
    pillLabel: pillLabel(id),
    control: (
      <FilterMultiSelect
        options={optionsFor(id)}
        value={values[id] ?? []}
        placeholder={`Select ${FILTER_META[id].title.toLowerCase()}`}
        onChange={(v) => setValues((prev) => ({ ...prev, [id]: v }))}
      />
    ),
  }))

  /* One Add Training button; the menu offers one record or a bulk CSV.
     It sits at the far right of the row under the Filter bar, beside Download Report. */
  const addMenu = (
        <RowActionsMenu
          ariaLabel="Add Training"
          menuClassName="lret-add-menu"
          caret={false}
          triggerClassName="ds-btn ds-btn--md ds-btn--filled ds-btn--has-icon"
          triggerContent={
            <>
              <span className="ds-btn__icon">
                <Add size={20} color="currentColor" variant="Linear" />
              </span>
              <span className="ds-btn__label">Add Training</span>
            </>
          }
          items={[
            {
              key: 'single',
              label: 'Add training',
              description: 'Add one training record for a learner',
              icon: <Add size={20} color="var(--text-primary)" variant="Linear" />,
            },
            {
              key: 'csv',
              label: 'Bulk upload CSV',
              description: 'Add training records from other platforms to keep all your learning in one place',
              icon: <CsvIcon size={20} color="var(--text-primary)" />,
            },
          ]}
          onSelect={(key) =>
            key === 'single' ? openDrawer(null) : openCsv()
          }
        />
  )

  return (
    <div className="lret">
      <FilterBar
        filters={filters}
        expanded={expanded}
        onToggleExpanded={() => {
          setExpanded((e) => !e)
          setMenuOpen(false)
        }}
        onRemove={removeFilter}
        onClearAll={() => {
          setActive([])
          setValues({})
        }}
        renderAddFilter={(placement) => {
          // Only the live instance gets an open listbox so their click-outside handlers don't clash.
          const ref = placement === 'header' ? headerAddRef : bottomAddRef
          const open = menuOpen && (placement === 'header' ? !expanded : expanded)
          return (
            <FilterBarAddButton ref={ref} open={open} onClick={() => setMenuOpen((o) => !o)}>
              <FilterListbox open={open} onClose={() => setMenuOpen(false)} onSelect={addFilter} anchorRef={ref} groups={GROUPS} />
            </FilterBarAddButton>
          )
        }}
      />

      {/* Under the Filter bar: search on the left, Download Report and Add Training on the right. */}
      <div className="lret-toolbar">
        <Search
          value={query}
          onChange={setQuery}
          placeholder="Search learners, courses or providers"
          ariaLabel="Search external training"
          className="lret-search"
        />
        <div className="lret-toolbar__ctas">
          <Button
            variant="outlined-2"
            icon={<CsvIcon size={20} color="currentColor" />}
            onClick={() => showToast('success', 'Downloading CSV')}
          >
            Download Report
          </Button>
          {addMenu}
        </div>
      </div>

      {rows.length ? (
        <ExternalRecordsTable
          rows={rows}
          all={records}
          showDuration={false}
          onEdit={(r) => openDrawer(r)}
          onDelete={setToDelete}
          learnerHref={(id) => (personById(id)?.invited ? null : `/people/${id}?tab=external-training`)}
        />
      ) : (
        <EmptyState
          illustration={<img src={noResults} alt="" width={72} height={72} />}
          title="No results"
          description="Try a different learner or course, or change a filter."
        />
      )}

      {drawer && (
        <AddExternalTrainingDrawer
          key={drawer.key}
          open={drawer.open}
          record={drawer.record}
          onClose={closeDrawer}
          onSaved={(r, isNew) => {
            saveRecord(r)
            closeDrawer()
            const who = personById(r.personId)?.name ?? ''
            showToast('success', isNew ? `${recordTrainingName(r)} added for ${who}` : `${recordTrainingName(r)} updated`)
          }}
        />
      )}

      {csvKey > 0 && (
        <BulkUploadRecordsDrawer
          key={csvKey}
          open={csvOpen}
          onClose={() => setCsvOpen(false)}
          onAdded={(n) => {
            setCsvOpen(false)
            showToast('success', `${n} record${n === 1 ? '' : 's'} added`)
          }}
        />
      )}

      <ConfirmModal open={!!toDelete} onClose={() => setToDelete(null)} ariaLabel="Delete record">
        {toDelete && (
          <>
            {/* DS Error dialog: centred, 56px Danger icon, danger commit. */}
            <div className="confirm-modal-header confirm-modal-header--center">
              <div className="confirm-modal-icon">
                <Danger size={56} color="var(--danger-500)" variant="Linear" />
              </div>
              <h2 className="confirm-modal-title">
                Delete {recordTrainingName(toDelete)} from {personById(toDelete.personId)?.name}'s profile?
              </h2>
              <p className="confirm-modal-body">The record will be removed and can't be recovered.</p>
            </div>
            <div className="confirm-modal-actions">
              <Button variant="outlined-2" onClick={() => setToDelete(null)}>
                Cancel
              </Button>
              <Button
                semantic="danger"
                onClick={() => {
                  deleteRecord(toDelete.id)
                  showToast('success', `${recordTrainingName(toDelete)} deleted`)
                  setToDelete(null)
                }}
              >
                Delete Record
              </Button>
            </div>
          </>
        )}
      </ConfirmModal>
    </div>
  )
}

export default ExternalTrainingRecords
