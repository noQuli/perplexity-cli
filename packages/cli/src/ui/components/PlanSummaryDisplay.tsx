/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { MarkdownDisplay } from '../utils/MarkdownDisplay.js';
import { theme } from '../semantic-colors.js';
import type { PlanResultDisplay } from '@perplexity-cli/perplexity-cli-core';

interface PlanSummaryDisplayProps {
  data: PlanResultDisplay;
  availableHeight?: number;
  childWidth: number;
}

export const PlanSummaryDisplay: React.FC<PlanSummaryDisplayProps> = ({
  data,
  availableHeight,
  childWidth,
}) => {
  const { message, plan } = data;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.status.success} wrap="wrap">
          {message}
        </Text>
      </Box>
      <MarkdownDisplay
        text={plan}
        isPending={false}
        availableTerminalHeight={availableHeight}
        terminalWidth={childWidth}
      />
    </Box>
  );
};
