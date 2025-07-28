/**
 * Venice AI SDK + Coinbase Wallet Integration Preview
 * 
 * This example demonstrates how AI agents can interact with
 * blockchain wallets using natural language.
 */

import { VeniceSDK } from '../src';
import { WalletAgent } from '../src/agents/wallet-agent';

async function main() {
  // Initialize Venice SDK
  const sdk = await VeniceSDK.New({
    apiKey: process.env.VENICE_API_KEY!
  });

  // Create a wallet-enabled AI agent
  const walletBot = sdk.createWalletAgent({
    name: 'CryptoAssistant',
    model: 'dolphin-2.9.2-qwen2-72b', // Venice Uncensored for crypto
    systemPrompt: `You are a helpful crypto wallet assistant. You can:
      - Check balances and transaction history
      - Send tokens and NFTs
      - Analyze DeFi opportunities
      - Provide market insights
      - Ensure transaction safety`,
    context: {
      network: 'ethereum',
      preferredDex: 'uniswap',
      slippageTolerance: 0.5,
      gasStrategy: 'balanced'
    },
    walletOptions: {
      appName: 'Venice AI Wallet',
      appLogoUrl: 'https://venice.ai/logo.png',
      darkMode: true
    }
  });

  // Connect wallet
  console.log('🔗 Connecting wallet...');
  const accounts = await walletBot.connect();
  console.log(`✅ Connected: ${accounts[0]}`);

  // Example 1: Natural language balance check
  const balanceResponse = await walletBot.chat(
    "What's my ETH balance and top 5 tokens?"
  );
  console.log('\n💰 Balance:', balanceResponse.message);

  // Example 2: Smart transaction with risk analysis
  const txResponse = await walletBot.chat(
    "Send 0.5 ETH to vitalik.eth but first check gas prices and analyze if it's a good time"
  );
  console.log('\n📊 Transaction Analysis:', txResponse.message);

  // Example 3: DeFi opportunity scanner
  const defiResponse = await walletBot.chat(
    "Find me the best stablecoin yield farms with APY above 10% and low risk"
  );
  console.log('\n🌾 DeFi Opportunities:', defiResponse.message);

  // Example 4: Portfolio analysis
  const portfolioResponse = await walletBot.chat(
    "Analyze my portfolio diversity and suggest rebalancing strategies"
  );
  console.log('\n📈 Portfolio Analysis:', portfolioResponse.message);

  // Example 5: Multi-step DeFi execution
  const strategyResponse = await walletBot.chat(
    "I have 10,000 USDC. Create and execute a laddered lending strategy across Aave and Compound"
  );
  console.log('\n🎯 Strategy Execution:', strategyResponse.message);

  // Example 6: NFT management
  const nftResponse = await walletBot.chat(
    "Show me my most valuable NFTs and any with offers above floor price"
  );
  console.log('\n🖼️ NFT Analysis:', nftResponse.message);

  // Advanced: Custom tools for specific protocols
  walletBot.addTool({
    name: 'flashLoanArbitrage',
    description: 'Find and execute flash loan arbitrage opportunities',
    parameters: {
      minProfit: 'number',
      protocols: 'array'
    },
    handler: async (args) => {
      // Implementation would scan for arbitrage opportunities
      return `Found arbitrage: Borrow ${args.amount} DAI from Aave, 
              swap on Uniswap, repay for ${args.minProfit} profit`;
    }
  });

  // Disconnect when done
  await walletBot.disconnect();
}

// Run the example
main().catch(console.error); 