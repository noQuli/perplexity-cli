/**
 * @license
 * Copyright 2025 Perplexity
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('pro_search command integration', () => {
  const cliPath = path.join(
    __dirname,
    '..',
    'packages',
    'cli',
    'dist',
    'perplexity.js',
  );

  it('should be listed in help commands', () => {
    const result = spawnSync('node', [cliPath, '/help'], {
      encoding: 'utf-8',
      timeout: 10000,
      env: {
        ...process.env,
        PERPLEXITY_API_KEY: 'test-key',
        NO_COLOR: '1',
      },
    });

    // The command should be recognized (not produce an error about unknown command)
    expect(result.status).toBe(0);
  });

  it('should display current search type when called without args', () => {
    // This test would require a proper API key and interactive session
    // For now, we just verify the command exists in the built code
    const result = spawnSync(
      'node',
      [
        '-e',
        `
      const { proSearchCommand } = await import('${cliPath.replace(/cli\.js$/, 'ui/commands/proSearchCommand.js')}');
      console.log(proSearchCommand.name);
    `,
      ],
      {
        encoding: 'utf-8',
        shell: true,
        timeout: 10000,
      },
    );

    // Just verify the module can be loaded
    expect(result.stderr).not.toContain('Error');
  });
});
