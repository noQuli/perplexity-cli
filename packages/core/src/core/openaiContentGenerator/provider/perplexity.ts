/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import OpenAI from 'openai';
import type { Config } from '../../../config/config.js';
import type { ContentGeneratorConfig } from '../../contentGenerator.js';
import { DefaultOpenAICompatibleProvider } from './default.js';
import { DEFAULT_TIMEOUT, DEFAULT_MAX_RETRIES } from '../constants.js';

const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';

/**
 * Generate tool call instructions for the system prompt.
 * Since Perplexity doesn't support native tool calling, we instruct the model
 * to output tool calls in a specific format that we can parse.
 */
function generateToolCallInstructions(
  tools: OpenAI.Chat.ChatCompletionTool[],
): string {
  if (!tools || tools.length === 0) {
    return '';
  }

  const toolDescriptions = tools
    .map((tool) => {
      if (tool.type !== 'function' || !tool.function) {
        return '';
      }
      const func = tool.function;
      const params = func.parameters
        ? JSON.stringify(func.parameters, null, 2)
        : '{}';
      return `### ${func.name}
${func.description || 'No description'}
Parameters: ${params}`;
    })
    .filter(Boolean)
    .join('\n\n');

  return `

## Tool Calling Instructions
You have access to the following tools. To call a tool, output your tool call in this exact format:

<tool_call>
{"name": "tool_name", "arguments": {"param1": "value1", "param2": "value2"}}
</tool_call>

IMPORTANT:
- Output the tool call exactly as shown, with valid JSON inside the tags
- Wait for the tool result before continuing
- You can call multiple tools in sequence
- After seeing a tool result, use it to continue your response

## Available Tools

${toolDescriptions}
`;
}

export class PerplexityOpenAICompatibleProvider extends DefaultOpenAICompatibleProvider {
  constructor(
    contentGeneratorConfig: ContentGeneratorConfig,
    cliConfig: Config,
  ) {
    super(contentGeneratorConfig, cliConfig);
  }

  static isPerplexityProvider(
    contentGeneratorConfig: ContentGeneratorConfig,
  ): boolean {
    const baseUrl = contentGeneratorConfig.baseUrl ?? '';
    return (
      baseUrl.toLowerCase().includes('api.perplexity.ai') ||
      baseUrl.toLowerCase().includes('perplexity')
    );
  }

  override buildHeaders(): Record<string, string | undefined> {
    const version = this.cliConfig.getCliVersion() || 'unknown';
    const userAgent = `PerplexityCLI/${version} (${process.platform}; ${process.arch})`;
    return {
      'User-Agent': userAgent,
    };
  }

  override buildClient(): OpenAI {
    const {
      apiKey,
      baseUrl = PERPLEXITY_BASE_URL,
      timeout = DEFAULT_TIMEOUT,
      maxRetries = DEFAULT_MAX_RETRIES,
    } = this.contentGeneratorConfig;

    const defaultHeaders = this.buildHeaders();

    return new OpenAI({
      apiKey,
      baseURL: baseUrl,
      timeout,
      maxRetries,
      defaultHeaders,
    });
  }

