import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { Additem, Danger, Eraser, Link1, Mobile, Slack, Text, TextBold, TextItalic, TextUnderline, Warning2 } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'
import Badge from '@/components/Badge/Badge'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import InputField from '@/components/InputField/InputField'
import InputInteger from '@/components/InputInteger/InputInteger'
import Tooltip from '@/components/Tooltip/Tooltip'
import ListBulletIcon from '@/components/icons/ListBulletIcon'
import ListNumberIcon from '@/components/icons/ListNumberIcon'
import TeamsIcon from '@/components/icons/TeamsIcon'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import {
  FieldNode,
  LockedBlockNode,
  SingleLine,
  SubjectDocument,
  visibleLength,
} from './editorExtensions'
import {
  FIELDS,
  INTEGRATIONS,
  MESSAGE_MAX,
  SUBJECT_MAX,
  fieldsFor,
  type EmailText,
  type EmailType,
  type FieldGroup,
  type FieldKey,
} from './emailContent'
import EmailPreview, { type PreviewTab } from './EmailPreview'
import WriteWithAIPanel from './WriteWithAIPanel'
import SparkleIcon from '@/components/icons/SparkleIcon'
import './EmailEditorModal.css'

/* Full-screen email editor (DES-348 phase 1, D8): a compose card with the subject,
   the message around the locked button or course card, and the formatting
   toolbar pinned to the bottom. Prefix: eed- */

export interface EmailEditorTarget {
  type: EmailType
  /** "Edit 7-day reminder", "Add reminder", "Edit welcome email". */
  title: string
  /** "7-day reminder", used in dialogs. */
  name: string
  /** Fixed send time for built-in emails; admin-added reminders get a day stepper. */
  when?: string
  days: number
  /** Days the stepper can't pick (other reminders). Set only for admin-added reminders. */
  takenDays?: Set<number>
  initial: EmailText
  /** Already customised: shows Reset to Default and the custom sender in Preview. */
  customised: boolean
  canReset: boolean
  isNew?: boolean
  saveLabel: string
  /** Inline Callout under the title (the welcome email's image note). */
  callout?: string
  /** Short notes under the title. */
  notes?: string[]
}

