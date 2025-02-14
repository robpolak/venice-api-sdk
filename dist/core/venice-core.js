"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeniceCore = void 0;
class VeniceCore {
    constructor(opts) {
        this.options = {
            // options here
            baseUrl: "https://api.venice.ai/api/v1",
            ...opts
        };
    }
}
exports.VeniceCore = VeniceCore;
