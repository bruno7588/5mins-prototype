import { type CSSProperties, type ReactNode } from "react";
import { CloseCircle, Gallery, TickCircle } from "iconsax-react";
import Badge from "@/components/Badge/Badge";
import {
  type ChartQuestion,
  type CorrectAnswer,
  type OptionRow,
} from "../chartLabData";

/**
 * The bar every chart is made of: a tall track with the share filled from the
 * left, and the content (label on the left, % at the end) inside it. The correct
 * answer is the only colour (Success-500); everything else is tertiary grey.
 */
export function BarRow({
  pct,
  correct = false,
  incorrect = false,
  value,
  className = "",
  children,
}: {
  pct: number;
  correct?: boolean;
  /** A wrong option: Danger-500 fill on a Danger tint, as the correct one is Success. */
  incorrect?: boolean;
  value: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`cl-barrow${correct ? " is-correct" : ""}${incorrect ? " is-incorrect" : ""} ${className}`}>
      <span
        className="cl-barrow__fill"
        style={{ "--cl-w": `${pct}%` } as CSSProperties}
        aria-hidden="true"
      />
      <span className="cl-barrow__content">{children}</span>
      {/* The share on a Badge: solid Success for the correct answer, Border grey otherwise. */}
      <span className="cl-barrow__value">
        <Badge label={value} className={`cl-pct ${correct ? "cl-pct--correct" : "cl-pct--wrong"}`} />
      </span>
    </span>
  );
}

/** The green bar says it on screen; these words say it to a screen reader. */
function Correct() {
  return <span className="cl-sr"> (correct answer)</span>;
}

/* ── One bar per option ───────────────────────────────────────────────── */
export function OptionBars({ rows }: { rows: OptionRow[] }) {
  return (
    <ol className="cl-rows">
      {rows.map((r) => (
        <li key={r.label}>
          <BarRow
            pct={r.pct}
            correct={r.tone === "correct"}
            incorrect={r.tone === "wrong"}
            value={`${r.pct}%`}
          >
            {/* Green alone reads as "most picked", so each option also carries a tick or a cross. */}
            {r.tone === "correct" && (
              <TickCircle size={20} color="currentColor" variant="Linear" className="cl-row__icon" aria-hidden="true" />
            )}
            {r.tone === "wrong" && (
              <CloseCircle size={20} color="currentColor" variant="Linear" className="cl-row__icon" aria-hidden="true" />
            )}
            <span className="cl-row__label">
              {r.label}
              {r.tone === "correct" && <Correct />}
            </span>
          </BarRow>
        </li>
      ))}
    </ol>
  );
}

/* ── Image choice ─────────────────────────────────────────────────────────
   The uploaded images sit where the placeholders are, each with its bar under it. */
export function ImageTiles({
  tiles,
}: {
  tiles: Extract<ChartQuestion, { kind: "images" }>["tiles"];
}) {
  return (
    <ol className="cl-tiles">
      {tiles.map((t) => (
        <li
          key={t.label}
          className={`cl-tile${t.correct ? " is-correct" : ""}`}
        >
          <span className="cl-tile__image" aria-hidden="true">
            {t.src ? (
              <img src={t.src} alt="" />
            ) : (
              <Gallery size={20} color="currentColor" />
            )}
          </span>
          <BarRow pct={t.pct} correct={t.correct} value={`${t.pct}%`}>
            <span className="cl-row__label">
              {t.label}
              {t.correct && <Correct />}
            </span>
          </BarRow>
        </li>
      ))}
    </ol>
  );
}

/* ── All or nothing ───────────────────────────────────────────────────────
   Match the pairs, categorise and sequence are scored as a whole: the learner's answer is correct or incorrect. So the chart is that split,
   then the correct answer, shown once and without figures. */
