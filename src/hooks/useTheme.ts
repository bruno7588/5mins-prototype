import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = '5mins-theme'
const listeners = new Set<() => void>()

/* The <html data-theme> attribute is the single source of truth; index.html
   applies the stored value before first paint so there is no light flash. */
function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setTheme(theme: Theme) {
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark'
  else delete document.documentElement.dataset.theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage unavailable (private mode) — theme still applies for the session */
  }
  listeners.forEach((l) => l())
}

/** Light-by-default theme with a persisted manual toggle (colors.md §6). */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme)
  const toggle = useCallback(() => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'), [])
  return { theme, isDark: theme === 'dark', toggle }
}
