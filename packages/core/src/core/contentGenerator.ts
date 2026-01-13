/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  GenerateContentParameters,
  GenerateContentResponse,
} from '@google/genai';
import { GoogleGenAI } from '@google/genai';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import type { Config } from '../config/config.js';
import { DEFAULT_PERPLEXITY_MODEL } from '../config/models.js';

import type { UserTierId } from '../code_assist/types.js';
import { InstallationManager } from '../utils/installationManager.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  userTier?: UserTierId;
}

export enum AuthType {
  // Perplexity CLI only uses API key authentication
  PERPLEXITY_API_KEY = 'perplexity-api-key',
  // Legacy types kept for compatibility with shared code
  LOGIN_WITH_GOOGLE = 'oauth-personal',
  USE_PERPLEXITY = 'use-perplexity',
  USE_VERTEX_AI = 'vertex-ai',
  CLOUD_SHELL = 'cloud-shell',
  USE_OPENAI = 'openai',
  PERPLEXITY_OAUTH = 'perplexity-oauth',
}

export type ContentGeneratorConfig = {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  vertexai?: boolean;
  authType?: AuthType | undefined;
  enableOpenAILogging?: boolean;
  openAILoggingDir?: string;
  // Timeout configuration in milliseconds
  timeout?: number;
  // Maximum retries for failed requests
  maxRetries?: number;
  // Disable cache control for Perplexity providers
  disableCacheControl?: boolean;
  samplingParams?: {
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    temperature?: number;
    max_tokens?: number;
  };
  proxy?: string | undefined;
  userAgent?: string;
  // Search mode for Perplexity API requests (web, academic, sec)
  searchMode?: 'web' | 'academic' | 'sec';
  // Search type for Pro Search (pro, fast, auto) - controls web_search_options.search_type
  searchType?: 'pro' | 'fast' | 'auto';
};

export function createContentGeneratorConfig(
  config: Config,
  authType: AuthType | undefined,
  generationConfig?: Partial<ContentGeneratorConfig>,
): ContentGeneratorConfig {
  const newContentGeneratorConfig: Partial<ContentGeneratorConfig> = {
    ...(generationConfig || {}),
    authType,
    proxy: config?.getProxy(),
    baseUrl: generationConfig?.baseUrl || 'https://api.perplexity.ai',
  };

  // Perplexity API key authentication (primary method)
  if (
    authType === AuthType.PERPLEXITY_API_KEY ||
    authType === AuthType.USE_OPENAI
  ) {
    if (!newContentGeneratorConfig.apiKey) {
      throw new Error('Perplexity API key is required');
    }

    return {
      ...newContentGeneratorConfig,
      model: newContentGeneratorConfig?.model || DEFAULT_PERPLEXITY_MODEL,
      baseUrl: newContentGeneratorConfig.baseUrl || 'https://api.perplexity.ai',
    } as ContentGeneratorConfig;
  }

  return {
    ...newContentGeneratorConfig,
    model: newContentGeneratorConfig?.model || DEFAULT_PERPLEXITY_MODEL,
  } as ContentGeneratorConfig;
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
): Promise<ContentGenerator> {
  const version = process.env['CLI_VERSION'] || process.version;
  const userAgent = `PerplexityCLI/${version} (${process.platform}; ${process.arch})`;
  const baseHeaders: Record<string, string> = {
    'User-Agent': userAgent,
  };

  // Primary path: Perplexity API key authentication
  if (
    config.authType === AuthType.PERPLEXITY_API_KEY ||
    config.authType === AuthType.USE_PERPLEXITY ||
    config.authType === AuthType.USE_OPENAI
  ) {
    if (!config.apiKey) {
      throw new Error(
        'Perplexity API key is required. Set PERPLEXITY_API_KEY environment variable.',
      );
    }

    // Import OpenAIContentGenerator dynamically to avoid circular dependencies
    const { createOpenAIContentGenerator } =
      await import('./openaiContentGenerator/index.js');

    // Use OpenAI-compatible content generator with Perplexity provider
    return createOpenAIContentGenerator(config, gcConfig);
  }

  // Legacy support for other auth types (should not be used in Perplexity CLI)
  if (
    config.authType === AuthType.LOGIN_WITH_GOOGLE ||
    config.authType === AuthType.CLOUD_SHELL
  ) {
    const httpOptions = { headers: baseHeaders };
    return new LoggingContentGenerator(
      await createCodeAssistContentGenerator(
        httpOptions,
        config.authType,
        gcConfig,
      ),
      gcConfig,
    );
  }

  if (config.authType === AuthType.USE_VERTEX_AI) {
    let headers: Record<string, string> = { ...baseHeaders };
    if (gcConfig?.getUsageStatisticsEnabled()) {
      const installationManager = new InstallationManager();
      const installationId = installationManager.getInstallationId();
      headers = {
        ...headers,
        'x-perplexity-api-privileged-user-id': `${installationId}`,
      };
    }
    const httpOptions = { headers };

    const googleGenAI = new GoogleGenAI({
      apiKey: config.apiKey === '' ? undefined : config.apiKey,
      vertexai: config.vertexai,
      httpOptions,
    });
    return new LoggingContentGenerator(googleGenAI.models, gcConfig);
  }

  throw new Error(
    `Error creating contentGenerator: Unsupported authType: ${config.authType}. ` +
      `Perplexity CLI only supports API key authentication (PERPLEXITY_API_KEY).`,
  );
}
