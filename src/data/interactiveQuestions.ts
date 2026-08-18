/**
 * Interactive question model — shared by the learner renderers
 * (`src/pages/quiz-lab/formats/*`) and the course builder's authoring drawer.
 *
 * Correctness is **structural**: the shape is the answer key. Match-pairs grades
 * by index identity, sequencing by array order, categorisation by `categoryId`,
 * and fill-blank by the answer each gap carries. Nothing here has an id, points
 * or attempts — this is the renderer's contract, and the builder keys authored
 * payloads by the outline card's id instead.
 */

export type InteractiveQuestionType =
  | 'fill-blank'
  | 'match-pairs'
  | 'categorization'
  | 'sequencing'

export interface MatchPair {
  left: string
  right: string
}

export interface MatchPairsQuestion {
  type: 'match-pairs'
  /** Short instruction shown above the interaction. */
  prompt: string
  /** INDEX IDENTITY IS THE ANSWER: pairs[i].left belongs with pairs[i].right. */
  pairs: MatchPair[]
}

/** A sentence segment: a literal string, or a gap carrying its correct answer. */
export type FillBlankSegment = string | { blank: string }

export interface FillBlankQuestion {
  type: 'fill-blank'
  prompt: string
  /** Reading order. Literals carry their own leading/trailing spaces. */
  segments: FillBlankSegment[]
  /** Word-bank chips: one entry per gap (duplicates kept) plus distractors. */
  bank: string[]
}

export interface Category {
  id: string
  label: string
}

export interface CategorizationItem {
  label: string
  categoryId: string
}

export interface CategorizationQuestion {
  type: 'categorization'
  prompt: string
  categories: Category[]
  items: CategorizationItem[]
}

export interface SequencingQuestion {
  type: 'sequencing'
  prompt: string
  /** ARRAY ORDER IS THE ANSWER — the renderer shuffles a copy for the bank. */
  steps: string[]
}

export type InteractiveQuestion =
  | MatchPairsQuestion
  | FillBlankQuestion
  | CategorizationQuestion
  | SequencingQuestion

/* ── Authoring drafts ──────────────────────────────────────────────────────
   The persisted shapes carry no ids, but the editor needs a stable React key
   per row so reordering or removing one doesn't remount a neighbour's textarea
   mid-keystroke. Ids are minted per mount and stripped on save — the same trick
   SituationalTestDrawer uses for `stq-${n++}`.

   One row type serves every list. `a` is always the primary text; `b` is the
   right-hand term (match-pairs) or the owning category's row id (items). */

let rowSeq = 0

export interface DraftRow {
  id: string
  a: string
  b: string
}

export const makeRow = (a = '', b = '', id?: string): DraftRow => ({
  id: id ?? `iqr-${rowSeq++}`,
  a,
  b,
})

export type Draft =
  /** `text` is the sentence exactly as the learner reads it; `blanks` are the
      character ranges within it to hide. */
  | { type: 'fill-blank'; text: string; blanks: BlankRange[]; distractors: DraftRow[] }
  | { type: 'match-pairs'; pairs: DraftRow[] }
  | { type: 'categorization'; categories: DraftRow[]; items: DraftRow[] }
  | { type: 'sequencing'; steps: DraftRow[] }

/* ── Fill-in-the-blank marking ─────────────────────────────────────────────
   The author writes the sentence as it reads, then clicks the words to hide. A
   mark is the character range it occupies, not the word's text, so clicking the
   second "the" blanks *that* "the" — there is no occurrence rule to guess at and
   no word to retype. The sentence string stays exactly what the learner sees.

   Ranges are positions, so they have to survive edits to the sentence around
   them: `remapBlanks` shifts them past an edit that landed elsewhere. */

/** Matches FillBlank.tsx's own comparison, so authoring and grading agree. */
const norm = (s: string) => s.trim().toLowerCase()

const isWordChar = (c: string) => /[\p{L}\p{N}_]/u.test(c)

/** A gap: the half-open character range of the sentence the learner sees hidden. */
export interface BlankRange {
  start: number
  end: number
}

/** One run of the sentence. Words are clickable; the gaps between them are not. */
export interface SentenceToken {
  text: string
  start: number
  end: number
  isWord: boolean
}

/** Splits into alternating word / non-word runs, each carrying its offsets. */
export function tokenize(sentence: string): SentenceToken[] {
  const tokens: SentenceToken[] = []
  let i = 0
  while (i < sentence.length) {
    const isWord = isWordChar(sentence[i])
    let j = i + 1
    while (j < sentence.length && isWordChar(sentence[j]) === isWord) j++
    tokens.push({ text: sentence.slice(i, j), start: i, end: j, isWord })
    i = j
  }
  return tokens
}

