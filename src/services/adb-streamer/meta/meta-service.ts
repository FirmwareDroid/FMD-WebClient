import { apiClient } from "../http-client";
import * as qs from "qs";

export class MetaService {
    private readonly endpoint = "meta";

    getAll(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        const url = `/${this.endpoint}/get-all?${q}`;
        return apiClient.get(url);
    }
}

export const metaService = new MetaService();
