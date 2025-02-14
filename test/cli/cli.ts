/**
 * Example CLI in TypeScript that:
 * 1. Asks if the user wants to chat or generate an image.
 * 2. Filters and prompts for the appropriate model.
 * 3. For chat: Reads the final answer from `choice.message.answer`.
 * 4. For images: Writes base64 images to randomly named local files.
 */

import inquirer from "inquirer";
import readline from "readline";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

import { VeniceSDK } from "../../src"; // Adjust import based on your project structure
import {
  ChatMessageRole,
  ChatCompletionRequest,
} from "../../src/model/chat";
import { ImageGenerationRequest } from "../../src/model/image";
import { ModelType } from "../../src/model/models";
import path from "path";

/**
 * Prints text to the console one character at a time to simulate "typing."
 */
async function typeWriter(text: string, delay = 10): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      process.stdout.write(text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        process.stdout.write("\n");
        resolve();
      }
    }, delay);
  });
}

/**
 * Reads a single line from stdin.
 */
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

(async function main() {
  try {
    // 1. Prompt the user for an API Key if not set in env
    let veniceApiKey = process.env["venice_api_key"];
    if (!veniceApiKey) {
      const { apiKey } = await inquirer.prompt<{ apiKey: string }>([
        {
          type: "input",
          name: "apiKey",
          message: "Enter your Venice API key:",
        },
      ]);
      veniceApiKey = apiKey.trim();
    }

    // 2. Create the Venice SDK (this automatically fetches models)
    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });
    while(true) {
      // 3. Ask if the user wants to chat or generate an image
      const {operation} = await inquirer.prompt<{ operation: string }>([
        {
          type: "list",
          name: "operation",
          message: "Which operation would you like to perform?",
          choices: ["Chat", "Generate Image", "Exit"],
        },
      ]);

      if (operation === "Exit") {
        console.log("Exiting CLI.");
        process.exit(0);
      }

      if (operation === "Chat") {
        // ---- Chat Flow ----

        // Filter text models
        const textModels = sdk.textModels?.data;
        if (!textModels || textModels.length === 0) {
          console.log("No text models found. Exiting.");
          process.exit(0);
        }

        // Prompt user to select one text model
        const {selectedModel} = await inquirer.prompt<{
          selectedModel: { id: string; type: ModelType };
        }>([
          {
            type: "list",
            name: "selectedModel",
            message: "Select a text model for chat:",
            choices: textModels.map((m) => ({
              name: `${m.id} (${m.type})`,
              value: {id: m.id, type: m.type},
            })),
          },
        ]);

        // Prep initial messages
        const messages: { role: ChatMessageRole; content: string }[] = [
          {
            role: ChatMessageRole.SYSTEM,
            content: "You are a helpful assistant.",
          },
        ];

        console.log(`\nStarting chat with model: ${selectedModel.id}\nType "exit" to quit.\n`);

        while (true) {
          // Prompt user for input
          const userInput = await promptUser("You: ");
          if (userInput.toLowerCase() === "exit") {
            console.log("Exiting chat.");
            break;
          }
          messages.push({role: ChatMessageRole.USER, content: userInput});

          // Build the chat completion request
          const chatRequest: ChatCompletionRequest = {
            model: selectedModel.id,
            messages,
            temperature: 0.7,
          };

          // Send the request
          const response = await sdk.api.chat.createChatCompletion(chatRequest);

          // Extract the assistant reply from the first choice
          const firstChoice = response?.choices?.[0];
          if (!firstChoice || !firstChoice.message) {
            console.log("No response from the API.");
            continue;
          }

          // 'ChatApi' has already stripped out chain-of-thought.
          // The final answer is stored in `choice.message.answer`.
          const finalAnswer = firstChoice.message.answer || "[No final answer found]";

          console.log("Assistant:");
          await typeWriter(finalAnswer);

          // Store the assistant's last message
          messages.push({
            role: ChatMessageRole.ASSISTANT,
            content: finalAnswer,
          });
        }
      } else if (operation === "Generate Image") {
        // ---- Image Generation Flow ----

        // Filter image models
        const imageModels = sdk.imageModels?.data;
        if (!imageModels || imageModels.length === 0) {
          console.log("No image models found. Exiting.");
          process.exit(0);
        }

        // Prompt user to select one image model
        const {selectedModel} = await inquirer.prompt<{
          selectedModel: { id: string; type: ModelType };
        }>([
          {
            type: "list",
            name: "selectedModel",
            message: "Select an image model:",
            choices: imageModels.map((m) => ({
              name: `${m.id} (${m.type})`,
              value: {id: m.id, type: m.type},
            })),
          },
        ]);

        // Prompt user for an image prompt
        const {imagePrompt} = await inquirer.prompt<{ imagePrompt: string }>([
          {
            type: "input",
            name: "imagePrompt",
            message: "Enter a prompt for your image:",
          },
        ]);

        // Build the image generation request
        const imgRequest: ImageGenerationRequest = {
          model: selectedModel.id,
          prompt: imagePrompt,
          hide_watermark: true,
          safe_mode: false,
        };

        console.log(`\nGenerating images with model: ${selectedModel.id}...\n`);

        const response = await sdk.api.images.generateImages(imgRequest);

        if (response.images?.length) {
          const tempDir = path.join(__dirname, "images");
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, {recursive: true});
          }
          response.images.forEach((item, i) => {
            const filename = path.join(__dirname, "images", `${uuidv4()}.png`);
            console.log(`Writing Image to: ${filename}`);
            fs.writeFileSync(filename, item, "base64");
            console.log(`Wrote base64 image to file: ${filename}`);
          });
        }
      }
    }
  } catch (err: any) {
    console.error("Error in CLI:", err);
    process.exit(1);
  }

})();
