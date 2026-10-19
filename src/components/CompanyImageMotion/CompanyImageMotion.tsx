import { useEffect, useMemo, useRef, useState } from 'react'
import { useBrandTheme } from '@/data/brandTheme'
import { useCompanyDefaults } from '@/data/companyDefaults'
import { tenantColours, useCompanyImage } from '@/data/companyImage'
import { attachCompanyShader } from '@/data/companyShader'
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

/* The company image, playing: its recipe in the tenant's colours on a canvas laid
   over the still (which stays underneath as the fallback). Fills its positioned
   parent. Renders nothing for an upload or under reduced motion. */
function CompanyImageMotion() {
  const { image } = useCompanyImage()
  const defaults = useCompanyDefaults()
  const reduced = usePrefersReducedMotion()
  const theme = useBrandTheme()
  const id = image.kind === 'default' ? image.id : null
  const recipe = id ? (defaults.find((d) => d.id === id) ?? defaults[0])?.recipe : undefined
  const key = recipe && !reduced ? JSON.stringify([recipe, theme]) : null
  // Stable per recipe and theme, so the shader only restarts when either changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const input = useMemo(() => (recipe && key ? { recipe, colours: tenantColours(recipe) } : null), [key])
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
