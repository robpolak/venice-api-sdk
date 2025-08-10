"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatApi = void 0;
const api_request_1 = require("../api-request");
function separateThinkAndAnswer(content) {
    const startTag = '<think>';
    const endTag = '</think>';
    const startIndex = content.indexOf(startTag);
    const endIndex = content.indexOf(endTag);
    // If the <think> block is not found, just return the entire content as finalAnswer
    if (startIndex === -1 || endIndex === -1) {
        return {
            thinkBlock: '',
            finalAnswer: content.trim(),
        };
    }
    // Extract the think block (everything between <think> and </think>)
    const thinkBlock = content.substring(startIndex + startTag.length, endIndex).trim();
    // Extract the final answer (anything after </think>)
    const finalAnswer = content.substring(endIndex + endTag.length).trim();
    return {
        thinkBlock,
        finalAnswer,
    };
}
/**
 * Provides methods to interact with the Chat Completions endpoint.
 */
class ChatApi extends api_request_1.ApiRequest {
    constructor(core) {
        // Adjust if your base URL is different (e.g. https://api.venice.ai).
        super(core);
    }
    /**
     * POST /chat/completions
     * Creates a chat completion using the specified model, messages, and parameters.
     */
    async createChatCompletion(request) {
        const resp = await this.post('/chat/completions', request);
        // Loop over each choice and:
        // - parse out <think> blocks
        // - attempt to JSON.parse structured outputs when present
        resp?.choices?.forEach(choice => {
            const message = choice?.message;
            if (message != null && typeof message.content === 'string') {
                const rawContent = message.content;
                const { thinkBlock, finalAnswer } = separateThinkAndAnswer(rawContent);
                // Overwrite the message answer with the final answer segment
                message.answer = finalAnswer;
                choice.thinkBlock = thinkBlock;
                // If the model returned a structured JSON object as the primary content,
                // try to parse it to expose a typed object for consumers.
                const trimmed = (finalAnswer || rawContent).trim();
                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
                    (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                    try {
                        message.parsed = JSON.parse(trimmed);
                    }
                    catch {
                        // best-effort; leave parsed undefined if not valid JSON
                    }
                }
            }
        });
        return resp;
    }
}
exports.ChatApi = ChatApi;
