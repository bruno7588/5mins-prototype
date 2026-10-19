/* Gradient Studio storage API (Vercel function), shared by everyone using the
   Studio on the live site and on localhost. Same setup as comments.ts: Upstash
   Redis over its REST API, no npm deps, and the link is the password (writes
   are rate limited per IP). The saved gradients are the app's default company
   images, so a save shows for everyone straight away.

   Keys (gl:flowers and gl:flower:<id> are left over from photo-based gradients, unused)
     gl:gradients      hash  slot -> { slot, name, savedAt, preset } JSON
     gl:gimg:<slot>    string     base64 JPEG (512 x 512, the still)

   Routes (?r=)
     GET    gradients                    saved gradients, by slot
     PUT    gradients {slot,name,preset,dataUrl}  save or replace a slot
     PUT    order     {slots}             reorder: every saved slot once, in the new order (renumbered 1..n)
     DELETE gradients&slot=              clear a slot; later slots move down one
     GET    image&kind=gradient&id=&v=   the still JPEG (cached; v busts it) */

declare const process: { env: Record<string, string | undefined> }

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

const ROUTE = '/api/gradient-lab'
const WRITES_PER_MINUTE = 40
/* Vercel caps a request body at 4.5 MB; a 512 px JPEG is well under this. */
const MAX_IMAGE_CHARS = 3_500_000
const MAX_PRESET_CHARS = 20_000
interface StoredGradient {
  slot: number
  name: string
  savedAt: string
  preset: unknown
}

// Same-origin in production; localhost calls the deployed API cross-origin.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS },
  })

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

// HGETALL returns a flat [field, value, field, value, ...] list.
function parseHash<T>(flat: string[] | null): T[] {
  const out: T[] = []
  for (let i = 1; i < (flat ?? []).length; i += 2) out.push(JSON.parse(flat![i]) as T)
  return out
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** The base64 body of a JPEG data URL, or null. */
function jpegBase64(v: unknown): string | null {
  if (typeof v !== 'string' || v.length > MAX_IMAGE_CHARS) return null
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(v)
  return match ? match[1] : null
}

const imagePath = (id: string | number, savedAt: string) =>
  `${ROUTE}?r=image&kind=gradient&id=${encodeURIComponent(String(id))}&v=${encodeURIComponent(savedAt)}`

const gradientOut = (g: StoredGradient) => ({ ...g, image: imagePath(g.slot, g.savedAt) })

async function rateLimited(request: Request): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const key = `gl-rl:${ip}:${Math.floor(Date.now() / 60000)}`
  const count = (await redis('INCR', key)) as number
  if (count === 1) await redis('EXPIRE', key, 60)
  return count > WRITES_PER_MINUTE
}

const notConfigured = () => json({ error: 'Gradient storage is not connected yet.' }, 503)
const route = (request: Request) => new URL(request.url).searchParams

function slotOf(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 999 ? n : null
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET(request: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return notConfigured()
  const params = route(request)
  const r = params.get('r')

  if (r === 'gradients') {
    const list = parseHash<StoredGradient>((await redis('HGETALL', 'gl:gradients')) as string[] | null)
    list.sort((a, b) => a.slot - b.slot)
    return json(list.map(gradientOut))
  }

  if (r === 'image') {
    const slot = params.get('kind') === 'gradient' ? slotOf(params.get('id')) : null
    const key = slot ? `gl:gimg:${slot}` : null
    if (!key) return json({ error: 'kind and id are required' }, 400)
    const base64 = (await redis('GET', key)) as string | null
    if (!base64) return json({ error: 'Not found' }, 404)
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    return new Response(bytes, {
      headers: {
        'Content-Type': 'image/jpeg',
        // The URL carries the save time, so a saved image never changes under it.
        'Cache-Control': params.get('v') ? 'public, max-age=31536000, immutable' : 'no-store',
        ...CORS,
      },
    })
  }

  return json({ error: 'Unknown route' }, 404)
}

export async function PUT(request: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return notConfigured()
  const r = route(request).get('r')
  if (r !== 'gradients' && r !== 'order') return json({ error: 'Unknown route' }, 404)
  if (await rateLimited(request)) return json({ error: 'Too many saves, try again in a minute.' }, 429)
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null

  if (r === 'order') {
    const saved = await savedGradients()
    const bySlot = new Map(saved.map((g) => [g.slot, g]))
    const slots = Array.isArray(body?.slots) ? body.slots.map(slotOf) : []
    if (slots.length !== saved.length || new Set(slots).size !== slots.length || !slots.every((s) => s !== null && bySlot.has(s))) {
      return json({ error: 'slots must list every saved slot once' }, 400)
    }
    await renumber(slots.map((s) => bySlot.get(s!)!))
    return json((await savedGradients()).map(gradientOut))
  }

  const slot = slotOf(body?.slot)
  const name = str(body?.name, 200) || `Gradient ${slot}`
  const base64 = jpegBase64(body?.dataUrl)
  const preset = body?.preset
  if (!slot || !base64 || typeof preset !== 'object' || preset === null) {
    return json({ error: 'slot, preset and a JPEG dataUrl are required' }, 400)
  }
  if (JSON.stringify(preset).length > MAX_PRESET_CHARS) return json({ error: 'The preset is too large.' }, 413)
  const gradient: StoredGradient = { slot, name, savedAt: new Date().toISOString(), preset }
  await redis('SET', `gl:gimg:${slot}`, base64)
  await redis('HSET', 'gl:gradients', String(slot), JSON.stringify(gradient))
  return json(gradientOut(gradient))
}

async function savedGradients(): Promise<StoredGradient[]> {
  const list = parseHash<StoredGradient>((await redis('HGETALL', 'gl:gradients')) as string[] | null)
  return list.sort((a, b) => a.slot - b.slot)
}

/** Stores the given gradients as slots 1..n in this order, closing any gaps.
    Images go through temporary keys so no rename overwrites one still to move;
    default names ("Gradient 3") follow their new number. */
async function renumber(order: StoredGradient[]) {
  const moves = order.map((g, i) => ({ g, to: i + 1 })).filter(({ g, to }) => g.slot !== to)
  for (const { g } of moves) await redis('RENAME', `gl:gimg:${g.slot}`, `gl:gimg-tmp:${g.slot}`)
  for (const { g, to } of moves) await redis('RENAME', `gl:gimg-tmp:${g.slot}`, `gl:gimg:${to}`)
  for (const { g } of moves) await redis('HDEL', 'gl:gradients', String(g.slot))
  for (const { g, to } of moves) {
    const moved: StoredGradient = { ...g, slot: to, name: g.name === `Gradient ${g.slot}` ? `Gradient ${to}` : g.name }
    await redis('HSET', 'gl:gradients', String(to), JSON.stringify(moved))
  }
}

export async function DELETE(request: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return notConfigured()
  const params = route(request)
  if (await rateLimited(request)) return json({ error: 'Too many changes, try again in a minute.' }, 429)
  if (params.get('r') === 'gradients') {
    const slot = slotOf(params.get('slot'))
    if (!slot) return json({ error: 'slot is required' }, 400)
    const rest = (await savedGradients()).filter((g) => g.slot !== slot)
    await redis('HDEL', 'gl:gradients', String(slot))
    await redis('DEL', `gl:gimg:${slot}`)
    // Close the gap: every later slot moves down one.
    await renumber(rest)
    return json({ deleted: slot })
  }
  return json({ error: 'Unknown route' }, 404)
}
