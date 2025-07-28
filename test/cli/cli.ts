/**
 * Example CLI in TypeScript that:
 * 1. Asks if the user wants to chat, generate an image, or work with Smart Contract Wallets.
 * 2. Filters and prompts for the appropriate model.
 * 3. For chat: Reads the final answer from `choice.message.answer`.
 * 4. For images: Writes base64 images to randomly named local files.
 * 5. For SCW: Generates P256 keys, creates WebAuthn accounts, and signs messages.
 */

import inquirer from 'inquirer';
import readline from 'readline';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { VeniceSDK } from '../../src'; // Adjust import based on your project structure
import { ChatMessageRole, ChatCompletionRequest } from '../../src/model/chat';
import { ImageGenerationRequest } from '../../src/model/image';
import { ModelType } from '../../src/model/models';
import { SCWNodeDeployer, createNodeTestEIP712Message } from '../../src/wallet';
import path from 'path';

/**
 * Prints text to the console one character at a time to simulate "typing."
 */
async function typeWriter(text: string, delay = 10): Promise<void> {
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
}

/**
 * Reads a single line from stdin.
 */
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
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

(async function main() {
  try {
    // 1. Prompt the user for an API Key if not set in env
    let veniceApiKey = process.env['venice_api_key'];
    if (!veniceApiKey) {
      const { apiKey } = await inquirer.prompt<{ apiKey: string }>([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your Venice API key:',
        },
      ]);
      veniceApiKey = apiKey.trim();
    }

    // 2. Create the Venice SDK (this automatically fetches models)
    const sdk = await VeniceSDK.New({ apiKey: veniceApiKey });
    while (true) {
      // 3. Ask if the user wants to chat, generate an image, or work with SCW
      const { operation } = await inquirer.prompt<{ operation: string }>([
        {
          type: 'list',
          name: 'operation',
          message: 'Which operation would you like to perform?',
          choices: ['Chat', 'Generate Image', 'Smart Contract Wallet', 'Exit'],
        },
      ]);

      if (operation === 'Exit') {
        console.log('Exiting CLI.');
        process.exit(0);
      }

      if (operation === 'Chat') {
        // ---- Chat Flow ----

        // Filter text models
        const textModels = sdk.textModels?.data;
        if (!textModels || textModels.length === 0) {
          console.log('No text models found. Exiting.');
          process.exit(0);
        }

        // Prompt user to select one text model
        const { selectedModel } = await inquirer.prompt<{
          selectedModel: { id: string; type: ModelType };
        }>([
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
        const messages: { role: ChatMessageRole; content: string }[] = [
          {
            role: ChatMessageRole.SYSTEM,
            content: 'You are a helpful assistant.',
          },
        ];

        console.log(`\nStarting chat with model: ${selectedModel.id}\nType "exit" to quit.\n`);

        while (true) {
          // Prompt user for input
          const userInput = await promptUser('You: ');
          if (userInput.toLowerCase() === 'exit') {
            console.log('Exiting chat.');
            break;
          }
          messages.push({ role: ChatMessageRole.USER, content: userInput });

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
            console.log('No response from the API.');
            continue;
          }

          // 'ChatApi' has already stripped out chain-of-thought.
          // The final answer is stored in `choice.message.answer`.
          const finalAnswer = firstChoice.message.answer || '[No final answer found]';

          console.log('Assistant:');
          await typeWriter(finalAnswer);

          // Store the assistant's last message
          messages.push({
            role: ChatMessageRole.ASSISTANT,
            content: finalAnswer,
          });
        }
      } else if (operation === 'Generate Image') {
        // ---- Image Generation Flow ----

        // Filter image models
        const imageModels = sdk.imageModels?.data;
        if (!imageModels || imageModels.length === 0) {
          console.log('No image models found. Exiting.');
          process.exit(0);
        }

        // Prompt user to select one image model
        const { selectedModel } = await inquirer.prompt<{
          selectedModel: { id: string; type: ModelType };
        }>([
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
        const { imagePrompt } = await inquirer.prompt<{ imagePrompt: string }>([
          {
            type: 'input',
            name: 'imagePrompt',
            message: 'Enter a prompt for your image:',
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
          const tempDir = path.join(__dirname, 'images');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          response.images.forEach((item, i) => {
            const filename = path.join(__dirname, 'images', `${uuidv4()}.png`);
            console.log(`Writing Image to: ${filename}`);
            fs.writeFileSync(filename, item, 'base64');
            console.log(`Wrote base64 image to file: ${filename}`);
          });
        }
      } else if (operation === 'Smart Contract Wallet') {
        // ---- Smart Contract Wallet Flow ----
        
        console.log('\n🔐 Smart Contract Wallet Operations\n');
        
        const { scwOperation } = await inquirer.prompt<{ scwOperation: string }>([
          {
            type: 'list',
            name: 'scwOperation',
            message: 'What would you like to do?',
            choices: [
              'Generate P256 Keypair',
              'Sign Plain Message',
              'Sign EIP-712 Message',
              'Full Demo',
              'Back to Main Menu'
            ],
          },
        ]);

        if (scwOperation === 'Back to Main Menu') {
          continue;
        }

        // Initialize SCW deployer
        const scwDeployer = new SCWNodeDeployer('https://keys.coinbase.com');
        
        if (scwOperation === 'Generate P256 Keypair') {
          console.log('\n🔑 Generating P256 keypair...');
          const keypair = await scwDeployer.generateP256Keypair();
          const account = await scwDeployer.createWebAuthnAccount(keypair);
          
          console.log('✅ P256 keypair generated!');
          console.log(`   Public Key: ${account.publicKey}`);
          console.log(`   SCW Address: ${scwDeployer.calculateSCWAddress(account.publicKey)}`);
          
        } else if (scwOperation === 'Sign Plain Message') {
          console.log('\n📝 Signing plain message...');
          
          // Generate keypair
          const keypair = await scwDeployer.generateP256Keypair();
          const account = await scwDeployer.createWebAuthnAccount(keypair);
          
          const { message } = await inquirer.prompt<{ message: string }>([
            {
              type: 'input',
              name: 'message',
              message: 'Enter message to sign:',
              default: 'Hello from Venice AI SDK!'
            },
          ]);
          
          const signature = await account.signMessage({ message });
          
          console.log('\n✅ Message signed!');
          console.log(`   Message: ${message}`);
          console.log(`   Signature: ${signature.signature}`);
          console.log(`   WebAuthn: ${JSON.stringify(signature.webauthn, null, 2)}`);
          
        } else if (scwOperation === 'Sign EIP-712 Message') {
          console.log('\n📋 Signing EIP-712 typed data...');
          
          // Generate keypair
          const keypair = await scwDeployer.generateP256Keypair();
          const account = await scwDeployer.createWebAuthnAccount(keypair);
          const scwAddress = scwDeployer.calculateSCWAddress(account.publicKey);
          
          // Create EIP-712 message
          const eip712Message = createNodeTestEIP712Message(scwAddress);
          
          console.log('📝 EIP-712 Message:');
          console.log(`   Domain: ${eip712Message.domain.name}`);
          console.log(`   Version: ${eip712Message.domain.version}`);
          console.log(`   Chain ID: ${eip712Message.domain.chainId}`);
          console.log(`   Contract: ${eip712Message.domain.verifyingContract}`);
          
          const signature = await account.signTypedData(eip712Message);
          
          // Format for SCW
          const formattedSig = scwDeployer.formatWebAuthnSignature(
            signature.signature,
            signature.webauthn,
            0
          );
          
          console.log('\n✅ EIP-712 message signed!');
          console.log(`   Raw Signature: ${signature.signature.slice(0, 66)}...`);
          console.log(`   Formatted for SCW: ${formattedSig.slice(0, 66)}...`);
          console.log(`   Length: ${formattedSig.length} chars`);
          
        } else if (scwOperation === 'Full Demo') {
          console.log('\n🎯 Running full SCW demo...\n');
          
          // Step 1: Generate keypair
          console.log('1️⃣ Generating P256 keypair...');
          const keypair = await scwDeployer.generateP256Keypair();
          const account = await scwDeployer.createWebAuthnAccount(keypair);
          console.log('✅ Keypair generated');
          
          // Step 2: Calculate SCW address
          console.log('\n2️⃣ Calculating SCW address...');
          const scwAddress = scwDeployer.calculateSCWAddress(account.publicKey);
          console.log(`✅ SCW Address: ${scwAddress}`);
          
          // Step 3: Sign plain message
          console.log('\n3️⃣ Signing plain message...');
          const plainMessage = 'Venice AI + Coinbase Wallet = 🚀';
          const plainSig = await account.signMessage({ message: plainMessage });
          console.log(`✅ Signed: "${plainMessage}"`);
          console.log(`   Signature: ${plainSig.signature.slice(0, 20)}...`);
          
          // Step 4: Sign EIP-712
          console.log('\n4️⃣ Signing EIP-712 message...');
          const eip712Message = createNodeTestEIP712Message(scwAddress);
          const typedSig = await account.signTypedData(eip712Message);
          console.log('✅ EIP-712 signed');
          
          // Step 5: Format for SCW
          console.log('\n5️⃣ Formatting for SCW validation...');
          const formattedSig = scwDeployer.formatWebAuthnSignature(
            typedSig.signature,
            typedSig.webauthn,
            0
          );
          console.log(`✅ Formatted (${formattedSig.length} chars)`);
          
          console.log('\n🎉 Demo complete! All operations successful.');
        }
      }
    }
  } catch (err: any) {
    console.error('Error in CLI:', err);
    process.exit(1);
  }
})();
