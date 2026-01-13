/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ColorsTheme, Theme } from './theme.js';
import { lightSemanticColors } from './semantic-tokens.js';

const perplexityLightColors: ColorsTheme = {
  type: 'light',
  Background: '#f8f9fa',
  Foreground: '#5c6166',
  LightBlue: '#55b4d4',
  AccentBlue: '#399ee6',
  AccentPurple: '#a37acc',
  AccentCyan: '#4cbf99',
  AccentGreen: '#86b300',
  AccentYellow: '#f2ae49',
  AccentRed: '#f07171',
  DiffAdded: '#86b300',
  DiffRemoved: '#f07171',
  Comment: '#ABADB1',
  Gray: '#CCCFD3',
  GradientColors: ['#399ee6', '#86b300'],
};

export const PerplexityLight: Theme = new Theme(
  'Perplexity Light',
  'light',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: perplexityLightColors.Background,
      color: perplexityLightColors.Foreground,
    },
    'hljs-comment': {
      color: perplexityLightColors.Comment,
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: perplexityLightColors.AccentCyan,
      fontStyle: 'italic',
    },
    'hljs-string': {
      color: perplexityLightColors.AccentGreen,
    },
    'hljs-constant': {
      color: perplexityLightColors.AccentCyan,
    },
    'hljs-number': {
      color: perplexityLightColors.AccentPurple,
    },
    'hljs-keyword': {
      color: perplexityLightColors.AccentYellow,
    },
    'hljs-selector-tag': {
      color: perplexityLightColors.AccentYellow,
    },
    'hljs-attribute': {
      color: perplexityLightColors.AccentYellow,
    },
    'hljs-variable': {
      color: perplexityLightColors.Foreground,
    },
    'hljs-variable.language': {
      color: perplexityLightColors.LightBlue,
      fontStyle: 'italic',
    },
    'hljs-title': {
      color: perplexityLightColors.AccentBlue,
    },
    'hljs-section': {
      color: perplexityLightColors.AccentGreen,
      fontWeight: 'bold',
    },
    'hljs-type': {
      color: perplexityLightColors.LightBlue,
    },
    'hljs-class .hljs-title': {
      color: perplexityLightColors.AccentBlue,
    },
    'hljs-tag': {
      color: perplexityLightColors.LightBlue,
    },
    'hljs-name': {
      color: perplexityLightColors.AccentBlue,
    },
    'hljs-builtin-name': {
      color: perplexityLightColors.AccentYellow,
    },
    'hljs-meta': {
      color: perplexityLightColors.AccentYellow,
    },
    'hljs-symbol': {
      color: perplexityLightColors.AccentRed,
    },
    'hljs-bullet': {
      color: perplexityLightColors.AccentYellow,
    },
    'hljs-regexp': {
      color: perplexityLightColors.AccentCyan,
    },
    'hljs-link': {
      color: perplexityLightColors.LightBlue,
    },
    'hljs-deletion': {
      color: perplexityLightColors.AccentRed,
    },
    'hljs-addition': {
      color: perplexityLightColors.AccentGreen,
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-literal': {
      color: perplexityLightColors.AccentCyan,
    },
    'hljs-built_in': {
      color: perplexityLightColors.AccentRed,
    },
    'hljs-doctag': {
      color: perplexityLightColors.AccentRed,
    },
    'hljs-template-variable': {
      color: perplexityLightColors.AccentCyan,
    },
    'hljs-selector-id': {
      color: perplexityLightColors.AccentRed,
    },
  },
  perplexityLightColors,
  lightSemanticColors,
);
