/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '@perplexity-cli/perplexity-cli-core';
import { loadEnvironment, loadSettings } from './settings.js';

export function validateAuthMethod(authMethod: string): string | null {
  const settings = loadSettings();
  loadEnvironment(settings.merged);

  // Check for USE_OPENAI separately
  if (authMethod === AuthType.USE_OPENAI) {
    const hasOpenAiKey = process.env['OPENAI_API_KEY'];
    if (!hasOpenAiKey) {
      return 'OPENAI_API_KEY environment variable not found. You can enter it interactively or add it to your .env file.';
    }
    return null;
  }

  // Perplexity CLI only supports API key authentication
  if (
    authMethod === AuthType.PERPLEXITY_API_KEY ||
    authMethod === AuthType.USE_PERPLEXITY
  ) {
    const hasApiKey =
      process.env['PERPLEXITY_API_KEY'] ||
      settings.merged.security?.auth?.apiKey;
    if (!hasApiKey) {
      return 'PERPLEXITY_API_KEY environment variable not found. You can enter it interactively or add it to your .env file.';
    }
    return null;
  }

  return 'Invalid auth method selected. Perplexity CLI only supports API key authentication.';
}
