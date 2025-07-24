"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRICING_ORDER = exports.PERFORMANCE_ORDER = exports.DEFAULT_MODEL_ID = exports.MODEL_RECOMMENDATIONS = void 0;
exports.MODEL_RECOMMENDATIONS = [
    // Fast/Small Models
    {
        id: 'qwen3-4b',
        name: 'Qwen3-4B',
        description: '4B parameter model with thinking/non-thinking modes for efficient dialogue and complex reasoning',
        useCase: [
            'general chat',
            'quick responses',
            'cost-effective',
            'multilingual',
            'simple reasoning',
        ],
        pros: [
            'Very fast',
            'Low cost',
            'Thinking mode for complex tasks',
            '100+ languages',
            'Good for high-volume',
        ],
        pricing: 'low',
        performance: 'fast',
    },
    // Balanced Models
    {
        id: 'mistral-31-24b',
        name: 'Mistral Small 3.1 24B',
        description: '24B parameter model with vision capability, excellent for function calling and JSON formatting',
        useCase: [
            'coding',
            'function calling',
            'JSON formatting',
            'vision tasks',
            'technical writing',
            'multilingual',
        ],
        pros: [
            'Vision capability',
            'Precise output',
            'Function calling',
            '128K context',
            'Multilingual',
        ],
        pricing: 'medium',
        performance: 'balanced',
    },
    {
        id: 'dolphin-2.9.2-qwen2-72b', // Venice Uncensored
        name: 'Venice Uncensored (Dolphin Mistral 24B)',
        description: 'Uncensored 24B model with 2.20% refusal rate, excellent for creative writing and storytelling',
        useCase: [
            'creative writing',
            'storytelling',
            'uncensored content',
            'character consistency',
            'writing',
        ],
        pros: [
            'Uncensored (2.20% refusal)',
            'Creative writing',
            'Character memory',
            'Coherent responses',
        ],
        pricing: 'medium',
        performance: 'balanced',
    },
    {
        id: 'qwen-2.5-qwq-32b',
        name: 'Qwen QWQ 32B',
        description: '32B parameter model optimized for advanced reasoning and complex multi-step tasks',
        useCase: ['complex reasoning', 'multi-step tasks', 'analysis', 'problem solving', 'research'],
        pros: [
            'Advanced reasoning',
            'Logical structure',
            'Complex task breakdown',
            'Thorough responses',
        ],
        pricing: 'medium',
        performance: 'balanced',
    },
    // Best/Large Models
    {
        id: 'qwen3-235b',
        name: 'Qwen3-235B',
        description: '235B MoE model (22B activated) with thinking modes and superior reasoning capabilities',
        useCase: ['complex reasoning', 'research', 'advanced coding', 'analysis', 'multilingual tasks'],
        pros: [
            'Thinking/non-thinking modes',
            'Superior reasoning',
            'Human preference aligned',
            'Agent capabilities',
            '100+ languages',
        ],
        pricing: 'high',
        performance: 'best',
    },
    {
        id: 'llama-3.1-405b',
        name: 'Llama 3.1 405B',
        description: "Meta's largest open-source frontier model with 405B parameters, exceeding many closed-source models",
        useCase: ['research', 'complex analysis', 'advanced reasoning', 'frontier capabilities'],
        pros: [
            'Largest open-source model',
            'Frontier performance',
            'Exceeds closed-source on 7/15 metrics',
            'Meta-published',
        ],
        pricing: 'high',
        performance: 'best',
    },
    // Image Generation Models
    {
        id: 'fluently-xl',
        name: 'Fluently XL v4',
        description: 'Default image model with improved aesthetics, lighting, and realistic anatomy rendering',
        useCase: ['image generation', 'general purpose images', 'realistic rendering', 'nature scenes'],
        pros: [
            'Default Venice image model',
            'Improved aesthetics',
            'Better lighting/contrast',
            'Realistic anatomy',
        ],
        pricing: 'low',
        performance: 'balanced',
    },
    {
        id: 'venice-sd35',
        name: 'Venice SD35',
        description: 'Custom Stable Diffusion 3.5 with significant photorealism improvements and better prompt understanding',
        useCase: [
            'photorealistic images',
            'complex prompts',
            'professional photography',
            'reduced artifacts',
        ],
        pros: [
            'Photorealistic textures',
            'Better prompt following',
            'Reduced artifacts',
            'Artistic range',
        ],
        pricing: 'medium',
        performance: 'balanced',
    },
    {
        id: 'flux-dev',
        name: 'FLUX',
        description: 'State-of-the-art image generation with excellent prompt-following and visual quality',
        useCase: [
            'high-quality images',
            'complex workflows',
            'creative applications',
            'detailed outputs',
        ],
        pros: ['Best image quality', 'Excellent prompt following', 'High detail', 'Output diversity'],
        pricing: 'medium',
        performance: 'best',
    },
    {
        id: 'flux-dev-uncensored',
        name: 'FLUX Uncensored',
        description: 'Uncensored LoRA-modified FLUX with adjustable censorship removal via LoRA strength',
        useCase: ['uncensored content', 'NSFW generation', 'creative freedom', 'flexible censorship'],
        pros: [
            'Uncensored generation',
            'Adjustable LoRA strength',
            'Based on FLUX quality',
            'Creative freedom',
        ],
        pricing: 'medium',
        performance: 'best',
    },
    {
        id: 'hi-dream',
        name: 'Hi-Dream',
        description: '17B parameter foundation model for photorealistic, cartoon, and artistic styles with high prompt adherence',
        useCase: ['artistic styles', 'photorealistic', 'cartoon style', 'diverse art styles'],
        pros: [
            '17B parameters',
            'High human preference',
            'Best-in-class prompt adherence',
            'Style versatility',
        ],
        pricing: 'medium',
        performance: 'best',
    },
    {
        id: 'pony-realism',
        name: 'Pony Realism',
        description: 'Specialized model for highly detailed realistic images of people, landscapes, and still-life',
        useCase: [
            'realistic people',
            'landscapes',
            'still-life',
            'detailed textures',
            'portrait photography',
        ],
        pros: ['Highly detailed', 'Realistic rendering', 'Great for people', 'Intricate textures'],
        pricing: 'medium',
        performance: 'balanced',
    },
];
// Default model ID
exports.DEFAULT_MODEL_ID = 'dolphin-2.9.2-qwen2-72b'; // Venice Uncensored
// Performance tier mappings
exports.PERFORMANCE_ORDER = {
    best: 3,
    balanced: 2,
    fast: 1,
};
exports.PRICING_ORDER = {
    low: 3,
    medium: 2,
    high: 1,
};
