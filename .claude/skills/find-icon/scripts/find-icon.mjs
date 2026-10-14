#!/usr/bin/env node
// Search the 5Mins icon set (iconsax-react + src/components/icons) by keyword.
// Usage:
//   node .claude/skills/find-icon/scripts/find-icon.mjs <keyword> [more keywords]
//   node .claude/skills/find-icon/scripts/find-icon.mjs --check Trash Edit2
//   node .claude/skills/find-icon/scripts/find-icon.mjs --used     (every icon the repo imports)
//   add --all to show every match instead of the top 12 per group

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
const META = path.join(ROOT, 'node_modules/iconsax-react/dist/meta-data.json')
const CUSTOM_DIR = path.join(ROOT, 'src/components/icons')
const SRC = path.join(ROOT, 'src')

// Words people search with -> words that appear in Iconsax names.
const SYNONYMS = {
  delete: ['trash', 'remove'], remove: ['trash', 'minus', 'close'], bin: ['trash'],
  close: ['close'], x: ['close'], cancel: ['close', 'slash'], dismiss: ['close'],
  plus: ['add'], new: ['add'], create: ['add'],
  edit: ['edit', 'pen', 'brush'], pencil: ['edit', 'pen'], rename: ['edit'], write: ['edit', 'pen', 'document'],
  warning: ['danger', 'warning'], alert: ['danger', 'warning', 'info'], error: ['danger', 'close', 'info'],
  success: ['tick'], check: ['tick'], done: ['tick'], complete: ['tick', 'task'], confirm: ['tick'],
  info: ['info', 'message', 'question'], help: ['question', 'message', 'info', 'lifebuoy'],
  settings: ['setting'], preferences: ['setting'], cog: ['setting'], gear: ['setting'], config: ['setting'],
  search: ['search'], find: ['search'], magnifier: ['search'], filter: ['filter', 'sort', 'setting'],
  sort: ['sort', 'arrange', 'arrow'],
  menu: ['menu', 'more', 'hamburger'], more: ['more'], kebab: ['more'], ellipsis: ['more'], dots: ['more'],
  chevron: ['arrow'], caret: ['arrow'], expand: ['arrow', 'maximize'], collapse: ['arrow', 'minimize'],
  back: ['arrow', 'back'], next: ['arrow', 'forward'], previous: ['arrow', 'back'],
  user: ['user', 'profile', 'people'], person: ['user', 'profile'], people: ['people', 'user', 'profile'],
  team: ['people', 'user'], learner: ['user', 'profile', 'people'], admin: ['user', 'security', 'shield'],
  group: ['people', 'user'], account: ['user', 'profile'], avatar: ['user', 'profile'],
  upload: ['upload', 'export', 'send', 'import'], download: ['download', 'import', 'receive'],
  import: ['import', 'download'], export: ['export', 'upload'], share: ['share', 'send', 'export'],
  file: ['document', 'folder', 'note'], doc: ['document'], csv: ['document', 'grid'],
  pdf: ['document'], attachment: ['paperclip', 'attach'], link: ['link'], url: ['link'],
  copy: ['copy'], duplicate: ['copy'], paste: ['clipboard'],
  calendar: ['calendar'], date: ['calendar'], schedule: ['calendar', 'timer', 'clock'], due: ['calendar', 'clock', 'timer'],
  time: ['clock', 'timer'], deadline: ['timer', 'clock', 'calendar'], history: ['clock', 'refresh', 'rotate'],
  notification: ['notification', 'bell'], bell: ['notification'], reminder: ['notification', 'alarm', 'timer'],
  email: ['sms', 'direct', 'message'], mail: ['sms', 'direct'], message: ['message', 'sms'],
  chat: ['message', 'messages'], comment: ['message'],
  lock: ['lock', 'key', 'security'], unlock: ['unlock', 'lock'], password: ['lock', 'key', 'password'],
  security: ['security', 'shield', 'lock'], permission: ['shield', 'lock', 'security'],
  visible: ['eye'], view: ['eye'], show: ['eye'], hide: ['eye', 'slash'], hidden: ['eye', 'slash'], preview: ['eye'],
  play: ['play', 'video'], video: ['video', 'play'], audio: ['music', 'volume', 'microphone'],
  image: ['gallery', 'image', 'picture'], photo: ['gallery', 'camera'], picture: ['gallery'],
  course: ['book', 'teacher', 'note', 'video'], lesson: ['book', 'note', 'teacher'], learning: ['book', 'teacher'],
  quiz: ['task', 'clipboard', 'question'], assessment: ['task', 'clipboard'], certificate: ['medal', 'award', 'crown'],
  award: ['award', 'medal', 'cup', 'crown'], trophy: ['cup', 'medal'], badge: ['medal', 'award'],
  star: ['star'], favourite: ['star', 'heart'], favorite: ['star', 'heart'], like: ['heart', 'like'],
  chart: ['chart', 'graph', 'diagram'], report: ['chart', 'graph', 'document'], analytics: ['chart', 'graph', 'status'],
  stats: ['chart', 'graph'], dashboard: ['element', 'category', 'chart'], progress: ['chart', 'status', 'timer'],
  home: ['home'], dashboard_home: ['home'], grid: ['grid', 'element', 'category'], list: ['task', 'menu', 'row'],
  drag: ['menu', 'move', 'arrange'], handle: ['menu'], grip: ['menu'], move: ['move', 'arrange'], reorder: ['arrange', 'menu'],
  refresh: ['refresh', 'rotate', 'repeat'], reload: ['refresh', 'rotate'], sync: ['refresh', 'repeat', 'arrow'],
  undo: ['undo', 'rotate', 'back'], redo: ['redo', 'forward'], retry: ['refresh', 'repeat', 'rotate'],
  ai: ['sparkle', 'ai', 'magic', 'star', 'flash'], sparkle: ['sparkle', 'magic', 'star'], magic: ['magic'], generate: ['magic', 'flash'],
  logout: ['logout'], signout: ['logout'], login: ['login'], signin: ['login'],
  building: ['building', 'buildings'], company: ['building', 'buildings', 'briefcase'], organisation: ['building', 'buildings'],
  location: ['location', 'map', 'gps'], workplace: ['building', 'shop', 'location'], role: ['briefcase', 'user', 'personalcard'],
  job: ['briefcase'], department: ['buildings', 'people', 'hierarchy'], hierarchy: ['hierarchy'],
  tag: ['tag'], label: ['tag'], flag: ['flag'], bookmark: ['bookmark', 'archive'], archive: ['archive', 'box'],
  money: ['money', 'dollar', 'wallet', 'card'], payment: ['card', 'wallet', 'money'],
  phone: ['call', 'mobile'], mobile: ['mobile'], desktop: ['monitor'], laptop: ['monitor', 'laptop'],
  language: ['language', 'translate', 'global'], globe: ['global'], translate: ['translate', 'language'],
  print: ['printer'], save: ['save', 'archive', 'tick'], send: ['send', 'direct'],
  pin: ['location', 'paperclip'], minus: ['minus'], zoom: ['search', 'maximize'],
  impersonate: ['user', 'profile', 'mask'], audit: ['clipboard', 'document', 'clock'], log: ['document', 'clock'],
}

