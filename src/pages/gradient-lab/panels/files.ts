/** A file-name-safe slug, or the fallback when nothing is left. */
export function slug(name: string, fallback: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return s || fallback
}

/** Saves a blob through a temporary download link. */
export function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
