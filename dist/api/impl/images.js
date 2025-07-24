"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesApi = void 0;
const api_request_1 = require("../api-request");
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
    async generateImages(request) {
        // According to the docs, the endpoint for image generation is /image/generate
        return this.post('/image/generate', request);
    }
}
exports.ImagesApi = ImagesApi;
