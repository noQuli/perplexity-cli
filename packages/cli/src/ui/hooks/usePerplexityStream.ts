/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type {
  Config,
  EditorType,
  PerplexityClient,
  ServerPerplexityChatCompressedEvent,
  ServerPerplexityContentEvent as ContentEvent,
  ServerPerplexityFinishedEvent,
  ServerPerplexityStreamEvent as PerplexityEvent,
  ThoughtSummary,
  ToolCallRequestInfo,
  PerplexityErrorEventValue,
} from '@perplexity-cli/perplexity-cli-core';
import {
  PerplexityEventType as ServerPerplexityEventType,
  getErrorMessage,
  isNodeError,
  MessageSenderType,
  logUserPrompt,
  GitService,
  UnauthorizedError,
  UserPromptEvent,
  DEFAULT_PERPLEXITY_FLASH_MODEL,
  logConversationFinishedEvent,
  ConversationFinishedEvent,
  ApprovalMode,
  parseAndFormatApiError,
  promptIdContext,
  ToolConfirmationOutcome,
  logApiCancel,
  ApiCancelEvent,
} from '@perplexity-cli/perplexity-cli-core';
import { type Part, type PartListUnion, FinishReason } from '@google/genai';
import type {
  HistoryItem,
  HistoryItemWithoutId,
  HistoryItemToolGroup,
  SlashCommandProcessorResult,
} from '../types.js';
import { StreamingState, MessageType, ToolCallStatus } from '../types.js';
import { isAtCommand, isSlashCommand } from '../utils/commandUtils.js';
import { useShellCommandProcessor } from './shellCommandProcessor.js';
import { useVisionAutoSwitch } from './useVisionAutoSwitch.js';
import { handleAtCommand } from './atCommandProcessor.js';
import { findLastSafeSplitPoint } from '../utils/markdownUtilities.js';
import { useStateAndRef } from './useStateAndRef.js';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
import { useLogger } from './useLogger.js';
import {
  useReactToolScheduler,
  mapToDisplay as mapTrackedToolCallsToDisplay,
  type TrackedToolCall,
  type TrackedCompletedToolCall,
  type TrackedCancelledToolCall,
  type TrackedWaitingToolCall,
} from './useReactToolScheduler.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { useSessionStats } from '../contexts/SessionContext.js';
import { useKeypress } from './useKeypress.js';
import type { LoadedSettings } from '../../config/settings.js';

enum StreamProcessingStatus {
  Completed,
  UserCancelled,
  Error,
}

const EDIT_TOOL_NAMES = new Set(['replace', 'write_file']);

function showCitations(settings: LoadedSettings): boolean {
  const enabled = settings?.merged?.ui?.showCitations;
  if (enabled !== undefined) {
    return enabled;
  }
  return true;
}

/**
 * Manages the Perplexity stream, including user input, command processing,
 * API interaction, and tool call lifecycle.
 */
