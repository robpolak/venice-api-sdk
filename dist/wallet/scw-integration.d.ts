/**
 * Smart Contract Wallet Integration using Coinbase Wallet SDK
 *
 * This module demonstrates using coinbase-wallet-sdk for all SCW operations
 * instead of manually building WebAuthn signatures
 */
import { Hex, PublicKey } from 'ox';
import type { WebAuthnAccount } from 'viem/account-abstraction';
export interface P256KeyPair {
    privateKey: CryptoKey;
    publicKey: PublicKey.PublicKey;
}
export declare class SCWIntegration {
    private origin;
    constructor(origin?: string);
    /**
     * Generate a P256 keypair using WebCrypto
     */
    generateP256Keypair(): Promise<P256KeyPair>;
    /**
     * Create a signing function that produces WebAuthn-style signatures
     * This replaces manual signature building with Coinbase SDK's approach
     */
    createWebAuthnSigner(keypair: P256KeyPair): (payload: Hex.Hex) => Promise<{
        signature: `0x${string}`;
        raw: PublicKeyCredential;
        webauthn: {
            authenticatorData: Hex.Hex;
            challengeIndex: number;
            clientDataJSON: string;
            typeIndex: number;
            userVerificationRequired: boolean;
        };
    }>;
    /**
     * Create a WebAuthn account for SCW operations
     * This provides all the signing methods needed for SCW
     */
    createWebAuthnAccount(keypair: P256KeyPair): Promise<WebAuthnAccount>;
    /**
     * Sign a replay-safe hash for SCW validation
     * This replaces the manual buildSCWSignature approach
     */
    signForSCW(keypair: P256KeyPair, messageHash: string, chainId: bigint): Promise<{
        signature: string;
        webauthn: any;
    }>;
    /**
     * Compute replay-safe hash for SCW
     */
    private computeReplaySafeHash;
    /**
     * Format signature for SCW contract validation
     * This formats the WebAuthn signature data for on-chain verification
     */
    formatSCWSignature(signature: string, webauthn: any, ownerIndex?: number): string;
}
export declare function exampleUsage(): Promise<void>;
