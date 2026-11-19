import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar'
import ToastContainer, { useToast } from '@/components/Toast/Toast'
import ProtoPicker from './ProtoPicker'
import VariantChoice from './VariantChoice'
import VariantToggle from './VariantToggle'
import { certCount } from './data'
import '@/pages/your-courses/CourseDetails.css'
import '@/pages/people/People.css'

/* /prototypes/download-certificates (round 2): inside the dialog, option cards
   versus a switch. Prototype surface only; nothing in the app imports from here. */
const VARIANTS = [
  { name: 'Choice', Component: VariantChoice },
  { name: 'Toggle', Component: VariantToggle },
]

export default function DownloadCertificatesProto() {
  const [params, setParams] = useSearchParams()
  const requested = parseInt(params.get('v') ?? '', 10)
  const active = requested >= 1 && requested <= VARIANTS.length ? requested - 1 : 0
  const { toasts, show } = useToast()

  const select = useCallback(
    (i: number) =>
      setParams(
        (p) => {
          p.set('v', String(i + 1))
          return p
        },
        { replace: true },
      ),
    [setParams],
  )

  const { Component } = VARIANTS[active]

  return (
    <div className="cd-layout">
      <LeftSidebar />
      <main className="cd-main">
        <Component key={active} onDownload={(n) => show('success', `Downloading ${certCount(n)}`)} />
      </main>
      <ToastContainer toasts={toasts} />
      <ProtoPicker names={VARIANTS.map((v) => v.name)} active={active} onChange={select} />
    </div>
  )
}
