/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import type { ContentGenerator } from './contentGenerator.js';
import { createContentGenerator, AuthType } from './contentGenerator.js';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import type { Config } from '../config/config.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';

vi.mock('../code_assist/codeAssist.js');
vi.mock('@google/genai');
vi.mock('./openaiContentGenerator/index.js', () => ({
  createOpenAIContentGenerator: vi.fn().mockReturnValue({
    generateContent: vi.fn(),
    generateContentStream: vi.fn(),
  }),
}));

const mockConfig = {
  getCliVersion: vi.fn().mockReturnValue('1.0.0'),
} as unknown as Config;

describe('createContentGenerator', () => {
  it('should create a CodeAssistContentGenerator for LOGIN_WITH_GOOGLE', async () => {
    const mockGenerator = {} as unknown as ContentGenerator;
    vi.mocked(createCodeAssistContentGenerator).mockResolvedValue(
      mockGenerator as never,
    );
    const generator = await createContentGenerator(
      {
        model: 'test-model',
        authType: AuthType.LOGIN_WITH_GOOGLE,
      },
      mockConfig,
    );
    expect(createCodeAssistContentGenerator).toHaveBeenCalled();
    expect(generator).toEqual(
      new LoggingContentGenerator(mockGenerator, mockConfig),
    );
  });

  it('should create an OpenAI-compatible content generator for USE_PERPLEXITY', async () => {
    const mockConfig = {
      getUsageStatisticsEnabled: () => true,
      getCliVersion: () => '1.0.0',
    } as unknown as Config;

    const { createOpenAIContentGenerator } =
      await import('./openaiContentGenerator/index.js');
    const generator = await createContentGenerator(
      {
        model: 'sonar-pro',
        apiKey: 'test-api-key',
        authType: AuthType.USE_PERPLEXITY,
      },
      mockConfig,
    );

    expect(createOpenAIContentGenerator).toHaveBeenCalled();
    expect(generator).toBeDefined();
  });

  it('should create an OpenAI-compatible content generator for USE_PERPLEXITY with stats disabled', async () => {
    const mockConfig = {
      getUsageStatisticsEnabled: () => false,
      getCliVersion: () => '1.0.0',
    } as unknown as Config;

    const { createOpenAIContentGenerator } =
      await import('./openaiContentGenerator/index.js');
    const generator = await createContentGenerator(
      {
        model: 'sonar',
        apiKey: 'test-api-key',
        authType: AuthType.USE_PERPLEXITY,
      },
      mockConfig,
    );

    expect(createOpenAIContentGenerator).toHaveBeenCalled();
    expect(generator).toBeDefined();
  });
});
