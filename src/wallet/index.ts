/**
 * Wallet Module Exports
 * Provides Coinbase Wallet SDK integration for Venice AI SDK
 */

export { SCWIntegration, type P256KeyPair } from './scw-integration';
export { SCWDeployer, createTestEIP712Message, type SCWDeploymentResult } from './scw-deployer';
export { SCWNodeDeployer } from './scw-node-deployer';
export { createTestEIP712Message as createNodeTestEIP712Message } from './scw-node-deployer';

// Re-export useful types from dependencies
export type { WebAuthnAccount } from 'viem/account-abstraction';
export type { Address } from 'viem'; 