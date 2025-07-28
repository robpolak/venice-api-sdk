import { VeniceCore } from '../../src/core/venice-core';
import { AgentFactory, createAgentFactory } from '../../src/agents/agent-factory';

describe('Model Recommendations Unit Test', () => {
  let agentFactory: AgentFactory;

  beforeAll(() => {
    const core = new VeniceCore({ apiKey: 'test-key' });
    agentFactory = createAgentFactory(core);
  });

  test('should include actual Venice text models', () => {
    const allRecommendations = agentFactory.getModelRecommendations();

    // Check for actual Venice text models
    const veniceTextModels = [
      'qwen3-4b',
      'mistral-31-24b',
      'dolphin-2.9.2-qwen2-72b', // Venice Uncensored
      'qwen-2.5-qwq-32b',
      'qwen3-235b',
      'llama-3.1-405b',
    ];

    veniceTextModels.forEach(modelId => {
      const model = allRecommendations.find(m => m.id === modelId);
      expect(model).toBeDefined();
      expect(model?.name).toBeDefined();
      expect(model?.description).toBeDefined();
    });
  });

  test('should include actual Venice image models', () => {
    const allRecommendations = agentFactory.getModelRecommendations();

    // Check for actual Venice image models
    const veniceImageModels = [
      'fluently-xl',
      'venice-sd35',
      'flux-dev',
      'flux-dev-uncensored',
      'hi-dream',
      'pony-realism',
    ];

    veniceImageModels.forEach(modelId => {
      const model = allRecommendations.find(m => m.id === modelId);
      expect(model).toBeDefined();
      expect(model?.name).toBeDefined();
      expect(model?.description).toBeDefined();
    });
  });

  test('should recommend appropriate models for coding use case', () => {
    const codingModels = agentFactory.getModelRecommendations('coding');

    expect(codingModels.length).toBeGreaterThan(0);

    // Should include Mistral and Qwen models which are good for coding
    const hasCodingModel = codingModels.some(
      model =>
        model.id === 'mistral-31-24b' ||
        model.id === 'qwen3-235b' ||
        model.id === 'qwen-2.5-qwq-32b'
    );
    expect(hasCodingModel).toBe(true);
  });

  test('should recommend appropriate models for creative writing', () => {
    const writingModels = agentFactory.getModelRecommendations('writing');

    expect(writingModels.length).toBeGreaterThan(0);

    // Should include Venice Uncensored which is good for creative writing
    const hasCreativeModel = writingModels.some(model => model.id === 'dolphin-2.9.2-qwen2-72b');
    expect(hasCreativeModel).toBe(true);
  });

  test('should recommend appropriate models for image generation', () => {
    const imageModels = agentFactory.getModelRecommendations('image');

    expect(imageModels.length).toBeGreaterThan(0);

    // Should include FLUX and other image models
    const hasImageModel = imageModels.some(
      model => model.id === 'flux-dev' || model.id === 'venice-sd35' || model.id === 'fluently-xl'
    );
    expect(hasImageModel).toBe(true);
  });

  test('should categorize models by performance correctly', () => {
    const fastModels = agentFactory.getModelsByPerformance('fast');
    const balancedModels = agentFactory.getModelsByPerformance('balanced');
    const bestModels = agentFactory.getModelsByPerformance('best');

    // Fast should include small models like Qwen3-4B
    expect(fastModels.some(m => m.id === 'qwen3-4b')).toBe(true);

    // Balanced should include medium models like Mistral
    expect(balancedModels.some(m => m.id === 'mistral-31-24b')).toBe(true);

    // Best should include large models like Qwen3-235B
    expect(bestModels.some(m => m.id === 'qwen3-235b')).toBe(true);
  });

  test('should categorize models by pricing correctly', () => {
    const lowPricing = agentFactory.getModelsByPricing('low');
    const mediumPricing = agentFactory.getModelsByPricing('medium');
    const highPricing = agentFactory.getModelsByPricing('high');

    // Low should include small models
    expect(lowPricing.some(m => m.id === 'qwen3-4b')).toBe(true);

    // Medium should include mid-size models
    expect(mediumPricing.some(m => m.id === 'mistral-31-24b')).toBe(true);

    // High should include large models
    expect(highPricing.some(m => m.id === 'llama-3.1-405b')).toBe(true);
  });

  test('should get best model for specific use cases', () => {
    const bestCoding = agentFactory.getBestModelForUseCase('coding');
    const bestWriting = agentFactory.getBestModelForUseCase('writing');
    const bestReasoning = agentFactory.getBestModelForUseCase('reasoning');

    expect(bestCoding).toBeDefined();
    expect(bestWriting).toBeDefined();
    expect(bestReasoning).toBeDefined();

    // Best coding should be a model good for coding
    if (bestCoding) {
      expect(
        bestCoding.useCase.some(
          uc =>
            uc.toLowerCase().includes('coding') ||
            uc.toLowerCase().includes('function calling') ||
            uc.toLowerCase().includes('reasoning')
        )
      ).toBe(true);
    }
  });

  test('should fallback to Venice Uncensored when no use case matches', () => {
    // Test with a use case that won't match any models
    const result = agentFactory.getBestModelForUseCase('nonexistent-use-case');

    expect(result).toBeDefined();
    expect(result?.id).toBe('dolphin-2.9.2-qwen2-72b');
    expect(result?.name).toBe('Venice Uncensored (Dolphin Mistral 24B)');
  });

  test('should return Venice Uncensored as default model', () => {
    const defaultModel = agentFactory.getDefaultModel();

    expect(defaultModel).toBeDefined();
    expect(typeof defaultModel).toBe('string');

    // Should default to Venice Uncensored when no specific models are loaded
    expect(defaultModel).toBe('dolphin-2.9.2-qwen2-72b');

    // Verify it's actually Venice Uncensored model
    const allRecommendations = agentFactory.getModelRecommendations();
    const veniceUncensored = allRecommendations.find(m => m.id === defaultModel);
    expect(veniceUncensored).toBeDefined();
    expect(veniceUncensored?.name).toBe('Venice Uncensored (Dolphin Mistral 24B)');
  });

  test('should have proper model structure for all recommendations', () => {
    const allRecommendations = agentFactory.getModelRecommendations();

    expect(allRecommendations.length).toBeGreaterThan(0);

    allRecommendations.forEach(model => {
      expect(model.id).toBeDefined();
      expect(model.name).toBeDefined();
      expect(model.description).toBeDefined();
      expect(Array.isArray(model.useCase)).toBe(true);
      expect(Array.isArray(model.pros)).toBe(true);
      expect(['low', 'medium', 'high']).toContain(model.pricing);
      expect(['fast', 'balanced', 'best']).toContain(model.performance);
      expect(model.useCase.length).toBeGreaterThan(0);
      expect(model.pros.length).toBeGreaterThan(0);
    });
  });
});
