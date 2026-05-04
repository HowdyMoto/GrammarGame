import { useCallback, useEffect, useRef, useState } from 'react';
import '@fontsource/crimson-pro/400.css';
import '@fontsource/crimson-pro/500.css';
import '@fontsource/crimson-pro/600-italic.css';
import '@fontsource/crimson-pro/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import '@fontsource/special-elite/400.css';

import type { Mode, Paragraph } from './types';
import { MODE_INFO } from './types';
import { PARAGRAPHS, totalErrors } from './data/paragraphs';
import { shuffle } from './lib/shuffle';
import { sounds } from './lib/sounds';
import {
  ParagraphView,
  type FlashTarget,
} from './components/ParagraphView';
import { HUD } from './components/HUD';
import { PopLayer, type PopItem } from './components/Pop';

type Screen = 'welcome' | 'playing' | 'summary';

interface ParaResult {
  id: string;
  title: string;
  correct: number;
  wrong: number;
  total: number;
  revealed: boolean;
}

const PARA_PER_RUN = 6;
const POINTS_CORRECT = 10;
const POINTS_WRONG = -3;

export function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [mode, setMode] = useState<Mode>('easy');
  const [queue, setQueue] = useState<Paragraph[]>([]);
  const [index, setIndex] = useState(0);

  const [foundWords, setFoundWords] = useState<Set<number>>(() => new Set());
  const [foundGaps, setFoundGaps] = useState<Set<number>>(() => new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [flash, setFlash] = useState<FlashTarget>(null);
  const [revealed, setRevealed] = useState(false);
  const [paraComplete, setParaComplete] = useState(false);
  const [pops, setPops] = useState<PopItem[]>([]);
  const popId = useRef(0);
  const flashKey = useRef(0);
  const completionFiredRef = useRef(false);

  const [score, setScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState(0);
  const [results, setResults] = useState<ParaResult[]>([]);
  const [muted, setMuted] = useState(false);

  const startGame = useCallback((selected: Mode) => {
    sounds.enable();
    sounds.start();
    const q = shuffle(PARAGRAPHS).slice(0, PARA_PER_RUN);
    setMode(selected);
    setQueue(q);
    setIndex(0);
    setFoundWords(new Set());
    setFoundGaps(new Set());
    setWrongCount(0);
    setFlash(null);
    setRevealed(false);
    setParaComplete(false);
    completionFiredRef.current = false;
    setScore(0);
    setResults([]);
    setScreen('playing');
  }, []);

  const current = queue[index];

  const expirePop = useCallback((id: number) => {
    setPops((ps) => ps.filter((p) => p.id !== id));
  }, []);

  const addPop = useCallback(
    (text: string, kind: PopItem['kind'], anchor: HTMLElement | null) => {
      const layer = document.querySelector<HTMLElement>('.pop-layer');
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (anchor && layer) {
        const r = anchor.getBoundingClientRect();
        const lr = layer.getBoundingClientRect();
        x = r.left + r.width / 2 - lr.left;
        y = r.top - lr.top;
      }
      const id = ++popId.current;
      setPops((p) => [...p, { id, x, y, text, kind }]);
    },
    [],
  );

  const onClickWord = useCallback(
    (i: number) => {
      if (!current || revealed || paraComplete) return;
      const tok = current.tokens[i];
      if (!tok) return;
      if (foundWords.has(i)) return;

      const anchor =
        document.querySelector<HTMLElement>(`.tok[data-i="${i}"]`) ?? null;

      if (tok.error) {
        const next = new Set(foundWords);
        next.add(i);
        setFoundWords(next);
        const earned = Math.round(POINTS_CORRECT * MODE_INFO[mode].multiplier);
        setScore((s) => s + earned);
        setScoreFlash((n) => n + 1);
        sounds.correct();
        addPop(`+${earned}`, 'good', anchor);
      } else {
        setWrongCount((n) => n + 1);
        flashKey.current += 1;
        setFlash({ kind: 'word', index: i, key: flashKey.current });
        const lost = Math.round(POINTS_WRONG * MODE_INFO[mode].multiplier);
        setScore((s) => Math.max(0, s + lost));
        setScoreFlash((n) => n + 1);
        sounds.wrong();
        addPop(`${lost}`, 'bad', anchor);
        window.setTimeout(() => setFlash(null), 450);
      }
    },
    [addPop, current, foundWords, mode, paraComplete, revealed],
  );

  const onClickGap = useCallback(
    (i: number) => {
      if (!current || revealed || paraComplete) return;
      const tok = current.tokens[i];
      if (!tok) return;
      if (foundGaps.has(i)) return;

      const anchor =
        document.querySelector<HTMLElement>(`.gap[data-g="${i}"]`) ?? null;

      if (tok.gapError) {
        const next = new Set(foundGaps);
        next.add(i);
        setFoundGaps(next);
        const earned = Math.round(POINTS_CORRECT * MODE_INFO[mode].multiplier);
        setScore((s) => s + earned);
        setScoreFlash((n) => n + 1);
        sounds.correct();
        addPop(`+${earned}`, 'good', anchor);
      } else {
        setWrongCount((n) => n + 1);
        flashKey.current += 1;
        setFlash({ kind: 'gap', index: i, key: flashKey.current });
        const lost = Math.round(POINTS_WRONG * MODE_INFO[mode].multiplier);
        setScore((s) => Math.max(0, s + lost));
        setScoreFlash((n) => n + 1);
        sounds.wrong();
        addPop(`${lost}`, 'bad', anchor);
        window.setTimeout(() => setFlash(null), 450);
      }
    },
    [addPop, current, foundGaps, mode, paraComplete, revealed],
  );

  // Auto-detect paragraph complete (all errors found, not revealed).
  useEffect(() => {
    if (!current) return;
    if (paraComplete || revealed) return;
    if (completionFiredRef.current) return;
    const total = totalErrors(current);
    const found = foundWords.size + foundGaps.size;
    if (found === total && total > 0) {
      completionFiredRef.current = true;
      const t = window.setTimeout(() => {
        setParaComplete(true);
        sounds.complete();
      }, 500);
      return () => window.clearTimeout(t);
    }
  }, [current, foundWords, foundGaps, paraComplete, revealed]);

  // "I'm stuck" — show what was missed in red, but stay on the page.
  const reveal = useCallback(() => {
    if (!current || revealed || paraComplete) return;
    setRevealed(true);
    sounds.reveal();
  }, [current, paraComplete, revealed]);

  // Continue — close the page and go to overlay (after reveal or directly).
  const finishPage = useCallback(() => {
    if (!current || paraComplete) return;
    setParaComplete(true);
  }, [current, paraComplete]);

  const next = useCallback(() => {
    if (!current) return;
    const total = totalErrors(current);
    setResults((rs) => [
      ...rs,
      {
        id: current.id,
        title: current.title,
        correct: foundWords.size + foundGaps.size,
        wrong: wrongCount,
        total,
        revealed,
      },
    ]);
    if (index + 1 >= queue.length) {
      setScreen('summary');
      return;
    }
    setIndex((i) => i + 1);
    setFoundWords(new Set());
    setFoundGaps(new Set());
    setWrongCount(0);
    setFlash(null);
    setRevealed(false);
    setParaComplete(false);
    completionFiredRef.current = false;
    setPops([]);
  }, [
    current,
    foundGaps.size,
    foundWords.size,
    index,
    queue.length,
    revealed,
    wrongCount,
  ]);

  const toggleMute = useCallback(() => {
    setMuted(sounds.toggleMute());
  }, []);

  if (screen === 'welcome') {
    return <Welcome onStart={startGame} />;
  }

  if (screen === 'summary') {
    return (
      <Summary
        score={score}
        results={results}
        onPlayAgain={() => setScreen('welcome')}
      />
    );
  }

  if (!current) return null;

  const total = totalErrors(current);
  const foundCount = foundWords.size + foundGaps.size;
  const accuracy =
    foundCount + wrongCount === 0
      ? 100
      : Math.round((foundCount / (foundCount + wrongCount)) * 100);

  return (
    <div className="app app--playing">
      <PopLayer items={pops} onExpire={expirePop} />
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="topbar-back"
            onClick={() => setScreen('welcome')}
            aria-label="Back to start"
          >
            <ArrowLeft />
          </button>
          <span className="brand">Proofed</span>
        </div>
        <div className="topbar-center">
          <span className={`mode-chip mode-chip--${mode}`}>
            {MODE_INFO[mode].name}
          </span>
          <span className="para-counter">
            {index + 1} <span className="para-counter-of">of</span>{' '}
            {queue.length}
          </span>
        </div>
        <div className="topbar-right">
          <span key={scoreFlash} className="score score--flash">
            {score}
          </span>
          <button
            className="icon-btn"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <SoundOff /> : <SoundOn />}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="page" key={current.id}>
          <h2 className="page-title">{current.title}</h2>
          <ParagraphView
            paragraph={current}
            foundWords={foundWords}
            foundGaps={foundGaps}
            revealed={revealed}
            disabled={paraComplete || revealed}
            onClickWord={onClickWord}
            onClickGap={onClickGap}
            flash={flash}
          />
          {revealed && (
            <p className="page-hint">
              Red highlights are the slips you missed.
            </p>
          )}
        </div>
      </main>

      <footer className="hud-shell">
        <HUD
          mode={mode}
          paragraph={current}
          foundWords={foundWords}
          foundGaps={foundGaps}
        />
        {!paraComplete &&
          (revealed ? (
            <button className="btn btn--primary reveal-btn" onClick={finishPage}>
              Continue
              <ArrowRight />
            </button>
          ) : (
            <button className="btn btn--ghost reveal-btn" onClick={reveal}>
              I'm stuck — reveal
            </button>
          ))}
      </footer>

      {paraComplete && (
        <CompletionOverlay
          paragraphTitle={current.title}
          foundCount={foundCount}
          wrong={wrongCount}
          total={total}
          accuracy={accuracy}
          revealed={revealed}
          isLast={index + 1 >= queue.length}
          onNext={next}
        />
      )}
    </div>
  );
}

