import {VeniceCore} from "../core/venice-core";
import {ModelsApi} from "./impl/models";
import {ChatApi} from "./impl/chat";
import {ImagesApi} from "./impl/images";

export class VeniceAPI {
  private core: VeniceCore;

  // Public API routes
  public models: ModelsApi;
  public chat: ChatApi;
  public images: ImagesApi;

  constructor(core: VeniceCore) {
    this.core = core;
    this.models = new ModelsApi(this.core)
    this.chat = new ChatApi(core);
    this.images = new ImagesApi(this.core);
  }
}