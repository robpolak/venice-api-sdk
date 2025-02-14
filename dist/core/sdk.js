"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeniceSDK = void 0;
const api_1 = require("../api/api");
const venice_core_1 = require("./venice-core");
class VeniceSDK {
    constructor(opts) {
        this.core = new venice_core_1.VeniceCore(opts);
        this.api = new api_1.VeniceAPI(this.core);
    }
    static async New(opts) {
        const sdk = new VeniceSDK(opts);
        sdk.imageModels = await sdk.api.models.listModels({
            type: "image"
        });
        sdk.textModels = await sdk.api.models.listModels({
            type: "text"
        });
        return sdk;
    }
}
exports.VeniceSDK = VeniceSDK;
