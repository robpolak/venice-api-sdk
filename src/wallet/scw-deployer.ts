/**
 * Smart Contract Wallet Deployment and Validation
 * Using Coinbase Wallet SDK patterns for P256 signatures
 */

import { WebAuthnP256, WebCryptoP256, Hex, PublicKey, Signature } from 'ox';
import type { WebAuthnAccount } from 'viem/account-abstraction';

// Coinbase Smart Wallet Factory Address (Base Sepolia)
const FACTORY_ADDRESS = '0x41675C099F32341bf84BFc5382aF534df5C7461a' as const;

// EIP-1271 magic value for valid signatures
const EIP1271_MAGIC_VALUE = '0x1626ba7e' as const;

export interface SCWDeploymentResult {
  address: string;
  account: WebAuthnAccount;
  keypair: P256KeyPair;
}

export interface P256KeyPair {
  privateKey: CryptoKey;
  publicKey: PublicKey.PublicKey;
}

export class SCWDeployer {
  private origin: string;

  constructor(origin: string = 'https://keys.coinbase.com') {
    this.origin = origin;
  }

  /**
   * Generate P256 keypair using Coinbase SDK pattern
   */
  async generateP256Keypair(): Promise<P256KeyPair> {
    const keypair = await WebCryptoP256.createKeyPair({ extractable: false });
    return {
      privateKey: keypair.privateKey,
      publicKey: keypair.publicKey
    };
  }

  /**
   * Create WebAuthn account from keypair
   */
  async createWebAuthnAccount(keypair: P256KeyPair): Promise<WebAuthnAccount> {
    const publicKey = Hex.slice(PublicKey.toHex(keypair.publicKey), 1);
    
    const sign = async (payload: Hex.Hex) => {
      const { payload: message, metadata } = WebAuthnP256.getSignPayload({
        challenge: payload,
        origin: this.origin,
        userVerification: 'preferred',
      });
      
      const signature = await WebCryptoP256.sign({
        payload: message,
        privateKey: keypair.privateKey,
      });
      
      return {
        signature: Signature.toHex(signature),
        raw: {} as unknown as PublicKeyCredential,
        webauthn: metadata,
      };
    };

    return {
      id: publicKey,
      publicKey,
      async sign({ hash }) {
        return sign(hash);
      },
      async signMessage({ message }) {
        const { hashMessage } = await import('viem');
        return sign(hashMessage(message));
      },
      async signTypedData(parameters) {
        const { hashTypedData } = await import('viem');
        return sign(hashTypedData(parameters));
      },
      type: 'webAuthn',
    };
  }

  /**
   * Calculate SCW address from P256 public key (simplified)
   */
  calculateSCWAddress(publicKey: string): string {
    // For demo purposes, return a deterministic address
    // In production, this would calculate the CREATE2 address
    const cleanKey = publicKey.replace('0x', '').slice(0, 40);
    return `0x${cleanKey}`;
  }

  /**
   * Format WebAuthn signature for SCW validation
   */
  formatWebAuthnSignature(
    signature: string,
    webauthn: any,
    ownerIndex: number = 0
  ): string {
    const { encodeAbiParameters } = require('viem');
    
    // Extract r, s from signature
    const sigBuffer = Buffer.from(signature.slice(2), 'hex');
    const r = '0x' + sigBuffer.slice(0, 32).toString('hex');
    const s = '0x' + sigBuffer.slice(32, 64).toString('hex');

    // Get authenticator data and client data
    const authenticatorData = webauthn.authenticatorData;
    const clientDataJSON = webauthn.clientDataJSON;
    
    // Find indices in client data
    const clientDataStr = Buffer.from(clientDataJSON.slice(2), 'hex').toString('utf8');
    const challengeIndex = clientDataStr.indexOf('"challenge":');
    const typeIndex = clientDataStr.indexOf('"type":');

    // Encode WebAuthnAuth struct
    const webAuthnAuthData = encodeAbiParameters(
      [{
        type: 'tuple',
        components: [
          { name: 'authenticatorData', type: 'bytes' },
          { name: 'clientDataJSON', type: 'bytes' },
          { name: 'challengeIndex', type: 'uint256' },
          { name: 'typeIndex', type: 'uint256' },
          { name: 'r', type: 'uint256' },
          { name: 's', type: 'uint256' },
        ],
      }],
      [{
        authenticatorData,
        clientDataJSON,
        challengeIndex: BigInt(challengeIndex),
        typeIndex: BigInt(typeIndex),
        r: BigInt(r),
        s: BigInt(s),
      }]
    );
    
    // Wrap in SignatureWrapper
    return encodeAbiParameters(
      [{
        type: 'tuple',
        components: [
          { name: 'ownerIndex', type: 'uint256' },
          { name: 'signatureData', type: 'bytes' },
        ],
      }],
      [{
        ownerIndex: BigInt(ownerIndex),
        signatureData: webAuthnAuthData,
      }]
    );
  }

  /**
   * Demo deployment result (for testing without actual deployment)
   */
  async deploySCW(keypair: P256KeyPair): Promise<SCWDeploymentResult> {
    const account = await this.createWebAuthnAccount(keypair);
    const publicKey = PublicKey.toHex(keypair.publicKey);
    const scwAddress = this.calculateSCWAddress(publicKey);

    console.log('📍 SCW Address (demo):', scwAddress);
    console.log('   Note: In production, this would deploy via factory contract');

    return {
      address: scwAddress,
      account,
      keypair
    };
  }

  /**
   * Validate EIP-712 signature (demo version)
   */
  async validateEIP712Demo(
    account: WebAuthnAccount,
    message: any
  ): Promise<boolean> {
    console.log('\n🔐 Validating EIP-712 signature (demo)...');
    
    // Sign the typed data
    const signature = await account.signTypedData(message);
    console.log('📝 Signature generated');

    // Format signature for SCW validation
    const formattedSignature = this.formatWebAuthnSignature(
      signature.signature,
      signature.webauthn,
      0
    );

    console.log('✅ Signature formatted for SCW validation');
    console.log('   Length:', formattedSignature.length);
    console.log('   First bytes:', formattedSignature.slice(0, 10) + '...');

    // In production, this would call isValidSignature on the SCW
    console.log('   Note: In production, this would validate on-chain');
    
    return true;
  }
}

// Example EIP-712 message for testing
export const createTestEIP712Message = (scwAddress: string) => ({
  domain: {
    name: 'Coinbase Smart Wallet',
    version: '1',
    chainId: 84532, // Base Sepolia
    verifyingContract: scwAddress as `0x${string}`,
  },
  types: {
    CoinbaseSmartWalletMessage: [
      { name: 'hash', type: 'bytes32' },
    ],
  },
  primaryType: 'CoinbaseSmartWalletMessage' as const,
  message: {
    hash: '0x' + Buffer.from('Hello from Venice AI SDK!').toString('hex').padEnd(64, '0') as `0x${string}`,
  },
}); 