import { ImportCurve } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Search from '@/components/Search/Search'
import CsvIcon from '@/components/icons/CsvIcon'

/* The Enrolments toolbar around the dialog, so each version opens from its real trigger. */
export default function EnrolmentsToolbar({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="cd-enrolments">
      <div className="cd-actions">
        <div className="cd-select-info">
          <span className="cd-select-count">0/128 selected</span>
        </div>
        <Search size="M" value="" onChange={() => {}} placeholder="Search for learners" ariaLabel="Search for learners" className="cd-search" />
        <Button variant="outlined-2" className="cd-download-btn" icon={<CsvIcon size={20} color="currentColor" />}>
          Download Report
        </Button>
        <Button
          variant="outlined"
          className="cd-download-btn"
          onClick={onOpen}
          icon={<ImportCurve size={20} color="currentColor" variant="Linear" />}
        >
          Download Certificates
        </Button>
      </div>
    </section>
  )
}