/** `('Always lock it.', [{start:7,end:11}])` → `['Always ', { blank: 'lock' }, ' it.']` */
export function segmentsFrom(sentence: string, blanks: BlankRange[]): FillBlankSegment[] {
  const sorted = [...blanks].sort((a, b) => a.start - b.start)
  const segments: FillBlankSegment[] = []
  let cursor = 0
  for (const { start, end } of sorted) {
    // Defensive: a stale or overlapping range would otherwise slice backwards.
    if (start < cursor || start >= end || end > sentence.length) continue
    const literal = sentence.slice(cursor, start)
    if (literal) segments.push(literal)
    segments.push({ blank: sentence.slice(start, end) })
    cursor = end
  }
  const tail = sentence.slice(cursor)
  if (tail) segments.push(tail)
  return segments
}

/**
 * Moves marks to where their words ended up after the sentence was edited.
 *
 * Typing is one contiguous edit, so the changed span is whatever sits between
 * the common prefix and the common suffix. A mark before it holds still, a mark
 * after it shifts, a mark the edit happened *inside* grows or shrinks with it,
 * and a mark the edit straddles is dropped — its word no longer exists to hide.
 */
export function remapBlanks(
  blanks: BlankRange[],
  oldText: string,
  newText: string,
): BlankRange[] {
  if (oldText === newText) return blanks

  const max = Math.min(oldText.length, newText.length)
  let prefix = 0
  while (prefix < max && oldText[prefix] === newText[prefix]) prefix++
  let suffix = 0
  while (
    suffix < max - prefix &&
    oldText[oldText.length - 1 - suffix] === newText[newText.length - 1 - suffix]
  )
    suffix++

  const editEnd = oldText.length - suffix
  const delta = newText.length - oldText.length

  const out: BlankRange[] = []
  for (const b of blanks) {
    if (b.end <= prefix) out.push(b)
    else if (b.start >= editEnd) out.push({ start: b.start + delta, end: b.end + delta })
    else if (b.start <= prefix && editEnd <= b.end && b.end + delta > b.start)
      out.push({ start: b.start, end: b.end + delta })
  }
  return out
}

export const blanksOf = (segments: FillBlankSegment[]): string[] =>
  segments.filter((s): s is { blank: string } => typeof s !== 'string').map((s) => s.blank)

/* ── Draft ⇄ question ──────────────────────────────────────────────────── */

export function emptyDraft(type: InteractiveQuestionType): Draft {
  switch (type) {
    case 'fill-blank':
      return { type, text: '', blanks: [], distractors: [makeRow(), makeRow()] }
    case 'match-pairs':
      return { type, pairs: [makeRow(), makeRow(), makeRow()] }
    case 'categorization': {
      // Items are authored inside a category, so each starts with one to fill.
      const [first, second] = [makeRow(), makeRow()]
      return {
        type,
        categories: [first, second],
        items: [makeRow('', first.id), makeRow('', second.id)],
      }
    }
    case 'sequencing':
      return { type, steps: [makeRow(), makeRow(), makeRow()] }
  }
}

export function toDraft(question: InteractiveQuestion): Draft {
  switch (question.type) {
    case 'fill-blank': {
      const answers = blanksOf(question.segments)
      /* Multiset subtraction, not a set filter: `bank.filter(w => !answers.includes(w))`
         would eat *every* copy, so a question with the same answer in two gaps
         would reopen with no distractors and an unfillable second gap. */
      const pool = [...answers]
      const distractors = question.bank.filter((word) => {
        const i = pool.findIndex((a) => norm(a) === norm(word))
        if (i === -1) return true
        pool.splice(i, 1)
        return false
      })
      /* Offsets are read off the segments themselves, so a gap reopens on the
         exact words it was saved on — including a later repeat of a word, and
         including a gap that spans a phrase. */
      const blanks: BlankRange[] = []
      let at = 0
      for (const segment of question.segments) {
        const literal = typeof segment === 'string' ? segment : segment.blank
        if (typeof segment !== 'string') blanks.push({ start: at, end: at + literal.length })
        at += literal.length
      }
      return {
        type: 'fill-blank',
        text: question.segments.map((s) => (typeof s === 'string' ? s : s.blank)).join(''),
        blanks,
        distractors: distractors.length ? distractors.map((d) => makeRow(d)) : [makeRow()],
      }
    }
    case 'match-pairs':
      return { type: 'match-pairs', pairs: question.pairs.map((p) => makeRow(p.left, p.right)) }
    case 'categorization':
      return {
        type: 'categorization',
        // The row id IS the persisted category id, so items round-trip unremapped.
        categories: question.categories.map((c) => makeRow(c.label, '', c.id)),
        items: question.items.map((i) => makeRow(i.label, i.categoryId)),
      }
    case 'sequencing':
      return { type: 'sequencing', steps: question.steps.map((s) => makeRow(s)) }
  }
}