function Welcome({ onStart }: { onStart: (m: Mode) => void }) {
  const modes: Mode[] = ['easy', 'hard', 'master'];
  return (
    <div className="welcome">
      <div className="welcome-inner">
        <div className="brand-mark">
          <span className="brand-dot" />
          <span className="brand-name">Proofed</span>
        </div>
        <h1 className="welcome-title">
          Find every <em>slip</em> in the page.
        </h1>
        <p className="welcome-sub">
          Tap each word with a mistake. Tap <em>between</em> words to insert
          a missing comma or period. Choose your difficulty.
        </p>
        <div className="mode-grid">
          {modes.map((m) => (
            <button
              key={m}
              className={`mode-card mode-card--${m}`}
              onClick={() => onStart(m)}
            >
              <div className="mode-card-head">
                <span className="mode-card-name">{MODE_INFO[m].name}</span>
                <span className="mode-card-mult">
                  ×{MODE_INFO[m].multiplier}
                </span>
              </div>
              <p className="mode-card-tag">{MODE_INFO[m].tagline}</p>
              <span className="mode-card-cta">
                Start <ArrowRight />
              </span>
            </button>
          ))}
        </div>
        <p className="welcome-foot">
          {PARAGRAPHS.length} paragraphs · 6 per round
        </p>
      </div>
    </div>
  );
}

