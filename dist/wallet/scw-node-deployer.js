"use strict";
/**
 * Smart Contract Wallet Deployment for Node.js
 * Simulates WebAuthn signatures for testing without browser
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
exports.createTestEIP712Message = exports.SCWNodeDeployer = void 0;
const ox_1 = require("ox");
const viem_1 = require("viem");
const crypto = __importStar(require("crypto"));
class SCWNodeDeployer {
    constructor(origin = 'https://keys.coinbase.com') {
        this.origin = origin;
    }
    /**
     * Generate P256 keypair using WebCrypto
     */
    async generateP256Keypair() {
        const keypair = await ox_1.WebCryptoP256.createKeyPair({ extractable: false });
        return {
            privateKey: keypair.privateKey,
            publicKey: keypair.publicKey
        };
    }
    /**
     * Simulate WebAuthn signature for Node.js
     */
    async createNodeWebAuthnSignature(keypair, challenge) {
        // Sign the challenge directly
        const signature = await ox_1.WebCryptoP256.sign({
            payload: challenge,
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
            signature: ox_1.Signature.toHex(signature),
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
    async createWebAuthnAccount(keypair) {
        const publicKey = ox_1.Hex.slice(ox_1.PublicKey.toHex(keypair.publicKey), 1);
        const sign = async (payload) => {
            const result = await this.createNodeWebAuthnSignature(keypair, payload);
            return {
                signature: result.signature,
                raw: {},
                webauthn: result.webauthn,
            };
        };
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
     * Calculate SCW address from public key (demo)
     */
    calculateSCWAddress(publicKey) {
        const cleanKey = publicKey.replace('0x', '').slice(0, 40);
        return `0x${cleanKey}`;
    }
    /**
     * Format WebAuthn signature for SCW
     */
    formatWebAuthnSignature(signature, webauthn, ownerIndex = 0) {
        const { encodeAbiParameters } = require('viem');
        // Extract r, s from signature
        const sigBuffer = Buffer.from(signature.slice(2), 'hex');
        const r = '0x' + sigBuffer.slice(0, 32).toString('hex');
        const s = '0x' + sigBuffer.slice(32, 64).toString('hex');
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
                authenticatorData: webauthn.authenticatorData,
                clientDataJSON: webauthn.clientDataJSON,
                challengeIndex: BigInt(webauthn.challengeIndex),
                typeIndex: BigInt(webauthn.typeIndex),
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
}
exports.SCWNodeDeployer = SCWNodeDeployer;
// Example EIP-712 message
const createTestEIP712Message = (scwAddress) => ({
    domain: {
        name: 'Coinbase Smart Wallet',
        version: '1',
        chainId: 84532,
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
