import { type CSSProperties, type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowSwapHorizontal,
  Car,
  InfoCircle,
  LogoutCurve,
  TickCircle,
  Warning2,
} from 'iconsax-react'
import Badge from '@/components/Badge/Badge'
import { band, type ChartQuestion, type Insight, type OptionRow } from '../chartLabData'

/** Fill width and stagger index, read by the grow-in animation in chart-lab.css. */
const fill = (pct: number, i: number) => ({ '--cl-w': `${pct}%`, '--cl-i': i }) as CSSProperties

/* ── One bar per option ───────────────────────────────────────────────────
   Label and figure on one line, the bar under it. The correct answer is the only
   teal; a flagged row (the misconception, the weakest item) is the only red. */
export function OptionBars({ rows }: { rows: OptionRow[] }) {
  const paired = rows.some((r) => r.from)
  return (
    <ol className="cl-bars">
      {rows.map((r, i) => (
        <li key={`${r.from ?? ''}${r.label}`} className={`cl-bar is-${r.tone}`}>
          <div className="cl-bar__line">
            {paired ? (
              <>
                <span className="cl-bar__from">{r.from}</span>
                <ArrowRight size={16} color="currentColor" className="cl-bar__arrow" aria-hidden="true" />
              </>
            ) : (
              <span className="cl-bar__marker" aria-hidden="true">
                {r.tone === 'correct' && !/^\d$/.test(r.marker ?? '') ? (
                  <TickCircle size={20} variant="Bold" color="currentColor" />
                ) : (
                  r.marker
                )}
              </span>
            )}
            <span className="cl-bar__label">
              {r.label}
              {r.tone === 'correct' && <span className="cl-sr"> (correct answer)</span>}
            </span>
            {r.tag && <Badge type="error" label={r.tag} />}
            <span className="cl-bar__value">{r.pct}%</span>
          </div>
          <span className="cl-track">
            <span className="cl-fill" style={fill(r.pct, i)} />
          </span>
        </li>
      ))}
    </ol>
  )
}

/* ── Image choice ─────────────────────────────────────────────────────────
   Placeholder artwork stands in for the uploaded images. It stays neutral so
   it never borrows the colours that mean right and wrong. */
const TILE_ICONS: Record<string, ReactNode> = {
  'wet-floor': <Warning2 size={32} variant="Bold" color="currentColor" />,
  exit: <LogoutCurve size={32} color="currentColor" />,
  'no-parking': <Car size={32} color="currentColor" />,
  notice: <InfoCircle size={32} color="currentColor" />,
}

export function ImageTiles({ tiles }: { tiles: Extract<ChartQuestion, { kind: 'images' }>['tiles'] }) {
  return (
    <ol className="cl-tiles">
      {tiles.map((t, i) => (
        <li key={t.label} className={`cl-tile${t.correct ? ' is-correct' : ''}`}>
          <span className="cl-tile__image" aria-hidden="true">
            {TILE_ICONS[t.icon]}
            {t.correct && (
              <span className="cl-tile__check">
                <TickCircle size={24} variant="Bold" color="currentColor" />
              </span>
            )}
          </span>
          <span className="cl-tile__line">
            <span className="cl-tile__label">
              {t.label}
              {t.correct && <span className="cl-sr"> (correct answer)</span>}
            </span>
            <span className="cl-tile__value">{t.pct}%</span>
          </span>
          <span className="cl-track is-thin">
            <span className="cl-fill" style={fill(t.pct, i)} />
          </span>
        </li>
      ))}
    </ol>
  )
}

/* ── Fill in the blanks ───────────────────────────────────────────────────
   The sentence is the chart: each blank carries its own answer and how many
   filled it in correctly, tinted by score band. */
export function BlankSentence({ parts }: { parts: Extract<ChartQuestion, { kind: 'blanks' }>['parts'] }) {
  return (
    <p className="cl-sentence">
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <span key={i}>{p}</span>
        ) : (
          <span key={i} className={`cl-blank is-${band(p.pct)}`}>
            <span className="cl-blank__answer">{p.answer}</span>
            <span className="cl-blank__value">{p.pct}%</span>
          </span>
        ),
      )}
    </p>
  )
}

/* ── Open response ────────────────────────────────────────────────────────
   Nothing to mark right or wrong: the recurring themes as bars, the most
   common one in the "no right answer" yellow, then a few real answers. */
export function OpenResponse({ q }: { q: Extract<ChartQuestion, { kind: 'open' }> }) {
  return (
    <>
      <div className="cl-group">
        <h4 className="cl-eyebrow">Recurring themes</h4>
        <ol className="cl-themes">
          {q.themes.map((t, i) => (
            <li key={t.label} className={`cl-theme${i === 0 ? ' is-lead' : ''}`}>
              <span className="cl-theme__label">{t.label}</span>
              <span className="cl-track">
                <span className="cl-fill" style={fill(t.pct, i)} />
              </span>
              <span className="cl-theme__value">{t.pct}%</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="cl-group cl-group--ruled">
        <div className="cl-group__head">
          <h4 className="cl-eyebrow">Latest answers</h4>
          <button type="button" className="cl-link">
            View all
          </button>
        </div>
        <ul className="cl-quotes">
          {q.answers.map((a) => (
            <li key={a.name} className="cl-quote">
              <span className="cl-quote__text">“{a.text}”</span>
              <span className="cl-quote__name">{a.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export function InsightNote({ insight }: { insight: Insight }) {
  const Icon = insight.icon === 'swap' ? ArrowSwapHorizontal : InfoCircle
  return (
    <p className="cl-insight">
      <Icon size={16} color="currentColor" aria-hidden="true" />
      <span>
        <strong>{insight.lead}</strong> {insight.text}
      </span>
    </p>
  )
}
