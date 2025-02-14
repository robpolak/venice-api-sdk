import { ApiRequest } from "../api-request";
import { VeniceCore } from "../../core/venice-core";
import { ListModelsRequest, ListModelsResponse } from "../../model/models";
/**
 * This class provides methods to interact with the Models endpoints.
 */
export declare class ModelsApi extends ApiRequest {
    /**
     * Constructs a new ModelsApi object.
     *
     * @param core - The VeniceCore instance containing user options (apiKey, etc).
     */
    constructor(core: VeniceCore);
    /**
     * Lists all models available in the Venice API.
     *
     * @param params - Optional query parameters such as limit and offset.
     * @returns A promise resolving to a ListModelsResponse object.
     */
    listModels(params?: ListModelsRequest): Promise<ListModelsResponse>;
}
