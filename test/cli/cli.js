'use strict';
/**
 * Example CLI in TypeScript that:
 * 1. Asks if the user wants to chat or generate an image.
 * 2. Filters and prompts for the appropriate model.
 * 3. For chat: Reads the final answer from `choice.message.answer`.
 * 4. For images: Writes base64 images to randomly named local files.
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const inquirer_1 = __importDefault(require('inquirer'));
const readline_1 = __importDefault(require('readline'));
const fs_1 = __importDefault(require('fs'));
const uuid_1 = require('uuid');
const src_1 = require('../../src'); // Adjust import based on your project structure
const chat_1 = require('../../src/model/chat');
const path_1 = __importDefault(require('path'));
/**
 * Prints text to the console one character at a time to simulate "typing."
 */
function typeWriter(text_1) {
  return __awaiter(this, arguments, void 0, function* (text, delay = 10) {
    return new Promise(resolve => {
      let i = 0;
      const interval = setInterval(() => {
        process.stdout.write(text.charAt(i));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          process.stdout.write('\n');
          resolve();
        }
      }, delay);
    });
  });
}
/**
 * Reads a single line from stdin.
 */
function promptUser(question) {
  const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}
(function main() {
  return __awaiter(this, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
      // 1. Prompt the user for an API Key if not set in env
      let veniceApiKey = process.env['venice_api_key'];
      if (!veniceApiKey) {
        const { apiKey } = yield inquirer_1.default.prompt([
          {
            type: 'input',
            name: 'apiKey',
            message: 'Enter your Venice API key:',
          },
        ]);
        veniceApiKey = apiKey.trim();
      }
      // 2. Create the Venice SDK (this automatically fetches models)
      const sdk = yield src_1.VeniceSDK.New({ apiKey: veniceApiKey });
      while (true) {
        // 3. Ask if the user wants to chat or generate an image
        const { operation } = yield inquirer_1.default.prompt([
          {
            type: 'list',
            name: 'operation',
            message: 'Which operation would you like to perform?',
            choices: ['Chat', 'Generate Image', 'Exit'],
          },
        ]);
        if (operation === 'Exit') {
          console.log('Exiting CLI.');
          process.exit(0);
        }
        if (operation === 'Chat') {
          // ---- Chat Flow ----
          // Filter text models
          const textModels = (_a = sdk.textModels) === null || _a === void 0 ? void 0 : _a.data;
          if (!textModels || textModels.length === 0) {
            console.log('No text models found. Exiting.');
            process.exit(0);
          }
          // Prompt user to select one text model
          const { selectedModel } = yield inquirer_1.default.prompt([
            {
              type: 'list',
              name: 'selectedModel',
              message: 'Select a text model for chat:',
              choices: textModels.map(m => ({
                name: `${m.id} (${m.type})`,
                value: { id: m.id, type: m.type },
              })),
            },
          ]);
          // Prep initial messages
          const messages = [
            {
              role: chat_1.ChatMessageRole.SYSTEM,
              content: 'You are a helpful assistant.',
            },
          ];
          console.log(`\nStarting chat with model: ${selectedModel.id}\nType "exit" to quit.\n`);
          while (true) {
            // Prompt user for input
            const userInput = yield promptUser('You: ');
            if (userInput.toLowerCase() === 'exit') {
              console.log('Exiting chat.');
              break;
            }
            messages.push({ role: chat_1.ChatMessageRole.USER, content: userInput });
            // Build the chat completion request
            const chatRequest = {
              model: selectedModel.id,
              messages,
              temperature: 0.7,
            };
            // Send the request
            const response = yield sdk.api.chat.createChatCompletion(chatRequest);
            // Extract the assistant reply from the first choice
            const firstChoice =
              (_b = response === null || response === void 0 ? void 0 : response.choices) ===
                null || _b === void 0
                ? void 0
                : _b[0];
            if (!firstChoice || !firstChoice.message) {
              console.log('No response from the API.');
              continue;
            }
            // 'ChatApi' has already stripped out chain-of-thought.
            // The final answer is stored in `choice.message.answer`.
            const finalAnswer = firstChoice.message.answer || '[No final answer found]';
            console.log('Assistant:');
            yield typeWriter(finalAnswer);
            // Store the assistant's last message
            messages.push({
              role: chat_1.ChatMessageRole.ASSISTANT,
              content: finalAnswer,
            });
          }
        } else if (operation === 'Generate Image') {
          // ---- Image Generation Flow ----
          // Filter image models
          const imageModels = (_c = sdk.imageModels) === null || _c === void 0 ? void 0 : _c.data;
          if (!imageModels || imageModels.length === 0) {
            console.log('No image models found. Exiting.');
            process.exit(0);
          }
          // Prompt user to select one image model
          const { selectedModel } = yield inquirer_1.default.prompt([
            {
              type: 'list',
              name: 'selectedModel',
              message: 'Select an image model:',
              choices: imageModels.map(m => ({
                name: `${m.id} (${m.type})`,
                value: { id: m.id, type: m.type },
              })),
            },
          ]);
          // Prompt user for an image prompt
          const { imagePrompt } = yield inquirer_1.default.prompt([
            {
              type: 'input',
              name: 'imagePrompt',
              message: 'Enter a prompt for your image:',
            },
          ]);
          // Build the image generation request
          const imgRequest = {
            model: selectedModel.id,
            prompt: imagePrompt,
            hide_watermark: true,
            safe_mode: false,
          };
          console.log(`\nGenerating images with model: ${selectedModel.id}...\n`);
          const response = yield sdk.api.images.generateImages(imgRequest);
          if ((_d = response.images) === null || _d === void 0 ? void 0 : _d.length) {
            const tempDir = path_1.default.join(__dirname, 'images');
            if (!fs_1.default.existsSync(tempDir)) {
              fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            response.images.forEach((item, i) => {
              const filename = path_1.default.join(__dirname, 'images', `${(0, uuid_1.v4)()}.png`);
              console.log(`Writing Image to: ${filename}`);
              fs_1.default.writeFileSync(filename, item, 'base64');
              console.log(`Wrote base64 image to file: ${filename}`);
            });
          }
        }
      }
    } catch (err) {
      console.error('Error in CLI:', err);
      process.exit(1);
    }
  });
})();
