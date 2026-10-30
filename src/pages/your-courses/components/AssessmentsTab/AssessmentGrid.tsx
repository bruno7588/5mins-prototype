import { useMemo, type ReactNode } from 'react'
import { Chart, Danger, People, TaskSquare, TickCircle } from 'iconsax-react'
import { typeLabel } from '@/data/aiAssessmentGeneration'
import {
  assessmentTypeFromLabel,
  getAssessmentIllustration,
} from '@/assets/assessment-illustrations'
import { CorrectSplit, OpenResponse, OptionBars } from '@/pages/chart-lab/components/Charts'
import '@/pages/chart-lab/chart-lab.css'
import Badge from '@/components/Badge/Badge'
import ProgressCell from './ProgressCell'
import '@/pages/my-team/MyTeam.css'
import {
  PASS_SCORE,
  correctPct,
  formatName,
  optionTally,
  type AssessmentResult,
  type GradedAssessment,
  type PollAssessment,
} from './assessmentResults'
import './AssessmentGrid.css'

/* Answers tab V2: the course's assessments as a bento grid. Summary stat cards on top,
   then one tile per assessment, its layout picked by what the format has to show:
   - choice, image choice and poll: the answers page's option bars, two columns wide;
   - lesson quiz: a score ring, two rows tall;
   - match, sequence, categorise: the answers page's correct / incorrect split;
   - fill in the blanks, situational test: V1's segmented result bar;
   - short text, exercise: the answers page's answered / not answered bars.
   Every tile opens the answers page, where the full charts live. A proposed pattern:
   the DS has no stat-card doc yet. Prefix `asg-`. */

interface Stats {
  total: number
  responders: number
  enrolled: number
  average: number | null
}

interface Props {
  rows: AssessmentResult[]
  stats: Stats
  onView: (a: AssessmentResult) => void
}

type Layout = 'choice' | 'ring' | 'split' | 'bar' | 'count'

/** How many of the lowest scores carry the red glow. */
const LOW_COUNT = 3

const BANDED = new Set(['match-pairs', 'sequencing', 'categorization'])

function layoutOf(a: AssessmentResult): Layout {
  if (a.kind === 'poll') return 'choice'
  if (a.kind === 'text' || a.kind === 'file') return 'count'
  if (a.kind === 'multi') return a.lesson ? 'ring' : 'bar'
  return BANDED.has(a.type) ? 'split' : 'choice'
}

/**
 * Orders the tiles so the 4-column bento packs without holes: each two-row block is a
 * tall ring tile, two wide choice tiles and two single tiles; once the choice tiles run
 * out, a block is two rings with four singles between them.
 */
function arrange(rows: AssessmentResult[]): AssessmentResult[] {
  const rings = rows.filter((a) => layoutOf(a) === 'ring')
  const choices = rows.filter((a) => layoutOf(a) === 'choice')
  const singles = rows.filter((a) => !['ring', 'choice'].includes(layoutOf(a)))
  const out: AssessmentResult[] = []
  const take = (q: AssessmentResult[], n: number) => out.push(...q.splice(0, n))
  while (rings.length && choices.length >= 2) {
    take(rings, 1); take(choices, 1); take(singles, 1); take(choices, 1); take(singles, 1)
  }
  while (rings.length) {
    take(rings, 1); take(singles, 2); take(rings, 1); take(singles, 2)
  }
  out.push(...choices, ...singles)
  return out
}

const share = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0)

/** The single-line summary stat My Team and the user profile use (mt-stat-card). */
function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="mt-stat-card">
      <span className="mt-stat-icon">{icon}</span>
      <span className="mt-stat-value">{value}</span>
      <span className="mt-stat-label">{label}</span>
    </div>
  )
}

/** The format's own illustration and name, as the learner met it. */
function Head({ a }: { a: AssessmentResult }) {
  const art = a.lesson ? 'lesson-quiz' : assessmentTypeFromLabel(typeLabel(a.type))
  return (
    <span className="asg-head">
      {art && (
        <img className="asg-illu" src={getAssessmentIllustration(art, 'desktop')} alt="" width={32} height={32} />
      )}
      <span className="asg-label">{formatName(a)}</span>
    </span>
  )
}

/** The answers page's own chart: option bars with tick and cross, image tiles for an
    image question, plain bars for a poll. */
function ChoiceBody({ a }: { a: GradedAssessment | PollAssessment }) {
  const tally = optionTally(a)
  const n = a.responses.length
  if (a.kind === 'poll') {
    return (
      <OptionBars
        rows={a.options
          .map((label, i) => ({ label, pct: share(tally[i], n), tone: 'plain' as const }))
          .sort((x, y) => y.pct - x.pct)}
      />
    )
  }
  const isRight = (i: number) => (a.correctIndices ? a.correctIndices.includes(i) : i === a.correctIndex)
  if (a.optionImages) {
    return (
      /* Only the correct images: the thumbnail alone, no frame, the share on the answers
         page's badge in its top-right corner. The full set is on the answers page. */
      <ul className="asg-images">
        {a.optionImages
          .map((src, i) => ({ src, i, label: a.options[i]?.trim() || `Image ${i + 1}`, pct: share(tally[i], n) }))
          .filter((t) => isRight(t.i))
          .map((t) => (
            <li key={t.i} className="asg-image">
              <img src={t.src} alt="" />
              <Badge label={`${t.pct}%`} className="cl-pct cl-pct--correct asg-image__pct" />
              <span className="cl-sr">{t.label}, correct answer</span>
            </li>
          ))}
      </ul>
    )
  }
  /* Only the correct answers and the share who picked each, no bars: the full spread
     is on the answers page. */
  return (
    <ul className="asg-correct">
      {a.options
        .map((label, i) => ({ label, i, pct: share(tally[i], n) }))
        .filter((o) => isRight(o.i))
        .map((o) => (
          <li key={o.i} className="asg-correct__row">
            <TickCircle size={20} color="currentColor" variant="Linear" className="asg-correct__icon" aria-hidden="true" />
            <span className="asg-correct__label">
              {o.label}
              <span className="cl-sr"> (correct answer)</span>
            </span>
            <Badge label={`${o.pct}%`} className="cl-pct cl-pct--correct asg-correct__pct" />
          </li>
        ))}
    </ul>
  )
}

