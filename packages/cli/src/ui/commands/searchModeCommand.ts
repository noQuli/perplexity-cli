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

const VALID_SEARCH_MODES = ['web', 'academic', 'sec'] as const;
type SearchMode = (typeof VALID_SEARCH_MODES)[number];

export const searchModeCommand: SlashCommand = {
  name: 'search_mode',
  get description() {
    return t(
      'Set the search mode for Perplexity API requests (web, academic, sec)',
    );
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

    // If no args provided, show current search mode
    const trimmedArgs = args.trim();
    if (!trimmedArgs) {
      const currentMode =
        (contentGeneratorConfig as unknown as { searchMode?: string })
          .searchMode || 'web';
      return {
        type: 'message',
        messageType: 'info',
        content: t(
          'Current search mode: {{mode}}. Available modes: web, academic, sec',
          {
            mode: currentMode,
          },
        ),
      };
    }

    // Validate and set the search mode
    const requestedMode = trimmedArgs.toLowerCase() as SearchMode;
    if (!VALID_SEARCH_MODES.includes(requestedMode)) {
      return {
        type: 'message',
        messageType: 'error',
        content: t(
          'Invalid search mode: {{mode}}. Valid options are: web, academic, sec',
          { mode: requestedMode },
        ),
      };
    }

    // Set the search mode in the config
    (contentGeneratorConfig as unknown as { searchMode?: string }).searchMode =
      requestedMode;

    return {
      type: 'message',
      messageType: 'info',
      content: t('Search mode set to: {{mode}}', { mode: requestedMode }),
    };
  },
  completion: async (
    _context: CommandContext,
    partialArg: string,
  ): Promise<string[]> => {
    const partial = partialArg.toLowerCase();
    return VALID_SEARCH_MODES.filter((mode) => mode.startsWith(partial));
  },
};
