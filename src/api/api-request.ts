import axios, {
  AxiosInstance,
  AxiosRequestConfig, AxiosRequestHeaders,
  AxiosResponse,
} from 'axios';
import {VeniceCore, VeniceSDKOptions} from '../core/venice-core';

export class ApiRequest {
  protected axiosInstance: AxiosInstance;
  protected options: VeniceSDKOptions;
  private core: VeniceCore;

  /**
   * Creates a new instance of ApiRequest.
   *
   * @param options - The SDK options containing apiKey, timeout, and common parameters.
   * @param baseURL - The base URL for API requests.
   */
  constructor(core: VeniceCore) {
    this.core = core;
    this.options = core.options;
    this.axiosInstance = axios.create({
      baseURL: this.options.baseUrl,
      timeout: this.options.request?.timeout,
    });
    this.axiosInstance.interceptors.request.use((config) => {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
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
  protected mergeConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    const commonParams = this.options.request?.axiosParams || {};
    return {
      ...config,
      params: {
        ...commonParams,
        ...(config && config.params),
      },
    };
  }

  /**
   * Performs a GET request.
   *
   * @param url - The endpoint URL.
   * @param config - Optional Axios configuration.
   * @returns The response data.
   */
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = this.mergeConfig(config);
    const response: AxiosResponse<T> = await this.axiosInstance.get<T>(
      url,
      mergedConfig
    );
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
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = this.mergeConfig(config);
    const response: AxiosResponse<T> = await this.axiosInstance.post<T>(
      url,
      data,
      mergedConfig
    );
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
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = this.mergeConfig(config);
    const response: AxiosResponse<T> = await this.axiosInstance.put<T>(
      url,
      data,
      mergedConfig
    );
    return response.data;
  }

  /**
   * Performs a DELETE request.
   *
   * @param url - The endpoint URL.
   * @param config - Optional Axios configuration.
   * @returns The response data.
   */
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const mergedConfig = this.mergeConfig(config);
    const response: AxiosResponse<T> = await this.axiosInstance.delete<T>(
      url,
      mergedConfig
    );
    return response.data;
  }
}