function letterGrade(
  accuracy: number,
  revealed: boolean,
  hadMisses: boolean,
): string {
  if (revealed) return 'INC';
  if (accuracy === 100 && !hadMisses) return 'A+';
  if (accuracy >= 95) return 'A';
  if (accuracy >= 90) return 'A-';
  if (accuracy >= 85) return 'B+';
  if (accuracy >= 80) return 'B';
  if (accuracy >= 75) return 'B-';
  if (accuracy >= 70) return 'C+';
  if (accuracy >= 65) return 'C';
  if (accuracy >= 60) return 'C-';
  if (accuracy >= 50) return 'D';
  return 'F';
}

function marginNote(accuracy: number, revealed: boolean): string {
  if (revealed) return 'See me.';
  if (accuracy === 100) return 'Excellent!';
  if (accuracy >= 90) return 'Great work!';
  if (accuracy >= 75) return 'Nice job!';
  if (accuracy >= 60) return 'Keep at it!';
  return 'Try again.';
}

function stampLabel(accuracy: number, revealed: boolean): string {
  if (revealed) return 'INCOMPLETE';
  if (accuracy === 100) return 'PERFECT';
  if (accuracy >= 90) return 'EXCELLENT';
  if (accuracy >= 75) return 'GREAT';
  if (accuracy >= 60) return 'GOOD';
  return 'TRY AGAIN';
}

/** Hand-drawn imperfect circle SVG. The path starts at upper-right,
 *  loops around, and overshoots past where it began. */