export const usePerplexityStream = (
  perplexityClient: PerplexityClient,
  history: HistoryItem[],
  addItem: UseHistoryManagerReturn['addItem'],
  config: Config,
  settings: LoadedSettings,
  onDebugMessage: (message: string) => void,
  handleSlashCommand: (
    cmd: PartListUnion,
  ) => Promise<SlashCommandProcessorResult | false>,
  shellModeActive: boolean,
  getPreferredEditor: () => EditorType | undefined,
  onAuthError: (error: string) => void,
  performMemoryRefresh: () => Promise<void>,
  modelSwitchedFromQuotaError: boolean,
  setModelSwitchedFromQuotaError: React.Dispatch<React.SetStateAction<boolean>>,
  onEditorClose: () => void,
  onCancelSubmit: () => void,
  visionModelPreviewEnabled: boolean,
  setShellInputFocused: (value: boolean) => void,
  terminalWidth: number,
  terminalHeight: number,
  onVisionSwitchRequired?: (query: PartListUnion) => Promise<{
    modelOverride?: string;
    persistSessionModel?: string;
    showGuidance?: boolean;
  }>,
  isShellFocused?: boolean,
) => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const turnCancelledRef = useRef(false);
  const isSubmittingQueryRef = useRef(false);
  const [isResponding, setIsResponding] = useState<boolean>(false);
  const [thought, setThought] = useState<ThoughtSummary | null>(null);
  const [pendingHistoryItem, pendingHistoryItemRef, setPendingHistoryItem] =
    useStateAndRef<HistoryItemWithoutId | null>(null);
  const processedMemoryToolsRef = useRef<Set<string>>(new Set());
  const processedCheckpointsRef = useRef<Set<string>>(new Set());
  const {
    startNewPrompt,
    getPromptCount,
    stats: sessionStates,
  } = useSessionStats();
  const storage = config.storage;
  const logger = useLogger(storage, sessionStates.sessionId);
  const gitService = useMemo(() => {
    if (!config.getProjectRoot()) {
      return;
    }
    return new GitService(config.getProjectRoot(), storage);
  }, [config, storage]);

  const [toolCalls, scheduleToolCalls, markToolsAsSubmitted] =
    useReactToolScheduler(
      async (completedToolCallsFromScheduler) => {
        // This onComplete is called when ALL scheduled tools for a given batch are done.
        if (completedToolCallsFromScheduler.length > 0) {
          // Add the final state of these tools to the history for display.
          addItem(
            mapTrackedToolCallsToDisplay(
              completedToolCallsFromScheduler as TrackedToolCall[],
            ),
            Date.now(),
          );

          // Handle tool response submission immediately when tools complete
          await handleCompletedTools(
            completedToolCallsFromScheduler as TrackedToolCall[],
          );
        }
      },
      config,
      getPreferredEditor,
      onEditorClose,
    );

  const pendingToolCallGroupDisplay = useMemo(
    () =>
      toolCalls.length ? mapTrackedToolCallsToDisplay(toolCalls) : undefined,
    [toolCalls],
  );

  const activeToolPtyId = useMemo(() => {
    const executingShellTool = toolCalls?.find(
      (tc) =>
        tc.status === 'executing' && tc.request.name === 'run_shell_command',
    );
    if (executingShellTool) {
      return (executingShellTool as { pid?: number }).pid;
    }
    return undefined;
  }, [toolCalls]);

  const loopDetectedRef = useRef(false);
  const [
    loopDetectionConfirmationRequest,
    setLoopDetectionConfirmationRequest,
  ] = useState<{
    onComplete: (result: { userSelection: 'disable' | 'keep' }) => void;
  } | null>(null);

  const onExec = useCallback(async (done: Promise<void>) => {
    setIsResponding(true);
    await done;
    setIsResponding(false);
  }, []);
  const { handleShellCommand, activeShellPtyId } = useShellCommandProcessor(
    addItem,
    setPendingHistoryItem,
    onExec,
    onDebugMessage,
    config,
    perplexityClient,
    setShellInputFocused,
    terminalWidth,
    terminalHeight,
  );

  const { handleVisionSwitch, restoreOriginalModel } = useVisionAutoSwitch(
    config,
    addItem,
    visionModelPreviewEnabled,
    onVisionSwitchRequired,
  );
  const activePtyId = activeShellPtyId || activeToolPtyId;

  useEffect(() => {
    if (!activePtyId) {
      setShellInputFocused(false);
    }
  }, [activePtyId, setShellInputFocused]);

  const streamingState = useMemo(() => {
    if (toolCalls.some((tc) => tc.status === 'awaiting_approval')) {
      return StreamingState.WaitingForConfirmation;
    }
    if (
      isResponding ||
      toolCalls.some(
        (tc) =>
          tc.status === 'executing' ||
          tc.status === 'scheduled' ||
          tc.status === 'validating' ||
          ((tc.status === 'success' ||
            tc.status === 'error' ||
            tc.status === 'cancelled') &&
            !(tc as TrackedCompletedToolCall | TrackedCancelledToolCall)
              .responseSubmittedToPerplexity),
      )
    ) {
      return StreamingState.Responding;
    }
    return StreamingState.Idle;
  }, [isResponding, toolCalls]);

  useEffect(() => {
    if (
      config.getApprovalMode() === ApprovalMode.YOLO &&
      streamingState === StreamingState.Idle
    ) {
      const lastUserMessageIndex = history.findLastIndex(
        (item: HistoryItem) => item.type === MessageType.USER,
      );

      const turnCount =
        lastUserMessageIndex === -1 ? 0 : history.length - lastUserMessageIndex;

      if (turnCount > 0) {
        logConversationFinishedEvent(
          config,
          new ConversationFinishedEvent(config.getApprovalMode(), turnCount),
        );
      }
    }
  }, [streamingState, config, history]);

  const cancelOngoingRequest = useCallback(() => {
    if (streamingState !== StreamingState.Responding) {
      return;
    }
    if (turnCancelledRef.current) {
      return;
    }
    turnCancelledRef.current = true;
    isSubmittingQueryRef.current = false;
    abortControllerRef.current?.abort();

    // Log API cancellation
    const prompt_id = config.getSessionId() + '########' + getPromptCount();
    const cancellationEvent = new ApiCancelEvent(
      config.getModel(),
      prompt_id,
      config.getContentGeneratorConfig()?.authType,
    );
    logApiCancel(config, cancellationEvent);

    if (pendingHistoryItemRef.current) {
      addItem(pendingHistoryItemRef.current, Date.now());
    }
    addItem(
      {
        type: MessageType.INFO,
        text: 'Request cancelled.',
      },
      Date.now(),
    );
    setPendingHistoryItem(null);
    onCancelSubmit();
    setIsResponding(false);
    setShellInputFocused(false);
  }, [
    streamingState,
    addItem,
    setPendingHistoryItem,
    onCancelSubmit,
    pendingHistoryItemRef,
    setShellInputFocused,
    config,
    getPromptCount,
  ]);

  useKeypress(
    (key) => {
      if (key.name === 'escape' && !isShellFocused) {
        cancelOngoingRequest();
      }
    },
    { isActive: streamingState === StreamingState.Responding },
  );

  const prepareQueryForPerplexity = useCallback(
    async (
      query: PartListUnion,
      userMessageTimestamp: number,
      abortSignal: AbortSignal,
      prompt_id: string,
    ): Promise<{
      queryToSend: PartListUnion | null;
      shouldProceed: boolean;
    }> => {
      if (turnCancelledRef.current) {
        return { queryToSend: null, shouldProceed: false };
      }
      if (typeof query === 'string' && query.trim().length === 0) {
        return { queryToSend: null, shouldProceed: false };
      }

      let localQueryToSendToPerplexity: PartListUnion | null = null;

      if (typeof query === 'string') {
        const trimmedQuery = query.trim();
        onDebugMessage(`User query: '${trimmedQuery}'`);
        await logger?.logMessage(MessageSenderType.USER, trimmedQuery);

        // Handle UI-only commands first
        const slashCommandResult = isSlashCommand(trimmedQuery)
          ? await handleSlashCommand(trimmedQuery)
          : false;

        if (slashCommandResult) {
          switch (slashCommandResult.type) {
            case 'schedule_tool': {
              const { toolName, toolArgs } = slashCommandResult;
              const toolCallRequest: ToolCallRequestInfo = {
                callId: `${toolName}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                name: toolName,
                args: toolArgs,
                isClientInitiated: true,
                prompt_id,
              };
              scheduleToolCalls([toolCallRequest], abortSignal);
              return { queryToSend: null, shouldProceed: false };
            }
            case 'submit_prompt': {
              localQueryToSendToPerplexity = slashCommandResult.content;

              return {
                queryToSend: localQueryToSendToPerplexity,
                shouldProceed: true,
              };
            }
            case 'handled': {
              return { queryToSend: null, shouldProceed: false };
            }
            default: {
              const unreachable: never = slashCommandResult;
              throw new Error(
                `Unhandled slash command result type: ${unreachable}`,
              );
            }
          }
        }

        if (shellModeActive && handleShellCommand(trimmedQuery, abortSignal)) {
          return { queryToSend: null, shouldProceed: false };
        }

        // Handle @-commands (which might involve tool calls)
        if (isAtCommand(trimmedQuery)) {
          const atCommandResult = await handleAtCommand({
            query: trimmedQuery,
            config,
            addItem,
            onDebugMessage,
            messageId: userMessageTimestamp,
            signal: abortSignal,
          });

          // Add user's turn after @ command processing is done.
          addItem(
            { type: MessageType.USER, text: trimmedQuery },
            userMessageTimestamp,
          );

          if (!atCommandResult.shouldProceed) {
            return { queryToSend: null, shouldProceed: false };
          }
          localQueryToSendToPerplexity = atCommandResult.processedQuery;
        } else {
          // Normal query for Perplexity
          addItem(
            { type: MessageType.USER, text: trimmedQuery },
            userMessageTimestamp,
          );
          localQueryToSendToPerplexity = trimmedQuery;
        }
      } else {
        // It's a function response (PartListUnion that isn't a string)
        localQueryToSendToPerplexity = query;
      }

      if (localQueryToSendToPerplexity === null) {
        onDebugMessage(
          'Query processing resulted in null, not sending to Perplexity.',
        );
        return { queryToSend: null, shouldProceed: false };
      }
      return { queryToSend: localQueryToSendToPerplexity, shouldProceed: true };
    },
    [
      config,
      addItem,
      onDebugMessage,
      handleShellCommand,
      handleSlashCommand,
      logger,
      shellModeActive,
      scheduleToolCalls,
    ],
  );

  // --- Stream Event Handlers ---

  const handleContentEvent = useCallback(
    (
      eventValue: ContentEvent['value'],
      currentPerplexityMessageBuffer: string,
      userMessageTimestamp: number,
    ): string => {
      if (turnCancelledRef.current) {
        // Prevents additional output after a user initiated cancel.
        return '';
      }
      let newPerplexityMessageBuffer =
        currentPerplexityMessageBuffer + eventValue;
      if (
        pendingHistoryItemRef.current?.type !== 'perplexity' &&
        pendingHistoryItemRef.current?.type !== 'perplexity_content'
      ) {
        if (pendingHistoryItemRef.current) {
          addItem(pendingHistoryItemRef.current, userMessageTimestamp);
        }
        setPendingHistoryItem({ type: 'perplexity', text: '' });
        newPerplexityMessageBuffer = eventValue;
      }
      // Split large messages for better rendering performance. Ideally,
      // we should maximize the amount of output sent to <Static />.
      const splitPoint = findLastSafeSplitPoint(newPerplexityMessageBuffer);
      if (splitPoint === newPerplexityMessageBuffer.length) {
        // Update the existing message with accumulated content
        setPendingHistoryItem((item) => ({
          type: item?.type as 'perplexity' | 'perplexity_content',
          text: newPerplexityMessageBuffer,
        }));
      } else {
        // This indicates that we need to split up this Perplexity Message.
        // Splitting a message is primarily a performance consideration. There is a
        // <Static> component at the root of App.tsx which takes care of rendering
        // content statically or dynamically. Everything but the last message is
        // treated as static in order to prevent re-rendering an entire message history
        // multiple times per-second (as streaming occurs). Prior to this change you'd
        // see heavy flickering of the terminal. This ensures that larger messages get
        // broken up so that there are more "statically" rendered.
        const beforeText = newPerplexityMessageBuffer.substring(0, splitPoint);
        const afterText = newPerplexityMessageBuffer.substring(splitPoint);
        addItem(
          {
            type: pendingHistoryItemRef.current?.type as
              | 'perplexity'
              | 'perplexity_content',
            text: beforeText,
          },
          userMessageTimestamp,
        );
        setPendingHistoryItem({ type: 'perplexity_content', text: afterText });
        newPerplexityMessageBuffer = afterText;
      }
      return newPerplexityMessageBuffer;
    },
    [addItem, pendingHistoryItemRef, setPendingHistoryItem],
  );

  const mergeThought = useCallback(
    (incoming: ThoughtSummary) => {
      setThought((prev) => {
        if (!prev) {
          return incoming;
        }
        const subject = incoming.subject || prev.subject;
        const description = `${prev.description ?? ''}${incoming.description ?? ''}`;
        return { subject, description };
      });
    },
    [setThought],
  );

  const handleThoughtEvent = useCallback(
    (eventValue: ThoughtSummary, currentThoughtBuffer: string): string => {
      if (turnCancelledRef.current) {
        return '';
      }

      // Extract the description text from the thought summary
      const thoughtText = eventValue.description ?? '';
      if (!thoughtText) {
        return currentThoughtBuffer;
      }

      const newThoughtBuffer = currentThoughtBuffer + thoughtText;

      // Update the thought state for the loading indicator
      mergeThought(eventValue);

      return newThoughtBuffer;
    },
    [mergeThought],
  );

  const handleUserCancelledEvent = useCallback(
    (userMessageTimestamp: number) => {
      if (turnCancelledRef.current) {
        return;
      }

      if (pendingHistoryItemRef.current) {
        if (pendingHistoryItemRef.current.type === 'tool_group') {
          const updatedTools = pendingHistoryItemRef.current.tools.map(
            (tool) =>
              tool.status === ToolCallStatus.Pending ||
              tool.status === ToolCallStatus.Confirming ||
              tool.status === ToolCallStatus.Executing
                ? { ...tool, status: ToolCallStatus.Canceled }
                : tool,
          );
          const pendingItem: HistoryItemToolGroup = {
            ...pendingHistoryItemRef.current,
            tools: updatedTools,
          };
          addItem(pendingItem, userMessageTimestamp);
        } else {
          addItem(pendingHistoryItemRef.current, userMessageTimestamp);
        }
        setPendingHistoryItem(null);
      }
      addItem(
        { type: MessageType.INFO, text: 'User cancelled the request.' },
        userMessageTimestamp,
      );
      setIsResponding(false);
      setThought(null); // Reset thought when user cancels
    },
    [addItem, pendingHistoryItemRef, setPendingHistoryItem, setThought],
  );

  const handleErrorEvent = useCallback(
    (eventValue: PerplexityErrorEventValue, userMessageTimestamp: number) => {
      if (pendingHistoryItemRef.current) {
        addItem(pendingHistoryItemRef.current, userMessageTimestamp);
        setPendingHistoryItem(null);
      }
      addItem(
        {
          type: MessageType.ERROR,
          text: parseAndFormatApiError(
            eventValue.error,
            config.getContentGeneratorConfig()?.authType,
            undefined,
            config.getModel(),
            DEFAULT_PERPLEXITY_FLASH_MODEL,
          ),
        },
        userMessageTimestamp,
      );
      setThought(null); // Reset thought when there's an error
    },
    [addItem, pendingHistoryItemRef, setPendingHistoryItem, config, setThought],
  );

  const handleCitationEvent = useCallback(
    (text: string, userMessageTimestamp: number) => {
      if (!showCitations(settings)) {
        return;
      }

      if (pendingHistoryItemRef.current) {
        addItem(pendingHistoryItemRef.current, userMessageTimestamp);
        setPendingHistoryItem(null);
      }
      addItem({ type: MessageType.INFO, text }, userMessageTimestamp);
    },
    [addItem, pendingHistoryItemRef, setPendingHistoryItem, settings],
  );

  const handleFinishedEvent = useCallback(
    (event: ServerPerplexityFinishedEvent, userMessageTimestamp: number) => {
      const finishReason = event.value.reason;
      if (!finishReason) {
        return;
      }

      const finishReasonMessages: Record<FinishReason, string | undefined> = {
        [FinishReason.FINISH_REASON_UNSPECIFIED]: undefined,
        [FinishReason.STOP]: undefined,
        [FinishReason.MAX_TOKENS]: 'Response truncated due to token limits.',
        [FinishReason.SAFETY]: 'Response stopped due to safety reasons.',
        [FinishReason.RECITATION]: 'Response stopped due to recitation policy.',
        [FinishReason.LANGUAGE]:
          'Response stopped due to unsupported language.',
        [FinishReason.BLOCKLIST]: 'Response stopped due to forbidden terms.',
        [FinishReason.PROHIBITED_CONTENT]:
          'Response stopped due to prohibited content.',
        [FinishReason.SPII]:
          'Response stopped due to sensitive personally identifiable information.',
        [FinishReason.OTHER]: 'Response stopped for other reasons.',
        [FinishReason.MALFORMED_FUNCTION_CALL]:
          'Response stopped due to malformed function call.',
        [FinishReason.IMAGE_SAFETY]:
          'Response stopped due to image safety violations.',
        [FinishReason.UNEXPECTED_TOOL_CALL]:
          'Response stopped due to unexpected tool call.',
      };

      const message = finishReasonMessages[finishReason];
      if (message) {
        addItem(
          {
            type: 'info',
            text: `⚠️  ${message}`,
          },
          userMessageTimestamp,
        );
      }
    },
    [addItem],
  );

  const handleChatCompressionEvent = useCallback(
    (
      eventValue: ServerPerplexityChatCompressedEvent['value'],
      userMessageTimestamp: number,
    ) => {
      if (pendingHistoryItemRef.current) {
        addItem(pendingHistoryItemRef.current, userMessageTimestamp);
        setPendingHistoryItem(null);
      }
      return addItem(
        {
          type: 'info',
          text:
            `IMPORTANT: This conversation approached the input token limit for ${config.getModel()}. ` +
            `A compressed context will be sent for future messages (compressed from: ` +
            `${eventValue?.originalTokenCount ?? 'unknown'} to ` +
            `${eventValue?.newTokenCount ?? 'unknown'} tokens).`,
        },
        Date.now(),
      );
    },
    [addItem, config, pendingHistoryItemRef, setPendingHistoryItem],
  );

  const handleMaxSessionTurnsEvent = useCallback(
    () =>
      addItem(
        {
          type: 'info',
          text:
            `The session has reached the maximum number of turns: ${config.getMaxSessionTurns()}. ` +
            `Please update this limit in your setting.json file.`,
        },
        Date.now(),
      ),
    [addItem, config],
  );

  const handleSessionTokenLimitExceededEvent = useCallback(
    (value: { currentTokens: number; limit: number; message: string }) =>
      addItem(
        {
          type: 'error',
          text:
            `🚫 Session token limit exceeded: ${value.currentTokens.toLocaleString()} tokens > ${value.limit.toLocaleString()} limit.\n\n` +
            `💡 Solutions:\n` +
            `   • Start a new session: Use /clear command\n` +
            `   • Increase limit: Add "sessionTokenLimit": (e.g., 128000) to your settings.json\n` +
            `   • Compress history: Use /compress command to compress history`,
        },
        Date.now(),
      ),
    [addItem],
  );

  const handleLoopDetectionConfirmation = useCallback(
    (result: { userSelection: 'disable' | 'keep' }) => {
      setLoopDetectionConfirmationRequest(null);

      if (result.userSelection === 'disable') {
        config
          .getPerplexityClient()
          .getLoopDetectionService()
          .disableForSession();
        addItem(
          {
            type: 'info',
            text: `Loop detection has been disabled for this session. Please try your request again.`,
          },
          Date.now(),
        );
      } else {
        addItem(
          {
            type: 'info',
            text: `A potential loop was detected. This can happen due to repetitive tool calls or other model behavior. The request has been halted.`,
          },
          Date.now(),
        );
      }
    },
    [config, addItem],
  );

  const handleLoopDetectedEvent = useCallback(() => {
    // Show the confirmation dialog to choose whether to disable loop detection
    setLoopDetectionConfirmationRequest({
      onComplete: handleLoopDetectionConfirmation,
    });
  }, [handleLoopDetectionConfirmation]);

  const processPerplexityStreamEvents = useCallback(
    async (
      stream: AsyncIterable<PerplexityEvent>,
      userMessageTimestamp: number,
      signal: AbortSignal,
    ): Promise<StreamProcessingStatus> => {
      let perplexityMessageBuffer = '';
      let thoughtBuffer = '';
      const toolCallRequests: ToolCallRequestInfo[] = [];
      for await (const event of stream) {
        switch (event.type) {
          case ServerPerplexityEventType.Thought:
            thoughtBuffer = handleThoughtEvent(event.value, thoughtBuffer);
            break;
          case ServerPerplexityEventType.Content:
            perplexityMessageBuffer = handleContentEvent(
              event.value,
              perplexityMessageBuffer,
              userMessageTimestamp,
            );
            break;
          case ServerPerplexityEventType.ToolCallRequest:
            toolCallRequests.push(event.value);
            break;
          case ServerPerplexityEventType.UserCancelled:
            handleUserCancelledEvent(userMessageTimestamp);
            break;
          case ServerPerplexityEventType.Error:
            handleErrorEvent(event.value, userMessageTimestamp);
            break;
          case ServerPerplexityEventType.ChatCompressed:
            handleChatCompressionEvent(event.value, userMessageTimestamp);
            break;
          case ServerPerplexityEventType.ToolCallConfirmation:
          case ServerPerplexityEventType.ToolCallResponse:
            // do nothing
            break;
          case ServerPerplexityEventType.MaxSessionTurns:
            handleMaxSessionTurnsEvent();
            break;
          case ServerPerplexityEventType.SessionTokenLimitExceeded:
            handleSessionTokenLimitExceededEvent(event.value);
            break;
          case ServerPerplexityEventType.Finished:
            handleFinishedEvent(
              event as ServerPerplexityFinishedEvent,
              userMessageTimestamp,
            );
            break;
          case ServerPerplexityEventType.Citation:
            handleCitationEvent(event.value, userMessageTimestamp);
            break;
          case ServerPerplexityEventType.LoopDetected:
            // handle later because we want to move pending history to history
            // before we add loop detected message to history
            loopDetectedRef.current = true;
            break;
          case ServerPerplexityEventType.Retry:
            // Will add the missing logic later
            break;
          default: {
            // enforces exhaustive switch-case
            const unreachable: never = event;
            return unreachable;
          }
        }
      }
      if (toolCallRequests.length > 0) {
        scheduleToolCalls(toolCallRequests, signal);
      }
      return StreamProcessingStatus.Completed;
    },
    [
      handleContentEvent,
      handleThoughtEvent,
      handleUserCancelledEvent,
      handleErrorEvent,
      scheduleToolCalls,
      handleChatCompressionEvent,
      handleFinishedEvent,
      handleMaxSessionTurnsEvent,
      handleSessionTokenLimitExceededEvent,
      handleCitationEvent,
    ],
  );

  const submitQuery = useCallback(
    async (
      query: PartListUnion,
      options?: { isContinuation: boolean },
      prompt_id?: string,
    ) => {
      // Prevent concurrent executions of submitQuery, but allow continuations
      // which are part of the same logical flow (tool responses)
      if (isSubmittingQueryRef.current && !options?.isContinuation) {
        return;
      }

      if (
        (streamingState === StreamingState.Responding ||
          streamingState === StreamingState.WaitingForConfirmation) &&
        !options?.isContinuation
      )
        return;

      // Set the flag to indicate we're now executing
      isSubmittingQueryRef.current = true;

      const userMessageTimestamp = Date.now();

      // Reset quota error flag when starting a new query (not a continuation)
      if (!options?.isContinuation) {
        setModelSwitchedFromQuotaError(false);
        config.setQuotaErrorOccurred(false);
      }

      abortControllerRef.current = new AbortController();
      const abortSignal = abortControllerRef.current.signal;
      turnCancelledRef.current = false;

      if (!prompt_id) {
        prompt_id = config.getSessionId() + '########' + getPromptCount();
      }

      return promptIdContext.run(prompt_id, async () => {
        const { queryToSend, shouldProceed } = await prepareQueryForPerplexity(
          query,
          userMessageTimestamp,
          abortSignal,
          prompt_id!,
        );

        if (!shouldProceed || queryToSend === null) {
          isSubmittingQueryRef.current = false;
          return;
        }

        // Handle vision switch requirement
        const visionSwitchResult = await handleVisionSwitch(
          queryToSend,
          userMessageTimestamp,
          options?.isContinuation || false,
        );

        if (!visionSwitchResult.shouldProceed) {
          isSubmittingQueryRef.current = false;
          return;
        }

        const finalQueryToSend = queryToSend;

        if (!options?.isContinuation) {
          // trigger new prompt event for session stats in CLI
          startNewPrompt();

          // log user prompt event for telemetry, only text prompts for now
          if (typeof queryToSend === 'string') {
            logUserPrompt(
              config,
              new UserPromptEvent(
                queryToSend.length,
                prompt_id,
                config.getContentGeneratorConfig()?.authType,
                queryToSend,
              ),
            );
          }

          // Reset thought when starting a new prompt
          setThought(null);
        }

        setIsResponding(true);

        try {
          const stream = perplexityClient.sendMessageStream(
            finalQueryToSend,
            abortSignal,
            prompt_id!,
            options,
          );
          const processingStatus = await processPerplexityStreamEvents(
            stream,
            userMessageTimestamp,
            abortSignal,
          );

          if (processingStatus === StreamProcessingStatus.UserCancelled) {
            // Restore original model if it was temporarily overridden
            restoreOriginalModel().catch((error) => {
              console.error('Failed to restore original model:', error);
            });
            isSubmittingQueryRef.current = false;
            return;
          }

          if (pendingHistoryItemRef.current) {
            addItem(pendingHistoryItemRef.current, userMessageTimestamp);
            setPendingHistoryItem(null);
          }
          if (loopDetectedRef.current) {
            loopDetectedRef.current = false;
            handleLoopDetectedEvent();
          }

          // Restore original model if it was temporarily overridden
          restoreOriginalModel().catch((error) => {
            console.error('Failed to restore original model:', error);
          });
        } catch (error: unknown) {
          // Restore original model if it was temporarily overridden
          restoreOriginalModel().catch((error) => {
            console.error('Failed to restore original model:', error);
          });

          if (error instanceof UnauthorizedError) {
            onAuthError('Session expired or is unauthorized.');
          } else if (!isNodeError(error) || error.name !== 'AbortError') {
            addItem(
              {
                type: MessageType.ERROR,
                text: parseAndFormatApiError(
                  getErrorMessage(error) || 'Unknown error',
                  config.getContentGeneratorConfig()?.authType,
                  undefined,
                  config.getModel(),
                  DEFAULT_PERPLEXITY_FLASH_MODEL,
                ),
              },
              userMessageTimestamp,
            );
          }
        } finally {
          setIsResponding(false);
          isSubmittingQueryRef.current = false;
        }
      });
    },
    [
      streamingState,
      setModelSwitchedFromQuotaError,
      prepareQueryForPerplexity,
      processPerplexityStreamEvents,
      pendingHistoryItemRef,
      addItem,
      setPendingHistoryItem,
      perplexityClient,
      onAuthError,
      config,
      startNewPrompt,
      getPromptCount,
      handleLoopDetectedEvent,
      handleVisionSwitch,
      restoreOriginalModel,
    ],
  );

  const handleApprovalModeChange = useCallback(
    async (newApprovalMode: ApprovalMode) => {
      // Auto-approve pending tool calls when switching to auto-approval modes
      if (
        newApprovalMode === ApprovalMode.YOLO ||
        newApprovalMode === ApprovalMode.AUTO_EDIT
      ) {
        let awaitingApprovalCalls = toolCalls.filter(
          (call): call is TrackedWaitingToolCall =>
            call.status === 'awaiting_approval',
        );

        // For AUTO_EDIT mode, only approve edit tools (replace, write_file)
        if (newApprovalMode === ApprovalMode.AUTO_EDIT) {
          awaitingApprovalCalls = awaitingApprovalCalls.filter((call) =>
            EDIT_TOOL_NAMES.has(call.request.name),
          );
        }

        // Process pending tool calls sequentially to reduce UI chaos
        for (const call of awaitingApprovalCalls) {
          if (call.confirmationDetails?.onConfirm) {
            try {
              await call.confirmationDetails.onConfirm(
                ToolConfirmationOutcome.ProceedOnce,
              );
            } catch (error) {
              console.error(
                `Failed to auto-approve tool call ${call.request.callId}:`,
                error,
              );
            }
          }
        }
      }
    },
    [toolCalls],
  );

  const handleCompletedTools = useCallback(
    async (completedToolCallsFromScheduler: TrackedToolCall[]) => {
      if (isResponding) {
        return;
      }

      const completedAndReadyToSubmitTools =
        completedToolCallsFromScheduler.filter(
          (
            tc: TrackedToolCall,
          ): tc is TrackedCompletedToolCall | TrackedCancelledToolCall => {
            const isTerminalState =
              tc.status === 'success' ||
              tc.status === 'error' ||
              tc.status === 'cancelled';

            if (isTerminalState) {
              const completedOrCancelledCall = tc as
                | TrackedCompletedToolCall
                | TrackedCancelledToolCall;
              return (
                completedOrCancelledCall.response?.responseParts !== undefined
              );
            }
            return false;
          },
        );

      // Finalize any client-initiated tools as soon as they are done.
      const clientTools = completedAndReadyToSubmitTools.filter(
        (t) => t.request.isClientInitiated,
      );
      if (clientTools.length > 0) {
        markToolsAsSubmitted(clientTools.map((t) => t.request.callId));
      }

      // Identify new, successful save_memory calls that we haven't processed yet.
      const newSuccessfulMemorySaves = completedAndReadyToSubmitTools.filter(
        (t) =>
          t.request.name === 'save_memory' &&
          t.status === 'success' &&
          !processedMemoryToolsRef.current.has(t.request.callId),
      );

      if (newSuccessfulMemorySaves.length > 0) {
        // Perform the refresh only if there are new ones.
        void performMemoryRefresh();
        // Mark them as processed so we don't do this again on the next render.
        newSuccessfulMemorySaves.forEach((t) =>
          processedMemoryToolsRef.current.add(t.request.callId),
        );
      }

      const perplexityTools = completedAndReadyToSubmitTools.filter(
        (t) => !t.request.isClientInitiated,
      );

      if (perplexityTools.length === 0) {
        return;
      }

      // If all the tools were cancelled, don't submit a response to Perplexity.
      const allToolsCancelled = perplexityTools.every(
        (tc) => tc.status === 'cancelled',
      );

      if (allToolsCancelled) {
        if (perplexityClient) {
          // We need to manually add the function responses to the history
          // so the model knows the tools were cancelled.
          const combinedParts = perplexityTools.flatMap(
            (toolCall) => toolCall.response.responseParts,
          );
          perplexityClient.addHistory({
            role: 'user',
            parts: combinedParts,
          });
        }

        const callIdsToMarkAsSubmitted = perplexityTools.map(
          (toolCall) => toolCall.request.callId,
        );
        markToolsAsSubmitted(callIdsToMarkAsSubmitted);
        return;
      }

      const responsesToSend: Part[] = perplexityTools.flatMap(
        (toolCall) => toolCall.response.responseParts,
      );
      const callIdsToMarkAsSubmitted = perplexityTools.map(
        (toolCall) => toolCall.request.callId,
      );

      const prompt_ids = perplexityTools.map(
        (toolCall) => toolCall.request.prompt_id,
      );

      markToolsAsSubmitted(callIdsToMarkAsSubmitted);

      // Don't continue if model was switched due to quota error
      if (modelSwitchedFromQuotaError) {
        return;
      }

      submitQuery(
        responsesToSend,
        {
          isContinuation: true,
        },
        prompt_ids[0],
      );
    },
    [
      isResponding,
      submitQuery,
      markToolsAsSubmitted,
      perplexityClient,
      performMemoryRefresh,
      modelSwitchedFromQuotaError,
    ],
  );

  const pendingHistoryItems = useMemo(
    () =>
      [pendingHistoryItem, pendingToolCallGroupDisplay].filter(
        (i) => i !== undefined && i !== null,
      ),
    [pendingHistoryItem, pendingToolCallGroupDisplay],
  );

  useEffect(() => {
    const saveRestorableToolCalls = async () => {
      if (!config.getCheckpointingEnabled()) {
        return;
      }
      const restorableToolCalls = toolCalls.filter(
        (toolCall) =>
          EDIT_TOOL_NAMES.has(toolCall.request.name) &&
          toolCall.status === 'awaiting_approval' &&
          !processedCheckpointsRef.current.has(toolCall.request.callId),
      );

      if (restorableToolCalls.length > 0) {
        const checkpointDir = storage.getProjectTempCheckpointsDir();

        if (!checkpointDir) {
          return;
        }

        try {
          await fs.mkdir(checkpointDir, { recursive: true });
        } catch (error) {
          if (!isNodeError(error) || error.code !== 'EEXIST') {
            onDebugMessage(
              `Failed to create checkpoint directory: ${getErrorMessage(error)}`,
            );
            return;
          }
        }

        for (const toolCall of restorableToolCalls) {
          const filePath = toolCall.request.args['file_path'] as string;
          if (!filePath) {
            onDebugMessage(
              `Skipping restorable tool call due to missing file_path: ${toolCall.request.name}`,
            );
            continue;
          }

          try {
            if (!gitService) {
              onDebugMessage(
                `Checkpointing is enabled but Git service is not available. Failed to create snapshot for ${filePath}. Ensure Git is installed and working properly.`,
              );
              continue;
            }

            let commitHash: string | undefined;
            try {
              commitHash = await gitService.createFileSnapshot(
                `Snapshot for ${toolCall.request.name}`,
              );
            } catch (error) {
              onDebugMessage(
                `Failed to create new snapshot: ${getErrorMessage(error)}. Attempting to use current commit.`,
              );
            }

            if (!commitHash) {
              commitHash = await gitService.getCurrentCommitHash();
            }

            if (!commitHash) {
              onDebugMessage(
                `Failed to create snapshot for ${filePath}. Checkpointing may not be working properly. Ensure Git is installed and the project directory is accessible.`,
              );
              continue;
            }

            const timestamp = new Date()
              .toISOString()
              .replace(/:/g, '-')
              .replace(/\./g, '_');
            const toolName = toolCall.request.name;
            const fileName = path.basename(filePath);
            const toolCallWithSnapshotFileName = `${timestamp}-${fileName}-${toolName}.json`;
            const clientHistory = await perplexityClient?.getHistory();
            const toolCallWithSnapshotFilePath = path.join(
              checkpointDir,
              toolCallWithSnapshotFileName,
            );

            await fs.writeFile(
              toolCallWithSnapshotFilePath,
              JSON.stringify(
                {
                  history,
                  clientHistory,
                  toolCall: {
                    name: toolCall.request.name,
                    args: toolCall.request.args,
                  },
                  commitHash,
                  filePath,
                },
                null,
                2,
              ),
            );
            processedCheckpointsRef.current.add(toolCall.request.callId);
          } catch (error) {
            onDebugMessage(
              `Failed to create checkpoint for ${filePath}: ${getErrorMessage(
                error,
              )}. This may indicate a problem with Git or file system permissions.`,
            );
          }
        }
      }
    };
    saveRestorableToolCalls();
  }, [
    toolCalls,
    config,
    onDebugMessage,
    gitService,
    history,
    perplexityClient,
    storage,
  ]);

  return {
    streamingState,
    submitQuery,
    pendingHistoryItems,
    thought,
    cancelOngoingRequest,
    pendingToolCalls: toolCalls,
    handleApprovalModeChange,
    activePtyId,
    loopDetectionConfirmationRequest,
  };
};
