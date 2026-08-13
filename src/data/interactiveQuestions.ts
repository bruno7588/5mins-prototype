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
  | { type: 'fill-blank'; text: string; distractors: DraftRow[] }
  | { type: 'match-pairs'; pairs: DraftRow[] }
  | { type: 'categorization'; categories: DraftRow[]; items: DraftRow[] }
  | { type: 'sequencing'; steps: DraftRow[] }

/* ── Fill-in-the-blank sentence syntax ─────────────────────────────────────
   The editor's source of truth is one string with gaps marked `{{answer}}`,
   not a segment array: the renderer needs each literal's exact whitespace, and
   a segmented editor would make the author manage those spaces by hand.
   Braces rather than square brackets because compliance copy genuinely uses
   `[...]` for placeholders and citations. */

const BLANK_RE = /\{\{([^}]*)\}\}/g

/** Matches FillBlank.tsx's own comparison, so authoring and grading agree. */
const norm = (s: string) => s.trim().toLowerCase()

/** `'Always {{lock}} it.'` → `['Always ', { blank: 'lock' }, ' it.']` */
export function parseSentence(text: string): FillBlankSegment[] {
  const segments: FillBlankSegment[] = []
  let cursor = 0
  for (const match of text.matchAll(BLANK_RE)) {
    const at = match.index ?? 0
    const literal = text.slice(cursor, at)
    // Guard against emitting an empty-string segment when two gaps touch.
    if (literal) segments.push(literal)
    segments.push({ blank: match[1].trim() })
    cursor = at + match[0].length
  }
  const tail = text.slice(cursor)
  if (tail) segments.push(tail)
  return segments
}

/** Inverse of parseSentence, for reopening a saved question. */
export const serialiseSentence = (segments: FillBlankSegment[]): string =>
  segments.map((s) => (typeof s === 'string' ? s : `{{${s.blank}}}`)).join('')

export const blanksOf = (segments: FillBlankSegment[]): string[] =>
  segments.filter((s): s is { blank: string } => typeof s !== 'string').map((s) => s.blank)

/** True when a `{{` was opened and never closed — the regex leaves it as text. */
export const hasUnclosedBlank = (text: string) => text.replace(BLANK_RE, '').includes('{{')

/* ── Draft ⇄ question ──────────────────────────────────────────────────── */

export function emptyDraft(type: InteractiveQuestionType): Draft {
  switch (type) {
    case 'fill-blank':
      return { type, text: '', distractors: [makeRow(), makeRow()] }
    case 'match-pairs':
      return { type, pairs: [makeRow(), makeRow(), makeRow()] }
    case 'categorization':
      return {
        type,
        categories: [makeRow(), makeRow()],
        items: [makeRow(), makeRow()],
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
      return {
        type: 'fill-blank',
        text: serialiseSentence(question.segments),
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
      const segments = parseSentence(draft.text)
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

const duplicates = (values: string[]) => {
  const seen = new Set<string>()
  return values.some((v) => {
    const key = norm(v)
    if (seen.has(key)) return true
    seen.add(key)
    return false
  })
}

export function draftErrors(draft: Draft): string[] {
  const errors: string[] = []
  switch (draft.type) {
    case 'fill-blank': {
      const segments = parseSentence(draft.text)
      const answers = blanksOf(segments)
      if (!draft.text.trim()) errors.push('Write the sentence learners will complete')
      else if (answers.length === 0) errors.push('Mark at least one answer as a blank')
      if (answers.some((a) => !a)) errors.push('One of your blanks has no answer in it')
      if (hasUnclosedBlank(draft.text)) errors.push("One of your blanks isn't closed")
      if (!draft.distractors.some((d) => d.a.trim()))
        errors.push('Add at least one wrong word to the bank')
      break
    }
    case 'match-pairs': {
      const complete = draft.pairs.filter((p) => p.a.trim() && p.b.trim())
      if (complete.length < 3) errors.push('Add at least 3 complete pairs')
      /* Index identity is the answer, so a repeated term makes two pairings
         equally right while the renderer marks one of them wrong. */
      if (duplicates(complete.map((p) => p.a))) errors.push('Two terms are the same')
      if (duplicates(complete.map((p) => p.b))) errors.push('Two matches are the same')
      break
    }
    case 'categorization': {
      const categories = draft.categories.filter((c) => c.a.trim())
      const items = draft.items.filter((i) => i.a.trim())
      const kept = new Set(categories.map((c) => c.id))
      if (categories.length < 2) errors.push('Name at least 2 categories')
      if (duplicates(categories.map((c) => c.a))) errors.push('Two categories have the same name')
      if (items.length < 2) errors.push('Add at least 2 items to sort')
      if (items.some((i) => !kept.has(i.b))) errors.push('Give every item a category')
      break
    }
    case 'sequencing': {
      // Two steps is a coin flip, not a question.
      if (draft.steps.filter((s) => s.a.trim()).length < 3)
        errors.push('Add at least 3 steps')
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
      return count(blanksOf(parseSentence(draft.text)).length, 'blank')
    case 'match-pairs':
      return count(draft.pairs.filter((p) => p.a.trim() && p.b.trim()).length, 'pair')
    case 'categorization':
      return `${count(draft.items.filter((i) => i.a.trim()).length, 'item')} · ${count(
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
    description: 'Learners drag words from a bank into the gaps',
    callout:
      'Write the sentence, then mark the answers as blanks. Learners pick from a shared word bank, so add a few wrong words to make it count.',
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
    description: 'Learners sort items into the right categories',
    callout: 'Name the categories first, then add the items and say where each one belongs.',
  },
  sequencing: {
    label: 'Sequence',
    title: 'Sequence',
    description: 'Learners put the steps back in order',
    callout: 'Learners see these shuffled. The order you set here is the answer.',
  },
}
