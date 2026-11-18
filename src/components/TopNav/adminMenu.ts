import { useSyncExternalStore } from 'react'

/* Whether the admin side menu is open as a slide-in panel. Only used below 768px, where
   the small Admin top nav's hamburger opens it (Library 5385:21862); on wider screens the
   side menu sits in the page and this stays false. */
let open = false
const listeners = new Set<() => void>()

export function setAdminMenuOpen(next: boolean) {
  if (next === open) return
  open = next
  listeners.forEach((l) => l())
}

export function useAdminMenuOpen() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => open,
  )
}
