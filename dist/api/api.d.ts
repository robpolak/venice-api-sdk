import { VeniceCore } from "../core/venice-core";
import { ModelsApi } from "./impl/models";
import { ChatApi } from "./impl/chat";
import { ImagesApi } from "./impl/images";
export declare class VeniceAPI {
    private core;
    models: ModelsApi;
    chat: ChatApi;
    images: ImagesApi;
    constructor(core: VeniceCore);
}
