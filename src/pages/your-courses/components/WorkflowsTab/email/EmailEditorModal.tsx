import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { Back, Danger, Eye, Link1, Mobile, Slack, TextBold, TextItalic, TextUnderline, InfoCircle } from 'iconsax-react'
import Alert from '@/components/Alert/Alert'
import ColourPicker from '@/components/ColourField/ColourPicker'
import Button from '@/components/Button/Button'
import Dropdown from '@/components/Dropdown/Dropdown'
import CloseButton from '@/components/CloseButton/CloseButton'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import InputField from '@/components/InputField/InputField'
import InputInteger from '@/components/InputInteger/InputInteger'
import Tooltip from '@/components/Tooltip/Tooltip'
import BracesIcon from '@/components/icons/BracesIcon'
import ListBulletIcon from '@/components/icons/ListBulletIcon'
import TextColourIcon from '@/components/icons/TextColourIcon'
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
import HugoChat from './HugoChat'
import SparkleIcon from '@/components/icons/SparkleIcon'
import SectionHeader from '@/pages/your-courses/components/SectionHeader/SectionHeader'
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

/* Text styles from the type scale, so every email stays on brand. */
const TEXT_STYLES = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h3', label: 'Heading' },
]
/* Page transition (motion.md): 300ms ease-in-out for the email column's move. A soft
   curve, so it starts moving at once rather than easing out of a standstill. */
const MOVE = (reduce: boolean | null) => ({ duration: reduce ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] as const })

const GROUPS: FieldGroup[] = ['Person', 'Organisation', 'Invite', 'Course']

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

/* Course name and due date stay out of the subject: one subject goes to every course. */
const SUBJECT_EXCLUDED: FieldKey[] = ['course_name', 'due_date']

function FieldMenu({
  type,
  forSubject,
  placement,
  onPick,
  onClose,
}: {
  type: EmailType
  forSubject?: boolean
  placement: 'above' | 'below'
  onPick: (key: FieldKey) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const keys = fieldsFor(type).filter((k) => !(forSubject && SUBJECT_EXCLUDED.includes(k)))

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

/* A browser can't open the computer's own emoji panel from a button, so the toolbar
   offers a short grid of the emojis people use most in work emails. */
const EMOJIS = [
  '😀', '😊', '🙂', '😉', '😄', '🤩', '🥳', '🤗',
  '👋', '👍', '👏', '🙌', '💪', '🙏', '🤝', '✌️',
  '🎉', '🎊', '✨', '⭐', '🌟', '🔥', '🚀', '🏆',
  '✅', '📚', '📖', '✏️', '💡', '🧠', '🎯', '📅',
  '⏰', '⏳', '📣', '💬', '❤️', '💙', '☀️', '🌱',
]

function EmojiMenu({ onPick, onClose }: { onPick: (emoji: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

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
    <div ref={ref} className="eed-menu eed-menu--above eed-emoji" role="menu" aria-label="Insert emoji">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="menuitem"
          className="eed-emoji__item"
          aria-label={emoji}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

/* The neutral greys used for text, darkest first. The email needs a hex, so it is read
   off the token at pick time; the swatch itself paints with the token. */
const TEXT_GREYS = [900, 800, 700, 600, 500, 400, 300, 200]
const tokenHex = (step: number) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--neutral-${step}`).trim().toLowerCase()

/** Text colour: the Colour field picker in a toolbar popover. Colours the selection as the admin drags. */
function ColourMenu({ value, onPick, onClose }: { value: string; onPick: (hex: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    ref.current?.querySelector<HTMLElement>('[role="slider"]')?.focus()
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div ref={ref} className="eed-menu eed-menu--above eed-colour" role="dialog" aria-label="Text colour">
      <div className="eed-colour__greys">
        {TEXT_GREYS.map((step) => (
          <button
              key={step}
              type="button"
              className="eed-colour__grey"
              style={{ background: `var(--neutral-${step})` }}
              aria-label={`Neutral ${step}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(tokenHex(step))}
            />
        ))}
      </div>
      <ColourPicker label="Text colour" value={value} onChange={onPick} />
    </div>
  )
}

