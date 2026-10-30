import { Extension, Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Node as PMNode } from '@tiptap/pm/model'
import { FIELDS, type FieldKey } from './emailContent'
import LockedBlockView from './LockedBlockView'

/* Tiptap pieces for the email editor (D5): personal fields as one-unit inline
   tokens, the locked button or course card, and the single-line subject. */

/** A personal field. Counts as its visible label (D4) and deletes as one unit. */
export const FieldNode = Node.create({
  name: 'field',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      key: {
        default: 'first_name',
        parseHTML: (el) => el.getAttribute('data-field'),
        renderHTML: (attrs) => ({ 'data-field': attrs.key }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-field]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'eed-field' }), labelOf(node)]
  },

  renderText({ node }) {
    return labelOf(node)
  },
})

const labelOf = (node: PMNode) => FIELDS[node.attrs.key as FieldKey]?.label ?? ''

const countLocked = (doc: PMNode) => {
  let n = 0
  doc.descendants((node) => {
    if (node.type.name === 'lockedBlock') n++
    return node.isBlock
  })
  return n
}

/** The button (welcome) or course card (reminders) 5Mins always sends. Admins
    write above and below it; no edit, cut, paste or select-all can remove or
    duplicate it. */
export const LockedBlockNode = Node.create({
  name: 'lockedBlock',
  group: 'block',
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      kind: {
        default: 'button',
        parseHTML: (el) => el.getAttribute('data-locked-block'),
        renderHTML: (attrs) => ({ 'data-locked-block': attrs.kind }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-locked-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes]
  },

  renderText() {
    return ''
  },

  addNodeView() {
    return ReactNodeViewRenderer(LockedBlockView)
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('lockedBlockGuard'),
        // Pasting can't add a second block.
        filterTransaction: (tr, state) =>
          !tr.docChanged || countLocked(tr.doc) <= countLocked(state.doc),
        // Deleting text around it (select-all, cut) puts the block back where it was.
        appendTransaction: (trs, oldState, newState) => {
          if (countLocked(newState.doc) >= countLocked(oldState.doc)) return null
          let oldPos = -1
          let block: PMNode | null = null
          oldState.doc.forEach((node, offset) => {
            if (node.type.name === 'lockedBlock') {
              oldPos = offset
              block = node
            }
          })
          const lost = block as PMNode | null
          if (!lost) return null
          let pos = oldPos
          trs.forEach((t) => {
            pos = t.mapping.map(pos)
          })
          const $pos = newState.doc.resolve(Math.min(pos, newState.doc.content.size))
          const at = $pos.depth > 0 ? $pos.before(1) : $pos.pos
          const tr = newState.tr.insert(at, lost)
          if (at === 0) tr.insert(0, newState.schema.nodes.paragraph.create())
          return tr
        },
      }),
    ]
  },
})

/** The subject is one plain line: text, emoji and fields only. */
export const SubjectDocument = Node.create({
  name: 'doc',
  topNode: true,
  content: 'paragraph',
})

export const SingleLine = Extension.create({
  name: 'singleLine',
  addKeyboardShortcuts() {
    return { Enter: () => true, 'Shift-Enter': () => true }
  },
})

/** Visible characters, with each field counted as its label (D4). */
export const visibleLength = (text: string) => text.replace(/\n/g, '').length
