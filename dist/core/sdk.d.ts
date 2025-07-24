import { VeniceAPI } from '../api/api';
import { VeniceSDKOptions } from './venice-core';
import { ListModelsResponse } from '../model/models';
import { AgentFactory, ModelRecommendation } from '../agents/agent-factory';
import { VeniceAgent, AgentConfig, AgentTool } from '../agents/agent';
export declare class VeniceSDK {
    api: VeniceAPI;
    private core;
    imageModels: ListModelsResponse | undefined;
    textModels: ListModelsResponse | undefined;
    agents: AgentFactory;
    private constructor();
    static New(opts: VeniceSDKOptions): Promise<VeniceSDK>;
    /**
     * Create a new agent with custom configuration
     */
    createAgent(config: AgentConfig): VeniceAgent;
    /**
     * Create an agent with system prompt and context
     */
    createAgentWithContext(name: string, systemPrompt: string, context?: Record<string, unknown>, options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        memoryLimit?: number;
        tools?: AgentTool[];
    }): VeniceAgent;
    /**
     * Create a new chat session with context injection
     * This provides a simpler interface for one-off chats with context
     */
    createChatWithContext(model: string, systemPrompt: string, context?: Record<string, unknown>): VeniceAgent;
    /**
     * Get model recommendations based on use case
     */
    getModelRecommendations(useCase?: string): ModelRecommendation[];
    /**
     * Get the best model for a specific use case
     */
    getBestModelForUseCase(useCase: string): ModelRecommendation | null;
    /**
     * Get models by performance tier (fast, balanced, best)
     */
    getModelsByPerformance(performance: 'fast' | 'balanced' | 'best'): ModelRecommendation[];
    /**
     * Get models by pricing tier (low, medium, high)
     */
    getModelsByPricing(pricing: 'low' | 'medium' | 'high'): ModelRecommendation[];
    /**
     * Get the default recommended model
     */
    getDefaultModel(): string;
    /**
     * Get all available models from Venice API
     */
    getAvailableModels(): ReturnType<typeof this.agents.getAvailableModels>;
}
