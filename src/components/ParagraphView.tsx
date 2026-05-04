import { Fragment, memo } from 'react';
import type { Paragraph } from '../types';

export type FlashTarget =
  | { kind: 'word'; index: number; key: number }
  | { kind: 'gap'; index: number; key: number }
  | null;

interface Props {
  paragraph: Paragraph;
  foundWords: ReadonlySet<number>;
  foundGaps: ReadonlySet<number>;
  revealed: boolean;
  disabled: boolean;
  onClickWord: (index: number) => void;
  onClickGap: (index: number) => void;
  flash: FlashTarget;
}

export const ParagraphView = memo(function ParagraphView({
  paragraph,
  foundWords,
  foundGaps,
  revealed,
  disabled,
  onClickWord,
  onClickGap,
  flash,
}: Props) {
  return (
    <p className="paragraph">
      {paragraph.tokens.map((tok, i) => {
        const isError = !!tok.error;
        const isFound = foundWords.has(i);
        const isMissed = revealed && isError && !isFound;
        const isShake =
          flash && flash.kind === 'word' && flash.index === i;

        const cls = [
          'tok',
          isFound && 'tok--found',
          isMissed && 'tok--missed',
          isShake && 'tok--shake',
          disabled && 'tok--disabled',
          isError && tok.error ? `tok--type-${tok.error.type}` : null,
        ]
          .filter(Boolean)
          .join(' ');

        const wordEl = (
          <span
            className={cls}
            data-i={i}
            data-shake-key={isShake ? flash.key : undefined}
            onClick={() => !disabled && onClickWord(i)}
            role={disabled ? undefined : 'button'}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClickWord(i);
              }
            }}
          >
            <span className="tok-text">{tok.text}</span>
            {isError && (isFound || isMissed) && tok.error && (
              <span className="tok-correction" aria-hidden="true">
                {tok.error.correct}
              </span>
            )}
          </span>
        );

        if (i === paragraph.tokens.length - 1) {
          return <Fragment key={i}>{wordEl}</Fragment>;
        }

        const gapErr = tok.gapError;
        const gapFound = foundGaps.has(i);
        const gapMissed = revealed && !!gapErr && !gapFound;
        const gapShake =
          flash && flash.kind === 'gap' && flash.index === i;
        const gapCls = [
          'gap',
          gapFound && 'gap--found',
          gapMissed && 'gap--missed',
          gapShake && 'gap--shake',
          disabled && 'gap--disabled',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <Fragment key={i}>
            {wordEl}
            <span
              className={gapCls}
              data-g={i}
              data-shake-key={gapShake ? flash.key : undefined}
              onClick={() => !disabled && onClickGap(i)}
              role={disabled ? undefined : 'button'}
              tabIndex={disabled ? -1 : 0}
              aria-label="Tap between words"
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClickGap(i);
                }
              }}
            >
              <span className="gap-caret" aria-hidden="true" />
              {(gapFound || gapMissed) && gapErr && (
                <span className="gap-fix">{gapErr.correct}</span>
              )}
            </span>
          </Fragment>
        );
      })}
    </p>
  );
});
