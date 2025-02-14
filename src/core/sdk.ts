import {VeniceAPI} from "../api/api";
import {VeniceCore, VeniceSDKOptions} from "./venice-core";
import {ListModelsResponse, ModelType} from "../model/models";

export class VeniceSDK {
  public api: VeniceAPI
  private core: VeniceCore;
  public imageModels: ListModelsResponse | undefined;
  public textModels: ListModelsResponse | undefined;

  private constructor(opts: VeniceSDKOptions) {
    this.core = new VeniceCore(opts);
    this.api = new VeniceAPI(this.core);
  }

  public static async New(opts: VeniceSDKOptions) {
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