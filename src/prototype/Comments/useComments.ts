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
}

export interface NewComment {
  text: string
  author: string
  anchor?: Anchor | null
  parentId?: string | null
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
        query: `?route=${encodeURIComponent(route)}`,
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
  }, [route])

  // Fetch on every page; the switcher shows the count even before comment mode is on.
  useEffect(() => {
    if (enabled) void load()
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

  const setResolved = useCallback(
    async (id: string, resolved: boolean) => {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved } : c)))
      try {
        await request({ method: 'PATCH', body: JSON.stringify({ route, id, resolved }) })
      } catch (e) {
        setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved: !resolved } : c)))
        setError((e as Error).message)
      }
    },
    [route],
  )

  return { comments, error, loading, add, setResolved, reload: load }
}
