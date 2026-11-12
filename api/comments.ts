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
const MAX_STEPS = 60
const MAX_PLACE = 140
const POSTS_PER_MINUTE = 10
const MAX_IMAGE = 4_000_000 // base64 characters, about 3MB; Vercel caps the request body at 4.5MB
const IMAGE_PREFIX = 'data:image/jpeg;base64,'
// Everyone who comments is at 5Mins, so the work email doubles as their Slack identity.
const EMAIL_RE = /^[a-z0-9._%+-]+@5mins\.ai$/
// Comments from before emails were asked for carry only a typed first name.
const LEGACY_EMAILS: Record<string, string> = {
  divjot: 'divjot@5mins.ai',
  nicolas: 'nicolas@5mins.ai',
  nicholas: 'nicolas@5mins.ai',
}

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
  /** Clicks (CSS paths) that reopen the drawer or step the anchor sits in. */
  steps?: string[]
  /** Readable location of the anchor, shown when it cannot be reopened. */
  place?: string
  /** Slack message id of a top-level comment, so replies post in its thread. Server only. */
  slackTs?: string
  /** The commenter's work email and Slack member id, for sending them replies. Server only. */
  authorEmail?: string
  slackUserId?: string
}

// Same-origin in production; the dev build calls the deployed API cross-origin.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

async function redisPipeline(commands: (string | number)[][]): Promise<unknown[]> {
  if (!commands.length) return []
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  const data = (await res.json()) as { result?: unknown; error?: string }[]
  return data.map((d) => {
    if (d.error) throw new Error(d.error)
    return d.result
  })
}

const keyFor = (route: string) => `pcm:${route}`

// What viewers get: the server-only fields (email, Slack ids) never leave the API.
const publicView = ({ authorEmail: _e, slackUserId: _u, slackTs: _t, ...rest }: StoredComment) => rest

const emailOf = (c: StoredComment) => c.authorEmail ?? LEGACY_EMAILS[c.author.trim().toLowerCase().split(/\s+/)[0]]

const nameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ')

/** The Slack member behind a work email (needs users:read.email); null when Slack can't say. */
async function slackUser(email: string): Promise<{ id: string; name: string } | null> {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) return null
  try {
    const res = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = (await res.json()) as { ok: boolean; user?: { id: string; real_name?: string; profile?: { real_name?: string } } }
    if (!data.ok || !data.user) return null
    return { id: data.user.id, name: data.user.real_name || data.user.profile?.real_name || nameFromEmail(email) }
  } catch {
    return null
  }
}

// HGETALL returns a flat [field, value, field, value, ...] list.
const parseHash = (flat: string[] | null): StoredComment[] => {
  const out: StoredComment[] = []
  for (let i = 1; i < (flat ?? []).length; i += 2) out.push(JSON.parse(flat![i]))
  return out
}

