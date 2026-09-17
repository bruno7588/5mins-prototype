import fs from 'node:fs'
import path from 'node:path'
import type * as Babel from '@babel/core'
import type { PluginObj, PluginPass } from '@babel/core'
import type { Plugin, ViteDevServer } from 'vite'

/**
 * Design Inspect, dev only. Two halves:
 *
 *  - `inspectBabel(root)` stamps every host JSX element (`<div>`, `<button>`, ...)
 *    with `data-inspect="src/…/File.tsx:LINE:COL"` so the browser overlay can point
 *    at the exact line that rendered it. Component elements are left alone: they
 *    would receive an unknown prop and most DS components don't spread props anyway.
 *
 *  - `designInspect(root)` receives requests from the overlay over the HMR WebSocket
 *    and appends them, one JSON line each, to `.design-inspect/queue.jsonl`, which
 *    the `/inspect` skill tails from Claude Code. Text typed directly on the page is
 *    written straight into the source when it maps to exactly one place (see
 *    `applyText`); anything else goes to the queue for Claude, wording verbatim.
 */

export const ATTR = 'data-inspect'
export const QUEUE_FILE = '.design-inspect/queue.jsonl'
/** Present only while the /inspect monitor runs; lets the overlay say whether anyone is listening. */
export const LISTENING_FILE = '.design-inspect/listening'

