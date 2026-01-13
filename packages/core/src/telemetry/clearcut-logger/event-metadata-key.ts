/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Defines valid event metadata keys for Perplexity logging.
export enum EventMetadataKey {
  // Deleted enums: 24

  PERPLEXITY_CLI_KEY_UNKNOWN = 0,

  // ==========================================================================
  // Start Session Event Keys
  // ===========================================================================

  // Logs the model id used in the session.
  PERPLEXITY_CLI_START_SESSION_MODEL = 1,

  // Logs the embedding model id used in the session.
  PERPLEXITY_CLI_START_SESSION_EMBEDDING_MODEL = 2,

  // Logs the sandbox that was used in the session.
  PERPLEXITY_CLI_START_SESSION_SANDBOX = 3,

  // Logs the core tools that were enabled in the session.
  PERPLEXITY_CLI_START_SESSION_CORE_TOOLS = 4,

  // Logs the approval mode that was used in the session.
  PERPLEXITY_CLI_START_SESSION_APPROVAL_MODE = 5,

  // Logs whether an API key was used in the session.
  PERPLEXITY_CLI_START_SESSION_API_KEY_ENABLED = 6,

  // Logs whether the Vertex API was used in the session.
  PERPLEXITY_CLI_START_SESSION_VERTEX_API_ENABLED = 7,

  // Logs whether debug mode was enabled in the session.
  PERPLEXITY_CLI_START_SESSION_DEBUG_MODE_ENABLED = 8,

  // Logs the MCP servers that were enabled in the session.
  PERPLEXITY_CLI_START_SESSION_MCP_SERVERS = 9,

  // Logs whether user-collected telemetry was enabled in the session.
  PERPLEXITY_CLI_START_SESSION_TELEMETRY_ENABLED = 10,

  // Logs whether prompt collection was enabled for user-collected telemetry.
  PERPLEXITY_CLI_START_SESSION_TELEMETRY_LOG_USER_PROMPTS_ENABLED = 11,

  // Logs whether the session was configured to respect gitignore files.
  PERPLEXITY_CLI_START_SESSION_RESPECT_GITIGNORE = 12,

  // Logs the output format of the session.
  PERPLEXITY_CLI_START_SESSION_OUTPUT_FORMAT = 94,

  // ==========================================================================
  // User Prompt Event Keys
  // ===========================================================================

  // Logs the length of the prompt.
  PERPLEXITY_CLI_USER_PROMPT_LENGTH = 13,

  // ==========================================================================
  // Tool Call Event Keys
  // ===========================================================================

  // Logs the function name.
  PERPLEXITY_CLI_TOOL_CALL_NAME = 14,

  // Logs the MCP server name.
  PERPLEXITY_CLI_TOOL_CALL_MCP_SERVER_NAME = 95,

  // Logs the user's decision about how to handle the tool call.
  PERPLEXITY_CLI_TOOL_CALL_DECISION = 15,

  // Logs whether the tool call succeeded.
  PERPLEXITY_CLI_TOOL_CALL_SUCCESS = 16,

  // Logs the tool call duration in milliseconds.
  PERPLEXITY_CLI_TOOL_CALL_DURATION_MS = 17,

  // Logs the tool call error message, if any.
  PERPLEXITY_CLI_TOOL_ERROR_MESSAGE = 18,

  // Logs the tool call error type, if any.
  PERPLEXITY_CLI_TOOL_CALL_ERROR_TYPE = 19,

  // Logs the length of tool output
  PERPLEXITY_CLI_TOOL_CALL_CONTENT_LENGTH = 93,

  // ==========================================================================
  // GenAI API Request Event Keys
  // ===========================================================================

  // Logs the model id of the request.
  PERPLEXITY_CLI_API_REQUEST_MODEL = 20,

  // ==========================================================================
  // GenAI API Response Event Keys
  // ===========================================================================

  // Logs the model id of the API call.
  PERPLEXITY_CLI_API_RESPONSE_MODEL = 21,

  // Logs the status code of the response.
  PERPLEXITY_CLI_API_RESPONSE_STATUS_CODE = 22,

