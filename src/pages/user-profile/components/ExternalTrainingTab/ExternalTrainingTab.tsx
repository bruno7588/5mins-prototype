import { useMemo, useState } from 'react'
import { Add, Danger } from 'iconsax-react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import EmptyState from '@/components/EmptyState/EmptyState'
import certificatesIllustration from '@/assets/empty-state-illustrations/certificates.svg'
import AddExternalTrainingDrawer from '@/pages/learning-records/components/ExternalTraining/AddExternalTrainingDrawer'
import ExternalRecordsTable from '@/pages/learning-records/components/ExternalTraining/ExternalRecordsTable'
import '@/pages/learning-records/components/ExternalTraining/ExternalTraining.css'
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
import './ExternalTrainingTab.css'

/* Person profile > External Training (DES-336 Phase 3, PRD 3.1-3.5).
   One tab for every viewer (D13): admins add, edit and delete; managers (own team
   only) and the learner on their own profile see the same list, read-only.
   Prefix: uet- */

export type ExternalTrainingViewer = 'admin' | 'manager' | 'learner'

interface Props {
  personId: string
  personName: string
  viewer: ExternalTrainingViewer
  showToast: (type: 'success', message: string) => void
}

function ExternalTrainingTab({ personId, personName, viewer, showToast }: Props) {
  const { records } = useExternalTraining()
  const [drawer, setDrawer] = useState<{ record: ExternalRecord | null } | null>(null)
  const [toDelete, setToDelete] = useState<ExternalRecord | null>(null)
  const isAdmin = viewer === 'admin'
  const firstName = personName.split(' ')[0]

  // Overdue first, then due soon, then newest (PRD 3.1).
  const rows = useMemo(
    () =>
      records
        .filter((r) => r.personId === personId)
        .sort(
          (a, b) =>
            dueRank(dueState(a, records)) - dueRank(dueState(b, records)) || b.completionDate.localeCompare(a.completionDate),
        ),
    [records, personId],
  )

  return (
    <div className="uet">
      {rows.length > 0 && (isAdmin || viewer === 'learner') && (
        <div className="uet-toolbar">
          {viewer === 'learner' && (
            <p className="uet-text">Training you've done outside 5Mins. Your admin records it from your certificate.</p>
          )}
          {isAdmin && (
            <Button
              variant="outlined"
              icon={<Add size={20} color="currentColor" variant="Linear" />}
              onClick={() => setDrawer({ record: null })}
            >
              Add Training
            </Button>
          )}
        </div>
      )}

      {rows.length ? (
        <ExternalRecordsTable
          rows={rows}
          all={records}
          showLearner={false}
          onEdit={isAdmin ? (r) => setDrawer({ record: r }) : undefined}
          onDelete={isAdmin ? setToDelete : undefined}
        />
      ) : (
        <EmptyState
          illustration={<img src={certificatesIllustration} alt="" width={72} height={72} />}
          title="No external training yet"
          description={
            isAdmin
              ? `Record training ${firstName} has done outside 5Mins to track when it expires.`
              : "Your admin records training done outside 5Mins from the certificate."
          }
          primaryAction={isAdmin ? { label: 'Add Training', onClick: () => setDrawer({ record: null }) } : undefined}
        />
      )}

      {drawer && (
        <AddExternalTrainingDrawer
          lockedPersonId={personId}
          record={drawer.record}
          onClose={() => setDrawer(null)}
          onSaved={(r, isNew) => {
            saveRecord(r)
            setDrawer(null)
            showToast(
              'success',
              isNew ? `${recordTrainingName(r)} added for ${personName}` : `${recordTrainingName(r)} updated for ${personName}`,
            )
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
                Delete {recordTrainingName(toDelete)} from {personById(toDelete.personId)?.name ?? personName}'s profile?
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

export default ExternalTrainingTab
