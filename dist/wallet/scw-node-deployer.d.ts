/**
 * Smart Contract Wallet Deployment for Node.js
 * Simulates WebAuthn signatures for testing without browser
 */
import { PublicKey } from 'ox';
import type { WebAuthnAccount } from 'viem/account-abstraction';
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
export declare class SCWNodeDeployer {
    private origin;
    constructor(origin?: string);
    /**
     * Generate P256 keypair using WebCrypto
     */
    generateP256Keypair(): Promise<P256KeyPair>;
    /**
     * Simulate WebAuthn signature for Node.js
     */
    private createNodeWebAuthnSignature;
    /**
     * Create WebAuthn account for Node.js
     */
    createWebAuthnAccount(keypair: P256KeyPair): Promise<WebAuthnAccount>;
    /**
     * Calculate SCW address from public key (demo)
     */
    calculateSCWAddress(publicKey: string): string;
    /**
     * Format WebAuthn signature for SCW
     */
    formatWebAuthnSignature(signature: string, webauthn: any, ownerIndex?: number): string;
}
export declare const createTestEIP712Message: (scwAddress: string) => {
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: `0x${string}`;
    };
    types: {
        CoinbaseSmartWalletMessage: {
            name: string;
            type: string;
        }[];
    };
    primaryType: "CoinbaseSmartWalletMessage";
    message: {
        hash: `0x${string}`;
    };
};
