/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ColorsTheme, Theme } from './theme.js';
import { darkSemanticColors } from './semantic-tokens.js';

const perplexityDarkColors: ColorsTheme = {
  type: 'dark',
  Background: '#0b0e14',
  Foreground: '#bfbdb6',
  LightBlue: '#59C2FF',
  AccentBlue: '#39BAE6',
  AccentPurple: '#D2A6FF',
  AccentCyan: '#95E6CB',
  AccentGreen: '#AAD94C',
  AccentYellow: '#FFD700',
  AccentRed: '#F26D78',
  DiffAdded: '#AAD94C',
  DiffRemoved: '#F26D78',
  Comment: '#646A71',
  Gray: '#3D4149',
  GradientColors: ['#FFD700', '#da7959'],
};

export const PerplexityDark: Theme = new Theme(
  'Perplexity Dark',
  'dark',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: perplexityDarkColors.Background,
      color: perplexityDarkColors.Foreground,
    },
    'hljs-keyword': {
      color: perplexityDarkColors.AccentYellow,
    },
    'hljs-literal': {
      color: perplexityDarkColors.AccentPurple,
    },
    'hljs-symbol': {
      color: perplexityDarkColors.AccentCyan,
    },
    'hljs-name': {
      color: perplexityDarkColors.LightBlue,
    },
    'hljs-link': {
      color: perplexityDarkColors.AccentBlue,
    },
    'hljs-function .hljs-keyword': {
      color: perplexityDarkColors.AccentYellow,
    },
    'hljs-subst': {
      color: perplexityDarkColors.Foreground,
    },
    'hljs-string': {
      color: perplexityDarkColors.AccentGreen,
    },
    'hljs-title': {
      color: perplexityDarkColors.AccentYellow,
    },
    'hljs-type': {
      color: perplexityDarkColors.AccentBlue,
    },
    'hljs-attribute': {
      color: perplexityDarkColors.AccentYellow,
    },
    'hljs-bullet': {
      color: perplexityDarkColors.AccentYellow,
    },
    'hljs-addition': {
      color: perplexityDarkColors.AccentGreen,
    },
    'hljs-variable': {
      color: perplexityDarkColors.Foreground,
    },
    'hljs-template-tag': {
      color: perplexityDarkColors.AccentYellow,
    },
    'hljs-template-variable': {
      color: perplexityDarkColors.AccentYellow,
    },
    'hljs-comment': {
      color: perplexityDarkColors.Comment,
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: perplexityDarkColors.AccentCyan,
      fontStyle: 'italic',
    },
    'hljs-deletion': {
      color: perplexityDarkColors.AccentRed,
    },
    'hljs-meta': {
      color: perplexityDarkColors.AccentYellow,
    },
    'hljs-doctag': {
      fontWeight: 'bold',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
  },
  perplexityDarkColors,
  darkSemanticColors,
);
