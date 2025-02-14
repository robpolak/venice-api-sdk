import {VeniceSDK} from "../../src";
import {ListModelsResponse, ModelType} from "../../src/model/models";
import {ChatCompletionResponse, ChatMessageRole} from "../../src/model/chat";
import axios from "axios";

describe("Integration Tests with VeniceSDK", () => {
  let veniceApiKey: string | undefined;

  beforeAll(() => {
    // Load the API key from environment variables
    // e.g., process.env.venice_api_key set in your CI or local environment
    veniceApiKey = process.env["venice_api_key"];
    if (!veniceApiKey) {
      throw new Error("Missing venice_api_key environment variable");
    }
  });

  it("should retrieve a list of models matching the expected format", async () => {
    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });
    const response = await sdk.api.models.listModels();

    // Assert top-level structure
    expect(response.object).toBe("list");
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(1);

    // Check each item in the data array
    response.data.forEach((model: any) => {
      expect(typeof model.id).toBe("string");
      expect(typeof model.type).toBe("string");
      expect(typeof model.object).toBe("string");
      expect(typeof model.created).toBe("number");
      expect(typeof model.owned_by).toBe("string");
      expect(model.model_spec).toBeDefined(); // or any more specific check
    });
  });

  it("should create a chat completion successfully", async () => {
    // Instantiate the SDK

    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });
    let chatResponse: ChatCompletionResponse;
    try {
      // Call the chat API
      chatResponse = await sdk.api.chat.createChatCompletion({
        model: "deepseek-r1-llama-70b",        // Replace with a valid model ID if needed
        messages: [
          { role: ChatMessageRole.SYSTEM, content: "You are a helpful assistant. You give one word answers, no more than just one word.  If I ask for the capital of a city you give just one lowercase word response.  " },
          {role: ChatMessageRole.USER, content: "what is the capital of france?"},
        ],
        temperature: 0.7,
      });
      // Basic checks on the response
      expect(chatResponse).toBeDefined();
      expect(typeof chatResponse.id).toBe("string");
      // 'object' is often 'chat.completion' or similar; adjust based on your actual response
      expect(typeof chatResponse.object).toBe("string");
      expect(typeof chatResponse.created).toBe("number");
      expect(Array.isArray(chatResponse.choices)).toBe(true);

      // Check at least one choice
      const [firstChoice] = chatResponse.choices;
      console.log(`${JSON.stringify(firstChoice.message, null, 2)}`);
      expect(firstChoice.message.answer).toBe("paris");
      expect(firstChoice).toBeDefined();
      expect(firstChoice.message).toBeDefined();
      expect(firstChoice.message.role).toBe(ChatMessageRole.ASSISTANT);
      expect(typeof firstChoice.message.content).toBe("string");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Print status, headers, data — anything relevant
        console.error("Request failed with status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        console.error("Axios error message:", error.message);
      } else {
        throw error
      }
    }


  });

});