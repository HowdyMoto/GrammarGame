import type { ErrorType, Mode, Paragraph } from '../types';
import { ERROR_LABELS, ERROR_ORDER } from '../types';
import { countErrorsByType, totalErrors } from '../data/paragraphs';

interface Props {
  mode: Mode;
  paragraph: Paragraph;
  foundWords: ReadonlySet<number>;
  foundGaps: ReadonlySet<number>;
}

export function HUD({ mode, paragraph, foundWords, foundGaps }: Props) {
  const total = totalErrors(paragraph);
  const byType = countErrorsByType(paragraph);
  const foundByType: Record<ErrorType, number> = {
    spelling: 0,
    punctuation: 0,
    capitalization: 0,
    grammar: 0,
  };
  for (const i of foundWords) {
    const t = paragraph.tokens[i];
    if (t?.error) foundByType[t.error.type]++;
  }
  for (const i of foundGaps) {
    const t = paragraph.tokens[i];
    if (t?.gapError) foundByType[t.gapError.type]++;
  }
  const foundCount = foundWords.size + foundGaps.size;

  if (mode === 'master') {
    return (
      <div className="hud hud--master">
        <div className="hud-master-found">
          <span className="hud-master-num">{foundCount}</span>
          <span className="hud-master-label">found</span>
        </div>
        <div className="hud-hint">No hints in Master.</div>
      </div>
    );
  }

  if (mode === 'hard') {
    return (
      <div className="hud hud--hard">
        <ProgressRing value={foundCount} max={total} />
        <div className="hud-hard-text">
          <div className="hud-hard-num">
            <span className="found">{foundCount}</span>
            <span className="sep">/</span>
            <span className="total">{total}</span>
          </div>
          <div className="hud-hard-label">errors found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hud hud--easy">
      {ERROR_ORDER.filter((t) => byType[t] > 0).map((type) => (
        <div key={type} className={`hud-pill hud-pill--${type}`}>
          <span className="hud-pill-dot" />
          <span className="hud-pill-label">{ERROR_LABELS[type]}</span>
          <span className="hud-pill-count">
            <strong>{foundByType[type]}</strong>
            <span className="hud-pill-sep">/</span>
            <span>{byType[type]}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = max === 0 ? 0 : value / max;
  const dash = c * pct;
  return (
    <svg className="ring" viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
      <circle className="ring-bg" cx="28" cy="28" r={r} />
      <circle
        className="ring-fg"
        cx="28"
        cy="28"
        r={r}
        strokeDasharray={`${dash} ${c}`}
      />
    </svg>
  );
}
