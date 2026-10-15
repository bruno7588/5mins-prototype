import { useEffect, useRef, useState } from 'react'
import { useCompanyDefaults } from '@/data/companyDefaults'
import { useCompanyImage } from '@/data/companyImage'
import { attachCompanyShader, companyShader } from '@/data/companyShader'
import './CompanyImageMotion.css'

const REDUCED = '(prefers-reduced-motion: reduce)'

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia?.(REDUCED).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(REDUCED)
    if (!mq) return
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

interface Props {
  /** A specific default image (e.g. a picker tile) instead of the current company image. */
  defaultId?: string
}

/* The company image, playing: a canvas laid over the still (which stays
   underneath as the fallback). Fills its positioned parent. Renders nothing
   for an upload, a default without a shader, or under reduced motion. */
function CompanyImageMotion({ defaultId }: Props) {
  const { image } = useCompanyImage()
  const defaults = useCompanyDefaults()
  const reduced = usePrefersReducedMotion()
  const id = defaultId ?? (image.kind === 'default' ? image.id : null)
  const input = id && !reduced ? companyShader(id, defaults) : null
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !input) return
    delete canvas.dataset.ready
    return attachCompanyShader(canvas, input)
  }, [input])

  if (!input) return null
  return <canvas ref={canvasRef} className="company-motion" aria-hidden="true" />
}

export default CompanyImageMotion
