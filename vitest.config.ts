import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/cli',
      'packages/core',
      'packages/vscode-ide-companion',
      'packages/sdk-typescript',
      'integration-tests',
      'scripts',
    ],
    // Limit memory usage to prevent system freezes
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
        useAtomics: true,
      },
    },
    // Run tests sequentially to reduce memory pressure
    fileParallelism: false,
    // Isolate test environments to prevent memory leaks
    isolate: true,
    // Set reasonable timeout
    testTimeout: 30000,
  },
});
