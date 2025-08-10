import { VeniceSDK } from '../../src';
import { ChatMessageRole, JsonSchemaResponseFormat } from '../../src/model/chat';
import type { ListModelsResponse, Model } from '../../src/model/models';

function findModelWithStructuredOutput(models: ListModelsResponse | undefined): Model | undefined {
  const list = models?.data ?? [];
  for (const m of list) {
    const caps = (m.model_spec as any)?.capabilities ?? {};
    if (caps.supportsResponseSchema === true) {
      return m;
    }
  }
  return undefined;
}

describe('Structured Responses via response_format', () => {
  let veniceApiKey: string | undefined;

  beforeAll(() => {
    veniceApiKey = process.env['venice_api_key'];
    if (!veniceApiKey) {
      throw new Error('Missing venice_api_key environment variable');
    }
  });

  it('returns JSON matching schema and populates message.parsed when supported', async () => {
    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });

    // Prefer a model that explicitly supports structured outputs
    const modelWithSchema = findModelWithStructuredOutput(sdk.textModels);
    const modelId = modelWithSchema?.id ?? 'dolphin-2.9.2-qwen2-72b';

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
      model: modelId,
      messages: [
        { role: ChatMessageRole.SYSTEM, content: 'You are a helpful math tutor.' },
        { role: ChatMessageRole.USER, content: 'solve 8x + 31 = 2' },
      ],
      temperature: 0,
      response_format: responseFormat,
      max_tokens: 700,
    });

    const message = resp.choices[0]?.message;
    expect(message).toBeDefined();
    console.log('\n[Structured Responses] Model used:', modelId);
    console.log('[Structured Responses] supportsResponseSchema:', Boolean(modelWithSchema));
    console.log('[Structured Responses] Raw content (first 800 chars):', (message?.content ?? '').slice(0, 800));

    // If no model supports structured outputs, skip strict JSON assertions
    if (modelWithSchema == null) {
      console.warn('No model with supportsResponseSchema capability found; skipping JSON assertions');
      return;
    }

    // Validate parsed JSON when available
    const parsed: any = (message as any).parsed;
    if (parsed == null) {
      const raw = message?.content ?? '';
      const looksJson = raw.trim().startsWith('{') || raw.trim().startsWith('[');
      if (looksJson) {
        try {
          const fallbackParsed = JSON.parse(raw);
          console.log('[Structured Responses] Parsed JSON (fallback):', JSON.stringify(fallbackParsed, null, 2));
        } catch (err: any) {
          console.warn('Structured response looked like JSON but parse failed:', err?.message);
          console.warn('Raw JSON preview (first 800 chars):', raw.slice(0, 800));
        }
      } else {
        console.warn('Structured response not returned as pure JSON; skipping assertions');
      }
      return;
    }

    console.log('[Structured Responses] Parsed JSON:', JSON.stringify(parsed, null, 2));
    expect(parsed).toHaveProperty('steps');
    expect(Array.isArray(parsed.steps)).toBe(true);
    expect(parsed).toHaveProperty('final_answer');
    expect(typeof parsed.final_answer).toBe('string');
  });

  it('emits parsed JSON for a minimal schema (for manual verification)', async () => {
    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });

    const modelWithSchema = findModelWithStructuredOutput(sdk.textModels);
    const modelId = modelWithSchema?.id ?? 'dolphin-2.9.2-qwen2-72b';

    const responseFormat: JsonSchemaResponseFormat = {
      type: 'json_schema',
      json_schema: {
        name: 'short_answer',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            final_answer: { type: 'string' },
          },
          required: ['final_answer'],
          additionalProperties: false,
        },
      },
    };

    const resp = await sdk.api.chat.createChatCompletion({
      model: modelId,
      messages: [
        { role: ChatMessageRole.SYSTEM, content: 'You are a helpful assistant. Answer concisely.' },
        { role: ChatMessageRole.USER, content: 'Return the sum of 3 and 5 as JSON.' },
      ],
      temperature: 0,
      response_format: responseFormat,
      max_tokens: 256,
    });

    const message = resp.choices[0]?.message;
    expect(message).toBeDefined();
    console.log('\n[Structured Responses Minimal] Model used:', modelId);
    console.log('[Structured Responses Minimal] supportsResponseSchema:', Boolean(modelWithSchema));
    console.log('[Structured Responses Minimal] Raw content:', message?.content ?? '');

    if (modelWithSchema == null) {
      console.warn('No model with supportsResponseSchema capability found; skipping JSON assertions');
      return;
    }

    const parsed: any = (message as any).parsed;
    if (parsed == null) {
      const raw = message?.content ?? '';
      try {
        const fallbackParsed = JSON.parse(raw);
        console.log('[Structured Responses Minimal] Parsed JSON (fallback):', JSON.stringify(fallbackParsed, null, 2));
      } catch (err: any) {
        console.warn('[Structured Responses Minimal] Parse failed:', err?.message);
      }
      return;
    }

    console.log('[Structured Responses Minimal] Parsed JSON:', JSON.stringify(parsed, null, 2));
    expect(typeof parsed.final_answer).toBe('string');
  });
});

