## Structured Responses

The SDK supports Venice structured outputs using `response_format` (OpenAI-compatible) as documented in the Venice guide: [Structured Responses](https://docs.venice.ai/overview/guides/structured-responses).

Example:

```ts
import { VeniceSDK } from 'venice-api-sdk';

const sdk = await VeniceSDK.New({ apiKey: process.env.venice_api_key! });

const resp = await sdk.api.chat.createChatCompletion({
  model: 'dolphin-2.9.2-qwen2-72b',
  messages: [
    { role: 'system' as any, content: 'You are a helpful math tutor.' },
    { role: 'user' as any, content: 'solve 8x + 31 = 2' },
  ],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'math_response',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                explanation: { type: 'string' },
                output: { type: 'string' },
              },
              required: ['explanation', 'output'],
              additionalProperties: false,
            },
          },
          final_answer: { type: 'string' },
        },
        required: ['steps', 'final_answer'],
        additionalProperties: false,
      },
    },
  },
});

// Parsed JSON object available when the model returns valid JSON:
console.log(resp.choices[0].message.parsed);
```

Notes:
- Ensure `strict: true` and `additionalProperties: false` for proper enforcement.
- All fields should be in `required`, and optional fields can specify a union with `null` type.
- Not all models support structured responses; look for `supportsResponseSchema` in model capabilities.
# Venice AI SDK - Agent-Focused Development Platform

A comprehensive TypeScript/JavaScript SDK for Venice AI that enables building **automated agents** with **context injection**, **model recommendations**, and **persistent memory**.

## 🚀 Key Features

- **🤖 Agent System**: Create specialized AI agents with custom contexts and behaviors
- **📊 Model Recommendations**: Get optimal model suggestions based on use case, performance, and pricing
- **🧠 Context Injection**: Dynamic context management for personalized agent interactions  
- **💬 Session Management**: Persistent conversation memory with configurable limits
- **🛠️ Tool Integration**: Function calling and custom tool support
- **⚡ OpenAI Compatible**: Drop-in replacement for OpenAI API calls
- **🔒 Privacy-First**: Built on Venice AI's zero-data-retention platform

## 📦 Installation

```bash
npm install venice-api-sdk
```

## 🛠️ Basic Usage

### SDK Initialization

```typescript
import { VeniceSDK } from "venice-api-sdk";

const sdk = await VeniceSDK.New({ 
  apiKey: process.env.VENICE_API_KEY 
});
```

### Simple Chat API (OpenAI Compatible)

```typescript
const response = await sdk.api.chat.createChatCompletion({
  model: "dolphin-2.9.2-qwen2-72b", // Venice Uncensored
  messages: [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Explain quantum computing" }
  ],
  temperature: 0.7
});
```

## 🤖 Agent System

### Model Recommendations

Get the best model for your use case:

```typescript
// Get models for specific use cases
const codingModels = sdk.getModelRecommendations("coding");
const writingModels = sdk.getModelRecommendations("writing");
const researchModels = sdk.getModelRecommendations("research");

// Filter by performance tier
const fastModels = sdk.getModelsByPerformance("fast");
const balancedModels = sdk.getModelsByPerformance("balanced");
const bestModels = sdk.getModelsByPerformance("best");

// Filter by pricing
const budgetModels = sdk.getModelsByPricing("low");
const standardModels = sdk.getModelsByPricing("medium");
const premiumModels = sdk.getModelsByPricing("high");

// Get the best model for a specific use case
const bestModel = sdk.getBestModelForUseCase("research");
console.log(`Recommended: ${bestModel.name} - ${bestModel.description}`);
```

### Creating Agents with Context

```typescript
// Create a coding assistant with custom context
const codingAgent = sdk.createAgentWithContext(
  "CodingAssistant",
  `You are an expert TypeScript developer. Help with code review, 
   architecture, and best practices. Always provide working examples.`,
  {
    language: "typescript",
    framework: "node.js",
    project: "ai-agent-system",
    preferences: ["clean code", "type safety", "performance"]
  },
  {
    model: "mistral-31-24b", // Great for coding tasks
    temperature: 0.3,
    memoryLimit: 30
  }
);

// Chat with the agent
const response = await codingAgent.chat(
  "How should I structure error handling in this SDK?"
);
console.log(response.message);
```

### Dynamic Context Updates

```typescript
// Create a research agent
const researcher = sdk.createAgentWithContext(
  "ResearchAgent",
  "You are an AI research specialist. Provide in-depth analysis based on current context.",
  {
    field: "machine learning",
    expertise: ["NLP", "computer vision", "reinforcement learning"]
  }
);

// Update context dynamically
researcher.addContext("currentTopic", "transformer architectures");
researcher.addContext("depth", "technical");

const analysis = await researcher.chat("Explain the latest advances in attention mechanisms");
```

### Agents with Custom Tools

```typescript
const agentWithTools = sdk.createAgent({
  name: "DataAnalyst",
  model: sdk.getDefaultModel(), // Uses Venice Uncensored by default
  systemPrompt: "You analyze data using available tools. Format tool calls as: TOOL:functionName({args})",
  context: { role: "analyst", domain: "crypto" },
  tools: [
    {
      name: "getPrice",
      description: "Get current crypto price",
      parameters: { symbol: "string" },
      handler: async (args) => {
        // Your API call here
        return `${args.symbol}: $50,000`;
      }
    },
    {
      name: "calculateMA",
      description: "Calculate moving average",
      parameters: { period: "number", data: "array" },
      handler: async (args) => {
        const sum = args.data.reduce((a, b) => a + b, 0);
        return sum / args.period;
      }
    }
  ]
});

const analysis = await agentWithTools.chat("What's the current BTC price and 7-day MA?");
```

### Memory Management

```typescript
// Get conversation history
const history = agent.getHistory();

// Get agent information  
const info = agent.getInfo();
console.log(`${info.name} using ${info.model}: ${info.messageCount} messages`);

// Clear memory but preserve context
agent.clearMemory();
```

## 📊 Available Models

The SDK includes recommendations for Venice AI's diverse model selection:

### Text Generation Models

**Fast/Small Models:**
- **Qwen3-4B**: Ultra-fast with thinking modes, multilingual support
- **Llama-3.2-3B**: Efficient for simple tasks

**Balanced Models:**
- **Mistral 3.1 24B**: Excellent for coding, function calling, vision tasks
- **Venice Uncensored (Dolphin)**: 2.20% refusal rate, great for creative writing
- **Qwen QWQ 32B**: Advanced reasoning and multi-step tasks

**Best/Large Models:**
- **Qwen3-235B**: Superior reasoning with thinking modes
- **Llama 3.1 405B**: Meta's largest open-source model

### Image Generation Models

- **Fluently XL v4**: Default Venice image model with improved aesthetics
- **Venice SD35**: Custom Stable Diffusion 3.5 with photorealism
- **FLUX**: State-of-the-art image generation
- **FLUX Uncensored**: Adjustable censorship removal
- **Hi-Dream**: 17B parameter model for diverse art styles
- **Pony Realism**: Specialized for realistic people and landscapes

## 🎯 Example Scripts

### Running the Demo

```bash
# Set your API key
export VENICE_API_KEY="your-api-key"

# Run the interactive demo
npm run demo

# Run specific examples
node examples/demo-agent.js
npx ts-node examples/agent-examples.ts
```

### Interactive CLI

```bash
npm run cli
```

The CLI allows you to:
- Choose between chat and image generation
- Select from available models
- Have interactive conversations
- Save generated images

## 📚 Advanced Examples

### Multi-Agent System

```typescript
// Create specialized agents for different tasks
const researcher = sdk.createAgentWithContext(
  "Researcher", 
  "You research topics thoroughly and provide comprehensive analysis.",
  { expertise: "AI systems", outputFormat: "structured" }
);

const writer = sdk.createAgentWithContext(
  "Writer",
  "You write engaging content based on research provided.",
  { style: "technical but accessible", audience: "developers" }
);

const reviewer = sdk.createAgentWithContext(
  "Reviewer",
  "You review content for accuracy, clarity, and completeness.",
  { criteria: ["technical accuracy", "readability", "completeness"] }
);

// Coordinate between agents
const research = await researcher.chat("Research AI agent architectures");
const article = await writer.chat(`Write an article based on: ${research.message}`);
const review = await reviewer.chat(`Review this article: ${article.message}`);
```

### Context-Aware Social Media Agent

```typescript
const socialAgent = sdk.createAgentWithContext(
  "SocialManager",
  "Create platform-optimized content based on brand guidelines and context.",
  {
    platform: "twitter",
    brand: "TechStartup",
    tone: "professional but approachable", 
    maxLength: 280,
    hashtags: ["#AI", "#Tech", "#Innovation"],
    targetAudience: "developers and entrepreneurs"
  }
);

const tweet = await socialAgent.chat("Announce our new AI agent platform launch");
```

## 🔧 Configuration

### SDK Options

```typescript
const sdk = await VeniceSDK.New({
  apiKey: "your-api-key",
  baseUrl: "https://api.venice.ai/api/v1", // default
  request: {
    timeout: 30000,
    axiosParams: { /* custom axios config */ }
  }
});
```

### Agent Configuration

```typescript
const agent = sdk.createAgent({
  name: "CustomAgent",
  model: "dolphin-2.9.2-qwen2-72b", // Venice Uncensored
  systemPrompt: "Your custom system prompt",
  context: { /* your context */ },
  temperature: 0.7,
  maxTokens: 4000,
  memoryLimit: 50,
  tools: [ /* custom tools */ ]
});
```

## 🚀 Building Production Agents

The Venice SDK is designed for building **production-ready automated agents**:

### Common Agent Patterns
- **Research Agents**: Continuous information gathering and analysis
- **Customer Support Agents**: Automated support with context awareness
- **Content Creation Agents**: SEO-optimized content generation
- **Code Review Agents**: Automated code analysis and suggestions
- **Data Analysis Agents**: Real-time data processing and insights

### Best Practices
1. **Model Selection**: Use `getModelRecommendations()` to find optimal models
2. **Context Management**: Keep context focused and relevant
3. **Memory Limits**: Set appropriate limits to balance cost and functionality
4. **Error Handling**: Implement robust error handling for production
5. **Tool Design**: Create reusable tools for common agent tasks

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests (requires API key)
npm run test:integration

# Run specific test suites
npm run test:agent
npm run test:models
```

## 🔗 Links

- [Venice AI Platform](https://venice.ai)
- [API Documentation](https://docs.venice.ai) 
- [Model Pricing](https://docs.venice.ai/overview/pricing)
- [Get API Key](https://venice.ai)
- [Discord Community](https://discord.gg/askvenice)

## 📄 License

ISC License - see LICENSE file for details.

---

Built with ❤️ for the Venice AI community