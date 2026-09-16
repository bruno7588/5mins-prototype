/* Prototype analytics sink. Events log to the console with their properties;
   the real app forwards them to Mixpanel. Event names are snake_case nouns. */
export function track(event: string, props: Record<string, string | number | boolean | null> = {}) {
  console.debug('[analytics]', event, props)
}
