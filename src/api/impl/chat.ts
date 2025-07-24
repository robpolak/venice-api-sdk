import { ApiRequest } from '../api-request';
import { VeniceCore } from '../../core/venice-core';
import { ChatCompletionRequest, ChatCompletionResponse, ChatChoice } from '../../model/chat';

function separateThinkAndAnswer(content: string): {
  thinkBlock: string;
  finalAnswer: string;
} {
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

// Extend ChatChoice to include thinkBlock
interface ExtendedChatChoice extends ChatChoice {
  thinkBlock?: string;
}

/**
 * Provides methods to interact with the Chat Completions endpoint.
 */
export class ChatApi extends ApiRequest {
  constructor(core: VeniceCore) {
    // Adjust if your base URL is different (e.g. https://api.venice.ai).
    super(core);
  }

  /**
   * POST /chat/completions
   * Creates a chat completion using the specified model, messages, and parameters.
   */
  public async createChatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const resp = await this.post<ChatCompletionResponse>('/chat/completions', request);

    // Loop over each choice and parse out the <think> block from the content.
    resp?.choices?.forEach(choice => {
      if (typeof choice?.message?.content === 'string') {
        const rawContent = choice.message.content;
        const { thinkBlock, finalAnswer } = separateThinkAndAnswer(rawContent);

        // Overwrite the message content with the final answer
        choice.message.answer = finalAnswer;

        // Attach the think block as a custom field on this choice.
        (choice as ExtendedChatChoice).thinkBlock = thinkBlock;
      }
    });

    return resp;
  }
}
