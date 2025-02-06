import {VeniceAPI} from "../api/api";
import {VeniceCore, VeniceSDKOptions} from "./venice-core";

export class VeniceSDK {
  public api: VeniceAPI
  private core: VeniceCore;

  constructor(opts: VeniceSDKOptions) {
    this.core = new VeniceCore(opts);
    this.api = new VeniceAPI(this.core);
  }
}