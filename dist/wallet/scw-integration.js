"use strict";
/**
 * Smart Contract Wallet Integration using Coinbase Wallet SDK
 *
 * This module demonstrates using coinbase-wallet-sdk for all SCW operations
 * instead of manually building WebAuthn signatures
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCWIntegration = void 0;
exports.exampleUsage = exampleUsage;
const ox_1 = require("ox");
const viem_1 = require("viem");
class SCWIntegration {
    constructor(origin = 'https://keys.coinbase.com') {
        this.origin = origin;
    }
    /**
     * Generate a P256 keypair using WebCrypto
     */
    async generateP256Keypair() {
        const keypair = await ox_1.WebCryptoP256.createKeyPair({ extractable: false });
        const publicKey = ox_1.Hex.slice(ox_1.PublicKey.toHex(keypair.publicKey), 1);
        return {
            privateKey: keypair.privateKey,
            publicKey: keypair.publicKey
        };
    }
    /**
     * Create a signing function that produces WebAuthn-style signatures
     * This replaces manual signature building with Coinbase SDK's approach
     */
    createWebAuthnSigner(keypair) {
        return async (payload) => {
            // Use WebAuthnP256 from ox (same as Coinbase SDK)
            const { payload: message, metadata } = ox_1.WebAuthnP256.getSignPayload({
                challenge: payload,
                origin: this.origin,
                userVerification: 'preferred',
            });
            // Sign with WebCrypto
            const signature = await ox_1.WebCryptoP256.sign({
                payload: message,
                privateKey: keypair.privateKey,
            });
            return {
                signature: ox_1.Signature.toHex(signature),
                raw: {},
                webauthn: metadata,
            };
        };
    }
    /**
     * Create a WebAuthn account for SCW operations
     * This provides all the signing methods needed for SCW
     */
    async createWebAuthnAccount(keypair) {
        const publicKey = ox_1.Hex.slice(ox_1.PublicKey.toHex(keypair.publicKey), 1);
        const sign = this.createWebAuthnSigner(keypair);
        return {
            id: publicKey,
            publicKey,
            async sign({ hash }) {
                return sign(hash);
            },
            async signMessage({ message }) {
                return sign((0, viem_1.hashMessage)(message));
            },
            async signTypedData(parameters) {
                return sign((0, viem_1.hashTypedData)(parameters));
            },
            type: 'webAuthn',
        };
    }
    /**
     * Sign a replay-safe hash for SCW validation
     * This replaces the manual buildSCWSignature approach
     */
    async signForSCW(keypair, messageHash, chainId) {
        // Create replay-safe hash (same as your current implementation)
        const replaySafeHash = this.computeReplaySafeHash(messageHash, chainId);
        // Use the WebAuthn signer
        const signer = this.createWebAuthnSigner(keypair);
        const result = await signer(replaySafeHash);
        return {
            signature: result.signature,
            webauthn: result.webauthn
        };
    }
    /**
     * Compute replay-safe hash for SCW
     */
    computeReplaySafeHash(messageHash, chainId) {
        // Implementation would match your current replay-safe hash logic
        // This is typically: keccak256(abi.encodePacked(messageHash, chainId))
        const { keccak256, encodePacked } = require('viem');
        return keccak256(encodePacked(['bytes32', 'uint256'], [messageHash, chainId]));
    }
    /**
     * Format signature for SCW contract validation
     * This formats the WebAuthn signature data for on-chain verification
     */
    formatSCWSignature(signature, webauthn, ownerIndex = 0) {
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
        const webAuthnAuthData = encodeAbiParameters([
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
        ], [
            {
                authenticatorData,
                clientDataJSON,
                challengeIndex: BigInt(challengeIndex),
                typeIndex: BigInt(typeIndex),
                r: BigInt(r),
                s: BigInt(s),
            },
        ]);
        // Wrap in SignatureWrapper
        return encodeAbiParameters([
            {
                type: 'tuple',
                components: [
                    { name: 'ownerIndex', type: 'uint256' },
                    { name: 'signatureData', type: 'bytes' },
                ],
            },
        ], [
            {
                ownerIndex: BigInt(ownerIndex),
                signatureData: webAuthnAuthData,
            },
        ]);
    }
}
exports.SCWIntegration = SCWIntegration;
// Example usage showing migration from manual approach
async function exampleUsage() {
    const scw = new SCWIntegration();
    // Generate keypair
    const keypair = await scw.generateP256Keypair();
    // Create WebAuthn account for all signing needs
    const account = await scw.createWebAuthnAccount(keypair);
    // Sign a message
    const messageResult = await account.signMessage({ message: 'Hello SCW' });
    console.log('Message signature:', messageResult.signature);
    // Sign for SCW validation (replaces your buildSCWSignature)
    const scwResult = await scw.signForSCW(keypair, '0x1234...', // message hash
    1n // chain ID
    );
    // Format for on-chain validation
    const formattedSig = scw.formatSCWSignature(scwResult.signature, scwResult.webauthn, 0 // owner index
    );
    console.log('SCW formatted signature:', formattedSig);
}
