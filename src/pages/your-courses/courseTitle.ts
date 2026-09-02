/* The course this prototype is about. It travels between pages in router state — the
   list passes it to the course, the course to an assessment's answers — and this is what
   each of them falls back to when someone arrives by pasting a URL, where there is no
   state to read. Its own module so the answers page can read it without importing the
   course page to get at it. */
export const COURSE_TITLE = 'Building Company Culture A Guide for HR Teams'
