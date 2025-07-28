# Venice AI SDK - Wallet Module

This module provides Smart Contract Wallet (SCW) integration using Coinbase Wallet SDK patterns.

## Features

- **P256 Key Management**: Generate and manage P256 keypairs using WebCrypto
- **WebAuthn Signatures**: Create WebAuthn-compatible signatures for SCW validation
- **SCW Deployment**: Deploy Coinbase Smart Wallets on Base Sepolia
- **EIP-712 Validation**: Sign and validate EIP-712 messages on-chain
- **AI Integration**: Ready for natural language wallet interactions

## Quick Start

### 1. Deploy an SCW

```typescript
import { SCWDeployer } from 'venice-api-sdk/wallet';

const deployer = new SCWDeployer(rpcUrl, deployerPrivateKey);

// Generate P256 keypair
const keypair = await deployer.generateP256Keypair();

// Deploy SCW
const deployment = await deployer.deploySCW(keypair);
console.log('SCW deployed at:', deployment.address);
```

### 2. Sign EIP-712 Messages

```typescript
// Create WebAuthn account
const account = await deployer.createWebAuthnAccount(keypair);

// Sign typed data
const signature = await account.signTypedData({
  domain: { name: 'My App', version: '1', chainId: 84532 },
  types: { Message: [{ name: 'content', type: 'string' }] },
  primaryType: 'Message',
  message: { content: 'Hello from Venice AI!' }
});
```

### 3. Validate On-Chain

```typescript
const isValid = await deployer.validateEIP712OnChain(
  scwAddress,
  account,
  eip712Message
);
```

## Testing

Run the SCW deployment test:

```bash
# Set up environment
export DEPLOYER_PRIVATE_KEY=0x...

# Run test
npm run build && node test/integration/scw-deployment.test.js
```

## Architecture

The module uses the same `ox` library that powers Coinbase Wallet SDK:

- `WebCryptoP256`: For P256 key generation
- `WebAuthnP256`: For WebAuthn payload formatting
- `viem`: For blockchain interactions

## Key Benefits

1. **No Manual Signature Building**: The SDK handles all WebAuthn formatting
2. **Production-Ready**: Uses the same patterns as Coinbase's production wallets
3. **Type-Safe**: Full TypeScript support throughout
4. **AI-Ready**: Designed for integration with Venice AI agents 