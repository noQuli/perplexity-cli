/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import type { vi } from 'vitest';
import { describe, it, expect } from 'vitest';
import { toolsCommand } from './toolsCommand.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import { MessageType } from '../types.js';
import type {
  ToolBuilder,
  ToolResult,
} from '@perplexity-cli/perplexity-cli-core';

// Mock tools for testing
const mockTools = [
  {
    name: 'file-reader',
    displayName: 'File Reader',
    description: 'Reads files from the local system.',
    schema: {},
  },
  {
    name: 'code-editor',
    displayName: 'Code Editor',
    description: 'Edits code files.',
    schema: {},
  },
] as unknown as Array<ToolBuilder<object, ToolResult>>;

describe('toolsCommand', () => {
  it('should list available Perplexity CLI tools without descriptions by default', async () => {
    const mockContext = createMockCommandContext({
      services: {
        config: {
          getToolRegistry: () => ({ getAllTools: () => mockTools }),
        },
      },
    });

    if (!toolsCommand.action) throw new Error('Action not defined');
    await toolsCommand.action(mockContext, '');

    const [message] = (mockContext.ui.addItem as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(message.type).toBe(MessageType.TOOLS_LIST);
    expect(message.showDescriptions).toBe(false);
    expect(message.tools).toHaveLength(2);
    expect(message.tools[0].displayName).toBe('File Reader');
    expect(message.tools[1].displayName).toBe('Code Editor');
  });

  it('should show descriptions when desc argument is provided', async () => {
    const mockContext = createMockCommandContext({
      services: {
        config: {
          getToolRegistry: () => ({ getAllTools: () => mockTools }),
        },
      },
    });

    if (!toolsCommand.action) throw new Error('Action not defined');
    await toolsCommand.action(mockContext, 'desc');

    const [message] = (mockContext.ui.addItem as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(message.type).toBe(MessageType.TOOLS_LIST);
    expect(message.showDescriptions).toBe(true);
    expect(message.tools).toHaveLength(2);
    expect(message.tools[0].description).toBe(
      'Reads files from the local system.',
    );
    expect(message.tools[1].description).toBe('Edits code files.');
  });

  it('should show descriptions when descriptions argument is provided', async () => {
    const mockContext = createMockCommandContext({
      services: {
        config: {
          getToolRegistry: () => ({ getAllTools: () => mockTools }),
        },
      },
    });

    if (!toolsCommand.action) throw new Error('Action not defined');
    await toolsCommand.action(mockContext, 'descriptions');

    const [message] = (mockContext.ui.addItem as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(message.type).toBe(MessageType.TOOLS_LIST);
    expect(message.showDescriptions).toBe(true);
  });

  it('should display error when tool registry is not available', async () => {
    const mockContext = createMockCommandContext({
      services: {
        config: null,
      },
    });

    if (!toolsCommand.action) throw new Error('Action not defined');
    await toolsCommand.action(mockContext, '');

    expect(mockContext.ui.addItem).toHaveBeenCalledWith(
      {
        type: MessageType.ERROR,
        text: 'Could not retrieve tool registry.',
      },
      expect.any(Number),
    );
  });
});
