# EXPERIMENTAL.. USE AT YOUR OWN RISK


## CLI usage

Export your Venice API key to  `venice_api_key`

```
process.env["venice_api_key"];
```

Start the CLI using: `npm run cli`

## SDK Usage

Initiate the SDK

```js
import { VeniceSDK } from "venice-api-sdk"
const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });

// Build the chat completion request
const chatRequest: ChatCompletionRequest = {
  model: sdk.textModels?.data[0].id,
  messages,
  temperature: 0.7,
};

// Send the request
const response = await sdk.api.chat.createChatCompletion(chatRequest);
console.log(`${JSON.stringify(response, null, 2)}`);
```