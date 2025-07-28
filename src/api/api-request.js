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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ApiRequest = void 0;
const axios_1 = __importDefault(require('axios'));
class ApiRequest {
  /**
   * Creates a new instance of ApiRequest.
   *
   * @param options - The SDK options containing apiKey, timeout, and common parameters.
   * @param baseURL - The base URL for API requests.
   */
  constructor(core) {
    var _a;
    this.core = core;
    this.options = core.options;
    this.axiosInstance = axios_1.default.create({
      baseURL: this.options.baseUrl,
      timeout: (_a = this.options.request) === null || _a === void 0 ? void 0 : _a.timeout,
    });
    this.axiosInstance.interceptors.request.use(config => {
      if (!config.headers) {
        config.headers = {};
      }
      // Attach Bearer token using apiKey from VeniceSDKOptions
      config.headers.Authorization = `Bearer ${this.options.apiKey}`;
      return config;
    });
  }
  /**
   * Merges common parameters from the SDK options with any request-specific configuration.
   *
   * @param config - The Axios request configuration.
   * @returns The merged Axios request configuration.
   */
  mergeConfig(config) {
    var _a;
    const commonParams =
      ((_a = this.options.request) === null || _a === void 0 ? void 0 : _a.axiosParams) || {};
    return Object.assign(Object.assign({}, config), {
      params: Object.assign(Object.assign({}, commonParams), config && config.params),
    });
  }
  /**
   * Performs a GET request.
   *
   * @param url - The endpoint URL.
   * @param config - Optional Axios configuration.
   * @returns The response data.
   */
  get(url, config) {
    return __awaiter(this, void 0, void 0, function* () {
      const mergedConfig = this.mergeConfig(config);
      const response = yield this.axiosInstance.get(url, mergedConfig);
      return response.data;
    });
  }
  /**
   * Performs a POST request.
   *
   * @param url - The endpoint URL.
   * @param data - The request payload.
   * @param config - Optional Axios configuration.
   * @returns The response data.
   */
  post(url, data, config) {
    return __awaiter(this, void 0, void 0, function* () {
      const mergedConfig = this.mergeConfig(config);
      const response = yield this.axiosInstance.post(url, data, mergedConfig);
      return response.data;
    });
  }
  /**
   * Performs a PUT request.
   *
   * @param url - The endpoint URL.
   * @param data - The request payload.
   * @param config - Optional Axios configuration.
   * @returns The response data.
   */
  put(url, data, config) {
    return __awaiter(this, void 0, void 0, function* () {
      const mergedConfig = this.mergeConfig(config);
      const response = yield this.axiosInstance.put(url, data, mergedConfig);
      return response.data;
    });
  }
  /**
   * Performs a DELETE request.
   *
   * @param url - The endpoint URL.
   * @param config - Optional Axios configuration.
   * @returns The response data.
   */
  delete(url, config) {
    return __awaiter(this, void 0, void 0, function* () {
      const mergedConfig = this.mergeConfig(config);
      const response = yield this.axiosInstance.delete(url, mergedConfig);
      return response.data;
    });
  }
}
exports.ApiRequest = ApiRequest;
