/**
 * Fields here wrap instead of truncating — a step or a match can run long and the
 * admin has to be able to read all of one. Pass as both a ref callback and an
 * onInput handler: the ref sizes content arriving from state (a reopened
 * question), the handler sizes it as the admin types.
 *
 * Same helper as SituationalTestDrawer; shared here because four bodies use it.
 */
export const autoGrow = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  el.style.height = 'auto'
  /* scrollHeight covers content + padding but not the border, while a border-box
     height has to include it — without this the bordered fields sit 2px short
     and clip. */
  const border = el.offsetHeight - el.clientHeight
  el.style.height = `${el.scrollHeight + border}px`
}
