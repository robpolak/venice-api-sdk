import { VeniceCore } from '../core/venice-core';
import { VeniceAgent, AgentConfig, AgentTool } from './agent';
import { Model } from '../model/models';
import {
  MODEL_RECOMMENDATIONS,
  DEFAULT_MODEL_ID,
  PERFORMANCE_ORDER,
  PRICING_ORDER,
} from '../constants/model-recommendations';

export interface ModelRecommendation {
  id: string;
  name: string;
  description: string;
  useCase: string[];
  pros: string[];
  pricing: 'low' | 'medium' | 'high';
  performance: 'fast' | 'balanced' | 'best';
}

export class AgentFactory {
  private core: VeniceCore;
  private availableModels: Model[] = [];
  private modelRecommendations: ModelRecommendation[] = [];

  constructor(core: VeniceCore, models?: Model[]) {
    this.core = core;
    if (models) {
      this.availableModels = models;
    }

    // Initialize model recommendations
    this.initializeModelRecommendations();
  }

  /**
   * Create a custom agent with full configuration
   */
  public createAgent(config: AgentConfig): VeniceAgent {
    // Validate model exists
    if (this.availableModels.length > 0) {
      const modelExists = this.availableModels.some(m => m.id === config.model);
      if (!modelExists) {
        console.warn(`Model '${config.model}' not found in available models`);
      }
    }

    return new VeniceAgent(this.core, config);
  }

  /**
   * Create an agent with a system prompt and context
   */
  public createAgentWithContext(
    name: string,
    model: string,
    systemPrompt: string,
    context?: Record<string, unknown>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      memoryLimit?: number;
      tools?: AgentTool[];
    }
  ): VeniceAgent {
    const config: AgentConfig = {
      name,
      model,
      systemPrompt,
      context: context ?? {},
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens,
      memoryLimit: options?.memoryLimit ?? 50,
      tools: options?.tools,
    };

    return this.createAgent(config);
  }

  /**
   * Get model recommendations based on use case
   */
  public getModelRecommendations(useCase?: string): ModelRecommendation[] {
    if (useCase == null || useCase.length === 0) {
      return [...this.modelRecommendations];
    }

    return this.modelRecommendations.filter(rec =>
      rec.useCase.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
    );
  }

  /**
   * Get the best model recommendation for a specific use case
   */
  public getBestModelForUseCase(useCase: string): ModelRecommendation | null {
    const recommendations = this.getModelRecommendations(useCase);

    if (recommendations.length === 0) {
      // Default to Venice Uncensored for text tasks when no specific match
      return (
        this.modelRecommendations.find(r => r.id === DEFAULT_MODEL_ID) ??
        this.modelRecommendations.find(r => r.performance === 'best') ??
        null
      );
    }

    // Prioritize by performance, then by pricing
    return recommendations.sort((a, b) => {
      const aScore = (PERFORMANCE_ORDER[a.performance] ?? 0) + (PRICING_ORDER[a.pricing] ?? 0);
      const bScore = (PERFORMANCE_ORDER[b.performance] ?? 0) + (PRICING_ORDER[b.pricing] ?? 0);

      return bScore - aScore;
    })[0];
  }

  /**
   * Get models by performance tier
   */
  public getModelsByPerformance(performance: 'fast' | 'balanced' | 'best'): ModelRecommendation[] {
    return this.modelRecommendations.filter(r => r.performance === performance);
  }

  /**
   * Get models by pricing tier
   */
  public getModelsByPricing(pricing: 'low' | 'medium' | 'high'): ModelRecommendation[] {
    return this.modelRecommendations.filter(r => r.pricing === pricing);
  }

  /**
   * Get available models from Venice API
   */
  public getAvailableModels(): Model[] {
    return [...this.availableModels];
  }

  /**
   * Update available models
   */
  public setAvailableModels(models: Model[]): void {
    this.availableModels = models;
  }

  /**
   * Get the default recommended model (balanced performance/cost)
   */
  public getDefaultModel(): string {
    // Always return Venice Uncensored as the default
    return DEFAULT_MODEL_ID;
  }

  private initializeModelRecommendations(): void {
    this.modelRecommendations = [...MODEL_RECOMMENDATIONS];
  }
}

// Export factory instance creator
export function createAgentFactory(core: VeniceCore, models?: Model[]): AgentFactory {
  return new AgentFactory(core, models);
}
