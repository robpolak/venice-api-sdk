"use strict";
/**
 * Wallet Module Exports
 * Provides Coinbase Wallet SDK integration for Venice AI SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodeTestEIP712Message = exports.SCWNodeDeployer = exports.createTestEIP712Message = exports.SCWDeployer = exports.SCWIntegration = void 0;
var scw_integration_1 = require("./scw-integration");
Object.defineProperty(exports, "SCWIntegration", { enumerable: true, get: function () { return scw_integration_1.SCWIntegration; } });
var scw_deployer_1 = require("./scw-deployer");
Object.defineProperty(exports, "SCWDeployer", { enumerable: true, get: function () { return scw_deployer_1.SCWDeployer; } });
Object.defineProperty(exports, "createTestEIP712Message", { enumerable: true, get: function () { return scw_deployer_1.createTestEIP712Message; } });
var scw_node_deployer_1 = require("./scw-node-deployer");
Object.defineProperty(exports, "SCWNodeDeployer", { enumerable: true, get: function () { return scw_node_deployer_1.SCWNodeDeployer; } });
var scw_node_deployer_2 = require("./scw-node-deployer");
Object.defineProperty(exports, "createNodeTestEIP712Message", { enumerable: true, get: function () { return scw_node_deployer_2.createTestEIP712Message; } });
