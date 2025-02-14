"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeniceSDK = void 0;
const api_1 = require("../api/api");
const venice_core_1 = require("./venice-core");
class VeniceSDK {
    constructor(opts) {
        this.core = new venice_core_1.VeniceCore(opts);
        this.api = new api_1.VeniceAPI(this.core);
    }
    static New(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const sdk = new VeniceSDK(opts);
            sdk.imageModels = yield sdk.api.models.listModels({
                type: "image"
            });
            sdk.textModels = yield sdk.api.models.listModels({
                type: "text"
            });
            return sdk;
        });
    }
}
exports.VeniceSDK = VeniceSDK;
