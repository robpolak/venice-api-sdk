/**
 * Possible roles in a chat message.
 */
export enum ChatMessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * Represents one message in the conversation.
 */
export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  answer?: string;
  /**
   * If the response was requested with a structured response format (e.g. JSON schema),
   * this field will contain the parsed object when available.
   */
  parsed?: unknown;
}

/**
 * Request body for creating a chat completion.
 */
export interface ChatCompletionRequest {
  /**
   * The identifier of the Venice model to use (e.g., "fluently-xl", "flux-dev").
   */
  model: string;

  /**
   * The conversation so far.
   */
  messages: ChatMessage[];

  /**
   * Sampling temperature (0 to 2).
   * Higher values = more randomness.
   */
  temperature?: number;

  /**
   * Alternative to temperature that defines how tokens are sampled.
   * Typically between 0 and 1.
   */
  top_p?: number;

  /**
   * Structured response format following OpenAI-compatible schema.
   * When provided, the API will try to return output matching the schema.
   */
  response_format?: ResponseFormat;

  /**
   * Any additional fields supported by Venice's chat endpoint.
   */
  [key: string]: unknown;
}

/**
 * Supported response format for structured outputs.
 * This follows the OpenAI-compatible shape used by Venice.
 *
 * Note: Not all models support structured responses. Check model capabilities
 * for supportsResponseSchema.
 */
export type ResponseFormat = JsonSchemaResponseFormat | Record<string, unknown>;

/**
 * OpenAI-compatible JSON schema response format.
 * See docs: https://docs.venice.ai/overview/guides/structured-responses
 */
export interface JsonSchemaResponseFormat {
  type: 'json_schema';
  json_schema: {
    /** A name for the schema */
    name: string;
    /** Must be true for strict schema enforcement */
    strict: boolean;
    /** The JSON schema object. Use additionalProperties: false and include required fields. */
    schema: Record<string, unknown>;
  };
}

/**
 * One choice in the chat completion response.
 */
export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason?: string;
}

/**
 * The response when a chat completion is created.
 */
export interface ChatCompletionResponse {
  id: string;
  object: string; // e.g., 'chat.completion'
  created: number;
  model: string;
  choices: ChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  [key: string]: unknown;
}