/** Normalises on the way out: blank rows dropped, values trimmed. */
export function toQuestion(draft: Draft, prompt: string): InteractiveQuestion {
  const shared = { prompt: prompt.trim() }
  switch (draft.type) {
    case 'fill-blank': {
      const segments = segmentsFrom(draft.text, draft.blanks)
      /* One bank entry per gap, duplicates deliberately preserved: FillBlank.tsx
         disables a placed chip by bank *index* but grades by text, so two gaps
         answered "lock" need two "lock" chips or the second can never be filled. */
      const answers = blanksOf(segments)
      const distractors = draft.distractors.map((r) => r.a.trim()).filter(Boolean)
      return { type: 'fill-blank', ...shared, segments, bank: [...answers, ...distractors] }
    }
    case 'match-pairs':
      return {
        type: 'match-pairs',
        ...shared,
        pairs: draft.pairs
          .filter((p) => p.a.trim() && p.b.trim())
          .map((p) => ({ left: p.a.trim(), right: p.b.trim() })),
      }
    case 'categorization': {
      const categories = draft.categories
        .filter((c) => c.a.trim())
        .map((c) => ({ id: c.id, label: c.a.trim() }))
      // Items pointing at a dropped category go too — a dangling categoryId
      // reaches the learner as an item that can never be graded.
      const kept = new Set(categories.map((c) => c.id))
      return {
        type: 'categorization',
        ...shared,
        categories,
        items: draft.items
          .filter((i) => i.a.trim() && kept.has(i.b))
          .map((i) => ({ label: i.a.trim(), categoryId: i.b })),
      }
    }
    case 'sequencing':
      return {
        type: 'sequencing',
        ...shared,
        steps: draft.steps.map((s) => s.a.trim()).filter(Boolean),
      }
  }
}

/* ── Validation ────────────────────────────────────────────────────────────
   Returns author-facing messages, shown after blur and used to explain a
   disabled Save. The prompt rule lives in the drawer shell, which owns that
   field for every type. */

/** Returns the first value that repeats, so a message can name it. */
const firstDuplicate = (values: string[]): string | null => {
  const seen = new Set<string>()
  for (const v of values) {
    const key = norm(v)
    if (seen.has(key)) return v
    seen.add(key)
  }
  return null
}

/** Which part of the form an error belongs to, so it renders beside its cause. */
export type DraftErrorField =
  | 'sentence'
  | 'blanks'
  | 'wrong-words'
  | 'pairs'
  | 'categories'
  | 'items'
  | 'steps'

export interface DraftError {
  field: DraftErrorField
  message: string
  /**
   * 'incomplete' — a part of the question hasn't been written yet. Silent in the
   * form: on an untouched draft every one of these fires at once, and each just
   * restates the label or placeholder it sits under.
   *
   * 'conflict' — what's written can't grade. Two identical steps, a wrong word
   * that is also an answer: the author can't see the problem by reading their
   * own form, and it can only exist once they've typed, so it's always shown.
   */
  kind: 'incomplete' | 'conflict'
}

