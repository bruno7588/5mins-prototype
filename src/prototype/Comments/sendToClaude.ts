import { locate } from './commentAnchor'
import type { PrototypeComment } from './useComments'

/* Hands a comment thread to the running Claude Code session through the Design Inspect
   bridge (tools/design-inspect): the same request the Inspect overlay sends, built from
   the element the comment is pinned to, with the thread as the instruction. Dev only,
   since the bridge lives on the local dev server. */

export type SendResult = 'sent' | 'queued' | 'unavailable'

/** Sends the thread; resolves once the dev server has queued it, saying whether Claude Code is listening. */
export async function sendToClaude(root: PrototypeComment, replies: PrototypeComment[]): Promise<SendResult> {
  const hot = import.meta.hot
  if (!import.meta.env.DEV || !hot) return 'unavailable'
  const { buildRequest } = await import('@/dev/DesignInspect/inspect')
  // The pinned element, or the page itself when the anchor no longer resolves.
  const el = locate(root.anchor)?.el ?? document.querySelector('main') ?? document.body
  const thread = [root, ...replies].map((c) => `${c.author} (${new Date(c.createdAt).toLocaleString('en-GB')}): ${c.text}`)
  const instruction = ['Feedback from a prototype comment, forwarded by Bruno.', ...thread].join('\n')
  const req = { ...buildRequest(el, instruction), source: 'comment', commentId: root.id, route: root.route }

  return new Promise((resolve) => {
    const done = (result: SendResult) => {
      hot.off('design-inspect:queued', onQueued)
      hot.off('design-inspect:refused', onRefused)
      resolve(result)
    }
    const onQueued = (data: { id?: string; listening?: boolean }) => {
      if (data?.id === req.id) done(data.listening ? 'sent' : 'queued')
    }
    // Refused when the dev server is exposed to the network (--host).
    const onRefused = (data: { id?: string }) => {
      if (data?.id === req.id) done('unavailable')
    }
    hot.on('design-inspect:queued', onQueued)
    hot.on('design-inspect:refused', onRefused)
    hot.send('design-inspect:send', req)
  })
}