  // Logs the duration of the API call in milliseconds.
  PERPLEXITY_CLI_API_RESPONSE_DURATION_MS = 23,

  // Logs the input token count of the API call.
  PERPLEXITY_CLI_API_RESPONSE_INPUT_TOKEN_COUNT = 25,

  // Logs the output token count of the API call.
  PERPLEXITY_CLI_API_RESPONSE_OUTPUT_TOKEN_COUNT = 26,

  // Logs the cached token count of the API call.
  PERPLEXITY_CLI_API_RESPONSE_CACHED_TOKEN_COUNT = 27,

  // Logs the thinking token count of the API call.
  PERPLEXITY_CLI_API_RESPONSE_THINKING_TOKEN_COUNT = 28,

  // Logs the tool use token count of the API call.
  PERPLEXITY_CLI_API_RESPONSE_TOOL_TOKEN_COUNT = 29,

  // ==========================================================================
  // GenAI API Error Event Keys
  // ===========================================================================

  // Logs the model id of the API call.
  PERPLEXITY_CLI_API_ERROR_MODEL = 30,

  // Logs the error type.
  PERPLEXITY_CLI_API_ERROR_TYPE = 31,

  // Logs the status code of the error response.
  PERPLEXITY_CLI_API_ERROR_STATUS_CODE = 32,

  // Logs the duration of the API call in milliseconds.
  PERPLEXITY_CLI_API_ERROR_DURATION_MS = 33,

  // ==========================================================================
  // End Session Event Keys
  // ===========================================================================

  // Logs the end of a session.
  PERPLEXITY_CLI_END_SESSION_ID = 34,

  // ==========================================================================
  // Shared Keys
  // ===========================================================================

  // Logs the Prompt Id
  PERPLEXITY_CLI_PROMPT_ID = 35,

  // Logs the Auth type for the prompt, api responses and errors.
  PERPLEXITY_CLI_AUTH_TYPE = 36,

  // Logs the total number of Google accounts ever used.
  PERPLEXITY_CLI_GOOGLE_ACCOUNTS_COUNT = 37,

  // Logs the Surface from where the Perplexity CLI was invoked, eg: VSCode.
  PERPLEXITY_CLI_SURFACE = 39,

  // Logs the session id
  PERPLEXITY_CLI_SESSION_ID = 40,

  // Logs the Perplexity CLI version
  PERPLEXITY_CLI_VERSION = 54,

  // Logs the Perplexity CLI Git commit hash
  PERPLEXITY_CLI_GIT_COMMIT_HASH = 55,

  // Logs the Perplexity CLI OS
  PERPLEXITY_CLI_OS = 82,

  // Logs active user settings
  PERPLEXITY_CLI_USER_SETTINGS = 84,

  // ==========================================================================
  // Loop Detected Event Keys
  // ===========================================================================

  // Logs the type of loop detected.
  PERPLEXITY_CLI_LOOP_DETECTED_TYPE = 38,

  // ==========================================================================
  // Slash Command Event Keys
  // ===========================================================================

  // Logs the name of the slash command.
  PERPLEXITY_CLI_SLASH_COMMAND_NAME = 41,

  // Logs the subcommand of the slash command.
  PERPLEXITY_CLI_SLASH_COMMAND_SUBCOMMAND = 42,

  // Logs the status of the slash command (e.g. 'success', 'error')
  PERPLEXITY_CLI_SLASH_COMMAND_STATUS = 51,

  // ==========================================================================
  // Next Speaker Check Event Keys
  // ===========================================================================

  // Logs the finish reason of the previous streamGenerateContent response
  PERPLEXITY_CLI_RESPONSE_FINISH_REASON = 43,

  // Logs the result of the next speaker check
  PERPLEXITY_CLI_NEXT_SPEAKER_CHECK_RESULT = 44,

  // ==========================================================================
  // Malformed JSON Response Event Keys
  // ==========================================================================

  // Logs the model that produced the malformed JSON response.
  PERPLEXITY_CLI_MALFORMED_JSON_RESPONSE_MODEL = 45,

  // ==========================================================================
  // IDE Connection Event Keys
  // ===========================================================================