/** Every page's comments. Routes starting with /__ are internal test data and skipped. */
async function allComments(): Promise<StoredComment[]> {
  const keys: string[] = []
  let cursor = '0'
  do {
    const [next, batch] = (await redis('SCAN', cursor, 'MATCH', 'pcm:/*', 'COUNT', 200)) as [string, string[]]
    keys.push(...batch.filter((k) => !k.startsWith('pcm:/__')))
    cursor = next
  } while (cursor !== '0')
  const hashes = (await redisPipeline(keys.map((k) => ['HGETALL', k]))) as (string[] | null)[]
  return hashes.flatMap(parseHash)
}
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
  const params = new URL(request.url).searchParams
  const route = str(params.get('route'), MAX_ROUTE)
  if (!route && params.get('all') === null) return json({ error: 'route or all is required' }, 400)
  const comments = route
    ? parseHash((await redis('HGETALL', keyFor(route))) as string[] | null)
    : await allComments()
  comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return json({ comments: comments.map(publicView) })
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
  // The form asks for a work email; the name shown comes from that person's Slack profile.
  // A bare `author` is still accepted from pages loaded before the change.
  const email = str(body.email, 120).toLowerCase()
  if (email && !EMAIL_RE.test(email)) return json({ error: 'Use your @5mins.ai work email.' }, 400)
  const who = email ? await slackUser(email) : null
  const author = email ? (who?.name ?? nameFromEmail(email)).slice(0, MAX_AUTHOR) : str(body.author, MAX_AUTHOR)
  if (!route || !text || !author) return json({ error: 'route, text and email are required' }, 400)

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
    steps: Array.isArray(body.steps)
      ? body.steps.slice(-MAX_STEPS).map((s) => str(s, MAX_SELECTOR)).filter(Boolean)
      : [],
    place: str(body.place, MAX_PLACE),
    ...(email && { authorEmail: email }),
    ...(who && { slackUserId: who.id }),
  }
  await redis('HSET', keyFor(route), comment.id, JSON.stringify(comment))
  // `slack` reports how the Slack post went ("ok", "off" or Slack's error code), for setup checks.
  const rawImage = typeof body.image === 'string' ? body.image : ''
  const image = rawImage.startsWith(IMAGE_PREFIX) && rawImage.length <= MAX_IMAGE ? rawImage.slice(IMAGE_PREFIX.length) : null
  const slack = await notifySlack(comment, request, image)
  return json({ comment: publicView(comment), slack }, 201)
}

/* New comments go to a Slack channel, and replies land in the same Slack thread, so the
   commenter sees the answer where they were told about the comment. Uses a bot token
   (SLACK_BOT_TOKEN + SLACK_CHANNEL_ID): chat.postMessage returns the message `ts`, which is
   stored on the top-level comment and reused as `thread_ts` for its replies. Without the
   token it falls back to the incoming webhook (SLACK_WEBHOOK_URL), which cannot thread.
   A Slack failure never blocks the comment. */
async function notifySlack(c: StoredComment, request: Request, image: string | null): Promise<string> {
  const token = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_CHANNEL_ID
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (!(token && channel) && !webhook) return 'off'
  const origin = new URL(request.url).origin
  const link = `${origin}${c.route}?comment=${c.parentId ?? c.id}`
  const action = c.parentId ? 'replied on' : 'commented on'
  // Slack treats <...> as links and mentions (<!channel>), so viewer text is escaped.
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const quote = esc(c.text).split('\n').map((line) => `> ${line}`).join('\n')
  const text = `*${esc(c.author)}* ${action} \`${esc(c.route)}\`\n${quote}\n<${link}|Open in prototype>`
  try {
    if (!(token && channel)) {
      await fetch(webhook!, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      return 'ok (webhook)'
    }
    // A reply also goes to everyone else in its thread, as a direct message.
    const dmNote = c.parentId ? await notifyThread(c, token, channel, text, image) : ''
    // The owner wrote this reply themselves: nothing to tell them.
    if (c.parentId && c.slackUserId === channel) return `ok${dmNote}`
    // A reply threads under its parent's Slack message, when that message exists.
    let threadTs: string | undefined
    if (c.parentId) {
      const raw = (await redis('HGET', keyFor(c.route), c.parentId)) as string | null
      threadTs = raw ? (JSON.parse(raw) as StoredComment).slackTs : undefined
    }
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ channel, text, thread_ts: threadTs, unfurl_links: false }),
    })
    const data = (await res.json()) as { ok: boolean; ts?: string; channel?: string; error?: string }
    if (!data.ok) return data.error ?? 'failed'
    if (data.ok && data.ts && !c.parentId) {
      await redis('HSET', keyFor(c.route), c.id, JSON.stringify({ ...c, slackTs: data.ts }))
    }
    // The page picture posts straight after the message, so its preview shows in the
    // conversation without opening the thread. `data.channel` is the real channel id (a DM
    // id when SLACK_CHANNEL_ID is a member id), which the file upload needs.
    if (image && data.ts && data.channel) {
      const imageError = await uploadToSlack(token, data.channel, image, c, threadTs)
      if (imageError) return `ok (image: ${imageError})`
    }
    return `ok${dmNote}`
  } catch {
    return 'failed' // the comment is saved either way
  }
}

