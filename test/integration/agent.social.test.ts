import { VeniceSDK, VeniceAgent } from "../../src";

// Fictional user profile for testing
const FICTIONAL_USER = {
  name: "Alex Chen",
  age: 28,
  profession: "Software Engineer & Crypto Enthusiast",
  location: "San Francisco, CA",
  personality: {
    traits: ["analytical", "optimistic", "tech-savvy", "helpful"],
    communication_style: "casual but informative",
    humor: "dry wit, occasional tech jokes",
    interests: ["blockchain", "AI", "hiking", "specialty coffee"]
  },
  social_media: {
    platform: "twitter",
    follower_count: 2500,
    content_focus: ["tech insights", "crypto analysis", "startup life"],
    posting_frequency: "3-5 times per week",
    engagement_style: "thoughtful responses, asks good questions"
  },
  background: {
    education: "CS from UC Berkeley",
    experience: "5 years at tech startups, currently at Web3 company",
    expertise: ["JavaScript/TypeScript", "blockchain development", "DeFi protocols"],
    current_projects: ["building a DeFi yield optimizer", "contributing to open source"]
  },
  preferences: {
    tone: "friendly but professional",
    emoji_usage: "moderate - for emphasis only",
    hashtag_style: "2-3 relevant hashtags maximum",
    controversial_topics: "avoid but can discuss with nuance",
    response_length: "concise but substantive"
  }
};

