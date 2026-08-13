/* The 6-dot grip, matching FlashcardEditor and the course outline. Copied rather
   than extracted into a shared component: pulling the other three call sites onto
   one would mean editing three working files for no behaviour change. */
const DragHandleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="5" cy="3" r="1.25" fill="currentColor" />
    <circle cx="11" cy="3" r="1.25" fill="currentColor" />
    <circle cx="5" cy="8" r="1.25" fill="currentColor" />
    <circle cx="11" cy="8" r="1.25" fill="currentColor" />
    <circle cx="5" cy="13" r="1.25" fill="currentColor" />
    <circle cx="11" cy="13" r="1.25" fill="currentColor" />
  </svg>
)

export default DragHandleIcon
