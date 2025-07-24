import { VeniceCore } from '../../core/venice-core';
import { ApiRequest } from '../api-request';
import { ImageGenerationRequest, ImageGenerationResponse } from '../../model/image';

/**
 * Provides methods to interact with the Image generation endpoint.
 */
export class ImagesApi extends ApiRequest {
  constructor(core: VeniceCore) {
    // Adjust if your base URL is different (e.g. https://api.venice.ai).
    super(core);
  }

  /**
   * POST /image/generate
   * Generates one or more images based on the given prompt and model.
   */
  public async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // According to the docs, the endpoint for image generation is /image/generate
    return this.post<ImageGenerationResponse>('/image/generate', request);
  }
}
