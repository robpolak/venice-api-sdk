import { VeniceSDK } from '../../src';
import { ChatCompletionResponse, ChatMessageRole } from '../../src/model/chat';
import axios from 'axios';

describe('Venice AI Thinking Response Tests', () => {
  let veniceApiKey: string | undefined;

  beforeAll(() => {
    veniceApiKey = process.env['venice_api_key'];
    if (!veniceApiKey) {
      throw new Error('Missing venice_api_key environment variable');
    }
  });

  it('should introspect the raw API response for reasoning models', async () => {
    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });

    // Test with qwen-2.5-qwq-32b (reasoning model)
    console.log('\n=== Testing qwen-2.5-qwq-32b ===');

    try {
      const response = await sdk.api.chat.createChatCompletion({
        model: 'qwen-2.5-qwq-32b',
        messages: [
          {
            role: ChatMessageRole.SYSTEM,
            content:
              'You MUST respond in EXACTLY this format:\n[TEXT] <your text here>\n\nDo not include any other text before or after this format.',
          },
          {
            role: ChatMessageRole.USER,
            content: 'Say hello world',
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
        venice_parameters: {
          disable_thinking: true,
        },
      });

      console.log('\nFull response object:', JSON.stringify(response, null, 2));
      console.log('\nFirst choice:', JSON.stringify(response.choices[0], null, 2));
      console.log('\nMessage object:', JSON.stringify(response.choices[0].message, null, 2));

      // Check if there are any additional fields
      const message = response.choices[0].message;
      console.log('\nMessage keys:', Object.keys(message));
      console.log('\nContent length:', message.content?.length);
      console.log('\nAnswer field:', message.answer);

      // Log the actual content to see what we're getting
      console.log('\nContent preview (first 200 chars):', message.content?.substring(0, 200));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Request failed with status:', error.response?.status);
        console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
      } else {
        throw error;
      }
    }
  });

  it('should test different disable_thinking approaches', async () => {
    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });

    // Test 1: disable_thinking in venice_parameters
    console.log('\n=== Test 1: disable_thinking in venice_parameters ===');
    try {
      const response1 = await sdk.api.chat.createChatCompletion({
        model: 'qwen-2.5-qwq-32b',
        messages: [
          { role: ChatMessageRole.SYSTEM, content: 'Say only "hello"' },
          { role: ChatMessageRole.USER, content: 'Hi' },
        ],
        temperature: 0,
        max_tokens: 50,
        venice_parameters: {
          disable_thinking: true,
        },
      });
      console.log('Response content:', response1.choices[0].message.content?.substring(0, 100));
      console.log('Response answer:', response1.choices[0].message.answer);
    } catch (error: any) {
      console.error('Error:', error.message);
    }

    // Test 2: Model suffix approach
    console.log('\n=== Test 2: Model suffix :disable_thinking=true ===');
    try {
      const response2 = await sdk.api.chat.createChatCompletion({
        model: 'qwen-2.5-qwq-32b:disable_thinking=true',
        messages: [
          { role: ChatMessageRole.SYSTEM, content: 'Say only "hello"' },
          { role: ChatMessageRole.USER, content: 'Hi' },
        ],
        temperature: 0,
        max_tokens: 50,
      });
      console.log('Response content:', response2.choices[0].message.content?.substring(0, 100));
      console.log('Response answer:', response2.choices[0].message.answer);
    } catch (error: any) {
      console.error('Error:', error.message);
    }

    // Test 3: Model suffix :strip_thinking_response=true
    console.log('\n=== Test 3: Model suffix :strip_thinking_response=true ===');
    try {
      const response3 = await sdk.api.chat.createChatCompletion({
        model: 'qwen-2.5-qwq-32b:strip_thinking_response=true',
        messages: [
          { role: ChatMessageRole.SYSTEM, content: 'Say only "hello"' },
          { role: ChatMessageRole.USER, content: 'Hi' },
        ],
        temperature: 0,
        max_tokens: 50,
      });
      console.log('Response content:', response3.choices[0].message.content?.substring(0, 100));
      console.log('Response answer:', response3.choices[0].message.answer);
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  });

  it('should test with a non-reasoning model for comparison', async () => {
    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });

    console.log('\n=== Testing venice-uncensored (non-reasoning) ===');

    try {
      const response = await sdk.api.chat.createChatCompletion({
        model: 'venice-uncensored',
        messages: [
          {
            role: ChatMessageRole.SYSTEM,
            content:
              'You MUST respond in EXACTLY this format:\n[TEXT] <your text here>\n\nDo not include any other text before or after this format.',
          },
          {
            role: ChatMessageRole.USER,
            content: 'Say hello world',
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
      });

      console.log('\nContent:', response.choices[0].message.content);
      console.log('\nAnswer field:', response.choices[0].message.answer);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Request failed with status:', error.response?.status);
        console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
      } else {
        throw error;
      }
    }
  });
});
