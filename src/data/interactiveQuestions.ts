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
      words within it to hide. */
  | { type: 'fill-blank'; text: string; blanks: DraftRow[]; distractors: DraftRow[] }
  | { type: 'match-pairs'; pairs: DraftRow[] }
  | { type: 'categorization'; categories: DraftRow[]; items: DraftRow[] }
  | { type: 'sequencing'; steps: DraftRow[] }

/* ── Fill-in-the-blank marking ─────────────────────────────────────────────
   The author writes the sentence as it reads, then lists the words to blank.
   Nothing is bracketed or escaped, so the string stays exactly the sentence the
   learner sees and the marks are a separate list — the author never has to learn
   a syntax, and the renderer still gets each literal's exact whitespace.

   Each listed word claims the first occurrence no earlier mark has taken, so
   listing "the" twice blanks the first two "the"s. A word listed more often than
   it occurs is reported rather than silently dropped. */

/** Matches FillBlank.tsx's own comparison, so authoring and grading agree. */
const norm = (s: string) => s.trim().toLowerCase()

const isWordChar = (c: string) => /[\p{L}\p{N}_]/u.test(c)

/** Whole-word, case-insensitive search from `from`. -1 when there is no match. */
function findWord(haystack: string, needle: string, from: number): number {
  const hay = haystack.toLowerCase()
  const word = needle.toLowerCase()
  for (let i = hay.indexOf(word, from); i !== -1; i = hay.indexOf(word, i + 1)) {
    const before = i > 0 ? hay[i - 1] : ''
    const after = hay[i + word.length] ?? ''
    if (!isWordChar(before) && !isWordChar(after)) return i
  }
  return -1
}

export interface MarkedSentence {
  segments: FillBlankSegment[]
  /** Listed words with no free occurrence left in the sentence. */
  missing: string[]
}

/** `('Always lock it.', ['lock'])` → `['Always ', { blank: 'lock' }, ' it.']` */
export function markBlanks(sentence: string, words: string[]): MarkedSentence {
  const taken: { start: number; end: number }[] = []
  const missing: string[] = []
  for (const raw of words) {
    const word = raw.trim()
    if (!word) continue
    let at = findWord(sentence, word, 0)
    while (at !== -1 && taken.some((t) => at < t.end && at + word.length > t.start)) {
      at = findWord(sentence, word, at + 1)
    }
    if (at === -1) missing.push(word)
    else taken.push({ start: at, end: at + word.length })
  }
  taken.sort((a, b) => a.start - b.start)

  const segments: FillBlankSegment[] = []
  let cursor = 0
  for (const { start, end } of taken) {
    const literal = sentence.slice(cursor, start)
    if (literal) segments.push(literal)
    // The sentence's own casing is the answer, not however the mark was typed.
    segments.push({ blank: sentence.slice(start, end) })
    cursor = end
  }
  const tail = sentence.slice(cursor)
  if (tail) segments.push(tail)
  return { segments, missing }
}

export const blanksOf = (segments: FillBlankSegment[]): string[] =>
  segments.filter((s): s is { blank: string } => typeof s !== 'string').map((s) => s.blank)

/* ── Draft ⇄ question ──────────────────────────────────────────────────── */

