/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { t } from '../../i18n/index.js';

interface PerplexityKeyPromptProps {
  onSubmit: (apiKey: string) => void;
  onCancel: () => void;
  defaultApiKey?: string;
}

export const perplexityCredentialSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

export type PerplexityCredentials = z.infer<typeof perplexityCredentialSchema>;

export function PerplexityKeyPrompt({
  onSubmit,
  onCancel,
  defaultApiKey,
}: PerplexityKeyPromptProps): React.JSX.Element {
  const [apiKey, setApiKey] = useState(defaultApiKey || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndSubmit = () => {
    setValidationError(null);

    try {
      const validated = perplexityCredentialSchema.parse({
        apiKey: apiKey.trim(),
      });

      onSubmit(validated.apiKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        setValidationError(
          t('Invalid credentials: {{errorMessage}}', { errorMessage }),
        );
      } else {
        setValidationError(t('Failed to validate credentials'));
      }
    }
  };

  useKeypress(
    (key) => {
      // Handle escape
      if (key.name === 'escape') {
        onCancel();
        return;
      }

      // Handle Enter key
      if (key.name === 'return') {
        if (apiKey.trim()) {
          validateAndSubmit();
        } else {
          setValidationError(t('API key is required'));
        }
        return;
      }

      // Handle backspace/delete
      if (key.name === 'backspace' || key.name === 'delete') {
        setApiKey((prev) => prev.slice(0, -1));
        return;
      }

      // Handle paste mode - if it's a paste event with content
      if (key.paste && key.sequence) {
        // Filter paste control sequences
        let cleanInput = key.sequence
          .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '') // eslint-disable-line no-control-regex
          .replace(/\[200~/g, '')
          .replace(/\[201~/g, '')
          .replace(/^\[|~$/g, '');

        // Filter invisible characters
        cleanInput = cleanInput
          .split('')
          .filter((ch) => ch.charCodeAt(0) >= 32)
          .join('');

        if (cleanInput.length > 0) {
          setApiKey((prev) => prev + cleanInput);
        }
        return;
      }

      // Handle regular character input
      if (key.sequence && !key.ctrl && !key.meta) {
        const cleanInput = key.sequence
          .split('')
          .filter((ch) => ch.charCodeAt(0) >= 32)
          .join('');

        if (cleanInput.length > 0) {
          setApiKey((prev) => prev + cleanInput);
        }
      }
    },
    { isActive: true },
  );

  // Mask the API key for display (show only last 4 characters)
  const maskedApiKey =
    apiKey.length > 4
      ? '•'.repeat(apiKey.length - 4) + apiKey.slice(-4)
      : apiKey;

  return (
    <Box
      borderStyle="round"
      borderColor={theme.border.focused}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold color={theme.text.accent}>
        {t('🔍 Perplexity API Key Required')}
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text color={theme.text.primary}>
          {t('Please enter your Perplexity API key.')}
        </Text>
        <Text color={theme.text.secondary}>
          {t('You can get an API key from')}{' '}
          <Text color={theme.text.link}>
            [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
          </Text>
        </Text>
      </Box>

      {/* Visual Style from reference code, but using YOUR original input logic */}
      <Box marginTop={1} flexDirection="row">
        <Box
          borderStyle="round"
          borderColor={theme.border.focused}
          paddingX={1}
          flexGrow={1}
        >
          <Text color={theme.text.primary}>
            {/* Kept your original conditional text display */}
            {maskedApiKey || t('(paste or type your key)')}
          </Text>
        </Box>
      </Box>

      {validationError && (
        <Box marginTop={1}>
          <Text color={theme.status.error}>{validationError}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color={theme.text.secondary}>
          {t('(Press Enter to submit, Esc to cancel)')}
        </Text>
      </Box>
    </Box>
  );
}
