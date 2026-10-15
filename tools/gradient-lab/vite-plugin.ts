import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'

/**
 * Gradient Lab flowers, dev only. A small JSON API under /__gradient-lab that
 * saves the flower photos uploaded in the lab (already cropped to a 1024 x 1024
 * JPEG in the browser) into src/assets/gradient-lab/flowers/ with a manifest.json.
 *
 *   GET    /__gradient-lab/flowers                      saved flowers
 *   POST   /__gradient-lab/flowers { name, hue, dataUrl }
 *   DELETE /__gradient-lab/flowers/:id
 *
 * Saved gradients: 12 numbered slots. Saving slot N writes the shader preset to
 * src/assets/gradient-lab/gradients/gradient-NN.json and a 512 x 512 JPEG over
 * the app's default company image src/assets/company-images/default-NN.jpg
 * (the placeholder is backed up first and restored when the slot is cleared).
 *
 *   GET    /__gradient-lab/gradients                    saved slots
 *   POST   /__gradient-lab/gradients { slot, name, preset, dataUrl }
 *   DELETE /__gradient-lab/gradients/:slot
 */

const PREFIX = '/__gradient-lab'
const FLOWERS_DIR = 'src/assets/gradient-lab/flowers'
const ID_RE = /^[a-z0-9-]{1,80}$/
/** A 1024 x 1024 JPEG at quality 0.92 is well under this. */
const MAX_BODY = 12 * 1024 * 1024

const GRADIENTS_DIR = 'src/assets/gradient-lab/gradients'
const COMPANY_IMAGES_DIR = 'src/assets/company-images'
export const GRADIENT_SLOTS = 12

interface GradientRecord {
  slot: number
  name: string
  /** Dev-server URL of the app image this slot writes. */
  image: string
  savedAt: string
  preset: unknown
}

