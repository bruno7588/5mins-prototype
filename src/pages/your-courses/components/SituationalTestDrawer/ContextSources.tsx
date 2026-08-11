import { useRef } from 'react'
import { Add, DocumentText, Gallery, Video, VolumeHigh } from 'iconsax-react'
import CloseButton from '@/components/CloseButton/CloseButton'

/* Material the admin already owns — policies, handbooks, floor plans, call recordings.
   Kept in step with the hint on the button: if one changes, so does the other. */
const ACCEPT = '.pdf,.doc,.docx,.txt,.md,.rtf,.ppt,.pptx,.xls,.xlsx,image/*,audio/*,video/*'

/* Each attached source shows its file type, so the list is scannable without reading
   extensions (Figma 8996:55219). Anything unrecognised reads as a document. */
const IMAGE = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'avif']
const VIDEO = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'mpg', 'mpeg']
const AUDIO = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'aiff', 'wma']

function sourceIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (IMAGE.includes(ext)) return Gallery
  if (VIDEO.includes(ext)) return Video
  if (AUDIO.includes(ext)) return VolumeHigh
  return DocumentText
}

interface Props {
  /** File names, in the order they were attached. */
  sources: string[]
  onChange: (sources: string[]) => void
}

/**
 * The optional Context block on step 1 — background material the AI reads before it
 * writes the brief. Add Source opens the file picker directly; attached files list
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
        {/* "for AI" earns its place: it names the owner before the admin uploads, so the
            asymmetry between Generate With AI and Add Questions Manually is legible up
            front rather than discovered after attaching files the manual path ignores. */}
        Context for AI <span className="st-drawer__label-optional">(optional)</span>
      </span>

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
        <span className="st-drawer__add-source-hint">(document, image, audio, or video)</span>
      </button>

      {/* Below the uploader, so the control the admin acts on keeps its position as the
          list grows rather than being pushed down the screen by its own output. */}
      {sources.length > 0 && (
        <ul className="st-drawer__sources">
          {sources.map((name, i) => {
            const Icon = sourceIcon(name)
            return (
              <li className="st-drawer__source-item" key={`${name}-${i}`}>
                <Icon size={20} color="var(--text-primary)" variant="Linear" />
                <span className="st-drawer__source-name">{name}</span>
                <CloseButton
                  size={20}
                  className="st-drawer__source-remove"
                  ariaLabel={`Remove ${name}`}
                  onClick={() => onChange(sources.filter((_, j) => j !== i))}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default ContextSources