function GradeCircle() {
  return (
    <svg
      className="grade-circle-svg"
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <path
        d="M 96 38
           C 100 18 78 8 60 11
           C 30 12 12 30 13 60
           C 14 90 36 108 62 107
           C 92 106 110 86 109 58
           C 108 32 88 14 64 14
           C 48 14 38 22 36 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A red check mark drawn with two strokes. */
function RedCheck() {
  return (
    <svg viewBox="0 0 24 24" className="red-check" aria-hidden="true">
      <path
        d="M 4 13 L 10 19 L 21 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RedCross() {
  return (
    <svg viewBox="0 0 24 24" className="red-cross" aria-hidden="true">
      <path
        d="M 5 5 L 19 19 M 19 5 L 5 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CompletionOverlay({
  paragraphTitle,
  foundCount,
  wrong,
  total,
  accuracy,
  revealed,
  isLast,
  onNext,
}: {
  paragraphTitle: string;
  foundCount: number;
  wrong: number;
  total: number;
  accuracy: number;
  revealed: boolean;
  isLast: boolean;
  onNext: () => void;
}) {
  const grade = letterGrade(accuracy, revealed, wrong > 0);
  const note = marginNote(accuracy, revealed);
  const stamp = stampLabel(accuracy, revealed);
  const isStrong = !revealed && accuracy >= 75;
  const isPerfect = !revealed && accuracy === 100 && wrong === 0;

  return (
    <div className="overlay">
      <div
        className={`graded-sheet ${revealed ? 'graded-sheet--inc' : ''} ${
          isPerfect ? 'graded-sheet--perfect' : ''
        }`}
      >
        <div className="graded-perforation" aria-hidden="true" />
        <div className="graded-margin" aria-hidden="true" />

        <div className="graded-header">
          <div className="graded-title-block">
            <div className="graded-eyebrow">Proofed · Round Quiz</div>
            <h2 className="graded-title">{paragraphTitle}</h2>
            <div className="graded-name">
              <span className="graded-name-label">Name</span>
              <span className="graded-name-value">Player</span>
            </div>
          </div>
          <div className={`grade-stamp grade-stamp--${gradeBucket(grade)}`}>
            <GradeCircle />
            <span className="grade-stamp-letter">{grade}</span>
          </div>
        </div>

        <ul className="graded-list">
          <li className="graded-row">
            <span className="graded-row-mark">
              {foundCount === total ? <RedCheck /> : <RedCross />}
            </span>
            <span className="graded-row-label">Errors found</span>
            <span className="graded-row-value">
              {foundCount} / {total}
            </span>
          </li>
          <li className="graded-row">
            <span className="graded-row-mark">
              {wrong === 0 ? <RedCheck /> : <RedCross />}
            </span>
            <span className="graded-row-label">Wrong taps</span>
            <span className="graded-row-value">{wrong}</span>
          </li>
          <li className="graded-row">
            <span className="graded-row-mark">
              {isStrong ? <RedCheck /> : <RedCross />}
            </span>
            <span className="graded-row-label">Accuracy</span>
            <span className="graded-row-value graded-row-value--score">
              {accuracy}<span className="graded-pct">%</span>
            </span>
          </li>
        </ul>

        <div className="graded-bottom-row">
          <div className="graded-margin-note">
            <span className="graded-margin-note-line" />
            {note}
          </div>
          <div
            className={`graded-rubber-stamp graded-rubber-stamp--${gradeBucket(grade)}`}
          >
            <span className="graded-rubber-stamp-inner">{stamp}</span>
          </div>
        </div>

        <div className="graded-actions">
          <button className="btn btn--primary" onClick={onNext}>
            {isLast ? 'See full report' : 'Next page'}
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

function gradeBucket(grade: string): 'top' | 'mid' | 'low' | 'inc' {
  if (grade === 'INC') return 'inc';
  if (grade.startsWith('A')) return 'top';
  if (grade.startsWith('B') || grade.startsWith('C')) return 'mid';
  return 'low';
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Summary({
  score,
  results,
  onPlayAgain,
}: {
  score: number;
  results: ParaResult[];
  onPlayAgain: () => void;
}) {
  const totalFound = results.reduce((n, r) => n + r.correct, 0);
  const totalErrs = results.reduce((n, r) => n + r.total, 0);
  const totalMiss = results.reduce((n, r) => n + r.wrong, 0);
  const acc =
    totalFound + totalMiss === 0
      ? 100
      : Math.round((totalFound / (totalFound + totalMiss)) * 100);

  return (
    <div className="summary">
      <div className="summary-inner">
        <div className="brand-mark brand-mark--small">
          <span className="brand-dot" />
          <span className="brand-name">Proofed</span>
        </div>
        <h1 className="summary-title">Round complete.</h1>
        <div className="summary-score">
          <div className="summary-score-num">{score}</div>
          <div className="summary-score-label">points</div>
        </div>
        <div className="summary-stats">
          <Stat label="Found" value={`${totalFound} / ${totalErrs}`} />
          <Stat label="Misses" value={`${totalMiss}`} />
          <Stat label="Accuracy" value={`${acc}%`} />
        </div>
        <ul className="summary-list">
          {results.map((r, i) => (
            <li key={r.id + i} className="summary-row">
              <span className="summary-row-num">{i + 1}</span>
              <span className="summary-row-title">{r.title}</span>
              <span className="summary-row-stat">
                {r.correct}/{r.total}
                {r.revealed && (
                  <span className="summary-row-flag">revealed</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <button className="btn btn--primary" onClick={onPlayAgain}>
          Play again <ArrowRight />
        </button>
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M11 7H3m0 0l3.5-3.5M3 7l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SoundOn() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 6v4h2.5l3.5 3V3L5 6H2.5zm9 .5a3 3 0 010 3M13 4.5a5.5 5.5 0 010 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SoundOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 6v4h2.5l3.5 3V3L5 6H2.5zm8 0l4 4m0-4l-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