  // Logs the type of the IDE connection.
  PERPLEXITY_CLI_IDE_CONNECTION_TYPE = 46,

  // Logs AI added lines in edit/write tool response.
  PERPLEXITY_CLI_AI_ADDED_LINES = 47,

  // Logs AI removed lines in edit/write tool response.
  PERPLEXITY_CLI_AI_REMOVED_LINES = 48,

  // Logs user added lines in edit/write tool response.
  PERPLEXITY_CLI_USER_ADDED_LINES = 49,

  // Logs user removed lines in edit/write tool response.
  PERPLEXITY_CLI_USER_REMOVED_LINES = 50,

  // Logs AI added characters in edit/write tool response.
  PERPLEXITY_CLI_AI_ADDED_CHARS = 103,

  // Logs AI removed characters in edit/write tool response.
  PERPLEXITY_CLI_AI_REMOVED_CHARS = 104,

  // Logs user added characters in edit/write tool response.
  PERPLEXITY_CLI_USER_ADDED_CHARS = 105,

  // Logs user removed characters in edit/write tool response.
  PERPLEXITY_CLI_USER_REMOVED_CHARS = 106,

  // ==========================================================================
  // Kitty Sequence Overflow Event Keys
  // ===========================================================================

  // Logs the truncated kitty sequence.
  PERPLEXITY_CLI_KITTY_TRUNCATED_SEQUENCE = 52,

  // Logs the length of the kitty sequence that overflowed.
  PERPLEXITY_CLI_KITTY_SEQUENCE_LENGTH = 53,

  // ==========================================================================
  // Conversation Finished Event Keys
  // ===========================================================================

  // Logs the approval mode of the session.
  PERPLEXITY_CLI_APPROVAL_MODE = 58,

  // Logs the number of turns
  PERPLEXITY_CLI_CONVERSATION_TURN_COUNT = 59,

  // Logs the number of tokens before context window compression.
  PERPLEXITY_CLI_COMPRESSION_TOKENS_BEFORE = 60,

  // Logs the number of tokens after context window compression.
  PERPLEXITY_CLI_COMPRESSION_TOKENS_AFTER = 61,

  // Logs tool type whether it is mcp or native.
  PERPLEXITY_CLI_TOOL_TYPE = 62,

  // Logs count of MCP servers in Start Session Event
  PERPLEXITY_CLI_START_SESSION_MCP_SERVERS_COUNT = 63,

  // Logs count of MCP tools in Start Session Event
  PERPLEXITY_CLI_START_SESSION_MCP_TOOLS_COUNT = 64,

  // Logs name of MCP tools as comma separated string
  PERPLEXITY_CLI_START_SESSION_MCP_TOOLS = 65,

  // ==========================================================================
  // Research Event Keys
  // ===========================================================================

  // Logs the research opt-in status (true/false)
  PERPLEXITY_CLI_RESEARCH_OPT_IN_STATUS = 66,

  // Logs the contact email for research participation
  PERPLEXITY_CLI_RESEARCH_CONTACT_EMAIL = 67,

  // Logs the user ID for research events
  PERPLEXITY_CLI_RESEARCH_USER_ID = 68,

  // Logs the type of research feedback
  PERPLEXITY_CLI_RESEARCH_FEEDBACK_TYPE = 69,

  // Logs the content of research feedback
  PERPLEXITY_CLI_RESEARCH_FEEDBACK_CONTENT = 70,

  // Logs survey responses for research feedback (JSON stringified)
  PERPLEXITY_CLI_RESEARCH_SURVEY_RESPONSES = 71,

  // ==========================================================================
  // File Operation Event Keys
  // ===========================================================================

  // Logs the programming language of the project.
  PERPLEXITY_CLI_PROGRAMMING_LANGUAGE = 56,

  // Logs the operation type of the file operation.
  PERPLEXITY_CLI_FILE_OPERATION_TYPE = 57,

  // Logs the number of lines in the file operation.
  PERPLEXITY_CLI_FILE_OPERATION_LINES = 72,

  // Logs the mimetype of the file in the file operation.
  PERPLEXITY_CLI_FILE_OPERATION_MIMETYPE = 73,

