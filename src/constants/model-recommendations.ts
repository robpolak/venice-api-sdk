import type { ModelRecommendation } from '../agents/agent-factory';

export const MODEL_RECOMMENDATIONS: ModelRecommendation[] = [
  // Fast/Small Models
  {
    id: 'qwen3-4b',
    name: 'Qwen3-4B',
    description:
      '4B parameter model with thinking/non-thinking modes for efficient dialogue and complex reasoning',
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
    description:
      '24B parameter model with vision capability, excellent for function calling and JSON formatting',
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
    description:
      'Uncensored 24B model with 2.20% refusal rate, excellent for creative writing and storytelling',
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
    description:
      '32B parameter model optimized for advanced reasoning and complex multi-step tasks',
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
    description:
      '235B MoE model (22B activated) with thinking modes and superior reasoning capabilities',
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
    description:
      "Meta's largest open-source frontier model with 405B parameters, exceeding many closed-source models",
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
    id: 'venice-sd35',
    name: 'Venice SD35',
    description:
      "Venice's custom Stable Diffusion 3.5 model with improved aesthetics, lighting, and realistic anatomy rendering",
    useCase: ['general purpose', 'high quality', 'photorealistic', 'artistic'],
    pros: [
      'Default Venice image model',
      'Balanced quality and speed',
      'Great anatomy',
      'Excellent lighting',
    ],
    pricing: 'low',
    performance: 'balanced',
  },
  {
    id: 'stable-diffusion-3.5',
    name: 'Stable Diffusion 3.5',
    description:
      'Latest Stable Diffusion 3.5 Large model from Stability AI with enhanced quality and coherence',
    useCase: ['general purpose', 'high quality', 'photorealistic', 'artistic'],
    pros: [
      'Latest SD version',
      'High quality output',
      'Improved prompt adherence',
      'Better text rendering',
    ],
    pricing: 'low',
    performance: 'balanced',
  },
  {
    id: 'flux-dev',
    name: 'FLUX Standard',
    description:
      'State-of-the-art FLUX.1-dev model with exceptional prompt adherence and image quality',
    useCase: ['highest quality', 'complex prompts', 'artistic', 'professional'],
    pros: [
      'Best prompt adherence',
      'Highest quality',
      'Complex compositions',
      'Professional results',
    ],
    pricing: 'medium',
    performance: 'best',
  },
  {
    id: 'flux-dev-uncensored',
    name: 'FLUX Custom',
    description:
      'Uncensored LoRA-modified FLUX with adjustable censorship removal via LoRA strength',
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
    id: 'hidream',
    name: 'HiDream',
    description:
      '17B parameter foundation model for photorealistic, cartoon, and artistic styles with high prompt adherence',
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
    description:
      'Specialized model for highly detailed realistic images of people, landscapes, and still-life (most uncensored)',
    useCase: [
      'realistic people',
      'landscapes',
      'still-life',
      'detailed textures',
      'portrait photography',
    ],
    pros: ['Highly detailed', 'Realistic rendering', 'Great for people', 'Most uncensored'],
    pricing: 'medium',
    performance: 'balanced',
  },
  {
    id: 'lustify-sdxl',
    name: 'Lustify SDXL',
    description:
      'NSFW-focused SDXL checkpoint for adult content generation with enhanced anatomy and detail',
    useCase: ['NSFW content', 'adult themes', 'anatomical accuracy', 'artistic nudity'],
    pros: ['NSFW optimized', 'Enhanced anatomy', 'SDXL quality', 'Artistic freedom'],
    pricing: 'medium',
    performance: 'balanced',
  },
];

// Default model ID
export const DEFAULT_MODEL_ID = 'dolphin-2.9.2-qwen2-72b'; // Venice Uncensored

// Performance tier mappings
export const PERFORMANCE_ORDER: Record<string, number> = {
  best: 3,
  balanced: 2,
  fast: 1,
};

export const PRICING_ORDER: Record<string, number> = {
  low: 3,
  medium: 2,
  high: 1,
};
