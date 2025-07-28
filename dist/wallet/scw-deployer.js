"use strict";
/**
 * Smart Contract Wallet Deployment and Validation
 * Using Coinbase Wallet SDK patterns for P256 signatures
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestEIP712Message = exports.SCWDeployer = void 0;
const ox_1 = require("ox");
// Coinbase Smart Wallet Factory Address (Base Sepolia)
const FACTORY_ADDRESS = '0x41675C099F32341bf84BFc5382aF534df5C7461a';
// EIP-1271 magic value for valid signatures
const EIP1271_MAGIC_VALUE = '0x1626ba7e';
class SCWDeployer {
    constructor(origin = 'https://keys.coinbase.com') {
        this.origin = origin;
    }
    /**
     * Generate P256 keypair using Coinbase SDK pattern
     */
    async generateP256Keypair() {
        const keypair = await ox_1.WebCryptoP256.createKeyPair({ extractable: false });
        return {
            privateKey: keypair.privateKey,
            publicKey: keypair.publicKey
        };
    }
    /**
     * Create WebAuthn account from keypair
     */
    async createWebAuthnAccount(keypair) {
        const publicKey = ox_1.Hex.slice(ox_1.PublicKey.toHex(keypair.publicKey), 1);
        const sign = async (payload) => {
            const { payload: message, metadata } = ox_1.WebAuthnP256.getSignPayload({
                challenge: payload,
                origin: this.origin,
                userVerification: 'preferred',
            });
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
        return {
            id: publicKey,
            publicKey,
            async sign({ hash }) {
                return sign(hash);
            },
            async signMessage({ message }) {
                const { hashMessage } = await Promise.resolve().then(() => __importStar(require('viem')));
                return sign(hashMessage(message));
            },
            async signTypedData(parameters) {
                const { hashTypedData } = await Promise.resolve().then(() => __importStar(require('viem')));
                return sign(hashTypedData(parameters));
            },
            type: 'webAuthn',
        };
    }
    /**
     * Calculate SCW address from P256 public key (simplified)
     */
    calculateSCWAddress(publicKey) {
        // For demo purposes, return a deterministic address
        // In production, this would calculate the CREATE2 address
        const cleanKey = publicKey.replace('0x', '').slice(0, 40);
        return `0x${cleanKey}`;
    }
    /**
     * Format WebAuthn signature for SCW validation
     */
    formatWebAuthnSignature(signature, webauthn, ownerIndex = 0) {
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
        const webAuthnAuthData = encodeAbiParameters([{
                type: 'tuple',
                components: [
                    { name: 'authenticatorData', type: 'bytes' },
                    { name: 'clientDataJSON', type: 'bytes' },
                    { name: 'challengeIndex', type: 'uint256' },
                    { name: 'typeIndex', type: 'uint256' },
                    { name: 'r', type: 'uint256' },
                    { name: 's', type: 'uint256' },
                ],
            }], [{
                authenticatorData,
                clientDataJSON,
                challengeIndex: BigInt(challengeIndex),
                typeIndex: BigInt(typeIndex),
                r: BigInt(r),
                s: BigInt(s),
            }]);
        // Wrap in SignatureWrapper
        return encodeAbiParameters([{
                type: 'tuple',
                components: [
                    { name: 'ownerIndex', type: 'uint256' },
                    { name: 'signatureData', type: 'bytes' },
                ],
            }], [{
                ownerIndex: BigInt(ownerIndex),
                signatureData: webAuthnAuthData,
            }]);
    }
    /**
     * Demo deployment result (for testing without actual deployment)
     */
    async deploySCW(keypair) {
        const account = await this.createWebAuthnAccount(keypair);
        const publicKey = ox_1.PublicKey.toHex(keypair.publicKey);
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
    async validateEIP712Demo(account, message) {
        console.log('\n🔐 Validating EIP-712 signature (demo)...');
        // Sign the typed data
        const signature = await account.signTypedData(message);
        console.log('📝 Signature generated');
        // Format signature for SCW validation
        const formattedSignature = this.formatWebAuthnSignature(signature.signature, signature.webauthn, 0);
        console.log('✅ Signature formatted for SCW validation');
        console.log('   Length:', formattedSignature.length);
        console.log('   First bytes:', formattedSignature.slice(0, 10) + '...');
        // In production, this would call isValidSignature on the SCW
        console.log('   Note: In production, this would validate on-chain');
        return true;
    }
}
exports.SCWDeployer = SCWDeployer;
// Example EIP-712 message for testing
const createTestEIP712Message = (scwAddress) => ({
    domain: {
        name: 'Coinbase Smart Wallet',
        version: '1',
        chainId: 84532, // Base Sepolia
        verifyingContract: scwAddress,
    },
    types: {
        CoinbaseSmartWalletMessage: [
            { name: 'hash', type: 'bytes32' },
        ],
    },
    primaryType: 'CoinbaseSmartWalletMessage',
    message: {
        hash: '0x' + Buffer.from('Hello from Venice AI SDK!').toString('hex').padEnd(64, '0'),
    },
});
exports.createTestEIP712Message = createTestEIP712Message;
