import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Add, Danger, DocumentDownload } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Tooltip from '@/components/Tooltip/Tooltip'
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
   One tab for every viewer (D13): admins add, edit and delete; the learner on their
   own Profile adds training with the same drawer; managers (own team only) read only.
   Prefix: uet- */

export type ExternalTrainingViewer = 'admin' | 'manager' | 'learner'

interface Props {
  personId: string
  personName: string
  viewer: ExternalTrainingViewer
  showToast: (type: 'success', message: string) => void
  /** Where Add Training renders instead of its own row above the table (the learner
      Profile puts it on the tabs row). */
  addButtonTarget?: HTMLElement | null
}

function ExternalTrainingTab({ personId, personName, viewer, showToast, addButtonTarget }: Props) {
  const { records } = useExternalTraining()
  /* Stays set while the drawer plays its exit; key remounts it fresh on each open. */
  const [drawer, setDrawer] = useState<{ record: ExternalRecord | null; open: boolean; key: number } | null>(null)
  const openDrawer = (record: ExternalRecord | null) => setDrawer({ record, open: true, key: Date.now() })
  const closeDrawer = () => setDrawer((d) => d && { ...d, open: false })
  const [toDelete, setToDelete] = useState<ExternalRecord | null>(null)
  const isAdmin = viewer === 'admin'
  const isLearner = viewer === 'learner'
  const canAddTraining = isAdmin || isLearner
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

  /* Bulk download (Divjot, 2026-11-12): every certificate this tab lists, as one ZIP.
     The prototype stores no files, so it confirms with a toast, as Download Report does. */
  const withCertificate = rows.filter((r) => r.certificate).length
  const downloadAll = (
    <Tooltip text="No certificates to download" icon={false} disabled={withCertificate > 0}>
      <Button
        variant="outlined-2"
        icon={<DocumentDownload size={20} color="currentColor" variant="Linear" />}
        disabled={!withCertificate}
        onClick={() => showToast('success', `Downloading ${withCertificate} certificate${withCertificate === 1 ? '' : 's'}`)}
      >
        Download Certificates
      </Button>
    </Tooltip>
  )

  return (
    <div className="uet">
      {!isLearner && rows.length > 0 && !(canAddTraining && !addButtonTarget) && <div className="uet-toolbar">{downloadAll}</div>}
      {rows.length > 0 && canAddTraining && (() => {
        const addButton = (
          /* Filled on the learner Profile's tabs row; outlined on the admin profile. */
          <Button
            variant={addButtonTarget ? 'filled' : 'outlined'}
            icon={<Add size={20} color="currentColor" variant="Linear" />}
            onClick={() => openDrawer(null)}
          >
            Add Training
          </Button>
        )
        return addButtonTarget ? (
          createPortal(addButton, addButtonTarget)
        ) : (
          <div className="uet-toolbar">
            <div className="uet-toolbar__ctas">
              {downloadAll}
              {addButton}
            </div>
          </div>
        )
      })()}

      {rows.length ? (
        <ExternalRecordsTable
          rows={rows}
          all={records}
          showLearner={false}
          onEdit={isAdmin ? (r) => openDrawer(r) : undefined}
          onDelete={isAdmin ? setToDelete : undefined}
        />
      ) : (
        <EmptyState
          illustration={<img src={certificatesIllustration} alt="" width={72} height={72} />}
          title="No external training yet"
          description={
            isAdmin
              ? `Record training ${firstName} has done outside 5Mins to track when it expires.`
              : isLearner
                ? "Record training you've done outside 5Mins to track when it expires."
                : "Your admin records training done outside 5Mins from the certificate."
          }
          primaryAction={canAddTraining ? { label: 'Add Training', onClick: () => openDrawer(null) } : undefined}
        />
      )}

      {drawer && (
        <AddExternalTrainingDrawer
          key={drawer.key}
          open={drawer.open}
          lockedPersonId={personId}
          record={drawer.record}
          learnerView={isLearner}
          onClose={closeDrawer}
          onSaved={(r, isNew) => {
            saveRecord(r)
            closeDrawer()
            const name = recordTrainingName(r)
            showToast(
              'success',
              isLearner
                ? `${name} ${isNew ? 'added to' : 'updated in'} your records`
                : isNew ? `${name} added for ${personName}` : `${name} updated`,
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

export default ExternalTrainingTab
