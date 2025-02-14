import { VeniceCore } from "../../core/venice-core";
import { ApiRequest } from "../api-request";
import { ImageGenerationRequest, ImageGenerationResponse } from "../../model/image";
/**
 * Provides methods to interact with the Image generation endpoint.
 */
export declare class ImagesApi extends ApiRequest {
    constructor(core: VeniceCore);
    /**
     * POST /image/generate
     * Generates one or more images based on the given prompt and model.
     */
    generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
}
