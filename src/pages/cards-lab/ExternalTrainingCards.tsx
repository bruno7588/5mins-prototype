import { useState } from 'react'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
import MobileTopNav from '@/components/mobile/TopNav/TopNav'
import ExternalTrainingScreen, { ExternalRecordSheet } from '@/pages/mobile/ExternalTrainingScreen'
import { downloadCertificate } from '@/pages/learning-records/components/ExternalTraining/ExternalRecordsTable'

/**
 * Cards lab build: the native External Training screen in a phone frame of its own.
 * The screen and its sheet live in the app (src/pages/mobile/ExternalTrainingScreen),
 * so the lab always shows what the app ships.
 */
function ExternalTrainingCards() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <PhoneFrame
      header={<MobileTopNav variant="detail" title="External Training" />}
      overlay={
        openId ? (
          <ExternalRecordSheet recordId={openId} onClose={() => setOpenId(null)} onDownload={downloadCertificate} />
        ) : null
      }
    >
      <ExternalTrainingScreen onOpenRecord={setOpenId} />
    </PhoneFrame>
  )
}

export default ExternalTrainingCards
