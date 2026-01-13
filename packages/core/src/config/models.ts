/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

// Perplexity Models
export const DEFAULT_PERPLEXITY_MODEL = 'sonar-pro';
export const DEFAULT_PERPLEXITY_REASONING_MODEL = 'sonar-reasoning-pro';
export const DEFAULT_PERPLEXITY_FAST_MODEL = 'sonar';
export const DEFAULT_PERPLEXITY_FLASH_MODEL = DEFAULT_PERPLEXITY_FAST_MODEL;
export const DEFAULT_PERPLEXITY_FLASH_LITE_MODEL = 'sonar';
export const DEFAULT_PERPLEXITY_MODEL_AUTO = 'auto';
export const DEFAULT_PERPLEXITY_EMBEDDING_MODEL = 'text-embedding-3-small';

// Some thinking models do not default to dynamic thinking which is done by a value of -1
export const DEFAULT_THINKING_MODE = -1;

/**
 * Determines the effective model to use, applying fallback logic if necessary.
 *
 * When fallback mode is active, this function enforces the use of the standard
 * fallback model. However, it makes an exception for "lite" models (any model
 * with "lite" in its name), allowing them to be used to preserve cost savings.
 * This ensures that "pro" models are always downgraded, while "lite" model
 * requests are honored.
 *
 * @param isInFallbackMode Whether the application is in fallback mode.
 * @param requestedModel The model that was originally requested.
 * @returns The effective model name.
 */
export function getEffectiveModel(
  isInFallbackMode: boolean,
  requestedModel: string,
): string {
  // If we are not in fallback mode, simply use the requested model.
  if (!isInFallbackMode) {
    return requestedModel;
  }

  // If a "lite" model is requested, honor it. This allows for variations of
  // lite models without needing to list them all as constants.
  if (requestedModel.includes('lite') || requestedModel === 'sonar') {
    return requestedModel;
  }

  // Default fallback for Perplexity CLI.
  return DEFAULT_PERPLEXITY_FAST_MODEL;
}