interface FlowerRecord {
  id: string
  name: string
  src: string
  hue: number
  savedAt: string
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > MAX_BODY) reject(new HttpError(413, 'Image too large'))
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        reject(new HttpError(400, 'Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

export function gradientLab(root: string): Plugin {
  const dir = path.join(root, FLOWERS_DIR)
  const manifestFile = path.join(dir, 'manifest.json')

  /** Resolve a file name inside the flowers folder, refusing anything that escapes it. */
  function inDir(name: string): string {
    const file = path.resolve(dir, name)
    if (!file.startsWith(dir + path.sep)) throw new HttpError(400, 'Invalid path')
    return file
  }

  function readManifest(): FlowerRecord[] {
    try {
      const list = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  }

  function writeManifest(list: FlowerRecord[]) {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(manifestFile, JSON.stringify(list, null, 2) + '\n')
  }


  async function save(body: unknown): Promise<FlowerRecord> {
    const { name, hue, dataUrl } = (body ?? {}) as Record<string, unknown>
    if (typeof name !== 'string' || !name.trim()) throw new HttpError(400, 'name is required')
    if (typeof hue !== 'number' || !Number.isInteger(hue) || hue < -1 || hue > 359) throw new HttpError(400, 'hue must be -1 to 359')
    const prefix = 'data:image/jpeg;base64,'
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith(prefix)) throw new HttpError(400, 'dataUrl must be a JPEG data URL')
    const bytes = Buffer.from(dataUrl.slice(prefix.length), 'base64')
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new HttpError(400, 'Not a JPEG')

    const slug = name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'flower'
    const id = `${slug}-${Date.now().toString(36)}`
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(inDir(`${id}.jpg`), bytes)

    const flower: FlowerRecord = { id, name: name.slice(0, 120), src: `/${FLOWERS_DIR}/${id}.jpg`, hue, savedAt: new Date().toISOString() }
    writeManifest([...readManifest(), flower])
    return flower
  }

  const gradientsDir = path.join(root, GRADIENTS_DIR)
  const gradientsManifest = path.join(gradientsDir, 'manifest.json')
  const pad = (slot: number) => String(slot).padStart(2, '0')

  function readGradients(): GradientRecord[] {
    try {
      const list = JSON.parse(fs.readFileSync(gradientsManifest, 'utf8'))
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  }

  function writeGradients(list: GradientRecord[]) {
    fs.mkdirSync(gradientsDir, { recursive: true })
    const sorted = [...list].sort((a, b) => a.slot - b.slot)
    fs.writeFileSync(gradientsManifest, JSON.stringify(sorted, null, 2) + '\n')
  }

  function checkSlot(slot: unknown): number {
    if (typeof slot !== 'number' || !Number.isInteger(slot) || slot < 1 || slot > GRADIENT_SLOTS)
      throw new HttpError(400, `slot must be 1 to ${GRADIENT_SLOTS}`)
    return slot
  }

  function saveGradient(body: unknown): GradientRecord {
    const { slot: rawSlot, name, preset, dataUrl } = (body ?? {}) as Record<string, unknown>
    const slot = checkSlot(rawSlot)
    if (typeof name !== 'string' || !name.trim()) throw new HttpError(400, 'name is required')
    if (!preset || typeof preset !== 'object') throw new HttpError(400, 'preset is required')
    const prefix = 'data:image/jpeg;base64,'
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith(prefix)) throw new HttpError(400, 'dataUrl must be a JPEG data URL')
    const bytes = Buffer.from(dataUrl.slice(prefix.length), 'base64')
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new HttpError(400, 'Not a JPEG')

    const imageName = `default-${pad(slot)}.jpg`
    const imageFile = path.join(root, COMPANY_IMAGES_DIR, imageName)
    const backup = path.join(gradientsDir, 'placeholders', imageName)
    fs.mkdirSync(path.dirname(backup), { recursive: true })
    if (fs.existsSync(imageFile) && !fs.existsSync(backup)) fs.copyFileSync(imageFile, backup)
    fs.writeFileSync(imageFile, bytes)
    fs.writeFileSync(path.join(gradientsDir, `gradient-${pad(slot)}.json`), JSON.stringify(preset, null, 2) + '\n')

    const record: GradientRecord = {
      slot,
      name: name.slice(0, 80),
      image: `/${COMPANY_IMAGES_DIR}/${imageName}`,
      savedAt: new Date().toISOString(),
      preset,
    }
    writeGradients([...readGradients().filter((g) => g.slot !== slot), record])
    return record
  }

  function clearGradient(slot: number) {
    const imageName = `default-${pad(slot)}.jpg`
    const backup = path.join(gradientsDir, 'placeholders', imageName)
    if (fs.existsSync(backup)) fs.copyFileSync(backup, path.join(root, COMPANY_IMAGES_DIR, imageName))
    const json = path.join(gradientsDir, `gradient-${pad(slot)}.json`)
    if (fs.existsSync(json)) fs.unlinkSync(json)
    writeGradients(readGradients().filter((g) => g.slot !== slot))
  }

  function remove(id: string) {
    if (!ID_RE.test(id)) throw new HttpError(400, 'Invalid flower id')
    const file = inDir(`${id}.jpg`)
    if (fs.existsSync(file)) fs.unlinkSync(file)
    writeManifest(readManifest().filter((f) => f.id !== id))
  }

  return {
    name: 'gradient-lab',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      // The endpoint writes files, so it only answers a dev server bound to this
      // machine, never one opened up with --host.
      const host = server.config.server.host
      const exposed = host !== undefined && host !== false && host !== 'localhost' && host !== '127.0.0.1'
      if (exposed) {
        server.config.logger.warn('[gradient-lab] Dev server is exposed to the network (--host); the flowers API is disabled.')
      }

      server.middlewares.use(PREFIX, async (req, res) => {
        try {
          if (exposed) throw new HttpError(403, 'network-exposed')
          const url = new URL(req.url ?? '/', 'http://localhost')
          const route = url.pathname.replace(/\/+$/, '')

          if (route === '/flowers') {
            if (req.method === 'GET') return send(res, 200, readManifest())
            if (req.method === 'POST') return send(res, 200, await save(await readBody(req)))
          }
          if (route === '/gradients') {
            if (req.method === 'GET') return send(res, 200, readGradients())
            if (req.method === 'POST') return send(res, 200, saveGradient(await readBody(req)))
          }
          const delGradient = route.match(/^\/gradients\/(\d+)$/)
          if (req.method === 'DELETE' && delGradient) {
            clearGradient(checkSlot(Number(delGradient[1])))
            return send(res, 200, { ok: true })
          }
          const del = route.match(/^\/flowers\/([^/]+)$/)
          if (req.method === 'DELETE' && del) {
            remove(decodeURIComponent(del[1]))
            return send(res, 200, { ok: true })
          }
          throw new HttpError(404, 'Not found')
        } catch (e) {
          const status = e instanceof HttpError ? e.status : 500
          const message = e instanceof Error ? e.message : 'Unexpected error'
          if (status === 500) server.config.logger.error(`[gradient-lab] ${message}`)
          send(res, status, { error: message })
        }
      })
    },
  }
}
