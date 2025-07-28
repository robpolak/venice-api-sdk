/**
 * Smart Contract Wallet Deployment and Validation
 * Using Coinbase Wallet SDK patterns for P256 signatures
 */
import { PublicKey } from 'ox';
import type { WebAuthnAccount } from 'viem/account-abstraction';
export interface SCWDeploymentResult {
    address: string;
    account: WebAuthnAccount;
    keypair: P256KeyPair;
}
export interface P256KeyPair {
    privateKey: CryptoKey;
    publicKey: PublicKey.PublicKey;
}
export declare class SCWDeployer {
    private origin;
    constructor(origin?: string);
    /**
     * Generate P256 keypair using Coinbase SDK pattern
     */
    generateP256Keypair(): Promise<P256KeyPair>;
    /**
     * Create WebAuthn account from keypair
     */
    createWebAuthnAccount(keypair: P256KeyPair): Promise<WebAuthnAccount>;
    /**
     * Calculate SCW address from P256 public key (simplified)
     */
    calculateSCWAddress(publicKey: string): string;
    /**
     * Format WebAuthn signature for SCW validation
     */
    formatWebAuthnSignature(signature: string, webauthn: any, ownerIndex?: number): string;
    /**
     * Demo deployment result (for testing without actual deployment)
     */
    deploySCW(keypair: P256KeyPair): Promise<SCWDeploymentResult>;
    /**
     * Validate EIP-712 signature (demo version)
     */
    validateEIP712Demo(account: WebAuthnAccount, message: any): Promise<boolean>;
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
