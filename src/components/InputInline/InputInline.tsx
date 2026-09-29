import { useId, useLayoutEffect, useRef, type Ref } from 'react'
import './InputInline.css'

interface InputInlineProps {
  /** L: Bold 32 title over Regular 16 description (page headlines). M: Bold 20 over
      Regular 14 (drawers, modals, cards). */
  size?: 'L' | 'M'
  title: string
  onTitleChange: (value: string) => void
  titlePlaceholder?: string
  /** Names the field for assistive tech; there is no visible label by design. */
  titleAriaLabel: string
  onTitleBlur?: () => void
  titleRef?: Ref<HTMLInputElement>
  /** For a dialog that takes its name from the title (`aria-labelledby`). */
  titleId?: string
  /** Pass `onDescriptionChange` to show the optional description line. */
  description?: string
  onDescriptionChange?: (value: string) => void
  descriptionPlaceholder?: string
  descriptionAriaLabel?: string
  /** Error message; turns the title --text-error and shows the message under it. */
  error?: string
  className?: string
}

/* Grows the description with its text: it wraps rather than scrolls. */
const fit = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

/* Input inline - input.md, Figma 10330:4736. A borderless title (and optional
   description) edited in place: the type scale is the affordance, so there is no box,
   no hover and no focus ring; Active is the caret alone. */
function InputInline({
  size = 'L', title, onTitleChange, titlePlaceholder = 'Add Title', titleAriaLabel,
  onTitleBlur, titleRef, titleId, description = '', onDescriptionChange,
  descriptionPlaceholder = 'Add a description', descriptionAriaLabel, error, className,
}: InputInlineProps) {
  const errorId = useId()
  const descRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    fit(descRef.current)
  }, [description])

  const classes = ['input-inline', `input-inline--${size.toLowerCase()}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <input
        ref={titleRef}
        id={titleId}
        className={`input-inline__title${error ? ' input-inline__title--error' : ''}`}
        value={title}
        placeholder={titlePlaceholder}
        onChange={(e) => onTitleChange(e.target.value)}
        onBlur={onTitleBlur}
        aria-label={titleAriaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {/* Between the title and the description, as in Figma: the message belongs
          to the title it explains. */}
      {error && (
        <span className="input-inline__error" id={errorId} role="alert">
          {error}
        </span>
      )}
      {onDescriptionChange && (
        <textarea
          ref={descRef}
          className="input-inline__desc"
          rows={1}
          value={description}
          placeholder={descriptionPlaceholder}
          onInput={(e) => fit(e.currentTarget)}
          onChange={(e) => onDescriptionChange(e.target.value)}
          aria-label={descriptionAriaLabel}
        />
      )}
    </div>
  )
}

export default InputInline
