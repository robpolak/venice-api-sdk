/**
 * Request body for generating images.
 */
export interface ImageGenerationRequest {
    /**
     * The model to use (e.g., "flux-dev", "flux-dev-uncensored").
     */
    model: string;
    /**
     * The prompt describing what you want to generate.
     */
    prompt: string;
    hide_watermark: boolean;
    /**
     * Additional optional fields supported by the API.
     */
    [key: string]: any;
}
/**
 * The response from the Venice API when generating images.
 */
export interface ImageGenerationResponse {
    created: number;
    images: string[];
    [key: string]: any;
}
