import { useEffect, useRef, useState } from 'react'
import { TickCircle } from 'iconsax-react'
import AIWorkingCard from '@/components/AIWorkingCard/AIWorkingCard'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import SparkleIcon from '@/components/icons/SparkleIcon'
import { draftEmail, type Length, type Tone } from './aiDraft'
import type { EmailText, EmailType } from './emailContent'

/* Write with AI (2.3): a side panel beside the compose card, so it never pushes the
   message down. The draft goes straight into the editor; nothing saves until Save,
   and Undo puts back the text from before the draft. Prefix: eed-ai- */

const STEPS = ['Reading your brief', 'Writing the subject and message']

interface Props {
  type: EmailType
  onClose: () => void
  /** Puts the draft in the editor and returns the text it replaced. */
  onApply: (draft: EmailText) => EmailText
  onUndo: (previous: EmailText) => void
}

function WriteWithAIPanel({ type, onClose, onApply, onUndo }: Props) {
  const [brief, setBrief] = useState('')
  const [tone, setTone] = useState<Tone>('friendly')
  const [length, setLength] = useState<Length>('short')
  const [step, setStep] = useState<number | null>(null)
  const [previous, setPrevious] = useState<EmailText | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const generate = () => {
    setPrevious(null)
    setStep(0)
    timers.current = [
      window.setTimeout(() => setStep(1), 900),
      window.setTimeout(() => {
        setPrevious(onApply(draftEmail(type, tone, length)))
        setStep(null)
      }, 1900),
    ]
  }

  const working = step !== null

  return (
    <aside className="eed-ai" aria-label="Write with AI">
      <div className="eed-ai__head">
        <SparkleIcon size={20} color="var(--text-primary)" />
        <h3 className="eed-ai__title">Write with AI</h3>
        <CloseButton onClick={onClose} className="eed-ai__close" ariaLabel="Close Write with AI" />
      </div>
      <p className="eed-ai__intro">
        Describe what the email should say. AI writes the subject and message with personal fields.
      </p>

      <div className="eed-ai__field">
        <label className="eed-ai__label" htmlFor="eed-ai-brief">
          What should the email say?
        </label>
        <textarea
          id="eed-ai-brief"
          className="eed-ai__textarea"
          rows={4}
          placeholder="For example: remind people the course helps them in their next review"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          disabled={working}
        />
      </div>

      <div className="eed-ai__field">
        <span className="eed-ai__label">Tone</span>
        <ContentSwitcher
          ariaLabel="Tone"
          activeKey={tone}
          onChange={(k) => setTone(k as Tone)}
          items={[
            { key: 'friendly', label: 'Friendly' },
            { key: 'professional', label: 'Professional' },
            { key: 'urgent', label: 'Urgent' },
          ]}
        />
      </div>

      <div className="eed-ai__field">
        <span className="eed-ai__label">Length</span>
        <ContentSwitcher
          ariaLabel="Length"
          activeKey={length}
          onChange={(k) => setLength(k as Length)}
          items={[
            { key: 'short', label: 'Short' },
            { key: 'long', label: 'Long' },
          ]}
        />
      </div>

      {working ? (
        <AIWorkingCard steps={STEPS} activeStep={step} lastStepDone={false} />
      ) : (
        <Button
          semantic="ai"
          icon={<SparkleIcon size={20} color="currentColor" />}
          onClick={generate}
          disabled={!brief.trim()}
          className="eed-ai__generate"
        >
          Generate
        </Button>
      )}

      {previous && (
        <div className="eed-ai__result" role="status">
          <TickCircle size={20} color="var(--text-success)" variant="Linear" />
          <span>Draft added. Review it before saving.</span>
          <Button
            size="sm"
            variant="text"
            onClick={() => {
              onUndo(previous)
              setPrevious(null)
            }}
          >
            Undo
          </Button>
        </div>
      )}
    </aside>
  )
}

export default WriteWithAIPanel
