# Migrating to Coinbase Wallet SDK for SCW Operations

## Overview
Yes, you can absolutely standardize on `coinbase-wallet-sdk` for all SCW work! The SDK uses the same underlying `ox` library but provides a cleaner abstraction for P256 key management and WebAuthn signature creation.

## Key Benefits of Migration

1. **Simplified Code**: No more manual signature building
2. **Consistent with Coinbase Infrastructure**: Uses the same patterns as Coinbase's production wallets
3. **Built-in WebAuthn Support**: Handles all the WebAuthn payload formatting
4. **Type Safety**: Full TypeScript support with viem integration

## Migration Steps

### 1. Install Dependencies

```bash
npm install @coinbase/wallet-sdk ox viem
```

### 2. Replace Manual Signature Building

**Before (Manual Approach):**
```typescript
private buildSCWSignature(webauthnAssertion: any, ownerIndex: number): string {
  // Manual extraction of r, s
  const signatureBuffer = Buffer.from(webauthnAssertion.response.signature, 'base64');
  const r = '0x' + signatureBuffer.slice(0, 32).toString('hex');
  const s = '0x' + signatureBuffer.slice(32, 64).toString('hex');
  
  // Manual encoding of WebAuthnAuth struct
  // ... 50+ lines of manual encoding ...
}
```

**After (Coinbase SDK Approach):**
```typescript
import { WebAuthnP256, WebCryptoP256 } from 'ox';

// Create signer using SDK patterns
const sign = async (payload: Hex) => {
  const { payload: message, metadata } = WebAuthnP256.getSignPayload({
    challenge: payload,
    origin: 'https://keys.coinbase.com', // or your origin
    userVerification: 'preferred',
  });
  
  const signature = await WebCryptoP256.sign({
    payload: message,
    privateKey: keypair.privateKey,
  });
  
  return {
    signature: Signature.toHex(signature),
    webauthn: metadata,
  };
};
```

### 3. Use WebAuthnAccount Pattern

The Coinbase SDK provides a `WebAuthnAccount` pattern that handles all signing methods:

```typescript
import type { WebAuthnAccount } from 'viem/account-abstraction';

const account: WebAuthnAccount = {
  id: publicKey,
  publicKey,
  async sign({ hash }) {
    return sign(hash);
  },
  async signMessage({ message }) {
    return sign(hashMessage(message));
  },
  async signTypedData(parameters) {
    return sign(hashTypedData(parameters));
  },
  type: 'webAuthn',
};
```

### 4. Integrate with Your SCW Service

```typescript
class WalletMobileSCWService {
  private scwIntegration: SCWIntegration;
  
  constructor() {
    // Use the same origin as wallet-mobile
    this.scwIntegration = new SCWIntegration('https://keys.coinbase.com');
  }
  
  async createFarcasterBot() {
    // Generate P256 keypair
    const keypair = await this.scwIntegration.generateP256Keypair();
    
    // Create WebAuthn account
    const account = await this.scwIntegration.createWebAuthnAccount(keypair);
    
    // Sign messages for Farcaster
    const signature = await account.signMessage({ 
      message: 'Your Farcaster message' 
    });
    
    // The signature includes all WebAuthn metadata needed for SCW validation
  }
}
```

### 5. Handle Sub-Accounts

For sub-accounts, the Coinbase SDK approach is even cleaner:

```typescript
// Instead of manually creating faux WebAuthn payloads
const subAccountSigner = this.scwIntegration.createWebAuthnSigner(subAccountKeypair);

// Sign with consistent WebAuthn format
const result = await subAccountSigner(messageHash);
```

## Complete Example: Farcaster Bot Creation

```typescript
import { SCWIntegration } from './src/wallet/scw-integration';
import { keccak256, encodePacked } from 'viem';

async function createFarcasterBotWithSDK() {
  const scw = new SCWIntegration('https://keys.coinbase.com');
  
  // 1. Generate keypair for SCW owner
  const keypair = await scw.generateP256Keypair();
  const account = await scw.createWebAuthnAccount(keypair);
  
  // 2. Calculate SCW address (same as before)
  const scwAddress = await calculateSCWAddress(account.publicKey);
  
  // 3. Sign Farcaster registration message
  const registerMessage = generateFarcasterRegisterMessage();
  const registerSig = await account.signTypedData(registerMessage);
  
  // 4. Sign add key message  
  const addKeyMessage = generateFarcasterAddKeyMessage();
  const addKeySig = await account.signTypedData(addKeyMessage);
  
  // 5. Format signatures for SCW validation if needed
  const formattedRegisterSig = scw.formatSCWSignature(
    registerSig.signature,
    registerSig.webauthn,
    0 // owner index
  );
  
  // 6. Submit to Farcaster with preRegistrationCalls
  const result = await submitToFarcaster({
    scwAddress,
    registerSignature: formattedRegisterSig,
    addKeySignature: addKeySig.signature,
    deploymentCalldata: generateDeploymentCalldata(account.publicKey)
  });
  
  return result;
}
```

## Migration Checklist

- [ ] Install `@coinbase/wallet-sdk` and ensure `ox` is available
- [ ] Replace manual `buildSCWSignature` with SDK's WebAuthn signing
- [ ] Update P256 key generation to use `WebCryptoP256.createKeyPair`
- [ ] Migrate to `WebAuthnAccount` pattern for consistent signing
- [ ] Update sub-account creation to use SDK patterns
- [ ] Test signature validation with your SCW contracts
- [ ] Remove manual WebAuthn struct encoding code

## Notes

- The SDK uses the same `ox` library under the hood, so the cryptographic operations are identical
- The `origin` can be customized based on your needs (e.g., `'https://wallet.coinbase.com'` for wallet-mobile compatibility)
- All signatures are EIP-1271 compatible for SCW validation
- The SDK handles all the WebAuthn metadata formatting automatically 