/** A score ring with the figure in its centre. */
function Ring({ pct }: { pct: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <span className="asg-ring">
      <svg viewBox="0 0 128 128" width={128} height={128} aria-hidden="true">
        <circle className="asg-ring__track" cx="64" cy="64" r={r} />
        <circle
          className="asg-ring__value"
          cx="64"
          cy="64"
          r={r}
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <span className="asg-ring__figure">{pct}%</span>
    </span>
  )
}

function Tile({ a }: { a: AssessmentResult }) {
  const layout = layoutOf(a)
  const pct = correctPct(a)
  const answered = a.responses.length

  if (answered === 0) {
    return (
      <>
        <Head a={a} />
        <span className="asg-title">{a.title}</span>
        <span className="asg-foot">
          <span className="asg-label">Nothing submitted yet</span>
        </span>
      </>
    )
  }

  if (layout === 'ring' && pct !== null) {
    return (
      <>
        <Head a={a} />
        <span className="asg-title">{a.title}</span>
        <Ring pct={pct} />
        <span className="asg-foot">
          <span className="asg-label">Average score</span>
          <span className="asg-label asg-answered">{answered} answered</span>
        </span>
      </>
    )
  }

  if (layout === 'choice' && (a.kind === 'graded' || a.kind === 'poll')) {
    return (
      <>
        <Head a={a} />
        <span className="asg-title">{a.title}</span>
        <span className="asg-chart">
          <ChoiceBody a={a} />
        </span>
        <span className="asg-foot">
          <span className="asg-label asg-answered">{answered} answered</span>
        </span>
      </>
    )
  }

  if (layout === 'split' && pct !== null) {
    return (
      <>
        <Head a={a} />
        <span className="asg-title">{a.title}</span>
        <span className="asg-chart">
          <CorrectSplit score={pct} />
        </span>
      </>
    )
  }

  if (layout === 'count') {
    return (
      <>
        <Head a={a} />
        <span className="asg-title">{a.title}</span>
        <span className="asg-chart">
          <OpenResponse
            q={{ id: a.id, kind: 'open', type: a.type, title: a.title, responses: answered, enrolled: a.enrolled }}
          />
        </span>
      </>
    )
  }

  /* bar: V1's segmented result bar. */
  return (
    <>
      <Head a={a} />
      <span className="asg-title">{a.title}</span>
      <span className="asg-foot asg-foot--stack">
        <span className="asg-row">
          <span className="asg-figure">{pct}%</span>
          <span className="asg-label asg-answered">{answered} answered</span>
        </span>
        <ProgressCell value={pct ?? 0} showPct={false} className="asg-progress" />
      </span>
    </>
  )
}

function AssessmentGrid({ rows, stats, onView }: Props) {
  const scored = useMemo(
    () => rows.map((a) => correctPct(a)).filter((n): n is number => n !== null),
    [rows],
  )
  const below = scored.filter((n) => n < PASS_SCORE).length
  /* The three weakest scores get a red glow, so the eye lands on them first. */
  const weakest = useMemo(() => {
    const ranked = rows
      .map((a) => ({ id: a.id, pct: correctPct(a) }))
      .filter((x): x is { id: string; pct: number } => x.pct !== null && x.pct < PASS_SCORE)
      .sort((x, y) => x.pct - y.pct)
    return new Set(ranked.slice(0, LOW_COUNT).map((x) => x.id))
  }, [rows])

  /* One tint per tile: the lowest scores first, then the open formats, then lesson quizzes
     in their own illustration's colours. */
  const tint = (a: AssessmentResult) => {
    if (weakest.has(a.id)) return ' asg-tile--low'
    if (correctPct(a) === null) return ' asg-tile--open'
    if (a.lesson) return ' asg-tile--quiz'
    return ''
  }

  return (
    <div className="asg">
      <div className="asg-stats">
        <StatCard
          icon={<Chart size={24} color="var(--primary-600)" variant="Linear" />}
          label="Average score"
          value={stats.average === null ? '—' : `${stats.average}%`}
        />
        <StatCard
          icon={<Danger size={24} color="var(--warning-600)" variant="Linear" />}
          label="Below pass"
          value={`${below} of ${scored.length}`}
        />
        <StatCard
          icon={<People size={24} color="var(--text-primary)" variant="Linear" />}
          label="Answered"
          value={`${stats.responders} of ${stats.enrolled}`}
        />
        <StatCard
          icon={<TaskSquare size={24} color="var(--text-primary)" variant="Linear" />}
          label="Assessments"
          value={String(stats.total)}
        />
      </div>

      <ul className="asg-bento">
        {arrange(rows).map((a) => (
          <li key={a.id} className={`asg-cell asg-cell--${layoutOf(a)}`}>
            <div
              role="button"
              tabIndex={0}
              className={`asg-tile${tint(a)}`}
              onClick={() => onView(a)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onView(a)
                }
              }}
            >
              <Tile a={a} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AssessmentGrid
