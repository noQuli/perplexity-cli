/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const SERVICE_NAME = 'perplexity-code';

export const EVENT_USER_PROMPT = 'perplexity-code.user_prompt';
export const EVENT_TOOL_CALL = 'perplexity-code.tool_call';
export const EVENT_API_REQUEST = 'perplexity-code.api_request';
export const EVENT_API_ERROR = 'perplexity-code.api_error';
export const EVENT_API_CANCEL = 'perplexity-code.api_cancel';
export const EVENT_API_RESPONSE = 'perplexity-code.api_response';
export const EVENT_CLI_CONFIG = 'perplexity-code.config';
export const EVENT_EXTENSION_DISABLE = 'perplexity-code.extension_disable';
export const EVENT_EXTENSION_ENABLE = 'perplexity-code.extension_enable';
export const EVENT_EXTENSION_INSTALL = 'perplexity-code.extension_install';
export const EVENT_EXTENSION_UNINSTALL = 'perplexity-code.extension_uninstall';
export const EVENT_FLASH_FALLBACK = 'perplexity-code.flash_fallback';
export const EVENT_RIPGREP_FALLBACK = 'perplexity-code.ripgrep_fallback';
export const EVENT_NEXT_SPEAKER_CHECK = 'perplexity-code.next_speaker_check';
export const EVENT_SLASH_COMMAND = 'perplexity-code.slash_command';
export const EVENT_IDE_CONNECTION = 'perplexity-code.ide_connection';
export const EVENT_CHAT_COMPRESSION = 'perplexity-code.chat_compression';
export const EVENT_INVALID_CHUNK = 'perplexity-code.chat.invalid_chunk';
export const EVENT_CONTENT_RETRY = 'perplexity-code.chat.content_retry';
export const EVENT_CONTENT_RETRY_FAILURE =
  'perplexity-code.chat.content_retry_failure';
export const EVENT_CONVERSATION_FINISHED =
  'perplexity-code.conversation_finished';
export const EVENT_MALFORMED_JSON_RESPONSE =
  'perplexity-code.malformed_json_response';
export const EVENT_FILE_OPERATION = 'perplexity-code.file_operation';
export const EVENT_MODEL_SLASH_COMMAND = 'perplexity-code.slash_command.model';
export const EVENT_SUBAGENT_EXECUTION = 'perplexity-code.subagent_execution';
export const EVENT_AUTH = 'perplexity-code.auth';

// Performance Events
export const EVENT_STARTUP_PERFORMANCE = 'perplexity-code.startup.performance';
export const EVENT_MEMORY_USAGE = 'perplexity-code.memory.usage';
export const EVENT_PERFORMANCE_BASELINE =
  'perplexity-code.performance.baseline';
export const EVENT_PERFORMANCE_REGRESSION =
  'perplexity-code.performance.regression';