describe.skip("Social Media Agent Integration Test", () => {
  let sdk: VeniceSDK | null = null;
  let socialAgent: VeniceAgent;
  
  beforeAll(async () => {
    // Check if API key is available
    if (!process.env.venice_api_key && !process.env.VENICE_API_KEY) {
      console.warn("Skipping integration test - no Venice API key found");
      return;
    }

    // Initialize SDK
    sdk = await VeniceSDK.New({ 
      apiKey: process.env.venice_api_key || process.env.VENICE_API_KEY 
    });

    // Use the Venice Uncensored model for social media content
    const selectedModel = "dolphin-2.9.2-qwen2-72b"; // Venice Uncensored default

    console.log(`Using model: ${selectedModel} for social media agent test`);

    // Create the fictional user agent
    socialAgent = sdk.createAgentWithContext(
      FICTIONAL_USER.name,
      `You are ${FICTIONAL_USER.name}, a ${FICTIONAL_USER.age}-year-old ${FICTIONAL_USER.profession} living in ${FICTIONAL_USER.location}.

PERSONALITY:
- Traits: ${FICTIONAL_USER.personality.traits.join(", ")}
- Communication style: ${FICTIONAL_USER.personality.communication_style}
- Humor: ${FICTIONAL_USER.personality.humor}
- Interests: ${FICTIONAL_USER.personality.interests.join(", ")}

BACKGROUND:
- Education: ${FICTIONAL_USER.background.education}
- Experience: ${FICTIONAL_USER.background.experience}
- Expertise: ${FICTIONAL_USER.background.expertise.join(", ")}
- Current projects: ${FICTIONAL_USER.background.current_projects.join(", ")}

SOCIAL MEDIA STYLE:
- Platform: ${FICTIONAL_USER.social_media.platform}
- Content focus: ${FICTIONAL_USER.social_media.content_focus.join(", ")}
- Engagement style: ${FICTIONAL_USER.social_media.engagement_style}
- Tone: ${FICTIONAL_USER.preferences.tone}
- Emoji usage: ${FICTIONAL_USER.preferences.emoji_usage}
- Hashtag style: ${FICTIONAL_USER.preferences.hashtag_style}
- Response length: ${FICTIONAL_USER.preferences.response_length}

When responding to posts:
1. Stay in character as Alex Chen
2. Use your expertise and interests to provide valuable insights
3. Maintain a ${FICTIONAL_USER.preferences.tone} tone
4. Keep responses ${FICTIONAL_USER.preferences.response_length}
5. Use ${FICTIONAL_USER.preferences.emoji_usage}
6. Include ${FICTIONAL_USER.preferences.hashtag_style}
7. Draw from your background and current projects when relevant

Always respond as if you're personally posting/replying on social media.`,
      {
        user_profile: FICTIONAL_USER,
        current_mood: "optimistic",
        current_focus: "DeFi development",
        recent_activity: "just deployed a smart contract",
        market_sentiment: "cautiously bullish on crypto"
      },
      {
        model: selectedModel,
        temperature: 0.8, // Higher creativity for social content
        memoryLimit: 20
      }
    );
  }, 30000); // 30 second timeout for setup

  // Skip tests if no API key
  const testIf = (condition: boolean) => condition ? test : test.skip;
  const hasApiKey = !!(process.env.venice_api_key || process.env.VENICE_API_KEY);

  testIf(hasApiKey)("should respond to a crypto discussion with expertise", async () => {
    const cryptoPost = `"Just saw that Bitcoin hit $45k again. Thinking about DCAing more. 
    What's everyone's thoughts on the current market cycle? Are we in for another run or is this a bull trap? 🤔"`;

    const response = await socialAgent.chat(
      `Respond to this crypto post: ${cryptoPost}`
    );

    console.log("Crypto Discussion Response:", response.message);

    // Verify response characteristics
    expect(response.message).toBeDefined();
    expect(response.message.length).toBeGreaterThan(50);
    expect(response.message.length).toBeLessThan(300); // Twitter-like length
    
    // Check for Alex's expertise and personality
    const lowerResponse = response.message.toLowerCase();
    expect(
      lowerResponse.includes("defi") || 
      lowerResponse.includes("yield") || 
      lowerResponse.includes("smart contract") ||
      lowerResponse.includes("protocol") ||
      lowerResponse.includes("blockchain")
    ).toBe(true);

    // Should maintain professional but friendly tone
    expect(lowerResponse).not.toMatch(/[!]{3,}/); // No excessive exclamation
    expect(response.message).toMatch(/[.!?]$/); // Proper punctuation
  }, 15000);

  testIf(hasApiKey)("should respond to a tech startup post with relevant experience", async () => {
    const startupPost = `"6 months into building our startup and we're finally getting some traction! 
    Product-market fit is real but so is the grind. Any advice for scaling from 0 to 1? 🚀"`;

    const response = await socialAgent.chat(
      `Respond to this startup post: ${startupPost}`
    );

    console.log("Startup Discussion Response:", response.message);

    expect(response.message).toBeDefined();
    
    // Should reference Alex's startup experience
    const lowerResponse = response.message.toLowerCase();
    expect(
      lowerResponse.includes("startup") || 
      lowerResponse.includes("scale") || 
      lowerResponse.includes("experience") ||
      lowerResponse.includes("built") ||
      lowerResponse.includes("team")
    ).toBe(true);

    // Should be encouraging but realistic (Alex's personality)
    expect(
      lowerResponse.includes("congrat") || 
      lowerResponse.includes("great") || 
      lowerResponse.includes("awesome") ||
      lowerResponse.includes("nice")
    ).toBe(true);
  }, 15000);

  testIf(hasApiKey)("should maintain consistent character across multiple interactions", async () => {
    // Test multiple posts to verify consistency
    const posts = [
      "What's your favorite developer tool that you discovered this year?",
      "Is anyone else concerned about the environmental impact of blockchain?",
      "Coffee recommendations for all-nighters? Working on a big release 😴"
    ];

    const responses: string[] = [];

    for (const post of posts) {
      const response = await socialAgent.chat(`Respond to: ${post}`);
      responses.push(response.message);
      console.log(`Response to "${post}":`, response.message);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Verify each response maintains character
    responses.forEach((response, index) => {
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(20);
      
      // Should not be overly formal or robotic
      expect(response).not.toMatch(/As an AI/i);
      expect(response).not.toMatch(/I am an AI/i);
      
      // Should maintain Alex's interests and background
      const lowerResponse = response.toLowerCase();
      if (index === 0) { // Developer tools
        expect(
          lowerResponse.includes("typescript") || 
          lowerResponse.includes("javascript") || 
          lowerResponse.includes("vscode") ||
          lowerResponse.includes("code") ||
          lowerResponse.includes("dev")
        ).toBe(true);
      }
    });

    // Verify agent maintains context/memory
    const agentInfo = socialAgent.getInfo();
    expect(agentInfo.messageCount).toBeGreaterThan(6); // Original + 3 posts + responses
    const userProfile = agentInfo.context.user_profile as typeof FICTIONAL_USER;
    expect(userProfile.name).toBe(FICTIONAL_USER.name);
  }, 45000);

  testIf(hasApiKey)("should update context dynamically and reflect changes", async () => {
    // Update Alex's current state
    socialAgent.addContext("current_mood", "excited");
    socialAgent.addContext("recent_achievement", "just got featured on Hacker News");
    socialAgent.addContext("current_focus", "preparing for tech conference talk");

    const celebrationPost = "Share something you're proud of this week! 🎉";

    const response = await socialAgent.chat(
      `Respond to this positive post: ${celebrationPost}`
    );

    console.log("Celebration Response (with updated context):", response.message);

    expect(response.message).toBeDefined();
    
    // Should reflect the updated context
    const lowerResponse = response.message.toLowerCase();
    expect(
      lowerResponse.includes("hacker news") || 
      lowerResponse.includes("featured") || 
      lowerResponse.includes("conference") ||
      lowerResponse.includes("talk") ||
      lowerResponse.includes("excited")
    ).toBe(true);

    // Should maintain enthusiastic tone based on mood update
    expect(
      lowerResponse.includes("excited") || 
      lowerResponse.includes("thrilled") || 
      lowerResponse.includes("amazing") ||
      response.message.includes("!") ||
      response.message.includes("🎉") ||
      response.message.includes("🚀")
    ).toBe(true);
  }, 15000);

  testIf(hasApiKey)("should handle edge cases appropriately", async () => {
    // Test with a controversial/political post
    const controversialPost = "Crypto is just a ponzi scheme and everyone knows it. Change my mind.";

    const response = await socialAgent.chat(
      `Respond to this controversial post: ${controversialPost}`
    );

    console.log("Controversial Post Response:", response.message);

    expect(response.message).toBeDefined();
    
    // Should handle with nuance (as per Alex's preferences)
    const lowerResponse = response.message.toLowerCase();
    expect(lowerResponse).not.toMatch(/stupid|dumb|idiotic/i); // No harsh language
    
    // Should provide thoughtful perspective
    expect(
      lowerResponse.includes("understand") || 
      lowerResponse.includes("perspective") || 
      lowerResponse.includes("nuance") ||
      lowerResponse.includes("complex") ||
      lowerResponse.includes("technology")
    ).toBe(true);

    // Should demonstrate expertise without being condescending
    expect(response.message.length).toBeGreaterThan(50); // Substantive response
  }, 15000);

  testIf(hasApiKey)("should provide agent information correctly", async () => {
    const agentInfo = socialAgent.getInfo();
    
    expect(agentInfo.name).toBe(FICTIONAL_USER.name);
    expect(agentInfo.messageCount).toBeGreaterThan(0);
    expect(agentInfo.context.user_profile).toBeDefined();
    const userProfile = agentInfo.context.user_profile as typeof FICTIONAL_USER;
    expect(userProfile.name).toBe(FICTIONAL_USER.name);
    expect(userProfile.profession).toBe(FICTIONAL_USER.profession);
    
    console.log("Agent Info:", {
      name: agentInfo.name,
      model: agentInfo.model,
      messageCount: agentInfo.messageCount,
      contextKeys: Object.keys(agentInfo.context)
    });
  });
});

describe.skip("Model Recommendation Integration", () => {
  let sdk: VeniceSDK | null = null;
  
  beforeAll(async () => {
    if (!process.env.venice_api_key && !process.env.VENICE_API_KEY) {
      return;
    }
    
    sdk = await VeniceSDK.New({ 
      apiKey: process.env.venice_api_key || process.env.VENICE_API_KEY 
    });
  });

  const hasApiKey = !!(process.env.venice_api_key || process.env.VENICE_API_KEY);
  const testIf = (condition: boolean) => condition ? test : test.skip;

  testIf(hasApiKey)("should provide relevant model recommendations", async () => {
    if (!sdk) throw new Error("SDK not initialized");
    
    // Since SDK methods aren't accessible in Jest, we'll test through the agents property
    expect(sdk.agents).toBeDefined();
    expect(typeof sdk.agents.getModelRecommendations).toBe('function');
    
    const writingModels = sdk.agents.getModelRecommendations("writing");
    expect(writingModels.length).toBeGreaterThan(0);
    
    // Verify model structure
    const firstModel = writingModels[0];
    expect(firstModel.id).toBeDefined();
    expect(firstModel.name).toBeDefined();
    expect(firstModel.description).toBeDefined();
    expect(firstModel.useCase).toBeInstanceOf(Array);
    expect(firstModel.pros).toBeInstanceOf(Array);
    expect(["low", "medium", "high"]).toContain(firstModel.pricing);
    expect(["fast", "balanced", "best"]).toContain(firstModel.performance);
  });

  testIf(hasApiKey)("should find best model for specific use case", async () => {
    if (!sdk) throw new Error("SDK not initialized");
    
    // Use agents property directly
    const bestCodingModel = sdk.agents.getBestModelForUseCase("coding");
    const bestWritingModel = sdk.agents.getBestModelForUseCase("writing");
    
    expect(bestCodingModel).toBeDefined();
    expect(bestWritingModel).toBeDefined();
    
    if (bestCodingModel) {
      expect(bestCodingModel.useCase.some(uc => 
        uc.toLowerCase().includes("coding") || 
        uc.toLowerCase().includes("code")
      )).toBe(true);
    }
  });

  testIf(hasApiKey)("should use Venice Uncensored as default model", async () => {
    if (!sdk) throw new Error("SDK not initialized");
    
    // Use agents property directly
    const defaultModel = sdk.agents.getDefaultModel();
    expect(defaultModel).toBe("dolphin-2.9.2-qwen2-72b");
    
    // Create an agent without specifying a model
    const defaultAgent = sdk.createAgentWithContext(
      "DefaultAgent",
      "You are a helpful assistant using Venice's default model.",
      { test: "default model usage" }
    );
    
    const agentInfo = defaultAgent.getInfo();
    
    // Should use Venice Uncensored when no model specified
    expect(agentInfo.model).toBe("dolphin-2.9.2-qwen2-72b");
  });

});