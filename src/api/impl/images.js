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
exports.ImagesApi = void 0;
const api_request_1 = require('../api-request');
/**
 * Provides methods to interact with the Image generation endpoint.
 */
class ImagesApi extends api_request_1.ApiRequest {
  constructor(core) {
    // Adjust if your base URL is different (e.g. https://api.venice.ai).
    super(core);
  }
  /**
   * POST /image/generate
   * Generates one or more images based on the given prompt and model.
   */
  generateImages(request) {
    return __awaiter(this, void 0, void 0, function* () {
      // According to the docs, the endpoint for image generation is /image/generate
      return this.post('/image/generate', request);
    });
  }
}
exports.ImagesApi = ImagesApi;
