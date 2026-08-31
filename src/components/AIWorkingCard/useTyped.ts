import { useEffect, useState } from 'react'

/** Matches the media query the CSS uses, so motion is dropped in one place per user. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Types a string out over `ms`, or hands it over whole when `run` is false. */
export function useTyped(text: string, run: boolean, ms: number, delay = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!run || prefersReducedMotion()) {
      setCount(text.length)
      return
    }
    setCount(0)
    const tick = 32
    const perTick = Math.max(1, Math.ceil(text.length / Math.max(1, ms / tick)))
    let id = 0
    const started = window.setTimeout(() => {
      id = window.setInterval(() => setCount((n) => Math.min(text.length, n + perTick)), tick)
    }, delay)
    return () => {
      window.clearTimeout(started)
      window.clearInterval(id)
    }
  }, [text, run, ms, delay])

  return { shown: text.slice(0, count), done: count >= text.length }
}
