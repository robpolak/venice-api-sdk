"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelsApi = void 0;
const api_request_1 = require("../api-request");
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
    async listModels(params) {
        const resp = this.get("/models", { params });
        return resp;
    }
}
exports.ModelsApi = ModelsApi;
