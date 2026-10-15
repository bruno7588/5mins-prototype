/* One-off: copies the Gradient Studio photos and saved gradients that live in
   the repo into the shared online store (api/gradient-lab.ts), keeping their
   ids and slots so every preset still finds its photo.
   Usage: node tools/gradient-lab/seed.mjs https://5mins-prototype.vercel.app */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const base = process.argv[2]
if (!base) throw new Error('Pass the site URL, e.g. https://5mins-prototype.vercel.app')
const api = `${base.replace(/\/$/, '')}/api/gradient-lab`
const root = new URL('../../src/assets/', import.meta.url).pathname

const dataUrl = async (path) => `data:image/jpeg;base64,${(await readFile(path)).toString('base64')}`

async function send(method, query, body) {
  const res = await fetch(`${api}?${query}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${method} ${query}: ${res.status} ${await res.text()}`)
}

const flowers = JSON.parse(await readFile(join(root, 'gradient-lab/flowers/manifest.json'), 'utf8'))
for (const f of flowers) {
  await send('POST', 'r=flowers', {
    id: f.id,
    name: f.name,
    hue: f.hue,
    dataUrl: await dataUrl(join(root, `gradient-lab/flowers/${f.id}.jpg`)),
  })
  console.log('photo', f.id)
}

const gradients = JSON.parse(await readFile(join(root, 'gradient-lab/gradients/manifest.json'), 'utf8'))
for (const g of gradients) {
  const nn = String(g.slot).padStart(2, '0')
  await send('PUT', 'r=gradients', {
    slot: g.slot,
    name: g.name,
    preset: g.preset,
    dataUrl: await dataUrl(join(root, `company-images/default-${nn}.jpg`)),
  })
  console.log('gradient', g.slot)
}