export function inspectBabel(root: string) {
  return function inspectBabelPlugin({ types: t }: typeof Babel): PluginObj<PluginPass> {
    return {
      name: 'design-inspect-source',
      visitor: {
        JSXOpeningElement(p, state) {
          const name = p.node.name
          if (!t.isJSXIdentifier(name) || !/^[a-z]/.test(name.name)) return
          if (p.node.attributes.some((a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === ATTR)) return
          const filename = state.filename
          if (!filename || !p.node.loc) return
          const rel = path.relative(root, filename).split(path.sep).join('/')
          if (!rel.startsWith('src/') || rel.startsWith('src/dev/')) return
          const { line, column } = p.node.loc.start
          p.node.attributes.push(
            t.jsxAttribute(t.jsxIdentifier(ATTR), t.stringLiteral(`${rel}:${line}:${column + 1}`)),
          )
        },
      },
    }
  }
}

interface TextEdit {
  id?: string
  /** `src/…/File.tsx:LINE:COL` of the edited element. */
  source?: string
  tag?: string
  before: string
  after: string
  /** Full inspect request, queued for Claude when the text can't be written directly. */
  request: Record<string, unknown>
}

interface AppliedEdit {
  file: string
  index: number
  before: string
  after: string
}

const QUOTES = `'"\``

/**
 * Where `len` chars at `i` sit: inside a string literal (returns the quote) or as
 * whole JSX text between tags/expressions (`jsx`). Anything else (part of a longer
 * string, an identifier, a comment) is not a safe place to write.
 */
function contextAt(code: string, i: number, len: number): string | null {
  const prev = code[i - 1]
  if (QUOTES.includes(prev) && code[i + len] === prev) return prev
  const b = code.slice(Math.max(0, i - 200), i).trimEnd().slice(-1)
  const a = code.slice(i + len, i + len + 200).trimStart()[0]
  if ((b === '>' || b === '}') && (a === '<' || a === '{')) return 'jsx'
  return null
}

/** Whether `after` can go in that context without breaking the syntax. */
function fits(ctx: string, after: string): boolean {
  if (ctx === 'jsx') return !/[{}<>]/.test(after)
  if (after.includes('\\') || after.includes(ctx)) return false
  return ctx === '`' ? !after.includes('${') : !after.includes('\n')
}

/**
 * Write a text edit into the element's own source file. Picks the match between the
 * element's opening tag and its closing tag; failing that, the file's only match
 * that reads like copy (a space or a capital), so a key like 'completed' shown
 * through a lookup is never rewritten by mistake. Returns null when unsure.
 */
function applyText(root: string, edit: TextEdit): AppliedEdit | null {
  const [rel, lineStr, colStr] = (edit.source ?? '').split(':')
  const srcDir = path.join(root, 'src') + path.sep
  const file = path.resolve(root, rel ?? '')
  if (!rel || !file.startsWith(srcDir) || !fs.existsSync(file) || !edit.before) return null
  const code = fs.readFileSync(file, 'utf8')

  const lines = code.split('\n')
  const line = Number(lineStr)
  if (!(line >= 1 && line <= lines.length)) return null
  const open = lines.slice(0, line - 1).reduce((n, l) => n + l.length + 1, 0) + Math.max(0, Number(colStr) - 1)
  const close = edit.tag ? code.indexOf(`</${edit.tag}`, open) : -1

  const hits: { i: number; ctx: string }[] = []
  for (let i = code.indexOf(edit.before); i !== -1; i = code.indexOf(edit.before, i + 1)) {
    const ctx = contextAt(code, i, edit.before.length)
    if (ctx) hits.push({ i, ctx })
  }
  const inside = hits.filter((h) => h.i > open && close !== -1 && h.i < close)
  const looksLikeCopy = /\s|[A-Z]/.test(edit.before)
  const pick = inside.length === 1 ? inside[0] : hits.length === 1 && looksLikeCopy ? hits[0] : null
  if (!pick || !fits(pick.ctx, edit.after)) return null

  fs.writeFileSync(file, code.slice(0, pick.i) + edit.after + code.slice(pick.i + edit.before.length))
  return { file, index: pick.i, before: edit.before, after: edit.after }
}

export function designInspect(root: string): Plugin {
  return {
    name: 'design-inspect',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      // Anyone on the network could inject instructions into a LAN-exposed dev server,
      // so Send is refused (Copy still works) whenever --host opens it up.
      const host = server.config.server.host
      const exposed = host !== undefined && host !== false && host !== 'localhost' && host !== '127.0.0.1'
      if (exposed) {
        server.config.logger.warn(
          '[design-inspect] Dev server is exposed to the network (--host); "Send to Claude" is disabled, Copy still works.',
        )
      }
      const file = path.join(root, QUEUE_FILE)
      server.ws.on('design-inspect:send', (payload: { id?: string }, client) => {
        if (exposed) {
          client.send('design-inspect:refused', { id: payload?.id, reason: 'network-exposed' })
          return
        }
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.appendFileSync(file, JSON.stringify({ ...payload, ts: new Date().toISOString() }) + '\n')
        const listening = fs.existsSync(path.join(root, LISTENING_FILE))
        client.send('design-inspect:queued', { id: payload?.id, listening })
      })

      // Direct text edits, kept per id so the overlay's Undo can put the old wording back.
      const applied = new Map<string, AppliedEdit>()
      server.ws.on('design-inspect:text', (edit: TextEdit, client) => {
        if (exposed) {
          client.send('design-inspect:refused', { id: edit?.id, reason: 'network-exposed' })
          return
        }
        const done = applyText(root, edit)
        if (done && edit.id) {
          applied.set(edit.id, done)
          client.send('design-inspect:text-saved', { id: edit.id, source: path.relative(root, done.file) })
          return
        }
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.appendFileSync(file, JSON.stringify({ ...edit.request, ts: new Date().toISOString() }) + '\n')
        const listening = fs.existsSync(path.join(root, LISTENING_FILE))
        client.send('design-inspect:queued', { id: edit?.id, listening })
      })

      server.ws.on('design-inspect:text-undo', ({ id }: { id: string }, client) => {
        const done = applied.get(id)
        if (!done) return
        const code = fs.readFileSync(done.file, 'utf8')
        // Only if the file still holds our wording at that spot; a later edit wins.
        if (code.slice(done.index, done.index + done.after.length) !== done.after) {
          client.send('design-inspect:text-undo-failed', { id })
          return
        }
        fs.writeFileSync(done.file, code.slice(0, done.index) + done.before + code.slice(done.index + done.after.length))
        applied.delete(id)
        client.send('design-inspect:text-undone', { id })
      })
    },
  }
}
