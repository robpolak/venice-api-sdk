// src/model/models.ts

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
   * The name or display name for the model.
   */
  name: string;

  /**
   * Additional fields as provided by the API.
   * Use appropriate types if the documentation specifies them.
   */
  [key: string]: any;
}

/**
 * The response from the Venice API when listing models.
 */
export interface ListModelsResponse {
  /**
   * An array of model objects.
   */
  models: Model[];

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
