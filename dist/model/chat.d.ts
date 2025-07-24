/**
 * Possible roles in a chat message.
 */
export declare enum ChatMessageRole {
    SYSTEM = "system",
    USER = "user",
    ASSISTANT = "assistant"
}
/**
 * Represents one message in the conversation.
 */
export interface ChatMessage {
    role: ChatMessageRole;
    content: string;
    answer?: string;
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
     * Any additional fields supported by Venice's chat endpoint.
     */
    [key: string]: unknown;
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
    object: string;
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
