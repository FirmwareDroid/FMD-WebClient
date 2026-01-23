import { apiClient } from "../http-client";
import * as qs from "qs";

export class AdbService {
    private readonly endpoint = "adb";

    metainfo(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        return apiClient.get(`/${this.endpoint}/metainfo?${q}`);
    }

    install(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        return apiClient.post(`/${this.endpoint}/install?${q}`);
    }

    start(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        return apiClient.post(`/${this.endpoint}/start?${q}`);
    }

    pin(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        return apiClient.post(`/${this.endpoint}/pin?${q}`);
    }

    unpin(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        return apiClient.post(`/${this.endpoint}/unpin?${q}`);
    }
}

export const adbService = new AdbService();