export function emptyDraft(type: InteractiveQuestionType): Draft {
  switch (type) {
    case 'fill-blank':
      return { type, text: '', blanks: [makeRow()], distractors: [makeRow(), makeRow()] }
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
      /* Re-marking picks each word's first free occurrence, so a question whose
         blank sat on a later repeat of the same word reopens with the earlier one
         marked instead. The preview shows what will be graded either way. */
      return {
        type: 'fill-blank',
        text: question.segments.map((s) => (typeof s === 'string' ? s : s.blank)).join(''),
        blanks: answers.length ? answers.map((a) => makeRow(a)) : [makeRow()],
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
      const { segments } = markBlanks(
        draft.text,
        draft.blanks.map((b) => b.a),
      )
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
}

export function draftErrors(draft: Draft): DraftError[] {
  const errors: DraftError[] = []
  const add = (field: DraftErrorField, message: string) => errors.push({ field, message })

  switch (draft.type) {
    case 'fill-blank': {
      const marks = draft.blanks.map((b) => b.a.trim()).filter(Boolean)
      const { segments, missing } = markBlanks(draft.text, marks)
      const answers = blanksOf(segments)
      if (!draft.text.trim()) add('sentence', 'Write the sentence learners will complete')
      if (marks.length === 0) add('blanks', 'Mark at least one word to blank')
      if (missing.length > 0) {
        const word = missing[0]
        const listedTwice = marks.filter((m) => norm(m) === norm(word)).length > 1
        add(
          'blanks',
          listedTwice
            ? `"${word}" doesn't appear in your sentence that many times`
            : `"${word}" isn't in your sentence`,
        )
      }

      const wrongWords = draft.distractors.map((d) => d.a.trim()).filter(Boolean)
      if (wrongWords.length === 0) add('wrong-words', 'Add at least one wrong word to the bank')
      /* Grading compares text, not position, so a wrong word that matches an
         answer is quietly a second right answer — the question can't be failed. */
      const alsoAnAnswer = wrongWords.find((w) => answers.some((a) => norm(a) === norm(w)))
      if (alsoAnAnswer)
        add('wrong-words', `"${alsoAnAnswer}" is one of your answers, so it can't be a wrong word`)
      break
    }
    case 'match-pairs': {
      const complete = draft.pairs.filter((p) => p.a.trim() && p.b.trim())
      if (complete.length < 3) add('pairs', 'Fill in both sides of at least 3 pairs')
      /* Index identity is the answer, so a repeated term makes two pairings
         equally right while the renderer marks one of them wrong. */
      const dupeTerm = firstDuplicate(complete.map((p) => p.a))
      if (dupeTerm) add('pairs', `Two terms are both "${dupeTerm}" — each needs one clear match`)
      const dupeMatch = firstDuplicate(complete.map((p) => p.b))
      if (dupeMatch) add('pairs', `Two matches are both "${dupeMatch}" — each needs one clear term`)
      break
    }
    case 'categorization': {
      const categories = draft.categories.filter((c) => c.a.trim())
      const items = draft.items.filter((i) => i.a.trim())
      const kept = new Set(categories.map((c) => c.id))
      if (categories.length < 2) add('categories', 'Name at least 2 categories')
      const dupeCategory = firstDuplicate(categories.map((c) => c.a))
      if (dupeCategory) add('categories', `Two categories are both "${dupeCategory}"`)

      if (items.length < 2) add('items', 'Add at least 2 concepts to sort')
      /* Concepts grade by position, so two identical labels are a coin flip for
         the learner however they place them — the trap match-pairs guards too. */
      const dupeItem = firstDuplicate(items.map((i) => i.a))
      if (dupeItem)
        add('items', `Two concepts are both "${dupeItem}" — learners can't tell them apart`)
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
      if (dupeStep) add('steps', `Two steps are both "${dupeStep}" — learners can't tell them apart`)
      break
    }
  }
  return errors
}

export const draftIsComplete = (draft: Draft) => draftErrors(draft).length === 0

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** Second line of the outline card, e.g. "Sequence · 5 steps". */
export function draftSummary(draft: Draft): string {
  switch (draft.type) {
    case 'fill-blank':
      return count(draft.blanks.filter((b) => b.a.trim()).length, 'blank')
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
  { label: string; title: string; description: string; callout: string }
> = {
  'fill-blank': {
    label: 'Fill in the Blanks',
    title: 'Fill in the Blanks',
    /* Tap-to-place, not drag — FillBlank.tsx places a word on tap. Saying
       "drag" here had authors designing for an interaction that doesn't exist. */
    description: 'Learners pick words from a bank to fill the gaps',
    callout:
      'Write the sentence in full, then list the words to blank out. Learners pick from a shared word bank, so add a few wrong words to make it count.',
  },
  'match-pairs': {
    label: 'Match the Pairs',
    title: 'Match the Pairs',
    description: 'Learners pair each term with its match',
    callout: 'Each row is one correct pair. Learners see the matches shuffled.',
  },
  categorization: {
    label: 'Categorise',
    title: 'Categorise',
    description: 'Learners sort concepts into the right categories',
    callout:
      'Name each category, then add the concepts that belong in it. Learners see all the concepts together, shuffled.',
  },
  sequencing: {
    label: 'Sequence',
    title: 'Sequence',
    description: 'Learners put the steps back in order',
    callout: 'Learners see these shuffled. The order you set here is the answer.',
  },
}
