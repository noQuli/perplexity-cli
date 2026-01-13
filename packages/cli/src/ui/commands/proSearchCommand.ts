/**
 * @license
 * Copyright 2025 Perplexity
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  SlashCommand,
  CommandContext,
  MessageActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';

const VALID_SEARCH_TYPES = ['pro', 'fast', 'auto'] as const;
type SearchType = (typeof VALID_SEARCH_TYPES)[number];

export const proSearchCommand: SlashCommand = {
  name: 'pro_search',
  get description() {
    return t('Set Pro Search mode for Sonar Pro model (pro, fast, auto)');
  },
  kind: CommandKind.BUILT_IN,
  action: async (
    context: CommandContext,
    args: string,
  ): Promise<MessageActionReturn> => {
    const { services } = context;
    const { config } = services;

    if (!config) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Configuration not available.',
      };
    }

    const contentGeneratorConfig = config.getContentGeneratorConfig();
    if (!contentGeneratorConfig) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('Content generator configuration not available.'),
      };
    }

    // If no args provided, show current search type
    const trimmedArgs = args.trim();
    if (!trimmedArgs) {
      const currentType =
        (contentGeneratorConfig as unknown as { searchType?: string })
          .searchType || 'auto';
      return {
        type: 'message',
        messageType: 'info',
        content: t(
          'Current Pro Search mode: {{type}}. Available modes:\n  • pro - Multi-step reasoning with automated tools\n  • fast - Fast response synthesis \n  • auto - Automatic classification based on query complexity (default)',
          {
            type: currentType,
          },
        ),
      };
    }

    // Validate and set the search type
    const requestedType = trimmedArgs.toLowerCase() as SearchType;
    if (!VALID_SEARCH_TYPES.includes(requestedType)) {
      return {
        type: 'message',
        messageType: 'error',
        content: t(
          'Invalid Pro Search mode: {{type}}. Valid options are: pro, fast, auto',
          { type: requestedType },
        ),
      };
    }

    // Set the search type in the config
    (contentGeneratorConfig as unknown as { searchType?: string }).searchType =
      requestedType;

    let description = '';
    switch (requestedType) {
      case 'pro':
        description = 'Multi-step reasoning with automated tool usage enabled';
        break;
      case 'fast':
        description = 'Fast search with single-step processing';
        break;
      case 'auto':
        description = 'Automatic routing based on query complexity';
        break;
      default:
        description = 'Unknown mode';
        break;
    }

    return {
      type: 'message',
      messageType: 'info',
      content: t('Pro Search mode set to: {{type}} - {{description}}', {
        type: requestedType,
        description,
      }),
    };
  },
  completion: async (
    _context: CommandContext,
    partialArg: string,
  ): Promise<string[]> => {
    const partial = partialArg.toLowerCase();
    return VALID_SEARCH_TYPES.filter((type) => type.startsWith(partial));
  },
};