  override buildRequest(
    request: OpenAI.Chat.ChatCompletionCreateParams,
    userPromptId: string,
  ): OpenAI.Chat.ChatCompletionCreateParams {
    const baseRequest = super.buildRequest(request, userPromptId);

    if (!baseRequest.messages?.length) {
      return baseRequest;
    }

    // Perplexity API requires:
    // 1. Text-only content (no images)
    // 2. No native tool messages (we convert them to regular messages)
    // 3. Messages must alternate between user and assistant (after system)

    // Generate tool instructions to append to system prompt
    const toolInstructions = generateToolCallInstructions(
      baseRequest.tools || [],
    );

    // First, filter and transform tool-related messages
    const filteredMessages = baseRequest.messages
      .map((message) => {
        if (!('role' in message)) return message;

        // Convert tool messages to user messages with the result
        if (message.role === 'tool') {
          const toolContent =
            typeof message.content === 'string'
              ? message.content
              : JSON.stringify(message.content);
          return {
            role: 'user' as const,
            content: `[Tool Result for ${message.tool_call_id || 'unknown'}]:\n${toolContent}`,
          };
        }

        // Convert assistant messages with tool_calls to regular assistant messages
        if (
          message.role === 'assistant' &&
          'tool_calls' in message &&
          message.tool_calls
        ) {
          const toolCallsText = message.tool_calls
            .map((tc) => {
              if (tc.type === 'function' && tc.function) {
                return `<tool_call>\n{"name": "${tc.function.name}", "arguments": ${tc.function.arguments}}\n</tool_call>`;
              }
              return '';
            })
            .filter(Boolean)
            .join('\n');

          const content =
            typeof message.content === 'string' ? message.content : '';
          return {
            role: 'assistant' as const,
            content: content + (toolCallsText ? '\n' + toolCallsText : ''),
          };
        }

        return message;
      })
      .filter((message) => {
        // Keep all messages that have content
        if (!('content' in message)) return true;
        if (message.content === null || message.content === undefined)
          return false;
        if (
          typeof message.content === 'string' &&
          message.content.trim() === ''
        )
          return false;
        return true;
      })
      .map((message) => {
        if (!('content' in message)) {
          return message;
        }

        const { content } = message;

        if (
          typeof content === 'string' ||
          content === null ||
          content === undefined
        ) {
          return message;
        }

        if (!Array.isArray(content)) {
          return message;
        }

        // Convert array content to string (Perplexity only supports text)
        const text = content
          .map((part) => {
            if (part.type === 'text') {
              return part.text ?? '';
            }
            // Skip non-text parts for Perplexity
            return '';
          })
          .filter(Boolean)
          .join('\n');

        return {
          ...message,
          content: text,
        } as OpenAI.Chat.ChatCompletionMessageParam;
      });

    // Append tool instructions to system message
    const messagesWithToolInstructions = filteredMessages.map(
      (message, index) => {
        if (
          index === 0 &&
          'role' in message &&
          message.role === 'system' &&
          toolInstructions
        ) {
          const currentContent =
            typeof message.content === 'string' ? message.content : '';
          return {
            ...message,
            content: currentContent + toolInstructions,
          };
        }
        return message;
      },
    );

    // If no system message but we have tool instructions, add one
    let finalMessagesPreMerge = messagesWithToolInstructions;
    if (
      toolInstructions &&
      (!filteredMessages[0] ||
        !('role' in filteredMessages[0]) ||
        filteredMessages[0].role !== 'system')
    ) {
      finalMessagesPreMerge = [
        { role: 'system' as const, content: toolInstructions.trim() },
        ...messagesWithToolInstructions,
      ];
    }

    // Ensure proper message alternation (user/assistant after system)
    const finalMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    let lastRole: string | null = null;

    for (const message of finalMessagesPreMerge) {
      if (!('role' in message)) continue;

      const role = message.role as string;

      // System messages can appear at the start
      if (role === 'system') {
        finalMessages.push(message);
        continue;
      }

      // Skip consecutive messages of the same role (except system)
      if (role === lastRole && role !== 'system') {
        // Merge content if both are user or both are assistant
        const lastMessage = finalMessages[finalMessages.length - 1];
        if (lastMessage && 'content' in lastMessage && 'content' in message) {
          const lastContent =
            typeof lastMessage.content === 'string' ? lastMessage.content : '';
          const currentContent =
            typeof message.content === 'string' ? message.content : '';
          (lastMessage as { content: string }).content =
            lastContent + '\n' + currentContent;
        }
        continue;
      }

      finalMessages.push(message);
      lastRole = role;
    }

    // Perplexity-specific parameters
    return {
      ...baseRequest,
      messages: finalMessages,
      // Remove unsupported parameters for Perplexity
      // Since Perplexity does NOT support native tool/function calling,
      // we inject tool definitions into the system prompt instead
      tools: undefined,
      tool_choice: undefined,
      logprobs: undefined,
      top_logprobs: undefined,
      n: undefined,
      seed: undefined,
    };
  }
}
