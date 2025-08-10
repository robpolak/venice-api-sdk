import { VeniceSDK } from '../src';
import type { JsonSchemaResponseFormat } from '../src/model/chat';

async function run() {
  const sdk = await VeniceSDK.New({ apiKey: process.env.venice_api_key! });

  const responseFormat: JsonSchemaResponseFormat = {
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
  };

  const resp = await sdk.api.chat.createChatCompletion({
    model: 'dolphin-2.9.2-qwen2-72b',
    messages: [
      { role: 'system' as any, content: 'You are a helpful math tutor.' },
      { role: 'user' as any, content: 'solve 8x + 31 = 2' },
    ],
    response_format: responseFormat,
    temperature: 0,
    max_tokens: 200,
  });

  console.log('Raw content:', resp.choices[0].message.content);
  console.log('Parsed object:', resp.choices[0].message.parsed);
}

if (require.main === module) {
  run().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export {}; 
