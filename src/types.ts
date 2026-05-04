export type ErrorType = 'spelling' | 'punctuation' | 'capitalization' | 'grammar';

export const ERROR_LABELS: Record<ErrorType, string> = {
  spelling: 'Spelling',
  punctuation: 'Punctuation',
  capitalization: 'Capitalization',
  grammar: 'Grammar',
};

export const ERROR_ORDER: ErrorType[] = [
  'spelling',
  'punctuation',
  'capitalization',
  'grammar',
];

export interface TokenError {
  type: ErrorType;
  correct: string;
}

export interface Token {
  text: string;
  error?: TokenError;
  /**
   * Error in the gap that follows this token (i.e., a missing punctuation
   * mark between this word and the next). `correct` is the inserted
   * character(s) only — e.g. ",".
   */
  gapError?: TokenError;
}

export interface Paragraph {
  id: string;
  title: string;
  tokens: Token[];
}

export type Mode = 'easy' | 'hard' | 'master';

export const MODE_INFO: Record<
  Mode,
  { name: string; tagline: string; multiplier: number }
> = {
  easy: {
    name: 'Easy',
    tagline: 'See how many of each kind of error to find.',
    multiplier: 1,
  },
  hard: {
    name: 'Hard',
    tagline: 'You only see the total number of errors.',
    multiplier: 1.5,
  },
  master: {
    name: 'Master',
    tagline: "You're on your own — find them all.",
    multiplier: 2,
  },
};