const words = (name) =>
  name.replace(/Icon$/, '').replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/([0-9])([A-Za-z])/g, '$1 $2')
    .toLowerCase().split(/[\s_-]+/).map((w) => w.replace(/[0-9]+$/, '')).filter(Boolean)

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(p)
  }
  return out
}

// Count how often each icon is imported, and remember one file that uses it.
function repoUsage() {
  const iconsax = new Map()
  const custom = new Map()
  const bump = (map, name, file) => {
    const cur = map.get(name) || { count: 0, example: path.relative(ROOT, file) }
    cur.count++
    map.set(name, cur)
  }
  for (const file of walk(SRC)) {
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(/import\s*(?:type\s*)?\{([^}]+)\}\s*from\s*['"]iconsax-react['"]/g)) {
      for (const raw of m[1].split(',')) {
        const name = raw.trim().split(/\s+as\s+/)[0].trim()
        if (/^[A-Z]/.test(name)) bump(iconsax, name, file)
      }
    }
    for (const m of text.matchAll(/import\s+(\w+)\s+from\s*['"][^'"]*components\/icons\/(\w+)['"]/g)) {
      bump(custom, m[2], file)
    }
  }
  return { iconsax, custom }
}

const args = process.argv.slice(2)
const showAll = args.includes('--all')
const terms = args.filter((a) => !a.startsWith('--')).flatMap((a) => a.toLowerCase().split(/[\s,]+/)).filter(Boolean)