/** The colour of the text at the cursor as #rrggbb: the mark if set, else the editor's own text colour. */
function textColourAt(editor: Editor) {
  const mark = editor.getAttributes('textStyle').color as string | undefined
  if (mark && /^#[0-9a-f]{6}$/i.test(mark)) return mark
  const rgb = getComputedStyle(editor.view.dom).color.match(/\d+/g) ?? ['0', '0', '0']
  return '#' + rgb.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')
}

function ToolButton({
  label,
  active,
  expanded,
  onClick,
  className,
  children,
}: {
  label: string
  className?: string
  active?: boolean
  /** For a button that opens a menu. */
  expanded?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip text={label} icon={false} disabled={expanded}>
      <button
        type="button"
        className={`eed-tool${active ? ' eed-tool--active' : ''}${className ? ` ${className}` : ''}`}
        aria-label={label}
        aria-pressed={expanded === undefined ? active ?? false : undefined}
        aria-expanded={expanded}
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
  const [menu, setMenu] = useState<'subject' | 'body' | 'emoji' | 'colour' | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [confirm, setConfirm] = useState<'discard' | 'reset' | null>(null)
  const [preview, setPreview] = useState<PreviewTab | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  // The two-column layout outlives the chat until its exit animation finishes.
  const [hugoLayout, setHugoLayout] = useState(false)
  const reduce = useReducedMotion()
  const baseline = useRef({ subject: '', body: '' })
  const isReminder = target.type === 'reminder'
  const lockedLabel = isReminder ? 'course card' : 'button'
  /* Write with AI is parked for now (Bruno, 2026-11-02); the Hugo chat comes back later. */
  const showAI = false

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
    editorProps: { attributes: { class: 'eed-subject-input', 'aria-labelledby': 'eed-subject-label' } },
    onCreate: ({ editor }) => {
      baseline.current.subject = editor.getHTML()
    },
    onUpdate: () => markDirty(),
  })

  /* The toolbar only shows the formats under the cursor once the admin has put it in the
     message: before that, the cursor sits at the start by default and the opening
     line is bold, so Bold looked switched on for no reason. */
  const [bodyTouched, setBodyTouched] = useState(false)
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
        // No forced empty line after the button or course card; admins can delete it.
        trailingNode: false,
      }),
      TextStyle,
      Color,
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
    onFocus: () => setBodyTouched(true),
    onUpdate: () => markDirty(),
  })

  if (!subject || !body) return null

  const marked = (name: string) => bodyTouched && body.isActive(name)
  const subjectLength = visibleLength(subject.getText())
  const bodyLength = visibleLength(body.getText())
  const daysTaken = !!target.takenDays?.has(days)
  // Spaces alone don't count as a subject; a field on its own does.
  let subjectHasField = false
  subject.state.doc.descendants((n) => {
    if (n.type.name === 'field') subjectHasField = true
  })
  const subjectBlank = subject.isEmpty || (!subjectHasField && !subject.getText().trim())
  const errors = {
    subject: subjectBlank
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
    { tab: 'phone', label: 'phone notifications', icon: <Mobile size={16} color="currentColor" variant="Linear" /> },
  ]

  const showSubjectError = submitted && errors.subject
  const showBodyError = submitted && errors.body

  const header = (
    <SectionHeader
      divider={false}
      title={target.title}
      description={target.when}
      ctas={
        showAI ? (
          // Stays visible but disabled while the chat is open.
          <Button
            semantic="ai"
            variant="outlined"
            disabled={aiOpen}
            icon={<SparkleIcon size={20} color="currentColor" />}
            onClick={() => {
              setHugoLayout(true)
              setAiOpen(true)
            }}
          >
            Write with AI
          </Button>
        ) : undefined
      }
    />
  )

  return (
    <div
      className={`eed-overlay${hugoLayout ? ' eed-overlay--hugo' : ''}`}
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={target.title}
    >
      <CloseButton variant="fullscreen" onClick={requestClose} className="eed-close" />

      {/* Write with AI opens Ask Hugo: chat in the centre, the email form on the right. */}
      <AnimatePresence onExitComplete={() => setHugoLayout(false)}>
        {aiOpen && (
          <motion.div
            key="hugo"
            className="eed-hugo"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0, transition: { duration: reduce ? 0 : 0.3, ease: 'easeOut' } }}
            exit={{ opacity: 0, x: reduce ? 0 : -24, transition: { duration: reduce ? 0 : 0.2, ease: 'easeIn' } }}
          >
            <HugoChat type={target.type} onClose={() => setAiOpen(false)} onApply={applyDraft} onUndo={setText} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The email column glides between centre and right as Hugo opens and closes. */}
      <motion.div className="eed-content" layout="position" transition={MOVE(reduce)}>
        <div className="eed-main">
          {/* Title on top of the email section, as in the automation editor. */}
          {header}
          <div className="eed-intro">
            {!target.when && (
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
            {target.callout && <Alert type="Callout" message={target.callout} />}
            {target.notes?.map((note) => (
              <p key={note} className="eed-note">{note}</p>
            ))}
          </div>

          <div className="eed-fields">
            {/* Subject: the Outlined input (input.md), holding a one-line editor so it can take fields and emoji. */}
            <div className={`input-field eed-input${showSubjectError ? ' input-field--error' : ''}`}>
              <span className="input-field__label" id="eed-subject-label">Subject</span>
              <div className="input-field__wrapper">
                <EditorContent editor={subject} className="eed-subject__editor" onFocus={() => setMenu(null)} />
                {/* Insert field sits inside the input, as its right icon (input.md). */}
                <div className="eed-menu-anchor">
                  <ToolButton label="Insert field into subject" onClick={() => setMenu(menu === 'subject' ? null : 'subject')}>
                    <BracesIcon size={20} />
                  </ToolButton>
                  {menu === 'subject' && (
                    <FieldMenu
                      type={target.type}
                      forSubject
                      placement="below"
                      onPick={(key) => insertField(subject, key)}
                      onClose={() => setMenu(null)}
                    />
                  )}
                </div>
              </div>
              <span className="input-field__helper eed-helper-row" role={showSubjectError ? 'alert' : undefined}>
                <span>
                  {showSubjectError
                    ? errors.subject
                    : isReminder && (
                        <>
                          {/* Each channel opens Preview on its tab. */}
                          The subject is also sent to{' '}
                          {channels.map((c, i) => (
                            <span key={c.tab}>
                              <Button variant="link" size="md" className="eed-channel-link" onClick={() => setPreview(c.tab)}>
                                {c.tab === 'teams' ? 'Teams' : c.label}
                              </Button>
                              {i < channels.length - 2 ? ', ' : i === channels.length - 2 ? ', and ' : ''}
                            </span>
                          ))}
                          .
                        </>
                      )}
                </span>
              </span>
            </div>

          </div>

          {/* Message on its own card, apart from the subject, so the form reads in two steps. */}
          <div className="eed-fields">
            {/* Message: the Outlined input holding the editor, with the toolbar below it. */}
            <div className={`input-field eed-input${showBodyError ? ' input-field--error' : ''}`}>
              <span className="input-field__label">{isReminder ? 'Message (email only)' : 'Message'}</span>
              <div className="input-field__wrapper eed-body__wrapper">
                <EditorContent editor={body} className="eed-body__editor" />
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

              </div>
              <div className="eed-toolbar" role="toolbar" aria-label="Formatting">
                <ToolButton label="Bold" active={marked('bold')} onClick={() => body.chain().focus().toggleBold().run()}>
                  <TextBold size={20} color="currentColor" variant="Linear" />
                </ToolButton>
                <ToolButton label="Italic" active={marked('italic')} onClick={() => body.chain().focus().toggleItalic().run()}>
                  <TextItalic size={20} color="currentColor" variant="Linear" />
                </ToolButton>
                <ToolButton
                  label="Underline"
                  active={marked('underline')}
                  onClick={() => body.chain().focus().toggleUnderline().run()}
                >
                  <TextUnderline size={20} color="currentColor" variant="Linear" />
                </ToolButton>
                <div className="eed-menu-anchor">
                  <ToolButton
                    label="Text colour"
                    className="eed-tool--colour"
                    expanded={menu === 'colour'}
                    onClick={() => setMenu(menu === 'colour' ? null : 'colour')}
                  >
                    <TextColourIcon size={18} />
                    {/* The colour at the cursor, as in the flashcards editor. */}
                    <span className="eed-tool__swatch" style={{ background: (body.getAttributes('textStyle').color as string | undefined) ?? 'var(--text-primary)' }} aria-hidden="true" />
                  </ToolButton>
                  {menu === 'colour' && (
                    <ColourMenu
                      value={textColourAt(body)}
                      onPick={(hex) => body.chain().setColor(hex).run()}
                      onClose={() => setMenu(null)}
                    />
                  )}
                </div>
                <span className="eed-toolbar__sep" aria-hidden="true" />
                <Dropdown
                  size="sm"
                  className="eed-style"
                  options={TEXT_STYLES}
                  value={marked('heading') ? 'h3' : 'p'}
                  onChange={(v) => {
                    const chain = body.chain().focus()
                    if (v === 'p') chain.setParagraph().run()
                    else chain.setHeading({ level: 3 }).run()
                  }}
                />
                <span className="eed-toolbar__sep" aria-hidden="true" />
                <ToolButton
                  label="Bulleted list"
                  active={marked('bulletList')}
                  onClick={() => body.chain().focus().toggleBulletList().run()}
                >
                  <ListBulletIcon size={20} />
                </ToolButton>
                <ToolButton
                  label="Numbered list"
                  active={marked('orderedList')}
                  onClick={() => body.chain().focus().toggleOrderedList().run()}
                >
                  <ListNumberIcon size={20} />
                </ToolButton>
                <span className="eed-toolbar__sep" aria-hidden="true" />
                <ToolButton label="Link" active={marked('link')} onClick={openLink}>
                  <Link1 size={20} color="currentColor" variant="Linear" />
                </ToolButton>
                <div className="eed-menu-anchor">
                  <ToolButton
                    label="Insert emoji"
                    expanded={menu === 'emoji'}
                    onClick={() => setMenu(menu === 'emoji' ? null : 'emoji')}
                  >
                    <span className="eed-tool__emoji" aria-hidden="true">😀</span>
                  </ToolButton>
                  {menu === 'emoji' && (
                    <EmojiMenu
                      onPick={(emoji) => {
                        body.chain().focus().insertContent(emoji).run()
                        setMenu(null)
                      }}
                      onClose={() => setMenu(null)}
                    />
                  )}
                </div>
                <span className="eed-toolbar__sep" aria-hidden="true" />
                <div className="eed-menu-anchor">
                  <Button
                    variant="text"
                    icon={<BracesIcon size={20} />}
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
                {/* Reset sits with the text it replaces, its own group after Insert Field. */}
                {target.canReset && (target.customised || isDirty) && (
                  <>
                    <span className="eed-toolbar__sep" aria-hidden="true" />
                    <ToolButton label="Reset to default" onClick={() => setConfirm('reset')}>
                      <Back size={20} color="currentColor" variant="Linear" />
                    </ToolButton>
                  </>
                )}
              </div>
              {(showBodyError || bodyLength >= MESSAGE_MAX * 0.8) && (
                <span className="input-field__helper eed-helper-row" role={showBodyError ? 'alert' : undefined}>
                  <span>{showBodyError && errors.body}</span>
                  {bodyLength >= MESSAGE_MAX * 0.8 && (
                    <span className={`eed-counter${bodyLength > MESSAGE_MAX ? ' eed-counter--over' : ''}`}>
                      {bodyLength.toLocaleString('en-GB')} / {MESSAGE_MAX.toLocaleString('en-GB')}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

        </div>

      </motion.div>

      {/* Sticky footer: the actions stay in reach while the message scrolls. */}
      <footer className="eed-footer">
        <div className="eed-footer__end">
          <Button
            size="lg"
            variant="outlined-2"
            icon={<Eye size={20} color="currentColor" variant="Linear" />}
            onClick={() => setPreview('email')}
          >
            Preview
          </Button>
          <Button size="lg" onClick={save}>{target.saveLabel}</Button>
        </div>
      </footer>

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
            <InfoCircle size={72} color="var(--warning-500)" variant="Linear" />
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
            <Danger size={72} color="var(--warning-500)" variant="Linear" />
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
          <Button semantic="warning" onClick={onReset}>
            Reset to Default
          </Button>
        </div>
      </ConfirmModal>
    </div>
  )
}

export default EmailEditorModal
