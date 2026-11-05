import { useMemo, useState } from 'react'
import { Add, DocumentUpload } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import Dropdown from '@/components/Dropdown/Dropdown'
import EmptyState from '@/components/EmptyState/EmptyState'
import Search from '@/components/Search/Search'
import noResults from '@/assets/empty-state-illustrations/no-results.svg'
import {
  deleteRecord,
  dueRank,
  dueState,
  personById,
  recordTrainingName,
  saveRecord,
  useExternalTraining,
  type ExternalRecord,
} from '@/data/externalTraining'
import AddExternalTrainingDrawer from './AddExternalTrainingDrawer'
import BulkUploadRecordsDrawer from './BulkUploadRecordsDrawer'
import ExternalRecordsTable from './ExternalRecordsTable'
import './ExternalTraining.css'

/* Learning Records > External Training (PRD 2.9), the admin's list of every
   external training record. Prefix: lret- */

export const RETRAINING_FILTER = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due-soon', label: 'Due soon' },
]

interface Props {
  showToast: (type: 'success', message: string) => void
}

function ExternalTrainingRecords({ showToast }: Props) {
  const { records } = useExternalTraining()
  const [query, setQuery] = useState('')
  const [retraining, setRetraining] = useState('all')
  const [drawer, setDrawer] = useState<{ record: ExternalRecord | null } | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [toDelete, setToDelete] = useState<ExternalRecord | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records
      .filter((r) => retraining === 'all' || dueState(r, records) === retraining)
      .filter((r) => !q || `${personById(r.personId)?.name ?? ''} ${recordTrainingName(r)}`.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          dueRank(dueState(a, records)) - dueRank(dueState(b, records)) || b.completionDate.localeCompare(a.completionDate),
      )
  }, [records, query, retraining])

  return (
    <div className="lret">
      <div className="lret-toolbar">
        <div className="lret-toolbar__filters">
          <Search value={query} onChange={setQuery} onClear={() => setQuery('')} placeholder="Search learners or courses" ariaLabel="Search external training" />
          <Dropdown
            label="Retraining"
            labelPlacement="start"
            options={RETRAINING_FILTER}
            value={retraining}
            onChange={setRetraining}
            className="lret-filter"
          />
        </div>
        <div className="lret-toolbar__ctas">
          <Button variant="outlined" icon={<DocumentUpload size={20} color="currentColor" variant="Linear" />} onClick={() => setBulkOpen(true)}>
            Bulk Upload Training
          </Button>
          <Button icon={<Add size={20} color="currentColor" variant="Linear" />} onClick={() => setDrawer({ record: null })}>
            Add Training
          </Button>
        </div>
      </div>

      {rows.length ? (
        <ExternalRecordsTable
          rows={rows}
          all={records}
          onEdit={(r) => setDrawer({ record: r })}
          onDelete={setToDelete}
        />
      ) : (
        <EmptyState
          illustration={<img src={noResults} alt="" width={72} height={72} />}
          title="No external training found"
          description="Try a different name, or show all retraining states."
        />
      )}

      {drawer && (
        <AddExternalTrainingDrawer
          record={drawer.record}
          onClose={() => setDrawer(null)}
          onSaved={(r, isNew) => {
            saveRecord(r)
            setDrawer(null)
            const who = personById(r.personId)?.name ?? ''
            showToast('success', isNew ? `${recordTrainingName(r)} added for ${who}` : `${recordTrainingName(r)} updated for ${who}`)
          }}
        />
      )}

      {bulkOpen && (
        <BulkUploadRecordsDrawer
          onClose={() => setBulkOpen(false)}
          onAdded={(n) => {
            setBulkOpen(false)
            showToast('success', `${n} record${n === 1 ? '' : 's'} added`)
          }}
        />
      )}

      <ConfirmModal open={!!toDelete} onClose={() => setToDelete(null)} ariaLabel="Delete record">
        {toDelete && (
          <>
            <div className="confirm-modal-header">
              <h2 className="confirm-modal-title">
                Delete {recordTrainingName(toDelete)} from {personById(toDelete.personId)?.name}'s profile?
              </h2>
              <p className="confirm-modal-body">The record and its certificate are removed and can't be recovered.</p>
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