export function draftErrors(draft: Draft): DraftError[] {
  const errors: DraftError[] = []
  const add = (field: DraftErrorField, message: string, kind: DraftError['kind'] = 'incomplete') =>
    errors.push({ field, message, kind })

  switch (draft.type) {
    case 'fill-blank': {
      const answers = blanksOf(segmentsFrom(draft.text, draft.blanks))
      if (!draft.text.trim()) add('sentence', 'Write the sentence users will complete')
      /* A mark is a range the author clicked, so it is always a real word in the
         sentence — "that word isn't in your sentence" can no longer happen. */
      if (draft.blanks.length === 0) add('blanks', 'Click a word in your sentence to blank it')

      const wrongWords = draft.distractors.map((d) => d.a.trim()).filter(Boolean)
      if (wrongWords.length === 0) add('wrong-words', 'Add at least one wrong word to the bank')
      /* Grading compares text, not position, so a wrong word that matches an
         answer is quietly a second right answer — the question can't be failed. */
      const alsoAnAnswer = wrongWords.find((w) => answers.some((a) => norm(a) === norm(w)))
      if (alsoAnAnswer)
        add(
          'wrong-words',
          `"${alsoAnAnswer}" is one of your answers, so it can't be a wrong word`,
          'conflict',
        )
      break
    }
    case 'match-pairs': {
      const complete = draft.pairs.filter((p) => p.a.trim() && p.b.trim())
      if (complete.length < 3) add('pairs', 'Fill in both sides of at least 3 pairs')
      /* Index identity is the answer, so a repeated term makes two pairings
         equally right while the renderer marks one of them wrong. */
      const dupeTerm = firstDuplicate(complete.map((p) => p.a))
      if (dupeTerm)
        add('pairs', `Two terms are both "${dupeTerm}" — each needs one clear match`, 'conflict')
      const dupeMatch = firstDuplicate(complete.map((p) => p.b))
      if (dupeMatch)
        add('pairs', `Two matches are both "${dupeMatch}" — each needs one clear term`, 'conflict')
      break
    }
    case 'categorization': {
      const categories = draft.categories.filter((c) => c.a.trim())
      const items = draft.items.filter((i) => i.a.trim())
      const kept = new Set(categories.map((c) => c.id))
      if (categories.length < 2) add('categories', 'Name at least 2 categories')
      const dupeCategory = firstDuplicate(categories.map((c) => c.a))
      if (dupeCategory)
        add('categories', `Two categories are both "${dupeCategory}"`, 'conflict')

      if (items.length < 2) add('items', 'Add at least 2 concepts to sort')
      /* Concepts grade by position, so two identical labels are a coin flip for
         the learner however they place them — the trap match-pairs guards too. */
      const dupeItem = firstDuplicate(items.map((i) => i.a))
      if (dupeItem)
        add('items', `Two concepts are both "${dupeItem}" — users can't tell them apart`, 'conflict')
      if (items.some((i) => !kept.has(i.b))) add('items', 'Give every concept a category')
      break
    }
    case 'sequencing': {
      const steps = draft.steps.filter((s) => s.a.trim())
      // Two steps is a coin flip, not a question.
      if (steps.length < 3) add('steps', 'Add at least 3 steps')
      /* Order is the answer and steps grade by position, so identical steps
         can't be placed correctly by reading them. */
      const dupeStep = firstDuplicate(steps.map((s) => s.a))
      if (dupeStep)
        add('steps', `Two steps are both "${dupeStep}" — users can't tell them apart`, 'conflict')
      break
    }
  }
  return errors
}

/** The errors the authoring form says out loud — see the DraftError doc above. */
export const draftConflicts = (draft: Draft): DraftError[] =>
  draftErrors(draft).filter((e) => e.kind === 'conflict')

export const draftIsComplete = (draft: Draft) => draftErrors(draft).length === 0

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** Second line of the outline card, e.g. "Sequence · 5 steps". */
export function draftSummary(draft: Draft): string {
  switch (draft.type) {
    case 'fill-blank':
      return count(draft.blanks.length, 'blank')
    case 'match-pairs':
      return count(draft.pairs.filter((p) => p.a.trim() && p.b.trim()).length, 'pair')
    case 'categorization':
      return `${count(draft.items.filter((i) => i.a.trim()).length, 'concept')} · ${count(
        draft.categories.filter((c) => c.a.trim()).length,
        'category',
        'categories',
      )}`
    case 'sequencing':
      return count(draft.steps.filter((s) => s.a.trim()).length, 'step')
  }
}

export const TYPE_CONFIG: Record<
  InteractiveQuestionType,
  {
    label: string
    title: string
    description: string
    callout: string
    /** Placeholder for the prompt field. "Write your question here" left authors
     *  writing a question with an answer, which none of these formats can take —
     *  each one's prompt is the instruction the learner reads, so the placeholder
     *  is an example of that instruction. */
    promptPlaceholder: string
  }
> = {
  'fill-blank': {
    label: 'Fill in the Blanks',
    title: 'Fill in the Blanks',
    /* Tap-to-place, not drag — FillBlank.tsx places a word on tap. Saying
       "drag" here had authors designing for an interaction that doesn't exist. */
    description: 'Users pick words from a bank to fill the gaps',
    callout:
      'Write the sentence in full, then click the words to blank out. Users pick from a shared word bank, so add a few wrong words to make it count.',
    promptPlaceholder: 'Fill in the missing words',
  },
  'match-pairs': {
    label: 'Match the Pairs',
    title: 'Match the Pairs',
    description: 'Users pair each term with its match',
    callout:
      'Each row is one correct pair. Fill in both sides of at least 3 pairs. Users see the matches shuffled.',
    promptPlaceholder: 'Match each term with its definition',
  },
  categorization: {
    label: 'Categorise',
    title: 'Categorise',
    description: 'Users place concepts into the right categories',
    callout:
      'Name each category, then add the concepts that belong in it. Users see all the concepts together, shuffled.',
    promptPlaceholder: 'Place each concept into the right category',
  },
  sequencing: {
    label: 'Sequence',
    title: 'Sequence',
    description: 'Users put the steps back in order',
    callout: 'Users see these shuffled. The order you set here is the answer.',
    promptPlaceholder: 'Put the steps in the right order',
  },
}
