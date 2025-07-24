import { VeniceCore } from '../core/venice-core';
import { VeniceAgent, AgentConfig, AgentTool } from './agent';
import { Model } from '../model/models';
export interface ModelRecommendation {
    id: string;
    name: string;
    description: string;
    useCase: string[];
    pros: string[];
    pricing: 'low' | 'medium' | 'high';
    performance: 'fast' | 'balanced' | 'best';
}
export declare class AgentFactory {
    private core;
    private availableModels;
    private modelRecommendations;
    constructor(core: VeniceCore, models?: Model[]);
    /**
     * Create a custom agent with full configuration
     */
    createAgent(config: AgentConfig): VeniceAgent;
    /**
     * Create an agent with a system prompt and context
     */
    createAgentWithContext(name: string, model: string, systemPrompt: string, context?: Record<string, unknown>, options?: {
        temperature?: number;
        maxTokens?: number;
        memoryLimit?: number;
        tools?: AgentTool[];
    }): VeniceAgent;
    /**
     * Get model recommendations based on use case
     */
    getModelRecommendations(useCase?: string): ModelRecommendation[];
    /**
     * Get the best model recommendation for a specific use case
     */
    getBestModelForUseCase(useCase: string): ModelRecommendation | null;
    /**
     * Get models by performance tier
     */
    getModelsByPerformance(performance: 'fast' | 'balanced' | 'best'): ModelRecommendation[];
    /**
     * Get models by pricing tier
     */
    getModelsByPricing(pricing: 'low' | 'medium' | 'high'): ModelRecommendation[];
    /**
     * Get available models from Venice API
     */
    getAvailableModels(): Model[];
    /**
     * Update available models
     */
    setAvailableModels(models: Model[]): void;
    /**
     * Get the default recommended model (balanced performance/cost)
     */
    getDefaultModel(): string;
    private initializeModelRecommendations;
}
export declare function createAgentFactory(core: VeniceCore, models?: Model[]): AgentFactory;
