/**
 * Fields here wrap instead of truncating — a step or a match can run long and the
 * admin has to be able to read all of one. Use `autoGrowRef` as the ref and
 * `autoGrow` as the onInput handler: the ref sizes content arriving from state (a
 * reopened question), the handler sizes it as the admin types.
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

/**
 * The ref form. A height measured at one width is wrong at another — a field that
 * mounted narrow keeps the three lines it needed then, and sits two-thirds empty once
 * the layout gives it room. The observer re-measures whenever the width moves, so the
 * box always hugs the text it is actually showing.
 *
 * React 19 runs the returned cleanup when the element goes, so the observer goes with
 * it. Not for onInput — that would attach one per keystroke.
 */
export const autoGrowRef = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  autoGrow(el)
  let width = el.clientWidth
  const observer = new ResizeObserver(() => {
    if (el.clientWidth === width) return
    width = el.clientWidth
    autoGrow(el)
  })
  observer.observe(el)
  return () => observer.disconnect()
}
