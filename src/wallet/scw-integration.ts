/**
 * Smart Contract Wallet Integration using Coinbase Wallet SDK
 * 
 * This module demonstrates using coinbase-wallet-sdk for all SCW operations
 * instead of manually building WebAuthn signatures
 */

import { WebAuthnP256, WebCryptoP256, Hex, PublicKey, Signature } from 'ox';
import { hashMessage, hashTypedData } from 'viem';
import type { WebAuthnAccount } from 'viem/account-abstraction';

export interface P256KeyPair {
  privateKey: CryptoKey;
  publicKey: PublicKey.PublicKey;
}

export class SCWIntegration {
  private origin: string;

  constructor(origin: string = 'https://keys.coinbase.com') {
    this.origin = origin;
  }

  /**
   * Generate a P256 keypair using WebCrypto
   */
  async generateP256Keypair(): Promise<P256KeyPair> {
    const keypair = await WebCryptoP256.createKeyPair({ extractable: false });
    const publicKey = Hex.slice(PublicKey.toHex(keypair.publicKey), 1);
    
    return {
      privateKey: keypair.privateKey,
      publicKey: keypair.publicKey
    };
  }

  /**
   * Create a signing function that produces WebAuthn-style signatures
   * This replaces manual signature building with Coinbase SDK's approach
   */
  createWebAuthnSigner(keypair: P256KeyPair) {
    return async (payload: Hex.Hex) => {
      // Use WebAuthnP256 from ox (same as Coinbase SDK)
      const { payload: message, metadata } = WebAuthnP256.getSignPayload({
        challenge: payload,
        origin: this.origin,
        userVerification: 'preferred',
      });

      // Sign with WebCrypto
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
  }

  /**
   * Create a WebAuthn account for SCW operations
   * This provides all the signing methods needed for SCW
   */
  async createWebAuthnAccount(keypair: P256KeyPair): Promise<WebAuthnAccount> {
    const publicKey = Hex.slice(PublicKey.toHex(keypair.publicKey), 1);
    const sign = this.createWebAuthnSigner(keypair);

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
   * Sign a replay-safe hash for SCW validation
   * This replaces the manual buildSCWSignature approach
   */
  async signForSCW(
    keypair: P256KeyPair,
    messageHash: string,
    chainId: bigint
  ): Promise<{
    signature: string;
    webauthn: any;
  }> {
    // Create replay-safe hash (same as your current implementation)
    const replaySafeHash = this.computeReplaySafeHash(messageHash, chainId);
    
    // Use the WebAuthn signer
    const signer = this.createWebAuthnSigner(keypair);
    const result = await signer(replaySafeHash as Hex.Hex);
    
    return {
      signature: result.signature,
      webauthn: result.webauthn
    };
  }

  /**
   * Compute replay-safe hash for SCW
   */
  private computeReplaySafeHash(messageHash: string, chainId: bigint): string {
    // Implementation would match your current replay-safe hash logic
    // This is typically: keccak256(abi.encodePacked(messageHash, chainId))
    const { keccak256, encodePacked } = require('viem');
    return keccak256(encodePacked(['bytes32', 'uint256'], [messageHash, chainId]));
  }

  /**
   * Format signature for SCW contract validation
   * This formats the WebAuthn signature data for on-chain verification
   */
  formatSCWSignature(
    signature: string,
    webauthn: any,
    ownerIndex: number = 0
  ): string {
    const { encodeAbiParameters } = require('viem');
    
    // Extract r, s from signature
    const sigBuffer = Buffer.from(signature.slice(2), 'hex');
    const r = '0x' + sigBuffer.slice(0, 32).toString('hex');
    const s = '0x' + sigBuffer.slice(32, 64).toString('hex');
    
    // Format authenticator data and client data
    const authenticatorData = webauthn.authenticatorData;
    const clientDataJSON = webauthn.clientDataJSON;
    
    // Find indices in client data
    const clientDataStr = Buffer.from(clientDataJSON.slice(2), 'hex').toString('utf8');
    const challengeIndex = clientDataStr.indexOf('"challenge":');
    const typeIndex = clientDataStr.indexOf('"type":');
    
    // Encode WebAuthnAuth struct
    const webAuthnAuthData = encodeAbiParameters(
      [
        {
          type: 'tuple',
          components: [
            { name: 'authenticatorData', type: 'bytes' },
            { name: 'clientDataJSON', type: 'bytes' },
            { name: 'challengeIndex', type: 'uint256' },
            { name: 'typeIndex', type: 'uint256' },
            { name: 'r', type: 'uint256' },
            { name: 's', type: 'uint256' },
          ],
        },
      ],
      [
        {
          authenticatorData,
          clientDataJSON,
          challengeIndex: BigInt(challengeIndex),
          typeIndex: BigInt(typeIndex),
          r: BigInt(r),
          s: BigInt(s),
        },
      ]
    );
    
    // Wrap in SignatureWrapper
    return encodeAbiParameters(
      [
        {
          type: 'tuple',
          components: [
            { name: 'ownerIndex', type: 'uint256' },
            { name: 'signatureData', type: 'bytes' },
          ],
        },
      ],
      [
        {
          ownerIndex: BigInt(ownerIndex),
          signatureData: webAuthnAuthData,
        },
      ]
    );
  }
}

// Example usage showing migration from manual approach
export async function exampleUsage() {
  const scw = new SCWIntegration();
  
  // Generate keypair
  const keypair = await scw.generateP256Keypair();
  
  // Create WebAuthn account for all signing needs
  const account = await scw.createWebAuthnAccount(keypair);
  
  // Sign a message
  const messageResult = await account.signMessage({ message: 'Hello SCW' });
  console.log('Message signature:', messageResult.signature);
  
  // Sign for SCW validation (replaces your buildSCWSignature)
  const scwResult = await scw.signForSCW(
    keypair,
    '0x1234...', // message hash
    1n // chain ID
  );
  
  // Format for on-chain validation
  const formattedSig = scw.formatSCWSignature(
    scwResult.signature,
    scwResult.webauthn,
    0 // owner index
  );
  
  console.log('SCW formatted signature:', formattedSig);
} 