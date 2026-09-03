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
 *    the `/inspect` skill tails from Claude Code.
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
    },
  }
}
