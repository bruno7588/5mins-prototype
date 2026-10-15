/* Where Gradient Studio's shared photos and gradients live: api/gradient-lab.ts
   on the deployed site. Localhost uses the deployed API too, so everyone works
   on one library (same approach as the prototype comments). */

const ORIGIN = import.meta.env.DEV ? 'https://5mins-prototype.vercel.app' : ''

export const GL_API = `${ORIGIN}/api/gradient-lab`

/** Turns a path the API returns (e.g. an image) into a URL this page can load. */
export const glUrl = (path: string) => (path.startsWith('/') ? `${ORIGIN}${path}` : path)

/** A shared photo by id. Photos never change under an id, so the URL is cacheable. */
export const flowerImageUrl = (id: string) => `${GL_API}?r=image&kind=flower&id=${encodeURIComponent(id)}&v=1`

export async function glJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
  return body as T
}
