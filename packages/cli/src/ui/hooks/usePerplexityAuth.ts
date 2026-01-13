/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import type { AuthType } from '@perplexity-cli/perplexity-cli-core';

export interface PerplexityAuthState {
  deviceAuth: null;
  authStatus: 'idle' | 'success' | 'error';
  authMessage: string | null;
}

/**
 * Simplified auth hook for Perplexity API key authentication.
 * OAuth is not supported - only API key authentication is available.
 */
export const usePerplexityAuth = (
  _pendingAuthType: AuthType | undefined,
  _isAuthenticating: boolean,
) => {
  const [perplexityAuthState, setPerplexityAuthState] =
    useState<PerplexityAuthState>({
      deviceAuth: null,
      authStatus: 'idle',
      authMessage: null,
    });

  const cancelPerplexityAuth = useCallback(() => {
    setPerplexityAuthState({
      deviceAuth: null,
      authStatus: 'idle',
      authMessage: null,
    });
  }, []);

  return {
    perplexityAuthState,
    cancelPerplexityAuth,
  };
};
