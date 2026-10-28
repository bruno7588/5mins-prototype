import Badge from '@/components/Badge/Badge'
import { band, type ChartQuestion } from '../chartLabData'
import { BlankSentence, ImageTiles, InsightNote, OpenResponse, OptionBars } from './Charts'

/**
 * One question, one card. The header is the same for every type: the question on
 * the left, one big figure on the right. Scored types lead with % correct in their
 * score band; poll and open response lead with how many answered instead.
 */
function ChartCard({ q }: { q: ChartQuestion }) {
  const scored = q.kind !== 'poll' && q.kind !== 'open'

  const hero = scored
    ? { figure: `${q.score}%`, caption: `${q.scoreLabel} · ${q.responses} answers`, tone: band(q.score) }
    : q.kind === 'poll'
      ? { figure: `${q.responses}`, caption: 'votes', tone: 'neutral' }
      : {
          figure: `${q.responses}`,
          caption: `answers · ${Math.round((q.responses / q.enrolled) * 100)}% responded`,
          tone: 'neutral',
        }

  return (
    <article className="cl-card" id={`cl-${q.id}`} aria-labelledby={`cl-${q.id}-title`}>
      <header className="cl-card__head">
        <div className="cl-card__question">
          <div className="cl-card__meta">
            <span className="cl-card__number">Q{q.number}</span>
            <Badge type="informative" label={q.type} />
          </div>
          <h3 className="cl-card__title" id={`cl-${q.id}-title`}>
            {q.title}
          </h3>
        </div>
        <div className="cl-hero">
          <span className={`cl-hero__figure is-${hero.tone}`}>{hero.figure}</span>
          <span className="cl-hero__caption">{hero.caption}</span>
        </div>
      </header>

      {q.kind === 'options' || q.kind === 'poll' ? (
        <OptionBars rows={q.rows} />
      ) : q.kind === 'images' ? (
        <ImageTiles tiles={q.tiles} />
      ) : q.kind === 'blanks' ? (
        <BlankSentence parts={q.parts} />
      ) : (
        <OpenResponse q={q} />
      )}

      {q.insight && <InsightNote insight={q.insight} />}
    </article>
  )
}

export default ChartCard
