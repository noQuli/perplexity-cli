/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { AuthType } from '@perplexity-cli/perplexity-cli-core';
import { Box, Text } from 'ink';
import { SettingScope } from '../../config/settings.js';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { RadioButtonSelect } from '../components/shared/RadioButtonSelect.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useUIActions } from '../contexts/UIActionsContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { t } from '../../i18n/index.js';

export function AuthDialog(): React.JSX.Element {
  const { authError } = useUIState();
  const { handleAuthSelect: onAuthSelect } = useUIActions();
  const settings = useSettings();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perplexity CLI only supports API key authentication
  const items = [
    {
      key: AuthType.PERPLEXITY_API_KEY,
      label: t('Perplexity API Key'),
      value: AuthType.PERPLEXITY_API_KEY,
    },
  ];

  const initialAuthIndex = 0; // Only one option

  const hasApiKey =
    Boolean(settings.merged.security?.auth?.apiKey) ||
    Boolean(process.env['PERPLEXITY_API_KEY']);

  const handleAuthSelect = async (authMethod: AuthType) => {
    setErrorMessage(null);
    await onAuthSelect(authMethod, SettingScope.User);
  };

  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        // Prevent exit if there is an error message.
        if (errorMessage) {
          return;
        }
        if (settings.merged.security?.auth?.selectedType === undefined) {
          setErrorMessage(
            t(
              'You must set your Perplexity API key to proceed. Press Ctrl+C again to exit.',
            ),
          );
          return;
        }
        onAuthSelect(undefined, SettingScope.User);
      }
    },
    { isActive: true },
  );

  return (
    <Box
      borderStyle="round"
      borderColor={theme.border.focused}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold color={theme.text.accent}>
        {t('🔍 Perplexity CLI')}
      </Text>
      <Box marginTop={1}>
        <Text color={theme.text.primary}>{t('Auth methods:')}</Text>
      </Box>
      <Box marginTop={1}>
        <RadioButtonSelect
          items={items}
          initialIndex={initialAuthIndex}
          onSelect={handleAuthSelect}
        />
      </Box>
      {(authError || errorMessage) && (
        <Box marginTop={1}>
          <Text color={theme.status.error}>{authError || errorMessage}</Text>
        </Box>
      )}
      {hasApiKey && (
        <Box marginTop={1}>
          <Text color={theme.status.success}>{t('✓ API key detected')}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color={theme.text.secondary}>
          {t('(Press Enter to continue)')}
        </Text>
      </Box>
    </Box>
  );
}
