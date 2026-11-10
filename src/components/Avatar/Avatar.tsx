import type { ReactNode } from 'react'
import './Avatar.css'

export type AvatarSize = 24 | 32 | 40 | 48 | 56 | 64 | 72

interface AvatarProps {
  /** Photo URL. Without one, the person's initials render instead. */
  src?: string
  /** The person's full name; the fallback initials are taken from it. */
  name?: string
  /** Explicit initials, when only those are known (e.g. calendar attendees). */
  initials?: string
  /** Diameter in px (avatars.md). 32 for table rows, 40 for prominent rows,
      48 to 72 for profiles. */
  size?: AvatarSize
  /** Leave empty when the person's name is already written beside the avatar. */
  alt?: string
  /** `circle` for people (learners, admins, managers); `square` (8px radius)
      for companies and instructors (avatars.md). */
  shape?: 'circle' | 'square'
  className?: string
  /** Laid over the photo, e.g. a live version of it. */
  children?: ReactNode
}

/** First letter of the first and last name, uppercase: "Bruno Marques" -> "BM". */
export function initialsFrom(name?: string): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (words[0][0] + last).toUpperCase()
}

/* Avatar - avatars.md. A photo, or the person's initials when there is none
   (Library 5097:5884, Picture=false): --text-secondary letters on a --border
   circle, so both flip with the mode. Circular for people, square for
   companies and instructors; no border on its own (the ring is AvatarGroup's). */
function Avatar({ src, name, initials, size = 32, alt = '', shape = 'circle', className, children }: AvatarProps) {
  const classes = ['ds-avatar', `ds-avatar--${size}`, shape === 'square' && 'ds-avatar--square', className].filter(Boolean).join(' ')
  return (
    <span className={classes}>
      {src ? (
        <img className="ds-avatar__img" src={src} alt={alt} />
      ) : (
        <span className="ds-avatar__initials" aria-hidden="true">{initials ?? initialsFrom(name)}</span>
      )}
      {children}
    </span>
  )
}

export default Avatar
