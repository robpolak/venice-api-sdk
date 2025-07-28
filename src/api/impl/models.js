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
exports.ModelsApi = void 0;
const api_request_1 = require('../api-request');
/**
 * This class provides methods to interact with the Models endpoints.
 */
class ModelsApi extends api_request_1.ApiRequest {
  /**
   * Constructs a new ModelsApi object.
   *
   * @param core - The VeniceCore instance containing user options (apiKey, etc).
   */
  constructor(core) {
    super(core);
  }
  /**
   * Lists all models available in the Venice API.
   *
   * @param params - Optional query parameters such as limit and offset.
   * @returns A promise resolving to a ListModelsResponse object.
   */
  listModels(params) {
    return __awaiter(this, void 0, void 0, function* () {
      const resp = this.get('/models', { params });
      return resp;
    });
  }
}
exports.ModelsApi = ModelsApi;
