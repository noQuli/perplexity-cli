/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { type Config } from '@perplexity-cli/perplexity-cli-core';
import { t } from '../../i18n/index.js';

interface TipsProps {
  config: Config;
}

export const Tips: React.FC<TipsProps> = ({ config }) => {
  const perplexityMdFileCount = config.getPerplexityMdFileCount();
  return (
    <Box flexDirection="column">
      <Text color={theme.text.primary}>{t('Tips for getting started:')}</Text>
      <Text color={theme.text.primary}>
        {t('1. Ask questions, edit files, or run commands.')}
      </Text>
      <Text color={theme.text.primary}>
        {t('2. Be specific for the best results.')}
      </Text>
      {perplexityMdFileCount === 0 && (
        <Text color={theme.text.primary}>
          3. Create{' '}
          <Text bold color={theme.text.accent}>
            PERPLEXITY.md
          </Text>{' '}
          {t('files to customize your interactions with Perplexity Code.')}
        </Text>
      )}
      <Text color={theme.text.primary}>
        {perplexityMdFileCount === 0 ? '4.' : '3.'}{' '}
        <Text bold color={theme.text.accent}>
          /help
        </Text>{' '}
        {t('for more information.')}
      </Text>
    </Box>
  );
};
