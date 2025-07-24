import { VeniceSDK, VeniceAgent } from "../src";

/**
 * Examples of using the Venice SDK agent system with flexible context injection
 */

async function agentExamples() {
  // Initialize SDK
  const sdk = await VeniceSDK.New({ 
    apiKey: process.env.venice_api_key! 
  });

  console.log("=== Venice SDK Agent Examples ===\n");

  // 1. Get model recommendations for different use cases
  console.log("📊 Model Recommendations:");
  
  const codingModels = sdk.getModelRecommendations("coding");
  console.log("Best for coding:", codingModels.map(m => `${m.name} (${m.pricing})`));
  
  const fastModels = sdk.getModelsByPerformance("fast");
  console.log("Fast models:", fastModels.map(m => m.name));
  
  const bestCodingModel = sdk.getBestModelForUseCase("coding");
  console.log("Recommended for coding:", bestCodingModel?.name);

  // 2. Create a coding assistant with custom context
  console.log("\n🤖 Creating Coding Assistant Agent:");
  const codingAgent = sdk.createAgentWithContext(
    "CodingAssistant",
    `You are an expert software engineer specializing in TypeScript and Node.js. 
     You help with code review, debugging, architecture decisions, and best practices.
     Always provide working code examples and explain your reasoning.`,
    {
      language: "typescript",
      framework: "node.js",
      project: "venice-api-sdk",
      preferences: ["clean code", "type safety", "performance"]
    },
    {
      model: bestCodingModel?.id || sdk.getDefaultModel(),
      temperature: 0.3,
      memoryLimit: 30
    }
  );

  // Use the coding agent
  const codeResponse = await codingAgent.chat(
    "How should I structure error handling in this SDK? I want to provide good developer experience."
  );
  console.log("Coding Agent Response:", codeResponse.message);

  // 3. Create a crypto trading agent with custom context
  console.log("\n💰 Creating Trading Agent:");
  const tradingAgent = sdk.createAgentWithContext(
    "CryptoTrader",
    `You are a cryptocurrency trading assistant. You analyze markets, provide insights, 
     and help with trading decisions. Always include risk warnings and base recommendations 
     on the user's risk profile and portfolio context.`,
    {
      portfolio: {
        "BTC": 0.5,
        "ETH": 2.0,
        "USDC": 1000
      },
      riskLevel: "moderate",
      tradingStyle: "swing trading",
      maxTradeSize: 500
    },
    {
      temperature: 0.4,
      memoryLimit: 40
    }
  );

  const tradingResponse = await tradingAgent.chat(
    "Should I take some profits on my ETH position? It's up 15% this week."
  );
  console.log("Trading Agent Response:", tradingResponse.message);

  // 4. Create a social media agent with platform-specific context
  console.log("\n📱 Creating Social Media Agent:");
  const socialAgent = sdk.createAgentWithContext(
    "SocialManager",
    `You are a social media expert. Create engaging content optimized for the specific platform.
     Adapt your tone, style, and format based on the platform context and brand guidelines.`,
    {
      platform: "twitter",
      brand: "Venice AI",
      tone: "professional but approachable",
      maxLength: 280,
      hashtags: ["#AI", "#Privacy", "#OpenSource"],
      targetAudience: "developers and crypto enthusiasts"
    },
    {
      temperature: 0.8,
      memoryLimit: 25
    }
  );

  const socialResponse = await socialAgent.chat(
    "Create a tweet announcing our new agent system with context injection capabilities."
  );
  console.log("Social Agent Response:", socialResponse.message);

  // 5. Create a research agent with academic context
  console.log("\n🔬 Creating Research Agent:");
  const researchAgent = sdk.createAgentWithContext(
    "ResearchAssistant", 
    `You are a research assistant specializing in AI and blockchain technology.
     Provide thorough analysis, cite sources when possible, and present balanced perspectives.
     Focus on the specific research areas and methodologies in your context.`,
    {
      researchArea: "AI agent architectures",
      methodology: "systematic literature review",
      sources: ["academic papers", "technical documentation", "industry reports"],
      focus: "practical implementations",
      timeframe: "2020-2024"
    },
    {
      model: sdk.getBestModelForUseCase("research")?.id,
      temperature: 0.2,
      memoryLimit: 60
    }
  );

  const researchResponse = await researchAgent.chat(
    "What are the current best practices for implementing context injection in AI agent systems?"
  );
  console.log("Research Agent Response:", researchResponse.message);

  // 6. Dynamic context updates
  console.log("\n🔄 Dynamic Context Updates:");
  
  // Update trading agent context with new market data
  tradingAgent.addContext("marketCondition", "bullish");
  tradingAgent.addContext("volatility", "high");
  
  const updatedResponse = await tradingAgent.chat(
    "Given the current market conditions, should I adjust my strategy?"
  );
  console.log("Updated Trading Response:", updatedResponse.message);

  // 7. Agent info and memory management
  console.log("\n📊 Agent Information:");
  const agentInfo = codingAgent.getInfo();
  console.log("Coding Agent Info:", {
    name: agentInfo.name,
    model: agentInfo.model,
    messageCount: agentInfo.messageCount,
    contextKeys: Object.keys(agentInfo.context)
  });

  // Clear memory but keep context
  codingAgent.clearMemory();
  console.log("Memory cleared, context preserved");

  console.log("\n✅ Agent examples completed!");
}

// Example of using tools with agents
async function agentWithToolsExample() {
  const sdk = await VeniceSDK.New({ 
    apiKey: process.env.venice_api_key! 
  });

  console.log("\n🛠️ Agent with Tools Example:");

  // Create an agent with custom tools
  const agentWithTools = sdk.createAgent({
    name: "ToolAgent",
    model: sdk.getDefaultModel(),
    systemPrompt: `You are a helpful assistant with access to various tools.
                  When you need to use a tool, format it as: TOOL:toolName({"param": "value"})`,
    context: {
      environment: "development",
      userRole: "developer"
    },
    tools: [
      {
        name: "getCurrentTime",
        description: "Get the current timestamp",
        parameters: {},
        handler: async () => new Date().toISOString()
      },
      {
        name: "calculateHash",
        description: "Calculate hash of a string",
        parameters: { input: "string" },
        handler: async (args) => {
          const crypto = require('crypto');
          return crypto.createHash('sha256').update(args.input).digest('hex');
        }
      }
    ]
  });

  const toolResponse = await agentWithTools.chat(
    "What time is it? Also, can you calculate the hash of 'hello world'?"
  );
  
  console.log("Tool Response:", toolResponse.message);
  console.log("Tool Calls:", toolResponse.toolCalls);
}

// Run examples if this file is executed directly
if (require.main === module) {
  agentExamples()
    .then(() => agentWithToolsExample())
    .catch(console.error);
}

export { agentExamples, agentWithToolsExample }; 