/** The share who answered correctly and incorrectly. */
export function CorrectSplit({ score }: { score: number }) {
  return (
    <ol className="cl-rows">
      <li>
        <BarRow pct={score} correct value={`${score}%`}>
          <TickCircle size={20} color="currentColor" variant="Linear" className="cl-row__icon" aria-hidden="true" />
          <span className="cl-row__label">Correct</span>
        </BarRow>
      </li>
      <li>
        <BarRow pct={100 - score} incorrect value={`${100 - score}%`}>
          <CloseCircle size={20} color="currentColor" variant="Linear" className="cl-row__icon" aria-hidden="true" />
          <span className="cl-row__label">Incorrect</span>
        </BarRow>
      </li>
    </ol>
  );
}

export function OutcomeBars({
  score,
  answer,
}: {
  score: number;
  answer: CorrectAnswer;
}) {
  return (
    <div className="cl-outcome">
      <CorrectSplit score={score} />
      <section className="cl-answer" aria-label="Correct answer">
        {answer.kind === "matches" ? (
          <ul className="cl-answer__list cl-answer__list--pairs">
            {answer.pairs.map(([term, match]) => (
              <li key={term} className="cl-match">
                <TickCircle size={20} color="var(--success-500)" variant="Bold" aria-hidden="true" />
                <span className="cl-match__text">
                  <span className="cl-match__term">{term}</span>
                  <span className="cl-match__def">{match}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : answer.kind === "groups" ? (
          <div className="cl-groups">
            {answer.groups.map((g) => (
              <div key={g.label} className="cl-group">
                <h4 className="cl-group__label">{g.label}</h4>
                <ul className="cl-group__items">
                  {g.items.map((item) => (
                    <li key={item} className="cl-group__chip">
                      <TickCircle size={20} color="var(--success-500)" variant="Bold" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ol className="cl-answer__list">
            {answer.steps.map((step, n) => (
              <li key={step} className="cl-answer__item">
                <Badge type="success" label={n + 1} className="cl-step-badge" />
                <span className="cl-answer__step">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

/* ── Fill in the blanks ───────────────────────────────────────────────────
   The correct / incorrect split, and beside it the sentence: each blank a pill
   holding its answer, with the share who filled it in correctly in a Success-500
   count at the end. */
export function BlankSentence({
  score,
  parts,
}: {
  score: number;
  parts: Extract<ChartQuestion, { kind: "blanks" }>["parts"];
}) {
  return (
    <div className="cl-outcome">
      <CorrectSplit score={score} />
      <section className="cl-answer" aria-label="Correct answer">
        {/* One tick for the whole sentence, as each match pair carries one. */}
        <div className="cl-sentence-card">
          <TickCircle size={20} color="var(--success-500)" variant="Bold" aria-hidden="true" />
          <p className="cl-sentence">
            {parts.map((p, i) =>
              typeof p === "string" ? (
                <span key={i}>{p}</span>
              ) : (
                /* 6px either side of the blank, none before punctuation that follows it. */
                <span
                  key={i}
                  className={`cl-blank${/^[,.;:!?]/.test(String(parts[i + 1] ?? "")) ? " cl-blank--tight" : ""}`}
                >
                  <span className="cl-blank__answer">{p.answer}</span>
                </span>
              ),
            )}
          </p>
        </div>
      </section>
    </div>
  );
}

/* ── Open response ────────────────────────────────────────────────────────
   Nothing to mark: the share of enrolled learners who wrote an answer, and the
   share who did not. */
export function OpenResponse({
  q,
}: {
  q: Extract<ChartQuestion, { kind: "open" }>;
}) {
  const missing = q.enrolled - q.responses;
  const rows = [
    { label: "Answered", count: q.responses },
    { label: "Not answered", count: missing },
  ];
  return (
    <ol className="cl-rows">
      {rows.map((r) => {
        const pct = Math.round((r.count / q.enrolled) * 100);
        return (
          <li key={r.label}>
            <BarRow pct={pct} value={`${pct}%`}>
              <span className="cl-row__label">{r.label}</span>
            </BarRow>
          </li>
        );
      })}
    </ol>
  );
}
