import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowCircleUp2, Sms } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Chip from '@/components/Chip/Chip'
import CloseButton from '@/components/CloseButton/CloseButton'
import SparkleIcon from '@/components/icons/SparkleIcon'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import { draftEmail, type Length, type Tone } from './aiDraft'
import { subjectText, type EmailText, type EmailType } from './emailContent'
import './HugoChat.css'

/* Write with AI as an Ask Hugo chat (Hugo AI chatbot Figma 9178:32108): the chat
   sits in the centre and the email form on the right. Each draft goes straight
   into the email; nothing saves until Save, and Undo puts back the earlier text.
   Drafts are simulated in the prototype. Prefix: hugo- */

interface Message {
  id: number
  role: 'user' | 'hugo'
  text: string
  /** Subject of the draft this answer put in the email. */
  draftSubject?: string
  /** Text the draft replaced, for Undo. Cleared once undone. */
  previous?: EmailText
  undone?: boolean
}

const FOLLOW_UPS = ['Make it more formal', 'Make it shorter', 'Make it longer', 'Make it more urgent']

const GREETING =
  "Hi, I'm Hugo. Tell me what this email should say and I'll write the subject and message, with personal fields. Nothing is saved until you press Save."

/** Reads tone and length from the request; keeps the last ones when it says nothing new. */
function readRequest(text: string, tone: Tone, length: Length): { tone: Tone; length: Length } {
  const t = text.toLowerCase()
  let nextTone = tone
  if (/formal|professional/.test(t)) nextTone = 'professional'
  else if (/urgent|asap|deadline|overdue/.test(t)) nextTone = 'urgent'
  else if (/friendly|warm|casual/.test(t)) nextTone = 'friendly'
  let nextLength = length
  if (/short|brief|concise/.test(t)) nextLength = 'short'
  else if (/long|detail|more about/.test(t)) nextLength = 'long'
  return { tone: nextTone, length: nextLength }
}

interface Props {
  type: EmailType
  onClose: () => void
  /** Puts the draft in the email and returns the text it replaced. */
  onApply: (draft: EmailText) => EmailText
  onUndo: (previous: EmailText) => void
}

function HugoChat({ type, onClose, onApply, onUndo }: Props) {
  const reduce = useReducedMotion()
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: 'hugo', text: GREETING }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const style = useRef<{ tone: Tone; length: Length }>({ tone: 'friendly', length: 'short' })
  const listRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const timer = useRef<number>(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
  }, [messages, thinking, reduce])

  const send = (text: string) => {
    const request = text.trim()
    if (!request || thinking) return
    setInput('')
    setMessages((m) => [...m, { id: nextId.current++, role: 'user', text: request }])
    setThinking(true)
    timer.current = window.setTimeout(() => {
      style.current = readRequest(request, style.current.tone, style.current.length)
      const draft = draftEmail(type, style.current.tone, style.current.length)
      const previous = onApply(draft)
      setThinking(false)
      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          role: 'hugo',
          text: "Here's a draft. I've put the subject and message in the email on the right. Review it before saving.",
          draftSubject: subjectText(draft.subject),
          previous,
        },
      ])
    }, 1400)
  }

  const undo = (id: number) => {
    const message = messages.find((m) => m.id === id)
    if (!message?.previous) return
    onUndo(message.previous)
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, previous: undefined, undone: true } : x)))
  }

  const lastHugo = [...messages].reverse().find((m) => m.role === 'hugo')

  return (
    <section className="hugo" aria-label="Ask Hugo">
      <header className="hugo-head">
        <CloseButton onClick={onClose} ariaLabel="Close Ask Hugo" />
      </header>

      <div className="hugo-list" ref={listRef} aria-live="polite">
        <div className="hugo-thread">
          <AnimatePresence initial={false}>
            {messages.map((m) =>
              m.role === 'user' ? (
                <motion.div key={m.id} className="hugo-question" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
                  <p className="hugo-question__bubble">{m.text}</p>
                </motion.div>
              ) : (
                <motion.div key={m.id} className="hugo-answer" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
                  <SparkleIcon size={24} gradient className="hugo-answer__icon" />
                  <div className="hugo-answer__body">
                    <p className="hugo-answer__text">{m.text}</p>
                    {m.draftSubject && (
                      <div className="hugo-draft">
                        <div className="hugo-draft__head">
                          <Sms size={16} color="currentColor" variant="Linear" />
                          Draft email
                        </div>
                        <p className="hugo-draft__subject">{m.draftSubject}</p>
                      </div>
                    )}
                    {m.previous && (
                      <Button variant="text" size="sm" onClick={() => undo(m.id)} className="hugo-answer__undo">
                        Undo
                      </Button>
                    )}
                    {m.undone && <p className="hugo-answer__note">Draft undone. The email is back to how it was.</p>}
                    {m === lastHugo && m.draftSubject && !thinking && (
                      <div className="hugo-suggestions" aria-label="Suggested follow-ups">
                        {FOLLOW_UPS.map((s) => (
                          <Chip key={s} label={s} onClick={() => send(s)} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ),
            )}
            {thinking && (
              <motion.div key="thinking" className="hugo-answer" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
                <SparkleIcon size={24} gradient className="hugo-answer__icon hugo-answer__icon--pulse" />
                <p className="hugo-answer__text hugo-answer__text--muted">Writing your email…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="hugo-input">
        <form
          className="hugo-field"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            className="hugo-field__input"
            placeholder="Ask Hugo..."
            aria-label="Ask Hugo"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="hugo-field__send"
            aria-label="Send"
            disabled={!input.trim() || thinking}
          >
            <ArrowCircleUp2 size={32} color="currentColor" variant="Bold" />
          </button>
        </form>
        <p className="hugo-disclaimer">Hugo AI may make mistakes. Please verify important information.</p>
      </div>
    </section>
  )
}

export default HugoChat
