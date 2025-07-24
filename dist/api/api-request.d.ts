import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { VeniceCore, VeniceSDKOptions } from '../core/venice-core';
export declare class ApiRequest {
    protected axiosInstance: AxiosInstance;
    protected options: VeniceSDKOptions;
    private core;
    /**
     * Creates a new instance of ApiRequest.
     *
     * @param options - The SDK options containing apiKey, timeout, and common parameters.
     * @param baseURL - The base URL for API requests.
     */
    constructor(core: VeniceCore);
    /**
     * Merges common parameters from the SDK options with any request-specific configuration.
     *
     * @param config - The Axios request configuration.
     * @returns The merged Axios request configuration.
     */
    protected mergeConfig(config?: AxiosRequestConfig): AxiosRequestConfig;
    /**
     * Performs a GET request.
     *
     * @param url - The endpoint URL.
     * @param config - Optional Axios configuration.
     * @returns The response data.
     */
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Performs a POST request.
     *
     * @param url - The endpoint URL.
     * @param data - The request payload.
     * @param config - Optional Axios configuration.
     * @returns The response data.
     */
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Performs a PUT request.
     *
     * @param url - The endpoint URL.
     * @param data - The request payload.
     * @param config - Optional Axios configuration.
     * @returns The response data.
     */
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
    /**
     * Performs a DELETE request.
     *
     * @param url - The endpoint URL.
     * @param config - Optional Axios configuration.
     * @returns The response data.
     */
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}
