export type VeniceSDKOptions = {
  apiKey?: string,
  baseUrl?: string,
  request?: {
    timeout?: number
    axiosParams?: Record<string, any>;
  }
}

export class VeniceCore {
  public options: VeniceSDKOptions;

  constructor(opts: VeniceSDKOptions) {
    this.options = {
      // options here
      baseUrl: "https://api.venice.ai/api/v1",

      ...opts
    }
  }
}