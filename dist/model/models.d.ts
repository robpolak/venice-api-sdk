/**
 * The possible model types supported by Venice.
 */
export declare enum ModelType {
    TEXT = "text",
    IMAGE = "image"
}
/**
 * Query parameters for listing models.
 */
export interface ListModelsRequest {
    /**
     * The maximum number of models to return in one page of results.
     * (If supported by the API)
     */
    limit?: number;
    /**
     * The starting index for pagination.
     * (If supported by the API)
     */
    offset?: number;
    type: string;
}
/**
 * A single Model object in the Venice API.
 */
export interface Model {
    /**
     * A unique identifier for the model.
     */
    id: string;
    /**
     * The type of the model (e.g., text, image).
     */
    type: ModelType;
    /**
     * The object's type name, typically 'model'.
     */
    object: string;
    /**
     * The creation timestamp for the model.
     */
    created: number;
    /**
     * The owning entity, e.g., 'venice.ai'.
     */
    owned_by: string;
    /**
     * Any additional specs or configuration details for the model.
     */
    model_spec: Record<string, any>;
    /**
     * Additional fields as provided by the API.
     */
    [key: string]: any;
}
/**
 * The response from the Venice API when listing models.
 */
export interface ListModelsResponse {
    /**
     * Indicates the type of this object, likely 'list'.
     */
    object: string;
    /**
     * An array of model objects.
     */
    data: Model[];
    /**
     * Total count or any other metadata the API returns.
     * (If supported by the API)
     */
    total?: number;
    /**
     * Additional fields as provided by the API.
     */
    [key: string]: any;
}
