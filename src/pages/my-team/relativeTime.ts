// Relative-time helpers for reminder "last sent" copy.

export function daysSince(iso: string): number {
  const then = new Date(iso).getTime()
  const now = Date.now()
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}

export function formatRelative(iso: string): string {
  const days = daysSince(iso)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (days < 30) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

// Compact variant, e.g. "today", "3d ago", "1w ago", "2mo ago".
export function formatRelativeShort(iso: string): string {
  const days = daysSince(iso)
  if (days <= 0) return 'today'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}
