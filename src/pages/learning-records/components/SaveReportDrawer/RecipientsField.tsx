import { useEffect, useMemo, useRef, useState } from 'react'
import { searchOrgUsers, orgUserByEmail } from '../../../../utils/orgUsers'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = (v: string) => EMAIL_RE.test(v.trim())

interface RecipientsFieldProps {
  /** Recipient emails already added (rendered as chips). */
  recipients: string[]
  onChange: (recipients: string[]) => void
  /** Form-level error (e.g. "add at least one recipient"), shown beneath. */
  error?: string
  /**
   * Notifies the parent of a valid email typed but not yet committed to a chip
   * (null when the input is empty/invalid). Lets the parent treat a pending
   * email as a recipient for enabling actions / committing on submit.
   */
  onPendingEmailChange?: (email: string | null) => void
}

const MAX_SUGGESTIONS = 6

/**
 * Token/chip recipient input. Type to autocomplete from registered users, or
 * type any email and press Enter/comma to add it. Backspace on an empty input
 * removes the last chip.
 */
function RecipientsField({ recipients, onChange, error, onPendingEmailChange }: RecipientsFieldProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [invalid, setInvalid] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(
    () => searchOrgUsers(query, recipients).slice(0, MAX_SUGGESTIONS),
    [query, recipients],
  )

  // Offer an "Add external email" row when the query is a valid email that's
  // neither a known org user nor already added.
  const trimmed = query.trim()
  const showAdd = useMemo(() => {
    if (!isValidEmail(trimmed)) return false
    const e = trimmed.toLowerCase()
    if (recipients.some((r) => r.toLowerCase() === e)) return false
    return !suggestions.some((s) => s.email.toLowerCase() === e)
  }, [trimmed, recipients, suggestions])

  // The add row, when shown, sits just after the people suggestions.
  const optionCount = suggestions.length + (showAdd ? 1 : 0)
  const addIndex = suggestions.length

  // A valid email typed but not yet committed to a chip — bubbled up so the
  // parent can enable actions and commit it on submit.
  const pendingEmail =
    isValidEmail(trimmed) && !recipients.some((r) => r.toLowerCase() === trimmed.toLowerCase())
      ? trimmed.toLowerCase()
      : null

  useEffect(() => {
    onPendingEmailChange?.(pendingEmail)
  }, [pendingEmail, onPendingEmailChange])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function addEmail(email: string) {
    const e = email.trim().toLowerCase()
    if (!isValidEmail(e)) {
      setInvalid(true)
      return
    }
    if (!recipients.some((r) => r.toLowerCase() === e)) onChange([...recipients, e])
    setQuery('')
    setInvalid(false)
    setOpen(false)
  }

  function removeAt(i: number) {
    onChange(recipients.filter((_, idx) => idx !== i))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && (trimmed || suggestions[activeIndex])) {
      e.preventDefault()
      if (open && activeIndex < suggestions.length && suggestions[activeIndex]) {
        addEmail(suggestions[activeIndex].email)
      } else {
        addEmail(query)
      }
      return
    }
    if (e.key === 'Backspace' && !query && recipients.length) {
      removeAt(recipients.length - 1)
      return
    }
    if (e.key === 'ArrowDown' && optionCount) {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => Math.min(i + 1, optionCount - 1))
      return
    }
    if (e.key === 'ArrowUp' && optionCount) {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Escape') setOpen(false)
  }

  const showError = error || (invalid ? 'Enter a valid email address.' : undefined)

  return (
    <div className="rcp-field" ref={wrapRef}>
      <div
        className={`rcp${showError ? ' rcp--error' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {recipients.map((email, i) => {
          const user = orgUserByEmail(email)
          return (
          <span className="rcp-chip" key={email}>
            {user && <span className="rcp-avatar" aria-hidden="true">{user.initials}</span>}
            <span className="rcp-chip-label" title={email}>{user ? user.name : email}</span>
            <button
              type="button"
              className="rcp-chip-remove"
              aria-label={`Remove ${user ? user.name : email}`}
              onClick={(ev) => {
                ev.stopPropagation()
                removeAt(i)
              }}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M14 6L6 14M6 6L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </span>
          )
        })}
        <input
          ref={inputRef}
          type="text"
          className="rcp-input"
          placeholder={recipients.length ? '' : 'Search people or type a name or email'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setInvalid(false)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && optionCount > 0 && (
        <ul className="rcp-menu" role="listbox">
          {suggestions.map((u, i) => (
            <li key={u.email}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                className={`rcp-option${i === activeIndex ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => addEmail(u.email)}
              >
                <span className="rcp-avatar" aria-hidden="true">{u.initials}</span>
                <span className="rcp-option-text">
                  <span className="rcp-option-name">{u.name}</span>
                  <span className="rcp-option-email">{u.email}</span>
                </span>
              </button>
            </li>
          ))}

          {showAdd && (
            <li key="__add">
              <button
                type="button"
                role="option"
                aria-selected={addIndex === activeIndex}
                className={`rcp-option${addIndex === activeIndex ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(addIndex)}
                onClick={() => addEmail(trimmed)}
              >
                <span className="rcp-avatar rcp-avatar--email" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5.5h14v9H3v-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="m3.5 6 6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="rcp-option-text">
                  <span className="rcp-option-name rcp-option-add">Add “{trimmed}”</span>
                  <span className="rcp-option-email">External email address</span>
                </span>
              </button>
            </li>
          )}
        </ul>
      )}

      {showError && <span className="rcp-helper">{showError}</span>}
    </div>
  )
}

export default RecipientsField
