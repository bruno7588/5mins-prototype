import { useRef } from 'react'
import { Add } from 'iconsax-react'
import Chip from '@/components/Chip/Chip'

/* Material the admin already owns — policies, handbooks, floor plans, call recordings.
   Kept in step with the hint on the button: if one changes, so does the other. */
const ACCEPT = '.pdf,.doc,.docx,.txt,.md,.rtf,.ppt,.pptx,.xls,.xlsx,image/*,audio/*,video/*'

interface Props {
  /** File names, in the order they were attached. */
  sources: string[]
  onChange: (sources: string[]) => void
}

/**
 * The optional Context block on step 1 — background material the AI reads before it
 * writes the scenario. Add Source opens the file picker directly; attached files list
 * as dismissible chips.
 */
function ContextSources({ sources, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files ?? []).map((f) => f.name)
    if (names.length) onChange([...sources, ...names])
    /* Cleared so re-picking the same file still fires a change event. */
    e.target.value = ''
  }

  return (
    <div className="st-drawer__field">
      <span className="st-drawer__label st-drawer__label--section">
        Context <span className="st-drawer__label-optional">(optional)</span>
      </span>

      {sources.length > 0 && (
        <div className="st-drawer__source-chips">
          {sources.map((name, i) => (
            <Chip
              key={`${name}-${i}`}
              label={name}
              selected
              iconRight
              onDismiss={() => onChange(sources.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="st-drawer__file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFiles}
      />
      <button
        type="button"
        className="st-drawer__add-source"
        onClick={() => inputRef.current?.click()}
      >
        <Add size={20} color="currentColor" variant="Linear" />
        <span className="st-drawer__add-source-label">Attach Source</span>
        <span className="st-drawer__add-source-hint">(Document, Image, Audio or Video)</span>
      </button>

      <span className="st-drawer__helper">
        Relevant background information helps AI create a more realistic test
      </span>
    </div>
  )
}

export default ContextSources
