export type VeniceSDKOptions = {
    apiKey?: string;
    baseUrl?: string;
    request?: {
        timeout?: number;
        axiosParams?: Record<string, unknown>;
    };
};
export declare class VeniceCore {
    options: VeniceSDKOptions;
    constructor(opts: VeniceSDKOptions);
}
