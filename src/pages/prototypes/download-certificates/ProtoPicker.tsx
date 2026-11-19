import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './ProtoPicker.css'

/* Prototype harness chrome (PICKER.md behaviour contract): 1-N and arrow keys switch,
   ?v= persists the choice, the highlight slides but the variant swap is instant. */
interface ProtoPickerProps {
  names: string[]
  active: number
  onChange: (i: number) => void
}

export default function ProtoPicker({ names, active, onChange }: ProtoPickerProps) {
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [highlight, setHighlight] = useState({ width: 0, x: 0 })

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active]
      if (el) setHighlight({ width: el.offsetWidth, x: el.offsetLeft })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])

  useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => navRef.current?.setAttribute('data-ready', ''))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= names.length) onChange(num - 1)
      else if (e.key === 'ArrowRight') onChange((active + 1) % names.length)
      else if (e.key === 'ArrowLeft') onChange((active - 1 + names.length) % names.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, names.length, onChange])

  return (
    <nav ref={navRef} className="proto-picker" aria-label="Prototype variants">
      <span
        className="proto-picker-highlight"
        aria-hidden="true"
        style={{ width: highlight.width, transform: `translateX(${highlight.x}px)` }}
      />
      {names.map((name, i) => (
        <button
          key={name}
          ref={(el) => {
            itemRefs.current[i] = el
          }}
          className="proto-picker-item"
          data-active={i === active ? '' : undefined}
          aria-current={i === active ? 'true' : undefined}
          onClick={() => onChange(i)}
        >
          {name}
        </button>
      ))}
    </nav>
  )
}
