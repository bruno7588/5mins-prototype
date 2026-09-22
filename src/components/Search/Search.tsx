import { useRef } from 'react'
import { SearchNormal1, Add } from 'iconsax-react'
import './Search.css'

export type SearchSize = 'M' | 'L'

interface SearchProps {
  size?: SearchSize
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onClear?: () => void
  onFocus?: () => void
  onBlur?: () => void
  className?: string
  ariaLabel?: string
}

function Search({
  size = 'M',
  value,
  placeholder = 'Search',
  onChange,
  onClear,
  onFocus,
  onBlur,
  className = '',
  ariaLabel,
}: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const filled = value.length > 0
  const iconSize = size === 'L' ? 20 : 18
  const clearSize = size === 'L' ? 24 : 20

  function handleClear() {
    if (onClear) {
      onClear()
    } else {
      onChange('')
    }
    inputRef.current?.focus()
  }

  return (
    <div
      className={`search search--${size.toLowerCase()} ${className}`.trim()}
      onClick={() => inputRef.current?.focus()}
    >
      <SearchNormal1
        size={iconSize}
        variant="Outline"
        color="var(--text-tertiary)"
        className="search__icon"
      />
      <input
        ref={inputRef}
        type="text"
        className="search__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={ariaLabel ?? placeholder}
      />
      {filled && (
        <button
          type="button"
          className="search__clear"
          onClick={(e) => {
            e.stopPropagation()
            handleClear()
          }}
          aria-label="Clear search"
        >
          <Add
            size={clearSize}
            color="var(--text-secondary)"
            variant="Linear"
            style={{ transform: 'rotate(45deg)' }}
          />
        </button>
      )}
    </div>
  )
}

export default Search
