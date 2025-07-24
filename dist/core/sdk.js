"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeniceSDK = void 0;
const api_1 = require("../api/api");
const venice_core_1 = require("./venice-core");
const agent_factory_1 = require("../agents/agent-factory");
const model_recommendations_1 = require("../constants/model-recommendations");
class VeniceSDK {
    constructor(opts) {
        this.core = new venice_core_1.VeniceCore(opts);
        this.api = new api_1.VeniceAPI(this.core);
        // Initialize agent factory
        this.agents = (0, agent_factory_1.createAgentFactory)(this.core);
    }
    static async New(opts) {
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
        }
        catch (error) {
            console.warn('Failed to fetch models:', error);
        }
        return sdk;
    }
    /**
     * Create a new agent with custom configuration
     */
    createAgent(config) {
        return this.agents.createAgent(config);
    }
    /**
     * Create an agent with system prompt and context
     */
    createAgentWithContext(name, systemPrompt, context, options) {
        return this.agents.createAgentWithContext(name, options?.model ?? model_recommendations_1.DEFAULT_MODEL_ID, // Default to Venice Uncensored
        systemPrompt, context, options);
    }
    /**
     * Create a new chat session with context injection
     * This provides a simpler interface for one-off chats with context
     */
    createChatWithContext(model, systemPrompt, context) {
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
    getModelRecommendations(useCase) {
        return this.agents.getModelRecommendations(useCase);
    }
    /**
     * Get the best model for a specific use case
     */
    getBestModelForUseCase(useCase) {
        return this.agents.getBestModelForUseCase(useCase);
    }
    /**
     * Get models by performance tier (fast, balanced, best)
     */
    getModelsByPerformance(performance) {
        return this.agents.getModelsByPerformance(performance);
    }
    /**
     * Get models by pricing tier (low, medium, high)
     */
    getModelsByPricing(pricing) {
        return this.agents.getModelsByPricing(pricing);
    }
    /**
     * Get the default recommended model
     */
    getDefaultModel() {
        return this.agents.getDefaultModel();
    }
    /**
     * Get all available models from Venice API
     */
    getAvailableModels() {
        return this.agents.getAvailableModels();
    }
}
exports.VeniceSDK = VeniceSDK;