/* A reply is sent as a Slack DM to everyone else in its thread: whoever wrote the original
   comment and anyone who replied, but not the reply's own author and not the owner (who
   gets every comment through SLACK_CHANNEL_ID already). Returns a note for the status. */
async function notifyThread(c: StoredComment, token: string, owner: string, text: string, image: string | null): Promise<string> {
  const all = parseHash((await redis('HGETALL', keyFor(c.route))) as string[] | null)
  const thread = all.filter((x) => x.id !== c.id && (x.id === c.parentId || x.parentId === c.parentId))
  const mine = emailOf(c)
  // One entry per person, keeping a Slack id from any of their comments.
  const people = new Map<string, string | undefined>()
  for (const x of thread) {
    const email = emailOf(x)
    if (!email || email === mine) continue
    people.set(email, people.get(email) ?? x.slackUserId)
  }
  let sent = 0
  let failed = ''
  for (const [email, known] of people) {
    const id = known ?? (await slackUser(email))?.id
    if (!id) {
      failed = 'no Slack user'
      continue
    }
    if (id === owner) continue
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ channel: id, text, unfurl_links: false }),
    })
    const data = (await res.json()) as { ok: boolean; channel?: string; error?: string }
    if (data.ok) {
      sent++
      // The page picture follows the DM, as on the channel message.
      if (image && data.channel) {
        const imageError = await uploadToSlack(token, data.channel, image, c)
        if (imageError) failed = `image: ${imageError}`
      }
    } else failed = data.error ?? 'failed'
  }
  return ` (dm: ${sent} sent${failed ? `, ${failed}` : ''})`
}

/* Slack's three-step upload: ask for an upload URL, send the bytes, share the file in the
   conversation. Needs the files:write scope. Returns an error code, or null when it worked. */
async function uploadToSlack(token: string, channel: string, base64: string, c: StoredComment, threadTs?: string) {
  const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0))
  const auth = { Authorization: `Bearer ${token}` }
  const start = (await (
    await fetch('https://slack.com/api/files.getUploadURLExternal', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ filename: 'prototype-comment.jpg', length: String(bytes.length) }),
    })
  ).json()) as { ok: boolean; upload_url?: string; file_id?: string; error?: string }
  if (!start.ok || !start.upload_url || !start.file_id) return start.error ?? 'upload failed'
  const put = await fetch(start.upload_url, { method: 'POST', body: bytes })
  if (!put.ok) return 'upload failed'
  const done = (await (
    await fetch('https://slack.com/api/files.completeUploadExternal', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        files: [{ id: start.file_id, title: `${c.route} at ${c.viewport.w}x${c.viewport.h}` }],
        channel_id: channel,
        // A reply's picture stays in its thread, under the reply.
        ...(threadTs && { thread_ts: threadTs }),
      }),
    })
  ).json()) as { ok: boolean; error?: string }
  return done.ok ? null : (done.error ?? 'upload failed')
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
  return json({ comment: publicView(comment) })
}

/* Delete a comment and, for a top-level comment, its whole thread. There are no accounts,
   so anyone with the link can delete, like resolving. */
export async function DELETE(request: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return notConfigured()
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const route = str(body?.route, MAX_ROUTE)
  const id = str(body?.id, 64)
  if (!route || !id) return json({ error: 'route and id are required' }, 400)
  const all = parseHash((await redis('HGETALL', keyFor(route))) as string[] | null)
  if (!all.some((c) => c.id === id)) return json({ error: 'Not found' }, 404)
  const ids = [id, ...all.filter((c) => c.parentId === id).map((c) => c.id)]
  await redis('HDEL', keyFor(route), ...ids)
  return json({ deleted: ids })
}
