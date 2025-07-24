"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFactory = void 0;
exports.createAgentFactory = createAgentFactory;
const agent_1 = require("./agent");
const model_recommendations_1 = require("../constants/model-recommendations");
class AgentFactory {
    constructor(core, models) {
        this.availableModels = [];
        this.modelRecommendations = [];
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
    createAgent(config) {
        // Validate model exists
        if (this.availableModels.length > 0) {
            const modelExists = this.availableModels.some(m => m.id === config.model);
            if (!modelExists) {
                console.warn(`Model '${config.model}' not found in available models`);
            }
        }
        return new agent_1.VeniceAgent(this.core, config);
    }
    /**
     * Create an agent with a system prompt and context
     */
    createAgentWithContext(name, model, systemPrompt, context, options) {
        const config = {
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
    getModelRecommendations(useCase) {
        if (useCase == null || useCase.length === 0) {
            return [...this.modelRecommendations];
        }
        return this.modelRecommendations.filter(rec => rec.useCase.some(uc => uc.toLowerCase().includes(useCase.toLowerCase())));
    }
    /**
     * Get the best model recommendation for a specific use case
     */
    getBestModelForUseCase(useCase) {
        const recommendations = this.getModelRecommendations(useCase);
        if (recommendations.length === 0) {
            // Default to Venice Uncensored for text tasks when no specific match
            return (this.modelRecommendations.find(r => r.id === model_recommendations_1.DEFAULT_MODEL_ID) ??
                this.modelRecommendations.find(r => r.performance === 'best') ??
                null);
        }
        // Prioritize by performance, then by pricing
        return recommendations.sort((a, b) => {
            const aScore = (model_recommendations_1.PERFORMANCE_ORDER[a.performance] ?? 0) + (model_recommendations_1.PRICING_ORDER[a.pricing] ?? 0);
            const bScore = (model_recommendations_1.PERFORMANCE_ORDER[b.performance] ?? 0) + (model_recommendations_1.PRICING_ORDER[b.pricing] ?? 0);
            return bScore - aScore;
        })[0];
    }
    /**
     * Get models by performance tier
     */
    getModelsByPerformance(performance) {
        return this.modelRecommendations.filter(r => r.performance === performance);
    }
    /**
     * Get models by pricing tier
     */
    getModelsByPricing(pricing) {
        return this.modelRecommendations.filter(r => r.pricing === pricing);
    }
    /**
     * Get available models from Venice API
     */
    getAvailableModels() {
        return [...this.availableModels];
    }
    /**
     * Update available models
     */
    setAvailableModels(models) {
        this.availableModels = models;
    }
    /**
     * Get the default recommended model (balanced performance/cost)
     */
    getDefaultModel() {
        // Always return Venice Uncensored as the default
        return model_recommendations_1.DEFAULT_MODEL_ID;
    }
    initializeModelRecommendations() {
        this.modelRecommendations = [...model_recommendations_1.MODEL_RECOMMENDATIONS];
    }
}
exports.AgentFactory = AgentFactory;
// Export factory instance creator
function createAgentFactory(core, models) {
    return new AgentFactory(core, models);
}
