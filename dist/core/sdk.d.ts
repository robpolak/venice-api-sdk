import { VeniceAPI } from "../api/api";
import { VeniceSDKOptions } from "./venice-core";
import { ListModelsResponse } from "../model/models";
export declare class VeniceSDK {
    api: VeniceAPI;
    private core;
    imageModels: ListModelsResponse | undefined;
    textModels: ListModelsResponse | undefined;
    private constructor();
    static New(opts: VeniceSDKOptions): Promise<VeniceSDK>;
}
