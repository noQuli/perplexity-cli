import { ShellExecutionService } from '@perplexity-cli/perplexity-cli-core';

async function run() {
  const isPty = true; // Test PTY mode
  console.log('Testing ShellExecutionService with PTY:', isPty);

  const shellExecutionConfig = {
    terminalWidth: 80,
    terminalHeight: 24,
    defaultFg: '#ffffff',
    defaultBg: '#000000',
    pager: 'cat',
    showColor: true,
  };

  const abortController = new AbortController();

  await ShellExecutionService.execute(
    'echo "Hello World"; sleep 1; echo "Line 2"',
    process.cwd(),
    (event) => {
      console.log('Event Type:', event.type);
      if (event.type === 'data') {
        console.log('Chunk Type:', typeof event.chunk);
        if (typeof event.chunk === 'string') {
          console.log('Chunk Value:', JSON.stringify(event.chunk));
        } else if (Array.isArray(event.chunk)) {
          console.log(
            'Chunk is Array (AnsiOutput), length:',
            event.chunk.length,
          );
          // console.log('First line:', JSON.stringify(event.chunk[0]));
        } else {
          console.log('Chunk is unknown:', event.chunk);
        }
      }
    },
    abortController.signal,
    isPty,
    shellExecutionConfig,
  );
  console.log('Done');
}

run().catch(console.error);
