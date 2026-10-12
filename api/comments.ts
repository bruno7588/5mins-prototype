/* Prototype comments API (Vercel function). Anyone with the prototype link can read and
   post, so the link is the password: inputs are capped, a honeypot field catches bots and
   posts are rate limited per IP. Storage is Upstash Redis over its REST API (no npm deps);
   each page's comments live in one hash, `pcm:<route>`, keyed by comment id. */

declare const process: { env: Record<string, string | undefined> }

// The Vercel Marketplace integration sets KV_REST_API_*; a direct Upstash setup sets UPSTASH_*.
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

const MAX_TEXT = 2000
const MAX_AUTHOR = 60
const MAX_ROUTE = 200
const MAX_SELECTOR = 1000
const POSTS_PER_MINUTE = 10

export interface StoredComment {
  id: string
  route: string
  anchor: { selector: string; xPct: number; yPct: number } | null
  viewport: { w: number; h: number }
  theme: 'light' | 'dark'
  text: string
  author: string
  createdAt: string
  resolved: boolean
  parentId: string | null
}

// Same-origin in production; the dev build calls the deployed API cross-origin.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } })

async function redis(...command: (string | number)[]): Promise<unknown> {
  const res = await fetch(REDIS_URL!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  const data = (await res.json()) as { result?: unknown; error?: string }
  if (data.error) throw new Error(data.error)
  return data.result
}

const keyFor = (route: string) => `pcm:${route}`
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(Math.max(v, 0), 100) : 0)

async function rateLimited(request: Request): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const key = `pcm-rl:${ip}:${Math.floor(Date.now() / 60000)}`
  const count = (await redis('INCR', key)) as number
  if (count === 1) await redis('EXPIRE', key, 60)
  return count > POSTS_PER_MINUTE
}

const notConfigured = () => json({ error: 'Comments storage is not connected yet.' }, 503)

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET(request: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return notConfigured()
  const route = str(new URL(request.url).searchParams.get('route'), MAX_ROUTE)
  if (!route) return json({ error: 'route is required' }, 400)
  // HGETALL returns a flat [field, value, field, value, ...] list.
  const flat = ((await redis('HGETALL', keyFor(route))) as string[] | null) ?? []
  const comments: StoredComment[] = []
  for (let i = 1; i < flat.length; i += 2) comments.push(JSON.parse(flat[i]))
  comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return json({ comments })
}

export async function POST(request: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return notConfigured()
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return json({ error: 'Invalid body' }, 400)
  // Honeypot: a hidden field people never fill in. Pretend success so bots move on.
  if (str(body.website, 200)) return json({ ok: true })
  if (await rateLimited(request)) return json({ error: 'Too many comments, try again in a minute.' }, 429)

  const route = str(body.route, MAX_ROUTE)
  const text = str(body.text, MAX_TEXT)
  const author = str(body.author, MAX_AUTHOR)
  if (!route || !text || !author) return json({ error: 'route, text and author are required' }, 400)

  const rawAnchor = body.anchor as Record<string, unknown> | null | undefined
  const rawViewport = (body.viewport ?? {}) as Record<string, unknown>
  const comment: StoredComment = {
    id: crypto.randomUUID(),
    route,
    anchor: rawAnchor
      ? { selector: str(rawAnchor.selector, MAX_SELECTOR), xPct: num(rawAnchor.xPct), yPct: num(rawAnchor.yPct) }
      : null,
    viewport: {
      w: typeof rawViewport.w === 'number' ? Math.round(rawViewport.w) : 0,
      h: typeof rawViewport.h === 'number' ? Math.round(rawViewport.h) : 0,
    },
    theme: body.theme === 'dark' ? 'dark' : 'light',
    text,
    author,
    createdAt: new Date().toISOString(),
    resolved: false,
    parentId: str(body.parentId, 64) || null,
  }
  await redis('HSET', keyFor(route), comment.id, JSON.stringify(comment))
  return json({ comment }, 201)
}

export async function PATCH(request: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return notConfigured()
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const route = str(body?.route, MAX_ROUTE)
  const id = str(body?.id, 64)
  if (!route || !id || typeof body?.resolved !== 'boolean') {
    return json({ error: 'route, id and resolved are required' }, 400)
  }
  const raw = (await redis('HGET', keyFor(route), id)) as string | null
  if (!raw) return json({ error: 'Not found' }, 404)
  const comment = { ...(JSON.parse(raw) as StoredComment), resolved: body.resolved }
  await redis('HSET', keyFor(route), id, JSON.stringify(comment))
  return json({ comment })
}
