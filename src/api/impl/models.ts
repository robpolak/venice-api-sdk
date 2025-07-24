import { ApiRequest } from '../api-request';
import { VeniceCore } from '../../core/venice-core';
import { ListModelsRequest, ListModelsResponse } from '../../model/models';

/**
 * This class provides methods to interact with the Models endpoints.
 */
export class ModelsApi extends ApiRequest {
  /**
   * Constructs a new ModelsApi object.
   *
   * @param core - The VeniceCore instance containing user options (apiKey, etc).
   */
  constructor(core: VeniceCore) {
    super(core);
  }

  /**
   * Lists all models available in the Venice API.
   *
   * @param params - Optional query parameters such as limit and offset.
   * @returns A promise resolving to a ListModelsResponse object.
   */
  public async listModels(params?: ListModelsRequest): Promise<ListModelsResponse> {
    const resp = this.get<ListModelsResponse>('/models', { params });
    return resp;
  }
}
