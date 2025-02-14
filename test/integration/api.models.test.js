"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const chat_1 = require("../../src/model/chat");
const axios_1 = __importDefault(require("axios"));
describe("Integration Tests with VeniceSDK", () => {
    let veniceApiKey;
    beforeAll(() => {
        // Load the API key from environment variables
        // e.g., process.env.venice_api_key set in your CI or local environment
        veniceApiKey = process.env["venice_api_key"];
        if (!veniceApiKey) {
            throw new Error("Missing venice_api_key environment variable");
        }
    });
    it("should retrieve a list of models matching the expected format", () => __awaiter(void 0, void 0, void 0, function* () {
        const sdk = yield src_1.VeniceSDK.New({ apiKey: veniceApiKey });
        const response = yield sdk.api.models.listModels();
        // Assert top-level structure
        expect(response.object).toBe("list");
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(1);
        // Check each item in the data array
        response.data.forEach((model) => {
            expect(typeof model.id).toBe("string");
            expect(typeof model.type).toBe("string");
            expect(typeof model.object).toBe("string");
            expect(typeof model.created).toBe("number");
            expect(typeof model.owned_by).toBe("string");
            expect(model.model_spec).toBeDefined(); // or any more specific check
        });
    }));
    it("should create a chat completion successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        // Instantiate the SDK
        var _a, _b;
        const sdk = yield src_1.VeniceSDK.New({ apiKey: veniceApiKey });
        let chatResponse;
        try {
            // Call the chat API
            chatResponse = yield sdk.api.chat.createChatCompletion({
                model: "deepseek-r1-llama-70b", // Replace with a valid model ID if needed
                messages: [
                    { role: chat_1.ChatMessageRole.SYSTEM, content: "You are a helpful assistant. You give one word answers, no more than just one word.  If I ask for the capital of a city you give just one lowercase word response.  " },
                    { role: chat_1.ChatMessageRole.USER, content: "what is the capital of france?" },
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
            expect(firstChoice.message.role).toBe(chat_1.ChatMessageRole.ASSISTANT);
            expect(typeof firstChoice.message.content).toBe("string");
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                // Print status, headers, data — anything relevant
                console.error("Request failed with status:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
                console.error("Response data:", (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
                console.error("Axios error message:", error.message);
            }
            else {
                throw error;
            }
        }
    }));
});
