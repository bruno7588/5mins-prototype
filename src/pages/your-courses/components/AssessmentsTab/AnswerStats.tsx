import { type ComponentProps } from 'react'
import { BlankSentence, ImageTiles, OpenResponse, OptionBars, OutcomeBars } from '@/pages/chart-lab/components/Charts'
import MultiChart from '@/pages/chart-lab/components/MultiChart'
import type { OptionRow } from '@/pages/chart-lab/chartLabData'
import '@/pages/chart-lab/chart-lab.css'
import {
  optionTally,
  questionOptionTally,
  type AssessmentResult,
  type MultiAssessment,
} from './assessmentResults'
import './AnswerStats.css'

/** Whole percents, so nothing claims a precision the sample cannot carry. */
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0)

/**
 * "4 of 4 pairs correct" — the count leads at full strength and the phrase it is
 * counted in steps back, so a column of these reads as figures rather than sentences.
 * One string, two weights of information: the same split the stats caption makes.
 */
export function BandLabel({ label }: { label: string }) {
  const i = label.indexOf(' ')
  if (i < 0) return <span className="ast-band__figure">{label}</span>
  return (
    <>
      <span className="ast-band__figure">{label.slice(0, i)}</span>
      <span className="ast-band__rest">{label.slice(i)}</span>
    </>
  )
}

/** One bar per option: the right answer green, every other option grey. */
function rows(options: string[], tally: number[], responded: number, isRight: (i: number) => boolean): OptionRow[] {
  return options.map((label, i) => ({
    label,
    pct: pct(tally[i], responded),
    tone: isRight(i) ? 'correct' : 'wrong',
  }))
}

/* A fill-in-the-blanks: the sentence with each blank's answer and the share who got it,
   beside the correct / incorrect split. Scoring is all or nothing, so a learner is
   correct only with every blank right. The title carries the sentence after its
   instruction ("Complete the sentence: …"), with ___ where each blank goes. */
function Blanks({ a, responded }: { a: MultiAssessment; responded: number }) {
  const sentence = a.title.slice(a.title.indexOf(': ') + 2)
  const pieces = sentence.split('___')
  const parts: ComponentProps<typeof BlankSentence>['parts'] = []
  pieces.forEach((piece, i) => {
    if (piece.trim()) parts.push(piece.trim())
    const q = a.questions[i]
    if (q) {
      parts.push({
        answer: q.options[q.correctIndex],
        pct: pct(questionOptionTally(a, i)[q.correctIndex], responded),
      })
    }
  })
  const allRight = a.responses.filter((r) => r.picks.every((p, qi) => p === a.questions[qi].correctIndex)).length
  return <BlankSentence score={pct(allRight, responded)} parts={parts} />
}

/**
 * The chart at the top of the answers page: the same charts as the Chart Lab, one per
 * format. A lesson quiz or situational test is a deck of its questions; a single
 * question is its option bars; match, sequence and categorise are the correct /
 * incorrect split with the right arrangement under it; short text and exercise are the
 * share of enrolled learners who answered.
 */
function AnswerStats({ assessment: a }: { assessment: AssessmentResult }) {
  if (a.responses.length === 0) return null

  const responded = a.responses.length

  const chart = (() => {
    if (a.kind === 'text' || a.kind === 'file') {
      return (
        <OpenResponse
          q={{ id: a.id, kind: 'open', type: a.type, title: a.title, responses: responded, enrolled: a.enrolled }}
        />
      )
    }

    if (a.kind === 'poll') {
      const tally = optionTally(a)
      return (
        <OptionBars
          rows={a.options
            .map((label, i) => ({ label, pct: pct(tally[i], responded), tone: 'plain' as const }))
            .sort((x, y) => y.pct - x.pct)}
        />
      )
    }

    if (a.kind === 'multi') {
      if (a.type === 'fill-blank') return <Blanks a={a} responded={responded} />
      return (
        <MultiChart
          a={{
            id: a.id,
            type: a.lesson ? 'Lesson quiz' : 'Situational test',
            title: a.title,
            responses: responded,
            questions: a.questions.map((q, qi) => ({
              id: `${a.id}-${qi}`,
              title: q.prompt,
              rows: rows(q.options, questionOptionTally(a, qi), responded, (i) => i === q.correctIndex),
            })),
          }}
        />
      )
    }

    const right = a.responses.filter((r) => r.correct).length
    if (a.answer) return <OutcomeBars score={pct(right, responded)} answer={a.answer} />

    const tally = optionTally(a)
    const isRight = (i: number) => (a.correctIndices ? a.correctIndices.includes(i) : i === a.correctIndex)
    if (a.optionImages) {
      return (
        <ImageTiles
          tiles={a.optionImages.map((src, i) => ({
            src,
            label: a.options[i] || `Image ${i + 1}`,
            pct: pct(tally[i], responded),
            correct: isRight(i),
          }))}
        />
      )
    }
    return <OptionBars rows={rows(a.options, tally, responded, isRight)} />
  })()

  return (
    <section className="ast" aria-label="Overview">
      {chart}
    </section>
  )
}

export default AnswerStats