  // Logs the extension of the file in the file operation.
  PERPLEXITY_CLI_FILE_OPERATION_EXTENSION = 74,

  // ==========================================================================
  // Content Streaming Event Keys
  // ===========================================================================

  // Logs the error message for an invalid chunk.
  PERPLEXITY_CLI_INVALID_CHUNK_ERROR_MESSAGE = 75,

  // Logs the attempt number for a content retry.
  PERPLEXITY_CLI_CONTENT_RETRY_ATTEMPT_NUMBER = 76,

  // Logs the error type for a content retry.
  PERPLEXITY_CLI_CONTENT_RETRY_ERROR_TYPE = 77,

  // Logs the delay in milliseconds for a content retry.
  PERPLEXITY_CLI_CONTENT_RETRY_DELAY_MS = 78,

  // Logs the total number of attempts for a content retry failure.
  PERPLEXITY_CLI_CONTENT_RETRY_FAILURE_TOTAL_ATTEMPTS = 79,

  // Logs the final error type for a content retry failure.
  PERPLEXITY_CLI_CONTENT_RETRY_FAILURE_FINAL_ERROR_TYPE = 80,

  // Logs the total duration in milliseconds for a content retry failure.
  PERPLEXITY_CLI_CONTENT_RETRY_FAILURE_TOTAL_DURATION_MS = 81,

  // Logs the current nodejs version
  PERPLEXITY_CLI_NODE_VERSION = 83,

  // ==========================================================================
  // Extension Install Event Keys
  // ===========================================================================

  // Logs the name of the extension.
  PERPLEXITY_CLI_EXTENSION_NAME = 85,

  // Logs the version of the extension.
  PERPLEXITY_CLI_EXTENSION_VERSION = 86,

  // Logs the source of the extension.
  PERPLEXITY_CLI_EXTENSION_SOURCE = 87,

  // Logs the status of the extension install.
  PERPLEXITY_CLI_EXTENSION_INSTALL_STATUS = 88,

  // Logs the status of the extension uninstall
  PERPLEXITY_CLI_EXTENSION_UNINSTALL_STATUS = 96,

  // Logs the setting scope for an extension enablement.
  PERPLEXITY_CLI_EXTENSION_ENABLE_SETTING_SCOPE = 102,

  // Logs the setting scope for an extension disablement.
  PERPLEXITY_CLI_EXTENSION_DISABLE_SETTING_SCOPE = 107,

  // ==========================================================================
  // Tool Output Truncated Event Keys
  // ===========================================================================

  // Logs the original length of the tool output.
  PERPLEXITY_CLI_TOOL_OUTPUT_TRUNCATED_ORIGINAL_LENGTH = 89,

  // Logs the truncated length of the tool output.
  PERPLEXITY_CLI_TOOL_OUTPUT_TRUNCATED_TRUNCATED_LENGTH = 90,

  // Logs the threshold at which the tool output was truncated.
  PERPLEXITY_CLI_TOOL_OUTPUT_TRUNCATED_THRESHOLD = 91,

  // Logs the number of lines the tool output was truncated to.
  PERPLEXITY_CLI_TOOL_OUTPUT_TRUNCATED_LINES = 92,

  // ==========================================================================
  // Model Router Event Keys
  // ==========================================================================

  // Logs the outcome of a model routing decision (e.g., which route/model was
  // selected).
  PERPLEXITY_CLI_ROUTING_DECISION = 97,

  // Logs an event when the model router fails to make a decision or the chosen
  // route fails.
  PERPLEXITY_CLI_ROUTING_FAILURE = 98,

  // Logs the latency in milliseconds for the router to make a decision.
  PERPLEXITY_CLI_ROUTING_LATENCY_MS = 99,

  // Logs a specific reason for a routing failure.
  PERPLEXITY_CLI_ROUTING_FAILURE_REASON = 100,

  // Logs the source of the decision.
  PERPLEXITY_CLI_ROUTING_DECISION_SOURCE = 101,

  // Logs an event when the user uses the /model command.
  PERPLEXITY_CLI_MODEL_SLASH_COMMAND = 108,
}