if (!fs.existsSync(META)) {
  console.error(`Cannot find ${path.relative(ROOT, META)}. Run pnpm install first.`)
  process.exit(1)
}
const meta = JSON.parse(fs.readFileSync(META, 'utf8'))
const category = new Map()
for (const c of meta.categories) for (const i of c.icons) if (!category.has(i)) category.set(i, c.name)
const custom = fs.existsSync(CUSTOM_DIR)
  ? fs.readdirSync(CUSTOM_DIR).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, ''))
  : []
const usage = repoUsage()

const importLine = (name, isCustom) =>
  isCustom ? `import ${name} from '@/components/icons/${name}'` : `import { ${name} } from 'iconsax-react'`
const usedNote = (u) => (u ? `used ${u.count}x, e.g. ${u.example}` : '')

if (args.includes('--check')) {
  for (const name of terms.length ? args.filter((a) => !a.startsWith('--')) : []) {
    if (category.has(name)) console.log(`OK       ${name}  (Iconsax / ${category.get(name)})  ${usedNote(usage.iconsax.get(name))}`)
    else if (custom.includes(name)) console.log(`OK       ${name}  (custom)  ${importLine(name, true)}`)
    else {
      const near = [...category.keys(), ...custom].filter((n) => n.toLowerCase().includes(name.toLowerCase().replace(/[0-9]+$/, ''))).slice(0, 8)
      console.log(`MISSING  ${name}  ${near.length ? `- close names: ${near.join(', ')}` : '- no close names'}`)
    }
  }
  process.exit(0)
}

if (args.includes('--used')) {
  console.log('Iconsax icons already imported in src/ (most used first):')
  for (const [n, u] of [...usage.iconsax].sort((a, b) => b[1].count - a[1].count)) console.log(`  ${n.padEnd(24)} ${usedNote(u)}`)
  console.log('\nCustom icons (src/components/icons/):')
  for (const n of custom) console.log(`  ${n.padEnd(24)} ${usedNote(usage.custom.get(n)) || 'not imported yet'}`)
  process.exit(0)
}

if (!terms.length) {
  console.log('Usage: find-icon.mjs <keyword...> | --check <IconName...> | --used   [--all]')
  process.exit(1)
}

// Score one icon name against the query: direct word hits beat synonym hits beat partial hits.
function score(name) {
  const w = words(name)
  let total = 0
  for (const t of terms) {
    let best = 0
    if (w.includes(t)) best = 10
    else if (t.length > 3 && w.some((x) => x.startsWith(t) || (t.startsWith(x) && x.length > 3))) best = 6
    const syn = SYNONYMS[t] || []
    // A synonym that is the whole name (Trash for "delete") is a strong hit; inside a compound name it is weak.
    const si = syn.findIndex((s) => w.includes(s))
    if (!best && si >= 0) best = (w.length === 1 ? 8 : 4) - si * 0.5
    // Each matched keyword counts; icons matching more of the query rank higher.
    if (best) total += best + 20
  }
  // Prefer the plain base icon (Trash over TrashSquare) when scores tie.
  return total ? total - (w.length - 1) * 0.5 : 0
}

const rank = (list) => list.sort((a, b) => b.s - a.s || (b.u?.count || 0) - (a.u?.count || 0))
const used = [], unused = [], customHits = []
for (const [name, cat] of category) {
  const s = score(name)
  if (!s) continue
  const u = usage.iconsax.get(name)
  ;(u ? used : unused).push({ name, cat, s, u })
}
for (const name of custom) {
  const s = score(name)
  if (s) customHits.push({ name, s, u: usage.custom.get(name) })
}

const limit = showAll ? Infinity : 12
const print = (title, list, isCustom) => {
  if (!list.length) return
  console.log(`\n${title}`)
  for (const r of rank(list).slice(0, limit)) {
    console.log(`  ${r.name.padEnd(24)} ${(r.cat || 'custom').padEnd(14)} ${usedNote(r.u)}`)
    console.log(`  ${''.padEnd(24)} ${importLine(r.name, isCustom)}`)
  }
  if (list.length > limit) console.log(`  ... ${list.length - limit} more (add --all)`)
}

console.log(`Icons matching: ${terms.join(' + ')}`)
print('Custom 5Mins icons (src/components/icons/):', customHits, true)
print('Already used in the prototype (prefer these for consistency):', used, false)
print('Other Iconsax icons (available, not used yet):', unused, false)
if (!used.length && !unused.length && !customHits.length) {
  console.log('\nNo matches. Try a broader or different word (e.g. "trash" not "bin"), or run --used to browse.')
}
