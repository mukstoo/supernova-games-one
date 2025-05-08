// theme/index.ts
import * as colors from './colors';
import * as typography from './typography';
import * as spacing from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
} as const;

export type Theme = typeof theme;
