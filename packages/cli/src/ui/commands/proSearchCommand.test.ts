/**
 * @license
 * Copyright 2025 Perplexity
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { proSearchCommand } from './proSearchCommand.js';
import { type CommandContext } from './types.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import {
  AuthType,
  type ContentGeneratorConfig,
  type Config,
} from '@perplexity-cli/perplexity-cli-core';

// Helper function to create a mock config
function createMockConfig(
  contentGeneratorConfig: ContentGeneratorConfig | null,
): Partial<Config> {
  return {
    getContentGeneratorConfig: vi.fn().mockReturnValue(contentGeneratorConfig),
  };
}

describe('proSearchCommand', () => {
  let mockContext: CommandContext;

  beforeEach(() => {
    mockContext = createMockCommandContext();
    vi.clearAllMocks();
  });

  it('should have the correct name and description', () => {
    expect(proSearchCommand.name).toBe('pro_search');
    expect(proSearchCommand.description).toBe(
      'Set Pro Search mode for Sonar Pro model (pro, fast, auto)',
    );
  });

  it('should return error when config is not available', async () => {
    mockContext.services.config = null;

    const result = await proSearchCommand.action!(mockContext, '');

    expect(result).toEqual({
      type: 'message',
      messageType: 'error',
      content: 'Configuration not available.',
    });
  });

  it('should return error when content generator config is not available', async () => {
    const mockConfig = createMockConfig(null);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, '');

    expect(result).toEqual({
      type: 'message',
      messageType: 'error',
      content: 'Content generator configuration not available.',
    });
  });

  it('should display current search type when no args provided', async () => {
    const mockContentGeneratorConfig = {
      model: 'sonar-pro',
      authType: AuthType.PERPLEXITY_API_KEY,
      searchType: 'auto',
    } as ContentGeneratorConfig;

    const mockConfig = createMockConfig(mockContentGeneratorConfig);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, '');

    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Current Pro Search mode: auto'),
    });
  });

  it('should display "auto" as default when searchType is not set', async () => {
    const mockContentGeneratorConfig = {
      model: 'sonar-pro',
      authType: AuthType.PERPLEXITY_API_KEY,
    } as ContentGeneratorConfig;

    const mockConfig = createMockConfig(mockContentGeneratorConfig);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, '');

    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Current Pro Search mode: auto'),
    });
  });

  it('should set search type to "pro" when valid arg provided', async () => {
    const mockContentGeneratorConfig = {
      model: 'sonar-pro',
      authType: AuthType.PERPLEXITY_API_KEY,
    } as ContentGeneratorConfig;

    const mockConfig = createMockConfig(mockContentGeneratorConfig);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, 'pro');

    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Pro Search mode set to: pro'),
    });

    expect(
      (mockContentGeneratorConfig as unknown as { searchType?: string })
        .searchType,
    ).toBe('pro');
  });

  it('should set search type to "fast" when valid arg provided', async () => {
    const mockContentGeneratorConfig = {
      model: 'sonar-pro',
      authType: AuthType.PERPLEXITY_API_KEY,
    } as ContentGeneratorConfig;

    const mockConfig = createMockConfig(mockContentGeneratorConfig);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, 'fast');

    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Pro Search mode set to: fast'),
    });

    expect(
      (mockContentGeneratorConfig as unknown as { searchType?: string })
        .searchType,
    ).toBe('fast');
  });

  it('should set search type to "auto" when valid arg provided', async () => {
    const mockContentGeneratorConfig = {
      model: 'sonar-pro',
      authType: AuthType.PERPLEXITY_API_KEY,
    } as ContentGeneratorConfig;

    const mockConfig = createMockConfig(mockContentGeneratorConfig);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, 'auto');

    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Pro Search mode set to: auto'),
    });

    expect(
      (mockContentGeneratorConfig as unknown as { searchType?: string })
        .searchType,
    ).toBe('auto');
  });

  it('should handle case-insensitive input', async () => {
    const mockContentGeneratorConfig = {
      model: 'sonar-pro',
      authType: AuthType.PERPLEXITY_API_KEY,
    } as ContentGeneratorConfig;

    const mockConfig = createMockConfig(mockContentGeneratorConfig);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, 'PRO');

    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Pro Search mode set to: pro'),
    });

    expect(
      (mockContentGeneratorConfig as unknown as { searchType?: string })
        .searchType,
    ).toBe('pro');
  });

  it('should return error for invalid search type', async () => {
    const mockContentGeneratorConfig = {
      model: 'sonar-pro',
      authType: AuthType.PERPLEXITY_API_KEY,
    } as ContentGeneratorConfig;

    const mockConfig = createMockConfig(mockContentGeneratorConfig);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, 'invalid');

    expect(result).toEqual({
      type: 'message',
      messageType: 'error',
      content: expect.stringContaining('Invalid Pro Search mode: invalid'),
    });

    expect(
      (mockContentGeneratorConfig as unknown as { searchType?: string })
        .searchType,
    ).toBeUndefined();
  });

  it('should handle whitespace in args', async () => {
    const mockContentGeneratorConfig = {
      model: 'sonar-pro',
      authType: AuthType.PERPLEXITY_API_KEY,
    } as ContentGeneratorConfig;

    const mockConfig = createMockConfig(mockContentGeneratorConfig);
    mockContext.services.config = mockConfig as Config;

    const result = await proSearchCommand.action!(mockContext, '  pro  ');

    expect(result).toEqual({
      type: 'message',
      messageType: 'info',
      content: expect.stringContaining('Pro Search mode set to: pro'),
    });

    expect(
      (mockContentGeneratorConfig as unknown as { searchType?: string })
        .searchType,
    ).toBe('pro');
  });

  describe('completion', () => {
    it('should return all search types when no partial arg', async () => {
      const suggestions = await proSearchCommand.completion!(mockContext, '');

      expect(suggestions).toEqual(['pro', 'fast', 'auto']);
    });

    it('should filter search types by partial arg', async () => {
      const suggestions = await proSearchCommand.completion!(mockContext, 'p');

      expect(suggestions).toEqual(['pro']);
    });

    it('should filter search types by partial arg "fa"', async () => {
      const suggestions = await proSearchCommand.completion!(mockContext, 'fa');

      expect(suggestions).toEqual(['fast']);
    });

    it('should filter search types by partial arg "au"', async () => {
      const suggestions = await proSearchCommand.completion!(mockContext, 'au');

      expect(suggestions).toEqual(['auto']);
    });

    it('should return empty array when no matches', async () => {
      const suggestions = await proSearchCommand.completion!(
        mockContext,
        'xyz',
      );

      expect(suggestions).toEqual([]);
    });

    it('should handle case-insensitive partial match', async () => {
      const suggestions = await proSearchCommand.completion!(mockContext, 'PR');

      expect(suggestions).toEqual(['pro']);
    });
  });
});
