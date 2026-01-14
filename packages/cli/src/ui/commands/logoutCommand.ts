/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  SlashCommand,
  QuitActionReturn,
  MessageActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';
import { SettingScope } from '../../config/settings.js';
import { formatDuration } from '../utils/formatters.js';

export const logoutCommand: SlashCommand = {
  name: 'logout',
  get description() {
    return t('Clear saved API key and exit');
  },
  kind: CommandKind.BUILT_IN,
  action: (context, _args): QuitActionReturn | MessageActionReturn => {
    try {
      // Clear the API key from environment (runtime only)
      delete process.env['PERPLEXITY_API_KEY'];

      // Clear the API key from user settings (persistent)
      const settings = context.services.settings;
      if (settings) {
        // Clear auth settings
        settings.setValue(SettingScope.User, 'security.auth.apiKey', undefined);
        settings.setValue(
          SettingScope.User,
          'security.auth.selectedType',
          undefined,
        );
      }

      // Exit the CLI after logout
      const now = Date.now();
      const { sessionStartTime } = context.session.stats;
      const wallDuration = now - sessionStartTime.getTime();

      return {
        type: 'quit',
        messages: [
          {
            type: 'user',
            text: '/logout',
            id: now - 2,
          },
          {
            type: 'info',
            text: t('Logged out successfully. Your API key has been cleared.'),
            id: now - 1,
          },
          {
            type: 'quit',
            duration: formatDuration(wallDuration),
            id: now,
          },
        ],
      };
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('Failed to log out: {{error}}', {
          error: error instanceof Error ? error.message : String(error),
        }),
      };
    }
  },
};