interface Props {
  target: EmailEditorTarget
  onClose: () => void
  onSave: (text: EmailText, days: number) => void
  onReset: () => void
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const EMOJI_HINT = isMac ? 'Add emoji with Ctrl + Cmd + Space.' : 'Add emoji with Windows key + full stop.'
const GROUPS: FieldGroup[] = ['Person', 'Organisation', 'Course']

/** Text above the locked block, including fields. Required on Save. */
function hasTextAbove(editor: Editor) {
  let found = false
  let done = false
  editor.state.doc.forEach((child) => {
    if (done) return
    if (child.type.name === 'lockedBlock') {
      done = true
      return
    }
    let hasField = false
    child.descendants((n) => {
      if (n.type.name === 'field') hasField = true
    })
    if (child.textContent.trim() || hasField) found = true
  })
  return found
}

function FieldMenu({
  type,
  placement,
  onPick,
  onClose,
}: {
  type: EmailType
  placement: 'above' | 'below'
  onPick: (key: FieldKey) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const keys = fieldsFor(type)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    ref.current?.querySelector<HTMLElement>('button')?.focus()
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div ref={ref} className={`eed-menu eed-menu--${placement}`} role="menu" aria-label="Insert field">
      {GROUPS.map((group) => {
        const items = keys.filter((k) => FIELDS[k].group === group)
        if (items.length === 0) return null
        return (
          <div key={group} className="eed-menu__group">
            <p className="eed-menu__header">{group}</p>
            {items.map((key) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                className="eed-menu__item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(key)}
              >
                <span>{FIELDS[key].label}</span>
                {FIELDS[key].fallback && (
                  <span className="eed-menu__support">If missing: {FIELDS[key].fallback}</span>
                )}
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip text={label} icon={false}>
      <button
        type="button"
        className={`eed-tool${active ? ' eed-tool--active' : ''}`}
        aria-label={label}
        aria-pressed={active ?? false}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  )
}

function EmailEditorModal({ target, onClose, onSave, onReset }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [days, setDays] = useState(target.days)
  const [dirty, setDirty] = useState(!!target.isNew)
  const [submitted, setSubmitted] = useState(false)
  const [menu, setMenu] = useState<'subject' | 'body' | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [confirm, setConfirm] = useState<'discard' | 'reset' | null>(null)
  const [preview, setPreview] = useState<PreviewTab | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const baseline = useRef({ subject: '', body: '' })
  const isReminder = target.type === 'reminder'
  const lockedLabel = isReminder ? 'course card' : 'button'
  const showAI = INTEGRATIONS.ai

  useOverlayA11y(panelRef, true)

  const markDirty = () => {
    if (!subject || !body) return
    setDirty(
      !!target.isNew ||
        subject.getHTML() !== baseline.current.subject ||
        body.getHTML() !== baseline.current.body,
    )
  }

  const subject = useEditor({
    extensions: [
      SubjectDocument,
      StarterKit.configure({
        document: false,
        blockquote: false,
        bold: false,
        bulletList: false,
        code: false,
        codeBlock: false,
        dropcursor: false,
        gapcursor: false,
        hardBreak: false,
        heading: false,
        horizontalRule: false,
        italic: false,
        link: false,
        listItem: false,
        listKeymap: false,
        orderedList: false,
        strike: false,
        trailingNode: false,
        underline: false,
      }),
      FieldNode,
      SingleLine,
      Placeholder.configure({ placeholder: 'Add a subject' }),
    ],
    content: target.initial.subject,
    shouldRerenderOnTransaction: true,
    editorProps: { attributes: { class: 'eed-subject-input', 'aria-label': 'Subject' } },
    onCreate: ({ editor }) => {
      baseline.current.subject = editor.getHTML()
    },
    onUpdate: () => markDirty(),
  })

  const body = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: { levels: [3] },
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      FieldNode,
      LockedBlockNode,
      Placeholder.configure({
        placeholder: ({ pos, editor }) =>
          pos > 0 && editor.state.doc.resolve(pos).index(0) > 0 ? 'Add text below (optional)' : 'Write your message',
      }),
    ],
    content: target.initial.body,
    shouldRerenderOnTransaction: true,
    editorProps: { attributes: { class: 'eed-body-input', 'aria-label': 'Message' } },
    onCreate: ({ editor }) => {
      baseline.current.body = editor.getHTML()
    },
    onUpdate: () => markDirty(),
  })

  if (!subject || !body) return null

  const subjectLength = visibleLength(subject.getText())
  const bodyLength = visibleLength(body.getText())
  const daysTaken = !!target.takenDays?.has(days)
  const errors = {
    subject: subject.isEmpty
      ? 'Add a subject'
      : subjectLength > SUBJECT_MAX
        ? `Keep the subject to ${SUBJECT_MAX} characters or fewer`
        : null,
    body: !hasTextAbove(body)
      ? `Add a message above the ${lockedLabel}`
      : bodyLength > MESSAGE_MAX
        ? `Keep the message to ${MESSAGE_MAX.toLocaleString('en-GB')} characters or fewer`
        : null,
  }
  const daysDirty = days !== target.days
  const isDirty = dirty || daysDirty

  const requestClose = () => (isDirty ? setConfirm('discard') : onClose())

  const save = () => {
    setSubmitted(true)
    if (errors.subject || errors.body || daysTaken) return
    onSave({ subject: subject.getHTML(), body: body.getHTML() }, days)
  }

  const insertField = (editor: Editor, key: FieldKey) => {
    editor.chain().focus().insertContent({ type: 'field', attrs: { key } }).insertContent(' ').run()
    setMenu(null)
  }

  const openLink = () => {
    setLinkUrl(body.getAttributes('link').href ?? '')
    setLinkOpen((v) => !v)
  }

  const applyLink = () => {
    const href = linkUrl.trim()
    if (!href) return
    const chain = body.chain().focus()
    if (body.state.selection.empty && !body.isActive('link')) {
      chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run()
    } else {
      chain.extendMarkRange('link').setLink({ href }).run()
    }
    setLinkOpen(false)
  }

  const setText = (text: EmailText) => {
    subject.commands.setContent(text.subject, { emitUpdate: true })
    body.commands.setContent(text.body, { emitUpdate: true })
  }

  const applyDraft = (draft: EmailText) => {
    const previous = { subject: subject.getHTML(), body: body.getHTML() }
    setText(draft)
    return previous
  }

  const removeLink = () => {
    body.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkOpen(false)
  }

  const channels: { tab: PreviewTab; label: string; icon: ReactNode }[] = [
    ...(INTEGRATIONS.slack
      ? [{ tab: 'slack' as const, label: 'Slack', icon: <Slack size={16} color="currentColor" variant="Linear" /> }]
      : []),
    ...(INTEGRATIONS.teams
      ? [{ tab: 'teams' as const, label: 'Microsoft Teams', icon: <TeamsIcon size={16} /> }]
      : []),
    { tab: 'phone', label: 'Phone notification', icon: <Mobile size={16} color="currentColor" variant="Linear" /> },
  ]

  const showSubjectError = submitted && errors.subject
  const showBodyError = submitted && errors.body

  return (
    <div className="eed-overlay" ref={panelRef} role="dialog" aria-modal="true" aria-label={target.title}>
      <CloseButton variant="fullscreen" onClick={requestClose} className="eed-close" />

      <div className={`eed-content${aiOpen ? ' eed-content--ai' : ''}`}>
        <div className="eed-main">
          <header className="eed-header">
            <div className="eed-title-row">
              <h2 className="eed-title">{target.title}</h2>
              {showAI && !aiOpen && (
                <Button
                  semantic="ai"
                  variant="outlined"
                  size="sm"
                  icon={<SparkleIcon size={16} color="currentColor" />}
                  onClick={() => setAiOpen(true)}
                >
                  Write with AI
                </Button>
              )}
            </div>
            {target.when ? (
              <p className="eed-when">{target.when}</p>
            ) : (
              <div className="eed-days">
                <span>Send</span>
                <InputInteger
                  value={days}
                  onChange={setDays}
                  min={1}
                  max={30}
                  ariaLabel="Days before due date"
                  validation={daysTaken ? 'error' : 'none'}
                />
                <span>{days === 1 ? 'day' : 'days'} before due date</span>
              </div>
            )}
            {daysTaken && (
              <p className="eed-error" role="alert">
                Another reminder is already sent {days} {days === 1 ? 'day' : 'days'} before the due date.
              </p>
            )}
            {target.isNew && (
              <p className="eed-note">Starter text so you don't begin from a blank page. Edit it or write your own.</p>
            )}
            {target.callout && <Alert type="Callout" message={target.callout} />}
            {target.notes?.map((note) => (
              <p key={note} className="eed-note">{note}</p>
            ))}
          </header>

          <div className="eed-card">
            <div className={`eed-subject${showSubjectError ? ' eed-subject--error' : ''}`}>
              <div className="eed-subject__row">
                <span className="eed-label" id="eed-subject-label">Subject</span>
                <EditorContent editor={subject} className="eed-subject__editor" onFocus={() => setMenu(null)} />
                <span className={`eed-counter${subjectLength > SUBJECT_MAX ? ' eed-counter--over' : ''}`}>
                  {subjectLength} / {SUBJECT_MAX}
                </span>
                <div className="eed-menu-anchor">
                  <ToolButton label="Insert field into subject" onClick={() => setMenu(menu === 'subject' ? null : 'subject')}>
                    <Additem size={20} color="currentColor" variant="Linear" />
                  </ToolButton>
                  {menu === 'subject' && (
                    <FieldMenu
                      type={target.type}
                      placement="below"
                      onPick={(key) => insertField(subject, key)}
                      onClose={() => setMenu(null)}
                    />
                  )}
                </div>
              </div>
              {isReminder && (
                <div className="eed-channels">
                  <span className="eed-channels__label">Also shown in</span>
                  {channels.map((c) => (
                    <Chip
                      key={c.tab}
                      label={c.label}
                      customIconLeft={c.icon}
                      onClick={() => setPreview(c.tab)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="eed-body">
              <div className="eed-body__head">
                <span className="eed-label">Message</span>
                {isReminder && (
                  <Tooltip text="Slack, Microsoft Teams and phone notifications don't include the message." icon={false}>
                    <span tabIndex={0} className="eed-tag-anchor">
                      <Badge type="informative" label="Email only" />
                    </span>
                  </Tooltip>
                )}
                {bodyLength >= MESSAGE_MAX * 0.8 && (
                  <span className={`eed-counter${bodyLength > MESSAGE_MAX ? ' eed-counter--over' : ''}`}>
                    {bodyLength.toLocaleString('en-GB')} / {MESSAGE_MAX.toLocaleString('en-GB')}
                  </span>
                )}
              </div>
              <EditorContent editor={body} className="eed-body__editor" />
            </div>

            {linkOpen && (
              <div className="eed-link">
                <InputField
                  ariaLabel="Link address"
                  placeholder="https://"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  autoFocus
                  className="eed-link__field"
                />
                <Button size="sm" onClick={applyLink} disabled={!linkUrl.trim()}>
                  Add Link
                </Button>
                {body.isActive('link') && (
                  <Button size="sm" variant="text" onClick={removeLink}>
                    Remove Link
                  </Button>
                )}
              </div>
            )}

            <div className="eed-toolbar" role="toolbar" aria-label="Formatting">
              <ToolButton label="Bold" active={body.isActive('bold')} onClick={() => body.chain().focus().toggleBold().run()}>
                <TextBold size={20} color="currentColor" variant={body.isActive('bold') ? 'Bold' : 'Linear'} />
              </ToolButton>
              <ToolButton label="Italic" active={body.isActive('italic')} onClick={() => body.chain().focus().toggleItalic().run()}>
                <TextItalic size={20} color="currentColor" variant={body.isActive('italic') ? 'Bold' : 'Linear'} />
              </ToolButton>
              <ToolButton
                label="Underline"
                active={body.isActive('underline')}
                onClick={() => body.chain().focus().toggleUnderline().run()}
              >
                <TextUnderline size={20} color="currentColor" variant={body.isActive('underline') ? 'Bold' : 'Linear'} />
              </ToolButton>
              <ToolButton
                label="Heading"
                active={body.isActive('heading')}
                onClick={() => body.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Text size={20} color="currentColor" variant={body.isActive('heading') ? 'Bold' : 'Linear'} />
              </ToolButton>
              <span className="eed-toolbar__sep" aria-hidden="true" />
              <ToolButton
                label="Bulleted list"
                active={body.isActive('bulletList')}
                onClick={() => body.chain().focus().toggleBulletList().run()}
              >
                <ListBulletIcon size={20} />
              </ToolButton>
              <ToolButton
                label="Numbered list"
                active={body.isActive('orderedList')}
                onClick={() => body.chain().focus().toggleOrderedList().run()}
              >
                <ListNumberIcon size={20} />
              </ToolButton>
              <span className="eed-toolbar__sep" aria-hidden="true" />
              <ToolButton label="Link" active={body.isActive('link')} onClick={openLink}>
                <Link1 size={20} color="currentColor" variant={body.isActive('link') ? 'Bold' : 'Linear'} />
              </ToolButton>
              <ToolButton
                label="Clear formatting"
                onClick={() => body.chain().focus().unsetAllMarks().clearNodes().run()}
              >
                <Eraser size={20} color="currentColor" variant="Linear" />
              </ToolButton>
              <span className="eed-toolbar__sep" aria-hidden="true" />
              <div className="eed-menu-anchor">
                <Button
                  size="sm"
                  variant="text"
                  icon={<Additem size={20} color="currentColor" variant="Linear" />}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setMenu(menu === 'body' ? null : 'body')}
                  aria-expanded={menu === 'body'}
                >
                  Insert Field
                </Button>
                {menu === 'body' && (
                  <FieldMenu
                    type={target.type}
                    placement="above"
                    onPick={(key) => insertField(body, key)}
                    onClose={() => setMenu(null)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="eed-meta">
            {showSubjectError && <p className="eed-error" role="alert">{errors.subject}</p>}
            {showBodyError && <p className="eed-error" role="alert">{errors.body}</p>}
            <p className="eed-helper">Most inboxes show about 60 characters of the subject, phones about 40.</p>
            <p className="eed-helper">{EMOJI_HINT}</p>
          </div>

          <footer className="eed-footer">
            {target.canReset && target.customised && (
              <Button variant="text" semantic="danger" onClick={() => setConfirm('reset')}>
                Reset to Default
              </Button>
            )}
            <div className="eed-footer__end">
              <Button variant="outlined-2" onClick={() => setPreview('email')}>
                Preview
              </Button>
              <Button onClick={save}>{target.saveLabel}</Button>
            </div>
          </footer>
        </div>

        {aiOpen && (
          <WriteWithAIPanel
            type={target.type}
            onClose={() => setAiOpen(false)}
            onApply={applyDraft}
            onUndo={setText}
          />
        )}
      </div>

      <EmailPreview
        open={preview !== null}
        tab={preview ?? 'email'}
        onTabChange={setPreview}
        onClose={() => setPreview(null)}
        type={target.type}
        name={target.name}
        days={days}
        subject={subject.getHTML()}
        body={body.getHTML()}
        // Invite reminders preview the new single message, never today's varied set.
        customised={target.customised || isDirty || target.type === 'inviteReminder'}
      />

      <ConfirmModal open={confirm === 'discard'} onClose={() => setConfirm(null)} ariaLabel="Discard your changes?">
        <div className="confirm-modal-header confirm-modal-header--center">
          <div className="confirm-modal-icon">
            <Warning2 size={72} color="var(--warning-500)" variant="Linear" />
          </div>
          <h2 className="confirm-modal-title">Discard your changes?</h2>
          <p className="confirm-modal-body">Your edits to this email haven't been saved.</p>
        </div>
        <div className="confirm-modal-actions confirm-modal-actions--center">
          <Button variant="outlined-2" onClick={() => setConfirm(null)}>
            Keep Editing
          </Button>
          <Button semantic="warning" onClick={onClose}>
            Discard Changes
          </Button>
        </div>
      </ConfirmModal>

      <ConfirmModal open={confirm === 'reset'} onClose={() => setConfirm(null)} ariaLabel={`Reset the ${target.name}?`}>
        <div className="confirm-modal-header confirm-modal-header--center">
          <div className="confirm-modal-icon">
            <Danger size={72} color="var(--danger-500)" variant="Linear" />
          </div>
          <h2 className="confirm-modal-title">Reset the {target.name} to the 5Mins default?</h2>
          <p className="confirm-modal-body">
            Your custom subject and message will be deleted and can't be recovered.
            {isReminder
              ? ' Learners get the 5Mins text from the next reminder.'
              : ' People get the 5Mins version from the next email.'}
          </p>
        </div>
        <div className="confirm-modal-actions confirm-modal-actions--center">
          <Button variant="outlined-2" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button semantic="danger" onClick={onReset}>
            Reset to Default
          </Button>
        </div>
      </ConfirmModal>
    </div>
  )
}

export default EmailEditorModal
