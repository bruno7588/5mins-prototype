import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ImportCurve } from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import Button from '@/components/Button/Button'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import {
  SIGNED_IN_LEARNER_ID,
  dueRank,
  dueState,
  formatDay,
  recordDurationLabel,
  recordProviderName,
  recordTrainingName,
  useExternalTraining,
  type DueState,
  type ExternalRecord,
} from '@/data/externalTraining'
import './ExternalTrainingScreen.css'

/* Native app "External Training" screen: what View All on the My Progress External
   Training card opens. The web table's columns split in two: name, provider, expiry,
   score and result on a card; the whole row in a bottom sheet behind a tap. Designed
   in the Cards lab (src/pages/cards-lab). Prefix: m-xt- */

/* Colour only where the learner has something to do; a renewed record stays quiet. */
const expiryTone = (s: DueState | null) => (s === 'overdue' ? ' is-overdue' : s === 'due-soon' ? ' is-due-soon' : '')

const resultBadge = (r: ExternalRecord) => (
  <Badge type={r.result === 'Passed' ? 'success' : 'error'} icon={false} label={r.result} />
)

const expiryValue = (r: ExternalRecord) => (r.retrainingDueDate ? formatDay(r.retrainingDueDate) : 'No expiry')
const scoreValue = (r: ExternalRecord) => (r.score === null ? '–' : `${r.score}%`)

/** The signed-in learner's records, in the profile tab's order: overdue, due soon, then newest. */
function useLearnerRecords() {
  const { records } = useExternalTraining()
  const rows = useMemo(
    () =>
      records
        .filter((r) => r.personId === SIGNED_IN_LEARNER_ID)
        .sort(
          (a, b) =>
            dueRank(dueState(a, records)) - dueRank(dueState(b, records)) ||
            b.completionDate.localeCompare(a.completionDate),
        ),
    [records],
  )
  return { rows, records }
}

function ExternalTrainingScreen({ onOpenRecord }: { onOpenRecord: (id: string) => void }) {
  const reduce = useReducedMotion()
  const { rows, records } = useLearnerRecords()

  return (
    <motion.ul className="m-xt-list" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
      {rows.map((r) => (
        <li key={r.id}>
          <button type="button" className="m-xt-card" onClick={() => onOpenRecord(r.id)}>
            <span className="m-xt-card__text">
              <span className="m-xt-card__name">{recordTrainingName(r)}</span>
              <span className="m-xt-card__provider">{recordProviderName(r)}</span>
            </span>
            {/* Footer: three values side by side, a small label above each. The badge
                sits here so a long name has the full width. */}
            <span className="m-xt-card__foot">
              <span className="m-xt-card__stat">
                <span className="m-xt-card__label">Expiry</span>
                <span className={`m-xt-card__value${expiryTone(dueState(r, records))}`}>{expiryValue(r)}</span>
              </span>
              <span className="m-xt-card__stat">
                <span className="m-xt-card__label">Score</span>
                <span className="m-xt-card__value">{scoreValue(r)}</span>
              </span>
              <span className="m-xt-card__stat">
                <span className="m-xt-card__label">Result</span>
                {resultBadge(r)}
              </span>
            </span>
          </button>
        </li>
      ))}
    </motion.ul>
  )
}

/* The rest of the row: label left, value right, and the certificate as the one action.
   Rendered in the phone's overlay layer by MobileApp. */
export function ExternalRecordSheet({
  recordId,
  onClose,
  onDownload,
}: {
  recordId: string
  onClose: () => void
  onDownload: (record: ExternalRecord) => void
}) {
  const { records } = useExternalTraining()
  const record = records.find((r) => r.id === recordId)
  if (!record) return null

  const name = recordTrainingName(record)
  /* The web table's column order, so the two surfaces read the same way. */
  const fields: { label: string; value: React.ReactNode; tone?: string }[] = [
    { label: 'Completion date', value: formatDay(record.completionDate) },
    { label: 'Expiry', value: expiryValue(record), tone: expiryTone(dueState(record, records)) },
    { label: 'Duration', value: recordDurationLabel(record) || '–' },
    { label: 'Score', value: scoreValue(record) },
    { label: 'Result', value: resultBadge(record) },
  ]

  return (
    <BottomSheet onClose={onClose} ariaLabel={name}>
      <div className="m-xt-sheet">
        <header className="m-xt-sheet__head">
          <h2 className="m-xt-sheet__title">{name}</h2>
          <p className="m-xt-sheet__provider">{recordProviderName(record)}</p>
        </header>
        <dl className="m-xt-sheet__fields">
          {fields.map((f) => (
            <div key={f.label} className="m-xt-sheet__field">
              <dt className="m-xt-sheet__label">{f.label}</dt>
              <dd className={`m-xt-sheet__value${f.tone ?? ''}`}>{f.value}</dd>
            </div>
          ))}
        </dl>
        {record.certificate && (
          <Button
            size="md"
            className="m-xt-sheet__cta"
            icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
            onClick={() => onDownload(record)}
          >
            Download Certificate
          </Button>
        )}
      </div>
    </BottomSheet>
  )
}

export default ExternalTrainingScreen
