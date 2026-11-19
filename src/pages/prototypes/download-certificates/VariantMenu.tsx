import { ArrowDown2, ImportCurve } from 'iconsax-react'
import RowActionsMenu from '@/components/RowActionsMenu/RowActionsMenu'
import EnrolmentsFrame from './EnrolmentsFrame'
import { CERTS_ACTIVE, CERTS_ALL, LEARNERS, certCount, type OnDownload } from './data'

/* Menu: the choice is made at the moment of download, one click deep. */
export default function VariantMenu({ onDownload }: { onDownload: OnDownload }) {
  return (
    <EnrolmentsFrame
      rows={LEARNERS}
      actions={
        <RowActionsMenu
          ariaLabel="Download Certificates"
          caret={false}
          triggerClassName="ds-btn ds-btn--md ds-btn--outlined-2 ds-btn--has-icon ds-btn--has-trailing"
          triggerContent={
            <>
              <span className="ds-btn__icon">
                <ImportCurve size={20} color="currentColor" variant="Linear" />
              </span>
              <span className="ds-btn__label">Download Certificates</span>
              <span className="ds-btn__icon">
                <ArrowDown2 size={20} color="currentColor" variant="Linear" />
              </span>
            </>
          }
          items={[
            { key: 'active', label: 'Active people only', description: certCount(CERTS_ACTIVE) },
            { key: 'all', label: 'Include deactivated people', description: certCount(CERTS_ALL) },
          ]}
          onSelect={(key) => onDownload(key === 'all' ? CERTS_ALL : CERTS_ACTIVE)}
        />
      }
    />
  )
}
