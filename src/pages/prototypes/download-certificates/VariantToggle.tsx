import { useState } from 'react'
import { ImportCurve } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Toggle from '@/components/Toggle/Toggle'
import EnrolmentsFrame from './EnrolmentsFrame'
import { CERTS_ACTIVE, CERTS_ALL, LEARNERS, type OnDownload } from './data'

/* Toggle: a standing view setting. Deactivated people are hidden from the table
   unless it is on, and the button downloads exactly what the table shows. */
export default function VariantToggle({ onDownload }: { onDownload: OnDownload }) {
  const [includeDeactivated, setIncludeDeactivated] = useState(false)
  const count = includeDeactivated ? CERTS_ALL : CERTS_ACTIVE

  return (
    <EnrolmentsFrame
      rows={includeDeactivated ? LEARNERS : LEARNERS.filter((l) => !l.deactivated)}
      actions={
        <>
          <Toggle
            size="sm"
            label="Include deactivated people"
            checked={includeDeactivated}
            onChange={() => setIncludeDeactivated((v) => !v)}
          />
          <Button
            variant="outlined-2"
            icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
            onClick={() => onDownload(count)}
          >
            {`Download ${count} Certificates`}
          </Button>
        </>
      }
    />
  )
}
