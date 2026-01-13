/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ContentGenerator,
  ContentGeneratorConfig,
} from '../contentGenerator.js';
import type { Config } from '../../config/config.js';
import { OpenAIContentGenerator } from './openaiContentGenerator.js';
import {
  PerplexityOpenAICompatibleProvider,
  DeepSeekOpenAICompatibleProvider,
  ModelScopeOpenAICompatibleProvider,
  OpenRouterOpenAICompatibleProvider,
  type OpenAICompatibleProvider,
} from './provider/index.js';

export { OpenAIContentGenerator } from './openaiContentGenerator.js';
export { ContentGenerationPipeline, type PipelineConfig } from './pipeline.js';

export {
  type OpenAICompatibleProvider,
  PerplexityOpenAICompatibleProvider,
  DeepSeekOpenAICompatibleProvider,
  OpenRouterOpenAICompatibleProvider,
} from './provider/index.js';

export { OpenAIContentConverter } from './converter.js';

/**
 * Create an OpenAI-compatible content generator with the appropriate provider
 */
export function createOpenAIContentGenerator(
  contentGeneratorConfig: ContentGeneratorConfig,
  cliConfig: Config,
): ContentGenerator {
  const provider = determineProvider(contentGeneratorConfig, cliConfig);
  return new OpenAIContentGenerator(
    contentGeneratorConfig,
    cliConfig,
    provider,
  );
}

/**
 * Determine the appropriate provider based on configuration
 */
export function determineProvider(
  contentGeneratorConfig: ContentGeneratorConfig,
  cliConfig: Config,
): OpenAICompatibleProvider {
  const config =
    contentGeneratorConfig || cliConfig.getContentGeneratorConfig();

  // Check for Perplexity provider first (primary provider for this CLI)
  if (PerplexityOpenAICompatibleProvider.isPerplexityProvider(config)) {
    return new PerplexityOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig,
    );
  }

  if (DeepSeekOpenAICompatibleProvider.isDeepSeekProvider(config)) {
    return new DeepSeekOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig,
    );
  }

  // Check for OpenRouter provider
  if (OpenRouterOpenAICompatibleProvider.isOpenRouterProvider(config)) {
    return new OpenRouterOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig,
    );
  }

  // Check for ModelScope provider
  if (ModelScopeOpenAICompatibleProvider.isModelScopeProvider(config)) {
    return new ModelScopeOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig,
    );
  }

  // Default to Perplexity provider for this CLI
  return new PerplexityOpenAICompatibleProvider(
    contentGeneratorConfig,
    cliConfig,
  );
}

// Services
export {
  type TelemetryService,
  type RequestContext,
  DefaultTelemetryService,
} from './telemetryService.js';

export { type ErrorHandler, EnhancedErrorHandler } from './errorHandler.js';
