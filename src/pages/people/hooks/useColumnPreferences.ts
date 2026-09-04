import { useState, useEffect, useCallback } from 'react'

/* ─── Types ─── */

export interface ColumnDef {
  key: string
  label: string
  locked: boolean       // true = always visible, can't toggle
  isCustomField: boolean
}

interface ColumnPreferences {
  visibleKeys: string[]
  version: number
}

interface UserField {
  id: number
  name: string
  options: string[]
  required: boolean
}

/* ─── Default columns for All People table ─── */

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'role', label: 'Role', locked: true, isCustomField: false },
  { key: 'team', label: 'Team', locked: true, isCustomField: false },
  { key: 'reportsTo', label: 'Reports to', locked: true, isCustomField: false },
  { key: 'region', label: 'Region', locked: false, isCustomField: false },
  { key: 'status', label: 'Status', locked: true, isCustomField: false },
]

const DEFAULT_VISIBLE_KEYS = DEFAULT_COLUMNS.filter(c => c.locked).map(c => c.key)

const PREFS_VERSION = 3

const STORAGE_KEY = '5mins-people-columns'

/* ─── Hook ─── */

export function useColumnPreferences(customFields: UserField[]) {
  const allColumns: ColumnDef[] = [
    ...DEFAULT_COLUMNS,
    ...customFields.map(f => ({
      key: `custom-${f.id}`,
      label: f.name,
      locked: false,
      isCustomField: true,
    })),
  ]

  const [visibleKeys, setVisibleKeys] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const prefs: ColumnPreferences = JSON.parse(raw)
        // Stale-version prefs (e.g. region was locked) fall back to defaults
        if (prefs.version === PREFS_VERSION) {
          // Reconcile: keep only keys that still exist, and force locked
          // columns visible even if saved prefs predate them
          const validKeys = new Set(allColumns.map(c => c.key))
          const lockedKeys = allColumns.filter(c => c.locked).map(c => c.key)
          const merged = new Set([...prefs.visibleKeys.filter(k => validKeys.has(k)), ...lockedKeys])
          const allKeys = allColumns.map(c => c.key)
          return [...merged].sort((a, b) => allKeys.indexOf(a) - allKeys.indexOf(b))
        }
      }
    } catch { /* ignore */ }
    return DEFAULT_VISIBLE_KEYS
  })

  // Persist to localStorage on change
  useEffect(() => {
    const prefs: ColumnPreferences = { visibleKeys, version: PREFS_VERSION }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [visibleKeys])

  // Reconcile when custom fields change (new fields added, old ones removed)
  useEffect(() => {
    const validKeys = new Set(allColumns.map(c => c.key))
    setVisibleKeys(prev => {
      const filtered = prev.filter(k => validKeys.has(k))
      // If nothing changed, don't trigger re-render
      if (filtered.length === prev.length) return prev
      return filtered
    })
  }, [customFields.length])

  const toggleColumn = useCallback((key: string) => {
    setVisibleKeys(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key)
      }
      // Insert in the order defined by allColumns
      const allKeys = allColumns.map(c => c.key)
      const next = [...prev, key]
      next.sort((a, b) => allKeys.indexOf(a) - allKeys.indexOf(b))
      return next
    })
  }, [allColumns])

  const resetToDefault = useCallback(() => {
    setVisibleKeys(DEFAULT_VISIBLE_KEYS)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { visibleKeys, toggleColumn, resetToDefault, allColumns }
}
