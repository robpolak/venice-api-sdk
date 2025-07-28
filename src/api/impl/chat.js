'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ChatApi = void 0;
const api_request_1 = require('../api-request');
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
  createChatCompletion(request) {
    return __awaiter(this, void 0, void 0, function* () {
      var _a;
      const resp = yield this.post('/chat/completions', request);
      // Loop over each choice and parse out the <think> block from the content.
      (_a = resp === null || resp === void 0 ? void 0 : resp.choices) === null || _a === void 0
        ? void 0
        : _a.forEach(choice => {
            var _a;
            if (
              typeof ((_a = choice === null || choice === void 0 ? void 0 : choice.message) ===
                null || _a === void 0
                ? void 0
                : _a.content) === 'string'
            ) {
              const rawContent = choice.message.content;
              const { thinkBlock, finalAnswer } = separateThinkAndAnswer(rawContent);
              // Overwrite the message content with the final answer
              choice.message.answer = finalAnswer;
              // Optionally attach the think block as a custom field on this choice.
              // Casting to 'any' if you don't have a dedicated property in ChatChoice for it.
              choice.thinkBlock = thinkBlock;
            }
          });
      return resp;
    });
  }
}
exports.ChatApi = ChatApi;
