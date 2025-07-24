"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRequest = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiRequest {
    /**
     * Creates a new instance of ApiRequest.
     *
     * @param options - The SDK options containing apiKey, timeout, and common parameters.
     * @param baseURL - The base URL for API requests.
     */
    constructor(core) {
        this.core = core;
        this.options = core.options;
        this.axiosInstance = axios_1.default.create({
            baseURL: this.options.baseUrl,
            timeout: this.options.request?.timeout,
        });
        this.axiosInstance.interceptors.request.use(config => {
            if (config.headers != null) {
                // Attach Bearer token using apiKey from VeniceSDKOptions
                config.headers.Authorization = `Bearer ${this.options.apiKey}`;
            }
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
        const commonParams = this.options.request?.axiosParams ?? {};
        const mergedConfig = {
            ...config,
            params: {
                ...commonParams,
                ...config?.params,
            },
        };
        return mergedConfig;
    }
    /**
     * Performs a GET request.
     *
     * @param url - The endpoint URL.
     * @param config - Optional Axios configuration.
     * @returns The response data.
     */
    async get(url, config) {
        const mergedConfig = this.mergeConfig(config);
        const response = await this.axiosInstance.get(url, mergedConfig);
        return response.data;
    }
    /**
     * Performs a POST request.
     *
     * @param url - The endpoint URL.
     * @param data - The request payload.
     * @param config - Optional Axios configuration.
     * @returns The response data.
     */
    async post(url, data, config) {
        const mergedConfig = this.mergeConfig(config);
        const response = await this.axiosInstance.post(url, data, mergedConfig);
        return response.data;
    }
    /**
     * Performs a PUT request.
     *
     * @param url - The endpoint URL.
     * @param data - The request payload.
     * @param config - Optional Axios configuration.
     * @returns The response data.
     */
    async put(url, data, config) {
        const mergedConfig = this.mergeConfig(config);
        const response = await this.axiosInstance.put(url, data, mergedConfig);
        return response.data;
    }
    /**
     * Performs a DELETE request.
     *
     * @param url - The endpoint URL.
     * @param config - Optional Axios configuration.
     * @returns The response data.
     */
    async delete(url, config) {
        const mergedConfig = this.mergeConfig(config);
        const response = await this.axiosInstance.delete(url, mergedConfig);
        return response.data;
    }
}
exports.ApiRequest = ApiRequest;
