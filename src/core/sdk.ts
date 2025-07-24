import { VeniceAPI } from '../api/api';
import { VeniceCore, VeniceSDKOptions } from './venice-core';
import { ListModelsResponse } from '../model/models';
import { AgentFactory, createAgentFactory, ModelRecommendation } from '../agents/agent-factory';
import { VeniceAgent, AgentConfig, AgentTool } from '../agents/agent';
import { DEFAULT_MODEL_ID } from '../constants/model-recommendations';

export class VeniceSDK {
  public api: VeniceAPI;
  private core: VeniceCore;
  public imageModels: ListModelsResponse | undefined;
  public textModels: ListModelsResponse | undefined;

  // Agent system
  public agents: AgentFactory;

  private constructor(opts: VeniceSDKOptions) {
    this.core = new VeniceCore(opts);
    this.api = new VeniceAPI(this.core);

    // Initialize agent factory
    this.agents = createAgentFactory(this.core);
  }

  public static async New(opts: VeniceSDKOptions): Promise<VeniceSDK> {
    const sdk = new VeniceSDK(opts);

    // Fetch available models
    try {
      sdk.imageModels = await sdk.api.models.listModels({
        type: 'image',
      });
      sdk.textModels = await sdk.api.models.listModels({
        type: 'text',
      });

      // Update agent factory with available models
      const allModels = [...(sdk.textModels?.data ?? []), ...(sdk.imageModels?.data ?? [])];
      sdk.agents.setAvailableModels(allModels);
    } catch (error) {
      console.warn('Failed to fetch models:', error);
    }

    return sdk;
  }

  /**
   * Create a new agent with custom configuration
   */
  public createAgent(config: AgentConfig): VeniceAgent {
    return this.agents.createAgent(config);
  }

  /**
   * Create an agent with system prompt and context
   */
  public createAgentWithContext(
    name: string,
    systemPrompt: string,
    context?: Record<string, unknown>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      memoryLimit?: number;
      tools?: AgentTool[];
    }
  ): VeniceAgent {
    return this.agents.createAgentWithContext(
      name,
      options?.model ?? DEFAULT_MODEL_ID, // Default to Venice Uncensored
      systemPrompt,
      context,
      options
    );
  }

  /**
   * Create a new chat session with context injection
   * This provides a simpler interface for one-off chats with context
   */
  public createChatWithContext(
    model: string,
    systemPrompt: string,
    context?: Record<string, unknown>
  ): VeniceAgent {
    const agent = this.createAgent({
      name: `Chat_${Date.now()}`,
      model,
      systemPrompt,
      context: context ?? {},
      temperature: 0.7,
    });

    return agent;
  }

  /**
   * Get model recommendations based on use case
   */
  public getModelRecommendations(useCase?: string): ModelRecommendation[] {
    return this.agents.getModelRecommendations(useCase);
  }

  /**
   * Get the best model for a specific use case
   */
  public getBestModelForUseCase(useCase: string): ModelRecommendation | null {
    return this.agents.getBestModelForUseCase(useCase);
  }

  /**
   * Get models by performance tier (fast, balanced, best)
   */
  public getModelsByPerformance(performance: 'fast' | 'balanced' | 'best'): ModelRecommendation[] {
    return this.agents.getModelsByPerformance(performance);
  }

  /**
   * Get models by pricing tier (low, medium, high)
   */
  public getModelsByPricing(pricing: 'low' | 'medium' | 'high'): ModelRecommendation[] {
    return this.agents.getModelsByPricing(pricing);
  }

  /**
   * Get the default recommended model
   */
  public getDefaultModel(): string {
    return this.agents.getDefaultModel();
  }

  /**
   * Get all available models from Venice API
   */
  public getAvailableModels(): ReturnType<typeof this.agents.getAvailableModels> {
    return this.agents.getAvailableModels();
  }
}
