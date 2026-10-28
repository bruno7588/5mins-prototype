import { type ChartQuestion } from '../chartLabData'
import { BlankSentence, ImageTiles, OpenResponse, OptionBars, OutcomeBars } from './Charts'

/**
 * One question's chart, as it sits on its own View Answers page under the question.
 * No headline figure: the bars carry the numbers. The answer count sits under the page title.
 */
function ChartCard({ q }: { q: ChartQuestion }) {
  return (
    <div className="cl-chart">

      {q.kind === 'options' || q.kind === 'poll' ? (
        <OptionBars rows={q.rows} />
      ) : q.kind === 'images' ? (
        <ImageTiles tiles={q.tiles} />
      ) : q.kind === 'blanks' ? (
        <BlankSentence score={q.score} parts={q.parts} />
      ) : q.kind === 'outcome' ? (
        <OutcomeBars score={q.score} answer={q.answer} />
      ) : (
        <OpenResponse q={q} />
      )}

    </div>
  )
}

export default ChartCard
