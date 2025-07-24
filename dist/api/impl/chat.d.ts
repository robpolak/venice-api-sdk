import { ApiRequest } from '../api-request';
import { VeniceCore } from '../../core/venice-core';
import { ChatCompletionRequest, ChatCompletionResponse } from '../../model/chat';
/**
 * Provides methods to interact with the Chat Completions endpoint.
 */
export declare class ChatApi extends ApiRequest {
    constructor(core: VeniceCore);
    /**
     * POST /chat/completions
     * Creates a chat completion using the specified model, messages, and parameters.
     */
    createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
}
