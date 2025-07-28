/**
 * Smart Contract Wallet Deployment for Node.js
 * Simulates WebAuthn signatures for testing without browser
 */

import { WebCryptoP256, Hex, PublicKey, Signature } from 'ox';
import type { WebAuthnAccount } from 'viem/account-abstraction';
import { hashMessage, hashTypedData } from 'viem';
import * as crypto from 'crypto';

export interface P256KeyPair {
  privateKey: CryptoKey;
  publicKey: PublicKey.PublicKey;
}

export interface NodeWebAuthnSignature {
  signature: string;
  webauthn: {
    authenticatorData: string;
    clientDataJSON: string;
    typeIndex: number;
    challengeIndex: number;
  };
}

export class SCWNodeDeployer {
  private origin: string;

  constructor(origin: string = 'https://keys.coinbase.com') {
    this.origin = origin;
  }

  /**
   * Generate P256 keypair using WebCrypto
   */
  async generateP256Keypair(): Promise<P256KeyPair> {
    const keypair = await WebCryptoP256.createKeyPair({ extractable: false });
    return {
      privateKey: keypair.privateKey,
      publicKey: keypair.publicKey
    };
  }

  /**
   * Simulate WebAuthn signature for Node.js
   */
  private async createNodeWebAuthnSignature(
    keypair: P256KeyPair,
    challenge: string
  ): Promise<NodeWebAuthnSignature> {
    // Sign the challenge directly
    const signature = await WebCryptoP256.sign({
      payload: challenge as Hex.Hex,
      privateKey: keypair.privateKey,
    });

    // Create simulated authenticator data (37 bytes)
    const rpIdHash = crypto.createHash('sha256').update(new URL(this.origin).hostname).digest();
    const flags = Buffer.from([0x05]); // UP=1, UV=1
    const counter = Buffer.alloc(4); // 4 bytes of zeros
    const authenticatorData = Buffer.concat([rpIdHash, flags, counter]);

    // Create client data JSON
    const clientData = {
      type: 'webauthn.get',
      challenge: Buffer.from(challenge.slice(2), 'hex').toString('base64url'),
      origin: this.origin,
      crossOrigin: false
    };
    const clientDataJSON = JSON.stringify(clientData);

    return {
      signature: Signature.toHex(signature),
      webauthn: {
        authenticatorData: '0x' + authenticatorData.toString('hex'),
        clientDataJSON: '0x' + Buffer.from(clientDataJSON).toString('hex'),
        typeIndex: clientDataJSON.indexOf('"type":'),
        challengeIndex: clientDataJSON.indexOf('"challenge":')
      }
    };
  }

  /**
   * Create WebAuthn account for Node.js
   */
  async createWebAuthnAccount(keypair: P256KeyPair): Promise<WebAuthnAccount> {
    const publicKey = Hex.slice(PublicKey.toHex(keypair.publicKey), 1);
    
    const sign = async (payload: Hex.Hex) => {
      const result = await this.createNodeWebAuthnSignature(keypair, payload);
      return {
        signature: result.signature as `0x${string}`,
        raw: {} as unknown as PublicKeyCredential,
        webauthn: result.webauthn as any,
      };
    };

    return {
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
  }

  /**
   * Calculate SCW address from public key (demo)
   */
  calculateSCWAddress(publicKey: string): string {
    const cleanKey = publicKey.replace('0x', '').slice(0, 40);
    return `0x${cleanKey}`;
  }

  /**
   * Format WebAuthn signature for SCW
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
        authenticatorData: webauthn.authenticatorData,
        clientDataJSON: webauthn.clientDataJSON,
        challengeIndex: BigInt(webauthn.challengeIndex),
        typeIndex: BigInt(webauthn.typeIndex),
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
}

// Example EIP-712 message
export const createTestEIP712Message = (scwAddress: string) => ({
  domain: {
    name: 'Coinbase Smart Wallet',
    version: '1',
    chainId: 84532,
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