/**
 * @license
 * Copyright 2025 Perplexity Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from 'vitest/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const timeoutMinutes = Number(process.env['TB_TIMEOUT_MINUTES'] || '5');
const testTimeoutMs = timeoutMinutes * 60 * 1000;

export default defineConfig({
  test: {
    testTimeout: testTimeoutMs,
    globalSetup: './globalSetup.ts',
    reporters: ['default'],
    include: ['**/*.test.ts'],
    exclude: ['**/terminal-bench/*.test.ts', '**/node_modules/**'],
    retry: 2,
    // Run tests sequentially to prevent memory issues
    fileParallelism: false,
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 2,
        useAtomics: true,
      },
    },
    // Isolate test environments to prevent memory leaks
    isolate: true,
  },
  resolve: {
    alias: {
      // Use built SDK bundle for e2e tests
      '@perplexity-cli/sdk': resolve(
        __dirname,
        '../packages/sdk-typescript/dist/index.mjs',
      ),
    },
  },
});
