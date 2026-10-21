import { useCallback, useEffect, useState } from 'react'
import type { Anchor } from './commentAnchor'

export interface PrototypeComment {
  id: string
  route: string
  anchor: Anchor | null
  viewport: { w: number; h: number }
  theme: 'light' | 'dark'
  text: string
  author: string
  createdAt: string
  resolved: boolean
  parentId: string | null
  /** The clicks on the page that led to the anchor (clickTrail.ts); older comments have none. */
  steps?: string[]
}

export interface NewComment {
  text: string
  author: string
  anchor?: Anchor | null
  parentId?: string | null
  steps?: string[]
  /** Honeypot; always empty from real people. */
  website?: string
}

// Locally there is no Vercel function, so the dev build reads and writes the live comments.
const API = import.meta.env.DEV ? 'https://5mins-prototype.vercel.app/api/comments' : '/api/comments'

async function request<T>(init: RequestInit & { query?: string }): Promise<T> {
  const res = await fetch(`${API}${init.query ?? ''}`, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`)
  return data as T
}

export function useComments(route: string, enabled: boolean) {
  const [comments, setComments] = useState<PrototypeComment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { comments } = await request<{ comments: PrototypeComment[] }>({
        method: 'GET',
        query: '?all=1',
      })
      // Until the API is deployed the URL serves the app's HTML, so there is no list.
      if (!Array.isArray(comments)) throw new Error('Comments are not available yet.')
      setComments(comments)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on every page; the switcher shows the count even before comment mode is on.
  // Comments posted elsewhere (Vercel, another reviewer) arrive on a 30s refresh and
  // whenever the tab comes back into focus.
  useEffect(() => {
    if (!enabled) return
    void load()
    const refresh = () => {
      if (document.visibilityState === 'visible') void load()
    }
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [enabled, load])

  const add = useCallback(
    async (c: NewComment) => {
      const { comment } = await request<{ comment: PrototypeComment }>({
        method: 'POST',
        body: JSON.stringify({
          ...c,
          route,
          viewport: { w: window.innerWidth, h: window.innerHeight },
          theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
        }),
      })
      if (comment) {
        setComments((prev) => [...prev, comment])
        setError(null)
      }
      return comment
    },
    [route],
  )

  // Comments live per page in storage, so resolving uses the comment's own page.
  const setResolved = useCallback(
    async (id: string, resolved: boolean) => {
      const target = comments.find((c) => c.id === id)
      if (!target) return
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved } : c)))
      try {
        await request({ method: 'PATCH', body: JSON.stringify({ route: target.route, id, resolved }) })
      } catch (e) {
        setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved: !resolved } : c)))
        setError((e as Error).message)
      }
    },
    [comments],
  )

  // Deleting a top-level comment removes its replies too (the API does the same).
  const remove = useCallback(
    async (id: string) => {
      const target = comments.find((c) => c.id === id)
      if (!target) return
      await request({ method: 'DELETE', body: JSON.stringify({ route: target.route, id }) })
      setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id))
    },
    [comments],
  )

  return { comments, error, loading, add, setResolved, remove, reload: load }
}
